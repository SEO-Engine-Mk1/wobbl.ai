import { z } from 'zod'

// Base schemas
const DateTimeSchema = z.string().datetime()
const CuidSchema = z.string().cuid()

// User schemas
export const UserSchema = z.object({
  id: CuidSchema.optional(),
  email: z.string().email(),
  name: z.string().optional(),
  role: z.string().default('user'),
  createdAt: DateTimeSchema.optional(),
  updatedAt: DateTimeSchema.optional(),
})

export const UserCreateSchema = UserSchema.pick({
  email: true,
  name: true,
  role: true,
})

export const UserUpdateSchema = UserSchema.pick({
  name: true,
  role: true,
}).partial()

// Article schemas
export const ArticleSchema = z.object({
  id: CuidSchema.optional(),
  title: z.string().min(1),
  slug: z.string().min(1),
  content: z.string().min(1),
  excerpt: z.string().optional(),
  metaDescription: z.string().optional(),
  canonicalUrl: z.string().url().optional(),
  focusKeyword: z.string().optional(),
  targetWordCount: z.number().int().min(1).default(2500),
  actualWordCount: z.number().int().optional(),
  keywords: z.string(), // JSON string array
  readingTime: z.number().int().optional(),
  seoScore: z.number().int().min(0).max(100).optional(),
  wordpressPostId: z.number().int().optional(),
  wordpressUrl: z.string().url().optional(),
  wordpressStatus: z.string().optional(),
  publishedAt: DateTimeSchema.optional(),
  
  // E-E-A-T fields
  authorId: CuidSchema.optional(),
  authorName: z.string(),
  authorBio: z.string().optional(),
  authorExperience: z.string().optional(),
  experienceAnchor: z.string().optional(),
  sourceDiversity: z.number().int().default(0),
  helpfulnessScore: z.number().optional(),
  freshnessScore: z.number().optional(),
  
  // QA fields
  originalityScore: z.number().optional(),
  plagiarismChecked: z.boolean().default(false),
  claimsVerified: z.boolean().default(false),
  seoChecked: z.boolean().default(false),
  serpCoverageChecked: z.boolean().default(false),
  qaPassed: z.boolean().default(false),
  
  // Publishing
  status: z.enum(['draft', 'reviewing', 'approved', 'published']).default('draft'),
  
  // Performance tracking
  jsonLd: z.string().optional(),
  tableOfContents: z.string().optional(),
  faqSection: z.string().optional(),
  
  // New feature fields
  entityCoverageScore: z.number().optional(),
  autoRefreshEnabled: z.boolean().default(false),
  
  createdAt: DateTimeSchema.optional(),
  updatedAt: DateTimeSchema.optional(),
})

export const ArticleCreateSchema = ArticleSchema.pick({
  title: true,
  slug: true,
  content: true,
  excerpt: true,
  metaDescription: true,
  canonicalUrl: true,
  focusKeyword: true,
  targetWordCount: true,
  keywords: true,
  authorId: true,
  authorName: true,
  authorBio: true,
  authorExperience: true,
  experienceAnchor: true,
  status: true,
  autoRefreshEnabled: true,
})

export const ArticleUpdateSchema = ArticleSchema.pick({
  title: true,
  slug: true,
  content: true,
  excerpt: true,
  metaDescription: true,
  canonicalUrl: true,
  focusKeyword: true,
  actualWordCount: true,
  keywords: true,
  readingTime: true,
  seoScore: true,
  wordpressPostId: true,
  wordpressUrl: true,
  wordpressStatus: true,
  publishedAt: true,
  authorId: true,
  authorName: true,
  authorBio: true,
  authorExperience: true,
  experienceAnchor: true,
  sourceDiversity: true,
  helpfulnessScore: true,
  freshnessScore: true,
  originalityScore: true,
  plagiarismChecked: true,
  claimsVerified: true,
  seoChecked: true,
  serpCoverageChecked: true,
  qaPassed: true,
  status: true,
  jsonLd: true,
  tableOfContents: true,
  faqSection: true,
  entityCoverageScore: true,
  autoRefreshEnabled: true,
}).partial()

// Claim schemas
export const ClaimSchema = z.object({
  id: CuidSchema.optional(),
  articleId: CuidSchema,
  claimText: z.string().min(1),
  claimType: z.enum(['statistic', 'fact', 'entity', 'quote']),
  sourceUrl: z.string().url().optional(),
  confidence: z.number().min(0).max(1).optional(),
  verified: z.boolean().default(false),
  verificationNotes: z.string().optional(),
  createdAt: DateTimeSchema.optional(),
  updatedAt: DateTimeSchema.optional(),
})

