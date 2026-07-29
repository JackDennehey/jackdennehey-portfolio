import type { ComponentType, SVGProps } from 'react'
import { Award, FileText, Folder, Mail, User } from 'lucide-react'
import { CONTACT } from '@/lib/portfolio-data'
import { GithubIcon, LinkedinIcon } from './brand-icons'

export type WindowId = 'home' | 'about' | 'projects' | 'certifications' | 'resume' | 'contact'

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
  home: { id: 'home', title: 'Welcome to Jack OS', Icon: Folder, width: 460, height: 480 },
  about: { id: 'about', title: 'About Me', Icon: User, width: 460, height: 460 },
  projects: { id: 'projects', title: 'Projects', Icon: Folder, width: 620, height: 520 },
  certifications: {
    id: 'certifications',
    title: 'Certifications',
    Icon: Award,
    width: 520,
    height: 480,
  },
  resume: { id: 'resume', title: 'Resume', Icon: FileText, width: 560, height: 560 },
  contact: { id: 'contact', title: 'Contact', Icon: Mail, width: 420, height: 520 },
}

export type DesktopItem =
  | { kind: 'window'; id: WindowId; label: string; Icon: IconType }
  | { kind: 'link'; id: string; label: string; href: string; Icon: IconType }

export const DESKTOP_ITEMS: DesktopItem[] = [
  { kind: 'window', id: 'about', label: 'About Me', Icon: User },
  { kind: 'window', id: 'projects', label: 'Projects', Icon: Folder },
  { kind: 'window', id: 'certifications', label: 'Credentials', Icon: Award },
  { kind: 'window', id: 'resume', label: 'Resume', Icon: FileText },
  { kind: 'link', id: 'github', label: 'GitHub', href: CONTACT.github, Icon: GithubIcon },
  { kind: 'link', id: 'linkedin', label: 'LinkedIn', href: CONTACT.linkedin, Icon: LinkedinIcon },
  { kind: 'window', id: 'contact', label: 'Contact', Icon: Mail },
]
