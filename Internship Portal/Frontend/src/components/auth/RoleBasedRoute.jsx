import { Navigate } from 'react-router-dom'
import PropTypes from 'prop-types'
import { useAuth } from '../../context/AuthContext.jsx'
import LoadingSpinner from '../common/LoadingSpinner.jsx'

const RoleBasedRoute = ({ role, element }) => {
  const { userRole, loading, isAuthenticated, currentUser } = useAuth()

  console.log('🎭 RoleBasedRoute - role required:', role, 'userRole:', userRole, 'loading:', loading, 'isAuthenticated:', isAuthenticated, 'currentUser:', currentUser)

  if (loading) {
    return <LoadingSpinner fullScreen />
  }

  if (!isAuthenticated) {
    console.log('🎭 RoleBasedRoute - Not authenticated, redirecting to login')
    return <Navigate to="/login" replace />
  }

  if (userRole !== role) {
    console.log('🎭 RoleBasedRoute - Role mismatch. Required:', role, 'User has:', userRole)
    // Redirect to appropriate dashboard based on user role
    if (userRole === 'student') {
      return <Navigate to="/dashboard/student" replace />
    } else if (userRole === 'company') {
      return <Navigate to="/dashboard/company" replace />
    } else if (userRole === 'supervisor') {
      return <Navigate to="/dashboard/supervisor" replace />
    } else {
      return <Navigate to="/" replace />
    }
  }
  console.log('🎭 RoleBasedRoute - Role matches, rendering element')
  return element
}

RoleBasedRoute.propTypes = {
  role: PropTypes.string.isRequired,
  element: PropTypes.element.isRequired
}

export default RoleBasedRoute;