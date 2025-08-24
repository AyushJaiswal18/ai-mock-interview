import { redirect } from 'next/navigation';
import { ROLES } from '@/lib/constants';
import { getRoleBasedRedirectUrl, UserRole } from '@/lib/auth';
import { getUserRole } from '@/lib/auth-server';

export default async function CandidateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userRole = await getUserRole();
  
  // Only allow candidate and admin access
  if (userRole !== ROLES.CANDIDATE && userRole !== ROLES.ADMIN) {
    const redirectUrl = getRoleBasedRedirectUrl(userRole);
    redirect(redirectUrl);
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {children}
    </div>
  );
}
