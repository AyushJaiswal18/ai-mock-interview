import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { ROLES } from '@/lib/constants';
import { isValidRole, UserRole } from '@/lib/auth';

// Get user's current role
export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await (await clerkClient()).users.getUser(userId);
    const role = (user.publicMetadata?.role as UserRole) || ROLES.CANDIDATE;

    return NextResponse.json({
      success: true,
      role,
      userId,
    });
  } catch (error) {
    console.error('Error getting user role:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update user's role (Admin only)
export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if current user is admin
    const currentUser = await (await clerkClient()).users.getUser(userId);
    const currentUserRole = (currentUser.publicMetadata?.role as UserRole) || ROLES.CANDIDATE;
    
    if (currentUserRole !== ROLES.ADMIN) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { targetUserId, role } = await request.json();

    if (!targetUserId || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!isValidRole(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    // Update user's role in Clerk
    await (await clerkClient()).users.updateUser(targetUserId, {
      publicMetadata: { role },
    });

    return NextResponse.json({
      success: true,
      message: 'Role updated successfully',
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
