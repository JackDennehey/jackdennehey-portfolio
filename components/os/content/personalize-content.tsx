'use client'

import type { DesktopPreferences } from '@/lib/desktop-preferences'
import { WALLPAPERS } from '@/lib/wallpapers'
import { cn } from '@/lib/utils'
import { WallpaperPreview } from '../wallpaper-manager'

type PersonalizeContentProps = {
  preferences: DesktopPreferences
  onUpdatePreferences: (patch: Partial<DesktopPreferences>) => void
  onResetWallpaper: () => void
}

export function PersonalizeContent({
  preferences,
  onUpdatePreferences,
  onResetWallpaper,
}: PersonalizeContentProps) {
  return (
    <div className="space-y-5">
      <section className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-pixel text-[10px] leading-relaxed text-foreground">
            Wallpaper
          </h3>
          <button
            type="button"
            onClick={onResetWallpaper}
            className="os-border bg-card px-2.5 py-1.5 font-pixel text-[8px] leading-none text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none"
          >
            Reset
          </button>
        </div>

        <div className="os-border bg-secondary p-2">
          <WallpaperPreview wallpaperId={preferences.wallpaperId} className="h-28 w-full" />
        </div>
      </section>

      <section className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {WALLPAPERS.map((wallpaper) => {
          const selected = wallpaper.id === preferences.wallpaperId
          return (
            <button
              key={wallpaper.id}
              type="button"
              aria-pressed={selected}
              onClick={() => onUpdatePreferences({ wallpaperId: wallpaper.id })}
              className={cn(
                'os-border p-2 text-left transition-colors focus-visible:outline-none',
                selected
                  ? 'bg-foreground text-primary-foreground'
                  : 'bg-card text-foreground hover:bg-secondary focus-visible:bg-secondary',
              )}
            >
              <WallpaperPreview
                wallpaperId={wallpaper.id}
                className="h-12 w-full border border-current"
              />
              <span className="mt-2 block font-pixel text-[7px] leading-relaxed">
                {wallpaper.name}
              </span>
            </button>
          )
        })}
      </section>

      <section className="os-border space-y-3 bg-secondary p-3">
        <h3 className="font-pixel text-[10px] leading-relaxed text-foreground">
          Desktop Widgets
        </h3>
        <label className="flex items-center gap-2 text-sm font-medium text-foreground">
          <input
            type="checkbox"
            checked={preferences.showClock}
            onChange={(event) => onUpdatePreferences({ showClock: event.target.checked })}
            className="size-4 accent-foreground"
          />
          Desktop Clock
        </label>
        <label className="flex items-center gap-2 text-sm font-medium text-foreground">
          <input
            type="checkbox"
            checked={preferences.showCalendar}
            onChange={(event) => onUpdatePreferences({ showCalendar: event.target.checked })}
            className="size-4 accent-foreground"
          />
          Calendar Widget
        </label>
      </section>
    </div>
  )
}
