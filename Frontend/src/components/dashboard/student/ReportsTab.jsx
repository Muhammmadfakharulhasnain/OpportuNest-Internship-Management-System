import { useState, useEffect } from 'react';
import { FileText, Plus, Calendar, Download, CheckCircle, Award, Trophy } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Card from '../../../ui/Card';
import Button from '../../../ui/Button';
import Badge from '../../../ui/Badge';
import Modal from '../../../ui/Modal';
import Input from '../../../ui/Input';
import Select from '../../../ui/Select';
import { joiningReportAPI, weeklyReportAPI, internshipReportAPI } from '../../../services/api';
import completionCertificateAPI from '../../../services/completionCertificateAPI';
import WeeklyReport from './WeeklyReport';

const ReportsTab = () => {
  const [reports, setReports] = useState([]);
  const [weeklyReports, setWeeklyReports] = useState([]);
  const [internshipReport, setInternshipReport] = useState(null);
  const [completionCertificate, setCompletionCertificate] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState('');
  const [showWeeklySimpleModal, setShowWeeklySimpleModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedViewReport, setSelectedViewReport] = useState(null);
  const [formData, setFormData] = useState({});
  const [eligibilityData, setEligibilityData] = useState(null);
  const [internshipEligibility, setInternshipEligibility] = useState(null);
  const [completionEligibility, setCompletionEligibility] = useState(null);
  const [loading, setLoading] = useState(false);

  const reportTypes = [
    { value: 'joining', label: 'Joining Report' },
    { value: 'weekly', label: 'Weekly Report' },
    { value: 'internship', label: 'Internship Report' },
    { value: 'completion', label: 'Completion Certificate' }
  ];

  useEffect(() => {
    fetchReports();
    fetchWeeklyReports();
    fetchInternshipReport();
    fetchCompletionCertificate();
    checkEligibility();
    checkInternshipEligibility();
    checkCompletionEligibility();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await joiningReportAPI.getStudentJoiningReport();
      if (response.success && response.data) {
        setReports([response.data]);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  const fetchInternshipReport = async () => {
    try {
      const response = await internshipReportAPI.getStudentReport();
      if (response.success) {
        if (response.data) {
          setInternshipReport(response.data);
        } else {
          setInternshipReport(null);
        }
      }
    } catch (error) {
      console.error('Error fetching internship report:', error);
      setInternshipReport(null);
    }
  };

  const fetchWeeklyReports = async () => {
    try {
      setLoading(true);
      const response = await weeklyReportAPI.getStudentReports();
      setWeeklyReports(response.data.reports || []);
    } catch (error) {
      console.error('Error fetching weekly reports:', error);
      toast.error('Failed to load weekly reports');
    } finally {
      setLoading(false);
    }
  };

  const fetchCompletionCertificate = async () => {
    try {
      const response = await completionCertificateAPI.getMyCertificate();
      if (response.success) {
        setCompletionCertificate(response.data);
      } else {
        setCompletionCertificate(null);
      }
    } catch (error) {
      // This is normal - student may not have a completion certificate yet
      if (error.message.includes('No completion certificate found')) {
        console.log('📄 No completion certificate found for student (this is normal)');
      } else {
        console.error('Error fetching completion certificate:', error);
      }
      setCompletionCertificate(null);
    }
  };

  const checkEligibility = async () => {
    try {
      const response = await joiningReportAPI.checkJoiningReportEligibility();
      if (response.success) {
        setEligibilityData(response.data);
      }
    } catch (error) {
      console.error('Error checking eligibility:', error);
      // Set eligibility to false when server is unavailable
      setEligibilityData({
        canCreate: false,
        hasHiredApplication: false,
        hasExistingReport: false,
        applicationData: null
      });
    }
  };

  const checkInternshipEligibility = async () => {
    try {
      const response = await internshipReportAPI.checkEligibility();
      if (response.success) {
        setInternshipEligibility(response.data);
      }
    } catch (error) {
      console.error('Error checking internship eligibility:', error);
      setInternshipEligibility({
        canCreate: false,
        hasHiredApplication: false,
        hasSupervisor: false,
        hasExistingReport: false
      });
    }
  };

  const checkCompletionEligibility = async () => {
    try {
      const response = await completionCertificateAPI.checkEligibility();
      if (response.success) {
        // Transform backend response to match frontend expectations
        const transformedResponse = {
          success: response.success,
          canSubmit: response.data.canCreate,
          hasExisting: response.data.hasExistingCertificate,
          reason: response.data.message,
          data: response.data
        };
        setCompletionEligibility(transformedResponse);
      }
    } catch (error) {
      console.error('Error checking completion eligibility:', error);
      setCompletionEligibility({
        canSubmit: false,
        hasExisting: false,
        reason: 'Unable to check eligibility'
      });
    }
  };

  const handleCreateReport = (type) => {
    if (type === 'joining') {
      if (!eligibilityData?.canCreate) {
        if (!eligibilityData?.hasHiredApplication) {
          toast.error('You must be hired by a company and have a completed internship form to create a joining report. Please check your application status and ensure all interview steps are completed.');
        } else if (eligibilityData?.hasExistingReport) {
          toast.error('You have already submitted a joining report');
        } else {
          toast.error('Unable to create joining report. Please contact your supervisor.');
        }
        return;
      }
      
      // Pre-fill form with application data
      const appData = eligibilityData.applicationData;
      setFormData({
        organizationName: appData?.companyId?.name || '',
        internshipStartDate: appData?.jobId?.startDate ? new Date(appData.jobId.startDate).toISOString().split('T')[0] : '',
        internshipEndDate: appData?.jobId?.endDate ? new Date(appData.jobId.endDate).toISOString().split('T')[0] : '',
        supervisorName: appData?.supervisorId?.name || '',
        supervisorEmail: appData?.supervisorId?.email || '',
        studentThoughts: '',
        acknowledgment: false
      });
    } else if (type === 'internship') {
      if (!internshipEligibility?.canCreate) {
        if (!internshipEligibility?.hasHiredApplication) {
          toast.error('You must be hired by a company and have a completed internship form to create an internship report. Please check your application status and ensure all interview steps are completed.');
        } else if (!internshipEligibility?.hasSupervisor) {
          toast.error('You must have a supervisor assigned to create an internship report.');
        } else if (internshipEligibility?.hasExistingReport) {
          toast.error('You have already submitted an internship report');
        } else {
          toast.error('Unable to create internship report. Please contact your supervisor.');
        }
        return;
      }
      
      // Initialize form for internship report
      setFormData({
        acknowledgement: '',
        executiveSummary: '',
        tableOfContents: '',
        projectRequirements: '',
        approachAndTools: '',
        outcomesAchieved: '',
        knowledgeAcquired: '',
        skillsLearned: '',
        attitudesAndValues: '',
        challengingTask: '',
        challengesAndSolutions: '',
        reflectionAndConclusion: '',
        appendices: []
      });
    } else if (type === 'completion') {
      if (!completionEligibility?.canSubmit) {
        if (completionEligibility?.hasExisting) {
          toast.error('You have already submitted a completion certificate');
        } else if (!isStudentHiredWithInternshipForm()) {
          toast.error('You must be hired by a company and have a completed internship form to submit a completion certificate. Please check your application status and ensure all interview steps are completed.');
        } else {
          toast.error(completionEligibility?.reason || 'Unable to submit completion certificate');
        }
        return;
      }
      
      // Initialize with default values
      setFormData({
        reportSummary: '',
        keyAchievements: '',
        futurePlans: '',
        technicalSkills: '',
        softSkills: '',
        overallLearning: '',
        projectsCompleted: '',
        performanceRating: '',
        recommendationLetter: '',
        certificateFile: null,
        appraisalForm: null
      });
    } else {
      setFormData({});
    }
    
    setSelectedReportType(type);
    setShowReportModal(true);
  };

  const handleSubmitReport = async () => {
    if (selectedReportType === 'joining') {
      if (!formData.studentThoughts || !formData.acknowledgment) {
        toast.error('Please fill all required fields and confirm acknowledgment');
        return;
      }
      
      if ((formData.studentThoughts || '').length < 10) {
        toast.error('Student thoughts must be at least 10 characters long');
        return;
      }
      
      setLoading(true);
      try {
        const response = await joiningReportAPI.createJoiningReport({
          studentThoughts: formData.studentThoughts,
          acknowledgment: formData.acknowledgment
        });
        
        if (response.success) {
          toast.success('Joining report submitted successfully!');
          setShowReportModal(false);
          fetchReports();
          checkEligibility();
        }
      } catch (error) {
        toast.error(error.message || 'Failed to submit report');
      } finally {
        setLoading(false);
      }
    } else if (selectedReportType === 'internship') {
      // Validate internship report form
      const requiredFields = [
        'acknowledgement', 'executiveSummary', 'tableOfContents',
        'projectRequirements', 'approachAndTools', 'outcomesAchieved',
        'knowledgeAcquired', 'skillsLearned', 'attitudesAndValues',
        'challengingTask', 'challengesAndSolutions', 'reflectionAndConclusion'
      ];
      
      for (const field of requiredFields) {
        if (!formData[field] || formData[field].trim().length < 10) {
          toast.error(`${field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} must be at least 10 characters long`);
          return;
        }
      }
      
      setLoading(true);
      try {
        // Create FormData for file upload
        const submitData = new FormData();
        
        // Add all text fields
        requiredFields.forEach(field => {
          submitData.append(field, formData[field]);
        });
        
        // Add files if any
        if (formData.appendices && formData.appendices.length > 0) {
          formData.appendices.forEach(file => {
            submitData.append('appendices', file);
          });
        }
        
        const response = await internshipReportAPI.submitReport(submitData);
        
        if (response.success) {
          toast.success('Internship report submitted successfully!');
          setShowReportModal(false);
          fetchInternshipReport();
          checkInternshipEligibility();
          setFormData({});
        }
      } catch (error) {
        toast.error(error.message || 'Failed to submit internship report');
      } finally {
        setLoading(false);
      }
    } else if (selectedReportType === 'completion') {
      // Validate completion certificate form
      const requiredFields = [
        'reportSummary', 'keyAchievements', 'futurePlans', 'technicalSkills',
        'softSkills', 'overallLearning', 'projectsCompleted', 'performanceRating',
        'recommendationLetter'
      ];
      
      for (const field of requiredFields) {
        if (!formData[field] || formData[field].toString().trim().length === 0) {
          toast.error(`${field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} is required`);
          return;
        }
      }

      // Validate text field minimum lengths
      if (formData.reportSummary.length < 50) {
        toast.error('Report summary must be at least 50 characters long');
        return;
      }
      if (formData.keyAchievements.length < 30) {
        toast.error('Key achievements must be at least 30 characters long');
        return;
      }
      if (formData.futurePlans.length < 30) {
        toast.error('Future plans must be at least 30 characters long');
        return;
      }

      // Validate performance rating
      const rating = parseInt(formData.performanceRating);
      if (isNaN(rating) || rating < 1 || rating > 5) {
        toast.error('Please select a valid performance rating');
        return;
      }

      // Validate required files
      if (!formData.certificateFile) {
        toast.error('Completion certificate file is required');
        return;
      }
      if (!formData.appraisalForm) {
        toast.error('Appraisal form file is required');
        return;
      }

      setLoading(true);
      try {
        // Create FormData for file upload
        const submitData = new FormData();
        
        // Add all form fields
        requiredFields.forEach(field => {
          submitData.append(field, formData[field]);
        });
        
        // Add files
        submitData.append('certificateFile', formData.certificateFile);
        submitData.append('appraisalForm', formData.appraisalForm);
        
        const response = await completionCertificateAPI.submitCertificate(submitData);
        
        if (response.success) {
          toast.success('Completion certificate submitted successfully! No supervisor approval required.');
          setShowReportModal(false);
          fetchCompletionCertificate();
          checkCompletionEligibility();
          setFormData({});
        }
      } catch (error) {
        console.error('Completion certificate submission error:', error);
        
        // Handle specific error types
        let errorMessage = 'Failed to submit completion certificate';
        
        if (error.message.includes('CERTIFICATE_EXISTS')) {
          errorMessage = 'You have already submitted a completion certificate.';
        } else if (error.message.includes('NO_HIRED_APPLICATION')) {
          errorMessage = 'You must be hired by a company first. Please check your application status.';
        } else if (error.message.includes('MISSING_FIELDS')) {
          errorMessage = 'Please fill in all required fields before submitting.';
        } else if (error.message.includes('NO_FILES')) {
          errorMessage = 'Please upload at least one file (certificate or appraisal form).';
        } else if (error.message.includes('USER_NOT_FOUND')) {
          errorMessage = 'Account verification failed. Please log in again.';
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    } else {
      // Handle other report types
      const newReport = {
        id: reports.length + 1,
        type: selectedReportType,
        title: reportTypes.find(r => r.value === selectedReportType)?.label,
        status: 'submitted',
        submittedAt: new Date().toISOString().split('T')[0],
        ...formData
      };
      
      setReports([...reports, newReport]);
      setShowReportModal(false);
      toast.success('Report submitted successfully!');
    }
  };

  // Check if student is hired and has internship form
  const isStudentHiredWithInternshipForm = () => {
    // Check both eligibility sources for hired status
    const hasHiredApplication = eligibilityData?.hasHiredApplication || internshipEligibility?.hasHiredApplication;
    
    // Additional check: student must have completed all interview steps and company must have submitted internship form
    const hasCompletedProcess = eligibilityData?.applicationData?.applicationStatus === 'hired' || 
                               internshipEligibility?.applicationData?.applicationStatus === 'hired';
    
    return hasHiredApplication && hasCompletedProcess;
  };

  // Weekly report functions
  const handleOpenWeeklyReport = () => {
    // Check if student is hired and has internship form before allowing weekly report creation
    if (!isStudentHiredWithInternshipForm()) {
      toast.error('You must be hired by a company and have a completed internship form to create weekly reports. Please check your application status and ensure all interview steps are completed.');
      return;
    }
    // Open the working simple weekly report modal
    setShowWeeklySimpleModal(true);
  };

  const handleDownloadWeeklyReportPDF = async (reportId) => {
    try {
      console.log('📄 Downloading weekly report PDF:', reportId);
      await weeklyReportAPI.downloadReportPDF(reportId);
      toast.success('Weekly report PDF downloaded successfully!');
    } catch (error) {
      console.error('Error downloading weekly report PDF:', error);
      
      // Provide specific error messages based on error type
      if (error.message.includes('404') || error.message.includes('not found')) {
        toast.error('Weekly report not found. Please make sure the report exists.');
      } else if (error.message.includes('403') || error.message.includes('Unauthorized')) {
        toast.error('You are not authorized to download this report.');
      } else if (error.message.includes('500')) {
        toast.error('Server error occurred while generating PDF. Please try again.');
      } else {
        toast.error('Failed to download weekly report PDF. Please try again.');
      }
    }
  };

  // Handle downloading joining report PDF
  const handleDownloadJoiningReportPDF = async (reportId) => {
    try {
      console.log('📄 Downloading joining report PDF:', reportId);
      await joiningReportAPI.downloadJoiningReportPDF(reportId);
      toast.success('Joining report PDF downloaded successfully!');
    } catch (error) {
      console.error('Error downloading joining report PDF:', error);
      
      // Check if it's a 404 error (report not found)
      if (error.message.includes('404') || error.message.includes('not found')) {
        toast.error('Joining report not found. Please make sure the report exists.');
      } else if (error.message.includes('403') || error.message.includes('Unauthorized')) {
        toast.error('You are not authorized to download this report.');
      } else {
        toast.error('Failed to download joining report PDF. Please try again.');
      }
    }
  };

  // Handle downloading internship report PDF
  const handleDownloadInternshipReportPDF = async (reportId) => {
    try {
      console.log('📄 Downloading internship report PDF:', reportId);
      await internshipReportAPI.downloadPDF(reportId);
      toast.success('Internship report PDF downloaded successfully!');
    } catch (error) {
      console.error('Error downloading internship report PDF:', error);
      
      // Check if it's a 404 error (report not found)
      if (error.message.includes('404') || error.message.includes('not found')) {
        toast.error('Internship report not found. Please make sure the report exists.');
      } else if (error.message.includes('403') || error.message.includes('Unauthorized')) {
        toast.error('You are not authorized to download this report.');
      } else {
        toast.error('Failed to download internship report PDF. Please try again.');
      }
    }
  };

  // Handle viewing report details
  const handleViewReport = (report) => {
    setSelectedViewReport(report);
    setShowViewModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted': return 'success';
      case 'pending': return 'warning';
      case 'approved': return 'info';
      default: return 'default';
    }
  };

  const renderReportForm = () => {
    switch (selectedReportType) {
      case 'joining':
        return (
          <div className="space-y-8">
            {/* Internship Details Section */}
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-2">
                <h4 className="text-lg font-semibold text-gray-900">Internship Details</h4>
                <p className="text-sm text-gray-600">Your internship information (auto-filled)</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Input
                    label="Company Name"
                    disabled
                    value={formData.organizationName || ''}
                    className="bg-gray-50 border-gray-200"
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    label="Supervisor Name"
                    disabled
                    value={formData.supervisorName || ''}
                    className="bg-gray-50 border-gray-200"
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    label="Internship Start Date"
                    type="date"
                    disabled
                    value={formData.internshipStartDate || ''}
                    className="bg-gray-50 border-gray-200"
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    label="Internship End Date"
                    type="date"
                    disabled
                    value={formData.internshipEndDate || ''}
                    className="bg-gray-50 border-gray-200"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Input
                  label="Supervisor Email"
                  type="email"
                  disabled
                  value={formData.supervisorEmail || ''}
                  className="bg-gray-50 border-gray-200"
                />
              </div>
            </div>

            {/* Student Thoughts Section */}
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-2">
                <h4 className="text-lg font-semibold text-gray-900">Your Thoughts</h4>
                <p className="text-sm text-gray-600">Share your experience and expectations</p>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">
                  Student Thoughts on Joining <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 resize-none"
                  rows="6"
                  placeholder="Share your thoughts about joining this internship (minimum 10 characters)..."
                  value={formData.studentThoughts || ''}
                  onChange={(e) => setFormData({...formData, studentThoughts: e.target.value})}
                  required
                  minLength="10"
                />
                <div className="flex justify-between items-center">
                  {(formData.studentThoughts || '').length > 0 && (formData.studentThoughts || '').length < 10 && (
                    <p className="text-red-600 text-sm font-medium">
                      ⚠️ Please write at least 10 characters
                    </p>
                  )}
                  <p className="text-sm text-gray-500 ml-auto">
                    {(formData.studentThoughts || '').length}/500 characters
                  </p>
                </div>
              </div>
            </div>

            {/* Acknowledgment Section */}
            <div className="space-y-4">
              <div className="border-b border-gray-200 pb-2">
                <h4 className="text-lg font-semibold text-gray-900">Acknowledgment</h4>
                <p className="text-sm text-gray-600">Confirm your commitment</p>
              </div>

              <div className="bg-[#003366]/5 border border-[#003366]/20 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="acknowledgment"
                    checked={formData.acknowledgment || false}
                    onChange={(e) => setFormData({...formData, acknowledgment: e.target.checked})}
                    className="h-5 w-5 text-[#003366] border border-gray-300 rounded focus:ring-[#003366] mt-0.5"
                    required
                  />
                  <div className="space-y-1">
                    <label htmlFor="acknowledgment" className="text-sm font-semibold text-gray-900 cursor-pointer">
                      I confirm that I have joined the internship on the mentioned date <span className="text-red-500">*</span>
                    </label>
                    <p className="text-xs text-gray-600">
                      By checking this box, you acknowledge that all provided information is accurate and complete.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'weekly':
        return (
          <div className="space-y-8">
            {/* Week Selection */}
            <div className="space-y-4">
              <div className="border-b border-gray-200 pb-2">
                <h4 className="text-lg font-semibold text-gray-900">Week Information</h4>
                <p className="text-sm text-gray-600">Select the week you&apos;re reporting for</p>
              </div>
              <div className="max-w-xs">
                <Select
                  label="Week Number"
                  required
                  options={Array.from({length: 12}, (_, i) => ({
                    value: i + 1,
                    label: `Week ${i + 1}`
                  }))}
                  value={formData.weekNumber || ''}
                  onChange={(e) => setFormData({...formData, weekNumber: e.target.value})}
                />
              </div>
            </div>

            {/* Tasks and Challenges */}
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-2">
                <h4 className="text-lg font-semibold text-gray-900">Weekly Progress</h4>
                <p className="text-sm text-gray-600">Document your accomplishments and challenges</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    Tasks Completed <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 resize-none"
                    rows="4"
                    placeholder="Describe the tasks you completed this week..."
                    value={formData.tasksCompleted || ''}
                    onChange={(e) => setFormData({...formData, tasksCompleted: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    Challenges Faced
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 resize-none"
                    rows="4"
                    placeholder="Describe any challenges you encountered and how you overcame them..."
                    value={formData.challenges || ''}
                    onChange={(e) => setFormData({...formData, challenges: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'internship':
        return (
          <div className="space-y-8">
            {/* Acknowledgement */}
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-2">
                <h4 className="text-lg font-semibold text-gray-900">Acknowledgement</h4>
                <p className="text-sm text-gray-600">Express gratitude and acknowledgment</p>
              </div>
              <div className="space-y-3">
                <textarea
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 resize-none"
                  rows="4"
                  placeholder="Acknowledge the support you received during your internship..."
                  value={formData.acknowledgement || ''}
                  onChange={(e) => setFormData({...formData, acknowledgement: e.target.value})}
                  required
                />
              </div>
            </div>

            {/* Executive Summary */}
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-2">
                <h4 className="text-lg font-semibold text-gray-900">Executive Summary</h4>
                <p className="text-sm text-gray-600">Brief overview of your internship experience</p>
              </div>
              <div className="space-y-3">
                <textarea
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 resize-none"
                  rows="4"
                  placeholder="Provide a concise summary of your internship experience..."
                  value={formData.executiveSummary || ''}
                  onChange={(e) => setFormData({...formData, executiveSummary: e.target.value})}
                  required
                />
              </div>
            </div>

            {/* Table of Contents */}
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-2">
                <h4 className="text-lg font-semibold text-gray-900">Table of Contents</h4>
                <p className="text-sm text-gray-600">Outline the structure of your report</p>
              </div>
              <div className="space-y-3">
                <textarea
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 resize-none"
                  rows="4"
                  placeholder="List the main sections and topics covered in your report..."
                  value={formData.tableOfContents || ''}
                  onChange={(e) => setFormData({...formData, tableOfContents: e.target.value})}
                  required
                />
              </div>
            </div>

            {/* Work Samples / Project Summaries */}
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-2">
                <h4 className="text-lg font-semibold text-gray-900">Work Samples / Project Summaries</h4>
                <p className="text-sm text-gray-600">Detail your project work and contributions</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    Project Requirements <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 resize-none"
                    rows="4"
                    placeholder="Describe the project requirements and objectives..."
                    value={formData.projectRequirements || ''}
                    onChange={(e) => setFormData({...formData, projectRequirements: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    Approach & Tools Used <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 resize-none"
                    rows="4"
                    placeholder="Explain your approach and the tools/technologies you used..."
                    value={formData.approachAndTools || ''}
                    onChange={(e) => setFormData({...formData, approachAndTools: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    Outcomes Achieved <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 resize-none"
                    rows="4"
                    placeholder="Describe the outcomes and results achieved..."
                    value={formData.outcomesAchieved || ''}
                    onChange={(e) => setFormData({...formData, outcomesAchieved: e.target.value})}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Learning Experiences */}
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-2">
                <h4 className="text-lg font-semibold text-gray-900">Learning Experiences</h4>
                <p className="text-sm text-gray-600">Reflect on your learning and growth</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    Knowledge Acquired <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 resize-none"
                    rows="4"
                    placeholder="What new knowledge did you acquire during the internship..."
                    value={formData.knowledgeAcquired || ''}
                    onChange={(e) => setFormData({...formData, knowledgeAcquired: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    Skills Learned <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 resize-none"
                    rows="4"
                    placeholder="What technical and soft skills did you develop..."
                    value={formData.skillsLearned || ''}
                    onChange={(e) => setFormData({...formData, skillsLearned: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    Attitudes & Values Gained <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 resize-none"
                    rows="4"
                    placeholder="How did this experience shape your professional attitudes and values..."
                    value={formData.attitudesAndValues || ''}
                    onChange={(e) => setFormData({...formData, attitudesAndValues: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    Most Challenging Task Performed <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 resize-none"
                    rows="4"
                    placeholder="Describe the most challenging task you performed and how you handled it..."
                    value={formData.challengingTask || ''}
                    onChange={(e) => setFormData({...formData, challengingTask: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    Challenges Faced & Solutions <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 resize-none"
                    rows="4"
                    placeholder="Detail the challenges you faced and how you overcame them..."
                    value={formData.challengesAndSolutions || ''}
                    onChange={(e) => setFormData({...formData, challengesAndSolutions: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    Reflection & Conclusion <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 resize-none"
                    rows="4"
                    placeholder="Reflect on your overall internship experience and draw conclusions..."
                    value={formData.reflectionAndConclusion || ''}
                    onChange={(e) => setFormData({...formData, reflectionAndConclusion: e.target.value})}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Appendices (Supporting Documents) */}
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-2">
                <h4 className="text-lg font-semibold text-gray-900">Appendices (Supporting Documents)</h4>
                <p className="text-sm text-gray-600">Upload supporting files and documents</p>
              </div>

              <div className="space-y-3">
                <div className="border border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    onChange={(e) => setFormData({...formData, appendices: Array.from(e.target.files)})}
                  />
                  <p className="text-sm text-gray-600 mt-2">
                    Accepted formats: PDF, DOC, DOCX, JPG, PNG, GIF. Maximum 10 files, 10MB each.
                  </p>
                </div>

                {formData.appendices && formData.appendices.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="text-sm font-semibold text-gray-700">Selected Files:</h5>
                    <ul className="space-y-1">
                      {Array.from(formData.appendices).map((file, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-center space-x-2">
                          <FileText className="w-4 h-4" />
                          <span>{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      
      case 'completion':
        return (
          <div className="space-y-8">
            {/* Final Report Section */}
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-2">
                <h4 className="text-lg font-semibold text-gray-900">Final Report</h4>
                <p className="text-sm text-gray-600">Submit your comprehensive internship completion report</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    Report Summary <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 resize-none"
                    rows="6"
                    placeholder="Provide a comprehensive summary of your internship experience, achievements, and learnings..."
                    value={formData.reportSummary || ''}
                    onChange={(e) => setFormData({...formData, reportSummary: e.target.value})}
                    required
                    minLength="50"
                  />
                  <p className="text-xs text-gray-500">Minimum 50 characters required</p>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    Key Achievements <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 resize-none"
                    rows="4"
                    placeholder="List your major accomplishments and contributions during the internship..."
                    value={formData.keyAchievements || ''}
                    onChange={(e) => setFormData({...formData, keyAchievements: e.target.value})}
                    required
                    minLength="30"
                  />
                  <p className="text-xs text-gray-500">Minimum 30 characters required</p>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    Future Plans <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 resize-none"
                    rows="4"
                    placeholder="Describe your career goals and how this internship has influenced your professional development..."
                    value={formData.futurePlans || ''}
                    onChange={(e) => setFormData({...formData, futurePlans: e.target.value})}
                    required
                    minLength="30"
                  />
                  <p className="text-xs text-gray-500">Minimum 30 characters required</p>
                </div>
              </div>
            </div>

            {/* Skills and Learning Section */}
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-2">
                <h4 className="text-lg font-semibold text-gray-900">Skills & Learning</h4>
                <p className="text-sm text-gray-600">Detail the skills you acquired and learning outcomes</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    Technical Skills Acquired <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 resize-none"
                    rows="4"
                    placeholder="List the technical skills, tools, and technologies you learned..."
                    value={formData.technicalSkills || ''}
                    onChange={(e) => setFormData({...formData, technicalSkills: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    Soft Skills Developed <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 resize-none"
                    rows="4"
                    placeholder="Describe communication, teamwork, leadership, and other soft skills you developed..."
                    value={formData.softSkills || ''}
                    onChange={(e) => setFormData({...formData, softSkills: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    Overall Learning Experience <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 resize-none"
                    rows="4"
                    placeholder="Reflect on your overall learning journey and personal growth..."
                    value={formData.overallLearning || ''}
                    onChange={(e) => setFormData({...formData, overallLearning: e.target.value})}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Performance & Projects Section */}
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-2">
                <h4 className="text-lg font-semibold text-gray-900">Performance & Projects</h4>
                <p className="text-sm text-gray-600">Evaluate your performance and project contributions</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    Projects Completed <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 resize-none"
                    rows="4"
                    placeholder="Detail the projects you worked on and your specific contributions..."
                    value={formData.projectsCompleted || ''}
                    onChange={(e) => setFormData({...formData, projectsCompleted: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    Self-Performance Rating <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                    value={formData.performanceRating || ''}
                    onChange={(e) => setFormData({...formData, performanceRating: e.target.value})}
                    required
                  >
                    <option value="">Select your performance rating</option>
                    <option value="5">Excellent (5/5)</option>
                    <option value="4">Very Good (4/5)</option>
                    <option value="3">Good (3/5)</option>
                    <option value="2">Fair (2/5)</option>
                    <option value="1">Needs Improvement (1/5)</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    Recommendation Letter Content <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 resize-none"
                    rows="5"
                    placeholder="Draft what you would like included in your recommendation letter..."
                    value={formData.recommendationLetter || ''}
                    onChange={(e) => setFormData({...formData, recommendationLetter: e.target.value})}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Document Upload Section */}
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-2">
                <h4 className="text-lg font-semibold text-gray-900">Documentation</h4>
                <p className="text-sm text-gray-600">Upload your completion certificate and appraisal form</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700">
                      Completion Certificate <span className="text-red-500">*</span>
                    </label>
                    <div className="border border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        onChange={(e) => setFormData({...formData, certificateFile: e.target.files[0]})}
                        required
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Accepted formats: PDF, JPG, JPEG, PNG. Maximum file size: 5MB
                      </p>
                    </div>
                    {formData.certificateFile && (
                      <div className="flex items-center space-x-2 text-sm text-green-600">
                        <FileText className="w-4 h-4" />
                        <span>{formData.certificateFile.name}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700">
                      Appraisal Form <span className="text-red-500">*</span>
                    </label>
                    <div className="border border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        onChange={(e) => setFormData({...formData, appraisalForm: e.target.files[0]})}
                        required
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Accepted formats: PDF, DOC, DOCX. Maximum file size: 10MB
                      </p>
                    </div>
                    {formData.appraisalForm && (
                      <div className="flex items-center space-x-2 text-sm text-green-600">
                        <FileText className="w-4 h-4" />
                        <span>{formData.appraisalForm.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Enhanced Header Section - COMSATS Design */}
      <div className="relative bg-gradient-to-r from-[#003366] via-[#00509E] to-[#003366] rounded-lg p-5 text-white shadow-md overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-white/10 rounded-lg shadow-sm">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-1 text-white">
                  Reports Dashboard
                </h1>
                <p className="text-blue-100 text-sm font-medium">
                  Manage and submit your internship reports
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-blue-200 text-xs font-medium">Status Overview</p>
                <div className="flex items-center gap-1 mt-1">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-white font-bold text-sm">Active</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Quick Stats - COMSATS Compact */}
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center gap-1 mb-0.5">
                <Calendar className="w-3 h-3 text-blue-200" />
                <span className="text-blue-200 text-xs font-medium">Weekly Reports</span>
              </div>
              <p className="text-white font-bold text-sm">{weeklyReports.length}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center gap-1 mb-0.5">
                <FileText className="w-3 h-3 text-blue-200" />
                <span className="text-blue-200 text-xs font-medium">Joining Report</span>
              </div>
              <p className="text-white font-bold text-sm">
                {eligibilityData?.hasExistingReport ? 'Submitted' : 'Pending'}
              </p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center gap-1 mb-0.5">
                <Award className="w-3 h-3 text-blue-200" />
                <span className="text-blue-200 text-xs font-medium">Internship Report</span>
              </div>
              <p className="text-white font-bold text-sm">
                {internshipReport ? 'Submitted' : 'Not Submitted'}
              </p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center gap-1 mb-0.5">
                <Trophy className="w-3 h-3 text-blue-200" />
                <span className="text-blue-200 text-xs font-medium">Completion</span>
              </div>
              <p className="text-white font-bold text-sm">
                {completionCertificate ? 'Completed' : 'In Progress'}
              </p>
            </div>
          </div>
        </div>
      </div>
      

      {/* Enhanced Quick Actions - COMSATS Compact */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-[#003366] flex items-center gap-2">
            <div className="w-6 h-6 bg-[#003366] rounded-md flex items-center justify-center">
              <Plus className="w-3 h-3 text-white" />
            </div>
            Quick Actions
          </h3>
          <div className="text-xs text-gray-600 bg-gray-100 px-3 py-1 rounded-full font-medium">
            4 Report Types Available
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {reportTypes.map((type, index) => {
            const colors = [
              { bg: 'bg-[#00509E]', card: 'border-[#00509E]/20 hover:border-[#00509E]', text: 'text-[#00509E]', icon: 'bg-[#00509E]/10' },
              { bg: 'bg-green-600', card: 'border-green-200 hover:border-green-300', text: 'text-green-600', icon: 'bg-green-100' },
              { bg: 'bg-purple-600', card: 'border-purple-200 hover:border-purple-300', text: 'text-purple-600', icon: 'bg-purple-100' },
              { bg: 'bg-orange-600', card: 'border-orange-200 hover:border-orange-300', text: 'text-orange-600', icon: 'bg-orange-100' }
            ];
            const color = colors[index % colors.length];
            
            return (
              <Card key={type.value} className={`p-4 cursor-pointer hover:shadow-lg transition-all duration-300 border ${color.card} bg-white transform hover:scale-105`}>
                <div className="text-center space-y-4">
                  <div className={`${color.bg} p-4 rounded-xl w-16 h-16 mx-auto flex items-center justify-center shadow-lg`}>
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-bold text-gray-900 text-lg">{type.label}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {type.value === 'joining' ? 'Submit your joining report' :
                       type.value === 'weekly' ? 'Weekly progress updates' :
                       type.value === 'internship' ? 'Final internship report' :
                       'Completion certificate'}
                    </p>
                  </div>
                  {type.value === 'weekly' ? (
                    <Button
                      size="sm"
                      onClick={() => setShowWeeklySimpleModal(true)}
                      disabled={!isStudentHiredWithInternshipForm()}
                      className={`w-full font-bold shadow-md ${color.text} hover:text-white transition-all duration-200`}
                    >
                      {!isStudentHiredWithInternshipForm() ? (
                        <><Plus className="w-4 h-4 mr-2" />Not Eligible</>
                      ) : (
                        <><Plus className="w-4 h-4 mr-2" />Create</>
                      )}
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleCreateReport(type.value)}
                      disabled={
                        (type.value === 'joining' && eligibilityData !== null && (!eligibilityData?.canCreate || !isStudentHiredWithInternshipForm())) ||
                        (type.value === 'internship' && internshipEligibility !== null && (!internshipEligibility?.canCreate || !isStudentHiredWithInternshipForm())) ||
                        (type.value === 'completion' && completionEligibility !== null && (!completionEligibility?.canSubmit || !isStudentHiredWithInternshipForm()))
                      }
                      variant={
                        (type.value === 'joining' && eligibilityData?.hasExistingReport) ||
                        (type.value === 'internship' && internshipEligibility?.hasExistingReport) ||
                        (type.value === 'completion' && completionEligibility?.hasExisting) ? 'success' : 'default'
                      }
                      className="w-full font-bold shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      {type.value === 'joining' ? (
                        eligibilityData === null ? (
                          <><Plus className="w-4 h-4 mr-2" />Loading...</>
                        ) : eligibilityData.hasExistingReport ? (
                          <><CheckCircle className="w-4 h-4 mr-2" />Submitted</>
                        ) : eligibilityData.canCreate && isStudentHiredWithInternshipForm() ? (
                          <><Plus className="w-4 h-4 mr-2" />Create</>
                        ) : (
                          <><Plus className="w-4 h-4 mr-2" />Not Eligible</>
                        )
                      ) : type.value === 'internship' ? (
                        internshipEligibility === null ? (
                          <><Plus className="w-4 h-4 mr-2" />Loading...</>
                        ) : internshipEligibility.hasExistingReport ? (
                          <><CheckCircle className="w-4 h-4 mr-2" />Submitted</>
                        ) : internshipEligibility.canCreate && isStudentHiredWithInternshipForm() ? (
                          <><Plus className="w-4 h-4 mr-2" />Create</>
                        ) : (
                          <><Plus className="w-4 h-4 mr-2" />Not Eligible</>
                        )
                      ) : type.value === 'completion' ? (
                        completionEligibility === null ? (
                          <><Plus className="w-4 h-4 mr-2" />Loading...</>
                        ) : completionEligibility.hasExisting ? (
                          <><CheckCircle className="w-4 h-4 mr-2" />Submitted</>
                        ) : completionEligibility.canSubmit && isStudentHiredWithInternshipForm() ? (
                          <><Plus className="w-4 h-4 mr-2" />Create</>
                        ) : (
                          <><Plus className="w-4 h-4 mr-2" />Not Eligible</>
                        )
                      ) : (
                        <><Plus className="w-4 h-4 mr-2" />Create</>
                      )}
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* 1. Joining Report Section - First in sequence - COMSATS Compact */}
      <div className="space-y-4">
        {/* Enhanced Section Header */}
        <div className="bg-gradient-to-r from-[#003366] to-[#00509E] rounded-lg p-4 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/10 rounded-lg">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Joining Report</h3>
                <p className="text-blue-100 mt-0.5 text-sm">Initial internship joining documentation</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold">{reports.length}</div>
              <div className="text-blue-200 text-xs">Reports</div>
            </div>
          </div>
        </div>

        {reports.length > 0 ? reports.map((report, index) => (
          <Card key={report._id || report.id || index} className="p-5 shadow-md border border-gray-200 hover:border-blue-300 bg-blue-50 hover:shadow-lg transition-all duration-300">
            <div className="space-y-4">
              {/* Enhanced Header - COMSATS Compact */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-[#003366] shadow-sm">
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-lg font-bold text-[#003366]">
                      {report.title || 'Joining Report'}
                    </h4>
                    <div className="flex items-center space-x-3">
                      <Badge className={`px-2 py-1 font-bold text-xs border-0 ${
                        report.status === 'approved' ? 'bg-green-100 text-green-800' :
                        report.status === 'submitted' ? 'bg-amber-100 text-amber-800' :
                        report.status === 'pending' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {report.status === 'approved' ? '✅' : 
                         report.status === 'submitted' ? '⏳' : 
                         report.status === 'pending' ? '📋' : '📄'} {report.status?.charAt(0).toUpperCase() + report.status?.slice(1) || 'Pending Review'}
                      </Badge>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <span className="text-sm font-medium">
                          ID: {report._id?.slice(-8) || report.id || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => handleViewReport(report)}
                    className="px-4 py-2 font-bold border-[#003366]/30 text-[#003366] hover:bg-[#003366]/5 text-sm"
                  >
                    <FileText className="w-3 h-3 mr-1" />
                    View Details
                  </Button>
                  <Button
                    onClick={() => handleDownloadJoiningReportPDF(report._id)}
                    className="px-4 py-2 font-bold bg-[#003366] hover:bg-[#00509E] text-white text-sm transition-all duration-300 transform hover:scale-105"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Download PDF
                  </Button>
                </div>
              </div>

              {/* Information Grid - COMSATS Compact */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                  <div className="text-xs font-medium text-gray-600 mb-0.5">Submitted Date</div>
                  <div className="text-sm font-bold text-gray-900 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-[#003366]" />
                    {new Date(report.reportDate || report.submittedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
                {(report.companyName || report.organization || report.companyId?.name) && (
                  <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                    <div className="text-xs font-medium text-gray-600 mb-0.5">Company</div>
                    <div className="text-sm font-bold text-gray-900">
                      {report.companyName || report.organization || report.companyId?.name}
                    </div>
                  </div>
                )}
                {(report.supervisorName || report.supervisor || report.supervisorId?.name) && (
                  <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                    <div className="text-xs font-medium text-gray-600 mb-0.5">Supervisor</div>
                    <div className="text-sm font-bold text-gray-900">
                      {report.supervisorName || report.supervisor || report.supervisorId?.name}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )) : (
          <Card className="p-12 text-center bg-[#003366]/5 border border-dashed border-[#003366]/30 hover:border-[#003366]/50 transition-all duration-300">
            <div className="space-y-4">
              <div className="p-4 bg-[#003366] rounded-full w-16 h-16 mx-auto flex items-center justify-center shadow-md">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-[#003366]">
                  No Joining Report Submitted Yet
                </h3>
                <p className="text-gray-600 max-w-md mx-auto text-sm leading-relaxed">
                  Submit your joining report to get started with your internship journey.
                  This is the first step in your internship documentation.
                </p>
              </div>
              <div className="flex justify-center space-x-4 pt-4">
                <Button
                  onClick={() => handleCreateReport('joining')}
                  disabled={!eligibilityData?.canCreate || !isStudentHiredWithInternshipForm()}
                  className={`px-6 py-3 font-bold text-sm shadow-md hover:shadow-lg transition-all duration-200 ${
                    eligibilityData?.canCreate && isStudentHiredWithInternshipForm()
                      ? 'bg-[#003366] hover:bg-[#003366]/90 text-white' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {eligibilityData === null ? 'Loading...' :
                   eligibilityData?.canCreate && isStudentHiredWithInternshipForm() ? 'Create Joining Report' :
                   eligibilityData?.hasExistingReport ? 'Already Submitted' :
                   !isStudentHiredWithInternshipForm() ? 'Not Hired/No Internship Form' :
                   eligibilityData?.reason || 'Not Available'}
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* 2. Enhanced Weekly Reports - Second in sequence - COMSATS Compact */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-[#003366] flex items-center gap-2">
            <div className="w-6 h-6 bg-green-600 rounded-md flex items-center justify-center">
              <Calendar className="w-3 h-3 text-white" />
            </div>
            Weekly Reports
            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">2nd in sequence</span>
          </h3>
          <div className="flex items-center gap-2">
            <div className="text-xs text-green-600 bg-green-50 px-3 py-1 rounded-full font-medium">
              {weeklyReports.length} report{weeklyReports.length !== 1 ? 's' : ''}
            </div>
            <Button
              onClick={handleOpenWeeklyReport}
              disabled={!isStudentHiredWithInternshipForm()}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 font-medium shadow-sm text-sm"
            >
              <Plus className="w-3 h-3 mr-1" />
              Create New
            </Button>
          </div>
        </div>

        {loading ? (
          <Card className="p-8 text-center bg-gradient-to-br from-[#003366]/5 to-[#00509E]/5 border border-gray-200">
            <div className="space-y-3">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#003366] border-t-transparent"></div>
              <p className="text-sm font-medium text-[#003366]">Loading weekly reports...</p>
              <p className="text-xs text-gray-600">Please wait while we fetch your data</p>
            </div>
          </Card>
        ) : weeklyReports.length === 0 ? (
          <Card className="p-8 text-center bg-gradient-to-br from-gray-50 to-gray-100 border border-dashed border-gray-300 hover:border-gray-400 transition-all duration-300">
            <div className="space-y-4">
              <div className="relative">
                <div className="p-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-16 h-16 mx-auto flex items-center justify-center shadow-md">
                  <FileText className="w-8 h-8 text-gray-500" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center shadow-sm">
                  <Plus className="w-3 h-3 text-yellow-800" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-gray-900">No Weekly Reports Submitted</h3>
                <p className="text-gray-600 max-w-md mx-auto leading-relaxed text-sm">
                  You haven&apos;t submitted any weekly reports yet. Start tracking your progress by creating your first weekly report.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={handleOpenWeeklyReport}
                  disabled={!isStudentHiredWithInternshipForm()}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 font-bold shadow-md hover:shadow-lg transition-all duration-200 text-sm"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  {!isStudentHiredWithInternshipForm()
                    ? 'Must Be Hired & Have Internship Form' 
                    : 'Create Your First Weekly Report'}
                </Button>
                {!isStudentHiredWithInternshipForm() && (
                  <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-md">
                    💡 You need to be hired by a company and have a completed internship form
                  </div>
                )}
              </div>
            </div>
          </Card>
        ) : (
          <div className="grid gap-8">
            {weeklyReports.map((report, index) => {
              const colors = [
                { bg: 'from-green-500 to-emerald-500', card: 'border-green-200 hover:border-green-300 bg-green-50', badge: 'bg-green-100 text-green-800' },
                { bg: 'from-blue-500 to-cyan-500', card: 'border-blue-200 hover:border-blue-300 bg-blue-50', badge: 'bg-blue-100 text-blue-800' },
                { bg: 'from-purple-500 to-violet-500', card: 'border-purple-200 hover:border-purple-300 bg-purple-50', badge: 'bg-purple-100 text-purple-800' },
                { bg: 'from-orange-500 to-red-500', card: 'border-orange-200 hover:border-orange-300 bg-orange-50', badge: 'bg-orange-100 text-orange-800' }
              ];
              const color = colors[index % colors.length];
              
              return (
                <Card key={report._id} className={`p-5 shadow-md border ${color.card} hover:shadow-lg transition-all duration-300`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-4">
                      {/* Header - COMSATS Compact */}
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-r ${color.bg} shadow-sm`}>
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-lg font-bold text-[#003366]">
                            Week {report.weekNumber} Report
                          </h4>
                          <div className="flex items-center space-x-3">
                            <Badge className={`px-2 py-1 font-bold text-xs ${color.badge} border-0`}>
                              ✅ Submitted
                            </Badge>
                            <div className="flex items-center space-x-1 text-gray-600">
                              <Calendar className="w-3 h-3" />
                              <span className="font-medium text-xs">
                                {new Date(report.submittedAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Information Grid - COMSATS Compact */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                          <div className="text-xs font-medium text-gray-600 mb-0.5">Week Number</div>
                          <div className="text-sm font-bold text-gray-900">Week {report.weekNumber}</div>
                        </div>
                        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                          <div className="text-xs font-medium text-gray-600 mb-0.5">Status</div>
                          <div className="text-sm font-bold text-gray-900 capitalize">{report.status}</div>
                        </div>
                        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                          <div className="text-xs font-medium text-gray-600 mb-0.5">Supervisor</div>
                          <div className="text-sm font-bold text-gray-900">{report.supervisorName}</div>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                          <div className="text-sm font-medium text-gray-600 mb-1">Company</div>
                          <div className="text-lg font-bold text-gray-900">{report.companyName || 'N/A'}</div>
                        </div>
                      </div>

                      {/* Enhanced Tasks Preview */}
                      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <h5 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <FileText className="w-5 h-5 text-blue-600" />
                          Tasks Completed This Week
                        </h5>
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <p className="text-gray-700 leading-relaxed break-words">
                            {report.tasksCompleted && report.tasksCompleted.length > 200 
                              ? `${report.tasksCompleted.substring(0, 200)}...` 
                              : report.tasksCompleted || 'No tasks description provided'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                      <Button
                        onClick={() => handleDownloadWeeklyReportPDF(report._id)}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 font-bold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                      >
                        <Download className="w-5 h-5 mr-2" />
                        Download PDF
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Final Internship Report - Third in sequence - COMSATS Compact */}
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-[#003366] to-purple-600 rounded-lg p-4 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/10 rounded-lg">
                <Award className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Final Internship Report</h3>
                <p className="text-purple-100 mt-0.5 text-sm">Comprehensive internship evaluation and documentation</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold">{internshipReport ? '1' : '0'}</div>
              <div className="text-purple-200 text-xs">3rd in sequence</div>
            </div>
          </div>
        </div>

        {internshipReport ? (
          <Card className="p-5 shadow-md border border-gray-200 hover:border-purple-300 bg-purple-50 hover:shadow-lg transition-all duration-300">
            <div className="space-y-4">
              {/* Enhanced Header - COMSATS Compact */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-[#003366] shadow-sm">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-lg font-bold text-[#003366]">
                      Final Internship Report
                    </h4>
                    <div className="flex items-center space-x-3">
                      <Badge className="px-2 py-1 font-bold text-xs bg-purple-100 text-purple-800 border-0">
                        ✅ {internshipReport.status?.charAt(0).toUpperCase() + internshipReport.status?.slice(1)}
                      </Badge>
                      <div className="flex items-center space-x-1 text-gray-600">
                        <Calendar className="w-3 h-3" />
                        <span className="font-medium text-xs">
                          Submitted: {new Date(internshipReport.submittedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => handleViewReport(internshipReport)}
                    variant="outline"
                    className="px-4 py-2 font-bold border-[#003366]/30 text-[#003366] hover:bg-[#003366]/5 text-sm"
                  >
                    <FileText className="w-3 h-3 mr-1" />
                    View Details
                  </Button>
                  {internshipReport._id && internshipReport.submittedAt && (
                    <Button
                      onClick={() => handleDownloadInternshipReportPDF(internshipReport._id)}
                      className="bg-[#003366] hover:bg-[#003366]/90 text-white px-3 py-2 font-bold shadow-sm hover:shadow-md transition-all duration-200 text-sm"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Download PDF
                    </Button>
                  )}
                </div>
              </div>

              {/* Information Grid - COMSATS Compact */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                  <div className="text-xs font-medium text-gray-600 mb-0.5">Student</div>
                  <div className="text-sm font-bold text-gray-900">
                    {internshipReport.studentId?.name || internshipReport.studentName || 'N/A'}
                  </div>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                  <div className="text-xs font-medium text-gray-600 mb-0.5">Status</div>
                  <div className="text-sm font-bold text-gray-900 capitalize">{internshipReport.status}</div>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                  <div className="text-xs font-medium text-gray-600 mb-0.5">Supervisor</div>
                  <div className="text-sm font-bold text-gray-900">
                    {internshipReport.supervisorId?.name || internshipReport.supervisorName || 'N/A'}
                  </div>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                  <div className="text-xs font-medium text-gray-600 mb-0.5">Company</div>
                  <div className="text-sm font-bold text-gray-900">
                    {internshipReport.companyId?.companyName || internshipReport.companyName || 'N/A'}
                  </div>
                </div>
              </div>

              {/* Executive Summary Preview - COMSATS Compact */}
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <h5 className="font-bold text-[#003366] mb-3 flex items-center gap-1">
                  <FileText className="w-3 h-3 text-purple-600" />
                  Executive Summary Preview
                </h5>
                <div className="bg-purple-50 rounded-md p-3 border border-purple-200">
                  <p className="text-purple-900 leading-relaxed break-words text-sm">
                    {internshipReport.executiveSummary && internshipReport.executiveSummary.length > 250 
                      ? `${internshipReport.executiveSummary.substring(0, 250)}...` 
                      : internshipReport.executiveSummary || 'No executive summary provided'}
                  </p>
                </div>
              </div>

              {/* Supervisor Feedback */}
              {internshipReport.supervisorFeedback && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-green-200">
                  <h5 className="font-bold text-green-900 mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-green-600" />
                    Supervisor Feedback
                  </h5>
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <p className="text-green-800 leading-relaxed break-words">
                      {internshipReport.supervisorFeedback}
                    </p>
                    {internshipReport.grade && (
                      <div className="mt-4 flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        <span className="text-green-900 font-bold text-lg">Grade: {internshipReport.grade}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </Card>
        ) : (
          <Card className="p-8 text-center bg-gray-50 border-2 border-dashed border-gray-300">
            <div className="space-y-4">
              <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Final Internship Report</h3>
                <p className="text-gray-600">
                  Submit your comprehensive internship report including project summaries, learning experiences, and reflections.
                </p>
              </div>
              <Button
                onClick={() => handleCreateReport('internship')}
                disabled={!internshipEligibility?.canCreate || !isStudentHiredWithInternshipForm()}
                className={`px-6 py-2 mt-4 ${
                  internshipEligibility?.canCreate && isStudentHiredWithInternshipForm()
                    ? 'bg-[#003366] hover:bg-[#00509E] text-white' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Plus className="w-4 h-4 mr-2" />
                {internshipEligibility === null ? 'Loading...' : 
                 internshipEligibility?.canCreate && isStudentHiredWithInternshipForm() ? 'Submit Internship Report' : 
                 !isStudentHiredWithInternshipForm() ? 'Not Hired/No Internship Form' :
                 !internshipEligibility?.hasSupervisor ? 'No Supervisor' : 'Not Available'}
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* 4. Completion Certificate - Fourth in sequence - COMSATS Compact */}
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-[#003366] to-green-600 rounded-lg p-4 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/10 rounded-lg">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Completion Certificate</h3>
                <p className="text-green-100 mt-0.5 text-sm">Final internship completion documentation</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold">{completionCertificate ? '1' : '0'}</div>
              <div className="text-green-200 text-xs">4th in sequence</div>
            </div>
          </div>
        </div>

        {completionCertificate ? (
          <Card className="p-5 shadow-md border border-gray-200 hover:border-green-300 bg-green-50 hover:shadow-lg transition-all duration-300">
            <div className="space-y-4">
              {/* Enhanced Header - COMSATS Compact */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-[#003366] shadow-sm">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-lg font-bold text-[#003366]">
                      Internship Completion Certificate
                    </h4>
                    <div className="flex items-center space-x-3">
                      <Badge className={`px-2 py-1 font-bold text-xs border-0 ${
                        completionCertificate.status === 'approved' ? 'bg-green-100 text-green-800' :
                        completionCertificate.status === 'submitted' ? 'bg-amber-100 text-amber-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {completionCertificate.status === 'approved' ? '✅' : 
                         completionCertificate.status === 'submitted' ? '⏳' : '📋'} {completionCertificate.status?.charAt(0).toUpperCase() + completionCertificate.status?.slice(1)}
                      </Badge>
                      <div className="flex items-center space-x-1 text-gray-600">
                        <Calendar className="w-5 h-5" />
                        <span className="font-medium">
                          Submitted: {new Date(completionCertificate.submittedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <Button
                    onClick={() => completionCertificateAPI.downloadPDF(completionCertificate._id)}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 font-bold shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </div>

              {/* Information Grid - COMSATS Compact */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 hover:border-[#00509E] transition-colors">
                  <div className="text-xs font-medium text-gray-600 mb-1">Certificate No</div>
                  <div className="text-sm font-bold text-[#003366]">{completionCertificate.certificateNumber}</div>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 hover:border-[#00509E] transition-colors">
                  <div className="text-xs font-medium text-gray-600 mb-1">Performance Rating</div>
                  <div className="text-sm font-bold text-[#003366] flex items-center gap-1">
                    <Trophy className="w-3 h-3 text-yellow-500" />
                    {completionCertificate.performanceRating}/5 ⭐
                  </div>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 hover:border-[#00509E] transition-colors">
                  <div className="text-xs font-medium text-gray-600 mb-1">Status</div>
                  <div className="text-sm font-bold text-[#003366] capitalize">{completionCertificate.status}</div>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 hover:border-[#00509E] transition-colors">
                  <div className="text-xs font-medium text-gray-600 mb-1">Company</div>
                  <div className="text-sm font-bold text-[#003366]">{completionCertificate.companyName}</div>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 hover:border-[#00509E] transition-colors">
                  <div className="text-xs font-medium text-gray-600 mb-1">Duration</div>
                  <div className="text-sm font-bold text-[#003366]">{completionCertificate.internshipDuration}</div>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 hover:border-[#00509E] transition-colors">
                  <div className="text-xs font-medium text-gray-600 mb-1">Department</div>
                  <div className="text-sm font-bold text-[#003366]">{completionCertificate.department || 'N/A'}</div>
                </div>
              </div>

              {/* Key Achievements Preview - COMSATS Compact */}
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <h5 className="font-bold text-[#003366] mb-3 flex items-center gap-2 text-sm">
                  <Award className="w-4 h-4 text-[#00509E]" />
                  Key Achievements
                </h5>
                <div className="bg-[#003366]/5 rounded-lg p-3 border border-[#003366]/20">
                  <p className="text-[#003366] leading-relaxed break-words text-sm">
                    {completionCertificate.keyAchievements && completionCertificate.keyAchievements.length > 250 
                      ? `${completionCertificate.keyAchievements.substring(0, 250)}...` 
                      : completionCertificate.keyAchievements || 'No key achievements provided'}
                  </p>
                </div>
              </div>

              {/* Supervisor Feedback - COMSATS Compact */}
              {completionCertificate.supervisorFeedback && (
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                  <h5 className="font-bold text-[#003366] mb-3 flex items-center gap-2 text-sm">
                    <FileText className="w-4 h-4 text-[#00509E]" />
                    Supervisor Feedback
                  </h5>
                  <div className="bg-[#00509E]/5 rounded-lg p-3 border border-[#00509E]/20">
                    <p className="text-[#003366] leading-relaxed break-words text-sm">
                      {completionCertificate.supervisorFeedback}
                    </p>
                    {completionCertificate.supervisorGrade && (
                      <div className="mt-3 flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-yellow-500" />
                        <span className="text-[#003366] font-bold text-sm">Grade: {completionCertificate.supervisorGrade}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </Card>
        ) : (
          <Card className="p-8 text-center bg-[#003366]/5 border border-[#003366]/20 hover:border-[#00509E] transition-all duration-300">
            <div className="space-y-4">
              <div className="p-4 bg-[#003366] rounded-full w-16 h-16 mx-auto flex items-center justify-center shadow-sm">
                <Award className="w-8 h-8 text-white" />
              </div>
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-[#003366]">Completion Certificate</h3>
                <p className="text-gray-600 max-w-md mx-auto text-sm leading-relaxed">
                  Submit your final completion certificate with comprehensive evaluation and documentation.
                </p>
              </div>
              <div className="flex justify-center space-x-3 pt-3">
                <Button
                  onClick={() => handleCreateReport('completion')}
                  disabled={!completionEligibility?.canSubmit || !isStudentHiredWithInternshipForm()}
                  className={`px-4 py-2 font-bold text-sm shadow-sm hover:shadow-md transition-all duration-200 ${
                    completionEligibility?.canSubmit && isStudentHiredWithInternshipForm()
                      ? 'bg-[#003366] hover:bg-[#00509E] text-white' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {completionEligibility === null ? 'Loading...' : 
                   completionEligibility?.canSubmit && isStudentHiredWithInternshipForm() ? 'Submit Completion Certificate' : 
                   completionEligibility?.hasExisting ? 'Already Submitted' : 
                   !isStudentHiredWithInternshipForm() ? 'Not Hired/No Internship Form' :
                   completionEligibility?.reason || 'Not Available'}
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Report Creation Modal */}
      <Modal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        title={`Create ${reportTypes.find(r => r.value === selectedReportType)?.label}`}
        size="lg"
      >
        <div className="space-y-6">
          {renderReportForm()}

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => setShowReportModal(false)}
              className="px-4 py-2 font-medium text-sm border-gray-300 hover:border-gray-400"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitReport}
              disabled={loading}
              className="px-4 py-2 font-medium bg-[#003366] hover:bg-[#00509E] text-sm"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Submitting...</span>
                </div>
              ) : (
                'Submit Report'
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Weekly Report Quick Action Modal (new simple form) */}
      <Modal
        isOpen={showWeeklySimpleModal}
        onClose={() => setShowWeeklySimpleModal(false)}
        title="Create Weekly Report"
        size="lg"
      >
        <WeeklyReport 
          onSubmitSuccess={() => {
            fetchWeeklyReports();
            setShowWeeklySimpleModal(false);
          }}
          onClose={() => setShowWeeklySimpleModal(false)}
        />
      </Modal>

      {/* View Report Details Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedViewReport(null);
        }}
        title="Joining Report Details"
        size="lg"
      >
        {selectedViewReport && (
          <div className="space-y-4">
            {/* Student Information */}
            <div className="bg-[#003366]/5 p-3 rounded-lg border border-[#003366]/20">
              <h4 className="font-semibold text-[#003366] mb-2 text-sm">Report Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="font-medium text-[#003366]">Report Type:</span>
                  <p className="text-[#00509E]">{selectedViewReport.title || 'Joining Report'}</p>
                </div>
                <div>
                  <span className="font-medium text-[#003366]">Status:</span>
                  <Badge 
                    variant={getStatusColor(selectedViewReport.status)}
                    className="ml-2"
                  >
                    {selectedViewReport.status || 'Pending Review'}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium text-[#003366]">Submitted Date:</span>
                  <p className="text-[#00509E]">
                    {new Date(selectedViewReport.reportDate || selectedViewReport.submittedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-[#003366]">Report ID:</span>
                  <p className="text-[#00509E]">{selectedViewReport._id?.slice(-8) || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Company Details */}
            {(selectedViewReport.companyName || selectedViewReport.organization || selectedViewReport.companyId?.name) && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2 text-sm">Company Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="font-medium text-gray-700">Company:</span>
                    <p className="text-gray-900">
                      {selectedViewReport.companyName || selectedViewReport.organization || selectedViewReport.companyId?.name}
                    </p>
                  </div>
                  {(selectedViewReport.supervisorName || selectedViewReport.supervisor || selectedViewReport.supervisorId?.name) && (
                    <div>
                      <span className="font-medium text-gray-700">Supervisor:</span>
                      <p className="text-gray-900">
                        {selectedViewReport.supervisorName || selectedViewReport.supervisor || selectedViewReport.supervisorId?.name}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Report Content */}
            {selectedViewReport.studentThoughts && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2 text-sm">Student Thoughts & Reflections</h4>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm">
                  {selectedViewReport.studentThoughts}
                </p>
              </div>
            )}

            {/* Report Details */}
            {selectedViewReport.projectTitle && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2 text-sm">Project Information</h4>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="font-medium text-gray-700">Project Title:</span>
                    <p className="text-gray-900">{selectedViewReport.projectTitle}</p>
                  </div>
                  {selectedViewReport.projectDescription && (
                    <div>
                      <span className="font-medium text-gray-700">Description:</span>
                      <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">
                        {selectedViewReport.projectDescription}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Supervisor Feedback */}
            {selectedViewReport.supervisorFeedback && (
              <div className="bg-[#00509E]/5 p-3 rounded-lg border border-[#00509E]/20">
                <h4 className="font-semibold text-[#003366] mb-2 text-sm">Supervisor Feedback</h4>
                <p className="text-[#00509E] leading-relaxed whitespace-pre-wrap text-sm">
                  {selectedViewReport.supervisorFeedback}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between pt-3 border-t border-gray-200">
              {selectedViewReport._id && selectedViewReport.submittedAt ? (
                <Button
                  onClick={() => handleDownloadInternshipReportPDF(selectedViewReport._id)}
                  className="bg-[#003366] hover:bg-[#00509E] text-white text-sm px-3 py-2"
                >
                  <Download className="w-3 h-3 mr-1" />
                  Download PDF
                </Button>
              ) : (
                <div className="text-sm text-gray-500 py-2">
                  PDF download is not available for this report.
                </div>
              )}
              <Button
                variant="outline"
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedViewReport(null);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ReportsTab;