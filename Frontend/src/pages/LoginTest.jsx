import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginTest = () => {
  const [email, setEmail] = useState('admin@comsats.edu.pk');
  const [password, setPassword] = useState('Admin@123');
  const [result, setResult] = useState(null);
  const { login, currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const loginResult = await login(email, password);
      setResult(loginResult);
      console.log('Login result:', loginResult);
      
      if (loginResult.success && loginResult.user.role === 'admin') {
        console.log('Admin login successful, navigating to admin dashboard');
        navigate('/admin/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      setResult({ success: false, error: error.message });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">Login Test</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <button
            onClick={handleLogin}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Test Login
          </button>
        </div>
        
        <div className="mt-6 p-4 bg-gray-100 rounded">
          <h3 className="font-semibold">Current Auth State:</h3>
          <p>Is Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
          <p>Current User: {currentUser ? JSON.stringify(currentUser, null, 2) : 'None'}</p>
        </div>
        
        {result && (
          <div className="mt-4 p-4 bg-blue-100 rounded">
            <h3 className="font-semibold">Login Result:</h3>
            <pre>{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}
        
        <div className="mt-6">
          <button
            onClick={() => navigate('/admin')}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mr-2"
          >
            Go to Admin
          </button>
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
          >
            Go to Admin Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginTest;