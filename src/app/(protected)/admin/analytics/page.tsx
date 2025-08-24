import { Button } from '@/components/ui/button'
import { APP_CONFIG } from '@/lib/constants'

export default function AdminAnalyticsPage() {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Analytics Dashboard</h1>
          <p className="text-gray-400 text-lg">
            Comprehensive insights and metrics for {APP_CONFIG.name}
          </p>
        </div>

        {/* Date Range Picker */}
        <div className="mb-8">
          <div className="flex space-x-4">
            <Button variant="outline">Last 7 Days</Button>
            <Button variant="outline">Last 30 Days</Button>
            <Button variant="outline">Last 90 Days</Button>
            <Button variant="outline">Custom Range</Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-900 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Total Interviews</h3>
            <p className="text-3xl font-bold text-blue-400">1,247</p>
            <p className="text-green-400 text-sm">+12% from last month</p>
          </div>
          <div className="bg-gray-900 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Active Candidates</h3>
            <p className="text-3xl font-bold text-green-400">892</p>
            <p className="text-green-400 text-sm">+8% from last month</p>
          </div>
          <div className="bg-gray-900 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Success Rate</h3>
            <p className="text-3xl font-bold text-purple-400">78%</p>
            <p className="text-green-400 text-sm">+5% from last month</p>
          </div>
          <div className="bg-gray-900 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Revenue</h3>
            <p className="text-3xl font-bold text-yellow-400">₹2.4M</p>
            <p className="text-green-400 text-sm">+15% from last month</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Interview Trends */}
          <div className="bg-gray-900 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Interview Trends</h3>
            <div className="h-64 bg-gray-800 rounded-lg flex items-center justify-center">
              <p className="text-gray-400">Chart placeholder - Interview volume over time</p>
            </div>
          </div>

          {/* Success Rate by Role */}
          <div className="bg-gray-900 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Success Rate by Role</h3>
            <div className="h-64 bg-gray-800 rounded-lg flex items-center justify-center">
              <p className="text-gray-400">Chart placeholder - Success rate breakdown</p>
            </div>
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Top Recruiters */}
          <div className="bg-gray-900 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Top Recruiters</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">John Doe</span>
                <span className="text-blue-400 font-semibold">156 interviews</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Jane Smith</span>
                <span className="text-blue-400 font-semibold">142 interviews</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Mike Johnson</span>
                <span className="text-blue-400 font-semibold">128 interviews</span>
              </div>
            </div>
          </div>

          {/* Popular Skills */}
          <div className="bg-gray-900 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Popular Skills</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">React.js</span>
                <span className="text-green-400 font-semibold">89% success</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Node.js</span>
                <span className="text-green-400 font-semibold">82% success</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Python</span>
                <span className="text-green-400 font-semibold">76% success</span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-gray-900 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-4">
              <div className="text-sm">
                <p className="text-gray-300">New candidate registered</p>
                <p className="text-gray-500">2 minutes ago</p>
              </div>
              <div className="text-sm">
                <p className="text-gray-300">Interview completed</p>
                <p className="text-gray-500">15 minutes ago</p>
              </div>
              <div className="text-sm">
                <p className="text-gray-300">Recruiter account created</p>
                <p className="text-gray-500">1 hour ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
