import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import LoadingScreen from './LoadingScreen.jsx'

function RoleProtectedRoute({ role, children }) {
  const { user, loading } = useAuth()

  if (loading) return <LoadingScreen />

  if (!user) return <Navigate to="/login" replace />

  if (user.role !== role) {
    return (
      <Navigate
        to={user.role === 'teacher' ? '/teacher' : '/student'}
        replace
      />
    )
  }

  return children ?? <Outlet />
}

export default RoleProtectedRoute
