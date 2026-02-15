import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005/api';

// Create axios instance with admin config
const adminAPI = axios.create({
  baseURL: `${API_BASE_URL}/admin`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
adminAPI.interceptors.request.use(
  (config) => {
    // Try to get token from localStorage where AuthContext stores it
    let token = localStorage.getItem('token');
    
    // If not found, try to get it from the user object
    if (!token) {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          token = user.token;
        } catch (error) {
          console.error('Error parsing stored user:', error);
        }
      }
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Admin API: Token attached to request');
    } else {
      console.warn('🔑 Admin API: No token found for request');
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle auth errors
adminAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ==================== DASHBOARD ====================
export const getDashboardStats = async () => {
  const response = await adminAPI.get('/stats');
  return response.data;
};

// ==================== USER MANAGEMENT ====================
export const getUsers = async (params = {}) => {
  const response = await adminAPI.get('/users', { params });
  return response.data;
};

export const updateUserRole = async (userId, data) => {
  const response = await adminAPI.put(`/users/${userId}/role`, data);
  return response.data;
};

export const updateUserStatus = async (userId, status) => {
  const response = await adminAPI.put(`/users/${userId}/status`, { status });
  return response.data;
};

export const getUserDetails = async (userId) => {
  const response = await adminAPI.get(`/users/${userId}`);
  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await adminAPI.delete(`/users/${userId}`);
  return response.data;
};

// ==================== COMPANY MANAGEMENT ====================
export const getCompanies = async (params = {}) => {
  const response = await adminAPI.get('/companies', { params });
  return response.data;
};

export const updateCompanyStatus = async (companyId, data) => {
  const response = await adminAPI.put(`/companies/${companyId}/status`, data);
  return response.data;
};

// ==================== APPLICATION MANAGEMENT ====================
export const getApplications = async (params = {}) => {
  const response = await adminAPI.get('/applications', { params });
  return response.data;
};

export const updateApplicationStatus = async (applicationId, data) => {
  const response = await adminAPI.put(`/applications/${applicationId}/status`, data);
  return response.data;
};

// ==================== REPORTS MANAGEMENT ====================
export const getReports = async (params = {}) => {
  const response = await adminAPI.get('/reports', { params });
  return response.data;
};

export const getMisconductReports = async (params = {}) => {
  const response = await adminAPI.get('/misconduct-reports', { params });
  return response.data;
};

export const resolveMisconductReport = async (reportId, data) => {
  const response = await adminAPI.put(`/misconduct-reports/${reportId}/resolve`, data);
  return response.data;
};

// ==================== SETTINGS MANAGEMENT ====================
export const getSettings = async (params = {}) => {
  const response = await adminAPI.get('/settings', { params });
  return response.data;
};

export const updateSetting = async (key, data) => {
  const response = await adminAPI.put(`/settings/${key}`, data);
  return response.data;
};

// ==================== BLOCKED DOMAINS ====================
export const getBlockedDomains = async (params = {}) => {
  const response = await adminAPI.get('/blocked-domains', { params });
  return response.data;
};

export const addBlockedDomain = async (data) => {
  const response = await adminAPI.post('/blocked-domains', data);
  return response.data;
};

export const removeBlockedDomain = async (domainId) => {
  const response = await adminAPI.delete(`/blocked-domains/${domainId}`);
  return response.data;
};

// ==================== COMMUNICATION ====================
export const sendBroadcast = async (data) => {
  const response = await adminAPI.post('/broadcast', data);
  return response.data;
};

// ==================== CERTIFICATES ====================
export const generateCertificate = async (studentId, internshipId, data = {}) => {
  const response = await adminAPI.post(`/certificates/${studentId}/${internshipId}`, data, {
    responseType: 'blob'
  });
  return response.data;
};

// ==================== AUDIT LOGS ====================
export const getAuditLogs = async (params = {}) => {
  const response = await adminAPI.get('/audit-logs', { params });
  return response.data;
};

// ==================== JOBS MANAGEMENT ====================
export const getJobs = async (params = {}) => {
  const response = await adminAPI.get('/jobs', { params });
  return response.data;
};

export const getJobDetails = async (jobId) => {
  const response = await adminAPI.get(`/jobs/${jobId}`);
  return response.data;
};

export const updateJob = async (jobId, data) => {
  const response = await adminAPI.put(`/jobs/${jobId}`, data);
  return response.data;
};

export const updateJobStatus = async (jobId, data) => {
  const response = await adminAPI.put(`/jobs/${jobId}/status`, data);
  return response.data;
};

export const deleteJob = async (jobId) => {
  const response = await adminAPI.delete(`/jobs/${jobId}`);
  return response.data;
};

// ==================== REPORTS & ANALYTICS ====================
export const getAnalytics = async (params = {}) => {
  const response = await adminAPI.get('/analytics', { params });
  return response.data;
};

// Get user activity analytics (fallback to basic analytics for now)
export const getUserActivity = async (params = {}) => {
  const response = await adminAPI.get('/analytics', { params });
  return response.data;
};

// ==================== STUDENT RESULTS ====================
export const getAllFinalResults = async () => {
  console.log('🔍 Frontend: Calling admin final-results API...');
  // Add cache busting to ensure fresh data
  const timestamp = new Date().getTime();
  const response = await adminAPI.get(`/final-results?_t=${timestamp}`);
  console.log('✅ Frontend: API response received:', response.data);
  return response.data;
};

export const downloadResultsPDF = async (results) => {
  const response = await adminAPI.post('/final-results/export-pdf', 
    { results }, 
    { responseType: 'blob' }
  );
  
  const blob = new Blob([response.data], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `student-results-${new Date().toISOString().split('T')[0]}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const downloadResultsExcel = async (results) => {
  const response = await adminAPI.post('/final-results/export-excel', 
    { results }, 
    { responseType: 'blob' }
  );
  
  const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `student-results-${new Date().toISOString().split('T')[0]}.xlsx`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const generateReport = async (data) => {
  const response = await adminAPI.post('/reports/generate', data, {
    responseType: 'blob'
  });
  return response.data;
};

// ==================== SYSTEM SETTINGS ====================
export const getSystemSettings = async () => {
  const response = await adminAPI.get('/settings');
  return response.data;
};

export const updateSettings = async (data) => {
  const response = await adminAPI.put('/settings', data);
  return response.data;
};

export const resetSettings = async () => {
  const response = await adminAPI.post('/settings/reset');
  return response.data;
};

// ==================== BULK USER OPERATIONS ====================
export const markInactiveUsers = async (days = 90) => {
  const response = await adminAPI.post('/users/mark-inactive', { days });
  return response.data;
};

export const sendNotificationToUser = async (notificationData) => {
  const response = await adminAPI.post('/send-notification', notificationData);
  return response.data;
};

export const exportUsers = async (format = 'csv', filters = {}) => {
  const config = {
    params: { format, ...filters }
  };
  
  // Only use blob response type for CSV
  if (format.toLowerCase() === 'csv') {
    config.responseType = 'blob';
    const response = await adminAPI.get('/export-users', config);
    return response.data;
  } else {
    // For Excel/JSON, use default response type
    const response = await adminAPI.get('/export-users', config);
    return response.data;
  }
};

export default adminAPI;
