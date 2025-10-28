"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AnimatedGradient } from '@/components/animated-gradient'
import { ThemeToggle } from '@/components/theme-toggle'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Search, 
  Target, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  BarChart3,
  Globe,
  Eye,
  Settings,
  Play,
  Download,
  RefreshCw,
  Zap,
  Brain,
  FileText,
  Users,
  Star,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react'

interface SEOMetric {
  name: string
  value: number
  status: 'good' | 'warning' | 'critical'
  description: string
  recommendations: string[]
}

interface KeywordData {
  keyword: string
  volume: string
  difficulty: number
  opportunity: number
  currentRank: number
  trend: 'up' | 'down' | 'stable'
}

interface CompetitorData {
  name: string
  domain: string
  traffic: string
  keywords: number
  strengths: string[]
  weaknesses: string[]
}

const seoMetrics: SEOMetric[] = [
  {
    name: 'Page Speed',
    value: 78,
    status: 'warning',
    description: 'Your page loads in 3.2 seconds',
    recommendations: [
      'Optimize image sizes',
      'Enable browser caching',
      'Minify CSS and JavaScript'
    ]
  },
  {
    name: 'Mobile Responsiveness',
    value: 95,
    status: 'good',
    description: 'Excellent mobile experience',
    recommendations: [
      'Continue monitoring mobile performance',
      'Test on various devices'
    ]
  },
  {
    name: 'Content Quality',
    value: 88,
    status: 'good',
    description: 'High-quality, E-E-A-T compliant content',
    recommendations: [
      'Add more internal links',
      'Update content regularly'
    ]
  },
  {
    name: 'Backlink Profile',
    value: 62,
    status: 'warning',
    description: 'Moderate backlink authority',
    recommendations: [
      'Build relationships with industry sites',
      'Create shareable content',
      'Guest posting opportunities'
    ]
  },
  {
    name: 'Technical SEO',
    value: 85,
    status: 'good',
    description: 'Good technical foundation',
    recommendations: [
      'Fix minor schema markup issues',
      'Improve URL structure'
    ]
  },
  {
    name: 'User Experience',
    value: 71,
    status: 'warning',
    description: 'Average user engagement metrics',
    recommendations: [
      'Improve page navigation',
      'Add more engaging content',
      'Optimize call-to-actions'
    ]
  }
]

const keywordData: KeywordData[] = [
  {
    keyword: 'AI content generation',
    volume: '2,400',
    difficulty: 65,
    opportunity: 78,
    currentRank: 12,
    trend: 'up'
  },
  {
    keyword: 'SEO optimization tools',
    volume: '1,800',
    difficulty: 58,
    opportunity: 82,
    currentRank: 8,
    trend: 'up'
  },
  {
    keyword: 'E-E-A compliance',
    volume: '1,200',
    difficulty: 72,
    opportunity: 65,
    currentRank: 15,
    trend: 'stable'
  },
  {
    keyword: 'content marketing AI',
    volume: '3,600',
    difficulty: 78,
    opportunity: 58,
    currentRank: 22,
    trend: 'down'
  }
]

const competitorData: CompetitorData[] = [
  {
    name: 'ContentAI Pro',
    domain: 'contentai.pro',
    traffic: '450K',
    keywords: 1250,
    strengths: ['Strong brand authority', 'Large content library', 'Good backlink profile'],
    weaknesses: ['Outdated UI', 'Limited AI features', 'Poor mobile experience']
  },
  {
    name: 'SEOWrite',
    domain: 'seowrite.com',
    traffic: '320K',
    keywords: 890,
    strengths: ['Excellent UX', 'Advanced analytics', 'Strong keyword research'],
    weaknesses: ['Expensive pricing', 'Limited integrations', 'Slow support']
  }
]

