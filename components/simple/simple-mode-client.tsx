'use client'

import { useEffect, useState } from 'react'
import { persistAchievementId } from '@/lib/achievements'

function markSimpleModeAchievement() {
  persistAchievementId('simple-mode-opened')
}

export function SimpleModeAchievementMarker() {
  useEffect(() => {
    markSimpleModeAchievement()
  }, [])

  return null
}

export function CopyEmailButton({ email }: { email: string }) {
  const [copied, setCopied] = useState(false)

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(email)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      window.location.href = `mailto:${email}`
    }
  }

  return (
    <button
      type="button"
      onClick={copyEmail}
      className="simple-action"
      aria-live="polite"
    >
      {copied ? 'Email Copied' : 'Copy Email'}
    </button>
  )
}
