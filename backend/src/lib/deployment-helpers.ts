/**
 * Deployment Helpers for Vercel
 * Provides fallback services and deployment utilities
 */

import { 
  getDatabaseService, 
  getSupabaseService, 
  getRedisService, 
  getZAIService,
  mockDatabase,
  mockSupabase,
  mockRedis,
  mockZAI
} from './mocks';
import { prisma } from './db';

/**
 * Get the appropriate database service based on environment
 */
export const db = getDatabaseService();

/**
 * Get the appropriate Supabase service based on environment
 */
export const supabase = getSupabaseService();

/**
 * Get the appropriate Redis service based on environment
 */
export const redis = getRedisService();

/**
 * Get the appropriate ZAI service based on environment
 */
export const zai = getZAIService();

/**
 * Environment detection utilities
 */
export const isProduction = () => process.env.NODE_ENV === 'production';
export const isDevelopment = () => process.env.NODE_ENV === 'development';
export const isVercel = () => process.env.VERCEL === '1';
export const isPreview = () => process.env.VERCEL_ENV === 'preview';

/**
 * Service health check
 */
export async function checkServiceHealth() {
  const health = {
    database: 'unknown',
    supabase: 'unknown',
    redis: 'unknown',
    zai: 'unknown',
    environment: process.env.NODE_ENV || 'unknown',
    platform: isVercel() ? 'vercel' : 'local'
  };

  // Check database
  try {
    await prisma.$queryRaw`SELECT 1`;
    health.database = 'healthy';
  } catch (error) {
    health.database = prisma === mockDatabase ? 'mock' : 'unhealthy';
  }

  // Check Supabase
  try {
    const supabaseClient = await supabase;
    await (supabaseClient as any).from('_health').select('*').limit(1);
    health.supabase = 'healthy';
  } catch (error) {
    health.supabase = (await supabase) === mockSupabase ? 'mock' : 'unhealthy';
  }

  // Check Redis
  try {
    const redisClient = await redis;
    await redisClient.connect();
    await redisClient.set('health_check', 'ok');
    const result = await redisClient.get('health_check');
    health.redis = result === 'ok' ? 'healthy' : 'unhealthy';
    await redisClient.disconnect();
  } catch (error) {
    health.redis = (await redis) === mockRedis ? 'mock' : 'unhealthy';
  }

  // Check ZAI
  try {
    const ZAIImport = await zai;
    if (typeof ZAIImport.create === 'function') {
      const zaiService = await ZAIImport.create();
      health.zai = zaiService !== mockZAI ? 'healthy' : 'mock';
    } else {
      health.zai = 'unhealthy';
    }
  } catch (error) {
    health.zai = 'unhealthy';
  }

  return health;
}

/**
 * Graceful error handler for API routes
 */
export function handleApiError(error: any, defaultMessage: string = 'Internal server error') {
  console.error('API Error:', error);
  
  if (error instanceof Error) {
    return {
      error: defaultMessage,
      details: error.message,
      stack: isDevelopment() ? error.stack : undefined
    };
  }
  
  return { error: defaultMessage };
}

/**
 * Response helper for consistent API responses
 */
export function createApiResponse(data: any, status: number = 200, meta?: any) {
  const response = {
    success: status >= 200 && status < 300,
    data,
    meta,
    timestamp: new Date().toISOString(),
    platform: isVercel() ? 'vercel' : 'local'
  };
  
  return response;
}

/**
 * CORS configuration for API routes
 */
export const corsConfig = {
  origin: isProduction() ? ['https://wobbl.ai'] : ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  headers: ['Content-Type', 'Authorization'],
  credentials: true
};

/**
 * Rate limiting for API routes (simple in-memory version)
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(
  identifier: string, 
  limit: number = 100, 
  windowMs: number = 15 * 60 * 1000 // 15 minutes
) {
  const now = Date.now();
  const key = `${identifier}:${Math.floor(now / windowMs)}`;
  
  const record = rateLimitStore.get(key);
  
  if (!record) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetTime: now + windowMs };
  }
  
  if (record.count >= limit) {
    return { allowed: false, remaining: 0, resetTime: record.resetTime };
  }
  
  record.count++;
  return { 
    allowed: true, 
    remaining: limit - record.count, 
    resetTime: record.resetTime 
  };
}

/**
 * Cleanup old rate limit records
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000); // Cleanup every 5 minutes

/**
 * Feature flag checker
 */
export function isFeatureEnabled(feature: string): boolean {
  const envVar = `ENABLE_${feature.toUpperCase()}`;
  return process.env[envVar] === 'true';
}

/**
 * Environment-specific configuration
 */
export const config = {
  database: {
    url: process.env.DATABASE_URL || 'mock',
    ssl: process.env.DATABASE_SSL === 'true',
    maxConnections: parseInt(process.env.DATABASE_MAX_CONNECTIONS || '10')
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'mock-secret',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },
  features: {
    caching: isFeatureEnabled('caching'),
    analytics: isFeatureEnabled('analytics'),
    notifications: isFeatureEnabled('notifications'),
    socialSyndication: isFeatureEnabled('social_syndication'),
    emailCampaigns: isFeatureEnabled('email_campaigns'),
    autoPublishing: isFeatureEnabled('auto_publishing')
  },
  limits: {
    maxArticlesPerDay: parseInt(process.env.MAX_ARTICLES_PER_DAY || '10'),
    defaultContentLength: parseInt(process.env.DEFAULT_CONTENT_LENGTH || '2000'),
    rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '900000'),
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100')
  }
};