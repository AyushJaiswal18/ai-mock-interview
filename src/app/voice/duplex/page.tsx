'use client';
import { useEffect, useRef, useState } from 'react';
import { HttpTTSQueue } from '../ttsHttpClient';

const AAI_WS =
  process.env.NEXT_PUBLIC_AAI_WS ||
  'wss://streaming.assemblyai.com/v3/ws';

function usePhraseAggregator(opts?: { idleMs?: number; maxWords?: number }) {
  const idleMs = opts?.idleMs ?? 240;   // slightly snappier
  const maxWords = opts?.maxWords ?? 14;
  const bufRef = useRef<string>('');
  const timerRef = useRef<number | null>(null);

  const clearTimer = () => { if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; } };
  const shouldFlushNow = (s: string) =>
    /[.!?…]["’”)]?\s$/.test(s) || /[,;:]\s$/.test(s) || s.split(/\s+/).length >= maxWords;

  const push = (chunk: string, onFlush: (phrase: string) => void) => {
    if (!chunk) return;
    bufRef.current += (bufRef.current ? ' ' : '') + chunk.trim();
    if (shouldFlushNow(bufRef.current)) {
      const out = bufRef.current.trim(); bufRef.current=''; clearTimer(); onFlush(out); return;
    }
    clearTimer();
    timerRef.current = window.setTimeout(() => {
      const out = bufRef.current.trim(); bufRef.current=''; if (out) onFlush(out);
    }, idleMs) as unknown as number;
  };

  const flush = (onFlush: (phrase: string) => void) => {
    clearTimer();
    const out = bufRef.current.trim(); bufRef.current=''; if (out) onFlush(out);
  };

  return { push, flush };
}

