import type { ComponentType, SVGProps } from 'react'
import { CONTACT } from '@/lib/portfolio-data'
import { GithubIcon, LinkedinIcon } from './brand-icons'
import {
  JackBadgeIcon,
  JackAssistantIcon,
  JackDocumentIcon,
  JackFirewallIcon,
  JackGuestbookIcon,
  JackIdIcon,
  JackMailIcon,
  JackProjectsIcon,
  JackRecruiterIcon,
  JackSecretsIcon,
  JackSystemIcon,
  JackTimelineIcon,
  JackWallpapersIcon,
} from './jack-icons'

export type WindowId =
  | 'home'
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
  | 'wallpapers'
  | 'secrets'

type IconType = ComponentType<SVGProps<SVGSVGElement> & { className?: string }>
export type AppTone = 'recruiter' | 'firewall'

export type WindowApp = {
  id: WindowId
  title: string
  Icon: IconType
  /** preferred window size on desktop */
  width: number
  height: number
  description?: string
  tone?: AppTone
}

export const WINDOW_APPS: Record<WindowId, WindowApp> = {
  home: { id: 'home', title: 'Welcome to Jack OS', Icon: JackSystemIcon, width: 460, height: 480 },
  about: { id: 'about', title: 'About Me', Icon: JackIdIcon, width: 560, height: 540 },
  projects: { id: 'projects', title: 'Projects', Icon: JackProjectsIcon, width: 620, height: 520 },
  certifications: {
    id: 'certifications',
    title: 'Credentials',
    Icon: JackBadgeIcon,
    width: 520,
    height: 480,
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
  resume: { id: 'resume', title: 'Resume', Icon: JackDocumentIcon, width: 560, height: 560 },
  contact: { id: 'contact', title: 'Contact', Icon: JackMailIcon, width: 420, height: 520 },
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
    Icon: JackGuestbookIcon,
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
  wallpapers: {
    id: 'wallpapers',
    title: 'Wallpapers',
    Icon: JackWallpapersIcon,
    width: 780,
    height: 660,
  },
  secrets: {
    id: 'secrets',
    title: 'Secrets',
    Icon: JackSecretsIcon,
    width: 500,
    height: 500,
  },
}

export const WINDOW_HASH_SLUGS: Record<WindowId, string> = {
  home: 'home',
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
      description?: string
      tone?: AppTone
    }
  | { kind: 'link'; id: string; label: string; href: string; Icon: IconType }

export const DESKTOP_ITEMS: DesktopItem[] = [
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
  { kind: 'window', id: 'guestbook', label: 'Guestbook', Icon: JackGuestbookIcon },
  { kind: 'window', id: 'projects', label: 'Projects', Icon: JackProjectsIcon },
  { kind: 'window', id: 'certifications', label: 'Credentials', Icon: JackBadgeIcon },
  { kind: 'window', id: 'about', label: 'About Me', Icon: JackIdIcon },
  { kind: 'window', id: 'contact', label: 'Contact', Icon: JackMailIcon },
  { kind: 'window', id: 'resume', label: 'Resume', Icon: JackDocumentIcon },
  { kind: 'window', id: 'wallpapers', label: 'Wallpapers', Icon: JackWallpapersIcon },
  { kind: 'window', id: 'assistant', label: 'J.D.', Icon: JackAssistantIcon },
  { kind: 'window', id: 'secrets', label: 'Secrets', Icon: JackSecretsIcon },
  { kind: 'link', id: 'github', label: 'GitHub', href: CONTACT.github, Icon: GithubIcon },
  { kind: 'link', id: 'linkedin', label: 'LinkedIn', href: CONTACT.linkedin, Icon: LinkedinIcon },
]
