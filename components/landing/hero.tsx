'use client'

import { useEffect, useRef, Suspense, lazy } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { 
  Flame, 
  Users, 
  Trophy, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  BookOpen, 
  Target, 
  Star,
  Sparkles,
  Zap,
  Brain,
  TrendingUp,
  Shield,
  Globe,
  Play
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useReducedMotion } from '@/lib/animations'
import { cn } from '@/lib/utils'

// Lazy load Three.js for better performance
const InteractiveBackground = lazy(() => import('@/components/three/interactive-background'))

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

// ==================== ANIMATED SECTION WRAPPER ====================

function AnimatedSection({ 
  children, 
  className, 
  delay = 0 
}: { 
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  
  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
      transition={{ duration: 0.8, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.section>
  )
}

// ==================== FEATURE CARD ====================

function FeatureCard({ 
  icon, 
  title, 
  description, 
  index,
  gradient
}: { 
  icon: React.ReactNode
  title: string
  description: string
  index: number
  gradient: string
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="group relative"
    >
      <div className={cn(
        "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl",
        gradient
      )} />
      <div className="relative bg-background/80 backdrop-blur-sm rounded-2xl border p-6 h-full hover:border-orange-500/50 transition-colors duration-300">
        <div className={cn(
          "p-3 rounded-xl w-fit mb-4 transition-transform duration-300 group-hover:scale-110",
          gradient
        )}>
          {icon}
        </div>
        <h3 className="text-xl font-bold mb-2 group-hover:text-orange-500 transition-colors">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </motion.div>
  )
}

// ==================== STAT COUNTER ====================

function StatCounter({ value, label, suffix = '' }: { value: number; label: string; suffix?: string }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.5, type: "spring" }}
      className="text-center"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent"
      >
        {isInView && (
          <CountUp end={value} suffix={suffix} />
        )}
      </motion.div>
      <p className="text-muted-foreground mt-2">{label}</p>
    </motion.div>
  )
}

function CountUp({ end, suffix = '' }: { end: number; suffix?: string }) {
  const nodeRef = useRef<HTMLSpanElement>(null)
  
  useEffect(() => {
    const node = nodeRef.current
    if (!node) return
    
    let start = 0
    const duration = 2000
    const startTime = performance.now()
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 4)
      const current = Math.floor(eased * end)
      
      if (node) {
        node.textContent = current.toLocaleString() + suffix
      }
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    
    requestAnimationFrame(animate)
  }, [end, suffix])
  
  return <span ref={nodeRef}>0{suffix}</span>
}

// ==================== TESTIMONIAL CARD ====================

function TestimonialCard({ 
  quote, 
  author, 
  role, 
  avatar,
  index 
}: { 
  quote: string
  author: string
  role: string
  avatar: string
  index: number 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="bg-background/50 backdrop-blur-sm rounded-2xl border p-6 hover:shadow-xl transition-shadow duration-300"
    >
      <div className="flex gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-orange-500 text-orange-500" />
        ))}
      </div>
      <p className="text-foreground mb-6 italic">"{quote}"</p>
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold">
          {author.split(' ').map(n => n[0]).join('')}
        </div>
        <div>
          <p className="font-semibold">{author}</p>
          <p className="text-sm text-muted-foreground">{role}</p>
        </div>
      </div>
    </motion.div>
  )
}

// ==================== MAIN LANDING PAGE ====================

