import { NextRequest, NextResponse } from 'next/server';
import { withDB } from '@/lib/db-utils';
import { User } from '@/lib/models/user';
import { requireAdmin, AuthenticatedRequest } from '@/lib/auth-middleware';
import { isValidRole } from '@/lib/auth';

// Update user (PATCH)
export const PATCH = requireAdmin(async (request: AuthenticatedRequest, { params }: { params: { id: string } }) => {
  return withDB(async () => {
    try {
      const { id } = params;
      const body = await request.json();
      
      // Validate user exists
      const existingUser = await User.findById(id);
      if (!existingUser) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      // Prepare update data
      const updateData: any = {};
      
      // Handle role update
      if (body.role) {
        if (!isValidRole(body.role)) {
          return NextResponse.json(
            { error: 'Invalid role' },
            { status: 400 }
          );
        }
        updateData.role = body.role;
      }

      // Handle status update
      if (typeof body.isActive === 'boolean') {
        updateData.isActive = body.isActive;
      }

      // Handle name updates
      if (body.firstName !== undefined) {
        updateData.firstName = body.firstName;
      }
      if (body.lastName !== undefined) {
        updateData.lastName = body.lastName;
      }

      // Update user
      const updatedUser = await User.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).lean();

      return NextResponse.json({
        success: true,
        data: {
          user: updatedUser
        }
      });
    } catch (error) {
      console.error('Error updating user:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  });
});

// Delete user (DELETE)
export const DELETE = requireAdmin(async (request: AuthenticatedRequest, { params }: { params: { id: string } }) => {
  return withDB(async () => {
    try {
      const { id } = params;
      
      // Validate user exists
      const existingUser = await User.findById(id);
      if (!existingUser) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      // Delete user
      await User.findByIdAndDelete(id);

      return NextResponse.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  });
});
