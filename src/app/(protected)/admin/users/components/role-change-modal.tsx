'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ROLES } from '@/lib/constants';
import { getRoleDisplayName, getRoleBadgeColor } from '@/lib/auth';
import { X, Save, Loader2 } from 'lucide-react';

interface User {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  isActive: boolean;
}

interface RoleChangeModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onRoleChange: (userId: string, newRole: string) => Promise<void>;
}

export function RoleChangeModal({ user, isOpen, onClose, onRoleChange }: RoleChangeModalProps) {
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Update selected role when user changes
  useEffect(() => {
    if (user) {
      setSelectedRole(user.role);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedRole || selectedRole === user.role) {
      return;
    }

    setLoading(true);
    try {
      await onRoleChange(user._id, selectedRole);
      onClose();
    } catch (error) {
      console.error('Error changing role:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !user) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-white/10 rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">
            Change User Role
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="mb-4">
          <p className="text-gray-300 text-sm mb-2">User:</p>
          <div className="bg-white/5 rounded p-3">
            <p className="text-white font-medium">
              {user.firstName && user.lastName 
                ? `${user.firstName} ${user.lastName}`
                : user.email
              }
            </p>
            <p className="text-gray-400 text-sm">{user.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-gray-400 text-sm">Current role:</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${getRoleBadgeColor(user.role as any)}`}>
                {getRoleDisplayName(user.role as any)}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-300 text-sm font-medium mb-2">
              New Role
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              {Object.values(ROLES).map((role) => (
                <option key={role} value={role}>
                  {getRoleDisplayName(role)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || selectedRole === user.role}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Update Role
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
