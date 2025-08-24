import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { ROLES } from '@/lib/constants';
import { getRoleBasedRedirectUrl, canAccessRoute, UserRole } from '@/lib/auth';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) {
    redirect('/sign-in');
  }

  // Get user's role from Clerk metadata
  const userRole = (user.publicMetadata?.role as UserRole) || ROLES.CANDIDATE;
  
  // Get current path
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  
  // Check if user can access the current route
  if (!canAccessRoute(userRole, pathname)) {
    const redirectUrl = getRoleBasedRedirectUrl(userRole);
    redirect(redirectUrl);
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {children}
    </div>
  );
}
