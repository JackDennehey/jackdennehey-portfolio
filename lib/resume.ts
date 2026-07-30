export type PublicResumeConfig = {
  available: boolean
  path: string | null
  fileName: string | null
  statusLabel: string
}

export const PUBLIC_RESUME: PublicResumeConfig = {
  available: false,
  path: null,
  fileName: null,
  statusLabel: 'Coming Soon',
}
