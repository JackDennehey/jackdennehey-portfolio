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
}

export const WINDOW_APPS: Record<WindowId, WindowApp> = {
  home: {
    id: 'home',
    title: 'Welcome to Jack OS',
    Icon: JackSystemIcon,
    width: 460,
    height: 480,
    description: 'first stops',
  },
  'blue-ocean': {
    id: 'blue-ocean',
    title: '1984 Blue Ocean',
    Icon: JackBlueOceanIcon,
    width: 920,
    height: 660,
    description: 'flagship interactive keynote',
    tone: 'blue-ocean',
  },
  'pocket-pier': {
    id: 'pocket-pier',
    title: 'Pocket Pier',
    Icon: JackPocketPierImageIcon,
    iconVisual: 'image',
    width: 860,
    height: 640,
    description: 'indie mobile game',
  },
  kickoff: {
    id: 'kickoff',
    title: 'Kickoff',
    Icon: JackKickoffIcon,
    width: 900,
    height: 680,
    description: 'flagship football intelligence platform',
    tone: 'kickoff',
  },
  about: {
    id: 'about',
    title: 'About Me',
    Icon: JackAboutImageIcon,
    iconVisual: 'image',
    width: 560,
    height: 540,
    description: 'background and interests',
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
  },
  recruiter: {
    id: 'recruiter',
    title: 'Recruiter Mode',
    Icon: JackRecruiterIcon,
    width: 840,
    height: 640,
    description: 'guided professional overview',
    tone: 'recruiter',
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
  },
  timeline: {
    id: 'timeline',
    title: 'Timeline',
    Icon: JackTimelineIcon,
    width: 760,
    height: 620,
    description: 'system history',
  },
  guestbook: {
    id: 'guestbook',
    title: 'Guestbook',
    Icon: JackGuestbookImageIcon,
    iconVisual: 'image',
    width: 760,
    height: 640,
    description: 'visitor log',
  },
  firewall: {
    id: 'firewall',
    title: 'Network Firewall',
    Icon: JackFirewallIcon,
    width: 900,
    height: 660,
    description: 'simulated traffic',
    tone: 'firewall',
  },
  roadmap: {
    id: 'roadmap',
    title: 'ROADMAP.EXE — System Deployment Track',
    Icon: JackRoadmapImageIcon,
    iconVisual: 'image',
    width: 780,
    height: 620,
    description: 'professional goals',
  },
  wallpapers: {
    id: 'wallpapers',
    title: 'Wallpapers',
    Icon: JackWallpapersIcon,
    width: 780,
    height: 660,
    description: 'personalization',
  },
  secrets: {
    id: 'secrets',
    title: 'Secrets',
    Icon: JackSecretsImageIcon,
    iconVisual: 'image',
    width: 500,
    height: 500,
    description: 'hidden files',
  },
}

export const WINDOW_HASH_SLUGS: Record<WindowId, string> = {
  home: 'home',
  'blue-ocean': '1984-blue-ocean',
  'pocket-pier': 'pocket-pier',
  kickoff: 'kickoff',
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
WINDOW_IDS_BY_HASH['jden-studios'] = 'pocket-pier'
WINDOW_IDS_BY_HASH['football-intelligence'] = 'kickoff'

export function getWindowHash(id: WindowId) {
  return WINDOW_HASH_SLUGS[id]
}

export function getWindowIdFromHash(hash: string): WindowId | null {
  const slug = hash.replace(/^#/, '').trim().toLowerCase()
  return WINDOW_IDS_BY_HASH[slug] ?? null
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
  {
    kind: 'window',
    id: 'blue-ocean',
    label: '1984 Blue Ocean',
    Icon: JackBlueOceanIcon,
    description: 'flagship interactive keynote',
    tone: 'blue-ocean',
  },
  {
    kind: 'window',
    id: 'pocket-pier',
    label: 'Pocket Pier',
    Icon: JackPocketPierImageIcon,
    iconVisual: 'image',
    description: 'indie mobile game',
  },
  {
    kind: 'window',
    id: 'kickoff',
    label: 'Kickoff',
    Icon: JackKickoffIcon,
    description: 'flagship football intelligence platform',
    tone: 'kickoff',
  },
  {
    kind: 'window',
    id: 'recruiter',
    label: 'Recruiter Mode',
    Icon: JackRecruiterIcon,
    description: 'guided professional overview',
    tone: 'recruiter',
  },
  {
    kind: 'window',
    id: 'firewall',
    label: 'Network Firewall',
    Icon: JackFirewallIcon,
    description: 'simulated traffic',
    tone: 'firewall',
  },
  { kind: 'window', id: 'timeline', label: 'Timeline', Icon: JackTimelineIcon },
  {
    kind: 'window',
    id: 'guestbook',
    label: 'Guestbook',
    Icon: JackGuestbookImageIcon,
    iconVisual: 'image',
  },
  { kind: 'window', id: 'projects', label: 'Projects', Icon: JackProjectsIcon },
  {
    kind: 'window',
    id: 'certifications',
    label: 'Credentials',
    Icon: JackCredentialsImageIcon,
    iconVisual: 'image',
  },
  {
    kind: 'window',
    id: 'about',
    label: 'About Me',
    Icon: JackAboutImageIcon,
    iconVisual: 'image',
  },
  { kind: 'window', id: 'contact', label: 'Contact', Icon: JackMailIcon },
  {
    kind: 'window',
    id: 'resume',
    label: 'Resume',
    Icon: JackResumeImageIcon,
    iconVisual: 'image',
  },
  {
    kind: 'window',
    id: 'roadmap',
    label: 'Road Map',
    Icon: JackRoadmapImageIcon,
    iconVisual: 'image',
  },
  { kind: 'window', id: 'wallpapers', label: 'Wallpapers', Icon: JackWallpapersIcon },
  { kind: 'window', id: 'assistant', label: 'J.D.', Icon: JackAssistantIcon },
  {
    kind: 'window',
    id: 'secrets',
    label: 'Secrets',
    Icon: JackSecretsImageIcon,
    iconVisual: 'image',
  },
  { kind: 'link', id: 'github', label: 'GitHub', href: CONTACT.github, Icon: GithubIcon },
  { kind: 'link', id: 'linkedin', label: 'LinkedIn', href: CONTACT.linkedin, Icon: LinkedinIcon },
]
