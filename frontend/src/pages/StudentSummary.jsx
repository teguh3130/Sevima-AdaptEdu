import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore'
import { db } from '../lib/firebase.js'
import './StudentSummary.css'

const LEVELS = ['Dasar', 'Menengah', 'Lanjut']
const LEVEL_COLORS = {
  Dasar: '#ef4444',
  Menengah: '#eab308',
  Lanjut: '#22c55e',
}

function levelFromScore(score, total = 5) {
  const ratio = typeof score === 'number' ? score / total : 0
  if (ratio <= 0.4) return 'Dasar'
  if (ratio <= 0.8) return 'Menengah'
  return 'Lanjut'
}

function resolveLevel(level, score, total) {
  return LEVELS.includes(level) ? level : levelFromScore(score, total)
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
  const passedResult = location.state?.result ?? null

  const [result, setResult] = useState(passedResult)
  const [loading, setLoading] = useState(!passedResult)
  const [error, setError] = useState('')

  useEffect(() => {
    if (passedResult) return undefined
    let cancelled = false

    async function loadLatest() {
      try {
        const latest = query(
          collection(db, 'diagnosticScores'),
          orderBy('createdAt', 'desc'),
          limit(1),
        )
        const snapshot = await getDocs(latest)
        if (cancelled) return

        const doc = snapshot.docs[0]
        if (!doc) {
          setError('Belum ada hasil tes. Kerjakan tes diagnostik dulu.')
          return
        }
        setResult({ id: doc.id, ...doc.data() })
      } catch (err) {
        console.error('Gagal memuat ringkasan:', err)
        if (!cancelled) setError('Gagal memuat data Firestore.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadLatest()
    return () => {
      cancelled = true
    }
  }, [passedResult])

  if (loading) {
    return (
      <section className="summary">
        <p className="summary__status">Memuat ringkasan hasil...</p>
      </section>
    )
  }

  if (error || !result) {
    return (
      <section className="summary">
        <p className="summary__status summary__status--error">
          {error || 'Hasil tidak ditemukan.'}
        </p>
      </section>
    )
  }

  const total = result.total || 5
  const score = Number(result.score) || 0
  const level = resolveLevel(result.level, score, total)
  const color = LEVEL_COLORS[level]

  return (
    <section className="summary">
      <header className="summary__header">
        <span className="summary__badge">Ringkasan Hasil</span>
        <p className="summary__subtitle">Hasil Tes Diagnostik terakhirmu.</p>
      </header>

      <div className="summary__card">
        <ProgressRing score={score} total={total} color={color} />

        <p className="summary__name">{result.name || 'Tanpa Nama'}</p>

        <span className={`summary__level summary__level--${level.toLowerCase()}`}>
          {level}
        </span>

        <p className="summary__score">
          Skor {score} dari {total}
        </p>

        <button
          type="button"
          className="btn btn--primary"
          onClick={() => navigate('/tes-diagnostik', { state: { practiceLevel: level } })}
        >
          Mulai Latihan Selanjutnya
        </button>
      </div>
    </section>
  )
}

export default StudentSummary
