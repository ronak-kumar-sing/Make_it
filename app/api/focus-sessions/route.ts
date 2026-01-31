import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyToken } from "@/lib/security"
import { logger } from "@/lib/logger"
import { cache } from "@/lib/redis"
import { cookies } from "next/headers"

// Helper to get user from token
async function getUserFromRequest(request: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value

  if (!token) return null

  try {
    const payload = await verifyToken(token)
    return payload
  } catch {
    return null
  }
}

// GET - Get user's focus sessions
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    // Try cache first
    const cacheKey = `focus-sessions:${user.userId}:${page}:${limit}:${startDate}:${endDate}`
    const cached = await cache.get(cacheKey)
    if (cached) {
      return NextResponse.json(cached)
    }

    const where: Record<string, unknown> = { userId: user.userId }

    if (startDate || endDate) {
      where.startedAt = {}
      if (startDate) (where.startedAt as Record<string, unknown>).gte = new Date(startDate)
      if (endDate) (where.startedAt as Record<string, unknown>).lte = new Date(endDate)
    }

    const [sessions, total] = await Promise.all([
      prisma.focusSession.findMany({
        where,
        orderBy: { startedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.focusSession.count({ where }),
    ])

    // Get session stats
    const stats = await prisma.focusSession.aggregate({
      where: { userId: user.userId },
      _sum: { duration: true, pauseCount: true },
      _avg: { duration: true },
      _count: true,
    })

    const response = {
      sessions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        totalSessions: stats._count,
        totalMinutes: stats._sum.duration || 0,
        avgDuration: Math.round(stats._avg.duration || 0),
        totalPauses: stats._sum.pauseCount || 0,
      },
    }

    // Cache for 2 minutes
    await cache.set(cacheKey, response, 120)

    return NextResponse.json(response)
  } catch (error) {
    logger.error("Get focus sessions error", { error })
    return NextResponse.json(
      { error: "Failed to fetch focus sessions" },
      { status: 500 }
    )
  }
}

// POST - Start a new focus session
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { taskId, duration = 25, type = "focus" } = body

    // Check for active session
    const activeSession = await prisma.focusSession.findFirst({
      where: {
        userId: user.userId,
        endedAt: null,
      },
    })

    if (activeSession) {
      return NextResponse.json(
        { error: "You already have an active focus session", activeSession },
        { status: 400 }
      )
    }

    // Create new session
    const session = await prisma.focusSession.create({
      data: {
        userId: user.userId,
        taskId,
        duration,
        type,
        startedAt: new Date(),
      },
    })

    // Invalidate cache
    await cache.invalidatePattern(`focus-sessions:${user.userId}:*`)

    logger.info("Focus session started", { userId: user.userId, sessionId: session.id })

    return NextResponse.json({ session }, { status: 201 })
  } catch (error) {
    logger.error("Start focus session error", { error })
    return NextResponse.json(
      { error: "Failed to start focus session" },
      { status: 500 }
    )
  }
}

// PATCH - End or update a focus session
export async function PATCH(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { sessionId, action, notes, pauseCount } = body

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID required" }, { status: 400 })
    }

    // Find session
    const session = await prisma.focusSession.findFirst({
      where: {
        id: sessionId,
        userId: user.userId,
      },
    })

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    // Handle different actions
    if (action === "complete" || action === "cancel") {
      const completed = action === "complete"
      const actualDuration = completed
        ? Math.round((Date.now() - session.startedAt.getTime()) / 60000)
        : 0

      const updatedSession = await prisma.focusSession.update({
        where: { id: sessionId },
        data: {
          endedAt: new Date(),
          completed,
          notes,
          pauseCount,
          duration: actualDuration,
        },
      })

      // Update user stats if completed
      if (completed && actualDuration > 0) {
        await prisma.user.update({
          where: { id: user.userId },
          data: {
            totalFocusTime: { increment: actualDuration },
            experience: { increment: actualDuration * 10 },
          },
        })

        // Check if task should be updated
        if (session.taskId) {
          await prisma.task.update({
            where: { id: session.taskId },
            data: { totalFocusTime: { increment: actualDuration } },
          })
        }
      }

      // Invalidate cache
      await cache.invalidatePattern(`focus-sessions:${user.userId}:*`)

      logger.info("Focus session ended", { 
        userId: user.userId, 
        sessionId, 
        completed, 
        duration: actualDuration 
      })

      return NextResponse.json({ session: updatedSession })
    }

    // Just update notes or pause count
    const updatedSession = await prisma.focusSession.update({
      where: { id: sessionId },
      data: { notes, pauseCount },
    })

    return NextResponse.json({ session: updatedSession })
  } catch (error) {
    logger.error("Update focus session error", { error })
    return NextResponse.json(
      { error: "Failed to update focus session" },
      { status: 500 }
    )
  }
}
