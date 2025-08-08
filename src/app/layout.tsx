import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SentinelX API',
  description: 'AI-Powered Disaster Intelligence & Crisis Response System',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
