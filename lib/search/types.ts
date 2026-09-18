import type { FilesFolderId } from '@/lib/os/files'

export const SPOTLIGHT_KINDS = [
  'app',
  'project',
  'case-study',
  'case-study-section',
  'skill',
  'experience',
  'education',
  'credential',
  'timeline',
  'recruiter-section',
  'link',
  'system',
] as const

export type SpotlightKind = (typeof SPOTLIGHT_KINDS)[number]

export const SPOTLIGHT_GROUPS = [
  'apps',
  'projects',
  'case-studies',
  'content',
  'system',
] as const

export type SpotlightGroup = (typeof SPOTLIGHT_GROUPS)[number]

export const PORTFOLIO_SECTION_IDS = [
  'featured',
  'experience',
  'skills',
  'education',
  'credentials',
  'contact',
] as const

export type PortfolioSectionId = (typeof PORTFOLIO_SECTION_IDS)[number]

export const PORTFOLIO_SECTION_DOM_IDS: Record<PortfolioSectionId, string> = {
  featured: 'portfolio-featured-heading',
  experience: 'portfolio-experience-heading',
  skills: 'portfolio-skills-heading',
  education: 'portfolio-education-heading',
  credentials: 'portfolio-credentials-heading',
  contact: 'portfolio-contact-heading',
}

export const SPOTLIGHT_SYSTEM_COMMANDS = [
  'personalize',
  'reset-layout',
  'simple-mode',
  'restart',
  'toggle-theme',
  'toggle-scanlines',
  'toggle-sound',
  'toggle-hourly-chime',
  'view-achievements',
  'copy-email',
  'restore-minimized',
  'minimize-active',
  'focus-desktop',
  'ask-boch',
] as const

export type SpotlightSystemCommand = (typeof SPOTLIGHT_SYSTEM_COMMANDS)[number]

export type SpotlightAction =
  | { type: 'open-app'; appId: string }
  | { type: 'open-case-study'; projectId: string }
  | { type: 'open-case-study-section'; projectId: string; sectionId: string }
  | { type: 'open-portfolio-section'; sectionId: PortfolioSectionId }
  | { type: 'open-recruiter-section'; sectionId: string }
  | { type: 'open-files'; folder: FilesFolderId }
  | { type: 'open-external'; href: string }
  | { type: 'system'; command: SpotlightSystemCommand }

export type SpotlightEntry = {
  id: string
  kind: SpotlightKind
  title: string
  subtitle: string
  name?: string
  keywords: readonly string[]
  aliases: readonly string[]
  searchableText: string
  action: SpotlightAction
  iconAppId?: string
  sourceProjectId?: string
  emptyOrder?: number
}

export type SpotlightMatchField = 'title' | 'name' | 'alias' | 'keyword' | 'subtitle' | 'body'

export type SpotlightResult = {
  id: string
  kind: SpotlightKind
  group: SpotlightGroup
  title: string
  subtitle: string
  action: SpotlightAction
  iconAppId?: string
  sourceProjectId?: string
  score: number
  matchField: SpotlightMatchField
}

export type SpotlightQueryResult = {
  query: string
  results: readonly SpotlightResult[]
  grouped: boolean
}
