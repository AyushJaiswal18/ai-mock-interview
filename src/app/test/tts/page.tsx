'use client';
import { useRef, useState } from 'react';

export default function TTSHTTP() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [q, setQ] = useState('Hello Ayush! This is Xaya from the streaming server!');

  const play = () => {
    const url = `/api/tts/stream?q=${encodeURIComponent(q)}`;
    if (audioRef.current) {
      audioRef.current.src = url;
      audioRef.current.play().catch(console.warn);
    }
  };

  return (
    <main style={{ padding: 24 }}>
      <h2>ElevenLabs HTTP Streaming (Baseline)</h2>
      <input style={{ width: '100%', padding: 8 }} value={q} onChange={e=>setQ(e.target.value)} />
      <div style={{ marginTop: 8 }}>
        <button onClick={play}>Play</button>
      </div>
      <audio ref={audioRef} controls style={{ marginTop: 12 }} />
    </main>
  );
}
