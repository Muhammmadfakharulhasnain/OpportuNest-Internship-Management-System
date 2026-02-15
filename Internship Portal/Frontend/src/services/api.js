import axios from 'axios';
import React from 'react';

// API configuration with environment-based URLs
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005/api';

console.log('🌐 API Base URL:', API_BASE_URL);
console.log('🌐 Environment:', import.meta.env.VITE_APP_ENV || 'development');

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Increased timeout for large data fetches
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't log expected 404s for certain endpoints
    const url = error.config?.url || '';
    const isExpected404 = error.response?.status === 404 && (
      url.includes('my-certificate') || 
      url.includes('internship-reports/student') ||
      url.includes('joining-reports/student')
    );
    
    if (!isExpected404) {
      console.error('API Error:', error.response?.data || error.message);
    }
    
    // Handle token expiration
    if (error.response?.status === 401 && 
        (error.response?.data?.message?.includes('expired') || 
         error.response?.data?.message?.includes('jwt') ||
         error.response?.data?.error?.includes('TokenExpiredError'))) {
      
      console.log('🔑 Token expired, clearing authentication data');
      
      // Clear all stored auth data
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('token');
      
      // Redirect to login page
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Helper function to get auth token
const getAuthToken = () => {
  // First try direct token storage
  const directToken = localStorage.getItem('token') || sessionStorage.getItem('token');
  console.log('🔑 Direct token:', directToken ? 'EXISTS' : 'NOT FOUND');
  
  // Then try user object storage (which is how AuthContext stores it)
  const userString = localStorage.getItem('user');
  console.log('🔑 User string in localStorage:', userString ? 'EXISTS' : 'NOT FOUND');
  
  if (userString) {
    try {
      const user = JSON.parse(userString);
      console.log('🔑 Parsed user object:', user);
      console.log('🔑 Token from user object:', user.token ? 'EXISTS' : 'NOT FOUND');
      return user.token;
    } catch (e) {
      console.error('Error parsing user from localStorage:', e);
    }
  }
  
  if (directToken) return directToken;
  
  console.log('🔑 NO TOKEN FOUND ANYWHERE');
  return null;
};

// Helper function to handle API responses
const handleResponse = async (response, suppressNotFoundLogs = false) => {
  const isNotFound = response.status === 404;
  
  // Only log if not suppressing 404 logs or if it's not a 404
  if (!suppressNotFoundLogs || !isNotFound) {
    console.log('🔍 handleResponse called with status:', response.status);
  }
  
  const contentType = response.headers.get('content-type');
  
  if (!suppressNotFoundLogs || !isNotFound) {
    console.log('📄 Content type:', contentType);
  }
  
  // Check if response is JSON
  if (contentType && contentType.includes('application/json')) {
    const data = await response.json();
    
    if (!suppressNotFoundLogs || !isNotFound) {
      console.log('📦 Parsed JSON data:', data);
    }
    
    if (!response.ok) {
      if (!suppressNotFoundLogs || !isNotFound) {
        console.log('❌ Response not ok, status:', response.status);
      }
      
      // Handle token expiration specifically
      if (response.status === 401 && 
          (data.message?.includes('expired') || 
           data.message?.includes('Token expired') ||
           data.message?.includes('jwt'))) {
        
        console.log('🔑 Token expired, clearing authentication data');
        
        // Clear all stored auth data
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('token');
        
        // Redirect to login page
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
      
      throw new Error(data.message || 'Something went wrong');
    }
    
    if (!suppressNotFoundLogs || !isNotFound) {
      console.log('✅ Response ok, returning data');
    }
    return data;
  } else {
    // Handle non-JSON responses (like HTML error pages)
    const text = await response.text();
    
    if (!suppressNotFoundLogs || !isNotFound) {
      console.error('Non-JSON response received:', text);
    }
    
    if (!response.ok) {
      throw new Error(`Server error (${response.status}): ${response.statusText}`);
    }
    
    // Try to parse as JSON anyway
    try {
      return JSON.parse(text);
    } catch (parseError) {
      console.error('Failed to parse response:', parseError);
      throw new Error('Invalid response format');
    }
  }
};

// Job API functions
export const jobAPI = {
  // Create a new job
  createJob: async (jobData) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(jobData)
    });
    
    return handleResponse(response);
  },

  // Get company's jobs
  getCompanyJobs: async (filters = {}) => {
    const token = getAuthToken();
    const queryParams = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== '') {
        queryParams.append(key, filters[key]);
      }
    });
    
    const url = `${API_BASE_URL}/jobs/company${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return handleResponse(response);
  },

  // Get job statistics for dashboard
  getCompanyStats: async () => {
    const token = getAuthToken();
    console.log('🔑 Token retrieved for stats:', token ? 'Token exists' : 'No token');
    
    const response = await fetch(`${API_BASE_URL}/jobs/stats/company`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📊 Stats API response status:', response.status);
    const result = await handleResponse(response);
    console.log('📊 Stats API result:', result);
    return result;
  },

  // Get all jobs (public)
  getAllJobs: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== '') {
        queryParams.append(key, filters[key]);
      }
    });
    
    const url = `${API_BASE_URL}/jobs${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await fetch(url);
    return handleResponse(response);
  },

  // Get single job by ID
  getJobById: async (jobId) => {
    const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`);
    return handleResponse(response);
  },

  // Update job
  updateJob: async (jobId, jobData) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(jobData)
    });
    
    return handleResponse(response);
  },

  // Delete job
  deleteJob: async (jobId) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return handleResponse(response);
  }
};

// Auth API functions
export const authAPI = {
  login: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });
    
    return handleResponse(response);
  },

  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });
    
    return handleResponse(response);
  },

  getCurrentUser: async () => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return handleResponse(response);
  },

  resendVerificationEmail: async (email) => {
    const response = await fetch(`${API_BASE_URL}/auth/resend-verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    });
    
    return handleResponse(response);
  }
};

