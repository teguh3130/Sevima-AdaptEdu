import { useEffect, useRef, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore'
import { db } from '../lib/firebase.js'
import { useAuth } from '../context/AuthContext.jsx'
import './Navbar.css'

const LEVELS = ['Dasar', 'Menengah', 'Lanjut']

const MENU_BY_ROLE = {
  student: [
    { to: '/student', label: 'Beranda' },
    { to: '/diagnostic/select-subject', label: 'Tes Diagnostik' },
    { to: '/ai-tutor', label: 'AI Tutor' },
    { to: '/ringkasan', label: 'Ringkasan' },
  ],
  teacher: [{ to: '/teacher', label: 'Dashboard' }],
}

function levelFromScore(score, total = 5) {
  const ratio = typeof score === 'number' ? score / total : 0
  if (ratio <= 0.4) return 'Dasar'
  if (ratio <= 0.8) return 'Menengah'
  return 'Lanjut'
}

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [level, setLevel] = useState(null)
  const [levelLoading, setLevelLoading] = useState(
    () => user?.role === 'student',
  )
  const menuRef = useRef(null)

  useEffect(() => {
    if (!user || user.role !== 'student') return undefined
    let cancelled = false

    async function loadLevel() {
      try {
        const snapshot = await getDocs(
          query(
            collection(db, 'diagnosticScores'),
            orderBy('createdAt', 'desc'),
            limit(1),
          ),
        )
        if (cancelled) return
        const doc = snapshot.docs[0]
        if (!doc) {
          setLevel(null)
          return
        }
        const data = doc.data()
        setLevel(
          LEVELS.includes(data.level)
            ? data.level
            : levelFromScore(data.score, data.total || 5),
        )
      } catch (err) {
        console.error('Gagal memuat level terakhir:', err)
        if (!cancelled) setLevel(null)
      } finally {
        if (!cancelled) setLevelLoading(false)
      }
    }

    loadLevel()
    return () => {
      cancelled = true
    }
  }, [user])

  useEffect(() => {
    if (!open) return undefined

    function handleClick(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false)
      }
    }

    function handleKey(event) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  if (!user) return null

  const links = MENU_BY_ROLE[user.role] ?? []
  const name = user.email?.split('@')[0] || 'Pengguna'
  const initial = name.charAt(0).toUpperCase()

  async function handleLogout() {
    setOpen(false)
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <NavLink to="/" className="navbar__brand">
          <span className="navbar__logo" aria-hidden="true">
            AE
          </span>
          AdaptEdu
        </NavLink>
        <nav className="navbar__nav">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className="navbar__link">
              {link.label}
            </NavLink>
          ))}

          <div className="navbar__profile" ref={menuRef}>
            <button
              type="button"
              className="navbar__profile-btn"
              aria-haspopup="menu"
              aria-expanded={open}
              aria-label="Profil"
              onClick={() => setOpen((value) => !value)}
            >
              <span className="navbar__avatar" aria-hidden="true">
                {initial}
              </span>
              <span className="navbar__profile-label">Profil</span>
            </button>

            {open && (
              <div className="profile-menu" role="menu">
                <div className="profile-menu__row">
                  <span>Nama</span>
                  <strong>{name}</strong>
                </div>
                <div className="profile-menu__row">
                  <span>Email</span>
                  <strong>{user.email}</strong>
                </div>
                {user.role === 'student' && (
                  <div className="profile-menu__row">
                    <span>Level terakhir</span>
                    <strong>{levelLoading ? 'Memuat...' : level ?? '-'}</strong>
                  </div>
                )}
                <button
                  type="button"
                  className="profile-menu__logout"
                  role="menuitem"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            className="navbar__link navbar__logout"
            onClick={handleLogout}
          >
            Keluar
          </button>
        </nav>
      </div>
    </header>
  )
}

export default Navbar
