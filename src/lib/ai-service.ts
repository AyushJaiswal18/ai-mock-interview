import OpenAI from 'openai';
import { AI_CONFIG, INTERVIEW_CONFIG } from './constants';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

/**
 * Helper function to clean and parse JSON responses from AI
 */
function parseAIResponse(response: string): any {
  if (!response) {
    throw new Error('No response from AI service');
  }

  // Clean the response to extract JSON (remove markdown formatting)
  let cleanResponse = response.trim();
  if (cleanResponse.startsWith('```json')) {
    cleanResponse = cleanResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleanResponse.startsWith('```')) {
    cleanResponse = cleanResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }

  return JSON.parse(cleanResponse);
}

// Types for AI responses
export interface ResumeAnalysis {
  skills: string[];
  experience: {
    years: number;
    level: 'junior' | 'mid' | 'senior' | 'lead';
  };
  education: {
    degree: string;
    institution: string;
    year: number;
  }[];
  overallScore: number;
  strengths: string[];
  areasForImprovement: string[];
}

export interface InterviewPlan {
  totalQuestions: number;
  timePerQuestion: number;
  focusAreas: string[];
  difficultyProgression: 'easy' | 'medium' | 'hard';
  questionDistribution: {
    technical: number;
    behavioral: number;
    situational: number;
    skills: number;
  };
}

export interface SkillGaps {
  strongSkills: string[];
  weakSkills: string[];
  missingSkills: string[];
  recommendations: string[];
}

export interface PersonalizedQuestion {
  question: string;
  type: 'technical' | 'behavioral' | 'situational' | 'skills';
  difficulty: 'easy' | 'medium' | 'hard';
  focusArea: string;
}

export interface ResponseAnalysis {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  keywordCoverage: number;
  relevanceScore: number;
}

export interface InterviewFeedback {
  overallScore: number;
  summary: string;
  recommendations: string[];
  improvementAreas: string[];
  strengths: string[];
  questionAnalysis: {
    questionId: string;
    score: number;
    feedback: string;
  }[];
}

export interface JobRequirement {
  title: string;
  description: string;
  requiredSkills: string[];
  preferredSkills: string[];
  experienceLevel: 'junior' | 'mid' | 'senior' | 'lead';
  industry: string;
  duration: number; // minutes
}

/**
 * Unified AI Service for Interview System
 */
export class AIService {
  /**
   * Analyze resume text and extract key information
   */
  async analyzeResume(resumeText: string): Promise<ResumeAnalysis> {
    try {
      const prompt = `
        Analyze the following resume and extract key information. Respond with valid JSON only.
        
        Resume:
        ${resumeText}
        
        Extract and return:
        - skills: Array of technical and soft skills
        - experience: Object with years and level (junior/mid/senior/lead)
        - education: Array of education objects with degree, institution, year
        - overallScore: Number 0-100 based on experience and skills
        - strengths: Array of key strengths
        - areasForImprovement: Array of areas to improve
      `;

      const completion = await openai.chat.completions.create({
        model: AI_CONFIG.MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are an expert resume analyzer. Respond with ONLY valid JSON, no markdown formatting, no backticks, no explanations.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: AI_CONFIG.TEMPERATURE.LOW,
        max_tokens: AI_CONFIG.MAX_TOKENS.EXTENDED,
      });

      const response = completion.choices[0]?.message?.content;
      return parseAIResponse(response || '');
    } catch (error) {
      console.error('Resume Analysis Error:', error);
      // Return fallback data
      return {
        skills: [],
        experience: { years: 0, level: 'junior' },
        education: [],
        overallScore: 50,
        strengths: [],
        areasForImprovement: ['Unable to analyze resume at this time']
      };
    }
  }

  /**
   * Create interview plan based on resume analysis and job requirements
   */
  async createInterviewPlan(resumeAnalysis: ResumeAnalysis, jobRequirement: JobRequirement): Promise<InterviewPlan> {
    try {
      const prompt = `
        Create an interview plan based on the resume analysis and job requirements. Respond with valid JSON only.
        
        Resume Analysis:
        ${JSON.stringify(resumeAnalysis, null, 2)}
        
        Job Requirements:
        ${JSON.stringify(jobRequirement, null, 2)}
        
        Create and return:
        - totalQuestions: Number of questions (5-20)
        - timePerQuestion: Minutes per question (2-5)
        - focusAreas: Array of key focus areas
        - difficultyProgression: easy/medium/hard
        - questionDistribution: Object with technical, behavioral, situational, skills percentages
      `;

      const completion = await openai.chat.completions.create({
        model: AI_CONFIG.MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are an expert interview planner. Respond with ONLY valid JSON, no markdown formatting, no backticks, no explanations.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: AI_CONFIG.TEMPERATURE.MEDIUM,
        max_tokens: AI_CONFIG.MAX_TOKENS.LONG,
      });

      const response = completion.choices[0]?.message?.content;
      return parseAIResponse(response || '');
    } catch (error) {
      console.error('Interview Plan Creation Error:', error);
      // Return fallback data
      return {
        totalQuestions: 10,
        timePerQuestion: 4,
        focusAreas: ['communication', 'problem-solving', 'technical skills'],
        difficultyProgression: 'medium',
        questionDistribution: {
          technical: 30,
          behavioral: 40,
          situational: 20,
          skills: 10
        }
      };
    }
  }