// Test API functions (for debugging)
export const testAPI = {
  createTestJob: async (jobData = {}) => {
    const response = await fetch(`${API_BASE_URL}/test-jobs/test-create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(jobData)
    });
    
    return handleResponse(response);
  },

  getTestJobs: async () => {
    const response = await fetch(`${API_BASE_URL}/test-jobs/test-list`);
    return handleResponse(response);
  },

  clearTestData: async () => {
    const response = await fetch(`${API_BASE_URL}/test-jobs/test-clear`, {
      method: 'DELETE'
    });
    return handleResponse(response);
  }
};

// Application API functions
export const applicationAPI = {
  // Submit application
  submitApplication: async (applicationData) => {
    const token = getAuthToken();
    console.log('🚀 Submitting application with token:', token ? 'EXISTS' : 'NOT FOUND');
    
    const response = await fetch(`${API_BASE_URL}/applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(applicationData)
    });
    
    return handleResponse(response);
  },

  // Get all supervisors
  getSupervisors: async () => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/applications/supervisors`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return handleResponse(response);
  },

  // Get student's applications
  getStudentApplications: async () => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/applications/student`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return handleResponse(response);
  },

  // Get supervisor's pending applications
  getSupervisorApplications: async () => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/applications/supervisor/pending`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return handleResponse(response);
  },

  // Get all applications for supervisor's students
  getAllSupervisorApplications: async () => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/applications/supervisor`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return handleResponse(response);
  },

  // Supervisor review application
  supervisorReviewApplication: async (applicationId, reviewData) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/applications/${applicationId}/supervisor-review`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(reviewData)
    });
    
    return handleResponse(response);
  },

  // Supervisor reject application with feedback
  supervisorRejectWithFeedback: async (applicationId, feedbackData) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/applications/${applicationId}/supervisor/reject`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(feedbackData)
    });
    
    return handleResponse(response);
  },

  // Student resubmit application
  studentResubmitApplication: async (applicationId, resubmissionData) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/applications/${applicationId}/resubmit`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(resubmissionData)
    });
    
    return handleResponse(response);
  },

  // Supervisor approve application
  supervisorApproveApplication: async (applicationId) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/applications/${applicationId}/supervisor/approve`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    return handleResponse(response);
  },

  // Get company's pending applications (supervisor approved)
  getCompanyApplications: async () => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/applications/company/pending`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return handleResponse(response);
  },

  // Get company's accepted applications (hired students)
  getCompanyAcceptedApplications: async () => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/applications/company/accepted`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return handleResponse(response);
  },

  // Company review application
  companyReviewApplication: async (applicationId, reviewData) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/applications/${applicationId}/company-review`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(reviewData)
    });
    
    return handleResponse(response);
  },

  // Update application status (interview flow)
  updateApplicationStatus: async (applicationId, statusData) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/applications/${applicationId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(statusData)
    });
    
    return handleResponse(response);
  },

  // Update interview details
  updateInterviewDetails: async (applicationId, interviewData) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/applications/${applicationId}/interview`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(interviewData)
    });
    
    return handleResponse(response);
  },

  // Download student file (CV or certificate)
  downloadStudentFile: async (applicationId, fileType, fileName) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/applications/${applicationId}/download/${fileType}/${fileName}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to download file');
    }

    // Create blob from response
    const blob = await response.blob();
    
    // Get filename from response headers or use default
    const contentDisposition = response.headers.get('content-disposition');
    let filename = fileName;
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].replace(/['"]/g, '');
      }
    }

    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return { success: true };
  },

  // Preview student file (CV or certificate) - opens in new tab
  previewStudentFile: async (applicationId, fileType, fileName) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/applications/${applicationId}/preview/${fileType}/${fileName}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to preview file');
    }

    // Create blob from response
    const blob = await response.blob();
    
    // Create object URL and open in new tab
    const url = window.URL.createObjectURL(blob);
    const newWindow = window.open(url, '_blank');
    
    if (!newWindow) {
      // If popup blocked, try download instead
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    
    // Cleanup after a delay to allow the new tab to load
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
    }, 1000);
    
    return { success: true };
  },

  // Get hired students for supervisor evaluations
  getSupervised: async () => {
    const token = getAuthToken();
    console.log('🎓 Fetching hired students for evaluation');
    
    const response = await fetch(`${API_BASE_URL}/applications/supervisor/hired-students`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return handleResponse(response);
  }
};

