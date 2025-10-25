/**
 * Mock Services for Vercel Deployment
 * These stubs prevent deployment failures when external services are not configured
 */

export const mockDatabase = {
  // Mock user operations
  user: {
    findMany: async () => [],
    findUnique: async () => null,
    create: async (data: any) => ({ id: 'mock-id', ...data.data }),
    update: async (data: any) => ({ id: data.where.id, ...data.data }),
    delete: async () => ({ id: 'mock-id' }),
    count: async () => 0
  },
  
  // Mock article operations
  article: {
    findMany: async () => [],
    findUnique: async () => null,
    create: async (data: any) => ({ 
      id: 'mock-article-id', 
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data.data 
    }),
    update: async (data: any) => ({ 
      id: data.where.id, 
      updatedAt: new Date(),
      ...data.data 
    }),
    delete: async () => ({ id: 'mock-article-id' }),
    count: async () => 0
  },
  
  // Mock SERP analysis
  serpAnalysis: {
    create: async (data: any) => ({ 
      id: 'mock-serp-id', 
      ...data.data 
    }),
    findMany: async () => [],
    findUnique: async () => null
  },
  
  // Mock claims
  claim: {
    createMany: async () => ({ count: 0 }),
    findMany: async () => [],
    create: async (data: any) => ({ 
      id: 'mock-claim-id', 
      ...data.data 
    })
  },
  
  // Raw query mock
  $queryRaw: async () => [],
  
  // Disconnect mock
  $disconnect: async () => {},
  
  // Connect mock
  $connect: async () => {}
};

