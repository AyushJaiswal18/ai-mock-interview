'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Clock, User, Mic, Play, Plus, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Interview {
  _id: string;
  title: string;
  type: string;
  status: string;
  scheduledAt: string;
  duration: number;
  config: {
    difficulty: string;
    category: string;
    voiceEnabled?: boolean;
  };
  questions: any[];
  responses: any[];
  metadata: {
    totalQuestions: number;
    completedQuestions: number;
  };
}

export default function InterviewsPage() {
  const router = useRouter();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadInterviews();
  }, []);

  const loadInterviews = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      
      if (!token || token === 'null' || token === 'undefined' || typeof token !== 'string' || token.split('.').length !== 3) {
        console.log('Invalid or missing token, showing auth error');
        setError('Please login to view interviews');
        setIsLoading(false);
        return;
      }

      console.log('Loading interviews...');
      const response = await fetch('/api/interviews', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.log('API returned 401, authentication required');
          setError('Authentication failed. Please login again.');
          setIsLoading(false);
          return;
        }
        throw new Error(`Failed to load interviews: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Interviews loaded successfully:', result.data?.interviews?.length || 0);
      setInterviews(result.data?.interviews || []);
      setError(null); // Clear any previous errors
    } catch (error) {
      console.error('Error loading interviews:', error);
      setError('Failed to load interviews. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const createVoiceInterview = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      console.log('Creating interview with token:', {
        hasToken: !!token,
        tokenType: typeof token,
        tokenLength: token ? token.length : 0,
        tokenStart: token ? token.substring(0, 20) + '...' : 'null',
        tokenParts: token ? token.split('.').length : 0
      });
      
      // Validate token before making request
      if (!token || token === 'null' || token === 'undefined' || typeof token !== 'string' || token.split('.').length !== 3) {
        console.error('Invalid token detected, cannot create interview');
        setError('Authentication required. Please login again.');
        return;
      }
      
      const response = await fetch('/api/interviews', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'AI-Powered Voice Interview',
          type: 'ai-driven',
          scheduledAt: new Date(Date.now() - 60000).toISOString(), // 1 minute ago
          duration: 30,
          questionCount: 5,
          resumeText: 'Experienced software developer with 5+ years in React, Node.js, and TypeScript. Built multiple web applications, led development teams, and specialized in frontend architecture and performance optimization.',
          jobRequirement: {
            position: 'Senior Frontend Developer',
            company: 'TechCorp',
            industry: 'Technology',
            level: 'senior',
            skills: ['React', 'TypeScript', 'Node.js', 'System Design', 'Leadership'],
            experience: '5+ years',
            description: 'We are looking for a senior frontend developer to join our team and lead our React-based applications.',
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create interview');
      }

      const result = await response.json();
      if (result.success) {
        // Refresh interviews list
        await loadInterviews();
        setShowCreateModal(false);
        // Navigate to voice interview
        router.push(`/candidate/voice-interview/${result.data._id}`);
      }
    } catch (error) {
      console.error('Error creating interview:', error);
      alert('Failed to create voice interview. Please try again.');
    }
  };

  const startVoiceInterview = (interviewId: string) => {
    router.push(`/candidate/voice-interview/${interviewId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-500';
      case 'in-progress': return 'bg-yellow-500';
      case 'completed': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading interviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/candidate/dashboard')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Interview Practice</h1>
                <p className="text-gray-600">Practice with AI-powered voice interviews</p>
              </div>
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Voice Interview
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-semibold">{error}</div>
                <div className="text-sm mt-1">
                  {error.includes('Authentication') ? 
                    'Your session may have expired. Try logging in again.' : 
                    'Check your connection and try again.'
                  }
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={() => window.location.reload()}
                  size="sm"
                  variant="outline"
                >
                  🔄 Retry
                </Button>
                <Button
                  onClick={() => router.push('/debug-auth')}
                  size="sm"
                  variant="outline"
                >
                  🔧 Fix Auth
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <div className="flex items-center">
              <Mic className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h3 className="font-semibold text-gray-900">Voice Interview</h3>
                <p className="text-sm text-gray-600">Practice with AI interviewer</p>
              </div>
            </div>
            <Button 
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
              onClick={() => setShowCreateModal(true)}
            >
              Start Now
            </Button>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <div className="flex items-center">
              <Settings className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <h3 className="font-semibold text-gray-900">Practice Mode</h3>
                <p className="text-sm text-gray-600">Customize your practice</p>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-4">
              Configure
            </Button>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-purple-600 mr-3" />
              <div>
                <h3 className="font-semibold text-gray-900">Schedule</h3>
                <p className="text-sm text-gray-600">Plan your practice sessions</p>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-4">
              View Calendar
            </Button>
          </div>
        </div>

        {/* Interviews List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Your Interviews</h2>
          </div>

          {interviews.length === 0 ? (
            <div className="p-8 text-center">
              <Mic className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No interviews yet</h3>
              <p className="text-gray-600 mb-4">Create your first AI-powered voice interview to get started!</p>
              <Button 
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Interview
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {interviews.map((interview) => (
                <div key={interview._id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(interview.status)}`} />
                        <h3 className="text-lg font-semibold text-gray-900">{interview.title}</h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {interview.type}
                        </span>
                        {interview.config.voiceEnabled && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <Mic className="w-3 h-3 mr-1" />
                            Voice Enabled
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-6 mt-2 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(interview.scheduledAt)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{interview.duration} min</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <User className="w-4 h-4" />
                          <span>{interview.config.difficulty} • {interview.config.category}</span>
                        </div>
                      </div>

                      <div className="mt-2">
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="text-gray-600">
                            Progress: {interview.metadata.completedQuestions}/{interview.metadata.totalQuestions} questions
                          </span>
                          <div className="flex-1 max-w-xs">
                            <div className="bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{
                                  width: `${(interview.metadata.completedQuestions / interview.metadata.totalQuestions) * 100}%`
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      {interview.status === 'completed' ? (
                        <Button variant="outline" size="sm">
                          View Results
                        </Button>
                      ) : (
                        <Button
                          onClick={() => startVoiceInterview(interview._id)}
                          className="bg-blue-600 hover:bg-blue-700"
                          size="sm"
                        >
                          <Play className="w-4 h-4 mr-1" />
                          {interview.status === 'in-progress' ? 'Continue' : 'Start'} Interview
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Interview Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Create Voice Interview</h3>
            <p className="text-gray-600 mb-6">
              Start an AI-powered voice interview with a virtual interviewer. The AI will analyze your resume 
              and create personalized questions based on your background and the job requirements.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-blue-900 mb-2">Features:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Real-time voice conversation with AI</li>
                <li>• Personalized questions based on your profile</li>
                <li>• Live speech analysis and feedback</li>
                <li>• Professional communication coaching</li>
              </ul>
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={() => setShowCreateModal(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={createVoiceInterview}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Create & Start
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
