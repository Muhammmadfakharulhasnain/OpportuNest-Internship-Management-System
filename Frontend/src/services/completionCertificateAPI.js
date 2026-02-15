import { api } from './api';

const completionCertificateAPI = {
  // Submit completion certificate
  submitCertificate: async (formData) => {
    try {
      const response = await api.post('/completion-certificates/submit', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('API Error submitting completion certificate:', error.response?.data);
      
      // Handle specific backend error codes
      const errorData = error.response?.data;
      if (errorData?.errorCode) {
        const message = errorData.message || 'Failed to submit completion certificate';
        const errorWithCode = new Error(message);
        errorWithCode.code = errorData.errorCode;
        errorWithCode.missingFields = errorData.missingFields;
        throw errorWithCode;
      }
      
      throw new Error(error.response?.data?.message || 'Failed to submit completion certificate');
    }
  },

  // Get student's completion certificate
  getMyCertificate: async () => {
    try {
      const response = await api.get('/completion-certificates/my-certificate');
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return { success: false, message: 'No completion certificate found' };
      }
      throw new Error(error.response?.data?.message || 'Failed to fetch completion certificate');
    }
  },

  // Get all completion certificates (for supervisors)
  getAllCertificates: async () => {
    try {
      const response = await api.get('/completion-certificates/all');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch completion certificates');
    }
  },

  // Download completion certificate PDF
  downloadPDF: async (certificateId) => {
    try {
      const response = await api.get(`/completion-certificates/download-pdf/${certificateId}`, {
        responseType: 'blob',
      });
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Get filename from Content-Disposition header
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'completion-certificate.pdf';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to download PDF');
    }
  },

  // Update completion certificate status (for supervisors)
  updateStatus: async (certificateId, updateData) => {
    try {
      const response = await api.patch(`/completion-certificates/update-status/${certificateId}`, updateData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update certificate status');
    }
  },

  // Check eligibility to submit completion certificate
  checkEligibility: async () => {
    try {
      const response = await api.get('/completion-certificates/check-eligibility');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to check eligibility');
    }
  },

  // Get student academic information for form auto-fill
  getStudentInfo: async () => {
    try {
      const response = await api.get('/completion-certificates/student-info');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch student information');
    }
  },
};

export default completionCertificateAPI;
