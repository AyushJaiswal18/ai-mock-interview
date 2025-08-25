import { NextRequest, NextResponse } from 'next/server';
import { withDB } from '@/lib/db-utils';
import { Interview } from '@/lib/models/interview';
import { requireAuth, AuthenticatedRequest } from '@/lib/auth-middleware';
import { aiService } from '@/lib/ai-service';
import '@/lib/env-config';

// End interview session
export const POST = requireAuth(async (request: AuthenticatedRequest) => {
  return withDB(async () => {
    try {
      const user = request.user;
      const interviewId = request.url.split('/interviews/')[1].split('/end')[0];
      
      // Body is optional for end interview
      let body = {};
      try {
        body = await request.json();
      } catch (error) {
        // No body provided, which is fine for ending an interview
      }

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
      // user is guaranteed to be defined after requireAuth middleware
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

      // Check if interview can be ended
      if (interview.status !== 'in-progress') {
        return NextResponse.json(
          { error: 'Interview cannot be ended. Current status: ' + interview.status },
          { status: 400 }
        );
      }

      // End the interview
      interview.status = 'completed';
      interview.endedAt = new Date();

      // Generate AI analysis if there are responses
      if (interview.responses.length > 0) {
        const responsesForAnalysis = interview.responses.map((response: any) => ({
          questionId: response.questionId.toString(),
          question: interview.questions.find((q: any) => q.questionId.toString() === response.questionId.toString())?.text || '',
          response: response.answer,
          analysis: response.aiAnalysis || {
            score: 0,
            feedback: 'No analysis available',
            strengths: [],
            improvements: [],
            keywordCoverage: 0,
            relevanceScore: 0
          }
        }));

        // Calculate overall score
        const totalScore = interview.responses.reduce((sum: number, response: any) => {
          return sum + (response.aiAnalysis?.score || 0);
        }, 0);
        const averageScore = Math.round(totalScore / interview.responses.length);

        // Generate comprehensive feedback
        const feedback = await aiService.generateInterviewFeedback(responsesForAnalysis);

        interview.aiAnalysis = {
          overallScore: averageScore,
          communicationScore: Math.round(averageScore * 0.3), // Placeholder - should be calculated from individual scores
          technicalScore: Math.round(averageScore * 0.4),
          confidenceScore: Math.round(averageScore * 0.3),
          improvementAreas: feedback.improvementAreas,
          strengths: feedback.strengths,
          summary: feedback.summary,
          recommendations: feedback.recommendations,
        };
      }

      await interview.save();

      // Populate user data
      await interview.populate('candidateId', 'firstName lastName email');
      if (interview.recruiterId) {
        await interview.populate('recruiterId', 'firstName lastName email');
      }

      return NextResponse.json({
        success: true,
        data: interview,
        message: 'Interview ended successfully',
      });
    } catch (error) {
      console.error('Error ending interview:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  });
});
