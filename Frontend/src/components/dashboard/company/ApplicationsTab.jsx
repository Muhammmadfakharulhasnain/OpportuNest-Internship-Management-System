import { useState, useEffect } from 'react';
import { 
  Eye, 
  CheckCircle, 
  XCircle, 
  Calendar,
  Users,
  FileText,
  Download,
  Award,
  User,
  Hash,
  Clock,
  Search,
  Filter,
  ChevronDown,
  SlidersHorizontal,
  X,
  Briefcase,
  MapPin,
  GraduationCap
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
import './ApplicationsTab.css';

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
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [jobFilter, setJobFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [rejectionNote, setRejectionNote] = useState('');
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [interviewData, setInterviewData] = useState({
    type: 'in-person',
    date: '',
    time: '',
    location: '',
    meetingLink: '',
    notes: ''
  });

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
      let filtered = applications;
      
      // Filter by status
      if (statusFilter !== 'all') {
        filtered = filtered.filter(app => app.applicationStatus === statusFilter);
      }
      
      // Filter by search term
      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase();
        filtered = filtered.filter(app => {
          const studentName = `${app.studentId?.firstName || ''} ${app.studentId?.lastName || ''}`.toLowerCase();
          const rollNumber = app.studentId?.rollNumber?.toLowerCase() || '';
          const email = app.studentId?.email?.toLowerCase() || '';
          
          return studentName.includes(searchLower) || 
                 rollNumber.includes(searchLower) || 
                 email.includes(searchLower);
        });
      }

      // Filter by department
      if (departmentFilter !== 'all') {
        filtered = filtered.filter(app => 
          app.studentProfile?.department === departmentFilter ||
          app.studentId?.department === departmentFilter
        );
      }

      // Filter by job
      if (jobFilter !== 'all') {
        filtered = filtered.filter(app => 
          app.jobId?._id === jobFilter || app.jobId?.jobTitle === jobFilter
        );
      }

      // Sort
      if (sortBy === 'newest') {
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      } else if (sortBy === 'oldest') {
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      } else if (sortBy === 'name-az') {
        filtered.sort((a, b) => {
          const nameA = `${a.studentId?.firstName || ''} ${a.studentId?.lastName || ''}`;
          const nameB = `${b.studentId?.firstName || ''} ${b.studentId?.lastName || ''}`;
          return nameA.localeCompare(nameB);
        });
      }
      
      setFilteredApplications(filtered);
    };
    
    filterApplications();
  }, [applications, statusFilter, searchTerm, departmentFilter, jobFilter, sortBy]);

  // Get unique departments from applications
  const getUniqueDepartments = () => {
    const departments = applications.map(app => 
      app.studentProfile?.department || app.studentId?.department
    ).filter(Boolean);
    return [...new Set(departments)];
  };

  // Get unique jobs from applications
  const getUniqueJobs = () => {
    const jobs = applications.map(app => ({
      id: app.jobId?._id,
      title: app.jobId?.jobTitle
    })).filter(job => job.id && job.title);
    const uniqueJobs = [];
    const seen = new Set();
    jobs.forEach(job => {
      if (!seen.has(job.id)) {
        seen.add(job.id);
        uniqueJobs.push(job);
      }
    });
    return uniqueJobs;
  };

  // Count active filters
  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchTerm.trim()) count++;
    if (statusFilter !== 'all') count++;
    if (departmentFilter !== 'all') count++;
    if (jobFilter !== 'all') count++;
    if (sortBy !== 'newest') count++;
    return count;
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDepartmentFilter('all');
    setJobFilter('all');
    setSortBy('newest');
  };

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
  // NOTE: Original internship approval form flow is handled separately if needed.

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

  // report modal opening replaced with inlined calls where needed

  const handleScheduleInterview = async () => {
    try {
      if (!selectedApplication) return;
      
      console.log('🚀 Starting interview scheduling...');
      console.log('Form data (interviewData):', interviewData);
      console.log('Selected application:', selectedApplication._id);
      
      setActionLoading(selectedApplication._id);
      
      // Validate required fields
      if (!interviewData.date || !interviewData.time) {
        toast.error('Please select both date and time for the interview');
        return;
      }
      
      // Combine date and time for the interview
      const interviewDateTime = new Date(`${interviewData.date}T${interviewData.time}`);
      console.log('Combined date/time:', interviewDateTime);
      
      const payload = {
        date: interviewDateTime.toISOString(), // Send as ISO string
        mode: interviewData.type, // 'remote' or 'in-person'
        location: interviewData.type === 'in-person' ? interviewData.location : interviewData.meetingLink,
        notes: interviewData.notes
      };
      
      console.log('📤 Sending payload to backend:', payload);
      
      const response = await applicationAPI.updateInterviewDetails(selectedApplication._id, payload);
      
      console.log('📥 Backend response:', response);
      
      if (response.success) {
        await fetchApplications();
        toast.success('Interview scheduled successfully! Student and supervisor have been notified.');
        setShowInterviewModal(false);
        setInterviewData({
          type: 'in-person',
          date: '',
          time: '',
          location: '',
          meetingLink: '',
          notes: ''
        });
      } else {
        toast.error(response.message || 'Failed to schedule interview');
      }
    } catch (error) {
      console.error('❌ Error scheduling interview:', error);
      toast.error('Failed to schedule interview');
    } finally {
      setActionLoading(null);
    }
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
            <div className="bg-gray-100 p-4 rounded-full animate-pulse">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-32 animate-pulse"></div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400"></div>
              <p className="text-gray-600 font-medium">Loading applications...</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header - COMSATS Design */}
      <div className="bg-gradient-to-r from-[#003366] via-[#00509E] to-[#003366] rounded-lg p-4 text-white shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-md backdrop-blur-sm">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Applications Management</h2>
              <p className="text-blue-100 mt-0.5 text-sm">Review and manage student internship applications</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4 text-blue-100">
            <div className="text-center">
              <div className="text-lg font-bold text-white">{stats.total}</div>
              <div className="text-xs">Total Applications</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-white">{stats.hired}</div>
              <div className="text-xs">Students Hired</div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Statistics Dashboard - COMSATS Design */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="p-3 text-center bg-gradient-to-br from-[#003366]/5 to-[#003366]/10 border border-[#003366]/20 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-center mb-1">
            <div className="p-1.5 bg-[#003366]/20 rounded-md">
              <Users className="w-4 h-4 text-[#003366]" />
            </div>
          </div>
          <div className="text-lg font-bold text-[#003366]">{stats.total}</div>
          <div className="text-xs text-[#003366] font-medium">Total Applications</div>
        </Card>
        
        <Card className="p-3 text-center bg-gradient-to-br from-blue-50 to-blue-100 border border-[#00509E]/20 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-center mb-1">
            <div className="p-1.5 bg-[#00509E]/20 rounded-md">
              <Clock className="w-4 h-4 text-[#00509E]" />
            </div>
          </div>
          <div className="text-lg font-bold text-[#003366]">{stats.pending}</div>
          <div className="text-xs text-[#00509E] font-medium">Pending Review</div>
        </Card>
        
        <Card className="p-3 text-center bg-gradient-to-br from-[#00509E]/5 to-[#00509E]/10 border border-[#00509E]/20 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-center mb-1">
            <div className="p-1.5 bg-[#00509E]/20 rounded-md">
              <Calendar className="w-4 h-4 text-[#00509E]" />
            </div>
          </div>
          <div className="text-lg font-bold text-[#00509E]">{stats.interview_scheduled}</div>
          <div className="text-xs text-[#00509E] font-medium">Interview Scheduled</div>
        </Card>
        
        <Card className="p-3 text-center bg-gradient-to-br from-[#003366]/10 to-[#00509E]/15 border border-[#003366]/20 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-center mb-1">
            <div className="p-1.5 bg-[#003366]/20 rounded-md">
              <Award className="w-4 h-4 text-[#003366]" />
            </div>
          </div>
          <div className="text-lg font-bold text-[#003366]">{stats.hired}</div>
          <div className="text-xs text-[#003366] font-medium">Students Hired</div>
        </Card>
        
        <Card className="p-3 text-center bg-gradient-to-br from-red-50 to-red-100 border border-red-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-center mb-1">
            <div className="p-1.5 bg-red-200 rounded-md">
              <XCircle className="w-4 h-4 text-red-700" />
            </div>
          </div>
          <div className="text-lg font-bold text-red-800">{stats.rejected}</div>
          <div className="text-xs text-red-700 font-medium">Rejected</div>
        </Card>
        
        <Card className="p-3 text-center bg-gradient-to-br from-slate-50 to-slate-100 border border-[#003366]/20 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-center mb-1">
            <div className="p-1.5 bg-[#003366]/20 rounded-md">
              <Calendar className="w-4 h-4 text-[#003366]" />
            </div>
          </div>
          <div className="text-lg font-bold text-[#003366]">{stats.interview_done}</div>
          <div className="text-xs text-slate-600 font-medium">Interviews Done</div>
        </Card>
      </div>

      {/* Enhanced Tab Navigation - COMSATS Design */}
      <Card className="overflow-hidden shadow-md">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                statusFilter === 'all'
                  ? 'border-[#003366] text-[#003366]'
                  : 'border-transparent text-gray-500 hover:text-[#00509E] hover:border-[#00509E]'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>All Applications</span>
                <span className="ml-1 bg-[#003366]/10 text-[#003366] px-2 py-0.5 rounded-full text-xs font-bold">
                  {stats.total}
                </span>
              </div>
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                statusFilter === 'pending'
                  ? 'border-[#003366] text-[#003366]'
                  : 'border-transparent text-gray-500 hover:text-[#00509E] hover:border-[#00509E]'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>Pending Review</span>
                <span className="ml-1 bg-[#00509E]/10 text-[#00509E] px-2 py-0.5 rounded-full text-xs font-bold">
                  {stats.pending}
                </span>
              </div>
            </button>
            <button
              onClick={() => setStatusFilter('hired')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                statusFilter === 'hired'
                  ? 'border-[#003366] text-[#003366]'
                  : 'border-transparent text-gray-500 hover:text-[#00509E] hover:border-[#00509E]'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Award className="w-4 h-4" />
                <span>Hired Students</span>
                <span className="ml-1 bg-[#003366]/10 text-[#003366] px-2 py-0.5 rounded-full text-xs font-bold">
                  {stats.hired}
                </span>
              </div>
            </button>
            <button
              onClick={() => setStatusFilter('rejected')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                statusFilter === 'rejected'
                  ? 'border-[#003366] text-[#003366]'
                  : 'border-transparent text-gray-500 hover:text-[#00509E] hover:border-[#00509E]'
              }`}
            >
              <div className="flex items-center space-x-2">
                <XCircle className="w-4 h-4" />
                <span>Rejected</span>
                <span className="ml-1 bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-xs font-bold">
                  {stats.rejected}
                </span>
              </div>
            </button>
          </nav>
        </div>
        
        {/* Enhanced Search Section - COMSATS Design */}
        <div className="p-6 bg-gradient-to-r from-[#003366]/5 to-[#00509E]/5">
          {/* Row 1: Search Input, Filter Button, Export Button */}
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#003366] w-5 h-5" />
              <Input
                type="text"
                placeholder="Search by student name, roll number, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 w-full border border-[#003366]/20 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-[#003366] bg-white transition-all duration-300 text-gray-700 placeholder-gray-500"
              />
            </div>
            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-5 py-3 rounded-lg font-medium transition-all duration-200 ${
                showFilters
                  ? 'bg-[#003366] text-white shadow-md'
                  : 'bg-white border-2 border-[#003366] text-[#003366] hover:bg-[#003366] hover:text-white'
              }`}
            >
              <SlidersHorizontal className="w-5 h-5" />
              <span>Filters</span>
              {getActiveFiltersCount() > 0 && (
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  showFilters ? 'bg-white text-[#003366]' : 'bg-[#003366] text-white'
                }`}>
                  {getActiveFiltersCount()}
                </span>
              )}
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
            </button>
            <Button
              variant="primary"
              size="sm"
              className="bg-gradient-to-r from-[#003366] to-[#00509E] hover:from-[#003366]/90 hover:to-[#00509E]/90 text-white whitespace-nowrap px-4 py-3"
            >
              <Download className="w-4 h-4 mr-2" />
              Export List
            </Button>
          </div>

          {/* Expandable Filter Panel */}
          {showFilters && (
            <div className="bg-white border border-[#003366]/20 rounded-xl p-5 mb-4 shadow-sm animate-in slide-in-from-top duration-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-[#003366] flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Advanced Filters
                </h4>
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-[#003366] hover:text-[#00509E] font-medium flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-[#003366]/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Clear All
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Department Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <GraduationCap className="w-4 h-4 inline mr-1" />
                    Department
                  </label>
                  <select
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    className="w-full px-4 py-2.5 border border-[#003366]/20 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-[#003366] bg-white text-gray-700 text-sm"
                  >
                    <option value="all">All Departments</option>
                    {getUniqueDepartments().map((dept, idx) => (
                      <option key={idx} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                {/* Job Position Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Briefcase className="w-4 h-4 inline mr-1" />
                    Job Position
                  </label>
                  <select
                    value={jobFilter}
                    onChange={(e) => setJobFilter(e.target.value)}
                    className="w-full px-4 py-2.5 border border-[#003366]/20 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-[#003366] bg-white text-gray-700 text-sm"
                  >
                    <option value="all">All Positions</option>
                    {getUniqueJobs().map((job) => (
                      <option key={job.id} value={job.id}>{job.title}</option>
                    ))}
                  </select>
                </div>

                {/* Status Filter (in panel too) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <CheckCircle className="w-4 h-4 inline mr-1" />
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-4 py-2.5 border border-[#003366]/20 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-[#003366] bg-white text-gray-700 text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="hired">Hired</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                
                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-4 py-2.5 border border-[#003366]/20 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-[#003366] bg-white text-gray-700 text-sm"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="name-az">Name: A-Z</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Results Count */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-gray-600">
              Showing <span className="font-bold text-[#003366]">{filteredApplications.length}</span> of <span className="font-bold text-[#003366]">{stats.total}</span> applications
            </div>
          </div>
          
          {/* Filter Summary Tags */}
          {getActiveFiltersCount() > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-[#003366] font-medium text-sm">Active filters:</span>
              {statusFilter !== 'all' && (
                <span className="bg-[#003366] text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                  Status: {statusFilter}
                  <button onClick={() => setStatusFilter('all')} className="ml-1 hover:bg-white/20 rounded-full p-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {departmentFilter !== 'all' && (
                <span className="bg-[#00509E] text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                  Dept: {departmentFilter}
                  <button onClick={() => setDepartmentFilter('all')} className="ml-1 hover:bg-white/20 rounded-full p-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {jobFilter !== 'all' && (
                <span className="bg-[#003366] text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                  Job: {getUniqueJobs().find(j => j.id === jobFilter)?.title || jobFilter}
                  <button onClick={() => setJobFilter('all')} className="ml-1 hover:bg-white/20 rounded-full p-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {searchTerm && (
                <span className="bg-[#00509E] text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                  Search: {searchTerm.length > 15 ? searchTerm.substring(0, 15) + '...' : searchTerm}
                  <button onClick={() => setSearchTerm('')} className="ml-1 hover:bg-white/20 rounded-full p-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Applications List */}
      <div className="space-y-4">
        {/* Special Header for Hired Students */}
        {statusFilter === 'hired' && filteredApplications.length > 0 && (
          <Card className="p-6 bg-gray-50 border border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="bg-gray-100 p-3 rounded-lg">
                <Award className="w-8 h-8 text-gray-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  Hired Students ({stats.hired})
                </h2>
                <p className="text-gray-600 font-medium">
                  Students who have been successfully hired for internship positions
                </p>
              </div>
              <div className="text-right">
                <div className="bg-white rounded-lg px-4 py-2 border border-gray-200">
                  <div className="text-2xl font-bold text-gray-900">{stats.hired}</div>
                  <div className="text-xs text-gray-500 font-medium">Active Interns</div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {filteredApplications.length === 0 ? (
          <Card className="text-center py-16 bg-gray-50 border border-gray-200">
            <div className="bg-gray-100 p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              {statusFilter === 'hired' ? (
                <Award className="h-12 w-12 text-gray-500" />
              ) : (
                <Users className="h-12 w-12 text-gray-500" />
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
                className="mt-4 bg-gradient-to-r from-[#003366] to-[#00509E] hover:from-[#003366]/90 hover:to-[#00509E]/90 text-white font-bold py-2 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
              >
                View All Applications
              </button>
            )}
          </Card>
        ) : (
          filteredApplications.map((application) => {
            const status = application.applicationStatus || 'pending';
            
            // Clean card design with bold left border accent for easy distinction
            const getStatusAccent = () => {
              switch (status) {
                case 'hired': return 'border-l-[6px] border-l-green-500 border-2 border-green-200';
                case 'pending': return 'border-l-[6px] border-l-[#00509E] border-2 border-blue-200';
                case 'interview_scheduled': return 'border-l-[6px] border-l-purple-500 border-2 border-purple-200';
                case 'interview_done': return 'border-l-[6px] border-l-[#003366] border-2 border-[#003366]/30';
                case 'rejected': return 'border-l-[6px] border-l-red-500 border-2 border-red-200';
                default: return 'border-l-[6px] border-l-gray-400 border-2 border-gray-200';
              }
            };

            const getIconBgColor = () => {
              switch (status) {
                case 'hired': return 'bg-green-100 text-green-600';
                case 'pending': return 'bg-[#00509E]/10 text-[#00509E]';
                case 'interview_scheduled': return 'bg-purple-100 text-purple-600';
                case 'interview_done': return 'bg-[#003366]/10 text-[#003366]';
                case 'rejected': return 'bg-red-100 text-red-600';
                default: return 'bg-gray-100 text-gray-600';
              }
            };

            const getStatusBadgeStyle = () => {
              switch (status) {
                case 'hired': return 'bg-green-500 text-white';
                case 'pending': return 'bg-[#00509E] text-white';
                case 'interview_scheduled': return 'bg-purple-500 text-white';
                case 'interview_done': return 'bg-[#003366] text-white';
                case 'rejected': return 'bg-red-500 text-white';
                default: return 'bg-gray-500 text-white';
              }
            };
            
            return (
            <Card key={application._id} className={`bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden ${getStatusAccent()}`}>
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    {/* Header with Avatar and Name */}
                    <div className="flex items-center space-x-4 mb-4">
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center ${getIconBgColor()}`}>
                        {status === 'hired' ? (
                          <Award className="w-7 h-7" />
                        ) : status === 'pending' ? (
                          <Clock className="w-7 h-7" />
                        ) : status === 'interview_scheduled' ? (
                          <Calendar className="w-7 h-7" />
                        ) : status === 'interview_done' ? (
                          <CheckCircle className="w-7 h-7" />
                        ) : status === 'rejected' ? (
                          <XCircle className="w-7 h-7" />
                        ) : (
                          <User className="w-7 h-7" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <h3 className="text-xl font-bold text-gray-900 hover:text-[#003366] transition-colors">
                            {application.studentName}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getStatusBadgeStyle()}`}>
                            {status === 'interview_scheduled' ? 'Interview' : status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5">{application.studentEmail}</p>
                      </div>
                    </div>

                  {/* Student Profile Summary - Clean Tags */}
                  {application.studentProfile && (
                    <div className="mb-4">
                      <div className="flex flex-wrap items-center gap-2">
                        {application.studentProfile.rollNumber && (
                          <span className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg font-semibold text-xs border border-gray-200">
                            🎓 {application.studentProfile.rollNumber}
                          </span>
                        )}
                        {application.studentProfile.department && (
                          <span className="bg-[#003366]/5 text-[#003366] px-3 py-1.5 rounded-lg font-semibold text-xs border border-[#003366]/20">
                            📚 {application.studentProfile.department}
                          </span>
                        )}
                        {application.studentProfile.semester && (
                          <span className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg font-semibold text-xs border border-gray-200">
                            📅 Sem {application.studentProfile.semester}
                          </span>
                        )}
                        {application.studentProfile.cgpa && (
                          <span className="bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg font-semibold text-xs border border-amber-200">
                            ⭐ CGPA: {application.studentProfile.cgpa}
                          </span>
                        )}
                        {application.studentProfile.cv && application.studentProfile.cv.path && (
                          <span className="bg-green-50 text-green-700 px-3 py-1.5 rounded-lg font-semibold text-xs border border-green-200 flex items-center gap-1">
                            <FileText className="w-3 h-3" /> CV
                          </span>
                        )}
                        {application.studentProfile.certificates && application.studentProfile.certificates.length > 0 && (
                          <span className="bg-purple-50 text-purple-700 px-3 py-1.5 rounded-lg font-semibold text-xs border border-purple-200 flex items-center gap-1">
                            <Award className="w-3 h-3" /> {application.studentProfile.certificates.length} Cert
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Application Details - Clean Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <Briefcase className="w-4 h-4 text-[#003366] mr-2 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Position</p>
                        <p className="text-sm text-gray-900 font-semibold truncate">{application.jobTitle}</p>
                      </div>
                    </div>
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <User className="w-4 h-4 text-[#00509E] mr-2 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Supervisor</p>
                        <p className="text-sm text-gray-900 font-semibold truncate">{application.supervisorName}</p>
                      </div>
                    </div>
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <Calendar className="w-4 h-4 text-gray-600 mr-2 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Applied</p>
                        <p className="text-sm text-gray-900 font-semibold">{new Date(application.appliedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Hiring Date - Success Banner */}
                  {application.hiringDate && (
                    <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200 flex items-center">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-green-600 font-medium">Hired On</p>
                        <p className="text-sm text-green-800 font-bold">{new Date(application.hiringDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Side - Actions */}
                <div className="flex flex-col items-end space-y-3 ml-6">
                  {/* View Details Button */}
                  <button
                    onClick={() => handleViewDetails(application)}
                    className="w-full min-w-[180px] bg-[#003366] hover:bg-[#002244] text-white font-semibold py-2.5 px-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>

                  {/* Action buttons based on status */}
                  {(!application.applicationStatus || application.applicationStatus === 'pending') && (
                    <div className="flex flex-col gap-2 w-full">
                      {/* Show Schedule Interview button if supervisor has approved */}
                      {application.supervisorStatus === 'approved' && (
                        <button
                          onClick={() => {
                            setSelectedApplication(application);
                            setShowInterviewModal(true);
                          }}
                          disabled={actionLoading === application._id}
                          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2"
                        >
                          <Calendar className="w-4 h-4" />
                          Schedule Interview
                        </button>
                      )}
                      <button
                        onClick={() => handleRejectWithNote(application)}
                        disabled={actionLoading === application._id}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  )}

                  {application.applicationStatus === 'interview_scheduled' && (
                    <button
                      onClick={() => handleStatusUpdate(application._id, 'interview_done')}
                      disabled={actionLoading === application._id}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Mark Interview Done
                    </button>
                  )}

                  {application.applicationStatus === 'interview_done' && (
                    <div className="flex gap-2 w-full">
                      <button
                        onClick={() => openOfferLetterModal(application)}
                        disabled={actionLoading === application._id}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-1"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Hire
                      </button>
                      <button
                        onClick={() => handleRejectWithNote(application)}
                        disabled={actionLoading === application._id}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-1"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  )}

                  {application.applicationStatus === 'hired' && (
                    <button
                      onClick={() => handleViewOfferLetter(application)}
                      className="w-full bg-[#00509E] hover:bg-[#003366] text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      View Offer Letter
                    </button>
                  )}
                </div>
              </div>
            </div>
            </Card>
          );
        })
        )}
      </div>

      {/* Application Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title=""
        size="xl"
        className="max-h-[90vh] overflow-y-auto"
      >
        {selectedApplication && (
          <div className="space-y-6">
            {/* Modern Header Section with COMSATS Colors */}
            <div className="relative overflow-hidden bg-gradient-to-r from-[#003366] via-[#00509E] to-[#003366] rounded-lg border border-gray-300 p-4">
              {/* COMSATS themed background pattern */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#003366]/10 to-[#00509E]/10 opacity-50"></div>
              <div className="absolute -top-5 -right-5 w-20 h-20 bg-[#003366]/20 rounded-full blur-xl"></div>
              <div className="absolute -bottom-3 -left-3 w-16 h-16 bg-[#00509E]/20 rounded-full blur-lg"></div>
              
              <div className="relative flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-md transform hover:scale-105 transition-transform duration-200 border border-white/20">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white mb-1 leading-tight drop-shadow-sm">
                      {selectedApplication.studentName}
                    </h1>
                    <p className="text-sm font-semibold text-blue-100">
                      {selectedApplication.studentEmail}
                    </p>
                  </div>
                </div>
                <Badge
                  variant={getStatusColor(selectedApplication.applicationStatus || 'pending')}
                  className="bg-white/90 backdrop-blur-sm border border-[#003366]/20 text-[#003366] font-bold text-sm px-3 py-1.5 rounded-md shadow-sm"
                >
                  {getStatusText(selectedApplication.applicationStatus || 'pending')}
                </Badge>
              </div>
            </div>

            {/* Info Cards Grid - COMSATS Design */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white rounded-lg border border-gray-300 p-3 hover:border-[#003366] hover:shadow-md transition-all duration-200">
                <div className="flex items-center space-x-2 mb-1">
                  <div className="w-8 h-8 bg-[#F5F6FA] rounded-md flex items-center justify-center border border-gray-200">
                    <FileText className="w-4 h-4 text-[#003366]" />
                  </div>
                  <span className="text-xs font-medium text-gray-700">Job Position</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">{selectedApplication.jobTitle}</p>
              </div>

              <div className="bg-white rounded-lg border border-gray-300 p-3 hover:border-[#003366] hover:shadow-md transition-all duration-200">
                <div className="flex items-center space-x-2 mb-1">
                  <div className="w-8 h-8 bg-[#F5F6FA] rounded-md flex items-center justify-center border border-gray-200">
                    <User className="w-4 h-4 text-[#00509E]" />
                  </div>
                  <span className="text-xs font-medium text-gray-700">Supervisor</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">{selectedApplication.supervisorName}</p>
              </div>

              <div className="bg-white rounded-lg border border-gray-300 p-3 hover:border-[#003366] hover:shadow-md transition-all duration-200">
                <div className="flex items-center space-x-2 mb-1">
                  <div className="w-8 h-8 bg-[#F5F6FA] rounded-md flex items-center justify-center border border-gray-200">
                    <Calendar className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-xs font-medium text-gray-700">Applied Date</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">{new Date(selectedApplication.appliedAt).toLocaleDateString()}</p>
              </div>

              <div className="bg-white rounded-lg border border-gray-300 p-3 hover:border-[#003366] hover:shadow-md transition-all duration-200">
                <div className="flex items-center space-x-2 mb-1">
                  <div className="w-8 h-8 bg-[#F5F6FA] rounded-md flex items-center justify-center border border-gray-200">
                    <Hash className="w-4 h-4 text-[#003366]" />
                  </div>
                  <span className="text-xs font-medium text-gray-700">Roll Number</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">{selectedApplication.studentProfile?.rollNumber || 'N/A'}</p>
              </div>
            </div>

            {/* Student Profile Details */}
            {selectedApplication.studentProfile && (
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Detailed Student Profile
                </h3>
                <div className="bg-teal-50 p-4 rounded-lg space-y-4">
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
                <div className="bg-teal-50 p-3 rounded">
                  <p className="text-sm">
                    <strong>Type:</strong> {selectedApplication.interviewDetails.type}
                  </p>
                  <p className="text-sm">
                    <strong>Date:</strong> {new Date(selectedApplication.interviewDetails.date).toLocaleDateString()}
                  </p>
                  <p className="text-sm">
                    <strong>Time:</strong> {selectedApplication.interviewDetails.time || 'Not specified'}
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
                { value: 'in-person', label: 'In-Person Interview' }
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

          {interviewData.type === 'in-person' && (
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
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
            <div className="bg-teal-50 p-3 rounded-lg">
              <p className="text-sm font-medium text-teal-800">Application Details:</p>
              <p className="text-sm text-teal-700">
                Student: {selectedApplication.studentName}
              </p>
              <p className="text-sm text-teal-700">
                Position: {selectedApplication.jobTitle}
              </p>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rejection Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
                  <FileText className="w-6 h-6 mr-2 text-teal-600" />
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
