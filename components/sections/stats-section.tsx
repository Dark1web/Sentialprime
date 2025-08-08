'use client'

import { motion } from 'framer-motion'
import { Activity, Shield, Zap, Globe, Users, Clock } from 'lucide-react'
import { StatsCounter } from '@/components/ui/stats-counter'
import { Badge } from '@/components/ui/badge'

const realTimeStats = [
  {
    icon: Activity,
    label: 'System Status',
    value: 'Operational',
    description: 'All systems running normally',
    color: 'text-green-500',
    badge: 'operational',
  },
  {
    icon: Shield,
    label: 'Active Monitors',
    value: 24847,
    description: 'Global monitoring stations',
    color: 'text-blue-500',
    suffix: '+',
  },
  {
    icon: Zap,
    label: 'AI Analyses Today',
    value: 15293,
    description: 'Real-time threat assessments',
    color: 'text-yellow-500',
    suffix: '+',
  },
  {
    icon: Globe,
    label: 'Countries Covered',
    value: 195,
    description: 'Worldwide disaster monitoring',
    color: 'text-purple-500',
  },
  {
    icon: Users,
    label: 'Lives Protected',
    value: 2847392,
    description: 'People in monitored areas',
    color: 'text-green-500',
    suffix: '+',
  },
  {
    icon: Clock,
    label: 'Avg Response Time',
    value: 12,
    description: 'Seconds to threat detection',
    color: 'text-red-500',
    suffix: 's',
  },
]

export function StatsSection() {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <Badge variant="outline" className="mb-4">
            <Activity className="w-4 h-4 mr-2" />
            Real-time System Status
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Global Disaster Intelligence Network
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our AI-powered system continuously monitors global threats, 
            providing real-time intelligence to emergency responders worldwide.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {realTimeStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-background rounded-lg p-6 border border-border/50 hover:border-border transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-2 rounded-lg bg-muted ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                {stat.badge && (
                  <Badge variant={stat.badge as any} className="text-xs">
                    Live
                  </Badge>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-baseline space-x-2">
                  {typeof stat.value === 'number' ? (
                    <span className={`text-2xl font-bold ${stat.color}`}>
                      <StatsCounter
                        end={stat.value}
                        duration={2000}
                        delay={index * 100}
                      />
                      {stat.suffix}
                    </span>
                  ) : (
                    <span className={`text-2xl font-bold ${stat.color}`}>
                      {stat.value}
                    </span>
                  )}
                </div>
                
                <div>
                  <div className="font-medium text-foreground">{stat.label}</div>
                  <div className="text-sm text-muted-foreground">
                    {stat.description}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Live Activity Feed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
          className="mt-12 bg-background rounded-lg p-6 border border-border/50"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">Live Activity Feed</h3>
            <Badge variant="operational" className="animate-pulse">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
              Live
            </Badge>
          </div>
          
          <div className="space-y-4">
            {[
              {
                time: '2 min ago',
                event: 'Earthquake detected in Pacific Ring of Fire',
                severity: 'high',
                location: 'Japan, 35.6762°N 139.6503°E',
              },
              {
                time: '5 min ago',
                event: 'Wildfire risk assessment updated',
                severity: 'medium',
                location: 'California, USA',
              },
              {
                time: '8 min ago',
                event: 'Flood warning issued via satellite analysis',
                severity: 'low',
                location: 'Bangladesh',
              },
              {
                time: '12 min ago',
                event: 'Hurricane tracking model updated',
                severity: 'critical',
                location: 'Atlantic Ocean',
              },
            ].map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex items-start space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  activity.severity === 'critical' ? 'bg-red-500' :
                  activity.severity === 'high' ? 'bg-orange-500' :
                  activity.severity === 'medium' ? 'bg-yellow-500' :
                  'bg-green-500'
                } animate-pulse`} />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">
                      {activity.event}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {activity.time}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {activity.location}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
