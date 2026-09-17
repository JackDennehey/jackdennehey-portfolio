import type { WindowId } from '../apps'
import { BLUE_OCEAN_COPY } from '@/lib/blue-ocean'
import { PROFILE } from '@/lib/portfolio'

export function HomeContent({
  onOpen,
  onOpenBlueOcean,
  onResumeBlueOcean,
  onOpenSimpleMode,
  blueOceanCanResume,
  blueOceanCompleted,
}: {
  onOpen: (id: WindowId) => void
  onOpenBlueOcean: () => void
  onResumeBlueOcean: () => void
  onOpenSimpleMode: () => void
  blueOceanCanResume: boolean
  blueOceanCompleted: boolean
}) {
  return (
    <div className="space-y-5">
      <header className="os-border bg-secondary p-4">
        <p className="font-pixel text-[10px] leading-relaxed text-muted-foreground">
          {'> welcome'}
        </p>
        <h2 className="mt-3 font-pixel text-base leading-relaxed text-foreground">
          Welcome to JackOS
        </h2>
        <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground text-balance">
          {PROFILE.name}
        </p>
        <p className="mt-1 text-sm font-medium text-muted-foreground">{PROFILE.headline}</p>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-foreground text-pretty">
          {PROFILE.shortIntro} This is JackOS, an interactive portfolio. Explore the desktop, or
          take a conventional path.
        </p>
      </header>

      <section className="os-border bg-card p-3" aria-labelledby="welcome-start-heading">
        <h3 id="welcome-start-heading" className="font-pixel text-[9px] leading-relaxed text-foreground">
          Start here
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
          Portfolio.app is the overview inside JackOS. Simple Mode is the same work without the
          desktop. Recruiter Mode is the short evidence brief.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <WelcomeButton primary onClick={() => onOpen('portfolio')}>
            Open Portfolio
          </WelcomeButton>
          <WelcomeButton onClick={onOpenSimpleMode}>Simple Mode</WelcomeButton>
          <WelcomeButton onClick={() => onOpen('recruiter')}>Recruiter Mode</WelcomeButton>
          <WelcomeButton onClick={() => onOpen('resume')}>Resume</WelcomeButton>
          <WelcomeButton onClick={() => onOpen('contact')}>Contact</WelcomeButton>
        </div>
      </section>

      <section className="os-border bg-card p-3" aria-labelledby="welcome-work-heading">
        <p className="font-pixel text-[8px] leading-relaxed text-muted-foreground">
          Strongest public work
        </p>
        <h3 id="welcome-work-heading" className="mt-1 font-pixel text-[11px] leading-relaxed text-foreground">
          Kickoff, Pocket Pier, and 1984 Blue Ocean
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
          A live football intelligence product, an iOS game on the App Store, and an interactive
          keynote inside this desktop.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <WelcomeButton primary onClick={() => onOpen('kickoff')}>
            Open Kickoff
          </WelcomeButton>
          <WelcomeButton onClick={() => onOpen('pocket-pier')}>Open Pocket Pier</WelcomeButton>
          <WelcomeButton onClick={onOpenBlueOcean}>Launch 1984 Blue Ocean</WelcomeButton>
          {blueOceanCanResume ? (
            <WelcomeButton onClick={onResumeBlueOcean}>Resume Keynote</WelcomeButton>
          ) : null}
        </div>
        {blueOceanCompleted ? (
          <p className="mt-2 font-pixel text-[8px] leading-relaxed text-muted-foreground">
            {BLUE_OCEAN_COPY.metadata}
          </p>
        ) : null}
      </section>
    </div>
  )
}

function WelcomeButton({
  children,
  onClick,
  primary = false,
}: {
  children: string
  onClick: () => void
  primary?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        primary
          ? 'os-border min-h-11 bg-foreground px-3 py-1.5 font-pixel text-[9px] leading-relaxed text-primary-foreground transition-colors hover:bg-card hover:text-foreground focus-visible:bg-card focus-visible:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          : 'os-border min-h-11 bg-card px-3 py-1.5 font-pixel text-[9px] leading-relaxed text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
      }
    >
      {children}
    </button>
  )
}
