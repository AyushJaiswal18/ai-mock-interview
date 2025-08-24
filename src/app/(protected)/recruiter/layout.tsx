'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { ROLES } from '@/lib/constants';

export default function RecruiterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }

                    if (user?.role !== ROLES.RECRUITER) {
        // Redirect based on user role
        switch (user?.role) {
          case ROLES.ADMIN:
            router.push('/admin/dashboard');
            break;
          case ROLES.CANDIDATE:
            router.push('/candidate/dashboard');
            break;
          default:
            router.push('/dashboard');
        }
        return; // Don't render recruiter content
      }
    }
  }, [user?.role, isAuthenticated, loading, router]);

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

  // Don't render recruiter content if not authenticated or not recruiter
  if (!isAuthenticated || user?.role !== ROLES.RECRUITER) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Redirecting to your dashboard...</p>
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
