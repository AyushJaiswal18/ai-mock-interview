'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { useParams } from 'next/navigation';

/* =========================
   Config
   ========================= */

const AAI_WS = process.env.NEXT_PUBLIC_AAI_WS || 'wss://streaming.assemblyai.com/v3/ws';
const TTS_ENDPOINT = '/api/tts/stream';

/* =========================
   Lightweight HTTP TTS queue
   ========================= */

class HttpTTSQueue {
  private audio: HTMLAudioElement;
  private q: string[] = [];
  private playing = false;

  constructor(audioEl?: HTMLAudioElement | null) {
    this.audio = audioEl || new Audio();
    this.audio.preload = 'auto';
  }
  __qLength() { return this.q.length; }
  __mergeTail(extra: string) {
    if (!this.q.length) { this.q.push(extra); return; }
    this.q[this.q.length - 1] = `${this.q[this.q.length - 1]} ${extra}`;
  }
  isSpeaking() { return this.playing && !this.audio.paused; }
  stop() {
    try { this.audio.pause(); } catch {}
    try { this.audio.currentTime = 0; } catch {}
    this.q = [];
    this.playing = false;
  }
  async say(text: string) {
    const t = (text || '').trim();
    if (!t) return;
    this.q.push(t);
    if (!this.playing) this.playNext();
  }
  private async playNext() {
    if (this.playing) return;
    const next = this.q.shift();
    if (!next) return;
    this.playing = true;

    let url: string | null = null;
    try {
      const res = await fetch(TTS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: next }),
      });
      if (!res.ok) throw new Error(`TTS HTTP ${res.status}`);
      const buf = await res.arrayBuffer();
      const blob = new Blob([new Uint8Array(buf)], { type: 'audio/mpeg' });
      url = URL.createObjectURL(blob);
      this.audio.src = url;
      await this.audio.play();
      await new Promise<void>((resolve) => {
        const onEnd = () => { this.audio.removeEventListener('ended', onEnd); resolve(); };
        this.audio.addEventListener('ended', onEnd);
      });
    } catch {
      // swallow
    } finally {
      if (url) URL.revokeObjectURL(url);
      this.playing = false;
      if (this.q.length) this.playNext();
    }
  }
}

/* =========================
   Phrase aggregator for TTS
   ========================= */

function usePhraseAggregator(opts?: { idleMs?: number; maxWords?: number }) {
  const idleMs = opts?.idleMs ?? 260;
  const maxWords = opts?.maxWords ?? 18;

  const bufRef = useRef<string>('');
  const timerRef = useRef<number | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
  }, []);

  const shouldFlushNow = useCallback(
    (s: string) =>
      /[.!?…]["'")\]]?\s$/.test(s) ||
      /[,;:]\s$/.test(s) ||
      s.split(/\s+/).length >= maxWords,
    [maxWords]
  );

  const push = useCallback((chunk: string, onFlush: (phrase: string) => void) => {
    if (!chunk) return;
    bufRef.current += (bufRef.current ? ' ' : '') + chunk.trim();
    if (shouldFlushNow(bufRef.current)) {
      const out = bufRef.current.trim();
      bufRef.current = '';
      clearTimer();
      onFlush(out);
      return;
    }
    clearTimer();
    timerRef.current = window.setTimeout(() => {
      const out = bufRef.current.trim();
      bufRef.current = '';
      if (out) onFlush(out);
    }, idleMs) as unknown as number;
  }, [idleMs, shouldFlushNow, clearTimer]);

  const flush = useCallback((onFlush: (phrase: string) => void) => {
    clearTimer();
    const out = bufRef.current.trim();
    bufRef.current = '';
    if (out) onFlush(out);
  }, [clearTimer]);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);
  return { push, flush };
}

/* =========================
   Enhanced UI Components
   ========================= */

