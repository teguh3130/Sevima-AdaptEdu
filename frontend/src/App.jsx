import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useSearchParams,
} from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import Navbar from './components/Navbar.jsx'
import LoadingScreen from './components/LoadingScreen.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import RoleProtectedRoute from './components/RoleProtectedRoute.jsx'
import Login from './pages/Login.jsx'
import StudentHome from './pages/StudentHome.jsx'
import Home from './pages/Home.jsx'
import DiagnosticTest from './pages/DiagnosticTest.jsx'
import SelectSubject from './pages/SelectSubject.jsx'
import AiTutor from './pages/AiTutor.jsx'
import TeacherDashboard from './pages/TeacherDashboard.jsx'
import StudentSummary from './pages/StudentSummary.jsx'
import NotFound from './pages/NotFound.jsx'
import { isValidSubject } from './data/subjects.js'
import './App.css'

const AUTH_PATHS = ['/login', '/register']

function RootRedirect() {
  const { user, loading } = useAuth()

  if (loading) return <LoadingScreen />

  if (!user) return <Navigate to="/login" replace />

  return (
    <Navigate to={user.role === 'teacher' ? '/teacher' : '/student'} replace />
  )
}

function DiagnosticEntry() {
  const [params] = useSearchParams()
  const subject = params.get('subject')

  if (!isValidSubject(subject)) {
    return <Navigate to="/diagnostic/select-subject" replace />
  }

  return <DiagnosticTest key={subject} />
}

function App() {
  const { loading, user } = useAuth()
  const location = useLocation()
  const isAuthPage = AUTH_PATHS.includes(location.pathname)

  if (loading) {
    return (
      <div className="app app--loading">
        <LoadingScreen />
      </div>
    )
  }

  if (isAuthPage) {
    return (
      <div className="auth-shell">
        <Routes>
          <Route path="/login" element={<Login initialMode="login" />} />
          <Route path="/register" element={<Login initialMode="register" />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    )
  }

  return (
    <div className="app">
      {user && <Navbar />}
      <main className="main">
        <Routes>
          <Route path="/" element={<RootRedirect />} />

          <Route element={<RoleProtectedRoute role="student" />}>
            <Route path="/student" element={<StudentHome />} />
            <Route path="/beranda" element={<Home />} />
            <Route path="/tes-diagnostik" element={<DiagnosticTest />} />
            <Route
              path="/diagnostic/select-subject"
              element={<SelectSubject />}
            />
            <Route path="/diagnostic" element={<DiagnosticEntry />} />
            <Route path="/ai-tutor" element={<AiTutor />} />
            <Route path="/ringkasan" element={<StudentSummary />} />
            <Route path="/summary" element={<StudentSummary />} />
          </Route>

          <Route element={<RoleProtectedRoute role="teacher" />}>
            <Route path="/teacher" element={<TeacherDashboard />} />
            <Route path="/dashboard-guru" element={<TeacherDashboard />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </main>
      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} AdaptEdu</p>
      </footer>
    </div>
  )
}

export default App
