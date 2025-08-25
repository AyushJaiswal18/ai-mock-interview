import { NextRequest, NextResponse } from 'next/server';
import { withDB } from '@/lib/db-utils';
import { Interview } from '@/lib/models/interview';
import { Question } from '@/lib/models/question';
import { requireAuth, AuthenticatedRequest } from '@/lib/auth-middleware';
import { aiService } from '@/lib/ai-service';
import '@/lib/env-config';

// Submit interview response
export const POST = requireAuth(async (request: AuthenticatedRequest) => {
  return withDB(async () => {
    try {
      const user = request.user;
      const interviewId = request.url.split('/interviews/')[1].split('/responses')[0];
      const body = await request.json();

      const {
        questionId,
        answer,
        audioUrl,
        videoUrl,
        duration = 0,
        startTime,
        endTime,
      } = body;

      if (!interviewId || !questionId || !answer) {
        return NextResponse.json(
          { error: 'Interview ID, question ID, and answer are required' },
          { status: 400 }
        );
      }

      const interview = await Interview.findById(interviewId);

      if (!interview) {
        return NextResponse.json(
          { error: 'Interview not found' },
          { status: 404 }
        );
      }

      // Check access permissions
      if (user.role === 'candidate' && interview.candidateId.toString() !== user.id) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }

      // Check if interview is in progress
      if (interview.status !== 'in-progress') {
        return NextResponse.json(
          { error: 'Interview is not in progress' },
          { status: 400 }
        );
      }

      // Check if question exists in this interview
      const question = interview.questions.find(q => q.questionId.toString() === questionId);
      if (!question) {
        return NextResponse.json(
          { error: 'Question not found in this interview' },
          { status: 404 }
        );
      }

      // Check if response already exists for this question
      const existingResponse = interview.responses.find(r => r.questionId.toString() === questionId);
      if (existingResponse) {
        return NextResponse.json(
          { error: 'Response already submitted for this question' },
          { status: 400 }
        );
      }

      // Get question details for AI analysis
      const questionDoc = await Question.findById(questionId);
      
      // Analyze response using AI
      const aiAnalysis = await aiService.analyzeResponse(
        question.text,
        answer,
        {
          category: question.category,
          difficulty: interview.config.difficulty,
          expectedKeywords: questionDoc?.aiConfig.expectedKeywords,
        }
      );

      // Create response object
      const response = {
        questionId,
        answer,
        audioUrl,
        videoUrl,
        duration,
        startTime: startTime ? new Date(startTime) : new Date(),
        endTime: endTime ? new Date(endTime) : new Date(),
        aiAnalysis,
      };

      // Add response to interview
      interview.responses.push(response);
      interview.metadata.completedQuestions = interview.responses.length;

      // Update question usage count
      if (questionDoc) {
        questionDoc.usageCount += 1;
        await questionDoc.save();
      }

      await interview.save();

      return NextResponse.json({
        success: true,
        data: {
          response,
          progress: interview.metadata.completedQuestions / interview.metadata.totalQuestions * 100,
          totalQuestions: interview.metadata.totalQuestions,
          completedQuestions: interview.metadata.completedQuestions,
        },
        message: 'Response submitted successfully',
      });
    } catch (error) {
      console.error('Error submitting response:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  });
});

// Get interview responses
export const GET = requireAuth(async (request: AuthenticatedRequest) => {
  return withDB(async () => {
    try {
      const user = request.user;
      const interviewId = request.url.split('/interviews/')[1].split('/responses')[0];

      if (!interviewId) {
        return NextResponse.json(
          { error: 'Interview ID is required' },
          { status: 400 }
        );
      }

      const interview = await Interview.findById(interviewId);

      if (!interview) {
        return NextResponse.json(
          { error: 'Interview not found' },
          { status: 404 }
        );
      }

      // Check access permissions
      if (user.role === 'candidate' && interview.candidateId.toString() !== user.id) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }

      if (user.role === 'recruiter' && interview.recruiterId && interview.recruiterId.toString() !== user.id) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          responses: interview.responses,
          progress: interview.metadata.completedQuestions / interview.metadata.totalQuestions * 100,
          totalQuestions: interview.metadata.totalQuestions,
          completedQuestions: interview.metadata.completedQuestions,
        },
      });
    } catch (error) {
      console.error('Error fetching responses:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  });
});
