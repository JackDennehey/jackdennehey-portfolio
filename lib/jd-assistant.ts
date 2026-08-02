import { PORTFOLIO_KNOWLEDGE } from './portfolio-knowledge'

export type AssistantWindowTarget =
  | 'about'
  | 'projects'
  | 'certifications'
  | 'contact'
  | 'recruiter'

export type AssistantAction =
  | { type: 'open'; label: string; target: AssistantWindowTarget }
  | { type: 'copy-email'; label: string }
  | { type: 'external'; label: string; href: string }

export type AssistantResponse = {
  content: string
  actions?: AssistantAction[]
}

const REFUSAL =
  "I can only answer questions about Jack's portfolio, education, credentials, projects, and professional interests."

const SUGGESTED_PROMPTS = [
  'What has Jack built?',
  'What credentials has Jack earned?',
  'What is Jack studying?',
  'Tell me about Jack OS.',
  'How can I contact Jack?',
] as const

export const JD_ASSISTANT_INTRO =
  "Hello, I'm J.D. Ask me about Jack's education, credentials, projects, skills, or professional direction."

export const JD_SUGGESTED_PROMPTS = SUGGESTED_PROMPTS

function includesAny(input: string, terms: readonly string[]) {
  return terms.some((term) => input.includes(term))
}

function listNames(items: readonly { title: string }[]) {
  return items.map((item) => item.title).join(', ')
}

function uniqueTechnologies() {
  return Array.from(
    new Set(
      PORTFOLIO_KNOWLEDGE.projects.all.flatMap((project) => project.technologies),
    ),
  ).filter((technology) => technology !== 'TBD')
}

export function answerPortfolioQuestion(rawQuestion: string): AssistantResponse {
  const question = rawQuestion.trim().toLowerCase()

  if (!question) {
    return {
      content: JD_ASSISTANT_INTRO,
      actions: [{ type: 'open', label: 'Open Recruiter Mode', target: 'recruiter' }],
    }
  }

  if (
    includesAny(question, ['resume', 'cv', 'résumé']) ||
    question === 'is there a public resume?'
  ) {
    return {
      content:
        `${PORTFOLIO_KNOWLEDGE.resume.message} The best next steps are Projects, Credentials, Contact, or the guided Recruiter Mode overview.`,
      actions: [
        { type: 'open', label: 'Open Recruiter Mode', target: 'recruiter' },
        { type: 'open', label: 'Open Contact', target: 'contact' },
      ],
    }
  }

  if (
    includesAny(question, [
      'who is jack',
      'who is he',
      'overview',
      'summary',
      'about jack',
      'recruiter',
      'professional overview',
    ])
  ) {
    return {
      content:
        `${PORTFOLIO_KNOWLEDGE.person.overview} Jack OS is his interactive alternative to a traditional portfolio, combining professional content with a retro desktop experience.`,
      actions: [
        { type: 'open', label: 'Open Recruiter Mode', target: 'recruiter' },
        { type: 'open', label: 'Open About', target: 'about' },
      ],
    }
  }

  if (
    includesAny(question, [
      'studying',
      'education',
      'school',
      'college',
      'penn state',
      'brandywine',
      'dccc',
      'delaware county',
    ])
  ) {
    return {
      content:
        'Jack is currently studying Business at Penn State Brandywine. His prior cybersecurity education came through Delaware County Community College, where he earned the Cyber Security Certificate of Competency with Honors.',
      actions: [
        { type: 'open', label: 'Open Recruiter Mode', target: 'recruiter' },
        { type: 'open', label: 'Open Credentials', target: 'certifications' },
      ],
    }
  }

  if (
    includesAny(question, [
      'credential',
      'certification',
      'certificate',
      'certified',
      'cisco',
      'azure',
      'aws',
      'completed',
      'earned',
      'planned',
      'in progress',
    ])
  ) {
    return {
      content:
        `Completed credentials: ${listNames(PORTFOLIO_KNOWLEDGE.credentials.completed)}. Microsoft Azure AI Fundamentals is in progress, and AWS Cloud Practitioner is planned.`,
      actions: [{ type: 'open', label: 'Open Credentials', target: 'certifications' }],
    }
  }

  if (
    includesAny(question, [
      'project',
      'built',
      'build',
      'jack os',
      'portfolio',
      'website',
      'technologies used',
      'tech stack',
    ])
  ) {
    return {
      content:
        `Jack OS is the primary project: an operating-system-inspired portfolio built with ${PORTFOLIO_KNOWLEDGE.projects.featured.technologies.join(', ')}. It includes ${PORTFOLIO_KNOWLEDGE.projects.jackOsSystems.join(', ')} while preserving a retro desktop identity.`,
      actions: [
        { type: 'open', label: 'Open Projects', target: 'projects' },
        {
          type: 'external',
          label: 'View GitHub',
          href: PORTFOLIO_KNOWLEDGE.contact.github,
        },
      ],
    }
  }

  if (
    includesAny(question, [
      'technology',
      'technologies',
      'skills',
      'skill',
      'direction',
      'front-end',
      'frontend',
      'product',
      'interface',
      'business',
    ])
  ) {
    return {
      content:
        `${PORTFOLIO_KNOWLEDGE.person.professionalDirection} Current technology areas include ${uniqueTechnologies().join(', ')}.`,
      actions: [
        { type: 'open', label: 'Open Recruiter Mode', target: 'recruiter' },
        { type: 'open', label: 'Open Projects', target: 'projects' },
      ],
    }
  }

  if (includesAny(question, ['cyber', 'security', 'cybersecurity', 'networking', 'network'])) {
    return {
      content:
        'Jack has a cybersecurity foundation from Delaware County Community College and continues to build networking knowledge through Cisco Networking Basics, labs, and related project work. That background supports his interests in cloud, security, and business technology.',
      actions: [
        { type: 'open', label: 'Open About', target: 'about' },
        { type: 'open', label: 'Open Credentials', target: 'certifications' },
      ],
    }
  }

  if (includesAny(question, ['cloud', 'ai', 'artificial intelligence', 'machine learning'])) {
    return {
      content:
        'Jack is developing cloud and AI interests through Microsoft Azure AI Fundamentals study, future AWS Cloud Practitioner plans, and hands-on technical projects. He is focused on understanding where these tools fit into practical business and technology workflows.',
      actions: [
        { type: 'open', label: 'Open Recruiter Mode', target: 'recruiter' },
        { type: 'open', label: 'Open Credentials', target: 'certifications' },
      ],
    }
  }

  if (
    includesAny(question, [
      'contact',
      'email',
      'mail',
      'github',
      'linkedin',
      'connect',
      'reach',
      'hire',
      'internship',
      'opportunity',
    ])
  ) {
    return {
      content:
        `You can contact Jack at ${PORTFOLIO_KNOWLEDGE.contact.email}. He is open to internships, entry-level opportunities, professional connections, and projects that combine business and technology.`,
      actions: [
        { type: 'copy-email', label: 'Copy Email' },
        { type: 'open', label: 'Open Contact', target: 'contact' },
        {
          type: 'external',
          label: 'LinkedIn',
          href: PORTFOLIO_KNOWLEDGE.contact.linkedin,
        },
      ],
    }
  }

  return { content: REFUSAL }
}
