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
  unlockedSecretIds?: readonly string[]
}

type WallpaperCssProperties = CSSProperties & {
  '--wallpaper-art'?: string
  '--wallpaper-position'?: string
  '--wallpaper-base'?: string
}

function getWallpaperStyle(
  wallpaper: WallpaperAsset,
  imagePath = wallpaper.imagePath,
): WallpaperCssProperties | undefined {
  if (!imagePath && !wallpaper.backgroundPosition && !wallpaper.fallbackColor) return undefined

  return {
    ...(wallpaper.fallbackColor ? { '--wallpaper-base': wallpaper.fallbackColor } : {}),
    ...(imagePath ? { '--wallpaper-art': `url('${imagePath}')` } : {}),
    ...(wallpaper.backgroundPosition
      ? { '--wallpaper-position': wallpaper.backgroundPosition }
      : {}),
  }
}

export function WallpaperManager({
  wallpaperId,
  unlockedSecretIds = [],
  className,
  children,
  style,
  ...props
}: WallpaperManagerProps) {
  const wallpaper = getWallpaper(wallpaperId, unlockedSecretIds)
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
  full = false,
  priority = false,
}: {
  wallpaperId: WallpaperId
  className?: string
  full?: boolean
  priority?: boolean
}) {
  const wallpaper: WallpaperAsset = getWallpaperAsset(wallpaperId)
  const imagePath = full ? wallpaper.imagePath : wallpaper.thumbnailPath ?? wallpaper.imagePath
  const wallpaperStyle = getWallpaperStyle(wallpaper, imagePath ? null : undefined)

  return (
    <span
      aria-hidden
      data-wallpaper-id={wallpaper.id}
      style={wallpaperStyle}
      className={cn(
        'wallpaper-preview relative block overflow-hidden',
        imagePath ? null : wallpaper.className,
        className,
      )}
    >
      {imagePath ? (
        <img
          src={imagePath}
          alt=""
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'low'}
          className="absolute inset-0 size-full object-cover"
          style={{ objectPosition: wallpaper.backgroundPosition ?? 'center' }}
        />
      ) : null}
    </span>
  )
}
