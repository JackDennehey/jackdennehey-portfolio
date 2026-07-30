import { Mail } from 'lucide-react'
import { CONTACT } from '@/lib/portfolio-data'
import { GithubIcon, LinkedinIcon } from '@/components/os/brand-icons'

const LINKS = [
  { label: 'GitHub', value: 'github.com/JackDennehey', href: CONTACT.github, Icon: GithubIcon, external: true },
  {
    label: 'LinkedIn',
    value: 'in/jackdennehey',
    href: CONTACT.linkedin,
    Icon: LinkedinIcon,
    external: true,
  },
  { label: 'Email', value: CONTACT.email, href: `mailto:${CONTACT.email}`, Icon: Mail, external: false },
]

export function ContactContent({
  onCopyEmail,
  onCopyPortfolioLink,
}: {
  onCopyEmail: () => void
  onCopyPortfolioLink: () => void
}) {
  return (
    <div className="space-y-5">
      <section className="os-border bg-secondary p-4">
        <p className="font-pixel text-[10px] leading-relaxed text-muted-foreground">
          {'> contact'}
        </p>
        <h2 className="mt-3 font-pixel text-base leading-relaxed text-foreground">
          Contact Jack
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-foreground text-pretty">
          Open to internships, entry-level opportunities, collaboration, and professional
          connections.
        </p>
      </section>

      <ul className="space-y-3">
        {LINKS.map(({ label, value, href, Icon, external }) => (
          <li key={label}>
            <a
              href={href}
              {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              className="os-border group flex items-center gap-3 bg-card p-3 transition-colors hover:bg-foreground hover:text-primary-foreground"
            >
              <span
                aria-hidden
                className="os-border flex size-9 shrink-0 items-center justify-center bg-secondary text-foreground group-hover:bg-primary-foreground"
              >
                <Icon className="size-4" />
              </span>
              <span className="min-w-0">
                <span className="block font-pixel text-[9px] leading-relaxed text-muted-foreground group-hover:text-primary-foreground/80">
                  {label}
                </span>
                <span className="block truncate text-sm font-medium">{value}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onCopyEmail}
          className="os-border bg-card px-3 py-2 font-pixel text-[8px] leading-relaxed text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none"
        >
          Copy Email
        </button>
        <button
          type="button"
          onClick={onCopyPortfolioLink}
          className="os-border bg-card px-3 py-2 font-pixel text-[8px] leading-relaxed text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none"
        >
          Copy Portfolio Link
        </button>
      </div>

      <div className="os-border bg-secondary p-4 text-center">
        <p className="font-pixel text-[9px] leading-relaxed text-muted-foreground">
          portfolio url
        </p>
        <p className="mt-2 text-lg font-semibold tracking-tight text-foreground">
          {CONTACT.domain}
        </p>
      </div>
    </div>
  )
}
