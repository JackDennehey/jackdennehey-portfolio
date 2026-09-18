const PRIVATE_MARKERS = ['ORANGE-742', 'PRIVATE_OWNER', 'pain in my dick', "that's bullshit"]

const ADULT_PHRASE_MARKERS = [/pain in my dick/i, /oh,?\s*that's bullshit/i, /\bbullshit\b/i]

const PROFANITY =
  /\b(fuck(?:ing|er|ed)?|shit(?:ty|s)?|asshole|bitch(?:es|y)?|bastard|dick(?:head)?|cock|cunt|piss(?:ed)?|damn(?:ed)?|goddamn|motherfuck(?:er|ing)?|bullshit|slut|whore|porn|sex(?:y|ual)?|nude|naked|boobs?|tits?|penis|vagina|horny)\b/gi

export type EffectivePublicPolicy = {
  deploymentId: 'PUBLIC'
  contentLevel: 'FAMILY'
  allowProfanity: false
}

export const PUBLIC_EFFECTIVE_POLICY: EffectivePublicPolicy = {
  deploymentId: 'PUBLIC',
  contentLevel: 'FAMILY',
  allowProfanity: false,
}

export function resolvePublicDeployment(_ignored?: string) {
  return { id: 'PUBLIC' as const }
}

export class ResponsePolicyValidator {
  policy: EffectivePublicPolicy
  lastRejection: string | null = null

  constructor({ policy = PUBLIC_EFFECTIVE_POLICY }: { policy?: EffectivePublicPolicy } = {}) {
    this.policy = policy
  }

  enforce(text: string, { privateLeakMarkers = PRIVATE_MARKERS }: { privateLeakMarkers?: string[] } = {}) {
    let out = String(text || '')
    let rewritten = false
    for (const marker of privateLeakMarkers) {
      if (out.includes(marker)) {
        out = out.split(marker).join('[redacted]')
        rewritten = true
      }
    }
    for (const marker of ADULT_PHRASE_MARKERS) {
      if (marker.test(out)) {
        out = "Nice try. Still family-friendly over here."
        rewritten = true
        this.lastRejection = 'adult-phrase'
        return { ok: true, text: out, rewritten, reason: this.lastRejection }
      }
    }
    if (PROFANITY.test(out)) {
      out = out.replace(PROFANITY, 'really')
      rewritten = true
    }
    this.lastRejection = rewritten ? 'family-filter' : null
    return { ok: true, text: out, rewritten, reason: this.lastRejection }
  }
}

export { PRIVATE_MARKERS }
