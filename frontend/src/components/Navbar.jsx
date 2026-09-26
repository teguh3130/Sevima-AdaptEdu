import { NavLink } from 'react-router-dom'
import './Navbar.css'

function Navbar() {
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
          <NavLink to="/" className="navbar__link" end>
            Beranda
          </NavLink>
          <NavLink to="/tes-diagnostik" className="navbar__link">
            Tes Diagnostik
          </NavLink>
        </nav>
      </div>
    </header>
  )
}

export default Navbar
