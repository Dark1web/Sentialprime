import type { Metadata } from 'next'
import { Sidebar } from '@/components/layout/sidebar'

export const metadata: Metadata = {
  title: 'Emergency - SentinelX',
}

export default function EmergencySectionLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex gap-6">
        <Sidebar />
        <div className="flex-1 min-h-[calc(100vh-8rem)]">{children}</div>
      </div>
    </div>
  )
}

