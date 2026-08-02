'use client'

import { useMemo, useState } from 'react'
import type { DesktopPreferences } from '@/lib/desktop-preferences'
import {
  CONCEPT_WALLPAPERS,
  CURRENT_WALLPAPERS,
  DEFAULT_WALLPAPER_ID,
  HIDDEN_WALLPAPERS,
  getWallpaperAsset,
  isHiddenWallpaper,
  isWallpaperUnlocked,
  type Wallpaper,
  type WallpaperId,
} from '@/lib/wallpapers'
import { cn } from '@/lib/utils'
import { WallpaperPreview } from '../wallpaper-manager'
import type { SecretId } from '@/lib/secrets'
import { JackSecretsIcon } from '../jack-icons'

type WallpapersContentProps = {
  preferences: DesktopPreferences
  soundEffectsEnabled: boolean
  onUpdatePreferences: (patch: Partial<DesktopPreferences>) => void
  onResetWallpaper: () => void
  onSetSoundEffectsEnabled: (enabled: boolean) => void
  onFirstCustomWallpaperSet: () => void
  unlockedSecretIds: readonly SecretId[]
  onOpenSecrets: () => void
}

export function WallpapersContent({
  preferences,
  soundEffectsEnabled,
  onUpdatePreferences,
  onResetWallpaper,
  onSetSoundEffectsEnabled,
  onFirstCustomWallpaperSet,
  unlockedSecretIds,
  onOpenSecrets,
}: WallpapersContentProps) {
  const [previewedWallpaperId, setPreviewedWallpaperId] = useState<WallpaperId>(
    preferences.wallpaperId,
  )

  const previewedWallpaperAsset = useMemo(
    () => getWallpaperAsset(previewedWallpaperId),
    [previewedWallpaperId],
  )
  const previewedWallpaper =
    isHiddenWallpaper(previewedWallpaperAsset) &&
    !isWallpaperUnlocked(previewedWallpaperAsset, unlockedSecretIds)
      ? getWallpaperAsset(DEFAULT_WALLPAPER_ID)
      : previewedWallpaperAsset
  const previewedPhaseLabel =
    'phaseLabel' in previewedWallpaper ? previewedWallpaper.phaseLabel : undefined
  const previewedExclusiveLabel =
    'exclusiveLabel' in previewedWallpaper ? previewedWallpaper.exclusiveLabel : undefined
  const canSetWallpaper =
    previewedWallpaper.selectable && isWallpaperUnlocked(previewedWallpaper, unlockedSecretIds)
  const isActiveWallpaper = previewedWallpaper.id === preferences.wallpaperId
  const topDownloadLabel = previewedWallpaper.downloadable
    ? 'Download'
    : isHiddenWallpaper(previewedWallpaper)
      ? 'Download Unavailable'
      : 'Not Downloadable'

  const applyWallpaper = (wallpaper: Wallpaper) => {
    if (!wallpaper.selectable || !isWallpaperUnlocked(wallpaper, unlockedSecretIds)) return
    onUpdatePreferences({ wallpaperId: wallpaper.id })
    if (wallpaper.id !== DEFAULT_WALLPAPER_ID) {
      onFirstCustomWallpaperSet()
    }
  }

  const setWallpaper = () => {
    if (!canSetWallpaper) return
    applyWallpaper(previewedWallpaper)
  }

  const setWallpaperFromCard = (wallpaperId: WallpaperId) => {
    const wallpaper = getWallpaperAsset(wallpaperId)
    setPreviewedWallpaperId(wallpaper.id)
    applyWallpaper(wallpaper)
  }

  const resetWallpaper = () => {
    onResetWallpaper()
    setPreviewedWallpaperId(DEFAULT_WALLPAPER_ID)
  }

  return (
    <div className="mx-auto w-full max-w-[1280px] space-y-5">
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
            {previewedExclusiveLabel ? (
              <p className="font-pixel text-[7px] leading-relaxed text-muted-foreground">
                {previewedExclusiveLabel}
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
              {!canSetWallpaper
                ? 'Preview Only'
                : isActiveWallpaper
                  ? 'Current Wallpaper'
                  : 'Set as Wallpaper'}
            </button>

            {previewedWallpaper.downloadable && previewedWallpaper.imagePath ? (
              <a
                href={previewedWallpaper.imagePath}
                download
                data-wallpaper-preview-download={previewedWallpaper.id}
                className="os-border bg-card px-3 py-2 text-center font-pixel text-[8px] leading-relaxed text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none"
              >
                Download
              </a>
            ) : (
              <button
                type="button"
                disabled
                title={previewedExclusiveLabel}
                className="os-border cursor-default bg-secondary px-3 py-2 text-center font-pixel text-[8px] leading-relaxed text-muted-foreground"
              >
                {topDownloadLabel}
              </button>
            )}

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
        onSetWallpaper={setWallpaperFromCard}
        unlockedSecretIds={unlockedSecretIds}
      />

      <HiddenWallpaperSection
        wallpapers={HIDDEN_WALLPAPERS}
        unlockedSecretIds={unlockedSecretIds}
        activeWallpaperId={preferences.wallpaperId}
        previewedWallpaperId={previewedWallpaper.id}
        onPreview={setPreviewedWallpaperId}
        onSetWallpaper={setWallpaperFromCard}
        onOpenSecrets={onOpenSecrets}
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
        <label className="flex items-center gap-2 text-sm font-medium text-foreground">
          <input
            type="checkbox"
            data-preference-toggle="sound-effects"
            checked={soundEffectsEnabled}
            onChange={(event) => onSetSoundEffectsEnabled(event.target.checked)}
            className="size-4 accent-foreground"
          />
          Sound Effects: {soundEffectsEnabled ? 'On' : 'Off'}
        </label>
      </section>

      <WallpaperSection
        title="Concept Art"
        wallpapers={CONCEPT_WALLPAPERS}
        activeWallpaperId={preferences.wallpaperId}
        previewedWallpaperId={previewedWallpaper.id}
        onPreview={setPreviewedWallpaperId}
        onSetWallpaper={setWallpaperFromCard}
        unlockedSecretIds={unlockedSecretIds}
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
  onSetWallpaper,
  unlockedSecretIds,
}: {
  title: string
  wallpapers: readonly Wallpaper[]
  activeWallpaperId: WallpaperId
  previewedWallpaperId: WallpaperId
  onPreview: (wallpaperId: WallpaperId) => void
  onSetWallpaper: (wallpaperId: WallpaperId) => void
  unlockedSecretIds: readonly SecretId[]
}) {
  return (
    <section className="wallpaper-gallery-section space-y-2">
      <h3 className="font-pixel text-[10px] leading-relaxed text-foreground">
        {title}
      </h3>
      <div className="wallpaper-gallery-grid">
        {wallpapers.map((wallpaper) => (
          <WallpaperTile
            key={wallpaper.id}
            wallpaper={wallpaper}
            active={wallpaper.id === activeWallpaperId}
            previewing={wallpaper.id === previewedWallpaperId}
            onPreview={() => onPreview(wallpaper.id)}
            onSetWallpaper={() => onSetWallpaper(wallpaper.id)}
            unlocked={isWallpaperUnlocked(wallpaper, unlockedSecretIds)}
          />
        ))}
      </div>
    </section>
  )
}

function HiddenWallpaperSection({
  wallpapers,
  unlockedSecretIds,
  activeWallpaperId,
  previewedWallpaperId,
  onPreview,
  onSetWallpaper,
  onOpenSecrets,
}: {
  wallpapers: readonly Wallpaper[]
  unlockedSecretIds: readonly SecretId[]
  activeWallpaperId: WallpaperId
  previewedWallpaperId: WallpaperId
  onPreview: (wallpaperId: WallpaperId) => void
  onSetWallpaper: (wallpaperId: WallpaperId) => void
  onOpenSecrets: () => void
}) {
  return (
    <section className="wallpaper-gallery-section space-y-2">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h3 className="font-pixel text-[10px] leading-relaxed text-foreground">
          Hidden Files
        </h3>
        <p className="font-pixel text-[7px] leading-relaxed text-muted-foreground">
          Unlock through Secrets
        </p>
      </div>
      <div className="wallpaper-gallery-grid">
        {wallpapers.map((wallpaper) =>
          isWallpaperUnlocked(wallpaper, unlockedSecretIds) ? (
            <WallpaperTile
              key={wallpaper.id}
              wallpaper={wallpaper}
              active={wallpaper.id === activeWallpaperId}
              previewing={wallpaper.id === previewedWallpaperId}
              onPreview={() => onPreview(wallpaper.id)}
              onSetWallpaper={() => onSetWallpaper(wallpaper.id)}
              unlocked
            />
          ) : (
            <LockedWallpaperTile key={wallpaper.id} onOpenSecrets={onOpenSecrets} />
          ),
        )}
      </div>
    </section>
  )
}

function LockedWallpaperTile({ onOpenSecrets }: { onOpenSecrets: () => void }) {
  return (
    <article className="os-border flex h-full min-h-44 min-w-0 flex-col bg-card p-2 text-foreground">
      <button
        type="button"
        onClick={onOpenSecrets}
        className="flex h-full flex-1 flex-col text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Locked wallpaper. Unlock through Secrets."
      >
        <span className="grid aspect-video w-full place-items-center border border-current bg-secondary">
          <span
            aria-hidden
            className="os-border grid size-10 place-items-center bg-paper text-foreground"
          >
            <JackSecretsIcon className="size-6" />
          </span>
        </span>
        <span className="mt-2 font-pixel text-[7px] leading-relaxed">
          Locked Wallpaper
        </span>
        <span className="mt-1 block min-h-10 text-xs leading-relaxed opacity-75">
          Unlock through Secrets.
        </span>
        <span className="os-border mt-auto block w-full bg-secondary px-2 py-1 text-center font-pixel text-[7px] leading-relaxed">
          Open Secrets
        </span>
      </button>
    </article>
  )
}

function WallpaperTile({
  wallpaper,
  active,
  previewing,
  onPreview,
  onSetWallpaper,
  unlocked,
}: {
  wallpaper: Wallpaper
  active: boolean
  previewing: boolean
  onPreview: () => void
  onSetWallpaper: () => void
  unlocked: boolean
}) {
  const phaseLabel = 'phaseLabel' in wallpaper ? wallpaper.phaseLabel : undefined
  const exclusiveLabel = 'exclusiveLabel' in wallpaper ? wallpaper.exclusiveLabel : undefined

  return (
    <article
      data-wallpaper-tile-id={wallpaper.id}
      data-wallpaper-collection={wallpaper.collection}
      data-wallpaper-selectable={wallpaper.selectable && unlocked}
      data-wallpaper-active={active}
      className={cn(
        'os-border flex h-full min-h-44 min-w-0 flex-col bg-card p-2 text-foreground',
        active
          ? 'bg-foreground text-primary-foreground outline outline-2 outline-offset-[-6px] outline-current'
          : null,
        previewing && !active ? 'bg-secondary' : null,
      )}
    >
      <button
        type="button"
        data-wallpaper-preview-button={wallpaper.id}
        onClick={onPreview}
        className="flex flex-1 flex-col text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
            <span className="shrink-0 font-pixel text-[7px] leading-relaxed">Current</span>
          ) : previewing ? (
            <span className="shrink-0 font-pixel text-[7px] leading-relaxed">View</span>
          ) : null}
        </span>
        {phaseLabel ? (
          <span className="mt-1 block font-pixel text-[6px] leading-relaxed opacity-75">
            {phaseLabel}
          </span>
        ) : null}
        {exclusiveLabel ? (
          <span className="mt-1 block font-pixel text-[6px] leading-relaxed opacity-75">
            {exclusiveLabel}
          </span>
        ) : null}
        <span className="mt-1 block min-h-10 text-xs leading-relaxed opacity-75">
          {wallpaper.description}
        </span>
      </button>

      {wallpaper.selectable && unlocked ? (
        <button
          type="button"
          disabled={active}
          onClick={onSetWallpaper}
          data-wallpaper-set={wallpaper.id}
          className={cn(
            'os-border mt-2 block w-full px-2 py-1 text-center font-pixel text-[7px] leading-relaxed transition-colors focus-visible:outline-none',
            active
              ? 'cursor-default border-primary-foreground bg-primary-foreground text-foreground'
              : 'bg-card text-foreground hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground',
          )}
        >
          {active ? 'Current' : 'Set Wallpaper'}
        </button>
      ) : exclusiveLabel ? (
        <button
          type="button"
          disabled
          title={exclusiveLabel}
          className="os-border mt-2 block w-full cursor-default bg-secondary px-2 py-1 text-center font-pixel text-[7px] leading-relaxed text-muted-foreground"
        >
          Download Unavailable
        </button>
      ) : wallpaper.downloadable && wallpaper.imagePath ? (
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
