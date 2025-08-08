'use client'

import { useEffect } from 'react'

// Enhanced smooth scrolling utility
export const smoothScrollTo = (elementId: string, offset: number = 80) => {
  const element = document.getElementById(elementId.replace('#', ''))
  if (!element) return

  const headerOffset = offset
  const elementPosition = element.getBoundingClientRect().top
  const offsetPosition = elementPosition + window.pageYOffset - headerOffset

  // Use native smooth scrolling if supported
  if ('scrollBehavior' in document.documentElement.style) {
    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    })
  } else {
    // Fallback for older browsers with eased animation
    const startPosition = window.pageYOffset
    const distance = offsetPosition - startPosition
    const duration = 800
    let start: number | null = null

    const step = (timestamp: number) => {
      if (!start) start = timestamp
      const progress = timestamp - start
      const progressPercentage = Math.min(progress / duration, 1)
      
      // Easing function (ease-in-out)
      const ease = progressPercentage < 0.5
        ? 2 * progressPercentage * progressPercentage
        : 1 - Math.pow(-2 * progressPercentage + 2, 3) / 2

      window.scrollTo(0, startPosition + distance * ease)

      if (progress < duration) {
        requestAnimationFrame(step)
      }
    }

    requestAnimationFrame(step)
  }
}

// Hook to add smooth scrolling to all anchor links
export function useSmoothScroll() {
  useEffect(() => {
    const handleClick = (e: Event) => {
      const target = e.target as HTMLElement
      const href = target.getAttribute('href')
      
      if (href && href.startsWith('#')) {
        e.preventDefault()
        smoothScrollTo(href)
      }
    }

    // Add event listeners to all anchor links
    const links = document.querySelectorAll('a[href^="#"]')
    links.forEach(link => {
      link.addEventListener('click', handleClick)
    })

    return () => {
      links.forEach(link => {
        link.removeEventListener('click', handleClick)
      })
    }
  }, [])
}

// Component to enable smooth scrolling globally
export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  useSmoothScroll()
  return <>{children}</>
}
