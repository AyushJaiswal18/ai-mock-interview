import { redirect } from 'next/navigation';
import { getRoleBasedRedirectUrl } from '@/lib/auth';
import { getUserRole } from '@/lib/auth-server';

export default async function DashboardPage() {
  const userRole = await getUserRole();
  
  // Redirect to role-specific dashboard
  const redirectUrl = getRoleBasedRedirectUrl(userRole);
  redirect(redirectUrl);
}
