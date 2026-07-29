import type { ComponentPropsWithoutRef } from 'react'
import { cn } from '@/lib/utils'
import { getWallpaper, type WallpaperId } from '@/lib/wallpapers'

type WallpaperManagerProps = ComponentPropsWithoutRef<'main'> & {
  wallpaperId: WallpaperId
}

export function WallpaperManager({
  wallpaperId,
  className,
  children,
  ...props
}: WallpaperManagerProps) {
  const wallpaper = getWallpaper(wallpaperId)

  return (
    <main
      {...props}
      data-wallpaper-id={wallpaper.id}
      className={cn('wallpaper-surface bg-desktop', wallpaper.className, className)}
    >
      {children}
    </main>
  )
}

export function WallpaperPreview({
  wallpaperId,
  className,
}: {
  wallpaperId: WallpaperId
  className?: string
}) {
  const wallpaper = getWallpaper(wallpaperId)

  return (
    <span
      aria-hidden
      data-wallpaper-id={wallpaper.id}
      className={cn('wallpaper-preview block', wallpaper.className, className)}
    />
  )
}
