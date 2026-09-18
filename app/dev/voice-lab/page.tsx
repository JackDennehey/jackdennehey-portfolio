import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'BOCH Voice Lab',
  robots: { index: false, follow: false },
}

export default async function VoiceLabPage() {
  if (process.env.NODE_ENV === 'production') notFound()
  const { VoiceLabLoader } = await import('./voice-lab-loader')
  return <VoiceLabLoader />
}
