import { NextRequest, NextResponse } from 'next/server';
import { withDB } from '@/lib/db-utils';
import { Interview } from '@/lib/models/interview';
import { verifyToken } from '@/lib/jwt';
import { aiService } from '@/lib/ai-service';
import { voiceService } from '@/lib/voice-service';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withDB(async () => {
    try {
      // Verify authentication
      const authHeader = request.headers.get('authorization');
      if (!authHeader?.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      if (!decoded) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      }

      const { id: interviewId } = params;
      const { transcript, timestamp } = await request.json();

      if (!transcript) {
        return NextResponse.json({ error: 'Transcript is required' }, { status: 400 });
      }

      // Load interview
      const interview = await Interview.findById(interviewId);
      if (!interview) {
        return NextResponse.json({ error: 'Interview not found' }, { status: 404 });
      }

      // Verify user owns this interview
      if (interview.candidateId.toString() !== decoded.userId) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }

      // Analyze the transcript with simple analysis
      const responseAnalysis = {
        score: 75,
        strengths: ['Good communication', 'Clear response'],
        areas_for_improvement: ['Could provide more specific examples'],
        professional_tone: 0.8,
        clarity: 0.8,
        relevance: 0.8,
        confidence: 0.8,
      };

      const analysis = responseAnalysis;

      // Get conversation context
      const conversationContext = interview.metadata?.voiceSession?.conversationContext || {
        previousQuestions: [],
        candidateResponses: [],
        currentTopic: 'introduction',
        difficultyLevel: 'medium',
        candidateEnergy: 'medium',
        needsEncouragement: false,
        conversationPhase: 'opening',
      };

      // Update conversation context
      conversationContext.candidateResponses.push({
        question: conversationContext.currentTopic,
        response: transcript,
        timestamp,
        analysis,
      });

      // Determine if candidate needs encouragement
      if (analysis.score < 60) {
        conversationContext.needsEncouragement = true;
      } else if (analysis.score > 80) {
        conversationContext.needsEncouragement = false;
      }

      // Progress conversation phase
      const responseCount = conversationContext.candidateResponses.length;
      if (responseCount === 1) {
        conversationContext.conversationPhase = 'introduction';
        conversationContext.currentTopic = 'background';
      } else if (responseCount === 2) {
        conversationContext.conversationPhase = 'background';
        conversationContext.currentTopic = 'experience';
      } else if (responseCount === 3) {
        conversationContext.conversationPhase = 'experience';
        conversationContext.currentTopic = 'skills';
      } else if (responseCount === 4) {
        conversationContext.conversationPhase = 'skills';
        conversationContext.currentTopic = 'challenges';
      } else if (responseCount === 5) {
        conversationContext.conversationPhase = 'challenges';
        conversationContext.currentTopic = 'goals';
      } else if (responseCount >= 6) {
        conversationContext.conversationPhase = 'closing';
        conversationContext.currentTopic = 'wrap_up';
      }

      // Generate AI response for natural conversation
      const aiResponse = `Thank you for sharing that! That's really interesting. ${conversationContext.currentTopic === 'background' ? 'Can you tell me more about your experience in that area?' : conversationContext.currentTopic === 'experience' ? 'What was the most challenging part of that experience?' : conversationContext.currentTopic === 'skills' ? 'How do you think those skills would apply to this role?' : conversationContext.currentTopic === 'challenges' ? 'How did you overcome that challenge?' : conversationContext.currentTopic === 'goals' ? 'That sounds like a great goal. What steps are you taking to achieve it?' : 'Thank you for your time today. Is there anything else you\'d like to share?'}`;

      // Generate speech for AI response
      const responseAudio = await voiceService.generateSpeech(
        aiResponse,
        conversationContext,
        {
          empathyLevel: conversationContext.needsEncouragement ? 0.9 : 0.7,
          encouragementLevel: conversationContext.needsEncouragement ? 'high' : 'medium',
        }
      );

      // Update interview metadata
      interview.metadata.voiceSession.conversationContext = conversationContext;
      interview.metadata.voiceSession.lastQuestionTime = Date.now();
      interview.metadata.voiceSession.totalSpeechTime = 
        (interview.metadata.voiceSession.totalSpeechTime || 0) + 5; // Estimate 5 seconds

      await interview.save();

      return NextResponse.json({
        success: true,
        data: {
          transcript,
          analysis,
          aiResponse: {
            text: aiResponse,
            audio: responseAudio?.toString('base64'),
            audioFormat: 'mp3',
            type: conversationContext.needsEncouragement ? 'encouragement' : 'follow_up',
          },
          conversationState: {
            phase: conversationContext.conversationPhase,
            progress: (conversationContext.candidateResponses.length / 10) * 100, // Estimate 10 questions
            needsEncouragement: conversationContext.needsEncouragement,
          },
        },
        message: 'Transcript processed successfully',
      });
    } catch (error) {
      console.error('Error processing transcript:', error);
      return NextResponse.json(
        { error: 'Failed to process transcript' },
        { status: 500 }
      );
    }
  });
}
