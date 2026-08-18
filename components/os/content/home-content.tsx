import type { InterfaceTheme } from '@/lib/interface-theme'
import type { WindowId } from '../apps'
import { BLUE_OCEAN_COPY } from '@/lib/blue-ocean'

export function HomeContent({
  onOpen,
  onOpenBlueOcean,
  onResumeBlueOcean,
  onAskAssistant,
  onOpenSimpleMode,
  theme,
  soundEffectsEnabled,
  hourlyChimeEnabled,
  scanlines,
  achievementCount,
  achievementTotal,
  blueOceanCanResume,
  blueOceanCompleted,
}: {
  onOpen: (id: WindowId) => void
  onOpenBlueOcean: () => void
  onResumeBlueOcean: () => void
  onAskAssistant: () => void
  onOpenSimpleMode: () => void
  theme: InterfaceTheme
  soundEffectsEnabled: boolean
  hourlyChimeEnabled: boolean
  scanlines: boolean
  achievementCount: number
  achievementTotal: number
  blueOceanCanResume: boolean
  blueOceanCompleted: boolean
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

      <section className="os-border bg-card p-3">
        <h3 className="font-pixel text-[9px] leading-relaxed text-foreground">
          Recruiter Access
        </h3>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onOpenSimpleMode}
            className="os-border bg-card px-3 py-1.5 font-pixel text-[9px] leading-relaxed text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            View Simple Mode
          </button>
          <button
            type="button"
            onClick={() => onOpen('recruiter')}
            className="os-border bg-foreground px-3 py-1.5 font-pixel text-[9px] leading-relaxed text-primary-foreground transition-colors hover:bg-card hover:text-foreground focus-visible:bg-card focus-visible:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Enter Recruiter Mode
          </button>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
          View a clean, conventional professional portfolio, or continue through the guided
          recruiter experience.
        </p>
      </section>

      <section className="os-border bg-card p-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-pixel text-[8px] leading-relaxed text-muted-foreground">
              Featured Experience
            </p>
            <h3 className="mt-1 font-pixel text-[11px] leading-relaxed text-foreground">
              {BLUE_OCEAN_COPY.title}
            </h3>
          </div>
          <span className="os-border shrink-0 bg-secondary px-2 py-1 font-pixel text-[7px] leading-none text-muted-foreground">
            {blueOceanCompleted ? 'Revisit' : 'V3B'}
          </span>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
          {BLUE_OCEAN_COPY.shortDescription}
        </p>
        <p className="mt-2 font-pixel text-[8px] leading-relaxed text-foreground">
          {BLUE_OCEAN_COPY.metadata}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onOpenBlueOcean}
            className="os-border bg-foreground px-3 py-1.5 font-pixel text-[9px] leading-relaxed text-primary-foreground transition-colors hover:bg-card hover:text-foreground focus-visible:bg-card focus-visible:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Launch 1984 Blue Ocean
          </button>
          {blueOceanCanResume ? (
            <button
              type="button"
              onClick={onResumeBlueOcean}
              className="os-border bg-card px-3 py-1.5 font-pixel text-[9px] leading-relaxed text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Resume Keynote
            </button>
          ) : null}
        </div>
      </section>

      <p className="text-sm leading-relaxed text-foreground text-pretty">
        {
          "I'm a business student passionate about technology, cybersecurity, networking, cloud computing, artificial intelligence, product development, and building meaningful projects."
        }
      </p>
      <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
        This website documents my professional journey, credentials, and flagship projects,
        including Kickoff, Jack OS, and Pocket Pier.
      </p>

      <section className="os-border bg-secondary p-3">
        <h3 className="font-pixel text-[9px] leading-relaxed text-foreground">
          System Information
        </h3>
        <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs leading-relaxed text-muted-foreground">
          <dt>Edition</dt>
          <dd className="text-foreground">Portfolio</dd>
          <dt>Version</dt>
          <dd className="text-foreground">V3B</dd>
          <dt>Release</dt>
          <dd className="text-foreground">1984 Blue Ocean</dd>
          <dt>Achievements</dt>
          <dd className="text-foreground">
            {achievementCount}/{achievementTotal}
          </dd>
          <dt>Theme</dt>
          <dd className="capitalize text-foreground">{theme}</dd>
          <dt>Sound</dt>
          <dd className="text-foreground">{soundEffectsEnabled ? 'On' : 'Off'}</dd>
          <dt>Hourly Chime</dt>
          <dd className="text-foreground">{hourlyChimeEnabled ? 'On' : 'Off'}</dd>
          <dt>CRT Lines</dt>
          <dd className="text-foreground">{scanlines ? 'On' : 'Off'}</dd>
        </dl>
      </section>

      <section className="os-border bg-card p-3">
        <h3 className="font-pixel text-[9px] leading-relaxed text-foreground">
          Quick Start
        </h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            ['kickoff', 'Open Kickoff'],
            ['firewall', 'Open Network Firewall'],
            ['timeline', 'Open Timeline'],
            ['pocket-pier', 'Open Pocket Pier'],
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => onOpen(id as WindowId)}
              className="os-border bg-card px-3 py-1.5 font-pixel text-[9px] leading-relaxed text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none"
            >
              {label}
            </button>
          ))}
          <button
            type="button"
            onClick={onAskAssistant}
            className="os-border bg-card px-3 py-1.5 font-pixel text-[9px] leading-relaxed text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none"
          >
            Ask J.D.
          </button>
          <button
            type="button"
            onClick={() => onOpen('projects')}
            className="os-border bg-card px-3 py-1.5 font-pixel text-[9px] leading-relaxed text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none"
          >
            Open Projects
          </button>
        </div>
      </section>
    </div>
  )
}
