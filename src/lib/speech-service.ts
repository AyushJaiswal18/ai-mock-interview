import '@/lib/env-config';

// Deepgram configuration for real-time STT
export const SPEECH_CONFIG = {
  // Deepgram API settings for highest quality
  MODEL: 'nova-2',           // Latest, most accurate model
  LANGUAGE: 'en',            // Primary language
  SMART_FORMAT: true,        // Auto punctuation and capitalization
  PROFANITY_FILTER: false,   // Keep raw speech for analysis
  REDACT: false,             // Don't redact sensitive info for interview context
  
  // Real-time streaming settings
  INTERIM_RESULTS: true,     // Get partial results for responsiveness
  ENDPOINTING: 300,         // 300ms silence to detect end of speech
  VAD_EVENTS: true,          // Voice activity detection events
  
  // Advanced features
  PUNCTUATE: true,          // Add punctuation
  NUMERALS: true,           // Convert numbers to numerals
  SEARCH: true,             // Enable search features
  REPLACE: true,            // Enable word replacement
  
  // Quality settings
  ENCODING: 'linear16',     // High quality audio encoding
  SAMPLE_RATE: 16000,       // Optimal sample rate for speech
  CHANNELS: 1,              // Mono audio
  
  // Confidence and alternatives
  CONFIDENCE: true,         // Include confidence scores
  ALTERNATIVES: 2,          // Get alternative transcriptions
} as const;

// Voice analysis metrics
export interface SpeechAnalysis {
  transcript: string;
  confidence: number;        // 0-1 confidence score
  wordsPerMinute: number;    // Speaking pace
  fillerWordCount: number;   // Um, uh, like, etc.
  pauseDuration: number;     // Average pause length in seconds
  volume: number;           // Average audio volume
  clarity: number;          // Speech clarity score (0-1)
  alternatives: string[];    // Alternative transcriptions
  timestamp: number;        // When speech occurred
  duration: number;         // Length of speech segment
}

// Real-time transcription events
export interface TranscriptionEvent {
  type: 'transcript' | 'interim' | 'speech_start' | 'speech_end' | 'error' | 'connected' | 'disconnected';
  data: {
    transcript?: string;
    confidence?: number;
    isFinal?: boolean;
    timestamp?: number;
    error?: string;
    isSpeaking?: boolean;
  };
}

