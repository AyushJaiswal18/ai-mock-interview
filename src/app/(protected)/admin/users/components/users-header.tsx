'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Users, Plus, Download } from 'lucide-react';

export function UsersHeader() {
  const [syncing, setSyncing] = useState(false);

  const handleSyncUsers = async () => {
    try {
      setSyncing(true);
      // For now, just refresh the page since we don't have a sync endpoint
      window.location.reload();
    } catch (error) {
      console.error('Error refreshing users:', error);
      alert('Error refreshing users');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            User Management
          </h1>
          <p className="text-gray-400">
            Manage user accounts, roles, and permissions
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={handleSyncUsers} disabled={syncing}>
            <Users className="w-4 h-4 mr-2" />
            {syncing ? 'Syncing...' : 'Sync Users'}
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>
    </div>
  );
}