function StatusChip({ label, color = 'bg-gray-700', icon }: { label: string; color?: string; icon?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1 text-xs font-medium rounded-full ${color} text-white border border-gray-600`}>
      {icon && <span>{icon}</span>}
      {label}
    </span>
  );
}

function Bubble({ role, text, live, timestamp }: { role: 'user'|'ai'; text: string; live?: boolean; timestamp?: number }) {
  const isUser = role === 'user';
  const time = timestamp ? new Date(timestamp).toLocaleTimeString() : '';
  
  return (
    <div className="flex gap-3 mb-4 items-start">
      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-lg ${
        isUser ? 'bg-blue-600' : 'bg-red-600'
      }`}>
        {isUser ? '👤' : '🤖'}
      </div>
      <div className={`flex-1 p-3 rounded-lg max-w-2xl shadow-md relative ${
        isUser 
          ? 'bg-gray-800 border border-gray-700' 
          : 'bg-gray-900 border border-gray-600'
      }`}>
        <div className="text-white text-sm leading-relaxed whitespace-pre-wrap">
          {text}
        </div>
        {live && (
          <div className="mt-2 text-xs text-gray-400 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            listening...
          </div>
        )}
        {time && (
          <div className="absolute -top-2 -right-2 text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded-md border border-gray-700">
            {time}
          </div>
        )}
      </div>
    </div>
  );
}

function QuestionCard({ question, stage }: { question: string; stage: string }) {
  const stageColors = {
    intro: 'bg-blue-600',
    warmup: 'bg-green-600', 
    core: 'bg-yellow-600',
    followup: 'bg-purple-600',
    wrap: 'bg-indigo-600'
  };
  
  const stageLabels = {
    intro: 'Introduction',
    warmup: 'Warm-up',
    core: 'Core Questions',
    followup: 'Follow-up',
    wrap: 'Wrap-up'
  };

  return (
    <div className="p-4 border border-gray-700 rounded-lg bg-gray-900 mb-6 shadow-lg">
      <div className="flex items-center gap-2 mb-3">
        <StatusChip 
          label={stageLabels[stage as keyof typeof stageLabels] || stage} 
          color={stageColors[stage as keyof typeof stageColors] || 'bg-gray-700'}
          icon="🎯"
        />
        <span className="text-xs text-gray-400">Current Question</span>
      </div>
      <div className="text-white text-base leading-relaxed font-medium">
        {question}
      </div>
    </div>
  );
}

function ControlPanel({ on, onStart, onEnd, onStop }: {
  on: boolean;
  onStart: () => void;
  onEnd: () => void;
  onStop: () => void;
}) {
  return (
    <div className="flex gap-3 items-center mb-6 p-4 bg-gray-900 rounded-lg border border-gray-700">
      {!on ? (
        <button 
          onClick={onStart}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white border-none rounded-lg text-sm font-semibold cursor-pointer flex items-center gap-2 shadow-lg transition-colors"
        >
          🎤 Start Interview
        </button>
      ) : (
        <>
          <button 
            onClick={onEnd}
            className="px-5 py-2.5 bg-yellow-600 hover:bg-yellow-700 text-white border-none rounded-lg text-sm font-medium cursor-pointer flex items-center gap-1.5 transition-colors"
          >
            ⏹️ End Interview
          </button>
          <button 
            onClick={onStop}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white border-none rounded-lg text-sm font-medium cursor-pointer flex items-center gap-1.5 transition-colors"
          >
            🛑 Stop
          </button>
        </>
      )}
    </div>
  );
}

function AudioControls({ audioRef, ttsRef }: { audioRef: React.RefObject<HTMLAudioElement | null>; ttsRef: React.RefObject<HttpTTSQueue | null> }) {
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      setVolume(newVolume);
    }
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg mb-4">
      <span className="text-xs font-medium text-gray-300">Audio:</span>
      <button
        onClick={toggleMute}
        className={`px-3 py-1.5 text-white border-none rounded text-xs cursor-pointer transition-colors ${
          isMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
        }`}
      >
        {isMuted ? '🔇' : '🔊'}
      </button>
      <input
        type="range"
        min="0"
        max="1"
        step="0.1"
        value={volume}
        onChange={handleVolumeChange}
        className="w-24"
      />
      <span className="text-xs text-gray-400">
        {Math.round(volume * 100)}%
      </span>
    </div>
  );
}

