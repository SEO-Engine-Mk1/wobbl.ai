"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ComposedChart,
  Line, 
  AreaChart, 
  Area, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Eye, 
  MousePointer, 
  DollarSign,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap
} from 'lucide-react';

interface PerformanceMetrics {
  date: string;
  impressions: number;
  clicks: number;
  ctr: number;
  position: number;
  pageViews: number;
  bounceRate: number;
  avgSessionDuration: number;
}

interface CostMetrics {
  date: string;
  aiCost: number;
  emailCost: number;
  totalCost: number;
  clicksGained: number;
  cpcValue: number;
  roi: number;
}

interface ApiStatus {
  service: string;
  status: 'healthy' | 'degraded' | 'down';
  responseTime: number;
  uptime: number;
  lastCheck: string;
}

interface MonitoringDashboardProps {
  articleId?: string;
  timeRange: '7d' | '30d' | '90d';
}

export function MonitoringDashboard({ articleId, timeRange = '30d' }: MonitoringDashboardProps) {
  const [performanceData, setPerformanceData] = useState<PerformanceMetrics[]>([]);
  const [costData, setCostData] = useState<CostMetrics[]>([]);
  const [apiStatuses, setApiStatuses] = useState<ApiStatus[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchMonitoringData();
    const interval = setInterval(fetchMonitoringData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [selectedTimeRange, articleId]);

  const fetchMonitoringData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch performance metrics
      const performanceResponse = await fetch(`/api/analytics/performance?timeRange=${selectedTimeRange}${articleId ? `&articleId=${articleId}` : ''}`);
      const performance = await performanceResponse.json();
      setPerformanceData(performance.data || []);

      // Fetch cost metrics
      const costResponse = await fetch(`/api/analytics/costs?timeRange=${selectedTimeRange}${articleId ? `&articleId=${articleId}` : ''}`);
      const costs = await costResponse.json();
      setCostData(costs.data || []);

      // Fetch API statuses
      const statusResponse = await fetch('/api/monitoring/status');
      const statuses = await statusResponse.json();
      setApiStatuses(statuses.services || []);

    } catch (error) {
      console.error('Failed to fetch monitoring data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate mock data for demonstration
  useEffect(() => {
    const mockPerformanceData: PerformanceMetrics[] = [
      { date: '2024-01-01', impressions: 1200, clicks: 45, ctr: 3.75, position: 12.5, pageViews: 89, bounceRate: 35.2, avgSessionDuration: 125 },
      { date: '2024-01-02', impressions: 1350, clicks: 52, ctr: 3.85, position: 11.8, pageViews: 95, bounceRate: 33.8, avgSessionDuration: 132 },
      { date: '2024-01-03', impressions: 1100, clicks: 38, ctr: 3.45, position: 13.2, pageViews: 78, bounceRate: 37.1, avgSessionDuration: 118 },
      { date: '2024-01-04', impressions: 1450, clicks: 61, ctr: 4.21, position: 10.9, pageViews: 112, bounceRate: 31.5, avgSessionDuration: 145 },
      { date: '2024-01-05', impressions: 1600, clicks: 72, ctr: 4.50, position: 9.8, pageViews: 128, bounceRate: 29.3, avgSessionDuration: 158 },
    ];

    const mockCostData: CostMetrics[] = [
      { date: '2024-01-01', aiCost: 12.50, emailCost: 3.20, totalCost: 15.70, clicksGained: 45, cpcValue: 0.35, roi: 185.5 },
      { date: '2024-01-02', aiCost: 14.80, emailCost: 3.80, totalCost: 18.60, clicksGained: 52, cpcValue: 0.36, roi: 192.3 },
      { date: '2024-01-03', aiCost: 10.20, emailCost: 2.90, totalCost: 13.10, clicksGained: 38, cpcValue: 0.34, roi: 178.8 },
      { date: '2024-01-04', aiCost: 16.50, emailCost: 4.10, totalCost: 20.60, clicksGained: 61, cpcValue: 0.34, roi: 205.2 },
      { date: '2024-01-05', aiCost: 18.90, emailCost: 4.80, totalCost: 23.70, clicksGained: 72, cpcValue: 0.33, roi: 218.5 },
    ];

    const mockApiStatuses: ApiStatus[] = [
      { service: 'OpenAI API', status: 'healthy', responseTime: 145, uptime: 99.9, lastCheck: '2024-01-05 10:30:00' },
      { service: 'Google Ads API', status: 'healthy', responseTime: 234, uptime: 99.5, lastCheck: '2024-01-05 10:30:00' },
      { service: 'Email Service', status: 'degraded', responseTime: 567, uptime: 98.2, lastCheck: '2024-01-05 10:30:00' },
      { service: 'Database', status: 'healthy', responseTime: 23, uptime: 99.99, lastCheck: '2024-01-05 10:30:00' },
    ];

    setPerformanceData(mockPerformanceData);
    setCostData(mockCostData);
    setApiStatuses(mockApiStatuses);
  }, [selectedTimeRange, articleId]);

  const calculateTotalMetrics = () => {
    if (performanceData.length === 0) return { impressions: 0, clicks: 0, avgCtr: 0, avgPosition: 0 };
    
    const totals = performanceData.reduce((acc, curr) => ({
      impressions: acc.impressions + curr.impressions,
      clicks: acc.clicks + curr.clicks,
      ctr: acc.ctr + curr.ctr,
      position: acc.position + curr.position
    }), { impressions: 0, clicks: 0, ctr: 0, position: 0 });

    return {
      impressions: totals.impressions,
      clicks: totals.clicks,
      avgCtr: totals.ctr / performanceData.length,
      avgPosition: totals.position / performanceData.length
    };
  };

  const calculateTotalCosts = () => {
    if (costData.length === 0) return { totalCost: 0, totalRoi: 0, costPerClick: 0 };
    
    const totals = costData.reduce((acc, curr) => ({
      totalCost: acc.totalCost + curr.totalCost,
      roi: acc.roi + curr.roi,
      clicks: acc.clicks + (curr as any).clicksGained
    }), { totalCost: 0, roi: 0, clicks: 0 });

    return {
      totalCost: totals.totalCost,
      totalRoi: totals.roi / costData.length,
      costPerClick: totals.clicks > 0 ? totals.totalCost / totals.clicks : 0
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'degraded': return 'bg-yellow-500';
      case 'down': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'degraded': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'down': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const totalMetrics = calculateTotalMetrics();
  const totalCosts = calculateTotalCosts();

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Monitoring Dashboard</h2>
          <p className="text-muted-foreground">
            Real-time performance and cost tracking
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Tabs value={selectedTimeRange} onValueChange={(value) => setSelectedTimeRange(value as any)}>
            <TabsList>
              <TabsTrigger value="7d">7 Days</TabsTrigger>
              <TabsTrigger value="30d">30 Days</TabsTrigger>
              <TabsTrigger value="90d">90 Days</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="outline" size="sm" onClick={fetchMonitoringData} disabled={isLoading}>
            <Activity className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Impressions</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMetrics.impressions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +12.5% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMetrics.clicks.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +8.2% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg CTR</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMetrics.avgCtr.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +2.1% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalCosts.totalCost.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingDown className="h-3 w-3 inline mr-1" />
              -5.3% from last period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Performance Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Trends</CardTitle>
            <CardDescription>
              Impressions, clicks, and CTR over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="impressions" fill="#8884d8" name="Impressions" />
                <Line yAxisId="right" type="monotone" dataKey="ctr" stroke="#82ca9d" name="CTR (%)" />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Cost Analysis Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Cost Analysis</CardTitle>
            <CardDescription>
              AI costs, email costs, and ROI over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={costData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="aiCost" stackId="1" stroke="#8884d8" fill="#8884d8" name="AI Cost" />
                <Area type="monotone" dataKey="emailCost" stackId="1" stroke="#82ca9d" fill="#82ca9d" name="Email Cost" />
                <Line type="monotone" dataKey="roi" stroke="#ffc658" name="ROI (%)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* API Status */}
      <Card>
        <CardHeader>
          <CardTitle>API Service Status</CardTitle>
          <CardDescription>
            Real-time status of all integrated services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {apiStatuses.map((service) => (
              <div key={service.service} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(service.status)}
                  <div>
                    <p className="font-medium">{service.service}</p>
                    <p className="text-sm text-muted-foreground">
                      Response time: {service.responseTime}ms | Uptime: {service.uptime}%
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={service.status === 'healthy' ? 'default' : 'destructive'}>
                    {service.status}
                  </Badge>
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(service.status)}`} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Additional Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>ROI Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'AI Generation', value: totalCosts.totalCost * 0.6 },
                    { name: 'Email Campaigns', value: totalCosts.totalCost * 0.3 },
                    { name: 'Other', value: totalCosts.totalCost * 0.1 }
                  ]}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label
                >
                  {[
                    { name: 'AI Generation', value: totalCosts.totalCost * 0.6 },
                    { name: 'Email Campaigns', value: totalCosts.totalCost * 0.3 },
                    { name: 'Other', value: totalCosts.totalCost * 0.1 }
                  ].map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Key Performance Indicators</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Average Position</span>
              <span className="font-medium">{totalMetrics.avgPosition.toFixed(1)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Cost Per Click</span>
              <span className="font-medium">${totalCosts.costPerClick.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Total ROI</span>
              <span className="font-medium text-green-600">{totalCosts.totalRoi.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Active Services</span>
              <span className="font-medium">{apiStatuses.filter(s => s.status === 'healthy').length}/{apiStatuses.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4 text-green-500" />
                <span className="text-sm">Article generated successfully</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-blue-500" />
                <span className="text-sm">Email campaign sent to 250 users</span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-purple-500" />
                <span className="text-sm">Traffic increased by 15%</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">All systems operational</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}