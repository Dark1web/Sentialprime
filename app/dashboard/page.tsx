import { Metadata } from 'next'
import { DashboardContent } from '@/components/dashboard/dashboard-content'

export const metadata: Metadata = {
  title: 'Dashboard - SentinelX',
  description: 'Real-time disaster intelligence dashboard for emergency response and crisis management.',
}

export default function DashboardPage() {
  return <DashboardContent />
}
