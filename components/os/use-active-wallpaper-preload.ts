'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  getWallpaper,
  type Wallpaper,
  type WallpaperId,
} from '@/lib/wallpapers'

type PriorityImage = HTMLImageElement & {
  fetchPriority?: 'high' | 'low' | 'auto'
}

export function useActiveWallpaperPreload(
  wallpaperId: WallpaperId,
  unlockedSecretIds: readonly string[],
  enabled = true,
) {
  const wallpaper = useMemo(
    () => getWallpaper(wallpaperId, unlockedSecretIds),
    [unlockedSecretIds, wallpaperId],
  )
  const imagePath = wallpaper.imagePath
  const [readyImagePath, setReadyImagePath] = useState<string | null>(null)
  const ready = enabled ? !imagePath || readyImagePath === imagePath : false

  useEffect(() => {
    if (!enabled) {
      setReadyImagePath(null)
      return
    }

    if (!imagePath) {
      setReadyImagePath(null)
      return
    }

    let cancelled = false
    setReadyImagePath((current) => (current === imagePath ? current : null))

    const image = new Image() as PriorityImage
    image.decoding = 'async'
    image.fetchPriority = 'high'

    const markReady = () => {
      if (!cancelled) {
        setReadyImagePath(imagePath)
      }
    }

    image.onload = markReady
    image.onerror = markReady
    image.src = imagePath

    if (image.decode) {
      void image.decode().then(markReady).catch(markReady)
    }

    return () => {
      cancelled = true
      image.onload = null
      image.onerror = null
    }
  }, [enabled, imagePath])

  return { ready, wallpaper } satisfies { ready: boolean; wallpaper: Wallpaper }
}
