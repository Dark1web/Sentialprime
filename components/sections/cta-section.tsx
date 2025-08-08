'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, AlertTriangle, Zap, Shield, Phone, Mail, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function CTASection() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-emergency-blue/10 to-emergency-orange/10 rounded-3xl p-12 border border-border/50">
            {/* Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
              <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emergency-orange/5 rounded-full blur-3xl" />
            </div>
            
            <div className="relative z-10">
              <Badge variant="outline" className="mb-6">
                <Zap className="w-4 h-4 mr-2" />
                Ready to Get Started?
              </Badge>
              
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
                Transform Your
                <span className="bg-gradient-to-r from-primary to-emergency-orange bg-clip-text text-transparent">
                  {' '}Disaster Response
                </span>
              </h2>
              
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
                Join thousands of emergency services, government agencies, and organizations 
                worldwide using SentinelX for AI-powered disaster intelligence and crisis response.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Button size="xl" className="px-10 group" asChild>
                  <Link href="/dashboard">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>

                <Button
                  size="xl"
                  variant="outline"
                  className="px-10"
                  onClick={() => {
                    const contactSection = document.getElementById('contact')
                    if (contactSection) {
                      const headerOffset = 80
                      const elementPosition = contactSection.getBoundingClientRect().top
                      const offsetPosition = elementPosition + window.pageYOffset - headerOffset
                      window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                      })
                    }
                  }}
                >
                  Schedule Demo
                </Button>

                <Button size="xl" variant="emergency" className="px-10 group" asChild>
                  <Link href="/emergency">
                    <AlertTriangle className="mr-2 h-5 w-5 animate-pulse" />
                    Emergency Access
                  </Link>
                </Button>
              </div>
              
              {/* Trust Indicators */}
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span>SOC 2 Compliant</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span>99.9% Uptime SLA</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <span>Setup in 5 minutes</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Emergency Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-8"
        >
          {/* Emergency Setup */}
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-red-500/20 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-red-600 dark:text-red-400">
                  Emergency Setup
                </h3>
                <p className="text-sm text-red-600/80 dark:text-red-400/80">
                  Need immediate access during a crisis?
                </p>
              </div>
            </div>
            
            <p className="text-muted-foreground mb-6">
              Our emergency response team can set up SentinelX for your organization 
              within hours during active disaster situations.
            </p>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-center space-x-2 text-sm">
                <Phone className="w-4 h-4 text-red-500" />
                <span className="font-medium">Emergency Hotline:</span>
                <span>+1 (555) CRISIS-1</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Mail className="w-4 h-4 text-red-500" />
                <span className="font-medium">Emergency Email:</span>
                <span>emergency@sentinelx.ai</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Clock className="w-4 h-4 text-red-500" />
                <span className="font-medium">Response Time:</span>
                <span>&lt; 30 minutes</span>
              </div>
            </div>
            
            <Button variant="emergency" className="w-full" asChild>
              <Link href="/emergency">
                <AlertTriangle className="mr-2 h-4 w-4" />
                Contact Emergency Team
              </Link>
            </Button>
          </div>

          {/* Standard Support */}
          <div className="bg-card border rounded-2xl p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-primary/20 rounded-lg">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Standard Setup</h3>
                <p className="text-sm text-muted-foreground">
                  Get started with our comprehensive onboarding
                </p>
              </div>
            </div>
            
            <p className="text-muted-foreground mb-6">
              Our team will guide you through setup, training, and integration 
              to ensure your organization gets maximum value from SentinelX.
            </p>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-center space-x-2 text-sm">
                <Phone className="w-4 h-4 text-primary" />
                <span className="font-medium">Sales:</span>
                <span>+1 (555) SENTINEL</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Mail className="w-4 h-4 text-primary" />
                <span className="font-medium">Sales Email:</span>
                <span>sales@sentinelx.ai</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Clock className="w-4 h-4 text-primary" />
                <span className="font-medium">Business Hours:</span>
                <span>24/7 Support</span>
              </div>
            </div>
            
            <Button className="w-full" asChild>
              <Link href="/dashboard">
                <Zap className="mr-2 h-4 w-4" />
                Start Free Trial
              </Link>
            </Button>
          </div>
        </motion.div>

        {/* Final Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Every second counts in disaster response. Don't wait for the next crisis to upgrade your capabilities.
            <span className="block mt-2 font-semibold text-foreground">
              Start protecting your community with SentinelX today.
            </span>
          </p>
        </motion.div>
      </div>
    </section>
  )
}
