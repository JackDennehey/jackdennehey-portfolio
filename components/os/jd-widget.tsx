'use client'

export function JdWidget({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      data-desktop-widget="jd"
      aria-label="Open J.D., the Jack OS portfolio assistant"
      className="jd-widget os-border bg-paper/85 p-2 text-left text-foreground outline-none transition-colors hover:bg-paper focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="jd-widget-artwork block border border-current bg-secondary">
        <img
          src="/images/jd/jd-bot.png"
          alt=""
          aria-hidden="true"
          loading="eager"
          decoding="async"
          className="pixelated"
        />
      </span>
      <span className="mt-2 block border-t-2 border-border pt-1 text-center font-pixel text-[9px] leading-none">
        Ask J.D.
      </span>
    </button>
  )
}
