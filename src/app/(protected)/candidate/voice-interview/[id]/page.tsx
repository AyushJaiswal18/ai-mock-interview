'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { VoiceInterviewInterface } from '@/components/voice-interview-interface';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, User, Briefcase } from 'lucide-react';

interface Interview {
  _id: string;
  title: string;
  type: string;
  status: string;
  questions: Array<{
    questionId: string;
    text: string;
    category: string;
    order: number;
  }>;
  config: {
    duration: number;
    difficulty: string;
    category: string;
    voiceEnabled?: boolean;
    voiceConfig?: {
      voiceId: string;
      speakingStyle: string;
      enableVoiceAnalysis: boolean;
      language: string;
    };
  };
  candidateId: {
    firstName: string;
    lastName: string;
  };
}

interface VoiceSession {
  sessionId: string;
  voiceConfig: any;
  availableVoices: any;
  openingGreeting: {
    text: string;
    audio: string;
    audioFormat: string;
  };
  conversationContext: any;
}

export default function VoiceInterviewPage() {
  const params = useParams();
  const router = useRouter();
  const interviewId = params.id as string;

  const [interview, setInterview] = useState<Interview | null>(null);
  const [voiceSession, setVoiceSession] = useState<VoiceSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [interviewProgress, setInterviewProgress] = useState(0);
  const [sessionTime, setSessionTime] = useState(0);
  const [responses, setResponses] = useState<Array<{
    questionId: string;
    transcript: string;
    timestamp: number;
  }>>([]);

  // Timer for session duration
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isInterviewStarted) {
      interval = setInterval(() => {
        setSessionTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isInterviewStarted]);

  // Load interview data
  useEffect(() => {
    loadInterview();
  }, [interviewId]);

  /**
   * Load interview details
   */
  const loadInterview = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/interviews/${interviewId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load interview');
      }

      const result = await response.json();
      setInterview(result.data);
    } catch (error) {
      console.error('Error loading interview:', error);
      setError('Failed to load interview details');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Start voice interview session
   */
  const startVoiceInterview = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch(`/api/interviews/${interviewId}/voice/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          voiceId: 'RACHEL',
          speakingStyle: 'warm',
          enableVoiceAnalysis: true,
          language: 'en',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start voice interview');
      }

      const result = await response.json();
      setVoiceSession(result.data);
      setIsInterviewStarted(true);
      
      // Play opening greeting
      if (result.data.openingGreeting?.audio) {
        await playAudio(result.data.openingGreeting.audio, result.data.openingGreeting.audioFormat);
      }
    } catch (error) {
      console.error('Error starting voice interview:', error);
      setError('Failed to start voice interview');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle transcript from voice interface
   */
  const handleTranscript = (transcript: string, isComplete: boolean) => {
    if (isComplete && transcript.trim()) {
      const currentQuestion = interview?.questions[currentQuestionIndex];
      if (currentQuestion) {
        setResponses(prev => [...prev, {
          questionId: currentQuestion.questionId,
          transcript,
          timestamp: Date.now(),
        }]);
        
        // Move to next question if available
        if (currentQuestionIndex < (interview?.questions.length || 0) - 1) {
          setCurrentQuestionIndex(prev => prev + 1);
        }
        
        // Update progress
        const progress = ((currentQuestionIndex + 1) / (interview?.questions.length || 1)) * 100;
        setInterviewProgress(progress);
      }
    }
  };

  /**
   * Handle AI response
   */
  const handleAIResponse = (response: { text: string; audio: string; type: string }) => {
    console.log('AI Response:', response);
    // Handle different response types (follow_up, next_question, etc.)
  };

  /**
   * Play audio helper
   */
  const playAudio = async (audioBase64: string, format: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        const audioBlob = new Blob([
          Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0))
        ], { type: `audio/${format}` });

        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          resolve();
        };
        
        audio.onerror = (error) => {
          URL.revokeObjectURL(audioUrl);
          reject(error);
        };
        
        audio.play();
      } catch (error) {
        reject(error);
      }
    });
  };

  /**
   * End interview
   */
  const endInterview = () => {
    router.push(`/candidate/interviews/${interviewId}/results`);
  };

  /**
   * Format time display
   */
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading voice interview...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg mb-4">
            {error}
          </div>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Interview not found</p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.back()}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{interview.title}</h1>
                <p className="text-sm text-gray-500">Voice Interview Session</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>{formatTime(sessionTime)}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Briefcase className="w-4 h-4" />
                <span>{interview.config.difficulty} • {interview.config.category}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span>{interview.candidateId.firstName} {interview.candidateId.lastName}</span>
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="pb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>{Math.round(interviewProgress)}% complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${interviewProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isInterviewStarted ? (
          /* Pre-Interview Setup */
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Ready to Start Your Voice Interview?
              </h2>
              <p className="text-gray-600 mb-6">
                This is a voice-powered interview where you'll have a natural conversation with an AI interviewer. 
                Make sure your microphone is working and you're in a quiet environment.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-blue-900">Duration</h3>
                  <p className="text-blue-700 text-sm">{interview.config.duration} minutes</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Briefcase className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-green-900">Questions</h3>
                  <p className="text-green-700 text-sm">{interview.questions.length} questions</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <User className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-purple-900">Type</h3>
                  <p className="text-purple-700 text-sm">{interview.config.category}</p>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-yellow-800 mb-2">Voice Interview Tips:</h3>
                <ul className="text-sm text-yellow-700 text-left space-y-1">
                  <li>• Speak clearly and at a normal pace</li>
                  <li>• Wait for the AI to finish before responding</li>
                  <li>• Use natural pauses to indicate you're done speaking</li>
                  <li>• The AI will provide real-time feedback and follow-ups</li>
                </ul>
              </div>

              <Button
                onClick={startVoiceInterview}
                disabled={isLoading}
                className="w-full py-3 text-lg"
              >
                {isLoading ? 'Starting...' : 'Start Voice Interview'}
              </Button>
            </div>
          </div>
        ) : (
          /* Voice Interview Interface */
          <div>
            <VoiceInterviewInterface
              interviewId={interviewId}
              onTranscript={handleTranscript}
              onAIResponse={handleAIResponse}
              isInterviewActive={isInterviewStarted}
              currentQuestion={interview.questions[currentQuestionIndex] ? {
                id: interview.questions[currentQuestionIndex].questionId,
                text: interview.questions[currentQuestionIndex].text,
                order: interview.questions[currentQuestionIndex].order,
              } : undefined}
            />
            
            {/* Interview Controls */}
            <div className="mt-8 flex justify-center space-x-4">
              {interviewProgress >= 100 ? (
                <Button onClick={endInterview} className="px-8 py-3">
                  Complete Interview
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={endInterview}
                  className="px-8 py-3"
                >
                  End Early
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
