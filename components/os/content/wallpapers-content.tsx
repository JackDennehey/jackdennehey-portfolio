'use client'

import { useMemo, useState } from 'react'
import type { DesktopPreferences } from '@/lib/desktop-preferences'
import {
  CONCEPT_WALLPAPERS,
  CURRENT_WALLPAPERS,
  DEFAULT_WALLPAPER_ID,
  getWallpaperAsset,
  type Wallpaper,
  type WallpaperId,
} from '@/lib/wallpapers'
import { cn } from '@/lib/utils'
import { WallpaperPreview } from '../wallpaper-manager'

type WallpapersContentProps = {
  preferences: DesktopPreferences
  onUpdatePreferences: (patch: Partial<DesktopPreferences>) => void
  onResetWallpaper: () => void
}

export function WallpapersContent({
  preferences,
  onUpdatePreferences,
  onResetWallpaper,
}: WallpapersContentProps) {
  const [previewedWallpaperId, setPreviewedWallpaperId] = useState<WallpaperId>(
    preferences.wallpaperId,
  )

  const previewedWallpaper = useMemo(
    () => getWallpaperAsset(previewedWallpaperId),
    [previewedWallpaperId],
  )
  const previewedPhaseLabel =
    'phaseLabel' in previewedWallpaper ? previewedWallpaper.phaseLabel : undefined
  const canSetWallpaper = previewedWallpaper.selectable
  const isActiveWallpaper = previewedWallpaper.id === preferences.wallpaperId

  const setWallpaper = () => {
    if (!canSetWallpaper) return
    onUpdatePreferences({ wallpaperId: previewedWallpaper.id })
  }

  const resetWallpaper = () => {
    onResetWallpaper()
    setPreviewedWallpaperId(DEFAULT_WALLPAPER_ID)
  }

  return (
    <div className="space-y-5">
      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_190px]">
        <div className="os-border bg-secondary p-2">
          <WallpaperPreview
            wallpaperId={previewedWallpaper.id}
            className="aspect-video w-full border border-current"
          />
        </div>

        <div className="flex min-w-0 flex-col gap-3">
          <div className="space-y-2">
            <p className="font-pixel text-[10px] leading-relaxed text-foreground">
              {previewedWallpaper.displayName}
            </p>
            {previewedPhaseLabel ? (
              <p className="font-pixel text-[7px] leading-relaxed text-muted-foreground">
                {previewedPhaseLabel}
              </p>
            ) : null}
            <p className="text-sm leading-relaxed text-muted-foreground">
              {previewedWallpaper.description}
            </p>
          </div>

          <div className="mt-auto grid gap-2">
            <button
              type="button"
              onClick={setWallpaper}
              disabled={!canSetWallpaper || isActiveWallpaper}
              className={cn(
                'os-border px-3 py-2 text-center font-pixel text-[8px] leading-relaxed transition-colors focus-visible:outline-none',
                canSetWallpaper && !isActiveWallpaper
                  ? 'bg-card text-foreground hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground'
                  : 'cursor-default bg-secondary text-muted-foreground',
              )}
            >
              {isActiveWallpaper ? 'Current Wallpaper' : 'Set as Wallpaper'}
            </button>

            {previewedWallpaper.downloadable && previewedWallpaper.imagePath ? (
              <a
                href={previewedWallpaper.imagePath}
                download
                className="os-border bg-card px-3 py-2 text-center font-pixel text-[8px] leading-relaxed text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none"
              >
                Download
              </a>
            ) : null}

            <button
              type="button"
              onClick={resetWallpaper}
              className="os-border bg-card px-3 py-2 text-center font-pixel text-[8px] leading-relaxed text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none"
            >
              Reset
            </button>
          </div>
        </div>
      </section>

      <WallpaperSection
        title="Current Collection"
        wallpapers={CURRENT_WALLPAPERS}
        activeWallpaperId={preferences.wallpaperId}
        previewedWallpaperId={previewedWallpaper.id}
        onPreview={setPreviewedWallpaperId}
      />

      <section className="os-border space-y-3 bg-secondary p-3">
        <h3 className="font-pixel text-[10px] leading-relaxed text-foreground">
          Desktop Widgets
        </h3>
        <label className="flex items-center gap-2 text-sm font-medium text-foreground">
          <input
            type="checkbox"
            data-preference-toggle="clock"
            checked={preferences.showClock}
            onChange={(event) => onUpdatePreferences({ showClock: event.target.checked })}
            className="size-4 accent-foreground"
          />
          Desktop Clock
        </label>
        <label className="flex items-center gap-2 text-sm font-medium text-foreground">
          <input
            type="checkbox"
            data-preference-toggle="calendar"
            checked={preferences.showCalendar}
            onChange={(event) => onUpdatePreferences({ showCalendar: event.target.checked })}
            className="size-4 accent-foreground"
          />
          Calendar Widget
        </label>
      </section>

      <WallpaperSection
        title="Concept Art"
        wallpapers={CONCEPT_WALLPAPERS}
        activeWallpaperId={preferences.wallpaperId}
        previewedWallpaperId={previewedWallpaper.id}
        onPreview={setPreviewedWallpaperId}
      />
    </div>
  )
}

