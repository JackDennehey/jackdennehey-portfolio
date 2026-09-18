import { ExternalLink } from 'lucide-react'
import { getProjectActions, PROJECTS } from '@/lib/portfolio'
import { GithubIcon } from '@/components/os/brand-icons'
import type { WindowId } from '../apps'
import { cn } from '@/lib/utils'

export function ProjectsContent({
  onOpen,
  onOpenCaseStudy,
}: {
  onOpen?: (id: WindowId) => void
  onOpenCaseStudy?: (projectId: string) => void
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {PROJECTS.map((project) => {
        const actions = getProjectActions(project)
        return (
        <article
          key={project.id}
          className={cn(
            'os-border flex flex-col bg-card p-4',
            project.spotlight ? 'sm:col-span-2' : null,
          )}
        >
          {project.featuredLabel ? (
            <p className="mb-2 font-pixel text-[8px] leading-relaxed text-muted-foreground">
              {project.featuredLabel}
            </p>
          ) : null}

          {project.media?.thumbnail ? (
            <div className="os-border mb-3 grid aspect-[5/3] place-items-center overflow-hidden bg-secondary p-2">
              <img
                src={project.media.thumbnail.src}
                alt={project.media.thumbnail.alt}
                loading="lazy"
                decoding="async"
                className="h-full max-h-28 w-full object-contain"
              />
            </div>
          ) : null}

          <div className="flex items-start justify-between gap-2">
            <h3 className="font-pixel text-[11px] leading-relaxed text-foreground">
              {project.name}
            </h3>
            {project.statusLabel ? (
              <span className="os-border max-w-[12rem] shrink-0 bg-secondary px-1.5 py-0.5 text-right text-[10px] font-medium leading-snug text-muted-foreground">
                {project.statusLabel}
              </span>
            ) : null}
          </div>

          <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground text-pretty">
            {project.shortDescription}
          </p>

          {project.role || project.implementation || project.keySystems ? (
            <div className="mt-3 space-y-2 border-t-2 border-border pt-3 text-xs leading-relaxed text-muted-foreground">
              {project.role ? (
                <p>
                  <span className="font-semibold text-foreground">Role:</span> {project.role}
                </p>
              ) : null}
              {project.implementation ? (
                <p>
                  <span className="font-semibold text-foreground">Implementation:</span>{' '}
                  {project.implementation}
                </p>
              ) : null}
              {project.keySystems ? (
                <ul className="grid gap-1" aria-label={`${project.name} key systems`}>
                  {project.keySystems.map((system) => (
                    <li key={system} className="flex min-w-0 gap-2">
                      <span aria-hidden className="mt-1.5 size-1 shrink-0 bg-current" />
                      <span>{system}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}

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
            {actions.map((action) => {
              if (action.kind === 'case-study') {
                if (!onOpenCaseStudy) return null
                return (
                  <button
                    key={`case-study-${action.projectId}`}
                    type="button"
                    onClick={() => onOpenCaseStudy(action.projectId)}
                    className="os-border inline-flex min-h-9 items-center gap-1.5 bg-foreground px-2.5 py-1.5 font-pixel text-[8px] leading-relaxed text-primary-foreground transition-colors hover:bg-background hover:text-foreground focus-visible:bg-background focus-visible:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {action.label}
                  </button>
                )
              }
              if (action.kind === 'internal-app') {
                if (!onOpen) return null
                return (
                  <button
                    key={`app-${action.appId}`}
                    type="button"
                    onClick={() => onOpen(action.appId as WindowId)}
                    className="os-border inline-flex min-h-9 items-center gap-1.5 bg-background px-2.5 py-1.5 font-pixel text-[8px] leading-relaxed text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {action.label}
                  </button>
                )
              }
              return (
                <a
                  key={action.href}
                  href={action.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="os-border inline-flex min-h-9 items-center gap-1.5 bg-background px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground"
                >
                  {action.label.toLowerCase().includes('github') ? (
                    <GithubIcon className="size-3.5" />
                  ) : (
                    <ExternalLink className="size-3.5" />
                  )}{' '}
                  {action.label.toLowerCase().includes('github') ? 'Code' : action.label}
                </a>
              )
            })}
          </div>
        </article>
        )
      })}
    </div>
  )
}
