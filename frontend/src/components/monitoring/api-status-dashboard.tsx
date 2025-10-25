"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  Clock, 
  Zap, 
  RefreshCw,
  Activity,
  Database,
  Mail,
  MessageSquare,
  Globe,
  Server,
  WifiOff
} from 'lucide-react';

interface ServiceStatus {
  name: string;
  endpoint: string;
  status: 'healthy' | 'degraded' | 'down';
  responseTime: number;
  uptime: number;
  lastCheck: string;
  error?: string;
  metrics?: {
    requestsPerMinute: number;
    errorRate: number;
    avgResponseTime: number;
  };
}

interface ApiStatusDashboardProps {
  refreshInterval?: number;
  showDetails?: boolean;
}

export function ApiStatusDashboard({ 
  refreshInterval = 30000, 
  showDetails = true 
}: ApiStatusDashboardProps) {
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    fetchServiceStatuses();
    const interval = setInterval(fetchServiceStatuses, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  const fetchServiceStatuses = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/monitoring/status');
      const data = await response.json();
      setServices(data.services || []);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to fetch service statuses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const testService = async (service: ServiceStatus) => {
    try {
      const startTime = Date.now();
      const response = await fetch(service.endpoint);
      const endTime = Date.now();
      
      const updatedService = {
        responseTime: endTime - startTime,
        status: (response.ok ? 'healthy' : 'down') as 'healthy' | 'degraded' | 'down',
        lastCheck: new Date().toISOString(),
        error: response.ok ? undefined : `HTTP ${response.status}`
      };

      setServices(prev => 
        prev.map(s => s.name === service.name ? { ...s, ...updatedService } as ServiceStatus : s)
      );
    } catch (error) {
      const updatedService = {
        status: 'down' as const,
        lastCheck: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };

      setServices(prev => 
        prev.map(s => s.name === service.name ? { ...s, ...updatedService } as ServiceStatus : s)
      );
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'degraded':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'down':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-500';
      case 'degraded':
        return 'bg-yellow-500';
      case 'down':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getServiceIcon = (serviceName: string) => {
    if (serviceName.toLowerCase().includes('database') || serviceName.toLowerCase().includes('db')) {
      return <Database className="h-4 w-4" />;
    }
    if (serviceName.toLowerCase().includes('email') || serviceName.toLowerCase().includes('mail')) {
      return <Mail className="h-4 w-4" />;
    }
    if (serviceName.toLowerCase().includes('social') || serviceName.toLowerCase().includes('message')) {
      return <MessageSquare className="h-4 w-4" />;
    }
    if (serviceName.toLowerCase().includes('wordpress') || serviceName.toLowerCase().includes('cms')) {
      return <Globe className="h-4 w-4" />;
    }
    if (serviceName.toLowerCase().includes('server') || serviceName.toLowerCase().includes('api')) {
      return <Server className="h-4 w-4" />;
    }
    return <Activity className="h-4 w-4" />;
  };

  const healthyServices = services.filter(s => s.status === 'healthy').length;
  const totalServices = services.length;
  const overallHealth = totalServices > 0 ? (healthyServices / totalServices) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">API Service Status</h3>
          <p className="text-sm text-muted-foreground">
            Real-time monitoring of all integrated services
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-sm text-muted-foreground">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchServiceStatuses}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overall Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>System Health</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Overall Health</span>
              <span className="text-sm">{healthyServices}/{totalServices} services healthy</span>
            </div>
            <Progress value={overallHealth} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{overallHealth.toFixed(1)}% operational</span>
              <span>
                {overallHealth === 100 ? 'All systems operational' : 
                 overallHealth >= 75 ? 'Minor issues detected' :
                 overallHealth >= 50 ? 'Significant issues detected' :
                 'Critical issues detected'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Services List */}
      <div className="grid gap-4">
        {services.map((service) => (
          <Card key={service.name} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(service.status)}
                  <div className="flex items-center space-x-2">
                    {getServiceIcon(service.name)}
                    <div>
                      <p className="font-medium">{service.name}</p>
                      <p className="text-sm text-muted-foreground">{service.endpoint}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <Badge variant={service.status === 'healthy' ? 'default' : 'destructive'}>
                        {service.status}
                      </Badge>
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(service.status)}`} />
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {service.responseTime}ms • {service.uptime}% uptime
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => testService(service)}
                  >
                    <Zap className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {service.error && (
                <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{service.error}</p>
                </div>
              )}

              {showDetails && service.metrics && (
                <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Requests/min:</span>
                    <span className="ml-2 font-medium">{service.metrics.requestsPerMinute}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Error rate:</span>
                    <span className="ml-2 font-medium">{service.metrics.errorRate}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Avg response:</span>
                    <span className="ml-2 font-medium">{service.metrics.avgResponseTime}ms</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {services.length === 0 && !isLoading && (
        <Card>
          <CardContent className="p-8 text-center">
            <WifiOff className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No service status data available</p>
            <Button variant="outline" className="mt-4" onClick={fetchServiceStatuses}>
              Check Status
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}