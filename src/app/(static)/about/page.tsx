import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { APP_CONFIG } from "@/lib/constants";
import { Users, Target, Award, Heart, ArrowRight, Quote } from "lucide-react";

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

      {/* Founder Section */}
      <section className="py-16 bg-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Meet Our Founder</h2>
            <p className="text-xl text-gray-300">
              The visionary behind {APP_CONFIG.name}
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8 items-center">
            {/* Founder Image */}
            <div className="lg:col-span-1 flex justify-center">
              <div className="relative w-80 h-80 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10">
                {/* Placeholder for actual image - replace src with your image */}
                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center">
                  <span className="text-6xl font-bold text-white">AJ</span>
                </div>
                <Image
                  src="/images/founder.jpeg"
                  alt="Ayush Jaiswal - Founder & CEO"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            
            {/* Founder Info */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h3 className="text-3xl font-bold text-white mb-2">Ayush Jaiswal</h3>
                <p className="text-blue-400 text-xl mb-4">Founder & CEO</p>
                <p className="text-lg text-gray-300 leading-relaxed">
                  Former tech executive with 2+ years of experience in AI and HR technology. 
                  Ayush founded {APP_CONFIG.name} with a vision to democratize interview preparation 
                  and help millions of professionals achieve their career goals.
                </p>
              </div>
              
              {/* Quote */}
              <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-xl p-6">
                <Quote className="w-8 h-8 text-blue-400 mb-4" />
                <p className="text-gray-300 italic text-lg">
                  "I believe everyone deserves the opportunity to present their best self during interviews. 
                  Our AI-powered platform makes that possible for everyone."
                </p>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">2+</div>
                  <div className="text-sm text-gray-400">Years Experience</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">1000+</div>
                  <div className="text-sm text-gray-400">Users Helped</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">95%</div>
                  <div className="text-sm text-gray-400">Success Rate</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Our Values</h2>
            <p className="text-xl text-gray-300">
              The principles that guide everything we do
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300">
              <Users className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Accessibility</h3>
              <p className="text-gray-300">
                Making interview preparation available to everyone, regardless of their 
                background, location, or financial situation.
              </p>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300">
              <Award className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Excellence</h3>
              <p className="text-gray-300">
                Continuously improving our platform to provide the most effective 
                and accurate interview preparation experience.
              </p>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300">
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
              Our founder, Ayush, experienced this firsthand when he struggled through 
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
