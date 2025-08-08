'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  AlertTriangle, 
  Phone, 
  Zap, 
  Clock, 
  Shield, 
  Users,
  ArrowRight,
  Siren,
  MapPin,
  Radio,
  ArrowLeft,
  BarChart3,
  Home,
  Activity
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FloatingNavigation } from '@/components/ui/floating-navigation'

export function EmergencyAccess() {
  const [isCalling, setIsCalling] = useState(false)
  const [emergencyNumber, setEmergencyNumber] = useState('911')

  const emergencyFeatures = [
    {
      icon: Zap,
      title: 'Instant Response',
      description: 'Immediate access to emergency protocols and response teams',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10'
    },
    {
      icon: Phone,
      title: 'Direct Communication',
      description: 'Secure channels to emergency services and first responders',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    {
      icon: MapPin,
      title: 'Location Services',
      description: 'GPS-enabled incident reporting and resource deployment',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      icon: Radio,
      title: 'Multi-Channel Alerts',
      description: 'Broadcast emergency information across all communication channels',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    }
  ]

  const responseStats = [
    { label: 'Average Response', value: '< 90s', icon: Clock },
    { label: 'Success Rate', value: '99.2%', icon: Shield },
    { label: 'Active Responders', value: '2,400+', icon: Users },
    { label: 'Coverage Areas', value: '150+', icon: MapPin }
  ]

  const handleEmergencyCall = () => {
    setIsCalling(true)
    // Simulate emergency call
    setTimeout(() => {
      setIsCalling(false)
      alert('Emergency services have been notified. Help is on the way.')
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Siren className="w-7 h-7 text-white animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Emergency Response System</h1>
                <p className="text-red-100">24/7 Crisis Management & Response</p>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
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
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                asChild
              >
                <Link href="/dashboard">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Emergency Access Card */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <Card className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-red-200 dark:border-red-800 overflow-hidden">
              {/* Emergency Header */}
              <div className="bg-gradient-to-r from-red-600 to-orange-600 p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-7 h-7 text-white animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Emergency Response</h3>
                    <p className="text-red-100">24/7 Crisis Management</p>
                  </div>
                </div>
              </div>

              {/* Response Stats */}
              <div className="p-6 border-b border-red-100 dark:border-red-800">
                <div className="grid grid-cols-2 gap-4">
                  {responseStats.map((stat, index) => {
                    const IconComponent = stat.icon
                    return (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg"
                      >
                        <IconComponent className="w-5 h-5 mx-auto mb-2 text-red-600" />
                        <div className="text-xl font-bold text-slate-900 dark:text-white">
                          {stat.value}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-300">
                          {stat.label}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>

              {/* Emergency Actions */}
              <div className="p-6 space-y-4">
                {/* Emergency Call Button */}
                <Button 
                  size="lg" 
                  className="w-full group bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold py-4 text-lg"
                  onClick={handleEmergencyCall}
                  disabled={isCalling}
                >
                  <Phone className="mr-3 h-5 w-5 animate-pulse" />
                  {isCalling ? 'Connecting...' : 'CALL EMERGENCY SERVICES'}
                  <ArrowRight className="ml-3 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="w-full">
                    <MapPin className="h-4 w-4 mr-2" />
                    Report Location
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Radio className="h-4 w-4 mr-2" />
                    Send Alert
                  </Button>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 text-center">
                  Immediate access to emergency protocols and response coordination
                </p>
              </div>
            </Card>

            {/* 3D Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 to-orange-600/10 rounded-2xl transform rotate-2 -z-10"></div>
          </motion.div>

          {/* Features List */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6"
          >
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                Emergency Response Capabilities
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                Comprehensive emergency management tools designed for rapid response 
                and effective crisis coordination.
              </p>
            </div>

            {emergencyFeatures.map((feature, index) => {
              const IconComponent = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="flex items-start space-x-4 p-4 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-red-200 dark:hover:border-red-800"
                >
                  <div className={`p-3 rounded-lg ${feature.bgColor} flex-shrink-0`}>
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

            {/* Additional CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="pt-6 border-t border-slate-200 dark:border-slate-700"
            >
              <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 p-4 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                    <Activity className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-slate-900 dark:text-white">24/7 Emergency Hotline</h5>
                    <p className="text-sm text-slate-600 dark:text-slate-300">Direct line to emergency coordinators</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Quick Navigation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="pt-6 border-t border-slate-200 dark:border-slate-700"
            >
              <h5 className="font-semibold text-slate-900 dark:text-white mb-4">Quick Navigation</h5>
              <div className="grid grid-cols-1 gap-3">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/dashboard">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Dashboard
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/">
                    <Home className="h-4 w-4 mr-2" />
                    Return to Home
                  </Link>
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Floating Navigation */}
      <FloatingNavigation />
    </div>
  )
}
