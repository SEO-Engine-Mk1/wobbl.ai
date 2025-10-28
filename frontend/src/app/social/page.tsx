"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
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
import { Checkbox } from '@/components/ui/checkbox'
import { AnimatedGradient } from '@/components/animated-gradient'
import { ThemeToggle } from '@/components/theme-toggle'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Share, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Send,
  Eye,
  Settings,
  Play,
  Pause,
  RefreshCw,
  Zap,
  Brain,
  FileText,
  Users,
  Star,
  Image,
  Link as LinkIcon,
  BarChart3,
  TrendingUp,
  Heart,
  MessageCircle,
  Repeat,
  Twitter,
  Linkedin,
  Facebook,
  Edit
} from 'lucide-react'

interface SocialPost {
  id: string
  content: string
  platforms: string[]
  scheduledTime?: Date
  status: 'draft' | 'scheduled' | 'posted' | 'failed'
  imageUrl?: string
  link?: string
  analytics?: {
    likes: number
    shares: number
    comments: number
    engagement: number
  }
}

interface PlatformConfig {
  name: string
  icon: any
  connected: boolean
  characterLimit: number
  hashtagSupport: boolean
  imageSupport: boolean
}

const platforms: PlatformConfig[] = [
  {
    name: 'Twitter',
    icon: Twitter,
    connected: true,
    characterLimit: 280,
    hashtagSupport: true,
    imageSupport: true
  },
  {
    name: 'LinkedIn',
    icon: Linkedin,
    connected: true,
    characterLimit: 3000,
    hashtagSupport: true,
    imageSupport: true
  },
  {
    name: 'Facebook',
    icon: Facebook,
    connected: false,
    characterLimit: 63206,
    hashtagSupport: true,
    imageSupport: true
  }
]

const mockPosts: SocialPost[] = [
  {
    id: '1',
    content: 'Just published a comprehensive guide on E-E-A-T compliance! 🎯 Check out how to create content that actually ranks in 2024. #SEO #ContentMarketing #EAT',
    platforms: ['Twitter', 'LinkedIn'],
    status: 'posted',
    scheduledTime: new Date('2024-01-15T10:00:00'),
    analytics: {
      likes: 45,
      shares: 12,
      comments: 8,
      engagement: 3.2
    }
  },
  {
    id: '2',
    content: 'AI is transforming content creation, but human creativity remains irreplaceable. Here\'s how to strike the perfect balance between automation and authenticity. 🤖✨',
    platforms: ['LinkedIn'],
    status: 'scheduled',
    scheduledTime: new Date('2024-01-16T14:00:00')
  },
  {
    id: '3',
    content: 'Working on something exciting... 🤫 Our new AI-powered SEO tool is going to change how you think about content optimization. Stay tuned!',
    platforms: ['Twitter'],
    status: 'draft'
  }
]

