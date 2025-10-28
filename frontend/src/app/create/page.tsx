"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AnimatedGradient } from '@/components/animated-gradient'
import { ThemeToggle } from '@/components/theme-toggle'
import Link from 'next/link'
import { 
  ArrowLeft, 
  ArrowRight, 
  Sparkles, 
  Brain, 
  Target, 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Zap,
  BarChart3,
  Eye,
  Settings,
  Play,
  Pause,
  RotateCcw,
  Download,
  Share,
  Globe,
  Users,
  TrendingUp
} from 'lucide-react'

interface GenerationStep {
  id: string
  title: string
  description: string
  status: 'pending' | 'in-progress' | 'completed' | 'error'
  progress: number
  duration?: string
  result?: any
}

interface ArticleData {
  topic: string
  keywords: string[]
  targetAudience: string
  tone: string
  length: string
  outline?: any[]
  content?: string
  seoScore?: number
  originalityScore?: number
}

const generationSteps: GenerationStep[] = [
  {
    id: 'research',
    title: 'Topic Research',
    description: 'Analyzing search intent and competitor content',
    status: 'pending',
    progress: 0
  },
  {
    id: 'outline',
    title: 'Content Outline',
    description: 'Creating structured outline with key sections',
    status: 'pending',
    progress: 0
  },
  {
    id: 'generation',
    title: 'AI Content Generation',
    description: 'Generating E-E-A compliant content',
    status: 'pending',
    progress: 0
  },
  {
    id: 'seo',
    title: 'SEO Optimization',
    description: 'Optimizing for search engines and readability',
    status: 'pending',
    progress: 0
  },
  {
    id: 'qa',
    title: 'Quality Assurance',
    description: 'Checking originality and fact verification',
    status: 'pending',
    progress: 0
  }
]

