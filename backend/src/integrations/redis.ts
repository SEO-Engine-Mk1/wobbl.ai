/**
 * Redis Integration Configuration
 * Handles Redis caching and session management
 */

import Redis from 'ioredis';

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
  keyPrefix?: string;
  retryDelayOnFailover?: number;
  maxRetriesPerRequest?: number;
  lazyConnect?: boolean;
  keepAlive?: number;
  family?: 4 | 6;
}

export interface RedisCacheOptions {
  ttl?: number; // Time to live in seconds
  prefix?: string;
  compress?: boolean;
}

class RedisIntegration {
  private client: Redis;
  private config: RedisConfig;

  constructor(config: RedisConfig) {
    this.config = config;
    this.client = new Redis({
      host: config.host,
      port: config.port,
      password: config.password,
      db: config.db || 0,
      keyPrefix: config.keyPrefix,
      maxRetriesPerRequest: config.maxRetriesPerRequest || 3,
      lazyConnect: config.lazyConnect || true,
      keepAlive: config.keepAlive || 30000,
      family: config.family || 4,
    });
  }

  // Connection management
  async connect(): Promise<void> {
    await this.client.connect();
  }

  async disconnect(): Promise<void> {
    await this.client.disconnect();
  }

  async ping(): Promise<string> {
    return this.client.ping();
  }

  // Basic operations
  async set(key: string, value: any, options?: RedisCacheOptions): Promise<void> {
    const serializedValue = JSON.stringify(value);
    const finalKey = options?.prefix ? `${options.prefix}:${key}` : key;
    
    if (options?.ttl) {
      await this.client.setex(finalKey, options.ttl, serializedValue);
    } else {
      await this.client.set(finalKey, serializedValue);
    }
  }

  async get<T = any>(key: string, options?: { prefix?: string }): Promise<T | null> {
    const finalKey = options?.prefix ? `${options.prefix}:${key}` : key;
    const value = await this.client.get(finalKey);
    
    if (value === null) {
      return null;
    }
    
    try {
      return JSON.parse(value);
    } catch {
      return value as T;
    }
  }

  async del(key: string, options?: { prefix?: string }): Promise<number> {
    const finalKey = options?.prefix ? `${options.prefix}:${key}` : key;
    return this.client.del(finalKey);
  }

  async exists(key: string, options?: { prefix?: string }): Promise<boolean> {
    const finalKey = options?.prefix ? `${options.prefix}:${key}` : key;
    const result = await this.client.exists(finalKey);
    return result === 1;
  }

  async expire(key: string, ttl: number, options?: { prefix?: string }): Promise<boolean> {
    const finalKey = options?.prefix ? `${options.prefix}:${key}` : key;
    const result = await this.client.expire(finalKey, ttl);
    return result === 1;
  }

  async ttl(key: string, options?: { prefix?: string }): Promise<number> {
    const finalKey = options?.prefix ? `${options.prefix}:${key}` : key;
    return this.client.ttl(finalKey);
  }

  // Hash operations
  async hset(key: string, field: string, value: any, options?: { prefix?: string }): Promise<number> {
    const finalKey = options?.prefix ? `${options.prefix}:${key}` : key;
    const serializedValue = JSON.stringify(value);
    return this.client.hset(finalKey, field, serializedValue);
  }

  async hget<T = any>(key: string, field: string, options?: { prefix?: string }): Promise<T | null> {
    const finalKey = options?.prefix ? `${options.prefix}:${key}` : key;
    const value = await this.client.hget(finalKey, field);
    
    if (value === null) {
      return null;
    }
    
    try {
      return JSON.parse(value);
    } catch {
      return value as T;
    }
  }

  async hgetall<T = any>(key: string, options?: { prefix?: string }): Promise<Record<string, T>> {
    const finalKey = options?.prefix ? `${options.prefix}:${key}` : key;
    const hash = await this.client.hgetall(finalKey);
    
    const result: Record<string, T> = {};
    for (const [field, value] of Object.entries(hash)) {
      try {
        result[field] = JSON.parse(value);
      } catch {
        result[field] = value as T;
      }
    }
    
    return result;
  }

