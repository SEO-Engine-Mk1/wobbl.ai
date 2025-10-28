"use client"

import { motion } from 'framer-motion'
import { Brain, CheckCircle, ArrowRight, Eye } from 'lucide-react'

export default function HomePage() {
  console.log('Wobbl.ai page loaded with lime-400 and violet-500 colors');
  
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <span className="text-lime-400 font-extrabold text-2xl">Wobbl.ai</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-slate-300 hover:text-lime-400 transition-colors">Features</a>
              <a href="#stats" className="text-slate-300 hover:text-lime-400 transition-colors">Stats</a>
              <a href="#testimonials" className="text-slate-300 hover:text-lime-400 transition-colors">Testimonials</a>
              <a href="#pricing" className="text-slate-300 hover:text-lime-400 transition-colors">Pricing</a>
            </div>
            
            <div className="flex items-center space-x-4">
              <a href="/dashboard">
                <button className="border border-violet-500 text-violet-500 hover:bg-violet-500/20 px-4 py-2 rounded-lg transition-colors">
                  Sign In
                </button>
              </a>
              <a href="/dashboard">
                <button className="bg-fuchsia-500 text-slate-950 font-semibold rounded-full hover:bg-fuchsia-400 px-6 py-2 transition-colors">
                  Get Started
                </button>
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-lime-400/10 border border-lime-400/20 mb-6">
                <span className="text-lime-400 text-sm font-medium">AI-Powered SEO Content Platform</span>
              </div>
            </motion.div>
            
            <motion.h1 
              className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <span className="text-zinc-100">
                Create Content That
              </span>
              <br />
              <span className="text-zinc-100">
                Actually Ranks
              </span>
            </motion.h1>
            
            <motion.p 
              className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Generate E-E-A-T compliant, SEO-optimized content at scale with Wobbl.ai. 
              Transform your content strategy and dominate search results.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <a href="/dashboard">
                <button className="bg-lime-400 text-slate-950 font-bold shadow-xl shadow-lime-400/50 text-lg px-8 py-3 rounded-lg transition-all duration-300 hover:shadow-lime-400/70">
                  Start Creating Free
                  <ArrowRight className="h-5 w-5 ml-2 inline-block" />
                </button>
              </a>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <button className="border border-violet-500 text-violet-500 hover:bg-violet-500/10 text-lg px-8 py-3 rounded-lg transition-all duration-300">
                  <Eye className="h-5 w-5 mr-2 inline-block" />
                  Watch Demo
                </button>
              </motion.div>
            </motion.div>
            
            <motion.div 
              className="flex items-center justify-center space-x-8 mt-8 text-sm text-slate-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                No credit card required
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                14-day free trial
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Cancel anytime
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-zinc-100">
              Powerful Features for Content Success
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Everything you need to create, optimize, and distribute high-performing content at scale.
            </p>
          </motion.div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* First Feature Card - AI-Powered Content Generation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700 hover:border-lime-400 p-6 rounded-xl transition-all duration-300 hover:scale-105">
                <div className="w-12 h-12 rounded-lg bg-lime-400 flex items-center justify-center mb-4">
                  <Brain className="h-6 w-6 text-slate-950" />
                </div>
                <h3 className="text-xl font-bold text-zinc-100 mb-3">AI-Powered Content Generation</h3>
                <p className="text-slate-300 mb-4">
                  Generate E-E-A-T compliant content using advanced AI that understands your niche and audience.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center text-sm text-slate-300">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    High-quality, original content
                  </li>
                  <li className="flex items-center text-sm text-slate-300">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    SEO optimized from creation
                  </li>
                  <li className="flex items-center text-sm text-slate-300">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    Brand voice consistency
                  </li>
                </ul>
              </div>
            </motion.div>

            {/* Second Feature Card - Smart SEO Optimization */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700 hover:border-violet-500 p-6 rounded-xl transition-all duration-300 hover:scale-105">
                <div className="w-12 h-12 rounded-lg bg-violet-500 flex items-center justify-center mb-4">
                  <Brain className="h-6 w-6 text-slate-950" />
                </div>
                <h3 className="text-xl font-bold text-zinc-100 mb-3">Smart SEO Optimization</h3>
                <p className="text-slate-300 mb-4">
                  Automatic keyword integration, semantic analysis, and search intent matching for better rankings.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center text-sm text-slate-300">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    Improved search rankings
                  </li>
                  <li className="flex items-center text-sm text-slate-300">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    Higher organic traffic
                  </li>
                  <li className="flex items-center text-sm text-slate-300">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    Better user engagement
                  </li>
                </ul>
              </div>
            </motion.div>

            {/* Third Feature Card - Performance Analytics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700 hover:border-fuchsia-500 p-6 rounded-xl transition-all duration-300 hover:scale-105">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-fuchsia-500 to-violet-500 flex items-center justify-center mb-4">
                  <Brain className="h-6 w-6 text-slate-950" />
                </div>
                <h3 className="text-xl font-bold text-zinc-100 mb-3">Performance Analytics</h3>
                <p className="text-slate-300 mb-4">
                  Real-time tracking of content performance with Google Search Console integration.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center text-sm text-slate-300">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    Detailed performance insights
                  </li>
                  <li className="flex items-center text-sm text-slate-300">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    ROI tracking
                  </li>
                  <li className="flex items-center text-sm text-slate-300">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    Competitor analysis
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-zinc-100">
              Trusted by Industry Leaders
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              See what our customers have to say about their experience with Wobbl.ai.
            </p>
          </motion.div>
          
          <div className="flex justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="max-w-2xl w-full"
            >
              <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700 hover:border-cyan-400 p-8 rounded-xl transition-all duration-300">
                <blockquote className="text-zinc-100 italic font-light text-lg mb-6">
                  "Wobbl.ai has completely transformed our content strategy. The AI-generated content is not only high-quality but also ranks exceptionally well. We've seen a 300% increase in organic traffic within just three months. It's an absolute game-changer for any serious content marketer."
                </blockquote>
                
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center font-bold text-xl mr-4">
                    SC
                  </div>
                  <div>
                    <div className="text-violet-500 font-semibold">
                      Sarah Chen
                    </div>
                    <div className="text-slate-300">
                      Content Director, TechCorp
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700 p-8 rounded-xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { value: "10,000+", label: "Articles Generated" },
                { value: "300%", label: "Average Traffic Increase" },
                { value: "95%", label: "Customer Satisfaction" },
                { value: "24/7", label: "AI Support" }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
                >
                  <div className="text-3xl md:text-4xl font-bold text-violet-500 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-slate-300">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}