// Student API functions
export const studentAPI = {
  // Student registration
  register: async (studentData) => {
    const response = await fetch(`${API_BASE_URL}/students/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(studentData)
    });
    
    return handleResponse(response);
  },

  // Student login
  login: async (loginData) => {
    const response = await fetch(`${API_BASE_URL}/students/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(loginData)
    });
    
    return handleResponse(response);
  },

  // Get student profile (suppresses 404 network logs)
  getProfile: async () => {
    const token = getAuthToken();
    
    try {
      const response = await fetch(`${API_BASE_URL}/students/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Suppress 404 logging for profile endpoint as it's expected for new users
      return handleResponse(response, true);
    } catch (fetchError) {
      // For network-level errors, return a consistent 404 response
      if (fetchError.name === 'TypeError' || fetchError.message.includes('Failed to fetch')) {
        throw new Error('Student not found');
      }
      throw fetchError;
    }
  },

  // Update student profile with files
  updateProfile: async (formData) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/students/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
        // Note: Don't set Content-Type header when sending FormData
      },
      body: formData
    });
    
    return handleResponse(response);
  },

  // Delete certificate
  deleteCertificate: async (certificateId) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/students/certificates/${certificateId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return handleResponse(response);
  },

  // Admin/Supervisor endpoints
  getAllStudents: async (filters = {}) => {
    const token = getAuthToken();
    const queryParams = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== '') {
        queryParams.append(key, filters[key]);
      }
    });
    
    const url = `${API_BASE_URL}/students/all${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return handleResponse(response);
  },

  // Get student statistics
  getStats: async () => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/students/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return handleResponse(response);
  },

  // Check student eligibility for internship applications
  checkEligibility: async () => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/students/eligibility`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return handleResponse(response);
  },

  // CV Builder related endpoints
  getCVData: async () => {
    const token = getAuthToken();
    
    try {
      const response = await fetch(`${API_BASE_URL}/students/cv-data`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Suppress 404 logging for CV data as it's expected for new users
      return handleResponse(response, true);
    } catch (fetchError) {
      // For network-level errors, return a consistent 404 response
      if (fetchError.name === 'TypeError' || fetchError.message.includes('Failed to fetch')) {
        throw new Error('CV data not found');
      }
      throw fetchError;
    }
  },

  saveCVData: async (cvData) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/students/cv-data`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(cvData)
    });
    
    return handleResponse(response);
  }
};

// Supervisor API functions
export const supervisorAPI = {
  // Get supervisor profile (current logged-in supervisor)
  getProfile: async () => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/supervisors/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return handleResponse(response);
  },

  // Update supervisor profile (current logged-in supervisor)
  updateProfile: async (profileData) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/supervisors/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(profileData)
    });
    
    return handleResponse(response);
  },

  // Get all supervisors
  getAllSupervisors: async () => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/supervisors`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return handleResponse(response);
  },

  // Get supervisor dashboard statistics
  getDashboardStats: async () => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/supervisors/dashboard-stats`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return handleResponse(response);
  }
};

