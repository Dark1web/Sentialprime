'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  BarChart3, 
  Map, 
  AlertTriangle, 
  Shield, 
  TrendingUp, 
  Activity,
  ArrowRight,
  Eye,
  Globe,
  Zap
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card3D, Floating3D } from '@/components/ui/3d-card'
import { ParallaxBackground, FloatingParticles } from '@/components/ui/parallax-background'

export function DashboardPreview() {
  const features = [
    {
      icon: Map,
      title: 'Real-time Disaster Mapping',
      description: 'Interactive maps with live disaster markers and affected areas',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      icon: AlertTriangle,
      title: 'AI-Powered Alerts',
      description: 'Intelligent threat detection and automated emergency notifications',
      color: 'text-red-500',
      bgColor: 'bg-red-500/10'
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'Comprehensive data visualization and predictive insights',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    {
      icon: Shield,
      title: 'Misinformation Detection',
      description: 'Advanced AI algorithms to identify and flag false information',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    }
  ]

  const stats = [
    { label: 'Active Incidents', value: '23', icon: Activity },
    { label: 'Regions Monitored', value: '150+', icon: Globe },
    { label: 'Response Time', value: '< 2min', icon: Zap },
    { label: 'Accuracy Rate', value: '99.7%', icon: TrendingUp }
  ]

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 relative overflow-hidden">
      {/* Background Effects */}
      <FloatingParticles count={30} color="rgba(59, 130, 246, 0.1)" />
      <ParallaxBackground speed={0.3} className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500/5 rounded-full blur-xl" />
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-purple-500/5 rounded-full blur-xl" />
      </ParallaxBackground>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Badge variant="outline" className="mb-4">
              <Eye className="w-4 h-4 mr-2" />
              Intelligence Dashboard
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              Command Center for
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {' '}Disaster Intelligence
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
              Access real-time disaster data, AI-powered insights, and comprehensive analytics 
              through our advanced intelligence dashboard designed for emergency professionals.
            </p>
          </motion.div>
        </div>

        {/* Dashboard Preview Card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="relative mb-16"
        >
          <Card3D
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
            intensity={12}
            scale={1.02}
            glowColor="rgba(59, 130, 246, 0.2)"
          >
            {/* Dashboard Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Floating3D amplitude={5} duration={4}>
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                  </Floating3D>
                  <div>
                    <h3 className="text-xl font-bold text-white">SentinelX Dashboard</h3>
                    <p className="text-blue-100">Real-time Disaster Intelligence</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-white text-sm">Live</span>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((stat, index) => {
                  const IconComponent = stat.icon
                  return (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="text-center p-4 bg-slate-50 dark:bg-slate-700 rounded-lg"
                    >
                      <IconComponent className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                      <div className="text-2xl font-bold text-slate-900 dark:text-white">
                        {stat.value}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-300">
                        {stat.label}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>

            {/* Features Grid */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {features.map((feature, index) => {
                  const IconComponent = feature.icon
                  return (
                    <motion.div
                      key={feature.title}
                      initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="flex items-start space-x-4 p-4 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      <div className={`p-3 rounded-lg ${feature.bgColor}`}>
                        <IconComponent className={`w-6 h-6 ${feature.color}`} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                          {feature.title}
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                          {feature.description}
                        </p>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </Card3D>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link href="/dashboard">
            <Button size="lg" className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              Access Dashboard
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <p className="text-sm text-muted-foreground mt-4">
            Full access to real-time disaster intelligence and AI-powered insights
          </p>
        </motion.div>
      </div>
    </section>
  )
}
