import { ExternalLink } from 'lucide-react'
import { PROJECTS } from '@/lib/portfolio-data'
import { GithubIcon } from '@/components/os/brand-icons'

export function ProjectsContent() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {PROJECTS.map((project) => (
        <article key={project.title} className="os-border flex flex-col bg-card p-4">
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
            {project.github ? (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="os-border inline-flex items-center gap-1.5 bg-background px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground"
              >
                <GithubIcon className="size-3.5" /> Code
              </a>
            ) : null}
            {project.demo ? (
              <a
                href={project.demo}
                target="_blank"
                rel="noopener noreferrer"
                className="os-border inline-flex items-center gap-1.5 bg-background px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground"
              >
                <ExternalLink className="size-3.5" /> Live Demo
              </a>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  )
}
