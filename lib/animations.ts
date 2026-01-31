'use client'

import { useEffect, useRef, useCallback } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

// ==================== GSAP CONFIGURATION ====================

export const gsapConfig = {
  // Default animation settings
  defaults: {
    duration: 0.8,
    ease: 'power3.out',
  },
  // Scroll trigger defaults
  scrollTrigger: {
    start: 'top 80%',
    end: 'bottom 20%',
    toggleActions: 'play none none reverse',
  },
}

// ==================== ANIMATION PRESETS ====================

export const animations = {
  // Fade animations
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
  fadeInUp: {
    from: { opacity: 0, y: 60 },
    to: { opacity: 1, y: 0 },
  },
  fadeInDown: {
    from: { opacity: 0, y: -60 },
    to: { opacity: 1, y: 0 },
  },
  fadeInLeft: {
    from: { opacity: 0, x: -60 },
    to: { opacity: 1, x: 0 },
  },
  fadeInRight: {
    from: { opacity: 0, x: 60 },
    to: { opacity: 1, x: 0 },
  },

  // Scale animations
  scaleIn: {
    from: { opacity: 0, scale: 0.8 },
    to: { opacity: 1, scale: 1 },
  },
  scaleInBounce: {
    from: { opacity: 0, scale: 0.5 },
    to: { opacity: 1, scale: 1, ease: 'elastic.out(1, 0.5)' },
  },

  // Slide animations
  slideInLeft: {
    from: { x: '-100%', opacity: 0 },
    to: { x: '0%', opacity: 1 },
  },
  slideInRight: {
    from: { x: '100%', opacity: 0 },
    to: { x: '0%', opacity: 1 },
  },

  // Reveal animations
  clipReveal: {
    from: { clipPath: 'inset(0 100% 0 0)' },
    to: { clipPath: 'inset(0 0% 0 0)' },
  },
  clipRevealUp: {
    from: { clipPath: 'inset(100% 0 0 0)' },
    to: { clipPath: 'inset(0% 0 0 0)' },
  },

  // Rotation animations
  rotateIn: {
    from: { opacity: 0, rotation: -15, y: 30 },
    to: { opacity: 1, rotation: 0, y: 0 },
  },

  // 3D animations
  flip3D: {
    from: { opacity: 0, rotationY: 90 },
    to: { opacity: 1, rotationY: 0, ease: 'power2.out' },
  },
}

// ==================== CUSTOM HOOKS ====================

// Check if reduced motion is preferred
export function useReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// GSAP animation hook
export function useGSAP<T extends HTMLElement = HTMLDivElement>(
  animation: keyof typeof animations | { from: gsap.TweenVars; to: gsap.TweenVars },
  options: {
    trigger?: boolean
    delay?: number
    duration?: number
    stagger?: number
    onComplete?: () => void
    scrollTriggerOptions?: ScrollTrigger.Vars
  } = {}
) {
  const ref = useRef<T>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (!ref.current || reducedMotion) return

    const anim = typeof animation === 'string' ? animations[animation] : animation
    const { trigger = true, delay = 0, duration = 0.8, stagger = 0, onComplete, scrollTriggerOptions } = options

    const tween = gsap.fromTo(
      ref.current,
      anim.from,
      {
        ...anim.to,
        duration,
        delay,
        stagger,
        onComplete,
        scrollTrigger: trigger
          ? {
              trigger: ref.current,
              ...gsapConfig.scrollTrigger,
              ...scrollTriggerOptions,
            }
          : undefined,
      }
    )

    return () => {
      tween.kill()
    }
  }, [animation, options, reducedMotion])

  return ref
}

// Stagger children animation hook
export function useStaggerAnimation<T extends HTMLElement = HTMLDivElement>(
  animation: keyof typeof animations = 'fadeInUp',
  options: {
    stagger?: number
    delay?: number
    duration?: number
    childSelector?: string
  } = {}
) {
  const ref = useRef<T>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (!ref.current || reducedMotion) return

    const { stagger = 0.1, delay = 0, duration = 0.6, childSelector = ':scope > *' } = options
    const anim = animations[animation]
    const children = ref.current.querySelectorAll(childSelector)

    const tween = gsap.fromTo(
      children,
      anim.from,
      {
        ...anim.to,
        duration,
        delay,
        stagger,
        scrollTrigger: {
          trigger: ref.current,
          ...gsapConfig.scrollTrigger,
        },
      }
    )

    return () => {
      tween.kill()
    }
  }, [animation, options, reducedMotion])

  return ref
}

// Parallax scroll hook
export function useParallax<T extends HTMLElement = HTMLDivElement>(
  speed: number = 0.5,
  direction: 'vertical' | 'horizontal' = 'vertical'
) {
  const ref = useRef<T>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (!ref.current || reducedMotion) return

    const prop = direction === 'vertical' ? 'y' : 'x'
    
    const tween = gsap.to(ref.current, {
      [prop]: () => window.innerHeight * speed * -1,
      ease: 'none',
      scrollTrigger: {
        trigger: ref.current,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    })

    return () => {
      tween.kill()
    }
  }, [speed, direction, reducedMotion])

  return ref
}

