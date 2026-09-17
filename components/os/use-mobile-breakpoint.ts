'use client'

import { useEffect, useState } from 'react'

/** Portrait phones, plus short landscape phone viewports. Typical desktops stay in desktop mode. */
export const JACK_OS_MOBILE_QUERY =
  '(max-width: 640px), (max-height: 520px) and (max-width: 960px)'

export function useJackOsMobileBreakpoint() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(JACK_OS_MOBILE_QUERY)
    const update = () => setIsMobile(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  return isMobile
}
