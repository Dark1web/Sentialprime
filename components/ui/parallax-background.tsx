'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface ParallaxBackgroundProps {
  children: React.ReactNode
  className?: string
  speed?: number
  direction?: 'up' | 'down' | 'left' | 'right'
}

export function ParallaxBackground({
  children,
  className = '',
  speed = 0.5,
  direction = 'up'
}: ParallaxBackgroundProps) {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const getTransform = () => {
    const offset = scrollY * speed
    switch (direction) {
      case 'up':
        return `translateY(-${offset}px)`
      case 'down':
        return `translateY(${offset}px)`
      case 'left':
        return `translateX(-${offset}px)`
      case 'right':
        return `translateX(${offset}px)`
      default:
        return `translateY(-${offset}px)`
    }
  }

  return (
    <div
      className={`relative ${className}`}
      style={{
        transform: getTransform(),
        willChange: 'transform',
      }}
    >
      {children}
    </div>
  )
}

// Animated gradient background
export function AnimatedGradient({
  className = '',
  colors = ['#3b82f6', '#8b5cf6', '#ec4899'],
  duration = 10,
}: {
  className?: string
  colors?: string[]
  duration?: number
}) {
  return (
    <motion.div
      className={`absolute inset-0 ${className}`}
      style={{
        background: `linear-gradient(-45deg, ${colors.join(', ')})`,
        backgroundSize: '400% 400%',
      }}
      animate={{
        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  )
}

// Floating particles background
export function FloatingParticles({
  count = 50,
  className = '',
  color = 'rgba(59, 130, 246, 0.3)',
  size = 4,
}: {
  count?: number
  className?: string
  color?: string
  size?: number
}) {
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 5,
    duration: 10 + Math.random() * 20,
  }))

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: size,
            height: size,
            backgroundColor: color,
          }}
          animate={{
            y: [-20, -100],
            opacity: [0, 1, 0],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

// 3D Grid background
export function Grid3D({
  className = '',
  size = 50,
  color = 'rgba(59, 130, 246, 0.1)',
}: {
  className?: string
  size?: number
  color?: string
}) {
  return (
    <div className={`absolute inset-0 ${className}`}>
      <svg
        className="w-full h-full"
        style={{
          transform: 'perspective(1000px) rotateX(60deg)',
          transformOrigin: 'center center',
        }}
      >
        <defs>
          <pattern
            id="grid3d"
            width={size}
            height={size}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={`M ${size} 0 L 0 0 0 ${size}`}
              fill="none"
              stroke={color}
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid3d)" />
      </svg>
    </div>
  )
}

// Morphing blob background
export function MorphingBlob({
  className = '',
  color = 'rgba(59, 130, 246, 0.1)',
  size = 300,
}: {
  className?: string
  color?: string
  size?: number
}) {
  return (
    <motion.div
      className={`absolute rounded-full ${className}`}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, ${color}, transparent 70%)`,
        filter: 'blur(40px)',
      }}
      animate={{
        scale: [1, 1.2, 0.8, 1],
        rotate: [0, 180, 360],
        borderRadius: ['50%', '40%', '60%', '50%'],
      }}
      transition={{
        duration: 20,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  )
}

// Geometric shapes background
export function GeometricShapes({
  className = '',
  count = 20,
}: {
  className?: string
  count?: number
}) {
  const shapes = Array.from({ length: count }, (_, i) => ({
    id: i,
    type: ['circle', 'square', 'triangle'][Math.floor(Math.random() * 3)],
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 20 + Math.random() * 40,
    rotation: Math.random() * 360,
    duration: 10 + Math.random() * 20,
    delay: Math.random() * 5,
  }))

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {shapes.map((shape) => (
        <motion.div
          key={shape.id}
          className="absolute"
          style={{
            left: `${shape.x}%`,
            top: `${shape.y}%`,
            width: shape.size,
            height: shape.size,
          }}
          animate={{
            rotate: [shape.rotation, shape.rotation + 360],
            scale: [0.5, 1, 0.5],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: shape.duration,
            repeat: Infinity,
            delay: shape.delay,
            ease: 'easeInOut',
          }}
        >
          {shape.type === 'circle' && (
            <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20" />
          )}
          {shape.type === 'square' && (
            <div className="w-full h-full bg-gradient-to-br from-green-500/20 to-blue-500/20 rotate-45" />
          )}
          {shape.type === 'triangle' && (
            <div
              className="w-full h-full bg-gradient-to-br from-purple-500/20 to-pink-500/20"
              style={{
                clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
              }}
            />
          )}
        </motion.div>
      ))}
    </div>
  )
}

// Wave animation background
export function WaveBackground({
  className = '',
  color = 'rgba(59, 130, 246, 0.1)',
  amplitude = 20,
  frequency = 0.02,
  speed = 0.01,
}: {
  className?: string
  color?: string
  amplitude?: number
  frequency?: number
  speed?: number
}) {
  const [time, setTime] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setTime((prev) => prev + speed)
    }, 16)
    return () => clearInterval(interval)
  }, [speed])

  const generatePath = (offset: number = 0) => {
    const points = []
    for (let x = 0; x <= 100; x += 2) {
      const y = 50 + Math.sin((x * frequency) + time + offset) * amplitude
      points.push(`${x},${y}`)
    }
    return `M0,100 L${points.join(' L')} L100,100 Z`
  }

  return (
    <div className={`absolute inset-0 ${className}`}>
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path
          d={generatePath(0)}
          fill={color}
          opacity="0.3"
        />
        <path
          d={generatePath(Math.PI / 2)}
          fill={color}
          opacity="0.2"
        />
        <path
          d={generatePath(Math.PI)}
          fill={color}
          opacity="0.1"
        />
      </svg>
    </div>
  )
}
