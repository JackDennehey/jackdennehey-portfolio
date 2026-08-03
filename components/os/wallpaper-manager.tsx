'use client'

import {
  type ComponentPropsWithoutRef,
  type CSSProperties,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { cn } from '@/lib/utils'
import {
  DEFAULT_WALLPAPER_ID,
  getWallpaper,
  getWallpaperAsset,
  type WallpaperAsset,
  type WallpaperId,
} from '@/lib/wallpapers'

const preloadedWallpaperPaths = new Set<string>()
const wallpaperPreloadPromises = new Map<string, Promise<void>>()

type WallpaperManagerProps = ComponentPropsWithoutRef<'main'> & {
  wallpaperId: WallpaperId
  unlockedSecretIds?: readonly string[]
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

function preloadWallpaperImage(path: string) {
  if (preloadedWallpaperPaths.has(path)) {
    return Promise.resolve()
  }

  const existing = wallpaperPreloadPromises.get(path)
  if (existing) {
    return existing
  }

  const preloadPromise = new Promise<void>((resolve, reject) => {
    const image = new Image()
    image.decoding = 'async'
    image.onload = () => {
      preloadedWallpaperPaths.add(path)
      wallpaperPreloadPromises.delete(path)
      resolve()
    }
    image.onerror = () => reject(new Error(`Unable to load wallpaper ${path}`))
    image.src = path
  }).catch((error) => {
    wallpaperPreloadPromises.delete(path)
    throw error
  })

  wallpaperPreloadPromises.set(path, preloadPromise)
  return preloadPromise
}

export function WallpaperManager({
  wallpaperId,
  unlockedSecretIds = [],
  className,
  children,
  style,
  ...props
}: WallpaperManagerProps) {
  const targetWallpaper = useMemo(
    () => getWallpaper(wallpaperId, unlockedSecretIds),
    [wallpaperId, unlockedSecretIds],
  )
  const [failedWallpaperId, setFailedWallpaperId] = useState<string | null>(null)
  const wallpaper =
    failedWallpaperId === targetWallpaper.id
      ? getWallpaperAsset(DEFAULT_WALLPAPER_ID)
      : targetWallpaper
  const wallpaperStyle = getWallpaperStyle(wallpaper)

  useEffect(() => {
    setFailedWallpaperId(null)

    if (!targetWallpaper.imagePath) {
      return
    }

    let cancelled = false
    preloadWallpaperImage(targetWallpaper.imagePath)
      .catch(() => {
        if (process.env.NODE_ENV !== 'production') {
          console.warn(`Jack OS wallpaper failed to load: ${targetWallpaper.imagePath}`)
        }
        if (!cancelled) {
          setFailedWallpaperId(targetWallpaper.id)
        }
      })

    return () => {
      cancelled = true
    }
  }, [targetWallpaper])

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
  const wallpaper: WallpaperAsset = getWallpaperAsset(wallpaperId)
  const wallpaperStyle = getWallpaperStyle(wallpaper)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setFailed(false)
  }, [wallpaper.id])

  if (wallpaper.imagePath) {
    return (
      <span
        aria-hidden
        data-wallpaper-id={wallpaper.id}
        className={cn(
          'wallpaper-preview wallpaper-preview-raster block overflow-hidden bg-secondary',
          className,
        )}
      >
        {failed ? (
          <span className="grid h-full min-h-24 w-full place-items-center bg-secondary px-2 text-center font-pixel text-[7px] leading-relaxed text-muted-foreground">
            Image unavailable
          </span>
        ) : (
          <img
            src={wallpaper.imagePath}
            alt=""
            loading="lazy"
            decoding="async"
            onError={() => {
              if (process.env.NODE_ENV !== 'production') {
                console.warn(`Jack OS wallpaper thumbnail failed to load: ${wallpaper.imagePath}`)
              }
              setFailed(true)
            }}
            className="h-full w-full object-cover pixelated"
            style={{ objectPosition: wallpaper.backgroundPosition ?? 'center' }}
          />
        )}
      </span>
    )
  }

  return (
    <span
      aria-hidden
      data-wallpaper-id={wallpaper.id}
      style={wallpaperStyle}
      className={cn('wallpaper-preview block', wallpaper.className, className)}
    />
  )
}
