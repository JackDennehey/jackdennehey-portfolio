import { Download } from 'lucide-react'
import { EDUCATION, EXPERIENCE, PROFILE, SKILL_GROUPS } from '@/lib/portfolio'

function SectionTitle({ children }: { children: string }) {
  return (
    <h3 className="mb-3 border-b-2 border-border pb-1 font-pixel text-[10px] leading-relaxed text-foreground">
      {children}
    </h3>
  )
}

export function ResumeContent() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-lg font-semibold text-foreground">{PROFILE.name}</p>
          <p className="text-sm text-muted-foreground">{PROFILE.headline}</p>
        </div>
        <a
          href="/jack-dennehey-resume.txt"
          download
          className="os-border os-shadow inline-flex min-h-11 items-center gap-2 bg-foreground px-3 py-2 font-pixel text-[9px] leading-relaxed text-primary-foreground transition-transform hover:translate-x-px hover:translate-y-px hover:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Download className="size-3.5" />
          Download Resume
        </a>
      </div>

      <section>
        <SectionTitle>EDUCATION</SectionTitle>
        <div className="space-y-3">
          {EDUCATION.map((item) => (
            <div key={item.id} className="os-border bg-card p-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm font-semibold text-foreground">{item.school}</p>
                <span className="text-xs font-medium text-muted-foreground">{item.period}</span>
              </div>
              <p className="text-sm text-foreground">{item.program}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground text-pretty">
                {item.detail}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionTitle>SKILLS</SectionTitle>
        <div className="grid gap-3 sm:grid-cols-2">
          {SKILL_GROUPS.map((skill) => (
            <div key={skill.id} className="os-border bg-card p-3">
              <p className="font-pixel text-[9px] leading-relaxed text-muted-foreground">
                {skill.group}
              </p>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {skill.items.map((item) => (
                  <li
                    key={item}
                    className="border border-border/40 bg-secondary px-1.5 py-0.5 text-[11px] font-medium text-foreground"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionTitle>EXPERIENCE</SectionTitle>
        <div className="space-y-3">
          {EXPERIENCE.map((item) => (
            <div key={item.id} className="os-border bg-card p-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm font-semibold text-foreground">{item.role}</p>
                <span className="text-xs font-medium text-muted-foreground">{item.period}</span>
              </div>
              <p className="text-sm text-foreground">{item.organization}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground text-pretty">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
