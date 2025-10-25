# wobbl.ai Platform

🚀 **AI-powered SEO content generation and distribution platform** that automates the entire SEO content lifecycle from research to publication and promotion.

## 🎯 Project Purpose

wobbl.ai is a comprehensive platform that leverages artificial intelligence to:

- **Research SERP trends** and generate content outlines
- **Create high-quality articles** with E-E-A-T compliance
- **Verify originality** using advanced embedding analysis
- **Manage claim registries** and fact-checking
- **Publish to WordPress** automatically
- **Syndicate to social media** platforms
- **Run drip email campaigns** with Hostinger SMTP
- **Monitor performance** via Google Search Console integration

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │     Jobs        │
│   (Next.js)     │◄──►│   (Express)     │◄──►│   (BullMQ)      │
│                 │    │                 │    │                 │
│ • Dashboard     │    │ • API Routes    │    │ • SERP Research │
│ • Settings      │    │ • Integrations  │    │ • Article Gen   │
│ • Monitoring    │    │ • Queue Mgmt    │    │ • Publishing    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Supabase      │    │     Redis       │    │   External APIs │
│   (Database)    │    │    (Cache)      │    │                 │
│                 │    │                 │    │ • OpenAI        │
│ • PostgreSQL    │    │ • Sessions      │    │ • Google APIs   │
│ • Auth          │    │ • Rate Limits   │    │ • WordPress     │
│ • Storage       │    │ • Queues        │    │ • Social Media  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **State Management**: Zustand + TanStack Query
- **UI Components**: Complete shadcn/ui component set
- **Authentication**: NextAuth.js v4
- **Theme**: next-themes for dark/light mode

### Backend
- **Runtime**: Node.js with Express
- **Language**: TypeScript 5
- **Database**: PostgreSQL via Prisma ORM
- **Caching**: Redis with ioredis
- **Queue**: BullMQ for background jobs
- **Real-time**: Socket.IO
- **File Storage**: Supabase Storage

### Integrations
- **AI/ML**: OpenAI GPT, Embedding models
- **CMS**: WordPress REST API
- **Email**: Hostinger SMTP + SendGrid
- **Social**: Twitter, LinkedIn, Facebook APIs
- **Analytics**: Google Search Console
- **Media**: Cloudinary for images/videos
- **Payments**: Stripe for subscriptions
- **Deployment**: Vercel integration

### Development Tools
- **Package Manager**: npm with workspaces
- **Linting**: ESLint + TypeScript
- **Testing**: Jest + React Testing Library
- **CI/CD**: GitHub Actions
- **Monitoring**: Custom health checks
- **Documentation**: Markdown + VitePress

## 📁 Project Structure

```
wobbl.ai/
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   ├── components/      # Reusable UI components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utility functions
│   │   └── types/           # TypeScript type definitions
│   ├── public/              # Static assets
│   └── package.json
├── backend/                  # Express backend application
│   ├── src/
│   │   ├── api/             # API route handlers
│   │   ├── services/        # Business logic services
│   │   ├── integrations/    # Third-party API integrations
│   │   ├── jobs/            # Background job processors
│   │   ├── lib/             # Utility functions
│   │   └── types/           # TypeScript type definitions
│   ├── prisma/              # Database schema and migrations
│   └── package.json
├── jobs/                     # Standalone job processors
│   ├── serp-research/       # SERP analysis jobs
│   ├── article-generation/  # Content creation jobs
│   ├── publishing/          # WordPress publishing jobs
│   └── social-syndication/  # Social media posting jobs
├── db/                       # Database files and seeds
│   ├── migrations/          # Database migration files
│   ├── seeds/               # Seed data
│   └── backups/             # Database backups
├── docs/                     # Project documentation
│   ├── architecture/        # Architecture documentation
│   ├── modules/             # Module-specific docs
│   ├── api/                 # API documentation
│   └── deployment/          # Deployment guides
├── .github/                  # GitHub workflows and templates
│   └── workflows/           # CI/CD pipelines
├── package.json              # Root package.json with workspaces
├── README.md                 # This file
├── LICENSE                   # MIT License
└── .gitignore               # Git ignore rules
```

## 🌿 Branch Strategy

We use a simplified Git flow with the following branches:

### Main Branches
- **`main`**: Production-ready code, always deployable
- **`staging`**: Pre-production testing environment

### Feature Branches
- **`feature/*`**: New features and enhancements
- **`bugfix/*`**: Bug fixes and patches
- **`hotfix/*`**: Critical fixes for production

### Branch Protection Rules
- **`main`** branch requires:
  - Pull request review
  - Passing CI/CD checks
  - No direct pushes
- **`staging`** branch allows:
  - Direct pushes from feature branches
  - Automated testing

### Workflow
1. Create feature branch from `main`: `git checkout -b feature/new-module`
2. Develop and test the feature
3. Create pull request to `main`
4. Code review and automated testing
5. Merge to `main` → triggers deployment to staging
6. After staging validation → deploy to production

## 📚 Core Modules

