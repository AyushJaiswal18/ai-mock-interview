import Link from "next/link";
import { Button } from "@/components/ui/button";
import { APP_CONFIG } from "@/lib/constants";
import { Users, Target, Award, Heart, ArrowRight } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              About {APP_CONFIG.name}
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              We're on a mission to democratize interview preparation and help millions of professionals 
              achieve their career goals through AI-powered practice and personalized feedback.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-white mb-6">Our Mission</h2>
              <p className="text-lg text-gray-300 mb-6">
                To eliminate the anxiety and uncertainty around job interviews by providing 
                accessible, intelligent, and personalized interview preparation tools that 
                help candidates showcase their true potential.
              </p>
              <p className="text-lg text-gray-300">
                We believe everyone deserves the opportunity to present their best self 
                during interviews, regardless of their background or experience level.
              </p>
            </div>
            <div className="p-8 rounded-2xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30">
              <Target className="w-16 h-16 text-blue-400 mb-6" />
              <h3 className="text-2xl font-bold text-white mb-4">Empowering Success</h3>
              <p className="text-gray-300">
                Through AI-driven insights and comprehensive practice sessions, 
                we're building a future where interview success is predictable and achievable.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Our Values</h2>
            <p className="text-xl text-gray-300">
              The principles that guide everything we do
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl bg-white/5 border border-white/10">
              <Users className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Accessibility</h3>
              <p className="text-gray-300">
                Making interview preparation available to everyone, regardless of their 
                background, location, or financial situation.
              </p>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-white/5 border border-white/10">
              <Award className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Excellence</h3>
              <p className="text-gray-300">
                Continuously improving our platform to provide the most effective 
                and accurate interview preparation experience.
              </p>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-white/5 border border-white/10">
              <Heart className="w-12 h-12 text-pink-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Empathy</h3>
              <p className="text-gray-300">
                Understanding the challenges job seekers face and creating solutions 
                that genuinely help them succeed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Our Team</h2>
            <p className="text-xl text-gray-300">
              Meet the passionate people behind {APP_CONFIG.name}
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl bg-white/5 border border-white/10">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">JD</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">John Doe</h3>
              <p className="text-blue-400 mb-3">CEO & Founder</p>
              <p className="text-gray-300 text-sm">
                Former tech executive with 15+ years of experience in AI and HR technology.
              </p>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-white/5 border border-white/10">
              <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-blue-400 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">JS</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Jane Smith</h3>
              <p className="text-green-400 mb-3">CTO</p>
              <p className="text-gray-300 text-sm">
                AI researcher and engineer with expertise in natural language processing.
              </p>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-white/5 border border-white/10">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">MJ</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Mike Johnson</h3>
              <p className="text-purple-400 mb-3">Head of Product</p>
              <p className="text-gray-300 text-sm">
                Product leader with deep experience in career development and education technology.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 bg-white/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Our Story</h2>
          </div>
          
          <div className="space-y-8 text-lg text-gray-300">
            <p>
              {APP_CONFIG.name} was born from a simple observation: brilliant candidates were 
              failing interviews not because they lacked skills, but because they lacked 
              confidence and practice.
            </p>
            
            <p>
              Our founder, John, experienced this firsthand when he struggled through 
              multiple interviews despite having the technical expertise. After finally 
              landing his dream job, he realized that interview preparation shouldn't 
              be a luxury or a mystery.
            </p>
            
            <p>
              In 2024, we launched {APP_CONFIG.name} with a mission to democratize 
              interview preparation. Using cutting-edge AI technology, we've created 
              a platform that provides personalized, realistic interview practice 
              that actually works.
            </p>
            
            <p>
              Today, we've helped thousands of professionals land their dream jobs, 
              and we're just getting started. Our vision is to become the world's 
              most trusted platform for interview preparation, helping millions 
              of people achieve their career goals.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-y border-white/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Join us on this journey
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Start your interview preparation journey with {APP_CONFIG.name} today
          </p>
          <Button size="lg" className="text-lg px-8 py-6 h-auto bg-white text-black hover:bg-gray-100" asChild>
            <Link href="/sign-up">
              Get Started Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
