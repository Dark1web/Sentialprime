'use client'

import { motion } from 'framer-motion'
import { 
  Brain, 
  Satellite, 
  AlertTriangle, 
  Shield, 
  Zap, 
  Globe,
  Users,
  Clock,
  Eye,
  MessageSquare,
  Map,
  Activity
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const coreFeatures = [
  {
    icon: Brain,
    title: 'AI-Powered Analysis',
    description: 'Advanced machine learning models analyze multiple data sources to detect and verify disaster events in real-time.',
    features: ['Misinformation Detection', 'Emergency Triage', 'Threat Assessment', 'Predictive Analytics'],
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
  {
    icon: Satellite,
    title: 'Satellite Intelligence',
    description: 'Real-time satellite imagery analysis using computer vision to identify disaster patterns and damage assessment.',
    features: ['Damage Assessment', 'Change Detection', 'Risk Mapping', 'Environmental Monitoring'],
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    icon: AlertTriangle,
    title: 'Emergency Triage',
    description: 'Intelligent classification and prioritization of emergency situations based on severity and resource requirements.',
    features: ['Priority Classification', 'Resource Allocation', 'Response Coordination', 'Escalation Management'],
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
  },
  {
    icon: Shield,
    title: 'Misinformation Detection',
    description: 'Combat false information during crises with AI-powered fact-checking and credibility assessment.',
    features: ['Fact Verification', 'Source Analysis', 'Credibility Scoring', 'Real-time Monitoring'],
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
  {
    icon: Globe,
    title: 'Global Monitoring',
    description: 'Worldwide disaster monitoring network with 24/7 coverage across all time zones and regions.',
    features: ['Multi-source Data', 'Weather Intelligence', 'Social Media Monitoring', 'News Aggregation'],
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
  },
  {
    icon: Users,
    title: 'Community Reporting',
    description: 'Crowdsourced disaster reporting system enabling communities to contribute real-time ground truth data.',
    features: ['Citizen Reports', 'Image Verification', 'Location Services', 'Community Alerts'],
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-500/10',
  },
]

const technicalFeatures = [
  { icon: Zap, label: 'Real-time Processing', description: 'Sub-second response times' },
  { icon: Clock, label: '24/7 Monitoring', description: 'Continuous global coverage' },
  { icon: Eye, label: 'Multi-modal Analysis', description: 'Text, image, and sensor data' },
  { icon: MessageSquare, label: 'API Integration', description: 'RESTful API for developers' },
  { icon: Map, label: 'Geospatial Intelligence', description: 'Advanced mapping and GIS' },
  { icon: Activity, label: 'Health Monitoring', description: 'System status and alerts' },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge variant="outline" className="mb-4">
            <Zap className="w-4 h-4 mr-2" />
            Core Features
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Advanced AI-Powered
            <span className="bg-gradient-to-r from-primary to-emergency-orange bg-clip-text text-transparent">
              {' '}Crisis Response
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Our comprehensive disaster intelligence platform combines cutting-edge AI, 
            satellite imagery, and real-time data analysis to provide unparalleled 
            crisis response capabilities.
          </p>
        </motion.div>

        {/* Core Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {coreFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative bg-card rounded-xl p-6 border border-border/50 hover:border-border transition-all duration-300 hover:shadow-lg"
            >
              {/* Feature Icon */}
              <div className={`inline-flex p-3 rounded-lg ${feature.bgColor} mb-4`}>
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>

              {/* Feature Content */}
              <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              
              <p className="text-muted-foreground mb-4 leading-relaxed">
                {feature.description}
              </p>

              {/* Feature List */}
              <ul className="space-y-2">
                {feature.features.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-center text-sm">
                    <div className={`w-1.5 h-1.5 rounded-full ${feature.color.replace('text-', 'bg-')} mr-3`} />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>

              {/* Hover Effect */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </motion.div>
          ))}
        </div>

        {/* Technical Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="bg-muted/30 rounded-2xl p-8"
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-4">Technical Capabilities</h3>
            <p className="text-muted-foreground">
              Built with enterprise-grade infrastructure for reliability and scale
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {technicalFeatures.map((tech, index) => (
              <motion.div
                key={tech.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center group"
              >
                <div className="inline-flex p-3 rounded-lg bg-background border border-border/50 mb-3 group-hover:border-primary/50 transition-colors">
                  <tech.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <h4 className="font-medium text-sm mb-1">{tech.label}</h4>
                <p className="text-xs text-muted-foreground">{tech.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Button size="lg" className="mr-4">
            Explore All Features
          </Button>
          <Button size="lg" variant="outline">
            View Documentation
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
