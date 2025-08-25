'use client';
import { useRef, useState } from 'react';

export default function BrainTest() {
  const [q, setQ] = useState('');
  const [log, setLog] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const add = (s: string) => setLog(L => [...L, s].slice(-200));

  async function ask() {
    const text = q.trim();
    if (!text) return;
    setBusy(true);
    add(`👤 ${text}`);

    // cancel previous stream if any
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    try {
      const r = await fetch('/api/brain/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: 'demo', lastUser: text }),
        signal: abortRef.current.signal,
        cache: 'no-store',
      });

      if (!r.ok || !r.body) {
        add(`⚠️ Request failed: ${r.status} ${r.statusText}`);
        setBusy(false);
        return;
      }

      const reader = r.body.getReader();
      const dec = new TextDecoder();
      let buf = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buf += dec.decode(value, { stream: true });
        // Normalize CRLF
        buf = buf.replace(/\r\n/g, '\n');

        // Split by SSE event boundary (blank line)
        const frames = buf.split(/\n\n/);
        buf = frames.pop() || '';

        for (const frame of frames) {
          if (frame.startsWith('event:')) continue; // ignore ping/error named events
          if (!frame.startsWith('data:')) continue;

          const data = frame.slice(5).trim();
          if (!data || data === '[DONE]') continue;

          try {
            const payload = JSON.parse(data);
            if (typeof payload.text === 'string') {
              add(`🧠 ${payload.text}${payload.final ? ' [final]' : ''}`);
            }
          } catch {
            // ignore non-JSON junk safely
          }
        }
      }
    } catch (e: any) {
      if (e?.name !== 'AbortError') add(`⚠️ Error: ${String(e?.message || e)}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ padding: 24 }}>
      <h2>Brain Streaming Test</h2>
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Type something…"
          disabled={busy}
          style={{ flex: 1, padding: 8 }}
        />
        <button onClick={ask} disabled={busy || !q.trim()}>
          {busy ? 'Streaming…' : 'Ask'}
        </button>
        <button
          type="button"
          onClick={() => { abortRef.current?.abort(); setBusy(false); }}
          disabled={!busy}
        >
          Cancel
        </button>
      </div>
      <pre style={{ whiteSpace: 'pre-wrap', marginTop: 12 }}>{log.join('\n')}</pre>
    </main>
  );
}
