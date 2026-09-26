import './Home.css'

function Home() {
  return (
    <section className="hero">
      <span className="hero__badge">Fondasi Proyek</span>
      <h1 className="hero__title">
        EduBridge <span className="hero__accent">AI</span>
      </h1>
      <p className="hero__subtitle">
        Jembatan pembelajaran yang diperkuat AI. Fondasi aplikasi React +
        Express sudah siap untuk dikembangkan.
      </p>
      <div className="hero__actions">
        <a href="https://react.dev" target="_blank" rel="noreferrer" className="btn btn--primary">
          Dokumentasi React
        </a>
        <a href="https://expressjs.com" target="_blank" rel="noreferrer" className="btn btn--ghost">
          Dokumentasi Express
        </a>
      </div>
    </section>
  )
}

export default Home
