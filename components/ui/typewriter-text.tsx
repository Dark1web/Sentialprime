'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface TypewriterTextProps {
  words: string[]
  className?: string
  typingSpeed?: number
  deletingSpeed?: number
  delayBetweenWords?: number
}

export function TypewriterText({
  words,
  className,
  typingSpeed = 100,
  deletingSpeed = 50,
  delayBetweenWords = 2000,
}: TypewriterTextProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [currentText, setCurrentText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [isWaiting, setIsWaiting] = useState(false)

  useEffect(() => {
    if (words.length === 0) return

    const currentWord = words[currentWordIndex]

    if (isWaiting) {
      const waitTimer = setTimeout(() => {
        setIsWaiting(false)
        setIsDeleting(true)
      }, delayBetweenWords)
      return () => clearTimeout(waitTimer)
    }

    if (isDeleting) {
      if (currentText === '') {
        setIsDeleting(false)
        setCurrentWordIndex((prev) => (prev + 1) % words.length)
        return
      }

      const deleteTimer = setTimeout(() => {
        setCurrentText(currentWord.substring(0, currentText.length - 1))
      }, deletingSpeed)
      return () => clearTimeout(deleteTimer)
    } else {
      if (currentText === currentWord) {
        setIsWaiting(true)
        return
      }

      const typeTimer = setTimeout(() => {
        setCurrentText(currentWord.substring(0, currentText.length + 1))
      }, typingSpeed)
      return () => clearTimeout(typeTimer)
    }
  }, [
    currentText,
    currentWordIndex,
    isDeleting,
    isWaiting,
    words,
    typingSpeed,
    deletingSpeed,
    delayBetweenWords,
  ])

  return (
    <span className={cn('inline-block', className)}>
      <AnimatePresence mode="wait">
        <motion.span
          key={currentText}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.1 }}
        >
          {currentText}
        </motion.span>
      </AnimatePresence>
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse' }}
        className="ml-1"
      >
        |
      </motion.span>
    </span>
  )
}
