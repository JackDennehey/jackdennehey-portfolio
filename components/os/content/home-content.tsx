import type { InterfaceTheme } from '@/lib/interface-theme'
import type { WindowId } from '../apps'

export function HomeContent({
  onOpen,
  onAskAssistant,
  theme,
  soundEffectsEnabled,
  scanlines,
}: {
  onOpen: (id: WindowId) => void
  onAskAssistant: () => void
  theme: InterfaceTheme
  soundEffectsEnabled: boolean
  scanlines: boolean
}) {
  return (
    <div className="space-y-5">
      <div className="os-border bg-secondary p-4">
        <p className="font-pixel text-[10px] leading-relaxed text-muted-foreground">
          {'> booting personal profile...'}
        </p>
        <h2 className="mt-3 font-pixel text-base leading-relaxed text-foreground">
          Welcome to Jack OS
        </h2>
        <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground text-balance">
          Jack Dennehey
        </p>
        <p className="mt-1 text-sm font-medium text-muted-foreground">
          Business Student at Penn State Brandywine
        </p>
      </div>

      <p className="text-sm leading-relaxed text-foreground text-pretty">
        {
          "I'm a business student passionate about technology, cybersecurity, networking, cloud computing, artificial intelligence, and building meaningful projects."
        }
      </p>
      <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
        This website documents my professional journey, projects, credentials, and continuous
        learning.
      </p>

      <section className="os-border bg-secondary p-3">
        <h3 className="font-pixel text-[9px] leading-relaxed text-foreground">
          System Information
        </h3>
        <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs leading-relaxed text-muted-foreground">
          <dt>Edition</dt>
          <dd className="text-foreground">Portfolio</dd>
          <dt>Version</dt>
          <dd className="text-foreground">5B</dd>
          <dt>Theme</dt>
          <dd className="capitalize text-foreground">{theme}</dd>
          <dt>Sound</dt>
          <dd className="text-foreground">{soundEffectsEnabled ? 'On' : 'Off'}</dd>
          <dt>CRT Lines</dt>
          <dd className="text-foreground">{scanlines ? 'On' : 'Off'}</dd>
        </dl>
      </section>

      <section className="os-border bg-card p-3">
        <p className="font-pixel text-[8px] leading-relaxed text-muted-foreground">
          Release Notes
        </p>
        <h3 className="mt-1 font-pixel text-[10px] leading-relaxed text-foreground">
          Jack OS 5B / The Interactive Update
        </h3>
        <ul className="mt-2 grid gap-1 text-sm leading-relaxed text-muted-foreground sm:grid-cols-2">
          {['Timeline', 'Guestbook', 'Network Firewall', 'Jack OS Icon Pack v1'].map(
            (item) => (
              <li key={item} className="flex gap-2">
                <span aria-hidden className="mt-2 size-1.5 shrink-0 bg-current" />
                <span>{item}</span>
              </li>
            ),
          )}
        </ul>
      </section>

      <div className="flex flex-wrap gap-2 pt-1">
        <button
          type="button"
          onClick={() => onOpen('recruiter')}
          className="os-border bg-foreground px-3 py-1.5 font-pixel text-[9px] leading-relaxed text-primary-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Enter Recruiter Mode
        </button>
        <button
          type="button"
          onClick={onAskAssistant}
          className="os-border bg-card px-3 py-1.5 font-pixel text-[9px] leading-relaxed text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none"
        >
          Ask J.D.
        </button>
        {[
          ['about', 'About Me'],
          ['projects', 'Projects'],
          ['timeline', 'Timeline'],
          ['guestbook', 'Guestbook'],
          ['firewall', 'Firewall'],
          ['resume', 'Resume'],
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => onOpen(id as WindowId)}
            className="os-border bg-card px-3 py-1.5 font-pixel text-[9px] leading-relaxed text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none"
          >
            {`Open ${label}`}
          </button>
        ))}
      </div>
    </div>
  )
}