export default function Duplex() {
  const [on, setOn] = useState(false);
  const [partials, setPartials] = useState('');
  const [lines, setLines] = useState<string[]>([]);
  const add = (s: string) => setLines(L => [...L, s].slice(-400));

  // STT
  const wsRef = useRef<WebSocket | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Brain stream
  const brainAbortRef = useRef<AbortController | null>(null);

  // HTTP TTS
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ttsRef = useRef<HttpTTSQueue | null>(null);

  // Aggregation for brain → speech
  const aggregator = usePhraseAggregator({ idleMs: 240, maxWords: 14 });
  const MAX_QUEUE = 3;

  function ensureTTS() {
    if (!ttsRef.current) ttsRef.current = new HttpTTSQueue(audioRef.current || undefined);
  }

  function speakCoalesced(text: string) {
    ensureTTS();
    const tts: any = ttsRef.current!;
    if (tts.__qLength && tts.__qLength() >= MAX_QUEUE) tts.__mergeTail(text);
    else tts.say(text);
  }

  async function start() {
    try {
      add('🔑 Requesting AAI token...');
      const t = await fetch('/api/aai/token', { cache: 'no-store' }).then(r => r.json());
      if (!t?.token) throw new Error('No token from /api/aai/token');
      add('✅ Token received');

      const wsUrl = `${AAI_WS}?sample_rate=16000&encoding=pcm_s16le&token=${encodeURIComponent(t.token)}`;
      add('🔌 Connecting STT WS…');
      const ws = new WebSocket(wsUrl);
      ws.binaryType = 'arraybuffer';
      wsRef.current = ws;

      ws.onopen = async () => {
        add('✅ STT connected');
        try {
          add('🎤 Requesting mic…');
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
          });
          mediaStreamRef.current = stream;
          add('✅ Mic granted');

          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 48000 });
          await ctx.resume();
          ctxRef.current = ctx;

          await ctx.audioWorklet.addModule('/pcm-worklet.js');
          add('✅ Worklet loaded');

          const src = ctx.createMediaStreamSource(stream);
          const node = new (window as any).AudioWorkletNode(ctx, 'pcm-worklet');

          // pull the graph (muted)
          const sink = ctx.createGain(); sink.gain.value = 0;
          src.connect(node); node.connect(sink); sink.connect(ctx.destination);

          // 50ms PCM frames
          let sent = 0;
          node.port.onmessage = (e: MessageEvent) => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(e.data);
              if (++sent % 20 === 0) add(`📤 sent ${(sent * 50 / 1000).toFixed(1)}s audio`);
            }
          };

          setOn(true);
          add('🎙️ Speak now');
        } catch (err: any) {
          add('❌ Mic setup failed: ' + (err?.message || err));
        }
      };

      ws.onmessage = async (evt) => {
        let text: string | null = null;
        if (typeof evt.data === 'string') text = evt.data;
        else if (evt.data instanceof Blob) text = await evt.data.text();
        if (!text) return;

        try {
          const msg = JSON.parse(text);

          // v3: "turn" events include transcript + end_of_turn
          if (msg.transcript !== undefined) {
            const final = msg.end_of_turn === true;
            const transcript = msg.transcript || '';

            if (!final) {
              setPartials(transcript);
              // barge-in: cut TTS + brain if user starts speaking again
              if (transcript && ttsRef.current?.isSpeaking()) {
                add('⏹️ Barge-in: stopping TTS');
                ttsRef.current.stop();
                try { brainAbortRef.current?.abort(); } catch {}
              }
            } else {
              setPartials('');
              const utt = transcript.trim();
              if (utt) {
                add(`👤 ${utt}`);
                askBrain(utt);
              }
            }
          }
        } catch (e: any) {
          add(`❌ JSON parse error: ${e?.message}`);
        }
      };

      ws.onclose = (e) => { add(`🔌 STT closed: ${e.code} ${e.reason || ''}`); wsRef.current = null; try { ctxRef.current?.suspend?.(); } catch {} };
      ws.onerror = () => { add('❌ STT error'); wsRef.current = null; };
    } catch (e: any) {
      add('❌ Failed to start: ' + (e?.message || e));
      stop();
    }
  }

  async function askBrain(userText: string) {
    ensureTTS();

    brainAbortRef.current?.abort();
    brainAbortRef.current = new AbortController();

    try {
      const r = await fetch('/api/brain/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: 'duplex-http', lastUser: userText }),
        signal: brainAbortRef.current.signal,
        cache: 'no-store',
      });
      if (!r.ok || !r.body) { add(`⚠️ Brain failed: ${r.status} ${r.statusText}`); return; }

      const reader = r.body.getReader();
      const dec = new TextDecoder();
      let buf = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true }).replace(/\r\n/g, '\n');
        const frames = buf.split(/\n\n/);
        buf = frames.pop() || '';

        for (const frame of frames) {
          if (!frame.startsWith('data:')) continue;
          const data = frame.slice(5).trim();
          if (!data || data === '[DONE]') continue;

          try {
            const payload = JSON.parse(data);
            const chunk = String(payload.text ?? '').trim();
            const final = Boolean(payload.final);

            if (chunk) {
              add(`🧠 ${chunk}${final ? ' [final]' : ''}`);
              aggregator.push(chunk, phrase => speakCoalesced(phrase));
            }
            if (final) {
              aggregator.flush(phrase => speakCoalesced(phrase));
              // (HTTP TTS doesn’t need an explicit end signal)
            }
          } catch {}
        }
      }
      // safety flush if stream ended without final=true
      aggregator.flush(phrase => speakCoalesced(phrase));
    } catch (e: any) {
      if (e?.name !== 'AbortError') add(`⚠️ Brain error: ${e.message}`);
    }
  }

  function stop() {
    try { wsRef.current?.close(); } catch {}
    wsRef.current = null;
    try { ctxRef.current?.close(); } catch {}
    ctxRef.current = null;
    try { mediaStreamRef.current?.getTracks().forEach(t => t.stop()); } catch {}
    mediaStreamRef.current = null;
    brainAbortRef.current?.abort();
    ttsRef.current?.stop();
    setOn(false);
    setPartials('');
  }

  useEffect(() => () => stop(), []);

  return (
    <main style={{ padding: 24 }}>
      <h2>Full-Duplex (STT ↔ Brain ↔ TTS over HTTP)</h2>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        {!on ? <button onClick={start}>Start</button> : <button onClick={stop}>Stop</button>}
      </div>
      <audio ref={audioRef} controls style={{ display: 'block', marginBottom: 12 }} />
      {partials && <div style={{ opacity: 0.7, marginTop: 8 }}>⌛ <i>{partials}</i></div>}
      <pre style={{ whiteSpace: 'pre-wrap', marginTop: 12 }}>{lines.join('\n')}</pre>
    </main>
  );
}
