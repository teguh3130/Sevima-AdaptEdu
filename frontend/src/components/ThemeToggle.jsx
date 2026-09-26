import { useTheme } from '../hooks/useTheme.js'
import './ThemeToggle.css'

function IconMoon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 14.5A8.2 8.2 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5Z" />
    </svg>
  )
}

function IconSun() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.6v2.2M12 19.2v2.2M4.2 12H2M22 12h-2.2M6.3 6.3 4.8 4.8M19.2 19.2l-1.5-1.5M17.7 6.3l1.5-1.5M4.8 19.2l1.5-1.5" />
    </svg>
  )
}

/**
 * Tombol pengalih tema.
 * - Desktop: bulan (mode gelap) / matahari (mode terang)
 * - Mobile: bisa ditaruh di dalam menu hamburger lewat class `theme-toggle--block`
 */
function ThemeToggle({ variant = 'icon', className = '' }) {
  const { isDark, toggleTheme } = useTheme()
  const label = isDark ? 'Aktifkan Light Mode' : 'Aktifkan Dark Mode'

  const classes = [
    'theme-toggle',
    variant === 'block' ? 'theme-toggle--block' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      type="button"
      className={classes}
      onClick={toggleTheme}
      role="switch"
      aria-checked={!isDark}
      aria-label={label}
      title={label}
    >
      <span className="theme-toggle__icons" aria-hidden="true">
        <span
          className={`theme-toggle__icon theme-toggle__icon--moon ${
            isDark ? 'is-active' : ''
          }`}
        >
          <IconMoon />
        </span>
        <span
          className={`theme-toggle__icon theme-toggle__icon--sun ${
            isDark ? '' : 'is-active'
          }`}
        >
          <IconSun />
        </span>
      </span>
      {variant === 'block' && <span className="theme-toggle__label">{label}</span>}
    </button>
  )
}

export default ThemeToggle