export class RealTimeSpeechService {
  private deepgramApiKey: string;
  private wsUrl = 'wss://api.deepgram.com/v1/listen';
  private socket: WebSocket | null = null;
  private isConnected = false;
  private onTranscriptionEvent: ((event: TranscriptionEvent) => void) | null = null;
  private currentTranscript = '';
  private interimTranscript = '';
  private isSpeaking = false;
  private speechStartTime: number | null = null;
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private processor: ScriptProcessorNode | null = null;
  private keepAliveInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.deepgramApiKey = '';
    console.log('Speech service initialized');
  }

  /**
   * Get Deepgram API key from server
   */
  private async getApiKey(): Promise<string> {
    if (this.deepgramApiKey) {
      return this.deepgramApiKey;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/voice/deepgram-token', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get Deepgram token');
      }

      const result = await response.json();
      this.deepgramApiKey = result.data.apiKey;
      return this.deepgramApiKey;
    } catch (error) {
      console.error('Error getting Deepgram API key:', error);
      throw new Error('Failed to get Deepgram API key');
    }
  }

  /**
   * Start real-time transcription
   */
  async startTranscription(
    onEvent: (event: TranscriptionEvent) => void,
    audioConstraints?: MediaStreamConstraints['audio']
  ): Promise<void> {
    // Get API key from server
    const apiKey = await this.getApiKey();
    if (!apiKey) {
      throw new Error('Deepgram API key not available');
    }

    this.onTranscriptionEvent = onEvent;

    try {
      // Get microphone access
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: audioConstraints || {
          sampleRate: SPEECH_CONFIG.SAMPLE_RATE,
          channelCount: SPEECH_CONFIG.CHANNELS,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });

      // Initialize audio context
      this.audioContext = new AudioContext({
        sampleRate: SPEECH_CONFIG.SAMPLE_RATE,
      });

      // Create audio source
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);

      // Create script processor for audio processing (legacy but works)
      this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);

      // Connect audio nodes
      source.connect(this.processor);
      this.processor.connect(this.audioContext.destination);

      // Initialize WebSocket connection
      await this.initializeWebSocket();

      // Start processing audio
      this.processor.onaudioprocess = (event) => {
        if (this.socket && this.isConnected) {
          const audioData = event.inputBuffer.getChannelData(0);
          const buffer = this.float32ToInt16(audioData);
          
          // Debug: Log audio processing (less frequent)
          if (Math.random() < 0.05) { // Log only 5% of chunks
            console.log('Processing audio chunk:', buffer.length, 'samples');
          }
          
          try {
            this.socket.send(buffer);
          } catch (error) {
            console.error('Error sending audio data:', error);
            this.isConnected = false;
          }
        }
      };

      this.onTranscriptionEvent({
        type: 'connected',
        data: { timestamp: Date.now() }
      });

      console.log('Real-time transcription started');
    } catch (error) {
      console.error('Error starting transcription:', error);
      throw new Error('Failed to start real-time transcription');
    }
  }

  /**
   * Stop real-time transcription
   */
  async stopTranscription(): Promise<SpeechAnalysis> {
    try {
      // Clear keep-alive interval
      if (this.keepAliveInterval) {
        clearInterval(this.keepAliveInterval);
        this.keepAliveInterval = null;
      }

      // Close WebSocket
      if (this.socket) {
        this.socket.close();
        this.socket = null;
      }

      // Stop audio processing
      if (this.processor) {
        this.processor.disconnect();
        this.processor = null;
      }

      if (this.audioContext) {
        await this.audioContext.close();
        this.audioContext = null;
      }

      if (this.mediaStream) {
        this.mediaStream.getTracks().forEach(track => track.stop());
        this.mediaStream = null;
      }

      this.isConnected = false;
      this.isSpeaking = false;

      // Return final analysis
      const analysis = this.generateSpeechAnalysis();
      
      this.onTranscriptionEvent?.({
        type: 'disconnected',
        data: { timestamp: Date.now() }
      });

      console.log('Real-time transcription stopped');
      return analysis;
    } catch (error) {
      console.error('Error stopping transcription:', error);
      throw new Error('Failed to stop transcription');
    }
  }

  /**
   * Initialize WebSocket connection to Deepgram
   */
  private async initializeWebSocket(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      const apiKey = await this.getApiKey();
      
      const params = new URLSearchParams({
        model: SPEECH_CONFIG.MODEL,
        language: SPEECH_CONFIG.LANGUAGE,
        smart_format: SPEECH_CONFIG.SMART_FORMAT.toString(),
        interim_results: SPEECH_CONFIG.INTERIM_RESULTS.toString(),
        endpointing: SPEECH_CONFIG.ENDPOINTING.toString(),
        punctuate: SPEECH_CONFIG.PUNCTUATE.toString(),
        numerals: SPEECH_CONFIG.NUMERALS.toString(),
        confidence: SPEECH_CONFIG.CONFIDENCE.toString(),
        alternatives: SPEECH_CONFIG.ALTERNATIVES.toString(),
      });

      const wsUrl = `${this.wsUrl}?${params.toString()}`;
      
      this.socket = new WebSocket(wsUrl, ['token', apiKey]);

      this.socket.onopen = () => {
        this.isConnected = true;
        console.log('Deepgram WebSocket connected successfully');
        
        // Set up a keep-alive ping every 30 seconds
        this.keepAliveInterval = setInterval(() => {
          if (this.socket && this.isConnected) {
            try {
              this.socket.send(JSON.stringify({ type: 'ping' }));
              console.log('Sent keep-alive ping');
            } catch (error) {
              console.error('Error sending keep-alive ping:', error);
            }
          }
        }, 30000);
        
        resolve();
      };

      this.socket.onmessage = (event) => {
        this.handleWebSocketMessage(event);
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.isConnected = false;
        this.onTranscriptionEvent?.({
          type: 'error',
          data: { error: 'WebSocket connection failed', timestamp: Date.now() }
        });
        reject(error);
      };

      this.socket.onclose = (event) => {
        this.isConnected = false;
        if (this.keepAliveInterval) {
          clearInterval(this.keepAliveInterval);
          this.keepAliveInterval = null;
        }
        console.log('Deepgram WebSocket disconnected:', event.code, event.reason);
      };
    });
  }

  /**
   * Handle incoming WebSocket messages from Deepgram
   */
  private handleWebSocketMessage(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data);
      
      // Debug: Log message types
      console.log('Deepgram message received:', data.type);
      
      if (data.type === 'Results') {
        const transcript = data.channel?.alternatives?.[0]?.transcript || '';
        const confidence = data.channel?.alternatives?.[0]?.confidence || 0;
        const isFinal = data.is_final || false;

        if (transcript.trim()) {
          if (isFinal) {
            this.currentTranscript = transcript;
            this.interimTranscript = '';
            
            this.onTranscriptionEvent?.({
              type: 'transcript',
              data: {
                transcript,
                confidence,
                isFinal: true,
                timestamp: Date.now()
              }
            });
          } else {
            this.interimTranscript = transcript;
            
            this.onTranscriptionEvent?.({
              type: 'interim',
              data: {
                transcript,
                confidence,
                isFinal: false,
                timestamp: Date.now()
              }
            });
          }
        }
      } else if (data.type === 'SpeechStarted') {
        this.isSpeaking = true;
        this.speechStartTime = Date.now();
        
        this.onTranscriptionEvent?.({
          type: 'speech_start',
          data: {
            isSpeaking: true,
            timestamp: Date.now()
          }
        });
      } else if (data.type === 'SpeechEnded') {
        this.isSpeaking = false;
        
        this.onTranscriptionEvent?.({
          type: 'speech_end',
          data: {
            isSpeaking: false,
            timestamp: Date.now()
          }
        });
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }

  /**
   * Convert Float32Array to Int16Array for WebSocket transmission
   */
  private float32ToInt16(float32Array: Float32Array): Int16Array {
    const int16Array = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return int16Array;
  }

  /**
   * Generate speech analysis from collected data
   */
  private generateSpeechAnalysis(): SpeechAnalysis {
    const transcript = this.currentTranscript;
    const words = transcript.split(' ').filter(word => word.length > 0);
    const duration = this.speechStartTime ? (Date.now() - this.speechStartTime) / 1000 : 0;
    
    return {
      transcript,
      confidence: 0.9, // Placeholder - would come from Deepgram
      wordsPerMinute: duration > 0 ? (words.length / duration) * 60 : 0,
      fillerWordCount: this.countFillerWords(transcript),
      pauseDuration: 0, // Would need to track pauses
      volume: 0.8, // Placeholder
      clarity: 0.9, // Placeholder
      alternatives: [],
      timestamp: Date.now(),
      duration,
    };
  }

  /**
   * Count filler words in transcript
   */
  private countFillerWords(transcript: string): number {
    const fillerWords = ['um', 'uh', 'like', 'you know', 'basically', 'actually', 'sort of', 'kind of'];
    const lowerTranscript = transcript.toLowerCase();
    return fillerWords.reduce((count, word) => {
      const regex = new RegExp(`\\b${word}\\b`, 'g');
      const matches = lowerTranscript.match(regex);
      return count + (matches ? matches.length : 0);
    }, 0);
  }

  /**
   * Get current transcription status
   */
  getStatus(): {
    isConnected: boolean;
    isSpeaking: boolean;
    currentTranscript: string;
    interimTranscript: string;
  } {
    return {
      isConnected: this.isConnected,
      isSpeaking: this.isSpeaking,
      currentTranscript: this.currentTranscript,
      interimTranscript: this.interimTranscript,
    };
  }

  /**
   * Check if real-time transcription is supported
   */
  static isSupported(): boolean {
    return typeof window !== 'undefined' && 
           typeof WebSocket !== 'undefined' &&
           typeof navigator !== 'undefined' && 
           typeof navigator.mediaDevices !== 'undefined' &&
           typeof navigator.mediaDevices.getUserMedia === 'function' &&
           typeof AudioContext !== 'undefined';
  }
}

// Export singleton instance
export const speechService = new RealTimeSpeechService();

