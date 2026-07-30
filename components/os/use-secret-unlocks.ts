'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  readStoredUnlockedSecrets,
  writeStoredUnlockedSecrets,
  type SecretId,
} from '@/lib/secrets'

export type SecretUnlockResult = 'unlocked' | 'already'

export function useSecretUnlocks() {
  const [unlockedIds, setUnlockedIds] = useState<SecretId[]>([])
  const [loaded, setLoaded] = useState(false)
  const unlockedIdsRef = useRef<SecretId[]>([])

  useEffect(() => {
    const storedIds = readStoredUnlockedSecrets()
    unlockedIdsRef.current = storedIds
    setUnlockedIds(storedIds)
    setLoaded(true)
  }, [])

  const isUnlocked = useCallback((id: SecretId) => {
    return unlockedIdsRef.current.includes(id)
  }, [])

  const unlock = useCallback((id: SecretId): SecretUnlockResult => {
    if (unlockedIdsRef.current.includes(id)) {
      return 'already'
    }

    const next = [...unlockedIdsRef.current, id]
    unlockedIdsRef.current = next
    setUnlockedIds(next)
    writeStoredUnlockedSecrets(next)
    return 'unlocked'
  }, [])

  const reset = useCallback(() => {
    unlockedIdsRef.current = []
    setUnlockedIds([])
    writeStoredUnlockedSecrets([])
  }, [])

  const unlockedSet = useMemo(() => new Set(unlockedIds), [unlockedIds])

  return {
    unlockedIds,
    unlockedSet,
    loaded,
    isUnlocked,
    unlock,
    reset,
  }
}
