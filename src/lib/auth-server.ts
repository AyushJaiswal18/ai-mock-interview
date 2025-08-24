import { auth, currentUser } from '@clerk/nextjs/server';
import { ROLES } from './constants';
import { UserRole, isValidRole } from './auth';

// Get current user with role (server-side)
export async function getCurrentUser(): Promise<{
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
} | null> {
  try {
    const user = await currentUser();
    if (!user) return null;

    // Get role from Clerk metadata
    const role = (user.publicMetadata?.role as UserRole) || ROLES.CANDIDATE;

    return {
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress || '',
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
      role,
      isActive: true,
      createdAt: new Date(user.createdAt),
      updatedAt: new Date(),
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// Get user role from auth context (server-side)
export async function getUserRole(): Promise<UserRole> {
  try {
    const { userId } = await auth();
    if (!userId) return ROLES.CANDIDATE;

    const user = await currentUser();
    if (!user) return ROLES.CANDIDATE;

    const rawRole = (user.publicMetadata?.role as string) || ROLES.CANDIDATE;
    return isValidRole(rawRole) ? rawRole : ROLES.CANDIDATE;
  } catch (error) {
    console.error('Error getting user role:', error);
    return ROLES.CANDIDATE;
  }
}
