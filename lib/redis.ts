import Redis from 'ioredis'

// Redis configuration with fallback for development
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: 3,
  retryDelayOnFailover: 100,
  enableReadyCheck: true,
  lazyConnect: true,
}

class RedisClient {
  private static instance: Redis | null = null
  private static isConnected = false

  static getInstance(): Redis {
    if (!this.instance) {
      this.instance = new Redis(redisConfig)
      
      this.instance.on('connect', () => {
        this.isConnected = true
        console.log('✅ Redis connected')
      })

      this.instance.on('error', (err) => {
        console.error('❌ Redis error:', err.message)
        this.isConnected = false
      })

      this.instance.on('close', () => {
        this.isConnected = false
      })
    }
    return this.instance
  }

  static async connect(): Promise<boolean> {
    try {
      const client = this.getInstance()
      await client.connect()
      return true
    } catch {
      console.warn('Redis connection failed, using fallback cache')
      return false
    }
  }

  static getConnectionStatus(): boolean {
    return this.isConnected
  }
}

export const redis = RedisClient.getInstance()

// Cache utilities with TTL (Time To Live)
export const cache = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redis.get(key)
      return data ? JSON.parse(data) : null
    } catch {
      return null
    }
  },

  async set(key: string, value: unknown, ttlSeconds = 3600): Promise<boolean> {
    try {
      await redis.setex(key, ttlSeconds, JSON.stringify(value))
      return true
    } catch {
      return false
    }
  },

  async del(key: string): Promise<boolean> {
    try {
      await redis.del(key)
      return true
    } catch {
      return false
    }
  },

  async invalidatePattern(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(pattern)
      if (keys.length > 0) {
        await redis.del(...keys)
      }
    } catch {
      console.error('Failed to invalidate cache pattern:', pattern)
    }
  },

  // Cache-aside pattern helper
  async getOrSet<T>(
    key: string, 
    fetcher: () => Promise<T>, 
    ttlSeconds = 3600
  ): Promise<T> {
    const cached = await this.get<T>(key)
    if (cached !== null) {
      return cached
    }
    
    const fresh = await fetcher()
    await this.set(key, fresh, ttlSeconds)
    return fresh
  }
}

// Rate limiting using Redis
export const rateLimiter = {
  async checkLimit(
    key: string, 
    maxRequests: number, 
    windowSeconds: number
  ): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
    const now = Date.now()
    const windowKey = `ratelimit:${key}:${Math.floor(now / (windowSeconds * 1000))}`
    
    try {
      const count = await redis.incr(windowKey)
      
      if (count === 1) {
        await redis.expire(windowKey, windowSeconds)
      }
      
      const allowed = count <= maxRequests
      const remaining = Math.max(0, maxRequests - count)
      const resetAt = Math.ceil(now / (windowSeconds * 1000)) * windowSeconds * 1000
      
      return { allowed, remaining, resetAt }
    } catch {
      // Fallback: allow request if Redis fails
      return { allowed: true, remaining: maxRequests, resetAt: now + windowSeconds * 1000 }
    }
  }
}

export default redis
