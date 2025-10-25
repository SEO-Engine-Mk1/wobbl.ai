"use client"

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Share2, MessageCircle, ExternalLink } from 'lucide-react'

interface ContentPreviewModalProps {
  article: {
    id: string
    title: string
    content: string
    status: string
    publishedAt?: string
    originalityScore?: number
  }
  children: React.ReactNode
}

export function ContentPreviewModal({ article, children }: ContentPreviewModalProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Content Preview</DialogTitle>
          <DialogDescription>
            See how your content will appear across different platforms
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="blog" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="blog">Blog Post</TabsTrigger>
            <TabsTrigger value="social">Social Media</TabsTrigger>
            <TabsTrigger value="email">Email Preview</TabsTrigger>
            <TabsTrigger value="seo">SEO Meta</TabsTrigger>
          </TabsList>
          
          <TabsContent value="blog" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Blog Article Preview</CardTitle>
                  <Badge variant={article.status === 'published' ? 'default' : 'secondary'}>
                    {article.status}
                  </Badge>
                </div>
                <CardDescription>
                  How your article will appear on your blog
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <h1 className="text-3xl font-bold mb-4">{article.title}</h1>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-6">
                    <span>By Wobbl.ai</span>
                    {article.publishedAt && <span>• {article.publishedAt}</span>}
                    {article.originalityScore && (
                      <span>• {article.originalityScore}% Original</span>
                    )}
                  </div>
                  <div className="whitespace-pre-wrap">
                    {article.content || 'This is a preview of your article content. The full article would appear here with proper formatting, headings, and rich media elements.'}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="social" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* LinkedIn Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">LinkedIn Post</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-semibold">WA</span>
                      </div>
                      <div>
                        <div className="font-medium">Wobbl.ai</div>
                        <div className="text-sm text-muted-foreground">2h ago</div>
                      </div>
                    </div>
                    <div className="text-sm">
                      <p className="font-medium mb-2">{article.title}</p>
                      <p className="text-muted-foreground line-clamp-3">
                        {article.content ? article.content.substring(0, 200) + '...' : 'Check out our latest article on SEO best practices and content optimization strategies.'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <button className="flex items-center space-x-1 hover:text-primary">
                        <MessageCircle className="h-4 w-4" />
                        <span>24</span>
                      </button>
                      <button className="flex items-center space-x-1 hover:text-primary">
                        <Share2 className="h-4 w-4" />
                        <span>12</span>
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Twitter/X Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">X (Twitter) Post</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-semibold text-sm">WA</span>
                      </div>
                      <div>
                        <div className="font-medium text-sm">WobblAI</div>
                        <div className="text-xs text-muted-foreground">2h</div>
                      </div>
                    </div>
                    <div className="text-sm">
                      <p className="mb-2">
                        {article.content ? article.content.substring(0, 240) + '...' : `New article: ${article.title}`}
                      </p>
                      <div className="border rounded-lg p-3 bg-muted/50">
                        <div className="text-xs text-muted-foreground mb-1">seocontentengine.com</div>
                        <div className="font-medium text-sm">{article.title}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                      <button className="hover:text-primary">
                        <MessageCircle className="h-4 w-4" />
                      </button>
                      <button className="hover:text-primary">
                        <Share2 className="h-4 w-4" />
                      </button>
                      <button className="hover:text-primary">
                        <ExternalLink className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="email" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Email Newsletter Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-6 bg-white dark:bg-gray-900">
                  <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-6">
                      <h2 className="text-2xl font-bold mb-2">Wobbl.ai</h2>
                      <p className="text-muted-foreground">Weekly Content Digest</p>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold">{article.title}</h3>
                      <div className="text-muted-foreground">
                        {article.content ? article.content.substring(0, 300) + '...' : 'This week we published an insightful article on SEO strategies and content optimization. Learn how to improve your search rankings and create better content.'}
                      </div>
                      
                      <div className="pt-4">
                        <Button className="w-full">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Read Full Article
                        </Button>
                      </div>
                      
                      <div className="border-t pt-4 text-center text-sm text-muted-foreground">
                        <p>You're receiving this email because you subscribed to our newsletter.</p>
                        <p className="mt-2">
                          <a href="#" className="text-primary hover:underline">Unsubscribe</a> • 
                          <a href="#" className="text-primary hover:underline ml-2">Preferences</a>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="seo" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Google Search Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Google Search Result</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-sm text-blue-600 hover:underline cursor-pointer">
                      wobbl.ai/blog/article-title
                    </div>
                    <div className="text-lg text-blue-900 dark:text-blue-300 hover:underline cursor-pointer">
                      {article.title}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {article.content ? article.content.substring(0, 160) + '...' : 'This meta description would be automatically generated based on your article content. It should be compelling and include relevant keywords.'}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* SEO Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">SEO Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Title Length</span>
                      <span className="text-sm font-medium">{article.title.length}/60 chars</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Meta Description</span>
                      <span className="text-sm font-medium">158/160 chars</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Word Count</span>
                      <span className="text-sm font-medium">2,450 words</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Readability</span>
                      <span className="text-sm font-medium text-green-600">Good</span>
                    </div>
                    {article.originalityScore && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Originality</span>
                        <span className="text-sm font-medium text-green-600">{article.originalityScore}%</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Close
          </Button>
          <Button>
            <ExternalLink className="h-4 w-4 mr-2" />
            Publish
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}