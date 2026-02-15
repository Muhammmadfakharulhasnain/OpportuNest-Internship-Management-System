import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Mail, RefreshCw, Loader, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const VerificationRequired = () => {
  const [resendState, setResendState] = useState({
    loading: false,
    message: '',
    email: '',
    type: '' // 'success' or 'error'
  });

  // Get email from URL params or local storage
  const urlParams = new URLSearchParams(window.location.search);
  const emailFromUrl = urlParams.get('email') || '';

  React.useEffect(() => {
    if (emailFromUrl) {
      setResendState(prev => ({ ...prev, email: emailFromUrl }));
    }
  }, [emailFromUrl]);

  const handleResendVerification = async () => {
    if (!resendState.email.trim()) {
      setResendState(prev => ({
        ...prev,
        message: 'Please enter your email address',
        type: 'error'
      }));
      return;
    }

    try {
      setResendState(prev => ({ ...prev, loading: true, message: '', type: '' }));
      
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005/api'}/auth/resend-verification`, {
        email: resendState.email.trim()
      });
      
      if (response.data.success) {
        setResendState(prev => ({
          ...prev,
          loading: false,
          message: 'Verification email sent successfully! Please check your inbox and spam folder.',
          type: 'success'
        }));
      }
    } catch (error) {
      console.error('Resend verification error:', error);
      
      const errorMessage = error.response?.data?.message || 'Failed to resend verification email. Please try again.';
      
      setResendState(prev => ({
        ...prev,
        loading: false,
        message: errorMessage,
        type: 'error'
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-xl shadow-lg p-8">
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
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Mail className="w-16 h-16 text-blue-600" />
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                <Clock className="w-3 h-3 text-white" />
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Email Verification Required
          </h2>
          
          <p className="text-gray-600 mb-6">
            We've sent a verification email to your registered email address. 
            Please check your inbox and click the verification link to activate your account.
          </p>

          {/* Important Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800 text-left">
                <p className="font-semibold mb-2">Important:</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Check your spam/junk folder if you don&apos;t see the email</li>
                  <li>The verification link expires in 24 hours</li>
                  <li>You must verify your email before logging in</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Resend Verification Section */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center justify-center">
              <RefreshCw className="w-5 h-5 mr-2" />
              Didn&apos;t receive the email?
            </h3>
            
            <div className="space-y-4">
              <input
                type="email"
                placeholder="Enter your email address"
                value={resendState.email}
                onChange={(e) => setResendState(prev => ({ ...prev, email: e.target.value, message: '', type: '' }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={resendState.loading}
              />
              
              <button
                onClick={handleResendVerification}
                disabled={resendState.loading || !resendState.email.trim()}
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
                <div className={`flex items-center justify-center p-3 rounded-lg ${
                  resendState.type === 'success' 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-red-50 border border-red-200'
                }`}>
                  {resendState.type === 'success' ? (
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 mr-2 text-red-600" />
                  )}
                  <p className={`text-sm ${
                    resendState.type === 'success' ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {resendState.message}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link
              to="/login"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors mr-4"
            >
              Back to Login
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
            >
              Register Again
            </Link>
          </div>
        </div>

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

export default VerificationRequired;