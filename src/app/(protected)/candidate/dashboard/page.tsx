import { Button } from '@/components/ui/button'


export default function CandidateDashboardPage() {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Welcome back, John!</h1>
          <p className="text-gray-400 text-lg">
            Track your progress and prepare for your next interview
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-900 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Practice Sessions</h3>
            <p className="text-3xl font-bold text-blue-400">24</p>
            <p className="text-green-400 text-sm">+3 this week</p>
          </div>
          <div className="bg-gray-900 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Average Score</h3>
            <p className="text-3xl font-bold text-green-400">78%</p>
            <p className="text-green-400 text-sm">+5% improvement</p>
          </div>
          <div className="bg-gray-900 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Skills Mastered</h3>
            <p className="text-3xl font-bold text-purple-400">8</p>
            <p className="text-green-400 text-sm">+2 this month</p>
          </div>
          <div className="bg-gray-900 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Interview Ready</h3>
            <p className="text-3xl font-bold text-yellow-400">85%</p>
            <p className="text-green-400 text-sm">Ready for senior roles</p>
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
                    <h3 className="font-semibold">Completed React Hooks Practice</h3>
                    <p className="text-gray-400 text-sm">Scored 85% - 15/18 questions correct</p>
                    <p className="text-gray-500 text-xs">2 hours ago</p>
                  </div>
                  <Button size="sm" variant="outline">Review</Button>
                </div>

                <div className="flex items-center space-x-4 p-4 bg-gray-800 rounded-lg">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">📊</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">System Design Assessment</h3>
                    <p className="text-gray-400 text-sm">Load Balancer concepts - 72% score</p>
                    <p className="text-gray-500 text-xs">1 day ago</p>
                  </div>
                  <Button size="sm" variant="outline">Review</Button>
                </div>

                <div className="flex items-center space-x-4 p-4 bg-gray-800 rounded-lg">
                  <div className="w-10 h-10 bg-yellow-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">🎯</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Algorithms Practice</h3>
                    <p className="text-gray-400 text-sm">Dynamic Programming - 65% score</p>
                    <p className="text-gray-500 text-xs">3 days ago</p>
                  </div>
                  <Button size="sm" variant="outline">Review</Button>
                </div>

                <div className="flex items-center space-x-4 p-4 bg-gray-800 rounded-lg">
                  <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">📝</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Behavioral Interview Prep</h3>
                    <p className="text-gray-400 text-sm">Leadership questions - 88% score</p>
                    <p className="text-gray-500 text-xs">5 days ago</p>
                  </div>
                  <Button size="sm" variant="outline">Review</Button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            {/* Quick Start */}
            <div className="bg-gray-900 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Quick Start</h2>
              <div className="space-y-3">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  Start New Practice
                </Button>
                <Button variant="outline" className="w-full">
                  Review Weak Areas
                </Button>
                <Button variant="outline" className="w-full">
                  Take Assessment
                </Button>
              </div>
            </div>

            {/* Skill Progress */}
            <div className="bg-gray-900 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Skill Progress</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>React.js</span>
                    <span>85%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Node.js</span>
                    <span>72%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '72%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>System Design</span>
                    <span>65%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Algorithms</span>
                    <span>58%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full" style={{ width: '58%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Upcoming Goals */}
            <div className="bg-gray-900 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Upcoming Goals</h2>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Complete 5 React practice sessions</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Improve System Design score to 80%</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-sm">Master 3 new algorithms</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recommended Practice */}
        <div className="mt-8">
          <div className="bg-gray-900 rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-6">Recommended Practice</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors cursor-pointer">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Advanced React Patterns</h3>
                  <span className="bg-red-600 text-white px-2 py-1 rounded text-xs">Hard</span>
                </div>
                <p className="text-gray-400 text-sm mb-3">Master advanced React concepts and patterns</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">20 questions</span>
                  <Button size="sm">Start</Button>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors cursor-pointer">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Database Design</h3>
                  <span className="bg-yellow-600 text-white px-2 py-1 rounded text-xs">Medium</span>
                </div>
                <p className="text-gray-400 text-sm mb-3">Learn database design principles and optimization</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">15 questions</span>
                  <Button size="sm">Start</Button>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors cursor-pointer">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Microservices Architecture</h3>
                  <span className="bg-red-600 text-white px-2 py-1 rounded text-xs">Hard</span>
                </div>
                <p className="text-gray-400 text-sm mb-3">Understand microservices design and implementation</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">12 questions</span>
                  <Button size="sm">Start</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
