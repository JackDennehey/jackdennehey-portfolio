import { Mail } from 'lucide-react'
import { CONTACT } from '@/lib/portfolio-data'
import { GithubIcon, LinkedinIcon } from '@/components/os/brand-icons'

const LINKS = [
  { label: 'GitHub', value: 'github.com/jackdennehey', href: CONTACT.github, Icon: GithubIcon, external: true },
  {
    label: 'LinkedIn',
    value: 'in/jackdennehey',
    href: CONTACT.linkedin,
    Icon: LinkedinIcon,
    external: true,
  },
  { label: 'Email', value: CONTACT.email, href: `mailto:${CONTACT.email}`, Icon: Mail, external: false },
]

export function ContactContent() {
  return (
    <div className="space-y-5">
      <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
        Let&apos;s connect. Reach out through any of the channels below.
      </p>

      <ul className="space-y-3">
        {LINKS.map(({ label, value, href, Icon, external }) => (
          <li key={label}>
            <a
              href={href}
              {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
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

      <div className="os-border bg-secondary p-4 text-center">
        <p className="font-pixel text-[9px] leading-relaxed text-muted-foreground">
          future website domain
        </p>
        <p className="mt-2 text-lg font-semibold tracking-tight text-foreground">
          {CONTACT.domain}
        </p>
      </div>
    </div>
  )
}
