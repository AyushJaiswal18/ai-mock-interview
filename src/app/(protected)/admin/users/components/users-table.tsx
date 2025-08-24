'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { UsersFilter } from './users-filter';
import { UsersTableContent } from './users-table-content';
import { BulkActions } from './bulk-actions';
import { useDebounce } from '@/hooks/use-debounce';

interface User {
  _id: string;
  clerkId: string;
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

interface UsersResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  filters: {
    roleCounts: Record<string, number>;
    totalActive: number;
    totalInactive: number;
  };
}

export function UsersTable() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [filters, setFilters] = useState<any>(null);

  // Debounced search
  const search = searchParams.get('search') || '';
  const debouncedSearch = useDebounce(search, 300);

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams(searchParams);
      const response = await fetch(`/api/admin/users?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data: UsersResponse = await response.json();
      console.log('API Response:', data);
      setUsers(data.users);
      setPagination(data.pagination);
      setFilters(data.filters);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Update URL params
  const updateSearchParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams);
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    // Reset to page 1 when filters change
    if (Object.keys(updates).some(key => key !== 'page')) {
      params.set('page', '1');
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  // Handle search
  const handleSearch = (value: string) => {
    updateSearchParams({ search: value || null });
  };

  // Handle role filter
  const handleRoleFilter = (roles: string[]) => {
    updateSearchParams({ roles: roles.length > 0 ? roles.join(',') : null });
  };

  // Handle status filter
  const handleStatusFilter = (status: string[]) => {
    updateSearchParams({ status: status.length > 0 ? status.join(',') : null });
  };

  // Handle date filter
  const handleDateFilter = (from: string | null, to: string | null) => {
    updateSearchParams({
      dateFrom: from,
      dateTo: to,
    });
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    updateSearchParams({ page: page.toString() });
  };

  // Handle sorting
  const handleSort = (sortBy: string, sortOrder: 'asc' | 'desc') => {
    updateSearchParams({
      sortBy,
      sortOrder,
    });
  };

  // Handle user selection
  const handleUserSelect = (userId: string, selected: boolean) => {
    if (selected) {
      setSelectedUsers(prev => [...prev, userId]);
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    }
  };

  // Handle select all
  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedUsers(users?.map(user => user._id) || []);
    } else {
      setSelectedUsers([]);
    }
  };

  // Fetch users when params change
  useEffect(() => {
    fetchUsers();
  }, [debouncedSearch, searchParams]);

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6">
        <p className="text-red-400">Error: {error}</p>
        <button 
          onClick={fetchUsers}
          className="mt-2 text-sm text-red-300 hover:text-red-200"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <UsersFilter
        search={search}
        onSearch={handleSearch}
        onRoleFilter={handleRoleFilter}
        onStatusFilter={handleStatusFilter}
        onDateFilter={handleDateFilter}
        filters={filters}
      />

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <BulkActions
          selectedCount={selectedUsers.length}
          onClearSelection={() => setSelectedUsers([])}
          onBulkAction={(action: string) => {
            // Handle bulk actions
            console.log('Bulk action:', action, selectedUsers);
          }}
        />
      )}

      {/* Table */}
      <UsersTableContent
        users={users}
        loading={loading}
        selectedUsers={selectedUsers}
        onUserSelect={handleUserSelect}
        onSelectAll={handleSelectAll}
        onSort={handleSort}
        pagination={pagination}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