// Supervision Request API functions
export const supervisionRequestAPI = {
  // Create supervision request
  createRequest: async (supervisorId) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/supervision-requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ supervisorId })
    });
    
    return handleResponse(response);
  },

  // Get student's supervision requests
  getStudentRequests: async () => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/supervision-requests/student`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return handleResponse(response);
  },

  // Get supervisor's pending requests
  getSupervisorRequests: async () => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/supervision-requests/supervisor`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return handleResponse(response);
  },

  // Update request status (accept/reject)
  updateRequestStatus: async (requestId, status, supervisorComments = '') => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/supervision-requests/${requestId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status, supervisorComments })
    });
    
    return handleResponse(response);
  }
};

// Supervisor Report API functions
export const supervisorReportAPI = {
  // Create supervisor report
  createReport: async (reportData) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/supervisor-reports`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(reportData)
    });
    
    return handleResponse(response);
  },

  // Get supervisor reports
  getSupervisorReports: async (supervisorId) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/supervisor-reports/${supervisorId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return handleResponse(response);
  },

  // Get company reports
  getCompanyReports: async (companyId) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/supervisor-reports/company/${companyId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return handleResponse(response);
  },

  // Mark report as read
  markAsRead: async (reportId) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/supervisor-reports/${reportId}/read`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return handleResponse(response);
  }
};

// Notification API functions
export const notificationAPI = {
  // Get all notifications for student
  getStudentNotifications: async (params = {}) => {
    const token = getAuthToken();
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value);
      }
    });
    
    const url = `${API_BASE_URL}/notifications/student${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return handleResponse(response);
  },

  // Get unread notification count
  getUnreadCount: async () => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/notifications/unread-count`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return handleResponse(response);
  },

  // Get notification by ID
  getNotificationById: async (notificationId) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return handleResponse(response);
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return handleResponse(response);
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/notifications/mark-all-read`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return handleResponse(response);
  },

  // Delete notification
  deleteNotification: async (notificationId) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return handleResponse(response);
  },

  // Create notification (admin only)
  createNotification: async (notificationData) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(notificationData)
    });
    
    return handleResponse(response);
  }
};

// Offer Letter API functions
export const offerLetterAPI = {
  // Send offer letter
  sendOfferLetter: async (offerData) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/offer-letters/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(offerData)
    });
    
    return handleResponse(response);
  },

  // Get company's sent offer letters
  getCompanyOfferLetters: async () => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/offer-letters/company`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return handleResponse(response);
  },

  // Get student's received offer letters
  getStudentOfferLetters: async () => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/offer-letters/student`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return handleResponse(response);
  },

  // Get supervisor's students' offer letters
  getSupervisorOfferLetters: async () => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/offer-letters/supervisor`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return handleResponse(response);
  },

  // Download offer letter as PDF
  downloadOfferLetter: async (offerId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/offer-letters/${offerId}`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch offer letter');
      }
      
      const data = await response.json();
      const offerLetter = data.data;
      
      // Generate PDF using React-PDF
      const { pdf } = await import('@react-pdf/renderer');
      const OfferLetterPDF = (await import('../components/shared/OfferLetterPDF')).default;
      
      const blob = await pdf(React.createElement(OfferLetterPDF, { offerLetter })).toBlob();
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `offer-letter-${offerLetter.studentName.replace(/\s+/g, '-')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      console.error('Download error:', error);
      throw error;
    }
  },

  // Get offer letter by ID
  getOfferLetterById: async (offerId) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/offer-letters/${offerId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return handleResponse(response);
  },

  // Student accept/reject offer letter
  respondToOffer: async (offerId, response, studentComments = '') => {
    const token = getAuthToken();
    const responseData = await fetch(`${API_BASE_URL}/offer-letters/${offerId}/respond`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ response, studentComments })
    });
    
    return handleResponse(responseData);
  }
};

