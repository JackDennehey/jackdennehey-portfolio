'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  DEFAULT_INTERFACE_THEME,
  INTERFACE_THEME_STORAGE_KEY,
  parseInterfaceTheme,
  type InterfaceTheme,
} from '@/lib/interface-theme'

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
  const [theme, setThemeState] = useState<InterfaceTheme>(DEFAULT_INTERFACE_THEME)
  const [hasManualTheme, setHasManualTheme] = useState(false)

  useEffect(() => {
    const stored = readStoredTheme()
    const resolvedTheme = stored ?? DEFAULT_INTERFACE_THEME
    setThemeState(resolvedTheme)
    setHasManualTheme(stored !== null)
    applyTheme(resolvedTheme)
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
