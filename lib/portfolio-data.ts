export const CONTACT = {
  email: 'jack@jackdennehey.com',
  github: 'https://github.com/jackdennehey',
  linkedin: 'https://www.linkedin.com/in/jackdennehey',
  domain: 'jackdennehey.com',
}

export type Project = {
  title: string
  status?: string
  description: string
  technologies: string[]
  github?: string
  demo?: string
}

export const PROJECTS: Project[] = [
  {
    title: 'Portfolio Website',
    status: 'Live',
    description:
      'This operating-system-inspired portfolio, designed and built from scratch as a modern interpretation of classic monochrome computing.',
    technologies: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS'],
    github: CONTACT.github,
    demo: `https://${CONTACT.domain}`,
  },
  {
    title: 'Azure AI Projects',
    status: 'In progress',
    description:
      'A collection of experiments using Microsoft Azure AI services — exploring document intelligence, language understanding, and applied machine learning.',
    technologies: ['Azure', 'Python', 'Cognitive Services'],
    github: CONTACT.github,
  },
  {
    title: 'Networking Labs',
    status: 'Ongoing',
    description:
      'Hands-on labs configuring routers, switches, subnets, and secure topologies while studying for Cisco networking fundamentals.',
    technologies: ['Cisco', 'Packet Tracer', 'TCP/IP', 'Subnetting'],
  },
  {
    title: 'Future Penn State Projects',
    status: 'Planned',
    description:
      'Coursework and independent builds coming out of the Penn State business program — a space reserved for what comes next.',
    technologies: ['TBD'],
  },
]

export type Certification = {
  title: string
  issuer: string
  status: 'Completed' | 'In Progress' | 'Future'
  description: string
}

export const CERTIFICATIONS: Certification[] = [
  {
    title: 'Cisco Networking Basics',
    issuer: 'Cisco Networking Academy',
    status: 'Completed',
    description:
      'Foundations of networking: how data moves across networks, IP addressing, and core connectivity concepts.',
  },
  {
    title: 'Microsoft Azure AI Fundamentals',
    issuer: 'Microsoft',
    status: 'In Progress',
    description:
      'Core concepts of artificial intelligence and machine learning workloads on the Azure cloud platform.',
  },
  {
    title: 'AWS Cloud Practitioner',
    issuer: 'Amazon Web Services',
    status: 'Future',
    description:
      'Cloud fundamentals, core AWS services, security, architecture, and pricing — planned as a next milestone.',
  },
]

export const SKILLS: { group: string; items: string[] }[] = [
  { group: 'Cloud', items: ['Microsoft Azure', 'AWS (learning)', 'Cloud Fundamentals'] },
  { group: 'Networking', items: ['TCP/IP', 'Subnetting', 'Cisco Packet Tracer'] },
  { group: 'Security', items: ['Cybersecurity Fundamentals', 'Network Security'] },
  { group: 'Technical', items: ['Python', 'TypeScript', 'Git', 'AI / ML Concepts'] },
  { group: 'Business', items: ['Analysis', 'Communication', 'Project Management'] },
]

export const EDUCATION = [
  {
    school: 'The Pennsylvania State University',
    degree: 'B.S. in Business',
    period: 'Current',
    detail:
      'Studying business with a strong focus on technology, cloud computing, and cybersecurity.',
  },
]

export const EXPERIENCE = [
  {
    role: 'Independent Technology Projects',
    org: 'Self-directed',
    period: 'Ongoing',
    detail:
      'Building hands-on projects across cloud, networking, and AI while pursuing industry certifications.',
  },
]

export const INTERESTS = [
  'Cybersecurity',
  'Networking',
  'Cloud Computing',
  'Artificial Intelligence',
  'Continuous Learning',
]
