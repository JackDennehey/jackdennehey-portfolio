'use client'

import { BlueOceanKeynote } from '@/components/keynote/app/blue-ocean-keynote'

export function BlueOceanContent({
  active,
  onPowerDown,
}: {
  active: boolean
  onPowerDown?: () => void
}) {
  return (
    <BlueOceanKeynote
      active={active}
      onPowerDown={onPowerDown}
    />
  )
}
