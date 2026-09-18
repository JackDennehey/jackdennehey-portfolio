import { getFeaturedProjects, getProjectActions, getProjectById } from '@/lib/portfolio/selectors'
import { PROJECTS } from '@/lib/portfolio/projects'
import { EXPERIENCE } from '@/lib/portfolio/experience'
import { EDUCATION } from '@/lib/portfolio/education'
import { SKILL_GROUPS } from '@/lib/portfolio/skills'
import { CREDENTIALS } from '@/lib/portfolio/credentials'
import type { Credential, EducationEntry, ExperienceEntry, Project, SkillGroup } from '@/lib/portfolio/types'

export const FILES_FOLDERS = [
  'root',
  'projects',
  'experience',
  'education',
  'skills',
  'credentials',
] as const

export type FilesFolderId = (typeof FILES_FOLDERS)[number]

export type FilesItemKind =
  | 'directory'
  | 'project'
  | 'experience'
  | 'education'
  | 'skill'
  | 'credential'
  | 'resume'

export type FilesPath = {
  folder: FilesFolderId
  selectedId: string | null
}

export type FilesOpenTarget =
  | { type: 'navigate'; path: FilesPath }
  | {
      type: 'window'
      windowId: 'resume' | 'certifications' | 'portfolio' | 'projects'
      portfolioSection?: 'experience' | 'education' | 'skills' | 'credentials'
    }
  | { type: 'project'; projectId: string; preferred: 'case-study' | 'internal-app' | 'projects' }

export type FilesInspector = {
  title: string
  kindLabel: string
  subtitle?: string
  meta: Array<{ label: string; value: string }>
  summary?: string
  tags?: readonly string[]
  featured?: boolean
  actions: Array<{ id: string; label: string; target: FilesOpenTarget }>
}

export type FilesItem = {
  id: string
  kind: FilesItemKind
  title: string
  subtitle: string
  meta: string
  featured?: boolean
  projectId?: string
  path?: FilesPath
}

export const FILES_ROOT_PATH: FilesPath = { folder: 'root', selectedId: null }
export const FILES_RESUME_ID = 'resume'
export const FILES_HASH_PREFIX = 'files'

const FOLDER_LABELS: Record<Exclude<FilesFolderId, 'root'>, string> = {
  projects: 'Projects',
  experience: 'Experience',
  education: 'Education',
  skills: 'Skills',
  credentials: 'Credentials',
}

const FOLDER_SUBTITLES: Record<Exclude<FilesFolderId, 'root'>, string> = {
  projects: 'What Jack has built',
  experience: 'Roles and independent work',
  education: 'Schools and programs',
  skills: 'Capability groupings',
  credentials: 'Certificates and proof',
}

function listedProjects(): readonly Project[] {
  const featured = getFeaturedProjects()
  const featuredIds = new Set(featured.map((project) => project.id))
  return [...featured, ...PROJECTS.filter((project) => !featuredIds.has(project.id))]
}

function isFolderId(value: string): value is Exclude<FilesFolderId, 'root'> {
  return value in FOLDER_LABELS
}

function itemExists(folder: FilesFolderId, id: string | null): boolean {
  if (!id) return folder === 'root'
  if (folder === 'root') return id === FILES_RESUME_ID || isFolderId(id)
  return listFilesItems({ folder, selectedId: null }).some((item) => item.id === id)
}

export function pathsEqual(a: FilesPath, b: FilesPath): boolean {
  return a.folder === b.folder && a.selectedId === b.selectedId
}

