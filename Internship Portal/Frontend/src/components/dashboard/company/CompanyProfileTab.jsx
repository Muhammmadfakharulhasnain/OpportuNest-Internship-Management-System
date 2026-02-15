import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { 
  Building2, 
  Edit3, 
  Save, 
  X, 
  Upload, 
  Globe,
  MapPin,
  Mail,
  Phone,
  Calendar,
  Users,
  Target,
  Lightbulb,
  CheckCircle,
  ExternalLink,
  Linkedin,
  Twitter,
  Award,
  Star,
  Heart,
  Zap
} from 'lucide-react';

// API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005/api';

// Helper function to get auth token with better error handling
const getAuthToken = () => {
  const userString = localStorage.getItem('user');
  if (userString) {
    try {
      const user = JSON.parse(userString);
      console.log('🔍 User from localStorage:', { 
        role: user.role, 
        hasToken: !!user.token,
        tokenLength: user.token ? user.token.length : 0 
      });
      return user.token;
    } catch (e) {
      console.error('Error parsing user from localStorage:', e);
      // Clear invalid data
      localStorage.removeItem('user');
    }
  }
  // Fallback to direct token storage
  const directToken = localStorage.getItem('token');
  console.log('🔍 Direct token from localStorage:', !!directToken);
  return directToken;
};

