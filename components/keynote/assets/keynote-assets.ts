import type { KeynoteAssetFormat, KeynoteAssetId } from '../types/keynote'

type KeynoteAsset = {
  id: KeynoteAssetId
  path: string
  alt: string
  format: KeynoteAssetFormat
}

export const SUPPORTED_KEYNOTE_ASSET_FORMATS: KeynoteAssetFormat[] = [
  'png',
  'jpg',
  'webp',
  'avif',
]

export const KEYNOTE_ASSET_REGISTRY: Record<KeynoteAssetId, KeynoteAsset> = {
  sailboats: {
    id: 'sailboats',
    path: '/Keynote/keynote-slide-1-sailboats.PNG',
    alt: 'Placeholder asset: sailboats on open water',
    format: 'png',
  },
  'school-of-fish': {
    id: 'school-of-fish',
    path: '/Keynote/keynote-slide-2-school-of-fish.WEBP',
    alt: 'Placeholder asset: school of fish',
    format: 'webp',
  },
  sharks: {
    id: 'sharks',
    path: '/Keynote/keynote-slide-3-sharks.JPG',
    alt: 'Placeholder asset: sharks in blue water',
    format: 'jpg',
  },
  sunlight: {
    id: 'sunlight',
    path: '/Keynote/keynote-slide-4-sunlight.JPG',
    alt: 'Placeholder asset: sunlight through ocean water',
    format: 'jpg',
  },
  'ocean-floor': {
    id: 'ocean-floor',
    path: '/Keynote/keynote-slide-5-ocean-floor.AVIF',
    alt: 'Placeholder asset: ocean floor',
    format: 'avif',
  },
}

export function getKeynoteAsset(id: KeynoteAssetId) {
  return KEYNOTE_ASSET_REGISTRY[id]
}
