'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  BarChart3, 
  AlertTriangle, 
  ArrowRight, 
  Zap, 
  Shield,
  Globe,
  Activity,
  Clock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card3D } from '@/components/ui/3d-card'

export function QuickAccess() {
  const accessOptions = [
    {
      title: 'Dashboard Access',
      description: 'Real-time disaster intelligence and AI-powered analytics',
      icon: BarChart3,
      href: '/dashboard',
      color: 'from-blue-600 to-purple-600',
      hoverColor: 'from-blue-700 to-purple-700',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-200',
      stats: [
        { label: 'Active Incidents', value: '23' },
        { label: 'Response Time', value: '< 2min' }
      ],
      features: [
        'Live Disaster Mapping',
        'AI-Powered Alerts',
        'Analytics Dashboard',
        'Misinformation Detection'
      ]
    },
    {
      title: 'Emergency Access',
      description: 'Immediate emergency response and crisis management',
      icon: AlertTriangle,
      href: '/emergency',
      color: 'from-red-600 to-orange-600',
      hoverColor: 'from-red-700 to-orange-700',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-200',
      stats: [
        { label: 'Response Time', value: '< 90s' },
        { label: 'Success Rate', value: '99.2%' }
      ],
      features: [
        'Instant Response',
        'Direct Communication',
        'Location Services',
        'Multi-Channel Alerts'
      ]
    }
  ]

  return (
    <section className="py-16 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <Badge variant="outline" className="mb-4">
            <Zap className="w-4 h-4 mr-2" />
            Quick Access
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Direct Access to
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {' '}Critical Systems
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get immediate access to our disaster intelligence dashboard and emergency response system
          </p>
        </motion.div>

        {/* Access Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {accessOptions.map((option, index) => {
            const IconComponent = option.icon
            return (
              <motion.div
                key={option.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <Card3D
                  className={`bg-white dark:bg-slate-800 rounded-2xl shadow-xl border ${option.borderColor} overflow-hidden hover:shadow-2xl transition-all duration-300`}
                  intensity={8}
                  scale={1.02}
                >
                  {/* Card Header */}
                  <div className={`bg-gradient-to-r ${option.color} p-6`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                          <IconComponent className="w-7 h-7 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">{option.title}</h3>
                          <p className="text-white/80 text-sm">{option.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-white text-sm">Available</span>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <div className="grid grid-cols-2 gap-4">
                      {option.stats.map((stat, statIndex) => (
                        <motion.div
                          key={stat.label}
                          initial={{ opacity: 0, scale: 0.8 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.5, delay: statIndex * 0.1 }}
                          viewport={{ once: true }}
                          className="text-center p-3 bg-slate-50 dark:bg-slate-700 rounded-lg"
                        >
                          <div className="text-xl font-bold text-slate-900 dark:text-white">
                            {stat.value}
                          </div>
                          <div className="text-xs text-slate-600 dark:text-slate-300">
                            {stat.label}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Features */}
                  <div className="p-6">
                    <div className="grid grid-cols-1 gap-3 mb-6">
                      {option.features.map((feature, featureIndex) => (
                        <motion.div
                          key={feature}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: featureIndex * 0.1 }}
                          viewport={{ once: true }}
                          className="flex items-center space-x-3"
                        >
                          <div className={`w-2 h-2 rounded-full ${option.bgColor}`}></div>
                          <span className="text-sm text-slate-700 dark:text-slate-300">
                            {feature}
                          </span>
                        </motion.div>
                      ))}
                    </div>

                    {/* CTA Button */}
                    <Link href={option.href}>
                      <Button 
                        size="lg" 
                        className={`w-full group bg-gradient-to-r ${option.color} hover:${option.hoverColor} text-white font-semibold py-3`}
                      >
                        <IconComponent className="mr-2 h-5 w-5" />
                        Access {option.title}
                        <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </Link>
                  </div>
                </Card3D>
              </motion.div>
            )
          })}
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <div className="inline-flex items-center space-x-6 bg-white dark:bg-slate-800 rounded-lg p-4 shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium">24/7 Available</span>
            </div>
            <div className="w-px h-6 bg-slate-300 dark:bg-slate-600"></div>
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium">Secure Access</span>
            </div>
            <div className="w-px h-6 bg-slate-300 dark:bg-slate-600"></div>
            <div className="flex items-center space-x-2">
              <Globe className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium">Global Coverage</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
