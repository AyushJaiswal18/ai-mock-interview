import { ElevenLabsClient, play } from '@elevenlabs/elevenlabs-js';
import '@/lib/env-config';

// Premium voice configuration
export const VOICE_CONFIG = {
  // ElevenLabs Professional Voices
  VOICES: {
    RACHEL: "21m00Tcm4TlvDq8ikWAM", // Professional, warm female
    JOSH: "TxGEqnHWrfWFTfGW9XjX",  // Professional, confident male
    BRIAN: "nPczCjzI2devNBz1zQrb", // Mature, authoritative male
  },
  
  // Voice Settings for Human-like Speech
  SETTINGS: {
    STABILITY: 0.75,     // Balance between consistency and expressiveness
    SIMILARITY: 0.85,    // How closely to match the original voice
    STYLE: 0.25,         // Amount of style to apply
    USE_SPEAKER_BOOST: true, // Enhance speaker characteristics
  },
  
  // Conversation Parameters
  PERSONALITY: {
    SPEAKING_RATE: 0.95,     // Slightly slower than normal (more professional)
    PAUSE_DURATION: 0.8,     // Natural pauses between sentences
    EMPHASIS_STRENGTH: 0.3,  // Subtle emphasis on key words
    WARMTH_LEVEL: 0.7,       // Professional warmth (0-1)
  },
  
  // Audio Quality
  OUTPUT_FORMAT: "mp3_44100_128" as const,
  CHUNK_SIZE: 1024,
  LATENCY_OPTIMIZATION: true,
} as const;

// AI Interviewer Personality Traits
export interface AIPersonality {
  voiceId: keyof typeof VOICE_CONFIG.VOICES;
  speakingStyle: 'professional' | 'warm' | 'encouraging';
  useNaturalFillers: boolean;
  adaptToCandidate: boolean;
  encouragementLevel: 'high' | 'medium' | 'low';
  empathyLevel: number; // 0-1
}

// Voice analysis results
export interface VoiceAnalysis {
  confidence: number;           // 0-100
  clarity: number;             // 0-100
  pace: number;                // Words per minute
  volume: number;              // Average volume level
  emotion: string;             // Detected primary emotion
  professionalTone: number;    // How professional the tone sounds
  fillerWords: number;         // Count of um, uh, like, etc.
  pausePattern: 'natural' | 'rushed' | 'hesitant';
}

// Conversation context for maintaining natural flow
export interface ConversationContext {
  previousQuestions: string[];
  candidateResponses: string[];
  currentTopic: string;
  difficultyLevel: 'easy' | 'medium' | 'hard';
  candidateEnergy: 'high' | 'medium' | 'low';
  needsEncouragement: boolean;
  conversationPhase: 'opening' | 'technical' | 'behavioral' | 'closing';
}

export class PremiumVoiceService {
  private client: ElevenLabsClient;
  private currentPersonality: AIPersonality;

  constructor() {
    // ElevenLabsClient automatically uses ELEVENLABS_API_KEY from environment
    this.client = new ElevenLabsClient();
    
    // Default professional interviewer personality
    this.currentPersonality = {
      voiceId: 'RACHEL',
      speakingStyle: 'warm',
      useNaturalFillers: true,
      adaptToCandidate: true,
      encouragementLevel: 'medium',
      empathyLevel: 0.7,
    };
  }

