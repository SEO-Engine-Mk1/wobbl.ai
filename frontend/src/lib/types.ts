// Type definitions for the wobbl.ai application

export interface SearchResultItem {
  url: string;
  name: string;
  snippet: string;
  host_name: string;
  rank: number;
  date: string;
  favicon: string;
}

export interface SerpAnalysis {
  headings: string[];
  entities: string[];
  paas: string[];
  gaps: string[];
  intent: string;
  uniqueDomains: number;
}

export interface ArticleContent {
  title: string;
  content: string;
  excerpt: string;
  metaDescription: string;
  wordCount: number;
  helpfulnessScore: number;
  freshnessScore: number;
  tableOfContents: any;
  faqSection: any;
  jsonLd: any;
}

export interface Claim {
  text: string;
  type: string;
  sourceUrl?: string;
  confidence: number;
}

export interface InternalLink {
  position: number;
  url: string;
  anchorText: string;
  relevanceScore: number;
}

export interface ServiceStatus {
  name: string;
  endpoint: string;
  status: 'healthy' | 'degraded' | 'down';
  uptime: number;
  responseTime?: number;
  lastCheck?: string;
  error?: string;
  metrics?: {
    requestsPerMinute: number;
    errorRate: number;
    avgResponseTime: number;
  };
}

export interface CostMetrics {
  totalCost: number;
  roi: number;
  clicks: number;
}

export interface NotificationItem {
  type: string;
  message: string;
  severity?: 'info' | 'warning' | 'error';
}

export interface APIMetrics {
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  timestamp: Date;
}