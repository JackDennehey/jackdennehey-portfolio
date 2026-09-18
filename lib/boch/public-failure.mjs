/** Public failure copy and upstream HTTP classification. No provider internals. */

export const PUBLIC_FAILURE_TEXT = {
  RATE_LIMITED: "Easy. I'm not a call center. Try me again in a minute.",
  QUOTA_EXCEEDED: "Brain hit its usage limit. Face still works. Try me later.",
  MODEL_UNAVAILABLE: "Brain's offline. Face still works. Tragic.",
}

/**
 * Map an upstream model-provider HTTP failure to the public contract.
 * Visitor rate limiting is never decided here.
 * @param {number} status
 * @param {string} [body]
 * @returns {'QUOTA_EXCEEDED' | 'MODEL_UNAVAILABLE'}
 */
export function publicCodeFromProviderHttp(status, body = '') {
  const code = Number(status)
  const lower = String(body || '').toLowerCase()
  if (
    code === 429 ||
    /resource_exhausted|\bquota\b|rate[- ]?limit|usage limit|resource has been exhausted/.test(lower)
  ) {
    return 'QUOTA_EXCEEDED'
  }
  return 'MODEL_UNAVAILABLE'
}
