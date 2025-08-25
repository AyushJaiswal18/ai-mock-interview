import { NextRequest, NextResponse } from 'next/server';
import { withDB } from '@/lib/db-utils';
import { Interview } from '@/lib/models/interview';
import { Question } from '@/lib/models/question';
import { requireAuth, AuthenticatedRequest } from '@/lib/auth-middleware';
import { aiService } from '@/lib/ai-service';
import '@/lib/env-config';

// Analyze resume and generate interview plan
export const POST = requireAuth(async (request: AuthenticatedRequest) => {
  return withDB(async () => {
    try {
      const user = request.user;
      const interviewId = request.url.split('/interviews/')[1].split('/analyze')[0];
      const body = await request.json();

      const { resumeText, jobRequirement } = body;

      if (!interviewId) {
        return NextResponse.json(
          { error: 'Interview ID is required' },
          { status: 400 }
        );
      }

      if (!resumeText || !jobRequirement) {
        return NextResponse.json(
          { error: 'Resume text and job requirements are required' },
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
      if (user?.role === 'candidate' && interview.candidateId.toString() !== user.id) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }

      if (user?.role === 'recruiter' && interview.recruiterId && interview.recruiterId.toString() !== user.id) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }

      // Check if interview can be analyzed
      if (interview.status !== 'scheduled') {
        return NextResponse.json(
          { error: 'Interview cannot be analyzed. Current status: ' + interview.status },
          { status: 400 }
        );
      }

      // Analyze resume and create interview plan
      const resumeAnalysis = await aiService.analyzeResume(resumeText);
      const interviewPlan = await aiService.createInterviewPlan(resumeAnalysis, jobRequirement);
      const skillGaps = await aiService.analyzeSkillGaps(resumeAnalysis, jobRequirement);

      // Generate personalized questions
      const personalizedQuestions = await aiService.generatePersonalizedQuestions(
        resumeAnalysis,
        jobRequirement,
        interviewPlan
      );

      // Create question documents
      const questionDocs = await Promise.all(
        personalizedQuestions.map(async (questionObj, index) => {
          const question = new Question({
            text: questionObj.question,
            category: 'personalized',
            difficulty: questionObj.difficulty,
            industry: jobRequirement.industry,
            type: questionObj.type,
            tags: [...resumeAnalysis.skills, jobRequirement.industry],
            aiConfig: {
              followUpQuestions: [],
              expectedKeywords: skillGaps.strongSkills,
              scoringCriteria: {
                communication: 25,
                technical: 25,
                problemSolving: 25,
                confidence: 25,
              },
              context: `Personalized question based on resume analysis and job requirements. Focus area: ${questionObj.focusArea}`,
            },
          });
          return await question.save();
        })
      );

      const questions = questionDocs.map((q, index) => ({
        questionId: q._id,
        text: q.text,
        category: q.category,
        order: index + 1,
      }));

      // Update interview with analysis and questions
      interview.config.resumeAnalysis = resumeAnalysis;
      interview.config.jobRequirement = jobRequirement;
      interview.config.interviewPlan = interviewPlan;
      interview.config.skillGaps = skillGaps;
      interview.config.category = 'personalized';
      interview.config.difficulty = interviewPlan.difficultyProgression;
      interview.config.questionCount = interviewPlan.totalQuestions;
      interview.questions = questions;
      interview.metadata.totalQuestions = questions.length;
      interview.metadata.completedQuestions = 0;

      await interview.save();

      // Populate user data
      await interview.populate('candidateId', 'firstName lastName email');
      if (interview.recruiterId) {
        await interview.populate('recruiterId', 'firstName lastName email');
      }

      return NextResponse.json({
        success: true,
        data: {
          interview,
          analysis: {
            resumeAnalysis,
            interviewPlan,
            skillGaps,
            questions: questions.map(q => q.text),
          },
        },
        message: 'Interview analyzed and personalized successfully',
      });
    } catch (error) {
      console.error('Error analyzing interview:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  });
});
