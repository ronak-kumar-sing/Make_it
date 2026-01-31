import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/security'
import { cache } from '@/lib/redis'
import prisma from '@/lib/db'
import { logger, logPerformance } from '@/lib/logger'

export const runtime = 'nodejs'

interface PerformanceMetrics {
  endpoint: string
  avgResponseTime: number
  p95ResponseTime: number
  errorRate: number
  requestCount: number
}

// GET /api/admin/performance - Get performance metrics (admin only)
export async function GET(request: NextRequest) {
  const startTime = Date.now()

  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Gather metrics from various sources
    const metrics = {
      timestamp: new Date().toISOString(),
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        nodeVersion: process.version,
      },
      database: await getDatabaseMetrics(),
      cache: await getCacheMetrics(),
      recommendations: [] as string[],
    }

    // Generate recommendations based on metrics
    if (metrics.system.memory.heapUsed > 400 * 1024 * 1024) {
      metrics.recommendations.push('Memory usage is high. Consider optimizing memory-intensive operations.')
    }

    logPerformance('admin-performance-check', Date.now() - startTime)

    return NextResponse.json(metrics)
  } catch (error) {
    logger.error('Performance metrics fetch failed', { error })
    return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 })
  }
}

async function getDatabaseMetrics() {
  const startTime = Date.now()
  
  try {
    // Run a simple query to measure response time
    await prisma.$queryRaw`SELECT 1`
    const queryLatency = Date.now() - startTime

    // Get table counts
    const [userCount, taskCount, sessionCount] = await Promise.all([
      prisma.user.count(),
      prisma.task.count(),
      prisma.focusSession.count(),
    ])

    return {
      status: 'healthy',
      queryLatency,
      tables: {
        users: userCount,
        tasks: taskCount,
        sessions: sessionCount,
      },
    }
  } catch (error) {
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

async function getCacheMetrics() {
  try {
    const startTime = Date.now()
    await cache.set('health-check', 'ok', 10)
    await cache.get('health-check')
    const latency = Date.now() - startTime

    return {
      status: 'healthy',
      latency,
    }
  } catch {
    return {
      status: 'unavailable',
      latency: 0,
    }
  }
}
