/** PUBLIC JackOS Fenrir config. Speech-only. Not used by Gemini or stored logs. */

export const KOKORO_MODEL_ID = 'onnx-community/Kokoro-82M-v1.0-ONNX'
export const PRODUCTION_VOICE = 'am_fenrir' as const
export const PRODUCTION_RATE = 1
export const PRODUCTION_DTYPE = 'q8' as const
export const ENGINE_PUBLIC_PATH = '/boch-voice/'
export const MAX_SPOKEN_CHARS = 1000
/** Kokoro generate() truncates around 509 phoneme tokens. Pack whole sentences until this limit. */
export const MAX_UTTERANCE_CHARS = 360
export const PCM_CACHE_LIMIT = 4
export const HF_MODEL_HOSTS = [
  'https://huggingface.co',
  'https://cas-bridge.xethub.hf.co',
  'https://cdn-lfs.huggingface.co',
  'https://cdn-lfs-us-1.huggingface.co',
] as const
