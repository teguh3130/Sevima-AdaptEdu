import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  DEFAULT_THEME,
  THEME_STORAGE_KEY,
  ThemeContext,
  THEMES,
} from '../hooks/useTheme.js'

function isValidTheme(value) {
  return THEMES.includes(value)
}

/**
 * Membaca tema tersimpan. Tanpa preferensi tersimpan -> Dark Mode.
 */
function readStoredTheme() {
  if (typeof window === 'undefined') return DEFAULT_THEME

  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
    if (isValidTheme(stored)) return stored
  } catch {
    // localStorage bisa diblokir (private mode / iframe) -> pakai default
  }

  return DEFAULT_THEME
}

function applyTheme(theme) {
  if (typeof document === 'undefined') return

  const root = document.documentElement
  root.dataset.theme = theme
  root.style.colorScheme = theme

  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) {
    meta.setAttribute('content', theme === 'light' ? '#F8FAFC' : '#080A13')
  }
}

function persistTheme(theme) {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    // Penyimpanan gagal tidak boleh menghentikan pergantian tema
  }
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(readStoredTheme)

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  const setTheme = useCallback((next) => {
    if (!isValidTheme(next)) return
    setThemeState(next)
    persistTheme(next)
  }, [])

  const toggleTheme = useCallback(() => {
    setThemeState((current) => {
      const next = current === 'dark' ? 'light' : 'dark'
      persistTheme(next)
      return next
    })
  }, [])

  const value = useMemo(
    () => ({
      theme,
      isDark: theme === 'dark',
      isLight: theme === 'light',
      setTheme,
      toggleTheme,
    }),
    [theme, setTheme, toggleTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export default ThemeProvider
