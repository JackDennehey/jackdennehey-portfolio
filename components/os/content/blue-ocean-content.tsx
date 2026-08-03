'use client'

import { BlueOceanKeynote } from '@/components/keynote/app/blue-ocean-keynote'

export function BlueOceanContent({ active }: { active: boolean }) {
  return <BlueOceanKeynote active={active} />
}
