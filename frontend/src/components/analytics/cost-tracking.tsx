"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
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
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Target,
  Zap,
  Mail,
  FileText,
  Calculator,
  Download
} from 'lucide-react';

interface CostData {
  date: string;
  aiCost: number;
  emailCost: number;
  plagiarismCost: number;
  totalCost: number;
  clicksGained: number;
  cpcValue: number;
  roi: number;
  articlesGenerated: number;
  emailsSent: number;
}

interface CostBreakdown {
  category: string;
  amount: number;
  percentage: number;
  icon: React.ReactNode;
  color: string;
}

interface CostTrackingProps {
  timeRange: '7d' | '30d' | '90d';
  articleId?: string;
}

export function CostTracking({ timeRange = '30d', articleId }: CostTrackingProps) {
  const [costData, setCostData] = useState<CostData[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);

  useEffect(() => {
    fetchCostData();
  }, [selectedTimeRange, articleId]);

  const fetchCostData = async () => {
    try {
      const response = await fetch(
        `/api/analytics/costs?timeRange=${selectedTimeRange}${articleId ? `&articleId=${articleId}` : ''}`
      );
      const data = await response.json();
      setCostData(data.data || []);
    } catch (error) {
      console.error('Failed to fetch cost data:', error);
    }
  };

  const calculateTotals = () => {
    if (costData.length === 0) {
      return {
        totalCost: 0,
        totalAiCost: 0,
        totalEmailCost: 0,
        totalPlagiarismCost: 0,
        totalClicks: 0,
        avgRoi: 0,
        totalArticles: 0,
        totalEmails: 0
      };
    }

    return costData.reduce((acc, curr) => ({
      totalCost: acc.totalCost + curr.totalCost,
      totalAiCost: acc.totalAiCost + curr.aiCost,
      totalEmailCost: acc.totalEmailCost + curr.emailCost,
      totalPlagiarismCost: acc.totalPlagiarismCost + curr.plagiarismCost,
      totalClicks: acc.totalClicks + curr.clicksGained,
      avgRoi: acc.avgRoi + curr.roi,
      totalArticles: acc.totalArticles + curr.articlesGenerated,
      totalEmails: acc.totalEmails + curr.emailsSent
    }), {
      totalCost: 0,
      totalAiCost: 0,
      totalEmailCost: 0,
      totalPlagiarismCost: 0,
      totalClicks: 0,
      avgRoi: 0,
      totalArticles: 0,
      totalEmails: 0
    });
  };

  const getCostBreakdown = (): CostBreakdown[] => {
    const totals = calculateTotals();
    const total = totals.totalCost || 1; // Avoid division by zero

    return [
      {
        category: 'AI Generation',
        amount: totals.totalAiCost,
        percentage: (totals.totalAiCost / total) * 100,
        icon: <Zap className="h-4 w-4" />,
        color: '#8884d8'
      },
      {
        category: 'Email Campaigns',
        amount: totals.totalEmailCost,
        percentage: (totals.totalEmailCost / total) * 100,
        icon: <Mail className="h-4 w-4" />,
        color: '#82ca9d'
      },
      {
        category: 'Plagiarism Checks',
        amount: totals.totalPlagiarismCost,
        percentage: (totals.totalPlagiarismCost / total) * 100,
        icon: <FileText className="h-4 w-4" />,
        color: '#ffc658'
      }
    ];
  };

  const exportCostData = () => {
    const csvContent = [
      ['Date', 'AI Cost', 'Email Cost', 'Plagiarism Cost', 'Total Cost', 'Clicks Gained', 'ROI', 'Articles Generated', 'Emails Sent'],
      ...costData.map(row => [
        row.date,
        row.aiCost.toFixed(2),
        row.emailCost.toFixed(2),
        row.plagiarismCost.toFixed(2),
        row.totalCost.toFixed(2),
        row.clicksGained,
        row.roi.toFixed(2),
        row.articlesGenerated,
        row.emailsSent
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cost-data-${selectedTimeRange}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const totals = calculateTotals();
  const costBreakdown = getCostBreakdown();
  const avgRoi = costData.length > 0 ? totals.avgRoi / costData.length : 0;
  const costPerClick = totals.totalClicks > 0 ? totals.totalCost / totals.totalClicks : 0;
  const costPerArticle = totals.totalArticles > 0 ? totals.totalCost / totals.totalArticles : 0;
  const costPerEmail = totals.totalEmails > 0 ? totals.totalCost / totals.totalEmails : 0;

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Cost Tracking & ROI Analysis</h3>
          <p className="text-sm text-muted-foreground">
            Detailed breakdown of content generation and marketing costs
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
          <Button variant="outline" size="sm" onClick={exportCostData}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totals.totalCost.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingDown className="h-3 w-3 inline mr-1" />
              -12% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average ROI</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgRoi.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +8.3% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cost Per Click</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${costPerClick.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingDown className="h-3 w-3 inline mr-1" />
              -5.2% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.totalClicks.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +15.7% from last period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cost Breakdown & Trends */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Cost Breakdown Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Cost Breakdown</CardTitle>
            <CardDescription>
              Distribution of costs across different services
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={costBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, percentage }) => `${category}: ${percentage.toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="amount"
                >
                  {costBreakdown.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Cost Trends Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Cost Trends</CardTitle>
            <CardDescription>
              Daily cost breakdown over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={costData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                <Legend />
                <Line type="monotone" dataKey="aiCost" stroke="#8884d8" name="AI Cost" />
                <Line type="monotone" dataKey="emailCost" stroke="#82ca9d" name="Email Cost" />
                <Line type="monotone" dataKey="totalCost" stroke="#ff7300" name="Total Cost" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* ROI Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>ROI Analysis</CardTitle>
          <CardDescription>
            Return on investment trends and cost efficiency
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
              <Area type="monotone" dataKey="roi" stroke="#82ca9d" fill="#82ca9d" name="ROI (%)" />
              <Area type="monotone" dataKey="cpcValue" stroke="#ffc658" fill="#ffc658" name="CPC Value ($)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Cost Efficiency</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Cost per Article</span>
              <span className="font-medium">${costPerArticle.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Cost per Email</span>
              <span className="font-medium">${costPerEmail.toFixed(4)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Articles Generated</span>
              <span className="font-medium">{totals.totalArticles}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Emails Sent</span>
              <span className="font-medium">{totals.totalEmails.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cost Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {costBreakdown.map((item) => (
              <div key={item.category} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.icon}
                  <span className="text-sm">{item.category}</span>
                </div>
                <div className="text-right">
                  <div className="font-medium">${item.amount.toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">{item.percentage.toFixed(1)}%</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Total Clicks</span>
              <Badge variant="secondary">{totals.totalClicks.toLocaleString()}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Avg ROI</span>
              <Badge variant={avgRoi > 0 ? 'default' : 'destructive'}>
                {avgRoi.toFixed(1)}%
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Cost Per Click</span>
              <span className="font-medium">${costPerClick.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Efficiency</span>
              <Badge variant="outline">
                {costPerClick < 1 ? 'Excellent' : costPerClick < 2 ? 'Good' : 'Needs Improvement'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}