export const ClaimCreateSchema = ClaimSchema.pick({
  articleId: true,
  claimText: true,
  claimType: true,
  sourceUrl: true,
  confidence: true,
  verified: true,
  verificationNotes: true,
})

export const ClaimUpdateSchema = ClaimSchema.pick({
  claimText: true,
  claimType: true,
  sourceUrl: true,
  confidence: true,
  verified: true,
  verificationNotes: true,
}).partial()

// Company Profile schemas
export const CompanyProfileSchema = z.object({
  id: CuidSchema.optional(),
  userId: CuidSchema,
  companyName: z.string().min(1),
  industry: z.string().min(1),
  geo: z.string().optional(),
  competitors: z.string().optional(),
  cta: z.string().optional(),
  signature: z.string().optional(),
  createdAt: DateTimeSchema.optional(),
  updatedAt: DateTimeSchema.optional(),
})

export const CompanyProfileCreateSchema = CompanyProfileSchema.pick({
  userId: true,
  companyName: true,
  industry: true,
  geo: true,
  competitors: true,
  cta: true,
  signature: true,
})

export const CompanyProfileUpdateSchema = CompanyProfileSchema.pick({
  companyName: true,
  industry: true,
  geo: true,
  competitors: true,
  cta: true,
  signature: true,
}).partial()

// Email Campaign schemas
export const EmailCampaignSchema = z.object({
  id: CuidSchema.optional(),
  userId: CuidSchema,
  companyProfileId: CuidSchema.optional(),
  templateId: CuidSchema.optional(),
  listIds: z.string(), // JSON string array
  name: z.string().min(1),
  description: z.string(),
  subjectTemplate: z.string().optional(),
  status: z.enum(['draft', 'scheduled', 'running', 'completed', 'paused']).default('draft'),
  scheduleType: z.enum(['immediate', 'scheduled', 'recurring']).default('immediate'),
  scheduledAt: DateTimeSchema.optional(),
  recurringConfig: z.string().optional(), // JSON string
  dailyCap: z.number().int().min(1).default(100),
  warmupDay: z.number().int().min(1).default(1),
  totalSent: z.number().int().default(0),
  totalOpened: z.number().int().default(0),
  totalClicked: z.number().int().default(0),
  totalReplied: z.number().int().default(0),
  totalUnsubscribed: z.number().int().default(0),
  createdAt: DateTimeSchema.optional(),
  updatedAt: DateTimeSchema.optional(),
})

export const EmailCampaignCreateSchema = EmailCampaignSchema.pick({
  userId: true,
  companyProfileId: true,
  templateId: true,
  listIds: true,
  name: true,
  description: true,
  subjectTemplate: true,
  status: true,
  scheduleType: true,
  scheduledAt: true,
  recurringConfig: true,
  dailyCap: true,
  warmupDay: true,
})

export const EmailCampaignUpdateSchema = EmailCampaignSchema.pick({
  companyProfileId: true,
  templateId: true,
  listIds: true,
  name: true,
  description: true,
  subjectTemplate: true,
  status: true,
  scheduleType: true,
  scheduledAt: true,
  recurringConfig: true,
  dailyCap: true,
  warmupDay: true,
  totalSent: true,
  totalOpened: true,
  totalClicked: true,
  totalReplied: true,
  totalUnsubscribed: true,
}).partial()

// Email Template schemas
export const EmailTemplateSchema = z.object({
  id: CuidSchema.optional(),
  name: z.string().min(1),
  subject: z.string().min(1),
  htmlContent: z.string().min(1),
  textContent: z.string().min(1),
  variables: z.string(), // JSON string array
  category: z.enum(['welcome', 'newsletter', 'promotion', 'notification', 'custom']),
  createdAt: DateTimeSchema.optional(),
  updatedAt: DateTimeSchema.optional(),
})

export const EmailTemplateCreateSchema = EmailTemplateSchema.pick({
  name: true,
  subject: true,
  htmlContent: true,
  textContent: true,
  variables: true,
  category: true,
})

export const EmailTemplateUpdateSchema = EmailTemplateSchema.pick({
  name: true,
  subject: true,
  htmlContent: true,
  textContent: true,
  variables: true,
  category: true,
}).partial()

// Email List schemas
export const EmailListSchema = z.object({
  id: CuidSchema.optional(),
  name: z.string().min(1),
  description: z.string(),
  createdAt: DateTimeSchema.optional(),
  updatedAt: DateTimeSchema.optional(),
})

export const EmailListCreateSchema = EmailListSchema.pick({
  name: true,
  description: true,
})

