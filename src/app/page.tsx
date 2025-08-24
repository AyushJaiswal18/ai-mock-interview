import Link from "next/link";
import { Button } from "@/components/ui/button";
import { APP_CONFIG, NAV_CONFIG } from "@/lib/constants";
import { 
  Users, 
  Zap, 
  Target, 
  TrendingUp, 
  Star, 
  CheckCircle,
  ArrowRight,
  Play,
  Shield,
  Clock,
  Award,
  MessageSquare,
  BarChart3,
  Globe,
  Sparkles,
  Brain,
  MessageCircle,
  BarChart,
  Users2,
  Video,
  FileText
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        {/* Background Blobs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Badge - like Liveblocks "New" badge */}
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 text-sm font-medium mb-8">
              <Sparkles className="w-3 h-3 mr-2" />
              New AI Interview Practice
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight max-w-4xl mx-auto">
              Ready-made AI interview practice for your career
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8 leading-relaxed">
              {APP_CONFIG.name} gives you ready-made features like AI-powered questions, real-time feedback, and progress tracking to make your interview preparation more effective and grow your career.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8 py-6 h-auto bg-white text-black hover:bg-gray-100 font-medium transition-all duration-300 hover:scale-105" asChild>
                <Link href={NAV_CONFIG.signUp.path}>
                  Start today for free
                  <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-6 h-auto border-white/20 text-white hover:bg-white/10 font-medium transition-all duration-300 hover:scale-105" asChild>
                <Link href="#demo">
                  Book a demo
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Product Demo Section - like Liveblocks embedded UI */}
      <section className="py-20" id="demo">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Unlock the secret sauce behind world-class interviews
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              In just a few practice sessions, master the techniques that separate top performers from the rest
            </p>
          </div>

          {/* Mock Interview Interface Demo */}
          <div className="relative max-w-5xl mx-auto">
            <div className="bg-gray-900/50 border border-gray-700/50 rounded-2xl p-6 backdrop-blur-sm hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 transform hover:scale-[1.02]">
              {/* Demo Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="flex space-x-1">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse animation-delay-200"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse animation-delay-400"></div>
                  </div>
                  <div className="flex space-x-1">
                    <div className="px-3 py-1 bg-gray-800 text-gray-300 text-sm rounded transition-all duration-300 hover:bg-gray-700">Dashboard</div>
                    <div className="px-3 py-1 bg-blue-600 text-white text-sm rounded transition-all duration-300 hover:bg-blue-500 animate-pulse">Interview</div>
                    <div className="px-3 py-1 bg-gray-800 text-gray-300 text-sm rounded transition-all duration-300 hover:bg-gray-700">Practice</div>
                    <div className="px-3 py-1 bg-gray-800 text-gray-300 text-sm rounded transition-all duration-300 hover:bg-gray-700">Analytics</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold animate-bounce animation-delay-200">JD</div>
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold animate-bounce animation-delay-400">AS</div>
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold animate-bounce animation-delay-600">MJ</div>
                </div>
              </div>

              {/* Demo Content */}
              <div className="grid md:grid-cols-3 gap-6">
                {/* Left Sidebar */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg transition-all duration-300 hover:bg-gray-700/50 hover:scale-105 cursor-pointer group">
                    <Brain className="w-5 h-5 text-blue-400 group-hover:animate-pulse" />
                    <span className="text-white font-medium">AI Interviewer</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg transition-all duration-300 hover:bg-gray-700/50 hover:scale-105 cursor-pointer group">
                    <MessageCircle className="w-5 h-5 text-green-400 group-hover:animate-pulse" />
                    <span className="text-white font-medium">Feedback</span>
                    <div className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">3</div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg transition-all duration-300 hover:bg-gray-700/50 hover:scale-105 cursor-pointer group">
                    <BarChart className="w-5 h-5 text-purple-400 group-hover:animate-pulse" />
                    <span className="text-white font-medium">Progress</span>
                  </div>
                </div>

                {/* Main Interview Area */}
                <div className="md:col-span-2 space-y-4">
                  <div className="bg-gray-800/50 rounded-lg p-4 transition-all duration-300 hover:bg-gray-700/50">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
                        <Brain className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">AI Interviewer</h3>
                        <p className="text-gray-400 text-sm">Technical Interview - React.js</p>
                      </div>
                    </div>
                    <div className="bg-gray-700/50 rounded-lg p-4 mb-4 transition-all duration-300 hover:bg-gray-600/50">
                      <p className="text-white mb-3">"Can you explain the difference between useState and useEffect in React, and when would you use each?"</p>
                      <div className="flex items-center space-x-2 text-sm text-gray-400">
                        <Clock className="w-4 h-4 animate-pulse" />
                        <span className="animate-pulse">2:30 remaining</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 hover:scale-105">
                        <Video className="w-4 h-4 mr-2" />
                        Record Answer
                      </Button>
                      <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700 transition-all duration-300 hover:scale-105">
                        <FileText className="w-4 h-4 mr-2" />
                        Type Answer
                      </Button>
                    </div>
                  </div>

                  {/* Feedback Panel */}
                  <div className="bg-gray-800/50 rounded-lg p-4 transition-all duration-300 hover:bg-gray-700/50">
                    <h4 className="text-white font-semibold mb-3">Real-time Feedback</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-400 animate-pulse" />
                        <span className="text-gray-300 text-sm">Good technical knowledge</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Target className="w-4 h-4 text-yellow-400 animate-pulse" />
                        <span className="text-gray-300 text-sm">Could provide more examples</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="w-4 h-4 text-blue-400 animate-pulse" />
                        <span className="text-gray-300 text-sm">Confidence level: 85%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid - like Liveblocks feature showcase */}
      <section className="py-20 bg-gradient-to-r from-blue-600/10 to-purple-600/10 border-y border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready-made features your users already expect
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Everything you need to build world-class interview preparation experiences
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 hover:scale-105 group">
              <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-blue-500/30 group-hover:animate-pulse">
                <Brain className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">AI Interviewer</h3>
              <p className="text-gray-300">
                Intelligent AI that adapts questions based on your responses and provides personalized feedback
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 hover:scale-105 group">
              <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-green-500/30 group-hover:animate-pulse">
                <MessageCircle className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Real-time Feedback</h3>
              <p className="text-gray-300">
                Get instant feedback on your communication, body language, and interview techniques
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 hover:scale-105 group">
              <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-purple-500/30 group-hover:animate-pulse">
                <BarChart className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Progress Tracking</h3>
              <p className="text-gray-300">
                Monitor your improvement with detailed analytics and performance insights
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 hover:scale-105 group">
              <div className="w-16 h-16 bg-yellow-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-yellow-500/30 group-hover:animate-pulse">
                <Users2 className="w-8 h-8 text-yellow-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Multiplayer Practice</h3>
              <p className="text-gray-300">
                Practice with friends or colleagues in real-time collaborative interview sessions
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 hover:scale-105 group">
              <div className="w-16 h-16 bg-pink-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-pink-500/30 group-hover:animate-pulse">
                <Video className="w-8 h-8 text-pink-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Video Recording</h3>
              <p className="text-gray-300">
                Record your practice sessions and review them to identify areas for improvement
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 hover:scale-105 group">
              <div className="w-16 h-16 bg-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-indigo-500/30 group-hover:animate-pulse">
                <Shield className="w-8 h-8 text-indigo-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Secure & Private</h3>
              <p className="text-gray-300">
                Enterprise-grade security to keep your interview practice sessions private and secure
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Turn your interview preparation into the space where AI and humans collaborate
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of professionals who have transformed their interview skills with {APP_CONFIG.name}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 py-6 h-auto bg-white text-black hover:bg-gray-100 font-medium transition-all duration-300 hover:scale-105" asChild>
              <Link href={NAV_CONFIG.signUp.path}>
                Start today for free
                <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6 h-auto border-white/20 text-white hover:bg-white/10 font-medium transition-all duration-300 hover:scale-105" asChild>
              <Link href="#demo">
                Book a demo
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
