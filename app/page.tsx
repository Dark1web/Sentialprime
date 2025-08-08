import { Metadata } from 'next'
import { HeroSection } from '@/components/sections/hero-section'
import { QuickAccess } from '@/components/sections/quick-access'
import { FeaturesSection } from '@/components/sections/features-section'
import { DashboardPreview } from '@/components/sections/dashboard-preview'
import { EmergencyAccess } from '@/components/sections/emergency-access'
import { AICapabilities } from '@/components/sections/ai-capabilities'
import { StatsSection } from '@/components/sections/stats-section'
import { TestimonialsSection } from '@/components/sections/testimonials-section'
import { CTASection } from '@/components/sections/cta-section'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ScrollProgress, NavigationDots, BackToTopButton } from '@/components/ui/scroll-progress'
import { StickyQuickNav } from '@/components/ui/sticky-quick-nav'
import { FloatingNavigation } from '@/components/ui/floating-navigation'

export const metadata: Metadata = {
  title: 'SentinelX - AI-Powered Disaster Intelligence & Crisis Response',
  description: 'Advanced AI-powered disaster intelligence and crisis response system providing real-time monitoring, emergency triage, misinformation detection, and community reporting for emergency services worldwide.',
}

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollProgress />
      <StickyQuickNav />
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section id="home">
          <HeroSection />
        </section>

        {/* Quick Access */}
        <section id="quick-access">
          <QuickAccess />
        </section>

        {/* Dashboard Preview */}
        <section id="dashboard-preview">
          <DashboardPreview />
        </section>

        {/* Emergency Access */}
        <section id="emergency-access">
          <EmergencyAccess />
        </section>

        {/* AI Capabilities */}
        <section id="ai-capabilities">
          <AICapabilities />
        </section>

        {/* Core Features */}
        <section id="features">
          <FeaturesSection />
        </section>

        {/* Real-time Stats */}
        <section id="stats">
          <StatsSection />
        </section>

        {/* Testimonials */}
        <section id="testimonials">
          <TestimonialsSection />
        </section>

        {/* Final CTA */}
        <section id="contact">
          <CTASection />
        </section>
      </main>

      <Footer />

      {/* Navigation enhancements */}
      <NavigationDots />
      <BackToTopButton />
      <FloatingNavigation />
    </div>
  )
}
