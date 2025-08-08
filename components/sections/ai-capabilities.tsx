'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  Brain, 
  Shield, 
  TrendingUp, 
  Zap, 
  Eye, 
  AlertCircle,
  BarChart3,
  Globe,
  Cpu,
  Target,
  Layers,
  Activity
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export function AICapabilities() {
  const aiFeatures = [
    {
      icon: Shield,
      title: 'Misinformation Detection',
      description: 'Advanced NLP algorithms identify and flag false information with 95% accuracy',
      accuracy: '95%',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-200'
    },
    {
      icon: TrendingUp,
      title: 'Predictive Analytics',
      description: 'Machine learning models forecast disaster patterns and impact zones',
      accuracy: '89%',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-200'
    },
    {
      icon: Eye,
      title: 'Real-time Monitoring',
      description: 'Computer vision and sensor fusion for continuous threat assessment',
      accuracy: '99%',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-200'
    },
    {
      icon: Target,
      title: 'Risk Assessment',
      description: 'AI-powered vulnerability analysis and resource allocation optimization',
      accuracy: '92%',
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-200'
    }
  ]

  const aiStats = [
    { label: 'AI Models', value: '12+', icon: Cpu },
    { label: 'Data Points', value: '50M+', icon: BarChart3 },
    { label: 'Processing Speed', value: '< 100ms', icon: Zap },
    { label: 'Global Coverage', value: '150+', icon: Globe }
  ]

  return (
    <section className="py-20 bg-gradient-to-br from-slate-900 to-blue-900 text-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/20 to-purple-600/20"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Badge variant="outline" className="mb-4 border-blue-300 text-blue-300">
              <Brain className="w-4 h-4 mr-2" />
              Artificial Intelligence
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              Advanced AI-Powered
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {' '}Intelligence Engine
              </span>
            </h2>
            <p className="text-lg text-blue-100 max-w-3xl mx-auto mb-8">
              Harness the power of cutting-edge artificial intelligence for disaster prediction, 
              misinformation detection, and intelligent emergency response coordination.
            </p>
          </motion.div>
        </div>

        {/* AI Stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
        >
          {aiStats.map((stat, index) => {
            const IconComponent = stat.icon
            return (
              <div
                key={stat.label}
                className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20"
              >
                <IconComponent className="w-8 h-8 mx-auto mb-3 text-blue-400" />
                <div className="text-3xl font-bold text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-blue-200">
                  {stat.label}
                </div>
              </div>
            )
          })}
        </motion.div>

        {/* AI Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {aiFeatures.map((feature, index) => {
            const IconComponent = feature.icon
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group relative"
              >
                <div className={`bg-white/10 backdrop-blur-sm rounded-2xl p-8 border ${feature.borderColor} border-opacity-30 hover:border-opacity-60 transition-all duration-300 hover:transform hover:scale-105`}>
                  {/* Feature Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className={`p-4 rounded-xl ${feature.bgColor} border ${feature.borderColor} border-opacity-30`}>
                      <IconComponent className={`w-8 h-8 ${feature.color}`} />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">
                        {feature.accuracy}
                      </div>
                      <div className="text-xs text-blue-200">
                        Accuracy
                      </div>
                    </div>
                  </div>

                  {/* Feature Content */}
                  <h3 className="text-xl font-bold text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-blue-100 mb-6">
                    {feature.description}
                  </p>

                  {/* Progress Bar */}
                  <div className="relative">
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: feature.accuracy }}
                        transition={{ duration: 1, delay: index * 0.2 }}
                        viewport={{ once: true }}
                        className={`h-2 rounded-full bg-gradient-to-r ${
                          feature.color.includes('purple') ? 'from-purple-400 to-purple-600' :
                          feature.color.includes('blue') ? 'from-blue-400 to-blue-600' :
                          feature.color.includes('green') ? 'from-green-400 to-green-600' :
                          'from-orange-400 to-orange-600'
                        }`}
                      ></motion.div>
                    </div>
                    <div className="flex justify-between text-xs text-blue-200 mt-2">
                      <span>Performance</span>
                      <span>{feature.accuracy}</span>
                    </div>
                  </div>

                  {/* Hover Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                {/* 3D Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10 rounded-2xl transform rotate-1 -z-10 group-hover:rotate-2 transition-transform duration-300"></div>
              </motion.div>
            )
          })}
        </div>

        {/* AI Processing Visualization */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <div className="flex items-center justify-center space-x-8 mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-300 text-sm">Data Ingestion</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                <span className="text-blue-300 text-sm">AI Processing</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                <span className="text-purple-300 text-sm">Intelligence Output</span>
              </div>
            </div>
            <div className="flex items-center justify-center space-x-4">
              <Activity className="w-6 h-6 text-blue-400" />
              <span className="text-white font-semibold">Real-time AI Processing Active</span>
              <Layers className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
