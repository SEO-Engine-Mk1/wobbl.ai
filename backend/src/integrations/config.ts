/**
 * Environment Configuration Management
 * Centralized configuration management for all integrations and app settings
 */

import { createVercelClient, getVercelConfigFromEnv } from './vercel';
import { createSupabaseClient, getSupabaseConfigFromEnv } from './supabase';
import { createRedisClient, getRedisConfigFromEnv } from './redis';
import { createCloudinaryClient, getCloudinaryConfigFromEnv } from './cloudinary';
import { createStripeClient, getStripeConfigFromEnv } from './stripe';
import { createSendGridClient, getSendGridConfigFromEnv } from './sendgrid';

// Base configuration interfaces
export interface AppConfig {
  app: {
    name: string;
    version: string;
    environment: 'development' | 'production' | 'test' | 'staging';
    port: number;
    baseUrl: string;
    frontendUrl: string;
    corsOrigins: string[];
  };
  database: {
    url: string;
    ssl: boolean;
    maxConnections: number;
    connectionTimeout: number;
  };
  integrations: {
    vercel?: any;
    supabase?: any;
    redis?: any;
    cloudinary?: any;
    stripe?: any;
    sendgrid?: any;
  };
  security: {
    jwtSecret: string;
    jwtExpiresIn: string;
    bcryptRounds: number;
    rateLimitWindow: number;
    rateLimitMax: number;
  };
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    format: 'json' | 'simple';
    file?: string;
  };
  monitoring: {
    enabled: boolean;
    metricsPath: string;
    healthCheckPath: string;
  };
  features: {
    enableWebhooks: boolean;
    enableCaching: boolean;
    enableAnalytics: boolean;
    enableNotifications: boolean;
  };
}

// Environment-specific configuration
const getBaseConfig = (): Omit<AppConfig, 'integrations'> => ({
  app: {
    name: process.env.APP_NAME || 'SEO Engine',
    version: process.env.APP_VERSION || '1.0.0',
    environment: (process.env.NODE_ENV as 'development' | 'production' | 'test' | 'staging') || 'development',
    port: parseInt(process.env.PORT || '3001'),
    baseUrl: process.env.BASE_URL || 'http://localhost:3001',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
    corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
  },
  database: {
    url: process.env.DATABASE_URL || 'file:./dev.db',
    ssl: process.env.DATABASE_SSL === 'true',
    maxConnections: parseInt(process.env.DATABASE_MAX_CONNECTIONS || '10'),
    connectionTimeout: parseInt(process.env.DATABASE_CONNECTION_TIMEOUT || '30000'),
  },
  security: {
    jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12'),
    rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '900000'), // 15 minutes
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100'),
  },
  logging: {
    level: (process.env.LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error') || 'info',
    format: (process.env.LOG_FORMAT as 'json' | 'simple') || 'simple',
    file: process.env.LOG_FILE,
  },
  monitoring: {
    enabled: process.env.MONITORING_ENABLED === 'true',
    metricsPath: process.env.METRICS_PATH || '/metrics',
    healthCheckPath: process.env.HEALTH_CHECK_PATH || '/health',
  },
  features: {
    enableWebhooks: process.env.ENABLE_WEBHOOKS === 'true',
    enableCaching: process.env.ENABLE_CACHING === 'true',
    enableAnalytics: process.env.ENABLE_ANALYTICS === 'true',
    enableNotifications: process.env.ENABLE_NOTIFICATIONS === 'true',
  },
});

// Integration clients
class IntegrationClients {
  private static instances: {
    vercel?: any;
    supabase?: any;
    redis?: any;
    cloudinary?: any;
    stripe?: any;
    sendgrid?: any;
  } = {};

  static getVercel() {
    if (!this.instances.vercel) {
      const config = getVercelConfigFromEnv();
      if (config) {
        this.instances.vercel = createVercelClient(config);
      }
    }
    return this.instances.vercel;
  }

  static getSupabase() {
    if (!this.instances.supabase) {
      const config = getSupabaseConfigFromEnv();
      if (config) {
        this.instances.supabase = createSupabaseClient(config);
      }
    }
    return this.instances.supabase;
  }

  static getRedis() {
    if (!this.instances.redis) {
      const config = getRedisConfigFromEnv();
      if (config) {
        this.instances.redis = createRedisClient(config);
      }
    }
    return this.instances.redis;
  }

  static getCloudinary() {
    if (!this.instances.cloudinary) {
      const config = getCloudinaryConfigFromEnv();
      if (config) {
        this.instances.cloudinary = createCloudinaryClient(config);
      }
    }
    return this.instances.cloudinary;
  }

  static getStripe() {
    if (!this.instances.stripe) {
      const config = getStripeConfigFromEnv();
      if (config) {
        this.instances.stripe = createStripeClient(config);
      }
    }
    return this.instances.stripe;
  }

  static getSendGrid() {
    if (!this.instances.sendgrid) {
      const config = getSendGridConfigFromEnv();
      if (config) {
        this.instances.sendgrid = createSendGridClient(config);
      }
    }
    return this.instances.sendgrid;
  }

