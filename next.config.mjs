/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  serverExternalPackages: ['onnxruntime-node', 'sharp', 'kokoro-js'],
  async headers() {
    return [
      {
        source: '/boch-voice/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, immutable' },
        ],
      },
    ]
  },
  outputFileTracingExcludes: {
    '*': [
      './node_modules/.pnpm/onnxruntime-web@*/**',
      './node_modules/.pnpm/@huggingface+transformers@*/**',
      './node_modules/kokoro-js/**',
    ],
  },
  webpack: (config, { isServer }) => {
    const alias = config.resolve.alias && !Array.isArray(config.resolve.alias) ? config.resolve.alias : {}
    config.resolve.alias = {
      ...alias,
      sharp$: false,
    }
    if (Array.isArray(config.ignoreWarnings)) {
      config.ignoreWarnings.push({ module: /onnxruntime/ }, { message: /Critical dependency/ })
    }
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        'fs/promises': false,
        child_process: false,
        'onnxruntime-node': false,
      }
    }
    return config
  },
}

export default nextConfig
