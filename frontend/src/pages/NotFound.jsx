import { Link } from 'react-router-dom'
import './NotFound.css'

function NotFound() {
  return (
    <section className="not-found">
      <p className="not-found__code">404</p>
      <h1 className="not-found__title">Halaman tidak ditemukan</h1>
      <Link to="/" className="not-found__link">
        Kembali ke beranda
      </Link>
    </section>
  )
}

export default NotFound
