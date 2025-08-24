'use client';

import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROLES } from '@/lib/constants';
import { getRoleDisplayName, getRoleColor } from '@/lib/auth';

interface UsersFilterProps {
  search: string;
  onSearch: (value: string) => void;
  onRoleFilter: (roles: string[]) => void;
  onStatusFilter: (status: string[]) => void;
  onDateFilter: (from: string | null, to: string | null) => void;
  filters?: {
    roleCounts: Record<string, number>;
    totalActive: number;
    totalInactive: number;
  };
}

export function UsersFilter({
  search,
  onSearch,
  onRoleFilter,
  onStatusFilter,
  onDateFilter,
  filters
}: UsersFilterProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');

  const handleRoleToggle = (role: string) => {
    const newRoles = selectedRoles.includes(role)
      ? selectedRoles.filter(r => r !== role)
      : [...selectedRoles, role];
    
    setSelectedRoles(newRoles);
    onRoleFilter(newRoles);
  };

  const handleStatusToggle = (status: string) => {
    const newStatus = selectedStatus.includes(status)
      ? selectedStatus.filter(s => s !== status)
      : [...selectedStatus, status];
    
    setSelectedStatus(newStatus);
    onStatusFilter(newStatus);
  };

  const handleDateFilter = () => {
    onDateFilter(dateFrom || null, dateTo || null);
  };

  const clearFilters = () => {
    setSelectedRoles([]);
    setSelectedStatus([]);
    setDateFrom('');
    setDateTo('');
    onRoleFilter([]);
    onStatusFilter([]);
    onDateFilter(null, null);
  };

  const hasActiveFilters = selectedRoles.length > 0 || selectedStatus.length > 0 || dateFrom || dateTo;

  return (
    <div className="bg-white/5 rounded-lg p-6">
      {/* Search Bar */}
      <div className="flex items-center gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          Filters
          {hasActiveFilters && (
            <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {selectedRoles.length + selectedStatus.length + (dateFrom ? 1 : 0) + (dateTo ? 1 : 0)}
            </span>
          )}
        </Button>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="space-y-4 pt-4 border-t border-white/10">
          {/* Role Filter */}
          <div>
            <h3 className="text-sm font-medium text-white mb-3">Role</h3>
            <div className="flex flex-wrap gap-2">
              {Object.values(ROLES).map((role) => (
                <button
                  key={role}
                  onClick={() => handleRoleToggle(role)}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                    selectedRoles.includes(role)
                      ? `${getRoleColor(role)} border-current bg-current/10`
                      : 'border-white/20 text-gray-300 hover:border-white/40'
                  }`}
                >
                  {getRoleDisplayName(role)}
                  {filters?.roleCounts[role] && (
                    <span className="ml-1 text-xs opacity-75">
                      ({filters.roleCounts[role]})
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <h3 className="text-sm font-medium text-white mb-3">Status</h3>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'active', label: 'Active', count: filters?.totalActive },
                { key: 'inactive', label: 'Inactive', count: filters?.totalInactive }
              ].map((status) => (
                <button
                  key={status.key}
                  onClick={() => handleStatusToggle(status.key)}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                    selectedStatus.includes(status.key)
                      ? status.key === 'active'
                        ? 'text-green-400 border-green-400 bg-green-400/10'
                        : 'text-red-400 border-red-400 bg-red-400/10'
                      : 'border-white/20 text-gray-300 hover:border-white/40'
                  }`}
                >
                  {status.label}
                  {status.count !== undefined && (
                    <span className="ml-1 text-xs opacity-75">
                      ({status.count})
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Date Range Filter */}
          <div>
            <h3 className="text-sm font-medium text-white mb-3">Date Range</h3>
            <div className="flex items-center gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">From</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="px-3 py-1 bg-white/10 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">To</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="px-3 py-1 bg-white/10 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <Button
                size="sm"
                onClick={handleDateFilter}
                className="mt-6"
              >
                Apply
              </Button>
            </div>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
