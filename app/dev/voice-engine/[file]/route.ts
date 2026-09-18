import { notFound } from 'next/navigation'
import { readVoiceEngineFile, voiceEngineContentType } from '@/lib/boch/voice-engine-assets'

export const dynamic = 'force-dynamic'

export async function GET(_request: Request, context: { params: Promise<{ file: string }> }) {
  if (process.env.NODE_ENV === 'production') notFound()
  const { file } = await context.params
  try {
    const body = await readVoiceEngineFile(file)
    if (!body) notFound()
    return new Response(body, {
      headers: {
        'content-type': voiceEngineContentType(file),
        'cache-control': 'no-store',
      },
    })
  } catch {
    notFound()
  }
}
