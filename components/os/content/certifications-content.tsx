import { CERTIFICATIONS } from '@/lib/portfolio-data'

const STATUS_LABEL: Record<string, string> = {
  Completed: 'Earned',
  'In Progress': 'In Progress',
  Future: 'Planned',
}

export function CertificationsContent() {
  return (
    <div className="space-y-4">
      {CERTIFICATIONS.map((cert) => (
        <article key={cert.title} className="os-border flex gap-3 bg-card p-4">
          <div
            aria-hidden
            className="os-border flex size-10 shrink-0 items-center justify-center bg-secondary font-pixel text-[10px]"
          >
            {cert.status === 'Completed' ? '✓' : cert.status === 'In Progress' ? '…' : '·'}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-pixel text-[11px] leading-relaxed text-foreground">
                {cert.title}
              </h3>
              <span className="os-border bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                {STATUS_LABEL[cert.status]}
              </span>
            </div>
            <p className="mt-1 text-xs font-medium text-muted-foreground">{cert.issuer}</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
              {cert.description}
            </p>
          </div>
        </article>
      ))}
    </div>
  )
}
