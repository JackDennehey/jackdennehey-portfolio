'use client'

import { BlueOceanKeynote } from '@/components/keynote/app/blue-ocean-keynote'

export function BlueOceanContent({
  active,
  onPowerDown,
  onPresentationEnter,
  onPresentationPowerDown,
}: {
  active: boolean
  onPowerDown?: () => void
  onPresentationEnter?: () => void
  onPresentationPowerDown?: () => void
}) {
  return (
    <BlueOceanKeynote
      active={active}
      onPowerDown={onPowerDown}
      onPresentationEnter={onPresentationEnter}
      onPresentationPowerDown={onPresentationPowerDown}
    />
  )
}
