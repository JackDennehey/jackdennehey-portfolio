/**
 * Runtime env reads. Dynamic keys so Next cannot inline empty values at build
 * (Sensitive Vercel vars are omitted from `next build`).
 */
export function readServerEnv(name: string) {
  const value = process.env[name]
  return typeof value === 'string' && value.trim() ? value.trim() : ''
}
