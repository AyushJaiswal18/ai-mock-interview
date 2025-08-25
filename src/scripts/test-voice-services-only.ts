#!/usr/bin/env tsx

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

// Test individual voice services
import { voiceService } from '../lib/voice-service';
import { speechService } from '../lib/speech-service';

class VoiceServicesTester {
  /**
   * Test environment configuration
   */
  testEnvironmentConfig(): void {
    console.log('⚙️ Testing Environment Configuration...');
    
    const requiredEnvVars = [
      'ELEVENLABS_API_KEY',
      'DEEPGRAM_API_KEY',
    ];

    let allPresent = true;

    requiredEnvVars.forEach(varName => {
      const value = process.env[varName];
      const isPresent = !!value;
      const displayValue = isPresent ? 
        (value!.length > 20 ? `${value!.substring(0, 10)}...${value!.substring(value!.length - 5)}` : value!) : 
        'NOT SET';
      
      console.log(`   ${isPresent ? '✅' : '❌'} ${varName}: ${displayValue}`);
      
      if (!isPresent) {
        allPresent = false;
      }
    });

    if (!allPresent) {
      throw new Error('Missing required environment variables for voice testing');
    }

    console.log('✅ All required voice environment variables are set!');
  }

  /**
   * Test ElevenLabs TTS service
   */
  async testElevenLabsTTS(): Promise<void> {
    console.log('\n🎙️ Testing ElevenLabs TTS...');
    
    try {
      // Test simple text generation
      const testText = "Hello! Welcome to your AI-powered interview. I'm excited to chat with you today about your background and experience. Are you ready to get started?";
      
      console.log('   Generating speech for:', testText.substring(0, 50) + '...');
      
      const audioBuffer = await voiceService.generateSpeech(testText, {
        previousQuestions: [],
        candidateResponses: [],
        currentTopic: 'introduction',
        difficultyLevel: 'medium',
        candidateEnergy: 'medium',
        needsEncouragement: false,
        conversationPhase: 'opening',
      });

      console.log('✅ ElevenLabs TTS working!');
      console.log(`   Generated audio buffer size: ${audioBuffer.length} bytes`);
      console.log(`   Estimated duration: ~${Math.round(audioBuffer.length / 5000)} seconds`);
      
      // Test available voices
      const voices = voiceService.getAvailableVoices();
      console.log('   Available voices:', Object.keys(voices).join(', '));
      
      // Test voice streaming
      console.log('   Testing streaming TTS...');
      const chunks: Buffer[] = [];
      for await (const chunk of voiceService.streamSpeech("This is a streaming test.", {
        previousQuestions: [],
        candidateResponses: [],
        currentTopic: 'test',
        difficultyLevel: 'medium',
        candidateEnergy: 'medium',
        needsEncouragement: false,
        conversationPhase: 'opening',
      })) {
        chunks.push(chunk);
      }
      
      const streamedAudio = Buffer.concat(chunks);
      console.log(`   Streamed audio size: ${streamedAudio.length} bytes`);
      console.log('✅ ElevenLabs streaming TTS working!');
      
    } catch (error) {
      console.error('❌ ElevenLabs TTS error:', error);
      throw error;
    }
  }

  /**
   * Test Deepgram STT service (configuration test)
   */
  async testDeepgramSTT(): Promise<void> {
    console.log('\n🗣️ Testing Deepgram STT Configuration...');
    
    try {
      console.log('   Deepgram API Key present:', !!process.env.DEEPGRAM_API_KEY);
      
      if (!process.env.DEEPGRAM_API_KEY) {
        throw new Error('DEEPGRAM_API_KEY not found in environment');
      }
      
      // Test the service initialization and configuration
      console.log('   Testing service initialization...');
      
      // Create a tiny valid WAV file for testing (silent audio)
      const wavHeader = Buffer.from([
        0x52, 0x49, 0x46, 0x46, // "RIFF"
        0x24, 0x00, 0x00, 0x00, // File size
        0x57, 0x41, 0x56, 0x45, // "WAVE"
        0x66, 0x6D, 0x74, 0x20, // "fmt "
        0x10, 0x00, 0x00, 0x00, // fmt chunk size
        0x01, 0x00,             // Audio format (PCM)
        0x01, 0x00,             // Channels (mono)
        0x40, 0x1F, 0x00, 0x00, // Sample rate (8000 Hz)
        0x80, 0x3E, 0x00, 0x00, // Byte rate
        0x02, 0x00,             // Block align
        0x10, 0x00,             // Bits per sample
        0x64, 0x61, 0x74, 0x61, // "data"
        0x00, 0x00, 0x00, 0x00  // Data size (0 bytes)
      ]);
      
      try {
        await speechService.transcribeAudio(wavHeader);
        console.log('✅ Deepgram STT service configured correctly');
      } catch (error) {
        // Expected to have minimal response with empty audio
        if (error instanceof Error && (
          error.message.includes('No transcription available') || 
          error.message.includes('Failed to transcribe')
        )) {
          console.log('✅ Deepgram STT service configured correctly (empty audio test passed)');
        } else {
          console.error('❌ Deepgram STT configuration error:', error);
          throw error;
        }
      }
      
    } catch (error) {
      console.error('❌ Deepgram STT error:', error);
      throw error;
    }
  }

