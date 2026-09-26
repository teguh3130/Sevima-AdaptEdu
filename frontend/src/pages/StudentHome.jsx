import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import './StudentHome.css'

const FEATURES = [
  {
    to: '/tes-diagnostik',
    title: 'Tes Diagnostik',
    desc: '5 soal pecahan untuk menentukan level belajarmu.',
  },
  {
    to: '/ai-tutor',
    title: 'AI Tutor',
    desc: 'Tanya materi Matematika SMP kapan saja.',
  },
  {
    to: '/ringkasan',
    title: 'Ringkasan Hasil',
    desc: 'Lihat skor, level, dan progress belajarmu.',
  },
]

function StudentHome() {
  const { user } = useAuth()

  return (
    <section className="student-home">
      <header className="student-home__header">
        <span className="student-home__badge">Ruang Siswa</span>
        <h1 className="student-home__title">
          Halo, {user?.email?.split('@')[0] || 'Siswa'}!
        </h1>
        <p className="student-home__subtitle">
          Pilih fitur untuk mulai belajar hari ini.
        </p>
      </header>

      <div className="student-home__grid">
        {FEATURES.map((feature) => (
          <Link key={feature.to} to={feature.to} className="feature-card">
            <h2 className="feature-card__title">{feature.title}</h2>
            <p className="feature-card__desc">{feature.desc}</p>
            <span className="feature-card__cta">Buka →</span>
          </Link>
        ))}
      </div>
    </section>
  )
}

export default StudentHome
