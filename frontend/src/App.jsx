import { Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Home from './pages/Home.jsx'
import DiagnosticTest from './pages/DiagnosticTest.jsx'
import AiTutor from './pages/AiTutor.jsx'
import TeacherDashboard from './pages/TeacherDashboard.jsx'
import StudentSummary from './pages/StudentSummary.jsx'
import NotFound from './pages/NotFound.jsx'
import './App.css'

function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tes-diagnostik" element={<DiagnosticTest />} />
          <Route path="/ai-tutor" element={<AiTutor />} />
          <Route path="/dashboard-guru" element={<TeacherDashboard />} />
          <Route path="/ringkasan" element={<StudentSummary />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} AdaptEdu</p>
      </footer>
    </div>
  )
}

export default App
