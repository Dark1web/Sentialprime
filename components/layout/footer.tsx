'use client'

import Link from 'next/link'
import { Shield, Mail, Phone, MapPin, AlertTriangle, Github, Twitter, Linkedin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const footerLinks = {
  product: [
    { name: 'Features', href: '#features' },
    { name: 'Demo', href: '#demo' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'API Documentation', href: '/docs' },
    { name: 'System Status', href: '/status' },
  ],
  useCases: [
    { name: 'Emergency Services', href: '/use-cases/emergency-services' },
    { name: 'Government Agencies', href: '/use-cases/government' },
    { name: 'NGOs & Relief Orgs', href: '/use-cases/ngos' },
    { name: 'Communities', href: '/use-cases/communities' },
    { name: 'Enterprise', href: '/use-cases/enterprise' },
  ],
  resources: [
    { name: 'Blog', href: '/blog' },
    { name: 'Case Studies', href: '/case-studies' },
    { name: 'Webinars', href: '/webinars' },
    { name: 'Training', href: '/training' },
    { name: 'Support Center', href: '/support' },
  ],
  company: [
    { name: 'About Us', href: '/about' },
    { name: 'Careers', href: '/careers' },
    { name: 'Press', href: '/press' },
    { name: 'Partners', href: '/partners' },
    { name: 'Contact', href: '/contact' },
  ],
  legal: [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Security', href: '/security' },
    { name: 'Compliance', href: '/compliance' },
    { name: 'Cookie Policy', href: '/cookies' },
  ],
}

const emergencyContacts = [
  { label: 'Emergency Hotline', value: '+1 (555) CRISIS-1', icon: Phone },
  { label: 'Emergency Email', value: 'emergency@sentinelx.ai', icon: Mail },
  { label: 'Status Updates', value: 'status.sentinelx.ai', icon: AlertTriangle },
]

const socialLinks = [
  { name: 'Twitter', href: 'https://twitter.com/sentinelx', icon: Twitter },
  { name: 'LinkedIn', href: 'https://linkedin.com/company/sentinelx', icon: Linkedin },
  { name: 'GitHub', href: 'https://github.com/sentinelx', icon: Github },
]

export function Footer() {
  return (
    <footer className="bg-muted/30 border-t border-border/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Emergency Banner */}
        <div className="py-6 border-b border-border/50">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />
                <div>
                  <h3 className="font-semibold text-red-600 dark:text-red-400">
                    Emergency Response Available 24/7
                  </h3>
                  <p className="text-sm text-red-600/80 dark:text-red-400/80">
                    Need immediate disaster intelligence support? Our emergency team is standing by.
                  </p>
                </div>
              </div>
              <Button variant="emergency" size="sm">
                <AlertTriangle className="mr-2 h-4 w-4" />
                Emergency Access
              </Button>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
            {/* Brand Column */}
            <div className="lg:col-span-2">
              <Link href="/" className="flex items-center space-x-2 mb-4">
                <div className="relative">
                  <Shield className="h-8 w-8 text-primary" />
                  <div className="absolute -top-1 -right-1 h-3 w-3 bg-emergency-red rounded-full animate-pulse" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-emergency-orange bg-clip-text text-transparent">
                  SentinelX
                </span>
              </Link>
              
              <p className="text-muted-foreground mb-6 max-w-sm">
                AI-powered disaster intelligence and crisis response system protecting 
                communities worldwide with real-time monitoring and analysis.
              </p>
              
              <div className="space-y-2 mb-6">
                {emergencyContacts.map((contact) => (
                  <div key={contact.label} className="flex items-center space-x-2 text-sm">
                    <contact.icon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{contact.label}:</span>
                    <span className="font-medium">{contact.value}</span>
                  </div>
                ))}
              </div>
              
              <div className="flex items-center space-x-4">
                {socialLinks.map((social) => (
                  <Link
                    key={social.name}
                    href={social.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <social.icon className="w-5 h-5" />
                    <span className="sr-only">{social.name}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Product Links */}
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                {footerLinks.product.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Use Cases Links */}
            <div>
              <h3 className="font-semibold mb-4">Use Cases</h3>
              <ul className="space-y-2">
                {footerLinks.useCases.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources Links */}
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                {footerLinks.resources.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="py-6 border-t border-border/50">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <p className="text-sm text-muted-foreground">
                © 2024 SentinelX. All rights reserved.
              </p>
              <Badge variant="operational" className="text-xs">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                All Systems Operational
              </Badge>
            </div>
            
            <div className="flex items-center space-x-6">
              {footerLinks.legal.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-border/50 text-center">
            <p className="text-xs text-muted-foreground">
              SentinelX is committed to protecting communities worldwide through advanced AI-powered disaster intelligence.
              <br />
              For emergency situations requiring immediate assistance, contact your local emergency services first.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
