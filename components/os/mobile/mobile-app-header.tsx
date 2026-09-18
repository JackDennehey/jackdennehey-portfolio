'use client'

type MobileAppHeaderProps = {
  title: string
  systemPanelOpen: boolean
  onGoHome: () => void
  onToggleSystemPanel: () => void
}

export function MobileAppHeader({
  title,
  systemPanelOpen,
  onGoHome,
  onToggleSystemPanel,
}: MobileAppHeaderProps) {
  return (
    <header className="jackos-mobile-app-header">
      <button
        type="button"
        className="jackos-mobile-nav-button"
        onClick={onGoHome}
        aria-label="Return to JackOS Home"
      >
        ← Home
      </button>
      <h1 className="jackos-mobile-app-title">{title}</h1>
      <button
        type="button"
        className="jackos-mobile-nav-button"
        aria-expanded={systemPanelOpen}
        aria-controls="jackos-mobile-system-panel"
        onClick={onToggleSystemPanel}
      >
        System
      </button>
    </header>
  )
}
