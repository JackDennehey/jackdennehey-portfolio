/**
 * Direct Google Gemini generateContent for PUBLIC BOCH.
 * Key stays server-side (GEMINI_API_KEY). Never NEXT_PUBLIC_. Never logged.
 *
 * Data that leaves Vercel for Google on a turn:
 * PUBLIC system/personality prompt, authority block, canonical evidence for JACK/BOCH
 * turns, CURRENT evidence when present, last 8 visitor/assistant turns, current user text.
 * Not sent: API key in logs/responses, Personal BOCH memory, private notes, filesystem,
 * credentials, unpublished owner data.
 */
import { generatePublicCompletion, type PublicChatMessage } from './public-generate'
import type { PublicModelGenerateInput, PublicModelGenerateOutput, PublicModelProvider } from './vendor/model-provider'

const GEMINI_ROOT = 'https://generativelanguage.googleapis.com/v1beta/models'

export function geminiApiKey() {
  return process.env.GEMINI_API_KEY?.trim() || null
}

export function geminiModelIds() {
  return [
    process.env.BOCH_MODEL || 'gemini-2.5-flash',
    process.env.BOCH_MODEL_FAILOVER || 'gemini-2.5-flash-lite',
  ].filter((model, index, list) => list.indexOf(model) === index)
}

export class GeminiPublicModelProvider implements PublicModelProvider {
  async generate(input: PublicModelGenerateInput): Promise<PublicModelGenerateOutput> {
    try {
      return await generatePublicCompletion(input, geminiChat)
    } catch (error) {
      const code = (error as { code?: string })?.code
      const err = new Error('Model unavailable') as Error & { code: string }
      err.code = code === 'RATE_LIMITED' ? 'RATE_LIMITED' : 'MODEL_UNAVAILABLE'
      throw err
    }
  }
}

async function geminiChat(system: string, messages: PublicChatMessage[], temperature: number) {
  const key = geminiApiKey()
  if (!key) {
    const err = new Error('Model unavailable') as Error & { code: string }
    err.code = 'MODEL_UNAVAILABLE'
    throw err
  }

  const maxTokens = Number(process.env.BOCH_MAX_OUTPUT_TOKENS) || 400
  const timeoutMs = Number(process.env.BOCH_MODEL_TIMEOUT_MS) || 45_000
  const contents = toGeminiContents(messages)
  let lastError: Error | null = null

  for (const model of geminiModelIds()) {
    const url = `${GEMINI_ROOT}/${encodeURIComponent(model)}:generateContent`
    const body = {
      systemInstruction: { parts: [{ text: system }] },
      contents,
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
        responseMimeType: 'application/json',
      },
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': key,
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(timeoutMs),
      })
      if (!response.ok) {
        const cls = classifyGeminiHttp(response.status)
        console.error(JSON.stringify({ boch: true, provider: 'gemini', status: response.status, class: cls, model }))
        lastError = Object.assign(new Error('Model unavailable'), {
          code: cls === 'rate' ? 'RATE_LIMITED' : 'MODEL_UNAVAILABLE',
        }) as Error & { code: string }
        if (cls === 'rate' || cls === 'auth') break
        continue
      }
      const data = (await response.json()) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
      }
      const text = (data.candidates || [])
        .flatMap((candidate) => candidate.content?.parts || [])
        .map((part) => part.text || '')
        .join('')
        .trim()
      if (text) return text
      lastError = new Error('Model unavailable')
    } catch (error) {
      if ((error as { code?: string })?.code === 'RATE_LIMITED') throw error
      lastError = error instanceof Error ? error : new Error('Model unavailable')
    }
  }

  throw lastError || new Error('Model unavailable')
}

function classifyGeminiHttp(status: number) {
  if (status === 401 || status === 403) return 'auth'
  if (status === 429) return 'rate'
  if (status === 404) return 'model'
  return 'gemini'
}

function toGeminiContents(messages: PublicChatMessage[]) {
  const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = []
  for (const message of messages) {
    if (message.role === 'system') continue
    const role = message.role === 'assistant' ? 'model' : 'user'
    const prev = contents[contents.length - 1]
    if (prev && prev.role === role) {
      const existing = prev.parts[0]?.text || ''
      prev.parts = [{ text: `${existing}\n${message.content}`.trim() }]
      continue
    }
    contents.push({ role, parts: [{ text: message.content }] })
  }
  if (!contents.length || contents[0]?.role !== 'user') {
    contents.unshift({ role: 'user', parts: [{ text: 'Hello.' }] })
  }
  return contents
}