// Misconduct Report API functions
export const misconductReportAPI = {
  // Create misconduct report
  createMisconductReport: async (reportData) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/misconduct-reports/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(reportData)
    });
    
    return handleResponse(response);
  },

  // Get supervised students for company
  getSupervisedStudents: async () => {
    console.log('🏃‍♂️ getSupervisedStudents called');
    const token = getAuthToken();
    console.log('🔑 Token for API call:', token ? 'EXISTS (length: ' + token.length + ')' : 'NOT FOUND');
    console.log('🌐 Making request to:', `${API_BASE_URL}/misconduct-reports/students`);
    
    const response = await fetch(`${API_BASE_URL}/misconduct-reports/students`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📡 Response status:', response.status);
    console.log('📡 Response ok:', response.ok);
    
    return handleResponse(response);
  },

  // Get eligible hired students for misconduct reports
  getEligibleStudents: async (companyId) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/misconduct-reports/eligible-students/${companyId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    return handleResponse(response);
  },

  // Get company's misconduct reports
  getCompanyReports: async (companyId) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/misconduct-reports/company/${companyId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    return handleResponse(response);
  },

  // Get student's misconduct reports
  getStudentReports: async (studentId) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/misconduct-reports/student/${studentId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    return handleResponse(response);
  },

  // Get supervisor's misconduct reports
  getSupervisorReports: async () => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/misconduct-reports/supervisor`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return handleResponse(response);
  },

  // Update report status
  updateReportStatus: async (reportId, statusData) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/misconduct-reports/${reportId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(statusData)
    });
    
    return handleResponse(response);
  },

  // Download misconduct report as PDF
  downloadReportPDF: async (reportId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/misconduct-reports/${reportId}`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch misconduct report');
      }
      
      const data = await response.json();
      const report = data.data;
      
      // Generate PDF using React-PDF
      const { pdf } = await import('@react-pdf/renderer');
      const MisconductReportPDF = (await import('../components/shared/MisconductReportPDF')).default;
      
      const blob = await pdf(React.createElement(MisconductReportPDF, { report })).toBlob();
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `misconduct-report-${report.studentName.replace(/\s+/g, '-')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      console.error('Download error:', error);
      throw error;
    }
  },

  // Get report by ID
  getReportById: async (reportId) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/misconduct-reports/${reportId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return handleResponse(response);
  }
};

// Progress Report API functions
export const progressReportAPI = {
  // Create progress report
  createProgressReport: async (reportData) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/progress-reports/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(reportData)
    });
    
    return handleResponse(response);
  },

  // Get company's progress reports
  getCompanyReports: async (companyId) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/progress-reports/company/${companyId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    return handleResponse(response);
  },

  // Get supervisor's progress reports
  getSupervisorReports: async () => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/progress-reports/supervisor`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return handleResponse(response);
  },

  // Review progress report
  reviewReport: async (reportId, feedbackData) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/progress-reports/${reportId}/review`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(feedbackData)
    });
    
    return handleResponse(response);
  },

  // Download progress report PDF - Enhanced Client-side Generation
  downloadProgressReportPDF: async (reportId) => {
    try {
      // First, fetch the progress report data
      const response = await fetch(`${API_BASE_URL}/progress-reports/${reportId}`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch progress report');
      }
      
      const data = await response.json();
      const report = data.data;
      
      // Generate PDF using React-PDF with our enhanced component
      const { pdf } = await import('@react-pdf/renderer');
      const ProgressReportPDF = (await import('../components/shared/ProgressReportPDF')).default;
      
      const blob = await pdf(React.createElement(ProgressReportPDF, { report })).toBlob();
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `progress-report-${report.studentName?.replace(/\s+/g, '-') || reportId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      console.error('Download error:', error);
      throw error;
    }
  },

  // Get progress report by ID
  getReportById: async (reportId) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/progress-reports/${reportId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return handleResponse(response);
  }
};

// Internship Appraisal API
export const internshipAppraisalAPI = {
  // Get eligible students for appraisal (hired students)
  getEligibleStudents: async () => {
    console.log('🏃‍♂️ getEligibleStudents called');
    const token = getAuthToken();
    console.log('🔑 Token for API call:', token ? 'EXISTS (length: ' + token.length + ')' : 'NOT FOUND');
    console.log('🌐 Making request to:', `${API_BASE_URL}/internship-appraisals/eligible-students`);
    
    const response = await fetch(`${API_BASE_URL}/internship-appraisals/eligible-students`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📡 Response status:', response.status);
    console.log('📡 Response ok:', response.ok);
    
    return handleResponse(response);
  },

  // Create internship appraisal
  createAppraisal: async (formData) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/internship-appraisals/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
        // Don't set Content-Type for FormData - browser will set it with boundary
      },
      body: formData
    });
    
    return handleResponse(response);
  },

  // Get company's appraisal reports
  getCompanyAppraisals: async () => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/internship-appraisals/company`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return handleResponse(response);
  },

  // Get appraisal by ID
  getAppraisalById: async (appraisalId) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/internship-appraisals/${appraisalId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return handleResponse(response);
  },

  // Update appraisal status
  updateAppraisalStatus: async (appraisalId, status) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/internship-appraisals/${appraisalId}/status`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status })
    });
    
    return handleResponse(response);
  },

  // Delete appraisal
  deleteAppraisal: async (appraisalId) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/internship-appraisals/${appraisalId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return handleResponse(response);
  },

  // Get supervisor's appraisals
  getSupervisorAppraisals: async () => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/internship-appraisals/supervisor`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return handleResponse(response);
  },

  // Download appraisal PDF
  downloadAppraisalPDF: async (report) => {
    try {
      // Generate PDF using React-PDF with our enhanced component
      const { pdf } = await import('@react-pdf/renderer');
      const InternshipAppraisalPDF = (await import('../components/shared/InternshipAppraisalPDF')).default;
      
      const blob = await pdf(React.createElement(InternshipAppraisalPDF, { report })).toBlob();
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `internship-appraisal-${report.studentName?.replace(/\s+/g, '-') || report._id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating appraisal PDF:', error);
      throw error;
    }
  }
};

