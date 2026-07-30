import { Download, Mail } from 'lucide-react'
import type { WindowId } from '../apps'
import { CONTACT } from '@/lib/portfolio-data'
import { PUBLIC_RESUME } from '@/lib/resume'

export function ResumeContent({
  onOpen,
  onCopyEmail,
  onResumeUnavailable,
}: {
  onOpen: (id: WindowId) => void
  onCopyEmail: () => void
  onResumeUnavailable: () => void
}) {
  const resumePath = PUBLIC_RESUME.available ? PUBLIC_RESUME.path : null

  return (
    <div className="space-y-5">
      <section className="os-border bg-secondary p-4">
        <p className="font-pixel text-[10px] leading-relaxed text-muted-foreground">
          {'> resume status'}
        </p>
        <h2 className="mt-3 font-pixel text-base leading-relaxed text-foreground">
          Resume
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-foreground text-pretty">
          Jack&apos;s public resume is being prepared for release. For current experience,
          education, projects, and credentials, explore Jack OS or contact Jack directly.
        </p>
      </section>

      <section className="os-border bg-card p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-lg font-semibold text-foreground">Jack Dennehey</p>
            <p className="text-sm text-muted-foreground">Business Student · Penn State</p>
          </div>
          {resumePath ? (
            <a
              href={resumePath}
              download={PUBLIC_RESUME.fileName ?? undefined}
              className="os-border inline-flex items-center gap-2 bg-foreground px-3 py-2 font-pixel text-[8px] leading-relaxed text-primary-foreground transition-colors hover:bg-card hover:text-foreground focus-visible:bg-card focus-visible:text-foreground focus-visible:outline-none"
            >
              <Download className="size-3.5" />
              Download Resume
            </a>
          ) : (
            <button
              type="button"
              aria-disabled="true"
              onClick={onResumeUnavailable}
              className="os-border inline-flex cursor-default items-center gap-2 bg-secondary px-3 py-2 font-pixel text-[8px] leading-relaxed text-muted-foreground transition-colors hover:bg-card focus-visible:bg-card focus-visible:outline-none"
            >
              <Download className="size-3.5" />
              Download Resume: {PUBLIC_RESUME.statusLabel}
            </button>
          )}
        </div>

        <p className="mt-4 text-sm leading-relaxed text-muted-foreground text-pretty">
          No home address or phone number is published through Jack OS. The safest current contact
          point is {CONTACT.email}.
        </p>
      </section>

      <section className="grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onOpen('projects')}
          className="os-border bg-card px-3 py-2 text-left font-pixel text-[8px] leading-relaxed text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none"
        >
          View Projects
        </button>
        <button
          type="button"
          onClick={() => onOpen('certifications')}
          className="os-border bg-card px-3 py-2 text-left font-pixel text-[8px] leading-relaxed text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none"
        >
          View Credentials
        </button>
        <button
          type="button"
          onClick={() => onOpen('contact')}
          className="os-border bg-card px-3 py-2 text-left font-pixel text-[8px] leading-relaxed text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none"
        >
          Contact Jack
        </button>
        <button
          type="button"
          onClick={onCopyEmail}
          className="os-border bg-card px-3 py-2 text-left font-pixel text-[8px] leading-relaxed text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none"
        >
          <span className="inline-flex items-center gap-2">
            <Mail className="size-3.5" />
            Copy Email
          </span>
        </button>
      </section>
    </div>
  )
}
