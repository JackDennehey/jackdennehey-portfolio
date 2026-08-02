import { CONTACT, CREDENTIALS, PROJECTS } from './portfolio-data'

export type TimelineCategory =
  | 'Education'
  | 'Credentials'
  | 'Projects'
  | 'Jack OS'
  | 'Milestones'

export type TimelineActionTarget =
  | 'about'
  | 'projects'
  | 'certifications'
  | 'recruiter'
  | 'contact'

export type TimelineEntry = {
  id: string
  year: string
  month?: string
  title: string
  summary: string
  description: string
  category: TimelineCategory
  featured?: boolean
  externalLink?: {
    label: string
    href: string
  }
  action?: {
    label: string
    target: TimelineActionTarget
  }
}

const dcccCredential = CREDENTIALS.find(
  (credential) => credential.id === 'dccc-cyber-security-certificate',
)
const ciscoCredential = CREDENTIALS.find((credential) => credential.id === 'cisco-networking-basics')
const azureCredential = CREDENTIALS.find(
  (credential) => credential.id === 'microsoft-azure-ai-fundamentals',
)
const jackOsProject = PROJECTS.find((project) => project.title === 'Portfolio Website')

export const TIMELINE_CATEGORIES: readonly TimelineCategory[] = [
  'Education',
  'Credentials',
  'Projects',
  'Jack OS',
  'Milestones',
] as const

export const TIMELINE_ENTRIES: readonly TimelineEntry[] = [
  {
    id: 'dccc-cybersecurity-honors',
    year: '2026',
    month: 'May',
    title: dcccCredential?.title ?? 'Cyber Security Certificate of Competency',
    summary:
      'Cybersecurity certificate earned with Honors through Delaware County Community College.',
    description:
      dcccCredential?.sections[0]?.body ??
      'Jack completed his formal cybersecurity foundation through Delaware County Community College, establishing the base for continued networking, cloud, and business-technology study.',
    category: 'Credentials',
    featured: true,
    externalLink: dcccCredential?.verification
      ? {
          label: dcccCredential.verification.label,
          href: dcccCredential.verification.url,
        }
      : undefined,
    action: { label: 'Open Credentials', target: 'certifications' },
  },
  {
    id: 'jack-os-public-portfolio',
    year: '2026',
    title: 'Jack OS public portfolio',
    summary:
      "The portfolio became an interactive operating-system-inspired experience for Jack's public work.",
    description:
      jackOsProject?.description ??
      'Jack OS presents public professional content as an original retro desktop with windows, personalization, sounds, search, Secrets, Recruiter Mode, and a local portfolio assistant.',
    category: 'Jack OS',
    featured: true,
    externalLink: jackOsProject?.demo
      ? {
          label: 'Visit Live Project',
          href: jackOsProject.demo,
        }
      : {
          label: 'Visit Portfolio',
          href: `https://${CONTACT.domain}`,
        },
    action: { label: 'Open Projects', target: 'projects' },
  },
  {
    id: 'penn-state-business-studies',
    year: 'Current',
    title: 'Business studies at Penn State Brandywine',
    summary:
      'Current business studies with a technology, cloud, and cybersecurity direction.',
    description:
      'Jack is currently studying Business at Penn State Brandywine. The public portfolio connects those studies to cybersecurity, networking, cloud computing, AI, front-end development, and product/interface thinking.',
    category: 'Education',
    action: { label: 'Open About', target: 'about' },
  },
  {
    id: 'cisco-networking-basics',
    year: 'Verified',
    title: ciscoCredential?.title ?? 'Cisco Networking Basics',
    summary:
      'Networking credential supporting cybersecurity, troubleshooting, and infrastructure fundamentals.',
    description:
      ciscoCredential?.summary ??
      "Cisco Networking Basics supports Jack's understanding of devices, endpoints, IP addressing, protocols, connectivity, and the link between networking and cybersecurity.",
    category: 'Credentials',
    externalLink: ciscoCredential?.verification
      ? {
          label: ciscoCredential.verification.label,
          href: ciscoCredential.verification.url,
        }
      : undefined,
    action: { label: 'Open Credentials', target: 'certifications' },
  },
  {
    id: 'azure-ai-study',
    year: 'Current',
    title: azureCredential?.title ?? 'Microsoft Azure AI Fundamentals',
    summary:
      'In-progress study path covering AI workloads, responsible AI, and Azure AI services.',
    description:
      azureCredential?.sections[0]?.body ??
      'Jack is currently preparing for Microsoft Azure AI Fundamentals as part of a broader interest in practical AI and cloud workflows.',
    category: 'Credentials',
    action: { label: 'Open Credentials', target: 'certifications' },
  },
  {
    id: 'dccc-cybersecurity-education',
    year: 'Completed',
    title: 'Cybersecurity education at DCCC',
    summary:
      'A formal cybersecurity education foundation before the current Penn State business path.',
    description:
      "Jack's prior cybersecurity education at Delaware County Community College became the foundation for continued work in networking, cloud computing, and business technology.",
    category: 'Education',
    action: { label: 'Open Recruiter Mode', target: 'recruiter' },
  },
] as const

export function getTimelineEntry(id: string) {
  return TIMELINE_ENTRIES.find((entry) => entry.id === id) ?? null
}
