'use client'

import React from 'react'
import { Shield, Building, Heart, Users, Globe, CheckCircle, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function UseCasesSection() {
  const useCases = [
    {
      icon: Shield,
      title: 'Emergency Services',
      description: 'Fire departments, police, and EMS teams using AI-powered intelligence for faster, more effective emergency response.',
      features: ['Real-time threat detection', 'Automated resource allocation'],
      stats: { users: '2,400+', response: '40%' },
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
    },
    {
      icon: Building,
      title: 'Government Agencies',
      description: 'Federal, state, and local government organizations leveraging comprehensive disaster intelligence for public safety.',
      features: ['Multi-source intelligence fusion', 'Policy decision support'],
      stats: { users: '180+', coverage: '50 states' },
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    }
  ]

  return (
    <section id="use-cases" className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            <Globe className="w-4 h-4 mr-2" />
            Use Cases
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Trusted by Organizations
            <span className="bg-gradient-to-r from-primary to-emergency-orange bg-clip-text text-transparent">
              {' '}Worldwide
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            From emergency services to humanitarian organizations, SentinelX provides 
            AI-powered disaster intelligence that saves lives and protects communities globally.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {useCases.map((useCase, index) => {
            const IconComponent = useCase.icon
            return (
              <div
                key={useCase.title}
                className="bg-card border rounded-2xl p-8 hover:shadow-lg transition-shadow"
              >
                <div className={`inline-flex p-3 rounded-lg ${useCase.bgColor} mb-6`}>
                  <IconComponent className={`w-8 h-8 ${useCase.color}`} />
                </div>
                
                <h3 className="text-2xl font-bold mb-4">{useCase.title}</h3>
                <p className="text-lg text-muted-foreground mb-6">{useCase.description}</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                  {useCase.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center space-x-2">
                      <CheckCircle className={`w-4 h-4 ${useCase.color}`} />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {Object.entries(useCase.stats).map(([key, value]) => (
                    <div key={key} className="text-center">
                      <div className={`text-xl font-bold ${useCase.color} mb-1`}>
                        {value}
                      </div>
                      <div className="text-xs text-muted-foreground capitalize">
                        {key.replace('_', ' ')}
                      </div>
                    </div>
                  ))}
                </div>
                
                <Button className="group">
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
