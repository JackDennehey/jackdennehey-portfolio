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
  | 'timeline'
  | 'firewall'
  | 'contact'

export type TimelineAction = {
  label: string
  target: TimelineActionTarget
}

export type TimelineEntry = {
  id: string
  year: string
  month?: string
  title: string
  summary: string
  description: string
  category: TimelineCategory
  featured?: boolean
  badge?: string
  releaseHighlights?: readonly {
    title: string
    items: readonly string[]
  }[]
  externalLink?: {
    label: string
    href: string
  }
  action?: TimelineAction
  actions?: readonly TimelineAction[]
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
    id: 'jack-os-v2',
    year: '2026',
    month: 'August',
    title: 'Jack OS V2 — Interactive Operating System Expansion',
    summary:
      'Jack OS evolved from an interactive portfolio into a broader desktop-inspired experience with professional tools, educational simulations, and deeper visitor interaction.',
    description:
      'Jack OS V2 represents the largest expansion of the project since its original July 2026 launch. Across the 5A, 5B, and 5C updates, the site gained Recruiter Mode, the J.D. local portfolio assistant, an interactive Timeline, a moderated Guestbook, and the flagship Network Firewall simulation. The release also improved desktop organization, accessibility, search, SEO, wallpaper performance, theme consistency, and overall usability while preserving the retro Macintosh-inspired identity.',
    category: 'Jack OS',
    featured: true,
    badge: 'V2',
    releaseHighlights: [
      {
        title: 'Phase 5A — The Corporate Update',
        items: [
          'Added Recruiter Mode',
          'Added J.D., the local portfolio assistant',
          'Improved professional navigation and contact access',
          'Added recruiter-focused presentation and readability improvements',
        ],
      },
      {
        title: 'Phase 5B — The Interactive Update',
        items: [
          'Added the Timeline application',
          'Added the moderated Guestbook architecture',
          'Added the Network Firewall simulation',
          'Expanded Search Jack OS',
          'Introduced additional custom application icons',
          'Added interactive achievements and new system sounds where applicable',
        ],
      },
      {
        title: 'Phase 5C — The Firewall Update',
        items: [
          'Elevated Network Firewall into a flagship application',
          'Expanded firewall education and beginner guidance',
          'Improved packet visualization and inspection',
          'Improved flagship-app presentation',
          'Improved desktop organization',
          'Improved wallpaper loading and readability',
          'Improved SEO, accessibility, and performance',
          'Added the optional hourly desktop chime',
        ],
      },
    ],
    actions: [
      { label: 'Open Recruiter Mode', target: 'recruiter' },
      { label: 'Open Network Firewall', target: 'firewall' },
      { label: 'Open Timeline', target: 'timeline' },
    ],
    externalLink: jackOsProject?.demo
      ? {
          label: 'Visit Live Project',
          href: jackOsProject.demo,
        }
      : {
          label: 'Visit Portfolio',
          href: `https://${CONTACT.domain}`,
        },
  },
  {
    id: 'jack-os-public-launch',
    year: '2026',
    month: 'July',
    title: 'Jack OS Public Portfolio',
    summary:
      "Jack OS launched as an interactive operating-system-inspired portfolio for Jack's public work.",
    description:
      'The original release introduced a retro desktop experience with draggable windows, projects, credentials, personalization, wallpapers, system sounds, and a Macintosh-inspired interface.',
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
