'use client'

import { useCallback, useRef, useState } from 'react'

export type JackNotificationType = 'info' | 'success' | 'warning'

export type JackNotificationInput = {
  title: string
  message?: string
  type?: JackNotificationType
}

export type JackNotification = Required<Pick<JackNotificationInput, 'title' | 'type'>> & {
  id: string
  message?: string
}

const DEDUPE_WINDOW_MS = 1200
const MAX_VISIBLE_NOTIFICATIONS = 4

function getNotificationKey(input: JackNotificationInput) {
  return `${input.type ?? 'info'}:${input.title}:${input.message ?? ''}`.toLowerCase()
}

export function useJackNotifications() {
  const [notifications, setNotifications] = useState<JackNotification[]>([])
  const sequence = useRef(0)
  const recentNotifications = useRef(new Map<string, number>())

  const dismiss = useCallback((id: string) => {
    setNotifications((current) => current.filter((notification) => notification.id !== id))
  }, [])

  const notify = useCallback((input: JackNotificationInput) => {
    const now = Date.now()
    const key = getNotificationKey(input)
    const lastShownAt = recentNotifications.current.get(key)
    if (lastShownAt && now - lastShownAt < DEDUPE_WINDOW_MS) {
      return
    }

    recentNotifications.current.set(key, now)
    sequence.current += 1
    const notification: JackNotification = {
      id: `${now}-${sequence.current}`,
      title: input.title,
      message: input.message,
      type: input.type ?? 'info',
    }

    setNotifications((current) => [...current, notification].slice(-MAX_VISIBLE_NOTIFICATIONS))
  }, [])

  return {
    notifications,
    notify,
    dismiss,
  }
}
