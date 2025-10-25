/**
 * Generated Supabase Types
 * This file contains type definitions for Supabase database schema
 */

export interface Database {
  public: {
    Tables: {
      // Add your table definitions here
      users: {
        Row: {
          id: string;
          email: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      articles: {
        Row: {
          id: string;
          title: string;
          content: string;
          status: 'draft' | 'published' | 'archived';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          status?: 'draft' | 'published' | 'archived';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          status?: 'draft' | 'published' | 'archived';
          created_at?: string;
          updated_at?: string;
        };
      };
      campaigns: {
        Row: {
          id: string;
          name: string;
          status: 'active' | 'inactive' | 'completed';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          status?: 'active' | 'inactive' | 'completed';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          status?: 'active' | 'inactive' | 'completed';
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Export common types
export type User = Database['public']['Tables']['users']['Row'];
export type Article = Database['public']['Tables']['articles']['Row'];
export type Campaign = Database['public']['Tables']['campaigns']['Row'];

// Insert types
export type UserInsert = Database['public']['Tables']['users']['Insert'];
export type ArticleInsert = Database['public']['Tables']['articles']['Insert'];
export type CampaignInsert = Database['public']['Tables']['campaigns']['Insert'];

// Update types
export type UserUpdate = Database['public']['Tables']['users']['Update'];
export type ArticleUpdate = Database['public']['Tables']['articles']['Update'];
export type CampaignUpdate = Database['public']['Tables']['campaigns']['Update'];

// Union types for status fields
export type ArticleStatus = 'draft' | 'published' | 'archived';
export type CampaignStatus = 'active' | 'inactive' | 'completed';