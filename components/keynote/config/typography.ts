import type { KeynoteTypographyTheme } from '../types/keynote'

type KeynoteTypographyConfig = {
  frame: string
  eyebrow: string
  heading: string
  body: string
  accent: string
}

export const KEYNOTE_TYPOGRAPHY: Record<KeynoteTypographyTheme, KeynoteTypographyConfig> = {
  cover: {
    frame: 'text-center',
    eyebrow: 'font-pixel text-[9px] leading-relaxed text-muted-foreground',
    heading: 'font-pixel text-3xl leading-relaxed text-foreground sm:text-4xl',
    body: 'text-sm leading-relaxed text-muted-foreground sm:text-base',
    accent: 'font-pixel text-[9px] leading-relaxed text-foreground',
  },
  chapter: {
    frame: 'text-left',
    eyebrow: 'font-pixel text-[8px] leading-relaxed text-muted-foreground',
    heading: 'font-pixel text-2xl leading-relaxed text-foreground sm:text-3xl',
    body: 'text-sm leading-relaxed text-muted-foreground',
    accent: 'font-pixel text-[8px] leading-relaxed text-foreground',
  },
  terminal: {
    frame: 'text-left',
    eyebrow: 'font-pixel text-[8px] leading-relaxed text-muted-foreground',
    heading: 'font-pixel text-xl leading-relaxed text-foreground sm:text-2xl',
    body: 'font-pixel text-[8px] leading-relaxed text-muted-foreground',
    accent: 'font-pixel text-[8px] leading-relaxed text-foreground',
  },
  ocean: {
    frame: 'text-left',
    eyebrow: 'font-pixel text-[8px] leading-relaxed text-muted-foreground',
    heading: 'font-pixel text-2xl leading-relaxed text-foreground sm:text-3xl',
    body: 'text-sm leading-relaxed text-muted-foreground',
    accent: 'font-pixel text-[8px] leading-relaxed text-foreground',
  },
}

export function getKeynoteTypography(theme: KeynoteTypographyTheme) {
  return KEYNOTE_TYPOGRAPHY[theme]
}
