import { useState, useEffect } from 'react';

// Hook to handle company profile completeness checking
const useCompanyProfileCheck = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isProfileComplete, setIsProfileComplete] = useState(false);

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

  // Fetch company profile to check completeness
  const checkProfile = async () => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        console.error('❌ No authentication token found in useCompanyProfileCheck');
        setLoading(false);
        return null;
      }
      
      console.log('🔍 useCompanyProfileCheck - Fetching profile with token length:', token.length);
      
      const response = await fetch(`${API_BASE_URL}/company-profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ useCompanyProfileCheck - Profile data received');
        setProfileData(data.data);
        setIsProfileComplete(data.data.profileCompleteness >= 85);
        return data.data;
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ useCompanyProfileCheck - Failed to fetch profile:', response.status, errorData);
        
        if (response.status === 401) {
          console.log('🔄 useCompanyProfileCheck - Token invalid, clearing data');
          // Clear invalid data
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
      }
    } catch (error) {
      console.error('💥 useCompanyProfileCheck - Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
    return null;
  };

  useEffect(() => {
    checkProfile();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    profileData,
    loading,
    isProfileComplete,
    refreshProfile: checkProfile,
    profileCompleteness: profileData?.profileCompleteness || 0
  };
};

export default useCompanyProfileCheck;