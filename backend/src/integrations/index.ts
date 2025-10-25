/**
 * Integration Index File
 * Central export point for all integrations
 */

// Export all integration classes and utilities
export { default as VercelIntegration } from './vercel';
export { default as SupabaseIntegration } from './supabase';
export { default as RedisIntegration } from './redis';
export { default as CloudinaryIntegration } from './cloudinary';
export { default as StripeIntegration } from './stripe';
export { default as SendGridIntegration } from './sendgrid';

// Export configuration management
export {
  config,
  ConfigManager,
  getConfig,
  getDevelopmentConfig,
  getStagingConfig,
  getProductionConfig,
  validateConfig,
  ENVIRONMENT_VARIABLES,
  type AppConfig,
} from './config';

// Export utility functions
export {
  createVercelClient,
  validateVercelConfig,
  getVercelConfigFromEnv,
  type VercelConfig,
  type VercelProject,
  type VercelDeployment,
  type VercelEnvironmentVariable,
} from './vercel';

export {
  createSupabaseClient,
  validateSupabaseConfig,
  getSupabaseConfigFromEnv,
  type SupabaseConfig,
  type SupabaseTable,
  type SupabaseAuth,
  type SupabaseStorage,
  type SupabaseRealtime,
} from './supabase';

export {
  createRedisClient,
  validateRedisConfig,
  getRedisConfigFromEnv,
  type RedisConfig,
  type RedisCacheOptions,
} from './redis';

export {
  createCloudinaryClient,
  validateCloudinaryConfig,
  getCloudinaryConfigFromEnv,
  TRANSFORMATION_PRESETS,
  type CloudinaryConfig,
  type CloudinaryUploadOptions,
  type CloudinaryResource,
  type CloudinaryTransformation,
} from './cloudinary';

export {
  createStripeClient,
  validateStripeConfig,
  getStripeConfigFromEnv,
  WEBHOOK_EVENTS,
  type StripeConfig,
  type StripeCustomer,
  type StripeProduct,
  type StripePrice,
  type StripeSubscription,
  type StripePaymentIntent,
  type StripeCheckoutSession,
} from './stripe';

export {
  createSendGridClient,
  validateSendGridConfig,
  getSendGridConfigFromEnv,
  EMAIL_TEMPLATES,
  type SendGridConfig,
  type SendGridEmail,
  type SendGridTemplate,
  type SendGridContact,
  type SendGridList,
  type SendGridCampaign,
} from './sendgrid';

// Re-export for convenience
export { ConfigManager as default } from './config';