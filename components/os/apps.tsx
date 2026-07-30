import type { ComponentType, SVGProps } from 'react'
import { CONTACT } from '@/lib/portfolio-data'
import { GithubIcon, LinkedinIcon } from './brand-icons'
import {
  JackBadgeIcon,
  JackDocumentIcon,
  JackIdIcon,
  JackMailIcon,
  JackProjectsIcon,
  JackSecretsIcon,
  JackSystemIcon,
  JackWallpapersIcon,
} from './jack-icons'

export type WindowId =
  | 'home'
  | 'recruiter'
  | 'system-info'
  | 'shortcuts'
  | 'about'
  | 'projects'
  | 'certifications'
  | 'resume'
  | 'contact'
  | 'wallpapers'
  | 'secrets'

type IconType = ComponentType<SVGProps<SVGSVGElement> & { className?: string }>

export type WindowApp = {
  id: WindowId
  title: string
  Icon: IconType
  /** preferred window size on desktop */
  width: number
  height: number
}

export const WINDOW_APPS: Record<WindowId, WindowApp> = {
  home: { id: 'home', title: 'Welcome to Jack OS', Icon: JackSystemIcon, width: 500, height: 540 },
  recruiter: {
    id: 'recruiter',
    title: 'Recruiter View',
    Icon: JackIdIcon,
    width: 780,
    height: 620,
  },
  'system-info': {
    id: 'system-info',
    title: 'About This Jack OS',
    Icon: JackSystemIcon,
    width: 560,
    height: 560,
  },
  shortcuts: {
    id: 'shortcuts',
    title: 'Keyboard Shortcuts',
    Icon: JackSystemIcon,
    width: 500,
    height: 480,
  },
  about: { id: 'about', title: 'About Me', Icon: JackIdIcon, width: 600, height: 560 },
  projects: { id: 'projects', title: 'Projects', Icon: JackProjectsIcon, width: 760, height: 620 },
  certifications: {
    id: 'certifications',
    title: 'Credentials',
    Icon: JackBadgeIcon,
    width: 600,
    height: 560,
  },
  resume: { id: 'resume', title: 'Resume', Icon: JackDocumentIcon, width: 520, height: 500 },
  contact: { id: 'contact', title: 'Contact', Icon: JackMailIcon, width: 420, height: 520 },
  wallpapers: {
    id: 'wallpapers',
    title: 'Wallpapers',
    Icon: JackWallpapersIcon,
    width: 720,
    height: 640,
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
  recruiter: 'recruiter',
  'system-info': 'about-jack-os',
  shortcuts: 'keyboard-shortcuts',
  about: 'about',
  projects: 'projects',
  certifications: 'credentials',
  resume: 'resume',
  contact: 'contact',
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

export function getWindowHash(id: WindowId) {
  return WINDOW_HASH_SLUGS[id]
}

export function getWindowIdFromHash(hash: string): WindowId | null {
  const slug = hash.replace(/^#/, '').trim().toLowerCase()
  return WINDOW_IDS_BY_HASH[slug] ?? null
}

export type DesktopItem =
  | { kind: 'window'; id: WindowId; label: string; Icon: IconType }
  | { kind: 'link'; id: string; label: string; href: string; Icon: IconType }

export const DESKTOP_ITEMS: DesktopItem[] = [
  { kind: 'window', id: 'home', label: 'Welcome', Icon: JackSystemIcon },
  { kind: 'window', id: 'about', label: 'About Me', Icon: JackIdIcon },
  { kind: 'window', id: 'projects', label: 'Projects', Icon: JackProjectsIcon },
  { kind: 'window', id: 'certifications', label: 'Credentials', Icon: JackBadgeIcon },
  { kind: 'window', id: 'resume', label: 'Resume', Icon: JackDocumentIcon },
  { kind: 'window', id: 'contact', label: 'Contact', Icon: JackMailIcon },
  { kind: 'window', id: 'recruiter', label: 'Recruiter', Icon: JackIdIcon },
  { kind: 'window', id: 'wallpapers', label: 'Wallpapers', Icon: JackWallpapersIcon },
  { kind: 'window', id: 'system-info', label: 'System Info', Icon: JackSystemIcon },
  { kind: 'window', id: 'secrets', label: 'Secrets', Icon: JackSecretsIcon },
  { kind: 'link', id: 'github', label: 'GitHub', href: CONTACT.github, Icon: GithubIcon },
  { kind: 'link', id: 'linkedin', label: 'LinkedIn', href: CONTACT.linkedin, Icon: LinkedinIcon },
]
