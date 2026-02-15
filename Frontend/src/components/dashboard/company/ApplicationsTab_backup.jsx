import { useState, useEffect } from 'react';
import { 
  Eye, 
  CheckCircle, 
  XCircle, 
  Calendar,
  MapPin,
  Users,
  FileText,
  Download,
  Award,
  User
} from 'lucide-react';
import { applicationAPI, supervisorReportAPI, offerLetterAPI } from '../../../services/api';
import { toast } from 'react-hot-toast';
import { PDFViewer } from '@react-pdf/renderer';
import Card from '../../../ui/Card';
import Button from '../../../ui/Button';
import Badge from '../../../ui/Badge';
import Modal from '../../../ui/Modal';
import Input from '../../../ui/Input';
import Select from '../../../ui/Select';
import InternshipApprovalForm from './InternshipApprovalForm';
import OfferLetterModal from './OfferLetterModal';
import OfferLetterPDF from '../../shared/OfferLetterPDF';
import internshipApprovalAPI from '../../../services/internshipApprovalAPI';

const ApplicationsTab = () => {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showInternshipApprovalForm, setShowInternshipApprovalForm] = useState(false);
  const [showOfferLetterModal, setShowOfferLetterModal] = useState(false);
  const [selectedApplicationForApproval, setSelectedApplicationForApproval] = useState(null);
  const [selectedApplicationForOffer, setSelectedApplicationForOffer] = useState(null);
  const [selectedOfferLetter, setSelectedOfferLetter] = useState(null);
  const [showOfferLetterViewModal, setShowOfferLetterViewModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [rejectionNote, setRejectionNote] = useState('');

  // Report form data
  const [reportData, setReportData] = useState({
    reportType: 'progress',
    reportTitle: '',
    reportText: '',
    priority: 'medium'
  });

  // File download handler
  const handleFileDownload = async (applicationId, fileType, fileName) => {
    try {
      await applicationAPI.downloadStudentFile(applicationId, fileType, fileName);
      toast.success(`${fileType === 'cv' ? 'CV' : 'Certificate'} downloaded successfully`);
    } catch (error) {
      console.error('Download error:', error);
      toast.error(error.message || 'Failed to download file');
    }
  };

  // File preview handler  
  const handleFilePreview = async (applicationId, fileType, fileName) => {
    try {
      await applicationAPI.previewStudentFile(applicationId, fileType, fileName);
      toast.success(`${fileType === 'cv' ? 'CV' : 'Certificate'} opened for preview`);
    } catch (error) {
      console.error('Preview error:', error);
      toast.error(error.message || 'Failed to preview file');
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    const filterApplications = () => {
      if (statusFilter === 'all') {
        setFilteredApplications(applications);
      } else {
        setFilteredApplications(
          applications.filter(app => app.applicationStatus === statusFilter)
        );
      }
    };
    
    filterApplications();
  }, [applications, statusFilter]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await applicationAPI.getCompanyApplications();
      
      if (response.success) {
        setApplications(response.data || []);
      } else {
        toast.error('Failed to fetch applications');
        setApplications([]);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to fetch applications');
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  // Update application status for the new workflow
  const handleStatusUpdate = async (applicationId, newStatus, rejectionNote = '') => {
    try {
      setActionLoading(applicationId);
      
      const payload = { status: newStatus };
      
      // Add rejection note if rejecting
      if (newStatus === 'rejected' && rejectionNote) {
        payload.rejectionNote = rejectionNote;
      }
      
      const response = await applicationAPI.updateApplicationStatus(applicationId, payload);
      
      if (response.success) {
        await fetchApplications();
        toast.success(`Application ${newStatus === 'rejected' ? 'rejected' : 'updated'} successfully`);
        
        // Close rejection modal if it was open
        if (showRejectModal) {
          setShowRejectModal(false);
          setRejectionNote('');
          setSelectedApplication(null);
        }
      } else {
        toast.error(response.message || 'Failed to update application');
      }
    } catch (error) {
      console.error('Error updating application:', error);
      toast.error('Failed to update application');
    } finally {
      setActionLoading(null);
    }
  };

  // Handle rejection with note
  const handleRejectWithNote = (application) => {
    setSelectedApplication(application);
    setRejectionNote('');
    setShowRejectModal(true);
  };

  // Submit rejection with note
  const submitRejection = async () => {
    if (!selectedApplication) return;
    
    await handleStatusUpdate(selectedApplication._id, 'rejected', rejectionNote);
  };

  // Open internship approval form
  const openInternshipApprovalForm = (application) => {
    setSelectedApplicationForApproval(application);
    setShowInternshipApprovalForm(true);
  };

  // Open offer letter modal
  const openOfferLetterModal = (application) => {
    setSelectedApplicationForOffer(application);
    setShowOfferLetterModal(true);
  };

  // Handle internship approval form submission
  const handleInternshipApprovalSubmit = async (formData) => {
    try {
      setActionLoading(selectedApplicationForApproval._id);
      
      // Submit the approval form
      const response = await internshipApprovalAPI.submitApprovalForm(
        selectedApplicationForApproval._id, 
        formData
      );
      
      if (response.success) {
        // Update application status to hired
        await handleStatusUpdate(selectedApplicationForApproval._id, 'hired');
        
        toast.success('Student hired and internship approval form sent successfully!');
        setShowInternshipApprovalForm(false);
        setSelectedApplicationForApproval(null);
      } else {
        toast.error(response.message || 'Failed to submit approval form');
      }
    } catch (error) {
      console.error('Error submitting approval form:', error);
      toast.error('Failed to submit approval form');
    } finally {
      setActionLoading(null);
    }
  };

  // Handle offer letter submission and hiring
  const handleOfferLetterSubmit = async () => {
    try {
      if (!selectedApplicationForOffer) return;
      
      setActionLoading(selectedApplicationForOffer._id);
      
      // Update application status to hired
      await handleStatusUpdate(selectedApplicationForOffer._id, 'hired');
      
      toast.success('Student hired and offer letter sent successfully!');
      setShowOfferLetterModal(false);
      setSelectedApplicationForOffer(null);
    } catch (error) {
      console.error('Error in hiring process:', error);
      toast.error('Failed to complete hiring process');
    } finally {
      setActionLoading(null);
    }
  };

  // Create supervisor report
  const handleCreateReport = async () => {
    try {
      setActionLoading(selectedApplication._id);
      
      const response = await supervisorReportAPI.createReport({
        studentId: selectedApplication.studentId._id || selectedApplication.studentId,
        applicationId: selectedApplication._id,
        ...reportData
      });
      
      if (response.success) {
        setShowReportModal(false);
        toast.success('Report sent to supervisor successfully');
        // Reset form
        setReportData({
          reportType: 'progress',
          reportTitle: '',
          reportText: '',
          priority: 'medium'
        });
      } else {
        toast.error(response.message || 'Failed to create report');
      }
    } catch (error) {
      console.error('Error creating report:', error);
      toast.error('Failed to create report');
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewDetails = (application) => {
    setSelectedApplication(application);
    setShowDetailsModal(true);
  };

  const openReportModal = (application) => {
    setSelectedApplication(application);
    setShowReportModal(true);
  };

  // Handle viewing offer letter for hired students
  const handleViewOfferLetter = async (application) => {
    try {
      console.log('Looking for offer letter for application:', application);
      // Fetch offer letters for this student
      const response = await offerLetterAPI.getCompanyOfferLetters();
      console.log('Company offer letters response:', response);
      
      if (response.success) {
        const studentId = typeof application.studentId === 'object' ? application.studentId._id : application.studentId;
        console.log('Looking for studentId:', studentId);
        console.log('Available offer letters:', response.data);
        
        const offerLetter = response.data.find(ol => {
          const olStudentId = typeof ol.studentId === 'object' ? ol.studentId._id : ol.studentId;
          console.log('Comparing:', olStudentId, 'with', studentId);
          return olStudentId === studentId;
        });
        
        if (offerLetter) {
          setSelectedOfferLetter(offerLetter);
          setShowOfferLetterViewModal(true);
        } else {
          toast.error('Offer letter not found for this student');
        }
      }
    } catch (error) {
      console.error('Error fetching offer letter:', error);
      toast.error('Failed to load offer letter');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'interview_scheduled': return 'info';
      case 'interview_done': return 'secondary';
      case 'hired': return 'success';
      case 'rejected': return 'danger';
      default: return 'warning';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pending Review';
      case 'hired': return 'Hired';
      case 'rejected': return 'Rejected';
      default: return 'Pending Review';
    }
  };

  const getApplicationStats = () => {
    return {
      total: applications.length,
      pending: applications.filter(app => !app.applicationStatus || app.applicationStatus === 'pending').length,
      hired: applications.filter(app => app.applicationStatus === 'hired').length,
      rejected: applications.filter(app => app.applicationStatus === 'rejected').length
    };
  };

  const stats = getApplicationStats();

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-8">
        <Card className="p-12 text-center border-2 border-gray-100">
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-4 rounded-full animate-pulse">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-48 animate-pulse"></div>
              <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-32 animate-pulse"></div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <p className="text-gray-600 font-medium">Loading applications...</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-6">
        <Card className="p-4 lg:p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200/60 hover:border-blue-300/80 transition-all duration-300 hover:shadow-xl group">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-lg shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
              <Users className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-xl lg:text-2xl text-blue-700 group-hover:text-blue-800 transition-colors duration-300">{stats.total}</h3>
              <p className="text-xs lg:text-sm font-semibold text-blue-600 truncate">Total Apps</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 lg:p-6 bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200/60 hover:border-yellow-300/80 transition-all duration-300 hover:shadow-xl group">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-yellow-500 to-orange-500 p-2 rounded-lg shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-xl lg:text-2xl text-yellow-700 group-hover:text-yellow-800 transition-colors duration-300">{stats.pending}</h3>
              <p className="text-xs lg:text-sm font-semibold text-yellow-600 truncate">Pending</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 lg:p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200/60 hover:border-green-300/80 transition-all duration-300 hover:shadow-xl group">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-2 rounded-lg shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
              <Award className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-xl lg:text-2xl text-green-700 group-hover:text-green-800 transition-colors duration-300">{stats.hired}</h3>
              <p className="text-xs lg:text-sm font-semibold text-green-600 truncate">Hired</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 lg:p-6 bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-200/60 hover:border-red-300/80 transition-all duration-300 hover:shadow-xl group">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-red-500 to-pink-500 p-2 rounded-lg shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
              <XCircle className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-xl lg:text-2xl text-red-700 group-hover:text-red-800 transition-colors duration-300">{stats.rejected}</h3>
              <p className="text-xs lg:text-sm font-semibold text-red-600 truncate">Rejected</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filter Tabs with Enhanced Hired Section */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-2 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex space-x-2 overflow-x-auto">
          {[
            { value: 'all', label: 'All Applications', icon: Users, color: 'blue' },
            { value: 'pending', label: 'Pending Review', icon: Calendar, color: 'yellow' },
            { value: 'hired', label: `✅ Hired Students (${stats.hired})`, icon: Award, color: 'green' },
            { value: 'rejected', label: 'Rejected', icon: XCircle, color: 'red' }
          ].map((filter) => (
            <button
              key={filter.value}
              onClick={() => setStatusFilter(filter.value)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap hover:scale-105 ${
                statusFilter === filter.value
                  ? filter.value === 'hired'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg hover:shadow-xl ring-2 ring-green-300'
                    : `bg-gradient-to-r from-${filter.color}-500 to-${filter.color}-600 text-white shadow-lg hover:shadow-xl`
                  : filter.value === 'hired'
                    ? 'bg-white text-green-600 hover:text-green-700 hover:bg-green-50 border-2 border-green-300 hover:border-green-400'
                    : `bg-white text-gray-600 hover:text-${filter.color}-600 hover:bg-${filter.color}-50 border border-gray-200 hover:border-${filter.color}-300`
              }`}
            >
              <filter.icon className="w-4 h-4" />
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {/* Special Header for Hired Students */}
        {statusFilter === 'hired' && filteredApplications.length > 0 && (
          <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 shadow-lg">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-3 rounded-xl shadow-lg">
                <Award className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-green-800 mb-1">
                  🎉 Hired Students ({stats.hired})
                </h2>
                <p className="text-green-700 font-medium">
                  Students who have been successfully hired for internship positions
                </p>
              </div>
              <div className="text-right">
                <div className="bg-white rounded-lg px-4 py-2 shadow-md border border-green-200">
                  <div className="text-2xl font-bold text-green-600">{stats.hired}</div>
                  <div className="text-xs text-green-500 font-medium">Active Interns</div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {filteredApplications.length === 0 ? (
          <Card className="text-center py-16 bg-gradient-to-br from-gray-50 to-blue-50 border-2 border-gray-200/60">
            <div className="bg-gradient-to-br from-blue-100 to-indigo-200 p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center shadow-lg">
              {statusFilter === 'hired' ? (
                <Award className="h-12 w-12 text-green-600" />
              ) : (
                <Users className="h-12 w-12 text-blue-600" />
              )}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {statusFilter === 'hired' ? 'No Hired Students Yet' : 'No Applications Found'}
            </h3>
            <p className="text-gray-600 font-medium">
              {statusFilter === 'all'
                ? 'No internship applications have been submitted yet. Check back later!'
                : statusFilter === 'hired'
                  ? 'No students have been hired yet. Hire students through the interview process to see them here.'
                  : `No applications with status "${getStatusText(statusFilter)}" found.`}
            </p>
            {statusFilter !== 'all' && (
              <button
                onClick={() => setStatusFilter('all')}
                className="mt-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                View All Applications
              </button>
            )}
          </Card>
        ) : (
          filteredApplications.map((application) => (
            <Card key={application._id} className={`p-6 transition-all duration-300 hover:shadow-xl group ${
              application.applicationStatus === 'hired' 
                ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200/80 hover:border-green-300'
                : 'bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200/60 hover:border-blue-300/80'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className={`p-3 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110 ${
                      application.applicationStatus === 'hired'
                        ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                        : 'bg-gradient-to-br from-blue-500 to-indigo-600'
                    }`}>
                      {application.applicationStatus === 'hired' ? (
                        <Award className="w-6 h-6 text-white" />
                      ) : (
                        <User className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:via-indigo-600 group-hover:to-purple-600 group-hover:bg-clip-text transition-all duration-300 leading-tight">
                          {application.studentName}
                        </h3>
                        {application.applicationStatus === 'hired' && (
                          <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-2 py-1 rounded-full text-xs font-bold shadow-md">
                            ✓ HIRED
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 font-medium">{application.studentEmail}</p>
                    </div>
                  </div>

                  {/* Student Profile Summary */}
                  {application.studentProfile && (
                    <div className="mb-4">
                      <div className="flex flex-wrap items-center gap-2">
                        {application.studentProfile.rollNumber && (
                          <span className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 px-3 py-1.5 rounded-lg font-semibold text-xs shadow-sm">
                            Roll: {application.studentProfile.rollNumber}
                          </span>
                        )}
                        {application.studentProfile.department && (
                          <span className="bg-gradient-to-r from-indigo-100 to-indigo-200 text-indigo-800 px-3 py-1.5 rounded-lg font-semibold text-xs shadow-sm">
                            {application.studentProfile.department}
                          </span>
                        )}
                        {application.studentProfile.semester && (
                          <span className="bg-gradient-to-r from-green-100 to-green-200 text-green-800 px-3 py-1.5 rounded-lg font-semibold text-xs shadow-sm">
                            Sem: {application.studentProfile.semester}
                          </span>
                        )}
                        {application.studentProfile.cgpa && (
                          <span className="bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 px-3 py-1.5 rounded-lg font-semibold text-xs shadow-sm">
                            CGPA: {application.studentProfile.cgpa}
                          </span>
                        )}
                        <div className="flex items-center space-x-2 ml-2">
                          {application.studentProfile.cv && application.studentProfile.cv.path && (
                            <div className="flex items-center bg-green-100 px-2 py-1 rounded-lg shadow-sm" title="CV uploaded">
                              <FileText className="w-4 h-4 text-green-600 mr-1" />
                              <span className="text-xs font-semibold text-green-700">CV</span>
                            </div>
                          )}
                          {application.studentProfile.certificates && application.studentProfile.certificates.length > 0 && (
                            <div className="flex items-center bg-blue-100 px-2 py-1 rounded-lg shadow-sm" title={`${application.studentProfile.certificates.length} certificate(s)`}>
                              <Award className="w-4 h-4 text-blue-600 mr-1" />
                              <span className="text-xs font-semibold text-blue-700">{application.studentProfile.certificates.length}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Application Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center bg-gradient-to-r from-gray-50 to-blue-50 px-4 py-2 rounded-lg border border-gray-200/60">
                      <FileText className="w-4 h-4 text-blue-500 mr-3 flex-shrink-0" />
                      <span className="text-sm font-semibold text-gray-700">Job:</span>
                      <span className="text-sm text-gray-900 ml-2 font-medium">{application.jobTitle}</span>
                    </div>
                    <div className="flex items-center bg-gradient-to-r from-gray-50 to-indigo-50 px-4 py-2 rounded-lg border border-gray-200/60">
                      <User className="w-4 h-4 text-indigo-500 mr-3 flex-shrink-0" />
                      <span className="text-sm font-semibold text-gray-700">Supervisor:</span>
                      <span className="text-sm text-gray-900 ml-2 font-medium">{application.supervisorName}</span>
                    </div>
                    <div className="flex items-center bg-gradient-to-r from-gray-50 to-purple-50 px-4 py-2 rounded-lg border border-gray-200/60">
                      <Calendar className="w-4 h-4 text-purple-500 mr-3 flex-shrink-0" />
                      <span className="text-sm font-semibold text-gray-700">Applied:</span>
                      <span className="text-sm text-gray-900 ml-2 font-medium">{new Date(application.appliedAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Hiring Date */}
                  {application.hiringDate && (
                    <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200/60">
                      <div className="flex items-center text-sm">
                        <Award className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                        <span className="font-semibold text-green-700">Hired:</span>
                        <span className="text-green-900 ml-2 font-medium">{new Date(application.hiringDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end space-y-4 ml-6">
                  <Badge
                    variant={getStatusColor(application.applicationStatus || 'pending')}
                    className={`font-bold text-sm px-4 py-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 ${
                      (application.applicationStatus || 'pending') === 'pending' ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white' :
                      (application.applicationStatus || 'pending') === 'interview_scheduled' ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white' :
                      (application.applicationStatus || 'pending') === 'interview_done' ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white' :
                      (application.applicationStatus || 'pending') === 'hired' ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' :
                      'bg-gradient-to-r from-red-500 to-pink-500 text-white'
                    }`}
                  >
                    {getStatusText(application.applicationStatus || 'pending')}
                  </Badge>

                  <div className="flex flex-col space-y-2 min-w-[200px]">
                    <button
                      onClick={() => handleViewDetails(application)}
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>

                    {/* Action buttons based on status */}
                    {(!application.applicationStatus || application.applicationStatus === 'pending') && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRejectWithNote(application)}
                          disabled={actionLoading === application._id}
                          className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-2 px-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-1 text-sm"
                        >
                          <XCircle className="w-3 h-3" />
                          Reject
                        </button>
                      </div>
                    )}

                    {application.applicationStatus === 'interview_scheduled' && (
                      <button
                        onClick={() => handleStatusUpdate(application._id, 'interview_done')}
                        disabled={actionLoading === application._id}
                        className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-2.5 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Mark Interview Done
                      </button>
                    )}

                    {application.applicationStatus === 'interview_done' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => openOfferLetterModal(application)}
                          disabled={actionLoading === application._id}
                          className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-2 px-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-1 text-sm"
                        >
                          <CheckCircle className="w-3 h-3" />
                          Hire
                        </button>
                        <button
                          onClick={() => handleRejectWithNote(application)}
                          disabled={actionLoading === application._id}
                          className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-2 px-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-1 text-sm"
                        >
                          <XCircle className="w-3 h-3" />
                          Reject
                        </button>
                      </div>
                    )}

                    {application.applicationStatus === 'hired' && (
                      <div className="space-y-2">
                        <button
                          onClick={() => handleViewOfferLetter(application)}
                          className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold py-2.5 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2 border border-emerald-300"
                        >
                          <FileText className="w-4 h-4" />
                          View Offer Letter
                        </button>
                        <button
                          onClick={() => handleViewDetails(application)}
                          className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2 text-sm"
                        >
                          <Award className="w-3 h-3" />
                          Internship Progress
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Application Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Application Details"
        size="lg"
      >
        {selectedApplication && (
          <div className="space-y-6">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200/60">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-xl shadow-lg">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedApplication.studentName}</h2>
                  <p className="text-blue-600 font-medium">{selectedApplication.studentEmail}</p>
                  <div className="flex items-center mt-2">
                    <Badge
                      variant={getStatusColor(selectedApplication.applicationStatus || 'pending')}
                      className={`font-bold text-sm px-3 py-1 shadow-md ${
                        (selectedApplication.applicationStatus || 'pending') === 'pending' ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white' :
                        (selectedApplication.applicationStatus || 'pending') === 'interview_scheduled' ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white' :
                        (selectedApplication.applicationStatus || 'pending') === 'interview_done' ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white' :
                        (selectedApplication.applicationStatus || 'pending') === 'hired' ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' :
                        'bg-gradient-to-r from-red-500 to-pink-500 text-white'
                      }`}
                    >
                      {getStatusText(selectedApplication.applicationStatus || 'pending')}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Application Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-4 rounded-lg border border-gray-200/60">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Job Position</p>
                    <p className="text-gray-900 font-medium">{selectedApplication.jobTitle}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-indigo-50 p-4 rounded-lg border border-gray-200/60">
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-indigo-500" />
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Supervisor</p>
                    <p className="text-gray-900 font-medium">{selectedApplication.supervisorName}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-purple-50 p-4 rounded-lg border border-gray-200/60">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-purple-500" />
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Applied Date</p>
                    <p className="text-gray-900 font-medium">{new Date(selectedApplication.appliedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Student Profile Details */}
            {selectedApplication.studentProfile && (
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Detailed Student Profile
                </h3>
                <div className="bg-blue-50 p-4 rounded-lg space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Roll Number</p>
                      <p className="text-gray-900">{selectedApplication.studentProfile.rollNumber || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Department</p>
                      <p className="text-gray-900">{selectedApplication.studentProfile.department || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Semester</p>
                      <p className="text-gray-900">{selectedApplication.studentProfile.semester || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">CGPA</p>
                      <p className="text-gray-900">{selectedApplication.studentProfile.cgpa || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Phone Number</p>
                      <p className="text-gray-900">{selectedApplication.studentProfile.phoneNumber || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Attendance</p>
                      <p className="text-gray-900">{selectedApplication.studentProfile.attendance ? `${selectedApplication.studentProfile.attendance}%` : 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Backlogs</p>
                      <p className="text-gray-900">{selectedApplication.studentProfile.backlogs || 0}</p>
                    </div>
                  </div>

                  {/* CV Section */}
                  <div className="border-t pt-4">
                    <h4 className="text-md font-semibold mb-2 flex items-center">
                      <FileText className="w-4 h-4 mr-2" />
                      Curriculum Vitae (CV)
                    </h4>
                    {selectedApplication.studentProfile.cv && selectedApplication.studentProfile.cv.path ? (
                      <div className="flex items-center justify-between bg-white p-3 rounded border">
                        <div>
                          <p className="text-sm font-medium">{selectedApplication.studentProfile.cv.originalName}</p>
                          <p className="text-xs text-gray-500">
                            Uploaded: {new Date(selectedApplication.studentProfile.cv.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleFilePreview(selectedApplication._id, 'cv', selectedApplication.studentProfile.cv.filename)}
                            className="flex items-center"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Preview
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleFileDownload(selectedApplication._id, 'cv', selectedApplication.studentProfile.cv.filename)}
                            className="flex items-center"
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Download CV
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">No CV uploaded</p>
                    )}
                  </div>

                  {/* Certificates Section */}
                  <div className="border-t pt-4">
                    <h4 className="text-md font-semibold mb-2 flex items-center">
                      <Award className="w-4 h-4 mr-2" />
                      Certificates
                    </h4>
                    {selectedApplication.studentProfile.certificates && selectedApplication.studentProfile.certificates.length > 0 ? (
                      <div className="space-y-2">
                        {selectedApplication.studentProfile.certificates.map((certificate, index) => (
                          <div key={index} className="flex items-center justify-between bg-white p-3 rounded border">
                            <div>
                              <p className="text-sm font-medium">{certificate.originalName}</p>
                              <p className="text-xs text-gray-500">
                                Uploaded: {new Date(certificate.uploadedAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleFilePreview(selectedApplication._id, 'certificate', certificate.filename)}
                                className="flex items-center"
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                Preview
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleFileDownload(selectedApplication._id, 'certificate', certificate.filename)}
                                className="flex items-center"
                              >
                                <Download className="w-4 h-4 mr-1" />
                                Download
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">No certificates uploaded</p>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Cover Letter</h3>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                {selectedApplication.coverLetter}
              </p>
            </div>

            {selectedApplication.interviewDetails && (
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Interview Details</h3>
                <div className="bg-blue-50 p-3 rounded">
                  <p className="text-sm">
                    <strong>Type:</strong> {selectedApplication.interviewDetails.type}
                  </p>
                  <p className="text-sm">
                    <strong>Date:</strong> {new Date(selectedApplication.interviewDetails.date).toLocaleDateString()}
                  </p>
                  <p className="text-sm">
                    <strong>Time:</strong> {selectedApplication.interviewDetails.time}
                  </p>
                  {selectedApplication.interviewDetails.location && (
                    <p className="text-sm">
                      <strong>Location:</strong> {selectedApplication.interviewDetails.location}
                    </p>
                  )}
                  {selectedApplication.interviewDetails.meetingLink && (
                    <p className="text-sm">
                      <strong>Meeting Link:</strong> {selectedApplication.interviewDetails.meetingLink}
                    </p>
                  )}
                  {selectedApplication.interviewDetails.notes && (
                    <p className="text-sm">
                      <strong>Notes:</strong> {selectedApplication.interviewDetails.notes}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Interview Scheduling Modal */}
      <Modal
        isOpen={showInterviewModal}
        onClose={() => setShowInterviewModal(false)}
        title="Schedule Interview"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Interview Type
            </label>
            <Select
              value={interviewData.type}
              onChange={(e) => setInterviewData({...interviewData, type: e.target.value})}
              options={[
                { value: 'remote', label: 'Remote Interview' },
                { value: 'onsite', label: 'On-site Interview' }
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <Input
                type="date"
                value={interviewData.date}
                onChange={(e) => setInterviewData({...interviewData, date: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time
              </label>
              <Input
                type="time"
                value={interviewData.time}
                onChange={(e) => setInterviewData({...interviewData, time: e.target.value})}
              />
            </div>
          </div>

          {interviewData.type === 'remote' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meeting Link
              </label>
              <Input
                type="url"
                placeholder="https://meet.google.com/..."
                value={interviewData.meetingLink}
                onChange={(e) => setInterviewData({...interviewData, meetingLink: e.target.value})}
              />
            </div>
          )}

          {interviewData.type === 'onsite' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <Input
                placeholder="Company address or meeting room"
                value={interviewData.location}
                onChange={(e) => setInterviewData({...interviewData, location: e.target.value})}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="Additional notes for the interview..."
              value={interviewData.notes}
              onChange={(e) => setInterviewData({...interviewData, notes: e.target.value})}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setShowInterviewModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleScheduleInterview}
              disabled={!interviewData.date || !interviewData.time || actionLoading}
            >
              Schedule Interview
            </Button>
          </div>
        </div>
      </Modal>

      {/* Supervisor Report Modal */}
      <Modal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        title="Send Report to Supervisor"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Report Type
            </label>
            <Select
              value={reportData.reportType}
              onChange={(e) => setReportData({...reportData, reportType: e.target.value})}
              options={[
                { value: 'progress', label: 'Progress Report' },
                { value: 'misconduct', label: 'Misconduct Report' },
                { value: 'appraisal', label: 'Internship Appraisal' }
              ]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Report Title
            </label>
            <Input
              placeholder="Enter report title"
              value={reportData.reportTitle}
              onChange={(e) => setReportData({...reportData, reportTitle: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <Select
              value={reportData.priority}
              onChange={(e) => setReportData({...reportData, priority: e.target.value})}
              options={[
                { value: 'low', label: 'Low Priority' },
                { value: 'medium', label: 'Medium Priority' },
                { value: 'high', label: 'High Priority' }
              ]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Report Details
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              rows={6}
              placeholder="Enter detailed report..."
              value={reportData.reportText}
              onChange={(e) => setReportData({...reportData, reportText: e.target.value})}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setShowReportModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateReport}
              disabled={!reportData.reportTitle || !reportData.reportText || actionLoading}
            >
              Send Report
            </Button>
          </div>
        </div>
      </Modal>

      {/* Rejection Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setRejectionNote('');
          setSelectedApplication(null);
        }}
        title="Reject Application"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Please provide a reason for rejecting this application. This message will be visible to both the student and their supervisor.
          </p>
          
          {selectedApplication && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm font-medium text-blue-800">Application Details:</p>
              <p className="text-sm text-blue-700">
                Student: {selectedApplication.studentName}
              </p>
              <p className="text-sm text-blue-700">
                Position: {selectedApplication.jobTitle}
              </p>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rejection Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              placeholder="Please provide a detailed reason for rejection (e.g., qualifications don't match requirements, position filled, etc.)"
              value={rejectionNote}
              onChange={(e) => setRejectionNote(e.target.value)}
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectModal(false);
                setRejectionNote('');
                setSelectedApplication(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              disabled={actionLoading || !rejectionNote.trim()}
              onClick={submitRejection}
            >
              {actionLoading ? 'Processing...' : 'Reject Application'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Offer Letter Modal */}
      <OfferLetterModal
        isOpen={showOfferLetterModal}
        onClose={() => {
          setShowOfferLetterModal(false);
          setSelectedApplicationForOffer(null);
        }}
        application={selectedApplicationForOffer}
        onSubmit={handleOfferLetterSubmit}
      />

      {/* Internship Approval Form Modal */}
      <InternshipApprovalForm
        isOpen={showInternshipApprovalForm}
        onClose={() => {
          setShowInternshipApprovalForm(false);
          setSelectedApplicationForApproval(null);
        }}
        application={selectedApplicationForApproval}
        onSubmit={handleInternshipApprovalSubmit}
      />

      {/* Offer Letter View Modal */}
      {showOfferLetterViewModal && selectedOfferLetter && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" />
            
            <div className="inline-block w-full max-w-7xl p-6 my-8 text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                  <FileText className="w-6 h-6 mr-2 text-green-600" />
                  Offer Letter - {selectedOfferLetter.studentName}
                </h3>
                <button
                  onClick={() => setShowOfferLetterViewModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="bg-white rounded border overflow-hidden" style={{ height: '80vh' }}>
                <PDFViewer width="100%" height="100%">
                  <OfferLetterPDF offerLetter={selectedOfferLetter} />
                </PDFViewer>
              </div>

              <div className="flex justify-end pt-6 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={() => setShowOfferLetterViewModal(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationsTab;
