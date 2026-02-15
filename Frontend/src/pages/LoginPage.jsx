import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { FiMail, FiLock, FiLogIn, FiAlertCircle, FiCheckCircle, FiEye, FiEyeOff } from 'react-icons/fi'
import { ArrowRight } from 'lucide-react'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext.jsx'
import comsatsLogo from '../assets/download.png'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  
  // Get the redirect path from location state or default to homepage
  const from = location.state?.from?.pathname || '/'
  
  // Check for success/error messages from location state (e.g., from email verification)
  useEffect(() => {
    if (location.state?.message) {
      if (location.state.type === 'success') {
        setSuccessMessage(location.state.message)
        toast.success(location.state.message)
      } else {
        setError(location.state.message)
        toast.error(location.state.message)
      }
      
      // Clear the location state
      window.history.replaceState({}, document.title)
    }
  }, [location.state])
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessMessage('')
    setIsLoading(true)
    
    try {
      const result = await login(email, password)
      
      if (result.success) {
        toast.success('Login successful!')
        
        // Redirect based on user role
        if (result.user.role === 'student') {
          navigate('/dashboard/student')
        } else if (result.user.role === 'company') {
          navigate('/dashboard/company')
        } else if (result.user.role === 'admin') {
          navigate('/dashboard/admin')
        } else if (result.user.role === 'supervisor') {
          navigate('/dashboard/supervisor')
        } else {
          navigate(from)
        }
      } else {
        // Check if the error is related to email verification
        if (result.requiresVerification) {
          setError('Your email is not verified. Please check your inbox or resend the verification email.')
          // Redirect to verification page with user's email
          setTimeout(() => {
            navigate(`/verification-required?email=${encodeURIComponent(result.email || email)}`)
          }, 2000)
        } else {
          setError(result.error || 'Failed to login. Please try again.')
          toast.error(result.error || 'Login failed')
        }
      }
    } catch (err) {
      // Handle different types of errors
      if (err.response?.status === 403 && err.response?.data?.requiresVerification) {
        setError('Your email is not verified. Redirecting to verification page...')
        setTimeout(() => {
          navigate(`/verification-required?email=${encodeURIComponent(err.response.data.email || email)}`)
        }, 2000)
      } else {
        setError(err.message || 'An unexpected error occurred')
        toast.error(err.message || 'An unexpected error occurred')
      }
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-800 via-blue-600 to-indigo-700 relative overflow-hidden">
      {/* Header Navigation */}
      <nav className="fixed w-full z-50 bg-white/10 backdrop-blur-md shadow-lg py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Navigation Links - No Logo */}
            <div className="flex items-center space-x-6">
              <Link 
                to="/" 
                className="text-white font-bold text-lg hover:text-blue-200 transition-colors duration-300"
              >
                ← Back to Home
              </Link>
              <Link 
                to="/internships" 
                className="text-white/80 font-semibold hover:text-white transition-colors duration-300"
              >
                Internships
              </Link>
              <Link 
                to="/companies" 
                className="text-white/80 font-semibold hover:text-white transition-colors duration-300"
              >
                Companies
              </Link>
              <Link 
                to="/about" 
                className="text-white/80 font-semibold hover:text-white transition-colors duration-300"
              >
                About
              </Link>
            </div>

            {/* Right Side Links */}
            <div className="flex items-center space-x-4">
              <span className="text-white/60 font-medium">New here?</span>
              <Link 
                to="/register" 
                className="bg-white text-blue-600 px-4 py-2 rounded-lg font-bold hover:bg-blue-50 transition-all duration-300 shadow-lg"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Advanced Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Floating Orbs */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-r from-white/20 to-blue-300/30 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-gradient-to-r from-blue-300/20 to-white/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 right-1/4 w-40 h-40 bg-white/10 rounded-full blur-2xl animate-bounce delay-2000"></div>
        
        {/* Floating Particles */}
        <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-white/40 rounded-full animate-ping delay-500"></div>
        <div className="absolute top-3/4 right-1/3 w-2 h-2 bg-blue-200/60 rounded-full animate-ping delay-1500"></div>
        <div className="absolute top-1/2 left-1/6 w-4 h-4 bg-white/30 rounded-full animate-ping delay-3000"></div>
        
        {/* Moving Waves */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-0 w-full h-32 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-y-2 animate-pulse"></div>
          <div className="absolute bottom-1/4 right-0 w-full h-24 bg-gradient-to-l from-transparent via-blue-300/10 to-transparent transform skew-y-1 animate-pulse delay-2000"></div>
        </div>
        
        {/* Geometric Shapes */}
        <div className="absolute top-1/5 right-1/5 w-16 h-16 border-2 border-white/20 rotate-45 animate-spin" style={{animationDuration: '20s'}}></div>
        <div className="absolute bottom-1/5 left-1/5 w-12 h-12 border-2 border-blue-200/30 rotate-12 animate-spin" style={{animationDuration: '15s'}}></div>
        
        {/* Floating Icons */}
        <div className="absolute top-1/6 left-1/3 text-white/10 animate-bounce delay-1000" style={{animationDuration: '3s'}}>
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
          </svg>
        </div>
        
        <div className="absolute bottom-1/6 right-1/3 text-white/10 animate-bounce delay-2500" style={{animationDuration: '4s'}}>
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd"/>
            <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z"/>
          </svg>
        </div>
        
        {/* Glowing Lines */}
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-white/20 to-transparent animate-pulse delay-1000"></div>
        <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-blue-200/20 to-transparent animate-pulse delay-2000"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md mx-auto flex flex-col justify-center min-h-screen pt-24">
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
          <p className="text-white/80 font-semibold">Sign in to your account</p>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border-2 border-green-400 rounded-xl flex items-center space-x-3 shadow-lg">
            <FiCheckCircle className="text-green-600 w-6 h-6" />
            <span className="text-green-800 font-bold">{successMessage}</span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-400 rounded-xl flex items-center space-x-3 shadow-lg">
            <FiAlertCircle className="text-red-600 w-6 h-6" />
            <span className="text-red-800 font-bold">{error}</span>
            {error.includes('not verified') && (
              <Link 
                to={`/verification-required?email=${encodeURIComponent(email)}`}
                className="ml-2 text-red-700 underline hover:no-underline font-black"
              >
                Verify now
              </Link>
            )}
          </div>
        )}

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border-4 border-blue-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-base font-black text-gray-900 flex items-center space-x-2">
                <FiMail className="w-5 h-5 text-blue-600" />
                <span>Email Address</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/50 focus:border-blue-600 transition-all duration-300 bg-white placeholder-gray-500 font-semibold text-gray-900"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-base font-black text-gray-900 flex items-center space-x-2">
                <FiLock className="w-5 h-5 text-blue-600" />
                <span>Password</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/50 focus:border-blue-600 transition-all duration-300 bg-white placeholder-gray-500 pr-12 font-semibold text-gray-900"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600 transition-colors duration-200"
                >
                  {showPassword ? <FiEyeOff className="w-6 h-6" /> : <FiEye className="w-6 h-6" />}
                </button>
              </div>
            </div>

            {/* Remember Me and Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-5 h-5 text-blue-600 bg-gray-100 border-2 border-gray-400 rounded focus:ring-blue-600 focus:ring-2 transition-all duration-200"
                />
                <span className="text-sm text-gray-900 font-bold">Remember me</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-800 font-bold transition-all duration-200 hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-black py-4 px-6 rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-blue-600/30 text-lg"
            >
              <div className="flex items-center justify-center space-x-2">
                {isLoading ? (
                  <>
                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>SIGNING IN...</span>
                  </>
                ) : (
                  <>
                    <FiLogIn className="w-6 h-6" />
                    <span>SIGN IN</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </div>
            </button>
          </form>

          {/* Footer Links - Minimal */}
          <div className="mt-6 text-center space-y-3">
            <div className="text-sm text-gray-900">
              <span className="font-bold">Don&apos;t have an account?</span>{' '}
              <Link
                to="/register"
                className="text-blue-600 hover:text-blue-800 font-black transition-all duration-200 hover:underline"
              >
                Create Account
              </Link>
            </div>
            <div className="text-sm text-gray-900">
              <span className="font-bold">Need to verify your email?</span>{' '}
              <Link
                to="/verification-required"
                className="text-blue-600 hover:text-blue-800 font-black transition-all duration-200 hover:underline"
              >
                Resend verification
              </Link>
            </div>
          </div>
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
  )
}

export default LoginPage