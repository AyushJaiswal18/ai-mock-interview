'use client';
import { useRef, useState } from 'react';

const AAI_WS = process.env.NEXT_PUBLIC_AAI_WS || 'wss://streaming.assemblyai.com/v3/ws';

type AnyMsg = Record<string, any>;

export default function Voice() {
  const wsRef = useRef<WebSocket | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const workletRef = useRef<AudioWorkletNode | null>(null);
  const [on, setOn] = useState(false);
  const [partials, setPartials] = useState('');
  const [lines, setLines] = useState<string[]>([]);
  const add = (s: string) => setLines(L => [...L, s].slice(-250));

  async function start() {
    try {
      add('🔑 Requesting token...');
      const tokRes = await fetch('/api/aai/token', { cache: 'no-store' });
      if (!tokRes.ok) { add('❌ Token request failed'); return; }
      const { token } = await tokRes.json();
      if (!token) { add('❌ No token in response'); return; }
      add('✅ Token ok');

      // Open WS
      const url = `${AAI_WS}?sample_rate=16000&encoding=pcm_s16le&token=${encodeURIComponent(token)}`;
      add(`🔌 Connecting WS...`);
      const ws = new WebSocket(url);
      ws.binaryType = 'arraybuffer';
      wsRef.current = ws;

      ws.onopen = async () => {
        add('✅ WS open');
        // Mic + Worklet
        add('🎤 Requesting mic...');
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        add('✅ Mic granted');
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 48000 });
        ctxRef.current = ctx;
        await ctx.audioWorklet.addModule('/pcm-worklet.js');
        const src = ctx.createMediaStreamSource(stream);
        const node = new (window as any).AudioWorkletNode(ctx, 'pcm-worklet');
        workletRef.current = node;

        // IMPORTANT: connect node into the graph so it actually processes
        const sink = ctx.createGain(); sink.gain.value = 0;
        src.connect(node);
        node.connect(sink);
        sink.connect(ctx.destination);

        let sent = 0;
        node.port.onmessage = (e: MessageEvent) => {
          if (ws.readyState === 1) {
            // Ensure we send a transferable ArrayBuffer
            const buf = e.data as ArrayBuffer;
            ws.send(buf);
            // throttle logs
            if (++sent % 20 === 0) add('📤 audio…');
          }
        };
        setOn(true);
        add('🎙️ Speak now…');
      };

      ws.onmessage = (evt) => {
        try {
          // AAI sends JSON text frames
          const msg: AnyMsg = JSON.parse(String(evt.data));

          // Raw peek for debugging (comment out once working)
          // add(`📥 ${msg.type ?? 'msg'}: ${String(evt.data).slice(0,120)}`);

          // Handle common shapes
          const type = (msg.type || '').toLowerCase();

          if (type === 'partialtranscript' && msg.transcript) {
            setPartials(msg.transcript);
          }
          if ((type === 'transcript' || type === 'turn') && msg.transcript) {
            setPartials('');
            add(`👤 ${msg.transcript}`);
          }
          if (msg.end_of_turn) {
            // Optional: signal end-of-turn detected
            // add('🔚 end_of_turn');
          }
          if (type === 'sessionbegins') {
            add('🎬 Session started');
          }
          if (type === 'sessionterminated') {
            add('🔚 Session terminated');
          }
        } catch (err) {
          // If parsing fails, log first bytes for inspection
          add(`❌ parse error`);
        }
      };

      ws.onclose = (e) => {
        add(`🔌 WS closed ${e.code} ${e.reason || ''}`);
        cleanup();
      };
      ws.onerror = (e) => add('❌ WS error (see console)');
    } catch (e: any) {
      add(`❌ start error: ${e?.message || e}`);
    }
  }

  function cleanup() {
    try { ctxRef.current?.close(); } catch {}
    ctxRef.current = null;
    workletRef.current = null;
    wsRef.current = null;
    setOn(false);
    setPartials('');
  }

  function stop() {
    try { wsRef.current?.send(JSON.stringify({ type: 'Terminate' })); } catch {}
    wsRef.current?.close();
    cleanup();
  }

  return (
    <main style={{ padding: 24 }}>
      <h2>AssemblyAI Live STT (Browser)</h2>
      {!on ? <button onClick={start}>Start</button> : <button onClick={stop}>Stop</button>}
      {partials && <div style={{ opacity: 0.6, marginTop: 12 }}>⌛ {partials}</div>}
      <pre style={{ whiteSpace: 'pre-wrap', marginTop: 12 }}>{lines.join('\n')}</pre>
    </main>
  );
}
