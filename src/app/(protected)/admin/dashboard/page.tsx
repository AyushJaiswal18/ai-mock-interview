import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  Users, 
  UserCheck, 
  BarChart3, 
  Settings, 
  Plus,
  Activity,
  Target
} from "lucide-react";
import { APP_CONFIG } from "@/lib/constants";

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">
                Admin Dashboard
              </h1>
              <p className="text-gray-300 mt-2">
                Manage your {APP_CONFIG.name} platform
              </p>
            </div>
            <Button asChild>
              <Link href="/admin/recruiters">
                <Plus className="w-4 h-4 mr-2" />
                Add Recruiter
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="p-6 rounded-xl bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-blue-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Total Recruiters</p>
                <p className="text-2xl font-bold text-white">24</p>
              </div>
              <Users className="w-8 h-8 text-blue-400" />
            </div>
          </div>

          <div className="p-6 rounded-xl bg-gradient-to-br from-green-600/20 to-green-800/20 border border-green-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Active Candidates</p>
                <p className="text-2xl font-bold text-white">156</p>
              </div>
              <UserCheck className="w-8 h-8 text-green-400" />
            </div>
          </div>

          <div className="p-6 rounded-xl bg-gradient-to-br from-purple-600/20 to-purple-800/20 border border-purple-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Interviews Today</p>
                <p className="text-2xl font-bold text-white">12</p>
              </div>
              <Activity className="w-8 h-8 text-purple-400" />
            </div>
          </div>

          <div className="p-6 rounded-xl bg-gradient-to-br from-pink-600/20 to-pink-800/20 border border-pink-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Success Rate</p>
                <p className="text-2xl font-bold text-white">87%</p>
              </div>
              <Target className="w-8 h-8 text-pink-400" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/admin/users">
            <div className="p-6 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
              <Users className="w-8 h-8 text-blue-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">User Management</h3>
              <p className="text-gray-300 text-sm">
                Manage all users, roles, and permissions
              </p>
            </div>
          </Link>

          <Link href="/admin/analytics">
            <div className="p-6 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
              <BarChart3 className="w-8 h-8 text-green-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Analytics</h3>
              <p className="text-gray-300 text-sm">
                View platform performance and insights
              </p>
            </div>
          </Link>

          <Link href="/admin/settings">
            <div className="p-6 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
              <Settings className="w-8 h-8 text-purple-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Settings</h3>
              <p className="text-gray-300 text-sm">
                Configure platform settings and preferences
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}