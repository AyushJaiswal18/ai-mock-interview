import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { ROLES } from '@/lib/constants';
import { UserRole } from '@/lib/auth';
import { withDB } from '@/lib/db-utils';
import { User } from '@/lib/models/user';

// Sync Clerk users with MongoDB
export async function POST(request: NextRequest) {
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

      // Get all users from Clerk
      const clerkUsersResponse = await (await clerkClient()).users.getUserList();
      const clerkUsers = clerkUsersResponse.data;

      let syncedCount = 0;
      let updatedCount = 0;
      let errors: string[] = [];

      // Process each Clerk user
      for (const clerkUser of clerkUsers) {
        try {
          const userEmail = clerkUser.emailAddresses[0]?.emailAddress;
          if (!userEmail) {
            errors.push(`User ${clerkUser.id} has no email address`);
            continue;
          }

          // Check if user already exists in MongoDB
          const existingUser = await User.findOne({ clerkId: clerkUser.id });

          if (existingUser) {
            // Update existing user
            await User.updateOne(
              { clerkId: clerkUser.id },
              {
                $set: {
                  email: userEmail,
                  firstName: clerkUser.firstName || undefined,
                  lastName: clerkUser.lastName || undefined,
                  role: (clerkUser.publicMetadata?.role as UserRole) || ROLES.CANDIDATE,
                  isActive: true,
                  updatedAt: new Date(),
                }
              }
            );
            updatedCount++;
          } else {
            // Create new user
            await User.create({
              clerkId: clerkUser.id,
              email: userEmail,
              firstName: clerkUser.firstName || undefined,
              lastName: clerkUser.lastName || undefined,
              role: (clerkUser.publicMetadata?.role as UserRole) || ROLES.CANDIDATE,
              isActive: true,
              lastLoginAt: clerkUser.lastSignInAt ? new Date(clerkUser.lastSignInAt) : undefined,
              metadata: {
                profileComplete: !!(clerkUser.firstName && clerkUser.lastName),
                onboardingStep: 0,
              }
            });
            syncedCount++;
          }
        } catch (error) {
          console.error(`Error syncing user ${clerkUser.id}:`, error);
          errors.push(`Failed to sync user ${clerkUser.id}: ${error}`);
        }
      }

      return NextResponse.json({
        success: true,
        message: 'User sync completed',
        data: {
          synced: syncedCount,
          updated: updatedCount,
          total: clerkUsersResponse.totalCount,
          errors: errors.length > 0 ? errors : undefined,
        }
      });
    } catch (error) {
      console.error('Error syncing users:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  });
}
