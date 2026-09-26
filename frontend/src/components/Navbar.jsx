import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import './Navbar.css'

const MENU_BY_ROLE = {
  student: [
    { to: '/student', label: 'Beranda' },
    { to: '/tes-diagnostik', label: 'Tes Diagnostik' },
    { to: '/ai-tutor', label: 'AI Tutor' },
    { to: '/ringkasan', label: 'Ringkasan Hasil' },
  ],
  teacher: [{ to: '/teacher', label: 'Dashboard Guru' }],
}

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  if (!user) return null

  const links = MENU_BY_ROLE[user.role] ?? []

  async function handleLogout() {
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
