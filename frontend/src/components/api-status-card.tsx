"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { LucideIcon, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ApiStatusCardProps {
  serviceName: string
  description: string
  icon: LucideIcon
  status: 'connected' | 'disconnected' | 'error' | 'testing'
  lastChecked?: Date
  latencyMs?: number
  message?: string
  onTest?: () => Promise<void>
}

export function ApiStatusCard({
  serviceName,
  description,
  icon: Icon,
  status,
  lastChecked,
  latencyMs,
  message,
  onTest
}: ApiStatusCardProps) {
  const [isTesting, setIsTesting] = useState(false)

  const getStatusIcon = () => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'disconnected':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case 'testing':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusBadge = () => {
    const variants = {
      connected: { label: 'Connected', variant: 'default' as const },
      disconnected: { label: 'Disconnected', variant: 'destructive' as const },
      error: { label: 'Error', variant: 'secondary' as const },
      testing: { label: 'Testing...', variant: 'outline' as const }
    }
    
    return <Badge variant={variants[status].variant}>{variants[status].label}</Badge>
  }

  const getLatencyColor = (latency: number) => {
    if (latency < 200) return 'text-green-600'
    if (latency < 500) return 'text-yellow-600'
    return 'text-red-600'
  }

  const handleTest = async () => {
    if (!onTest) return
    
    setIsTesting(true)
    try {
      await onTest()
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <motion.div
      whileHover={{ 
        y: -2,
        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Card className={cn(
        "relative overflow-hidden",
        status === 'connected' && "border-green-200 dark:border-green-800",
        status === 'error' && "border-yellow-200 dark:border-yellow-800",
        status === 'disconnected' && "border-red-200 dark:border-red-800"
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Icon className="h-5 w-5 text-muted-foreground" />
              <div>
                <CardTitle className="text-lg">{serviceName}</CardTitle>
                <CardDescription className="text-sm">{description}</CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusIcon()}
              {getStatusBadge()}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {latencyMs !== undefined && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Response Time</span>
              <span className={cn("text-sm font-medium", getLatencyColor(latencyMs))}>
                {latencyMs}ms
              </span>
            </div>
          )}

          {latencyMs !== undefined && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Connection Quality</span>
                <span className="text-sm font-medium">
                  {latencyMs < 200 ? 'Excellent' : latencyMs < 500 ? 'Good' : 'Poor'}
                </span>
              </div>
              <Progress 
                value={Math.max(0, 100 - (latencyMs / 10))} 
                className="h-2"
              />
            </div>
          )}

          {message && (
            <div className="p-2 bg-muted rounded-md">
              <p className="text-xs text-muted-foreground">{message}</p>
            </div>
          )}

          {lastChecked && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Last checked</span>
              <span className="text-xs text-muted-foreground">
                {lastChecked.toLocaleTimeString()}
              </span>
            </div>
          )}

          {onTest && (
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={handleTest}
              disabled={isTesting || status === 'testing'}
            >
              {isTesting || status === 'testing' ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                'Test Connection'
              )}
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}