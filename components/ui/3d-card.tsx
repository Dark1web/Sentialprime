'use client'

import React, { useRef, useState } from 'react'
import { motion } from 'framer-motion'

interface Card3DProps {
  children: React.ReactNode
  className?: string
  intensity?: number
  perspective?: number
  scale?: number
  glowColor?: string
}

export function Card3D({ 
  children, 
  className = '', 
  intensity = 15,
  perspective = 1000,
  scale = 1.05,
  glowColor = 'rgba(59, 130, 246, 0.3)'
}: Card3DProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [rotateX, setRotateX] = useState(0)
  const [rotateY, setRotateY] = useState(0)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return

    const card = cardRef.current
    const rect = card.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    const mouseX = e.clientX - centerX
    const mouseY = e.clientY - centerY
    
    const rotateXValue = (mouseY / rect.height) * intensity
    const rotateYValue = -(mouseX / rect.width) * intensity
    
    setRotateX(rotateXValue)
    setRotateY(rotateYValue)
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    setRotateX(0)
    setRotateY(0)
  }

  return (
    <motion.div
      ref={cardRef}
      className={`relative transform-gpu ${className}`}
      style={{ perspective }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      animate={{
        rotateX,
        rotateY,
        scale: isHovered ? scale : 1,
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30,
      }}
      whileHover={{
        boxShadow: `0 20px 40px ${glowColor}`,
      }}
    >
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 rounded-lg opacity-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, ${glowColor}, transparent 70%)`,
          filter: 'blur(20px)',
        }}
        animate={{
          opacity: isHovered ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Card content */}
      <div className="relative z-10 h-full">
        {children}
      </div>
      
      {/* Shine effect */}
      <motion.div
        className="absolute inset-0 rounded-lg pointer-events-none overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          style={{
            transform: 'translateX(-100%)',
          }}
          animate={{
            transform: isHovered ? 'translateX(100%)' : 'translateX(-100%)',
          }}
          transition={{
            duration: 0.8,
            ease: 'easeInOut',
          }}
        />
      </motion.div>
    </motion.div>
  )
}

// Floating 3D element
export function Floating3D({ 
  children, 
  className = '',
  amplitude = 10,
  duration = 3,
  delay = 0
}: {
  children: React.ReactNode
  className?: string
  amplitude?: number
  duration?: number
  delay?: number
}) {
  return (
    <motion.div
      className={className}
      animate={{
        y: [-amplitude, amplitude, -amplitude],
        rotateY: [0, 5, 0, -5, 0],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      }}
    >
      {children}
    </motion.div>
  )
}

// Parallax 3D container
export function Parallax3D({
  children,
  className = '',
  speed = 0.5,
  rotateSpeed = 0.1,
}: {
  children: React.ReactNode
  className?: string
  speed?: number
  rotateSpeed?: number
}) {
  const [scrollY, setScrollY] = useState(0)

  React.useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <motion.div
      className={className}
      style={{
        transform: `translateY(${scrollY * speed}px) rotateX(${scrollY * rotateSpeed}deg)`,
      }}
    >
      {children}
    </motion.div>
  )
}

// 3D Tilt effect
export function Tilt3D({
  children,
  className = '',
  maxTilt = 20,
  scale = 1.1,
  speed = 400,
}: {
  children: React.ReactNode
  className?: string
  maxTilt?: number
  scale?: number
  speed?: number
}) {
  const [transform, setTransform] = useState('')

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const element = e.currentTarget
    const rect = element.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateX = ((y - centerY) / centerY) * maxTilt
    const rotateY = ((centerX - x) / centerX) * maxTilt

    setTransform(
      `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`
    )
  }

  const handleMouseLeave = () => {
    setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)')
  }

  return (
    <div
      className={`transform-gpu transition-transform ${className}`}
      style={{
        transform,
        transitionDuration: `${speed}ms`,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  )
}

// 3D Depth layers
export function Depth3D({
  children,
  layers = 3,
  spacing = 10,
  className = '',
}: {
  children: React.ReactNode
  layers?: number
  spacing?: number
  className?: string
}) {
  return (
    <div className={`relative ${className}`} style={{ transformStyle: 'preserve-3d' }}>
      {Array.from({ length: layers }).map((_, index) => (
        <motion.div
          key={index}
          className="absolute inset-0"
          style={{
            transform: `translateZ(${-index * spacing}px)`,
            opacity: 1 - (index * 0.2),
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 - (index * 0.2) }}
          transition={{ delay: index * 0.1 }}
        >
          {index === 0 ? children : (
            <div className="w-full h-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg" />
          )}
        </motion.div>
      ))}
    </div>
  )
}

// Isometric 3D effect
export function Isometric3D({
  children,
  className = '',
  height = 20,
  color = 'rgba(0, 0, 0, 0.1)',
}: {
  children: React.ReactNode
  className?: string
  height?: number
  color?: string
}) {
  return (
    <div className={`relative ${className}`}>
      {/* Shadow/depth effect */}
      <div
        className="absolute inset-0 rounded-lg"
        style={{
          transform: `translateX(${height / 2}px) translateY(${height / 2}px) skewX(-15deg) skewY(-15deg)`,
          backgroundColor: color,
          zIndex: -1,
        }}
      />
      
      {/* Main content */}
      <div className="relative z-10 bg-white dark:bg-slate-800 rounded-lg">
        {children}
      </div>
    </div>
  )
}
