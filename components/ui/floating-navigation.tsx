'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Home, 
  BarChart3, 
  AlertTriangle, 
  X, 
  ChevronUp,
  Zap,
  Shield,
  Activity
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface FloatingNavigationProps {
  className?: string
}

export function FloatingNavigation({ className }: FloatingNavigationProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 200)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navigationItems = [
    {
      name: 'Home',
      href: '/',
      icon: Home,
      description: 'Landing page with features and demos',
      color: 'from-blue-500 to-purple-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-200'
    },
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: BarChart3,
      description: 'Real-time disaster intelligence',
      color: 'from-green-500 to-teal-500',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-200'
    },
    {
      name: 'Emergency',
      href: '/emergency',
      icon: AlertTriangle,
      description: 'Critical emergency response',
      color: 'from-red-500 to-orange-500',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-200'
    }
  ]

  const currentPage = navigationItems.find(item => item.href === pathname)

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className={`fixed bottom-6 right-6 z-50 ${className}`}
        >
          {/* Main Floating Button */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative"
          >
            <Button
              onClick={() => setIsOpen(!isOpen)}
              className={`h-14 w-14 rounded-full shadow-lg ${
                currentPage?.color 
                  ? `bg-gradient-to-r ${currentPage.color}` 
                  : 'bg-gradient-to-r from-blue-500 to-purple-500'
              } text-white hover:shadow-xl transition-all duration-300`}
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <ChevronUp className="h-6 w-6" />
              )}
            </Button>

            {/* Current Page Indicator */}
            {currentPage && (
              <div className="absolute -top-2 -right-2">
                <Badge 
                  variant="secondary" 
                  className={`text-xs ${currentPage.bgColor} ${currentPage.borderColor}`}
                >
                  {currentPage.name}
                </Badge>
              </div>
            )}
          </motion.div>

          {/* Navigation Menu */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 10 }}
                transition={{ duration: 0.2 }}
                className="absolute bottom-20 right-0 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">Quick Navigation</h3>
                      <p className="text-white/80 text-sm">Access all systems instantly</p>
                    </div>
                  </div>
                </div>

                {/* Navigation Items */}
                <div className="p-4 space-y-3">
                  {navigationItems.map((item, index) => {
                    const IconComponent = item.icon
                    const isActive = pathname === item.href
                    
                    return (
                      <motion.div
                        key={item.name}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <Link href={item.href} onClick={() => setIsOpen(false)}>
                          <div className={`
                            p-4 rounded-xl border transition-all duration-300 hover:shadow-lg
                            ${isActive 
                              ? `${item.bgColor} ${item.borderColor} border-2` 
                              : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                            }
                          `}>
                            <div className="flex items-center space-x-4">
                              <div className={`
                                w-12 h-12 rounded-lg flex items-center justify-center
                                ${isActive 
                                  ? `bg-gradient-to-r ${item.color} text-white` 
                                  : 'bg-slate-100 dark:bg-slate-700'
                                }
                              `}>
                                <IconComponent className="w-6 h-6" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <h4 className={`font-semibold ${
                                    isActive ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'
                                  }`}>
                                    {item.name}
                                  </h4>
                                  {isActive && (
                                    <Badge variant="secondary" className="text-xs">
                                      Active
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                  {item.description}
                                </p>
                              </div>
                              <div className={`
                                w-2 h-2 rounded-full
                                ${isActive ? 'bg-green-500' : 'bg-slate-300'}
                              `} />
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    )
                  })}
                </div>

                {/* Footer */}
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 border-t border-slate-200 dark:border-slate-600">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <Activity className="w-4 h-4 text-green-500" />
                      <span className="text-slate-600 dark:text-slate-400">All systems operational</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      <Zap className="w-3 h-3 mr-1" />
                      Live
                    </Badge>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
