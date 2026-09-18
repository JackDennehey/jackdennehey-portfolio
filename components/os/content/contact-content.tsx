import { Copy, ExternalLink, Mail } from 'lucide-react'
import { PROFILE, PROFILE_LINKS } from '@/lib/portfolio'
import { GithubIcon, LinkedinIcon } from '@/components/os/brand-icons'

const LINK_ICONS = {
  email: Mail,
  github: GithubIcon,
  linkedin: LinkedinIcon,
  site: ExternalLink,
} as const

export function ContactContent({ onCopyEmail }: { onCopyEmail: () => void }) {
  return (
    <div className="space-y-5">
      <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
        {PROFILE.opportunityStatement}
      </p>

      <ul className="space-y-3">
        {PROFILE_LINKS.map((link) => {
          const Icon = LINK_ICONS[link.id]
          return (
            <li key={link.id}>
              <a
                href={link.href}
                {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="os-border group flex min-h-11 items-center gap-3 bg-card p-3 transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none"
              >
                <span
                  aria-hidden
                  className="os-border flex size-9 shrink-0 items-center justify-center bg-secondary text-foreground group-hover:bg-primary-foreground"
                >
                  <Icon className="size-4" />
                </span>
                <span className="min-w-0">
                  <span className="block font-pixel text-[9px] leading-relaxed text-muted-foreground group-hover:text-primary-foreground/80">
                    {link.label}
                  </span>
                  <span className="flex min-w-0 items-center gap-1.5">
                    <span className="block truncate text-sm font-medium">{link.value}</span>
                    {link.external ? <ExternalLink aria-hidden className="size-3 shrink-0" /> : null}
                  </span>
                </span>
              </a>
            </li>
          )
        })}
      </ul>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onCopyEmail}
          className="os-border inline-flex min-h-11 items-center gap-2 bg-card px-3 py-2 font-pixel text-[8px] leading-relaxed text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none"
        >
          <Copy className="size-3.5" />
          Copy Email
        </button>
        <a
          href="/jack-dennehey-resume.txt"
          download
          className="os-border inline-flex min-h-11 items-center gap-2 bg-card px-3 py-2 font-pixel text-[8px] leading-relaxed text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none"
        >
          Download Resume
        </a>
      </div>
    </div>
  )
}
