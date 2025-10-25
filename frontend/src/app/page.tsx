"use client"

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AnimatedGradient } from '@/components/animated-gradient'
import { ThemeToggle } from '@/components/theme-toggle'
import Link from 'next/link'
import { 
  Target, 
  BarChart3, 
  Shield, 
  Globe, 
  Users, 
  CheckCircle,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Star,
  Rocket,
  Brain,
  Eye
} from 'lucide-react'

const features = [
  {
    icon: Brain,
    title: "AI-Powered Content Generation",
    description: "Generate E-E-A-T compliant content using advanced AI that understands your niche and audience.",
    benefits: ["High-quality, original content", "SEO optimized from creation", "Brand voice consistency"]
  },
  {
    icon: Target,
    title: "Smart SEO Optimization",
    description: "Automatic keyword integration, semantic analysis, and search intent matching for better rankings.",
    benefits: ["Improved search rankings", "Higher organic traffic", "Better user engagement"]
  },
  {
    icon: BarChart3,
    title: "Performance Analytics",
    description: "Real-time tracking of content performance with Google Search Console integration.",
    benefits: ["Detailed performance insights", "ROI tracking", "Competitor analysis"]
  },
  {
    icon: Shield,
    title: "E-E-A-T Compliance",
    description: "Ensure all content meets Google's Experience, Expertise, Authoritativeness, and Trustworthiness standards.",
    benefits: ["Google algorithm compliance", "Higher content quality scores", "Reduced risk of penalties"]
  },
  {
    icon: Globe,
    title: "Multi-Platform Publishing",
    description: "Publish directly to WordPress, social media platforms, and email campaigns from one dashboard.",
    benefits: ["Save time on publishing", "Consistent messaging", "Automated workflows"]
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Work together with your team on content creation, review, and approval processes.",
    benefits: ["Streamlined workflows", "Version control", "Role-based permissions"]
  }
]

const benefits = [
  "Save 20+ hours per week on content creation",
  "Increase organic traffic by up to 300%",
  "Improve content quality scores by 40%",
  "Reduce content production costs by 60%",
  "Achieve top 10 rankings in 90 days",
  "Scale content production 10x"
]

