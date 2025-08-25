import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';

import { withDB } from '@/lib/db-utils';
import { Interview } from '@/lib/models/interview';
import { Question } from '@/lib/models/question';
import { requireAuth, AuthenticatedRequest } from '@/lib/auth-middleware';
import { aiService, JobRequirement } from '@/lib/ai-service';
import { INTERVIEW_TYPES } from '@/lib/constants';

// Load environment variables
import '@/lib/env-config';

// Get interviews with filtering and pagination
export const GET = requireAuth(async (request: AuthenticatedRequest) => {
  return withDB(async () => {
    try {
      const { searchParams } = new URL(request.url);
      const user = request.user;
      
      // Pagination
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '10');
      const skip = (page - 1) * limit;

      // Sorting
      const sortBy = searchParams.get('sortBy') || 'createdAt';
      const sortOrder = searchParams.get('sortOrder') || 'desc';

      // Build filter query
      const filter: any = {};

      // Role-based filtering
      if (user?.role === 'candidate') {
        filter.candidateId = new mongoose.Types.ObjectId(user.id);
      } else if (user?.role === 'recruiter') {
        filter.recruiterId = new mongoose.Types.ObjectId(user.id);
      }
      // Admin can see all interviews

      // Status filter
      const status = searchParams.get('status');
      if (status) {
        const statusArray = status.split(',');
        if (statusArray.length === 1) {
          filter.status = statusArray[0];
        } else {
          filter.status = { $in: statusArray };
        }
      }

      // Type filter
      const type = searchParams.get('type');
      if (type) {
        filter.type = type;
      }

      // Category filter
      const category = searchParams.get('category');
      if (category) {
        filter['config.category'] = category;
      }

      // Difficulty filter
      const difficulty = searchParams.get('difficulty');
      if (difficulty) {
        filter['config.difficulty'] = difficulty;
      }

      // Date range filter
      const dateFrom = searchParams.get('dateFrom');
      const dateTo = searchParams.get('dateTo');
      if (dateFrom || dateTo) {
        filter.scheduledAt = {};
        if (dateFrom) filter.scheduledAt.$gte = new Date(dateFrom);
        if (dateTo) filter.scheduledAt.$lte = new Date(dateTo);
      }

      // Search filter
      const search = searchParams.get('search');
      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: 'i' } },
          { 'config.category': { $regex: search, $options: 'i' } },
        ];
      }

      // Build sort object
      const sort: any = {};
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

      // Execute query with pagination
      const [interviews, total] = await Promise.all([
        Interview.find(filter)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .populate('candidateId', 'firstName lastName email')
          .populate('recruiterId', 'firstName lastName email')
          .lean(),
        Interview.countDocuments(filter)
      ]);

      // Calculate pagination info
      const totalPages = Math.ceil(total / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      return NextResponse.json({
        success: true,
        data: {
          interviews,
          pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNextPage,
            hasPrevPage,
          }
        }
      });
    } catch (error) {
      console.error('Error fetching interviews:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  });
});

// Create new interview
export const POST = requireAuth(async (request: AuthenticatedRequest) => {
  return withDB(async () => {
    try {
      const user = request.user;
      const body = await request.json();

      const {
        title,
        type = 'mock',
        scheduledAt,
        duration = 30,
        config,
        questionCount = 5,
        resumeText,
        jobRequirement,
      } = body;

      // Validate required fields
      if (!title || !scheduledAt) {
        return NextResponse.json(
          { error: 'Missing required fields: title, scheduledAt' },
          { status: 400 }
        );
      }

          // For AI-driven interviews, we need resume and job requirements
    if (type === INTERVIEW_TYPES.AI_DRIVEN && (!resumeText || !jobRequirement)) {
      return NextResponse.json(
        { error: 'AI-driven interviews require resume text and job requirements' },
        { status: 400 }
      );
    }

      // Generate questions based on interview type
      let questions: Array<{
        questionId: any;
        text: string;
        category: string;
        order: number;
      }> = [];
      let interviewConfig = config || {};

          if (type === INTERVIEW_TYPES.AI_DRIVEN) {
      // AI-driven interview: Analyze resume and create personalized plan
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
              difficulty: interviewPlan.difficultyProgression,
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
                context: `Personalized question based on resume analysis and job requirements`,
              },
            });
            return await question.save();
          })
        );

        questions = questionDocs.map((q, index) => ({
          questionId: q._id,
          text: q.text,
          category: q.category,
          order: index + 1,
        }));

        // Update interview configuration with AI analysis
        interviewConfig = {
          ...config,
          resumeAnalysis,
          jobRequirement,
          interviewPlan,
          skillGaps,
          category: 'personalized',
          difficulty: interviewPlan.difficultyProgression,
          questionCount: interviewPlan.totalQuestions,
        };
      } else {
        // Traditional interview: Use provided configuration
        if (config?.category && config?.difficulty) {
          const generatedQuestions = await aiService.generateQuestions({
            category: config.category,
            difficulty: config.difficulty,
            industry: config.industry,
            candidateLevel: config.candidateLevel || 'mid',
          });

          // Create question documents
          const questionDocs = await Promise.all(
            generatedQuestions.map(async (text, index) => {
              const question = new Question({
                text,
                category: config.category,
                difficulty: config.difficulty,
                industry: config.industry,
                type: 'behavioral',
                tags: [config.category, config.difficulty],
                aiConfig: {
                  followUpQuestions: [],
                  expectedKeywords: [],
                  scoringCriteria: {
                    communication: 25,
                    technical: 25,
                    problemSolving: 25,
                    confidence: 25,
                  },
                  context: `Interview question for ${config.category} category`,
                },
              });
              return await question.save();
            })
          );

          questions = questionDocs.map((q, index) => ({
            questionId: q._id,
            text: q.text,
            category: q.category,
            order: index + 1,
          }));
        }
      }

      // Create interview
      const interview = new Interview({
        candidateId: user?.role === 'candidate' ? new mongoose.Types.ObjectId(user.id) : body.candidateId,
        recruiterId: user?.role === 'recruiter' ? new mongoose.Types.ObjectId(user.id) : body.recruiterId,
        title,
        type,
        status: 'scheduled',
        scheduledAt: new Date(scheduledAt),
        duration,
        config: {
          difficulty: interviewConfig.difficulty || 'medium',
          category: interviewConfig.category || 'general',
          industry: interviewConfig.industry,
          questionCount: interviewConfig.questionCount || questionCount,
          allowRetakes: interviewConfig.allowRetakes || false,
          aiMode: interviewConfig.aiMode || 'structured',
          resumeAnalysis: interviewConfig.resumeAnalysis,
          jobRequirement: interviewConfig.jobRequirement,
          interviewPlan: interviewConfig.interviewPlan,
          skillGaps: interviewConfig.skillGaps,
        },
        questions,
        responses: [],
        metadata: {
          totalQuestions: questions.length,
          completedQuestions: 0,
        },
      });

      await interview.save();

      // Populate user data
      await interview.populate('candidateId', 'firstName lastName email');
      if (interview.recruiterId) {
        await interview.populate('recruiterId', 'firstName lastName email');
      }

      return NextResponse.json({
        success: true,
        data: interview,
        message: 'Interview created successfully',
      });
    } catch (error) {
      console.error('Error creating interview:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  });
});
