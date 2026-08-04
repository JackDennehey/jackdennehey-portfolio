import type { CSSProperties } from 'react'
import type { KeynoteVisualTheme } from '../types/keynote'

type KeynoteVisualThemeConfig = {
  background: string
  foreground: string
  muted: string
  accent: string
  border: string
  imageOverlay: string
  diagramStyle: string
  controlContrast: 'light' | 'dark'
  texture?: string
  imagePosition?: string
}

export const KEYNOTE_VISUAL_THEMES: Record<KeynoteVisualTheme, KeynoteVisualThemeConfig> = {
  opening: {
    background: 'oklch(0.955 0.016 92)',
    foreground: 'oklch(0.18 0.009 230)',
    muted: 'oklch(0.42 0.02 230)',
    accent: 'oklch(0.47 0.075 245)',
    border: 'oklch(0.26 0.018 230)',
    imageOverlay: 'linear-gradient(90deg, oklch(0.955 0.016 92 / 0.94), oklch(0.955 0.016 92 / 0.58))',
    diagramStyle: 'keynote-diagram-classic',
    controlContrast: 'light',
    texture: 'keynote-texture-paper',
    imagePosition: 'center',
  },
  'technical-divide': {
    background: 'oklch(0.94 0.01 250)',
    foreground: 'oklch(0.17 0.012 255)',
    muted: 'oklch(0.43 0.014 255)',
    accent: 'oklch(0.44 0.06 245)',
    border: 'oklch(0.2 0.012 255)',
    imageOverlay: 'linear-gradient(90deg, oklch(0.94 0.01 250 / 0.92), oklch(0.94 0.01 250 / 0.66))',
    diagramStyle: 'keynote-diagram-grid',
    controlContrast: 'light',
    texture: 'keynote-texture-grid',
    imagePosition: 'center',
  },
  'financial-friction': {
    background: 'oklch(0.948 0.012 100)',
    foreground: 'oklch(0.18 0.008 86)',
    muted: 'oklch(0.42 0.012 86)',
    accent: 'oklch(0.46 0.07 95)',
    border: 'oklch(0.24 0.012 86)',
    imageOverlay: 'linear-gradient(90deg, oklch(0.948 0.012 100 / 0.94), oklch(0.948 0.012 100 / 0.62))',
    diagramStyle: 'keynote-diagram-ledger',
    controlContrast: 'light',
    texture: 'keynote-texture-ledger',
    imagePosition: 'center',
  },
  'blue-ocean': {
    background: 'oklch(0.91 0.022 230)',
    foreground: 'oklch(0.14 0.016 240)',
    muted: 'oklch(0.36 0.032 240)',
    accent: 'oklch(0.48 0.08 225)',
    border: 'oklch(0.22 0.028 240)',
    imageOverlay: 'linear-gradient(90deg, oklch(0.91 0.022 230 / 0.92), oklch(0.91 0.022 230 / 0.5))',
    diagramStyle: 'keynote-diagram-ocean',
    controlContrast: 'light',
    texture: 'keynote-texture-wave',
    imagePosition: 'center',
  },
  'living-proof': {
    background: 'oklch(0.2 0.008 255)',
    foreground: 'oklch(0.9 0.01 92)',
    muted: 'oklch(0.75 0.012 92)',
    accent: 'oklch(0.74 0.06 145)',
    border: 'oklch(0.78 0.012 92)',
    imageOverlay: 'linear-gradient(90deg, oklch(0.2 0.008 255 / 0.9), oklch(0.2 0.008 255 / 0.58))',
    diagramStyle: 'keynote-diagram-terminal',
    controlContrast: 'dark',
    texture: 'keynote-texture-scan',
    imagePosition: 'center',
  },
  simplicity: {
    background: 'oklch(0.965 0.006 85)',
    foreground: 'oklch(0.14 0.004 60)',
    muted: 'oklch(0.4 0.006 60)',
    accent: 'oklch(0.24 0.006 60)',
    border: 'oklch(0.18 0.004 60)',
    imageOverlay: 'linear-gradient(90deg, oklch(0.965 0.006 85 / 0.96), oklch(0.965 0.006 85 / 0.64))',
    diagramStyle: 'keynote-diagram-minimal',
    controlContrast: 'light',
    texture: 'keynote-texture-paper',
    imagePosition: 'center',
  },
}

export function getKeynoteVisualTheme(theme: KeynoteVisualTheme) {
  return KEYNOTE_VISUAL_THEMES[theme]
}

export function getKeynoteVisualThemeStyle(theme: KeynoteVisualTheme) {
  const config = getKeynoteVisualTheme(theme)

  return {
    '--keynote-bg': config.background,
    '--keynote-fg': config.foreground,
    '--keynote-muted': config.muted,
    '--keynote-accent': config.accent,
    '--keynote-border': config.border,
    '--keynote-image-overlay': config.imageOverlay,
    '--keynote-image-position': config.imagePosition ?? 'center',
  } as CSSProperties
}
