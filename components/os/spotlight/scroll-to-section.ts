export function scrollJackOsSectionIntoView(id: string, attempts = 24) {
  if (typeof window === 'undefined') return

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const tryScroll = (left: number) => {
    const element = document.getElementById(id)
    if (element instanceof HTMLElement) {
      element.scrollIntoView({
        behavior: reduceMotion ? 'auto' : 'smooth',
        block: 'start',
      })
      element.focus({ preventScroll: true })
      return
    }
    if (left <= 0) return
    window.requestAnimationFrame(() => tryScroll(left - 1))
  }

  tryScroll(attempts)
}
