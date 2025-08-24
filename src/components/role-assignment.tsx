'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ROLES } from '@/lib/constants';
import { getRoleDisplayName, getRoleBadgeColor, UserRole } from '@/lib/auth';

interface RoleAssignmentProps {
  userId: string;
  currentRole: UserRole;
  onRoleUpdate: (userId: string, newRole: UserRole) => void;
}

export default function RoleAssignment({ userId, currentRole, onRoleUpdate }: RoleAssignmentProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentRole);

  const handleRoleUpdate = async () => {
    if (selectedRole === currentRole) return;

    setIsUpdating(true);
    try {
      const response = await fetch('/api/auth/role', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetUserId: userId,
          role: selectedRole,
        }),
      });

      if (response.ok) {
        onRoleUpdate(userId, selectedRole);
      } else {
        console.error('Failed to update role');
      }
    } catch (error) {
      console.error('Error updating role:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(currentRole)}`}>
          {getRoleDisplayName(currentRole)}
        </span>
      </div>
      
      <select
        value={selectedRole}
        onChange={(e) => setSelectedRole(e.target.value as UserRole)}
        className="bg-gray-800 border border-gray-600 rounded px-3 py-1 text-white text-sm"
        disabled={isUpdating}
      >
        {Object.values(ROLES).map((role) => (
          <option key={role} value={role}>
            {getRoleDisplayName(role)}
          </option>
        ))}
      </select>
      
      <Button
        onClick={handleRoleUpdate}
        disabled={selectedRole === currentRole || isUpdating}
        size="sm"
        className="bg-blue-600 hover:bg-blue-700 text-white"
      >
        {isUpdating ? 'Updating...' : 'Update Role'}
      </Button>
    </div>
  );
}
