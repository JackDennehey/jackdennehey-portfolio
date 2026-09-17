import { SPOTLIGHT_APP_IDS, WINDOW_APPS } from '@/components/os/apps'
import { CASE_STUDIES } from '@/lib/portfolio/case-studies'
import { CREDENTIALS } from '@/lib/portfolio/credentials'
import { EDUCATION } from '@/lib/portfolio/education'
import { EXPERIENCE } from '@/lib/portfolio/experience'
import { PROFILE } from '@/lib/portfolio/profile'
import { PROJECTS } from '@/lib/portfolio/projects'
import { SKILL_GROUPS } from '@/lib/portfolio/skills'
import { RECRUITER_SECTIONS } from '@/lib/portfolio-knowledge'
import { TIMELINE_ENTRIES } from '@/lib/timeline-data'
import { CURRENT_WALLPAPERS } from '@/lib/wallpapers'
import { FIREWALL_SEARCH_TERMS, SEARCH_ALIASES } from './aliases'
import { caseStudySectionKeywords, caseStudySectionSearchText } from './extract'
import { uniqueSearchTerms } from './score'
import { compactSearchText } from './text'
import type { SpotlightEntry, SpotlightSystemCommand } from './types'

function aliasesFor(id: string, extra: readonly string[] = []) {
  return uniqueSearchTerms([...(SEARCH_ALIASES[id] ?? []), ...extra])
}

function appEntry(id: (typeof SPOTLIGHT_APP_IDS)[number], emptyOrder?: number): SpotlightEntry {
  const app = WINDOW_APPS[id]
  const extraKeywords =
    id === 'firewall'
      ? [...FIREWALL_SEARCH_TERMS]
      : id === 'wallpapers'
        ? CURRENT_WALLPAPERS.map((wallpaper) => wallpaper.displayName)
        : []

  return {
    id: `app:${id}`,
    kind: 'app',
    title: app.spotlightTitle ?? `Open ${app.title}`,
    subtitle: app.spotlightSubtitle ?? (app.description ? `Application / ${app.description}` : 'Application'),
    name: app.title,
    keywords: uniqueSearchTerms([app.title, id, ...(app.keywords ?? []), ...extraKeywords]),
    aliases: aliasesFor(`app:${id}`),
    searchableText: compactSearchText([app.title, app.description, app.spotlightSubtitle]),
    action: { type: 'open-app', appId: id },
    iconAppId: id,
    emptyOrder,
  }
}

function systemEntry(
  command: SpotlightSystemCommand,
  title: string,
  subtitle: string,
  keywords: readonly string[],
  emptyOrder?: number,
): SpotlightEntry {
  const id = `system:${command}`
  return {
    id,
    kind: 'system',
    title,
    subtitle,
    name: title,
    keywords: uniqueSearchTerms(keywords),
    aliases: aliasesFor(id),
    searchableText: compactSearchText([title, subtitle, ...keywords]),
    action: { type: 'system', command },
    iconAppId:
      command === 'personalize'
        ? 'wallpapers'
        : command === 'ask-jd'
          ? 'assistant'
          : command === 'copy-email'
            ? 'contact'
            : command === 'view-achievements'
              ? 'roadmap'
              : 'home',
    emptyOrder,
  }
}

function buildAppEntries(): SpotlightEntry[] {
  return SPOTLIGHT_APP_IDS.map((id) => {
    if (id === 'portfolio') return appEntry(id, 10)
    if (id === 'resume') return appEntry(id, 20)
    if (id === 'contact') return appEntry(id, 30)
    if (id === 'recruiter') return appEntry(id, 60)
    if (id === 'home') return appEntry(id, 80)
    return appEntry(id)
  })
}

function buildProjectEntries(): SpotlightEntry[] {
  return PROJECTS.map((project) => ({
    id: `project:${project.id}`,
    kind: 'project' as const,
    title: project.name,
    subtitle: project.statusLabel ?? `Project / ${project.status}`,
    name: project.name,
    keywords: uniqueSearchTerms([
      project.name,
      project.id,
      project.category,
      project.role,
      project.platform,
      project.status,
      ...(project.technologies ?? []),
      ...(project.keySystems ?? []),
    ]),
    aliases: aliasesFor(`project:${project.id}`),
    searchableText: compactSearchText([
      project.shortDescription,
      project.longDescription,
      project.whyExists,
      project.result,
      project.implementation,
      ...(project.highlights ?? []),
      ...(project.outcomes ?? []),
    ]),
    action: project.caseStudyAvailable
      ? { type: 'open-case-study', projectId: project.id }
      : project.internalApp
        ? { type: 'open-app', appId: project.internalApp }
        : { type: 'open-app', appId: 'projects' },
    iconAppId: project.internalApp ?? 'projects',
    sourceProjectId: project.id,
  }))
}

