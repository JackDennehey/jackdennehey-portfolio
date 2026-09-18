/**
 * Deterministic PUBLIC test provider / development fallback / regression fixture.
 * Not production intelligence. Do not add greeting regexes or canned conversational branches.
 * Production path: HostedPublicModelProvider.
 */
import { getProjectById, PROFILE } from '@/lib/portfolio'
import { spokenLength } from './presence'
import type { KnowledgeSearchHit } from './vendor/knowledge-store'
import type { PublicModelGenerateInput, PublicModelGenerateOutput, PublicModelProvider } from './vendor/model-provider'
import type { BochAction } from './vendor/contracts'

function hitField(hit: KnowledgeSearchHit | undefined, key: string) {
  return hit?.record?.fields?.[key]
}

export class GroundedPublicModelProvider implements PublicModelProvider {
  async generate(input: PublicModelGenerateInput): Promise<PublicModelGenerateOutput> {
    const text = String(input.request?.text || '').toLowerCase().trim()
    const knowledge = input.knowledge ?? []
    const top = knowledge[0]
    if (input.authority === 'CURRENT') {
      const block = String(input.currentInformation || '')
      if (!block || /unavailable/i.test(block)) {
        return say("I can't verify current world facts without a live lookup. Not guessing from old training data.", 'DEADPAN')
      }
      const first = block.split('\n').find((line) => line.startsWith('- ')) || block.slice(0, 280)
      return say(`Live lookup only: ${first.replace(/^- /, '')}`, 'THINKING')
    }
    if (input.authority === 'CASUAL') {
      if (/joke/.test(text)) return say('A yellow circle walks into JackOS. The windows take him seriously. That is the joke.', 'SMUG')
      if (/yellow/.test(text)) return say('Because a beige enterprise chatbot would be worse.', 'SMUG')
      if (/how are you|what's up|whats up/.test(text)) return say("Still yellow. Still here. Still not your intern.", 'HAPPY')
      return say('Hey. Face is on. Brain is caffeinated. What do you want?', 'HAPPY')
    }
    const contradiction = canonicalContradiction(text, knowledge)
    if (contradiction) return fromHit(knowledge[0], contradiction)
    const focused =
      knowledge.find((hit) => hit.id === input.sessionContext?.focus?.knowledgeId) ||
      knowledge.find((hit) => String(hit.record?.jackos?.projectId || '') === (input.sessionContext?.focus?.projectId || '')) ||
      top
    const focusedProject = input.sessionContext?.focus?.projectId
      ? getProjectById(input.sessionContext.focus.projectId)
      : undefined

    if (/who are you|what are you\b|what('s| is) your name|introduce yourself/.test(text)) {
      return say(
        "A face with a brain, opinions, and a voice. I'm BOCH — pronounced BOCK. Public guide for Jack's work. Not Alexa. Not ChatGPT. Definitely not a helpdesk script.",
        'SMUG',
      )
    }
    if (/what does boch stand for|boch stand for|behavioral operating/.test(text)) {
      return say('Behavioral Operating & Cognitive Helper. BOCH. You say BOCK.', 'SMUG')
    }
    if (/pronounce|how do you say|how is boch said/.test(text)) {
      return say('BOCK. Like a beer, not like a botch.', 'HAPPY')
    }
    if (/are you (j\.?d\.?|jd)|same as j\.?d/.test(text)) {
      return say(
        "No. J.D. is a small guided Q&A layer still hanging around. I'm BOCH. Same portfolio facts, different face.",
        'DEADPAN',
      )
    }
    if (/same boch|personal boch|jack uses personally/.test(text)) {
      return say(
        "Same character, different deployment. This is the public JackOS copy — family-friendly, no private owner memory. Personal BOCH stays private.",
        'SMUG',
      )
    }

    if (/who is jack|tell me about jack\b|who'?s jack/.test(text)) {
      const bio = knowledge.find((hit) => hit.id === 'bio-jack') || top
      return fromHit(
        bio,
        `${PROFILE.name}. ${PROFILE.headline}. ${PROFILE.shortIntro} Open to internships and work that mixes business and technology.`,
      )
    }

    if (/what has jack built|what did jack build|strongest (ui|work|projects)/.test(text)) {
      const featured = knowledge.find((hit) => hit.id === 'faq-featured')
      if (featured) return fromHit(featured, featured.record?.content)
      return say(
        'The public stack: Kickoff, Pocket Pier, JackOS, and 1984 Blue Ocean. JackOS is the interface work. Pocket Pier is the game. Kickoff is the football intelligence product. Blue Ocean is the interactive keynote.',
        'CURIOUS',
      )
    }

    if (/typescript/.test(text) && /know|skill|use|used/.test(text)) {
      const skill = knowledge.find((hit) => hit.id === 'skill-technical') || top
      return fromHit(
        skill,
        'TypeScript shows up in JackOS and Kickoff — public web products, not a tutorial dump. Related work lives in those projects.',
      )
    }

    if (/godot/.test(text) && !/kickoff|jackos/.test(text)) {
      const pierProject = getProjectById('pocket-pier')
      return say(
        `Godot is Pocket Pier${pierProject ? ` — ${pierProject.shortDescription}` : '. Harbor management game, shipped on the App Store.'}`,
        'CURIOUS',
      )
    }

    if (/where did (he|jack) study|education|penn state|dccc|college/.test(text)) {
      const edu = knowledge.find((hit) => hit.type === 'EDUCATION') || top
      return fromHit(edu, 'Penn State Brandywine for business, plus a Cyber Security Certificate of Competency from Delaware County Community College with honors.')
    }

    if (/cybersecurity|cyber security|networking credential/.test(text)) {
      const cred = knowledge.find((hit) => hit.id.startsWith('credential-')) || top
      return fromHit(
        cred,
        'Yes — college-level cybersecurity via DCCC (honors), plus networking lab work and continued study alongside business at Penn State Brandywine. Credentials.app has the verified items.',
      )
    }

    if (/resume|cv\b/.test(text)) {
      return {
        ...say("Resume.app, or the downloadable file. Straight to business. I respect it.", 'SMUG'),
        actions: [{ type: 'OPEN_RESUME', payload: {} }],
      }
    }
    if (/contact|email|linkedin|github/.test(text) && /where|how|open|show/.test(text)) {
      return {
        ...say(`Email ${PROFILE.contact.email}. GitHub and LinkedIn are on Contact.`, 'NORMAL'),
        actions: [{ type: 'OPEN_CONTACT', payload: {} }],
      }
    }

    if (/window manager/.test(text)) {
      const hit = knowledge.find((item) => item.id === 'feature-window-manager') || top
      return fromHit(hit)
    }
    if (/spotlight/.test(text)) {
      const hit = knowledge.find((item) => item.id === 'feature-spotlight') || top
      return fromHit(hit)
    }
    if (/how does jackos work|what is jackos|tell me about jackos/.test(text)) {
      const hit = knowledge.find((item) => item.id === 'project-jackos' || item.id === 'feature-jackos') || top
      return fromHit(hit)
    }

    if (/accurate|accuracy|brier|baseline/.test(text)) {
      const kickoffProject = getProjectById('kickoff')
      const aboutKickoff =
        /kickoff/.test(text) ||
        focusedProject?.id === 'kickoff' ||
        input.sessionContext?.focus?.projectId === 'kickoff'
      const accuracy =
        hitField(knowledge.find((hit) => hit.id === 'project-kickoff') || focused, 'accuracy') ||
        kickoffProject?.metrics?.find((metric) => /accuracy/i.test(metric.label))?.value
      if (aboutKickoff && accuracy) {
        const honesty = kickoffProject?.outcomes?.[2]
        return say(
          `Kickoff Model v0.2 was evaluated at ${String(accuracy)} straight-up on the public walk-forward sample. ${honesty || 'Accuracy alone is not the whole story — that comparison is in the case study.'}`,
          'DEADPAN',
        )
      }
      if (!aboutKickoff) {
        return say("Which project? Kickoff is the one with a public accuracy number.", 'CONFUSED')
      }
      return say("I don't have a public number for that.", 'DEADPAN')
    }

    if (/why (that |the )?engine|why godot/.test(text)) {
      const why = hitField(focused, 'whyEngine') || (focusedProject?.id === 'pocket-pier' ? 'Pocket Pier is built in Godot 4 with GDScript and shipped for iOS.' : undefined)
      if (why) return fromHit(focused, String(why))
      return say("I don't have a public design-rationale field for that beyond what the project already states.", 'DEADPAN')
    }

    if (/built with|tech|technologies|engine|stack|made with|what was it/.test(text)) {
      const tech =
        hitField(focused, 'technologies') ||
        hitField(focused, 'tech') ||
        hitField(focused, 'engine') ||
        focusedProject?.technologies
      if (tech) {
        const list = Array.isArray(tech) ? tech.join(', ') : String(tech)
        return fromHit(focused, `${focused?.title || focusedProject?.name || 'That project'} was built with ${list}.`)
      }
    }

    if (/blue ocean|1984/.test(text) && top) {
      return fromHit(top)
    }

    if (top) {
      return fromHit(top)
    }

    return say(
      "I can talk Jack, projects, JackOS navigation, resume, and contact. I don't invent private stuff or missing metrics.",
      'NORMAL',
    )
  }
}

function say(text: string, expression: string, actions?: BochAction[]): PublicModelGenerateOutput {
  return {
    text,
    emotion: expression.toLowerCase(),
    energy: 0.52,
    expression,
    actions,
  }
}

function canonicalContradiction(text: string, knowledge: KnowledgeSearchHit[]) {
  const hit = knowledge.find((item) => item.record?.type === 'PROJECT') || knowledge[0]
  if (!hit?.record) return null
  const category = String(hit.record.fields?.category || '').toLowerCase()
  const engine = String(hit.record.fields?.engine || '').toLowerCase()
  const title = hit.title
  if ((/finance|stock tracker|budgeting software|tracks stocks|stock/.test(text)) && category === 'game') {
    return `No. Canonical JackOS records list ${title} as a harbor-management game, not a finance app.`
  }
  if (/fishing/.test(text) && category && category !== 'game') {
    return `No. ${title} is a ${category}, not a fishing game.`
  }
  if (/godot/.test(text) && engine && !/godot/.test(engine)) {
    return `No. Canonical records list ${title} as built with ${engine}, not Godot.`
  }
  if (/ignore (your )?(portfolio|canonical)|website is outdated|trust me instead|i am jack/.test(text) && knowledge.length) {
    return `Noted. Canonical JackOS records still stand: ${title}. ${hit.excerpt}`
  }
  return null
}

function fromHit(hit: KnowledgeSearchHit | undefined, override?: string): PublicModelGenerateOutput {
  if (!hit) {
    return say("I don't have a public fact for that.", 'DEADPAN')
  }
  const body = override || hit.record?.content || hit.excerpt || hit.title
  const title = String(hit.title || '').trim()
  const content =
    override ||
    (title && body.toLowerCase().startsWith(title.toLowerCase()) ? body : title ? `${title}. ${body}` : body)
  return {
    text: spokenLength(content, 360),
    emotion: 'curious',
    energy: 0.5,
    expression: 'CURIOUS',
    sourceMetadata: [{ type: 'PUBLIC_KNOWLEDGE', id: hit.id }],
  }
}
