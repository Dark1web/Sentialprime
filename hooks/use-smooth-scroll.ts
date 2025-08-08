'use client'

import { useCallback } from 'react'

interface SmoothScrollOptions {
  offset?: number
  duration?: number
  easing?: 'linear' | 'easeInOut' | 'easeOut' | 'easeIn'
}

export function useSmoothScroll() {
  const scrollToElement = useCallback((
    elementId: string, 
    options: SmoothScrollOptions = {}
  ) => {
    const {
      offset = 80, // Default offset for fixed header
      duration = 800,
      easing = 'easeInOut'
    } = options

    const element = document.getElementById(elementId)
    if (!element) {
      console.warn(`Element with id "${elementId}" not found`)
      return
    }

    const targetPosition = element.getBoundingClientRect().top + window.pageYOffset - offset
    const startPosition = window.pageYOffset
    const distance = targetPosition - startPosition
    let startTime: number | null = null

    // Easing functions
    const easingFunctions = {
      linear: (t: number) => t,
      easeInOut: (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
      easeOut: (t: number) => t * (2 - t),
      easeIn: (t: number) => t * t
    }

    const easingFunction = easingFunctions[easing]

    function animation(currentTime: number) {
      if (startTime === null) startTime = currentTime
      const timeElapsed = currentTime - startTime
      const progress = Math.min(timeElapsed / duration, 1)
      
      const easedProgress = easingFunction(progress)
      const currentPosition = startPosition + (distance * easedProgress)
      
      window.scrollTo(0, currentPosition)
      
      if (progress < 1) {
        requestAnimationFrame(animation)
      }
    }

    // Add visual feedback
    element.style.transition = 'box-shadow 0.3s ease'
    element.style.boxShadow = '0 0 20px rgba(59, 130, 246, 0.3)'
    
    setTimeout(() => {
      element.style.boxShadow = ''
    }, 1000)

    requestAnimationFrame(animation)
  }, [])

  const scrollToTop = useCallback((options: SmoothScrollOptions = {}) => {
    const { duration = 600, easing = 'easeOut' } = options
    
    const startPosition = window.pageYOffset
    let startTime: number | null = null

    const easingFunctions = {
      linear: (t: number) => t,
      easeInOut: (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
      easeOut: (t: number) => t * (2 - t),
      easeIn: (t: number) => t * t
    }

    const easingFunction = easingFunctions[easing]

    function animation(currentTime: number) {
      if (startTime === null) startTime = currentTime
      const timeElapsed = currentTime - startTime
      const progress = Math.min(timeElapsed / duration, 1)
      
      const easedProgress = easingFunction(progress)
      const currentPosition = startPosition * (1 - easedProgress)
      
      window.scrollTo(0, currentPosition)
      
      if (progress < 1) {
        requestAnimationFrame(animation)
      }
    }

    requestAnimationFrame(animation)
  }, [])

  return {
    scrollToElement,
    scrollToTop
  }
}

// Utility function for handling navigation clicks
export function handleSmoothNavigation(
  href: string, 
  closeMenu?: (value: boolean) => void,
  options?: SmoothScrollOptions
) {
  if (href.startsWith('#')) {
    const elementId = href.substring(1)
    const { scrollToElement } = useSmoothScroll()
    scrollToElement(elementId, options)
    
    if (closeMenu) {
      closeMenu(false)
    }
  }
}
