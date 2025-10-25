/**
 * Environment variable utilities with proper type safety
 */

export function getEnvVar(key: string): string {
  const value = process.env[key]
  if (value === undefined) {
    throw new Error(`Environment variable ${key} is not defined`)
  }
  return value
}

export function getEnvVarOptional(key: string): string | undefined {
  return process.env[key]
}

export function getEnvVarNumber(key: string): number {
  const value = getEnvVar(key)
  const num = parseInt(value, 10)
  if (isNaN(num)) {
    throw new Error(`Environment variable ${key} must be a valid number, got: ${value}`)
  }
  return num
}

export function getEnvVarBoolean(key: string): boolean {
  const value = getEnvVar(key).toLowerCase()
  return value === 'true' || value === '1' || value === 'yes'
}

// Common environment variables with proper typing
export const env = {
  // App configuration
  APP_NAME: getEnvVar('APP_NAME'),
  APP_VERSION: getEnvVarOptional('APP_VERSION'),
  PORT: getEnvVarNumber('PORT'),
  BASE_URL: getEnvVar('BASE_URL'),
  FRONTEND_URL: getEnvVar('FRONTEND_URL'),
  CORS_ORIGINS: getEnvVar('CORS_ORIGINS').split(','),

  // Database
  DATABASE_URL: getEnvVar('DATABASE_URL'),
  DATABASE_SSL: getEnvVarBoolean('DATABASE_SSL'),
  DATABASE_MAX_CONNECTIONS: getEnvVarNumber('DATABASE_MAX_CONNECTIONS'),
  DATABASE_CONNECTION_TIMEOUT: getEnvVarNumber('DATABASE_CONNECTION_TIMEOUT'),

  // JWT
  JWT_SECRET: getEnvVar('JWT_SECRET'),
  JWT_EXPIRES_IN: getEnvVar('JWT_EXPIRES_IN'),

  // Security
  BCRYPT_ROUNDS: getEnvVarNumber('BCRYPT_ROUNDS'),

  // Rate limiting
  RATE_LIMIT_WINDOW: getEnvVarNumber('RATE_LIMIT_WINDOW'),
  RATE_LIMIT_MAX: getEnvVarNumber('RATE_LIMIT_MAX'),

  // Logging
  LOG_LEVEL: getEnvVar('LOG_LEVEL'),
  LOG_FORMAT: getEnvVar('LOG_FORMAT'),
  LOG_FILE: getEnvVarOptional('LOG_FILE'),

  // Monitoring
  MONITORING_ENABLED: getEnvVarBoolean('MONITORING_ENABLED'),
  METRICS_PATH: getEnvVar('METRICS_PATH'),
  HEALTH_CHECK_PATH: getEnvVar('HEALTH_CHECK_PATH'),

  // Features
  ENABLE_WEBHOOKS: getEnvVarBoolean('ENABLE_WEBHOOKS'),
  ENABLE_CACHING: getEnvVarBoolean('ENABLE_CACHING'),
  ENABLE_ANALYTICS: getEnvVarBoolean('ENABLE_ANALYTICS'),
  ENABLE_NOTIFICATIONS: getEnvVarBoolean('ENABLE_NOTIFICATIONS'),

  // Email/SMTP
  SMTP_HOST: getEnvVarOptional('SMTP_HOST'),
  SMTP_PORT: getEnvVarOptional('SMTP_PORT'),
  SMTP_USERNAME: getEnvVarOptional('SMTP_USERNAME'),
  SMTP_PASSWORD: getEnvVarOptional('SMTP_PASSWORD'),
  SMTP_FROM: getEnvVarOptional('SMTP_FROM'),
  SMTP_FROM_NAME: getEnvVarOptional('SMTP_FROM_NAME'),

  // Google/Search Console
  GOOGLE_CLIENT_ID: getEnvVarOptional('GOOGLE_CLIENT_ID'),
  GOOGLE_CLIENT_SECRET: getEnvVarOptional('GOOGLE_CLIENT_SECRET'),
  GOOGLE_REDIRECT_URI: getEnvVarOptional('GOOGLE_REDIRECT_URI'),

  // Redis
  REDIS_HOST: getEnvVarOptional('REDIS_HOST'),
  REDIS_PORT: getEnvVarNumber('REDIS_PORT'),
  REDIS_PASSWORD: getEnvVarOptional('REDIS_PASSWORD'),
  REDIS_DB: getEnvVarNumber('REDIS_DB'),
  REDIS_KEY_PREFIX: getEnvVarOptional('REDIS_KEY_PREFIX'),
  REDIS_URL: getEnvVarOptional('REDIS_URL'),

  // SendGrid
  SENDGRID_API_KEY: getEnvVarOptional('SENDGRID_API_KEY'),
  SENDGRID_FROM_EMAIL: getEnvVarOptional('SENDGRID_FROM_EMAIL'),
  SENDGRID_FROM_NAME: getEnvVarOptional('SENDGRID_FROM_NAME'),
  SENDGRID_SANDBOX_MODE: getEnvVarBoolean('SENDGRID_SANDBOX_MODE'),

  // Stripe
  STRIPE_SECRET_KEY: getEnvVarOptional('STRIPE_SECRET_KEY'),
  STRIPE_PUBLISHABLE_KEY: getEnvVarOptional('STRIPE_PUBLISHABLE_KEY'),
  STRIPE_WEBHOOK_SECRET: getEnvVarOptional('STRIPE_WEBHOOK_SECRET'),

  // Supabase
  SUPABASE_URL: getEnvVarOptional('SUPABASE_URL'),
  SUPABASE_ANON_KEY: getEnvVarOptional('SUPABASE_ANON_KEY'),
  SUPABASE_SERVICE_ROLE_KEY: getEnvVarOptional('SUPABASE_SERVICE_ROLE_KEY'),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: getEnvVarOptional('CLOUDINARY_CLOUD_NAME'),
  CLOUDINARY_API_KEY: getEnvVarOptional('CLOUDINARY_API_KEY'),
  CLOUDINARY_API_SECRET: getEnvVarOptional('CLOUDINARY_API_SECRET'),
  CLOUDINARY_FOLDER: getEnvVarOptional('CLOUDINARY_FOLDER'),

  // Vercel
  VERCEL_ACCESS_TOKEN: getEnvVarOptional('VERCEL_ACCESS_TOKEN'),
  VERCEL_TEAM_ID: getEnvVarOptional('VERCEL_TEAM_ID'),
  VERCEL_PROJECT_ID: getEnvVarOptional('VERCEL_PROJECT_ID'),
  VERCEL_DEPLOY_HOOK_URL: getEnvVarOptional('VERCEL_DEPLOY_HOOK_URL'),

  // Deployment
  VERCEL: getEnvVarOptional('VERCEL'),
  VERCEL_ENV: getEnvVarOptional('VERCEL_ENV'),

  // Content limits
  MAX_ARTICLES_PER_DAY: getEnvVarNumber('MAX_ARTICLES_PER_DAY'),
  DEFAULT_CONTENT_LENGTH: getEnvVarNumber('DEFAULT_CONTENT_LENGTH'),
} as const