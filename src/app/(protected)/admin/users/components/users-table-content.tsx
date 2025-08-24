'use client';

import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { getRoleDisplayName, getRoleBadgeColor } from '@/lib/auth';
import { ChevronUp, ChevronDown, Edit, Eye, UserCog } from 'lucide-react';
import { RoleChangeModal } from './role-change-modal';

interface User {
  _id: string;

  email: string;
  firstName?: string;
  lastName?: string;
  fullName: string;
  role: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface UsersTableContentProps {
  users: User[];
  loading: boolean;
  selectedUsers: string[];
  onUserSelect: (userId: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onSort: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  pagination: any;
  onPageChange: (page: number) => void;
  onUserUpdate: () => void;
}

export function UsersTableContent({
  users = [],
  loading,
  selectedUsers = [],
  onUserSelect,
  onSelectAll,
  onSort,
  pagination,
  onPageChange,
  onUserUpdate
}: UsersTableContentProps) {
  const [sortConfig, setSortConfig] = useState<{ field: string; order: 'asc' | 'desc' }>({
    field: 'createdAt',
    order: 'desc'
  });
  const [roleModalUser, setRoleModalUser] = useState<User | null>(null);
  const [roleModalOpen, setRoleModalOpen] = useState(false);

  const handleSort = (field: string) => {
    const newOrder = sortConfig.field === field && sortConfig.order === 'asc' ? 'desc' : 'asc';
    setSortConfig({ field, order: newOrder });
    onSort(field, newOrder);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || '?';
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update role');
      }

      // Refresh the user list
      onUserUpdate();
    } catch (error) {
      console.error('Error updating role:', error);
      throw error;
    }
  };

  const openRoleModal = (user: User) => {
    setRoleModalUser(user);
    setRoleModalOpen(true);
  };

  if (loading) {
    return (
      <div className="bg-white/5 rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-4 w-4 bg-white/10 rounded" />
                <div className="h-10 w-10 bg-white/10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-white/10 rounded w-32" />
                  <div className="h-3 bg-white/10 rounded w-48" />
                </div>
                <div className="h-6 bg-white/10 rounded w-20" />
                <div className="h-6 bg-white/10 rounded w-16" />
                <div className="h-8 bg-white/10 rounded w-24" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="bg-white/5 rounded-lg p-12 text-center">
        <div className="text-gray-400 mb-4">No users found</div>
        <p className="text-sm text-gray-500">
          Try adjusting your search or filter criteria
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white/5 rounded-lg overflow-hidden">
      {/* Table Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center space-x-4">
          <Checkbox
            checked={selectedUsers.length === (users?.length || 0) && (users?.length || 0) > 0}
            onCheckedChange={onSelectAll}
            className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
          />
          <span className="text-sm font-medium text-white">Users</span>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-white/5">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('role')}
                  className="flex items-center gap-1 hover:text-white transition-colors"
                >
                  Role
                  {sortConfig.field === 'role' && (
                    sortConfig.order === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('lastLoginAt')}
                  className="flex items-center gap-1 hover:text-white transition-colors"
                >
                  Last Login
                  {sortConfig.field === 'lastLoginAt' && (
                    sortConfig.order === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('createdAt')}
                  className="flex items-center gap-1 hover:text-white transition-colors"
                >
                  Created
                  {sortConfig.field === 'createdAt' && (
                    sortConfig.order === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {(users || []).map((user) => (
              <tr key={user._id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-4">
                    <Checkbox
                      checked={selectedUsers.includes(user._id)}
                      onCheckedChange={(checked) => onUserSelect(user._id, checked as boolean)}
                      className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                    />
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium text-sm">
                      {getInitials(user.firstName, user.lastName)}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">
                        {user.fullName}
                      </div>
                      <div className="text-sm text-gray-400">
                        {user.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(user.role as any)}`}>
                    {getRoleDisplayName(user.role as any)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    user.isActive
                      ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                      : 'bg-red-500/20 border border-red-500/30 text-red-400'
                  }`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-300">
                  {user.lastLoginAt ? formatDateTime(user.lastLoginAt) : 'Never'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-300">
                  {formatDate(user.createdAt)}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      title="View user details"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      title="Change user role"
                      onClick={() => openRoleModal(user)}
                    >
                      <UserCog className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      title="Edit user"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="px-6 py-4 border-t border-white/10">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} users
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(pagination.page - 1)}
                disabled={!pagination.hasPrevPage}
              >
                Previous
              </Button>
              
              <span className="text-sm text-gray-400">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(pagination.page + 1)}
                disabled={!pagination.hasNextPage}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Role Change Modal */}
      <RoleChangeModal
        user={roleModalUser}
        isOpen={roleModalOpen}
        onClose={() => {
          setRoleModalOpen(false);
          setRoleModalUser(null);
        }}
        onRoleChange={handleRoleChange}
      />
    </div>
  );
}