  async hdel(key: string, field: string, options?: { prefix?: string }): Promise<number> {
    const finalKey = options?.prefix ? `${options.prefix}:${key}` : key;
    return this.client.hdel(finalKey, field);
  }

  async hexists(key: string, field: string, options?: { prefix?: string }): Promise<boolean> {
    const finalKey = options?.prefix ? `${options.prefix}:${key}` : key;
    const result = await this.client.hexists(finalKey, field);
    return result === 1;
  }

  // List operations
  async lpush(key: string, ...values: any[]): Promise<number> {
    const serializedValues = values.map(v => JSON.stringify(v));
    return this.client.lpush(key, ...serializedValues);
  }

  async rpush(key: string, ...values: any[]): Promise<number> {
    const serializedValues = values.map(v => JSON.stringify(v));
    return this.client.rpush(key, ...serializedValues);
  }

  async lpop<T = any>(key: string): Promise<T | null> {
    const value = await this.client.lpop(key);
    if (value === null) return null;
    
    try {
      return JSON.parse(value);
    } catch {
      return value as T;
    }
  }

  async rpop<T = any>(key: string): Promise<T | null> {
    const value = await this.client.rpop(key);
    if (value === null) return null;
    
    try {
      return JSON.parse(value);
    } catch {
      return value as T;
    }
  }

  async lrange<T = any>(key: string, start: number, stop: number): Promise<T[]> {
    const values = await this.client.lrange(key, start, stop);
    return values.map(v => {
      try {
        return JSON.parse(v);
      } catch {
        return v as T;
      }
    });
  }

  async llen(key: string): Promise<number> {
    return this.client.llen(key);
  }

  // Set operations
  async sadd(key: string, ...members: any[]): Promise<number> {
    const serializedMembers = members.map(m => JSON.stringify(m));
    return this.client.sadd(key, ...serializedMembers);
  }

  async srem(key: string, ...members: any[]): Promise<number> {
    const serializedMembers = members.map(m => JSON.stringify(m));
    return this.client.srem(key, ...serializedMembers);
  }

  async smembers<T = any>(key: string): Promise<T[]> {
    const members = await this.client.smembers(key);
    return members.map(m => {
      try {
        return JSON.parse(m);
      } catch {
        return m as T;
      }
    });
  }

  async sismember(key: string, member: any): Promise<boolean> {
    const serializedMember = JSON.stringify(member);
    const result = await this.client.sismember(key, serializedMember);
    return result === 1;
  }

  async scard(key: string): Promise<number> {
    return this.client.scard(key);
  }

  // Sorted set operations
  async zadd(key: string, score: number, member: any): Promise<number> {
    const serializedMember = JSON.stringify(member);
    return this.client.zadd(key, score, serializedMember);
  }

  async zrem(key: string, ...members: any[]): Promise<number> {
    const serializedMembers = members.map(m => JSON.stringify(m));
    return this.client.zrem(key, ...serializedMembers);
  }

  async zrange<T = any>(key: string, start: number, stop: number, options?: { rev?: boolean }): Promise<T[]> {
    const args = options?.rev ? ['REV'] : [];
    const members = await this.client.zrange(key, start, stop, ...args);
    return members.map((m: string) => {
      try {
        return JSON.parse(m);
      } catch {
        return m as T;
      }
    });
  }

  async zscore(key: string, member: any): Promise<number | null> {
    const serializedMember = JSON.stringify(member);
    const score = await this.client.zscore(key, serializedMember);
    return score ? parseFloat(score) : null;
  }

  async zcard(key: string): Promise<number> {
    return this.client.zcard(key);
  }

  // Pub/Sub operations
  async publish(channel: string, message: any): Promise<number> {
    const serializedMessage = JSON.stringify(message);
    return this.client.publish(channel, serializedMessage);
  }

