'use client'

import { useState, useEffect, useRef } from 'react'
import { useInView } from 'react-intersection-observer'

interface StatsCounterProps {
  end: number
  duration?: number
  delay?: number
  decimals?: number
  start?: number
  className?: string
}

export function StatsCounter({
  end,
  duration = 2000,
  delay = 0,
  decimals = 0,
  start = 0,
  className,
}: StatsCounterProps) {
  const [count, setCount] = useState(start)
  const [hasStarted, setHasStarted] = useState(false)
  const { ref, inView } = useInView({
    threshold: 0.3,
    triggerOnce: true,
  })

  useEffect(() => {
    if (!inView || hasStarted) return

    const startTime = Date.now() + delay
    const endTime = startTime + duration
    const totalChange = end - start

    const timer = setInterval(() => {
      const now = Date.now()
      
      if (now < startTime) return
      
      if (now >= endTime) {
        setCount(end)
        setHasStarted(true)
        clearInterval(timer)
        return
      }

      const progress = (now - startTime) / duration
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      const currentCount = start + totalChange * easeOutQuart
      
      setCount(Math.round(currentCount * Math.pow(10, decimals)) / Math.pow(10, decimals))
    }, 16) // ~60fps

    return () => clearInterval(timer)
  }, [inView, end, start, duration, delay, decimals, hasStarted])

  return (
    <span ref={ref} className={className}>
      {count.toLocaleString()}
    </span>
  )
}
