export const INTERFACE_THEME_STORAGE_KEY = 'jack-os:interface-theme'

export type InterfaceTheme = 'light' | 'dark'

export const DEFAULT_INTERFACE_THEME: InterfaceTheme = 'light'

export function isInterfaceTheme(value: unknown): value is InterfaceTheme {
  return value === 'light' || value === 'dark'
}

export function parseInterfaceTheme(value: string | null): InterfaceTheme | null {
  return isInterfaceTheme(value) ? value : null
}

