'use client'

import { useEffect, useState } from 'react'

const KEYBOARD_SHORTCUTS = [
  ['Search Jack OS', 'Command/Control + K'],
  ['Close active dialog or top app window', 'Escape'],
  ['Open focused desktop app', 'Enter or Space'],
  ['Navigate open menus', 'Arrow keys'],
  ['Move through controls', 'Tab'],
] as const

const TOUCH_HELP = [
  ['Open an app', 'Tap an icon'],
  ['Return home', 'Use the bottom Close control'],
  ['Search Jack OS', 'Use Search Jack OS in the menu bar'],
  ['Personalize', 'Open Wallpapers'],
] as const

export function KeyboardShortcutsContent() {
  const [isTouch, setIsTouch] = useState(false)
  const [modifier, setModifier] = useState('Command')

  useEffect(() => {
    const coarse = window.matchMedia('(pointer: coarse)')
    const update = () => setIsTouch(coarse.matches)
    update()
    coarse.addEventListener('change', update)

    const platform = navigator.platform.toLowerCase()
    setModifier(platform.includes('mac') ? 'Command' : 'Control')

    return () => coarse.removeEventListener('change', update)
  }, [])

  const items = isTouch
    ? TOUCH_HELP
    : KEYBOARD_SHORTCUTS.map(([label, keys]) => [
        label,
        keys.replace('Command/Control', modifier),
      ] as const)

  return (
    <div className="space-y-4">
      <section className="os-border bg-secondary p-4">
        <p className="font-pixel text-[10px] leading-relaxed text-muted-foreground">
          {isTouch ? '> interaction help' : '> keyboard map'}
        </p>
        <h2 className="mt-3 font-pixel text-base leading-relaxed text-foreground">
          {isTouch ? 'Interaction Help' : 'Keyboard Shortcuts'}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
          Only controls currently supported by Jack OS are listed here.
        </p>
      </section>

      <dl className="grid gap-2">
        {items.map(([label, keys]) => (
          <div key={label} className="os-border grid gap-2 bg-card p-3 sm:grid-cols-[minmax(0,1fr)_auto]">
            <dt className="text-sm font-medium text-foreground">{label}</dt>
            <dd className="font-pixel text-[8px] leading-relaxed text-muted-foreground">{keys}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
