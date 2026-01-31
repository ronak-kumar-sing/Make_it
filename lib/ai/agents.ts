import { generateText, streamText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { anthropic } from '@ai-sdk/anthropic'
import { cache } from '@/lib/redis'
import { logger, logAI } from '@/lib/logger'

// ==================== AI CONFIGURATION ====================

export const aiConfig = {
  defaultModel: 'gpt-4o-mini',
  maxTokens: 2000,
  temperature: 0.7,
  requestsPerMinute: 20,
  cacheEnabled: true,
  cacheTTL: 3600, // 1 hour
}

// Model selection based on task complexity
export const models = {
  fast: openai('gpt-4o-mini'),
  balanced: openai('gpt-4o'),
  creative: openai('gpt-4o'),
  analytical: anthropic('claude-3-5-sonnet-20241022'),
}

// ==================== AGENT TYPES ====================

export type AgentType = 
  | 'study-assistant' 
  | 'content-optimizer' 
  | 'admin-analyzer'
  | 'personalization'
  | 'seo-assistant'

export interface AgentMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface AgentResponse {
  content: string
  tokens?: number
  cached?: boolean
  model?: string
}

// ==================== SYSTEM PROMPTS ====================

const systemPrompts: Record<AgentType, string> = {
  'study-assistant': `You are StudyBuddy, an AI study assistant for StudyStreak.
You help students with:
- Creating effective study plans and schedules
- Breaking down complex topics into manageable chunks
- Suggesting study techniques (Pomodoro, active recall, spaced repetition)
- Providing motivation and encouragement
- Answering questions about their study materials
- Recommending focus session durations

Always be encouraging, supportive, and practical. Keep responses concise but helpful.
Use emojis sparingly to keep things friendly. 🎯`,

  'content-optimizer': `You are an expert content optimizer for web applications.
Your role is to:
- Improve copy for better engagement and clarity
- Optimize text for SEO while maintaining readability
- Suggest headlines and CTAs that convert
- Adapt tone based on context (professional, casual, premium)
- Ensure accessibility in language choice

Provide specific, actionable suggestions. Format output clearly.`,

  'admin-analyzer': `You are an expert backend performance analyst.
Your capabilities include:
- Analyzing API response times and suggesting optimizations
- Reviewing database queries for efficiency
- Identifying bottlenecks and slow endpoints
- Recommending caching strategies
- Suggesting index optimizations
- Security audit recommendations

Provide technical, actionable insights with code examples when helpful.`,

  'personalization': `You are a personalization AI that analyzes user behavior.
Your role is to:
- Suggest personalized homepage layouts
- Recommend content based on user patterns
- Identify optimal study times for users
- Suggest relevant challenges and goals
- Provide insights on user engagement

Base recommendations on data patterns. Be privacy-conscious.`,

  'seo-assistant': `You are an SEO expert assistant.
Your capabilities include:
- Generating optimized meta descriptions and titles
- Creating structured data (Schema.org) markup
- Suggesting keyword optimizations
- Analyzing content for SEO improvements
- Recommending internal linking strategies

Provide specific, implementation-ready suggestions.`,
}

// ==================== AI TOOLS ====================

// Study plan helper functions (tools removed for SDK v6 compatibility)
function createStudyPlan(subject: string, duration: number, deadline?: string) {
  return {
    plan: `Study plan for ${subject}`,
    sessions: Math.ceil(duration * 2), // 30-min sessions
    dailyTime: Math.ceil(duration / 7), // hours per day for a week
    deadline,
  }
}

function suggestBreak(studyMinutes: number) {
  const breakLength = studyMinutes >= 50 ? 15 : 5
  const activities = [
    'Take a short walk',
    'Do some stretches',
    'Grab a healthy snack',
    'Practice deep breathing',
    'Look out the window',
  ]
  return {
    breakLength,
    activity: activities[Math.floor(Math.random() * activities.length)],
  }
}

export { createStudyPlan, suggestBreak }

// ==================== CORE AI FUNCTIONS ====================

export async function generateAIResponse(
  agentType: AgentType,
  userMessage: string,
  context?: Record<string, unknown>
): Promise<AgentResponse> {
  const startTime = Date.now()
  
  // Check cache first
  if (aiConfig.cacheEnabled) {
    const cacheKey = `ai:${agentType}:${Buffer.from(userMessage).toString('base64').slice(0, 32)}`
    const cached = await cache.get<AgentResponse>(cacheKey)
    if (cached) {
      logAI('cache-hit', 'cached', 0, Date.now() - startTime)
      return { ...cached, cached: true }
    }
  }

  try {
    const systemPrompt = systemPrompts[agentType]
    const contextString = context 
      ? `\n\nContext: ${JSON.stringify(context)}`
      : ''

    const result = await generateText({
      model: models.fast,
      system: systemPrompt + contextString,
      prompt: userMessage,
      maxOutputTokens: aiConfig.maxTokens,
      temperature: aiConfig.temperature,
    })

    const response: AgentResponse = {
      content: result.text,
      tokens: result.usage?.totalTokens,
      model: aiConfig.defaultModel,
    }

    // Cache the response
    if (aiConfig.cacheEnabled) {
      const cacheKey = `ai:${agentType}:${Buffer.from(userMessage).toString('base64').slice(0, 32)}`
      await cache.set(cacheKey, response, aiConfig.cacheTTL)
    }

    logAI('generate', aiConfig.defaultModel, result.usage?.totalTokens, Date.now() - startTime)
    return response
  } catch (error) {
    logger.error('AI generation failed', { error, agentType })
    throw error
  }
}

export async function* streamAIResponse(
  agentType: AgentType,
  userMessage: string,
  context?: Record<string, unknown>
): AsyncGenerator<string> {
  const startTime = Date.now()
  
  try {
    const systemPrompt = systemPrompts[agentType]
    const contextString = context 
      ? `\n\nContext: ${JSON.stringify(context)}`
      : ''

    const result = streamText({
      model: models.fast,
      system: systemPrompt + contextString,
      prompt: userMessage,
      maxOutputTokens: aiConfig.maxTokens,
      temperature: aiConfig.temperature,
    })

    for await (const chunk of result.textStream) {
      yield chunk
    }

    logAI('stream', aiConfig.defaultModel, undefined, Date.now() - startTime)
  } catch (error) {
    logger.error('AI streaming failed', { error, agentType })
    throw error
  }
}

// ==================== SPECIALIZED AI FUNCTIONS ====================

export async function generateStudyPlan(
  subject: string,
  hoursAvailable: number,
  deadline?: Date
): Promise<{ plan: string; sessions: Array<{ topic: string; duration: number }> }> {
  const response = await generateAIResponse('study-assistant', 
    `Create a study plan for "${subject}" with ${hoursAvailable} hours available${
      deadline ? ` before ${deadline.toLocaleDateString()}` : ''
    }. Break it into specific sessions with topics and durations.`,
    { subject, hoursAvailable, deadline: deadline?.toISOString() }
  )

  return {
    plan: response.content,
    sessions: [], // Parse from response in production
  }
}

export async function optimizeContent(
  content: string,
  tone: 'professional' | 'casual' | 'premium' = 'professional'
): Promise<{ optimized: string; suggestions: string[] }> {
  const response = await generateAIResponse('content-optimizer',
    `Optimize this content for a ${tone} tone. Improve clarity, engagement, and SEO:

${content}

Provide the optimized version and a list of specific improvements made.`,
    { originalLength: content.length, tone }
  )

  return {
    optimized: response.content,
    suggestions: [],
  }
}

export async function generateSEOMeta(
  pageContent: string,
  pageType: string
): Promise<{ title: string; description: string; keywords: string[] }> {
  const response = await generateAIResponse('seo-assistant',
    `Generate SEO meta tags for a ${pageType} page with this content:

${pageContent.slice(0, 1000)}

Return a JSON object with: title (60 chars max), description (160 chars max), keywords (array of 5-10).`,
    { pageType }
  )

  try {
    return JSON.parse(response.content)
  } catch {
    return {
      title: 'StudyStreak - Build Your Study Habit',
      description: 'Track your study progress and build consistent study habits with StudyStreak.',
      keywords: ['study', 'productivity', 'education', 'habits', 'focus'],
    }
  }
}

export async function analyzePerformance(
  metrics: {
    endpoint: string
    responseTime: number
    errorRate: number
    requestCount: number
  }[]
): Promise<{ insights: string; recommendations: string[] }> {
  const response = await generateAIResponse('admin-analyzer',
    `Analyze these API performance metrics and provide optimization recommendations:

${JSON.stringify(metrics, null, 2)}

Focus on: slow endpoints, error patterns, and scaling concerns.`,
    { metricsCount: metrics.length }
  )

  return {
    insights: response.content,
    recommendations: [],
  }
}

export async function getPersonalizedRecommendations(
  userBehavior: {
    studyPatterns: { hour: number; duration: number }[]
    preferredSubjects: string[]
    streakHistory: number[]
    completionRate: number
  }
): Promise<{ recommendations: string[]; optimalStudyTime: string }> {
  const response = await generateAIResponse('personalization',
    `Based on this user behavior data, provide personalized recommendations:

${JSON.stringify(userBehavior, null, 2)}

Include: optimal study times, suggested challenges, content recommendations.`,
    userBehavior
  )

  return {
    recommendations: [response.content],
    optimalStudyTime: 'morning', // Parse from response
  }
}

// ==================== CHAT CONVERSATION HANDLER ====================

export async function handleChatMessage(
  messages: AgentMessage[],
  agentType: AgentType = 'study-assistant',
  context?: Record<string, unknown>
): Promise<AgentResponse> {
  const startTime = Date.now()
  const systemPrompt = systemPrompts[agentType]
  
  try {
    const formattedMessages = messages.map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }))

    const result = await generateText({
      model: models.fast,
      system: systemPrompt + (context ? `\n\nContext: ${JSON.stringify(context)}` : ''),
      messages: formattedMessages,
      maxOutputTokens: aiConfig.maxTokens,
      temperature: aiConfig.temperature,
    })

    logAI('chat', aiConfig.defaultModel, result.usage?.totalTokens, Date.now() - startTime)

    return {
      content: result.text,
      tokens: result.usage?.totalTokens,
      model: aiConfig.defaultModel,
    }
  } catch (error) {
    logger.error('Chat message handling failed', { error, agentType })
    throw error
  }
}
