export const CRT_LINES_STORAGE_KEY = 'jack-os:crt-lines-enabled.v1'
export const DEFAULT_CRT_LINES_ENABLED = true

export function parseCrtPreference(value: string | null): boolean {
  if (value === 'true') return true
  if (value === 'false') return false
  return DEFAULT_CRT_LINES_ENABLED
}
