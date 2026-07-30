import { ExternalLink } from 'lucide-react'
import { PROJECTS, getProjectBySlug, type Project } from '@/lib/portfolio-data'
import { GithubIcon } from '@/components/os/brand-icons'

type ProjectsContentProps = {
  selectedProjectSlug: string | null
  onSelectProject: (slug: string) => void
  onBackToProjects: () => void
  onCopyProjectLink: (slug: string) => void
}

export function ProjectsContent({
  selectedProjectSlug,
  onSelectProject,
  onBackToProjects,
  onCopyProjectLink,
}: ProjectsContentProps) {
  const selectedProject = getProjectBySlug(selectedProjectSlug)

  if (selectedProject) {
    return (
      <ProjectDetail
        project={selectedProject}
        onBack={onBackToProjects}
        onCopyLink={() => onCopyProjectLink(selectedProject.slug)}
      />
    )
  }

  return (
    <div className="space-y-4">
      <section className="os-border bg-secondary p-4">
        <p className="font-pixel text-[10px] leading-relaxed text-muted-foreground">
          {'> project index'}
        </p>
        <h2 className="mt-3 font-pixel text-base leading-relaxed text-foreground">
          Projects
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
          A focused record of Jack&apos;s portfolio work, technical study, and project areas in
          progress.
        </p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        {PROJECTS.map((project) => (
          <ProjectCard
            key={project.slug}
            project={project}
            onSelect={() => onSelectProject(project.slug)}
          />
        ))}
      </div>
    </div>
  )
}

function ProjectCard({
  project,
  onSelect,
}: {
  project: Project
  onSelect: () => void
}) {
  return (
    <article className="os-border flex flex-col bg-card p-4">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-pixel text-[11px] leading-relaxed text-foreground">
          {project.title}
        </h3>
        {project.status ? (
          <span className="os-border shrink-0 bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            {project.status}
          </span>
        ) : null}
      </div>

      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground text-pretty">
        {project.description}
      </p>

      <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Technologies">
        {project.technologies.map((tech) => (
          <li
            key={tech}
            className="border border-border/40 bg-secondary px-1.5 py-0.5 text-[11px] font-medium text-foreground"
          >
            {tech}
          </li>
        ))}
      </ul>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onSelect}
          className="os-border bg-background px-2.5 py-1.5 font-pixel text-[8px] leading-relaxed text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none"
        >
          {project.featured ? 'Open Case Study' : 'View Details'}
        </button>
        {project.github ? (
          <a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            className="os-border inline-flex items-center gap-1.5 bg-background px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none"
          >
            <GithubIcon className="size-3.5" /> Code
          </a>
        ) : null}
        {project.demo ? (
          <a
            href={project.demo}
            target="_blank"
            rel="noopener noreferrer"
            className="os-border inline-flex items-center gap-1.5 bg-background px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none"
          >
            <ExternalLink className="size-3.5" /> Live
          </a>
        ) : null}
      </div>
    </article>
  )
}

function ProjectDetail({
  project,
  onBack,
  onCopyLink,
}: {
  project: Project
  onBack: () => void
  onCopyLink: () => void
}) {
  return (
    <div className="space-y-4">
      <section className="os-border bg-secondary p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-pixel text-[10px] leading-relaxed text-muted-foreground">
              {project.featured ? '> case study' : '> project detail'}
            </p>
            <h2 className="mt-3 font-pixel text-base leading-relaxed text-foreground">
              {project.title}
            </h2>
          </div>
          {project.status ? (
            <span className="os-border bg-card px-2 py-1 text-xs font-medium text-muted-foreground">
              {project.status}
            </span>
          ) : null}
        </div>
        <p className="mt-3 text-sm leading-relaxed text-foreground text-pretty">
          {project.detail?.summary ?? project.description}
        </p>
      </section>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onBack}
          className="os-border bg-card px-3 py-2 font-pixel text-[8px] leading-relaxed text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none"
        >
          Back to Projects
        </button>
        <button
          type="button"
          onClick={onCopyLink}
          className="os-border bg-card px-3 py-2 font-pixel text-[8px] leading-relaxed text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none"
        >
          Copy Project Link
        </button>
        {project.demo ? (
          <a
            href={project.demo}
            target="_blank"
            rel="noopener noreferrer"
            className="os-border inline-flex items-center gap-1.5 bg-card px-3 py-2 font-pixel text-[8px] leading-relaxed text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none"
          >
            <ExternalLink className="size-3.5" /> Live Website
          </a>
        ) : null}
        {project.github ? (
          <a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            className="os-border inline-flex items-center gap-1.5 bg-card px-3 py-2 font-pixel text-[8px] leading-relaxed text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none"
          >
            <GithubIcon className="size-3.5" /> GitHub
          </a>
        ) : null}
      </div>

      <ul className="flex flex-wrap gap-1.5" aria-label="Technologies">
        {project.technologies.map((tech) => (
          <li
            key={tech}
            className="border border-border/40 bg-secondary px-1.5 py-0.5 text-[11px] font-medium text-foreground"
          >
            {tech}
          </li>
        ))}
      </ul>

      {project.detail?.sections.map((section) => (
        <section key={section.heading} className="os-border bg-card p-4">
          <h3 className="font-pixel text-[10px] leading-relaxed text-foreground">
            {section.heading}
          </h3>
          {section.body ? (
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
              {section.body}
            </p>
          ) : null}
          {section.items ? (
            <ul className="mt-2 grid gap-1 text-sm leading-relaxed text-muted-foreground sm:grid-cols-2">
              {section.items.map((item) => (
                <li key={item} className="flex min-w-0 gap-2">
                  <span aria-hidden className="mt-2 size-1.5 shrink-0 bg-current" />
                  <span className="min-w-0">{item}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      ))}
    </div>
  )
}
