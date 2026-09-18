/**
 * Runtime env reads. Next inlines `process.env.FOO` at build and can bake
 * Sensitive Vercel keys as empty strings, which then hide the real runtime
 * value. Read through the Node process object with names that are not full
 * static env literals.
 */
function runtimeEnvBag(): Record<string, string | undefined> {
  try {
    return Function('return process.env')() as Record<string, string | undefined>
  } catch {
    return {}
  }
}

export function readServerEnv(name: string) {
  const value = runtimeEnvBag()[name]
  return typeof value === 'string' && value.trim() ? value.trim() : ''
}

export function readJoinedServerEnv(parts: string[]) {
  return readServerEnv(parts.join('_'))
}