// Supervisor Chat API functions
export const supervisorChatAPI = {
  // Get supervised students
  getSupervisedStudents: async () => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/supervisor-chat/students`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return handleResponse(response);
  },

  // Get chat history with a student
  getChatHistory: async (studentId) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/supervisor-chat/chat/${studentId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return handleResponse(response);
  },

  // Send message to student
  sendMessage: async (studentId, messageData) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/supervisor-chat/chat/${studentId}/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(messageData)
    });
    
    return handleResponse(response);
  },

  // Send message with file attachments
  sendMessageWithFiles: async (studentId, formData) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/supervisor-chat/chat/${studentId}/message-with-files`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    return handleResponse(response);
  },

  // Get unread message counts
  getUnreadCounts: async () => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/supervisor-chat/unread-counts`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return handleResponse(response);
  },

  // Export chat as PDF
  exportChatPDF: async (studentId) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/supervisor-chat/chat/${studentId}/export`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to export chat');
    }
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chat-transcript-${studentId}-${Date.now()}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return { success: true };
  },

  // Mark messages as read
  markMessagesAsRead: async (studentId) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/supervisor-chat/chat/${studentId}/read`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return handleResponse(response);
  },

  // Get unread message count for supervisor
  getUnreadCount: async (email) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/supervisor-chat/unread-count`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ email })
    });
    
    return handleResponse(response);
  },

  // Send progress update to student
  sendProgressUpdate: async (studentId, updateData) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/supervisor-chat/chat/${studentId}/progress`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updateData)
    });
    
    return handleResponse(response);
  }
};

// Student Chat API functions
export const studentChatAPI = {
  // Get student's chat with supervisor
  getStudentChat: async () => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/student-chat/chat`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return handleResponse(response);
  },

  // Send message to supervisor
  sendMessageToSupervisor: async (messageData) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/student-chat/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(messageData)
    });
    
    return handleResponse(response);
  },

  // Send message with file attachments
  sendMessageWithFiles: async (formData) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/student-chat/message-with-files`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    return handleResponse(response);
  },

  // Export chat as PDF
  exportChatPDF: async () => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/student-chat/export`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to export chat');
    }
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `supervisor-chat-transcript-${Date.now()}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return { success: true };
  },

  // Mark supervisor messages as read
  markSupervisorMessagesAsRead: async () => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/student-chat/read`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return handleResponse(response);
  },

  // Get unread message count
  getUnreadCount: async (email) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/student-chat/unread-count`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ email })
    });
    
    return handleResponse(response);
  }
};

// Joining Report API functions
export const joiningReportAPI = {
  // Create joining report (Student)
  createJoiningReport: async (reportData) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/joining-reports/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(reportData)
    });
    
    return handleResponse(response);
  },

  // Get student's joining report
  getStudentJoiningReport: async () => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/joining-reports/student`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return handleResponse(response);
  },

  // Check joining report eligibility
  checkJoiningReportEligibility: async () => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/joining-reports/eligibility`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return handleResponse(response);
  },

  // Get supervisor's joining reports
  getSupervisorJoiningReports: async () => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/joining-reports/supervisor`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return handleResponse(response);
  },

  // Verify joining report (Supervisor)
  verifyJoiningReport: async (reportId) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/joining-reports/${reportId}/verify`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return handleResponse(response);
  },

  // Get joining report by ID
  getJoiningReportById: async (reportId) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/joining-reports/${reportId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return handleResponse(response);
  },

  // Download joining report PDF
  downloadJoiningReportPDF: async (reportId) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/joining-reports/${reportId}/pdf`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to download joining report PDF');
    }
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `joining_report_${reportId}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    
    window.URL.revokeObjectURL(url);
  }
};

// Internship Report API functions
export const internshipReportAPI = {
  // Submit internship report (Student)
  submitReport: async (formData) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/internship-reports/submit`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData // FormData object with files
    });
    
    return handleResponse(response);
  },

  // Get student's internship report
  getStudentReport: async () => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/internship-reports/student`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    // Special handling for internship reports - 404 means no report submitted yet
    if (response.status === 404) {
      const data = await response.json();
      if (data.message && data.message.includes('No internship report found')) {
        console.log('📝 No internship report found for student (this is normal)');
        return { success: true, data: null, message: 'No internship report submitted yet' };
      }
    }
    
    return handleResponse(response);
  },

  // Check internship report eligibility
  checkEligibility: async () => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/internship-reports/eligibility`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return handleResponse(response);
  },

  // Get supervisor's internship reports
  getSupervisorReports: async () => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/internship-reports/supervisor`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return handleResponse(response);
  },

  // Download internship report PDF
  downloadPDF: async (reportId) => {
    console.log('🔍 PDF Download API - Report ID:', reportId);
    
    if (!reportId) {
      throw new Error('Report ID is required for PDF download');
    }
    
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/internship-reports/${reportId}/pdf`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ PDF Download failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        reportId
      });
      
      if (response.status === 404) {
        throw new Error(`Internship report not found (ID: ${reportId})`);
      } else if (response.status === 403) {
        throw new Error('Unauthorized access to download this report');
      } else {
        throw new Error(`Failed to download internship report PDF (Status: ${response.status})`);
      }
    }
    
    console.log('✅ PDF Download successful for report:', reportId);
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `internship_report_${reportId}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    
    window.URL.revokeObjectURL(url);
  },

  // Add supervisor feedback to internship report
  addFeedback: async (reportId, feedbackData) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/internship-reports/${reportId}/feedback`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(feedbackData)
    });
    
    return handleResponse(response);
  },

  // Get internship report by ID
  getReportById: async (reportId) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/internship-reports/${reportId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return handleResponse(response);
  },

  // Download appendix file
  downloadAppendixFile: async (reportId, fileId) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/internship-reports/${reportId}/files/${fileId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to download file');
    }
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    
    // Get filename from response headers or use default
    const contentDisposition = response.headers.get('content-disposition');
    let filename = 'download';
    if (contentDisposition) {
      const matches = /filename="([^"]*)"/.exec(contentDisposition);
      if (matches != null && matches[1]) {
        filename = matches[1];
      }
    }
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    
    window.URL.revokeObjectURL(url);
  }
};

