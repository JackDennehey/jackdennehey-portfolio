export const PUBLIC_FAILURE_TEXT: {
  RATE_LIMITED: string
  QUOTA_EXCEEDED: string
  MODEL_UNAVAILABLE: string
}

export function publicCodeFromProviderHttp(
  status: number,
  body?: string,
): 'QUOTA_EXCEEDED' | 'MODEL_UNAVAILABLE'
