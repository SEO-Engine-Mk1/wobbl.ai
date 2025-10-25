# API Integrations Documentation

This document provides comprehensive documentation for all API integrations available in the SEO Engine project.

## Table of Contents

1. [Overview](#overview)
2. [Environment Configuration](#environment-configuration)
3. [Vercel Integration](#vercel-integration)
4. [Supabase Integration](#supabase-integration)
5. [Redis Integration](#redis-integration)
6. [Cloudinary Integration](#cloudinary-integration)
7. [Stripe Integration](#stripe-integration)
8. [SendGrid Integration](#sendgrid-integration)
9. [Usage Examples](#usage-examples)
10. [Troubleshooting](#troubleshooting)

## Overview

The SEO Engine project includes comprehensive integrations with popular third-party services to provide a complete solution for SEO management, content creation, and deployment automation.

### Supported Integrations

- **Vercel** - Deployment and project management
- **Supabase** - Database, authentication, and storage
- **Redis** - Caching and session management
- **Cloudinary** - Image and video management
- **Stripe** - Payment processing
- **SendGrid** - Email services

## Environment Configuration

All integrations are configured through environment variables. The configuration system automatically loads the appropriate settings based on the environment (development, staging, production).

### Required Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/seo_engine

# Security
JWT_SECRET=your-super-secret-jwt-key

# Optional: Integration-specific variables
VERCEL_ACCESS_TOKEN=your_vercel_token
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
REDIS_HOST=localhost
REDIS_PORT=6379
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
STRIPE_SECRET_KEY=your_stripe_secret
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
```

### Configuration Management

```typescript
import { config } from '@/src/integrations/config';

// Get the full configuration
const appConfig = config.getConfig();

// Get specific integration clients
const vercel = config.getVercel();
const supabase = config.getSupabase();
const redis = config.getRedis();
// ... etc

// Check feature flags
if (config.isFeatureEnabled('enableCaching')) {
  // Use Redis for caching
}
```

## Vercel Integration

### Overview

The Vercel integration provides comprehensive project management, deployment automation, and monitoring capabilities.

### Features

- Project creation and management
- Deployment creation and monitoring
- Environment variable management
- Domain management
- Webhook management
- Usage analytics

### Usage Examples

```typescript
import { createVercelClient } from '@/src/integrations/vercel';

const vercel = createVercelClient({
  accessToken: process.env.VERCEL_ACCESS_TOKEN,
  teamId: process.env.VERCEL_TEAM_ID,
});

// Create a new project
const project = await vercel.createProject({
  name: 'my-next-app',
  framework: 'nextjs',
  buildCommand: 'npm run build',
  outputDirectory: '.next',
  installCommand: 'npm install',
  devCommand: 'npm run dev',
});

// Deploy to Vercel
const deployment = await vercel.createDeployment(project.id, {
  files: [
    { file: 'package.json', data: JSON.stringify(packageJson) },
    // ... more files
  ],
  target: 'production',
});

// Monitor deployment status
const status = await vercel.getDeployment(deployment.id);
console.log('Deployment status:', status.state);
```

### Environment Variables

```bash
VERCEL_ACCESS_TOKEN=your_vercel_access_token
VERCEL_TEAM_ID=your_team_id  # Optional
VERCEL_PROJECT_ID=your_project_id  # Optional
```

## Supabase Integration

### Overview

The Supabase integration provides database operations, authentication, storage, and real-time capabilities.

### Features

- Database CRUD operations
- User authentication
- File storage
- Real-time subscriptions
- Admin operations
- Health monitoring

### Usage Examples

```typescript
import { createSupabaseClient } from '@/src/integrations/supabase';

const supabase = createSupabaseClient({
  url: process.env.SUPABASE_URL,
  anonKey: process.env.SUPABASE_ANON_KEY,
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
});

// Database operations
const { data, error } = await supabase.table('users').select('*').eq('id', userId);

// Authentication
const { user, error } = await supabase.auth.signIn(email, password);

// File upload
const { data, error } = await supabase.storage.upload('avatars', 'user-123.jpg', file);

// Real-time subscription
const subscription = supabase.realtime.subscribe('users', (payload) => {
  console.log('User updated:', payload);
});
```

### Environment Variables

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key  # For admin operations
```

## Redis Integration

### Overview

The Redis integration provides caching, session management, rate limiting, and pub/sub capabilities.

### Features

- Basic key-value operations
- Hash operations
- List operations
- Set operations
- Sorted set operations
- Pub/Sub messaging
- Rate limiting
- Session management

### Usage Examples

```typescript
import { createRedisClient } from '@/src/integrations/redis';

const redis = createRedisClient({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT),
  password: process.env.REDIS_PASSWORD,
});

// Basic operations
await redis.set('user:123', { name: 'John', email: 'john@example.com' }, { ttl: 3600 });
const user = await redis.get('user:123');

// Caching with automatic fallback
const data = await redis.cache('expensive-query', async () => {
  return await performExpensiveQuery();
}, { ttl: 300 });

// Rate limiting
const rateLimit = await redis.checkRateLimit('api:user:123', 10, 60); // 10 requests per minute
if (!rateLimit.allowed) {
  throw new Error('Rate limit exceeded');
}

// Session management
await redis.setSession('session-abc', { userId: 123, role: 'admin' }, 86400);
const session = await redis.getSession('session-abc');
```

### Environment Variables

```bash
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password  # Optional
REDIS_DB=0  # Optional
REDIS_KEY_PREFIX=seo_engine:  # Optional
```

## Cloudinary Integration

### Overview

The Cloudinary integration provides comprehensive image and video management, including upload, transformation, and optimization.

### Features

- File upload from various sources
- Image and video transformation
- Resource management
- Folder organization
- URL generation
- Usage analytics

### Usage Examples

```typescript
import { createCloudinaryClient, TRANSFORMATION_PRESETS } from '@/src/integrations/cloudinary';

const cloudinary = createCloudinaryClient({
  cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  apiKey: process.env.CLOUDINARY_API_KEY,
  apiSecret: process.env.CLOUDINARY_API_SECRET,
});

// Upload an image
const result = await cloudinary.upload(file, {
  folder: 'seo-engine',
  transformations: TRANSFORMATION_PRESETS.thumbnail,
  tags: ['user-avatar', 'profile'],
});

// Generate transformed URL
const thumbnailUrl = cloudinary.buildUrl('user-123.jpg', TRANSFORMATION_PRESETS.thumbnail);

// Upload from URL
const result = await cloudinary.uploadFromUrl('https://example.com/image.jpg', {
  folder: 'imported-images',
});

// List resources
const resources = await cloudinary.listResources({
  resourceType: 'image',
  prefix: 'user-avatars',
  maxResults: 50,
});
```

### Environment Variables

```bash
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_FOLDER=seo_engine  # Optional default folder
```

## Stripe Integration

### Overview

The Stripe integration provides comprehensive payment processing, subscription management, and financial operations.

### Features

- Customer management
- Product and price management
- Payment processing
- Subscription management
- Checkout sessions
- Webhook handling
- Balance and transactions

### Usage Examples

```typescript
import { createStripeClient, WEBHOOK_EVENTS } from '@/src/integrations/stripe';

const stripe = createStripeClient({
  secretKey: process.env.STRIPE_SECRET_KEY,
  publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
});

// Create a customer
const customer = await stripe.createCustomer({
  email: 'user@example.com',
  name: 'John Doe',
  metadata: { userId: '123' },
});

// Create a payment intent
const paymentIntent = await stripe.createPaymentIntent({
  amount: 2000, // $20.00 in cents
  currency: 'usd',
  customer: customer.id,
  metadata: { orderId: 'order-123' },
});

// Create a subscription
const subscription = await stripe.createSubscription({
  customer: customer.id,
  items: [{ price: 'price_123', quantity: 1 }],
  trial_period_days: 14,
});

// Create checkout session
const session = await stripe.createCheckoutSession({
  customer: customer.id,
  line_items: [{ price: 'price_123', quantity: 1 }],
  mode: 'subscription',
  success_url: 'https://yourapp.com/success',
  cancel_url: 'https://yourapp.com/cancel',
});

// Handle webhooks
const event = stripe.constructWebhookEvent(payload, signature);
if (event.type === WEBHOOK_EVENTS.PAYMENT_INTENT_SUCCEEDED) {
  // Handle successful payment
}
```

### Environment Variables

```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...  # Optional
```

## SendGrid Integration

### Overview

The SendGrid integration provides comprehensive email services, including transactional emails, templates, campaigns, and analytics.

### Features

- Email sending
- Template management
- Contact management
- List management
- Campaign management
- Analytics and reporting
- Sender verification

### Usage Examples

```typescript
import { createSendGridClient, EMAIL_TEMPLATES } from '@/src/integrations/sendgrid';

const sendgrid = createSendGridClient({
  apiKey: process.env.SENDGRID_API_KEY,
  fromEmail: 'noreply@yourdomain.com',
  fromName: 'SEO Engine',
  sandboxMode: process.env.NODE_ENV === 'development',
});

// Send a simple email
await sendgrid.sendEmail({
  to: 'user@example.com',
  subject: 'Welcome to SEO Engine',
  content: 'Thank you for joining our platform!',
  html: '<p>Thank you for <strong>joining</strong> our platform!</p>',
  categories: ['welcome', 'onboarding'],
});

// Send a template email
await sendgrid.sendTemplateEmail(
  EMAIL_TEMPLATES.WELCOME,
  'user@example.com',
  { firstName: 'John', productName: 'SEO Engine' },
  { categories: ['welcome'] }
);

// Create a template
const template = await sendgrid.createTemplate({
  name: 'Welcome Email',
  generation: 'dynamic',
});

// Add contacts to a list
await sendgrid.addContactsToList('list-123', ['contact-456', 'contact-789']);

// Send a campaign
await sendgrid.sendCampaign('campaign-123');
```

### Environment Variables

```bash
SENDGRID_API_KEY=SG.your_api_key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
SENDGRID_FROM_NAME=SEO Engine  # Optional
SENDGRID_SANDBOX_MODE=true  # Optional, defaults to false
```

## Usage Examples

### Complete Integration Setup

```typescript
import { config } from '@/src/integrations/config';

// Initialize all integrations
async function initializeApp() {
  try {
    // Initialize connections
    await config.initializeIntegrations();
    
    console.log('All integrations initialized successfully');
    
    // Example: Using multiple integrations together
    const user = await config.getSupabase().auth.signIn(email, password);
    
    if (user) {
      // Cache user session
      await config.getRedis().setSession(`session:${user.id}`, user, 86400);
      
      // Send welcome email
      await config.getSendGrid().sendTemplateEmail(
        'welcome-email',
        user.email,
        { firstName: user.name }
      );
      
      // Create customer in Stripe
      const customer = await config.getStripe().createCustomer({
        email: user.email,
        name: user.name,
      });
    }
    
  } catch (error) {
    console.error('Failed to initialize integrations:', error);
    throw error;
  }
}

// Cleanup on shutdown
process.on('SIGTERM', async () => {
  await config.cleanupIntegrations();
  process.exit(0);
});
```

### Error Handling

```typescript
import { config } from '@/src/integrations/config';

async function handleIntegrationError() {
  try {
    const result = await config.getStripe().createPaymentIntent({
      amount: 2000,
      currency: 'usd',
    });
    return result;
  } catch (error) {
    // Log error with context
    console.error('Stripe payment failed:', {
      error: error.message,
      service: 'stripe',
      operation: 'createPaymentIntent',
    });
    
    // Fallback behavior
    return { error: 'Payment processing unavailable' };
  }
}
```

### Health Checks

```typescript
import { config } from '@/src/integrations/config';

async function performHealthChecks() {
  const healthChecks = await Promise.allSettled([
    config.getRedis()?.healthCheck(),
    config.getSupabase()?.healthCheck(),
    config.getStripe()?.healthCheck(),
    config.getSendGrid()?.healthCheck(),
    config.getCloudinary()?.healthCheck(),
  ]);

  const results = healthChecks.map((check, index) => ({
    service: ['redis', 'supabase', 'stripe', 'sendgrid', 'cloudinary'][index],
    status: check.status === 'fulfilled' ? check.value.status : 'error',
    latency: check.status === 'fulfilled' ? check.value.latency : null,
  }));

  return results;
}
```

## Troubleshooting

### Common Issues

1. **Connection Timeouts**
   - Check network connectivity
   - Verify API keys and credentials
   - Increase timeout values in configuration

2. **Authentication Errors**
   - Verify API keys are correct and active
   - Check for expired tokens
   - Ensure proper permissions

3. **Rate Limiting**
   - Implement exponential backoff
   - Use caching to reduce API calls
   - Monitor usage quotas

4. **Environment Variables**
   - Ensure all required variables are set
   - Check for typos in variable names
   - Verify values are properly escaped

### Debug Mode

Enable debug logging by setting the LOG_LEVEL environment variable:

```bash
LOG_LEVEL=debug
```

### Testing Integrations

```typescript
// Test individual integrations
async function testIntegrations() {
  const tests = [
    { name: 'Redis', test: () => config.getRedis()?.ping() },
    { name: 'Supabase', test: () => config.getSupabase()?.healthCheck() },
    { name: 'Stripe', test: () => config.getStripe()?.getBalance() },
    { name: 'SendGrid', test: () => config.getSendGrid()?.getVerifiedSenders() },
    { name: 'Cloudinary', test: () => config.getCloudinary()?.getUsageStats() },
  ];

  for (const { name, test } of tests) {
    try {
      await test();
      console.log(`✅ ${name} integration working`);
    } catch (error) {
      console.error(`❌ ${name} integration failed:`, error.message);
    }
  }
}
```

### Support

For integration-specific issues:

- **Vercel**: [Vercel Documentation](https://vercel.com/docs)
- **Supabase**: [Supabase Documentation](https://supabase.com/docs)
- **Redis**: [Redis Documentation](https://redis.io/documentation)
- **Cloudinary**: [Cloudinary Documentation](https://cloudinary.com/documentation)
- **Stripe**: [Stripe Documentation](https://stripe.com/docs)
- **SendGrid**: [SendGrid Documentation](https://sendgrid.com/docs)

For project-specific issues, please check the GitHub repository or contact the development team.