'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Volume2, VolumeX, Pause, Play, Settings } from 'lucide-react';

import { speechService, TranscriptionEvent } from '@/lib/speech-service';

interface VoiceInterviewProps {
  interviewId: string;
  onTranscript: (transcript: string, isComplete: boolean) => void;
  onAIResponse: (response: { text: string; audio: string; type: string }) => void;
  isInterviewActive: boolean;
  currentQuestion?: {
    id: string;
    text: string;
    order: number;
  };
}

interface VoiceState {
  isListening: boolean;
  isSpeaking: boolean;
  isProcessing: boolean;
  isPlayingAI: boolean;
  isInitialized: boolean;
  currentVolume: number;
  transcriptionConfidence: number;
}

interface AudioVisualization {
  frequencies: number[];
  volume: number;
  isActive: boolean;
}

export function VoiceInterviewInterface({
  interviewId,
  onTranscript,
  onAIResponse,
  isInterviewActive,
  currentQuestion,
}: VoiceInterviewProps) {
  // Voice state management
  const [voiceState, setVoiceState] = useState<VoiceState>({
    isListening: false,
    isSpeaking: false,
    isProcessing: false,
    isPlayingAI: false,
    isInitialized: false,
    currentVolume: 0,
    transcriptionConfidence: 0,
  });

  // Real-time transcription
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [conversationHistory, setConversationHistory] = useState<Array<{
    type: 'candidate' | 'ai';
    text: string;
    timestamp: number;
    confidence?: number;
  }>>([]);

  // Audio visualization
  const [audioVisualization, setAudioVisualization] = useState<AudioVisualization>({
    frequencies: new Array(32).fill(0),
    volume: 0,
    isActive: false,
  });

  // Settings
  const [settings, setSettings] = useState({
    autoSubmit: true,
    showConfidence: true,
    visualizeAudio: true,
    aiVoiceEnabled: true,
  });

  // Refs for audio processing
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const aiAudioRef = useRef<HTMLAudioElement | null>(null);
  const speechTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializingRef = useRef(false);

  /**
   * Initialize voice interview system
   */
  useEffect(() => {
    if (isInterviewActive) {
      initializeVoiceSystem();
    } else {
      cleanupVoiceSystem();
    }

    return () => {
      cleanupVoiceSystem();
    };
  }, [isInterviewActive]);

  /**
   * Initialize all voice-related systems
   */
  const initializeVoiceSystem = async () => {
    // Prevent multiple initializations
    if (isInitializingRef.current || voiceState.isInitialized) {
      console.log('Voice system already initializing or initialized');
      return;
    }
    
    isInitializingRef.current = true;
    
    try {
      console.log('Starting voice system initialization...');

      // Initialize real-time transcription with Deepgram only
      try {
        await speechService.startTranscription(handleTranscriptionEvent, {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        });
        console.log('Deepgram real-time transcription started successfully');
      } catch (transcriptionError) {
        console.error('Deepgram transcription failed:', transcriptionError);
        throw new Error('Real-time transcription could not be initialized. Please check your microphone permissions and try again.');
      }

      // Initialize audio context for visualization
      audioContextRef.current = new AudioContext();
      
      // Initialize audio visualization
      if (settings.visualizeAudio) {
        setupAudioVisualization();
      }

      setVoiceState(prev => ({ 
        ...prev, 
        isListening: true, 
        isInitialized: true 
      }));
      
      console.log('Voice system fully initialized and listening');
    } catch (error) {
      console.error('Error initializing voice system:', error);
      // Show user-friendly error message
      alert('Voice features could not be initialized. Please check your microphone permissions.');
    }
  };

  /**
   * Cleanup voice systems
   */
  const cleanupVoiceSystem = async () => {
    try {
      // Stop real-time transcription
      try {
        await speechService.stopTranscription();
      } catch (error) {
        console.warn('Error stopping transcription:', error);
      }
      
      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.stop();
      }

      if (audioContextRef.current?.state !== 'closed') {
        await audioContextRef.current?.close();
      }

      if (speechTimeoutRef.current) {
        clearTimeout(speechTimeoutRef.current);
      }

      setVoiceState({
        isListening: false,
        isSpeaking: false,
        isProcessing: false,
        isPlayingAI: false,
        isInitialized: false,
        currentVolume: 0,
        transcriptionConfidence: 0,
      });
    } catch (error) {
      console.error('Error cleaning up voice system:', error);
    }
  };

  /**
   * Handle real-time transcription events
   */
  const handleTranscriptionEvent = useCallback((event: TranscriptionEvent) => {
    switch (event.type) {
      case 'connected':
        console.log('Real-time transcription connected');
        break;

      case 'disconnected':
        console.log('Real-time transcription disconnected');
        break;

      case 'transcript':
        if (event.data?.transcript) {
          setCurrentTranscript(event.data.transcript);
          setInterimTranscript('');
          
          // Add to conversation history
          setConversationHistory(prev => [...prev, {
            type: 'candidate',
            text: event.data.transcript!,
            timestamp: Date.now(),
            confidence: event.data.confidence,
          }]);

          // Send to parent component
          onTranscript(event.data.transcript, true);
          
          // Auto-process for AI response (always enabled for auto conversation)
          processTranscriptWithBackend(event.data.transcript);
        }
        break;

      case 'interim':
        if (event.data?.transcript) {
          setInterimTranscript(event.data.transcript);
        }
        break;

      case 'speech_start':
        setVoiceState(prev => ({ ...prev, isSpeaking: true }));
        break;

      case 'speech_end':
        setVoiceState(prev => ({ ...prev, isSpeaking: false }));
        break;

      case 'error':
        console.error('Transcription error:', event.data?.error);
        break;

      default:
        break;
    }
  }, [settings.autoSubmit, onTranscript]);



  /**
   * Start recording audio
   */
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        }
      });

      audioChunksRef.current = [];
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.start(100); // Capture in 100ms chunks
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  /**
   * Stop recording and process audio
   */
  const stopRecordingAndProcess = async (isComplete: boolean) => {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state !== 'recording') {
      return;
    }

    return new Promise<void>((resolve) => {
      mediaRecorderRef.current!.onstop = async () => {
        try {
          setVoiceState(prev => ({ ...prev, isProcessing: true }));

          // Combine audio chunks
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          
          // Send to backend for processing
          await processAudioWithBackend(audioBlob, isComplete);
          
          // Clear transcript if complete
          if (isComplete) {
            setCurrentTranscript('');
            setInterimTranscript('');
          }
        } catch (error) {
          console.error('Error processing audio:', error);
        } finally {
          setVoiceState(prev => ({ ...prev, isProcessing: false }));
          resolve();
        }
      };

      mediaRecorderRef.current!.stop();
    });
  };

  /**
   * Process audio chunk for real-time feedback
   */
  const processAudioChunk = async (audioData: Float32Array) => {
    if (!audioContextRef.current || !settings.visualizeAudio) return;

    // Update audio visualization
    updateAudioVisualization(audioData);

    // Calculate volume for UI feedback
    const volume = Math.sqrt(
      audioData.reduce((sum, sample) => sum + sample * sample, 0) / audioData.length
    );
    
    setVoiceState(prev => ({ ...prev, currentVolume: volume }));
  };

  /**
   * Process transcript with backend API
   */
  const processTranscriptWithBackend = async (transcript: string) => {
    try {
      setVoiceState(prev => ({ ...prev, isProcessing: true }));

      const response = await fetch(`/api/interviews/${interviewId}/voice/transcript`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          transcript,
          timestamp: Date.now(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process transcript');
      }

      const result = await response.json();
      
      if (result.data?.aiResponse) {
        await handleAIResponse(result.data.aiResponse);
        
        // Auto-play AI response for seamless conversation
        if (settings.aiVoiceEnabled && result.data.aiResponse.audio) {
          await playAIAudio(result.data.aiResponse.audio, result.data.aiResponse.audioFormat);
        }
      }
    } catch (error) {
      console.error('Error processing transcript:', error);
    } finally {
      setVoiceState(prev => ({ ...prev, isProcessing: false }));
    }
  };

  /**
   * Send audio to backend for processing
   */
  const processAudioWithBackend = async (audioBlob: Blob, isComplete: boolean) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob);
      formData.append('isComplete', isComplete.toString());
      if (currentQuestion?.id) {
        formData.append('questionId', currentQuestion.id);
      }

      const response = await fetch(`/api/interviews/${interviewId}/voice/audio`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process audio');
      }

      const result = await response.json();
      
      if (result.success) {
        const { transcript, analysis, aiResponse } = result.data;
        
        // Update transcription
        if (isComplete) {
          setCurrentTranscript(transcript);
          onTranscript(transcript, true);
          
          // Add to conversation history
          setConversationHistory(prev => [...prev, {
            type: 'candidate',
            text: transcript,
            timestamp: Date.now(),
            confidence: analysis.confidence,
          }]);
        } else {
          setInterimTranscript(transcript);
          onTranscript(transcript, false);
        }

        // Handle AI response
        if (aiResponse && isComplete) {
          await handleAIResponse(aiResponse);
        }

        // Update confidence indicator
        setVoiceState(prev => ({ 
          ...prev, 
          transcriptionConfidence: analysis.confidence 
        }));
      }
    } catch (error) {
      console.error('Error processing audio with backend:', error);
    }
  };

  /**
   * Handle AI response with voice playback
   */
  const handleAIResponse = async (aiResponse: {
    text: string;
    audio: string;
    audioFormat: string;
    type: string;
  }) => {
    try {
      // Add AI response to conversation history
      setConversationHistory(prev => [...prev, {
        type: 'ai',
        text: aiResponse.text,
        timestamp: Date.now(),
      }]);

      // Play AI audio response
      if (settings.aiVoiceEnabled && aiResponse.audio) {
        await playAIAudio(aiResponse.audio, aiResponse.audioFormat);
      }

      // Notify parent component
      onAIResponse(aiResponse);
    } catch (error) {
      console.error('Error handling AI response:', error);
    }
  };

  /**
   * Play AI-generated audio response
   */
  const playAIAudio = async (audioBase64: string, format: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        setVoiceState(prev => ({ ...prev, isPlayingAI: true }));

        const audioBlob = new Blob([
          Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0))
        ], { type: `audio/${format}` });

        const audioUrl = URL.createObjectURL(audioBlob);
        
        if (!aiAudioRef.current) {
          aiAudioRef.current = new Audio();
        }

        aiAudioRef.current.src = audioUrl;
        aiAudioRef.current.onended = () => {
          setVoiceState(prev => ({ ...prev, isPlayingAI: false }));
          URL.revokeObjectURL(audioUrl);
          resolve();
        };

        aiAudioRef.current.onerror = (error) => {
          setVoiceState(prev => ({ ...prev, isPlayingAI: false }));
          URL.revokeObjectURL(audioUrl);
          reject(error);
        };

        aiAudioRef.current.play();
      } catch (error) {
        setVoiceState(prev => ({ ...prev, isPlayingAI: false }));
        reject(error);
      }
    });
  };

  /**
   * Setup audio visualization
   */
  const setupAudioVisualization = () => {
    if (!audioContextRef.current) return;

    analyserRef.current = audioContextRef.current.createAnalyser();
    analyserRef.current.fftSize = 64;
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    
    const updateVisualization = () => {
      if (!analyserRef.current || !settings.visualizeAudio) return;
      
      analyserRef.current.getByteFrequencyData(dataArray);
      
      setAudioVisualization({
        frequencies: Array.from(dataArray).map(val => val / 255),
        volume: Math.max(...dataArray) / 255,
        isActive: voiceState.isSpeaking,
      });
      
      requestAnimationFrame(updateVisualization);
    };
    
    updateVisualization();
  };

  /**
   * Update audio visualization with real-time data
   */
  const updateAudioVisualization = (audioData: Float32Array) => {
    if (!settings.visualizeAudio) return;

    // Simple FFT approximation for visualization
    const frequencies = new Array(32).fill(0);
    const chunkSize = Math.floor(audioData.length / 32);
    
    for (let i = 0; i < 32; i++) {
      const start = i * chunkSize;
      const end = start + chunkSize;
      let sum = 0;
      
      for (let j = start; j < end && j < audioData.length; j++) {
        sum += Math.abs(audioData[j]);
      }
      
      frequencies[i] = sum / chunkSize;
    }

    setAudioVisualization(prev => ({
      ...prev,
      frequencies,
      isActive: voiceState.isSpeaking,
    }));
  };

  // Initialize voice system once when component mounts
  useEffect(() => {
    if (isInterviewActive && !voiceState.isInitialized) {
      console.log('Initializing voice system...');
      initializeVoiceSystem();
    }
  }, [isInterviewActive, voiceState.isInitialized]);

  return (
    <div className="voice-interview-interface w-full max-w-6xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">🎤 AI Voice Interview</h1>
            <p className="text-gray-600">Speak naturally - real-time transcription will show your words as you speak</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSettings(prev => ({ ...prev, aiVoiceEnabled: !prev.aiVoiceEnabled }))}
              className="flex items-center space-x-2"
            >
              {settings.aiVoiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span className="text-sm">{settings.aiVoiceEnabled ? 'Voice On' : 'Voice Off'}</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Interview Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Status Card */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-center mb-6">
              <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-4 transition-all duration-300 ${
                voiceState.isSpeaking 
                  ? 'bg-red-500 animate-pulse shadow-lg' 
                  : voiceState.isListening
                  ? 'bg-green-500 shadow-lg'
                  : voiceState.isProcessing
                  ? 'bg-yellow-500 animate-spin shadow-lg'
                  : voiceState.isPlayingAI
                  ? 'bg-blue-500 animate-pulse shadow-lg'
                  : 'bg-gray-300'
              }`}>
                {voiceState.isSpeaking ? (
                  <MicOff className="w-12 h-12 text-white" />
                ) : voiceState.isPlayingAI ? (
                  <Volume2 className="w-12 h-12 text-white" />
                ) : voiceState.isProcessing ? (
                  <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Mic className="w-12 h-12 text-white" />
                )}
              </div>
              
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {voiceState.isSpeaking 
                  ? '🎤 You are speaking...' 
                  : voiceState.isListening
                  ? '👂 Listening for your response...'
                  : voiceState.isProcessing
                  ? '🤔 Processing your response...'
                  : voiceState.isPlayingAI
                  ? '🗣️ AI is speaking...'
                  : '🎯 Ready to start'
                }
              </h2>
              
              <p className="text-gray-600 text-sm">
                {voiceState.isSpeaking 
                  ? 'Keep speaking naturally. Your words will appear below as you speak.'
                  : voiceState.isListening
                  ? 'Start speaking when you\'re ready to answer.'
                  : voiceState.isProcessing
                  ? 'Analyzing your response and preparing follow-up...'
                  : voiceState.isPlayingAI
                  ? 'Listen carefully to the AI\'s question or response.'
                  : 'Deepgram real-time transcription is active. Start speaking to begin.'
                }
              </p>
            </div>

            {/* Audio Visualization */}
            {settings.visualizeAudio && (
              <div className="mb-6">
                <div className="flex items-end justify-center space-x-1 h-16 bg-gray-100 rounded-lg p-4">
                  {audioVisualization.frequencies.map((frequency, index) => (
                    <div
                      key={index}
                      className={`w-1 bg-gradient-to-t transition-all duration-100 ${
                        audioVisualization.isActive 
                          ? 'from-blue-400 to-blue-600' 
                          : 'from-gray-300 to-gray-400'
                      }`}
                      style={{
                        height: `${Math.max(frequency * 100, 2)}%`,
                        opacity: audioVisualization.isActive ? 1 : 0.5,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Automatic Status Indicator */}
            <div className="text-center">
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full text-lg font-semibold transition-all duration-300 ${
                voiceState.isSpeaking 
                  ? 'bg-red-500 animate-pulse shadow-lg' 
                  : voiceState.isListening
                  ? 'bg-green-500 shadow-lg'
                  : voiceState.isProcessing
                  ? 'bg-yellow-500 animate-spin shadow-lg'
                  : voiceState.isPlayingAI
                  ? 'bg-blue-500 animate-pulse shadow-lg'
                  : 'bg-gray-300'
              }`}>
                {voiceState.isSpeaking ? (
                  <MicOff className="w-10 h-10 text-white" />
                ) : voiceState.isPlayingAI ? (
                  <Volume2 className="w-10 h-10 text-white" />
                ) : voiceState.isProcessing ? (
                  <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Mic className="w-10 h-10 text-white" />
                )}
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {voiceState.isSpeaking 
                  ? 'Listening...' 
                  : voiceState.isListening
                  ? 'Ready to listen'
                  : voiceState.isProcessing
                  ? 'Processing...'
                  : voiceState.isPlayingAI
                  ? 'AI Speaking'
                  : 'Initializing...'
                }
              </p>
            </div>
          </div>

          {/* Live Transcription */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              📝 Live Transcription
              {voiceState.isSpeaking && (
                <span className="ml-2 px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full animate-pulse">
                  LIVE
                </span>
              )}
            </h3>
            <div className="min-h-32 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
              {currentTranscript && (
                <p className="text-gray-900 text-lg mb-2 leading-relaxed">{currentTranscript}</p>
              )}
              {interimTranscript && (
                <p className="text-gray-500 italic text-lg">{interimTranscript}...</p>
              )}
              {!currentTranscript && !interimTranscript && !voiceState.isSpeaking && (
                <div className="text-center text-gray-400 py-8">
                  <Mic className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-lg">Start speaking to begin your response...</p>
                  <p className="text-sm mt-1">Your speech will be processed automatically when you finish</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar - Conversation History */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg p-6 h-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              💬 Conversation History
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                {conversationHistory.length} messages
              </span>
            </h3>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {conversationHistory.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-2xl">💭</span>
                  </div>
                  <p className="text-sm">No conversation yet</p>
                  <p className="text-xs mt-1">Start speaking to begin</p>
                </div>
              ) : (
                conversationHistory.map((entry, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${
                      entry.type === 'candidate'
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-green-50 border-green-200'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold ${
                        entry.type === 'candidate' ? 'bg-blue-500' : 'bg-green-500'
                      }`}>
                        {entry.type === 'candidate' ? '👤' : '🤖'}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <span className={`text-sm font-semibold ${
                            entry.type === 'candidate' ? 'text-blue-700' : 'text-green-700'
                          }`}>
                            {entry.type === 'candidate' ? 'You' : 'AI Interviewer'}
                          </span>
                          {entry.confidence && (
                            <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
                              {Math.round(entry.confidence * 100)}% confidence
                            </span>
                          )}
                        </div>
                        <p className="text-gray-800 text-sm leading-relaxed">{entry.text}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Status Bar */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2">
        <div className="bg-white rounded-full shadow-lg px-6 py-3 flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${voiceState.isListening ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
            <span className="text-sm text-gray-600">Listening</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${voiceState.isSpeaking ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'}`} />
            <span className="text-sm text-gray-600">Speaking</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${voiceState.isProcessing ? 'bg-yellow-500 animate-spin' : 'bg-gray-300'}`} />
            <span className="text-sm text-gray-600">Processing</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="text-sm font-semibold text-gray-700">
              {Math.round(voiceState.transcriptionConfidence * 100)}% confidence
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
