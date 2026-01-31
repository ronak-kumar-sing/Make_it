import { openai } from '@ai-sdk/openai'
import { generateText } from 'ai'
import { cache } from '@/lib/redis'
import { logger } from '@/lib/logger'

// ==================== CONTENT AI TYPES ====================

export interface ContentSuggestion {
  original: string
  improved: string
  reasoning: string
  seoScore?: number
}

export interface SEOAnalysis {
  score: number
  title: { current: string; suggested: string }
  description: { current: string; suggested: string }
  headings: { issue: string; suggestion: string }[]
  keywords: { found: string[]; missing: string[] }
  readability: { score: number; suggestions: string[] }
}

export interface UIOptimization {
  element: string
  currentState: string
  suggestion: string
  priority: 'low' | 'medium' | 'high'
  expectedImpact: string
}

// ==================== CONTENT OPTIMIZATION ====================

export async function optimizeHeadline(
  headline: string,
  context?: { pageType?: string; targetAudience?: string }
): Promise<ContentSuggestion[]> {
  const cacheKey = `content:headline:${Buffer.from(headline).toString('base64').slice(0, 20)}`
  const cached = await cache.get<ContentSuggestion[]>(cacheKey)
  if (cached) return cached

  try {
    const result = await generateText({
      model: openai('gpt-4o-mini'),
      system: `You are an expert copywriter. Generate 3 improved versions of headlines.
Return JSON array: [{"original":"...","improved":"...","reasoning":"..."}]`,
      prompt: `Improve this headline for ${context?.pageType || 'a web page'} targeting ${context?.targetAudience || 'general users'}:

"${headline}"

Focus on: clarity, emotional appeal, SEO, and action orientation.`,
      maxOutputTokens: 500,
    })

    const suggestions = JSON.parse(result.text)
    await cache.set(cacheKey, suggestions, 7200) // 2 hours
    return suggestions
  } catch (error) {
    logger.error('Headline optimization failed', { error })
    return [{ original: headline, improved: headline, reasoning: 'Optimization unavailable' }]
  }
}

export async function rewriteContent(
  content: string,
  tone: 'professional' | 'casual' | 'friendly' | 'premium' | 'academic',
  options?: { maxLength?: number; preserveKeywords?: string[] }
): Promise<{ rewritten: string; changes: string[] }> {
  try {
    const result = await generateText({
      model: openai('gpt-4o-mini'),
      system: `You are an expert content writer. Rewrite content in the specified tone.
Return JSON: {"rewritten":"...","changes":["change1","change2",...]}`,
      prompt: `Rewrite in ${tone} tone${options?.maxLength ? ` (max ${options.maxLength} chars)` : ''}:

"${content}"

${options?.preserveKeywords?.length ? `Preserve these keywords: ${options.preserveKeywords.join(', ')}` : ''}`,
      maxOutputTokens: 1000,
    })

    return JSON.parse(result.text)
  } catch (error) {
    logger.error('Content rewrite failed', { error })
    return { rewritten: content, changes: [] }
  }
}

// ==================== SEO ANALYSIS ====================

export async function analyzeSEO(
  pageData: {
    title: string
    description?: string
    content: string
    headings?: string[]
    url?: string
  }
): Promise<SEOAnalysis> {
  const cacheKey = `seo:${Buffer.from(pageData.title + pageData.url).toString('base64').slice(0, 30)}`
  const cached = await cache.get<SEOAnalysis>(cacheKey)
  if (cached) return cached

  try {
    const result = await generateText({
      model: openai('gpt-4o-mini'),
      system: `You are an SEO expert. Analyze page content and provide actionable recommendations.
Return JSON with structure: {
  "score": 0-100,
  "title": {"current":"...","suggested":"..."},
  "description": {"current":"...","suggested":"..."},
  "headings": [{"issue":"...","suggestion":"..."}],
  "keywords": {"found":["..."],"missing":["..."]},
  "readability": {"score":0-100,"suggestions":["..."]}
}`,
      prompt: `Analyze SEO for this page:

Title: ${pageData.title}
Description: ${pageData.description || 'None'}
URL: ${pageData.url || 'Not provided'}
Headings: ${pageData.headings?.join(', ') || 'None'}
Content preview: ${pageData.content.slice(0, 500)}...`,
      maxOutputTokens: 800,
    })

    const analysis = JSON.parse(result.text)
    await cache.set(cacheKey, analysis, 3600)
    return analysis
  } catch (error) {
    logger.error('SEO analysis failed', { error })
    return {
      score: 50,
      title: { current: pageData.title, suggested: pageData.title },
      description: { current: pageData.description || '', suggested: '' },
      headings: [],
      keywords: { found: [], missing: [] },
      readability: { score: 50, suggestions: [] },
    }
  }
}

