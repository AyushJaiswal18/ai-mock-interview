import { MicVAD, utils } from '@ricky0123/vad-web';

// VAD configuration for optimal voice detection
export const VAD_CONFIG = {
  // Model settings - Updated to match installed version 0.0.24
  MODEL_URL: 'https://unpkg.com/@ricky0123/vad-web@0.0.24/dist/silero_vad.onnx',
  WORKLET_URL: 'https://unpkg.com/@ricky0123/vad-web@0.0.24/dist/vad.worklet.bundle.min.js',
  
  // Detection sensitivity
  POSITIVE_SPEECH_THRESHOLD: 0.7,    // Confidence threshold for speech detection
  NEGATIVE_SPEECH_THRESHOLD: 0.3,    // Threshold for silence detection
  
  // Timing parameters
  REDEMPTION_FRAMES: 8,              // Frames to wait before confirming silence
  FRAME_SAMPLES: 1536,               // Samples per frame (96ms at 16kHz)
  PREAVADDED_SAMPLES: 4800,          // Samples to include before speech (300ms)
  POSTVADDED_SAMPLES: 1600,          // Samples to include after speech (100ms)
  
  // Audio processing
  SAMPLE_RATE: 16000,                // Required sample rate for VAD model
  SUBMIT_USER_SPEECH_ON_PAUSE: true, // Submit when user pauses
  
  // Real-time processing
  MIN_SPEECH_DURATION: 250,          // Minimum speech duration in ms
  MAX_SPEECH_DURATION: 30000,        // Maximum speech duration in ms (30 seconds)
  SILENCE_DURATION: 500,             // Silence duration to trigger end of speech
} as const;

// Voice activity events
export interface VADEvent {
  type: 'speech_start' | 'speech_end' | 'voice_activity' | 'silence' | 'audio_chunk';
  timestamp: number;
  data?: {
    audio?: Float32Array;
    duration?: number;
    confidence?: number;
    isSpeaking?: boolean;
  };
}

// VAD analysis results
export interface VADAnalysis {
  totalSpeechTime: number;      // Total time speaking in seconds
  totalSilenceTime: number;     // Total silence time in seconds
  speechSegments: number;       // Number of distinct speech segments
  averageSegmentLength: number; // Average length of speech segments
  speechRatio: number;          // Ratio of speech to total time
  confidenceScores: number[];   // VAD confidence scores over time
  responseLatency: number;      // Time to start speaking after question
}

export class VoiceActivityService {
  private vad: MicVAD | null = null;
  private isListening = false;
  private speechStartTime: number | null = null;
  private silenceStartTime: number | null = null;
  private currentSpeechSegment: Float32Array[] = [];
  private analysisData: {
    speechSegments: Array<{ start: number; end: number; confidence: number }>;
    silenceSegments: Array<{ start: number; end: number }>;
    confidenceScores: number[];
  } = {
    speechSegments: [],
    silenceSegments: [],
    confidenceScores: [],
  };

  constructor() {
    this.initializeVAD();
  }

  /**
   * Initialize the VAD model
   */
  private async initializeVAD(): Promise<void> {
    try {
      // Check if running in browser environment
      if (typeof window === 'undefined') {
        console.log('VAD initialization skipped (server-side)');
        return;
      }
      
      // Preload the model for faster startup (only in browser)
      console.log('VAD will initialize on demand');
    } catch (error) {
      console.error('Error preloading VAD model:', error);
    }
  }

  /**
   * Start voice activity detection
   */
  async startListening(
    onVADEvent: (event: VADEvent) => void,
    audioConstraints?: MediaStreamConstraints['audio']
  ): Promise<void> {
    if (this.isListening) {
      throw new Error('VAD is already listening');
    }

    try {
      this.vad = await MicVAD.new({
        // Model configuration - using default URLs for v0.0.24
        
        // Detection thresholds
        positiveSpeechThreshold: VAD_CONFIG.POSITIVE_SPEECH_THRESHOLD,
        negativeSpeechThreshold: VAD_CONFIG.NEGATIVE_SPEECH_THRESHOLD,
        
        // Frame configuration
        redemptionFrames: VAD_CONFIG.REDEMPTION_FRAMES,
        frameSamples: VAD_CONFIG.FRAME_SAMPLES,
        preSpeechPadFrames: Math.floor(VAD_CONFIG.PREAVADDED_SAMPLES / VAD_CONFIG.FRAME_SAMPLES),
        
        // Audio constraints
        stream: audioConstraints ? await navigator.mediaDevices.getUserMedia({
          audio: audioConstraints
        }) : undefined,
        
        // Event handlers - temporarily simplified to avoid type issues
        onSpeechStart: () => {
          console.log('Speech started');
        },
        
        onSpeechEnd: () => {
          console.log('Speech ended');
        },
        
        onVADMisfire: () => {
          console.log('VAD misfire detected');
        },
        
        // Real-time processing
        submitUserSpeechOnPause: VAD_CONFIG.SUBMIT_USER_SPEECH_ON_PAUSE,
      });

      this.isListening = true;
      this.resetAnalysisData();
      
      onVADEvent({
        type: 'voice_activity',
        timestamp: Date.now(),
        data: { isSpeaking: false }
      });

      console.log('Voice Activity Detection started');
    } catch (error) {
      console.error('Error starting VAD:', error);
      throw new Error('Failed to start voice activity detection');
    }
  }