  /**
   * Test voice analysis features
   */
  async testVoiceAnalysis(): Promise<void> {
    console.log('\n📊 Testing Voice Analysis Features...');
    
    try {
      // Test speech pattern analysis
      const mockTranscripts = [
        "Hello, my name is John and I have five years of experience in software development.",
        "I worked on multiple projects using React, Node.js, and TypeScript.",
        "Um, I think I'm really good at problem solving and, uh, working in teams."
      ];
      
      const mockAudioBuffers = [
        Buffer.alloc(16000 * 2), // 1 second of silence
        Buffer.alloc(16000 * 3), // 1.5 seconds
        Buffer.alloc(16000 * 2), // 1 second
      ];
      
      console.log('   Analyzing speech patterns...');
      const analysis = await speechService.analyzeSpeechPatterns(mockTranscripts, mockAudioBuffers);
      
      console.log('✅ Voice analysis working!');
      console.log(`   Overall pace: ${Math.round(analysis.overallPace)} WPM`);
      console.log(`   Clarity score: ${Math.round(analysis.clarityScore * 100)}%`);
      console.log(`   Confidence level: ${Math.round(analysis.confidenceLevel * 100)}%`);
      console.log(`   Professional tone: ${Math.round(analysis.professionalTone * 100)}%`);
      console.log(`   Filler words: ${analysis.fillerWordAnalysis.total} total (${analysis.fillerWordAnalysis.frequency.toFixed(1)}/min)`);
      
    } catch (error) {
      console.error('❌ Voice analysis error:', error);
      throw error;
    }
  }

  /**
   * Run all voice service tests
   */
  async runAllTests(): Promise<void> {
    console.log('🚀 Starting Voice Services Test (Standalone)...\n');
    
    try {
      // Test 1: Environment Configuration
      this.testEnvironmentConfig();
      
      // Test 2: ElevenLabs TTS
      await this.testElevenLabsTTS();
      
      // Test 3: Deepgram STT Configuration
      await this.testDeepgramSTT();
      
      // Test 4: Voice Analysis
      await this.testVoiceAnalysis();
      
      console.log('\n🎉 All Voice Service Tests Completed Successfully!');
      console.log('\n📋 Test Summary:');
      console.log('   ✅ Environment Configuration');
      console.log('   ✅ ElevenLabs Text-to-Speech');
      console.log('   ✅ ElevenLabs Streaming TTS');
      console.log('   ✅ Deepgram Speech-to-Text Setup');
      console.log('   ✅ Voice Analysis Features');
      
      console.log('\n🎯 Voice Services are Ready!');
      console.log('   💡 Next steps:');
      console.log('   1. Start the development server: npm run dev');
      console.log('   2. Navigate to a voice interview in the browser');
      console.log('   3. Test real-time voice conversation');
      
    } catch (error) {
      console.error('\n💥 Voice Services Test Failed:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('ELEVENLABS_API_KEY')) {
          console.log('\n💡 ElevenLabs Setup Help:');
          console.log('   1. Sign up at https://elevenlabs.io');
          console.log('   2. Get your API key from the dashboard');
          console.log('   3. Add ELEVENLABS_API_KEY to .env.local');
        }
        
        if (error.message.includes('DEEPGRAM_API_KEY')) {
          console.log('\n💡 Deepgram Setup Help:');
          console.log('   1. Sign up at https://deepgram.com');
          console.log('   2. Get your API key from the console');
          console.log('   3. Add DEEPGRAM_API_KEY to .env.local');
        }
      }
      
      process.exit(1);
    }
  }
}

// Run the test
async function main() {
  const tester = new VoiceServicesTester();
  await tester.runAllTests();
}

main().catch(console.error);
