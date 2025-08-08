'use client'

import { motion } from 'framer-motion'
import { Star, Quote, Shield, Building, Heart, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const testimonials = [
  {
    quote: "SentinelX has completely transformed our emergency response capabilities. The AI-powered analysis helps us make critical decisions 40% faster, and the accuracy is incredible. We've been able to save more lives and allocate resources more effectively than ever before.",
    author: "Chief Sarah Martinez",
    role: "Fire Chief",
    organization: "Los Angeles Fire Department",
    avatar: "SM",
    rating: 5,
    icon: Shield,
    color: "text-red-500",
    stats: { metric: "Response Time", improvement: "40% faster" }
  },
  {
    quote: "The comprehensive intelligence fusion provided by SentinelX enables us to make informed policy decisions that truly protect our communities. The real-time data and predictive analytics have been game-changing for our disaster preparedness initiatives.",
    author: "Director Michael Chen",
    role: "Regional Director",
    organization: "FEMA",
    avatar: "MC",
    rating: 5,
    icon: Building,
    color: "text-blue-500",
    stats: { metric: "Decision Accuracy", improvement: "60% better" }
  },
  {
    quote: "As a humanitarian organization, SentinelX helps us reach those who need help most, when they need it most. The needs assessment automation and supply chain optimization have transformed our disaster response efficiency.",
    author: "Dr. Amara Okafor",
    role: "Emergency Response Coordinator",
    organization: "International Red Cross",
    avatar: "AO",
    rating: 5,
    icon: Heart,
    color: "text-green-500",
    stats: { metric: "Relief Efficiency", improvement: "75% increase" }
  },
  {
    quote: "Having real-time disaster information and early warnings gives our community peace of mind. The citizen reporting platform has helped us coordinate local response efforts and keep our families safe during emergencies.",
    author: "Maria Rodriguez",
    role: "Community Emergency Coordinator",
    organization: "Miami-Dade Community Response",
    avatar: "MR",
    rating: 5,
    icon: Users,
    color: "text-purple-500",
    stats: { metric: "Community Safety", improvement: "85% satisfaction" }
  },
  {
    quote: "The satellite imagery analysis and damage assessment capabilities are unmatched. We can now assess disaster impact in real-time and coordinate multi-agency responses with unprecedented precision and speed.",
    author: "Colonel James Wright",
    role: "Emergency Management Director",
    organization: "National Guard Bureau",
    avatar: "JW",
    rating: 5,
    icon: Shield,
    color: "text-orange-500",
    stats: { metric: "Assessment Speed", improvement: "300% faster" }
  },
  {
    quote: "SentinelX's misinformation detection has been crucial during crisis events. We can now quickly identify and counter false information, ensuring our communities receive accurate, life-saving information when it matters most.",
    author: "Dr. Lisa Thompson",
    role: "Public Information Officer",
    organization: "California Emergency Services",
    avatar: "LT",
    rating: 5,
    icon: Building,
    color: "text-cyan-500",
    stats: { metric: "Information Accuracy", improvement: "99.2% verified" }
  }
]

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-20 bg-muted/30">
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
            <Star className="w-4 h-4 mr-2" />
            Testimonials
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Trusted by
            <span className="bg-gradient-to-r from-primary to-emergency-orange bg-clip-text text-transparent">
              {' '}Emergency Leaders
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Hear from emergency services, government agencies, and organizations 
            worldwide who rely on SentinelX for critical disaster response operations.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-background rounded-xl p-6 border border-border/50 hover:border-border transition-all duration-300 hover:shadow-lg group"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-emergency-orange/20 rounded-full flex items-center justify-center font-semibold text-sm">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-semibold">{testimonial.author}</h4>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
                
                <div className={`p-2 rounded-lg bg-muted group-hover:${testimonial.color.replace('text-', 'bg-')}/10 transition-colors`}>
                  <testimonial.icon className={`w-5 h-5 ${testimonial.color}`} />
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center space-x-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="text-sm text-muted-foreground ml-2">5.0</span>
              </div>

              {/* Quote */}
              <div className="relative mb-6">
                <Quote className="absolute -top-2 -left-2 w-6 h-6 text-muted-foreground/30" />
                <blockquote className="text-sm leading-relaxed text-muted-foreground italic pl-4">
                  {testimonial.quote}
                </blockquote>
              </div>

              {/* Organization */}
              <div className="text-xs text-muted-foreground mb-4 font-medium">
                {testimonial.organization}
              </div>

              {/* Stats */}
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{testimonial.stats.metric}</span>
                  <span className={`text-sm font-semibold ${testimonial.color}`}>
                    {testimonial.stats.improvement}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="bg-background rounded-2xl p-8 border border-border/50">
            <h3 className="text-xl font-semibold mb-6">Trusted by Organizations Worldwide</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-2">2,400+</div>
                <div className="text-sm text-muted-foreground">Emergency Services</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-2">180+</div>
                <div className="text-sm text-muted-foreground">Government Agencies</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-2">450+</div>
                <div className="text-sm text-muted-foreground">NGOs & Relief Orgs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-2">850K+</div>
                <div className="text-sm text-muted-foreground">Community Users</div>
              </div>
            </div>
            
            <div className="mt-8 flex items-center justify-center space-x-8 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span>4.9/5 Average Rating</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-green-500" />
                <span>99.9% Uptime SLA</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-blue-500" />
                <span>24/7 Support</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
