'use client';

import { useEffect, useState } from 'react';

export default function DebugAuthPage() {
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const info = {
      hasToken: !!token,
      tokenLength: token?.length || 0,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'No token',
      tokenParts: token ? token.split('.').length : 0,
      isValidFormat: token ? token.split('.').length === 3 : false,
    };
    setDebugInfo(info);
  }, []);

  const clearToken = () => {
    localStorage.removeItem('auth_token');
    localStorage.clear(); // Clear all localStorage
    window.location.href = '/login';
  };

  const fixAuthAndRedirect = () => {
    localStorage.clear();
    alert('Token cleared! Redirecting to login...');
    window.location.href = '/login';
  };

  const testAPI = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/interviews', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const result = await response.json();
      alert(`API Test: ${response.status} - ${JSON.stringify(result, null, 2)}`);
    } catch (error) {
      alert(`API Error: ${error}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6">Authentication Debug</h1>
        
        <div className="space-y-4">
          <div>
            <h2 className="font-semibold text-lg mb-2">Token Status:</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
          
          <div className="flex space-x-4 flex-wrap gap-2">
            <button
              onClick={fixAuthAndRedirect}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 font-semibold"
            >
              🔧 Fix Auth & Login
            </button>
            <button
              onClick={clearToken}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Clear Token
            </button>
            <button
              onClick={testAPI}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Test API Call
            </button>
          </div>
          
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <h3 className="font-semibold text-yellow-800 mb-2">Fix Instructions:</h3>
            <p className="text-yellow-700 text-sm">
              If the token format is invalid, add this to your <code>.env.local</code> file:
            </p>
            <pre className="bg-yellow-100 p-2 rounded mt-2 text-xs">
JWT_SECRET=2adff08a9e18a42323282496e80ccdf98a59f4fd6b4e0a71a2f86ea846c8674b
            </pre>
            <p className="text-yellow-700 text-sm mt-2">
              Then restart the server with <code>npm run dev</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
