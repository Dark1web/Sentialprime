import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { AuthProvider } from '@/lib/auth'
import { Toaster } from '@/components/ui/toaster'
import { SmoothScrollProvider } from '@/components/ui/smooth-scroll'
import { PageTransition } from '@/components/ui/page-transition'
import { FloatingNavigation } from '@/components/ui/floating-navigation'
import { Header } from '@/components/layout/header'
import { cn } from '@/lib/utils'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'SentinelX - AI-Powered Disaster Intelligence & Crisis Response',
    template: '%s | SentinelX'
  },
  description: 'Advanced AI-powered disaster intelligence and crisis response system providing real-time monitoring, emergency triage, misinformation detection, and community reporting for emergency services, government agencies, and communities worldwide.',
  keywords: [
    'disaster intelligence',
    'crisis response',
    'emergency management',
    'AI disaster detection',
    'real-time monitoring',
    'emergency triage',
    'misinformation detection',
    'disaster preparedness',
    'emergency services',
    'crisis management'
  ],
  authors: [{ name: 'SentinelX Team' }],
  creator: 'SentinelX',
  publisher: 'SentinelX',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'SentinelX - AI-Powered Disaster Intelligence & Crisis Response',
    description: 'Advanced AI-powered disaster intelligence and crisis response system for emergency services and communities.',
    siteName: 'SentinelX',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'SentinelX - AI-Powered Disaster Intelligence',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SentinelX - AI-Powered Disaster Intelligence',
    description: 'Advanced AI-powered disaster intelligence and crisis response system.',
    images: ['/og-image.jpg'],
    creator: '@sentinelx',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'mask-icon', url: '/safari-pinned-tab.svg', color: '#dc2626' },
    ],
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#dc2626" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="SentinelX" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#dc2626" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          inter.variable,
          jetbrainsMono.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <SmoothScrollProvider>
              <Header />
              <div className="relative flex min-h-screen flex-col">
                <div className="flex-1 pt-16">
                  <PageTransition>
                    {children}
                  </PageTransition>
                </div>
              </div>
              <FloatingNavigation />
              <Toaster />
            </SmoothScrollProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
