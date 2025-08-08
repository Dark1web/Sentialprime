import { Metadata } from 'next'
import { EmergencyAccess } from '@/components/emergency/emergency-access'

export const metadata: Metadata = {
  title: 'Emergency Access - SentinelX',
  description: 'Immediate emergency response access for critical disaster situations.',
}

export default function EmergencyPage() {
  return <EmergencyAccess />
}
