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
  Play
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
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Master Your
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {" "}Interview Skills
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-8 leading-relaxed">
              {APP_CONFIG.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8 py-6 h-auto bg-white text-black hover:bg-gray-100" asChild>
                <Link href={NAV_CONFIG.signUp.path}>
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-6 h-auto border-white/20 text-white hover:bg-white/10" asChild>
                <Link href="#demo">
                  Book a demo
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Why Choose {APP_CONFIG.name}?
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Experience the future of interview preparation with AI-powered insights
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-blue-500/30">
                <Zap className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">AI-Powered Practice</h3>
              <p className="text-gray-300">
                Practice with intelligent AI that adapts to your responses and provides personalized feedback
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-green-500/30">
                <Target className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Real-time Feedback</h3>
              <p className="text-gray-300">
                Get instant feedback on your communication, body language, and interview techniques
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-purple-500/30">
                <TrendingUp className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Track Progress</h3>
              <p className="text-gray-300">
                Monitor your improvement with detailed analytics and performance insights
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-y border-white/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to ace your next interview?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of professionals who have improved their interview skills with {APP_CONFIG.name}
          </p>
          <Button size="lg" className="text-lg px-8 py-6 h-auto bg-white text-black hover:bg-gray-100" asChild>
            <Link href={NAV_CONFIG.signUp.path}>
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
