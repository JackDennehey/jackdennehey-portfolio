import {
  CASE_STUDIES,
  CREDENTIALS,
  EDUCATION,
  EXPERIENCE,
  PROFILE,
  PROJECTS,
  SKILL_GROUPS,
  formatEducationBrief,
  formatExperienceBrief,
  formatProfileBrief,
  formatProjectBrief,
  getFeaturedProjects,
} from '@/lib/portfolio'
import { KICKOFF_COPY, KICKOFF_URL } from '@/lib/kickoff'
import { POCKET_PIER_APP_STORE_URL, POCKET_PIER_COPY } from '@/lib/pocket-pier'
import type { PublicKnowledgeBundle } from './vendor/knowledge-store'

const SOURCE = 'jackos-canonical'
const now = () => Date.now()

function record(
  id: string,
  type: string,
  title: string,
  content: string,
  extra: {
    tags?: string[]
    aliases?: string[]
    fields?: Record<string, unknown>
    jackos?: Record<string, unknown>
  } = {},
) {
  return {
    id,
    type,
    title,
    content: content.slice(0, 4000),
    tags: extra.tags ?? [],
    aliases: extra.aliases ?? [],
    source: SOURCE,
    updatedAt: now(),
    visibility: 'PUBLIC_SAFE' as const,
    fields: extra.fields ?? {},
    jackos: extra.jackos ?? null,
  }
}

