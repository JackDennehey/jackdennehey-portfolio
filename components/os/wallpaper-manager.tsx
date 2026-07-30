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
  className,
  children,
  style,
  ...props
}: WallpaperManagerProps) {
  const wallpaper = getWallpaper(wallpaperId)
  const wallpaperStyle = getWallpaperStyle(wallpaper)

  return (
    <main
      {...props}
      data-wallpaper-id={wallpaper.id}
      style={{ ...wallpaperStyle, ...style }}
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
