import { NextRequest, NextResponse } from 'next/server'
import { handleChatMessage, AgentMessage } from '@/lib/ai/agents'
import { aiChatSchema } from '@/lib/validations'
import { rateLimiter } from '@/lib/redis'
import { getSession } from '@/lib/security'
import { logger } from '@/lib/logger'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Get user session (optional for chat)
    const session = await getSession()
    const userId = session?.userId || 'anonymous'

    // Rate limiting
    const { allowed, remaining } = await rateLimiter.checkLimit(
      `ai-chat:${userId}`,
      20, // 20 requests
      60  // per minute
    )

    if (!allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait before sending more messages.' },
        { 
          status: 429,
          headers: { 'X-RateLimit-Remaining': '0' }
        }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validation = aiChatSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const { message, context } = validation.data

    // Build message history (simplified - in production, fetch from DB)
    const messages: AgentMessage[] = [
      { role: 'user', content: message }
    ]

    // Get AI response
    const response = await handleChatMessage(
      messages,
      'study-assistant',
      {
        userId,
        ...context,
      }
    )

    // Log successful request
    logger.info('AI chat request completed', {
      userId,
      responseTime: Date.now() - startTime,
      tokens: response.tokens,
    })

    return NextResponse.json({
      content: response.content,
      tokens: response.tokens,
      model: response.model,
    }, {
      headers: {
        'X-RateLimit-Remaining': remaining.toString(),
      }
    })
  } catch (error) {
    logger.error('AI chat request failed', { error })
    
    return NextResponse.json(
      { error: 'Failed to process your request. Please try again.' },
      { status: 500 }
    )
  }
}

// Health check for the AI endpoint
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    service: 'ai-chat',
    timestamp: new Date().toISOString(),
  })
}
