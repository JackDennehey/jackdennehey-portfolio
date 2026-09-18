import type { ComponentType, SVGProps } from 'react'
import { CONTACT } from '@/lib/portfolio-data'
import {
  JackAboutImageIcon,
  JackCredentialsImageIcon,
  JackGuestbookImageIcon,
  JackPocketPierImageIcon,
  JackRoadmapImageIcon,
  JackResumeImageIcon,
  JackSecretsImageIcon,
  JackJdenStudiosImageIcon,
} from './app-image-icons'
import { GithubIcon, LinkedinIcon } from './brand-icons'
import {
  JackAssistantIcon,
  JackBlueOceanIcon,
  JackBochIcon,
  JackDocumentIcon,
  JackFirewallIcon,
  JackIdIcon,
  JackKickoffIcon,
  JackMailIcon,
  JackProjectsIcon,
  JackRecruiterIcon,
  JackSystemIcon,
  JackTimelineIcon,
  JackWallpapersIcon,
} from './jack-icons'

export type WindowId =
  | 'home'
  | 'blue-ocean'
  | 'pocket-pier'
  | 'kickoff'
  | 'jden-studios'
  | 'portfolio'
  | 'about'
  | 'projects'
  | 'case-study'
  | 'certifications'
  | 'recruiter'
  | 'resume'
  | 'contact'
  | 'assistant'
  | 'boch'
  | 'timeline'
  | 'guestbook'
  | 'firewall'
  | 'roadmap'
  | 'wallpapers'
  | 'secrets'

type IconType = ComponentType<SVGProps<SVGSVGElement> & { className?: string }>
export type AppTone = 'recruiter' | 'firewall' | 'blue-ocean' | 'kickoff'
export type IconVisual = 'image'

export type WindowApp = {
  id: WindowId
  title: string
  Icon: IconType
  iconVisual?: IconVisual
  /** preferred window size on desktop */
  width: number
  height: number
  description?: string
  tone?: AppTone
  /** Shorter launcher label when the window title is too long for the desktop. */
  desktopLabel?: string
  /** Search aliases for Spotlight. */
  keywords?: readonly string[]
  /** Spotlight title. Defaults to `Open ${title}`. */
  spotlightTitle?: string
  spotlightSubtitle?: string
  /** Recruiter/Firewall-style desktop auto-maximize. Ignored on mobile. */
  autoMaximize?: boolean
  /** Desktop minimum width. Clamped to the usable desktop. */
  minWidth?: number
  /** Desktop minimum height. Clamped to the usable desktop. */
  minHeight?: number
  /** Desktop windows are resizable unless this is false. Ignored on mobile. */
  resizable?: boolean
  /** Fill the window body with no paper padding. Used by BOCH's own stage. */
  flushContent?: boolean
}