  /**
   * Generate ultra-realistic speech with personality
   */
  async generateSpeech(
    text: string,
    context?: ConversationContext,
    personality?: Partial<AIPersonality>
  ): Promise<Buffer> {
    try {
      // Merge personality overrides
      const currentPersonality = { ...this.currentPersonality, ...personality };
      
      // Add natural conversation elements
      const enhancedText = this.enhanceTextForNaturalSpeech(text, context, currentPersonality);
      
      // Generate speech with ElevenLabs using the correct API structure
      const audioResponse = await this.client.textToSpeech.convert(
        VOICE_CONFIG.VOICES[currentPersonality.voiceId], 
        {
          text: enhancedText,
          modelId: "eleven_turbo_v2",
          outputFormat: "mp3_44100_128",
        }
      );

      // Convert response to buffer
      if (audioResponse instanceof Buffer) {
        return audioResponse;
      } else if (audioResponse instanceof ArrayBuffer) {
        return Buffer.from(audioResponse);
      } else {
        // Handle stream response
        const chunks: Buffer[] = [];
        const reader = audioResponse.getReader();
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(Buffer.from(value));
        }
        
        return Buffer.concat(chunks);
      }
    } catch (error) {
      console.error('Error generating speech:', error);
      throw new Error('Failed to generate speech');
    }
  }

  /**
   * Stream speech generation for real-time conversation
   */
  async *streamSpeech(
    text: string,
    context?: ConversationContext,
    personality?: Partial<AIPersonality>
  ): AsyncIterableIterator<Buffer> {
    try {
      const currentPersonality = { ...this.currentPersonality, ...personality };
      const enhancedText = this.enhanceTextForNaturalSpeech(text, context, currentPersonality);
      
      // Use stream method for real-time generation
      const audioStream = await this.client.textToSpeech.stream(
        VOICE_CONFIG.VOICES[currentPersonality.voiceId],
        {
          text: enhancedText,
          modelId: "eleven_turbo_v2",
          outputFormat: "mp3_44100_128",
        }
      );

      for await (const chunk of audioStream) {
        yield Buffer.from(chunk);
      }
    } catch (error) {
      console.error('Error streaming speech:', error);
      throw new Error('Failed to stream speech');
    }
  }

  /**
   * Enhance text with natural conversation elements
   */
  private enhanceTextForNaturalSpeech(
    text: string,
    context?: ConversationContext,
    personality?: AIPersonality
  ): string {
    let enhancedText = text;

    if (!personality?.useNaturalFillers) {
      return enhancedText;
    }

    // Add natural thinking pauses for complex questions
    if (text.includes('technical') || text.includes('complex') || text.includes('challenging')) {
      enhancedText = `Hmm, ${enhancedText}`;
    }

    // Add empathetic responses based on context
    if (context?.needsEncouragement && personality?.empathyLevel && personality.empathyLevel > 0.5) {
      const encouragements = [
        "That's a great question, and ",
        "I appreciate your thoughtfulness. ",
        "You're doing really well. ",
      ];
      const encouragement = encouragements[Math.floor(Math.random() * encouragements.length)];
      enhancedText = encouragement + enhancedText.toLowerCase();
    }

    // Add conversation bridges based on phase
    if (context?.conversationPhase) {
      enhancedText = this.addConversationBridges(enhancedText, context.conversationPhase);
    }

    // Add natural pauses with SSML-like markers (ElevenLabs processes these)
    enhancedText = enhancedText.replace(/\. /g, '. <break time="0.7s"/> ');
    enhancedText = enhancedText.replace(/\? /g, '? <break time="0.5s"/> ');
    enhancedText = enhancedText.replace(/\, /g, ', <break time="0.3s"/> ');

    return enhancedText;
  }

  /**
   * Add natural conversation bridges between topics
   */
  private addConversationBridges(text: string, phase: ConversationContext['conversationPhase']): string {
    const bridges = {
      opening: [
        "Let's start with ",
        "I'd love to begin by asking about ",
        "To kick things off, ",
      ],
      technical: [
        "Now, let's dive into something more technical. ",
        "Building on that, I'm curious about ",
        "That's interesting. Let's explore ",
      ],
      behavioral: [
        "Shifting gears a bit, ",
        "I'd like to understand more about how you approach ",
        "Let's talk about your experience with ",
      ],
      closing: [
        "As we wrap up, ",
        "Finally, I'd like to ask ",
        "Before we finish, ",
      ],
    };

    const phaseBridges = bridges[phase];
    if (phaseBridges && Math.random() > 0.3) { // 70% chance to add bridge
      const bridge = phaseBridges[Math.floor(Math.random() * phaseBridges.length)];
      return bridge + text.toLowerCase();
    }

    return text;
  }

  /**
   * Analyze candidate's voice characteristics
   */
  async analyzeVoice(audioBuffer: Buffer): Promise<VoiceAnalysis> {
    // This would integrate with a voice analysis service
    // For now, return mock analysis - will implement with actual service
    return {
      confidence: 75,
      clarity: 88,
      pace: 145, // WPM
      volume: 0.7,
      emotion: 'focused',
      professionalTone: 82,
      fillerWords: 3,
      pausePattern: 'natural',
    };
  }

  /**
   * Update AI personality based on conversation progress
   */
  updatePersonality(updates: Partial<AIPersonality>): void {
    this.currentPersonality = { ...this.currentPersonality, ...updates };
  }

  /**
   * Get available voices with descriptions
   */
  getAvailableVoices() {
    return {
      RACHEL: {
        id: VOICE_CONFIG.VOICES.RACHEL,
        name: "Rachel",
        description: "Professional, warm, encouraging female voice. Perfect for supportive interviews.",
        gender: "female",
        accent: "American",
        suitability: "All interview types",
      },
      JOSH: {
        id: VOICE_CONFIG.VOICES.JOSH,
        name: "Josh",
        description: "Confident, clear, professional male voice. Great for technical interviews.",
        gender: "male",
        accent: "American",
        suitability: "Technical, leadership interviews",
      },
      BRIAN: {
        id: VOICE_CONFIG.VOICES.BRIAN,
        name: "Brian",
        description: "Mature, authoritative, wise male voice. Ideal for senior-level interviews.",
        gender: "male",
        accent: "American",
        suitability: "Executive, senior-level interviews",
      },
    };
  }
}

// Export singleton instance
export const voiceService = new PremiumVoiceService();