export const mockSupabase = {
  from: (table: string) => ({
    select: (columns?: string) => ({
      data: [],
      error: null,
      eq: () => ({ data: [], error: null }),
      neq: () => ({ data: [], error: null }),
      gt: () => ({ data: [], error: null }),
      gte: () => ({ data: [], error: null }),
      lt: () => ({ data: [], error: null }),
      lte: () => ({ data: [], error: null }),
      like: () => ({ data: [], error: null }),
      ilike: () => ({ data: [], error: null }),
      in: () => ({ data: [], error: null }),
      order: () => ({ data: [], error: null }),
      limit: () => ({ data: [], error: null }),
      range: () => ({ data: [], error: null }),
      single: () => ({ data: null, error: null }),
      maybeSingle: () => ({ data: null, error: null })
    }),
    insert: (data: any) => ({ data: Array.isArray(data) ? data : [data], error: null }),
    update: (data: any) => ({ data: [data], error: null }),
    delete: () => ({ data: [], error: null })
  }),
  
  auth: {
    signUp: async () => ({ user: null, session: null, error: null }),
    signInWithPassword: async () => ({ user: null, session: null, error: null }),
    signInWithOAuth: async () => ({ user: null, session: null, error: null }),
    signOut: async () => ({ error: null }),
    getUser: async () => ({ user: null, error: null }),
    updateUser: async () => ({ user: null, error: null }),
    resetPasswordForEmail: async () => ({ error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
  },
  
  storage: {
    from: (bucket: string) => ({
      upload: async () => ({ data: { path: 'mock-path' }, error: null }),
      download: async () => ({ data: new Blob(), error: null }),
      getPublicUrl: (path: string) => ({ data: { publicUrl: `https://mock-url.com/${path}` } }),
      list: async () => ({ data: [], error: null }),
      remove: async () => ({ data: [], error: null })
    })
  },
  
  functions: {
    invoke: async () => ({ data: null, error: null })
  }
};

export const mockRedis = {
  connect: async () => {},
  disconnect: async () => {},
  get: async () => null,
  set: async () => 'OK',
  del: async () => 1,
  exists: async () => 0,
  expire: async () => 1,
  keys: async () => [],
  flushall: async () => 'OK'
};

export const mockSendGrid = {
  send: async (msg: any) => ({
    statusCode: 202,
    body: '',
    headers: {}
  })
};

export const mockCloudinary = {
  uploader: {
    upload: async () => ({
      secure_url: 'https://mock-cloudinary.com/image.jpg',
      public_id: 'mock-public-id'
    }),
    destroy: async () => ({ result: 'ok' })
  },
  api: {
    create_folder: async () => ({ success: true }),
    delete_folder: async () => ({ success: true })
  }
};

export const mockZAI = {
  create: async () => ({
    chat: {
      completions: {
        create: async () => ({
          choices: [{
            message: {
              content: JSON.stringify({
                title: 'Mock Article Title',
                content: '<p>Mock article content for testing purposes.</p>',
                excerpt: 'Mock excerpt',
                metaDescription: 'Mock meta description',
                wordCount: 500,
                helpfulnessScore: 85,
                freshnessScore: 90,
                tableOfContents: [],
                faqSection: [],
                jsonLd: {}
              })
            }
          }]
        })
      }
    },
    functions: {
      invoke: async (functionName: string, params: any) => {
        if (functionName === 'web_search') {
          return [
            {
              url: 'https://example1.com',
              title: 'Mock Result 1',
              snippet: 'Mock snippet 1',
              host_name: 'example1.com'
            },
            {
              url: 'https://example2.com',
              title: 'Mock Result 2',
              snippet: 'Mock snippet 2',
              host_name: 'example2.com'
            }
          ];
        }
        return null;
      }
    }
  })
};

export const mockWordPress = {
  posts: {
    create: async () => ({ id: 123, status: 'publish' }),
    update: async () => ({ id: 123, status: 'publish' }),
    delete: async () => ({ id: 123, status: 'trash' })
  },
  categories: {
    create: async () => ({ id: 1, name: 'Mock Category' }),
    list: async () => [{ id: 1, name: 'Mock Category' }]
  },
  tags: {
    create: async () => ({ id: 1, name: 'Mock Tag' }),
    list: async () => [{ id: 1, name: 'Mock Tag' }]
  },
  media: {
    upload: async () => ({ id: 456, source_url: 'https://mock-wordpress.com/image.jpg' })
  }
};

export const mockVercel = {
  projects: {
    get: async () => ({
      id: 'mock-project-id',
      name: 'wobbl-ai',
      framework: 'nextjs'
    }),
    update: async () => ({ id: 'mock-project-id' })
  },
  deployments: {
    create: async () => ({
      id: 'mock-deployment-id',
      url: 'https://mock-deployment.vercel.app'
    }),
    get: async () => ({
      id: 'mock-deployment-id',
      url: 'https://mock-deployment.vercel.app',
      state: 'READY'
    })
  },
  aliases: {
    assign: async () => ({ uid: 'mock-alias-id' })
  }
};

/**
 * Environment-aware service getter
 * Returns mock services when environment variables are missing
 */
export async function getDatabaseService() {
  if (process.env.DATABASE_URL && process.env.DATABASE_URL !== 'mock') {
    try {
      // Try to import real Prisma client
      const { prisma } = await import('./db');
      return prisma;
    } catch (error) {
      console.warn('Failed to load Prisma, using mock database');
      return mockDatabase;
    }
  }
  return mockDatabase;
}

export async function getSupabaseService() {
  if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
    try {
      const { getSupabaseConfigFromEnv, createSupabaseClient } = await import('../integrations/supabase');
      const config = getSupabaseConfigFromEnv();
      if (config) {
        return createSupabaseClient(config);
      }
    } catch (error) {
      console.warn('Failed to load Supabase, using mock service');
    }
  }
  return mockSupabase;
}

export async function getRedisService() {
  if (process.env.REDIS_HOST && process.env.REDIS_HOST !== 'localhost') {
    try {
      const { getRedisConfigFromEnv, createRedisClient } = await import('../integrations/redis');
      const config = getRedisConfigFromEnv();
      if (config) {
        return createRedisClient(config);
      }
    } catch (error) {
      console.warn('Failed to load Redis, using mock service');
    }
  }
  return mockRedis;
}

export async function getZAIService() {
  if (process.env.ZAI_API_KEY && process.env.ZAI_API_KEY !== 'your-zai-api-key-here') {
    try {
      const ZAI = await import('z-ai-web-dev-sdk');
      return ZAI;
    } catch (error) {
      console.warn('Failed to load ZAI SDK, using mock service');
    }
  }
  return mockZAI;
}