import { Button } from '@/components/ui/button'
import { APP_CONFIG } from '@/lib/constants'

export default function CandidatePracticePage() {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Practice Interviews</h1>
          <p className="text-gray-400 text-lg">
            Improve your skills with AI-powered mock interviews
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-900 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Total Practice Sessions</h3>
            <p className="text-3xl font-bold text-blue-400">24</p>
          </div>
          <div className="bg-gray-900 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Average Score</h3>
            <p className="text-3xl font-bold text-green-400">78%</p>
          </div>
          <div className="bg-gray-900 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Skills Practiced</h3>
            <p className="text-3xl font-bold text-purple-400">12</p>
          </div>
          <div className="bg-gray-900 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Time Spent</h3>
            <p className="text-3xl font-bold text-yellow-400">18h</p>
          </div>
        </div>

        {/* Practice Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Frontend Development */}
          <div className="bg-gray-900 rounded-lg p-6 hover:bg-gray-800 transition-colors cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Frontend Development</h3>
              <span className="bg-blue-600 text-white px-2 py-1 rounded text-sm">Beginner</span>
            </div>
            <p className="text-gray-400 mb-4">Practice React, Vue, and modern JavaScript concepts</p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">15 questions</span>
              <Button size="sm">Start Practice</Button>
            </div>
          </div>

          {/* Backend Development */}
          <div className="bg-gray-900 rounded-lg p-6 hover:bg-gray-800 transition-colors cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Backend Development</h3>
              <span className="bg-yellow-600 text-white px-2 py-1 rounded text-sm">Intermediate</span>
            </div>
            <p className="text-gray-400 mb-4">Master Node.js, Python, and database concepts</p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">20 questions</span>
              <Button size="sm">Start Practice</Button>
            </div>
          </div>

          {/* System Design */}
          <div className="bg-gray-900 rounded-lg p-6 hover:bg-gray-800 transition-colors cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">System Design</h3>
              <span className="bg-red-600 text-white px-2 py-1 rounded text-sm">Advanced</span>
            </div>
            <p className="text-gray-400 mb-4">Design scalable systems and architectures</p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">10 questions</span>
              <Button size="sm">Start Practice</Button>
            </div>
          </div>

          {/* Data Structures */}
          <div className="bg-gray-900 rounded-lg p-6 hover:bg-gray-800 transition-colors cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Data Structures</h3>
              <span className="bg-green-600 text-white px-2 py-1 rounded text-sm">Beginner</span>
            </div>
            <p className="text-gray-400 mb-4">Master arrays, linked lists, trees, and graphs</p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">25 questions</span>
              <Button size="sm">Start Practice</Button>
            </div>
          </div>

          {/* Algorithms */}
          <div className="bg-gray-900 rounded-lg p-6 hover:bg-gray-800 transition-colors cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Algorithms</h3>
              <span className="bg-purple-600 text-white px-2 py-1 rounded text-sm">Intermediate</span>
            </div>
            <p className="text-gray-400 mb-4">Practice sorting, searching, and dynamic programming</p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">30 questions</span>
              <Button size="sm">Start Practice</Button>
            </div>
          </div>

          {/* Behavioral */}
          <div className="bg-gray-900 rounded-lg p-6 hover:bg-gray-800 transition-colors cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Behavioral</h3>
              <span className="bg-blue-600 text-white px-2 py-1 rounded text-sm">All Levels</span>
            </div>
            <p className="text-gray-400 mb-4">Practice common behavioral interview questions</p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">18 questions</span>
              <Button size="sm">Start Practice</Button>
            </div>
          </div>
        </div>

        {/* Recent Practice Sessions */}
        <div className="bg-gray-900 rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-6">Recent Practice Sessions</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
              <div>
                <h3 className="text-lg font-semibold">Frontend Development - React Hooks</h3>
                <p className="text-gray-400">Completed 2 hours ago</p>
              </div>
              <div className="text-right">
                <p className="text-green-400 font-semibold">85%</p>
                <p className="text-sm text-gray-500">15/18 correct</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
              <div>
                <h3 className="text-lg font-semibold">System Design - Load Balancer</h3>
                <p className="text-gray-400">Completed 1 day ago</p>
              </div>
              <div className="text-right">
                <p className="text-yellow-400 font-semibold">72%</p>
                <p className="text-sm text-gray-500">8/11 correct</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
              <div>
                <h3 className="text-lg font-semibold">Algorithms - Dynamic Programming</h3>
                <p className="text-gray-400">Completed 3 days ago</p>
              </div>
              <div className="text-right">
                <p className="text-red-400 font-semibold">65%</p>
                <p className="text-sm text-gray-500">13/20 correct</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
