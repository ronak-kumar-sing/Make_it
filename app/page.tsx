import { Metadata, Viewport } from 'next'
import { redirect } from 'next/navigation'
import { getUser } from '@/app/actions/auth'
import LandingPage from '@/components/landing/hero'
import AIChatWidget from '@/components/ai/chat-widget'

// ==================== SEO METADATA ====================

export const metadata: Metadata = {
  title: 'StudyStreak - AI-Powered Study Platform | Build Better Study Habits',
  description: 'Transform your study habits with StudyStreak. AI-powered focus timer, streak tracking, personalized study plans, and social accountability. Join 10,000+ students achieving more.',
  keywords: [
    'study app',
    'focus timer',
    'pomodoro technique',
    'study habits',
    'AI tutor',
    'study planner',
    'productivity app',
    'student success',
    'streak tracking',
    'study challenges',
  ],
  authors: [{ name: 'StudyStreak Team' }],
  creator: 'StudyStreak',
  publisher: 'StudyStreak',
  
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://studystreak.app',
    siteName: 'StudyStreak',
    title: 'StudyStreak - AI-Powered Study Platform',
    description: 'Transform your study habits with AI-powered tools, streak tracking, and social accountability.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'StudyStreak - Study Smarter, Achieve More',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'StudyStreak - AI-Powered Study Platform',
    description: 'Transform your study habits with AI-powered tools and social accountability.',
    images: ['/og-image.png'],
    creator: '@studystreak',
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  alternates: {
    canonical: 'https://studystreak.app',
  },

  category: 'Education',
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

function generateStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': 'https://studystreak.app/#website',
        url: 'https://studystreak.app',
        name: 'StudyStreak',
        description: 'AI-Powered Study Platform',
        publisher: {
          '@id': 'https://studystreak.app/#organization',
        },
        inLanguage: 'en-US',
      },
      {
        '@type': 'Organization',
        '@id': 'https://studystreak.app/#organization',
        name: 'StudyStreak',
        url: 'https://studystreak.app',
        logo: {
          '@type': 'ImageObject',
          url: 'https://studystreak.app/logo.png',
          width: 512,
          height: 512,
        },
        sameAs: [
          'https://twitter.com/studystreak',
          'https://github.com/studystreak',
        ],
      },
      {
        '@type': 'SoftwareApplication',
        name: 'StudyStreak',
        applicationCategory: 'EducationalApplication',
        operatingSystem: 'Web',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.9',
          ratingCount: '10000',
        },
      },
    ],
  }
}

export default async function HomePage() {
  const user = await getUser()
  
  if (user) {
    redirect('/dashboard')
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateStructuredData()),
        }}
      />
      
      <LandingPage />
      
      <AIChatWidget 
        position="bottom-right"
        theme="gradient"
        welcomeMessage="Hi! 👋 I'm StudyBuddy. Ask me anything about studying, or sign up to get started!"
        agentName="StudyBuddy"
      />
    </>
  )
}
