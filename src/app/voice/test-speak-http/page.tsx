'use client';
import { useEffect, useRef, useState } from 'react';
import { HttpTTSQueue } from '../ttsHttpClient';

function usePhraseAggregator(opts?: {
  idleMs?: number;        // flush if no new tokens for this long
  maxWords?: number;      // flush if phrase gets this long
}) {
  const idleMs = opts?.idleMs ?? 320;
  const maxWords = opts?.maxWords ?? 22;

  const bufRef = useRef<string>('');
  const timerRef = useRef<number | null>(null);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const shouldFlushNow = (s: string) => {
    // end of sentence or clause
    return /[.!?…]["’”)]?\s$/.test(s) || /[,;:]\s$/.test(s) || s.split(/\s+/).length >= maxWords;
  };

  const push = (chunk: string, onFlush: (phrase: string) => void) => {
    if (!chunk) return;
    bufRef.current += (bufRef.current ? ' ' : '') + chunk.trim();

    if (shouldFlushNow(bufRef.current)) {
      const out = bufRef.current.trim();
      bufRef.current = '';
      clearTimer();
      onFlush(out);
      return;
    }

    // idle flush
    clearTimer();
    timerRef.current = window.setTimeout(() => {
      const out = bufRef.current.trim();
      bufRef.current = '';
      if (out) onFlush(out);
    }, idleMs) as unknown as number;
  };

  const flush = (onFlush: (phrase: string) => void) => {
    clearTimer();
    const out = bufRef.current.trim();
    bufRef.current = '';
    if (out) onFlush(out);
  };

  return { push, flush };
}

export default function TestSpeakHTTP() {
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const abortRef = useRef<AbortController | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ttsRef = useRef<HttpTTSQueue | null>(null);

  // backpressure: if queue too big, merge tail to avoid “skips”
  const MAX_QUEUE = 3;

  const add = (s: string) => setLog(L => [...L, s].slice(-400));

  function ensureTTS() {
    if (!ttsRef.current) {
      ttsRef.current = new HttpTTSQueue(audioRef.current || undefined);
    }
  }

  const aggregator = usePhraseAggregator({ idleMs: 280, maxWords: 20 });

  function sayCoalesced(text: string) {
    const tts = ttsRef.current!;
    // If queue is long, merge this text with the last pending item
    // (prevents rapid-fire tiny HTTP requests that can get dropped by the browser)
    // @ts-ignore - we rely on implementation detail via helper method below
    if ((tts as any).__qLength && (tts as any).__qLength() >= MAX_QUEUE) {
      // @ts-ignore
      (tts as any).__mergeTail(text);
    } else {
      tts.say(text);
    }
  }

  async function ask() {
    const text = q.trim();
    if (!text) return;
    setBusy(true);
    add(`👤 ${text}`);

    ensureTTS(); // unlocked by button click

    // cancel any previous brain stream
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    try {
      const r = await fetch('/api/brain/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: 'speak-http', lastUser: text }),
        signal: abortRef.current.signal,
        cache: 'no-store',
      });

      if (!r.ok || !r.body) {
        add(`⚠️ Brain failed: ${r.status} ${r.statusText}`);
        setBusy(false);
        return;
      }

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
          if (frame.startsWith('event:')) continue;
          if (!frame.startsWith('data:')) continue;

          const data = frame.slice(5).trim();
          if (!data || data === '[DONE]') continue;

          try {
            const payload = JSON.parse(data);
            const chunk = String(payload.text ?? '').trim();
            const final = Boolean(payload.final);

            if (chunk) {
              add(`🧠 ${chunk}${final ? ' [final]' : ''}`);
              aggregator.push(chunk, (phrase) => {
                sayCoalesced(phrase);
              });
            }
            if (final) {
              aggregator.flush((phrase) => sayCoalesced(phrase));
            }
          } catch { /* ignore */ }
        }
      }
      // final safety flush
      aggregator.flush((phrase) => sayCoalesced(phrase));
    } catch (e: any) {
      if (e?.name !== 'AbortError') add(`⚠️ ${String(e.message || e)}`);
    } finally {
      setBusy(false);
    }
  }

  function stopAll() {
    try { abortRef.current?.abort(); } catch {}
    ttsRef.current?.stop();
    setBusy(false);
  }

  useEffect(() => () => stopAll(), []);

  return (
    <main style={{ padding: 24 }}>
      <h2>Speak-while-thinking (HTTP, aggregated)</h2>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input
          value={q}
          onChange={(e)=>setQ(e.target.value)}
          placeholder="Ask something…"
          disabled={busy}
          style={{ flex: 1, padding: 8 }}
        />
        <button onClick={ask} disabled={busy || !q.trim()}>
          {busy ? 'Streaming…' : 'Ask & Speak'}
        </button>
        <button onClick={stopAll} disabled={!busy}>Stop</button>
      </div>

      <audio ref={audioRef} controls style={{ display: 'block', marginBottom: 12 }} />

      <pre style={{ whiteSpace: 'pre-wrap' }}>{log.join('\n')}</pre>
    </main>
  );
}
