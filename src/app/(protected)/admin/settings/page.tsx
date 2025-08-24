import { Button } from '@/components/ui/button'
import { APP_CONFIG } from '@/lib/constants'

export default function AdminSettingsPage() {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Admin Settings</h1>
          <p className="text-gray-400 text-lg">
            Configure system settings and preferences for {APP_CONFIG.name}
          </p>
        </div>

        {/* Settings Sections */}
        <div className="space-y-8">
          {/* General Settings */}
          <div className="bg-gray-900 rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-6">General Settings</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  defaultValue={APP_CONFIG.name}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Default Currency
                </label>
                <select className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="INR">Indian Rupee (₹)</option>
                  <option value="USD">US Dollar ($)</option>
                  <option value="EUR">Euro (€)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Time Zone
                </label>
                <select className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">America/New_York (EST)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Email Settings */}
          <div className="bg-gray-900 rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-6">Email Settings</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  SMTP Server
                </label>
                <input
                  type="text"
                  defaultValue="smtp.gmail.com"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  SMTP Port
                </label>
                <input
                  type="number"
                  defaultValue="587"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  From Email
                </label>
                <input
                  type="email"
                  defaultValue="noreply@hirenext.com"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-gray-900 rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-6">Security Settings</h2>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
                  <p className="text-gray-400 text-sm">Require 2FA for all admin accounts</p>
                </div>
                <div className="relative">
                  <input type="checkbox" className="sr-only" id="2fa-toggle" defaultChecked />
                  <label htmlFor="2fa-toggle" className="block w-12 h-6 bg-gray-700 rounded-full cursor-pointer">
                    <span className="block w-6 h-6 bg-blue-500 rounded-full transform translate-x-6 transition-transform"></span>
                  </label>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Session Timeout</h3>
                  <p className="text-gray-400 text-sm">Auto-logout after inactivity</p>
                </div>
                <select className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1 text-white">
                  <option value="30">30 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="120">2 hours</option>
                </select>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Password Policy</h3>
                  <p className="text-gray-400 text-sm">Minimum password requirements</p>
                </div>
                <select className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1 text-white">
                  <option value="strong">Strong (8+ chars, symbols)</option>
                  <option value="medium">Medium (6+ chars)</option>
                  <option value="weak">Weak (4+ chars)</option>
                </select>
              </div>
            </div>
          </div>

          {/* API Settings */}
          <div className="bg-gray-900 rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-6">API Settings</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  API Key
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    defaultValue="sk_live_1234567890abcdef"
                    readOnly
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none"
                  />
                  <Button variant="outline">Regenerate</Button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Webhook URL
                </label>
                <input
                  type="url"
                  defaultValue="https://api.hirenext.com/webhook"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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
