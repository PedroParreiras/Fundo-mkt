/**
 * =============================================================================
 * THEME TOGGLE — fixed button at the top-right of every page
 * =============================================================================
 * Switches between the dark (HRM navy/gold) and light (marketplace) schemes.
 * Rendered once at the App root so it is present on every page. Same DOM +
 * .theme-toggle-btn class as the HRM main app and every other /system
 * submodule so the whole platform looks and behaves identically.
 * =============================================================================
 */

import { useEffect, useState } from 'react'
import { getTheme, toggleTheme, type Theme } from '../utils/theme'

export default function ThemeToggle() {
  const [theme, setThemeState] = useState<Theme>(getTheme())

  useEffect(() => {
    const sync = () => setThemeState(getTheme())
    window.addEventListener('hrm-theme-changed', sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener('hrm-theme-changed', sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  return (
    <button
      type="button"
      className="theme-toggle-btn"
      onClick={() => setThemeState(toggleTheme())}
      title={theme === 'light' ? 'Mudar para tema escuro' : 'Mudar para tema claro'}
      aria-label="Alternar tema claro/escuro"
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  )
}
