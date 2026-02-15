import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Mail, ArrowLeft, CheckCircle, AlertCircle, Loader } from 'lucide-react';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [state, setState] = useState({
    loading: false,
    success: false,
    error: '',
    message: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setState(prev => ({
        ...prev,
        error: 'Please enter your email address',
        success: false
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
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005/api'}/auth/forgot-password`, {
        email: email.trim()
      });

      if (response.data.success) {
        setState(prev => ({
          ...prev,
          loading: false,
          success: true,
          message: response.data.message,
          error: ''
        }));
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      
      const errorMessage = error.response?.data?.message || 'Failed to send reset email. Please try again.';
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        success: false
      }));
    }
  };

  const handleResend = () => {
    setState(prev => ({
      ...prev,
      success: false,
      error: '',
      message: ''
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mb-4">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password?</h1>
          <p className="text-gray-600">
            No worries! Enter your email and we'll send you a reset link.
          </p>
        </div>

        {/* Success State */}
        {state.success ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Reset Link Sent!
            </h3>
            
            <p className="text-gray-600 mb-6">
              {state.message}
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Check your email:</p>
                  <ul className="space-y-1 text-blue-700">
                    <li>• Look for an email from COMSATS Internship Portal</li>
                    <li>• Check your spam/junk folder if you don't see it</li>
                    <li>• The reset link expires in 1 hour</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleResend}
                className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Send Another Reset Link
              </button>
              
              <Link
                to="/login"
                className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium inline-block text-center"
              >
                Back to Login
              </Link>
            </div>
          </div>
        ) : (
          /* Form State */
          <div className="bg-white rounded-lg shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                    placeholder="Enter your email address"
                    required
                  />
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
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
                    Sending Reset Link...
                  </>
                ) : (
                  <>
                    <Mail className="w-5 h-5 mr-2" />
                    Send Reset Link
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
                  Don't have an account?{' '}
                  <Link to="/register" className="text-red-600 hover:text-red-700 font-medium">
                    Sign up here
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

export default ForgotPasswordPage;