// Enhanced middleware.ts with rate limiting
import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import { adminRateLimit, apiRateLimit, authRateLimit } from "./middleware/rate-limit"

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl

    // Apply rate limiting
    let rateLimiter
    if (pathname.startsWith('/api/auth/')) {
      rateLimiter = authRateLimit
    } else if (pathname.startsWith('/api/admin/')) {
      rateLimiter = adminRateLimit
    } else if (pathname.startsWith('/api/')) {
      rateLimiter = apiRateLimit
    }

    if (rateLimiter && !rateLimiter.isAllowed(req)) {
      return new NextResponse('Too Many Requests', { 
        status: 429,
        headers: {
          'Retry-After': '60'
        }
      })
    }

    // Security headers
    const response = NextResponse.next()
    
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    response.headers.set('X-XSS-Protection', '1; mode=block')
    
    if (process.env.NODE_ENV === 'production') {
      response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
    }

    return response
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        
        // Admin routes protection
        if (pathname.startsWith('/admin')) {
          return token?.role === 'ADMIN' || token?.role === 'SUPER_ADMIN'
        }
        
        // Protected user routes
        if (pathname.startsWith('/profile') || pathname.startsWith('/orders')) {
          return !!token
        }
        
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    '/admin/:path*', 
    '/profile/:path*', 
    '/orders/:path*',
    '/api/admin/:path*',
    '/api/auth/:path*'
  ]
}