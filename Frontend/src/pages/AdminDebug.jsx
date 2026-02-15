import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';

const AdminDebug = () => {
  const { currentUser, isAuthenticated, userRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Debug Page</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
          <div className="space-y-2">
            <p><strong>Is Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
            <p><strong>User Role:</strong> {userRole || 'None'}</p>
            <p><strong>Current Path:</strong> {location.pathname}</p>
            <p><strong>User Data:</strong></p>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(currentUser, null, 2)}
            </pre>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Navigation Test</h2>
          <div className="space-y-4">
            <button
              onClick={() => navigate('/dashboard/admin')}
              className="bg-blue-500 text-white px-4 py-2 rounded mr-4"
            >
              Go to /dashboard/admin
            </button>
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="bg-green-500 text-white px-4 py-2 rounded mr-4"
            >
              Go to /admin/dashboard
            </button>
            <button
              onClick={() => navigate('/login')}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              Go to Login
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Local Storage Debug</h2>
          <div className="space-y-2">
            <p><strong>Token:</strong> {localStorage.getItem('token')}</p>
            <p><strong>User Data in Storage:</strong></p>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {localStorage.getItem('user')}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDebug;