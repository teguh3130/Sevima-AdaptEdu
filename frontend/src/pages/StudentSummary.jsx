import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore'
import { db } from '../lib/firebase.js'
import { useAuth } from '../context/AuthContext.jsx'
import { SUBJECTS, isValidSubject, subjectName } from '../data/subjects.js'
import './StudentSummary.css'

const LEVELS = ['Dasar', 'Menengah', 'Lanjut']
// Warna ring memakai token tema agar ikut berubah saat Light/Dark Mode
const LEVEL_COLORS = {
  Dasar: 'var(--danger)',
  Menengah: 'var(--warning)',
  Lanjut: 'var(--success)',
}
const FETCH_LIMIT = 30

function levelFromScore(score, total = 5) {
  const ratio = typeof score === 'number' ? score / total : 0
  if (ratio <= 0.4) return 'Dasar'
  if (ratio <= 0.8) return 'Menengah'
  return 'Lanjut'
}

function resolveLevel(level, score, total) {
  return LEVELS.includes(level) ? level : levelFromScore(score, total)
}

function subjectOf(row) {
  return isValidSubject(row.subject) ? row.subject : 'matematika'
}

function formatDate(value) {
  const date = value?.toDate
    ? value.toDate()
    : value instanceof Date
      ? value
      : null
  if (!date) return '-'
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

function ProgressRing({ score, total, color }) {
  const radius = 62
  const circumference = 2 * Math.PI * radius
  const progress = total > 0 ? Math.min(Math.max(score / total, 0), 1) : 0

  return (
    <div className="ring" style={{ '--ring-color': color }}>
      <svg viewBox="0 0 160 160" role="img" aria-label={`Skor ${score} dari ${total}`}>
        <circle className="ring__track" cx="80" cy="80" r={radius} />
        <circle
          className="ring__value"
          cx="80"
          cy="80"
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - progress)}
        />
      </svg>
      <div className="ring__center">
        <strong>{score}</strong>
        <span>/{total}</span>
      </div>
    </div>
  )
}

function StudentSummary() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const passedResult = location.state?.result ?? null

  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadResults() {
      try {
        const latest = query(
          collection(db, 'diagnosticScores'),
          orderBy('createdAt', 'desc'),
          limit(FETCH_LIMIT),
        )
        const snapshot = await getDocs(latest)
        if (cancelled) return

        let list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        const mine = list.filter((row) => row.uid && row.uid === user?.uid)
        if (mine.length > 0) list = mine

        setRows(list)
      } catch (err) {
        console.error('Gagal memuat ringkasan:', err)
        if (!cancelled) setError('Gagal memuat data Firestore.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadResults()
    return () => {
      cancelled = true
    }
  }, [user])

  const featured = passedResult ?? rows[0] ?? null

  const groups = SUBJECTS.map((subject) => ({
    ...subject,
    rows: rows.filter((row) => subjectOf(row) === subject.id),
  })).filter((group) => group.rows.length > 0)

  if (loading) {
    return (
      <section className="summary">
        <p className="summary__status">Memuat ringkasan hasil...</p>
      </section>
    )
  }

  if (error) {
    return (
      <section className="summary">
        <p className="summary__status summary__status--error">{error}</p>
      </section>
    )
  }

  if (!featured) {
    return (
      <section className="summary">
        <header className="summary__header">
          <span className="summary__badge">Ringkasan Hasil</span>
          <p className="summary__subtitle">Hasil Tes Diagnostik terakhirmu.</p>
        </header>
        <p className="summary__status">Belum ada hasil tes.</p>
        <div className="summary__empty-actions">
          <Link className="btn btn--primary" to="/diagnostic/select-subject">
            Mulai Tes Diagnostik
          </Link>
        </div>
      </section>
    )
  }

  const total = featured.total || 5
  const score = Number(featured.score) || 0
  const level = resolveLevel(featured.level, score, total)
  const color = LEVEL_COLORS[level]
  const featuredSubject = isValidSubject(featured.subject)
    ? featured.subject
    : subjectOf(featured)

  return (
    <section className="summary">
      <header className="summary__header">
        <span className="summary__badge">Ringkasan Hasil</span>
        <p className="summary__subtitle">Hasil Tes Diagnostik terakhirmu.</p>
      </header>

      <div className="summary__card">
        <ProgressRing score={score} total={total} color={color} />

        <p className="summary__name">{featured.name || 'Tanpa Nama'}</p>

        <p className="summary__meta">
          Mata Pelajaran: <strong>{subjectName(featuredSubject)}</strong>
        </p>

        <span
          className={`summary__level summary__level--${level.toLowerCase()}`}
        >
          {level}
        </span>

        <p className="summary__score">
          Skor {score} dari {total}
        </p>

        <p className="summary__meta">
          Waktu Tes: <strong>{formatDate(featured.createdAt ?? featured.timestamp)}</strong>
        </p>

        <button
          type="button"
          className="btn btn--primary"
          onClick={() =>
            navigate('/tes-diagnostik', {
              state: { practiceLevel: level, subject: featuredSubject },
            })
          }
        >
          Mulai Latihan Selanjutnya
        </button>
      </div>

      {groups.length > 0 && (
        <div className="summary__history">
          <h2 className="summary__history-title">Riwayat per Mata Pelajaran</h2>

          {groups.map((group) => (
            <div className="summary__group" key={group.id}>
              <span
                className={`summary__subject summary__subject--${group.color}`}
              >
                {group.name}
              </span>
              <ul className="summary__list">
                {group.rows.map((row) => {
                  const rowTotal = row.total || 5
                  const rowScore = Number(row.score) || 0
                  const rowLevel = resolveLevel(row.level, rowScore, rowTotal)
                  return (
                    <li className="summary__item" key={row.id}>
                      <span
                        className={`summary__level summary__level--${rowLevel.toLowerCase()}`}
                      >
                        {rowLevel}
                      </span>
                      <span className="summary__item-score">
                        Skor {rowScore}/{rowTotal}
                      </span>
                      <span className="summary__item-time">
                        {formatDate(row.createdAt ?? row.timestamp)}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

export default StudentSummary