export const WINDOW_APPS: Record<WindowId, WindowApp> = {
  home: {
    id: 'home',
    title: 'Welcome to JackOS',
    Icon: JackSystemIcon,
    width: 480,
    height: 540,
    description: 'first stops',
    spotlightTitle: 'Open Welcome',
    keywords: ['welcome', 'system', 'start'],
  },
  'blue-ocean': {
    id: 'blue-ocean',
    title: '1984 Blue Ocean',
    desktopLabel: 'Blue Ocean',
    Icon: JackBlueOceanIcon,
    width: 920,
    height: 660,
    description: 'flagship interactive keynote',
    tone: 'blue-ocean',
    spotlightSubtitle: 'Featured Experience / 31-stage interactive keynote',
    keywords: [
      '1984',
      'blue ocean',
      'keynote',
      'presentation',
      'flagship',
      'business strategy',
      'technical communication',
      'ai-assisted',
      'product development',
      'retro computing',
    ],
  },
  'pocket-pier': {
    id: 'pocket-pier',
    title: 'Pocket Pier',
    Icon: JackPocketPierImageIcon,
    iconVisual: 'image',
    width: 860,
    height: 640,
    description: 'indie mobile game',
    spotlightSubtitle: 'Featured Project / indie mobile game',
    keywords: [
      'pocket pier',
      'mobile game',
      'godot',
      'gdscript',
      'ios',
      'app store',
      'pixel art',
      'harbor',
      'fishing',
      'product development',
    ],
  },
  kickoff: {
    id: 'kickoff',
    title: 'Kickoff',
    Icon: JackKickoffIcon,
    width: 900,
    height: 680,
    description: 'flagship football intelligence platform',
    tone: 'kickoff',
    spotlightSubtitle: 'Flagship Project / football intelligence platform',
    keywords: [
      'kickoff',
      'football',
      'nfl',
      'prediction',
      'model',
      'machine learning',
      'ask kickoff',
      'walk-forward',
      'football intelligence',
      'openai',
    ],
  },
  'jden-studios': {
    id: 'jden-studios',
    title: 'JDEN STUDIOS',
    Icon: JackJdenStudiosImageIcon,
    iconVisual: 'image',
    width: 640,
    height: 600,
    description: 'independent digital studio',
    spotlightSubtitle: 'System / independent digital studio',
    keywords: [
      'jden',
      'jden studios',
      'studio',
      'independent studio',
      'external system',
      'client work',
      'digital studio',
    ],
  },
  portfolio: {
    id: 'portfolio',
    title: 'Portfolio',
    Icon: JackIdIcon,
    width: 760,
    height: 640,
    minWidth: 380,
    minHeight: 420,
    description: 'professional overview',
    spotlightTitle: 'Open Portfolio',
    spotlightSubtitle: "Conventional overview of Jack's work",
    keywords: [
      'portfolio',
      'overview',
      'about jack',
      'featured work',
      'experience',
      'skills',
      'resume',
    ],
  },
  about: {
    id: 'about',
    title: 'About Me',
    Icon: JackAboutImageIcon,
    iconVisual: 'image',
    width: 560,
    height: 540,
    description: 'background and interests',
    keywords: ['about me', 'jack', 'bio'],
  },
  projects: {
    id: 'projects',
    title: 'Projects',
    Icon: JackProjectsIcon,
    width: 620,
    height: 520,
    description: 'technical work',
  },
  'case-study': {
    id: 'case-study',
    title: 'Case Study',
    Icon: JackDocumentIcon,
    width: 820,
    height: 640,
    minWidth: 380,
    minHeight: 440,
    description: 'project case studies',
    spotlightTitle: 'Open Case Study',
    keywords: ['case study', 'project', 'explore', 'writeup'],
  },
  certifications: {
    id: 'certifications',
    title: 'Credentials',
    Icon: JackCredentialsImageIcon,
    iconVisual: 'image',
    width: 520,
    height: 480,
    description: 'verified learning',
    keywords: ['credentials', 'certifications', 'certificates'],
  },
  recruiter: {
    id: 'recruiter',
    title: 'Recruiter Mode',
    desktopLabel: 'Recruiter',
    Icon: JackRecruiterIcon,
    width: 840,
    height: 640,
    description: 'guided professional overview',
    tone: 'recruiter',
    autoMaximize: true,
    keywords: ['corporate', 'professional', 'overview', 'recruiter mode'],
  },
  resume: {
    id: 'resume',
    title: 'Resume',
    Icon: JackResumeImageIcon,
    iconVisual: 'image',
    width: 560,
    height: 640,
    description: 'downloadable overview',
  },
  contact: {
    id: 'contact',
    title: 'Contact',
    Icon: JackMailIcon,
    width: 460,
    height: 580,
    minWidth: 320,
    description: 'email and external links',
  },
  assistant: {
    id: 'assistant',
    title: 'J.D. — JackOS Assistant',
    Icon: JackAssistantIcon,
    width: 560,
    height: 600,
    description: 'portfolio assistant',
    desktopLabel: 'J.D.',
    keywords: ['jd', 'portfolio assistant', 'ask'],
  },
  boch: {
    id: 'boch',
    title: 'BOCH',
    Icon: JackBochIcon,
    width: 680,
    height: 840,
    minWidth: 360,
    minHeight: 560,
    flushContent: true,
    description: 'public portfolio guide',
    desktopLabel: 'BOCH',
    spotlightTitle: 'Open BOCH',
    spotlightSubtitle: 'Public guide / Behavioral Operating & Cognitive Helper',
    keywords: ['boch', 'bock', 'assistant', 'ask', 'ai', 'guide', 'helper'],
  },
  timeline: {
    id: 'timeline',
    title: 'Timeline',
    Icon: JackTimelineIcon,
    width: 760,
    height: 620,
    description: 'system history',
    keywords: ['history', 'journey', 'milestones', 'education history', 'system history'],
  },
  guestbook: {
    id: 'guestbook',
    title: 'Guestbook',
    Icon: JackGuestbookImageIcon,
    iconVisual: 'image',
    width: 760,
    height: 640,
    description: 'visitor log',
    keywords: ['visitor log', 'sign', 'message', 'comments'],
  },
  firewall: {
    id: 'firewall',
    title: 'Network Firewall',
    desktopLabel: 'Firewall',
    Icon: JackFirewallIcon,
    width: 900,
    height: 660,
    description: 'simulated traffic',
    tone: 'firewall',
    autoMaximize: true,
    keywords: [
      'network',
      'packets',
      'security',
      'ports',
      'traffic',
      'simulation',
      'packet inspector',
      'beginner guide',
      'firewall certified',
    ],
  },
  roadmap: {
    id: 'roadmap',
    title: 'Road Map',
    Icon: JackRoadmapImageIcon,
    iconVisual: 'image',
    width: 780,
    height: 620,
    description: 'professional goals',
    desktopLabel: 'Road Map',
    keywords: ['plans', 'goals', 'future direction', 'next steps', 'deployment track'],
  },
  wallpapers: {
    id: 'wallpapers',
    title: 'Wallpapers',
    Icon: JackWallpapersIcon,
    width: 780,
    height: 660,
    description: 'personalization',
    keywords: ['personalize', 'background', 'desktop'],
  },
  secrets: {
    id: 'secrets',
    title: 'Secrets',
    Icon: JackSecretsImageIcon,
    iconVisual: 'image',
    width: 500,
    height: 500,
    description: 'hidden files',
    keywords: ['hidden', 'files', 'manual'],
  },
}

