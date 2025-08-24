import { Button } from '@/components/ui/button'


export default function RecruiterCandidatesPage() {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Manage Candidates</h1>
          <p className="text-gray-400 text-lg">
            View and manage candidate profiles and interviews
          </p>
        </div>

        {/* Filters and Search */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search candidates by name, skills, or role..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <select className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Skills</option>
              <option value="react">React</option>
              <option value="node">Node.js</option>
              <option value="python">Python</option>
            </select>
            <select className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Levels</option>
              <option value="junior">Junior</option>
              <option value="mid">Mid-level</option>
              <option value="senior">Senior</option>
            </select>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              Filter
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-900 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Total Candidates</h3>
            <p className="text-3xl font-bold text-blue-400">156</p>
          </div>
          <div className="bg-gray-900 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Active Interviews</h3>
            <p className="text-3xl font-bold text-green-400">23</p>
          </div>
          <div className="bg-gray-900 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Hired This Month</h3>
            <p className="text-3xl font-bold text-purple-400">8</p>
          </div>
          <div className="bg-gray-900 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Average Score</h3>
            <p className="text-3xl font-bold text-yellow-400">76%</p>
          </div>
        </div>

        {/* Candidates List */}
        <div className="bg-gray-900 rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-6">Candidate Profiles</h2>
          
          <div className="space-y-4">
            {/* Candidate 1 */}
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">AS</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Alice Smith</h3>
                    <p className="text-gray-400">Senior Frontend Developer</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs">React</span>
                      <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs">TypeScript</span>
                      <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs">Node.js</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-green-400 font-semibold">85%</p>
                  <p className="text-sm text-gray-500">Last interview: 2 days ago</p>
                  <div className="flex space-x-2 mt-2">
                    <Button size="sm">View Profile</Button>
                    <Button size="sm" variant="outline">Schedule Interview</Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Candidate 2 */}
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">BJ</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Bob Johnson</h3>
                    <p className="text-gray-400">Full Stack Developer</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs">Python</span>
                      <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs">Django</span>
                      <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs">PostgreSQL</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-yellow-400 font-semibold">72%</p>
                  <p className="text-sm text-gray-500">Last interview: 1 week ago</p>
                  <div className="flex space-x-2 mt-2">
                    <Button size="sm">View Profile</Button>
                    <Button size="sm" variant="outline">Schedule Interview</Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Candidate 3 */}
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">CW</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Carol Wilson</h3>
                    <p className="text-gray-400">DevOps Engineer</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs">AWS</span>
                      <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs">Docker</span>
                      <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs">Kubernetes</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-red-400 font-semibold">68%</p>
                  <p className="text-sm text-gray-500">Last interview: 3 days ago</p>
                  <div className="flex space-x-2 mt-2">
                    <Button size="sm">View Profile</Button>
                    <Button size="sm" variant="outline">Schedule Interview</Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Candidate 4 */}
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">DM</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">David Miller</h3>
                    <p className="text-gray-400">Backend Developer</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs">Java</span>
                      <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs">Spring</span>
                      <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs">MySQL</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-green-400 font-semibold">91%</p>
                  <p className="text-sm text-gray-500">Last interview: 5 days ago</p>
                  <div className="flex space-x-2 mt-2">
                    <Button size="sm">View Profile</Button>
                    <Button size="sm" variant="outline">Schedule Interview</Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Candidate 5 */}
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">EL</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Emma Lee</h3>
                    <p className="text-gray-400">Data Scientist</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs">Python</span>
                      <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs">TensorFlow</span>
                      <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs">Pandas</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-yellow-400 font-semibold">79%</p>
                  <p className="text-sm text-gray-500">Last interview: 1 day ago</p>
                  <div className="flex space-x-2 mt-2">
                    <Button size="sm">View Profile</Button>
                    <Button size="sm" variant="outline">Schedule Interview</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex justify-center mt-8">
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">Previous</Button>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">1</Button>
              <Button variant="outline" size="sm">2</Button>
              <Button variant="outline" size="sm">3</Button>
              <Button variant="outline" size="sm">Next</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