  /**
   * Analyze skill gaps between resume and job requirements
   */
  async analyzeSkillGaps(resumeAnalysis: ResumeAnalysis, jobRequirement: JobRequirement): Promise<SkillGaps> {
    try {
      const prompt = `
        Analyze skill gaps between the resume and job requirements. Respond with valid JSON only.
        
        Resume Analysis:
        ${JSON.stringify(resumeAnalysis, null, 2)}
        
        Job Requirements:
        ${JSON.stringify(jobRequirement, null, 2)}
        
        Analyze and return:
        - strongSkills: Skills that match job requirements well
        - weakSkills: Skills that need improvement
        - missingSkills: Required skills not found in resume
        - recommendations: Array of improvement recommendations
      `;

      const completion = await openai.chat.completions.create({
        model: AI_CONFIG.MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are an expert skill analyst. Respond with ONLY valid JSON, no markdown formatting, no backticks, no explanations.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: AI_CONFIG.TEMPERATURE.LOW,
        max_tokens: AI_CONFIG.MAX_TOKENS.MEDIUM,
      });

      const response = completion.choices[0]?.message?.content;
      return parseAIResponse(response || '');
    } catch (error) {
      console.error('Skill Gap Analysis Error:', error);
      // Return fallback data
      return {
        strongSkills: [],
        weakSkills: [],
        missingSkills: [],
        recommendations: ['Unable to analyze skill gaps at this time']
      };
    }
  }

  /**
   * Generate personalized questions based on resume and job requirements
   */
  async generatePersonalizedQuestions(
    resumeAnalysis: ResumeAnalysis, 
    jobRequirement: JobRequirement, 
    interviewPlan: InterviewPlan
  ): Promise<PersonalizedQuestion[]> {
    try {
      const prompt = `
        Generate personalized interview questions based on the resume analysis, job requirements, and interview plan. Respond with valid JSON array only.
        
        Resume Analysis:
        ${JSON.stringify(resumeAnalysis, null, 2)}
        
        Job Requirements:
        ${JSON.stringify(jobRequirement, null, 2)}
        
        Interview Plan:
        ${JSON.stringify(interviewPlan, null, 2)}
        
        Generate ${interviewPlan.totalQuestions} questions that:
        - Match the question distribution
        - Focus on the identified areas
        - Are appropriate for the experience level
        - Cover both technical and behavioral aspects
        
        Return array of objects with:
        - question: The question text
        - type: technical/behavioral/situational/skills
        - difficulty: easy/medium/hard
        - focusArea: Specific area the question targets
      `;

      const completion = await openai.chat.completions.create({
        model: AI_CONFIG.MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are an expert interviewer. Always respond with valid JSON arrays.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: AI_CONFIG.TEMPERATURE.HIGH,
        max_tokens: AI_CONFIG.MAX_TOKENS.EXTENDED,
      });

      const response = completion.choices[0]?.message?.content;
      return parseAIResponse(response || '');
    } catch (error) {
      console.error('Personalized Questions Generation Error:', error);
      // Return fallback questions
      return [
        {
          question: 'Tell me about your background and experience.',
          type: 'behavioral',
          difficulty: 'easy',
          focusArea: 'background'
        },
        {
          question: 'What are your key strengths and areas for improvement?',
          type: 'behavioral',
          difficulty: 'easy',
          focusArea: 'self-assessment'
        },
        {
          question: 'Why are you interested in this role?',
          type: 'behavioral',
          difficulty: 'easy',
          focusArea: 'motivation'
        },
        {
          question: 'Describe a challenging project you worked on.',
          type: 'situational',
          difficulty: 'medium',
          focusArea: 'project-management'
        },
        {
          question: 'How do you handle difficult situations at work?',
          type: 'behavioral',
          difficulty: 'medium',
          focusArea: 'problem-solving'
        }
      ];
    }
  }

