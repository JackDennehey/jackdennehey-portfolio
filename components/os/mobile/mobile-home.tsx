'use client'

import { Clock } from '../clock'
import { DesktopIcon } from '../desktop-icon'
import { JdenOwlMark, JdenWindowTrigger } from '../jden-launch'
import { WallpaperManager } from '../wallpaper-manager'
import { DESKTOP_ITEMS, WINDOW_APPS } from '../apps'
import type { SecretId } from '@/lib/secrets'
import type { WallpaperId } from '@/lib/wallpapers'

type MobileHomeProps = {
  wallpaperId: WallpaperId
  unlockedSecretIds: readonly SecretId[]
  systemPanelOpen: boolean
  onOpenApp: (id: string) => void
  onToggleSystemPanel: () => void
  onOpenSpotlight: () => void
}

export function MobileHome({
  wallpaperId,
  unlockedSecretIds,
  systemPanelOpen,
  onOpenApp,
  onToggleSystemPanel,
  onOpenSpotlight,
}: MobileHomeProps) {
  return (
    <WallpaperManager
      id="jack-os-desktop"
      tabIndex={-1}
      wallpaperId={wallpaperId}
      unlockedSecretIds={unlockedSecretIds}
      className="jackos-mobile-home"
      aria-label="JackOS Home"
      onContextMenu={(event) => event.preventDefault()}
    >
      <header className="jackos-mobile-status">
        <p className="jackos-mobile-status-identity">JackOS</p>
        <div className="jackos-mobile-status-meta">
          <Clock showDate dateVisibility="always" />
          <button
            type="button"
            className="jackos-mobile-nav-button"
            onClick={onOpenSpotlight}
            aria-label="Open Spotlight"
          >
            Search
          </button>
          <button
            type="button"
            className="jackos-mobile-nav-button"
            aria-expanded={systemPanelOpen}
            aria-controls="jackos-mobile-system-panel"
            onClick={onToggleSystemPanel}
          >
            System
          </button>
        </div>
      </header>

      <section className="jackos-mobile-identity" aria-labelledby="jackos-mobile-home-heading">
        <p className="jackos-mobile-kicker">Jack Dennehey</p>
        <h1 id="jackos-mobile-home-heading" className="jackos-mobile-heading">
          JackOS
        </h1>
        <p className="jackos-mobile-lede">
          Tap an app to explore the work. This is JackOS on a phone, not a miniature desktop.
        </p>
      </section>

      <JdenWindowTrigger
        onOpen={() => onOpenApp('jden-studios')}
        className="jackos-mobile-jden"
      >
        <JdenOwlMark size="menu" className="size-8 shrink-0" />
        <span className="min-w-0 text-left">
          <span className="block font-pixel text-[8px] leading-relaxed">JDEN STUDIOS</span>
          <span className="mt-0.5 block text-[11px] leading-snug opacity-80">
            Independent digital studio
          </span>
        </span>
      </JdenWindowTrigger>

      <nav aria-label="Applications" className="jackos-mobile-home-grid">
        <DesktopIcon
          item={{ kind: 'window', id: 'home', label: 'Welcome', Icon: WINDOW_APPS.home.Icon }}
          variant="mobile"
          onOpenWindow={onOpenApp}
        />
        {DESKTOP_ITEMS.map((item) => (
          <DesktopIcon
            key={item.id}
            item={item}
            variant="mobile"
            onOpenWindow={onOpenApp}
          />
        ))}
      </nav>
    </WallpaperManager>
  )
}