const CompanyProfileTab = ({ onProfileUpdate }) => {
  const { currentUser, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({});
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Fetch company profile
  const fetchProfile = async () => {
    try {
      const token = getAuthToken();
      
      // Check if user exists and has correct role
      if (!currentUser) {
        console.error('❌ No current user found');
        setAuthError('Please log in to access your profile');
        setLoading(false);
        return;
      }
      
      if (currentUser.role !== 'company') {
        console.error('❌ User role mismatch. Expected: company, Got:', currentUser.role);
        setAuthError('Access denied. Company account required.');
        setLoading(false);
        return;
      }
      
      if (!token) {
        console.error('❌ No authentication token found');
        setAuthError('Authentication token missing. Please log in again.');
        setLoading(false);
        return;
      }
      
      console.log('🔍 Fetching company profile with token length:', token.length);
      console.log('🔍 User role:', currentUser.role);
      
      const response = await fetch(`${API_BASE_URL}/company-profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Profile data received:', data);
        setProfile(data.data);
        setEditedProfile(data.data);
        setAuthError(null);
        
        // Call callback to update parent component
        if (onProfileUpdate) {
          onProfileUpdate();
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Failed to fetch profile:', response.status, errorData);
        
        if (response.status === 401) {
          setAuthError('Your session has expired. Please log in again.');
          // Optionally redirect to login or refresh token
          if (errorData.message && errorData.message.includes('Token is not valid')) {
            console.log('🔄 Token is invalid, logging out...');
            logout();
          }
        } else if (response.status === 403) {
          setAuthError('Access denied. Company account required.');
        } else {
          setAuthError(`Failed to load profile: ${errorData.message || 'Unknown error'}`);
        }
      }
    } catch (error) {
      console.error('💥 Error fetching profile:', error);
      setAuthError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle profile update
  const handleSave = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/company-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editedProfile)
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.data);
        setEditing(false);
        alert('Profile updated successfully!');
        
        // Call callback to update parent component
        if (onProfileUpdate) {
          onProfileUpdate();
        }
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile');
    }
  };

  // Handle image upload
  const handleImageUpload = async (type, file) => {
    // Only allow upload when in editing mode
    if (!editing) {
      return;
    }

    if (type === 'logo') setUploadingLogo(true);
    else setUploadingBanner(true);

    try {
      const token = getAuthToken();
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${API_BASE_URL}/company-profile/upload/${type}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        // Update the profile state directly instead of refetching
        setProfile(data.data);
        setEditedProfile(data.data);
        
        // Don't call onProfileUpdate for image uploads to prevent modal from reopening
        // Image uploads should be silent and not trigger parent updates
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image');
    } finally {
      if (type === 'logo') setUploadingLogo(false);
      else setUploadingBanner(false);
    }
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setEditedProfile(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setEditedProfile(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your company profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white/20 max-w-md">
          <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          
          {authError ? (
            <>
              <div className="text-red-500 text-lg mb-2">Authentication Error</div>
              <p className="text-gray-600 mb-4">{authError}</p>
              <div className="space-y-3">
                <button 
                  onClick={fetchProfile}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105"
                >
                  Try Again
                </button>
                {authError.includes('session has expired') || authError.includes('log in again') ? (
                  <button 
                    onClick={() => {
                      logout();
                      window.location.href = '/login';
                    }}
                    className="w-full px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-200"
                  >
                    Go to Login
                  </button>
                ) : null}
              </div>
            </>
          ) : (
            <>
              <p className="text-gray-600 text-lg mb-4">Failed to load company profile</p>
              <button 
                onClick={fetchProfile}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105"
              >
                Try Again
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Enhanced Header Section - COMSATS Design */}
      <div className="relative bg-gradient-to-r from-[#003366] via-[#00509E] to-[#003366] rounded-lg p-4 text-white shadow-md overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-lg shadow-sm">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold mb-1 text-white flex items-center gap-2">
                  Company Profile
                  {profile.isVerified && (
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-green-500/20 rounded-full border border-green-400/30">
                      <CheckCircle className="w-3 h-3 text-green-300" />
                      <span className="text-xs font-medium text-green-200">Verified</span>
                    </div>
                  )}
                </h1>
                <p className="text-blue-100 text-sm">
                  Manage your company information
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="bg-white/10 text-white hover:bg-white/20 transition-all duration-300 font-medium px-3 py-2 rounded-lg flex items-center gap-2 text-sm"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setEditing(false);
                      setEditedProfile(profile);
                    }}
                    className="bg-white/10 text-white hover:bg-white/20 transition-all duration-300 font-medium px-3 py-2 rounded-lg flex items-center gap-2 text-sm"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 text-sm"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Quick Stats - COMSATS Compact */}
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-white/10 rounded-lg p-2">
              <div className="flex items-center gap-1 mb-0.5">
                <Star className="w-3 h-3 text-blue-200" />
                <span className="text-blue-200 text-xs font-medium">Completion</span>
              </div>
              <p className="text-white font-bold text-sm">
                {profile.profileCompleteness || 0}%
              </p>
            </div>
            <div className="bg-white/10 rounded-lg p-2">
              <div className="flex items-center gap-1 mb-0.5">
                <Users className="w-3 h-3 text-blue-200" />
                <span className="text-blue-200 text-xs font-medium">Employees</span>
              </div>
              <p className="text-white font-bold text-sm">
                {profile.employeeCount || 'N/A'}
              </p>
            </div>
            <div className="bg-white/10 rounded-lg p-2">
              <div className="flex items-center gap-1 mb-0.5">
                <Calendar className="w-3 h-3 text-blue-200" />
                <span className="text-blue-200 text-xs font-medium">Founded</span>
              </div>
              <p className="text-white font-bold text-sm">
                {profile.foundedYear || 'N/A'}
              </p>
            </div>
            <div className="bg-white/10 rounded-lg p-2">
              <div className="flex items-center gap-1 mb-0.5">
                <Globe className="w-3 h-3 text-blue-200" />
                <span className="text-blue-200 text-xs font-medium">Industry</span>
              </div>
              <p className="text-white font-bold text-sm">
                {profile.industry || 'N/A'}
              </p>
            </div>
          </div>
        </div>
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white rounded-full transform translate-x-10 -translate-y-10"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-white rounded-full transform -translate-x-8 translate-y-8"></div>
        </div>
      </div>

      {/* Company Header Card */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        {/* Enhanced Banner */}
        <div className="relative h-32 md:h-40 bg-gradient-to-br from-[#003366] via-[#00509E] to-[#003366]">
          {profile.bannerImage?.path && (
            <img
              src={`http://localhost:5005/${profile.bannerImage.path}`}
              alt="Company Banner"
              className="w-full h-full object-cover"
            />
          )}
          
          {/* Banner Overlay for Better Text Readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
          
          {editing && (
            <div className="absolute top-6 right-6">
              <label className="group cursor-pointer bg-white/10 backdrop-blur-md text-white px-4 py-3 rounded-xl hover:bg-white/20 transition-all duration-200 flex items-center gap-2 border border-white/20">
                <Upload className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="font-medium">
                  {uploadingBanner ? 'Uploading...' : 'Change Banner'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files[0] && handleImageUpload('banner', e.target.files[0])}
                  disabled={uploadingBanner || !editing}
                />
              </label>
            </div>
          )}
        </div>

        {/* Enhanced Logo and Company Info */}
        <div className="relative px-4 md:px-6 pb-6">
          <div className="flex flex-col lg:flex-row items-start gap-6 pt-4">
            
            {/* Premium Logo Design */}
            <div className="relative -mt-12 lg:-mt-16 z-10">
              <div className="w-20 h-20 lg:w-24 lg:h-24 bg-white rounded-xl border-2 border-white overflow-hidden group">
                {profile.profilePicture?.path ? (
                  <img
                    src={`http://localhost:5005/${profile.profilePicture.path}`}
                    alt="Company Logo"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <Building2 className="w-16 h-16 text-gray-400" />
                  </div>
                )}
              </div>
              
              {editing && (
                <label className="absolute -bottom-2 -right-2 cursor-pointer bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-110 border-2 border-white">
                  <Upload className="w-5 h-5" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files[0] && handleImageUpload('logo', e.target.files[0])}
                    disabled={uploadingLogo || !editing}
                  />
                </label>
              )}
            </div>

            {/* Enhanced Company Information */}
            <div className="flex-1 space-y-4 pt-2">
              <div>
                <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">
                  {profile.companyName}
                </h2>
                
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  {editing ? (
                    <input
                      type="text"
                      value={editedProfile.industry || ''}
                      onChange={(e) => handleInputChange('industry', e.target.value)}
                      placeholder="Industry"
                      className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent text-sm"
                    />
                  ) : (
                    profile.industry && (
                      <span className="px-3 py-1 bg-gradient-to-r from-[#003366]/10 to-[#00509E]/10 text-[#003366] rounded-lg text-sm font-medium border border-[#003366]/20">
                        {profile.industry}
                      </span>
                    )
                  )}
                  
                  {profile.foundedYear && (
                    <span className="px-3 py-1 bg-gradient-to-r from-[#003366]/10 to-[#00509E]/10 text-[#003366] rounded-lg text-sm font-medium border border-[#003366]/20 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Founded {profile.foundedYear}
                    </span>
                  )}
                  
                  {profile.employeeCount && (
                    <span className="px-3 py-1 bg-gradient-to-r from-[#003366]/10 to-[#00509E]/10 text-[#003366] rounded-lg text-sm font-medium border border-[#003366]/20 flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {profile.employeeCount} employees
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  {editing ? (
                    <input
                      type="url"
                      value={editedProfile.website || ''}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      placeholder="Company Website"
                      className="flex-1 min-w-64 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    profile.website && (
                      <a
                        href={profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105"
                      >
                        <Globe className="w-4 h-4" />
                        <span className="font-medium">Visit Website</span>
                        <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </a>
                    )
                  )}
                  
                  {profile.headquartersLocation && (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(profile.headquartersLocation)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-gray-600 hover:text-[#003366] transition-colors cursor-pointer group"
                      title="Open in Google Maps"
                    >
                      <MapPin className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      <span className="font-medium group-hover:underline">{profile.headquartersLocation}</span>
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        
        {/* Main Content Area */}
        <div className="xl:col-span-2 space-y-4">
          
          {/* About Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-[#003366] to-[#00509E] rounded-lg text-white">
                <Building2 className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                About Our Company
              </h3>
            </div>
            
            {editing ? (
              <textarea
                value={editedProfile.about || ''}
                onChange={(e) => handleInputChange('about', e.target.value)}
                placeholder="Tell us about your company, mission, values, and what makes you unique..."
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent resize-vertical text-sm"
                rows="4"
              />
            ) : (
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 text-sm whitespace-pre-wrap">
                  {profile.about || (
                    <span className="text-gray-500 italic">
                      Share your company's story, mission, and what makes you unique...
                    </span>
                  )}
                </p>
              </div>
            )}
          </div>

          {/* Vision & Mission */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Vision */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-gradient-to-br from-[#003366] to-[#00509E] rounded-lg text-white">
                  <Target className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-gray-900">
                  Vision
                </h3>
              </div>
              
              {editing ? (
                <textarea
                  value={editedProfile.vision || ''}
                  onChange={(e) => handleInputChange('vision', e.target.value)}
                  placeholder="Our vision for the future..."
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent resize-vertical text-sm"
                  rows="3"
                />
              ) : (
                <p className="text-gray-700 text-sm">
                  {profile.vision || (
                    <span className="text-gray-500 italic">Share your company's vision...</span>
                  )}
                </p>
              )}
            </div>

            {/* Mission */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-gradient-to-br from-[#003366] to-[#00509E] rounded-lg text-white">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-gray-900">
                  Mission
                </h3>
              </div>
              
              {editing ? (
                <textarea
                  value={editedProfile.mission || ''}
                  onChange={(e) => handleInputChange('mission', e.target.value)}
                  placeholder="Our mission and purpose..."
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent resize-vertical text-sm"
                  rows="3"
                />
              ) : (
                <p className="text-gray-700 text-sm">
                  {profile.mission || (
                    <span className="text-gray-500 italic">Share your company's mission...</span>
                  )}
                </p>
              )}
            </div>
          </div>

          {/* Specialties */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-[#003366] to-[#00509E] rounded-lg text-white">
                <Zap className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-gray-900">
                Specialties & Expertise
              </h3>
            </div>
            
            {editing ? (
              <input
                type="text"
                value={editedProfile.specialties ? editedProfile.specialties.join(', ') : ''}
                onChange={(e) => handleInputChange('specialties', e.target.value.split(', ').filter(s => s.trim()))}
                placeholder="e.g., Mobile App, MERN, Web Development (separate with commas)"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent text-sm"
              />
            ) : (
              <div className="flex flex-wrap gap-2">
                {profile.specialties && profile.specialties.length > 0 ? (
                  profile.specialties.map((specialty, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gradient-to-r from-[#003366]/10 to-[#00509E]/10 text-[#003366] rounded-lg text-sm font-medium border border-[#003366]/20"
                    >
                      {specialty}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500 italic text-sm">No specialties listed yet...</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          
          {/* Company Details */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-[#003366] to-[#00509E] rounded-lg text-white">
                <Award className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-gray-900">
                Company Details
              </h3>
            </div>
            
            <div className="space-y-4">
              {/* Founded Year */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Founded Year
                </label>
                {editing ? (
                  <input
                    type="number"
                    value={editedProfile.foundedYear || ''}
                    onChange={(e) => handleInputChange('foundedYear', e.target.value)}
                    placeholder="2010"
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent text-sm"
                  />
                ) : (
                  <p className="text-gray-700 text-sm bg-gray-50 p-2 rounded-lg">
                    {profile.foundedYear || '2010'}
                  </p>
                )}
              </div>

              {/* Employee Count */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employee Count
                </label>
                {editing ? (
                  <select
                    value={editedProfile.employeeCount || ''}
                    onChange={(e) => handleInputChange('employeeCount', e.target.value)}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent text-sm"
                  >
                    <option value="">Select employee count</option>
                    <option value="1-10">1-10</option>
                    <option value="11-50">11-50</option>
                    <option value="51-200">51-200</option>
                    <option value="201-500">201-500</option>
                    <option value="501-1000">501-1000</option>
                    <option value="1000+">1000+</option>
                  </select>
                ) : (
                  <p className="text-gray-700 text-sm bg-gray-50 p-2 rounded-lg">
                    {profile.employeeCount || '51-200'}
                  </p>
                )}
              </div>

              {/* Headquarters Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Headquarters Location
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={editedProfile.headquartersLocation || ''}
                    onChange={(e) => handleInputChange('headquartersLocation', e.target.value)}
                    placeholder="Islamabad"
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent text-sm"
                  />
                ) : (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(profile.headquartersLocation || 'Islamabad')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-gray-700 text-sm bg-gray-50 p-2 rounded-lg hover:bg-[#003366] hover:text-white transition-all cursor-pointer group"
                    title="Click to open in Google Maps"
                  >
                    <MapPin className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span className="flex-1">{profile.headquartersLocation || 'Islamabad'}</span>
                    <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-[#003366] to-[#00509E] rounded-lg text-white">
                <Phone className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-gray-900">
                Contact Information
              </h3>
            </div>
            
            <div className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Email
                </label>
                {editing ? (
                  <input
                    type="email"
                    value={editedProfile.companyEmail || ''}
                    onChange={(e) => handleInputChange('companyEmail', e.target.value)}
                    placeholder="abdjaved634@gmail.com"
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent text-sm"
                  />
                ) : (
                  profile.companyEmail ? (
                    <a
                      href={`mailto:${profile.companyEmail}`}
                      className="block text-[#003366] hover:text-[#00509E] text-sm bg-gray-50 p-2 rounded-lg transition-colors"
                    >
                      {profile.companyEmail}
                    </a>
                  ) : (
                    <p className="text-gray-700 text-sm bg-gray-50 p-2 rounded-lg">abdjaved634@gmail.com</p>
                  )
                )}
              </div>

              {/* Contact Person */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Person Name
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={editedProfile.contactPerson?.name || ''}
                    onChange={(e) => handleInputChange('contactPerson.name', e.target.value)}
                    placeholder="Aslam"
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent text-sm"
                  />
                ) : (
                  <p className="text-gray-700 text-sm bg-gray-50 p-2 rounded-lg">
                    {profile.contactPerson?.name || 'Aslam'}
                  </p>
                )}
              </div>

              {/* Contact Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                {editing ? (
                  <input
                    type="tel"
                    value={editedProfile.contactPerson?.phone || ''}
                    onChange={(e) => handleInputChange('contactPerson.phone', e.target.value)}
                    placeholder="0312183863612"
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent text-sm"
                  />
                ) : (
                  profile.contactPerson?.phone ? (
                    <a
                      href={`tel:${profile.contactPerson.phone}`}
                      className="block text-[#003366] hover:text-[#00509E] text-sm bg-gray-50 p-2 rounded-lg transition-colors"
                    >
                      {profile.contactPerson.phone}
                    </a>
                  ) : (
                    <p className="text-gray-700 text-sm bg-gray-50 p-2 rounded-lg">0312183863612</p>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Social Media Links */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-[#003366] to-[#00509E] rounded-lg text-white">
                <Heart className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-gray-900">
                Social Media & Links
              </h3>
            </div>
            
            <div className="space-y-4">
              {/* LinkedIn */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  LinkedIn
                </label>
                {editing ? (
                  <input
                    type="url"
                    value={editedProfile.socialMedia?.linkedin || ''}
                    onChange={(e) => handleInputChange('socialMedia.linkedin', e.target.value)}
                    placeholder="https://linkedin.com/company/yourcompany"
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent text-sm"
                  />
                ) : (
                  profile.socialMedia?.linkedin ? (
                    <a
                      href={profile.socialMedia.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-[#003366] hover:text-[#00509E] text-sm bg-gray-50 p-2 rounded-lg transition-colors"
                    >
                      <Linkedin className="w-4 h-4" />
                      View LinkedIn Profile
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <a
                      href="#"
                      className="flex items-center gap-2 text-[#003366] hover:text-[#00509E] text-sm bg-gray-50 p-2 rounded-lg transition-colors"
                    >
                      <Linkedin className="w-4 h-4" />
                      View LinkedIn Profile
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )
                )}
              </div>

              {/* Twitter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Twitter
                </label>
                {editing ? (
                  <input
                    type="url"
                    value={editedProfile.socialMedia?.twitter || ''}
                    onChange={(e) => handleInputChange('socialMedia.twitter', e.target.value)}
                    placeholder="https://twitter.com/yourcompany"
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent text-sm"
                  />
                ) : (
                  profile.socialMedia?.twitter ? (
                    <a
                      href={profile.socialMedia.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-[#003366] hover:text-[#00509E] text-sm bg-gray-50 p-2 rounded-lg transition-colors"
                    >
                      <Twitter className="w-4 h-4" />
                      View Twitter Profile
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <a
                      href="#"
                      className="flex items-center gap-2 text-[#003366] hover:text-[#00509E] text-sm bg-gray-50 p-2 rounded-lg transition-colors"
                    >
                      <Twitter className="w-4 h-4" />
                      View Twitter Profile
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyProfileTab;