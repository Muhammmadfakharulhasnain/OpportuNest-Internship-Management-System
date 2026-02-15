import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FiMail, FiCheckCircle, FiAlertCircle, FiRefreshCw, FiArrowLeft } from 'react-icons/fi';
import { Mail, Clock, Shield } from 'lucide-react';
import { toast } from 'react-toastify';
import { authAPI } from '../services/api';
import comsatsLogo from '../assets/download.png';

const EmailVerificationPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get('email') || '';
  
  const [isLoading, setIsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [verificationStatus, setVerificationStatus] = useState('pending'); // pending, success, error
  const [message, setMessage] = useState('');

  // Cooldown timer for resend button
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleResendEmail = async () => {
    if (!email) {
      toast.error('Email address not found');
      return;
    }

    setResendLoading(true);
    try {
      const response = await authAPI.resendVerificationEmail(email);
      if (response.success) {
        toast.success('Verification email sent successfully!');
        setMessage('We\'ve sent a new verification email to your inbox.');
        setResendCooldown(60); // 60 second cooldown
      } else {
        toast.error(response.error || 'Failed to resend verification email');
        setMessage(response.error || 'Failed to resend verification email');
      }
    } catch (error) {
      toast.error(error.message || 'An error occurred');
      setMessage(error.message || 'An error occurred while resending the email');
    } finally {
      setResendLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  const handleRegisterAgain = () => {
    navigate('/register');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-800 via-blue-600 to-indigo-700 relative overflow-hidden">
      {/* Header Navigation */}
      <nav className="fixed w-full z-50 bg-white/10 backdrop-blur-md shadow-lg py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Link 
                to="/" 
                className="text-white font-bold text-lg hover:text-blue-200 transition-colors duration-300 flex items-center space-x-2"
              >
                <FiArrowLeft className="w-5 h-5" />
                <span>Back to Home</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-white/60 font-medium">Already verified?</span>
              <Link 
                to="/login" 
                className="bg-white text-blue-600 px-4 py-2 rounded-lg font-bold hover:bg-blue-50 transition-all duration-300 shadow-lg"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Advanced Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-r from-white/20 to-blue-300/30 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-gradient-to-r from-blue-300/20 to-white/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 right-1/4 w-40 h-40 bg-white/10 rounded-full blur-2xl animate-bounce delay-2000"></div>
        
        <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-white/40 rounded-full animate-ping delay-500"></div>
        <div className="absolute top-3/4 right-1/3 w-2 h-2 bg-blue-200/60 rounded-full animate-ping delay-1500"></div>
        
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-white/20 to-transparent animate-pulse delay-1000"></div>
        <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-blue-200/20 to-transparent animate-pulse delay-2000"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md mx-auto flex flex-col justify-center min-h-screen pt-24 px-4">
        {/* Header Section with COMSATS Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-white rounded-xl p-4 shadow-2xl border-4 border-white/20">
              <img 
                src={comsatsLogo} 
                alt="COMSATS University Logo" 
                className="h-20 w-auto object-contain"
              />
            </div>
          </div>
          <h1 className="text-4xl font-black text-white mb-3 tracking-tight drop-shadow-lg">
            COMSATS UNIVERSITY
          </h1>
          <p className="text-white/90 font-bold text-lg mb-2">Internship Portal</p>
          <p className="text-white/80 font-semibold">Email Verification Required</p>
        </div>

        {/* Main Verification Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border-4 border-blue-100 space-y-6">
          
          {/* Verification Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-50 rounded-full flex items-center justify-center shadow-lg border-4 border-blue-200">
                <Mail className="w-10 h-10 text-blue-600 animate-bounce" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                <Clock className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>

          {/* Main Message */}
          <div className="text-center space-y-3">
            <h2 className="text-2xl font-black text-gray-900">
              Verify Your Email Address
            </h2>
            <p className="text-gray-700 font-semibold leading-relaxed">
              We've sent a verification email to your registered email address. Please check your inbox and click the verification link to activate your account.
            </p>
          </div>

          {/* Email Display */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border-2 border-blue-200 flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <FiMail className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-600 font-bold">Verification sent to:</p>
              <p className="text-sm font-black text-gray-900 truncate">{email || 'your email address'}</p>
            </div>
          </div>

          {/* Important Information */}
          <div className="bg-amber-50 rounded-xl p-4 border-2 border-amber-200 space-y-3">
            <div className="flex items-start space-x-3">
              <FiAlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-black text-amber-900">Important:</p>
                <ul className="text-xs text-amber-800 font-semibold space-y-1 mt-1">
                  <li>✓ Check your spam/junk folder if you don't see the email</li>
                  <li>✓ The verification link expires in 24 hours</li>
                  <li>✓ You must verify your email before logging in</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Status Message */}
          {message && (
            <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200 flex items-start space-x-3">
              <FiCheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-semibold text-green-800">{message}</p>
            </div>
          )}

          {/* Resend Email Section */}
          <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200 space-y-3">
            <p className="text-sm font-bold text-gray-900">Didn't receive the email?</p>
            <button
              onClick={handleResendEmail}
              disabled={resendLoading || resendCooldown > 0}
              className={`w-full py-3 px-4 rounded-lg font-black text-sm transition-all duration-300 flex items-center justify-center space-x-2 ${
                resendCooldown > 0
                  ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              {resendLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Sending...</span>
                </>
              ) : resendCooldown > 0 ? (
                <>
                  <Clock className="w-4 h-4" />
                  <span>Resend in {resendCooldown}s</span>
                </>
              ) : (
                <>
                  <FiRefreshCw className="w-4 h-4" />
                  <span>Resend Verification Email</span>
                </>
              )}
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center space-x-3">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-xs text-gray-500 font-bold">OR</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleBackToLogin}
              className="w-full py-3 px-4 rounded-lg font-black text-sm bg-white border-2 border-gray-300 text-gray-900 hover:bg-gray-50 hover:border-blue-600 transition-all duration-300 flex items-center justify-center space-x-2 shadow-sm hover:shadow-md"
            >
              <FiArrowLeft className="w-4 h-4" />
              <span>Back to Login</span>
            </button>
            
            <button
              onClick={handleRegisterAgain}
              className="w-full py-3 px-4 rounded-lg font-black text-sm bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:from-indigo-700 hover:to-indigo-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Register with Different Email
            </button>
          </div>

          {/* Help Section */}
          <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200 text-center">
            <p className="text-xs text-gray-600 font-semibold mb-2">Need help?</p>
            <a 
              href="mailto:support@comsats.edu.pk"
              className="text-blue-600 hover:text-blue-800 font-black text-sm transition-colors duration-200"
            >
              Contact support@comsats.edu.pk
            </a>
          </div>
        </div>

        {/* Security Badge */}
        <div className="mt-6 flex items-center justify-center space-x-2 text-white/80">
          <Shield className="w-4 h-4" />
          <span className="text-xs font-bold">Your email is secure and will never be shared</span>
        </div>

        {/* Copyright - Minimal Footer */}
        <div className="mt-8 text-center">
          <p className="text-white/90 text-sm font-bold">
            © {new Date().getFullYear()} COMSATS University Islamabad, Wah Campus
          </p>
          <p className="text-white/70 text-xs font-semibold mt-1">
            All Rights Reserved
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPage;