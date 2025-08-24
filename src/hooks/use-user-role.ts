'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { ROLES } from '@/lib/constants';
import { getUserPermissions, hasPermission, UserRole } from '@/lib/auth';

interface UseUserRoleReturn {
  role: UserRole;
  permissions: ReturnType<typeof getUserPermissions>;
  hasPermission: (permission: keyof ReturnType<typeof getUserPermissions>) => boolean;
  isLoading: boolean;
  error: string | null;
}

export function useUserRole(): UseUserRoleReturn {
  const { user, isLoaded } = useUser();
  const [role, setRole] = useState<UserRole>(ROLES.CANDIDATE);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;

    if (!user) {
      setRole(ROLES.CANDIDATE);
      setIsLoading(false);
      return;
    }

    // Get role from Clerk metadata
    const userRole = (user.publicMetadata?.role as UserRole) || ROLES.CANDIDATE;
    setRole(userRole);
    setIsLoading(false);
  }, [user, isLoaded]);

  const permissions = getUserPermissions(role);

  const checkPermission = (permission: keyof ReturnType<typeof getUserPermissions>) => {
    return hasPermission(role, permission);
  };

  return {
    role,
    permissions,
    hasPermission: checkPermission,
    isLoading,
    error,
  };
}
