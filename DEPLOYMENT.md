# wobbl.ai Vercel Deployment Guide

This guide covers the complete setup for deploying wobbl.ai to Vercel with serverless backend and frontend.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   External      │
│   (Next.js)     │◄──►│   (Serverless)  │◄──►│   Services      │
│   Vercel Edge   │    │   Vercel Node   │    │   (Supabase,    │
│                 │    │   Functions     │    │    OpenAI, etc) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📁 Project Structure

```
engine/
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   ├── components/      # React components
│   │   ├── lib/            # Utilities and helpers
│   │   └── types/          # TypeScript definitions
│   ├── package.json
│   └── next.config.ts
├── backend/                  # Serverless API functions
│   ├── src/
│   │   ├── api/            # Vercel serverless functions
│   │   ├── services/       # Business logic
│   │   ├── integrations/   # External service integrations
│   │   ├── lib/            # Database and utilities
│   │   └── modules/        # Feature modules
│   ├── prisma/             # Database schema
│   └── package.json
├── .github/workflows/        # GitHub Actions
├── vercel.json              # Vercel configuration
├── .env.example             # Environment variables template
└── package.json             # Root workspace configuration
```

## 🚀 Quick Start

### 1. Fork and Clone

```bash
git clone https://github.com/your-username/engine.git
cd engine
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Environment Setup

```bash
cp .env.example .env.local
# Edit .env.local with your actual values
```

### 4. Local Development

```bash
pnpm run dev
```

This starts both frontend (port 3000) and backend (port 3001) concurrently.

## 🔧 Vercel Configuration

### vercel.json

The `vercel.json` file handles:

- **Build Configuration**: Frontend build process
- **API Routes**: Backend serverless functions
- **Routing**: API vs frontend route handling
- **Headers**: CORS and security headers
- **Environment**: Production environment variables

### Key Features

```json
{
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/backend/src/api/$1.ts"
    },
    {
      "src": "/(.*)",
      "dest": "/frontend/$1"
    }
  ]
}
```

- `/api/*` routes go to backend serverless functions
- All other routes go to Next.js frontend

## 🌍 Environment Variables

### Required for Production

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/db

# Authentication
JWT_SECRET=your-super-secret-jwt-key
NEXTAUTH_SECRET=your-nextauth-secret

# AI Services
ZAI_API_KEY=your-zai-api-key
OPENAI_API_KEY=your-openai-api-key

# Google Services
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GSC_SERVICE_ACCOUNT_KEY='{"type":"service_account"...}'

# Email
SENDGRID_API_KEY=your-sendgrid-key
SENDGRID_FROM_EMAIL=noreply@wobbl.ai

# Storage
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-key
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
```

### Vercel Environment Setup

1. Go to Vercel Dashboard → Project Settings → Environment Variables
2. Add all required variables from `.env.example`
3. Set different values for Production, Preview, and Development environments

## 🤖 Z.ai Automated Deployment

### Webhook Integration

wobbl.ai supports automated deployment triggers via Z.ai webhooks. This allows you to trigger Vercel deployments directly from Z.ai workflows.

#### **Z.ai Webhook Payload**

Send this JSON payload to trigger automated deployments:

```json
{
  "trigger": "z.ai-auto-deploy",
  "meta": {
    "source": "z.ai",
    "repository": "https://github.com/SEO-Engine-Mk1/wobbl.ai",
    "branch": "wobbl.ai",
    "commit_message": "Automated deploy from Z.ai",
    "build_time": "{{timestamp}}",
    "actor": "z.ai-bot"
  }
}
```

#### **Enhanced Payload with Metadata**

For better tracking and debugging:

```json
{
  "trigger": "z.ai-auto-deploy",
  "meta": {
    "source": "z.ai",
    "repository": "https://github.com/SEO-Engine-Mk1/wobbl.ai",
    "branch": "wobbl.ai",
    "commit_id": "{{git_commit_hash}}",
    "commit_message": "{{git_commit_message}}",
    "build_time": "{{timestamp}}",
    "build_id": "{{build_id}}",
    "actor": "{{triggered_by}}",
    "notes": "Deployed automatically via Z.ai CI pipeline"
  }
}
```

#### **Z.ai Configuration**

* **POST URL:** `https://api.vercel.com/v1/integrations/deploy/prj_BXvG32V4OH6YRZen7py5fDjciCP0/aiqPgyJqUC`
* **HTTP Method:** `POST`
* **Headers:** `Content-Type: application/json`
* **Body:** Use the JSON payload above

#### **Alternative: Internal API Endpoint**

You can also trigger deployments via the internal API:

```bash
# Trigger deployment via wobbl.ai API
curl -X POST \
     -H "Content-Type: application/json" \
     -d '{"trigger":"z.ai-auto-deploy","meta":{"source":"z.ai","actor":"z.ai-bot"}}' \
     "https://wobbl.ai/api/deploy/trigger"
```

#### **Manual Testing**

Test the webhook manually:

```bash
curl -X POST \
     -H "Content-Type: application/json" \
     -d '{"trigger":"manual-test","meta":{"source":"curl","actor":"developer"}}' \
     "https://api.vercel.com/v1/integrations/deploy/prj_BXvG32V4OH6YRZen7py5fDjciCP0/aiqPgyJqUC"
```

#### **Environment Variables**

Add this to your environment configuration:

```bash
# Z.ai Webhook Integration
VERCEL_DEPLOY_HOOK_URL="https://api.vercel.com/v1/integrations/deploy/prj_BXvG32V4OH6YRZen7py5fDjciCP0/aiqPgyJqUC"
```

#### **Benefits**

- **Instant Deployment**: Trigger deployments without waiting for Git pushes
- **Build Metadata**: Rich tracking information in Vercel deployment history
- **Fallback Mechanism**: Deploy even if Git sync fails
- **Automated Workflows**: Integrate with Z.ai CI/CD pipelines
- **Rollback Support**: Easy re-deployment of previous commits

---

## 🔄 Deployment Process

### Automatic Deployment (GitHub → Vercel)

1. **Push to main branch**:
   ```bash
   git checkout main
   git add .
   git commit -m "Deploy to production"
   git push origin main
   ```

2. **Automatic triggers**:
   - GitHub Actions workflow runs
   - Vercel builds and deploys
   - Production URL updated

### Manual Deployment

```bash
# Deploy to production
pnpm run deploy:vercel

# Deploy to preview
pnpm run deploy:preview
```

### Preview Deployments

Every pull request automatically creates a preview deployment with:
- Isolated environment
- Shared database (optional)
- Unique preview URL
- Automatic cleanup after merge

## 🧪 Mock Services

The deployment includes comprehensive mock services to prevent failures when external services are not configured:

### Available Mocks

- **Database**: Mock Prisma client
- **Supabase**: Mock Supabase client
- **Redis**: Mock Redis client
- **ZAI SDK**: Mock AI responses
- **Email**: Mock SendGrid
- **Storage**: Mock Cloudinary
- **WordPress**: Mock WordPress API

### Usage

Services automatically fall back to mocks when environment variables are missing:

```typescript
import { db, supabase, redis } from '../lib/deployment-helpers';

// Automatically uses real service or mock based on environment
const articles = await db.article.findMany();
```

## 🔍 API Routes

### Serverless Functions

Backend API routes are deployed as Vercel serverless functions:

```
/api/health          → backend/src/api/health.ts
/api/articles        → backend/src/api/articles.ts
/api/campaigns       → backend/src/api/campaigns.ts
/api/author          → backend/src/api/author.ts
/api/gsc/connect     → backend/src/api/gsc/connect.ts
/api/wp/publish      → backend/src/api/wp/publish.ts
```

### Example API Call

```typescript
// Frontend
const response = await fetch('/api/articles', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: 'SEO best practices 2024',
    authorId: 'author-123',
    authorName: 'John Doe'
  })
});

const article = await response.json();
```

## 🛠️ Development Workflow

### 1. Feature Development

```bash
# Create feature branch
git checkout -b feature/new-feature

# Work on changes
pnpm run dev

# Test changes
pnpm run lint
pnpm run type-check
pnpm run test
```

### 2. Preview Deployment

```bash
# Push feature branch
git push origin feature/new-feature

# Get preview URL from GitHub PR or Vercel dashboard
```

### 3. Production Deployment

```bash
# Merge to main
git checkout main
git merge feature/new-feature
git push origin main

# Automatic deployment to production
```

## 🔧 Configuration

### Build Scripts

```json
{
  "scripts": {
    "build:vercel": "pnpm run build:frontend",
    "deploy:vercel": "vercel --prod",
    "deploy:preview": "vercel"
  }
}
```

### Workspace Configuration

The project uses pnpm workspaces:

```json
{
  "workspaces": ["frontend", "backend", "packages/*"],
  "packageManager": "pnpm@10.19.0"
}
```

## 📊 Monitoring

### Health Check

```bash
curl https://your-app.vercel.app/api/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "database": "connected",
  "environment": "configured",
  "platform": "vercel"
}
```

### Vercel Analytics

- Built-in performance monitoring
- Web Vitals tracking
- Error tracking
- Usage analytics

## 🔒 Security

### CORS Configuration

```typescript
export const corsConfig = {
  origin: ['https://wobbl.ai'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  headers: ['Content-Type', 'Authorization'],
  credentials: true
};
```

### Rate Limiting

Built-in rate limiting for API endpoints:

```typescript
const rateLimitResult = rateLimit(identifier, 100, 15 * 60 * 1000);
if (!rateLimitResult.allowed) {
  return res.status(429).json({ error: 'Too many requests' });
}
```

## 🐛 Troubleshooting

### Common Issues

1. **Build Failures**:
   ```bash
   # Check build logs
   pnpm run build:frontend
   
   # Fix TypeScript errors
   pnpm run type-check:frontend
   ```

2. **API Errors**:
   ```bash
   # Check environment variables
   vercel env ls
   
   # Test API locally
   curl http://localhost:3001/api/health
   ```

3. **Database Connection**:
   ```bash
   # Check database URL format
   echo $DATABASE_URL
   
   # Test connection
   pnpm run db:push
   ```

### Debug Mode

Enable debug logging:

```bash
# Set environment variable
VERCEL_DEBUG=true pnpm run deploy:vercel
```

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js on Vercel](https://vercel.com/solutions/nextjs)
- [Serverless Functions](https://vercel.com/docs/concepts/functions/serverless-functions)
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Test with preview deployments
4. Submit pull request
5. Merge to main for production deployment

---

**Note**: This deployment setup ensures that wobbl.ai can be continuously developed and deployed without breaking changes, thanks to the comprehensive mock services and environment-aware configurations.