"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { ApiStatusCard } from '@/components/api-status-card'
import { ApiStatusDashboard } from '@/components/monitoring/api-status-dashboard'
import { CostTracking } from '@/components/analytics/cost-tracking'
import { MonitoringDashboard } from '@/components/monitoring/monitoring-dashboard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'
import { 
  Globe, 
  BarChart3, 
  Users, 
  Mail, 
  FileText, 
  Search,
  RefreshCw,
  Settings as SettingsIcon,
  Home,
  Activity,
  DollarSign,
  Monitor
} from 'lucide-react'

interface ApiConnection {
  id: string
  serviceName: string
  description: string
  status: 'connected' | 'disconnected' | 'error' | 'testing'
  lastChecked: Date
  latencyMs?: number
  message?: string
}

export default function SettingsPage() {
  const [apiConnections, setApiConnections] = useState<ApiConnection[]>([
    {
      id: 'wordpress',
      serviceName: 'WordPress',
      description: 'Content publishing and management',
      status: 'connected',
      lastChecked: new Date(Date.now() - 5 * 60 * 1000),
      latencyMs: 145,
      message: 'Successfully connected to WordPress REST API'
    },
    {
      id: 'gsc',
      serviceName: 'Google Search Console',
      description: 'Search performance analytics',
      status: 'connected',
      lastChecked: new Date(Date.now() - 2 * 60 * 1000),
      latencyMs: 234,
      message: '3 properties connected and syncing'
    },
    {
      id: 'smtp',
      serviceName: 'Hostinger SMTP',
      description: 'Email campaign delivery',
      status: 'error',
      lastChecked: new Date(Date.now() - 10 * 60 * 1000),
      latencyMs: 1200,
      message: 'Authentication failed - check credentials'
    },
    {
      id: 'social',
      serviceName: 'Social Media APIs',
      description: 'LinkedIn, X, Facebook integration',
      status: 'disconnected',
      lastChecked: new Date(Date.now() - 30 * 60 * 1000),
      message: 'No social media accounts configured'
    },
    {
      id: 'plagiarism',
      serviceName: 'Originality.AI',
      description: 'Content originality checking',
      status: 'connected',
      lastChecked: new Date(Date.now() - 1 * 60 * 1000),
      latencyMs: 89,
      message: 'API quota: 850/1000 checks remaining'
    },
    {
      id: 'serp',
      serviceName: 'SERP API',
      description: 'Search engine results analysis',
      status: 'connected',
      lastChecked: new Date(Date.now() - 3 * 60 * 1000),
      latencyMs: 567,
      message: 'Real-time SERP data available'
    }
  ])

  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(6) // hours

  const testConnection = async (serviceId: string) => {
    setApiConnections(prev => 
      prev.map(conn => 
        conn.id === serviceId 
          ? { ...conn, status: 'testing' as const }
          : conn
      )
    )

    // Simulate API testing
    setTimeout(() => {
      setApiConnections(prev => 
        prev.map(conn => {
          if (conn.id === serviceId) {
            // Simulate different outcomes
            const isSuccess = Math.random() > 0.2
            const latency = Math.floor(Math.random() * 800) + 50
            
            return {
              ...conn,
              status: isSuccess ? 'connected' : 'error',
              lastChecked: new Date(),
              latencyMs: latency,
              message: isSuccess 
                ? `Connection successful (${latency}ms)`
                : `Connection failed - timeout after ${latency}ms`
            }
          }
          return conn
        })
      )
    }, 2000)
  }

  const testAllConnections = async () => {
    setApiConnections(prev => 
      prev.map(conn => ({ ...conn, status: 'testing' as const }))
    )

    // Simulate testing all connections
    setTimeout(() => {
      setApiConnections(prev => 
        prev.map(conn => {
          const isSuccess = Math.random() > 0.15
          const latency = Math.floor(Math.random() * 800) + 50
          
          return {
            ...conn,
            status: isSuccess ? 'connected' : Math.random() > 0.5 ? 'error' : 'disconnected',
            lastChecked: new Date(),
            latencyMs: latency,
            message: isSuccess 
              ? `Connection successful (${latency}ms)`
              : `Connection failed - timeout after ${latency}ms`
          }
        })
      )
    }, 3000)
  }

  const getOverallHealth = () => {
    const connected = apiConnections.filter(conn => conn.status === 'connected').length
    const total = apiConnections.length
    
    if (connected === total) return { status: 'healthy', color: 'text-green-600', message: 'All systems operational' }
    if (connected >= total * 0.7) return { status: 'warning', color: 'text-yellow-600', message: 'Some services experiencing issues' }
    return { status: 'critical', color: 'text-red-600', message: 'Multiple service failures detected' }
  }

  const health = getOverallHealth()

  const getApiIcon = (serviceId: string) => {
    const icons = {
      wordpress: Globe,
      gsc: BarChart3,
      smtp: Mail,
      social: Users,
      plagiarism: FileText,
      serp: Search
    }
    return icons[serviceId as keyof typeof icons] || SettingsIcon
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Wobbl.ai Settings</h1>
              <p className="text-muted-foreground">
                Manage integrations and monitor system performance
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  <Home className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <Badge variant={health.status === 'healthy' ? 'default' : health.status === 'warning' ? 'secondary' : 'destructive'}>
                  {health.status === 'healthy' ? '✓' : health.status === 'warning' ? '!' : '✗'} System Health
                </Badge>
                <span className={`text-sm ${health.color}`}>{health.message}</span>
              </div>
              <Button onClick={testAllConnections} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Test All
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Main Content with Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Tabs defaultValue="connections" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="connections" className="flex items-center space-x-2">
                <Globe className="h-4 w-4" />
                <span>Connections</span>
              </TabsTrigger>
              <TabsTrigger value="monitoring" className="flex items-center space-x-2">
                <Monitor className="h-4 w-4" />
                <span>Monitoring</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center space-x-2">
                <Activity className="h-4 w-4" />
                <span>Analytics</span>
              </TabsTrigger>
              <TabsTrigger value="costs" className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4" />
                <span>Costs</span>
              </TabsTrigger>
            </TabsList>

            {/* Connections Tab */}
            <TabsContent value="connections" className="space-y-6">
              {/* Auto-refresh Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Monitoring Settings</CardTitle>
                  <CardDescription>
                    Configure automatic health checks and notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="auto-refresh">Auto-refresh Status</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically check API connections at regular intervals
                      </p>
                    </div>
                    <Switch
                      id="auto-refresh"
                      checked={autoRefresh}
                      onCheckedChange={setAutoRefresh}
                    />
                  </div>
                  
                  {autoRefresh && (
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="refresh-interval">Refresh Interval</Label>
                        <p className="text-sm text-muted-foreground">
                          Check every {refreshInterval} hours
                        </p>
                      </div>
                      <select
                        id="refresh-interval"
                        value={refreshInterval}
                        onChange={(e) => setRefreshInterval(Number(e.target.value))}
                        className="px-3 py-1 border rounded-md text-sm"
                      >
                        <option value={1}>1 hour</option>
                        <option value={3}>3 hours</option>
                        <option value={6}>6 hours</option>
                        <option value={12}>12 hours</option>
                        <option value={24}>24 hours</option>
                      </select>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* API Status Cards */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {apiConnections.map((connection, index) => (
                  <motion.div
                    key={connection.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  >
                    <ApiStatusCard
                      serviceName={connection.serviceName}
                      description={connection.description}
                      icon={getApiIcon(connection.id)}
                      status={connection.status}
                      lastChecked={connection.lastChecked}
                      {...(connection.latencyMs !== undefined && { latencyMs: connection.latencyMs })}
                      {...(connection.message && { message: connection.message })}
                      onTest={() => testConnection(connection.id)}
                    />
                  </motion.div>
                ))}
              </div>

              {/* Summary Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle>Connection Summary</CardTitle>
                  <CardDescription>
                    Overview of all API connections and their performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {apiConnections.filter(c => c.status === 'connected').length}
                      </div>
                      <p className="text-sm text-muted-foreground">Connected</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {apiConnections.filter(c => c.status === 'disconnected').length}
                      </div>
                      <p className="text-sm text-muted-foreground">Disconnected</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">
                        {apiConnections.filter(c => c.status === 'error').length}
                      </div>
                      <p className="text-sm text-muted-foreground">Errors</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {Math.round(
                          apiConnections
                            .filter(c => c.latencyMs)
                            .reduce((acc, c) => acc + (c.latencyMs || 0), 0) / 
                          apiConnections.filter(c => c.latencyMs).length
                        )}ms
                      </div>
                      <p className="text-sm text-muted-foreground">Avg Latency</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Monitoring Tab */}
            <TabsContent value="monitoring">
              <ApiStatusDashboard refreshInterval={30000} showDetails={true} />
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics">
              <MonitoringDashboard timeRange="30d" />
            </TabsContent>

            {/* Costs Tab */}
            <TabsContent value="costs">
              <CostTracking timeRange="30d" />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}