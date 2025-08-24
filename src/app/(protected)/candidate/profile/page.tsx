import { Button } from '@/components/ui/button'


export default function CandidateProfilePage() {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">My Profile</h1>
          <p className="text-gray-400 text-lg">
            Manage your personal information and preferences
          </p>
        </div>

        {/* Profile Sections */}
        <div className="space-y-8">
          {/* Personal Information */}
          <div className="bg-gray-900 rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-6">Personal Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  defaultValue="John"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  defaultValue="Doe"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  defaultValue="john.doe@example.com"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  defaultValue="+91 98765 43210"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Bio
                </label>
                <textarea
                  rows={4}
                  defaultValue="Full-stack developer with 3+ years of experience in React, Node.js, and Python. Passionate about building scalable web applications and learning new technologies."
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="bg-gray-900 rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-6">Professional Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Current Role
                </label>
                <input
                  type="text"
                  defaultValue="Senior Frontend Developer"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Years of Experience
                </label>
                <select className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="0-1">0-1 years</option>
                  <option value="1-3">1-3 years</option>
                  <option value="3-5" selected>3-5 years</option>
                  <option value="5-10">5-10 years</option>
                  <option value="10+">10+ years</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Preferred Role
                </label>
                <input
                  type="text"
                  defaultValue="Full Stack Developer"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Expected Salary (₹)
                </label>
                <input
                  type="number"
                  defaultValue="1500000"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="bg-gray-900 rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-6">Skills</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Technical Skills
                </label>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">React</span>
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">Node.js</span>
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">TypeScript</span>
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">Python</span>
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">MongoDB</span>
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">AWS</span>
                  <Button variant="outline" size="sm">+ Add Skill</Button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Soft Skills
                </label>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm">Leadership</span>
                  <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm">Communication</span>
                  <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm">Problem Solving</span>
                  <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm">Team Work</span>
                  <Button variant="outline" size="sm">+ Add Skill</Button>
                </div>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-gray-900 rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-6">Preferences</h2>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Email Notifications</h3>
                  <p className="text-gray-400 text-sm">Receive updates about new opportunities</p>
                </div>
                <div className="relative">
                  <input type="checkbox" className="sr-only" id="email-toggle" defaultChecked />
                  <label htmlFor="email-toggle" className="block w-12 h-6 bg-gray-700 rounded-full cursor-pointer">
                    <span className="block w-6 h-6 bg-blue-500 rounded-full transform translate-x-6 transition-transform"></span>
                  </label>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Practice Reminders</h3>
                  <p className="text-gray-400 text-sm">Get reminded to practice regularly</p>
                </div>
                <div className="relative">
                  <input type="checkbox" className="sr-only" id="practice-toggle" defaultChecked />
                  <label htmlFor="practice-toggle" className="block w-12 h-6 bg-gray-700 rounded-full cursor-pointer">
                    <span className="block w-6 h-6 bg-blue-500 rounded-full transform translate-x-6 transition-transform"></span>
                  </label>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Public Profile</h3>
                  <p className="text-gray-400 text-sm">Allow recruiters to view your profile</p>
                </div>
                <div className="relative">
                  <input type="checkbox" className="sr-only" id="public-toggle" />
                  <label htmlFor="public-toggle" className="block w-12 h-6 bg-gray-700 rounded-full cursor-pointer">
                    <span className="block w-6 h-6 bg-gray-500 rounded-full transform transition-transform"></span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end space-x-4">
            <Button variant="outline">Cancel</Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