const stats = [
  { value: "10,000+", label: "Articles Generated" },
  { value: "300%", label: "Average Traffic Increase" },
  { value: "95%", label: "Customer Satisfaction" },
  { value: "24/7", label: "AI Support" }
]

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Content Director, TechCorp",
    content: "Wobbl.ai transformed our content strategy. We're producing 10x more high-quality content and ranking for competitive keywords in record time.",
    rating: 5
  },
  {
    name: "Michael Rodriguez",
    role: "SEO Manager, EcommercePlus",
    content: "The E-E-A-T compliance features are game-changing. Our content quality scores improved dramatically, and we saw a 300% increase in organic traffic.",
    rating: 5
  },
  {
    name: "Emily Watson",
    role: "Digital Marketing Lead, StartupHub",
    content: "As a small team, Wobbl.ai allows us to compete with enterprise-level content operations. The ROI has been incredible.",
    rating: 5
  }
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <AnimatedGradient className="min-h-screen">
        {/* Navigation */}
        <motion.nav 
          className="sticky top-0 z-50 backdrop-blur-md bg-white/10 dark:bg-black/10 border-white/20 dark:border-white/10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-primary to-primary/60 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <span className="text-xl font-bold">Wobbl.ai</span>
              </div>
              
              <div className="hidden md:flex items-center space-x-8">
                <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
                <a href="#benefits" className="text-muted-foreground hover:text-foreground transition-colors">Benefits</a>
                <a href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">Testimonials</a>
                <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
              </div>
              
              <div className="flex items-center space-x-4">
                <ThemeToggle />
                <Link href="/dashboard">
                  <Button variant="outline">Sign In</Button>
                </Link>
                <Link href="/dashboard">
                  <Button>Get Started</Button>
                </Link>
              </div>
            </div>
          </div>
        </motion.nav>

        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
            <div className="text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
                  <Rocket className="h-3 w-3 mr-2" />
                  AI-Powered SEO Content Platform
                </Badge>
              </motion.div>
              
              <motion.h1 
                className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                  Create Content That
                </span>
                <br />
                <span className="bg-gradient-to-r from-primary/60 via-primary/80 to-primary bg-clip-text text-transparent">
                  Actually Ranks
                </span>
              </motion.h1>
              
              <motion.p 
                className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto"
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
                <Link href="/dashboard">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <Button size="lg" className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-lg px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                      <Sparkles className="h-5 w-5 mr-2 relative z-10" />
                      <span className="relative z-10">Start Creating Free</span>
                      <ArrowRight className="h-5 w-5 ml-2 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
                    </Button>
                  </motion.div>
                </Link>
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Button variant="outline" size="lg" className="text-lg px-8 py-3 border-2 hover:border-primary/50 hover:bg-primary/10 transition-all duration-300 group">
                    <Eye className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform duration-300" />
                    <span className="group-hover:text-primary transition-colors duration-300">Watch Demo</span>
                  </Button>
                </motion.div>
              </motion.div>
              
              <motion.div 
                className="flex items-center justify-center space-x-8 mt-8 text-sm text-muted-foreground"
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

        {/* Stats Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    className="text-center group"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <motion.div 
                      className="text-3xl md:text-4xl font-bold text-primary mb-2 group-hover:scale-110 transition-transform duration-300"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.6 + index * 0.1, type: "spring", stiffness: 200 }}
                    >
                      {stat.value}
                    </motion.div>
                    <div className="text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
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
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Powerful Features for Content Success
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Everything you need to create, optimize, and distribute high-performing content at scale.
              </p>
            </motion.div>
            
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
                >
                  <Card className="h-full backdrop-blur-md bg-white/10 dark:bg-black/10 border-white/20 dark:border-white/10 hover:shadow-lg transition-all duration-300 hover:scale-105 hover:bg-white/15 dark:hover:bg-black/15 group">
                    <CardHeader>
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors duration-300">
                        <feature.icon className="h-6 w-6 text-primary group-hover:scale-110 transition-transform duration-300" />
                      </div>
                      <CardTitle className="text-xl group-hover:text-primary transition-colors duration-300">{feature.title}</CardTitle>
                      <CardDescription className="text-base">
                        {feature.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {feature.benefits.map((benefit, benefitIndex) => (
                          <li key={benefitIndex} className="flex items-center text-sm group-hover:translate-x-1 transition-transform duration-300">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section id="benefits" className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Real Results, Real Fast
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Join thousands of content marketers who are transforming their strategy with Wobbl.ai
              </p>
            </motion.div>
            
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  className="flex items-center space-x-4 p-4 rounded-lg backdrop-blur-md bg-white/5 dark:bg-black/5 border border-white/10 dark:border-white/5 hover:bg-white/10 dark:hover:bg-black/10 hover:border-primary/20 transition-all duration-300 group cursor-pointer"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 + index * 0.05 }}
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.div 
                    className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0 group-hover:bg-green-200 dark:group-hover:bg-green-800 transition-colors duration-300"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </motion.div>
                  <span className="text-lg font-medium group-hover:text-primary transition-colors duration-300">{benefit}</span>
                </motion.div>
              ))}
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
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Loved by Content Marketers
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                See what our customers have to say about their experience with Wobbl.ai
              </p>
            </motion.div>
            
            <div className="grid gap-8 md:grid-cols-3">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Card className="h-full backdrop-blur-md bg-white/10 dark:bg-black/10 border-white/20 dark:border-white/10 hover:shadow-xl transition-all duration-300 group">
                    <CardContent className="p-6">
                      <div className="flex mb-4">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <motion.div
                            key={i}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.3, delay: 0.2 + i * 0.1 }}
                            whileHover={{ scale: 1.2, rotate: 360 }}
                          >
                            <Star className="h-4 w-4 text-yellow-400 fill-current mx-0.5" />
                          </motion.div>
                        ))}
                      </div>
                      <p className="text-muted-foreground mb-6 italic group-hover:text-foreground transition-colors duration-300">
                        "{testimonial.content}"
                      </p>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors duration-300">
                          <span className="text-primary font-semibold text-sm">
                            {testimonial.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <div className="font-semibold group-hover:text-primary transition-colors duration-300">{testimonial.name}</div>
                          <div className="text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300">{testimonial.role}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="p-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Ready to Transform Your Content Strategy?
                </h2>
                <p className="text-xl text-muted-foreground mb-8">
                  Join thousands of successful content marketers using Wobbl.ai to dominate search results.
                </p>
                <Link href="/dashboard">
                  <Button size="lg" className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-lg px-8 py-3">
                    <Rocket className="h-5 w-5 mr-2" />
                    Start Your Free Trial
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </Link>
                <p className="text-sm text-muted-foreground mt-4">
                  No credit card required • 14-day free trial • Cancel anytime
                </p>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/20 dark:border-white/10 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-r from-primary to-primary/60 flex items-center justify-center">
                    <Sparkles className="h-3 w-3 text-white" />
                  </div>
                  <span className="font-bold">Wobbl.ai</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  AI-powered SEO content platform for modern marketers.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium mb-4">Product</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="#features" className="hover:text-foreground">Features</a></li>
                  <li><a href="#pricing" className="hover:text-foreground">Pricing</a></li>
                  <li><a href="#" className="hover:text-foreground">API</a></li>
                  <li><a href="#" className="hover:text-foreground">Integrations</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium mb-4">Company</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="#" className="hover:text-foreground">About</a></li>
                  <li><a href="#" className="hover:text-foreground">Blog</a></li>
                  <li><a href="#" className="hover:text-foreground">Careers</a></li>
                  <li><a href="#" className="hover:text-foreground">Contact</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium mb-4">Support</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="#" className="hover:text-foreground">Help Center</a></li>
                  <li><a href="#" className="hover:text-foreground">Documentation</a></li>
                  <li><a href="#" className="hover:text-foreground">Status</a></li>
                  <li><a href="#" className="hover:text-foreground">Community</a></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-white/20 dark:border-white/10 mt-8 pt-8 text-center text-sm text-muted-foreground">
              <p>&copy; 2024 Wobbl.ai. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </AnimatedGradient>
    </div>
  )
}