// Weekly Reports API
export const weeklyReportAPI = {
  // Student functions
  getStudentReports: async (params = {}) => {
    const response = await api.get('/weekly-reports/student/reports', { params });
    return response.data;
  },

  // Get available weekly report events for student
  getAvailableEvents: async () => {
    const response = await api.get('/weekly-reports/events/available');
    return response.data;
  },

  // Submit report to a specific event (NEW API)
  submitReportToEvent: async (eventId, formData) => {
    const response = await api.post(`/weekly-reports/submit/${eventId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Legacy submit function (keeping for backward compatibility)
  submitReport: async (reportData) => {
    // Create FormData for file upload support
    const formData = new FormData();
    formData.append('weekNumber', reportData.weekNumber);
    formData.append('tasksCompleted', reportData.tasksCompleted || '');
    formData.append('reflections', reportData.reflections || '');
    formData.append('additionalComments', reportData.additionalComments || '');

    // Add supporting files if they exist
    if (reportData.supportingFiles && reportData.supportingFiles.length > 0) {
      for (let i = 0; i < reportData.supportingFiles.length; i++) {
        formData.append('supportingFiles', reportData.supportingFiles[i]);
      }
    }

    const response = await api.post('/weekly-reports/submit', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Supervisor functions
  getSupervisorStudentReports: async (params = {}) => {
    const response = await api.get('/weekly-reports/supervisor/reports', { params });
    return response.data;
  },

  // Create weekly report event (Supervisor)
  createEvent: async (eventData) => {
    const response = await api.post('/weekly-reports/events/create', eventData);
    return response.data;
  },

  // Get supervisor's created events
  getSupervisorEvents: async () => {
    const response = await api.get('/weekly-reports/events/supervisor');
    return response.data;
  },

  // Add supervisor feedback
  addSupervisorFeedback: async (reportId, feedbackData) => {
    const response = await api.put(`/weekly-reports/supervisor/reports/${reportId}/feedback`, feedbackData);
    return response.data;
  },

  // Shared functions
  getReportDetails: async (reportId) => {
    const response = await api.get(`/weekly-reports/reports/${reportId}`);
    return response.data;
  },

  // PDF Generation function
  downloadReportPDF: async (reportId) => {
    const token = getAuthToken();
    console.log('🔍 Starting PDF download for report:', reportId);
    console.log('🔍 Using token:', token ? 'Present' : 'Missing');
    
    const url = `${API_BASE_URL}/weekly-reports/reports/${reportId}/pdf`;
    console.log('🔍 Making request to:', url);
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('🔍 Response status:', response.status);
    console.log('🔍 Response headers:', Object.fromEntries(response.headers));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Response error:', errorText);
      throw new Error(`Failed to download weekly report PDF: ${response.status} ${response.statusText}`);
    }
    
    const blob = await response.blob();
    console.log('🔍 Blob size:', blob.size, 'bytes');
    console.log('🔍 Blob type:', blob.type);
    
    const downloadUrl = window.URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `weekly_report_${reportId}.pdf`;
    document.body.appendChild(a);
    console.log('🔍 Triggering download for:', a.download);
    a.click();
    a.remove();
    
    window.URL.revokeObjectURL(downloadUrl);
    console.log('✅ PDF download completed successfully');
  },

  // Download supporting file
  downloadSupportingFile: async (reportId, fileIndex, fileName) => {
    const token = getAuthToken();
    console.log('🔍 Starting file download - Report:', reportId, 'File Index:', fileIndex);
    
    const url = `${API_BASE_URL}/weekly-reports/reports/${reportId}/files/${fileIndex}`;
    console.log('🔍 Making request to:', url);
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('🔍 Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Response error:', errorText);
      throw new Error(`Failed to download file: ${response.status} ${response.statusText}`);
    }
    
    const blob = await response.blob();
    console.log('🔍 Blob size:', blob.size, 'bytes');
    
    const downloadUrl = window.URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = fileName;
    document.body.appendChild(a);
    console.log('🔍 Triggering download for:', fileName);
    a.click();
    a.remove();
    
    window.URL.revokeObjectURL(downloadUrl);
    console.log('✅ File download completed successfully');
  }
};

// Supervisor Evaluation API functions
export const supervisorEvaluationAPI = {
  // Submit supervisor evaluation
  submitEvaluation: async (evaluationData) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/supervisor-evaluations/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(evaluationData)
    });
    
    return handleResponse(response);
  },

  // Get supervisor's evaluations
  getSupervisorEvaluations: async () => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/supervisor-evaluations/supervisor`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return handleResponse(response);
  },

  // Get evaluation by ID
  getEvaluationById: async (id) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/supervisor-evaluations/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return handleResponse(response);
  },

  // Update evaluation status
  updateEvaluationStatus: async (id, status) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/supervisor-evaluations/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });
    
    return handleResponse(response);
  }
};

