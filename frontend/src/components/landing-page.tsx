import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Brain, Search, CheckCircle, Zap, Star, ArrowRight, Mail, Phone, MapPin, TrendingUp, Shield, Users, BarChart3, Globe, Lightbulb, Target, Rocket } from 'lucide-react'
import { useState } from 'react'

export function LandingPage() {
  const [currentPage, setCurrentPage] = useState('home')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
    // Handle form submission
  }

  const renderHomePage = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="border-b bg-white/50 backdrop-blur-sm dark:bg-slate-900/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-slate-900 dark:text-white">wobbl.ai</span>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <button onClick={() => setCurrentPage('home')} className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">Home</button>
              <button onClick={() => setCurrentPage('pricing')} className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">Pricing</button>
              <button onClick={() => setCurrentPage('faq')} className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">FAQ</button>
              <button onClick={() => setCurrentPage('contact')} className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">Contact</button>
              <Button onClick={() => window.location.href = '/dashboard'} variant="default">Get Started</Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <Badge variant="secondary" className="mb-4">
            <Zap className="mr-2 h-4 w-4" />
            AI-Powered Content Generation
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">
            Dominate Search Rankings with AI-Powered Content
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-3xl mx-auto">
            Create SEO-optimized content that ranks. wobbl.ai analyzes competitors, generates high-quality articles, and ensures originality - saving you 80% of content creation time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="text-lg px-8" onClick={() => window.location.href = '/dashboard'}>
              Start Creating Free <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8">
              Watch 2-Min Demo
            </Button>
          </div>
          
          {/* Social Proof */}
          <div className="flex items-center justify-center space-x-8 text-sm text-slate-600 dark:text-slate-300">
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-500 mr-1" />
              <span>4.9/5 Rating</span>
            </div>
            <div className="flex items-center">
              <Users className="h-4 w-4 text-blue-500 mr-1" />
              <span>10,000+ Users</span>
            </div>
            <div className="flex items-center">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span>300% Avg. Traffic Boost</span>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-white dark:bg-slate-800">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Why Content Creators Choose wobbl.ai
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Transform your content strategy with these game-changing benefits
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="flex items-start space-x-4">
              <div className="bg-blue-100 dark:bg-blue-900 rounded-lg p-3 flex-shrink-0">
                <Rocket className="h-6 w-6 text-blue-600 dark:text-blue-300" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">10x Faster Content Creation</h3>
                <p className="text-slate-600 dark:text-slate-300">Generate complete, SEO-optimized articles in under 5 minutes instead of hours of manual work.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="bg-green-100 dark:bg-green-900 rounded-lg p-3 flex-shrink-0">
                <Target className="h-6 w-6 text-green-600 dark:text-green-300" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Rank on Page 1 Consistently</h3>
                <p className="text-slate-600 dark:text-slate-300">Our AI analyzes top-ranking content to create articles that search engines love.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="bg-purple-100 dark:bg-purple-900 rounded-lg p-3 flex-shrink-0">
                <Shield className="h-6 w-6 text-purple-600 dark:text-purple-300" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">100% Original Content</h3>
                <p className="text-slate-600 dark:text-slate-300">Built-in plagiarism detection ensures your content is unique and never flagged.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="bg-orange-100 dark:bg-orange-900 rounded-lg p-3 flex-shrink-0">
                <BarChart3 className="h-6 w-6 text-orange-600 dark:text-orange-300" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Data-Driven Insights</h3>
                <p className="text-slate-600 dark:text-slate-300">Get real-time SEO scores and optimization suggestions as you write.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="bg-red-100 dark:bg-red-900 rounded-lg p-3 flex-shrink-0">
                <Globe className="h-6 w-6 text-red-600 dark:text-red-300" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Multi-Language Support</h3>
                <p className="text-slate-600 dark:text-slate-300">Create content in 25+ languages with native-level quality and cultural relevance.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="bg-indigo-100 dark:bg-indigo-900 rounded-lg p-3 flex-shrink-0">
                <Lightbulb className="h-6 w-6 text-indigo-600 dark:text-indigo-300" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">AI-Powered Ideas</h3>
                <p className="text-slate-600 dark:text-slate-300">Never run out of content ideas with our intelligent topic suggestion engine.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Everything You Need in One Platform
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Powerful features that make content creation effortless
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <Search className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle>SERP Analysis</CardTitle>
                <CardDescription>
                  Analyze search engine results and understand competitor strategies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  <li>• Top 10 ranking analysis</li>
                  <li>• Content gap identification</li>
                  <li>• Keyword density insights</li>
                  <li>• Structure optimization</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <Brain className="h-12 w-12 text-green-600 mb-4" />
                <CardTitle>AI Content Generation</CardTitle>
                <CardDescription>
                  Create high-quality, SEO-optimized content with advanced AI
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  <li>• E-E-A-T principles</li>
                  <li>• Multi-language support</li>
                  <li>• Tone adjustment</li>
                  <li>• Real-time optimization</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CheckCircle className="h-12 w-12 text-purple-600 mb-4" />
                <CardTitle>Originality Check</CardTitle>
                <CardDescription>
                  Ensure your content is unique and plagiarism-free
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  <li>• Advanced similarity detection</li>
                  <li>• Source attribution</li>
                  <li>• Content uniqueness score</li>
                  <li>• Improvement suggestions</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 bg-white dark:bg-slate-800">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              How wobbl.ai Works
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Create optimized content in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-300">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Research & Analyze</h3>
              <p className="text-slate-600 dark:text-slate-300">
                Enter your target keyword and let wobbl.ai analyze top-ranking content
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 dark:bg-green-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600 dark:text-green-300">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Generate Content</h3>
              <p className="text-slate-600 dark:text-slate-300">
                wobbl.ai creates optimized content based on SERP analysis and SEO best practices
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 dark:bg-purple-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600 dark:text-purple-300">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Validate & Publish</h3>
              <p className="text-slate-600 dark:text-slate-300">
                Check originality and export your content for immediate publishing
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300">
              Everything you need to know about wobbl.ai
            </p>
          </div>
          
          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="item-1" className="border rounded-lg px-6">
              <AccordionTrigger className="text-left">How does wobbl.ai create SEO-optimized content?</AccordionTrigger>
              <AccordionContent className="text-slate-600 dark:text-slate-300">
                wobbl.ai analyzes the top 10 search results for your target keyword, identifies ranking factors, content gaps, and semantic patterns. Our AI then generates comprehensive content that matches search intent and includes all relevant entities and topics that search engines expect to see.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-2" className="border rounded-lg px-6">
              <AccordionTrigger className="text-left">Is the content generated by wobbl.ai original?</AccordionTrigger>
              <AccordionContent className="text-slate-600 dark:text-slate-300">
                Yes! All content is 100% original and passes plagiarism checks. wobbl.ai creates unique content based on patterns and insights from SERP analysis, never copying existing content. We include built-in originality scoring to ensure uniqueness.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-3" className="border rounded-lg px-6">
              <AccordionTrigger className="text-left">Can I edit the content after generation?</AccordionTrigger>
              <AccordionContent className="text-slate-600 dark:text-slate-300">
                Absolutely! wobbl.ai provides a full-featured editor where you can modify, enhance, or personalize the generated content. You can adjust tone, add specific details, and make any changes needed before publishing.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-4" className="border rounded-lg px-6">
              <AccordionTrigger className="text-left">How long does it take to generate content?</AccordionTrigger>
              <AccordionContent className="text-slate-600 dark:text-slate-300">
                Content generation typically takes 2-5 minutes, depending on the length and complexity. This includes SERP analysis, content creation, and originality checking - significantly faster than the hours it would take manually.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-5" className="border rounded-lg px-6">
              <AccordionTrigger className="text-left">What languages does wobbl.ai support?</AccordionTrigger>
              <AccordionContent className="text-slate-600 dark:text-slate-300">
                wobbl.ai supports 25+ languages including English, Spanish, French, German, Italian, Portuguese, Dutch, Russian, Chinese, Japanese, Korean, and more. Content is generated with native-level fluency and cultural relevance.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-6" className="border rounded-lg px-6">
              <AccordionTrigger className="text-left">Can I cancel my subscription anytime?</AccordionTrigger>
              <AccordionContent className="text-slate-600 dark:text-slate-300">
                Yes, you can cancel your subscription at any time. No long-term commitments or hidden fees. You'll continue to have access until the end of your billing period.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 bg-white dark:bg-slate-800">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">50K+</div>
              <div className="text-slate-600 dark:text-slate-300">Articles Created</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">98%</div>
              <div className="text-slate-600 dark:text-slate-300">Customer Satisfaction</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">5,000+</div>
              <div className="text-slate-600 dark:text-slate-300">Active Users</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600 mb-2">300%</div>
              <div className="text-slate-600 dark:text-slate-300">Avg. Traffic Increase</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Transform Your Content Strategy with wobbl.ai?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of content creators using wobbl.ai to dominate search rankings
            </p>
            <Button size="lg" variant="secondary" className="text-lg px-8" onClick={() => window.location.href = '/dashboard'}>
              Start Free Trial
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white dark:bg-slate-900 py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Brain className="h-6 w-6 text-blue-600" />
                <span className="text-lg font-bold">wobbl.ai</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                AI-powered content generation for modern SEO strategies.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <li><button onClick={() => setCurrentPage('home')} className="hover:text-slate-900 dark:hover:text-white">Features</button></li>
                <li><button onClick={() => setCurrentPage('pricing')} className="hover:text-slate-900 dark:hover:text-white">Pricing</button></li>
                <li><button onClick={() => setCurrentPage('faq')} className="hover:text-slate-900 dark:hover:text-white">FAQ</button></li>
                <li><button onClick={() => setCurrentPage('contact')} className="hover:text-slate-900 dark:hover:text-white">Contact</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-white">Careers</a></li>
                <li><button onClick={() => setCurrentPage('contact')} className="hover:text-slate-900 dark:hover:text-white">Contact</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-white">Privacy</a></li>
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-white">Terms</a></li>
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-white">Security</a></li>
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-white">Compliance</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-8 text-center text-sm text-slate-600 dark:text-slate-300">
            <p>&copy; 2024 wobbl.ai. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )

  const renderPricingPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="border-b bg-white/50 backdrop-blur-sm dark:bg-slate-900/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-slate-900 dark:text-white">wobbl.ai</span>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <button onClick={() => setCurrentPage('home')} className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">Home</button>
              <button onClick={() => setCurrentPage('pricing')} className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">Pricing</button>
              <button onClick={() => setCurrentPage('faq')} className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">FAQ</button>
              <button onClick={() => setCurrentPage('contact')} className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">Contact</button>
              <Button onClick={() => window.location.href = '/dashboard'} variant="default">Get Started</Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Pricing Hero */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-3xl mx-auto">
            Choose the perfect plan for your content needs. Start free and scale as you grow.
          </p>
          <div className="flex items-center justify-center space-x-4 mb-12">
            <span className="text-slate-600 dark:text-slate-300">Monthly</span>
            <div className="bg-slate-200 dark:bg-slate-700 rounded-full p-1">
              <div className="bg-blue-600 rounded-full w-12 h-6"></div>
            </div>
            <span className="text-slate-600 dark:text-slate-300">Annual (Save 20%)</span>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 px-4 bg-white dark:bg-slate-800">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Starter Plan */}
            <Card className="border-2 border-slate-200 dark:border-slate-700">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl">Starter</CardTitle>
                <CardDescription className="text-lg">Perfect for individuals and small projects</CardDescription>
                <div className="mt-6">
                  <span className="text-4xl font-bold">$29</span>
                  <span className="text-slate-600 dark:text-slate-300">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>10 articles per month</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Basic SERP analysis</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>5 languages</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Plagiarism check</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Email support</span>
                </div>
                <Button className="w-full mt-6" variant="outline">Start Free Trial</Button>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="border-2 border-blue-500 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-600 text-white px-4 py-1">Most Popular</Badge>
              </div>
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl">Pro</CardTitle>
                <CardDescription className="text-lg">Ideal for growing businesses and agencies</CardDescription>
                <div className="mt-6">
                  <span className="text-4xl font-bold">$79</span>
                  <span className="text-slate-600 dark:text-slate-300">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>50 articles per month</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Advanced SERP analysis</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>15 languages</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Priority plagiarism check</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Priority support</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Team collaboration</span>
                </div>
                <Button className="w-full mt-6 bg-blue-600 hover:bg-blue-700">Start Free Trial</Button>
              </CardContent>
            </Card>

            {/* Enterprise Plan */}
            <Card className="border-2 border-slate-200 dark:border-slate-700">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl">Enterprise</CardTitle>
                <CardDescription className="text-lg">Custom solutions for large organizations</CardDescription>
                <div className="mt-6">
                  <span className="text-4xl font-bold">Custom</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Unlimited articles</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Custom SERP analysis</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>All 25+ languages</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>API access</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Dedicated support</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Custom integrations</span>
                </div>
                <Button className="w-full mt-6" variant="outline">Contact Sales</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Pricing Questions
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300">
              Everything you need to know about our pricing
            </p>
          </div>
          
          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="item-1" className="border rounded-lg px-6">
              <AccordionTrigger className="text-left">Can I change my plan anytime?</AccordionTrigger>
              <AccordionContent className="text-slate-600 dark:text-slate-300">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect at the next billing cycle.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-2" className="border rounded-lg px-6">
              <AccordionTrigger className="text-left">Do unused articles roll over?</AccordionTrigger>
              <AccordionContent className="text-slate-600 dark:text-slate-300">
                Articles don't roll over, but you can upgrade your plan anytime if you need more content in a month.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-3" className="border rounded-lg px-6">
              <AccordionTrigger className="text-left">Is there a free trial?</AccordionTrigger>
              <AccordionContent className="text-slate-600 dark:text-slate-300">
                Yes! All plans come with a 7-day free trial. No credit card required to start.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white dark:bg-slate-900 py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Brain className="h-6 w-6 text-blue-600" />
                <span className="text-lg font-bold">wobbl.ai</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                AI-powered content generation for modern SEO strategies.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <li><button onClick={() => setCurrentPage('home')} className="hover:text-slate-900 dark:hover:text-white">Features</button></li>
                <li><button onClick={() => setCurrentPage('pricing')} className="hover:text-slate-900 dark:hover:text-white">Pricing</button></li>
                <li><button onClick={() => setCurrentPage('faq')} className="hover:text-slate-900 dark:hover:text-white">FAQ</button></li>
                <li><button onClick={() => setCurrentPage('contact')} className="hover:text-slate-900 dark:hover:text-white">Contact</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-white">Careers</a></li>
                <li><button onClick={() => setCurrentPage('contact')} className="hover:text-slate-900 dark:hover:text-white">Contact</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-white">Privacy</a></li>
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-white">Terms</a></li>
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-white">Security</a></li>
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-white">Compliance</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-8 text-center text-sm text-slate-600 dark:text-slate-300">
            <p>&copy; 2024 wobbl.ai. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )

  const renderContactPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="border-b bg-white/50 backdrop-blur-sm dark:bg-slate-900/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-slate-900 dark:text-white">wobbl.ai</span>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <button onClick={() => setCurrentPage('home')} className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">Home</button>
              <button onClick={() => setCurrentPage('pricing')} className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">Pricing</button>
              <button onClick={() => setCurrentPage('faq')} className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">FAQ</button>
              <button onClick={() => setCurrentPage('contact')} className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">Contact</button>
              <Button onClick={() => window.location.href = '/dashboard'} variant="default">Get Started</Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Contact Hero */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">
            Get in Touch
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-3xl mx-auto">
            Have questions about wobbl.ai? We're here to help. Reach out to our team and we'll get back to you within 24 hours.
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-20 px-4 bg-white dark:bg-slate-800">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Send us a message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="mt-2"
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="mt-2"
                  />
                </div>
                
                <div>
                  <Label htmlFor="company">Company (Optional)</Label>
                  <Input
                    id="company"
                    name="company"
                    type="text"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="mt-2"
                  />
                </div>
                
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="mt-2"
                    placeholder="Tell us how we can help you..."
                  />
                </div>
                
                <Button type="submit" className="w-full" size="lg">
                  Send Message
                </Button>
              </form>
            </div>
            
            {/* Contact Info */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <Mail className="h-6 w-6 text-blue-600 mt-1" />
                    <div>
                      <h3 className="font-semibold mb-1">Email</h3>
                      <p className="text-slate-600 dark:text-slate-300">support@wobbl.ai</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">We'll respond within 24 hours</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <Phone className="h-6 w-6 text-blue-600 mt-1" />
                    <div>
                      <h3 className="font-semibold mb-1">Phone</h3>
                      <p className="text-slate-600 dark:text-slate-300">+1 (555) 123-4567</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Mon-Fri, 9AM-6PM EST</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <MapPin className="h-6 w-6 text-blue-600 mt-1" />
                    <div>
                      <h3 className="font-semibold mb-1">Office</h3>
                      <p className="text-slate-600 dark:text-slate-300">
                        123 AI Street<br />
                        San Francisco, CA 94105<br />
                        United States
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-bold mb-4">Support Hours</h3>
                <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-6">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Monday - Friday</span>
                      <span className="font-semibold">9:00 AM - 6:00 PM EST</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Saturday</span>
                      <span className="font-semibold">10:00 AM - 4:00 PM EST</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sunday</span>
                      <span className="font-semibold">Closed</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300">
              Quick answers to common questions
            </p>
          </div>
          
          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="item-1" className="border rounded-lg px-6">
              <AccordionTrigger className="text-left">How quickly will I receive a response?</AccordionTrigger>
              <AccordionContent className="text-slate-600 dark:text-slate-300">
                We typically respond to all inquiries within 24 hours during business days. For urgent matters, please call us directly.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-2" className="border rounded-lg px-6">
              <AccordionTrigger className="text-left">Do you offer demos?</AccordionTrigger>
              <AccordionContent className="text-slate-600 dark:text-slate-300">
                Yes! We offer personalized demos for teams and enterprises. Contact us to schedule a demo that fits your schedule.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-3" className="border rounded-lg px-6">
              <AccordionTrigger className="text-left">What kind of support do you provide?</AccordionTrigger>
              <AccordionContent className="text-slate-600 dark:text-slate-300">
                We provide email support for all users, with priority support for Pro and Enterprise plans. Enterprise customers also get dedicated account managers.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white dark:bg-slate-900 py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Brain className="h-6 w-6 text-blue-600" />
                <span className="text-lg font-bold">wobbl.ai</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                AI-powered content generation for modern SEO strategies.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <li><button onClick={() => setCurrentPage('home')} className="hover:text-slate-900 dark:hover:text-white">Features</button></li>
                <li><button onClick={() => setCurrentPage('pricing')} className="hover:text-slate-900 dark:hover:text-white">Pricing</button></li>
                <li><button onClick={() => setCurrentPage('faq')} className="hover:text-slate-900 dark:hover:text-white">FAQ</button></li>
                <li><button onClick={() => setCurrentPage('contact')} className="hover:text-slate-900 dark:hover:text-white">Contact</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-white">Careers</a></li>
                <li><button onClick={() => setCurrentPage('contact')} className="hover:text-slate-900 dark:hover:text-white">Contact</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-white">Privacy</a></li>
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-white">Terms</a></li>
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-white">Security</a></li>
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-white">Compliance</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-8 text-center text-sm text-slate-600 dark:text-slate-300">
            <p>&copy; 2024 wobbl.ai. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )

  const renderFAQPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="border-b bg-white/50 backdrop-blur-sm dark:bg-slate-900/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-slate-900 dark:text-white">wobbl.ai</span>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <button onClick={() => setCurrentPage('home')} className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">Home</button>
              <button onClick={() => setCurrentPage('pricing')} className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">Pricing</button>
              <button onClick={() => setCurrentPage('faq')} className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">FAQ</button>
              <button onClick={() => setCurrentPage('contact')} className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">Contact</button>
              <Button onClick={() => window.location.href = '/dashboard'} variant="default">Get Started</Button>
            </nav>
          </div>
        </div>
      </header>

      {/* FAQ Hero */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-3xl mx-auto">
            Everything you need to know about wobbl.ai and how it can transform your content strategy.
          </p>
        </div>
      </section>

      {/* FAQ Categories */}
      <section className="py-20 px-4 bg-white dark:bg-slate-800">
        <div className="container mx-auto max-w-4xl">
          <div className="grid md:grid-cols-3 gap-4 mb-12">
            <Button variant="outline" className="justify-start">Getting Started</Button>
            <Button variant="outline" className="justify-start">Features & Usage</Button>
            <Button variant="outline" className="justify-start">Billing & Support</Button>
          </div>
          
          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="item-1" className="border rounded-lg px-6">
              <AccordionTrigger className="text-left">What is wobbl.ai and how does it work?</AccordionTrigger>
              <AccordionContent className="text-slate-600 dark:text-slate-300">
                wobbl.ai is an AI-powered content generation platform that helps you create SEO-optimized content. It analyzes top-ranking search results, identifies what makes them successful, and generates unique, high-quality content that ranks well in search engines.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-2" className="border rounded-lg px-6">
              <AccordionTrigger className="text-left">How does wobbl.ai create SEO-optimized content?</AccordionTrigger>
              <AccordionContent className="text-slate-600 dark:text-slate-300">
                wobbl.ai analyzes the top 10 search results for your target keyword, identifies ranking factors, content gaps, and semantic patterns. Our AI then generates comprehensive content that matches search intent and includes all relevant entities and topics that search engines expect to see.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-3" className="border rounded-lg px-6">
              <AccordionTrigger className="text-left">Is the content generated by wobbl.ai original?</AccordionTrigger>
              <AccordionContent className="text-slate-600 dark:text-slate-300">
                Yes! All content is 100% original and passes plagiarism checks. wobbl.ai creates unique content based on patterns and insights from SERP analysis, never copying existing content. We include built-in originality scoring to ensure uniqueness.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-4" className="border rounded-lg px-6">
              <AccordionTrigger className="text-left">Can I edit the content after generation?</AccordionTrigger>
              <AccordionContent className="text-slate-600 dark:text-slate-300">
                Absolutely! wobbl.ai provides a full-featured editor where you can modify, enhance, or personalize the generated content. You can adjust tone, add specific details, and make any changes needed before publishing.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-5" className="border rounded-lg px-6">
              <AccordionTrigger className="text-left">How long does it take to generate content?</AccordionTrigger>
              <AccordionContent className="text-slate-600 dark:text-slate-300">
                Content generation typically takes 2-5 minutes, depending on the length and complexity. This includes SERP analysis, content creation, and originality checking - significantly faster than the hours it would take manually.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-6" className="border rounded-lg px-6">
              <AccordionTrigger className="text-left">What languages does wobbl.ai support?</AccordionTrigger>
              <AccordionContent className="text-slate-600 dark:text-slate-300">
                wobbl.ai supports 25+ languages including English, Spanish, French, German, Italian, Portuguese, Dutch, Russian, Chinese, Japanese, Korean, and more. Content is generated with native-level fluency and cultural relevance.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-7" className="border rounded-lg px-6">
              <AccordionTrigger className="text-left">How accurate is the SEO analysis?</AccordionTrigger>
              <AccordionContent className="text-slate-600 dark:text-slate-300">
                Our SEO analysis is highly accurate as it's based on real-time data from top-ranking pages. We continuously update our algorithms to reflect the latest search engine guidelines and ranking factors.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-8" className="border rounded-lg px-6">
              <AccordionTrigger className="text-left">Can I integrate wobbl.ai with my existing tools?</AccordionTrigger>
              <AccordionContent className="text-slate-600 dark:text-slate-300">
                Yes! wobbl.ai offers API access for Enterprise plans and integrates with popular CMS platforms like WordPress, as well as content management tools and SEO platforms.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-9" className="border rounded-lg px-6">
              <AccordionTrigger className="text-left">What payment methods do you accept?</AccordionTrigger>
              <AccordionContent className="text-slate-600 dark:text-slate-300">
                We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and wire transfers for Enterprise customers. All payments are processed securely through Stripe.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-10" className="border rounded-lg px-6">
              <AccordionTrigger className="text-left">Can I cancel my subscription anytime?</AccordionTrigger>
              <AccordionContent className="text-slate-600 dark:text-slate-300">
                Yes, you can cancel your subscription at any time. No long-term commitments or hidden fees. You'll continue to have access until the end of your billing period.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-11" className="border rounded-lg px-6">
              <AccordionTrigger className="text-left">Do you offer refunds?</AccordionTrigger>
              <AccordionContent className="text-slate-600 dark:text-slate-300">
                We offer a 14-day money-back guarantee for all new subscriptions. If you're not satisfied with wobbl.ai, contact us within 14 days for a full refund.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-12" className="border rounded-lg px-6">
              <AccordionTrigger className="text-left">What kind of support do you provide?</AccordionTrigger>
              <AccordionContent className="text-slate-600 dark:text-slate-300">
                We provide email support for all users, with priority support for Pro and Enterprise plans. Enterprise customers also get dedicated account managers and custom training sessions.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Still have questions */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Still have questions?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Can't find the answer you're looking for? Our support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="text-lg px-8" onClick={() => setCurrentPage('contact')}>
                Contact Support
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 text-white border-white hover:bg-white hover:text-slate-900">
                Schedule a Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white dark:bg-slate-900 py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Brain className="h-6 w-6 text-blue-600" />
                <span className="text-lg font-bold">wobbl.ai</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                AI-powered content generation for modern SEO strategies.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <li><button onClick={() => setCurrentPage('home')} className="hover:text-slate-900 dark:hover:text-white">Features</button></li>
                <li><button onClick={() => setCurrentPage('pricing')} className="hover:text-slate-900 dark:hover:text-white">Pricing</button></li>
                <li><button onClick={() => setCurrentPage('faq')} className="hover:text-slate-900 dark:hover:text-white">FAQ</button></li>
                <li><button onClick={() => setCurrentPage('contact')} className="hover:text-slate-900 dark:hover:text-white">Contact</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-white">Careers</a></li>
                <li><button onClick={() => setCurrentPage('contact')} className="hover:text-slate-900 dark:hover:text-white">Contact</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-white">Privacy</a></li>
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-white">Terms</a></li>
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-white">Security</a></li>
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-white">Compliance</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-8 text-center text-sm text-slate-600 dark:text-slate-300">
            <p>&copy; 2024 wobbl.ai. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )

  // Render the appropriate page based on current state
  switch (currentPage) {
    case 'pricing':
      return renderPricingPage()
    case 'contact':
      return renderContactPage()
    case 'faq':
      return renderFAQPage()
    default:
      return renderHomePage()
  }
}