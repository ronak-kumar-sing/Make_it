import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { cache } from './redis'

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'
const JWT_EXPIRES_IN = '7d'
const SALT_ROUNDS = 12

// ==================== PASSWORD HASHING ====================

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// ==================== JWT TOKEN MANAGEMENT ====================

export interface TokenPayload {
  userId: string
  email: string
  role: string
  iat?: number
  exp?: number
}

export function generateToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload
  } catch {
    return null
  }
}

export async function getSession(): Promise<TokenPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')?.value
  
  if (!token) return null
  
  // Check if token is blacklisted
  const isBlacklisted = await cache.get(`blacklist:${token}`)
  if (isBlacklisted) return null
  
  return verifyToken(token)
}

export async function setAuthCookie(token: string, remember = false): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: remember ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7, // 30 days or 7 days
    path: '/',
  })
}

export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')?.value
  
  // Blacklist the token
  if (token) {
    const decoded = verifyToken(token)
    if (decoded?.exp) {
      const ttl = decoded.exp - Math.floor(Date.now() / 1000)
      if (ttl > 0) {
        await cache.set(`blacklist:${token}`, true, ttl)
      }
    }
  }
  
  cookieStore.delete('auth-token')
}

// ==================== INPUT SANITIZATION ====================

export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
}

export function sanitizeHtml(html: string): string {
  const allowedTags = ['p', 'br', 'b', 'i', 'u', 'strong', 'em', 'ul', 'ol', 'li', 'a']
  const tagRegex = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi
  
  return html.replace(tagRegex, (match, tag) => {
    return allowedTags.includes(tag.toLowerCase()) ? match : ''
  })
}

// ==================== CSRF PROTECTION ====================

export function generateCSRFToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

export async function validateCSRFToken(token: string): Promise<boolean> {
  const cookieStore = await cookies()
  const storedToken = cookieStore.get('csrf-token')?.value
  return token === storedToken
}

// ==================== SECURITY HEADERS ====================

export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self' https://api.openai.com",
    "frame-ancestors 'none'",
  ].join('; '),
}

// ==================== RATE LIMITING CONFIG ====================

export const rateLimitConfig = {
  // General API rate limiting
  api: {
    points: 100,
    duration: 60, // per minute
  },
  // Auth endpoints (more restrictive)
  auth: {
    points: 5,
    duration: 60, // 5 attempts per minute
  },
  // AI endpoints (most restrictive due to cost)
  ai: {
    points: 20,
    duration: 60, // 20 requests per minute
  },
}
