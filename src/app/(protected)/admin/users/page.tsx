import { Suspense } from 'react';
import { UsersTable } from './components/users-table';
import { UsersHeader } from './components/users-header';
import { UsersSkeleton } from './components/users-skeleton';

export default function AdminUsersPage() {
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        <UsersHeader />
        
        <Suspense fallback={<UsersSkeleton />}>
          <UsersTable />
        </Suspense>
      </div>
    </div>
  );
}