function buildCaseStudyEntries(): SpotlightEntry[] {
  const studies: SpotlightEntry[] = []

  for (const study of Object.values(CASE_STUDIES)) {
    const project = PROJECTS.find((item) => item.id === study.projectId)
    const name = project?.name ?? study.projectId
    studies.push({
      id: `case-study:${study.projectId}`,
      kind: 'case-study',
      title: `${name} Case Study`,
      subtitle: 'Project case study',
      name,
      keywords: uniqueSearchTerms([name, study.projectId, study.kicker, 'case study', 'explore']),
      aliases: aliasesFor(`case-study:${study.projectId}`),
      searchableText: compactSearchText([study.summary, ...study.sections.map((section) => section.title)]),
      action: { type: 'open-case-study', projectId: study.projectId },
      iconAppId: 'case-study',
      sourceProjectId: study.projectId,
      emptyOrder: study.projectId === 'kickoff' ? 40 : study.projectId === 'pocket-pier' ? 50 : undefined,
    })

    for (const section of study.sections) {
      studies.push({
        id: `case-study-section:${study.projectId}:${section.id}`,
        kind: 'case-study-section',
        title: section.title,
        subtitle: `${name} · Case study section`,
        name: section.title,
        keywords: uniqueSearchTerms(caseStudySectionKeywords(section)),
        aliases: [],
        searchableText: caseStudySectionSearchText(section),
        action: {
          type: 'open-case-study-section',
          projectId: study.projectId,
          sectionId: section.id,
        },
        iconAppId: 'case-study',
        sourceProjectId: study.projectId,
      })
    }
  }

  return studies
}

function buildSkillEntries(): SpotlightEntry[] {
  return SKILL_GROUPS.flatMap((group) =>
    group.items.map((item) => ({
      id: `skill:${group.id}:${item}`,
      kind: 'skill' as const,
      title: item,
      subtitle: `Skill / ${group.group}`,
      name: item,
      keywords: uniqueSearchTerms([item, group.group, 'skill']),
      aliases: [],
      searchableText: compactSearchText([item, group.group]),
      action: { type: 'open-portfolio-section', sectionId: 'skills' as const },
      iconAppId: 'portfolio',
      sourceProjectId: group.relatedProjectIds?.[0],
    })),
  )
}

function buildExperienceEntries(): SpotlightEntry[] {
  return EXPERIENCE.map((entry) => ({
    id: `experience:${entry.id}`,
    kind: 'experience' as const,
    title: entry.role,
    subtitle: `Experience / ${entry.organization}`,
    name: entry.role,
    keywords: uniqueSearchTerms([entry.role, entry.organization, ...(entry.technologies ?? [])]),
    aliases: ['experience'],
    searchableText: compactSearchText([entry.description, entry.period, ...(entry.technologies ?? [])]),
    action: { type: 'open-portfolio-section', sectionId: 'experience' },
    iconAppId: 'portfolio',
  }))
}

function buildEducationEntries(): SpotlightEntry[] {
  return EDUCATION.map((entry) => ({
    id: `education:${entry.id}`,
    kind: 'education' as const,
    title: entry.school,
    subtitle: `Education / ${entry.program}`,
    name: entry.school,
    keywords: uniqueSearchTerms([entry.school, entry.program, entry.status, 'education', 'college', 'school']),
    aliases:
      entry.id === 'penn-state-brandywine'
        ? ['education', 'penn state', 'psu', 'brandywine']
        : ['education', 'dccc', 'delaware county'],
    searchableText: compactSearchText([entry.detail, entry.honors, entry.period]),
    action: { type: 'open-portfolio-section', sectionId: 'education' },
    iconAppId: 'about',
  }))
}

function buildCredentialEntries(): SpotlightEntry[] {
  return CREDENTIALS.map((credential) => ({
    id: `credential:${credential.id}`,
    kind: 'credential' as const,
    title: credential.title,
    subtitle: `${credential.issuer} / ${credential.status}`,
    name: credential.title,
    keywords: uniqueSearchTerms([
      credential.title,
      credential.issuer,
      credential.status,
      'credentials',
      'certifications',
    ]),
    aliases: [],
    searchableText: compactSearchText([
      credential.summary,
      credential.honor,
      credential.context,
      ...(credential.sections ?? []).flatMap((section) => [
        section.heading,
        section.body,
        ...(section.items ?? []),
      ]),
    ]),
    action: { type: 'open-app', appId: 'certifications' },
    iconAppId: 'certifications',
  }))
}

function buildTimelineEntries(): SpotlightEntry[] {
  return TIMELINE_ENTRIES.map((entry) => ({
    id: `timeline:${entry.id}`,
    kind: 'timeline' as const,
    title: entry.title,
    subtitle: `Timeline / ${entry.category}`,
    name: entry.title,
    keywords: uniqueSearchTerms([entry.title, entry.category, 'timeline', 'history', 'milestone']),
    aliases: [],
    searchableText: compactSearchText([
      entry.summary,
      entry.description,
      ...(entry.releaseHighlights?.flatMap((group) => [group.title, ...group.items]) ?? []),
    ]),
    action: { type: 'open-app', appId: 'timeline' },
    iconAppId: 'timeline',
  }))
}