  subscribe(channel: string, callback: (channel: string, message: any) => void): void {
    const subscriber = this.client.duplicate();
    subscriber.subscribe(channel);
    subscriber.on('message', (ch, message) => {
      try {
        const parsedMessage = JSON.parse(message);
        callback(ch, parsedMessage);
      } catch {
        callback(ch, message);
      }
    });
  }

  unsubscribe(channel: string): void {
    const subscriber = this.client.duplicate();
    subscriber.unsubscribe(channel);
  }

  // Cache utilities
  async cache<T = any>(
    key: string,
    fetcher: () => Promise<T>,
    options?: RedisCacheOptions & { prefix?: string }
  ): Promise<T> {
    const finalKey = options?.prefix ? `${options.prefix}:${key}` : key;
    
    // Try to get from cache first
    const cached = await this.get<T>(finalKey);
    if (cached !== null) {
      return cached;
    }
    
    // Fetch fresh data
    const data = await fetcher();
    
    // Store in cache
    await this.set(finalKey, data, options);
    
    return data;
  }

  async invalidatePattern(pattern: string, options?: { prefix?: string }): Promise<number> {
    const finalPattern = options?.prefix ? `${options.prefix}:${pattern}` : pattern;
    const keys = await this.client.keys(finalPattern);
    
    if (keys.length === 0) {
      return 0;
    }
    
    return this.client.del(...keys);
  }

  // Session management
  async setSession(sessionId: string, data: any, ttl: number = 86400): Promise<void> {
    await this.set(`session:${sessionId}`, data, { ttl });
  }

  async getSession<T = any>(sessionId: string): Promise<T | null> {
    return this.get<T>(`session:${sessionId}`);
  }

  async deleteSession(sessionId: string): Promise<number> {
    return this.del(`session:${sessionId}`);
  }

  // Rate limiting
  async checkRateLimit(
    identifier: string,
    limit: number,
    window: number,
    options?: { prefix?: string }
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const finalKey = options?.prefix ? `${options.prefix}:rate_limit:${identifier}` : `rate_limit:${identifier}`;
    const now = Date.now();
    const windowStart = now - (window * 1000);
    
    // Remove old entries
    await this.client.zremrangebyscore(finalKey, 0, windowStart);
    
    // Get current count
    const current = await this.client.zcard(finalKey);
    
    if (current >= limit) {
      // Get reset time (oldest entry)
      const oldest = await this.client.zrange(finalKey, 0, 0, 'WITHSCORES');
      const resetTime = oldest.length > 0 ? parseInt(oldest[1]) + window : now + window;
      
      return {
        allowed: false,
        remaining: 0,
        resetTime,
      };
    }
    
    // Add current request
    await this.client.zadd(finalKey, now, `${now}-${Math.random()}`);
    await this.client.expire(finalKey, window);
    
    return {
      allowed: true,
      remaining: limit - current - 1,
      resetTime: now + window,
    };
  }

  // Health check
  async healthCheck(): Promise<{ status: string; latency: number; memory: string }> {
    const start = Date.now();
    try {
      await this.ping();
      const info = await this.client.info('memory');
      const latency = Date.now() - start;
      
      // Parse memory usage
      const memoryMatch = info.match(/used_memory_human:(.+)/);
      const memory = memoryMatch ? memoryMatch[1].trim() : 'unknown';
      
      return {
        status: 'healthy',
        latency,
        memory,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        latency: Date.now() - start,
        memory: 'unknown',
      };
    }
  }
}

export default RedisIntegration;

// Utility functions
export function createRedisClient(config: RedisConfig): RedisIntegration {
  return new RedisIntegration(config);
}

export function validateRedisConfig(config: RedisConfig): boolean {
  return !!(config.host && config.port);
}

export function getRedisConfigFromEnv(): RedisConfig | null {
  const host = process.env.REDIS_HOST;
  const port = process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : undefined;
  const password = process.env.REDIS_PASSWORD;
  const db = process.env.REDIS_DB ? parseInt(process.env.REDIS_DB) : undefined;

  if (!host || !port) {
    return null;
  }

  return {
    host,
    port,
    password,
    db,
    keyPrefix: process.env.REDIS_KEY_PREFIX,
  };
}