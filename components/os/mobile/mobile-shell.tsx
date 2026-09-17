'use client'

import type { ReactNode } from 'react'
import type { InterfaceTheme } from '@/lib/interface-theme'
import type { SecretId } from '@/lib/secrets'
import type { WallpaperId } from '@/lib/wallpapers'
import type { WindowId } from '../apps'
import { WINDOW_APPS } from '../apps'
import { MobileAppHeader } from './mobile-app-header'
import { MobileHome } from './mobile-home'
import { MobileSystemPanel } from './mobile-system-panel'

type MobileShellProps = {
  wallpaperId: WallpaperId
  unlockedSecretIds: readonly SecretId[]
  atHome: boolean
  activeAppId?: WindowId
  appContent: ReactNode
  systemPanelOpen: boolean
  theme: InterfaceTheme
  soundEffectsEnabled: boolean
  scanlines: boolean
  onGoHome: () => void
  onOpenApp: (id: string) => void
  onToggleSystemPanel: () => void
  onCloseSystemPanel: () => void
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
  titleOverride?: string
}

export function MobileShell({
  wallpaperId,
  unlockedSecretIds,
  atHome,
  activeAppId,
  appContent,
  systemPanelOpen,
  theme,
  soundEffectsEnabled,
  scanlines,
  onGoHome,
  onOpenApp,
  onToggleSystemPanel,
  onCloseSystemPanel,
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
  titleOverride,
}: MobileShellProps) {
  const appTitle = titleOverride ?? (activeAppId ? WINDOW_APPS[activeAppId].title : 'JackOS')

  return (
    <div className="jackos-mobile-shell">
      {atHome || !activeAppId ? (
        <MobileHome
          wallpaperId={wallpaperId}
          unlockedSecretIds={unlockedSecretIds}
          systemPanelOpen={systemPanelOpen}
          onOpenApp={onOpenApp}
          onToggleSystemPanel={onToggleSystemPanel}
          onOpenSpotlight={onOpenSpotlight}
        />
      ) : (
        <main
          id="jack-os-desktop"
          tabIndex={-1}
          className="jackos-mobile-app"
          data-app={activeAppId}
          aria-label={`${appTitle} in JackOS`}
        >
          <MobileAppHeader
            title={appTitle}
            systemPanelOpen={systemPanelOpen}
            onGoHome={onGoHome}
            onToggleSystemPanel={onToggleSystemPanel}
          />
          <div className="jackos-mobile-app-body" data-app={activeAppId}>
            {appContent}
          </div>
        </main>
      )}

      {systemPanelOpen ? (
        <MobileSystemPanel
          theme={theme}
          soundEffectsEnabled={soundEffectsEnabled}
          scanlines={scanlines}
          onPersonalize={onPersonalize}
          onToggleTheme={onToggleTheme}
          onToggleSoundEffects={onToggleSoundEffects}
          onToggleScanlines={onToggleScanlines}
          onOpenWelcome={onOpenWelcome}
          onOpenRecruiter={onOpenRecruiter}
          onOpenSimpleMode={onOpenSimpleMode}
          onOpenAchievements={onOpenAchievements}
          onRestartSession={onRestartSession}
          onOpenSpotlight={onOpenSpotlight}
          onClose={onCloseSystemPanel}
        />
      ) : null}
    </div>
  )
}
