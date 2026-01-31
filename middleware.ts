import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// ==================== ROUTE CONFIGURATION ====================

const PROTECTED_ROUTES = ["/dashboard", "/settings", "/profile"]
const AUTH_ROUTES = ["/login", "/signup", "/forgot-password"]
const ADMIN_ROUTES = ["/admin"]
const API_AUTH_ROUTES = ["/api/tasks", "/api/user", "/api/focus-sessions"]

// ==================== RATE LIMITING (In-Memory for Edge) ====================

const rateLimitMap = new Map<string, { count: number; timestamp: number }>()
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const MAX_REQUESTS = 100 // requests per window

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(ip)

  if (!record || now - record.timestamp > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(ip, { count: 1, timestamp: now })
    return true
  }

  if (record.count >= MAX_REQUESTS) {
    return false
  }

  record.count++
  return true
}

// ==================== MIDDLEWARE FUNCTION ====================

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const authToken = request.cookies.get("auth-token")

  // Get client IP for rate limiting
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || 
             request.headers.get("x-real-ip") || 
             "unknown"

  // ==================== RATE LIMITING ====================
  if (pathname.startsWith("/api/")) {
    if (!checkRateLimit(ip)) {
      return new NextResponse(
        JSON.stringify({ error: "Too many requests" }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": "60",
          },
        }
      )
    }
  }

  // ==================== PROTECTED ROUTES ====================
  const isProtectedRoute = PROTECTED_ROUTES.some((route) => 
    pathname.startsWith(route)
  )

  if (isProtectedRoute && !authToken) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // ==================== AUTH ROUTES ====================
  const isAuthRoute = AUTH_ROUTES.includes(pathname)

  if (isAuthRoute && authToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // ==================== ADMIN ROUTES ====================
  const isAdminRoute = ADMIN_ROUTES.some((route) => 
    pathname.startsWith(route)
  )

  if (isAdminRoute) {
    // Check if user is admin (simplified - in production, decode JWT)
    if (!authToken) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
    // Additional admin check would go here
  }

  // ==================== API AUTHENTICATION ====================
  const isProtectedAPI = API_AUTH_ROUTES.some((route) => 
    pathname.startsWith(route)
  )

  if (isProtectedAPI && !authToken) {
    return new NextResponse(
      JSON.stringify({ error: "Unauthorized" }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    )
  }

  // ==================== ADD SECURITY HEADERS ====================
  const response = NextResponse.next()

  // Add request ID for tracing
  const requestId = crypto.randomUUID()
  response.headers.set("X-Request-ID", requestId)

  // Security headers (additional to next.config.mjs)
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("X-Frame-Options", "DENY")
  
  return response
}

// ==================== MATCHER CONFIGURATION ====================

export const config = {
  matcher: [
    // Protected routes
    "/dashboard/:path*",
    "/settings/:path*",
    "/profile/:path*",
    "/admin/:path*",
    
    // Auth routes
    "/login",
    "/signup",
    "/forgot-password",
    
    // API routes (for rate limiting and auth)
    "/api/:path*",
  ],
}
