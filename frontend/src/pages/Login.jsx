import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import ThemeToggle from '../components/ThemeToggle.jsx'
import './Login.css'

function homeFor(role) {
  return role === 'teacher' ? '/teacher' : '/student'
}

function friendlyError(error) {
  const code = error?.code ?? ''
  const messages = {
    'auth/invalid-credential': 'Email atau password salah.',
    'auth/user-not-found': 'Email belum terdaftar.',
    'auth/wrong-password': 'Password salah.',
    'auth/email-already-in-use': 'Email sudah terdaftar.',
    'auth/invalid-email': 'Format email tidak valid.',
    'auth/weak-password': 'Password minimal 6 karakter.',
    'auth/too-many-requests':
      'Terlalu banyak percobaan. Coba lagi beberapa saat lagi.',
    'auth/network-request-failed': 'Gagal terhubung ke server.',
    'auth/operation-not-allowed':
      'Metode Email/Password belum diaktifkan. Aktifkan di Firebase Console → Authentication → Sign-in method.',
  }
  return messages[code] || error?.message || 'Terjadi kesalahan. Coba lagi.'
}

function Login({ initialMode = 'login' }) {
  const { user, loading, login, register } = useAuth()
  const navigate = useNavigate()

  const mode = initialMode
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('student')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!loading && user) navigate(homeFor(user.role), { replace: true })
  }, [user, loading, navigate])

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      const finalRole =
        mode === 'login'
          ? await login(email.trim(), password)
          : await register(email.trim(), password, role)
      navigate(homeFor(finalRole), { replace: true })
    } catch (err) {
      console.error('Autentikasi gagal:', err)
      setError(friendlyError(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="login">
      <ThemeToggle className="login__theme" />
      <div className="login__panel">
        <div className="login__card glass glass--glow">
          <span className="badge">AdaptEdu</span>
          <h1 className="login__title">
            {mode === 'login' ? 'Masuk ke akunmu' : 'Buat akun baru'}
          </h1>
          <p className="login__subtitle">
            {mode === 'login'
              ? 'Gunakan email untuk melanjutkan.'
              : 'Daftar sebagai siswa atau guru.'}
          </p>

        <div className="login__tabs" role="tablist">
          <button
            type="button"
            className={`login__tab ${mode === 'login' ? 'login__tab--active' : ''}`}
            onClick={() => {
              setError('')
              navigate('/login')
            }}
          >
            Masuk
          </button>
          <button
            type="button"
            className={`login__tab ${mode === 'register' ? 'login__tab--active' : ''}`}
            onClick={() => {
              setError('')
              navigate('/register')
            }}
          >
            Daftar
          </button>
        </div>

        <form className="login__form" onSubmit={handleSubmit}>
          <label className="login__field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="nama@email.com"
              required
              autoComplete="email"
            />
          </label>

          <label className="login__field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Minimal 6 karakter"
              required
              minLength={6}
              autoComplete={
                mode === 'login' ? 'current-password' : 'new-password'
              }
            />
          </label>

          {mode === 'register' && (
            <div className="login__field">
              <span>Saya masuk sebagai</span>
              <div className="login__roles">
                <button
                  type="button"
                  className={`login__role ${role === 'student' ? 'login__role--active' : ''}`}
                  onClick={() => setRole('student')}
                >
                  Siswa
                </button>
                <button
                  type="button"
                  className={`login__role ${role === 'teacher' ? 'login__role--active' : ''}`}
                  onClick={() => setRole('teacher')}
                >
                  Guru
                </button>
              </div>
            </div>
          )}

          {error && <p className="login__error">{error}</p>}

          <button
            type="submit"
            className="btn btn--primary login__submit"
            disabled={busy}
          >
            {busy
              ? 'Memproses...'
              : mode === 'login'
                ? 'Masuk'
                : 'Daftar & Masuk'}
          </button>
        </form>
        </div>

        <aside className="login__aside" aria-hidden="true">
          <div className="login__art">
            <svg viewBox="0 0 200 200" className="login__art-orb">
              <defs>
                <linearGradient id="orbGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#6D5EF8" />
                  <stop offset="100%" stopColor="#A78BFA" />
                </linearGradient>
              </defs>
              <circle cx="100" cy="100" r="86" fill="url(#orbGrad)" opacity="0.25" />
              <circle cx="100" cy="100" r="62" fill="url(#orbGrad)" opacity="0.55" />
              <path
                d="M70 96l20 20 40-44"
                fill="none"
                stroke="#fff"
                strokeWidth="10"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <h2 className="login__art-title">Belajar smarter, bukan harder.</h2>
            <p className="login__art-text">
              Diagnostik otomatis, AI Tutor sesuai mata pelajaran, dan progres
              belajar yang terpantau guru.
            </p>
            <ul className="login__art-points">
              <li>Tes Diagnostik 4 mata pelajaran</li>
              <li>AI Tutor fokus mapel</li>
              <li>Dashboard guru real-time</li>
            </ul>
          </div>
        </aside>
      </div>
    </section>
  )
}

export default Login
