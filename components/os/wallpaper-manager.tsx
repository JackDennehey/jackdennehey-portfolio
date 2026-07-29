import {
  type ComponentPropsWithoutRef,
  type CSSProperties,
} from 'react'
import { cn } from '@/lib/utils'
import {
  getWallpaper,
  getWallpaperAsset,
  type WallpaperAsset,
  type WallpaperId,
} from '@/lib/wallpapers'

type WallpaperManagerProps = ComponentPropsWithoutRef<'main'> & {
  wallpaperId: WallpaperId
  transitionFromWallpaperId?: WallpaperId | null
}

type WallpaperCssProperties = CSSProperties & {
  '--wallpaper-art'?: string
  '--wallpaper-position'?: string
}

function getWallpaperStyle(wallpaper: WallpaperAsset): WallpaperCssProperties | undefined {
  if (!wallpaper.imagePath && !wallpaper.backgroundPosition) return undefined

  return {
    ...(wallpaper.imagePath ? { '--wallpaper-art': `url('${wallpaper.imagePath}')` } : {}),
    ...(wallpaper.backgroundPosition
      ? { '--wallpaper-position': wallpaper.backgroundPosition }
      : {}),
  }
}

export function WallpaperManager({
  wallpaperId,
  transitionFromWallpaperId,
  className,
  children,
  style,
  ...props
}: WallpaperManagerProps) {
  const wallpaper = getWallpaper(wallpaperId)
  const wallpaperStyle = getWallpaperStyle(wallpaper)
  const transitionWallpaper = transitionFromWallpaperId
    ? getWallpaperAsset(transitionFromWallpaperId)
    : null

  return (
    <main
      {...props}
      data-wallpaper-id={wallpaper.id}
      style={{ ...wallpaperStyle, ...style }}
      className={cn('wallpaper-surface bg-desktop', wallpaper.className, className)}
    >
      {transitionWallpaper ? (
        <span
          aria-hidden
          data-wallpaper-transition="out"
          data-wallpaper-id={transitionWallpaper.id}
          style={getWallpaperStyle(transitionWallpaper)}
          className={cn(
            'wallpaper-surface wallpaper-transition-out pointer-events-none absolute inset-0',
            transitionWallpaper.className,
          )}
        />
      ) : null}
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
  const wallpaper = getWallpaperAsset(wallpaperId)
  const wallpaperStyle = getWallpaperStyle(wallpaper)

  return (
    <span
      aria-hidden
      data-wallpaper-id={wallpaper.id}
      style={wallpaperStyle}
      className={cn('wallpaper-preview block', wallpaper.className, className)}
    />
  )
}