export default function SocialPage() {
  const [posts, setPosts] = useState<SocialPost[]>(mockPosts)
  const [newPost, setNewPost] = useState({
    content: '',
    platforms: [] as string[],
    scheduledTime: '',
    imageUrl: '',
    link: ''
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPosting, setIsPosting] = useState(false)
  const [activeTab, setActiveTab] = useState('create')

  const generatePost = async () => {
    setIsGenerating(true)
    
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const generatedContent = `🚀 Exciting news! We've just launched our latest AI-powered content optimization feature. 

✨ What's new:
• Enhanced SEO scoring
• Real-time content suggestions  
• E-E-A-T compliance checks
• Competitor analysis

Ready to take your content strategy to the next level? Try it now! 🎯

#AI #SEO #ContentMarketing #DigitalMarketing`

    setNewPost(prev => ({ ...prev, content: generatedContent }))
    setIsGenerating(false)
  }

  const schedulePost = async () => {
    if (!newPost.content || newPost.platforms.length === 0) return
    
    setIsPosting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const post: SocialPost = {
      id: Date.now().toString(),
      content: newPost.content,
      platforms: newPost.platforms,
      status: newPost.scheduledTime ? 'scheduled' : 'draft',
      scheduledTime: newPost.scheduledTime ? new Date(newPost.scheduledTime) : undefined,
      imageUrl: newPost.imageUrl || undefined,
      link: newPost.link || undefined
    }
    
    setPosts(prev => [post, ...prev])
    setNewPost({
      content: '',
      platforms: [],
      scheduledTime: '',
      imageUrl: '',
      link: ''
    })
    setIsPosting(false)
  }

  const getStatusColor = (status: SocialPost['status']) => {
    switch (status) {
      case 'posted':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: SocialPost['status']) => {
    switch (status) {
      case 'posted':
        return <CheckCircle className="h-4 w-4" />
      case 'scheduled':
        return <Clock className="h-4 w-4" />
      case 'failed':
        return <AlertCircle className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getPlatformIcon = (platformName: string) => {
    const platform = platforms.find(p => p.name === platformName)
    return platform ? platform.icon : Share
  }

  const getCharacterCount = (platform: string) => {
    const platformConfig = platforms.find(p => p.name === platform)
    return platformConfig ? platformConfig.characterLimit : 280
  }

  const getCharacterCountColor = (platform: string) => {
    const limit = getCharacterCount(platform)
    const count = newPost.content.length
    
    if (count > limit) return 'text-red-500'
    if (count > limit * 0.9) return 'text-yellow-500'
    return 'text-green-500'
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
                <h1 className="text-2xl md:text-3xl font-bold">Social Media Management</h1>
                <p className="text-muted-foreground">Create, schedule, and analyze social media content</p>
              </div>
            </div>
            <ThemeToggle />
          </motion.div>

          {/* Platform Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Connected Platforms</CardTitle>
                <CardDescription>
                  Manage your social media platform connections
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  {platforms.map((platform, index) => (
                    <motion.div
                      key={platform.name}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Card className={`p-4 ${platform.connected ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <platform.icon className="h-5 w-5" />
                            <span className="font-medium">{platform.name}</span>
                          </div>
                          <Badge variant={platform.connected ? 'default' : 'secondary'}>
                            {platform.connected ? 'Connected' : 'Disconnected'}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div>Limit: {platform.characterLimit.toLocaleString()} chars</div>
                          <div className="flex items-center space-x-2">
                            <span>Hashtags:</span>
                            {platform.hashtagSupport ? (
                              <CheckCircle className="h-3 w-3 text-green-500" />
                            ) : (
                              <AlertCircle className="h-3 w-3 text-red-500" />
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <span>Images:</span>
                            {platform.imageSupport ? (
                              <CheckCircle className="h-3 w-3 text-green-500" />
                            ) : (
                              <AlertCircle className="h-3 w-3 text-red-500" />
                            )}
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="create">Create Post</TabsTrigger>
                <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              {/* Create Post Tab */}
              <TabsContent value="create" className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-3">
                  {/* Post Creation */}
                  <motion.div
                    className="lg:col-span-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>Create New Post</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={generatePost}
                            disabled={isGenerating}
                          >
                            {isGenerating ? (
                              <>
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                Generating...
                              </>
                            ) : (
                              <>
                                <Brain className="h-4 w-4 mr-2" />
                                AI Generate
                              </>
                            )}
                          </Button>
                        </CardTitle>
                        <CardDescription>
                          Create engaging social media content with AI assistance
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label htmlFor="content">Content</Label>
                          <Textarea
                            id="content"
                            placeholder="What would you like to share?"
                            value={newPost.content}
                            onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                            className="min-h-[120px]"
                          />
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center space-x-4 text-sm">
                              {newPost.platforms.map(platform => (
                                <span key={platform} className={getCharacterCountColor(platform)}>
                                  {newPost.content.length}/{getCharacterCount(platform)}
                                </span>
                              ))}
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button variant="outline" size="sm">
                                <Image className="h-4 w-4 mr-2" />
                                Add Image
                              </Button>
                              <Button variant="outline" size="sm">
                                <LinkIcon className="h-4 w-4 mr-2" />
                                Add Link
                              </Button>
                            </div>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="imageUrl">Image URL (optional)</Label>
                          <Input
                            id="imageUrl"
                            placeholder="https://example.com/image.jpg"
                            value={newPost.imageUrl}
                            onChange={(e) => setNewPost(prev => ({ ...prev, imageUrl: e.target.value }))}
                          />
                        </div>

                        <div>
                          <Label htmlFor="link">Link URL (optional)</Label>
                          <Input
                            id="link"
                            placeholder="https://example.com"
                            value={newPost.link}
                            onChange={(e) => setNewPost(prev => ({ ...prev, link: e.target.value }))}
                          />
                        </div>

                        <div>
                          <Label htmlFor="schedule">Schedule (optional)</Label>
                          <Input
                            id="schedule"
                            type="datetime-local"
                            value={newPost.scheduledTime}
                            onChange={(e) => setNewPost(prev => ({ ...prev, scheduledTime: e.target.value }))}
                          />
                        </div>

                        <Separator />

                        <Button 
                          onClick={schedulePost}
                          disabled={!newPost.content || newPost.platforms.length === 0 || isPosting}
                          className="w-full"
                          size="lg"
                        >
                          {isPosting ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              Scheduling...
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4 mr-2" />
                              {newPost.scheduledTime ? 'Schedule Post' : 'Save Draft'}
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Platform Selection */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle>Select Platforms</CardTitle>
                        <CardDescription>
                          Choose where to publish your post
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {platforms.filter(p => p.connected).map((platform) => (
                            <div key={platform.name} className="flex items-center space-x-3">
                              <Checkbox
                                id={platform.name}
                                checked={newPost.platforms.includes(platform.name)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setNewPost(prev => ({
                                      ...prev,
                                      platforms: [...prev.platforms, platform.name]
                                    }))
                                  } else {
                                    setNewPost(prev => ({
                                      ...prev,
                                      platforms: prev.platforms.filter(p => p !== platform.name)
                                    }))
                                  }
                                }}
                              />
                              <Label htmlFor={platform.name} className="flex items-center space-x-2 cursor-pointer">
                                <platform.icon className="h-4 w-4" />
                                <span>{platform.name}</span>
                              </Label>
                            </div>
                          ))}
                        </div>

                        <Separator className="my-4" />

                        <div className="space-y-3">
                          <h4 className="font-medium">Post Preview</h4>
                          {newPost.platforms.map(platform => (
                            <Card key={platform} className="p-3">
                              <div className="flex items-center space-x-2 mb-2">
                                <getPlatformIcon platform={platform.name} className="h-4 w-4" />
                                <span className="font-medium text-sm">{platform.name}</span>
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-3">
                                {newPost.content || 'Your post content will appear here...'}
                              </p>
                              {newPost.imageUrl && (
                                <div className="mt-2 text-xs text-blue-500">
                                  📎 Image attached
                                </div>
                              )}
                              {newPost.link && (
                                <div className="mt-2 text-xs text-blue-500">
                                  🔗 Link attached
                                </div>
                              )}
                            </Card>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              </TabsContent>

              {/* Scheduled Posts Tab */}
              <TabsContent value="scheduled" className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Scheduled & Draft Posts</CardTitle>
                      <CardDescription>
                        Manage your scheduled posts and drafts
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {posts.map((post, index) => (
                          <motion.div
                            key={post.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            className="border rounded-lg p-4"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  {post.platforms.map(platform => (
                                    <getPlatformIcon key={platform} platform={platform} className="h-4 w-4" />
                                  ))}
                                  <Badge className={getStatusColor(post.status)}>
                                    {getStatusIcon(post.status)}
                                    <span className="ml-1">{post.status}</span>
                                  </Badge>
                                </div>
                                <p className="text-sm mb-2">{post.content}</p>
                                {post.scheduledTime && (
                                  <p className="text-xs text-muted-foreground">
                                    <Calendar className="h-3 w-3 inline mr-1" />
                                    {post.scheduledTime.toLocaleString()}
                                  </p>
                                )}
                                {post.analytics && (
                                  <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                                    <span className="flex items-center">
                                      <Heart className="h-3 w-3 mr-1" />
                                      {post.analytics.likes}
                                    </span>
                                    <span className="flex items-center">
                                      <MessageCircle className="h-3 w-3 mr-1" />
                                      {post.analytics.comments}
                                    </span>
                                    <span className="flex items-center">
                                      <Repeat className="h-3 w-3 mr-1" />
                                      {post.analytics.shares}
                                    </span>
                                    <span className="flex items-center">
                                      <BarChart3 className="h-3 w-3 mr-1" />
                                      {post.analytics.engagement}% engagement
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics" className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Total Posts</p>
                            <p className="text-2xl font-bold">24</p>
                          </div>
                          <Share className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div className="flex items-center mt-2 text-xs text-muted-foreground">
                          <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                          <span className="text-green-500">+12% from last month</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Total Engagement</p>
                            <p className="text-2xl font-bold">1,847</p>
                          </div>
                          <Heart className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div className="flex items-center mt-2 text-xs text-muted-foreground">
                          <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                          <span className="text-green-500">+24% from last month</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Avg. Engagement Rate</p>
                            <p className="text-2xl font-bold">3.8%</p>
                          </div>
                          <BarChart3 className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div className="flex items-center mt-2 text-xs text-muted-foreground">
                          <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                          <span className="text-green-500">+0.5% from last month</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Best Platform</p>
                            <p className="text-2xl font-bold">LinkedIn</p>
                          </div>
                          <Linkedin className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div className="flex items-center mt-2 text-xs text-muted-foreground">
                          <Star className="h-3 w-3 mr-1 text-yellow-500" />
                          <span>5.2% engagement rate</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Performance Overview</CardTitle>
                      <CardDescription>
                        Track your social media performance across platforms
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64 flex items-center justify-center text-muted-foreground">
                        <div className="text-center">
                          <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                          <p>Analytics charts will be displayed here</p>
                          <p className="text-sm">Integration with analytics APIs coming soon</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </AnimatedGradient>
    </div>
  )
}