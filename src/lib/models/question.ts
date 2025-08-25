import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestion extends Document {
  text: string;
  type: 'text' | 'video' | 'audio' | 'code' | 'behavioral' | 'technical' | 'situational' | 'skills';
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  industry?: string;
  tags: string[];
  
  // AI Configuration
  aiConfig: {
    followUpQuestions: string[];
    expectedKeywords: string[];
    scoringCriteria: {
      communication: number;
      technical: number;
      problemSolving: number;
      confidence: number;
    };
    context: string; // for AI to understand question context
  };
  
  // Embeddings for vector search
  embeddings?: number[];
  
  isActive: boolean;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>({
  text: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ['text', 'video', 'audio', 'code', 'behavioral', 'technical', 'situational', 'skills'],
    default: 'text',
    required: true,
  },
  category: {
    type: String,
    required: true,
    index: true,
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium',
    required: true,
    index: true,
  },
  industry: {
    type: String,
    index: true,
  },
  tags: [{
    type: String,
    trim: true,
  }],
  aiConfig: {
    followUpQuestions: [{
      type: String,
      trim: true,
    }],
    expectedKeywords: [{
      type: String,
      trim: true,
    }],
    scoringCriteria: {
      communication: {
        type: Number,
        min: 0,
        max: 100,
        default: 25,
      },
      technical: {
        type: Number,
        min: 0,
        max: 100,
        default: 25,
      },
      problemSolving: {
        type: Number,
        min: 0,
        max: 100,
        default: 25,
      },
      confidence: {
        type: Number,
        min: 0,
        max: 100,
        default: 25,
      },
    },
    context: {
      type: String,
      trim: true,
    },
  },
  embeddings: [{
    type: Number,
  }],
  isActive: {
    type: Boolean,
    default: true,
    index: true,
  },
  usageCount: {
    type: Number,
    default: 0,
    index: true,
  },
}, {
  timestamps: true,
});

// Indexes for common queries
QuestionSchema.index({ category: 1, difficulty: 1 });
QuestionSchema.index({ category: 1, isActive: 1 });
QuestionSchema.index({ difficulty: 1, isActive: 1 });
QuestionSchema.index({ industry: 1, category: 1 });
QuestionSchema.index({ tags: 1 });
QuestionSchema.index({ usageCount: -1 });

// Text search index
QuestionSchema.index({ text: 'text' });

// Virtual for total score
QuestionSchema.virtual('totalScore').get(function() {
  const criteria = this.aiConfig.scoringCriteria;
  return criteria.communication + criteria.technical + criteria.problemSolving + criteria.confidence;
});

// Ensure virtuals are serialized
QuestionSchema.set('toJSON', { virtuals: true });
QuestionSchema.set('toObject', { virtuals: true });

// Pre-save middleware to validate scoring criteria
QuestionSchema.pre('save', function(next) {
  const criteria = this.aiConfig.scoringCriteria;
  const total = criteria.communication + criteria.technical + criteria.problemSolving + criteria.confidence;
  
  if (total !== 100) {
    // Normalize to 100
    const factor = 100 / total;
    criteria.communication = Math.round(criteria.communication * factor);
    criteria.technical = Math.round(criteria.technical * factor);
    criteria.problemSolving = Math.round(criteria.problemSolving * factor);
    criteria.confidence = Math.round(criteria.confidence * factor);
  }
  
  next();
});

export const Question = mongoose.models.Question || mongoose.model<IQuestion>('Question', QuestionSchema);
