import mongoose, { Schema, Document } from 'mongoose';
import { ROLES } from '@/lib/constants';
import { UserRole } from '@/lib/auth';

export interface IUser extends Document {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  metadata?: {
    profileComplete?: boolean;
    onboardingStep?: number;
    avatarUrl?: string;
    phoneNumber?: string;
    timezone?: string;
    preferences?: {
      emailNotifications?: boolean;
      pushNotifications?: boolean;
      theme?: 'light' | 'dark' | 'system';
    };
  };
}

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  password: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    trim: true,
  },
  lastName: {
    type: String,
    trim: true,
  },
  role: {
    type: String,
    enum: Object.values(ROLES),
    default: ROLES.CANDIDATE,
    required: true,
    index: true,
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true,
  },
  lastLoginAt: {
    type: Date,
    index: true,
  },
  metadata: {
    profileComplete: {
      type: Boolean,
      default: false,
    },
    onboardingStep: {
      type: Number,
      default: 0,
    },
    avatarUrl: String,
    phoneNumber: String,
    timezone: String,
    preferences: {
      emailNotifications: {
        type: Boolean,
        default: true,
      },
      pushNotifications: {
        type: Boolean,
        default: true,
      },
      theme: {
        type: String,
        enum: ['light', 'dark', 'system'],
        default: 'system',
      },
    },
  },
}, {
  timestamps: true,
});

// Compound indexes for common queries
UserSchema.index({ role: 1, isActive: 1 });
UserSchema.index({ role: 1, lastLoginAt: -1 });
UserSchema.index({ email: 1, role: 1 });
UserSchema.index({ createdAt: -1, role: 1 });



// Virtual for full name
UserSchema.virtual('fullName').get(function() {
  if (this.firstName && this.lastName) {
    return `${this.firstName} ${this.lastName}`;
  }
  return this.firstName || this.lastName || this.email;
});

// Ensure virtuals are serialized
UserSchema.set('toJSON', { virtuals: true });
UserSchema.set('toObject', { virtuals: true });

// Check if model already exists to prevent overwrite
export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
