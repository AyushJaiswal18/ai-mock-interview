import { NextRequest, NextResponse } from 'next/server';
import { withDB } from '@/lib/db-utils';
import { Interview } from '@/lib/models/interview';
import { requireAuth, AuthenticatedRequest } from '@/lib/auth-middleware';
import { voiceService } from '@/lib/voice-service';
import '@/lib/env-config';

// Start voice interview session
export const POST = requireAuth(async (request: AuthenticatedRequest) => {
  return withDB(async () => {
    try {
      const user = request.user;
      const interviewId = request.url.split('/interviews/')[1].split('/voice')[0];
      const body = await request.json();

      const {
        voiceId = 'RACHEL',
        speakingStyle = 'warm',
        enableVoiceAnalysis = true,
        language = 'en'
      } = body;

      if (!interviewId) {
        return NextResponse.json(
          { error: 'Interview ID is required' },
          { status: 400 }
        );
      }

      // Find the interview
      const interview = await Interview.findById(interviewId);
      if (!interview) {
        return NextResponse.json(
          { error: 'Interview not found' },
          { status: 404 }
        );
      }

      // Check access permissions
      if (user!.role === 'candidate' && interview.candidateId.toString() !== user!.id) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }

      if (user!.role === 'recruiter' && interview.recruiterId && interview.recruiterId.toString() !== user!.id) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }

      // Check if interview can be started
      if (interview.status !== 'scheduled' && interview.status !== 'in-progress') {
        return NextResponse.json(
          { error: 'Interview cannot be started in current state' },
          { status: 400 }
        );
      }

      // Update voice personality
      voiceService.updatePersonality({
        voiceId: voiceId as any,
        speakingStyle: speakingStyle as any,
        useNaturalFillers: true,
        adaptToCandidate: true,
        encouragementLevel: 'medium',
        empathyLevel: 0.7,
      });

      // Update interview status and voice configuration
      interview.status = 'in-progress';
      interview.config = {
        ...interview.config,
        voiceEnabled: true,
        voiceConfig: {
          voiceId,
          speakingStyle,
          enableVoiceAnalysis,
          language,
          naturalConversation: true,
          realTimeTranscription: true,
        }
      };

      // Initialize voice session metadata
      const voiceSessionData = {
        sessionId: `voice_${Date.now()}`,
        startedAt: new Date(),
        voiceSettings: {
          voiceId,
          speakingStyle,
          enableVoiceAnalysis,
          language,
        },
        conversationContext: {
          previousQuestions: [],
          candidateResponses: [],
          currentTopic: 'introduction',
          difficultyLevel: interview.config.difficulty || 'medium',
          candidateEnergy: 'medium',
          needsEncouragement: false,
          conversationPhase: 'opening',
        }
      };

      console.log('Before setting voiceSession:', {
        existingMetadata: interview.metadata,
        voiceSessionData
      });

      interview.metadata = {
        ...interview.metadata,
        voiceSession: voiceSessionData
      };

      console.log('After setting voiceSession, before save:', {
        hasVoiceSession: !!interview.metadata.voiceSession,
        voiceSessionKeys: interview.metadata.voiceSession ? Object.keys(interview.metadata.voiceSession) : []
      });

      try {
        await interview.save();
        console.log('Save completed successfully');
      } catch (saveError) {
        console.error('Save error:', saveError);
        throw saveError;
      }

      // Reload interview from database to verify save
      const reloadedInterview = await Interview.findById(interview._id).lean();
      console.log('Interview after reload from DB:', {
        hasMetadata: !!reloadedInterview?.metadata,
        hasVoiceSession: !!reloadedInterview?.metadata?.voiceSession,
        metadataKeys: reloadedInterview?.metadata ? Object.keys(reloadedInterview.metadata) : [],
        voiceSessionKeys: reloadedInterview?.metadata?.voiceSession ? Object.keys(reloadedInterview.metadata.voiceSession) : []
      });

      // Generate opening greeting with AI personality
      const openingText = generateOpeningGreeting(interview);
      
      // Debug: Check voiceSession structure
      console.log('Interview metadata after save:', {
        hasMetadata: !!interview.metadata,
        hasVoiceSession: !!interview.metadata?.voiceSession,
        hasConversationContext: !!interview.metadata?.voiceSession?.conversationContext,
        metadataKeys: interview.metadata ? Object.keys(interview.metadata) : [],
        voiceSessionKeys: interview.metadata?.voiceSession ? Object.keys(interview.metadata.voiceSession) : []
      });
      
      // Ensure voiceSession exists before accessing conversationContext
      if (!interview.metadata?.voiceSession?.conversationContext) {
        throw new Error('Voice session context not properly initialized');
      }
      
      const greetingAudio = await voiceService.generateSpeech(
        openingText,
        interview.metadata.voiceSession.conversationContext
      );

      return NextResponse.json({
        success: true,
        data: {
          sessionId: interview.metadata.voiceSession.sessionId,
          voiceConfig: interview.config.voiceConfig,
          availableVoices: voiceService.getAvailableVoices(),
          openingGreeting: {
            text: openingText,
            audio: greetingAudio.toString('base64'),
            audioFormat: 'mp3',
          },
          conversationContext: interview.metadata.voiceSession.conversationContext,
        },
        message: 'Voice interview session started successfully',
      });
    } catch (error) {
      console.error('Error starting voice interview:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  });

  /**
   * Generate personalized opening greeting
   */
  function generateOpeningGreeting(interview: any): string {
    const candidateName = interview.candidateId?.firstName || 'there';
    const interviewType = interview.type;
    const position = interview.config?.jobRequirement?.position || 'position';
    
    const greetings = [
      `Hi ${candidateName}! I'm excited to chat with you today about the ${position} role. This is going to be a great conversation, so please feel comfortable and be yourself. Are you ready to get started?`,
      
      `Hello ${candidateName}! Welcome to your interview session. I'm looking forward to learning more about your background and experience. We'll have a natural conversation, so just speak naturally and take your time with your responses. Shall we begin?`,
      
      `Hi there, ${candidateName}! Thanks for joining me today. I'm here to have a friendly conversation about your experience and the ${position} opportunity. Feel free to speak naturally - I'm here to listen and learn about you. Ready to dive in?`
    ];

    if (interviewType === 'ai-driven') {
      return greetings[0]; // More personalized for AI-driven interviews
    }
    
    return greetings[Math.floor(Math.random() * greetings.length)];
  }
});
