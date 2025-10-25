import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Brain } from 'lucide-react'

export function Settings() {
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
              <Button variant="ghost" onClick={() => window.location.href = '/dashboard'}>Dashboard</Button>
              <Button>Sign Out</Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">wobbl.ai Settings</h1>
          <p className="text-slate-600 dark:text-slate-300">Manage your wobbl.ai account and application settings</p>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="api">API Keys</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>Update your wobbl.ai profile information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" placeholder="John" />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" placeholder="Doe" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="john.doe@example.com" />
                </div>
                <div>
                  <Label htmlFor="company">Company</Label>
                  <Input id="company" placeholder="Acme Inc." />
                </div>
                <Button>Save Changes</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>wobbl.ai Preferences</CardTitle>
                <CardDescription>Customize your wobbl.ai experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">Use dark theme across wobbl.ai</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-save</Label>
                    <p className="text-sm text-muted-foreground">Automatically save your wobbl.ai work</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Analytics</Label>
                    <p className="text-sm text-muted-foreground">Help wobbl.ai improve with usage analytics</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="api" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>wobbl.ai API Configuration</CardTitle>
                <CardDescription>Manage your wobbl.ai API keys and credentials</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="openai">OpenAI API Key</Label>
                  <Input id="openai" type="password" placeholder="sk-..." />
                  <p className="text-sm text-muted-foreground mt-1">
                    Required for wobbl.ai AI content generation
                  </p>
                </div>
                <div>
                  <Label htmlFor="serpapi">SerpAPI Key</Label>
                  <Input id="serpapi" type="password" placeholder="Your SerpAPI key" />
                  <p className="text-sm text-muted-foreground mt-1">
                    Required for wobbl.ai SERP research and analysis
                  </p>
                </div>
                <div>
                  <Label htmlFor="redis">Redis URL</Label>
                  <Input id="redis" placeholder="redis://localhost:6379" />
                  <p className="text-sm text-muted-foreground mt-1">
                    Optional: For wobbl.ai caching and performance optimization
                  </p>
                </div>
                <Button>Test wobbl.ai API Connections</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>wobbl.ai Usage Limits</CardTitle>
                <CardDescription>Monitor your wobbl.ai API usage and limits</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>OpenAI API Calls</span>
                    <Badge>750/1000</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>SerpAPI Queries</span>
                    <Badge>45/100</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>wobbl.ai Generated Articles</span>
                    <Badge>24/50</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integrations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Available wobbl.ai Integrations</CardTitle>
                <CardDescription>Connect wobbl.ai with your favorite tools and services</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">WordPress</CardTitle>
                      <CardDescription>Publish directly from wobbl.ai to your WordPress site</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" className="w-full">Connect WordPress</Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Google Search Console</CardTitle>
                      <CardDescription>Track your wobbl.ai search performance</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" className="w-full">Connect GSC</Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">SendGrid</CardTitle>
                      <CardDescription>wobbl.ai email notifications and reports</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" className="w-full">Connect SendGrid</Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Stripe</CardTitle>
                      <CardDescription>wobbl.ai payment processing and billing</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" className="w-full">Connect Stripe</Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>wobbl.ai Notification Preferences</CardTitle>
                <CardDescription>Choose what wobbl.ai notifications you receive</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive wobbl.ai updates via email</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Content Generation Complete</Label>
                    <p className="text-sm text-muted-foreground">When wobbl.ai content is ready</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Weekly Reports</Label>
                    <p className="text-sm text-muted-foreground">wobbl.ai summary of your activity</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>API Usage Alerts</Label>
                    <p className="text-sm text-muted-foreground">When wobbl.ai approaches limits</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Current wobbl.ai Plan</CardTitle>
                <CardDescription>Your wobbl.ai subscription details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-medium">wobbl.ai Professional Plan</h3>
                      <p className="text-sm text-muted-foreground">$49/month</p>
                    </div>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-2xl font-bold">1000</p>
                      <p className="text-sm text-muted-foreground">wobbl.ai API Calls/month</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">50</p>
                      <p className="text-sm text-muted-foreground">wobbl.ai Articles/month</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">100</p>
                      <p className="text-sm text-muted-foreground">wobbl.ai SERP Queries/month</p>
                    </div>
                  </div>
                  <Button>Upgrade wobbl.ai Plan</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>wobbl.ai Payment Method</CardTitle>
                <CardDescription>Manage your wobbl.ai payment methods</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 border rounded">
                    <div>
                      <p className="font-medium">Visa ending in 4242</p>
                      <p className="text-sm text-muted-foreground">Expires 12/24</p>
                    </div>
                    <Button variant="outline">Update</Button>
                  </div>
                  <Button variant="outline">Add wobbl.ai Payment Method</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}