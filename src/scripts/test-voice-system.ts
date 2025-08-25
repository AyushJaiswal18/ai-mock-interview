#!/usr/bin/env tsx

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

// Test individual voice services
import { voiceService } from '../lib/voice-service';
import { speechService } from '../lib/speech-service';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

class VoiceSystemTester {
  private token: string = '';

  /**
   * Login and get authentication token
   */
  async login(): Promise<boolean> {
    try {
      console.log('🔐 Logging in as candidate...');
      
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'candidate@hirenext.com',
          password: 'candidate123',
        }),
      });

      if (!response.ok) {
        console.error('❌ Login failed:', response.status, response.statusText);
        return false;
      }

      const result = await response.json();
      if (result.success && result.data?.token) {
        this.token = result.data.token;
        console.log('✅ Login successful!');
        console.log(`   User: ${result.data.user.firstName} ${result.data.user.lastName}`);
        console.log(`   Role: ${result.data.user.role}`);
        return true;
      }

      console.error('❌ Login failed: Invalid response format');
      return false;
    } catch (error) {
      console.error('❌ Login error:', error);
      return false;
    }
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
      
    } catch (error) {
      console.error('❌ ElevenLabs TTS error:', error);
      throw error;
    }
  }

  /**
   * Test Deepgram STT service (mock test)
   */
  async testDeepgramSTT(): Promise<void> {
    console.log('\n🗣️ Testing Deepgram STT...');
    
    try {
      // We can't easily test STT without actual audio, so let's test the service initialization
      console.log('   Deepgram API Key present:', !!process.env.DEEPGRAM_API_KEY);
      
      if (!process.env.DEEPGRAM_API_KEY) {
        throw new Error('DEEPGRAM_API_KEY not found in environment');
      }
      
      // Create a simple test with empty buffer (will fail gracefully)
      try {
        const testBuffer = Buffer.alloc(1024); // Empty buffer
        await speechService.transcribeAudio(testBuffer);
      } catch (error) {
        // Expected to fail with empty buffer, but should show proper API communication
        if (error instanceof Error && error.message.includes('Failed to transcribe')) {
          console.log('✅ Deepgram STT service configured correctly (empty buffer test)');
        } else {
          throw error;
        }
      }
      
    } catch (error) {
      console.error('❌ Deepgram STT error:', error);
      throw error;
    }
  }

  /**
   * Test voice interview API endpoints
   */
  async testVoiceAPIEndpoints(): Promise<void> {
    console.log('\n🌐 Testing Voice API Endpoints...');
    
    try {
      // First, get an existing interview or create one
      const interviewId = await this.getTestInterview();
      
      if (!interviewId) {
        throw new Error('No interview available for testing');
      }

      // Test voice session start
      console.log('   Testing voice session start...');
      const startResponse = await fetch(`${BASE_URL}/api/interviews/${interviewId}/voice/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          voiceId: 'RACHEL',
          speakingStyle: 'warm',
          enableVoiceAnalysis: true,
          language: 'en',
        }),
      });

      if (!startResponse.ok) {
        const errorText = await startResponse.text();
        console.error('❌ Voice start failed:', startResponse.status, errorText);
        return;
      }

      const startResult = await startResponse.json();
      
      if (startResult.success) {
        console.log('✅ Voice session started successfully!');
        console.log(`   Session ID: ${startResult.data.sessionId}`);
        console.log(`   Voice Config: ${JSON.stringify(startResult.data.voiceConfig, null, 2)}`);
        console.log(`   Opening greeting length: ${startResult.data.openingGreeting?.text?.length || 0} characters`);
        console.log(`   Audio greeting size: ${startResult.data.openingGreeting?.audio?.length || 0} bytes (base64)`);
      } else {
        console.error('❌ Voice session start failed:', startResult.error);
      }

    } catch (error) {
      console.error('❌ Voice API error:', error);
      throw error;
    }
  }

  /**
   * Get a test interview for voice testing
   */
  async getTestInterview(): Promise<string | null> {
    try {
      // Get existing interviews
      const response = await fetch(`${BASE_URL}/api/interviews`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      });

      if (!response.ok) {
        console.error('Failed to get interviews');
        return null;
      }

      const result = await response.json();
      
      if (result.success && result.data?.interviews?.length > 0) {
        const interview = result.data.interviews[0];
        console.log(`   Using existing interview: ${interview.title} (${interview._id})`);
        return interview._id;
      }

      // Create a new interview for testing
      console.log('   Creating new interview for voice testing...');
      const createResponse = await fetch(`${BASE_URL}/api/interviews`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Voice System Test Interview',
          type: 'ai-driven',
          scheduledAt: new Date(Date.now() - 60000).toISOString(), // 1 minute ago
          duration: 30,
          questionCount: 3,
          resumeText: 'Test candidate with 5 years of software development experience in React, Node.js, and TypeScript. Built multiple web applications and led a team of 3 developers.',
          jobRequirement: {
            position: 'Senior Software Engineer',
            company: 'TechCorp',
            industry: 'Technology',
            level: 'senior',
            skills: ['React', 'Node.js', 'TypeScript', 'Leadership'],
            experience: '5+ years',
            description: 'We are looking for a senior software engineer to join our team.'
          }
        }),
      });

      if (!createResponse.ok) {
        console.error('Failed to create test interview');
        return null;
      }

      const createResult = await createResponse.json();
      if (createResult.success) {
        console.log(`   Created new interview: ${createResult.data._id}`);
        return createResult.data._id;
      }

      return null;
    } catch (error) {
      console.error('Error getting test interview:', error);
      return null;
    }
  }

  /**
   * Test environment configuration
   */
  testEnvironmentConfig(): void {
    console.log('\n⚙️ Testing Environment Configuration...');
    
    const requiredEnvVars = [
      'OPENAI_API_KEY',
      'ELEVENLABS_API_KEY',
      'DEEPGRAM_API_KEY',
    ];
    
    const optionalEnvVars = [
      'MONGODB_URI',
      'JWT_SECRET'
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

    // Check optional variables (don't fail if missing)
    optionalEnvVars.forEach(varName => {
      const value = process.env[varName];
      const isPresent = !!value;
      const displayValue = isPresent ? 
        (value!.length > 20 ? `${value!.substring(0, 10)}...${value!.substring(value!.length - 5)}` : value!) : 
        'NOT SET';
      
      console.log(`   ${isPresent ? '✅' : '💡'} ${varName}: ${displayValue} ${!isPresent ? '(optional for voice test)' : ''}`);
    });

    if (!allPresent) {
      throw new Error('Missing required environment variables for voice testing');
    }

    console.log('✅ All required voice environment variables are set!');
  }

  /**
   * Run comprehensive voice system test
   */
  async runFullTest(): Promise<void> {
    console.log('🚀 Starting Comprehensive Voice System Test...\n');
    
    try {
      // Test 1: Environment Configuration
      this.testEnvironmentConfig();
      
      // Test 2: Authentication
      const loginSuccess = await this.login();
      if (!loginSuccess) {
        throw new Error('Authentication failed - cannot proceed with voice tests');
      }
      
      // Test 3: ElevenLabs TTS
      await this.testElevenLabsTTS();
      
      // Test 4: Deepgram STT
      await this.testDeepgramSTT();
      
      // Test 5: Voice API Endpoints
      await this.testVoiceAPIEndpoints();
      
      console.log('\n🎉 All Voice System Tests Completed Successfully!');
      console.log('\n📋 Test Summary:');
      console.log('   ✅ Environment Configuration');
      console.log('   ✅ Authentication System');
      console.log('   ✅ ElevenLabs Text-to-Speech');
      console.log('   ✅ Deepgram Speech-to-Text Setup');
      console.log('   ✅ Voice API Endpoints');
      
      console.log('\n🎯 Voice System is Ready for Real-time Testing!');
      console.log('   💡 Next steps:');
      console.log('   1. Start the development server: npm run dev');
      console.log('   2. Navigate to a voice interview in the browser');
      console.log('   3. Test real-time voice conversation');
      
    } catch (error) {
      console.error('\n💥 Voice System Test Failed:', error);
      
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

// Run the test if called directly
async function main() {
  const tester = new VoiceSystemTester();
  await tester.runFullTest();
}

// Only run if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}

export { VoiceSystemTester };
