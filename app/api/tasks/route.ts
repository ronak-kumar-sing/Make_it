import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { cache } from '@/lib/redis'
import { getSession } from '@/lib/security'
import { paginationSchema, taskFilterSchema } from '@/lib/validations'
import { logger } from '@/lib/logger'

export const runtime = 'nodejs'

// GET /api/tasks - List tasks with filtering and pagination
export async function GET(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Authenticate
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse query params
    const { searchParams } = new URL(request.url)
    const params = {
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
      status: searchParams.get('status'),
      priority: searchParams.get('priority'),
      search: searchParams.get('search'),
      sortBy: searchParams.get('sortBy') || 'createdAt',
      sortOrder: searchParams.get('sortOrder') || 'desc',
    }

    const validation = taskFilterSchema.safeParse(params)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const { page, limit, status, priority, search, sortBy, sortOrder } = validation.data

    // Check cache
    const cacheKey = `tasks:${session.userId}:${JSON.stringify(params)}`
    const cached = await cache.get(cacheKey)
    if (cached) {
      return NextResponse.json(cached, {
        headers: { 'X-Cache': 'HIT', 'X-Response-Time': `${Date.now() - startTime}ms` }
      })
    }

    // Build query
    const where: Record<string, unknown> = {
      userId: session.userId,
    }

    if (status) where.status = status
    if (priority) where.priority = priority
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Execute queries
    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        orderBy: { [sortBy as string]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          priority: true,
          dueDate: true,
          estimatedTime: true,
          tags: true,
          createdAt: true,
          completedAt: true,
        },
      }),
      prisma.task.count({ where }),
    ])

    const response = {
      data: tasks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }

    // Cache response
    await cache.set(cacheKey, response, 300) // 5 minutes

    logger.info('Tasks fetched', {
      userId: session.userId,
      count: tasks.length,
      responseTime: Date.now() - startTime,
    })

    return NextResponse.json(response, {
      headers: { 'X-Cache': 'MISS', 'X-Response-Time': `${Date.now() - startTime}ms` }
    })
  } catch (error) {
    logger.error('Failed to fetch tasks', { error })
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
  }
}

// POST /api/tasks - Create new task
export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const task = await prisma.task.create({
      data: {
        ...body,
        userId: session.userId,
      },
    })

    // Invalidate cache
    await cache.invalidatePattern(`tasks:${session.userId}:*`)

    logger.info('Task created', {
      userId: session.userId,
      taskId: task.id,
      responseTime: Date.now() - startTime,
    })

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    logger.error('Failed to create task', { error })
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
  }
}