export default function CreatePage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)
  const [steps, setSteps] = useState<GenerationStep[]>(generationSteps)
  const [articleData, setArticleData] = useState<ArticleData>({
    topic: '',
    keywords: [],
    targetAudience: '',
    tone: 'professional',
    length: 'medium'
  })
  const [generatedContent, setGeneratedContent] = useState<string>('')
  const [showPreview, setShowPreview] = useState(false)

  const updateStepStatus = (stepId: string, status: GenerationStep['status'], progress: number, result?: any) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId 
        ? { ...step, status, progress, result }
        : step
    ))
  }

  const simulateGeneration = async () => {
    setIsGenerating(true)
    setCurrentStep(0)

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i]
      setCurrentStep(i)
      updateStepStatus(step.id, 'in-progress', 0)

      // Simulate progress
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 200))
        updateStepStatus(step.id, 'in-progress', progress)
      }

      updateStepStatus(step.id, 'completed', 100, getStepResult(step.id))
    }

    // Generate final content
    const finalContent = generateFinalContent()
    setGeneratedContent(finalContent)
    setIsGenerating(false)
    setShowPreview(true)
  }

  const getStepResult = (stepId: string) => {
    switch (stepId) {
      case 'research':
        return {
          searchVolume: '2,400/month',
          competition: 'Medium',
          topRanking: ['Guide 1', 'Article 2', 'Post 3']
        }
      case 'outline':
        return {
          sections: ['Introduction', 'Main Points', 'Examples', 'Conclusion'],
          wordCount: '1,500-2,000 words'
        }
      case 'generation':
        return {
          wordCount: 1850,
          readabilityScore: 85,
          toneMatch: 92
        }
      case 'seo':
        return {
          keywordDensity: '1.8%',
          metaDescription: 'Generated',
          internalLinks: 3
        }
      case 'qa':
        return {
          originalityScore: 94,
          factCheck: 'Passed',
          eeatScore: 88
        }
      default:
        return null
    }
  }

  const generateFinalContent = () => {
    return `
# ${articleData.topic}

## Introduction
In today's digital landscape, understanding ${articleData.topic} is crucial for success. This comprehensive guide explores the key concepts, strategies, and best practices that will help you master this important subject.

## Main Content
### Key Concepts
The foundation of ${articleData.topic} rests on several core principles that every practitioner should understand. These fundamental concepts serve as building blocks for more advanced strategies and implementations.

### Best Practices
When implementing ${articleData.topic} strategies, it's essential to follow industry best practices that have been proven effective across various contexts and scenarios.

### Common Challenges
Like any complex subject, ${articleData.topic} comes with its own set of challenges that practitioners must navigate. Understanding these obstacles upfront can help you prepare effective solutions.

## Advanced Strategies
For those looking to take their ${articleData.topic} efforts to the next level, advanced strategies offer opportunities for differentiation and superior results.

## Conclusion
Mastering ${articleData.topic} requires dedication, continuous learning, and practical application. By following the guidelines and strategies outlined in this guide, you'll be well-equipped to achieve your goals and drive meaningful results.

## Key Takeaways
- ${articleData.topic} is essential for modern success
- Implementation requires careful planning and execution
- Continuous optimization leads to better results
- Stay updated with industry trends and changes
    `.trim()
  }

  const getStepIcon = (status: GenerationStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'in-progress':
        return <Clock className="h-5 w-5 text-blue-500 animate-spin" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusColor = (status: GenerationStep['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'in-progress':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AnimatedGradient className="min-h-screen">
        <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
          {/* Header */}
          <motion.div 
            className="flex items-center justify-between"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">AI Content Generator</h1>
                <p className="text-muted-foreground">Create E-E-A-T compliant, SEO-optimized content</p>
              </div>
            </div>
            <ThemeToggle />
          </motion.div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Configuration Panel */}
            <motion.div
              className="lg:col-span-1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    Content Configuration
                  </CardTitle>
                  <CardDescription>
                    Configure your article parameters
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="topic">Topic</Label>
                    <Input
                      id="topic"
                      placeholder="Enter your article topic..."
                      value={articleData.topic}
                      onChange={(e) => setArticleData(prev => ({ ...prev, topic: e.target.value }))}
                      disabled={isGenerating}
                    />
                  </div>

                  <div>
                    <Label htmlFor="keywords">Keywords (comma-separated)</Label>
                    <Input
                      id="keywords"
                      placeholder="SEO, content marketing, AI..."
                      value={articleData.keywords.join(', ')}
                      onChange={(e) => setArticleData(prev => ({ 
                        ...prev, 
                        keywords: e.target.value.split(',').map(k => k.trim()).filter(k => k)
                      }))}
                      disabled={isGenerating}
                    />
                  </div>

                  <div>
                    <Label htmlFor="audience">Target Audience</Label>
                    <Select
                      value={articleData.targetAudience}
                      onValueChange={(value) => setArticleData(prev => ({ ...prev, targetAudience: value }))}
                      disabled={isGenerating}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select audience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginners">Beginners</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                        <SelectItem value="mixed">Mixed Audience</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="tone">Tone</Label>
                    <Select
                      value={articleData.tone}
                      onValueChange={(value) => setArticleData(prev => ({ ...prev, tone: value }))}
                      disabled={isGenerating}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select tone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="casual">Casual</SelectItem>
                        <SelectItem value="formal">Formal</SelectItem>
                        <SelectItem value="friendly">Friendly</SelectItem>
                        <SelectItem value="technical">Technical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="length">Article Length</Label>
                    <Select
                      value={articleData.length}
                      onValueChange={(value) => setArticleData(prev => ({ ...prev, length: value }))}
                      disabled={isGenerating}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select length" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="short">Short (500-800 words)</SelectItem>
                        <SelectItem value="medium">Medium (1000-1500 words)</SelectItem>
                        <SelectItem value="long">Long (2000+ words)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <Button 
                    onClick={simulateGeneration}
                    disabled={!articleData.topic || isGenerating}
                    className="w-full"
                    size="lg"
                  >
                    {isGenerating ? (
                      <>
                        <Pause className="h-4 w-4 mr-2" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Generate Article
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Generation Flow */}
            <motion.div
              className="lg:col-span-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Brain className="h-5 w-5 mr-2" />
                      AI Generation Pipeline
                    </div>
                    {isGenerating && (
                      <Badge variant="secondary" className="animate-pulse">
                        Processing...
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Watch as our AI creates your content step by step
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {steps.map((step, index) => (
                      <motion.div
                        key={step.id}
                        className={`relative p-4 rounded-lg border transition-all duration-300 ${
                          index === currentStep 
                            ? 'border-primary bg-primary/5 shadow-lg' 
                            : step.status === 'completed'
                            ? 'border-green-200 bg-green-50'
                            : 'border-gray-200 bg-gray-50'
                        }`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="mt-1">
                            {getStepIcon(step.status)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-medium">{step.title}</h3>
                              {step.status === 'completed' && (
                                <Badge variant="outline" className="text-xs">
                                  Complete
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              {step.description}
                            </p>
                            
                            {step.status === 'in-progress' && (
                              <div className="space-y-2">
                                <Progress value={step.progress} className="h-2" />
                                <p className="text-xs text-muted-foreground">
                                  {step.progress}% complete
                                </p>
                              </div>
                            )}

                            {step.status === 'completed' && step.result && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="mt-3 p-3 bg-white rounded border"
                              >
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  {Object.entries(step.result).map(([key, value]) => (
                                    <div key={key}>
                                      <span className="font-medium capitalize">
                                        {key.replace(/([A-Z])/g, ' $1').trim()}:
                                      </span>
                                      <span className="ml-1 text-muted-foreground">
                                        {typeof value === 'string' ? value : JSON.stringify(value)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </div>
                        </div>
                        
                        {index < steps.length - 1 && (
                          <div className="absolute left-8 top-full w-0.5 h-6 bg-gray-300 -translate-y-2" />
                        )}
                      </motion.div>
                    ))}
                  </div>

                  {/* Results Section */}
                  {showPreview && generatedContent && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6"
                    >
                      <Separator className="my-6" />
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Generated Content</h3>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Export
                          </Button>
                          <Button variant="outline" size="sm">
                            <Share className="h-4 w-4 mr-2" />
                            Share
                          </Button>
                          <Button size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            Full Preview
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid gap-4 md:grid-cols-3 mb-4">
                        <Card className="p-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">SEO Score</span>
                            <Target className="h-4 w-4 text-green-500" />
                          </div>
                          <div className="text-2xl font-bold text-green-600">94%</div>
                        </Card>
                        <Card className="p-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Originality</span>
                            <Zap className="h-4 w-4 text-blue-500" />
                          </div>
                          <div className="text-2xl font-bold text-blue-600">96%</div>
                        </Card>
                        <Card className="p-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">E-E-A-T</span>
                            <CheckCircle className="h-4 w-4 text-purple-500" />
                          </div>
                          <div className="text-2xl font-bold text-purple-600">88%</div>
                        </Card>
                      </div>

                      <Card className="p-6">
                        <div className="prose max-w-none">
                          <pre className="whitespace-pre-wrap text-sm leading-relaxed">
                            {generatedContent.substring(0, 500)}...
                          </pre>
                        </div>
                      </Card>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </AnimatedGradient>
    </div>
  )
}