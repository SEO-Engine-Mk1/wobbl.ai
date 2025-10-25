import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Brain, Search, CheckCircle, BarChart3, Zap, FileText, TrendingUp } from 'lucide-react'

export function Dashboard() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="border-b bg-white dark:bg-slate-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-slate-900 dark:text-white">wobbl.ai</span>
            </div>
            <nav className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => window.location.href = '/'}>Home</Button>
              <Button variant="ghost" onClick={() => window.location.href = '/settings'}>Settings</Button>
              <Button>Sign Out</Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">wobbl.ai Dashboard</h1>
          <p className="text-slate-600 dark:text-slate-300">Manage your SEO content and track performance</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">+2 from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">87%</div>
              <p className="text-xs text-muted-foreground">+5% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Originality</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">94%</div>
              <p className="text-xs text-muted-foreground">Above average</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">wobbl.ai Credits</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,250</div>
              <p className="text-xs text-muted-foreground">750 remaining</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="articles">Articles</TabsTrigger>
            <TabsTrigger value="research">Research</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your latest wobbl.ai content generation activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Article: "Best SEO Practices 2024"</p>
                        <p className="text-xs text-muted-foreground">Completed 2 hours ago</p>
                      </div>
                      <Badge variant="secondary">95%</Badge>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">SERP Research: "AI content tools"</p>
                        <p className="text-xs text-muted-foreground">Completed 5 hours ago</p>
                      </div>
                      <Badge variant="secondary">Complete</Badge>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Article: "Content Marketing Guide"</p>
                        <p className="text-xs text-muted-foreground">In progress - 60%</p>
                      </div>
                      <Badge variant="secondary">60%</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Start creating content with wobbl.ai quickly</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full justify-start" variant="outline">
                    <Search className="mr-2 h-4 w-4" />
                    New SERP Research
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Brain className="mr-2 h-4 w-4" />
                    Generate Article with wobbl.ai
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Check Originality
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    View Analytics
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="articles" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your wobbl.ai Articles</CardTitle>
                <CardDescription>Manage and track your generated content</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { title: "Best SEO Practices 2024", status: "Published", score: 95, date: "2024-01-15" },
                    { title: "AI Content Tools Comparison", status: "Draft", score: 87, date: "2024-01-14" },
                    { title: "Content Marketing Guide", status: "In Progress", score: 60, date: "2024-01-13" },
                    { title: "Link Building Strategies", status: "Published", score: 92, date: "2024-01-12" },
                  ].map((article, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{article.title}</h4>
                        <p className="text-sm text-muted-foreground">{article.date}</p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">{article.score}%</p>
                          <Progress value={article.score} className="w-20" />
                        </div>
                        <Badge variant={article.status === "Published" ? "default" : "secondary"}>
                          {article.status}
                        </Badge>
                        <Button variant="outline" size="sm">Edit</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="research" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>wobbl.ai SERP Research</CardTitle>
                <CardDescription>Analyze search engine results and competitor content</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex space-x-4">
                    <input
                      type="text"
                      placeholder="Enter keyword for wobbl.ai to research..."
                      className="flex-1 px-3 py-2 border rounded-md"
                    />
                    <Button>Research</Button>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Recent wobbl.ai Research</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="p-3 border rounded">
                            <p className="font-medium">"AI content tools"</p>
                            <p className="text-sm text-muted-foreground">Analyzed 10 competitors</p>
                          </div>
                          <div className="p-3 border rounded">
                            <p className="font-medium">"SEO best practices"</p>
                            <p className="text-sm text-muted-foreground">Analyzed 8 competitors</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">wobbl.ai Research Insights</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Avg. Word Count</span>
                            <span className="text-sm font-medium">2,450</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Avg. Readability</span>
                            <span className="text-sm font-medium">8th Grade</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Common Topics</span>
                            <span className="text-sm font-medium">AI, SEO, Content</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>wobbl.ai Performance Metrics</CardTitle>
                  <CardDescription>Track your content performance over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Average SEO Score</span>
                        <span className="text-sm font-medium">87%</span>
                      </div>
                      <Progress value={87} />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Originality Score</span>
                        <span className="text-sm font-medium">94%</span>
                      </div>
                      <Progress value={94} />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Readability Score</span>
                        <span className="text-sm font-medium">78%</span>
                      </div>
                      <Progress value={78} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>wobbl.ai Usage Statistics</CardTitle>
                  <CardDescription>Your wobbl.ai API usage and credits</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">wobbl.ai Credits Used</span>
                        <span className="text-sm font-medium">750/2000</span>
                      </div>
                      <Progress value={37.5} />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Articles Generated</span>
                        <span className="text-sm font-medium">24</span>
                      </div>
                      <Progress value={24} />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Research Queries</span>
                        <span className="text-sm font-medium">45</span>
                      </div>
                      <Progress value={45} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}