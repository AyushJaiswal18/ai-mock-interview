import mongoose, { Schema, Document } from 'mongoose';

export interface IInterview extends Document {
  candidateId: mongoose.Types.ObjectId;
  recruiterId?: mongoose.Types.ObjectId;
  title: string;
  type: 'mock' | 'real' | 'practice' | 'manual' | 'ai-driven';
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  
  // Scheduling
  scheduledAt: Date;
  startedAt?: Date;
  endedAt?: Date;
  duration: number; // minutes
  
  // Configuration
  config: {
    difficulty: 'easy' | 'medium' | 'hard';
    category: string;
    industry?: string;
    questionCount: number;
    allowRetakes: boolean;
    aiMode: 'conversational' | 'structured';
    // AI-driven interview configuration
    resumeAnalysis?: {
      skills: string[];
      experience: {
        years: number;
        roles: string[];
        industries: string[];
      };
      education: {
        degree: string;
        field: string;
        institution: string;
      };
      strengths: string[];
      areasForImprovement: string[];
      overallScore: number;
    };
    jobRequirement?: {
      title: string;
      description: string;
      requiredSkills: string[];
      preferredSkills: string[];
      experienceLevel: 'entry' | 'mid' | 'senior';
      industry: string;
      duration: number;
    };
    interviewPlan?: {
      totalQuestions: number;
      questionDistribution: {
        technical: number;
        behavioral: number;
        situational: number;
        skills: number;
      };
      focusAreas: string[];
      difficultyProgression: 'easy' | 'medium' | 'hard';
      timePerQuestion: number;
      customInstructions: string;
    };
    skillGaps?: {
      missingSkills: string[];
      weakSkills: string[];
      strongSkills: string[];
      recommendations: string[];
    };
  };
  
  // Questions & Responses
  questions: Array<{
    questionId: mongoose.Types.ObjectId;
    text: string;
    category: string;
    order: number;
  }>;
  
  responses: Array<{
    questionId: mongoose.Types.ObjectId;
    answer: string;
    audioUrl?: string;
    videoUrl?: string;
    duration: number; // seconds
    startTime: Date;
    endTime: Date;
    aiAnalysis?: {
      score: number;
      feedback: string;
      improvements: string[];
      strengths: string[];
      keywordCoverage: number;
      relevanceScore: number;
    };
  }>;
  
  // AI Analysis
  aiAnalysis?: {
    overallScore: number;
    communicationScore: number;
    technicalScore: number;
    confidenceScore: number;
    improvementAreas: string[];
    strengths: string[];
    summary: string;
    recommendations: string[];
  };
  
  // Media
  media: {
    audioUrl?: string;
    videoUrl?: string;
    transcriptUrl?: string;
  };
  
  // Metadata
  metadata: {
    deviceInfo?: string;
    browserInfo?: string;
    networkQuality?: number;
    totalQuestions: number;
    completedQuestions: number;
    voiceSession?: {
      sessionId: string;
      startedAt: Date;
      voiceSettings: {
        voiceId: string;
        speakingStyle: string;
        enableVoiceAnalysis: boolean;
        language: string;
      };
      conversationContext: {
        previousQuestions: string[];
        candidateResponses: string[];
        currentTopic: string;
        difficultyLevel: string;
        candidateEnergy: string;
        needsEncouragement: boolean;
        conversationPhase: string;
      };
    };
  };
  
  createdAt: Date;
  updatedAt: Date;
}

const InterviewSchema = new Schema<IInterview>({
  candidateId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  recruiterId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ['mock', 'real', 'practice', 'manual', 'ai-driven'],
    default: 'mock',
    required: true,
  },
  status: {
    type: String,
    enum: ['scheduled', 'in-progress', 'completed', 'cancelled'],
    default: 'scheduled',
    required: true,
    index: true,
  },
  scheduledAt: {
    type: Date,
    required: true,
    index: true,
  },
  startedAt: {
    type: Date,
    index: true,
  },
  endedAt: {
    type: Date,
    index: true,
  },
  duration: {
    type: Number,
    default: 30, // minutes
  },
  config: {
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    category: {
      type: String,
      required: true,
    },
    industry: String,
    questionCount: {
      type: Number,
      default: 5,
    },
    allowRetakes: {
      type: Boolean,
      default: false,
    },
    aiMode: {
      type: String,
      enum: ['conversational', 'structured'],
      default: 'structured',
    },
  },
  questions: [{
    questionId: {
      type: Schema.Types.ObjectId,
      ref: 'Question',
    },
    text: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    order: {
      type: Number,
      required: true,
    },
  }],
  responses: [{
    questionId: {
      type: Schema.Types.ObjectId,
      ref: 'Question',
    },
    answer: {
      type: String,
      required: true,
    },
    audioUrl: String,
    videoUrl: String,
    duration: {
      type: Number,
      default: 0,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    aiAnalysis: {
      score: {
        type: Number,
        min: 0,
        max: 100,
      },
      feedback: String,
      improvements: [String],
      strengths: [String],
      keywordCoverage: {
        type: Number,
        min: 0,
        max: 100,
      },
      relevanceScore: {
        type: Number,
        min: 0,
        max: 100,
      },
    },
  }],
  aiAnalysis: {
    overallScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    communicationScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    technicalScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    confidenceScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    improvementAreas: [String],
    strengths: [String],
    summary: String,
    recommendations: [String],
  },
  media: {
    audioUrl: String,
    videoUrl: String,
    transcriptUrl: String,
  },
  metadata: {
    deviceInfo: String,
    browserInfo: String,
    networkQuality: {
      type: Number,
      min: 0,
      max: 100,
    },
    totalQuestions: {
      type: Number,
      default: 0,
    },
    completedQuestions: {
      type: Number,
      default: 0,
    },
    voiceSession: {
      sessionId: String,
      startedAt: Date,
      voiceSettings: {
        voiceId: String,
        speakingStyle: String,
        enableVoiceAnalysis: Boolean,
        language: String,
      },
      conversationContext: {
        previousQuestions: [String],
        candidateResponses: [String],
        currentTopic: String,
        difficultyLevel: String,
        candidateEnergy: String,
        needsEncouragement: Boolean,
        conversationPhase: String,
      }
    },
  },
}, {
  timestamps: true,
});

// Indexes for common queries
InterviewSchema.index({ candidateId: 1, status: 1 });
InterviewSchema.index({ candidateId: 1, createdAt: -1 });
InterviewSchema.index({ recruiterId: 1, status: 1 });
InterviewSchema.index({ status: 1, scheduledAt: 1 });
InterviewSchema.index({ 'config.category': 1, 'config.difficulty': 1 });

// Virtual for progress calculation
InterviewSchema.virtual('progress').get(function() {
  if (this.metadata.totalQuestions === 0) return 0;
  return (this.metadata.completedQuestions / this.metadata.totalQuestions) * 100;
});

// Virtual for duration calculation
InterviewSchema.virtual('actualDuration').get(function() {
  if (!this.startedAt || !this.endedAt) return 0;
  return Math.round((this.endedAt.getTime() - this.startedAt.getTime()) / 1000 / 60);
});

// Ensure virtuals are serialized
InterviewSchema.set('toJSON', { virtuals: true });
InterviewSchema.set('toObject', { virtuals: true });

// Pre-save middleware to update metadata
InterviewSchema.pre('save', function(next) {
  this.metadata.totalQuestions = this.questions.length;
  this.metadata.completedQuestions = this.responses.length;
  next();
});

export const Interview = mongoose.models.Interview || mongoose.model<IInterview>('Interview', InterviewSchema);
