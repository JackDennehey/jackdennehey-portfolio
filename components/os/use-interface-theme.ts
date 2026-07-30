'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  DEFAULT_INTERFACE_THEME,
  INTERFACE_THEME_STORAGE_KEY,
  isInterfaceTheme,
  parseInterfaceTheme,
  type InterfaceTheme,
} from '@/lib/interface-theme'

function getSystemTheme(): InterfaceTheme {
  if (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  ) {
    return 'dark'
  }

  return DEFAULT_INTERFACE_THEME
}

function readStoredTheme(): InterfaceTheme | null {
  if (typeof window === 'undefined') return null

  try {
    return parseInterfaceTheme(window.localStorage.getItem(INTERFACE_THEME_STORAGE_KEY))
  } catch {
    return null
  }
}

function applyTheme(theme: InterfaceTheme) {
  if (typeof document === 'undefined') return

  document.documentElement.dataset.theme = theme
  document.documentElement.classList.toggle('dark', theme === 'dark')
  document.documentElement.classList.toggle('light', theme === 'light')
}

export function useInterfaceTheme() {
  const [theme, setThemeState] = useState<InterfaceTheme>(() => {
    if (typeof document !== 'undefined') {
      const current = document.documentElement.dataset.theme
      if (isInterfaceTheme(current)) return current
    }

    return readStoredTheme() ?? getSystemTheme()
  })
  const [hasManualTheme, setHasManualTheme] = useState(() => readStoredTheme() !== null)

  useEffect(() => {
    const stored = readStoredTheme()
    const resolvedTheme = stored ?? getSystemTheme()
    setThemeState(resolvedTheme)
    setHasManualTheme(stored !== null)
    applyTheme(resolvedTheme)
  }, [])

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const updateFromSystem = () => {
      if (readStoredTheme() !== null) return
      const nextTheme = media.matches ? 'dark' : 'light'
      setThemeState(nextTheme)
      applyTheme(nextTheme)
    }

    media.addEventListener('change', updateFromSystem)
    return () => media.removeEventListener('change', updateFromSystem)
  }, [])

  const setTheme = useCallback((nextTheme: InterfaceTheme) => {
    setThemeState(nextTheme)
    setHasManualTheme(true)
    applyTheme(nextTheme)

    try {
      window.localStorage.setItem(INTERFACE_THEME_STORAGE_KEY, nextTheme)
    } catch {
      // Theme persistence is best-effort; the visible theme still updates.
    }
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }, [setTheme, theme])

  return { theme, hasManualTheme, setTheme, toggleTheme }
}