export default function SEOPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [url, setUrl] = useState('')
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [currentAnalysis, setCurrentAnalysis] = useState('')
  const [showResults, setShowResults] = useState(false)

  const runAnalysis = async () => {
    if (!url) return
    
    setIsAnalyzing(true)
    setAnalysisProgress(0)
    setShowResults(false)

    const analysisSteps = [
      'Crawling website structure...',
      'Analyzing page performance...',
      'Checking technical SEO elements...',
      'Evaluating content quality...',
      'Assessing backlink profile...',
      'Analyzing competitor landscape...',
      'Generating recommendations...'
    ]

    for (let i = 0; i < analysisSteps.length; i++) {
      setCurrentAnalysis(analysisSteps[i])
      for (let progress = 0; progress <= 100; progress += 20) {
        await new Promise(resolve => setTimeout(resolve, 100))
        setAnalysisProgress(prev => Math.min(prev + 14, 100))
      }
    }

    setIsAnalyzing(false)
    setShowResults(true)
  }

  const getStatusColor = (status: SEOMetric['status']) => {
    switch (status) {
      case 'good':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200'
    }
  }

  const getStatusIcon = (status: SEOMetric['status']) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case 'critical':
        return <AlertCircle className="h-4 w-4 text-red-500" />
    }
  }

  const getTrendIcon = (trend: KeywordData['trend']) => {
    switch (trend) {
      case 'up':
        return <ArrowUp className="h-4 w-4 text-green-500" />
      case 'down':
        return <ArrowDown className="h-4 w-4 text-red-500" />
      default:
        return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  const overallScore = Math.round(seoMetrics.reduce((acc, metric) => acc + metric.value, 0) / seoMetrics.length)

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
                <h1 className="text-2xl md:text-3xl font-bold">SEO Analysis & Optimization</h1>
                <p className="text-muted-foreground">Comprehensive SEO audit and improvement recommendations</p>
              </div>
            </div>
            <ThemeToggle />
          </motion.div>

          {/* URL Input Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Search className="h-5 w-5 mr-2" />
                  Website Analysis
                </CardTitle>
                <CardDescription>
                  Enter your website URL to get a comprehensive SEO analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label htmlFor="url">Website URL</Label>
                    <Input
                      id="url"
                      placeholder="https://example.com"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      disabled={isAnalyzing}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button 
                      onClick={runAnalysis}
                      disabled={!url || isAnalyzing}
                      size="lg"
                    >
                      {isAnalyzing ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Start Analysis
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {isAnalyzing && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">{currentAnalysis}</span>
                      <span className="text-sm font-medium">{analysisProgress}%</span>
                    </div>
                    <Progress value={analysisProgress} className="h-2" />
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Results Section */}
          {showResults && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="keywords">Keywords</TabsTrigger>
                  <TabsTrigger value="competitors">Competitors</TabsTrigger>
                  <TabsTrigger value="recommendations">Actions</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                  {/* Overall Score */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>Overall SEO Score</span>
                        <Badge variant="outline" className="text-lg px-3 py-1">
                          {overallScore}/100
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center">
                        <div className="text-6xl font-bold text-primary mb-2">{overallScore}</div>
                        <p className="text-muted-foreground">
                          {overallScore >= 80 ? 'Excellent' : overallScore >= 60 ? 'Good' : 'Needs Improvement'}
                        </p>
                      </div>
                      <Progress value={overallScore} className="mt-4 h-3" />
                    </CardContent>
                  </Card>

                  {/* SEO Metrics Grid */}
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {seoMetrics.map((metric, index) => (
                      <motion.div
                        key={metric.name}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <Card className={`h-full ${getStatusColor(metric.status)} border`}>
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-lg">{metric.name}</CardTitle>
                              {getStatusIcon(metric.status)}
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-2xl font-bold">{metric.value}</span>
                                <span className="text-sm text-muted-foreground">/100</span>
                              </div>
                              <Progress value={metric.value} className="h-2" />
                              <p className="text-sm">{metric.description}</p>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </TabsContent>

                {/* Keywords Tab */}
                <TabsContent value="keywords" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Keyword Opportunities</CardTitle>
                      <CardDescription>
                        Target keywords with ranking potential and opportunity analysis
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {keywordData.map((keyword, index) => (
                          <motion.div
                            key={keyword.keyword}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            className="flex items-center justify-between p-4 border rounded-lg"
                          >
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <h3 className="font-medium">{keyword.keyword}</h3>
                                {getTrendIcon(keyword.trend)}
                              </div>
                              <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                                <span>Volume: {keyword.volume}</span>
                                <span>Difficulty: {keyword.difficulty}</span>
                                <span>Current Rank: #{keyword.currentRank}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-primary">{keyword.opportunity}%</div>
                              <div className="text-sm text-muted-foreground">Opportunity</div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Competitors Tab */}
                <TabsContent value="competitors" className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    {competitorData.map((competitor, index) => (
                      <motion.div
                        key={competitor.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                              <span>{competitor.name}</span>
                              <Globe className="h-4 w-4 text-muted-foreground" />
                            </CardTitle>
                            <CardDescription>{competitor.domain}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <div>
                                <div className="text-2xl font-bold">{competitor.traffic}</div>
                                <div className="text-sm text-muted-foreground">Monthly Traffic</div>
                              </div>
                              <div>
                                <div className="text-2xl font-bold">{competitor.keywords}</div>
                                <div className="text-sm text-muted-foreground">Keywords</div>
                              </div>
                            </div>
                            
                            <div className="space-y-3">
                              <div>
                                <h4 className="font-medium text-green-600 mb-1">Strengths</h4>
                                <ul className="text-sm space-y-1">
                                  {competitor.strengths.map((strength, i) => (
                                    <li key={i} className="flex items-center">
                                      <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                                      {strength}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              
                              <div>
                                <h4 className="font-medium text-red-600 mb-1">Weaknesses</h4>
                                <ul className="text-sm space-y-1">
                                  {competitor.weaknesses.map((weakness, i) => (
                                    <li key={i} className="flex items-center">
                                      <AlertCircle className="h-3 w-3 text-red-500 mr-2" />
                                      {weakness}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </TabsContent>

                {/* Recommendations Tab */}
                <TabsContent value="recommendations" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Action Plan</CardTitle>
                      <CardDescription>
                        Prioritized recommendations to improve your SEO performance
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {seoMetrics
                          .filter(metric => metric.status !== 'good')
                          .map((metric, index) => (
                            <motion.div
                              key={metric.name}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: index * 0.1 }}
                              className="border rounded-lg p-4"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <h3 className="font-semibold text-lg">{metric.name}</h3>
                                <Badge variant={metric.status === 'critical' ? 'destructive' : 'secondary'}>
                                  {metric.status === 'critical' ? 'Critical' : 'Important'}
                                </Badge>
                              </div>
                              <p className="text-muted-foreground mb-3">{metric.description}</p>
                              <div>
                                <h4 className="font-medium mb-2">Recommendations:</h4>
                                <ul className="space-y-2">
                                  {metric.recommendations.map((rec, i) => (
                                    <li key={i} className="flex items-start">
                                      <Target className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                                      <span className="text-sm">{rec}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </motion.div>
                          ))}
                      </div>
                      
                      <div className="mt-6 flex justify-center">
                        <Button size="lg">
                          <Download className="h-4 w-4 mr-2" />
                          Download Full Report
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </motion.div>
          )}
        </div>
      </AnimatedGradient>
    </div>
  )
}