export const EmailListUpdateSchema = EmailListSchema.pick({
  name: true,
  description: true,
}).partial()

// Email Subscriber schemas
export const EmailSubscriberSchema = z.object({
  id: CuidSchema.optional(),
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  customFields: z.string().optional(), // JSON string
  status: z.enum(['active', 'unsubscribed', 'bounced']).default('active'),
  subscribedAt: DateTimeSchema.optional(),
  unsubscribedAt: DateTimeSchema.optional(),
})

export const EmailSubscriberCreateSchema = EmailSubscriberSchema.pick({
  email: true,
  firstName: true,
  lastName: true,
  customFields: true,
  status: true,
})

export const EmailSubscriberUpdateSchema = EmailSubscriberSchema.pick({
  firstName: true,
  lastName: true,
  customFields: true,
  status: true,
  unsubscribedAt: true,
}).partial()

// Social Post schemas
export const SocialPostSchema = z.object({
  id: CuidSchema.optional(),
  articleId: CuidSchema,
  platform: z.enum(['linkedin', 'twitter', 'facebook']),
  content: z.string().min(1),
  status: z.enum(['draft', 'scheduled', 'posted', 'failed']).default('draft'),
  scheduledAt: DateTimeSchema.optional(),
  postedAt: DateTimeSchema.optional(),
  platformPostId: z.string().optional(),
  errorMessage: z.string().optional(),
  createdAt: DateTimeSchema.optional(),
  updatedAt: DateTimeSchema.optional(),
})

export const SocialPostCreateSchema = SocialPostSchema.pick({
  articleId: true,
  platform: true,
  content: true,
  status: true,
  scheduledAt: true,
})

export const SocialPostUpdateSchema = SocialPostSchema.pick({
  content: true,
  status: true,
  scheduledAt: true,
  postedAt: true,
  platformPostId: true,
  errorMessage: true,
}).partial()

// Author schemas
export const AuthorSchema = z.object({
  id: CuidSchema.optional(),
  name: z.string().min(1),
  bio: z.string().optional(),
  credentials: z.string().optional(),
  topics: z.string().optional(), // JSON string array
  totalArticles: z.number().int().default(0),
  avgOriginality: z.number().default(0),
  avgPosition: z.number().default(0),
  totalClicks: z.number().int().default(0),
  avgCpcValue: z.number().default(0),
  isActive: z.boolean().default(true),
  createdAt: DateTimeSchema.optional(),
  updatedAt: DateTimeSchema.optional(),
})

export const AuthorCreateSchema = AuthorSchema.pick({
  name: true,
  bio: true,
  credentials: true,
  topics: true,
  totalArticles: true,
  avgOriginality: true,
  avgPosition: true,
  totalClicks: true,
  avgCpcValue: true,
  isActive: true,
})

export const AuthorUpdateSchema = AuthorSchema.pick({
  name: true,
  bio: true,
  credentials: true,
  topics: true,
  totalArticles: true,
  avgOriginality: true,
  avgPosition: true,
  totalClicks: true,
  avgCpcValue: true,
  isActive: true,
}).partial()

// WP Connection schemas
export const WPConnectionSchema = z.object({
  id: CuidSchema.optional(),
  userId: CuidSchema,
  siteUrl: z.string().url(),
  username: z.string().min(1),
  applicationPassword: z.string().min(1),
  isActive: z.boolean().default(true),
  lastSyncAt: DateTimeSchema.optional(),
  createdAt: DateTimeSchema.optional(),
  updatedAt: DateTimeSchema.optional(),
})

export const WPConnectionCreateSchema = WPConnectionSchema.pick({
  userId: true,
  siteUrl: true,
  username: true,
  applicationPassword: true,
  isActive: true,
})

export const WPConnectionUpdateSchema = WPConnectionSchema.pick({
  siteUrl: true,
  username: true,
  applicationPassword: true,
  isActive: true,
  lastSyncAt: true,
}).partial()

// Article Cost schemas
export const ArticleCostSchema = z.object({
  id: CuidSchema.optional(),
  articleId: CuidSchema,
  aiCost: z.number().default(0),
  smtpCost: z.number().default(0),
  plagiarismCost: z.number().default(0),
  totalCost: z.number().default(0),
  clicksGained: z.number().int().default(0),
  cpcValue: z.number().default(0),
  roi: z.number().optional(),
  createdAt: DateTimeSchema.optional(),
  updatedAt: DateTimeSchema.optional(),
})