function RelevantLogs({ lines }: { lines: string[] }) {
  // Filter only relevant logs
  const relevantLines = lines.filter(line => 
    line.includes('🎯') || 
    line.includes('❌') || 
    line.includes('✅') || 
    line.includes('🔄') ||
    line.includes('🗣️') ||
    line.includes('🎤') ||
    line.includes('🤖') ||
    line.includes('📡') ||
    line.includes('🔌')
  );

  if (relevantLines.length === 0) return null;

  return (
    <div className="mt-4 p-3 bg-gray-900 border border-gray-700 rounded-lg max-h-32 overflow-auto">
      <div className="text-xs font-semibold mb-2 text-gray-300">
        📊 Interview Status
      </div>
      <div className="text-xs leading-relaxed text-gray-400">
        {relevantLines.slice(-5).map((line, i) => (
          <div key={i} className="mb-1">{line}</div>
        ))}
      </div>
    </div>
  );
}

/* =========================
   Page
   ========================= */

type Turn = { id: string; role: 'user' | 'ai'; text: string; at: number };

export default function LiveInterview() {
  const { id: interviewId } = useParams<{ id: string }>();

  // UI state
  const [on, setOn] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [stage, setStage] = useState<string>('intro');
  const [currentQuestion, setCurrentQuestion] = useState('');

  // Transcript timeline & live bubbles
  const [turns, setTurns] = useState<Turn[]>([]);
  const [liveUser, setLiveUser] = useState<string>('');
  const [liveAI, setLiveAI] = useState<string>('');

  // Logs (filtered for relevance)
  const [lines, setLines] = useState<string[]>([]);
  const add = (s: string) => setLines(L => [...L, s].slice(-50)); // Keep fewer lines

  // Audio + STT refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ttsRef = useRef<HttpTTSQueue | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Brain stream control
  const brainAbortRef = useRef<AbortController | null>(null);

  // TTS aggregator
  const aggregator = usePhraseAggregator({ idleMs: 260, maxWords: 18 });

  // Coalescer for TTS
  const MAX_TTS_QUEUE = 3;
  const speakCoalesced = useCallback((text: string) => {
    const tts: any = ttsRef.current!;
    if (tts?.__qLength && tts.__qLength() >= MAX_TTS_QUEUE) {
      tts.__mergeTail(text);
    } else {
      ttsRef.current?.say(text);
    }
  }, []);
  const ensureTTS = useCallback(() => {
    if (!ttsRef.current) ttsRef.current = new HttpTTSQueue(audioRef.current || undefined);
  }, []);

  async function startAll() {
    if (!interviewId) { add('❌ Missing interviewId'); return; }
    ensureTTS();

    try {
      const token = localStorage.getItem('auth_token');

      // 1) Start interview → first question
      add('🎯 Starting interview...');
      const startRes = await fetch(`/api/interviews/${interviewId}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        cache: 'no-store',
      });
      const start = await startRes.json();
      if (!startRes.ok) { add(`❌ Start failed: ${start?.error || startRes.statusText}`); return; }
      setSessionId(start.sessionId);
      setCurrentQuestion(start.question || '');
      setStage(start.stage || 'intro');
      add(`🎯 Question: ${start.question?.substring(0, 50)}...`);
      add(`🆔 Session: ${start.sessionId}`);
      speakCoalesced(start.question || '');

      // 2) STT (AssemblyAI)
      add('🔑 Getting audio token...');
      const tok = await fetch('/api/aai/token', { cache: 'no-store' }).then(r => r.json());
      if (!tok?.token) throw new Error('No AAI token');

      const wsUrl = `${AAI_WS}?sample_rate=16000&encoding=pcm_s16le&token=${encodeURIComponent(tok.token)}`;
      add('🔌 Connecting audio...');
      const ws = new WebSocket(wsUrl);
      ws.binaryType = 'arraybuffer';
      wsRef.current = ws;

      ws.onopen = async () => {
        try {
          if (!navigator.mediaDevices?.getUserMedia) throw new Error('getUserMedia not supported');
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
          });
          streamRef.current = stream;

          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 48000 });
          ctxRef.current = ctx;
          await ctx.audioWorklet.addModule('/pcm-worklet.js');

          const src = ctx.createMediaStreamSource(stream);
          const node = new (window as any).AudioWorkletNode(ctx, 'pcm-worklet');
          const sink = ctx.createGain(); sink.gain.value = 0;
          src.connect(node); node.connect(sink); sink.connect(ctx.destination);

          let sent = 0;
          node.port.onmessage = (e: MessageEvent) => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(e.data);
              if (++sent % 120 === 0) add(`📡 Audio: ${sent} frames`);
            }
          };

          setOn(true);
          add('🗣️ Ready to speak!');
        } catch (err: any) {
          add(`❌ Audio setup failed: ${String(err?.message || err)}`);
        }
      };

      // Robust v3 message handling
      ws.onmessage = (evt) => {
        try {
          const msg = JSON.parse(String(evt.data));

          // A) PartialTranscript / Transcript
          if (msg.type === 'PartialTranscript') {
            const text = msg.transcript || '';
            setLiveUser(text);
            if (text && ttsRef.current?.isSpeaking()) {
              ttsRef.current.stop();
              try { brainAbortRef.current?.abort(); } catch {}
            }
            return;
          }
          if (msg.type === 'Transcript' && msg.transcript) {
            const final = String(msg.transcript).trim();
            if (final) {
              setLiveUser('');
              setTurns(T => [...T, { id: crypto.randomUUID(), role: 'user', text: final, at: Date.now() }]);
              add(`🎤 You: "${final.substring(0, 30)}..."`);
              askBrain(final);
            }
            return;
          }

          // B) Turn shape
          if (msg.type === 'Turn') {
            const tr = String(msg.transcript || '');
            const eot = Boolean(msg.end_of_turn);
            if (tr) {
              setLiveUser(tr);
              if (ttsRef.current?.isSpeaking()) {
                ttsRef.current.stop();
                try { brainAbortRef.current?.abort(); } catch {}
              }
            }
            if (eot && tr) {
              setLiveUser('');
              setTurns(T => [...T, { id: crypto.randomUUID(), role: 'user', text: tr, at: Date.now() }]);
              add(`🎤 You: "${tr.substring(0, 30)}..."`);
              askBrain(tr);
            }
            return;
          }
        } catch {
          // Non-JSON, ignore
        }
      };

      ws.onclose = (e) => { add(`🔌 Audio closed: ${e.code}`); };
      ws.onerror = () => { add('❌ Audio error'); };
    } catch (e: any) {
      add(`❌ Start failed: ${String(e?.message || e)}`);
      stopAll();
    }
  }

  // Politely end via intent
  async function endInterview() {
    add('🛑 Ending interview...');
    await askBrain('end interview');
  }

  async function askBrain(userText: string) {
    const currentSessionId = sessionId || (interviewId as string);
    if (!currentSessionId) { add('❌ No sessionId'); return; }
    ensureTTS();

    setLiveAI('');

    try { brainAbortRef.current?.abort(); } catch {}
    brainAbortRef.current = new AbortController();

    try {
      const token = localStorage.getItem('auth_token');
      const r = await fetch('/api/interview/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ sessionId: currentSessionId, lastUser: userText }),
        cache: 'no-store',
        signal: brainAbortRef.current.signal,
      });

      if (!r.ok || !r.body) { add(`⚠️ AI failed: ${r.status}`); return; }

      const reader = r.body.getReader();
      const dec = new TextDecoder();
      let buf = '';
      let latchedNextQ = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buf += dec.decode(value, { stream: true }).replace(/\r\n/g, '\n');
        const frames = buf.split('\n\n');
        buf = frames.pop() || '';

        for (const f of frames) {
          if (!f.startsWith('data:')) continue;
          const data = f.slice(5).trim();
          if (!data || data === '[DONE]') continue;

          try {
            const payload = JSON.parse(data);
            const chunk = String(payload.text ?? '').trim();
            const final = Boolean(payload.final);

            if (chunk) {
              setLiveAI(prev => (prev ? `${prev} ${chunk}` : chunk));
              if (!latchedNextQ) latchedNextQ = chunk;
              aggregator.push(chunk, phrase => speakCoalesced(phrase));
            }

            if (final) {
              aggregator.flush(p => speakCoalesced(p));

              if (payload.meta?.ended) {
                setTurns(T => [...T, { id: crypto.randomUUID(), role: 'ai', text: (prevTextForLock() || 'Interview ended. Thank you!'), at: Date.now() }]);
                add('✅ Interview completed');
                stopAll();
                return;
              }

              const toLock = (prevTextForLock() || '').trim();
              if (toLock) {
                setTurns(T => [...T, { id: crypto.randomUUID(), role: 'ai', text: toLock, at: Date.now() }]);
                setLiveAI('');
                add(`🤖 AI: "${toLock.substring(0, 30)}..."`);
              }

              const newQ = String(payload.meta?.newQuestion || latchedNextQ || '').trim();
              if (newQ) {
                setCurrentQuestion(newQ);
                add(`🔄 New question: "${newQ.substring(0, 30)}..."`);
              }
              if (payload.meta?.stage) setStage(String(payload.meta.stage));
            }
          } catch {
            // ignore parse errors
          }
        }
      }
      aggregator.flush(p => speakCoalesced(p));
    } catch (e: any) {
      if (e?.name !== 'AbortError') add(`⚠️ AI error: ${String(e.message || e)}`);
    }

    function prevTextForLock() {
      let text = '';
      setLiveAI(prev => { text = prev; return prev; });
      return text;
    }
  }

  function stopAll() {
    try { wsRef.current?.close(); } catch {}
    wsRef.current = null;

    try { ctxRef.current?.close(); } catch {}
    ctxRef.current = null;

    try { streamRef.current?.getTracks().forEach(t => t.stop()); } catch {}
    streamRef.current = null;

    try { brainAbortRef.current?.abort(); } catch {}
    brainAbortRef.current = null;

    ttsRef.current?.stop();

    setOn(false);
    setLiveUser('');
    setLiveAI('');
  }

  useEffect(() => () => stopAll(), []);

  /* =========================
     Render
     ========================= */

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-6 p-4 bg-gray-900 rounded-lg border border-gray-700 shadow-lg">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">
                Live Interview
              </h1>
              <p className="text-gray-400 text-sm">
                AI-powered mock interview session
              </p>
            </div>
            <div className="flex gap-2 items-center">
              <StatusChip 
                label={stage.charAt(0).toUpperCase() + stage.slice(1)} 
                color="bg-blue-600" 
                icon="🎯"
              />
              {on ? (
                <StatusChip label="Listening" color="bg-green-600" icon="🎤" />
              ) : (
                <StatusChip label="Ready" color="bg-gray-600" icon="⏸️" />
              )}
            </div>
          </div>
        </header>

        <ControlPanel 
          on={on}
          onStart={startAll}
          onEnd={endInterview}
          onStop={stopAll}
        />

        <AudioControls audioRef={audioRef} ttsRef={ttsRef} />

        {/* Hidden audio element for TTS */}
        <audio ref={audioRef} className="hidden" />

        {currentQuestion && (
          <QuestionCard question={currentQuestion} stage={stage} />
        )}

        {/* Transcript timeline */}
        <section className="border border-gray-700 rounded-lg p-5 min-h-80 bg-gray-900 shadow-lg mb-4">
          <div className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
            💬 Conversation
          </div>
          
          {turns.length === 0 && !liveUser && !liveAI && (
            <div className="text-center py-10 text-gray-400 text-sm">
              Start the interview to begin the conversation
            </div>
          )}

          {/* Past turns */}
          {turns.map(t => (
            <Bubble key={t.id} role={t.role} text={t.text} timestamp={t.at} />
          ))}

          {/* Live user partial bubble */}
          {liveUser ? <Bubble role="user" text={liveUser} live /> : null}

          {/* Live AI bubble */}
          {liveAI ? <Bubble role="ai" text={liveAI} /> : null}
        </section>

        <RelevantLogs lines={lines} />
      </div>
    </main>
  );
}