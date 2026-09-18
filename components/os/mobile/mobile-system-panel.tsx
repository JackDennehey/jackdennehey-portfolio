'use client'

import { useEffect, useRef, type KeyboardEvent } from 'react'
import type { InterfaceTheme } from '@/lib/interface-theme'

type MobileSystemPanelProps = {
  theme: InterfaceTheme
  soundEffectsEnabled: boolean
  scanlines: boolean
  onPersonalize: () => void
  onToggleTheme: () => void
  onToggleSoundEffects: () => void
  onToggleScanlines: () => void
  onOpenWelcome: () => void
  onOpenRecruiter: () => void
  onOpenSimpleMode: () => void
  onOpenAchievements: () => void
  onRestartSession: () => void
  onOpenSpotlight: () => void
  onClose: () => void
}

export function MobileSystemPanel({
  theme,
  soundEffectsEnabled,
  scanlines,
  onPersonalize,
  onToggleTheme,
  onToggleSoundEffects,
  onToggleScanlines,
  onOpenWelcome,
  onOpenRecruiter,
  onOpenSimpleMode,
  onOpenAchievements,
  onRestartSession,
  onOpenSpotlight,
  onClose,
}: MobileSystemPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const items = getPanelButtons(panelRef.current)
    items[0]?.focus()
  }, [])

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      onClose()
      return
    }

    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp' && event.key !== 'Home' && event.key !== 'End') {
      return
    }

    const items = getPanelButtons(panelRef.current)
    if (items.length === 0) return

    event.preventDefault()
    const currentIndex = items.findIndex((item) => item === document.activeElement)
    let nextIndex = currentIndex
    if (event.key === 'ArrowDown') {
      nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % items.length
    } else if (event.key === 'ArrowUp') {
      nextIndex = currentIndex < 0 ? items.length - 1 : (currentIndex - 1 + items.length) % items.length
    } else if (event.key === 'Home') {
      nextIndex = 0
    } else {
      nextIndex = items.length - 1
    }
    items[nextIndex]?.focus()
  }

  return (
    <div className="jackos-mobile-system-overlay">
      <button
        type="button"
        className="jackos-mobile-system-dismiss"
        aria-label="Close system panel"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        id="jackos-mobile-system-panel"
        role="dialog"
        aria-modal="true"
        aria-label="JackOS system"
        className="jackos-mobile-system-panel"
        onKeyDown={onKeyDown}
      >
        <p className="jackos-mobile-system-kicker">System</p>
        <PanelAction
          label="Spotlight"
          detail="Search apps, projects, and case studies"
          onSelect={() => {
            onClose()
            onOpenSpotlight()
          }}
        />
        <PanelAction
          label="Personalize..."
          detail="Wallpapers and desktop prefs"
          onSelect={() => {
            onPersonalize()
            onClose()
          }}
        />
        <PanelAction
          label={theme === 'dark' ? 'Theme: Dark' : 'Theme: Light'}
          detail="Toggle interface theme"
          onSelect={onToggleTheme}
        />
        <PanelAction
          label={soundEffectsEnabled ? 'Sound: On' : 'Sound: Off'}
          detail="Toggle interface sounds"
          onSelect={onToggleSoundEffects}
        />
        <PanelAction
          label={scanlines ? 'CRT: On' : 'CRT: Off'}
          detail="Scanline overlay"
          onSelect={onToggleScanlines}
        />
        <PanelAction
          label="Welcome"
          detail="JackOS home window"
          onSelect={() => {
            onOpenWelcome()
            onClose()
          }}
        />
        <PanelAction
          label="Recruiter Mode"
          detail="Guided professional overview"
          onSelect={() => {
            onOpenRecruiter()
            onClose()
          }}
        />
        <PanelAction
          label="Simple Mode"
          detail="Linear portfolio view"
          onSelect={() => {
            onOpenSimpleMode()
            onClose()
          }}
        />
        <PanelAction
          label="Achievements"
          detail="Session unlocks"
          onSelect={() => {
            onOpenAchievements()
            onClose()
          }}
        />
        <PanelAction
          label="Restart JackOS"
          detail="Reload this session"
          onSelect={() => {
            onRestartSession()
            onClose()
          }}
        />
      </div>
    </div>
  )
}

function PanelAction({
  label,
  detail,
  onSelect,
}: {
  label: string
  detail: string
  onSelect: () => void
}) {
  return (
    <button type="button" className="jackos-mobile-system-item" onClick={onSelect}>
      <span className="jackos-mobile-system-item-label">{label}</span>
      <span className="jackos-mobile-system-item-detail">{detail}</span>
    </button>
  )
}

function getPanelButtons(root: HTMLDivElement | null) {
  if (!root) return []
  return Array.from(root.querySelectorAll<HTMLButtonElement>('button.jackos-mobile-system-item'))
}
