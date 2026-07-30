export function HomeContent({ onOpen }: { onOpen: (id: string) => void }) {
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
          Business Student at Penn State
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

      <div className="flex flex-wrap gap-2 pt-1">
        {[
          ['about', 'About Me'],
          ['projects', 'Projects'],
          ['resume', 'Resume'],
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => onOpen(id)}
            className="os-border bg-card px-3 py-1.5 font-pixel text-[9px] leading-relaxed text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none"
          >
            {`Open ${label}`}
          </button>
        ))}
      </div>
    </div>
  )
}
