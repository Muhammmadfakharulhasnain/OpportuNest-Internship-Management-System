import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Get API base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005/api';

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user from localStorage on initial render
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setCurrentUser(parsedUser);
        if (parsedUser?.token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${parsedUser.token}`;
        }
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  // Register function
  const register = async (formData, password) => {
    setLoading(true);
    setError(null);

    // Sending registration data to backend

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, {
        ...formData,
        password,
      });
      
      const { user, token, requiresVerification } = response.data;
      
      if (requiresVerification) {
        // User registered but needs email verification
        console.log('✅ Registration successful, email verification required');
        return { 
          success: true, 
          user: user, 
          requiresVerification: true,
          message: 'Registration successful! Please check your email to verify your account.'
        };
      } else {
        // Old flow - user is immediately logged in (for backward compatibility)
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const userWithToken = { ...user, token };
        setCurrentUser(userWithToken);
        localStorage.setItem('user', JSON.stringify(userWithToken));
        return { success: true, user: userWithToken };
      }
    } catch (err) {
      console.error("Registration error:", err.response?.data || err.message);
      setError(err.response?.data?.message || err.message);
      return { success: false, error: err.response?.data?.message || err.message };
    } finally {
      setLoading(false);
    }
  };

  // Login function
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔑 Attempting login for:', email);
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password,
      });
      console.log('🔑 Login response:', response.data);
      const { user, token } = response.data;
      console.log('🔑 User role from backend:', user.role);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const userWithToken = { ...user, token };
      setCurrentUser(userWithToken);
      localStorage.setItem('user', JSON.stringify(userWithToken));
      console.log('🔑 User stored in localStorage:', userWithToken);
      return { success: true, user: userWithToken };
    } catch (err) {
      console.error('🔑 Login error:', err);
      
      // Handle email verification errors specifically
      if (err.response?.status === 403 && err.response?.data?.requiresVerification) {
        setError('Email verification required');
        return { 
          success: false, 
          error: err.response.data.message,
          requiresVerification: true,
          email: err.response.data.email
        };
      }
      
      setError(err.response?.data?.message || err.message);
      return { success: false, error: err.response?.data?.message || err.message };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    return { success: true };
  };

  const value = {
    currentUser,
    loading,
    error,
    register,
    login,
    logout,
    isAuthenticated: !!currentUser,
    userRole: currentUser?.role || null,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}