// Admin API functions
export const adminAPI = {
  // Get all companies for admin dashboard
  getCompanies: async (filters = {}) => {
    const token = getAuthToken();
    const queryParams = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== '') {
        queryParams.append(key, filters[key]);
      }
    });
    
    const url = `${API_BASE_URL}/admin/companies${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return handleResponse(response);
  },

  // Get single company details
  getCompanyDetails: async (companyId) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/admin/companies/${companyId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return handleResponse(response);
  },

  // Approve company
  approveCompany: async (companyId, reason = '') => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/admin/companies/${companyId}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ reason })
    });
    
    return handleResponse(response);
  },

  // Reject company
  rejectCompany: async (companyId, reason = '') => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/admin/companies/${companyId}/reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ reason })
    });
    
    return handleResponse(response);
  },

  // Update company status
  updateCompanyStatus: async (companyId, status, reason = '') => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/admin/companies/${companyId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status, reason })
    });
    
    return handleResponse(response);
  },

  // Delete company
  deleteCompany: async (companyId) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/admin/companies/${companyId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return handleResponse(response);
  }
};

// Generic authenticated request function
export const makeAuthenticatedRequest = async (url, options = {}) => {
  const token = getAuthToken();
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers
    }
  };

  const response = await fetch(url, mergedOptions);
  return handleResponse(response);
};

// Export axios instance for direct use
export { api };
