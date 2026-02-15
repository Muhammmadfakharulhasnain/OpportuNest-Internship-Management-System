// Mock internship approval API service
// TODO: Replace with real API calls when backend is implemented

const internshipApprovalAPI = {
  // Submit internship approval form and send notifications
  submitApprovalForm: async (applicationId, formData) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return mock success response
    return {
      success: true,
      message: 'Internship approval form submitted successfully',
      data: {
        id: 'mock-form-id',
        applicationId,
        formData,
        status: 'pending',
        createdAt: new Date().toISOString()
      }
    };
  },

  // Get internship approval forms for a user
  getUserApprovalForms: async (userId, userType) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return mock empty array for now
    return {
      success: true,
      data: []
    };
  },

  // Get specific internship approval form
  getApprovalForm: async (formId) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return mock form data
    return {
      success: true,
      data: {
        id: formId,
        status: 'pending',
        formData: {
          organizationName: 'Mock Organization',
          address: 'Mock Address',
          industrySector: 'Technology',
          contactPersonName: 'Mock Contact',
          designation: 'HR Manager',
          phoneNumber: '+1234567890',
          emailAddress: 'mock@example.com',
          numberOfPositions: 1,
          internshipLocation: 'Mock Location',
          startDate: '2024-01-01',
          endDate: '2024-06-30',
          workingDaysHours: 'Monday-Friday, 9 AM - 5 PM',
          natureOfInternship: {
            softwareDevelopment: true,
            dataScience: false,
            networking: false,
            cyberSecurity: false,
            webMobileDevelopment: false,
            other: false,
            otherText: ''
          },
          mode: {
            onSite: true,
            virtual: false,
            freelancingBased: false
          }
        }
      }
    };
  },

  // Update approval form status
  updateFormStatus: async (formId, status, notes = '') => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return mock success response
    return {
      success: true,
      message: `Form status updated to ${status} successfully`,
      data: {
        id: formId,
        status,
        notes,
        updatedAt: new Date().toISOString()
      }
    };
  },

  // Send reminder notifications
  sendReminder: async (formId) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return mock success response
    return {
      success: true,
      message: 'Reminder sent successfully',
      data: {
        id: formId,
        reminderSentAt: new Date().toISOString()
      }
    };
  }
};

export default internshipApprovalAPI;
