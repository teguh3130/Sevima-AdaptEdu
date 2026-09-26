import { Link } from 'react-router-dom'
import './Home.css'

function Home() {
  return (
    <section className="hero">
      <span className="hero__badge">Fondasi Proyek</span>
      <h1 className="hero__title">
        Adapt<span className="hero__accent">Edu</span>
      </h1>
      <p className="hero__subtitle">
        Platform belajar berbasis AI. Fondasi aplikasi React + Express sudah
        siap untuk dikembangkan.
      </p>
      <div className="hero__actions">
        <Link to="/diagnostic/select-subject" className="btn btn--primary">
          Mulai Tes Diagnostik
        </Link>
        <a href="https://react.dev" target="_blank" rel="noreferrer" className="btn btn--ghost">
          Dokumentasi React
        </a>
      </div>
    </section>
  )
}

export default Home
