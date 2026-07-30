'use client'

import { useEffect, useMemo, useState } from 'react'
import type { InterfaceTheme } from '@/lib/interface-theme'
import {
  CONCEPT_WALLPAPERS,
  CURRENT_WALLPAPERS,
  HIDDEN_WALLPAPERS,
  getWallpaperAsset,
  type WallpaperId,
} from '@/lib/wallpapers'
import {
  JACK_OS_BUILD_IDENTIFIER,
  JACK_OS_COPYRIGHT_YEAR,
  JACK_OS_RELEASE_NAME,
  JACK_OS_VERSION,
} from '@/lib/release'

type SystemInfoContentProps = {
  theme: InterfaceTheme
  scanlines: boolean
  soundEffectsEnabled: boolean
  wallpaperId: WallpaperId
  unlockedSecretCount: number
  viewportCategory: string
  sessionStartedAt: number
  onShowTour: () => void
  onResetDesktopLayout: () => void
  onRestoreDefaultDesktop: () => void
}

function formatUptime(totalSeconds: number) {
  const seconds = Math.max(0, totalSeconds)
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  if (hours > 0) {
    return `${hours} hour${hours === 1 ? '' : 's'} ${minutes} minute${minutes === 1 ? '' : 's'}`
  }
  if (minutes > 0) {
    return `${minutes} minute${minutes === 1 ? '' : 's'}`
  }
  return `${remainingSeconds} second${remainingSeconds === 1 ? '' : 's'}`
}

function useDesktopUptime(startedAt: number) {
  const [seconds, setSeconds] = useState(() => Math.floor((Date.now() - startedAt) / 1000))

  useEffect(() => {
    const update = () => {
      if (document.hidden) return
      setSeconds(Math.floor((Date.now() - startedAt) / 1000))
    }

    update()
    const intervalId = window.setInterval(update, seconds < 60 ? 1000 : 15000)
    document.addEventListener('visibilitychange', update)

    return () => {
      window.clearInterval(intervalId)
      document.removeEventListener('visibilitychange', update)
    }
  }, [seconds, startedAt])

  return formatUptime(seconds)
}

function InfoRow({
  label,
  value,
}: {
  label: string
  value: string | number
}) {
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium text-foreground">{value}</dd>
    </>
  )
}

export function SystemInfoContent({
  theme,
  scanlines,
  soundEffectsEnabled,
  wallpaperId,
  unlockedSecretCount,
  viewportCategory,
  sessionStartedAt,
  onShowTour,
  onResetDesktopLayout,
  onRestoreDefaultDesktop,
}: SystemInfoContentProps) {
  const uptime = useDesktopUptime(sessionStartedAt)
  const wallpaper = useMemo(() => getWallpaperAsset(wallpaperId), [wallpaperId])

  return (
    <div className="space-y-5">
      <section className="os-border bg-secondary p-4">
        <p className="font-pixel text-[10px] leading-relaxed text-muted-foreground">
          {'> system profile'}
        </p>
        <h2 className="mt-3 font-pixel text-base leading-relaxed text-foreground">
          About This Jack OS
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
          Jack OS is an interactive portfolio desktop built by Jack Dennehey.
        </p>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <div className="os-border bg-card p-3">
          <h3 className="font-pixel text-[9px] leading-relaxed text-foreground">
            Release
          </h3>
          <dl className="mt-2 grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-1 text-xs leading-relaxed">
            <InfoRow label="Product" value="Jack OS" />
            <InfoRow label="Version" value={JACK_OS_VERSION} />
            <InfoRow label="Release" value={JACK_OS_RELEASE_NAME} />
            <InfoRow label="Build" value={JACK_OS_BUILD_IDENTIFIER} />
            <InfoRow label="Built By" value="Jack Dennehey" />
          </dl>
        </div>

        <div className="os-border bg-card p-3">
          <h3 className="font-pixel text-[9px] leading-relaxed text-foreground">
            Runtime
          </h3>
          <dl className="mt-2 grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-1 text-xs leading-relaxed">
            <InfoRow label="Theme" value={theme} />
            <InfoRow label="CRT Lines" value={scanlines ? 'On' : 'Off'} />
            <InfoRow label="Sound" value={soundEffectsEnabled ? 'On' : 'Off'} />
            <InfoRow label="Wallpaper" value={wallpaper.displayName} />
            <InfoRow label="Uptime" value={uptime} />
            <InfoRow label="Viewport" value={viewportCategory} />
          </dl>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <div className="os-border bg-card p-3">
          <h3 className="font-pixel text-[9px] leading-relaxed text-foreground">
            Collection
          </h3>
          <dl className="mt-2 grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-1 text-xs leading-relaxed">
            <InfoRow label="Public Wallpapers" value={CURRENT_WALLPAPERS.length} />
            <InfoRow label="Concept Art" value={CONCEPT_WALLPAPERS.length} />
            <InfoRow label="Hidden Files" value={HIDDEN_WALLPAPERS.length} />
            <InfoRow label="Recovered Hidden Files" value={unlockedSecretCount} />
          </dl>
        </div>

        <div className="os-border bg-card p-3">
          <h3 className="font-pixel text-[9px] leading-relaxed text-foreground">
            Built With
          </h3>
          <ul className="mt-2 grid gap-1 text-xs leading-relaxed text-muted-foreground">
            {['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'CSS Motion', 'Vercel'].map(
              (item) => (
                <li key={item}>{item}</li>
              ),
            )}
          </ul>
        </div>
      </section>

      <section className="os-border bg-secondary p-3">
        <h3 className="font-pixel text-[9px] leading-relaxed text-foreground">
          Desktop Utilities
        </h3>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onShowTour}
            className="os-border bg-card px-3 py-2 font-pixel text-[8px] leading-relaxed text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none"
          >
            Show Welcome Tour
          </button>
          <button
            type="button"
            onClick={onResetDesktopLayout}
            className="os-border bg-card px-3 py-2 font-pixel text-[8px] leading-relaxed text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none"
          >
            Reset Desktop Layout
          </button>
          <button
            type="button"
            onClick={onRestoreDefaultDesktop}
            className="os-border bg-card px-3 py-2 font-pixel text-[8px] leading-relaxed text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none"
          >
            Restore Default Desktop
          </button>
        </div>
      </section>

      <p className="font-pixel text-[7px] leading-relaxed text-muted-foreground">
        Copyright {JACK_OS_COPYRIGHT_YEAR} Jack Dennehey. Portfolio data is local to this site.
      </p>
    </div>
  )
}