export const ArticleCostCreateSchema = ArticleCostSchema.pick({
  articleId: true,
  aiCost: true,
  smtpCost: true,
  plagiarismCost: true,
  totalCost: true,
  clicksGained: true,
  cpcValue: true,
  roi: true,
})

export const ArticleCostUpdateSchema = ArticleCostSchema.pick({
  aiCost: true,
  smtpCost: true,
  plagiarismCost: true,
  totalCost: true,
  clicksGained: true,
  cpcValue: true,
  roi: true,
}).partial()

// API Request/Response schemas
export const CreateArticleRequestSchema = z.object({
  query: z.string().min(1),
  authorId: CuidSchema,
  authorName: z.string().optional(),
  authorBio: z.string().optional(),
  authorExperience: z.string().optional(),
  experienceAnchor: z.string().optional(),
})

export const CreateCampaignRequestSchema = z.object({
  userId: CuidSchema,
  companyProfileId: CuidSchema,
  name: z.string().min(1),
  recipientList: z.array(z.string()), // This will be converted to JSON string
  campaignSettings: z.object({}).optional(),
})

export const EnhanceArticleRequestSchema = z.object({
  articleId: CuidSchema,
  enhancementType: z.enum(['seo', 'readability', 'freshness', 'entities']),
  options: z.object({}).optional(),
})

// Utility functions for JSON string handling
export const parseJsonArray = (jsonString: string): any[] => {
  try {
    return JSON.parse(jsonString)
  } catch {
    return []
  }
}

export const stringifyArray = (array: any[]): string => {
  return JSON.stringify(array)
}

// Type exports
export type User = z.infer<typeof UserSchema>
export type UserCreate = z.infer<typeof UserCreateSchema>
export type UserUpdate = z.infer<typeof UserUpdateSchema>

export type Article = z.infer<typeof ArticleSchema>
export type ArticleCreate = z.infer<typeof ArticleCreateSchema>
export type ArticleUpdate = z.infer<typeof ArticleUpdateSchema>

export type Claim = z.infer<typeof ClaimSchema>
export type ClaimCreate = z.infer<typeof ClaimCreateSchema>
export type ClaimUpdate = z.infer<typeof ClaimUpdateSchema>

export type CompanyProfile = z.infer<typeof CompanyProfileSchema>
export type CompanyProfileCreate = z.infer<typeof CompanyProfileCreateSchema>
export type CompanyProfileUpdate = z.infer<typeof CompanyProfileUpdateSchema>

export type EmailCampaign = z.infer<typeof EmailCampaignSchema>
export type EmailCampaignCreate = z.infer<typeof EmailCampaignCreateSchema>
export type EmailCampaignUpdate = z.infer<typeof EmailCampaignUpdateSchema>

export type EmailTemplate = z.infer<typeof EmailTemplateSchema>
export type EmailTemplateCreate = z.infer<typeof EmailTemplateCreateSchema>
export type EmailTemplateUpdate = z.infer<typeof EmailTemplateUpdateSchema>

export type EmailList = z.infer<typeof EmailListSchema>
export type EmailListCreate = z.infer<typeof EmailListCreateSchema>
export type EmailListUpdate = z.infer<typeof EmailListUpdateSchema>

export type EmailSubscriber = z.infer<typeof EmailSubscriberSchema>
export type EmailSubscriberCreate = z.infer<typeof EmailSubscriberCreateSchema>
export type EmailSubscriberUpdate = z.infer<typeof EmailSubscriberUpdateSchema>

export type SocialPost = z.infer<typeof SocialPostSchema>
export type SocialPostCreate = z.infer<typeof SocialPostCreateSchema>
export type SocialPostUpdate = z.infer<typeof SocialPostUpdateSchema>

export type Author = z.infer<typeof AuthorSchema>
export type AuthorCreate = z.infer<typeof AuthorCreateSchema>
export type AuthorUpdate = z.infer<typeof AuthorUpdateSchema>

export type WPConnection = z.infer<typeof WPConnectionSchema>
export type WPConnectionCreate = z.infer<typeof WPConnectionCreateSchema>
export type WPConnectionUpdate = z.infer<typeof WPConnectionUpdateSchema>

export type ArticleCost = z.infer<typeof ArticleCostSchema>
export type ArticleCostCreate = z.infer<typeof ArticleCostCreateSchema>
export type ArticleCostUpdate = z.infer<typeof ArticleCostUpdateSchema>

export type CreateArticleRequest = z.infer<typeof CreateArticleRequestSchema>
export type CreateCampaignRequest = z.infer<typeof CreateCampaignRequestSchema>
export type EnhanceArticleRequest = z.infer<typeof EnhanceArticleRequestSchema>