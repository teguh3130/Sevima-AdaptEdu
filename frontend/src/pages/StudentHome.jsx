import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore'
import { db } from '../lib/firebase.js'
import { useAuth } from '../context/AuthContext.jsx'
import '../components/Skeleton.css'
import './StudentHome.css'

const LEVELS = ['Dasar', 'Menengah', 'Lanjut']

function levelFromScore(score, total = 5) {
  const ratio = typeof score === 'number' ? score / total : 0
  if (ratio <= 0.4) return 'Dasar'
  if (ratio <= 0.8) return 'Menengah'
  return 'Lanjut'
}

function resolveLevel(level, score, total) {
  return LEVELS.includes(level) ? level : levelFromScore(score, total)
}

function IconClipboard() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="8" y="2" width="8" height="4" rx="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="M9 12h6M9 16h4" />
    </svg>
  )
}

function IconBot() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="4" y="8" width="16" height="12" rx="3" />
      <path d="M12 8V5M12 5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
      <circle cx="9" cy="13.5" r="1" />
      <circle cx="15" cy="13.5" r="1" />
      <path d="M9.5 17h5" />
    </svg>
  )
}

function IconChart() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
    </svg>
  )
}

function StudentHome() {
  const { user } = useAuth()
  const [latest, setLatest] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function loadLatest() {
      try {
        const latestQuery = query(
          collection(db, 'diagnosticScores'),
          orderBy('createdAt', 'desc'),
          limit(1),
        )
        const snapshot = await getDocs(latestQuery)
        if (cancelled) return
        const doc = snapshot.docs[0]
        setLatest(doc ? { id: doc.id, ...doc.data() } : null)
      } catch (err) {
        console.error('Gagal memuat hasil tes:', err)
        if (!cancelled) setLatest(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadLatest()
    return () => {
      cancelled = true
    }
  }, [])

  const name = user?.email?.split('@')[0] || 'Siswa'
  const total = latest?.total || 5
  const score = Number(latest?.score) || 0
  const level = latest ? resolveLevel(latest.level, score, total) : null

  return (
    <section className="student-home">
      <header className="student-home__header">
        <span className="student-home__badge">Ruang Siswa</span>
        <h1 className="student-home__title">Halo, {name}!</h1>
        <p className="student-home__subtitle">Belajar sesuai levelmu.</p>
      </header>

      <div className="student-home__grid">
        <article className="feature-card">
          <span className="feature-card__icon">
            <IconClipboard />
          </span>
          <h2 className="feature-card__title">Tes Diagnostik</h2>
          <p className="feature-card__desc">
            Kerjakan 5 soal untuk mengetahui levelmu.
          </p>
          <Link className="btn btn--primary feature-card__cta" to="/diagnostic/select-subject">
            Mulai Tes
          </Link>
        </article>

        <article className="feature-card">
          <span className="feature-card__icon">
            <IconBot />
          </span>
          <h2 className="feature-card__title">AI Tutor</h2>
          <p className="feature-card__desc">Tanya materi kapan saja.</p>
          <Link className="btn btn--primary feature-card__cta" to="/ai-tutor">
            Buka Tutor
          </Link>
        </article>

        <article className="feature-card">
          <span className="feature-card__icon">
            <IconChart />
          </span>
          <h2 className="feature-card__title">Ringkasan Hasil</h2>

          {loading && (
            <div className="feature-card__meta" aria-hidden="true">
              <span className="skeleton skeleton--text" />
              <span className="skeleton skeleton--text" style={{ width: '65%' }} />
            </div>
          )}

          {!loading && latest && (
            <dl className="feature-card__meta">
              <div className="feature-card__row">
                <dt>Skor terakhir</dt>
                <dd>
                  {score} / {total}
                </dd>
              </div>
              <div className="feature-card__row">
                <dt>Level terakhir</dt>
                <dd>
                  <span
                    className={`level-pill level-pill--${level.toLowerCase()}`}
                  >
                    {level}
                  </span>
                </dd>
              </div>
            </dl>
          )}

          {!loading && !latest && (
            <p className="feature-card__empty">
              Belum ada hasil tes. Mulai Tes Diagnostik.
            </p>
          )}

          {!loading &&
            (latest ? (
              <Link
                className="btn btn--primary feature-card__cta"
                to="/ringkasan"
              >
                Lihat Detail
              </Link>
            ) : (
              <Link
                className="btn btn--primary feature-card__cta"
                to="/diagnostic/select-subject"
              >
                Mulai Tes Diagnostik
              </Link>
            ))}
        </article>
      </div>
    </section>
  )
}

export default StudentHome
