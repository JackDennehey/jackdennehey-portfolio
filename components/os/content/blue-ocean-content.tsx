'use client'

import { BlueOceanKeynote } from '@/components/keynote/app/blue-ocean-keynote'

export function BlueOceanContent({
  active,
  onPowerDown,
  onCompleted,
  onPresentationEnter,
  onPresentationPowerDown,
}: {
  active: boolean
  onPowerDown?: () => void
  onCompleted?: () => void
  onPresentationEnter?: () => void
  onPresentationPowerDown?: () => void
}) {
  return (
    <BlueOceanKeynote
      active={active}
      onPowerDown={onPowerDown}
      onCompleted={onCompleted}
      onPresentationEnter={onPresentationEnter}
      onPresentationPowerDown={onPresentationPowerDown}
    />
  )
}
