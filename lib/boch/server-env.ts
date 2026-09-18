/**
 * Runtime env reads. Next inlines `process.env.FOO` (and folded
 * `process.env[name]` with a literal name) at build. Sensitive Vercel vars are
 * absent then, so they become "". The Node `process` module binding is not
 * rewritten, so Production secrets are visible at request time.
 */
import nodeProcess from 'node:process'

export function readServerEnv(name: string) {
  const value = nodeProcess.env[name]
  return typeof value === 'string' && value.trim() ? value.trim() : ''
}