### 1. SERP Research & Outline Generation
- **Purpose**: Analyze search results and generate content outlines
- **Components**: Google SERP API, Content analysis, Outline generation
- **Data Model**: Keywords, SERP results, Content outlines
- **Key Endpoints**: `/api/serp/analyze`, `/api/outlines/generate`

### 2. Article Generation with E-E-A-T Pass
- **Purpose**: Create high-quality, E-E-A-T compliant content
- **Components**: OpenAI integration, Content validation, Quality scoring
- **Data Model**: Articles, Content blocks, Quality metrics
- **Key Endpoints**: `/api/articles/generate`, `/api/articles/validate`

### 3. Originality Check
- **Purpose**: Ensure content originality using embeddings
- **Components**: Embedding generation, Similarity detection, API integration
- **Data Model**: Embeddings, Similarity scores, Originality reports
- **Key Endpoints**: `/api/plagiarism/check`, `/api/embeddings/generate`

### 4. Claim Registry & Verification
- **Purpose**: Track and verify factual claims in content
- **Components**: Claim extraction, Fact-checking APIs, Verification status
- **Data Model**: Claims, Sources, Verification results
- **Key Endpoints**: `/api/claims/extract`, `/api/claims/verify`

### 5. WordPress Publishing Module
- **Purpose**: Automatically publish content to WordPress sites
- **Components**: WordPress REST API, Media upload, Category management
- **Data Model**: WordPress sites, Posts, Media, Categories
- **Key Endpoints**: `/api/wordpress/publish`, `/api/wordpress/sites`

### 6. Social Syndication Module
- **Purpose**: Distribute content across social media platforms
- **Components**: Social media APIs, Content adaptation, Scheduling
- **Data Model**: Social accounts, Posts, Schedules
- **Key Endpoints**: `/api/social/post`, `/api/social/schedule`

### 7. Drip Email Engine
- **Purpose**: Send automated email campaigns via Hostinger SMTP
- **Components**: SMTP integration, Email templates, Campaign management
- **Data Model**: Campaigns, Subscribers, Email logs
- **Key Endpoints**: `/api/campaigns/create`, `/api/campaigns/send`

### 8. GSC Ingestion & Refresh Engine
- **Purpose**: Monitor and refresh content based on GSC data
- **Components**: Google Search Console API, Performance tracking
- **Data Model**: GSC data, Performance metrics, Refresh schedules
- **Key Endpoints**: `/api/gsc/ingest`, `/api/gsc/refresh`

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm 9+
- PostgreSQL database
- Redis server
- Google Cloud Platform account
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/SEO-Engine-Mk1/wobbl.ai.git
   cd wobbl.ai
   ```

2. **Install dependencies**
   ```bash
   npm run setup
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Initialize database**
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

5. **Start development servers**
   ```bash
   npm run dev
   ```

### Environment Variables

Key environment variables (see `.env.example` for complete list):

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/seo_engine

# Authentication
JWT_SECRET=your-super-secret-jwt-key
NEXTAUTH_SECRET=your-nextauth-secret

# AI Services
OPENAI_API_KEY=your-openai-api-key
OPENAI_ORGANIZATION=your-org-id

# Google APIs
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GSC_SERVICE_ACCOUNT_KEY=your-gsc-service-account-key

# WordPress
WORDPRESS_URL=your-wordpress-site.com
WORDPRESS_USERNAME=your-username
WORDPRESS_PASSWORD=your-password

# Email
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=587
SMTP_USER=your-email@domain.com
SMTP_PASS=your-smtp-password

# Social Media
TWITTER_API_KEY=your-twitter-api-key
TWITTER_API_SECRET=your-twitter-api-secret
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret

# Cache
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password

# Storage
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

## 📖 Documentation

- **[Architecture Overview](docs/architecture/README.md)** - Detailed system architecture
- **[Module Documentation](docs/modules/README.md)** - Individual module guides
- **[API Documentation](docs/api/README.md)** - REST API reference
- **[Deployment Guide](docs/deployment/README.md)** - Production deployment
- **[Development Guide](docs/development/README.md)** - Development setup and practices

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests for specific workspace
npm run test:frontend
npm run test:backend

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm run start
```

### Vercel Deployment
The project is configured for automatic deployment to Vercel. Connect your repository to Vercel and it will automatically deploy on pushes to `main`.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Code Standards
- Use TypeScript for all new code
- Follow ESLint configuration
- Write tests for new features
- Update documentation as needed
- Use conventional commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/SEO-Engine-Mk1/wobbl.ai/issues)
- **Discussions**: [GitHub Discussions](https://github.com/SEO-Engine-Mk1/wobbl.ai/discussions)
- **Email**: support@seo-engine.com

## 🎯 Roadmap

### v0.1.0 (Current)
- ✅ Project scaffold and structure
- ✅ Basic integrations setup
- ✅ CI/CD pipeline
- 🚧 Core module implementation

### v0.2.0 (Planned)
- SERP research module
- Article generation with E-E-A-T
- Originality checking system

### v0.3.0 (Planned)
- Claim registry and verification
- WordPress publishing
- Social media syndication

### v1.0.0 (Target)
- Complete feature set
- Production-ready deployment
- Comprehensive documentation
- Performance optimization

---

**Built with ❤️ by the wobbl.ai team**