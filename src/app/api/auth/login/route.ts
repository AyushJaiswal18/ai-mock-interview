import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { withDB } from '@/lib/db-utils';
import { User } from '@/lib/models/user';
import { generateToken } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  return withDB(async () => {
    try {
      const { email, password } = await request.json();

      // Validate input
      if (!email || !password) {
        return NextResponse.json(
          { error: 'Email and password are required' },
          { status: 400 }
        );
      }

      // Find user
      const user = await User.findOne({ email }).lean() as any;
      if (!user) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        );
      }

      // Check if user is active
      if (!user.isActive) {
        return NextResponse.json(
          { error: 'Account is deactivated' },
          { status: 401 }
        );
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        );
      }

      // Update last login
      await User.findByIdAndUpdate(user._id, {
        lastLoginAt: new Date(),
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
      console.error('Login error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  });
}
