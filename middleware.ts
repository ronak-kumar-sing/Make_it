import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Cache the protected routes and auth routes for better performance
const PROTECTED_ROUTES = ["/dashboard"]
const AUTH_ROUTES = ["/login", "/signup"]

export function middleware(request: NextRequest) {
  const authToken = request.cookies.get("auth-token")
  const { pathname } = request.nextUrl

  // Check if the current path is a protected route
  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route))

  // Check if the current path is an auth route
  const isAuthRoute = AUTH_ROUTES.includes(pathname)

  // Protected routes - redirect to login if not authenticated
  if (isProtectedRoute && !authToken) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Auth routes - redirect to dashboard if already authenticated
  if (isAuthRoute && authToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Match all protected routes
    "/dashboard/:path*",
    // Match all auth routes
    "/login",
    "/signup",
  ],
}
