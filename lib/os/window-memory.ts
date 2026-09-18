import { isWindowId, type WindowId } from '@/components/os/apps'
import {
  JACK_OS_STORAGE_KEYS,
  readLocalStorageItem,
  removeLocalStorageItem,
  writeLocalStorageItem,
} from './storage'
import { clampWindowGeometry, type WindowGeometry } from './window-geometry'

export const WINDOW_GEOMETRY_STORAGE_KEY = JACK_OS_STORAGE_KEYS.windowGeometry

type StoredWindowGeometryMap = Partial<Record<WindowId, WindowGeometry>>

type StoredWindowGeometryFile = {
  version: 1
  windows: StoredWindowGeometryMap
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function parseStoredGeometry(value: unknown): WindowGeometry | null {
  if (!value || typeof value !== 'object') return null
  const geometry = value as Partial<WindowGeometry>
  if (
    !isFiniteNumber(geometry.x) ||
    !isFiniteNumber(geometry.y) ||
    !isFiniteNumber(geometry.width) ||
    !isFiniteNumber(geometry.height)
  ) {
    return null
  }

  return {
    x: geometry.x,
    y: geometry.y,
    width: geometry.width,
    height: geometry.height,
  }
}

function readStoredWindowGeometryFile(): StoredWindowGeometryFile {
  const raw = readLocalStorageItem(WINDOW_GEOMETRY_STORAGE_KEY)
  if (!raw) return { version: 1, windows: {} }

  try {
    const parsed = JSON.parse(raw) as Partial<StoredWindowGeometryFile>
    if (parsed.version !== 1 || !parsed.windows || typeof parsed.windows !== 'object') {
      return { version: 1, windows: {} }
    }

    const windows: StoredWindowGeometryMap = {}
    for (const [id, value] of Object.entries(parsed.windows)) {
      if (!isWindowId(id)) continue
      const geometry = parseStoredGeometry(value)
      if (geometry) windows[id] = geometry
    }

    return { version: 1, windows }
  } catch {
    return { version: 1, windows: {} }
  }
}

export function readRememberedWindowGeometryUnclamped(id: WindowId): WindowGeometry | null {
  return readStoredWindowGeometryFile().windows[id] ?? null
}

export function readRememberedWindowGeometry(id: WindowId): WindowGeometry | null {
  const stored = readRememberedWindowGeometryUnclamped(id)
  if (!stored) return null
  return clampWindowGeometry(id, stored)
}

export function writeRememberedWindowGeometry(id: WindowId, geometry: WindowGeometry) {
  const current = readStoredWindowGeometryFile()
  const next = clampWindowGeometry(id, geometry)
  const existing = current.windows[id]
  if (
    existing &&
    existing.x === next.x &&
    existing.y === next.y &&
    existing.width === next.width &&
    existing.height === next.height
  ) {
    return
  }

  current.windows[id] = next
  writeLocalStorageItem(WINDOW_GEOMETRY_STORAGE_KEY, JSON.stringify(current))
}

export function clearRememberedWindowGeometry() {
  removeLocalStorageItem(WINDOW_GEOMETRY_STORAGE_KEY)
}