function WallpaperSection({
  title,
  wallpapers,
  activeWallpaperId,
  previewedWallpaperId,
  onPreview,
}: {
  title: string
  wallpapers: readonly Wallpaper[]
  activeWallpaperId: WallpaperId
  previewedWallpaperId: WallpaperId
  onPreview: (wallpaperId: WallpaperId) => void
}) {
  return (
    <section className="space-y-2">
      <h3 className="font-pixel text-[10px] leading-relaxed text-foreground">
        {title}
      </h3>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {wallpapers.map((wallpaper) => (
          <WallpaperTile
            key={wallpaper.id}
            wallpaper={wallpaper}
            active={wallpaper.id === activeWallpaperId}
            previewing={wallpaper.id === previewedWallpaperId}
            onPreview={() => onPreview(wallpaper.id)}
          />
        ))}
      </div>
    </section>
  )
}

function WallpaperTile({
  wallpaper,
  active,
  previewing,
  onPreview,
}: {
  wallpaper: Wallpaper
  active: boolean
  previewing: boolean
  onPreview: () => void
}) {
  const phaseLabel = 'phaseLabel' in wallpaper ? wallpaper.phaseLabel : undefined

  return (
    <article
      data-wallpaper-tile-id={wallpaper.id}
      data-wallpaper-collection={wallpaper.collection}
      data-wallpaper-selectable={wallpaper.selectable}
      data-wallpaper-active={active}
      className={cn(
        'os-border min-w-0 bg-card p-2 text-foreground',
        active ? 'bg-foreground text-primary-foreground' : null,
        previewing && !active ? 'bg-secondary' : null,
      )}
    >
      <button
        type="button"
        data-wallpaper-preview-button={wallpaper.id}
        onClick={onPreview}
        className="block w-full text-left focus-visible:outline-none"
        aria-pressed={previewing}
      >
        <WallpaperPreview
          wallpaperId={wallpaper.id}
          className="aspect-video w-full border border-current"
        />
        <span className="mt-2 flex min-w-0 items-start justify-between gap-2">
          <span className="min-w-0 font-pixel text-[7px] leading-relaxed [overflow-wrap:anywhere]">
            {wallpaper.displayName}
          </span>
          {active ? (
            <span className="shrink-0 font-pixel text-[7px] leading-relaxed">Set</span>
          ) : previewing ? (
            <span className="shrink-0 font-pixel text-[7px] leading-relaxed">View</span>
          ) : null}
        </span>
        {phaseLabel ? (
          <span className="mt-1 block font-pixel text-[6px] leading-relaxed opacity-75">
            {phaseLabel}
          </span>
        ) : null}
        <span className="mt-1 block text-xs leading-relaxed opacity-75">
          {wallpaper.description}
        </span>
      </button>

      {wallpaper.downloadable && wallpaper.imagePath ? (
        <a
          href={wallpaper.imagePath}
          download
          data-wallpaper-download={wallpaper.id}
          className={cn(
            'os-border mt-2 block px-2 py-1 text-center font-pixel text-[7px] leading-relaxed transition-colors focus-visible:outline-none',
            active
              ? 'border-primary-foreground bg-transparent text-primary-foreground hover:bg-primary-foreground hover:text-foreground focus-visible:bg-primary-foreground focus-visible:text-foreground'
              : 'bg-card text-foreground hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground',
          )}
        >
          Download
        </a>
      ) : null}
    </article>
  )
}
