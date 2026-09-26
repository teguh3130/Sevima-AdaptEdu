import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
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
      <div className="login__card">
        <span className="login__badge">AdaptEdu</span>
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
    </section>
  )
}

export default Login
