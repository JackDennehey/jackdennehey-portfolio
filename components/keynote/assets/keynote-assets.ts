import type { KeynoteAssetFormat, KeynoteAssetId, KeynoteChapterId } from '../types/keynote'

export type KeynoteAsset = {
  id: KeynoteAssetId
  path: string
  alt: string
  format: KeynoteAssetFormat
  chapterId?: KeynoteChapterId
  focalPosition: string
  overlayPreference: 'light' | 'medium' | 'dark'
  preloadPriority: 'cover' | 'next' | 'lazy'
  caption?: string
}

export const SUPPORTED_KEYNOTE_ASSET_FORMATS: KeynoteAssetFormat[] = [
  'png',
  'jpg',
  'jpeg',
  'webp',
  'avif',
]

export const KEYNOTE_ASSET_REGISTRY: Record<KeynoteAssetId, KeynoteAsset> = {
  sailboats: {
    id: 'sailboats',
    path: '/Keynote/keynote-slide-1-sailboats.PNG',
    alt: 'Sailboats moving across open blue water.',
    format: 'png',
    chapterId: 'opening',
    focalPosition: 'center',
    overlayPreference: 'light',
    preloadPriority: 'cover',
    caption: 'Open water and alignment.',
  },
  'school-of-fish': {
    id: 'school-of-fish',
    path: '/Keynote/keynote-slide-2-school-of-fish.WEBP',
    alt: 'A school of fish moving together under water.',
    format: 'webp',
    chapterId: 'technical-divide',
    focalPosition: 'center',
    overlayPreference: 'medium',
    preloadPriority: 'next',
    caption: 'Coordination and shared movement.',
  },
  sharks: {
    id: 'sharks',
    path: '/Keynote/keynote-slide-3-sharks.JPG',
    alt: 'Sharks swimming through blue water.',
    format: 'jpg',
    chapterId: 'financial-friction',
    focalPosition: 'center',
    overlayPreference: 'dark',
    preloadPriority: 'lazy',
    caption: 'Exposure and competition.',
  },
  sunlight: {
    id: 'sunlight',
    path: '/Keynote/keynote-slide-4-sunlight.JPG',
    alt: 'Sunlight passing through ocean water.',
    format: 'jpg',
    chapterId: 'blue-ocean',
    focalPosition: 'center',
    overlayPreference: 'medium',
    preloadPriority: 'lazy',
    caption: 'Clarity and opportunity.',
  },
  'ocean-floor': {
    id: 'ocean-floor',
    path: '/Keynote/keynote-slide-5-ocean-floor.AVIF',
    alt: 'A quiet ocean floor scene.',
    format: 'avif',
    chapterId: 'simplicity',
    focalPosition: 'center',
    overlayPreference: 'medium',
    preloadPriority: 'lazy',
    caption: 'Depth, calm, and conclusion.',
  },
}

export function getKeynoteAsset(id: KeynoteAssetId) {
  return KEYNOTE_ASSET_REGISTRY[id]
}

export function getNextKeynoteAssetId(
  assetIds: readonly (KeynoteAssetId | undefined)[],
  currentIndex: number,
) {
  return assetIds.slice(currentIndex + 1).find((assetId): assetId is KeynoteAssetId =>
    Boolean(assetId),
  )
}
