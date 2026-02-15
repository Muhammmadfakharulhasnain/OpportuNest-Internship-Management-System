import { useAuth } from '../../context/AuthContext';

const AdminTest = () => {
  const { currentUser, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Test Page</h1>
        
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-xl font-semibold">Authentication Status</h2>
          <p><strong>Is Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
          <p><strong>Current User:</strong> {currentUser ? JSON.stringify(currentUser, null, 2) : 'None'}</p>
          <p><strong>User Role:</strong> {currentUser?.role || 'None'}</p>
          
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Admin Dashboard Links</h2>
            <div className="space-y-2">
              <a href="/admin" className="block text-blue-600 hover:text-blue-800">/admin</a>
              <a href="/admin/dashboard" className="block text-blue-600 hover:text-blue-800">/admin/dashboard</a>
              <a href="/admin/users" className="block text-blue-600 hover:text-blue-800">/admin/users</a>
              <a href="/admin/companies" className="block text-blue-600 hover:text-blue-800">/admin/companies</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTest;