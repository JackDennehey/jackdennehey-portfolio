'use client'

import { JdenOwlMark, JdenWindowTrigger } from './jden-launch'

export function JdenDesktopArtifact({ onOpen }: { onOpen: () => void }) {
  return (
    <JdenWindowTrigger
      onOpen={onOpen}
      className="jden-desktop-artifact os-border block w-full bg-foreground p-1.5 text-primary-foreground outline-none os-shadow transition-colors hover:bg-paper hover:text-foreground focus-visible:bg-paper focus-visible:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="block overflow-hidden border border-current">
        <JdenOwlMark size="artifact" className="h-auto w-full" />
      </span>
      <span className="mt-1.5 block border-t border-current pt-1 text-center font-pixel text-[8px] leading-none">
        JDEN
      </span>
    </JdenWindowTrigger>
  )
}
