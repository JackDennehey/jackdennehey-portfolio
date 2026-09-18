'use client'

import nextDynamic from 'next/dynamic'

export const VoiceLabLoader = nextDynamic(
  () => import('@/components/boch/voice-lab/voice-lab-app').then((mod) => mod.VoiceLabApp),
  { ssr: false, loading: () => <p className="p-8 text-sm">Opening Voice Lab…</p> },
)