export const WINDOW_HASH_SLUGS: Record<WindowId, string> = {
  home: 'home',
  'blue-ocean': '1984-blue-ocean',
  'pocket-pier': 'pocket-pier',
  kickoff: 'kickoff',
  'jden-studios': 'jden-studios',
  portfolio: 'portfolio',
  about: 'about',
  projects: 'projects',
  'case-study': 'case-study',
  certifications: 'credentials',
  recruiter: 'recruiter',
  resume: 'resume',
  contact: 'contact',
  assistant: 'jd',
  boch: 'boch',
  timeline: 'timeline',
  guestbook: 'guestbook',
  firewall: 'firewall',
  roadmap: 'roadmap',
  wallpapers: 'wallpapers',
  secrets: 'secrets',
}

const WINDOW_IDS_BY_HASH = Object.entries(WINDOW_HASH_SLUGS).reduce(
  (acc, [id, slug]) => {
    acc[slug] = id as WindowId
    return acc
  },
  {} as Record<string, WindowId>,
)

WINDOW_IDS_BY_HASH.assistant = 'assistant'
WINDOW_IDS_BY_HASH.bock = 'boch'
WINDOW_IDS_BY_HASH['recruiter-mode'] = 'recruiter'
WINDOW_IDS_BY_HASH['network-firewall'] = 'firewall'
WINDOW_IDS_BY_HASH.keynote = 'blue-ocean'
WINDOW_IDS_BY_HASH['blue-ocean'] = 'blue-ocean'
WINDOW_IDS_BY_HASH.pocketpier = 'pocket-pier'
WINDOW_IDS_BY_HASH.jden = 'jden-studios'
WINDOW_IDS_BY_HASH.jdenstudios = 'jden-studios'
WINDOW_IDS_BY_HASH['football-intelligence'] = 'kickoff'

