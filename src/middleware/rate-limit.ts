// middleware/rate-limit.ts
import { NextRequest } from 'next/server'

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

class RateLimiter {
  private store: RateLimitStore = {}
  private requests: number
  private windowMs: number

  constructor(requests: number, windowMs: number) {
    this.requests = requests
    this.windowMs = windowMs

    // Clean up old entries every 10 minutes
    setInterval(() => {
      const now = Date.now()
      Object.keys(this.store).forEach(key => {
        if (this.store[key].resetTime < now) {
          delete this.store[key]
        }
      })
    }, 10 * 60 * 1000)
  }

  isAllowed(req: NextRequest): boolean {
    const ip = req.ip || req.headers.get('x-forwarded-for') || 'anonymous'
    const now = Date.now()
    
    if (!this.store[ip]) {
      this.store[ip] = {
        count: 1,
        resetTime: now + this.windowMs
      }
      return true
    }

    if (now > this.store[ip].resetTime) {
      this.store[ip] = {
        count: 1,
        resetTime: now + this.windowMs
      }
      return true
    }

    if (this.store[ip].count >= this.requests) {
      return false
    }

    this.store[ip].count++
    return true
  }
}

// Rate limiters for different endpoints
export const authRateLimit = new RateLimiter(5, 15 * 60 * 1000) // 5 requests per 15 minutes
export const adminRateLimit = new RateLimiter(20, 60 * 1000) // 20 requests per minute
export const apiRateLimit = new RateLimiter(100, 60 * 1000) // 100 requests per minute