export default function LandingPage() {
  const reducedMotion = useReducedMotion()
  const heroRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll()
  const headerOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0.95])
  
  // GSAP animations
  useEffect(() => {
    if (reducedMotion) return

    const ctx = gsap.context(() => {
      // Hero text animation
      gsap.fromTo('.hero-title', 
        { opacity: 0, y: 100, clipPath: 'inset(100% 0 0 0)' },
        { 
          opacity: 1, 
          y: 0, 
          clipPath: 'inset(0% 0 0 0)',
          duration: 1.2,
          ease: 'power4.out',
          delay: 0.3
        }
      )

      gsap.fromTo('.hero-subtitle',
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 0.8, delay: 0.6 }
      )

      gsap.fromTo('.hero-cta',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, delay: 0.9, stagger: 0.1 }
      )

      // Scroll-triggered animations
      gsap.utils.toArray('.scroll-reveal').forEach((el: any) => {
        gsap.fromTo(el,
          { opacity: 0, y: 60 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            scrollTrigger: {
              trigger: el,
              start: 'top 80%',
              end: 'bottom 20%',
              toggleActions: 'play none none reverse',
            },
          }
        )
      })
    })

    return () => ctx.revert()
  }, [reducedMotion])

  const features = [
    {
      icon: <Clock className="h-6 w-6 text-white" />,
      title: "AI-Powered Focus Timer",
      description: "Smart Pomodoro sessions that adapt to your study patterns and optimize your productivity.",
      gradient: "bg-gradient-to-br from-blue-500 to-cyan-500"
    },
    {
      icon: <Flame className="h-6 w-6 text-white" />,
      title: "Intelligent Streaks",
      description: "Build habits with streak tracking that understands context and keeps you motivated.",
      gradient: "bg-gradient-to-br from-orange-500 to-red-500"
    },
    {
      icon: <Brain className="h-6 w-6 text-white" />,
      title: "AI Study Assistant",
      description: "Get personalized study plans, topic explanations, and learning recommendations.",
      gradient: "bg-gradient-to-br from-purple-500 to-pink-500"
    },
    {
      icon: <Users className="h-6 w-6 text-white" />,
      title: "Social Challenges",
      description: "Compete with friends in study challenges and stay accountable together.",
      gradient: "bg-gradient-to-br from-green-500 to-emerald-500"
    },
    {
      icon: <TrendingUp className="h-6 w-6 text-white" />,
      title: "Deep Analytics",
      description: "Visualize your progress with beautiful charts and actionable insights.",
      gradient: "bg-gradient-to-br from-amber-500 to-orange-500"
    },
    {
      icon: <Trophy className="h-6 w-6 text-white" />,
      title: "Gamified Learning",
      description: "Earn XP, unlock achievements, and level up as you master your studies.",
      gradient: "bg-gradient-to-br from-indigo-500 to-purple-500"
    },
  ]

  const testimonials = [
    {
      quote: "StudyStreak transformed how I prepare for exams. The AI assistant helps me create perfect study schedules.",
      author: "Sarah Chen",
      role: "Medical Student, Stanford",
      avatar: "/avatars/sarah.jpg"
    },
    {
      quote: "The streak feature is addictive in the best way. I've maintained a 90-day streak and my grades have never been better.",
      author: "Marcus Johnson",
      role: "Engineering Student, MIT",
      avatar: "/avatars/marcus.jpg"
    },
    {
      quote: "Competing in study challenges with my friends makes learning feel like a game. Absolutely love it!",
      author: "Emma Williams",
      role: "Law Student, Harvard",
      avatar: "/avatars/emma.jpg"
    },
  ]

  return (
    <div className="flex min-h-screen flex-col overflow-hidden">
      {/* Animated Header */}
      <motion.header 
        style={{ opacity: headerOpacity }}
        className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-md"
      >
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold group">
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.5 }}
            >
              <Flame className="h-6 w-6 text-orange-500" />
            </motion.div>
            <span className="text-xl bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
              StudyStreak
            </span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-8">
            {['Features', 'How It Works', 'Testimonials', 'Pricing'].map((item) => (
              <Link
                key={item}
                href={`#${item.toLowerCase().replace(' ', '-')}`}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 group-hover:w-full transition-all duration-300" />
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild className="hidden sm:flex">
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/25">
              <Link href="/signup">
                Start Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Hero Section with 3D */}
      <section ref={heroRef} className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        {/* Three.js Interactive Background */}
        <Suspense fallback={
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-orange-950/10" />
        }>
          {!reducedMotion && <InteractiveBackground />}
        </Suspense>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/40 to-background z-10 pointer-events-none" />

        {/* Content */}
        <div className="container relative z-20">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 rounded-full bg-orange-500/10 border border-orange-500/20 px-4 py-2 text-sm text-orange-500 mb-8"
            >
              <Sparkles className="w-4 h-4" />
              <span>AI-Powered Study Platform</span>
              <span className="flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-orange-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
              </span>
            </motion.div>

            {/* Main Title */}
            <h1 className="hero-title text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6">
              <span className="block">Study Smarter.</span>
              <span className="block bg-gradient-to-r from-orange-500 via-orange-400 to-amber-500 bg-clip-text text-transparent">
                Achieve More.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="hero-subtitle text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-10">
              The AI-enhanced platform that transforms your study habits with smart tracking, 
              personalized insights, and social accountability.
            </p>

            {/* CTAs */}
            <div className="hero-cta flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-xl shadow-orange-500/30 h-14 px-8 text-lg"
                asChild
              >
                <Link href="/signup">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="h-14 px-8 text-lg border-2 hover:bg-muted/50"
                asChild
              >
                <Link href="#demo">
                  <Play className="mr-2 h-5 w-5" />
                  Watch Demo
                </Link>
              </Button>
            </div>

            {/* Social Proof */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6"
            >
              <div className="flex -space-x-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-background bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-xs font-bold">
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
                <div className="w-10 h-10 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs font-bold">
                  +10k
                </div>
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-orange-500 text-orange-500" />
                  ))}
                  <span className="ml-2 font-semibold">4.9/5</span>
                </div>
                <p className="text-sm text-muted-foreground">Loved by 10,000+ students worldwide</p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2"
          >
            <motion.div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <AnimatedSection className="py-20 bg-muted/30 border-y">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatCounter value={10000} label="Active Students" suffix="+" />
            <StatCounter value={500000} label="Study Hours Logged" suffix="+" />
            <StatCounter value={98} label="Success Rate" suffix="%" />
            <StatCounter value={150} label="Universities" suffix="+" />
          </div>
        </div>
      </AnimatedSection>

      {/* Features Section */}
      <section id="features" className="py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-orange-500/5 to-transparent" />
        
        <div className="container relative">
          <div className="text-center max-w-3xl mx-auto mb-16 scroll-reveal">
            <motion.span 
              className="inline-block text-orange-500 font-semibold mb-4"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              POWERFUL FEATURES
            </motion.span>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Everything you need to{' '}
              <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                excel
              </span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Combining AI intelligence with gamification to create the ultimate study experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* AI Assistant Preview */}
      <AnimatedSection className="py-24 md:py-32 bg-gradient-to-br from-orange-500/10 via-background to-purple-500/10">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block text-orange-500 font-semibold mb-4">AI STUDY ASSISTANT</span>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Your personal{' '}
                <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                  AI tutor
                </span>
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Get instant help with study planning, concept explanations, and personalized learning paths.
              </p>
              
              <div className="space-y-4">
                {[
                  'Generate custom study schedules',
                  'Explain complex topics simply',
                  'Create practice questions',
                  'Track your learning progress',
                ].map((item, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                    <span>{item}</span>
                  </motion.div>
                ))}
              </div>

              <Button 
                size="lg" 
                className="mt-8 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                asChild
              >
                <Link href="/signup">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Try AI Assistant Free
                </Link>
              </Button>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-3xl blur-2xl" />
              <div className="relative bg-background/80 backdrop-blur-sm rounded-2xl border shadow-2xl p-6">
                {/* Chat Preview */}
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                      <Brain className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 bg-muted rounded-2xl rounded-tl-md p-4">
                      <p className="text-sm">Hi! I'm your AI Study Assistant. How can I help you today?</p>
                    </div>
                  </div>
                  <div className="flex gap-3 justify-end">
                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl rounded-tr-md p-4 max-w-xs">
                      <p className="text-sm">Create a study plan for my calculus exam next week</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                      <Brain className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 bg-muted rounded-2xl rounded-tl-md p-4">
                      <p className="text-sm">I'll create a personalized 7-day plan! 📚</p>
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center gap-2 text-xs">
                          <div className="w-4 h-4 rounded bg-orange-500/20 flex items-center justify-center">
                            <span className="text-orange-500">1</span>
                          </div>
                          <span>Day 1-2: Derivatives & Rules</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <div className="w-4 h-4 rounded bg-orange-500/20 flex items-center justify-center">
                            <span className="text-orange-500">2</span>
                          </div>
                          <span>Day 3-4: Integration Techniques</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <div className="w-4 h-4 rounded bg-orange-500/20 flex items-center justify-center">
                            <span className="text-orange-500">3</span>
                          </div>
                          <span>Day 5-6: Practice Problems</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 md:py-32">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-16 scroll-reveal">
            <span className="inline-block text-orange-500 font-semibold mb-4">TESTIMONIALS</span>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Loved by{' '}
              <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                students
              </span>
            </h2>
            <p className="text-xl text-muted-foreground">
              See how StudyStreak is transforming study habits worldwide.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard key={index} {...testimonial} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-orange-600" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
        
        <div className="container relative">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center text-white"
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Ready to transform your study habits?
            </h2>
            <p className="text-xl opacity-90 mb-10">
              Join 10,000+ students already using StudyStreak to achieve their academic goals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-orange-600 hover:bg-white/90 h-14 px-8 text-lg shadow-xl"
                asChild
              >
                <Link href="/signup">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white/10 h-14 px-8 text-lg"
                asChild
              >
                <Link href="/contact">
                  Talk to Sales
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t bg-muted/30">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center gap-2 font-bold mb-4">
                <Flame className="h-6 w-6 text-orange-500" />
                <span className="text-xl">StudyStreak</span>
              </Link>
              <p className="text-sm text-muted-foreground">
                The AI-powered platform for smarter studying.
              </p>
            </div>
            
            {[
              {
                title: 'Product',
                links: ['Features', 'Pricing', 'Changelog', 'Roadmap']
              },
              {
                title: 'Company',
                links: ['About', 'Blog', 'Careers', 'Contact']
              },
              {
                title: 'Legal',
                links: ['Privacy', 'Terms', 'Security', 'Cookies']
              }
            ].map((section) => (
              <div key={section.title}>
                <h4 className="font-semibold mb-4">{section.title}</h4>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link}>
                      <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t gap-4">
            <p className="text-sm text-muted-foreground">
              © 2026 StudyStreak. All rights reserved.
            </p>
            <div className="flex gap-4">
              {['Twitter', 'GitHub', 'Discord', 'LinkedIn'].map((social) => (
                <Link 
                  key={social}
                  href="#" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {social}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
