import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  LogIn, 
  GraduationCap, 
  Building2, 
  UserCog, 
  Shield,
  ChevronRight,
  Sparkles,
  ArrowRight,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

const LoginPageNew = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedQuickLogin, setSelectedQuickLogin] = useState(null);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || '/';
  
  useEffect(() => {
    if (location.state?.message) {
      if (location.state.type === 'success') {
        setSuccessMessage(location.state.message);
        toast.success(location.state.message);
      } else {
        setError(location.state.message);
        toast.error(location.state.message);
      }
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);
    
    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        toast.success('Welcome back! 🎉');
        
        // Redirect based on user role with admin going to new admin dashboard
        if (result.user.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          const roleRoutes = {
            student: '/dashboard/student',
            company: '/dashboard/company',
            supervisor: '/dashboard/supervisor'
          };
          navigate(roleRoutes[result.user.role] || from);
        }
      } else {
        if (result.requiresVerification) {
          setError('Your email is not verified. Please check your inbox or resend the verification email.');
          setTimeout(() => {
            navigate(`/verification-required?email=${encodeURIComponent(result.email || formData.email)}`);
          }, 2000);
        } else {
          setError(result.error || 'Failed to login. Please try again.');
          toast.error(result.error || 'Login failed');
        }
      }
    } catch (err) {
      if (err.response?.status === 403 && err.response?.data?.requiresVerification) {
        setError('Your email is not verified. Redirecting to verification page...');
        setTimeout(() => {
          navigate(`/verification-required?email=${encodeURIComponent(err.response.data.email || formData.email)}`);
        }, 2000);
      } else {
        setError(err.message || 'An unexpected error occurred');
        toast.error(err.message || 'An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const quickLoginOptions = [
    {
      role: 'student',
      email: 'student@comsats.edu.pk',
      password: 'Student@123',
      icon: GraduationCap,
      label: 'Student Portal',
      color: 'from-blue-500 to-indigo-600',
      description: 'Access internship opportunities'
    },
    {
      role: 'company',
      email: 'company@comsats.edu.pk',
      password: 'Company@123',
      icon: Building2,
      label: 'Company Portal',
      color: 'from-green-500 to-emerald-600',
      description: 'Manage internship programs'
    },
    {
      role: 'supervisor',
      email: 'supervisor@comsats.edu.pk',
      password: 'Supervisor@123',
      icon: UserCog,
      label: 'Supervisor Portal',
      color: 'from-purple-500 to-violet-600',
      description: 'Monitor student progress'
    },
    {
      role: 'admin',
      email: 'admin@comsats.edu.pk',
      password: 'Admin@123',
      icon: Shield,
      label: 'Admin Portal',
      color: 'from-red-500 to-pink-600',
      description: 'System administration'
    }
  ];

  const handleQuickLogin = async (option) => {
    setSelectedQuickLogin(option.role);
    setIsLoading(true);
    
    try {
      const result = await login(option.email, option.password);
      
      if (result.success) {
        toast.success(`Welcome to ${option.label}! 🎉`);
        
        // Redirect based on user role with admin going to new admin dashboard
        if (result.user.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          const roleRoutes = {
            student: '/dashboard/student',
            company: '/dashboard/company',
            supervisor: '/dashboard/supervisor'
          };
          navigate(roleRoutes[result.user.role] || from);
        }
      }
    } catch (err) {
      console.error('Demo login error:', err);
      toast.error('Demo login failed');
      setError('Demo login failed');
    } finally {
      setIsLoading(false);
      setSelectedQuickLogin(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="floating-shape absolute top-20 left-20 w-64 h-64 bg-gradient-to-br from-blue-200/30 to-indigo-300/30 rounded-full blur-3xl"></div>
        <div className="floating-shape absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-br from-purple-200/30 to-pink-300/30 rounded-full blur-3xl animation-delay-2s"></div>
        <div className="floating-shape absolute top-1/2 left-1/3 w-48 h-48 bg-gradient-to-br from-green-200/30 to-emerald-300/30 rounded-full blur-3xl animation-delay-4s"></div>
      </div>

      <div className="w-full max-w-6xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          
          {/* Left Side - Welcome Content */}
          <div className="hidden lg:block space-y-8 animate-fade-in-left">
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <GraduationCap className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">COMSATS Internship Portal</h1>
                  <p className="text-gray-600">Connecting Students with Opportunities</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-4xl font-bold text-gray-900 leading-tight">
                  Welcome Back to Your
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                    Professional Journey
                  </span>
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Sign in to access your dashboard, manage applications, and take the next step in your career journey.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <GraduationCap className="w-4 h-4 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">For Students</h3>
                  </div>
                  <p className="text-sm text-gray-600">Discover internships and build your career</p>
                </div>
                
                <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">For Companies</h3>
                  </div>
                  <p className="text-sm text-gray-600">Find talented interns for your team</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full max-w-md mx-auto animate-fade-in-right">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 p-8">
              
              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-4 shadow-lg">
                  <LogIn className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Sign In</h3>
                <p className="text-gray-600">Welcome back! Please sign in to continue</p>
              </div>

              {/* Status Messages */}
              {successMessage && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center space-x-3 animate-slide-down">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <p className="text-green-800 text-sm">{successMessage}</p>
                </div>
              )}

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3 animate-slide-down">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Input */}
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-semibold text-gray-700">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="block w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/70 backdrop-blur-sm hover:bg-white/90"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-semibold text-gray-700">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      className="block w-full pl-12 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/70 backdrop-blur-sm hover:bg-white/90"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Remember & Forgot */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember_me"
                      name="remember_me"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors"
                    />
                    <label htmlFor="remember_me" className="ml-2 block text-sm text-gray-700">
                      Remember me
                    </label>
                  </div>
                  
                  <Link 
                    to="/forgot-password" 
                    className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full relative overflow-hidden bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center justify-center space-x-2">
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Signing in...</span>
                      </>
                    ) : (
                      <>
                        <LogIn className="w-5 h-5" />
                        <span>Sign In</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </div>
                </button>
              </form>

              {/* Divider */}
              <div className="my-8">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500 rounded-lg">Quick Demo Access</span>
                  </div>
                </div>
              </div>

              {/* Quick Login Options */}
              <div className="grid grid-cols-2 gap-3">
                {quickLoginOptions.map((option, index) => (
                  <button
                    key={option.role}
                    onClick={() => handleQuickLogin(option)}
                    disabled={isLoading}
                    className={`p-3 rounded-xl border-2 border-gray-100 hover:border-gray-200 transition-all duration-300 group hover:shadow-md transform hover:scale-105 active:scale-95 ${
                      selectedQuickLogin === option.role ? 'ring-2 ring-blue-500 border-blue-200' : ''
                    }`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${option.color} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow`}>
                        <option.icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-semibold text-gray-900">{option.label}</p>
                        <p className="text-xs text-gray-500">{option.description}</p>
                      </div>
                      {selectedQuickLogin === option.role && (
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* Register Link */}
              <div className="mt-8 text-center">
                <p className="text-sm text-gray-600">
                  Don&apos;t have an account?{' '}
                  <Link 
                    to="/register" 
                    className="font-semibold text-blue-600 hover:text-blue-500 transition-colors inline-flex items-center"
                  >
                    Create Account
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Need help? <Link to="/verification-required" className="text-blue-600 hover:text-blue-500">Resend verification</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPageNew;