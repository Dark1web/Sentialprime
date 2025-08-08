'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BarChart3, AlertTriangle, Map, Activity, Settings, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { motion } from 'framer-motion'
import React from 'react'

const navItems = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
  { name: 'Emergency', href: '/emergency', icon: AlertTriangle },
]

const secondaryItems = [
  { name: 'Live Map', href: '/dashboard#map', icon: Map },
  { name: 'Activity', href: '/dashboard#activity', icon: Activity },
  { name: 'Settings', href: '/dashboard#settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = React.useState(false)
  const toggle = React.useCallback(() => setCollapsed(prev => {
    const next = !prev
    try { localStorage.setItem('sidebar:collapsed', next ? '1' : '0') } catch {}
    return next
  }), [])
  const [hoverExpanded, setHoverExpanded] = React.useState(false)
  const hoverTimer = React.useRef<number | null>(null)


  // Load persisted state
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('sidebar:collapsed')
      if (saved === '1') setCollapsed(true)
    } catch {}
  }, [])

  // Keyboard shortcut: Ctrl+B to toggle
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault()
        toggle()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [toggle])

  return (
    <aside
      className={`hidden lg:flex lg:flex-col border-r border-border bg-background/60 backdrop-blur-sm transition-[width] duration-200 ease-out ${
        (collapsed && !hoverExpanded) ? 'lg:w-16' : 'lg:w-64'
      }`}
      aria-label="Section navigation"
      aria-expanded={!collapsed}
      onMouseEnter={() => {
        if (!collapsed) return
        if (hoverTimer.current) window.clearTimeout(hoverTimer.current)
        hoverTimer.current = window.setTimeout(() => setHoverExpanded(true), 200)
      }}
      onMouseLeave={() => {
        if (!collapsed) return
        if (hoverTimer.current) window.clearTimeout(hoverTimer.current)
        hoverTimer.current = window.setTimeout(() => setHoverExpanded(false), 100)
      }}
    >
      <div className="p-3 border-b flex items-center justify-between">
        {(!collapsed || hoverExpanded) && (
          <div className="text-sm text-muted-foreground">Navigation</div>
        )}
        <button
          type="button"
          onClick={toggle}
          className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-muted text-foreground"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-pressed={collapsed}
          title={collapsed ? 'Expand (Ctrl+B)' : 'Collapse (Ctrl+B)'}
        >
          {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
        </button>
      </div>

      <nav className="flex-1 p-2 space-y-1">
        {navItems.map(item => {
          const Icon = item.icon
          const active = pathname === item.href
          return (
            <Link key={item.href} href={item.href} title={item.name}>
              <motion.div
                whileHover={{ x: (collapsed && !hoverExpanded) ? 0 : 4 }}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                  active ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-foreground'
                }`}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span className={`text-sm font-medium whitespace-nowrap transition-opacity duration-150 ${
                  (collapsed && !hoverExpanded) ? 'opacity-0 pointer-events-none w-0 overflow-hidden' : 'opacity-100'
                }`}>
                  {item.name}
                </span>
              </motion.div>
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t">
        {(!collapsed || hoverExpanded) && (
          <div className="text-sm text-muted-foreground mb-2">Quick Links</div>
        )}
        <nav className="space-y-1">
          {secondaryItems.map(item => {
            const Icon = item.icon
            return (
              <Link key={item.href} href={item.href} title={item.name}>
                <motion.div
                  whileHover={{ x: (collapsed && !hoverExpanded) ? 0 : 4 }}
                  className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted text-foreground transition-colors"
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span className={`text-sm whitespace-nowrap transition-opacity duration-150 ${
                    (collapsed && !hoverExpanded) ? 'opacity-0 pointer-events-none w-0 overflow-hidden' : 'opacity-100'
                  }`}>
                    {item.name}
                  </span>
                </motion.div>
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}

