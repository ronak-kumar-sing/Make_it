import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import prisma from '@/lib/db'

export const runtime = 'nodejs'

// Health check endpoint for monitoring
export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  const checks = {
    status: 'healthy' as 'healthy' | 'unhealthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    uptime: process.uptime(),
    checks: {
      database: { status: 'unknown' as string, latency: 0 },
      memory: { status: 'unknown' as string, usage: {} as NodeJS.MemoryUsage },
    }
  }

  // Database check
  try {
    const dbStart = Date.now()
    await prisma.$queryRaw`SELECT 1`
    checks.checks.database = {
      status: 'healthy',
      latency: Date.now() - dbStart,
    }
  } catch {
    checks.checks.database = {
      status: 'unhealthy',
      latency: 0,
    }
    checks.status = 'unhealthy'
  }

  // Memory check
  const memoryUsage = process.memoryUsage()
  const heapUsedMB = memoryUsage.heapUsed / 1024 / 1024
  checks.checks.memory = {
    status: heapUsedMB < 512 ? 'healthy' : 'warning',
    usage: memoryUsage,
  }

  const responseTime = Date.now() - startTime

  logger.info('Health check', { status: checks.status, responseTime })

  return NextResponse.json(checks, {
    status: checks.status === 'healthy' ? 200 : 503,
    headers: {
      'X-Response-Time': `${responseTime}ms`,
      'Cache-Control': 'no-store',
    }
  })
}
