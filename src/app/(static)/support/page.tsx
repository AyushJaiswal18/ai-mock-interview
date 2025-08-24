import { Button } from "@/components/ui/button";
import { APP_CONFIG } from "@/lib/constants";
import { Search, MessageCircle, Mail, Phone, BookOpen, HelpCircle } from "lucide-react";
import Link from "next/link";

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-6">How can we help?</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
            Find answers to common questions or get in touch with our support team
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for help articles, tutorials, and more..."
                className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Quick Help Categories */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <div className="p-6 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
            <BookOpen className="w-8 h-8 text-blue-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Getting Started</h3>
            <p className="text-gray-300 text-sm mb-4">Learn how to set up your account and start practicing</p>
            <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
              View Guide
            </Button>
          </div>

          <div className="p-6 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
            <HelpCircle className="w-8 h-8 text-green-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Account & Billing</h3>
            <p className="text-gray-300 text-sm mb-4">Manage your subscription and billing information</p>
            <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
              Learn More
            </Button>
          </div>

          <div className="p-6 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
            <MessageCircle className="w-8 h-8 text-purple-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Interview Practice</h3>
            <p className="text-gray-300 text-sm mb-4">Tips and best practices for interview preparation</p>
            <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
              Read Tips
            </Button>
          </div>

          <div className="p-6 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
            <Mail className="w-8 h-8 text-pink-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Email Support</h3>
            <p className="text-gray-300 text-sm mb-4">We'll respond within 24 hours</p>
            <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10" asChild>
              <Link href="/contact">Send Email</Link>
            </Button>
          </div>

          <div className="p-6 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
            <Phone className="w-8 h-8 text-orange-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Phone Support</h3>
            <p className="text-gray-300 text-sm mb-4">Call us during business hours</p>
            <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10" asChild>
              <Link href="/contact">Call Now</Link>
            </Button>
          </div>

          <div className="p-6 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
            <MessageCircle className="w-8 h-8 text-indigo-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Live Chat</h3>
            <p className="text-gray-300 text-sm mb-4">Get instant help during business hours</p>
            <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
              Start Chat
            </Button>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Frequently Asked Questions</h2>
          
          <div className="space-y-4">
            <div className="p-6 rounded-xl bg-white/5 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-2">
                How does the AI interview practice work?
              </h3>
              <p className="text-gray-300">
                Our AI analyzes your responses in real-time, providing feedback on communication, 
                body language, and interview techniques. You can practice with different scenarios 
                and difficulty levels.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white/5 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-2">
                Can I practice specific types of interviews?
              </h3>
              <p className="text-gray-300">
                Yes! We offer practice sessions for technical interviews, behavioral interviews, 
                case studies, and more. You can also customize scenarios based on your industry.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white/5 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-2">
                How accurate is the AI feedback?
              </h3>
              <p className="text-gray-300">
                Our AI has been trained on thousands of successful interviews and provides 
                feedback based on proven interview techniques. We continuously improve accuracy 
                based on user feedback.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white/5 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-2">
                What if I'm not satisfied with the service?
              </h3>
              <p className="text-gray-300">
                We offer a 30-day money-back guarantee. If you're not completely satisfied, 
                contact our support team for a full refund.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Support */}
        <div className="text-center p-8 rounded-2xl bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-white/10">
          <h2 className="text-3xl font-bold text-white mb-4">Still need help?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Our support team is here to help you succeed
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-black hover:bg-gray-100" asChild>
              <Link href="/contact">
                Contact Support
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="border-white/20 text-white hover:bg-white/10" asChild>
              <Link href="/contact">Book Demo</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
