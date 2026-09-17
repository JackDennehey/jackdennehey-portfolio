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
  JackFirewallIcon,
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
  | 'about'
  | 'projects'
  | 'certifications'
  | 'recruiter'
  | 'resume'
  | 'contact'
  | 'assistant'
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
  /** Search aliases for the command palette. */
  keywords?: readonly string[]
  /** Command palette title. Defaults to `Open ${title}`. */
  commandTitle?: string
  commandSubtitle?: string
  commandAriaLabel?: string
  /** Recruiter/Firewall-style desktop auto-maximize. Ignored on mobile. */
  autoMaximize?: boolean
}

export const WINDOW_APPS: Record<WindowId, WindowApp> = {
  home: {
    id: 'home',
    title: 'Welcome to Jack OS',
    Icon: JackSystemIcon,
    width: 460,
    height: 480,
    description: 'first stops',
    commandTitle: 'Open Welcome',
    keywords: ['welcome', 'system', 'start'],
  },
  'blue-ocean': {
    id: 'blue-ocean',
    title: '1984 Blue Ocean',
    Icon: JackBlueOceanIcon,
    width: 920,
    height: 660,
    description: 'flagship interactive keynote',
    tone: 'blue-ocean',
    commandSubtitle: 'Featured Experience / 31-stage interactive keynote',
    commandAriaLabel: 'Open 1984 Blue Ocean — flagship guided interactive keynote',
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
    commandSubtitle: 'Featured Project / indie mobile game',
    commandAriaLabel:
      'Open Pocket Pier — JDen Studios mobile game, available on the App Store',
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
    commandSubtitle: 'Flagship Project / football intelligence platform',
    commandAriaLabel: 'Open Kickoff — flagship football intelligence platform',
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
    commandSubtitle: 'System / independent digital studio',
    commandAriaLabel: 'Open JDEN STUDIOS — independent digital studio',
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
    Icon: JackRecruiterIcon,
    width: 840,
    height: 640,
    description: 'guided professional overview',
    tone: 'recruiter',
    autoMaximize: true,
    commandAriaLabel: 'Open Recruiter Mode — guided professional overview',
    keywords: ['corporate', 'professional', 'overview', 'recruiter mode'],
  },
  resume: {
    id: 'resume',
    title: 'Resume',
    Icon: JackResumeImageIcon,
    iconVisual: 'image',
    width: 560,
    height: 560,
    description: 'downloadable overview',
  },
  contact: {
    id: 'contact',
    title: 'Contact',
    Icon: JackMailIcon,
    width: 420,
    height: 520,
    description: 'email and external links',
  },
  assistant: {
    id: 'assistant',
    title: 'J.D. — Jack OS Assistant',
    Icon: JackAssistantIcon,
    width: 560,
    height: 600,
    description: 'portfolio assistant',
    desktopLabel: 'J.D.',
    keywords: ['jd', 'portfolio assistant', 'ask'],
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
    title: 'ROADMAP.EXE — System Deployment Track',
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
  about: 'about',
  projects: 'projects',
  certifications: 'credentials',
  recruiter: 'recruiter',
  resume: 'resume',
  contact: 'contact',
  assistant: 'jd',
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

/** Curated desktop/mobile launcher order. Home and JDEN live elsewhere in the shell. */
export const DESKTOP_LAUNCHER_APP_IDS = [
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

/** Curated command-palette app order. */
export const COMMAND_PALETTE_APP_IDS = [
  'home',
  'jden-studios',
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
