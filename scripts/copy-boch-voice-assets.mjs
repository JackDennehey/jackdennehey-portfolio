#!/usr/bin/env node
/** Copy allowlisted Kokoro / ONNX WASM files into public/boch-voice for static serving. */
import { copyFile, mkdir, readdir } from 'node:fs/promises'
import path from 'node:path'

const KOKORO_FILES = ['kokoro.web.js']
const ONNX_FILES = [
  'ort.bundle.min.mjs',
  'ort.webgpu.bundle.min.mjs',
  'ort.wasm.bundle.min.mjs',
  'ort-wasm-simd-threaded.wasm',
  'ort-wasm-simd-threaded.mjs',
  'ort-wasm-simd-threaded.jsep.wasm',
  'ort-wasm-simd-threaded.jsep.mjs',
]

async function onnxDist() {
  const pnpm = path.join(process.cwd(), 'node_modules/.pnpm')
  const dirs = (await readdir(pnpm)).filter((name) => name.startsWith('onnxruntime-web@'))
  const latest = dirs.sort().at(-1)
  if (!latest) throw new Error('onnxruntime-web is not installed.')
  return path.join(pnpm, latest, 'node_modules/onnxruntime-web/dist')
}

async function main() {
  const dest = path.join(process.cwd(), 'public/boch-voice')
  await mkdir(dest, { recursive: true })
  const kokoroSrc = path.join(process.cwd(), 'node_modules/kokoro-js/dist')
  const onnxSrc = await onnxDist()
  for (const file of KOKORO_FILES) {
    await copyFile(path.join(kokoroSrc, file), path.join(dest, file))
  }
  for (const file of ONNX_FILES) {
    await copyFile(path.join(onnxSrc, file), path.join(dest, file))
  }
  console.log(`Copied ${KOKORO_FILES.length + ONNX_FILES.length} voice runtime files to public/boch-voice`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
