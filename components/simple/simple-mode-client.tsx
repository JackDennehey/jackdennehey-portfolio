'use client'

import { useEffect, useState } from 'react'
import {
  ACHIEVEMENTS_STORAGE_KEY,
  JACK_OS_ACHIEVEMENT_IDS,
  parseStoredIds,
  type JackOsAchievementId,
} from '@/lib/achievements'

function markSimpleModeAchievement() {
  try {
    const current = parseStoredIds(
      window.localStorage.getItem(ACHIEVEMENTS_STORAGE_KEY),
      JACK_OS_ACHIEVEMENT_IDS,
    )
    const achievementId: JackOsAchievementId = 'simple-mode-opened'
    if (current.includes(achievementId)) return
    window.localStorage.setItem(
      ACHIEVEMENTS_STORAGE_KEY,
      JSON.stringify([...current, achievementId]),
    )
  } catch {
    // Simple Mode must stay usable even when localStorage is unavailable.
  }
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