export function getWindowHash(id: WindowId) {
  return WINDOW_HASH_SLUGS[id]
}

export function getWindowIdFromHash(hash: string): WindowId | null {
  const slug = hash.replace(/^#/, '').trim().toLowerCase()
  return WINDOW_IDS_BY_HASH[slug] ?? null
}

export function isWindowId(value: string): value is WindowId {
  return value in WINDOW_APPS
}

export function shouldAutoMaximizeWindow(id: WindowId, isMobile: boolean) {
  return Boolean(WINDOW_APPS[id].autoMaximize) && !isMobile
}

export function getDesktopAppLabel(id: WindowId) {
  const app = WINDOW_APPS[id]
  return app.desktopLabel ?? app.title
}

/** Curated desktop dock pins. Metadata still comes from WINDOW_APPS. */
export const DOCK_PINNED_APP_IDS = [
  'boch',
  'portfolio',
  'blue-ocean',
  'pocket-pier',
  'kickoff',
  'recruiter',
  'firewall',
] as const satisfies readonly WindowId[]

export function isDockPinnedAppId(id: WindowId) {
  return (DOCK_PINNED_APP_IDS as readonly string[]).includes(id)
}

/** Curated desktop/mobile launcher order. Home and JDEN live elsewhere in the shell. */
export const DESKTOP_LAUNCHER_APP_IDS = [
  'boch',
  'portfolio',
  'blue-ocean',
  'pocket-pier',
  'kickoff',
  'recruiter',
  'firewall',
  'timeline',
  'guestbook',
  'projects',
  'certifications',
  'about',
  'contact',
  'resume',
  'roadmap',
  'wallpapers',
  'assistant',
  'secrets',
] as const satisfies readonly WindowId[]

/** Curated Spotlight app order. */
export const SPOTLIGHT_APP_IDS = [
  'home',
  'boch',
  'jden-studios',
  'portfolio',
  'blue-ocean',
  'pocket-pier',
  'kickoff',
  'about',
  'projects',
  'certifications',
  'recruiter',
  'resume',
  'contact',
  'assistant',
  'timeline',
  'guestbook',
  'firewall',
  'roadmap',
  'wallpapers',
  'secrets',
] as const satisfies readonly WindowId[]

function toDesktopWindowItem(id: WindowId): Extract<DesktopItem, { kind: 'window' }> {
  const app = WINDOW_APPS[id]
  return {
    kind: 'window',
    id,
    label: getDesktopAppLabel(id),
    Icon: app.Icon,
    iconVisual: app.iconVisual,
    description: app.description,
    tone: app.tone,
  }
}

export type DesktopItem =
  | {
      kind: 'window'
      id: WindowId
      label: string
      Icon: IconType
      iconVisual?: IconVisual
      description?: string
      tone?: AppTone
    }
  | { kind: 'link'; id: string; label: string; href: string; Icon: IconType }

export const DESKTOP_ITEMS: DesktopItem[] = [
  ...DESKTOP_LAUNCHER_APP_IDS.map(toDesktopWindowItem),
  { kind: 'link', id: 'github', label: 'GitHub', href: CONTACT.github, Icon: GithubIcon },
  { kind: 'link', id: 'linkedin', label: 'LinkedIn', href: CONTACT.linkedin, Icon: LinkedinIcon },
]
