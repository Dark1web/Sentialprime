'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Play, 
  Brain, 
  AlertTriangle, 
  Shield, 
  Satellite,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Zap
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MisinformationDemo } from '@/components/demo/misinformation-demo'
import { TriageDemo } from '@/components/demo/triage-demo'
import { SatelliteDemo } from '@/components/demo/satellite-demo'

const demoTabs = [
  {
    id: 'misinformation',
    label: 'Misinformation Detection',
    icon: Shield,
    description: 'AI-powered fact-checking and credibility analysis',
    color: 'text-green-500',
  },
  {
    id: 'triage',
    label: 'Emergency Triage',
    icon: AlertTriangle,
    description: 'Intelligent emergency classification and prioritization',
    color: 'text-red-500',
  },
  {
    id: 'satellite',
    label: 'Satellite Analysis',
    icon: Satellite,
    description: 'Real-time satellite imagery analysis and damage assessment',
    color: 'text-blue-500',
  },
]

export function DemoSection() {
  const [activeTab, setActiveTab] = useState('misinformation')
  const [isPlaying, setIsPlaying] = useState(false)

  const handlePlayDemo = () => {
    setIsPlaying(true)
    // Auto-stop after demo duration
    setTimeout(() => setIsPlaying(false), 10000)
  }

  return (
    <section id="demo" className="py-20 bg-muted/30">
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
            <Play className="w-4 h-4 mr-2" />
            Interactive Demo
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            See SentinelX
            <span className="bg-gradient-to-r from-primary to-emergency-orange bg-clip-text text-transparent">
              {' '}In Action
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
            Experience our AI-powered disaster intelligence system through interactive demos 
            showcasing real-world crisis response scenarios.
          </p>
          
          <Button
            size="lg"
            onClick={handlePlayDemo}
            disabled={isPlaying}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg font-semibold group"
          >
            {isPlaying ? (
              <>
                <div className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Running Demo...
              </>
            ) : (
              <>
                <Play className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
                Start Interactive Demo
              </>
            )}
          </Button>
        </motion.div>

        {/* Demo Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Tab Navigation */}
            <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 mb-8 bg-background border border-border/50 p-1 rounded-lg">
              {demoTabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex items-center space-x-2 p-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-primary-foreground' : tab.color}`} />
                  <div className="text-left">
                    <div className="font-medium">{tab.label}</div>
                    <div className="text-xs opacity-70 hidden sm:block">{tab.description}</div>
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Tab Content */}
            <div className="bg-background rounded-xl border border-border/50 overflow-hidden">
              <TabsContent value="misinformation" className="m-0">
                <MisinformationDemo isActive={activeTab === 'misinformation'} isPlaying={isPlaying} />
              </TabsContent>
              
              <TabsContent value="triage" className="m-0">
                <TriageDemo isActive={activeTab === 'triage'} isPlaying={isPlaying} />
              </TabsContent>
              
              <TabsContent value="satellite" className="m-0">
                <SatelliteDemo isActive={activeTab === 'satellite'} isPlaying={isPlaying} />
              </TabsContent>
            </div>
          </Tabs>
        </motion.div>

        {/* Demo Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          {[
            { icon: Brain, label: 'AI Accuracy', value: '99.2%', color: 'text-purple-500' },
            { icon: Clock, label: 'Response Time', value: '<12s', color: 'text-blue-500' },
            { icon: CheckCircle, label: 'Verified Reports', value: '847K+', color: 'text-green-500' },
            { icon: Zap, label: 'Processing Speed', value: '2.4M/hr', color: 'text-yellow-500' },
          ].map((stat, index) => (
            <div
              key={stat.label}
              className="text-center p-6 bg-background rounded-lg border border-border/50"
            >
              <div className={`inline-flex p-3 rounded-lg bg-muted mb-4 ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className={`text-2xl font-bold mb-2 ${stat.color}`}>
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <div className="bg-gradient-to-r from-primary/10 to-emergency-orange/10 rounded-2xl p-8 border border-border/50">
            <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Join emergency services and organizations worldwide using SentinelX 
              for advanced disaster intelligence and crisis response.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="px-8">
                Start Free Trial
              </Button>
              <Button size="lg" variant="outline" className="px-8">
                Schedule Demo
              </Button>
              <Button size="lg" variant="emergency" className="px-8">
                <AlertTriangle className="mr-2 h-5 w-5" />
                Emergency Access
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