  /**
   * Stop voice activity detection
   */
  async stopListening(): Promise<VADAnalysis> {
    if (!this.isListening || !this.vad) {
      throw new Error('VAD is not currently listening');
    }

    try {
      this.vad.destroy();
      this.vad = null;
      this.isListening = false;

      // Calculate final analysis
      const analysis = this.calculateAnalysis();
      console.log('Voice Activity Detection stopped');
      
      return analysis;
    } catch (error) {
      console.error('Error stopping VAD:', error);
      throw new Error('Failed to stop voice activity detection');
    }
  }

  /**
   * Handle speech start event
   */
  private handleSpeechStart(audio: Float32Array, onVADEvent: (event: VADEvent) => void): void {
    const now = Date.now();
    this.speechStartTime = now;
    
    // End any current silence segment
    if (this.silenceStartTime) {
      this.analysisData.silenceSegments.push({
        start: this.silenceStartTime,
        end: now,
      });
      this.silenceStartTime = null;
    }

    // Reset current speech segment
    this.currentSpeechSegment = [audio];

    onVADEvent({
      type: 'speech_start',
      timestamp: now,
      data: {
        audio,
        duration: audio.length / VAD_CONFIG.SAMPLE_RATE,
        confidence: 1.0, // VAD model already filtered for confidence
        isSpeaking: true,
      }
    });
  }

  /**
   * Handle speech end event
   */
  private handleSpeechEnd(audio: Float32Array, onVADEvent: (event: VADEvent) => void): void {
    const now = Date.now();
    
    if (this.speechStartTime) {
      // Add to current speech segment
      this.currentSpeechSegment.push(audio);
      
      // Combine all audio chunks for this speech segment
      const totalLength = this.currentSpeechSegment.reduce((sum, chunk) => sum + chunk.length, 0);
      const combinedAudio = new Float32Array(totalLength);
      let offset = 0;
      
      this.currentSpeechSegment.forEach(chunk => {
        combinedAudio.set(chunk, offset);
        offset += chunk.length;
      });

      // Record speech segment for analysis
      this.analysisData.speechSegments.push({
        start: this.speechStartTime,
        end: now,
        confidence: 1.0,
      });

      this.speechStartTime = null;
      this.silenceStartTime = now;

      onVADEvent({
        type: 'speech_end',
        timestamp: now,
        data: {
          audio: combinedAudio,
          duration: combinedAudio.length / VAD_CONFIG.SAMPLE_RATE,
          confidence: 1.0,
          isSpeaking: false,
        }
      });
    }
  }

  /**
   * Reset analysis data
   */
  private resetAnalysisData(): void {
    this.analysisData = {
      speechSegments: [],
      silenceSegments: [],
      confidenceScores: [],
    };
    this.speechStartTime = null;
    this.silenceStartTime = null;
    this.currentSpeechSegment = [];
  }

  /**
   * Calculate analysis from collected data
   */
  private calculateAnalysis(): VADAnalysis {
    const totalSpeechTime = this.analysisData.speechSegments.reduce(
      (sum, segment) => sum + (segment.end - segment.start), 0
    ) / 1000; // Convert to seconds

    const totalSilenceTime = this.analysisData.silenceSegments.reduce(
      (sum, segment) => sum + (segment.end - segment.start), 0
    ) / 1000; // Convert to seconds

    const speechSegments = this.analysisData.speechSegments.length;
    const averageSegmentLength = speechSegments > 0 ? totalSpeechTime / speechSegments : 0;
    const totalTime = totalSpeechTime + totalSilenceTime;
    const speechRatio = totalTime > 0 ? totalSpeechTime / totalTime : 0;

    return {
      totalSpeechTime,
      totalSilenceTime,
      speechSegments,
      averageSegmentLength,
      speechRatio,
      confidenceScores: this.analysisData.confidenceScores,
      responseLatency: this.calculateResponseLatency(),
    };
  }

  /**
   * Calculate response latency (time to start speaking)
   */
  private calculateResponseLatency(): number {
    if (this.analysisData.speechSegments.length === 0) return 0;
    
    const firstSpeechSegment = this.analysisData.speechSegments[0];
    return firstSpeechSegment.start; // Time from start of recording to first speech
  }

  /**
   * Get current VAD status
   */
  getStatus(): { isListening: boolean; isSpeaking: boolean } {
    return {
      isListening: this.isListening,
      isSpeaking: this.speechStartTime !== null,
    };
  }

  /**
   * Check if VAD is supported in current environment
   */
  static isSupported(): boolean {
    return typeof window !== 'undefined' && 
           typeof navigator !== 'undefined' && 
           typeof navigator.mediaDevices !== 'undefined' &&
           typeof navigator.mediaDevices.getUserMedia === 'function';
  }
}

// Export singleton instance
export const vadService = new VoiceActivityService();
