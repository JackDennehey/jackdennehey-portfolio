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
import { readServerEnv } from './server-env'
import type { PublicModelDiagnosis } from './vendor/contracts'
import type { PublicModelGenerateInput, PublicModelGenerateOutput, PublicModelProvider } from './vendor/model-provider'

const GEMINI_ROOT = 'https://generativelanguage.googleapis.com/v1beta/models'

type DiagnosedError = Error & { code: string; diagnosis: PublicModelDiagnosis }

export function geminiApiKey() {
  return readServerEnv('GEMINI_API_KEY') || null
}

export function geminiModelIds() {
  return [
    readServerEnv('BOCH_MODEL') || 'gemini-3.5-flash',
    readServerEnv('BOCH_MODEL_FAILOVER') || 'gemini-3.5-flash-lite',
  ].filter((model, index, list) => list.indexOf(model) === index)
}

export class GeminiPublicModelProvider implements PublicModelProvider {
  async generate(input: PublicModelGenerateInput): Promise<PublicModelGenerateOutput> {
    try {
      return await generatePublicCompletion(input, geminiChat)
    } catch (error) {
      const diagnosed = error as DiagnosedError
      const code = diagnosed.code === 'RATE_LIMITED' ? 'RATE_LIMITED' : 'MODEL_UNAVAILABLE'
      const err = new Error('Model unavailable') as DiagnosedError
      err.code = code
      err.diagnosis = diagnosed.diagnosis || missingKeyDiagnosis()
      throw err
    }
  }
}

async function geminiChat(system: string, messages: PublicChatMessage[], temperature: number) {
  const hasKey = Boolean(geminiApiKey())
  const key = geminiApiKey()
  if (!key) {
    throw diagnosedError('MODEL_UNAVAILABLE', missingKeyDiagnosis())
  }

  const maxTokens = Number(process.env.BOCH_MAX_OUTPUT_TOKENS) || 400
  const timeoutMs = Number(process.env.BOCH_MODEL_TIMEOUT_MS) || 45_000
  const contents = toGeminiContents(messages)
  let lastError: DiagnosedError | null = null

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
      const rawText = await response.text().catch(() => '')
      if (!response.ok) {
        const diagnosis = diagnosisFromHttp(response.status, model, rawText, hasKey)
        logGeminiDiagnosis(diagnosis)
        lastError = diagnosedError(diagnosis.cause === 'quota' ? 'RATE_LIMITED' : 'MODEL_UNAVAILABLE', diagnosis)
        if (diagnosis.cause === 'quota' || diagnosis.cause === 'invalid_key' || diagnosis.cause === 'restricted_key') {
          break
        }
        continue
      }
      let data: { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> }
      try {
        data = JSON.parse(rawText) as typeof data
      } catch {
        const diagnosis = makeDiagnosis({
          sent: true,
          hasKey,
          status: response.status,
          class: 'parse',
          model,
          cause: 'parse',
          body: 'Gemini JSON parse failed',
        })
        logGeminiDiagnosis(diagnosis)
        lastError = diagnosedError('MODEL_UNAVAILABLE', diagnosis)
        continue
      }
      const text = (data.candidates || [])
        .flatMap((candidate) => candidate.content?.parts || [])
        .map((part) => part.text || '')
        .join('')
        .trim()
      if (text) return text
      const diagnosis = makeDiagnosis({
        sent: true,
        hasKey,
        status: response.status,
        class: 'parse',
        model,
        cause: 'parse',
        body: 'Gemini empty candidates',
      })
      logGeminiDiagnosis(diagnosis)
      lastError = diagnosedError('MODEL_UNAVAILABLE', diagnosis)
    } catch (error) {
      const name = error instanceof Error ? error.name : 'Error'
      const diagnosis = makeDiagnosis({
        sent: true,
        hasKey,
        status: null,
        class: 'network',
        model,
        cause: 'network',
        body: name === 'TimeoutError' || name === 'AbortError' ? `Gemini ${name}` : 'Gemini fetch failed',
      })
      logGeminiDiagnosis(diagnosis)
      lastError = diagnosedError('MODEL_UNAVAILABLE', diagnosis)
    }
  }

  throw lastError || diagnosedError('MODEL_UNAVAILABLE', missingKeyDiagnosis())
}

function missingKeyDiagnosis(): PublicModelDiagnosis {
  return makeDiagnosis({
    sent: false,
    hasKey: false,
    status: null,
    class: 'auth',
    model: geminiModelIds()[0] || 'gemini-3.5-flash',
    cause: 'missing_key',
    body: 'GEMINI_API_KEY not detected',
  })
}

function diagnosisFromHttp(status: number, model: string, raw: string, hasKey: boolean): PublicModelDiagnosis {
  const body = sanitizeGeminiBody(raw)
  const lower = body.toLowerCase()
  let cause = 'other'
  let cls = 'gemini'
  if (status === 401 || /api[_ ]key not valid|api_key_invalid|invalid api key/.test(lower)) {
    cause = 'invalid_key'
    cls = 'auth'
  } else if (/api has not been used|service_disabled|not been enabled|enable it/.test(lower)) {
    cause = 'api_not_enabled'
    cls = 'auth'
  } else if (status === 403 || /permission_denied|permission denied/.test(lower)) {
    cause = 'restricted_key'
    cls = 'auth'
  } else if (status === 404 || /not found|is not found for api version/.test(lower)) {
    cause = 'model_unavailable'
    cls = 'model'
  } else if (status === 429 || /resource_exhausted|quota|rate limit/.test(lower)) {
    cause = 'quota'
    cls = 'rate'
  } else if (status === 400 || /invalid_argument|invalid argument/.test(lower)) {
    cause = 'malformed_request'
    cls = 'malformed'
  }
  return makeDiagnosis({ sent: true, hasKey, status, class: cls, model, cause, body })
}

function makeDiagnosis(diagnosis: PublicModelDiagnosis): PublicModelDiagnosis {
  return {
    sent: Boolean(diagnosis.sent),
    hasKey: Boolean(diagnosis.hasKey),
    status: diagnosis.status,
    class: diagnosis.class,
    model: diagnosis.model,
    cause: diagnosis.cause,
    body: sanitizeGeminiBody(diagnosis.body),
  }
}

function sanitizeGeminiBody(raw: string) {
  return String(raw || '')
    .replace(/AIza[0-9A-Za-z_-]{10,}/g, '[redacted]')
    .replace(/(bearer\s+)[^\s,}"']+/gi, '$1[redacted]')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 280)
}

function logGeminiDiagnosis(diagnosis: PublicModelDiagnosis) {
  console.error(
    JSON.stringify({
      boch: true,
      event: 'gemini-diag',
      sent: diagnosis.sent,
      hasKey: diagnosis.hasKey,
      status: diagnosis.status,
      class: diagnosis.class,
      model: diagnosis.model,
      cause: diagnosis.cause,
      body: diagnosis.body,
    }),
  )
}

function diagnosedError(code: string, diagnosis: PublicModelDiagnosis): DiagnosedError {
  const err = new Error('Model unavailable') as DiagnosedError
  err.code = code
  err.diagnosis = diagnosis
  return err
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
