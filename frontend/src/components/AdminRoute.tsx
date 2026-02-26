import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/auth-context'

const AdminRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return null
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default AdminRoute
