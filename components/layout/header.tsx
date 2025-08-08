'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Shield, AlertTriangle, Zap, Home, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { useSmoothScroll } from '@/hooks/use-smooth-scroll'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Features', href: '#features' },
  { name: 'Demo', href: '#demo' },
  { name: 'Use Cases', href: '#use-cases' },
  { name: 'Testimonials', href: '#testimonials' },
  { name: 'API Docs', href: '/docs' },
  { name: 'Status', href: '/status' },
]

// Smooth scroll function with easing
const smoothScrollTo = (elementId: string) => {
  const element = document.getElementById(elementId.replace('#', ''))
  if (element) {
    const headerOffset = 80 // Account for fixed header
    const elementPosition = element.getBoundingClientRect().top
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    })
  }
}

// Handle navigation click
const handleNavClick = (href: string, setIsOpen: (open: boolean) => void) => {
  if (href.startsWith('#')) {
    smoothScrollTo(href)
    setIsOpen(false)
  }
}

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isHomePage = pathname === '/'
  const isDashboard = pathname === '/dashboard'
  const isEmergency = pathname === '/emergency'

  return (
    <header
      className={cn(
        'fixed top-0 z-50 w-full transition-all duration-300',
        isScrolled
          ? 'bg-background/80 backdrop-blur-md border-b border-border/50'
          : 'bg-transparent'
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="relative">
              <Shield className="h-8 w-8 text-primary" />
              <div className="absolute -top-1 -right-1 h-3 w-3 bg-emergency-red rounded-full animate-pulse" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-emergency-orange bg-clip-text text-transparent">
              SentinelX
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {isHomePage && navigation.map((item) => (
              item.href.startsWith('#') ? (
                <button
                  key={item.name}
                  onClick={() => handleNavClick(item.href, setIsOpen)}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  {item.name}
                </button>
              ) : (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item.name}
                </Link>
              )
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            
            {/* Always show all navigation buttons */}
            <Button
              variant="outline"
              size="sm"
              className={`text-sm ${isHomePage ? 'bg-primary/10 border-primary/20' : ''}`}
              asChild
            >
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Link>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className={`text-sm ${isDashboard ? 'bg-primary/10 border-primary/20' : ''}`}
              asChild
            >
              <Link href="/dashboard">
                <BarChart3 className="h-4 w-4 mr-2" />
                Dashboard
              </Link>
            </Button>
            
            <Button
              size="sm"
              className={`${isEmergency ? 'bg-red-700' : 'bg-emergency-red hover:bg-emergency-red/90'} text-white`}
              asChild
            >
              <Link href="/emergency">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Emergency
              </Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center space-x-2 md:hidden">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="p-2"
            >
              {isOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-background/95 backdrop-blur-md border-b border-border/50"
          >
            <div className="container mx-auto px-4 py-4">
              <nav className="flex flex-col space-y-4">
                {/* Homepage Navigation */}
                {isHomePage && navigation.map((item) => (
                  item.href.startsWith('#') ? (
                    <button
                      key={item.name}
                      onClick={() => handleNavClick(item.href, setIsOpen)}
                      className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2 text-left"
                    >
                      {item.name}
                    </button>
                  ) : (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                      onClick={() => setIsOpen(false)}
                    >
                      {item.name}
                    </Link>
                  )
                ))}
                
                {/* Quick Navigation Section */}
                <div className="flex flex-col space-y-3 pt-4 border-t border-border/50">
                  {/* Always show all navigation buttons */}
                  <Button
                    variant="outline"
                    size="sm"
                    className={`justify-start ${isHomePage ? 'bg-primary/10 border-primary/20' : ''}`}
                    asChild
                  >
                    <Link href="/" onClick={() => setIsOpen(false)}>
                      <Home className="h-4 w-4 mr-2" />
                      Home
                    </Link>
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className={`justify-start ${isDashboard ? 'bg-primary/10 border-primary/20' : ''}`}
                    asChild
                  >
                    <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Dashboard
                    </Link>
                  </Button>
                  
                  <Button
                    size="sm"
                    className={`justify-start ${isEmergency ? 'bg-red-700' : 'bg-emergency-red hover:bg-emergency-red/90'} text-white`}
                    asChild
                  >
                    <Link href="/emergency" onClick={() => setIsOpen(false)}>
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Emergency Access
                    </Link>
                  </Button>
                </div>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
