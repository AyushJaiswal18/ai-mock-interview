'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { ROLES } from '@/lib/constants';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }

      // Check if user can access the current route based on their role
      if (user?.role) {
        const canAccess = canAccessRoute(user.role, pathname);
        if (!canAccess) {
          // Redirect based on user role
          switch (user.role) {
            case ROLES.ADMIN:
              router.push('/admin/dashboard');
              break;
            case ROLES.RECRUITER:
              router.push('/recruiter/dashboard');
              break;
            case ROLES.CANDIDATE:
              router.push('/candidate/dashboard');
              break;
            default:
              router.push('/dashboard');
          }
        }
      }
    }
  }, [user?.role, isAuthenticated, loading, router, pathname]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render content if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {children}
    </div>
  );
}

// Helper function to check if user can access a route
function canAccessRoute(userRole: string, pathname: string): boolean {
  if (pathname.startsWith('/admin/')) {
    return userRole === ROLES.ADMIN;
  }
  if (pathname.startsWith('/recruiter/')) {
    return userRole === ROLES.RECRUITER;
  }
  if (pathname.startsWith('/candidate/')) {
    return userRole === ROLES.CANDIDATE;
  }
  return true; // Allow access to other routes
}