  /**
   * Analyze a candidate's response to a question
   */
  async analyzeResponse(
    question: string,
    candidateResponse: string,
    questionType: string,
    expectedKeywords: string[] = []
  ): Promise<ResponseAnalysis> {
    try {
      const prompt = `
        Analyze the candidate's response to an interview question. Respond with valid JSON only.
        
        Question: ${question}
        Question Type: ${questionType}
        Response: ${candidateResponse}
        Expected Keywords: ${expectedKeywords.join(', ')}
        
        Analyze and return:
        - score: Number 0-100 based on quality, relevance, and completeness
        - feedback: Detailed feedback on the response
        - strengths: Array of strengths in the response
        - improvements: Array of areas for improvement
        - keywordCoverage: Percentage of expected keywords covered (0-100)
        - relevanceScore: How relevant the response is to the question (0-100)
      `;

      const completion = await openai.chat.completions.create({
        model: AI_CONFIG.MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are an expert interview evaluator. Respond with ONLY valid JSON, no markdown formatting, no backticks, no explanations.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: AI_CONFIG.TEMPERATURE.LOW,
        max_tokens: AI_CONFIG.MAX_TOKENS.LONG,
      });

      const response = completion.choices[0]?.message?.content;
      return parseAIResponse(response || '');
    } catch (error) {
      console.error('AI Analysis Error:', error);
      // Return fallback data
      return {
        score: 50,
        feedback: 'Unable to analyze response at this time.',
        strengths: [],
        improvements: ['Please try again later.'],
        keywordCoverage: 0,
        relevanceScore: 50
      };
    }
  }

  /**
   * Generate questions for traditional interviews
   */
  async generateQuestions(params: {
    category: string;
    difficulty: string;
    industry?: string;
    candidateLevel?: string;
  }): Promise<string[]> {
    try {
      const prompt = `
        Generate ${INTERVIEW_CONFIG.MIN_QUESTIONS}-${INTERVIEW_CONFIG.MAX_QUESTIONS} interview questions for a ${params.difficulty} level ${params.category} interview.
        
        Category: ${params.category}
        Difficulty: ${params.difficulty}
        Industry: ${params.industry || 'General'}
        Candidate Level: ${params.candidateLevel || 'mid'}
        
        Generate questions that are:
        - Appropriate for the difficulty level
        - Relevant to the category
        - Suitable for the industry
        - Engaging and thought-provoking
        
        Return only an array of question strings in JSON format.
      `;

      const completion = await openai.chat.completions.create({
        model: AI_CONFIG.MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are an expert interviewer. Respond with ONLY valid JSON arrays, no markdown formatting, no backticks, no explanations. Return an array of question objects.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: AI_CONFIG.TEMPERATURE.HIGH,
        max_tokens: AI_CONFIG.MAX_TOKENS.MEDIUM,
      });

      const response = completion.choices[0]?.message?.content;
      return parseAIResponse(response || '');
    } catch (error) {
      console.error('Question Generation Error:', error);
      // Return fallback questions
      return [
        'Tell me about your background and experience.',
        'What are your key strengths and areas for improvement?',
        'Why are you interested in this role?',
        'Describe a challenging project you worked on.',
        'How do you handle difficult situations at work?'
      ];
    }
  }

  /**
   * Generate comprehensive interview feedback
   */
  async generateInterviewFeedback(
    responses: Array<{
      questionId: string;
      question: string;
      response: string;
      analysis: ResponseAnalysis;
    }>
  ): Promise<InterviewFeedback> {
    try {
      const prompt = `
        Generate comprehensive interview feedback based on all responses. Respond with valid JSON only.
        
        Responses and Analysis:
        ${JSON.stringify(responses, null, 2)}
        
        Generate and return:
        - overallScore: Average score across all responses
        - summary: Overall assessment of the interview
        - recommendations: Array of improvement recommendations
        - improvementAreas: Array of specific areas to focus on
        - strengths: Array of overall strengths demonstrated
        - questionAnalysis: Array of individual question analysis with questionId, score, feedback
      `;

      const completion = await openai.chat.completions.create({
        model: AI_CONFIG.MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are an expert interview evaluator. Always respond with valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: AI_CONFIG.TEMPERATURE.LOW,
        max_tokens: AI_CONFIG.MAX_TOKENS.EXTENDED,
      });

      const response = completion.choices[0]?.message?.content;
      return parseAIResponse(response || '');
    } catch (error) {
      console.error('Interview Feedback Generation Error:', error);
      // Return fallback data
      const averageScore = responses.reduce((sum, r) => sum + r.analysis.score, 0) / responses.length;
      return {
        overallScore: averageScore,
        summary: 'Interview completed successfully.',
        recommendations: ['Continue practicing and improving your skills.'],
        improvementAreas: ['General interview skills'],
        strengths: ['Completed the interview'],
        questionAnalysis: responses.map(r => ({
          questionId: r.questionId,
          score: r.analysis.score,
          feedback: r.analysis.feedback
        }))
      };
    }
  }
}

// Export singleton instance
export const aiService = new AIService();