export function buildPublicKnowledgeBundle(): PublicKnowledgeBundle {
  const featured = getFeaturedProjects()

  const bio = record(
    'bio-jack',
    'BIO',
    PROFILE.name,
    [formatProfileBrief(), `Product: ${PROFILE.productName}.`].join(' '),
    {
      tags: ['jack', 'bio', 'profile'],
      aliases: ['Jack', 'Jack Dennehey', 'who is jack'],
      fields: {
        name: PROFILE.name,
        headline: PROFILE.headline,
        role: PROFILE.role,
      },
      jackos: { appId: 'portfolio' },
    },
  )

  const projects = PROJECTS.map((project) => {
    const evidenceBits = [
      formatProjectBrief(project),
      project.whyExists,
      project.longDescription,
      project.keySystems?.length ? `Systems: ${project.keySystems.join(', ')}.` : '',
    ]
      .filter(Boolean)
      .join(' ')

    const fields: Record<string, unknown> = {
      projectId: project.id,
      technologies: [...project.technologies],
      tech: [...project.technologies],
      role: project.role,
      result: project.result,
      category: project.category,
      caseStudyAvailable: project.caseStudyAvailable,
    }

    if (project.id === 'kickoff') {
      fields.accuracy = KICKOFF_COPY.evaluation.accuracy
      fields.baseline = KICKOFF_COPY.evaluation.baseline
      fields.brier = KICKOFF_COPY.evaluation.brier
      fields.modelHonesty = KICKOFF_COPY.modelHonesty
      fields.engine = 'Next.js / TypeScript'
    }
    if (project.id === 'pocket-pier') {
      fields.engine = POCKET_PIER_COPY.engine
      fields.language = POCKET_PIER_COPY.language
      fields.whyEngine = POCKET_PIER_COPY.howItWasBuilt
    }
    if (project.id === 'jackos') {
      fields.engine = 'Next.js'
    }
    if (project.id === 'blue-ocean') {
      fields.engine = 'JackOS keynote runtime'
    }

    return record(`project-${project.id}`, 'PROJECT', project.name, evidenceBits, {
      tags: [
        project.category,
        ...project.technologies.map((item) => item.toLowerCase()),
        project.featured ? 'featured' : '',
        /react|next|typescript|interface|ui/i.test(project.technologies.join(' ')) ? 'ui' : '',
        /ux|interface|product/i.test(`${project.shortDescription} ${project.role}`) ? 'ux' : '',
      ].filter(Boolean),
      aliases: [project.name, ...(project.alsoKnownAs ?? []), project.id],
      fields,
      jackos: {
        projectId: project.id,
        appId: project.internalApp ?? 'projects',
        caseStudyAvailable: project.caseStudyAvailable,
      },
    })
  })

  const skills = SKILL_GROUPS.map((group) =>
    record(
      `skill-${group.id}`,
      'SKILL',
      group.group,
      `${group.group}: ${group.items.join(', ')}. Related public work: ${(group.relatedProjectIds ?? []).join(', ') || 'none listed'}.`,
      {
        tags: ['skill', ...group.items.map((item) => item.toLowerCase())],
        aliases: [group.group, ...group.items],
        fields: { items: [...group.items], relatedProjectIds: [...(group.relatedProjectIds ?? [])] },
        jackos: { appId: 'portfolio' },
      },
    ),
  )

  const education = EDUCATION.map((entry) =>
    record(
      `education-${entry.id}`,
      'EDUCATION',
      `${entry.program} — ${entry.school}`,
      `${entry.program}, ${entry.school} (${entry.period}). ${entry.detail}${entry.honors ? ` Honors: ${entry.honors}.` : ''}`,
      {
        tags: ['education', 'school'],
        aliases: [entry.school, entry.program, 'where did he study', 'education'],
        fields: { school: entry.school, program: entry.program, status: entry.status },
        jackos: { appId: 'about' },
      },
    ),
  )

  const experience = EXPERIENCE.map((entry) =>
    record(
      `experience-${entry.id}`,
      'EXPERIENCE',
      `${entry.role} / ${entry.organization}`,
      `${entry.role} at ${entry.organization} (${entry.period}). ${entry.description}${
        entry.technologies?.length ? ` Technologies: ${entry.technologies.join(', ')}.` : ''
      }`,
      {
        tags: ['experience'],
        aliases: [entry.role, entry.organization],
        fields: { technologies: entry.technologies ?? [] },
        jackos: { appId: 'resume' },
      },
    ),
  )

  const credentials = CREDENTIALS.map((credential) =>
    record(
      `credential-${credential.id}`,
      'OTHER',
      credential.title,
      `${credential.title} — ${credential.issuer} (${credential.status}). ${credential.summary}`,
      {
        tags: ['credential', 'cybersecurity', credential.issuer.toLowerCase()],
        aliases: [credential.title, credential.issuer],
        fields: { status: credential.status, issuer: credential.issuer },
        jackos: { appId: 'certifications' },
      },
    ),
  )

  const features = [
    record(
      'feature-jackos',
      'JACKOS_FEATURE',
      'JackOS',
      'JackOS is an interactive portfolio operating system: windows, a dock, a purpose-built mobile shell, Recruiter Mode, Simple Mode, Spotlight search, and first-class project apps. It is the public home for Jack Dennehey\'s work.',
      {
        tags: ['jackos', 'os'],
        aliases: ['JackOS', 'Jack OS', 'portfolio operating system', 'how does jackos work'],
        jackos: { appId: 'home', projectId: 'jackos' },
      },
    ),
    record(
      'feature-window-manager',
      'JACKOS_FEATURE',
      'Window Manager',
      'The JackOS Window Manager owns window lifecycle: open, focus, move, resize, minimize, maximize, and remembered geometry. Desktop JackOS is spatial. Mobile JackOS is navigational and does not present window chrome.',
      {
        tags: ['windows', 'desktop'],
        aliases: ['window manager', 'windows', 'resize'],
        jackos: { appId: 'home' },
      },
    ),
    record(
      'feature-spotlight',
      'JACKOS_FEATURE',
      'Spotlight',
      'Spotlight is JackOS local search. It is deterministic keyboard-first retrieval over apps, projects, case studies, skills, and system commands. It does not use a language model and does not search the web.',
      {
        tags: ['search'],
        aliases: ['spotlight', 'search', 'command palette'],
        jackos: { appId: 'home' },
      },
    ),
    record(
      'feature-portfolio',
      'JACKOS_FEATURE',
      'Portfolio.app',
      'Portfolio.app is the professional overview inside JackOS: featured work, experience, skills, education, credentials, resume, and contact.',
      { tags: ['portfolio'], aliases: ['portfolio', 'portfolio.app', 'open portfolio'], jackos: { appId: 'portfolio' } },
    ),
    record(
      'feature-recruiter',
      'JACKOS_FEATURE',
      'Recruiter Mode',
      'Recruiter Mode is a short evidence brief for hiring managers: strongest public work, skills, education, resume, and contact.',
      { tags: ['recruiter'], aliases: ['recruiter', 'recruiter mode'], jackos: { appId: 'recruiter' } },
    ),
    record(
      'feature-simple',
      'JACKOS_FEATURE',
      'Simple Mode',
      'Simple Mode is the conventional full-site reading of the same canonical portfolio, without the desktop metaphor. It lives at /simple.',
      { tags: ['simple'], aliases: ['simple mode', 'simple'], jackos: { appId: 'home' } },
    ),
  ]

  const caseStudyNotes = Object.values(CASE_STUDIES).map((study) => {
    const project = PROJECTS.find((item) => item.id === study.projectId)
    const name = project?.name ?? study.projectId
    return record(
      `case-study-${study.projectId}`,
      'FAQ',
      `${name} case study`,
      `${name} has a JackOS case study covering ${study.sections.map((section) => section.title).join(', ')}. ${study.summary}`,
      {
        tags: ['case-study', study.projectId],
        aliases: [`${name} case study`, `${study.projectId} case study`],
        fields: { projectId: study.projectId },
        jackos: { projectId: study.projectId, appId: 'case-study' },
      },
    )
  })

  const lore = [
    record(
      'boch-name',
      'BOCH_LORE',
      'BOCH',
      'BOCH stands for Behavioral Operating & Cognitive Helper. Pronounced BOCK. Always write BOCH. Yellow circular smiley face with black oval eyes and a curved black mouth.',
      {
        tags: ['boch', 'identity'],
        aliases: ['BOCH', 'BOCK', 'what does boch stand for', 'pronounce boch', 'who are you'],
      },
    ),
    record(
      'boch-public',
      'BOCH_LORE',
      'Public BOCH',
      'This JackOS deployment is the public, family-friendly portfolio-safe version of BOCH. Same character as personal BOCH, different permission envelope. No private owner memory, reminders, files, or adult phrasebook.',
      {
        tags: ['boch', 'public'],
        aliases: ['are you jd', 'personal boch', 'same boch', 'j.d.'],
      },
    ),
    record(
      'boch-jd',
      'FAQ',
      'J.D. and BOCH',
      'J.D. is a lightweight guided portfolio Q&A layer still available in JackOS. BOCH is the public character/runtime for conversational guidance. They are not the same identity. Prefer BOCH for questions.',
      { aliases: ['are you j.d.', 'are you jd', 'jd assistant'] },
    ),
    record(
      'faq-resume',
      'FAQ',
      'Resume',
      'Jack\'s resume is available in Resume.app inside JackOS and as a downloadable text file at /jack-dennehey-resume.txt.',
      { aliases: ['resume', 'cv'], jackos: { appId: 'resume' } },
    ),
    record(
      'faq-contact',
      'FAQ',
      'Contact',
      `Email ${PROFILE.contact.email}. GitHub ${PROFILE.contact.github}. LinkedIn ${PROFILE.contact.linkedin}. Site ${PROFILE.contact.domain}.`,
      { aliases: ['contact', 'email'], jackos: { appId: 'contact' } },
    ),
    record(
      'faq-featured',
      'FAQ',
      'What Jack has built',
      `Strongest public work: ${featured.map((project) => project.name).join(', ')}. JackOS is the interface work. Pocket Pier is the shipped Godot game. Kickoff is the football intelligence product. 1984 Blue Ocean is the interactive keynote.`,
      { aliases: ['what has jack built', 'projects', 'strongest work', 'strongest ui'] },
    ),
    record(
      'faq-education-brief',
      'FAQ',
      'Education summary',
      formatEducationBrief(),
      { aliases: ['where did he study', 'school', 'penn state'] },
    ),
    record(
      'faq-experience-brief',
      'FAQ',
      'Experience summary',
      formatExperienceBrief(),
      { aliases: ['experience', 'work history'] },
    ),
    record(
      'link-kickoff',
      'LINK',
      'Kickoff live product',
      `Kickoff is live at ${KICKOFF_URL}.`,
      { fields: { url: KICKOFF_URL }, jackos: { projectId: 'kickoff' } },
    ),
    record(
      'link-pocket-pier',
      'LINK',
      'Pocket Pier App Store',
      `Pocket Pier is on the App Store at ${POCKET_PIER_APP_STORE_URL}.`,
      { fields: { url: POCKET_PIER_APP_STORE_URL }, jackos: { projectId: 'pocket-pier' } },
    ),
  ]

  return {
    schemaVersion: 1,
    records: [
      bio,
      ...projects,
      ...skills,
      ...education,
      ...experience,
      ...credentials,
      ...features,
      ...caseStudyNotes,
      ...lore,
    ],
  }
}

export function buildUrlAllowlist() {
  return [
    `https://${PROFILE.contact.domain}`,
    'https://www.jackdennehey.com',
    PROFILE.contact.github,
    PROFILE.contact.linkedin,
    KICKOFF_URL,
    POCKET_PIER_APP_STORE_URL,
    'https://github.com/jackdennehey',
    'https://apps.apple.com',
  ]
}
