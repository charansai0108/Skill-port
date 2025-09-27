'use client'

import { useState } from 'react'
import { 
  Target, 
  Users, 
  Trophy, 
  BarChart3, 
  GraduationCap, 
  Smartphone,
  CheckCircle
} from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  const [isSubscribed, setIsSubscribed] = useState(false)

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubscribed(true)
    setTimeout(() => setIsSubscribed(false), 3000)
  }

  return (
    <div className="bg-gradient-to-br from-red-50 via-pink-50 to-orange-50 min-h-screen">
      {/* Hero Section */}
      <main className="hero-section max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
            Your Complete
            <span className="bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent"> Skill Platform</span>
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
            Empowering learners, building communities, tracking progress, achieving excellence! 
            Join thousands of developers mastering algorithms, data structures, and problem-solving skills.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register" className="btn-primary px-8 py-3 rounded-xl text-lg font-semibold text-white">
              Start Learning Today
            </Link>
            <Link href="#features" className="btn-secondary px-8 py-3 rounded-xl text-lg font-semibold">
              Explore Features
            </Link>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div className="hero-card rounded-2xl p-6 text-center">
            <div className="text-4xl font-bold text-red-600 mb-2">10K+</div>
            <div className="text-slate-600">Active Learners</div>
          </div>
          <div className="hero-card rounded-2xl p-6 text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">500+</div>
            <div className="text-slate-600">Problems Solved</div>
          </div>
          <div className="hero-card rounded-2xl p-6 text-center">
            <div className="text-4xl font-bold text-purple-600 mb-2">95%</div>
            <div className="text-slate-600">Success Rate</div>
          </div>
        </div>

        {/* Features Section */}
        <section id="features" className="mb-20">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">Why Choose SkillPort?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="feature-card rounded-2xl p-6">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Skill Tracking</h3>
              <p className="text-slate-600">Monitor your progress across different skill categories and track your improvement over time.</p>
            </div>
            
            <div className="feature-card rounded-2xl p-6">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Community Learning</h3>
              <p className="text-slate-600">Join a vibrant community of learners, share knowledge, and collaborate on projects.</p>
            </div>
            
            <div className="feature-card rounded-2xl p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <Trophy className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Contest Participation</h3>
              <p className="text-slate-600">Compete in coding contests, challenge yourself, and climb the leaderboards.</p>
            </div>
            
            <div className="feature-card rounded-2xl p-6">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Analytics & Insights</h3>
              <p className="text-slate-600">Get detailed analytics about your performance and personalized recommendations.</p>
            </div>
            
            <div className="feature-card rounded-2xl p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <GraduationCap className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Mentor Support</h3>
              <p className="text-slate-600">Connect with experienced mentors who can guide you through your learning journey.</p>
            </div>
            
            <div className="feature-card rounded-2xl p-6">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
                <Smartphone className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Mobile First</h3>
              <p className="text-slate-600">Learn on the go with our mobile-optimized platform that works on all devices.</p>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="mb-20">
          <div className="hero-card rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-slate-900 text-center mb-8">About SkillPort</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <p className="text-slate-600 mb-4">
                  SkillPort is a comprehensive learning platform designed for developers who want to master 
                  competitive programming, algorithms, and data structures. Our platform combines the best 
                  of traditional learning with modern technology to create an engaging and effective 
                  learning experience.
                </p>
                <p className="text-slate-600 mb-4">
                  Whether you&apos;re a beginner looking to start your coding journey or an experienced 
                  developer wanting to sharpen your skills, SkillPort provides the tools, resources, 
                  and community support you need to succeed.
                </p>
                <p className="text-slate-600">
                  Join thousands of learners who have already transformed their coding abilities 
                  and achieved their career goals with SkillPort.
                </p>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-8">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600 mb-1">24/7</div>
                    <div className="text-sm text-slate-600">Learning Access</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 mb-1">50+</div>
                    <div className="text-sm text-slate-600">Skill Categories</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600 mb-1">1000+</div>
                    <div className="text-sm text-slate-600">Practice Problems</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600 mb-1">24/7</div>
                    <div className="text-sm text-slate-600">Support</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="mb-20">
          <div className="hero-card rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-slate-900 text-center mb-8">Get In Touch</h2>
            <div className="max-w-2xl mx-auto">
              <form onSubmit={handleSubscribe} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">First Name</label>
                    <input type="text" name="firstName" required className="form-input w-full px-3 py-2 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Last Name</label>
                    <input type="text" name="lastName" required className="form-input w-full px-3 py-2 rounded-xl" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Email</label>
                  <input type="email" name="email" required className="form-input w-full px-3 py-2 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Message</label>
                  <textarea name="message" rows={4} required className="form-input w-full px-3 py-2 rounded-xl resize-none" />
                </div>
                <div className="text-center">
                  <button type="submit" className="btn-primary px-8 py-3 rounded-xl text-lg font-semibold text-white">
                    Send Message
                  </button>
                </div>
              </form>
              {isSubscribed && (
                <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg text-center">
                  <CheckCircle className="w-5 h-5 inline mr-2" />
                  Thank you for your message! We&apos;ll get back to you soon.
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
