'use client'

import { useEffect, useRef } from 'react'

const TOP_OF_HOUR_GRACE_SECONDS = 6
const MINIMUM_CHIME_DELAY_MS = 100

function getMsUntilNextHour(now: Date) {
  const nextHour = new Date(now)
  nextHour.setMinutes(0, 0, 0)
  nextHour.setHours(now.getHours() + 1)
  return Math.max(MINIMUM_CHIME_DELAY_MS, nextHour.getTime() - now.getTime())
}

function getHourKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}`
}

function isAtTopOfHour(date: Date) {
  return date.getMinutes() === 0 && date.getSeconds() <= TOP_OF_HOUR_GRACE_SECONDS
}

function isPageActive() {
  return (
    typeof document !== 'undefined' &&
    document.visibilityState === 'visible' &&
    typeof document.hasFocus === 'function' &&
    document.hasFocus()
  )
}

export function useHourlyChime({
  booted,
  enabled,
  soundEffectsEnabled,
  playHourlyChime,
}: {
  booted: boolean
  enabled: boolean
  soundEffectsEnabled: boolean
  playHourlyChime: () => void
}) {
  const lastChimedHour = useRef<string | null>(null)

  useEffect(() => {
    let timer: number | null = null

    const clearTimer = () => {
      if (timer) {
        window.clearTimeout(timer)
        timer = null
      }
    }

    const canSchedule = () => booted && enabled && soundEffectsEnabled && isPageActive()

    const schedule = () => {
      clearTimer()

      if (!canSchedule()) {
        return
      }

      timer = window.setTimeout(() => {
        timer = null
        const now = new Date()
        const hourKey = getHourKey(now)

        if (canSchedule() && isAtTopOfHour(now) && lastChimedHour.current !== hourKey) {
          lastChimedHour.current = hourKey
          playHourlyChime()
        }

        schedule()
      }, getMsUntilNextHour(new Date()))
    }

    const onVisibilityChange = () => schedule()
    const onFocus = () => schedule()
    const onBlur = () => clearTimer()

    schedule()
    document.addEventListener('visibilitychange', onVisibilityChange)
    window.addEventListener('focus', onFocus)
    window.addEventListener('blur', onBlur)
    window.addEventListener('pageshow', onFocus)

    return () => {
      clearTimer()
      document.removeEventListener('visibilitychange', onVisibilityChange)
      window.removeEventListener('focus', onFocus)
      window.removeEventListener('blur', onBlur)
      window.removeEventListener('pageshow', onFocus)
    }
  }, [booted, enabled, playHourlyChime, soundEffectsEnabled])
}
