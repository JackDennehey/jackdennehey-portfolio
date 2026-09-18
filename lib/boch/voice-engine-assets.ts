import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'

const KOKORO_FILES = new Set(['kokoro.web.js'])
const ONNX_FILES = new Set([
  'ort.bundle.min.mjs',
  'ort.webgpu.bundle.min.mjs',
  'ort.wasm.bundle.min.mjs',
  'ort-wasm-simd-threaded.wasm',
  'ort-wasm-simd-threaded.mjs',
  'ort-wasm-simd-threaded.jsep.wasm',
  'ort-wasm-simd-threaded.jsep.mjs',
])

export function isVoiceEngineFile(file: string) {
  return KOKORO_FILES.has(file) || ONNX_FILES.has(file)
}

export function voiceEngineContentType(file: string) {
  if (file.endsWith('.wasm')) return 'application/wasm'
  return 'text/javascript; charset=utf-8'
}

async function onnxDist() {
  const pnpm = path.join(process.cwd(), 'node_modules/.pnpm')
  const dirs = (await readdir(pnpm)).filter((name) => name.startsWith('onnxruntime-web@'))
  const latest = dirs.sort().at(-1)
  if (!latest) throw new Error('onnxruntime-web is not installed.')
  return path.join(pnpm, latest, 'node_modules/onnxruntime-web/dist')
}

export async function readVoiceEngineFile(file: string) {
  if (file.includes('/') || file.includes('\\') || file.includes('..')) return null
  if (!isVoiceEngineFile(file)) return null
  const fromPublic = path.join(process.cwd(), 'public/boch-voice', file)
  try {
    return await readFile(fromPublic)
  } catch {
    const absolute = KOKORO_FILES.has(file)
      ? path.join(process.cwd(), 'node_modules/kokoro-js/dist', file)
      : path.join(await onnxDist(), file)
    return readFile(absolute)
  }
}
