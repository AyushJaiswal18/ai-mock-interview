import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { withDB } from '@/lib/db-utils';
import { User } from '@/lib/models/user';
import { generateToken } from '@/lib/jwt';
import { ROLES } from '@/lib/constants';

export async function POST(request: NextRequest) {
  return withDB(async () => {
    try {
      const { email, password, firstName, lastName, role = ROLES.CANDIDATE } = await request.json();

      // Validate input
      if (!email || !password) {
        return NextResponse.json(
          { error: 'Email and password are required' },
          { status: 400 }
        );
      }

      if (password.length < 6) {
        return NextResponse.json(
          { error: 'Password must be at least 6 characters long' },
          { status: 400 }
        );
      }

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return NextResponse.json(
          { error: 'User with this email already exists' },
          { status: 409 }
        );
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
      const user = await User.create({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role,
        isActive: true,
        metadata: {
          profileComplete: !!(firstName && lastName),
          onboardingStep: 0,
        }
      });

      // Generate token
      const token = generateToken({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      });

      return NextResponse.json({
        success: true,
        data: {
          user: {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
          },
          token,
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  });
}
