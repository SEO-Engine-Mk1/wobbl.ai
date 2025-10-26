/**
 * Generated Database Types
 * This file contains type definitions that match the Prisma schema
 * These types are used for type safety across the application
 */

// Import Zod types for consistency
import type {
  User,
  Article,
  Claim,
  CompanyProfile,
  EmailCampaign,
  EmailTemplate,
  EmailList,
  EmailSubscriber,
  SocialPost,
  Author,
  WPConnection,
  ArticleCost,
  UserCreate,
  ArticleCreate,
  ClaimCreate,
  CompanyProfileCreate,
  EmailCampaignCreate,
  EmailTemplateCreate,
  EmailListCreate,
  EmailSubscriberCreate,
  SocialPostCreate,
  AuthorCreate,
  WPConnectionCreate,
  ArticleCostCreate,
  UserUpdate,
  ArticleUpdate,
  ClaimUpdate,
  CompanyProfileUpdate,
  EmailCampaignUpdate,
  EmailTemplateUpdate,
  EmailListUpdate,
  EmailSubscriberUpdate,
  SocialPostUpdate,
  AuthorUpdate,
  WPConnectionUpdate,
  ArticleCostUpdate
} from './validation'

// Database interface structure (matches Prisma schema)
export interface Database {
  public: {
    Tables: {
      users: {
        Row: User
        Insert: UserCreate
        Update: UserUpdate
      }
      articles: {
        Row: Article
        Insert: ArticleCreate
        Update: ArticleUpdate
      }
      claims: {
        Row: Claim
        Insert: ClaimCreate
        Update: ClaimUpdate
      }
      company_profiles: {
        Row: CompanyProfile
        Insert: CompanyProfileCreate
        Update: CompanyProfileUpdate
      }
      email_campaigns: {
        Row: EmailCampaign
        Insert: EmailCampaignCreate
        Update: EmailCampaignUpdate
      }
      email_templates: {
        Row: EmailTemplate
        Insert: EmailTemplateCreate
        Update: EmailTemplateUpdate
      }
      email_lists: {
        Row: EmailList
        Insert: EmailListCreate
        Update: EmailListUpdate
      }
      email_subscribers: {
        Row: EmailSubscriber
        Insert: EmailSubscriberCreate
        Update: EmailSubscriberUpdate
      }
      social_posts: {
        Row: SocialPost
        Insert: SocialPostCreate
        Update: SocialPostUpdate
      }
      authors: {
        Row: Author
        Insert: AuthorCreate
        Update: AuthorUpdate
      }
      wp_connections: {
        Row: WPConnection
        Insert: WPConnectionCreate
        Update: WPConnectionUpdate
      }
      article_costs: {
        Row: ArticleCost
        Insert: ArticleCostCreate
        Update: ArticleCostUpdate
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Export common types for convenience
export type DatabaseUser = Database['public']['Tables']['users']['Row']
export type DatabaseArticle = Database['public']['Tables']['articles']['Row']
export type DatabaseClaim = Database['public']['Tables']['claims']['Row']
export type DatabaseCompanyProfile = Database['public']['Tables']['company_profiles']['Row']
export type DatabaseEmailCampaign = Database['public']['Tables']['email_campaigns']['Row']
export type DatabaseEmailTemplate = Database['public']['Tables']['email_templates']['Row']
export type DatabaseEmailList = Database['public']['Tables']['email_lists']['Row']
export type DatabaseEmailSubscriber = Database['public']['Tables']['email_subscribers']['Row']
export type DatabaseSocialPost = Database['public']['Tables']['social_posts']['Row']
export type DatabaseAuthor = Database['public']['Tables']['authors']['Row']
export type DatabaseWPConnection = Database['public']['Tables']['wp_connections']['Row']
export type DatabaseArticleCost = Database['public']['Tables']['article_costs']['Row']

// Insert types
export type DatabaseUserInsert = Database['public']['Tables']['users']['Insert']
export type DatabaseArticleInsert = Database['public']['Tables']['articles']['Insert']
export type DatabaseClaimInsert = Database['public']['Tables']['claims']['Insert']
export type DatabaseCompanyProfileInsert = Database['public']['Tables']['company_profiles']['Insert']
export type DatabaseEmailCampaignInsert = Database['public']['Tables']['email_campaigns']['Insert']
export type DatabaseEmailTemplateInsert = Database['public']['Tables']['email_templates']['Insert']
export type DatabaseEmailListInsert = Database['public']['Tables']['email_lists']['Insert']
export type DatabaseEmailSubscriberInsert = Database['public']['Tables']['email_subscribers']['Insert']
export type DatabaseSocialPostInsert = Database['public']['Tables']['social_posts']['Insert']
export type DatabaseAuthorInsert = Database['public']['Tables']['authors']['Insert']
export type DatabaseWPConnectionInsert = Database['public']['Tables']['wp_connections']['Insert']
export type DatabaseArticleCostInsert = Database['public']['Tables']['article_costs']['Insert']

// Update types
export type DatabaseUserUpdate = Database['public']['Tables']['users']['Update']
export type DatabaseArticleUpdate = Database['public']['Tables']['articles']['Update']
export type DatabaseClaimUpdate = Database['public']['Tables']['claims']['Update']
export type DatabaseCompanyProfileUpdate = Database['public']['Tables']['company_profiles']['Update']
export type DatabaseEmailCampaignUpdate = Database['public']['Tables']['email_campaigns']['Update']
export type DatabaseEmailTemplateUpdate = Database['public']['Tables']['email_templates']['Update']
export type DatabaseEmailListUpdate = Database['public']['Tables']['email_lists']['Update']
export type DatabaseEmailSubscriberUpdate = Database['public']['Tables']['email_subscribers']['Update']
export type DatabaseSocialPostUpdate = Database['public']['Tables']['social_posts']['Update']
export type DatabaseAuthorUpdate = Database['public']['Tables']['authors']['Update']
export type DatabaseWPConnectionUpdate = Database['public']['Tables']['wp_connections']['Update']
export type DatabaseArticleCostUpdate = Database['public']['Tables']['article_costs']['Update']

// Union types for status fields
export type ArticleStatus = 'draft' | 'reviewing' | 'approved' | 'published'
export type ClaimStatus = boolean
export type EmailCampaignStatus = 'draft' | 'scheduled' | 'running' | 'completed' | 'paused'
export type EmailScheduleType = 'immediate' | 'scheduled' | 'recurring'
export type EmailSubscriberStatus = 'active' | 'unsubscribed' | 'bounced'
export type SocialPostStatus = 'draft' | 'scheduled' | 'posted' | 'failed'
export type SocialPlatform = 'linkedin' | 'twitter' | 'facebook'
export type EmailTemplateCategory = 'welcome' | 'newsletter' | 'promotion' | 'notification' | 'custom'
export type ClaimType = 'statistic' | 'fact' | 'entity' | 'quote'

// Utility types for JSON field handling
export type JsonArray<T> = string // JSON string representation of array
export type JsonObject<T = any> = string // JSON string representation of object

// Helper functions to handle JSON string fields
export const parseJsonField = <T = any>(jsonString: string | null | undefined): T | null => {
  if (!jsonString) return null
  try {
    return JSON.parse(jsonString)
  } catch {
    return null
  }
}

export const stringifyJsonField = (value: any): string => {
  return JSON.stringify(value)
}

// Common field types
export type PrismaDateTime = string // ISO string
export type PrismaCuid = string
export type PrismaFloat = number
export type PrismaInt = number
export type PrismaBoolean = boolean