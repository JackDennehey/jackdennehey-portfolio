import { INTERESTS } from '@/lib/portfolio-data'

export function AboutContent() {
  return (
    <div className="space-y-5">
      <section>
        <h3 className="font-pixel text-[10px] leading-relaxed text-muted-foreground">
          {'// currently'}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-foreground text-pretty">
          I&apos;m currently studying <strong className="font-semibold">Business at Penn State</strong>,
          where I pair a business foundation with a deep interest in technology.
        </p>
      </section>

      <section>
        <h3 className="font-pixel text-[10px] leading-relaxed text-muted-foreground">
          {'// interests'}
        </h3>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {INTERESTS.map((interest) => (
            <li
              key={interest}
              className="os-border flex items-center gap-2 bg-secondary px-3 py-2 text-sm font-medium text-foreground"
            >
              <span aria-hidden className="font-pixel text-[9px]">
                {'>'}
              </span>
              {interest}
            </li>
          ))}
        </ul>
      </section>

      <section className="os-border bg-card p-4">
        <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
          I&apos;m always learning new technologies — from cloud platforms and networking to
          artificial intelligence — and I enjoy turning that curiosity into real, working projects.
        </p>
      </section>
    </div>
  )
}
