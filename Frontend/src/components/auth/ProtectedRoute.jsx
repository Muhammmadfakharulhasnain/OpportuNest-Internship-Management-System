import { Navigate, Outlet } from 'react-router-dom'
import PropTypes from 'prop-types'
import { useAuth } from '../../context/AuthContext.jsx'
import LoadingSpinner from '../common/LoadingSpinner.jsx'

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, loading, currentUser } = useAuth()

  console.log('ProtectedRoute - loading:', loading, 'isAuthenticated:', isAuthenticated, 'currentUser:', currentUser, 'requiredRole:', requiredRole)

  if (loading) {
    console.log('ProtectedRoute - Still loading, showing spinner')
    return <LoadingSpinner fullScreen />
  }
  
  if (!isAuthenticated) {
    console.log('ProtectedRoute - Not authenticated, redirecting to login')
    return <Navigate to="/login" replace />
  }

  // Check if user has required role
  if (requiredRole && currentUser?.role !== requiredRole) {
    console.log(`ProtectedRoute - User role ${currentUser?.role} does not match required role ${requiredRole}`)
    return <Navigate to="/login" replace />
  }

  console.log('ProtectedRoute - Authenticated and authorized, rendering content')
  return children || <Outlet />
}

ProtectedRoute.propTypes = {
  children: PropTypes.node,
  requiredRole: PropTypes.string
}

export default ProtectedRoute