import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    // If user is already authenticated and is admin, redirect to dashboard
    if (currentUser && currentUser.role === 'admin') {
      navigate('/admin/dashboard');
    } else {
      // Redirect to main login page with return path
      navigate('/login?redirect=/admin/dashboard');
    }
  }, [currentUser, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Redirecting to Admin Login...
          </h2>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;