export function parseFilesHash(hash: string): FilesPath | null {
  const raw = hash.replace(/^#/, '').trim()
  if (!raw) return null
  const parts = raw.split('/').filter(Boolean)
  if (parts[0] !== FILES_HASH_PREFIX) return null

  if (parts.length === 1) return FILES_ROOT_PATH

  const second = parts[1]
  if (!second) return FILES_ROOT_PATH

  if (second === FILES_RESUME_ID) {
    return { folder: 'root', selectedId: FILES_RESUME_ID }
  }

  if (!isFolderId(second)) return FILES_ROOT_PATH

  const selectedId = parts[2] ?? null
  if (selectedId && itemExists(second, selectedId)) {
    return { folder: second, selectedId }
  }

  return { folder: second, selectedId: null }
}

export function getFilesHash(path: FilesPath): string {
  if (path.folder === 'root') {
    return path.selectedId === FILES_RESUME_ID ? `${FILES_HASH_PREFIX}/${FILES_RESUME_ID}` : FILES_HASH_PREFIX
  }
  if (path.selectedId && itemExists(path.folder, path.selectedId)) {
    return `${FILES_HASH_PREFIX}/${path.folder}/${path.selectedId}`
  }
  return `${FILES_HASH_PREFIX}/${path.folder}`
}

export function getFilesCrumbs(path: FilesPath): Array<{ label: string; path: FilesPath }> {
  const crumbs: Array<{ label: string; path: FilesPath }> = [
    { label: 'Jack', path: FILES_ROOT_PATH },
  ]
  if (path.folder === 'root') {
    if (path.selectedId === FILES_RESUME_ID) {
      crumbs.push({ label: 'Resume', path: { folder: 'root', selectedId: FILES_RESUME_ID } })
    }
    return crumbs
  }

  crumbs.push({
    label: FOLDER_LABELS[path.folder],
    path: { folder: path.folder, selectedId: null },
  })

  if (path.selectedId) {
    const item = listFilesItems({ folder: path.folder, selectedId: null }).find((entry) => entry.id === path.selectedId)
    if (item) {
      crumbs.push({ label: item.title, path })
    }
  }

  return crumbs
}

export function getFilesLocationTitle(path: FilesPath): string {
  if (path.folder === 'root') return path.selectedId === FILES_RESUME_ID ? 'Jack / Resume' : 'Jack'
  const folder = FOLDER_LABELS[path.folder]
  if (!path.selectedId) return `Jack / ${folder}`
  const item = listFilesItems({ folder: path.folder, selectedId: null }).find((entry) => entry.id === path.selectedId)
  return item ? `Jack / ${folder} / ${item.title}` : `Jack / ${folder}`
}

function directoryItem(id: Exclude<FilesFolderId, 'root'>): FilesItem {
  const count = listFilesItems({ folder: id, selectedId: null }).length
  return {
    id,
    kind: 'directory',
    title: FOLDER_LABELS[id],
    subtitle: FOLDER_SUBTITLES[id],
    meta: `${count} ${count === 1 ? 'item' : 'items'}`,
    path: { folder: id, selectedId: null },
  }
}

function projectStatus(project: Project): string {
  if (project.statusLabel) return project.statusLabel
  if (project.status === 'live') return 'Live'
  if (project.status === 'in-progress') return 'In progress'
  if (project.status === 'ongoing') return 'Ongoing'
  return 'Planned'
}

export function listFilesItems(path: FilesPath): FilesItem[] {
  if (path.folder === 'root') {
    return [
      directoryItem('projects'),
      directoryItem('experience'),
      directoryItem('education'),
      directoryItem('skills'),
      directoryItem('credentials'),
      {
        id: FILES_RESUME_ID,
        kind: 'resume',
        title: 'Resume',
        subtitle: 'Canonical resume',
        meta: 'Opens Resume',
      },
    ]
  }

  if (path.folder === 'projects') {
    return listedProjects().map((project) => ({
      id: project.id,
      kind: 'project' as const,
      title: project.name,
      subtitle: project.shortDescription,
      meta: `${projectStatus(project)} · ${project.category}`,
      featured: project.featured,
      projectId: project.id,
    }))
  }

  if (path.folder === 'experience') {
    return EXPERIENCE.map((entry) => ({
      id: entry.id,
      kind: 'experience' as const,
      title: entry.role,
      subtitle: entry.organization,
      meta: entry.period,
    }))
  }

  if (path.folder === 'education') {
    return EDUCATION.map((entry) => ({
      id: entry.id,
      kind: 'education' as const,
      title: entry.school,
      subtitle: entry.program,
      meta: entry.period,
    }))
  }

  if (path.folder === 'skills') {
    return SKILL_GROUPS.map((group) => ({
      id: group.id,
      kind: 'skill' as const,
      title: group.group,
      subtitle: group.items.slice(0, 3).join(' · '),
      meta: `${group.items.length} skills`,
    }))
  }

  return CREDENTIALS.map((credential) => ({
    id: credential.id,
    kind: 'credential' as const,
    title: credential.title,
    subtitle: credential.issuer,
    meta: credential.status,
    featured: credential.featured,
  }))
}

function selectedItem(path: FilesPath): FilesItem | null {
  if (!path.selectedId) return null
  return listFilesItems({ folder: path.folder, selectedId: null }).find((item) => item.id === path.selectedId) ?? null
}

function projectInspector(project: Project): FilesInspector {
  const actions = getProjectActions(project)
  const hasCaseStudy = actions.some((action) => action.kind === 'case-study')
  const hasInternal = actions.some((action) => action.kind === 'internal-app')
  const preferred: FilesOpenTarget =
    hasCaseStudy
      ? { type: 'project', projectId: project.id, preferred: 'case-study' }
      : hasInternal
        ? { type: 'project', projectId: project.id, preferred: 'internal-app' }
        : { type: 'project', projectId: project.id, preferred: 'projects' }

  return {
    title: project.name,
    kindLabel: project.featured ? 'Featured project' : 'Project',
    subtitle: project.shortDescription,
    featured: project.featured,
    meta: [
      { label: 'Status', value: projectStatus(project) },
      { label: 'Category', value: project.category },
      { label: 'Case study', value: hasCaseStudy ? 'Available' : 'Not in Files' },
    ],
    summary: project.longDescription ?? project.shortDescription,
    tags: project.technologies,
    actions: [
      {
        id: 'open-project',
        label: hasCaseStudy ? 'Open case study' : hasInternal ? 'Open app' : 'Open in Projects',
        target: preferred,
      },
    ],
  }
}

function experienceInspector(entry: ExperienceEntry): FilesInspector {
  return {
    title: entry.role,
    kindLabel: 'Experience',
    subtitle: entry.organization,
    meta: [{ label: 'Period', value: entry.period }],
    summary: entry.description,
    tags: entry.technologies,
    actions: [
      {
        id: 'view-portfolio',
        label: 'View in Portfolio',
        target: { type: 'window', windowId: 'portfolio', portfolioSection: 'experience' },
      },
    ],
  }
}

function educationInspector(entry: EducationEntry): FilesInspector {
  return {
    title: entry.school,
    kindLabel: entry.status === 'current' ? 'Current education' : 'Education',
    subtitle: entry.program,
    meta: [
      { label: 'Period', value: entry.period },
      ...(entry.honors ? [{ label: 'Honors', value: entry.honors }] : []),
    ],
    summary: entry.detail,
    actions: [
      {
        id: 'view-portfolio',
        label: 'View in Portfolio',
        target: { type: 'window', windowId: 'portfolio', portfolioSection: 'education' },
      },
    ],
  }
}

function skillInspector(group: SkillGroup): FilesInspector {
  return {
    title: group.group,
    kindLabel: 'Skill group',
    meta: [{ label: 'Related projects', value: String(group.relatedProjectIds?.length ?? 0) }],
    summary: group.items.join(' · '),
    tags: group.items,
    actions: [
      {
        id: 'view-portfolio',
        label: 'View in Portfolio',
        target: { type: 'window', windowId: 'portfolio', portfolioSection: 'skills' },
      },
    ],
  }
}

function credentialInspector(credential: Credential): FilesInspector {
  return {
    title: credential.title,
    kindLabel: credential.featured ? 'Featured credential' : 'Credential',
    subtitle: credential.issuer,
    featured: credential.featured,
    meta: [
      { label: 'Status', value: credential.status },
      ...(credential.date ? [{ label: 'Date', value: credential.date }] : []),
    ],
    summary: credential.summary,
    actions: [
      {
        id: 'open-credentials',
        label: 'Open Credentials',
        target: { type: 'window', windowId: 'certifications' },
      },
    ],
  }
}

export function getFilesInspector(path: FilesPath): FilesInspector | null {
  const item = selectedItem(path)
  if (!item) {
    if (path.folder === 'root') {
      return {
        title: 'Jack',
        kindLabel: 'Library',
        summary: 'Browse what Jack has built, learned, and worked on. This is a portfolio explorer, not a disk.',
        meta: [{ label: 'Contents', value: 'Projects, experience, education, skills, credentials, resume' }],
        actions: [],
      }
    }
    return {
      title: FOLDER_LABELS[path.folder],
      kindLabel: 'Folder',
      subtitle: FOLDER_SUBTITLES[path.folder],
      meta: [{ label: 'Items', value: String(listFilesItems(path).length) }],
      actions: [],
    }
  }

  if (item.kind === 'directory' && isFolderId(item.id)) {
    return {
      title: item.title,
      kindLabel: 'Folder',
      subtitle: item.subtitle,
      meta: [{ label: 'Items', value: item.meta }],
      actions: [{ id: 'open-folder', label: 'Open folder', target: { type: 'navigate', path: item.path! } }],
    }
  }

  if (item.kind === 'resume') {
    return {
      title: 'Resume',
      kindLabel: 'Document',
      subtitle: 'Canonical resume',
      meta: [{ label: 'Opens', value: 'Resume app' }],
      summary: 'Opens the existing JackOS resume. Files does not keep a second copy.',
      actions: [{ id: 'open-resume', label: 'Open Resume', target: { type: 'window', windowId: 'resume' } }],
    }
  }

  if (item.kind === 'project') {
    const project = getProjectById(item.id)
    return project ? projectInspector(project) : null
  }
  if (item.kind === 'experience') {
    const entry = EXPERIENCE.find((record) => record.id === item.id)
    return entry ? experienceInspector(entry) : null
  }
  if (item.kind === 'education') {
    const entry = EDUCATION.find((record) => record.id === item.id)
    return entry ? educationInspector(entry) : null
  }
  if (item.kind === 'skill') {
    const group = SKILL_GROUPS.find((record) => record.id === item.id)
    return group ? skillInspector(group) : null
  }
  const credential = CREDENTIALS.find((record) => record.id === item.id)
  return credential ? credentialInspector(credential) : null
}

export function getPrimaryOpenTarget(path: FilesPath): FilesOpenTarget | null {
  const item = selectedItem(path)
  if (!item) return null
  if (item.kind === 'directory' && item.path) return { type: 'navigate', path: item.path }
  if (item.kind === 'resume') return { type: 'window', windowId: 'resume' }
  if (item.kind === 'credential') return { type: 'window', windowId: 'certifications' }
  if (item.kind === 'project') {
    return getFilesInspector(path)?.actions[0]?.target ?? null
  }
  return null
}

export function selectFilesItem(path: FilesPath, id: string): FilesPath {
  if (!itemExists(path.folder, id) && !(path.folder === 'root' && (id === FILES_RESUME_ID || isFolderId(id)))) {
    return path
  }
  return { folder: path.folder, selectedId: id }
}

export function filesFolderFromId(id: string): FilesFolderId | null {
  if (id === 'root') return 'root'
  return isFolderId(id) ? id : null
}

export const FILES_SPOTLIGHT_FOLDERS: Array<{ folder: Exclude<FilesFolderId, 'root'>; title: string; keywords: string[] }> = [
  { folder: 'projects', title: 'Files · Projects', keywords: ['catalog', 'built', 'work'] },
  { folder: 'experience', title: 'Files · Experience', keywords: ['roles', 'work history'] },
  { folder: 'education', title: 'Files · Education', keywords: ['school', 'penn state'] },
  { folder: 'skills', title: 'Files · Skills', keywords: ['capabilities', 'stack groups'] },
  { folder: 'credentials', title: 'Files · Credentials', keywords: ['certificates', 'honors'] },
]
