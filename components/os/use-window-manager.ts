'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  isWindowId,
  shouldAutoMaximizeWindow,
  type WindowId,
} from './apps'
import {
  WINDOW_CLOSE_DURATION_MS,
  WINDOW_OPEN_DURATION_MS,
  applyWindowResize,
  clampWindowGeometry,
  clampWindowPosition,
  getInitialWindowGeometry,
  getMaximizedGeometry,
  getWindowStackZ,
  type OpenWindow,
  type ResizeHandle,
  type RestorableWindowStatus,
  type WindowGeometry,
} from '@/lib/os/window-geometry'
import {
  readRememberedWindowGeometry,
  writeRememberedWindowGeometry,
} from '@/lib/os/window-memory'

export type WindowManagerOpenResult = {
  id: WindowId
  isNew: boolean
}

function getOpenGeometry(id: WindowId, cascadeCount: number): WindowGeometry {
  const remembered = readRememberedWindowGeometry(id)
  if (remembered) return remembered
  return getInitialWindowGeometry(id, cascadeCount)
}

function persistNormalGeometry(windowRecord: OpenWindow) {
  writeRememberedWindowGeometry(windowRecord.id, windowRecord.normal)
}

export function useWindowManager(isMobile: boolean) {
  const [windows, setWindows] = useState<OpenWindow[]>([])
  const [order, setOrder] = useState<WindowId[]>([])
  const windowsRef = useRef<OpenWindow[]>([])
  const cascadeCount = useRef(0)
  const openTimers = useRef<Partial<Record<WindowId, ReturnType<typeof setTimeout>>>>({})
  const closeTimers = useRef<Partial<Record<WindowId, ReturnType<typeof setTimeout>>>>({})

  useEffect(() => {
    windowsRef.current = windows
  }, [windows])

  const commit = useCallback((next: OpenWindow[]) => {
    windowsRef.current = next
    setWindows(next)
  }, [])

  const patchWindow = useCallback(
    (id: WindowId, updater: (windowRecord: OpenWindow) => OpenWindow) => {
      commit(windowsRef.current.map((windowRecord) =>
        windowRecord.id === id ? updater(windowRecord) : windowRecord,
      ))
    },
    [commit],
  )

  const getWindow = useCallback((id: WindowId) => {
    return windowsRef.current.find((windowRecord) => windowRecord.id === id)
  }, [])

  const focusWindow = useCallback((id: WindowId) => {
    const target = windowsRef.current.find((windowRecord) => windowRecord.id === id)
    if (!target || target.status === 'minimized' || target.status === 'closing') return
    setOrder((prev) => [...prev.filter((windowId) => windowId !== id), id])
  }, [])

  const openWindow = useCallback(
    (id: string): WindowManagerOpenResult | null => {
      if (!isWindowId(id)) return null

      const existing = windowsRef.current.find((windowRecord) => windowRecord.id === id)
      if (existing) {
        if (existing.status === 'minimized') {
          const restoredStatus: RestorableWindowStatus = shouldAutoMaximizeWindow(id, isMobile)
            ? 'maximized'
            : (existing.restoreStatus ?? 'open')
          const restoredGeometry =
            restoredStatus === 'maximized'
              ? getMaximizedGeometry()
              : clampWindowGeometry(id, existing.normal)

          patchWindow(id, (windowRecord) => ({
            ...windowRecord,
            ...restoredGeometry,
            status: restoredStatus,
            restoreStatus: undefined,
          }))
        } else if (
          shouldAutoMaximizeWindow(id, isMobile) &&
          existing.status !== 'maximized'
        ) {
          const normal = {
            x: existing.x,
            y: existing.y,
            width: existing.width,
            height: existing.height,
          }
          const maximized = getMaximizedGeometry()
          patchWindow(id, (windowRecord) => ({
            ...windowRecord,
            ...maximized,
            normal,
            status: 'maximized',
          }))
        }
        focusWindow(id)
        return { id, isNew: false }
      }

      const normalGeometry = getOpenGeometry(id, cascadeCount.current)
      const geometry = shouldAutoMaximizeWindow(id, isMobile)
        ? getMaximizedGeometry()
        : normalGeometry
      cascadeCount.current += 1
      const nextWindow: OpenWindow = {
        id,
        ...geometry,
        normal: normalGeometry,
        status: 'opening',
      }
      commit([...windowsRef.current, nextWindow])
      focusWindow(id)
      openTimers.current[id] = setTimeout(() => {
        const current = windowsRef.current.find((windowRecord) => windowRecord.id === id)
        if (!current || current.status !== 'opening') {
          delete openTimers.current[id]
          return
        }
        patchWindow(id, (windowRecord) => ({
          ...windowRecord,
          status: shouldAutoMaximizeWindow(id, isMobile) ? 'maximized' : 'open',
        }))
        delete openTimers.current[id]
      }, WINDOW_OPEN_DURATION_MS)

      return { id, isNew: true }
    },
    [commit, focusWindow, isMobile, patchWindow],
  )

  const closeWindow = useCallback((id: WindowId) => {
    const target = windowsRef.current.find((windowRecord) => windowRecord.id === id)
    if (!target || target.status === 'closing') return false

    if (openTimers.current[id]) {
      clearTimeout(openTimers.current[id])
      delete openTimers.current[id]
    }

    patchWindow(id, (windowRecord) => ({ ...windowRecord, status: 'closing' }))
    closeTimers.current[id] = setTimeout(() => {
      commit(windowsRef.current.filter((windowRecord) => windowRecord.id !== id))
      setOrder((prev) => prev.filter((windowId) => windowId !== id))
      delete closeTimers.current[id]
    }, WINDOW_CLOSE_DURATION_MS)
    return true
  }, [commit, patchWindow])

  const moveWindow = useCallback((id: WindowId, x: number, y: number) => {
    const target = windowsRef.current.find((windowRecord) => windowRecord.id === id)
    if (!target || target.status === 'maximized' || target.status === 'minimized') {
      return
    }

    const position = clampWindowPosition(id, x, y, {
      width: target.width,
      height: target.height,
    })
    patchWindow(id, (windowRecord) => ({
      ...windowRecord,
      ...position,
      normal: { ...windowRecord.normal, ...position },
    }))
  }, [patchWindow])

  const resizeWindow = useCallback(
    (id: WindowId, handle: ResizeHandle, start: WindowGeometry, dx: number, dy: number) => {
      const target = windowsRef.current.find((windowRecord) => windowRecord.id === id)
      if (
        !target ||
        target.status === 'minimized' ||
        target.status === 'closing' ||
        target.status === 'maximized'
      ) {
        return
      }

      const geometry = applyWindowResize(id, start, handle, dx, dy)
      patchWindow(id, (windowRecord) => ({
        ...windowRecord,
        ...geometry,
        normal: geometry,
      }))
    },
    [patchWindow],
  )

  const commitGeometry = useCallback((id: WindowId) => {
    const target = windowsRef.current.find((windowRecord) => windowRecord.id === id)
    if (!target || target.status === 'closing') return
    persistNormalGeometry(target)
  }, [])

  const minimizeWindow = useCallback((id: WindowId) => {
    const target = windowsRef.current.find((windowRecord) => windowRecord.id === id)
    if (!target || target.status === 'minimized' || target.status === 'closing') return false

    const restoreStatus: RestorableWindowStatus =
      target.status === 'maximized' ? 'maximized' : 'open'
    const normal =
      target.status === 'maximized'
        ? target.normal
        : { x: target.x, y: target.y, width: target.width, height: target.height }

    patchWindow(id, (windowRecord) => ({
      ...windowRecord,
      normal,
      status: 'minimized',
      restoreStatus,
    }))
    setOrder((prev) => prev.filter((windowId) => windowId !== id))
    return true
  }, [patchWindow])

  const restoreWindow = useCallback((id: WindowId) => {
    const target = windowsRef.current.find((windowRecord) => windowRecord.id === id)
    if (!target || target.status !== 'minimized') return false

    const restoredStatus = target.restoreStatus ?? 'open'
    const restoredGeometry =
      restoredStatus === 'maximized'
        ? getMaximizedGeometry()
        : clampWindowGeometry(id, target.normal)

    patchWindow(id, (windowRecord) => ({
      ...windowRecord,
      ...restoredGeometry,
      status: restoredStatus,
      restoreStatus: undefined,
    }))
    focusWindow(id)
    return true
  }, [focusWindow, patchWindow])

  const restoreAllMinimized = useCallback(() => {
    const minimizedWindows = windowsRef.current.filter(
      (windowRecord) => windowRecord.status === 'minimized',
    )
    if (minimizedWindows.length === 0) return

    commit(
      windowsRef.current.map((windowRecord) => {
        if (windowRecord.status !== 'minimized') return windowRecord
        const restoredStatus = windowRecord.restoreStatus ?? 'open'
        const restoredGeometry =
          restoredStatus === 'maximized'
            ? getMaximizedGeometry()
            : clampWindowGeometry(windowRecord.id, windowRecord.normal)
        return {
          ...windowRecord,
          ...restoredGeometry,
          status: restoredStatus,
          restoreStatus: undefined,
        }
      }),
    )
    setOrder((prev) => [
      ...prev.filter((id) => !minimizedWindows.some((windowRecord) => windowRecord.id === id)),
      ...minimizedWindows.map((windowRecord) => windowRecord.id),
    ])
  }, [commit])

  const maximizeWindow = useCallback((id: WindowId) => {
    const target = windowsRef.current.find((windowRecord) => windowRecord.id === id)
    if (!target || target.status === 'minimized' || target.status === 'closing') return false

    if (target.status === 'maximized') {
      const restoredGeometry = clampWindowGeometry(id, target.normal)
      patchWindow(id, (windowRecord) => ({
        ...windowRecord,
        ...restoredGeometry,
        status: 'open',
      }))
      focusWindow(id)
      return true
    }

    const normal = {
      x: target.x,
      y: target.y,
      width: target.width,
      height: target.height,
    }
    const maximized = getMaximizedGeometry()
    patchWindow(id, (windowRecord) => ({
      ...windowRecord,
      ...maximized,
      normal,
      status: 'maximized',
    }))
    persistNormalGeometry({ ...target, normal })
    focusWindow(id)
    return true
  }, [focusWindow, patchWindow])

  useEffect(() => {
    const onResize = () => {
      commit(
        windowsRef.current.map((windowRecord) => {
          if (windowRecord.status === 'maximized') {
            return { ...windowRecord, ...getMaximizedGeometry() }
          }

          if (windowRecord.status === 'minimized' || windowRecord.status === 'closing') {
            return windowRecord
          }

          const geometry = clampWindowGeometry(windowRecord.id, windowRecord)
          return geometry.x === windowRecord.x &&
            geometry.y === windowRecord.y &&
            geometry.width === windowRecord.width &&
            geometry.height === windowRecord.height
            ? windowRecord
            : { ...windowRecord, ...geometry, normal: { ...windowRecord.normal, ...geometry } }
        }),
      )
    }

    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [commit])

  useEffect(() => {
    if (!isMobile) return

    const minimizedWindows = windowsRef.current.filter(
      (windowRecord) => windowRecord.status === 'minimized',
    )
    if (minimizedWindows.length === 0) return

    commit(
      windowsRef.current.map((windowRecord) =>
        windowRecord.status === 'minimized'
          ? {
              ...windowRecord,
              ...clampWindowGeometry(windowRecord.id, windowRecord.normal),
              status: 'open',
              restoreStatus: undefined,
            }
          : windowRecord,
      ),
    )
    setOrder((prev) => [
      ...prev.filter((id) => !minimizedWindows.some((windowRecord) => windowRecord.id === id)),
      ...minimizedWindows.map((windowRecord) => windowRecord.id),
    ])
  }, [commit, isMobile])

  useEffect(() => {
    return () => {
      Object.values(openTimers.current).forEach((timer) => {
        if (timer) clearTimeout(timer)
      })
      Object.values(closeTimers.current).forEach((timer) => {
        if (timer) clearTimeout(timer)
      })
    }
  }, [])

  const activeWindowId = order[order.length - 1]
  const minimizedWindows = useMemo(
    () => windows.filter((windowRecord) => windowRecord.status === 'minimized'),
    [windows],
  )
  const visibleWindows = useMemo(
    () => windows.filter((windowRecord) => windowRecord.status !== 'minimized'),
    [windows],
  )

  return {
    windows,
    order,
    activeWindowId,
    minimizedWindows,
    visibleWindows,
    getWindow,
    getStackZ: (id: WindowId) => getWindowStackZ(order, id),
    openWindow,
    closeWindow,
    focusWindow,
    minimizeWindow,
    maximizeWindow,
    restoreWindow,
    restoreAllMinimized,
    moveWindow,
    resizeWindow,
    commitGeometry,
  }
}