export async function generateMetaTags(
  content: string,
  pageType: 'landing' | 'blog' | 'product' | 'about' | 'dashboard'
): Promise<{ title: string; description: string; ogTitle: string; ogDescription: string; keywords: string[] }> {
  try {
    const result = await generateText({
      model: openai('gpt-4o-mini'),
      system: `Generate SEO-optimized meta tags. Return JSON:
{"title":"60 chars max","description":"160 chars max","ogTitle":"...","ogDescription":"...","keywords":["..."]}`,
      prompt: `Generate meta tags for a ${pageType} page:

${content.slice(0, 800)}`,
      maxOutputTokens: 300,
    })

    return JSON.parse(result.text)
  } catch (error) {
    logger.error('Meta tag generation failed', { error })
    return {
      title: 'StudyStreak',
      description: 'Build your study habit with StudyStreak',
      ogTitle: 'StudyStreak',
      ogDescription: 'Build your study habit with StudyStreak',
      keywords: ['study', 'productivity', 'education'],
    }
  }
}

// ==================== UI OPTIMIZATION ====================

export async function analyzeUIPatterns(
  userBehavior: {
    pageViews: { page: string; duration: number; scrollDepth: number }[]
    clicks: { element: string; count: number }[]
    bounceRate: number
    conversionRate: number
  }
): Promise<UIOptimization[]> {
  try {
    const result = await generateText({
      model: openai('gpt-4o-mini'),
      system: `You are a UX analyst. Analyze user behavior and suggest UI improvements.
Return JSON array: [{"element":"...","currentState":"...","suggestion":"...","priority":"low|medium|high","expectedImpact":"..."}]`,
      prompt: `Analyze this user behavior data and suggest UI optimizations:

Page views: ${JSON.stringify(userBehavior.pageViews)}
Click patterns: ${JSON.stringify(userBehavior.clicks)}
Bounce rate: ${userBehavior.bounceRate}%
Conversion rate: ${userBehavior.conversionRate}%`,
      maxOutputTokens: 600,
    })

    return JSON.parse(result.text)
  } catch (error) {
    logger.error('UI analysis failed', { error })
    return []
  }
}

export async function suggestAnimationIntensity(
  deviceType: 'mobile' | 'tablet' | 'desktop',
  userPreferences: { reducedMotion: boolean; batteryLevel?: number },
  performanceScore: number
): Promise<{ intensity: 'none' | 'subtle' | 'moderate' | 'full'; reasoning: string }> {
  // Quick heuristic-based decision
  if (userPreferences.reducedMotion) {
    return { intensity: 'none', reasoning: 'User prefers reduced motion' }
  }

  if (userPreferences.batteryLevel && userPreferences.batteryLevel < 20) {
    return { intensity: 'subtle', reasoning: 'Low battery - conserving power' }
  }

  if (performanceScore < 50) {
    return { intensity: 'subtle', reasoning: 'Device performance is limited' }
  }

  if (deviceType === 'mobile') {
    return { intensity: 'moderate', reasoning: 'Mobile device - balanced animations' }
  }

  return { intensity: 'full', reasoning: 'Full animations enabled' }
}

// ==================== SMART SEARCH ====================

export async function enhanceSearchQuery(
  query: string,
  searchHistory?: string[]
): Promise<{ enhanced: string; suggestions: string[]; filters: Record<string, string> }> {
  try {
    const result = await generateText({
      model: openai('gpt-4o-mini'),
      system: `Enhance search queries for better results. Return JSON:
{"enhanced":"...","suggestions":["..."],"filters":{"category":"...","type":"..."}}`,
      prompt: `Enhance this search query: "${query}"
${searchHistory?.length ? `Previous searches: ${searchHistory.slice(-5).join(', ')}` : ''}`,
      maxOutputTokens: 200,
    })

    return JSON.parse(result.text)
  } catch {
    return { enhanced: query, suggestions: [], filters: {} }
  }
}

// ==================== CONTENT GENERATION ====================

export async function generateBlogOutline(
  topic: string,
  targetLength: 'short' | 'medium' | 'long' = 'medium'
): Promise<{ title: string; sections: { heading: string; points: string[] }[]; keywords: string[] }> {
  const wordCounts = { short: 500, medium: 1000, long: 2000 }
  
  try {
    const result = await generateText({
      model: openai('gpt-4o-mini'),
      system: `Create SEO-optimized blog outlines. Return JSON:
{"title":"...","sections":[{"heading":"...","points":["..."]}],"keywords":["..."]}`,
      prompt: `Create a ${targetLength} blog outline (~${wordCounts[targetLength]} words) about:

"${topic}"

Include engaging headings and key talking points for each section.`,
      maxOutputTokens: 600,
    })

    return JSON.parse(result.text)
  } catch (error) {
    logger.error('Blog outline generation failed', { error })
    return { title: topic, sections: [], keywords: [] }
  }
}

export async function generateCTA(
  context: { page: string; goal: string; audience: string }
): Promise<{ primary: string; secondary: string; microcopy: string }> {
  try {
    const result = await generateText({
      model: openai('gpt-4o-mini'),
      system: `Generate compelling CTAs. Return JSON:
{"primary":"action button text","secondary":"alternative action","microcopy":"supporting text"}`,
      prompt: `Generate CTAs for:
Page: ${context.page}
Goal: ${context.goal}
Audience: ${context.audience}`,
      maxOutputTokens: 150,
    })

    return JSON.parse(result.text)
  } catch {
    return {
      primary: 'Get Started',
      secondary: 'Learn More',
      microcopy: 'No credit card required',
    }
  }
}
