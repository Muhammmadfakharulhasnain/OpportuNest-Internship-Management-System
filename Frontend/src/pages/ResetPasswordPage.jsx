import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Shield, Eye, EyeOff, CheckCircle, AlertCircle, Loader, ArrowLeft } from 'lucide-react';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  const [state, setState] = useState({
    loading: false,
    success: false,
    error: '',
    message: '',
    showPassword: false,
    showConfirmPassword: false,
    tokenValid: null
  });

  // Validate token on component mount
  useEffect(() => {
    if (!token) {
      setState(prev => ({
        ...prev,
        error: 'Invalid reset link. Token is missing.',
        tokenValid: false
      }));
    } else {
      setState(prev => ({
        ...prev,
        tokenValid: true
      }));
    }
  }, [token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear errors when user starts typing
    if (state.error) {
      setState(prev => ({
        ...prev,
        error: ''
      }));
    }
  };

  const validatePasswords = () => {
    if (!formData.newPassword || !formData.confirmPassword) {
      return 'Please fill in both password fields';
    }

    if (formData.newPassword.length < 8) {
      return 'Password must be at least 8 characters long';
    }

    if (formData.newPassword !== formData.confirmPassword) {
      return 'Passwords do not match';
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validatePasswords();
    if (validationError) {
      setState(prev => ({
        ...prev,
        error: validationError
      }));
      return;
    }

    setState(prev => ({
      ...prev,
      loading: true,
      error: '',
      success: false
    }));

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005/api'}/auth/reset-password`, {
        token,
        newPassword: formData.newPassword
      });

      if (response.data.success) {
        setState(prev => ({
          ...prev,
          loading: false,
          success: true,
          message: response.data.message,
          error: ''
        }));

        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login', {
            state: {
              message: 'Password reset successful! Please log in with your new password.',
              type: 'success'
            }
          });
        }, 3000);
      }
    } catch (error) {
      console.error('Reset password error:', error);

      const errorMessage = error.response?.data?.message || 'Failed to reset password. Please try again.';

      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        success: false
      }));
    }
  };

  const togglePasswordVisibility = (field) => {
    setState(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // If no token, show error
  if (state.tokenValid === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Invalid Reset Link
            </h3>

            <p className="text-gray-600 mb-6">
              This password reset link is invalid or has expired. Please request a new one.
            </p>

            <div className="space-y-3">
              <Link
                to="/forgot-password"
                className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium inline-block text-center"
              >
                Request New Reset Link
              </Link>

              <Link
                to="/login"
                className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium inline-block text-center"
              >
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h1>
          <p className="text-gray-600">
            Enter your new password below
          </p>
        </div>

        {/* Success State */}
        {state.success ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Password Reset Successful!
            </h3>

            <p className="text-gray-600 mb-6">
              {state.message}
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center">
                <Loader className="w-5 h-5 text-blue-600 mr-3 animate-spin" />
                <span className="text-blue-800 font-medium">
                  Redirecting to login page...
                </span>
              </div>
            </div>

            <Link
              to="/login"
              className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium inline-block text-center"
            >
              Go to Login Now
            </Link>
          </div>
        ) : (
          /* Form State */
          <div className="bg-white rounded-lg shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* New Password Input */}
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="newPassword"
                    name="newPassword"
                    type={state.showPassword ? 'text' : 'password'}
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                    placeholder="Enter new password (min 8 characters)"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('showPassword')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {state.showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password Input */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={state.showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                    placeholder="Confirm your new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('showConfirmPassword')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {state.showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Password Requirements */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Password Requirements:</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li className={`flex items-center ${formData.newPassword.length >= 8 ? 'text-green-600' : ''}`}>
                    <span className="mr-2">{formData.newPassword.length >= 8 ? '✓' : '•'}</span>
                    At least 8 characters long
                  </li>
                  <li className={`flex items-center ${formData.newPassword && formData.confirmPassword && formData.newPassword === formData.confirmPassword ? 'text-green-600' : ''}`}>
                    <span className="mr-2">{formData.newPassword && formData.confirmPassword && formData.newPassword === formData.confirmPassword ? '✓' : '•'}</span>
                    Passwords match
                  </li>
                </ul>
              </div>

              {/* Error Message */}
              {state.error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
                    <span className="text-red-800 font-medium">{state.error}</span>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={state.loading}
                className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center"
              >
                {state.loading ? (
                  <>
                    <Loader className="w-5 h-5 mr-2 animate-spin" />
                    Resetting Password...
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5 mr-2" />
                    Reset Password
                  </>
                )}
              </button>
            </form>

            {/* Footer Links */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex flex-col space-y-3 text-center">
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-gray-900 transition-colors flex items-center justify-center"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Login
                </Link>

                <div className="text-sm text-gray-500">
                  Remember your password?{' '}
                  <Link to="/login" className="text-red-600 hover:text-red-700 font-medium">
                    Sign in here
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Help Text */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Need help? Contact our{' '}
            <a href="#" className="text-red-600 hover:text-red-700 font-medium">
              support team
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;