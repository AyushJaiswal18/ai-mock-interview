import { redirect } from 'next/navigation';
import { ROLES } from '@/lib/constants';
import { getRoleBasedRedirectUrl, UserRole } from '@/lib/auth';
import { getUserRole } from '@/lib/auth-server';

export default async function RecruiterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userRole = await getUserRole();
  
  // Only allow recruiter and admin access
  if (userRole !== ROLES.RECRUITER && userRole !== ROLES.ADMIN) {
    const redirectUrl = getRoleBasedRedirectUrl(userRole);
    redirect(redirectUrl);
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {children}
    </div>
  );
}
