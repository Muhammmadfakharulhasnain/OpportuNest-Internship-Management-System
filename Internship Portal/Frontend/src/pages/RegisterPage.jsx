import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext.jsx';
import RegisterFormStep1 from '../components/auth/RegisterFormStep1.jsx';
import RegisterFormStep2 from '../components/auth/RegisterFormStep2.jsx';
import RegisterFormStep3 from '../components/auth/RegisterFormStep3.jsx';
import comsatsLogo from '../assets/download.png';

const STEPS = ['Basic Info', 'Select Role', 'Complete Profile'];

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { showNotification } = useNotification();

  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: null,
    companyName: '',
    industry: '',
    website: '',
    about: '',
    department: '',
    semester: '',
    registrationNumber: '',
    designation: '',
    // New student registration fields
    sessionYear: '',
    regDepartment: '',
    rollNumber: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleSelect = (role) => {
    setFormData((prev) => ({ ...prev, role }));
  };

  const validateStep1 = () => {
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      showNotification('Please fill in all fields', 'error');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      showNotification('Passwords do not match', 'error');
      return false;
    }
    if (formData.password.length < 8) {
      showNotification('Password must be at least 8 characters long', 'error');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.role) {
      showNotification('Please select a role', 'error');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep === 0 && !validateStep1()) return;
    if (currentStep === 1 && !validateStep2()) return;
    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

const handleSubmit = async () => {
  setIsLoading(true);

  // Validate student fields
  if (formData.role === 'student') {
    if (!formData.department || !formData.semester || !formData.sessionYear || !formData.regDepartment || !formData.rollNumber) {
      showNotification('Please fill in all student fields', 'error');
      setIsLoading(false);
      return;
    }
  }

  // Validate supervisor fields (removed semester and regNo requirements)
  if (formData.role === 'supervisor') {
    if (!formData.department || !formData.designation) {
      showNotification('Please fill in all supervisor fields', 'error');
      setIsLoading(false);
      return;
    }
  }

  try {
    // Prepare cleaned form data
    let cleanedFormData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
    };

    if (formData.role === 'company') {
      cleanedFormData = {
        ...cleanedFormData,
        companyName: formData.companyName,
        industry: formData.industry,
        website: formData.website,
        about: formData.about,
      };
    } else if (formData.role === 'student') {
      // Construct registration number from dropdowns
      const registrationNumber = `${formData.sessionYear}-${formData.regDepartment}-${formData.rollNumber}`;
      cleanedFormData = {
        ...cleanedFormData,
        department: formData.department,
        semester: formData.semester,
        regNo: registrationNumber,
      };
    } else if (formData.role === 'supervisor') {
      cleanedFormData = {
        ...cleanedFormData,
        department: formData.department,
        designation: formData.designation,
        // Removed semester and regNo fields for supervisors
      };
    }

    // Debug log before sending
    console.log('Sending payload:', cleanedFormData);

    // Call register function from context
    const result = await register(cleanedFormData, formData.password);

    if (result.success) {
      if (result.requiresVerification) {
        // Email verification required
        showNotification(result.message || 'Registration successful! Please check your email to verify your account.', 'success');
        
        // Redirect to verification required page with user's email
        navigate(`/verification-required?email=${encodeURIComponent(formData.email)}`, {
          state: {
            message: 'Registration successful! Please check your email to verify your account.',
            type: 'success'
          }
        });
      } else {
        // Old flow - immediate login (for backward compatibility)
        showNotification('Registration successful!', 'success');

        // Redirect user based on role
        if (formData.role === 'student') {
          navigate('/dashboard/student');
        } else if (formData.role === 'company') {
          navigate('/dashboard/company');
        } else if (formData.role === 'supervisor') {
          navigate('/dashboard/supervisor');
        }
      }
    } else {
      showNotification(result.error || 'Registration failed', 'error');
    }
  } catch (error) {
    console.error('Registration error:', error.response?.data);
    showNotification(
      error.response?.data?.message || 'Registration failed. Please try again.',
      'error'
    );
  } finally {
    setIsLoading(false);
  }
};



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
              <span className="text-white/60 font-medium">Already have an account?</span>
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
        
        {/* Glowing Lines */}
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-white/20 to-transparent animate-pulse delay-1000"></div>
        <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-blue-200/20 to-transparent animate-pulse delay-2000"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-lg mx-auto pt-24 px-4 py-8">
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
          <p className="text-white/80 font-semibold mb-4">Create Your Account</p>
        </div>

        {/* Modern Progress Bar */}
        <div className="mb-8">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30">
            <div className="flex items-center justify-between">
              {STEPS.map((step, index) => (
                <div key={index} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-500 ${
                    index <= currentStep
                      ? 'bg-white text-blue-600 shadow-lg'
                      : 'bg-white/30 text-white/70'
                  }`}>
                    {index + 1}
                  </div>
                  <span className={`ml-2 text-xs font-bold ${
                    index <= currentStep ? 'text-white' : 'text-white/60'
                  }`}>
                    {step}
                  </span>
                  {index < STEPS.length - 1 && (
                    <div className={`w-8 h-1 rounded-full mx-3 transition-all duration-500 ${
                      index < currentStep
                        ? 'bg-white'
                        : 'bg-white/30'
                    }`}></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Registration Form Container */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 border-4 border-blue-100">
          {/* Step Content */}
          <div className="transform transition-all duration-500">
            {currentStep === 0 && (
              <div className="space-y-6 transform transition-all duration-500 animate-slide-down">
                <RegisterFormStep1
                  formData={formData}
                  onChange={handleChange}
                  onNext={handleNext}
                  isLoading={isLoading}
                  showPassword={showPassword}
                  togglePassword={() => setShowPassword(!showPassword)}
                />
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-6 transform transition-all duration-500 animate-slide-right">
                <RegisterFormStep2
                  selectedRole={formData.role}
                  onRoleSelect={handleRoleSelect}
                  onBack={handleBack}
                  onNext={handleNext}
                />
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6 transform transition-all duration-500 animate-bounce-in">
                <RegisterFormStep3
                  role={formData.role}
                  formData={formData}
                  onChange={handleChange}
                  onBack={handleBack}
                  onSubmit={handleSubmit}
                  isLoading={isLoading}
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer Section */}
        <div className="mt-6 text-center">
          <div className="text-sm text-white">
            <span className="font-bold">Already have an account?</span>{' '}
            <Link
              to="/login"
              className="text-blue-200 hover:text-white font-black transition-all duration-200 hover:underline"
            >
              Sign in here
            </Link>
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
  );
};

export default RegisterPage;