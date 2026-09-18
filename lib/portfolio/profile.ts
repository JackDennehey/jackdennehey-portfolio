import type { Profile } from './types'

export const PROFILE: Profile = {
  name: 'Jack Dennehey',
  headline: 'Business student at Penn State Brandywine',
  role: 'Business Student',
  summary:
    'Jack Dennehey is a Business student at Penn State Brandywine with a background in cybersecurity and networking and growing interests in cloud computing, artificial intelligence, front-end development, and product development.',
  shortIntro:
    'Business student building public products across cybersecurity, networking, cloud, AI, and interface design.',
  professionalDirection:
    'Jack is developing a path that connects business judgment with technical understanding, especially where cybersecurity, networking, cloud, AI, front-end development, mobile product development, and product/interface thinking meet.',
  opportunityStatement:
    'Open to internships, entry-level opportunities, professional connections, and projects that combine business and technology.',
  productName: 'JackOS',
  productDisplayName: 'JackOS',
  focusAreas: [
    'Cybersecurity',
    'Networking',
    'Cloud Computing',
    'Artificial Intelligence',
    'Front-end Development',
    'Product and Interface Thinking',
    'Business',
    'Continuous Learning',
  ],
  contact: {
    email: 'jackdennehey@gmail.com',
    github: 'https://github.com/JackDennehey',
    linkedin: 'https://www.linkedin.com/in/jackdennehey',
    domain: 'jackdennehey.com',
  },
}

export const PROFILE_LINKS = [
  {
    id: 'email',
    label: 'Email',
    value: PROFILE.contact.email,
    href: `mailto:${PROFILE.contact.email}`,
    external: false,
  },
  {
    id: 'github',
    label: 'GitHub',
    value: 'github.com/JackDennehey',
    href: PROFILE.contact.github,
    external: true,
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    value: 'in/jackdennehey',
    href: PROFILE.contact.linkedin,
    external: true,
  },
  {
    id: 'site',
    label: 'Portfolio',
    value: PROFILE.contact.domain,
    href: `https://${PROFILE.contact.domain}`,
    external: true,
  },
] as const
