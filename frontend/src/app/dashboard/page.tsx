"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { AnimatedGradient } from '@/components/animated-gradient'
import { StatCard } from '@/components/stat-card'
import { ThemeToggle } from '@/components/theme-toggle'
import Link from 'next/link'
import { PerformanceChart, CTRChart, PositionChart } from '@/components/charts/performance-chart'
import { ContentPreviewModal } from '@/components/content-preview-modal'
import { Home } from 'lucide-react'
import { 
  FileText, 
  TrendingUp, 
  Mail, 
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  Target,
  ArrowRight,
  Sparkles,
  Eye,
  Settings
} from 'lucide-react'

interface DashboardStats {
  totalArticles: number
  publishedArticles: number
  pendingReview: number
  avgOriginalityScore: number
  totalEmailsSent: number
  activeCampaigns: number
  gscProperties: number
  avgPosition: number
}

interface RecentArticle {
  id: string
  title: string
  content: string
  status: string
  originalityScore?: number
  qaPassed: boolean
  createdAt: string
  publishedAt?: string
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalArticles: 0,
    publishedArticles: 0,
    pendingReview: 0,
    avgOriginalityScore: 0,
    totalEmailsSent: 0,
    activeCampaigns: 0,
    gscProperties: 0,
    avgPosition: 0
  })

  const [recentArticles, setRecentArticles] = useState<RecentArticle[]>([])

  // Mock performance data for charts
  const [performanceData] = useState([
    { date: 'Jan 1', clicks: 120, impressions: 2400, ctr: 5.0, position: 15.2 },
    { date: 'Jan 8', clicks: 145, impressions: 2800, ctr: 5.2, position: 14.8 },
    { date: 'Jan 15', clicks: 168, impressions: 3200, ctr: 5.3, position: 13.9 },
    { date: 'Jan 22', clicks: 192, impressions: 3600, ctr: 5.3, position: 13.2 },
    { date: 'Jan 29', clicks: 210, impressions: 3900, ctr: 5.4, position: 12.8 },
    { date: 'Feb 5', clicks: 235, impressions: 4200, ctr: 5.6, position: 12.3 },
    { date: 'Feb 12', clicks: 258, impressions: 4500, ctr: 5.7, position: 11.9 }
  ])

  useEffect(() => {
    // Mock data - replace with API calls
    setStats({
      totalArticles: 24,
      publishedArticles: 18,
      pendingReview: 3,
      avgOriginalityScore: 92.5,
      totalEmailsSent: 1250,
      activeCampaigns: 2,
      gscProperties: 3,
      avgPosition: 12.3
    })

    setRecentArticles([
      {
        id: '1',
        title: 'Ultimate Guide to E-E-A-T Compliance in 2024',
        status: 'published',
        originalityScore: 95.2,
        qaPassed: true,
        createdAt: '2024-01-15',
        publishedAt: '2024-01-16',
        content: 'In this comprehensive guide, we explore everything you need to know about E-E-A-T (Experience, Expertise, Authoritativeness, and Trustworthiness) compliance in 2024. Learn how to create content that meets Google\'s quality standards and ranks well in search results.'
      },
      {
        id: '2',
        title: 'SEO Content Strategy: From Research to Rankings',
        status: 'reviewing',
        originalityScore: 89.7,
        qaPassed: false,
        createdAt: '2024-01-14',
        content: 'Discover the complete SEO content strategy that takes you from initial keyword research to achieving top rankings. This guide covers topic research, content creation, optimization, and promotion strategies.'
      },
      {
        id: '3',
        title: 'Technical SEO Audit Checklist for Modern Websites',
        status: 'draft',
        originalityScore: 91.3,
        qaPassed: false,
        createdAt: '2024-01-13',
        content: 'A comprehensive technical SEO audit checklist for modern websites. Cover everything from site speed and mobile optimization to structured data and crawlability issues.'
      }
    ])
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'reviewing':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'draft':
        return <AlertCircle className="h-4 w-4 text-gray-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      published: { label: 'Published', variant: 'default' },
      reviewing: { label: 'In Review', variant: 'secondary' },
      draft: { label: 'Draft', variant: 'outline' }
    }
    
    const config = variants[status] || { label: status, variant: 'outline' }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  return (
    <div className="min-h-screen bg-background">
      <AnimatedGradient className="min-h-screen">
        <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
          {/* Header with Theme Toggle */}
          <motion.div 
            className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div>
              <motion.h1 
                className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                Wobbl.ai Dashboard
              </motion.h1>
              <motion.p 
                className="text-base md:text-lg text-muted-foreground mt-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                E-E-A-T compliant content generation with AI-powered optimization
              </motion.p>
            </div>
            <div className="flex items-center space-x-2 md:space-x-4">
              <Link href="/">
                <Button variant="outline" size="sm">
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </Button>
              </Link>
              <ThemeToggle />
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button size="lg" className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 w-full md:w-auto">
                  <Sparkles className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Create Content</span>
                  <span className="sm:hidden">Create</span>
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </motion.div>
            </div>
          </motion.div>

          {/* Hero Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="p-4 md:p-6 lg:p-8 mb-6 md:mb-8">
              <div className="text-center mb-6 md:mb-8">
                <motion.h2 
                  className="text-2xl font-semibold mb-2"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  Welcome back! Here's your content performance overview
                </motion.h2>
                <motion.p 
                  className="text-muted-foreground"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  Track your SEO success and discover optimization opportunities
                </motion.p>
              </div>

              {/* Stats Grid */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  title="Total Articles"
                  value={stats.totalArticles}
                  subtitle={`${stats.publishedArticles} published`}
                  icon={FileText}
                  trend={{ value: 12, isPositive: true }}
                />
                <StatCard
                  title="Avg Originality"
                  value={`${stats.avgOriginalityScore}%`}
                  subtitle="Content quality score"
                  icon={Target}
                  trend={{ value: 5, isPositive: true }}
                />
                <StatCard
                  title="Active Campaigns"
                  value={stats.activeCampaigns}
                  subtitle={`${stats.totalEmailsSent} emails sent`}
                  icon={Mail}
                  trend={{ value: 8, isPositive: true }}
                />
                <StatCard
                  title="Avg Position"
                  value={stats.avgPosition}
                  subtitle={`${stats.gscProperties} properties connected`}
                  icon={TrendingUp}
                  trend={{ value: 15, isPositive: true }}
                />
              </div>
            </Card>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Tabs defaultValue="articles" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
                <TabsTrigger value="articles">Articles</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="campaigns">Email Campaigns</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="articles" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                  <motion.div
                    className="col-span-4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.7 }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle>Recent Articles</CardTitle>
                        <CardDescription>
                          Latest content generation and publishing activity
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {recentArticles.map((article, index) => (
                            <motion.div
                              key={article.id}
                              className="flex items-center space-x-4"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: 0.8 + index * 0.1 }}
                            >
                              {getStatusIcon(article.status)}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium leading-none">
                                  {article.title}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Created {article.createdAt}
                                  {article.publishedAt && ` • Published ${article.publishedAt}`}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                {article.originalityScore && (
                                  <Badge variant="outline">
                                    {article.originalityScore}% original
                                  </Badge>
                                )}
                                {getStatusBadge(article.status)}
                                <ContentPreviewModal article={article}>
                                  <Button variant="ghost" size="sm">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </ContentPreviewModal>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div
                    className="col-span-3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle>QA Status</CardTitle>
                        <CardDescription>
                          Content quality gates overview
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">E-E-A-T Compliance</span>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          </div>
                          <Progress value={85} />
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Originality Check</span>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          </div>
                          <Progress value={92} />
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Claim Verification</span>
                            <AlertCircle className="h-4 w-4 text-yellow-500" />
                          </div>
                          <Progress value={78} />
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">SEO Optimization</span>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          </div>
                          <Progress value={88} />
                        </div>

                        <Separator />

                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">
                            {stats.pendingReview} articles pending review
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              </TabsContent>

                <TabsContent value="analytics" className="space-y-4">
                <div className="grid gap-6">
                  <PerformanceChart
                    data={performanceData}
                    title="Search Performance Trends"
                    description="Clicks and impressions over the last 6 weeks"
                  />
                  
                  <div className="grid gap-6 md:grid-cols-2">
                    <CTRChart data={performanceData} />
                    <PositionChart data={performanceData} />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                  <Card className="col-span-4">
                    <CardHeader>
                      <CardTitle>Top Performing Content</CardTitle>
                      <CardDescription>
                        Your best-performing articles this month
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {recentArticles.slice(0, 3).map((article, index) => (
                          <div key={article.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                              {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium leading-none truncate">
                                {article.title}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {Math.floor(Math.random() * 5000 + 1000)} clicks • {Math.floor(Math.random() * 50 + 5)}% CTR
                              </p>
                            </div>
                            <Badge variant={index === 0 ? 'default' : index === 1 ? 'secondary' : 'outline'}>
                              {index === 0 ? 'Top' : index === 1 ? 'Rising' : 'Stable'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="col-span-3">
                    <CardHeader>
                      <CardTitle>Optimization Opportunities</CardTitle>
                      <CardDescription>
                        AI-generated refresh briefs
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Content Decay Detected</span>
                            <Badge variant="destructive">High</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            3 articles showing 25%+ impression drop
                          </p>
                        </div>
                        
                        <div className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">CTR Optimization</span>
                            <Badge variant="secondary">Medium</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            5 articles with low CTR despite good rankings
                          </p>
                        </div>
                        
                        <div className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">FAQ Opportunities</span>
                            <Badge variant="outline">Low</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Add FAQs for 8 high-volume queries
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="campaigns" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Email Campaigns</CardTitle>
                    <CardDescription>
                      Hostinger SMTP drip campaign management
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      <Mail className="h-12 w-12 mx-auto mb-4" />
                      <p>No active campaigns</p>
                      <p className="text-sm">Create your first drip email campaign to get started</p>
                      <Button className="mt-4">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Campaign
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>System Settings</CardTitle>
                    <CardDescription>
                      Manage integrations and monitor API connections
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-muted-foreground">
                        Access comprehensive API monitoring, connection health checks, and integration management.
                      </p>
                      <Link href="/settings">
                        <Button>
                          <Settings className="h-4 w-4 mr-2" />
                          Open Settings Dashboard
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </AnimatedGradient>
    </div>
  )
}