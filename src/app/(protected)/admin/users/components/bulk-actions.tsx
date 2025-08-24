'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ROLES } from '@/lib/constants';
import { getRoleDisplayName } from '@/lib/auth';
import { Users, Settings, Trash2, X } from 'lucide-react';

interface BulkActionsProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkAction: (action: string, data?: any) => void;
}

export function BulkActions({
  selectedCount,
  onClearSelection,
  onBulkAction
}: BulkActionsProps) {
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('');

  const handleRoleChange = () => {
    if (selectedRole) {
      onBulkAction('changeRole', { role: selectedRole });
      setShowRoleSelector(false);
      setSelectedRole('');
    }
  };

  const handleDeactivate = () => {
    if (confirm(`Are you sure you want to deactivate ${selectedCount} user(s)?`)) {
      onBulkAction('deactivate');
    }
  };

  return (
    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-blue-400" />
          <span className="text-blue-400 font-medium">
            {selectedCount} user{selectedCount !== 1 ? 's' : ''} selected
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Role Change */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRoleSelector(!showRoleSelector)}
              className="flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Change Role
            </Button>

            {showRoleSelector && (
              <div className="absolute right-0 top-full mt-2 bg-white/10 border border-white/20 rounded-lg p-3 min-w-48 z-10">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white">
                    Select New Role
                  </label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Choose role...</option>
                    {Object.values(ROLES).map((role) => (
                      <option key={role} value={role}>
                        {getRoleDisplayName(role)}
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      onClick={handleRoleChange}
                      disabled={!selectedRole}
                    >
                      Apply
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowRoleSelector(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Deactivate */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleDeactivate}
            className="flex items-center gap-2 text-red-400 border-red-400/30 hover:bg-red-400/10"
          >
            <Trash2 className="w-4 h-4" />
            Deactivate
          </Button>

          {/* Clear Selection */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            className="flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Clear
          </Button>
        </div>
      </div>
    </div>
  );
}
