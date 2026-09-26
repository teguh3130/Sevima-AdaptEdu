import { createContext, useContext } from 'react'

export const THEME_STORAGE_KEY = 'adaptedu-theme'
export const DEFAULT_THEME = 'dark'
export const THEMES = ['dark', 'light']

export const ThemeContext = createContext(null)

/**
 * Akses state tema global.
 * Nilai: { theme, isDark, isLight, setTheme, toggleTheme }
 */
export function useTheme() {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error('useTheme harus dipakai di dalam <ThemeProvider>')
  }

  return context
}

export default useTheme
