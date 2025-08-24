import { ROLES } from './constants';

// User role type
export type UserRole = typeof ROLES[keyof typeof ROLES];

// User interface
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Role permissions interface
export interface RolePermissions {
  canAccessAdmin: boolean;
  canAccessRecruiter: boolean;
  canAccessCandidate: boolean;
  canManageUsers: boolean;
  canManageRecruiters: boolean;
  canViewAnalytics: boolean;
  canManageCandidates: boolean;
  canScheduleInterviews: boolean;
  canPracticeInterviews: boolean;
  canViewProfile: boolean;
}

// Role permissions mapping
export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  [ROLES.ADMIN]: {
    canAccessAdmin: true,
    canAccessRecruiter: true,
    canAccessCandidate: true,
    canManageUsers: true,
    canManageRecruiters: true,
    canViewAnalytics: true,
    canManageCandidates: true,
    canScheduleInterviews: true,
    canPracticeInterviews: true,
    canViewProfile: true,
  },
  [ROLES.RECRUITER]: {
    canAccessAdmin: false,
    canAccessRecruiter: true,
    canAccessCandidate: false,
    canManageUsers: false,
    canManageRecruiters: false,
    canViewAnalytics: false,
    canManageCandidates: true,
    canScheduleInterviews: true,
    canPracticeInterviews: false,
    canViewProfile: false,
  },
  [ROLES.CANDIDATE]: {
    canAccessAdmin: false,
    canAccessRecruiter: false,
    canAccessCandidate: true,
    canManageUsers: false,
    canManageRecruiters: false,
    canViewAnalytics: false,
    canManageCandidates: false,
    canScheduleInterviews: false,
    canPracticeInterviews: true,
    canViewProfile: true,
  },
};

// Get user permissions
export function getUserPermissions(role: UserRole): RolePermissions {
  return ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS[ROLES.CANDIDATE];
}

// Check if user has specific permission
export function hasPermission(userRole: UserRole, permission: keyof RolePermissions): boolean {
  const permissions = getUserPermissions(userRole);
  return permissions[permission] || false;
}

// Check if user can access a specific route
export function canAccessRoute(userRole: UserRole, route: string): boolean {
  const permissions = getUserPermissions(userRole);
  
  // Admin routes
  if (route.startsWith('/admin')) {
    return permissions.canAccessAdmin;
  }
  
  // Recruiter routes
  if (route.startsWith('/recruiter')) {
    return permissions.canAccessRecruiter;
  }
  
  // Candidate routes
  if (route.startsWith('/candidate')) {
    return permissions.canAccessCandidate;
  }
  
  // Dashboard route - all authenticated users can access
  if (route === '/dashboard') {
    return true;
  }
  
  return true; // Public routes
}

// Get role-based redirect URL
export function getRoleBasedRedirectUrl(role: UserRole): string {
  switch (role) {
    case ROLES.ADMIN:
      return '/admin/dashboard';
    case ROLES.RECRUITER:
      return '/recruiter/dashboard';
    case ROLES.CANDIDATE:
      return '/candidate/dashboard';
    default:
      return '/dashboard';
  }
}

// Validate role
export function isValidRole(role: string): role is UserRole {
  return Object.values(ROLES).includes(role as UserRole);
}

// Get role display name
export function getRoleDisplayName(role: UserRole): string {
  switch (role) {
    case ROLES.ADMIN:
      return 'Administrator';
    case ROLES.RECRUITER:
      return 'Recruiter';
    case ROLES.CANDIDATE:
      return 'Candidate';
    default:
      return 'User';
  }
}

// Get role color for UI
export function getRoleColor(role: UserRole): string {
  switch (role) {
    case ROLES.ADMIN:
      return 'text-red-400';
    case ROLES.RECRUITER:
      return 'text-blue-400';
    case ROLES.CANDIDATE:
      return 'text-green-400';
    default:
      return 'text-gray-400';
  }
}

// Get role badge color
export function getRoleBadgeColor(role: UserRole): string {
  switch (role) {
    case ROLES.ADMIN:
      return 'bg-red-500/20 border-red-500/30 text-red-400';
    case ROLES.RECRUITER:
      return 'bg-blue-500/20 border-blue-500/30 text-blue-400';
    case ROLES.CANDIDATE:
      return 'bg-green-500/20 border-green-500/30 text-green-400';
    default:
      return 'bg-gray-500/20 border-gray-500/30 text-gray-400';
  }
}