  static async initializeAll() {
    const clients = [];
    
    if (this.getRedis()) {
      clients.push(this.getRedis().connect());
    }
    
    await Promise.allSettled(clients);
  }

  static async disconnectAll() {
    const clients = [];
    
    if (this.instances.redis) {
      clients.push(this.instances.redis.disconnect());
    }
    
    await Promise.allSettled(clients);
  }
}

// Configuration validation
export function validateConfig(config: AppConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate app config
  if (!config.app.name) errors.push('App name is required');
  if (!config.app.baseUrl) errors.push('Base URL is required');
  if (!config.app.frontendUrl) errors.push('Frontend URL is required');

  // Validate database config
  if (!config.database.url) errors.push('Database URL is required');

  // Validate security config
  if (!config.security.jwtSecret || config.security.jwtSecret === 'your-super-secret-jwt-key') {
    errors.push('JWT secret must be set to a secure value');
  }

  // Validate integrations
  if (config.features.enableCaching && !config.integrations.redis) {
    errors.push('Redis configuration is required when caching is enabled');
  }

  if (config.features.enableNotifications && !config.integrations.sendgrid) {
    errors.push('SendGrid configuration is required when notifications are enabled');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Environment-specific configurations
export function getDevelopmentConfig(): AppConfig {
  const baseConfig = getBaseConfig();
  return {
    ...baseConfig,
    integrations: {
      vercel: getVercelConfigFromEnv(),
      supabase: getSupabaseConfigFromEnv(),
      redis: getRedisConfigFromEnv(),
      cloudinary: getCloudinaryConfigFromEnv(),
      stripe: getStripeConfigFromEnv(),
      sendgrid: getSendGridConfigFromEnv(),
    },
  };
}

export function getStagingConfig(): AppConfig {
  const baseConfig = getBaseConfig();
  return {
    ...baseConfig,
    app: {
      ...baseConfig.app,
      environment: 'staging',
    },
    logging: {
      ...baseConfig.logging,
      level: 'info',
      format: 'json',
    },
    integrations: {
      vercel: getVercelConfigFromEnv(),
      supabase: getSupabaseConfigFromEnv(),
      redis: getRedisConfigFromEnv(),
      cloudinary: getCloudinaryConfigFromEnv(),
      stripe: getStripeConfigFromEnv(),
      sendgrid: getSendGridConfigFromEnv(),
    },
  };
}

export function getProductionConfig(): AppConfig {
  const baseConfig = getBaseConfig();
  return {
    ...baseConfig,
    app: {
      ...baseConfig.app,
      environment: 'production',
    },
    security: {
      ...baseConfig.security,
      bcryptRounds: 14,
      rateLimitWindow: 600000, // 10 minutes
      rateLimitMax: 50,
    },
    logging: {
      ...baseConfig.logging,
      level: 'warn',
      format: 'json',
    },
    monitoring: {
      ...baseConfig.monitoring,
      enabled: true,
    },
    integrations: {
      vercel: getVercelConfigFromEnv(),
      supabase: getSupabaseConfigFromEnv(),
      redis: getRedisConfigFromEnv(),
      cloudinary: getCloudinaryConfigFromEnv(),
      stripe: getStripeConfigFromEnv(),
      sendgrid: getSendGridConfigFromEnv(),
    },
  };
}

// Main configuration getter
export function getConfig(): AppConfig {
  const environment = process.env.NODE_ENV || 'development';
  
  switch (environment) {
    case 'production':
      return getProductionConfig();
    default:
      return getDevelopmentConfig();
  }
}

// Configuration manager class
export class ConfigManager {
  private static instance: ConfigManager;
  private config: AppConfig;

  private constructor() {
    this.config = getConfig();
    this.validate();
  }

  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  private validate(): void {
    const validation = validateConfig(this.config);
    if (!validation.valid) {
    throw new Error('Configuration validation failed:\n' + validation.errors.join('\n'));
    }
  }

  getConfig(): AppConfig {
    return this.config;
  }

  updateConfig(updates: Partial<AppConfig>): void {
    this.config = { ...this.config, ...updates };
    this.validate();
  }

  // Integration getters
  getVercel() {
    return IntegrationClients.getVercel();
  }

  getSupabase() {
    return IntegrationClients.getSupabase();
  }

  getRedis() {
    return IntegrationClients.getRedis();
  }

  getCloudinary() {
    return IntegrationClients.getCloudinary();
  }

  getStripe() {
    return IntegrationClients.getStripe();
  }

  getSendGrid() {
    return IntegrationClients.getSendGrid();
  }

  // Environment helpers
  isDevelopment(): boolean {
    return this.config.app.environment === 'development';
  }

  isStaging(): boolean {
    return this.config.app.environment === 'staging';
  }

  isProduction(): boolean {
    return this.config.app.environment === 'production';
  }

  // Feature flags
  isFeatureEnabled(feature: keyof AppConfig['features']): boolean {
    return this.config.features[feature];
  }

  // Database helpers
  getDatabaseUrl(): string {
    return this.config.database.url;
  }

  // Security helpers
  getJwtSecret(): string {
    return this.config.security.jwtSecret;
  }

  getJwtExpiresIn(): string {
    return this.config.security.jwtExpiresIn;
  }

  // CORS helpers
  getCorsOrigins(): string[] {
    return this.config.app.corsOrigins;
  }

  // URL helpers
  getBaseUrl(): string {
    return this.config.app.baseUrl;
  }

  getFrontendUrl(): string {
    return this.config.app.frontendUrl;
  }

  // Initialize all integrations
  async initializeIntegrations(): Promise<void> {
    await IntegrationClients.initializeAll();
  }

  // Cleanup all integrations
  async cleanupIntegrations(): Promise<void> {
    await IntegrationClients.disconnectAll();
  }
}

// Export singleton instance
export const config = ConfigManager.getInstance();

// Export convenience functions
export const {
  getVercel,
  getSupabase,
  getRedis,
  getCloudinary,
  getStripe,
  getSendGrid,
  isDevelopment,
  isStaging,
  isProduction,
  isFeatureEnabled,
  getDatabaseUrl,
  getJwtSecret,
  getJwtExpiresIn,
  getCorsOrigins,
  getBaseUrl,
  getFrontendUrl,
  initializeIntegrations,
  cleanupIntegrations,
} = config;

// Environment variable schema for validation
export const ENVIRONMENT_VARIABLES = {
  // App
  APP_NAME: { required: false, type: 'string' },
  APP_VERSION: { required: false, type: 'string' },
  NODE_ENV: { required: false, type: 'string', enum: ['development', 'staging', 'production'] },
  PORT: { required: false, type: 'number' },
  BASE_URL: { required: false, type: 'string' },
  FRONTEND_URL: { required: false, type: 'string' },
  CORS_ORIGINS: { required: false, type: 'string' },

  // Database
  DATABASE_URL: { required: true, type: 'string' },
  DATABASE_SSL: { required: false, type: 'boolean' },
  DATABASE_MAX_CONNECTIONS: { required: false, type: 'number' },
  DATABASE_CONNECTION_TIMEOUT: { required: false, type: 'number' },

  // Security
  JWT_SECRET: { required: true, type: 'string' },
  JWT_EXPIRES_IN: { required: false, type: 'string' },
  BCRYPT_ROUNDS: { required: false, type: 'number' },
  RATE_LIMIT_WINDOW: { required: false, type: 'number' },
  RATE_LIMIT_MAX: { required: false, type: 'number' },

  // Logging
  LOG_LEVEL: { required: false, type: 'string', enum: ['debug', 'info', 'warn', 'error'] },
  LOG_FORMAT: { required: false, type: 'string', enum: ['json', 'simple'] },
  LOG_FILE: { required: false, type: 'string' },

  // Monitoring
  MONITORING_ENABLED: { required: false, type: 'boolean' },
  METRICS_PATH: { required: false, type: 'string' },
  HEALTH_CHECK_PATH: { required: false, type: 'string' },

  // Features
  ENABLE_WEBHOOKS: { required: false, type: 'boolean' },
  ENABLE_CACHING: { required: false, type: 'boolean' },
  ENABLE_ANALYTICS: { required: false, type: 'boolean' },
  ENABLE_NOTIFICATIONS: { required: false, type: 'boolean' },

  // Vercel
  VERCEL_ACCESS_TOKEN: { required: false, type: 'string' },
  VERCEL_TEAM_ID: { required: false, type: 'string' },
  VERCEL_PROJECT_ID: { required: false, type: 'string' },

  // Supabase
  SUPABASE_URL: { required: false, type: 'string' },
  SUPABASE_ANON_KEY: { required: false, type: 'string' },
  SUPABASE_SERVICE_ROLE_KEY: { required: false, type: 'string' },

  // Redis
  REDIS_HOST: { required: false, type: 'string' },
  REDIS_PORT: { required: false, type: 'number' },
  REDIS_PASSWORD: { required: false, type: 'string' },
  REDIS_DB: { required: false, type: 'number' },
  REDIS_KEY_PREFIX: { required: false, type: 'string' },

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: { required: false, type: 'string' },
  CLOUDINARY_API_KEY: { required: false, type: 'string' },
  CLOUDINARY_API_SECRET: { required: false, type: 'string' },
  CLOUDINARY_FOLDER: { required: false, type: 'string' },

  // Stripe
  STRIPE_SECRET_KEY: { required: false, type: 'string' },
  STRIPE_PUBLISHABLE_KEY: { required: false, type: 'string' },
  STRIPE_WEBHOOK_SECRET: { required: false, type: 'string' },

  // SendGrid
  SENDGRID_API_KEY: { required: false, type: 'string' },
  SENDGRID_FROM_EMAIL: { required: false, type: 'string' },
  SENDGRID_FROM_NAME: { required: false, type: 'string' },
  SENDGRID_SANDBOX_MODE: { required: false, type: 'boolean' },
} as const;

export default config;