import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { ROLES } from '@/lib/constants';
import { UserRole } from '@/lib/auth';
import { withDB } from '@/lib/db-utils';
import { User } from '@/lib/models/user';

// Debug endpoint to check database and Clerk status
export async function GET(request: NextRequest) {
  return withDB(async () => {
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

      // Get Clerk users
      const clerkUsersResponse = await (await clerkClient()).users.getUserList();
      const clerkUsers = clerkUsersResponse.data;

      // Get MongoDB users
      const mongoUsers = await User.find({}).lean();

      // Get role counts
      const roleCounts = await User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } }
      ]);

      return NextResponse.json({
        success: true,
        data: {
          clerk: {
            totalUsers: clerkUsersResponse.totalCount,
            users: clerkUsers.map(user => ({
              id: user.id,
              email: user.emailAddresses[0]?.emailAddress,
              firstName: user.firstName,
              lastName: user.lastName,
              role: user.publicMetadata?.role || 'candidate',
              createdAt: user.createdAt,
            }))
          },
          mongodb: {
            totalUsers: mongoUsers.length,
            users: mongoUsers.map(user => ({
              id: user._id,
              clerkId: user.clerkId,
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
              role: user.role,
              isActive: user.isActive,
              createdAt: user.createdAt,
            })),
            roleCounts: roleCounts.reduce((acc: any, item) => {
              acc[item._id] = item.count;
              return acc;
            }, {})
          }
        }
      });
    } catch (error) {
      console.error('Error in debug endpoint:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  });
}
