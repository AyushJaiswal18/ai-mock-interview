'use client';
import { useEffect, useRef, useState } from 'react';
import { HttpTTSQueue } from '../ttsHttpClient';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Volume2, VolumeX, Brain, MessageCircle, Play, Square, User, Bot } from 'lucide-react';

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
    /[.!?…]["'")\]]?\s$/.test(s) || /[,;:]\s$/.test(s) || s.split(/\s+/).length >= maxWords;

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

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  isPartial?: boolean;
}

export default function Duplex() {
  const [on, setOn] = useState(false);
  const [partials, setPartials] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const addMessage = (type: 'user' | 'assistant' | 'system', content: string, isPartial = false) => {
    const message: ChatMessage = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      type,
      content,
      timestamp: new Date(),
      isPartial
    };
    
    if (isPartial) {
      setMessages(prev => {
        const filtered = prev.filter(m => !m.isPartial);
        return [...filtered, message];
      });
    } else {
      setMessages(prev => [...prev.filter(m => !m.isPartial), message]);
    }
  };

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

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
      addMessage('system', '🔑 Requesting AAI token...');
      const t = await fetch('/api/aai/token', { cache: 'no-store' }).then(r => r.json());
      if (!t?.token) throw new Error('No token from /api/aai/token');
      addMessage('system', '✅ Token received');

      const wsUrl = `${AAI_WS}?sample_rate=16000&encoding=pcm_s16le&token=${encodeURIComponent(t.token)}`;
      addMessage('system', '🔌 Connecting STT WS…');
      const ws = new WebSocket(wsUrl);
      ws.binaryType = 'arraybuffer';
      wsRef.current = ws;

      ws.onopen = async () => {
        addMessage('system', '✅ STT connected');
        try {
          addMessage('system', '🎤 Requesting mic…');
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
          });
          mediaStreamRef.current = stream;
          addMessage('system', '✅ Mic granted');

          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 48000 });
          await ctx.resume();
          ctxRef.current = ctx;

          await ctx.audioWorklet.addModule('/pcm-worklet.js');
          addMessage('system', '✅ Worklet loaded');

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
              if (++sent % 20 === 0) addMessage('system', `📤 sent ${(sent * 50 / 1000).toFixed(1)}s audio`);
            }
          };

          setOn(true);
          addMessage('system', '🎙️ Speak now');
        } catch (err: any) {
          addMessage('system', '❌ Mic setup failed: ' + (err?.message || err));
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
                addMessage('system', '⏹️ Barge-in: stopping TTS');
                ttsRef.current.stop();
                try { brainAbortRef.current?.abort(); } catch {}
              }
            } else {
              setPartials('');
              const utt = transcript.trim();
              if (utt) {
                addMessage('user', utt);
                askBrain(utt);
              }
            }
          }
        } catch (e: any) {
          addMessage('system', `❌ JSON parse error: ${e?.message}`);
        }
      };

      ws.onclose = (e) => { addMessage('system', `🔌 STT closed: ${e.code} ${e.reason || ''}`); wsRef.current = null; try { ctxRef.current?.suspend?.(); } catch {} };
      ws.onerror = () => { addMessage('system', '❌ STT error'); wsRef.current = null; };
    } catch (e: any) {
      addMessage('system', '❌ Failed to start: ' + (e?.message || e));
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
      if (!r.ok || !r.body) { addMessage('system', `⚠️ Brain failed: ${r.status} ${r.statusText}`); return; }

      const reader = r.body.getReader();
      const dec = new TextDecoder();
      let buf = '';
      let currentResponse = '';

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
              currentResponse += chunk;
              addMessage('assistant', currentResponse, true); // Show as partial
              aggregator.push(chunk, phrase => speakCoalesced(phrase));
            }
            if (final) {
              addMessage('assistant', currentResponse, false); // Final message
              aggregator.flush(phrase => speakCoalesced(phrase));
            }
          } catch {}
        }
      }
      // safety flush if stream ended without final=true
      aggregator.flush(phrase => speakCoalesced(phrase));
    } catch (e: any) {
      if (e?.name !== 'AbortError') addMessage('system', `⚠️ Brain error: ${e.message}`);
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
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">AI Voice Assistant</h1>
          <p className="text-gray-400 text-lg">
            Have a natural conversation with AI using voice
          </p>
        </div>

        {/* Control Panel */}
        <div className="bg-gray-900 rounded-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${on ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
                <span className="text-sm font-medium">
                  {on ? 'Listening' : 'Ready to start'}
                </span>
              </div>
              {partials && (
                <div className="flex items-center gap-2 text-blue-400">
                  <Mic className="w-4 h-4" />
                  <span className="text-sm italic">{partials}</span>
                </div>
              )}
            </div>
            
            <div className="flex gap-3">
              {!on ? (
                <Button 
                  onClick={start} 
                  size="lg" 
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Conversation
                </Button>
              ) : (
                <Button 
                  onClick={stop} 
                  size="lg" 
                  variant="destructive"
                >
                  <Square className="w-4 h-4 mr-2" />
                  End Conversation
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Hidden Audio Element */}
        <audio ref={audioRef} style={{ display: 'none' }} />

        {/* Chat Interface */}
        <div className="bg-gray-900 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Conversation
          </h3>
          <div className="bg-gray-800 rounded-lg p-4 h-[600px] overflow-y-auto">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Start a conversation</p>
                  <p className="text-sm">Click "Start Conversation" to begin talking with AI</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.type === 'assistant' && (
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    )}
                    
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-3 ${
                        message.type === 'user'
                          ? 'bg-blue-600 text-white'
                          : message.type === 'assistant'
                          ? 'bg-gray-700 text-white'
                          : 'bg-yellow-600/20 text-yellow-400 border border-yellow-600/30'
                      } ${message.isPartial ? 'opacity-70' : ''}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {message.type === 'user' && (
                          <User className="w-4 h-4" />
                        )}
                        {message.type === 'assistant' && (
                          <Bot className="w-4 h-4" />
                        )}
                        <span className="text-xs font-medium">
                          {message.type === 'user' ? 'You' : message.type === 'assistant' ? 'AI Assistant' : 'System'}
                        </span>
                        {message.isPartial && (
                          <span className="text-xs opacity-70">(typing...)</span>
                        )}
                      </div>
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      <p className="text-xs opacity-50 mt-2">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                    
                    {message.type === 'user' && (
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
