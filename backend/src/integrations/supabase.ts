/**
 * Supabase Integration Configuration
 * Handles Supabase database, auth, and storage integration
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../lib/supabase.types';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  serviceRoleKey?: string;
  options?: {
    auth?: {
      autoRefreshToken?: boolean;
      persistSession?: boolean;
      detectSessionInUrl?: boolean;
    };
    db?: {
      schema?: string;
    };
    realtime?: {
      params?: Record<string, string>;
    };
  };
}

export interface SupabaseTable<T = any> {
  select(columns?: string): Promise<{ data: T[] | null; error: any }>;
  insert(data: Partial<T>): Promise<{ data: T | null; error: any }>;
  update(data: Partial<T>): Promise<{ data: T | null; error: any }>;
  delete(): Promise<{ data: T | null; error: any }>;
  eq(column: keyof T, value: any): Promise<{ data: T[] | null; error: any }>;
  neq(column: keyof T, value: any): Promise<{ data: T[] | null; error: any }>;
  gt(column: keyof T, value: any): Promise<{ data: T[] | null; error: any }>;
  gte(column: keyof T, value: any): Promise<{ data: T[] | null; error: any }>;
  lt(column: keyof T, value: any): Promise<{ data: T[] | null; error: any }>;
  lte(column: keyof T, value: any): Promise<{ data: T[] | null; error: any }>;
  like(column: keyof T, pattern: string): Promise<{ data: T[] | null; error: any }>;
  ilike(column: keyof T, pattern: string): Promise<{ data: T[] | null; error: any }>;
  in(column: keyof T, values: any[]): Promise<{ data: T[] | null; error: any }>;
  order(column: keyof T, ascending?: boolean): Promise<{ data: T[] | null; error: any }>;
  limit(count: number): Promise<{ data: T[] | null; error: any }>;
  range(from: number, to: number): Promise<{ data: T[] | null; error: any }>;
  single(): Promise<{ data: T | null; error: any }>;
  maybeSingle(): Promise<{ data: T | null; error: any }>;
}

export interface SupabaseAuth {
  signUp(email: string, password: string, options?: { data?: any }): Promise<{ user: any; session: any; error: any }>;
  signIn(email: string, password: string): Promise<{ user: any; session: any; error: any }>;
  signInWithOAuth(provider: 'google' | 'github' | 'gitlab' | 'bitbucket', options?: { redirectTo?: string }): Promise<{ user: any; session: any; error: any }>;
  signOut(): Promise<{ error: any }>;
  getCurrentUser(): Promise<{ user: any; error: any }>;
  updateUser(attributes: any): Promise<{ user: any; error: any }>;
  resetPassword(email: string): Promise<{ error: any }>;
  onAuthStateChange(callback: (event: string, session: any) => void): { data: { subscription: any } };
}

export interface SupabaseStorage {
  upload(bucket: string, path: string, file: File | ArrayBuffer, options?: { upsert?: boolean; contentType?: string }): Promise<{ data: any; error: any }>;
  download(bucket: string, path: string): Promise<{ data: Blob; error: any }>;
  getPublicUrl(bucket: string, path: string): { data: { publicUrl: string } };
  list(bucket: string, path?: string, options?: { limit?: number; offset?: number }): Promise<{ data: any[]; error: any }>;
  remove(bucket: string, paths: string[]): Promise<{ data: any[]; error: any }>;
  createBucket(bucket: string, options?: { public?: boolean }): Promise<{ data: any; error: any }>;
  deleteBucket(bucket: string): Promise<{ data: any; error: any }>;
}

export interface SupabaseRealtime {
  subscribe(channel: string, callback: (payload: any) => void): { unsubscribe: () => void };
  unsubscribe(channel: string): void;
}

class SupabaseIntegration {
  // TODO: Use config parameter or remove if unused
  private _config: SupabaseConfig;
  private client: SupabaseClient<Database>;
  private serviceClient: SupabaseClient<Database> | null = null;

  constructor(config: SupabaseConfig) {
    this._config = config;
    const clientOptions = {
      ...config.options,
      db: {
        schema: (config.options?.db?.schema as 'public') || 'public'
      }
    };
    this.client = createClient(config.url, config.anonKey, clientOptions);
    
    if (config.serviceRoleKey) {
      // TODO: Use serviceClient or remove if unused
      this.serviceClient = createClient(config.url, config.serviceRoleKey, {
        ...clientOptions,
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });
    }
  }

  // Database Operations
  async getTable<T = any>(tableName: string): Promise<SupabaseTable<T>> {
    const table = (this.client.from(tableName) as any);
    
    return {
      select: async (columns?: string) => {
        const result = await table.select(columns);
        return { data: result.data, error: result.error };
      },
      insert: async (data: Partial<T>) => {
        const result = await table.insert(data as any);
        return { data: result.data, error: result.error };
      },
      update: async (data: Partial<T>) => {
        const result = await table.update(data as any);
        return { data: result.data, error: result.error };
      },
      delete: async () => {
        const result = await table.delete();
        return { data: result.data, error: result.error };
      },
      eq: async (column: keyof T, value: any) => {
        const result = await table.eq(column as string, value);
        return { data: result.data, error: result.error };
      },
      neq: async (column: keyof T, value: any) => {
        const result = await table.neq(column as string, value);
        return { data: result.data, error: result.error };
      },
      gt: async (column: keyof T, value: any) => {
        const result = await table.gt(column as string, value);
        return { data: result.data, error: result.error };
      },
      gte: async (column: keyof T, value: any) => {
        const result = await table.gte(column as string, value);
        return { data: result.data, error: result.error };
      },
      lt: async (column: keyof T, value: any) => {
        const result = await table.lt(column as string, value);
        return { data: result.data, error: result.error };
      },
      lte: async (column: keyof T, value: any) => {
        const result = await table.lte(column as string, value);
        return { data: result.data, error: result.error };
      },
      like: async (column: keyof T, pattern: string) => {
        const result = await table.like(column as string, pattern);
        return { data: result.data, error: result.error };
      },
      ilike: async (column: keyof T, pattern: string) => {
        const result = await table.ilike(column as string, pattern);
        return { data: result.data, error: result.error };
      },
      in: async (column: keyof T, values: any[]) => {
        const result = await table.in(column as string, values);
        return { data: result.data, error: result.error };
      },
      order: async (column: keyof T, ascending = true) => {
        const result = await table.order(column as string, { ascending });
        return { data: result.data, error: result.error };
      },
      limit: async (count: number) => {
        const result = await table.limit(count);
        return { data: result.data, error: result.error };
      },
      range: async (from: number, to: number) => {
        const result = await table.range(from, to);
        return { data: result.data, error: result.error };
      },
      single: async () => {
        const result = await table.single();
        return { data: result.data, error: result.error };
      },
      maybeSingle: async () => {
        const result = await table.maybeSingle();
        return { data: result.data, error: result.error };
      },
    };
  }

  // Database Functions
  async rpc(functionName: string, params?: any): Promise<{ data: any; error: any }> {
    return this.client.rpc(functionName, params as any);
  }

  // Raw SQL
  async sql(query: string, params?: any[]): Promise<{ data: any; error: any }> {
    const { data, error } = await this.client.rpc('execute_sql', {
      query,
      params,
    } as any);
    return { data, error };
  }

  // Health check
  async healthCheck(): Promise<{ status: string; latency: number }> {
    const start = Date.now();
    try {
      await this.client.from('_health').select('*').limit(1);
      return {
        status: 'healthy',
        latency: Date.now() - start,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        latency: Date.now() - start,
      };
    }
  }
}

export default SupabaseIntegration;

export function createSupabaseClient(config: SupabaseConfig): SupabaseIntegration {
  return new SupabaseIntegration(config);
}

export function validateSupabaseConfig(config: SupabaseConfig): boolean {
  return !!(config.url && config.anonKey);
}

export function getSupabaseConfigFromEnv(): SupabaseConfig | null {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !anonKey) {
    return null;
  }

  return {
    url,
    anonKey,
    serviceRoleKey,
    options: {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
      db: {
        schema: 'public'
      }
    },
  };
}

// Type helpers
export function createTableType<T>(schema: Record<string, any>): T {
  return schema as T;
}

export function createDatabaseSchema(schemas: Record<string, any>) {
  return schemas;
}