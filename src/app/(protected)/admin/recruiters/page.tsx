import { Button } from '@/components/ui/button'
import { APP_CONFIG } from '@/lib/constants'

export default function AdminRecruitersPage() {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Manage Recruiters</h1>
          <p className="text-gray-400 text-lg">
            Create and manage recruiter accounts for {APP_CONFIG.name}
          </p>
        </div>

        {/* Actions */}
        <div className="mb-8">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            + Add New Recruiter
          </Button>
        </div>

        {/* Recruiters List */}
        <div className="bg-gray-900 rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-6">Active Recruiters</h2>
          
          <div className="space-y-4">
            {/* Recruiter Card 1 */}
            <div className="bg-gray-800 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">JD</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">John Doe</h3>
                  <p className="text-gray-400">john.doe@company.com</p>
                  <p className="text-sm text-gray-500">Added: 2 weeks ago</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">Edit</Button>
                <Button variant="outline" size="sm" className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white">
                  Deactivate
                </Button>
              </div>
            </div>

            {/* Recruiter Card 2 */}
            <div className="bg-gray-800 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">JS</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Jane Smith</h3>
                  <p className="text-gray-400">jane.smith@company.com</p>
                  <p className="text-sm text-gray-500">Added: 1 month ago</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">Edit</Button>
                <Button variant="outline" size="sm" className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white">
                  Deactivate
                </Button>
              </div>
            </div>

            {/* Recruiter Card 3 */}
            <div className="bg-gray-800 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">MJ</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Mike Johnson</h3>
                  <p className="text-gray-400">mike.johnson@company.com</p>
                  <p className="text-sm text-gray-500">Added: 3 days ago</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">Edit</Button>
                <Button variant="outline" size="sm" className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white">
                  Deactivate
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-gray-900 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Total Recruiters</h3>
            <p className="text-3xl font-bold text-blue-400">12</p>
          </div>
          <div className="bg-gray-900 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Active Recruiters</h3>
            <p className="text-3xl font-bold text-green-400">10</p>
          </div>
          <div className="bg-gray-900 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">This Month</h3>
            <p className="text-3xl font-bold text-purple-400">3</p>
          </div>
        </div>
      </div>
    </div>
  )
}