function buildRecruiterEntries(): SpotlightEntry[] {
  return RECRUITER_SECTIONS.map((section) => ({
    id: `recruiter:${section.id}`,
    kind: 'recruiter-section' as const,
    title: `Recruiter: ${section.label}`,
    subtitle: 'Guided overview section',
    name: section.label,
    keywords: uniqueSearchTerms(['recruiter', 'overview', section.label, section.id]),
    aliases: [],
    searchableText: section.label,
    action: { type: 'open-recruiter-section', sectionId: section.id },
    iconAppId: 'recruiter',
  }))
}

function buildLinkEntries(): SpotlightEntry[] {
  const links: SpotlightEntry[] = []
  for (const project of PROJECTS) {
    for (const link of project.links ?? []) {
      if (link.kind === 'demo') continue
      links.push({
        id: `link:${project.id}:${link.kind}`,
        kind: 'link',
        title: link.label,
        subtitle: `${project.name} / ${link.kind === 'app-store' ? 'App Store' : link.kind}`,
        name: project.name,
        keywords: uniqueSearchTerms([link.label, link.kind, project.name, 'link']),
        aliases: link.kind === 'app-store' ? ['app store', 'ios'] : [],
        searchableText: link.href,
        action: { type: 'open-external', href: link.href },
        iconAppId: project.internalApp ?? 'projects',
        sourceProjectId: project.id,
      })
    }
  }
  return links
}

function buildProfileEntry(): SpotlightEntry {
  return {
    id: 'profile:jack',
    kind: 'app',
    title: PROFILE.name,
    subtitle: PROFILE.headline,
    name: PROFILE.name,
    keywords: uniqueSearchTerms([PROFILE.name, PROFILE.role, ...PROFILE.focusAreas]),
    aliases: ['jack', 'jack dennehey', 'profile'],
    searchableText: compactSearchText([
      PROFILE.summary,
      PROFILE.shortIntro,
      PROFILE.professionalDirection,
      PROFILE.opportunityStatement,
    ]),
    action: { type: 'open-app', appId: 'portfolio' },
    iconAppId: 'portfolio',
  }
}

function buildSystemEntries(): SpotlightEntry[] {
  return [
    systemEntry('personalize', 'Personalize', 'Open Wallpapers', ['personalize', 'wallpaper', 'background'], 70),
    systemEntry('reset-layout', 'Reset Window Layout', 'Clear remembered window positions and sizes', [
      'reset',
      'layout',
      'windows',
      'geometry',
    ]),
    systemEntry('simple-mode', 'Open Simple Mode', 'Conventional portfolio without the desktop', [
      'simple',
      'plain portfolio',
      'resume view',
    ]),
    systemEntry('restart', 'Restart JackOS', 'Reload this session', ['restart', 'reload', 'reboot']),
    systemEntry('toggle-theme', 'Toggle Light/Dark Theme', 'Interface appearance', ['theme', 'light', 'dark']),
    systemEntry('toggle-scanlines', 'Toggle CRT Lines', 'Scanline overlay', ['crt', 'scanlines', 'lines']),
    systemEntry('toggle-sound', 'Toggle Sound Effects', 'Interface sounds', ['sound', 'audio', 'effects']),
    systemEntry('toggle-hourly-chime', 'Toggle Hourly Chime', 'Clock ambience', ['hourly', 'chime', 'clock']),
    systemEntry('view-achievements', 'View Achievements', 'Session unlocks', [
      'achievements',
      'progress',
      'trophies',
    ]),
    systemEntry('copy-email', 'Copy Email', PROFILE.contact.email, ['email', 'contact', 'copy', 'gmail']),
    systemEntry('restore-minimized', 'Restore all minimized windows', 'Desktop windows', [
      'restore',
      'minimized',
      'windows',
    ]),
    systemEntry('minimize-active', 'Minimize active window', 'Desktop windows', ['minimize', 'active', 'window']),
    systemEntry('focus-desktop', 'Go to Desktop / Home', 'Focus the JackOS workspace', [
      'desktop',
      'home',
      'workspace',
      'back',
    ]),
    systemEntry('ask-jd', 'Ask J.D.', 'Portfolio assistant', ['assistant', 'jd', 'question', 'ask']),
  ]
}

let cachedIndex: readonly SpotlightEntry[] | null = null

export function buildSpotlightIndex(): readonly SpotlightEntry[] {
  if (cachedIndex) return cachedIndex

  cachedIndex = [
    ...buildAppEntries(),
    buildProfileEntry(),
    ...buildProjectEntries(),
    ...buildCaseStudyEntries(),
    ...buildSkillEntries(),
    ...buildExperienceEntries(),
    ...buildEducationEntries(),
    ...buildCredentialEntries(),
    ...buildTimelineEntries(),
    ...buildRecruiterEntries(),
    ...buildLinkEntries(),
    ...buildSystemEntries(),
  ]

  return cachedIndex
}
