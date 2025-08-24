import { Button } from '@/components/ui/button'
import { APP_CONFIG } from '@/lib/constants'

export default function RecruiterDashboardPage() {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Recruiter Dashboard</h1>
          <p className="text-gray-400 text-lg">
            Manage candidates and track interview progress
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-900 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Total Candidates</h3>
            <p className="text-3xl font-bold text-blue-400">156</p>
            <p className="text-green-400 text-sm">+12 this week</p>
          </div>
          <div className="bg-gray-900 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Active Interviews</h3>
            <p className="text-3xl font-bold text-green-400">23</p>
            <p className="text-green-400 text-sm">5 scheduled today</p>
          </div>
          <div className="bg-gray-900 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Hired This Month</h3>
            <p className="text-3xl font-bold text-purple-400">8</p>
            <p className="text-green-400 text-sm">+2 from last month</p>
          </div>
          <div className="bg-gray-900 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Success Rate</h3>
            <p className="text-3xl font-bold text-yellow-400">76%</p>
            <p className="text-green-400 text-sm">+8% improvement</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-gray-900 rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-6">Recent Activity</h2>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 bg-gray-800 rounded-lg">
                  <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Alice Smith completed interview</h3>
                    <p className="text-gray-400 text-sm">Senior Frontend Developer - 85% score</p>
                    <p className="text-gray-500 text-xs">2 hours ago</p>
                  </div>
                  <Button size="sm" variant="outline">View Report</Button>
                </div>

                <div className="flex items-center space-x-4 p-4 bg-gray-800 rounded-lg">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">📅</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Interview scheduled with Bob Johnson</h3>
                    <p className="text-gray-400 text-sm">Full Stack Developer - Tomorrow 2:00 PM</p>
                    <p className="text-gray-500 text-xs">1 hour ago</p>
                  </div>
                  <Button size="sm" variant="outline">Reschedule</Button>
                </div>

                <div className="flex items-center space-x-4 p-4 bg-gray-800 rounded-lg">
                  <div className="w-10 h-10 bg-yellow-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">📊</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Carol Wilson assessment completed</h3>
                    <p className="text-gray-400 text-sm">DevOps Engineer - 68% score</p>
                    <p className="text-gray-500 text-xs">3 hours ago</p>
                  </div>
                  <Button size="sm" variant="outline">View Report</Button>
                </div>

                <div className="flex items-center space-x-4 p-4 bg-gray-800 rounded-lg">
                  <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">🎉</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">David Miller hired</h3>
                    <p className="text-gray-400 text-sm">Backend Developer - 91% final score</p>
                    <p className="text-gray-500 text-xs">1 day ago</p>
                  </div>
                  <Button size="sm" variant="outline">View Details</Button>
                </div>

                <div className="flex items-center space-x-4 p-4 bg-gray-800 rounded-lg">
                  <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">❌</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Emma Lee interview cancelled</h3>
                    <p className="text-gray-400 text-sm">Data Scientist - Rescheduled for next week</p>
                    <p className="text-gray-500 text-xs">2 days ago</p>
                  </div>
                  <Button size="sm" variant="outline">Reschedule</Button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-gray-900 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  Schedule Interview
                </Button>
                <Button variant="outline" className="w-full">
                  View Candidates
                </Button>
                <Button variant="outline" className="w-full">
                  Generate Report
                </Button>
                <Button variant="outline" className="w-full">
                  Send Bulk Email
                </Button>
              </div>
            </div>

            {/* Top Performers */}
            <div className="bg-gray-900 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Top Performers</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">DM</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">David Miller</p>
                      <p className="text-gray-400 text-xs">Backend Developer</p>
                    </div>
                  </div>
                  <span className="text-green-400 font-semibold text-sm">91%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">AS</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">Alice Smith</p>
                      <p className="text-gray-400 text-xs">Frontend Developer</p>
                    </div>
                  </div>
                  <span className="text-green-400 font-semibold text-sm">85%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">EL</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">Emma Lee</p>
                      <p className="text-gray-400 text-xs">Data Scientist</p>
                    </div>
                  </div>
                  <span className="text-yellow-400 font-semibold text-sm">79%</span>
                </div>
              </div>
            </div>

            {/* Upcoming Interviews */}
            <div className="bg-gray-900 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Upcoming Interviews</h2>
              <div className="space-y-3">
                <div className="p-3 bg-gray-800 rounded-lg">
                  <p className="font-medium text-sm">Bob Johnson</p>
                  <p className="text-gray-400 text-xs">Full Stack Developer</p>
                  <p className="text-blue-400 text-xs">Tomorrow 2:00 PM</p>
                </div>
                <div className="p-3 bg-gray-800 rounded-lg">
                  <p className="font-medium text-sm">Frank Brown</p>
                  <p className="text-gray-400 text-xs">Mobile Developer</p>
                  <p className="text-blue-400 text-xs">Dec 15, 10:00 AM</p>
                </div>
                <div className="p-3 bg-gray-800 rounded-lg">
                  <p className="font-medium text-sm">Grace Davis</p>
                  <p className="text-gray-400 text-xs">UI/UX Designer</p>
                  <p className="text-blue-400 text-xs">Dec 16, 3:30 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Hires */}
        <div className="mt-8">
          <div className="bg-gray-900 rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-6">Recent Hires</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">DM</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">David Miller</h3>
                    <p className="text-gray-400 text-sm">Backend Developer</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Final Score:</span>
                    <span className="text-green-400 font-semibold">91%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Hired Date:</span>
                    <span className="text-white">Dec 10, 2024</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Salary:</span>
                    <span className="text-white">₹18,00,000</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">AS</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">Alice Smith</h3>
                    <p className="text-gray-400 text-sm">Frontend Developer</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Final Score:</span>
                    <span className="text-green-400 font-semibold">85%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Hired Date:</span>
                    <span className="text-white">Dec 5, 2024</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Salary:</span>
                    <span className="text-white">₹15,00,000</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">EL</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">Emma Lee</h3>
                    <p className="text-gray-400 text-sm">Data Scientist</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Final Score:</span>
                    <span className="text-yellow-400 font-semibold">79%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Hired Date:</span>
                    <span className="text-white">Nov 28, 2024</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Salary:</span>
                    <span className="text-white">₹20,00,000</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