// Text reveal animation hook
export function useTextReveal<T extends HTMLElement = HTMLDivElement>(
  options: {
    type?: 'chars' | 'words' | 'lines'
    stagger?: number
    duration?: number
  } = {}
) {
  const ref = useRef<T>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (!ref.current || reducedMotion) return

    const { type = 'words', stagger = 0.05, duration = 0.8 } = options
    const element = ref.current
    const text = element.textContent || ''
    
    let items: string[]
    if (type === 'chars') {
      items = text.split('')
    } else if (type === 'words') {
      items = text.split(' ')
    } else {
      items = [text]
    }

    element.innerHTML = items
      .map(item => `<span class="inline-block overflow-hidden"><span class="inline-block">${item}${type === 'words' ? '&nbsp;' : ''}</span></span>`)
      .join('')

    const spans = element.querySelectorAll('span > span')

    const tween = gsap.fromTo(
      spans,
      { y: '100%', opacity: 0 },
      {
        y: '0%',
        opacity: 1,
        duration,
        stagger,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: element,
          ...gsapConfig.scrollTrigger,
        },
      }
    )

    return () => {
      tween.kill()
      element.textContent = text
    }
  }, [options, reducedMotion])

  return ref
}

// ==================== ANIMATION UTILITIES ====================

// Create scroll-triggered timeline
export function createScrollTimeline(
  trigger: Element | string,
  options: ScrollTrigger.Vars = {}
): gsap.core.Timeline {
  return gsap.timeline({
    scrollTrigger: {
      trigger,
      ...gsapConfig.scrollTrigger,
      ...options,
    },
  })
}

// Animate element into view
export function animateIn(
  element: Element | Element[] | string,
  animation: keyof typeof animations = 'fadeInUp',
  options: gsap.TweenVars = {}
): gsap.core.Tween {
  const anim = animations[animation]
  return gsap.fromTo(element, anim.from, { ...anim.to, ...options })
}

// Animate element out of view
export function animateOut(
  element: Element | Element[] | string,
  animation: keyof typeof animations = 'fadeInUp',
  options: gsap.TweenVars = {}
): gsap.core.Tween {
  const anim = animations[animation]
  return gsap.fromTo(element, anim.to, { ...anim.from, ...options })
}

// Magnetic button effect
export function useMagneticEffect<T extends HTMLElement = HTMLButtonElement>(
  strength: number = 0.3
) {
  const ref = useRef<T>(null)
  const reducedMotion = useReducedMotion()

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!ref.current || reducedMotion) return

    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    const deltaX = (e.clientX - centerX) * strength
    const deltaY = (e.clientY - centerY) * strength

    gsap.to(ref.current, {
      x: deltaX,
      y: deltaY,
      duration: 0.3,
      ease: 'power2.out',
    })
  }, [strength, reducedMotion])

  const handleMouseLeave = useCallback(() => {
    if (!ref.current) return
    
    gsap.to(ref.current, {
      x: 0,
      y: 0,
      duration: 0.5,
      ease: 'elastic.out(1, 0.3)',
    })
  }, [])

  useEffect(() => {
    const element = ref.current
    if (!element || reducedMotion) return

    element.addEventListener('mousemove', handleMouseMove)
    element.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      element.removeEventListener('mousemove', handleMouseMove)
      element.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [handleMouseMove, handleMouseLeave, reducedMotion])

  return ref
}

// Smooth scroll to element
export function scrollToElement(
  selector: string | Element,
  options: { offset?: number; duration?: number } = {}
): void {
  const { offset = 0, duration = 1 } = options
  const element = typeof selector === 'string' ? document.querySelector(selector) : selector
  
  if (!element) return

  const y = element.getBoundingClientRect().top + window.scrollY + offset

  gsap.to(window, {
    scrollTo: { y, autoKill: false },
    duration,
    ease: 'power3.inOut',
  })
}

// Batch animation for performance
export function batchAnimate(
  elements: Element[] | NodeListOf<Element>,
  animation: keyof typeof animations = 'fadeInUp',
  options: {
    stagger?: number
    duration?: number
    scrollTrigger?: boolean
  } = {}
): gsap.core.Tween {
  const { stagger = 0.1, duration = 0.6, scrollTrigger = true } = options
  const anim = animations[animation]

  return gsap.fromTo(
    elements,
    anim.from,
    {
      ...anim.to,
      duration,
      stagger,
      scrollTrigger: scrollTrigger
        ? {
            trigger: elements[0],
            ...gsapConfig.scrollTrigger,
          }
        : undefined,
    }
  )
}

// Kill all ScrollTriggers (cleanup)
export function killAllScrollTriggers(): void {
  ScrollTrigger.getAll().forEach(trigger => trigger.kill())
}

// Refresh ScrollTrigger (after DOM changes)
export function refreshScrollTrigger(): void {
  ScrollTrigger.refresh()
}

export default gsap
