import { useEffect, useMemo, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../lib/firebase.js'
import './TeacherDashboard.css'

const FILTERS = ['Semua', 'Dasar', 'Menengah', 'Lanjut']
const LEVELS = ['Dasar', 'Menengah', 'Lanjut']

function levelFromScore(score, total = 5) {
  const ratio = typeof score === 'number' ? score / total : 0
  if (ratio <= 0.4) return 'Dasar'
  if (ratio <= 0.8) return 'Menengah'
  return 'Lanjut'
}

function resolveLevel(row) {
  return LEVELS.includes(row.level)
    ? row.level
    : levelFromScore(row.score, row.total || 5)
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

function TeacherDashboard() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('Semua')

  useEffect(() => {
    let cancelled = false

    async function loadScores() {
      setLoading(true)
      setError('')
      try {
        const snapshot = await getDocs(collection(db, 'diagnosticScores'))
        if (cancelled) return

        const data = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .sort(
            (a, b) =>
              (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0),
          )
        setRows(data)
      } catch (err) {
        console.error('Gagal memuat data Firestore:', err)
        if (!cancelled) {
          setError('Gagal memuat data. Periksa rules Firestore (allow read).')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadScores()
    return () => {
      cancelled = true
    }
  }, [])

  const stats = useMemo(() => {
    const total = rows.length
    const average = total
      ? rows.reduce((sum, row) => sum + (Number(row.score) || 0), 0) / total
      : 0
    const byLevel = { Dasar: 0, Menengah: 0, Lanjut: 0 }
    rows.forEach((row) => {
      byLevel[resolveLevel(row)] += 1
    })
    return { total, average, byLevel }
  }, [rows])

  const visibleRows =
    filter === 'Semua' ? rows : rows.filter((row) => resolveLevel(row) === filter)

  return (
    <section className="dashboard">
      <header className="dashboard__header">
        <span className="dashboard__badge">Dashboard Guru</span>
        <p className="dashboard__subtitle">
          Ringkasan hasil Tes Diagnostik dari Firestore.
        </p>
      </header>

      <div className="dashboard__filters" role="group" aria-label="Filter level">
        {FILTERS.map((item) => (
          <button
            key={item}
            type="button"
            className={`chip ${filter === item ? 'chip--active' : ''}`}
            onClick={() => setFilter(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="stats">
        <article className="stat">
          <p className="stat__label">Total Siswa</p>
          <p className="stat__value">{stats.total}</p>
        </article>

        <article className="stat">
          <p className="stat__label">Rata-rata Skor Diagnostik</p>
          <p className="stat__value">
            {stats.average.toFixed(1)}
            <span className="stat__suffix">/5</span>
          </p>
        </article>

        <article className="stat">
          <p className="stat__label">Siswa per Level</p>
          <ul className="stat__levels">
            {LEVELS.map((level) => (
              <li key={level} className={`level-pill level-pill--${level.toLowerCase()}`}>
                <span>{level}</span>
                <strong>{stats.byLevel[level]}</strong>
              </li>
            ))}
          </ul>
        </article>
      </div>

      <div className="table-wrap">
        {loading && <p className="dashboard__status">Memuat data Firestore...</p>}
        {error && <p className="dashboard__status dashboard__status--error">{error}</p>}

        {!loading && !error && (
          <table className="table">
            <thead>
              <tr>
                <th>Nama</th>
                <th>Skor</th>
                <th>Level</th>
                <th>Waktu Tes</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.length === 0 && (
                <tr>
                  <td colSpan="4" className="table__empty">
                    Belum ada data untuk filter "{filter}".
                  </td>
                </tr>
              )}
              {visibleRows.map((row) => (
                <tr key={row.id}>
                  <td data-label="Nama">{row.name || '-'}</td>
                  <td data-label="Skor">
                    {row.score ?? '-'} / {row.total || 5}
                  </td>
                  <td data-label="Level">
                    <span
                      className={`level-pill level-pill--${resolveLevel(row).toLowerCase()}`}
                    >
                      {resolveLevel(row)}
                    </span>
                  </td>
                  <td data-label="Waktu Tes">{formatDate(row.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  )
}

export default TeacherDashboard
