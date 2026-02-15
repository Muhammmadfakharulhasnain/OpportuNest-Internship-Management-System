import { useState, useEffect } from 'react';
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
  Facebook,
  Instagram,
  Youtube,
  Award,
  TrendingUp,
  Star,
  Heart,
  Shield,
  Zap
} from 'lucide-react';

// API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005/api';

// Helper function to get auth token
const getAuthToken = () => {
  const userString = localStorage.getItem('user');
  if (userString) {
    try {
      const user = JSON.parse(userString);
      return user.token;
    } catch (e) {
      console.error('Error parsing user from localStorage:', e);
    }
  }
  return localStorage.getItem('token');
};

const CompanyProfileTab = ({ onProfileUpdate }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({});
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  // Fetch company profile
  const fetchProfile = async () => {
    try {
      const token = getAuthToken();
      console.log('Fetching company profile...');
      
      const response = await fetch(`${API_BASE_URL}/company-profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Profile data received:', data);
        setProfile(data.data);
        setEditedProfile(data.data);
        
        // Call callback to update parent component
        if (onProfileUpdate) {
          onProfileUpdate();
        }
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch profile:', response.status, errorText);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Failed to load company profile</p>
        <button 
          onClick={fetchProfile}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        
        {/* Modern Header Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-6 md:p-8 mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl text-white">
                <Building2 className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent flex items-center gap-3">
                  Company Profile
                  {profile.isVerified && (
                    <div className="flex items-center gap-1 px-3 py-1 bg-green-100 rounded-full">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-700">Verified</span>
                    </div>
                  )}
                </h1>
                <p className="text-gray-600 mt-2 text-lg">Manage your company information and showcase your brand</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105"
                >
                  <Edit3 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  <span className="font-medium">Edit Profile</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setEditing(false);
                      setEditedProfile(profile);
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200"
                  >
                    <X className="w-5 h-5" />
                    <span className="font-medium">Cancel</span>
                  </button>
                  <button
                    onClick={handleSave}
                    className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105"
                  >
                    <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span className="font-medium">Save Changes</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Enhanced Progress Section */}
          <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Profile Completeness</h3>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="text-2xl font-bold text-blue-600">{profile.profileCompleteness || 0}%</span>
              </div>
            </div>
            
            <div className="relative">
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full transition-all duration-700 ease-out relative"
                  style={{ width: `${profile.profileCompleteness || 0}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </div>
              </div>
              <div className="flex justify-between text-sm text-gray-600 mt-2">
                <span>Getting Started</span>
                <span>Professional Profile</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Banner and Logo Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden mb-8">
          {/* Enhanced Banner */}
          <div className="relative h-64 md:h-80 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700">
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
          <div className="relative px-6 md:px-8 pb-8">
            <div className="flex flex-col lg:flex-row items-start gap-8 pt-6">
              
              {/* Premium Logo Design */}
              <div className="relative -mt-20 lg:-mt-24 z-10">
                <div className="w-36 h-36 lg:w-40 lg:h-40 bg-white rounded-3xl border-4 border-white overflow-hidden group">
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
              <div className="flex-1 space-y-6 pt-4">
                <div>
                  <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-3">
                    {profile.companyName}
                  </h2>
                  
                  <div className="flex flex-wrap items-center gap-4 mb-4">
                    {editing ? (
                      <input
                        type="text"
                        value={editedProfile.industry || ''}
                        onChange={(e) => handleInputChange('industry', e.target.value)}
                        placeholder="Industry"
                        className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                      />
                    ) : (
                      profile.industry && (
                        <span className="px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 rounded-xl font-medium border border-blue-200">
                          {profile.industry}
                        </span>
                      )
                    )}
                    
                    {profile.foundedYear && (
                      <span className="px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 rounded-xl font-medium border border-green-200 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Founded {profile.foundedYear}
                      </span>
                    )}
                    
                    {profile.employeeCount && (
                      <span className="px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 rounded-xl font-medium border border-purple-200 flex items-center gap-2">
                        <Users className="w-4 h-4" />
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
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span className="font-medium">{profile.headquartersLocation}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Main Content Area */}
          <div className="xl:col-span-2 space-y-8">
            
            {/* Enhanced About Section */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl text-white">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent">
                  About Our Company
                </h3>
              </div>
              
              {editing ? (
                <textarea
                  value={editedProfile.about || ''}
                  onChange={(e) => handleInputChange('about', e.target.value)}
                  placeholder="Tell us about your company, mission, values, and what makes you unique..."
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical text-gray-700 leading-relaxed"
                  rows="6"
                />
              ) : (
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-wrap">
                    {profile.about || (
                      <span className="text-gray-500 italic">
                        Share your company's story, mission, and what makes you unique...
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>

            {/* Enhanced Vision & Mission */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Vision */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl text-white">
                    <Target className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-purple-800 to-pink-800 bg-clip-text text-transparent">
                    Vision
                  </h3>
                </div>
                
                {editing ? (
                  <textarea
                    value={editedProfile.vision || ''}
                    onChange={(e) => handleInputChange('vision', e.target.value)}
                    placeholder="Our vision for the future..."
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-vertical"
                    rows="4"
                  />
                ) : (
                  <p className="text-gray-700 leading-relaxed">
                    {profile.vision || (
                      <span className="text-gray-500 italic">Share your company's vision...</span>
                    )}
                  </p>
                )}
              </div>

              {/* Mission */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl text-white">
                    <Lightbulb className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-green-800 to-emerald-800 bg-clip-text text-transparent">
                    Mission
                  </h3>
                </div>
                
                {editing ? (
                  <textarea
                    value={editedProfile.mission || ''}
                    onChange={(e) => handleInputChange('mission', e.target.value)}
                    placeholder="Our mission and purpose..."
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent resize-vertical"
                    rows="4"
                  />
                ) : (
                  <p className="text-gray-700 leading-relaxed">
                    {profile.mission || (
                      <span className="text-gray-500 italic">Share your company's mission...</span>
                    )}
                  </p>
                )}
              </div>
            </div>

            {/* Enhanced Specialties */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl text-white">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-800 to-red-800 bg-clip-text text-transparent">
                  Specialties & Expertise
                </h3>
              </div>
              
              {editing ? (
                <input
                  type="text"
                  value={editedProfile.specialties ? editedProfile.specialties.join(', ') : ''}
                  onChange={(e) => handleInputChange('specialties', e.target.value.split(', ').filter(s => s.trim()))}
                  placeholder="e.g., Web Development, Mobile Apps, AI/ML, Cloud Computing (separate with commas)"
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              ) : (
                <div className="flex flex-wrap gap-3">
                  {profile.specialties && profile.specialties.length > 0 ? (
                    profile.specialties.map((specialty, index) => (
                      <span
                        key={index}
                        className="group px-4 py-2 bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 rounded-xl font-medium border border-orange-200 hover:from-orange-200 hover:to-red-200 transition-all duration-200 transform hover:scale-105"
                      >
                        {specialty}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500 italic">No specialties listed yet...</p>
                  )}
                </div>
              )}
            </div>
          </div>
                Mission
              </h3>
              {editing ? (
                <textarea
                  value={editedProfile.mission || ''}
                  onChange={(e) => handleInputChange('mission', e.target.value)}
                  placeholder="Our mission..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                />
              ) : (
                <p className="text-gray-600 break-words whitespace-pre-wrap overflow-hidden">
                  {profile.mission || 'No mission statement available'}
                </p>
              )}
            </div>
          </div>

          {/* Specialties */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Specialties</h3>
            {editing ? (
              <input
                type="text"
                value={editedProfile.specialties ? editedProfile.specialties.join(', ') : ''}
                onChange={(e) => handleInputChange('specialties', e.target.value.split(', ').filter(s => s.trim()))}
                placeholder="e.g., Web Development, Mobile Apps, AI/ML (separate with commas)"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            ) : (
              <div className="flex flex-wrap gap-2">
                {profile.specialties && profile.specialties.length > 0 ? (
                  profile.specialties.map((specialty, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm break-words"
                    >
                      {specialty}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500">No specialties listed</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Company Details */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Company Details</h3>
            <div className="space-y-4">
              {/* Founded Year */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Founded Year
                </label>
                {editing ? (
                  <input
                    type="number"
                    value={editedProfile.foundedYear || ''}
                    onChange={(e) => handleInputChange('foundedYear', e.target.value)}
                    placeholder="e.g., 2010"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-600">{profile.foundedYear || 'Not specified'}</p>
                )}
              </div>

              {/* Employee Count */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Users className="w-4 h-4 inline mr-1" />
                  Employee Count
                </label>
                {editing ? (
                  <select
                    value={editedProfile.employeeCount || ''}
                    onChange={(e) => handleInputChange('employeeCount', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select size</option>
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-500">201-500 employees</option>
                    <option value="501-1000">501-1000 employees</option>
                    <option value="1000+">1000+ employees</option>
                  </select>
                ) : (
                  <p className="text-gray-600">{profile.employeeCount || 'Not specified'}</p>
                )}
              </div>

              {/* Headquarters */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Headquarters
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={editedProfile.headquartersLocation || ''}
                    onChange={(e) => handleInputChange('headquartersLocation', e.target.value)}
                    placeholder="e.g., San Francisco, CA"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-600">{profile.headquartersLocation || 'Not specified'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h3>
            <div className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Mail className="w-4 h-4 inline mr-1" />
                  Email
                </label>
                {editing ? (
                  <input
                    type="email"
                    value={editedProfile.companyEmail || ''}
                    onChange={(e) => handleInputChange('companyEmail', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  profile.companyEmail ? (
                    <a
                      href={`mailto:${profile.companyEmail}`}
                      className="text-blue-600 hover:text-blue-700 flex items-start gap-1 break-all"
                    >
                      <span className="break-all">{profile.companyEmail}</span>
                      <ExternalLink className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    </a>
                  ) : (
                    <p className="text-gray-600">Not specified</p>
                  )
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Phone className="w-4 h-4 inline mr-1" />
                  Phone
                </label>
                {editing ? (
                  <input
                    type="tel"
                    value={editedProfile.companyPhone || ''}
                    onChange={(e) => handleInputChange('companyPhone', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  profile.companyPhone ? (
                    <a
                      href={`tel:${profile.companyPhone}`}
                      className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      {profile.companyPhone}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <p className="text-gray-600">Not specified</p>
                  )
                )}
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Address
                </label>
                {editing ? (
                  <textarea
                    value={editedProfile.address || ''}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Full address..."
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                  />
                ) : (
                  profile.address ? (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(profile.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 flex items-start gap-1"
                    >
                      <span className="break-words whitespace-pre-wrap">{profile.address}</span>
                      <ExternalLink className="w-3 h-3 mt-1 flex-shrink-0" />
                    </a>
                  ) : (
                    <p className="text-gray-600">Not specified</p>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Social Media & Links</h3>
            <div className="space-y-4">
              {/* LinkedIn */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Linkedin className="w-4 h-4 inline mr-1" />
                  LinkedIn
                </label>
                {editing ? (
                  <input
                    type="url"
                    value={editedProfile.socialMedia?.linkedin || ''}
                    onChange={(e) => handleInputChange('socialMedia.linkedin', e.target.value)}
                    placeholder="https://linkedin.com/company/..."
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <div>
                    {profile.socialMedia?.linkedin ? (
                      <a
                        href={profile.socialMedia.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 flex items-start gap-1 break-all"
                      >
                        <span className="break-all">LinkedIn Profile</span>
                        <ExternalLink className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      </a>
                    ) : (
                      <p className="text-gray-500">Not specified</p>
                    )}
                  </div>
                )}
              </div>

              {/* Twitter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Twitter className="w-4 h-4 inline mr-1" />
                  Twitter
                </label>
                {editing ? (
                  <input
                    type="url"
                    value={editedProfile.socialMedia?.twitter || ''}
                    onChange={(e) => handleInputChange('socialMedia.twitter', e.target.value)}
                    placeholder="https://twitter.com/..."
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <div>
                    {profile.socialMedia?.twitter ? (
                      <a
                        href={profile.socialMedia.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 flex items-start gap-1 break-all"
                      >
                        <span className="break-all">Twitter Profile</span>
                        <ExternalLink className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      </a>
                    ) : (
                      <p className="text-gray-500">Not specified</p>
                    )}
                  </div>
                )}
              </div>

              {/* Facebook */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Facebook className="w-4 h-4 inline mr-1" />
                  Facebook
                </label>
                {editing ? (
                  <input
                    type="url"
                    value={editedProfile.socialMedia?.facebook || ''}
                    onChange={(e) => handleInputChange('socialMedia.facebook', e.target.value)}
                    placeholder="https://facebook.com/..."
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <div>
                    {profile.socialMedia?.facebook ? (
                      <a
                        href={profile.socialMedia.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 flex items-start gap-1 break-all"
                      >
                        <span className="break-all">Facebook Page</span>
                        <ExternalLink className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      </a>
                    ) : (
                      <p className="text-gray-500">Not specified</p>
                    )}
                  </div>
                )}
              </div>

              {/* Instagram */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Instagram className="w-4 h-4 inline mr-1" />
                  Instagram
                </label>
                {editing ? (
                  <input
                    type="url"
                    value={editedProfile.socialMedia?.instagram || ''}
                    onChange={(e) => handleInputChange('socialMedia.instagram', e.target.value)}
                    placeholder="https://instagram.com/..."
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <div>
                    {profile.socialMedia?.instagram ? (
                      <a
                        href={profile.socialMedia.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 flex items-start gap-1 break-all"
                      >
                        <span className="break-all">Instagram Profile</span>
                        <ExternalLink className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      </a>
                    ) : (
                      <p className="text-gray-500">Not specified</p>
                    )}
                  </div>
                )}
              </div>

              {/* YouTube */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Youtube className="w-4 h-4 inline mr-1" />
                  YouTube
                </label>
                {editing ? (
                  <input
                    type="url"
                    value={editedProfile.socialMedia?.youtube || ''}
                    onChange={(e) => handleInputChange('socialMedia.youtube', e.target.value)}
                    placeholder="https://youtube.com/..."
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <div>
                    {profile.socialMedia?.youtube ? (
                      <a
                        href={profile.socialMedia.youtube}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 flex items-start gap-1 break-all"
                      >
                        <span className="break-all">YouTube Channel</span>
                        <ExternalLink className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      </a>
                    ) : (
                      <p className="text-gray-500">Not specified</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Contact Person */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Contact Person</h3>
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                {editing ? (
                  <input
                    type="text"
                    value={editedProfile.contactPerson?.name || ''}
                    onChange={(e) => handleInputChange('contactPerson.name', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-600">{profile.contactPerson?.name || 'Not specified'}</p>
                )}
              </div>

              {/* Designation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                {editing ? (
                  <input
                    type="text"
                    value={editedProfile.contactPerson?.designation || ''}
                    onChange={(e) => handleInputChange('contactPerson.designation', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-600">{profile.contactPerson?.designation || 'Not specified'}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                {editing ? (
                  <input
                    type="email"
                    value={editedProfile.contactPerson?.email || ''}
                    onChange={(e) => handleInputChange('contactPerson.email', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  profile.contactPerson?.email ? (
                    <a
                      href={`mailto:${profile.contactPerson.email}`}
                      className="text-blue-600 hover:text-blue-700 flex items-start gap-1 break-all"
                    >
                      <span className="break-all">{profile.contactPerson.email}</span>
                      <ExternalLink className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    </a>
                  ) : (
                    <p className="text-gray-600">Not specified</p>
                  )
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                {editing ? (
                  <input
                    type="tel"
                    value={editedProfile.contactPerson?.phone || ''}
                    onChange={(e) => handleInputChange('contactPerson.phone', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  profile.contactPerson?.phone ? (
                    <a
                      href={`tel:${profile.contactPerson.phone}`}
                      className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      {profile.contactPerson.phone}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <p className="text-gray-600">Not specified</p>
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
