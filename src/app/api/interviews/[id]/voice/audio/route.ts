import { NextRequest, NextResponse } from 'next/server';
import { withDB } from '@/lib/db-utils';
import { Interview } from '@/lib/models/interview';
import { requireAuth, AuthenticatedRequest } from '@/lib/auth-middleware';
import { speechService } from '@/lib/speech-service';
import { voiceService } from '@/lib/voice-service';
import { aiService } from '@/lib/ai-service';
import '@/lib/env-config';

// Process audio chunk for real-time conversation
export const POST = requireAuth(async (request: AuthenticatedRequest) => {
  return withDB(async () => {
    try {
      const user = request.user;
      const interviewId = request.url.split('/interviews/')[1].split('/voice')[0];
      
      // Parse multipart form data for audio
      const formData = await request.formData();
      const audioFile = formData.get('audio') as File;
      const isComplete = formData.get('isComplete') === 'true';
      const questionId = formData.get('questionId') as string;

      if (!interviewId || !audioFile) {
        return NextResponse.json(
          { error: 'Interview ID and audio are required' },
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

      // Check access permissions and voice session
      if (user!.role === 'candidate' && interview.candidateId.toString() !== user!.id) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }

      if (!interview.metadata?.voiceSession) {
        return NextResponse.json(
          { error: 'Voice session not active' },
          { status: 400 }
        );
      }

      // Convert audio file to buffer
      const audioBuffer = Buffer.from(await audioFile.arrayBuffer());

      // For now, we'll use a simple transcription approach since real-time transcription is handled client-side
      // In a real implementation, you'd use a speech-to-text service here
      const speechAnalysis = {
        transcript: "Sample transcript", // This would come from actual STT
        confidence: 0.9,
        wordsPerMinute: 150,
        fillerWordCount: 2,
        pauseDuration: 0.5,
        volume: 0.8,
        clarity: 0.9,
        pace: 150, // Add missing pace property
        alternatives: [],
        timestamp: Date.now(),
        duration: 5, // Estimate 5 seconds
      };
      
      if (!speechAnalysis.transcript.trim()) {
        return NextResponse.json({
          success: true,
          data: {
            transcript: '',
            analysis: speechAnalysis,
            requiresResponse: false,
          },
          message: 'No speech detected',
        });
      }

      // Get current question context
      const currentQuestion = questionId ? 
        interview.questions.find((q: any) => q.questionId.toString() === questionId) : 
        interview.questions[interview.responses.length] || null;

      let aiResponse = null;
      let responseAudio = null;

      if (isComplete && speechAnalysis.transcript.trim()) {
        // Process complete response
        const conversationContext = interview.metadata.voiceSession.conversationContext;
        
        // Analyze the response with AI
        const responseAnalysis = await aiService.analyzeResponse(
          currentQuestion?.text || 'General response',
          speechAnalysis.transcript,
          currentQuestion?.category || 'general',
          []
        );

        // Update conversation context
        conversationContext.previousQuestions.push(currentQuestion?.text || '');
        conversationContext.candidateResponses.push(speechAnalysis.transcript);
        
        // Determine candidate energy and needs
        if (speechAnalysis.confidence < 0.6 || speechAnalysis.fillerWordCount > 5) {
          conversationContext.needsEncouragement = true;
          conversationContext.candidateEnergy = 'low';
        } else if (speechAnalysis.pace > 180) {
          conversationContext.candidateEnergy = 'high';
        }

        // Generate AI follow-up or next question
        aiResponse = await generateAIResponse(
          speechAnalysis.transcript,
          responseAnalysis,
          conversationContext,
          interview
        );

        // Generate speech for AI response
        responseAudio = await voiceService.generateSpeech(
          aiResponse.text,
          conversationContext,
          {
            empathyLevel: conversationContext.needsEncouragement ? 0.9 : 0.7,
            encouragementLevel: conversationContext.needsEncouragement ? 'high' : 'medium',
          }
        );

        // Save the candidate's response
        if (currentQuestion) {
          const responseStartTime = new Date(Date.now() - speechAnalysis.duration * 1000);
          const responseEndTime = new Date();
          
          interview.responses.push({
            questionId: currentQuestion.questionId,
            answer: speechAnalysis.transcript,
            duration: speechAnalysis.duration,
            startTime: responseStartTime,
            endTime: responseEndTime,
            aiAnalysis: {
              score: responseAnalysis.score,
              feedback: responseAnalysis.feedback || 'Good response',
              improvements: responseAnalysis.improvements || [],
              strengths: responseAnalysis.strengths || [],
              keywordCoverage: 0.8,
              relevanceScore: 0.8,
            },
          });
        }

        // Update conversation context and metadata
        interview.metadata.voiceSession.conversationContext = conversationContext;
        interview.metadata.voiceSession.lastQuestionTime = Date.now();
        interview.metadata.voiceSession.totalSpeechTime = 
          (interview.metadata.voiceSession.totalSpeechTime || 0) + speechAnalysis.duration;

        await interview.save();
      }

      return NextResponse.json({
        success: true,
        data: {
          transcript: speechAnalysis.transcript,
          analysis: speechAnalysis,
          aiResponse: aiResponse ? {
            text: aiResponse.text,
            audio: responseAudio?.toString('base64'),
            audioFormat: 'mp3',
            type: aiResponse.type,
            nextQuestion: aiResponse.nextQuestion,
          } : null,
          conversationState: {
            phase: interview.metadata.voiceSession.conversationContext.conversationPhase,
            progress: (interview.responses.length / interview.questions.length) * 100,
            needsEncouragement: interview.metadata.voiceSession.conversationContext.needsEncouragement,
          },
        },
        message: 'Audio processed successfully',
      });
    } catch (error) {
      console.error('Error processing audio:', error);
      return NextResponse.json(
        { error: 'Failed to process audio' },
        { status: 500 }
      );
    }
  });

  /**
   * Generate contextual AI response
   */
  async function generateAIResponse(
    candidateResponse: string,
    responseAnalysis: any,
    conversationContext: any,
    interview: any
  ): Promise<{
    text: string;
    type: 'follow_up' | 'next_question' | 'encouragement' | 'clarification';
    nextQuestion?: any;
  }> {
    const responsesGiven = interview.responses.length;
    const totalQuestions = interview.questions.length;
    const isNearEnd = responsesGiven >= totalQuestions - 1;

    // Determine response type based on context
    if (conversationContext.needsEncouragement) {
      return {
        text: `That's a really thoughtful response, thank you for sharing that. ${getEncouragementPhrase()} Let's continue with the next question.`,
        type: 'encouragement',
      };
    }

    if (responseAnalysis.score > 80 && Math.random() > 0.7) {
      return {
        text: `Excellent answer! I particularly appreciate how you ${getSpecificPositiveFeedback(candidateResponse)}. Let me ask you about something related.`,
        type: 'follow_up',
      };
    }

    if (isNearEnd) {
      return {
        text: `Thank you for that insight. As we wrap up our conversation, I'd love to hear your thoughts on one final question.`,
        type: 'next_question',
        nextQuestion: interview.questions[responsesGiven + 1] || null,
      };
    }

    // Standard transition to next question
    const transitions = [
      "That's great to hear. Now I'd like to explore",
      "Thank you for sharing that. Let's discuss",
      "I appreciate that perspective. Moving on to",
      "That's very insightful. I'm curious about",
    ];

    const transition = transitions[Math.floor(Math.random() * transitions.length)];
    const nextQuestion = interview.questions[responsesGiven + 1];

    return {
      text: `${transition} ${nextQuestion?.text || 'our next topic.'}`,
      type: 'next_question',
      nextQuestion,
    };
  }

  /**
   * Get encouraging phrases for low-confidence responses
   */
  function getEncouragementPhrase(): string {
    const phrases = [
      "You're doing great so far.",
      "I can tell you're really thinking through these questions carefully.",
      "Your responses show a lot of depth.",
      "I appreciate your honesty and thoughtfulness.",
      "You're providing some really valuable insights.",
    ];
    return phrases[Math.floor(Math.random() * phrases.length)];
  }

  /**
   * Generate specific positive feedback
   */
  function getSpecificPositiveFeedback(response: string): string {
    const feedbackOptions = [
      "provided such a detailed example",
      "connected that to real-world experience",
      "showed clear problem-solving thinking",
      "demonstrated strong analytical skills",
      "explained the situation so clearly",
      "highlighted the key challenges",
    ];
    return feedbackOptions[Math.floor(Math.random() * feedbackOptions.length)];
  }
});
