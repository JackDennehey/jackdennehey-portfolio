import type { KeynoteTypographyTheme } from '../types/keynote'

type KeynoteTypographyConfig = {
  frame: string
  eyebrow: string
  heading: string
  subheading: string
  body: string
  accent: string
  data: string
  quote: string
  fallbackFontStack: string
}

export const KEYNOTE_TYPOGRAPHY: Record<KeynoteTypographyTheme, KeynoteTypographyConfig> = {
  opening: {
    frame: 'text-center',
    eyebrow: 'font-pixel text-[8px] leading-relaxed tracking-normal text-[var(--keynote-muted)]',
    heading: 'font-pixel text-3xl leading-relaxed tracking-normal text-[var(--keynote-fg)] sm:text-5xl',
    subheading: 'text-lg leading-relaxed text-[var(--keynote-fg)] sm:text-2xl',
    body: 'text-sm leading-relaxed text-[var(--keynote-muted)] sm:text-base',
    accent: 'font-pixel text-[8px] leading-relaxed text-[var(--keynote-accent)]',
    data: 'font-pixel text-[9px] leading-relaxed tabular-nums text-[var(--keynote-fg)]',
    quote: 'text-xl leading-relaxed text-[var(--keynote-fg)] sm:text-3xl',
    fallbackFontStack: 'var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif',
  },
  technical: {
    frame: 'text-left',
    eyebrow: 'font-pixel text-[8px] leading-relaxed text-[var(--keynote-muted)]',
    heading: 'font-pixel text-2xl leading-relaxed text-[var(--keynote-fg)] sm:text-4xl',
    subheading: 'text-base font-semibold leading-relaxed text-[var(--keynote-fg)] sm:text-xl',
    body: 'text-sm leading-relaxed text-[var(--keynote-muted)] sm:text-base',
    accent: 'font-pixel text-[8px] leading-relaxed text-[var(--keynote-accent)]',
    data: 'font-pixel text-[9px] leading-relaxed tabular-nums text-[var(--keynote-fg)]',
    quote: 'text-xl leading-relaxed text-[var(--keynote-fg)] sm:text-3xl',
    fallbackFontStack: 'var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif',
  },
  financial: {
    frame: 'text-left',
    eyebrow: 'font-pixel text-[8px] leading-relaxed text-[var(--keynote-muted)]',
    heading: 'text-3xl font-semibold leading-tight text-[var(--keynote-fg)] sm:text-5xl',
    subheading: 'text-base font-semibold leading-relaxed text-[var(--keynote-fg)] sm:text-xl',
    body: 'text-sm leading-relaxed text-[var(--keynote-muted)] sm:text-base',
    accent: 'font-pixel text-[8px] leading-relaxed text-[var(--keynote-accent)]',
    data: 'font-pixel text-4xl leading-none tabular-nums text-[var(--keynote-fg)] sm:text-6xl',
    quote: 'text-xl leading-relaxed text-[var(--keynote-fg)] sm:text-3xl',
    fallbackFontStack: 'var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif',
  },
  ocean: {
    frame: 'text-left',
    eyebrow: 'font-pixel text-[8px] leading-relaxed text-[var(--keynote-muted)]',
    heading: 'text-3xl font-semibold leading-tight text-[var(--keynote-fg)] sm:text-5xl',
    subheading: 'text-base font-semibold leading-relaxed text-[var(--keynote-fg)] sm:text-xl',
    body: 'text-sm leading-relaxed text-[var(--keynote-muted)] sm:text-base',
    accent: 'font-pixel text-[8px] leading-relaxed text-[var(--keynote-accent)]',
    data: 'font-pixel text-3xl leading-none tabular-nums text-[var(--keynote-fg)] sm:text-5xl',
    quote: 'text-xl leading-relaxed text-[var(--keynote-fg)] sm:text-3xl',
    fallbackFontStack: 'var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif',
  },
  documentary: {
    frame: 'text-left',
    eyebrow: 'font-pixel text-[8px] leading-relaxed text-[var(--keynote-muted)]',
    heading: 'font-pixel text-2xl leading-relaxed text-[var(--keynote-fg)] sm:text-4xl',
    subheading: 'text-base font-semibold leading-relaxed text-[var(--keynote-fg)] sm:text-xl',
    body: 'text-sm leading-relaxed text-[var(--keynote-muted)] sm:text-base',
    accent: 'font-pixel text-[8px] leading-relaxed text-[var(--keynote-accent)]',
    data: 'font-pixel text-[9px] leading-relaxed tabular-nums text-[var(--keynote-fg)]',
    quote: 'font-pixel text-[10px] leading-relaxed text-[var(--keynote-fg)] sm:text-sm',
    fallbackFontStack: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  },
  minimal: {
    frame: 'text-left',
    eyebrow: 'font-pixel text-[8px] leading-relaxed text-[var(--keynote-muted)]',
    heading: 'font-pixel text-2xl leading-relaxed text-[var(--keynote-fg)] sm:text-4xl',
    subheading: 'text-base leading-relaxed text-[var(--keynote-fg)] sm:text-xl',
    body: 'text-sm leading-relaxed text-[var(--keynote-muted)] sm:text-base',
    accent: 'font-pixel text-[8px] leading-relaxed text-[var(--keynote-accent)]',
    data: 'font-pixel text-[9px] leading-relaxed tabular-nums text-[var(--keynote-fg)]',
    quote: 'text-2xl leading-relaxed text-[var(--keynote-fg)] sm:text-4xl',
    fallbackFontStack: 'var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif',
  },
}

export function getKeynoteTypography(theme: KeynoteTypographyTheme) {
  return KEYNOTE_TYPOGRAPHY[theme]
}
