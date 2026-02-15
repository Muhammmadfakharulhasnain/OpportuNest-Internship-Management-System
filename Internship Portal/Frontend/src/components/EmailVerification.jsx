import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, XCircle, Loader, RefreshCw, Mail } from 'lucide-react';

const EmailVerification = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [verificationState, setVerificationState] = useState({
    status: 'verifying', // 'verifying', 'success', 'error'
    message: '',
    userData: null
  });
  
  const [resendState, setResendState] = useState({
    loading: false,
    message: '',
    email: ''
  });

  const verifyEmailToken = useCallback(async () => {
    try {
      console.log('🔄 Starting email verification for token:', token?.substring(0, 10) + '...');
      
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005/api'}/auth/verify-email/${token}`);
      
      if (response.data.success) {
        console.log('✅ Email verification successful');
        setVerificationState({
          status: 'success',
          message: response.data.message,
          userData: response.data.user
        });
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              message: 'Email verified successfully! You can now log in.',
              type: 'success'
            }
          });
        }, 3000);
      }
    } catch (error) {
      console.error('Email verification error:', error);
      
      const errorMessage = error.response?.data?.message || 'Failed to verify email. Please try again.';
      
      setVerificationState({
        status: 'error',
        message: errorMessage,
        userData: null
      });
    }
  }, [token, navigate]);

  useEffect(() => {
    if (token) {
      verifyEmailToken();
    } else {
      setVerificationState({
        status: 'error',
        message: 'Invalid verification link. Token is missing.',
        userData: null
      });
    }
  }, [token, verifyEmailToken]);

  const handleResendVerification = async () => {
    if (!resendState.email.trim()) {
      alert('Please enter your email address');
      return;
    }

    try {
      setResendState(prev => ({ ...prev, loading: true, message: '' }));
      
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005/api'}/auth/resend-verification`, {
        email: resendState.email.trim()
      });
      
      if (response.data.success) {
        setResendState(prev => ({
          ...prev,
          loading: false,
          message: 'Verification email sent successfully! Please check your inbox.'
        }));
      }
    } catch (error) {
      console.error('Resend verification error:', error);
      
      const errorMessage = error.response?.data?.message || 'Failed to resend verification email.';
      
      setResendState(prev => ({
        ...prev,
        loading: false,
        message: errorMessage
      }));
    }
  };

  const renderVerificationContent = () => {
    switch (verificationState.status) {
      case 'verifying':
        return (
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <Loader className="w-16 h-16 text-blue-600 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Verifying Your Email
            </h2>
            <p className="text-gray-600 mb-4">
              Please wait while we verify your email address...
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Email Verified Successfully! 🎉
            </h2>
            <p className="text-gray-600 mb-6">
              {verificationState.message}
            </p>
            
            {verificationState.userData && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-green-800 mb-2">Welcome to COMSATS Internship Portal!</h3>
                <div className="text-sm text-green-700">
                  <p><strong>Name:</strong> {verificationState.userData.name}</p>
                  <p><strong>Email:</strong> {verificationState.userData.email}</p>
                  <p><strong>Role:</strong> {verificationState.userData.role}</p>
                </div>
              </div>
            )}
            
            <div className="space-y-3">
              <p className="text-sm text-gray-500">
                Redirecting to login page in 3 seconds...
              </p>
              <Link
                to="/login"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Continue to Login
              </Link>
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <XCircle className="w-16 h-16 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Verification Failed
            </h2>
            <p className="text-red-600 mb-6">
              {verificationState.message}
            </p>
            
            {/* Resend Verification Section */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center justify-center">
                <Mail className="w-5 h-5 mr-2" />
                Resend Verification Email
              </h3>
              
              <div className="space-y-4">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={resendState.email}
                  onChange={(e) => setResendState(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={resendState.loading}
                />
                
                <button
                  onClick={handleResendVerification}
                  disabled={resendState.loading}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {resendState.loading ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Resend Verification Email
                    </>
                  )}
                </button>
                
                {resendState.message && (
                  <p className={`text-sm ${resendState.message.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>
                    {resendState.message}
                  </p>
                )}
              </div>
            </div>
            
            <div className="space-y-3">
              <Link
                to="/register"
                className="inline-flex items-center px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors mr-4"
              >
                Back to Registration
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go to Login
              </Link>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 mr-3 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">COMSATS</h1>
              <p className="text-sm text-gray-500">Internship Portal</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {renderVerificationContent()}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            Need help? Contact{' '}
            <a href="mailto:support@comsats.edu.pk" className="text-blue-600 hover:underline">
              support@comsats.edu.pk
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;