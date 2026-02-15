import { useState, useEffect, useCallback } from 'react';
import { UserCheck, CheckCircle, XCircle, Calendar, User, Building2, Download, FileText, Award, Eye, Filter, Search, SortAsc, SortDesc, ChevronDown, X, GraduationCap } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { applicationAPI } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import Card from '../../../ui/Card';
import Button from '../../../ui/Button';
import Badge from '../../../ui/Badge';
import SearchBar from '../../../ui/SearchBar';
import Modal from '../../../ui/Modal';
import LoadingSpinner from '../../../ui/LoadingSpinner';

const RequestsTab = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [rejectionNote, setRejectionNote] = useState('');
  const [feedbackData, setFeedbackData] = useState({
    reason: '',
    details: '',
    requestedFixes: [],
    fieldsToEdit: []
  });
  const [actionLoading, setActionLoading] = useState(null);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0, pendingCompany: 0, hired: 0 });
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

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

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      
      // Check authentication before making API calls
      if (!isAuthenticated) {
        console.log('🔑 User not authenticated, redirecting to login');
        toast.error('Please log in to view applications');
        window.location.href = '/login';
        return;
      }
      
      // Fetch ALL applications regardless of status to maintain history
      const response = await applicationAPI.getAllSupervisorApplications();
      
      if (response.success) {
        const applications = response.data || [];
        setRequests(applications);
        
        // Use stats from API response if available, otherwise calculate locally
        if (response.stats) {
          setStats(response.stats);
        } else {
          setStats({
            total: applications.length,
            pending: applications.filter(app => app.supervisorStatus === 'pending').length,
            approved: applications.filter(app => app.supervisorStatus === 'approved').length,
            rejected: applications.filter(app => app.supervisorStatus === 'rejected').length,
            pendingCompany: applications.filter(app => app.overallStatus === 'pending_company').length,
            hired: applications.filter(app => app.applicationStatus === 'hired').length
          });
        }
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      
      // Handle authentication errors specifically
      if (error.message === 'Token is not valid' || error.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
        window.location.href = '/login';
        return;
      }
      
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]); // Re-run when authentication status changes

  const handleRequestAction = async (applicationId, action, note = '') => {
    try {
      setActionLoading(applicationId);
      
      const status = action === 'approved' ? 'approved' : 'rejected';
      const payload = { status };
      
      // Add rejection note if rejecting
      if (status === 'rejected' && note) {
        payload.rejectionNote = note;
      }
      
      const response = await applicationAPI.supervisorReviewApplication(applicationId, payload);
      
      if (response.success) {
        // Refresh the applications list to get the updated data
        await fetchApplications();
        toast.success(`Application ${status} successfully!`);
        
        // Close rejection modal if it was open
        if (showRejectModal) {
          setShowRejectModal(false);
          setRejectionNote('');
          setSelectedRequest(null);
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

  const handleRequestChangesClick = (request) => {
    setSelectedRequest(request);
    setFeedbackData({
      reason: '',
      details: '',
      requestedFixes: [],
      fieldsToEdit: []
    });
    setShowFeedbackModal(true);
  };

  const handleRejectWithNote = () => {
    if (selectedRequest) {
      handleRequestAction(selectedRequest._id, 'rejected', rejectionNote);
    }
  };

  const handleRejectWithFeedback = async () => {
    if (!selectedRequest || !feedbackData.reason || !feedbackData.details) {
      toast.error('Please provide both reason and details for rejection');
      return;
    }

    try {
      setActionLoading(selectedRequest._id);
      
      const response = await applicationAPI.supervisorRejectWithFeedback(selectedRequest._id, feedbackData);
      
      if (response.success) {
        await fetchApplications();
        toast.success('Application rejected with feedback');
        setShowFeedbackModal(false);
        setFeedbackData({
          reason: '',
          details: '',
          requestedFixes: [],
          fieldsToEdit: []
        });
        setSelectedRequest(null);
      } else {
        toast.error(response.message || 'Failed to reject application');
      }
    } catch (error) {
      console.error('Error rejecting application:', error);
      toast.error('Failed to reject application');
    } finally {
      setActionLoading(null);
    }
  };

  const handleApproveApplication = async (applicationId) => {
    try {
      if (!isAuthenticated) {
        toast.error('Please log in to perform this action');
        window.location.href = '/login';
        return;
      }
      
      setActionLoading(applicationId);
      
      const response = await applicationAPI.supervisorApproveApplication(applicationId);
      
      if (response.success) {
        await fetchApplications();
        toast.success('Application approved successfully');
      } else {
        toast.error(response.message || 'Failed to approve application');
      }
    } catch (error) {
      console.error('Error approving application:', error);
      
      // Handle authentication errors
      if (error.message === 'Token is not valid' || error.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
        window.location.href = '/login';
        return;
      }
      
      toast.error('Failed to approve application');
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewRequest = (request) => {
    setSelectedRequest(request);
    setShowRequestModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'danger';
      default: return 'default';
    }
  };

  const getOverallStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'danger';
      case 'hired': return 'success';
      default: return 'default';
    }
  };

  const getOverallStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      case 'hired': return 'Hired';
      default: return status?.charAt(0).toUpperCase() + status?.slice(1) || 'Unknown';
    }
  };

  // Get unique departments for filter dropdown
  const departments = [...new Set(requests.map(r => {
    return r.studentProfile?.department || 'Unknown';
  }).filter(d => d && d !== 'Unknown'))].sort();

  const filteredRequests = requests.filter(request => {
    // Filter by status
    const statusMatch = statusFilter === 'all' || 
      (statusFilter === 'pending' && request.supervisorStatus === 'pending') ||
      (statusFilter === 'approved' && request.supervisorStatus === 'approved') ||
      (statusFilter === 'rejected' && request.supervisorStatus === 'rejected') ||
      (statusFilter === 'pending_company' && request.overallStatus === 'pending_company') ||
      (statusFilter === 'hired' && request.applicationStatus === 'hired');
    
    // Filter by department
    const dept = request.studentProfile?.department || '';
    const departmentMatch = departmentFilter === 'all' || dept.toLowerCase() === departmentFilter.toLowerCase();
    
    // Filter by search term
    const searchMatch = searchTerm === '' || (
      request.studentId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.jobId?.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.jobId?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.studentProfile?.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.studentProfile?.department?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    return statusMatch && searchMatch && departmentMatch;
  }).sort((a, b) => {
    // Sort logic
    const dateA = new Date(a.appliedAt || a.createdAt);
    const dateB = new Date(b.appliedAt || b.createdAt);
    const nameA = (a.studentName || a.studentId?.name || '').toLowerCase();
    const nameB = (b.studentName || b.studentId?.name || '').toLowerCase();
    const cgpaA = parseFloat(a.studentProfile?.cgpa || 0);
    const cgpaB = parseFloat(b.studentProfile?.cgpa || 0);
    
    switch (sortBy) {
      case 'newest':
        return dateB - dateA;
      case 'oldest':
        return dateA - dateB;
      case 'name-asc':
        return nameA.localeCompare(nameB);
      case 'name-desc':
        return nameB.localeCompare(nameA);
      case 'cgpa-high':
        return cgpaB - cgpaA;
      case 'cgpa-low':
        return cgpaA - cgpaB;
      default:
        return dateB - dateA;
    }
  });

  const clearAllFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDepartmentFilter('all');
    setSortBy('newest');
  };

  const hasActiveFilters = searchTerm || statusFilter !== 'all' || departmentFilter !== 'all' || sortBy !== 'newest';

  // Authentication check
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Authentication Required</h3>
          <p className="text-gray-600 mb-4">Please log in to view your applications.</p>
          <Button onClick={() => window.location.href = '/login'}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Card className="group bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-[#003366] to-[#0059b3]"></div>
          <div className="p-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-gray-200 border-t-[#003366] rounded-full animate-spin"></div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Loading Job Applications</h3>
                <p className="text-gray-600">Please wait while we fetch the applications...</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* COMSATS Header Section */}
      <div className="relative bg-gradient-to-r from-[#003366] via-[#00509E] to-[#003366] rounded-lg p-4 text-white shadow-md overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-lg shadow-sm">
                <UserCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold mb-1 text-white">
                  Job Applications
                </h1>
                <p className="text-blue-100 text-sm">
                  Review and manage student job applications
                </p>
              </div>
            </div>
          </div>

          {/* Quick Stats - COMSATS Compact */}
          <div className="grid grid-cols-6 gap-2">
            <div className="bg-white/10 rounded-lg p-2">
              <div className="flex items-center gap-1 mb-0.5">
                <UserCheck className="w-3 h-3 text-blue-200" />
                <span className="text-blue-200 text-xs font-medium">Total</span>
              </div>
              <p className="text-white font-bold text-sm">{stats.total}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-2">
              <div className="flex items-center gap-1 mb-0.5">
                <Calendar className="w-3 h-3 text-yellow-200" />
                <span className="text-blue-200 text-xs font-medium">Pending</span>
              </div>
              <p className="text-white font-bold text-sm">{stats.pending}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-2">
              <div className="flex items-center gap-1 mb-0.5">
                <CheckCircle className="w-3 h-3 text-green-200" />
                <span className="text-blue-200 text-xs font-medium">Approved</span>
              </div>
              <p className="text-white font-bold text-sm">{stats.approved}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-2">
              <div className="flex items-center gap-1 mb-0.5">
                <XCircle className="w-3 h-3 text-red-200" />
                <span className="text-blue-200 text-xs font-medium">Rejected</span>
              </div>
              <p className="text-white font-bold text-sm">{stats.rejected}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-2">
              <div className="flex items-center gap-1 mb-0.5">
                <Building2 className="w-3 h-3 text-blue-200" />
                <span className="text-blue-200 text-xs font-medium">Company</span>
              </div>
              <p className="text-white font-bold text-sm">{stats.pendingCompany}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-2">
              <div className="flex items-center gap-1 mb-0.5">
                <CheckCircle className="w-3 h-3 text-purple-200" />
                <span className="text-blue-200 text-xs font-medium">Hired</span>
              </div>
              <p className="text-white font-bold text-sm">{stats.hired}</p>
            </div>
          </div>
        </div>
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white rounded-full transform translate-x-10 -translate-y-10"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-white rounded-full transform -translate-x-8 translate-y-8"></div>
        </div>
      </div>

      {/* Section Header with Search and Filters */}
      <div className="bg-gradient-to-r from-blue-50 to-white border border-blue-100 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-[#003366] rounded-lg shadow-md">
              <UserCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Student Applications</h3>
              <p className="text-sm text-gray-600 mt-1">Review and respond to job applications</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-[#003366]">{filteredRequests.length}</div>
              <div className="text-xs text-gray-500">
                {stats.approved} approved • {stats.rejected} rejected
              </div>
            </div>
            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 bg-[#003366] text-white shadow-md hover:bg-[#00509E]"
            >
              <Filter className="w-4 h-4" />
              Filters
              {hasActiveFilters && (
                <span className="bg-white text-[#003366] text-xs font-bold px-1.5 py-0.5 rounded-full">
                  !
                </span>
              )}
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Expandable Filters Panel */}
        {showFilters && (
          <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4 shadow-sm animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Filter className="w-5 h-5 text-[#003366]" />
                Filter & Sort Options
              </h4>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Clear All
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search Box */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Search className="w-4 h-4 inline mr-1" />
                  Search
                </label>
                <input
                  type="text"
                  placeholder="Name, company, job title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent text-sm"
                />
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <CheckCircle className="w-4 h-4 inline mr-1" />
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent bg-white text-sm"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending Supervisor</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="pending_company">Pending Company</option>
                  <option value="hired">Hired</option>
                </select>
              </div>

              {/* Department Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <GraduationCap className="w-4 h-4 inline mr-1" />
                  Department
                </label>
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent bg-white text-sm"
                >
                  <option value="all">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <SortAsc className="w-4 h-4 inline mr-1" />
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent bg-white text-sm"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="name-asc">Name (A-Z)</option>
                  <option value="name-desc">Name (Z-A)</option>
                  <option value="cgpa-high">CGPA (High to Low)</option>
                  <option value="cgpa-low">CGPA (Low to High)</option>
                </select>
              </div>
            </div>

            {/* Active Filters Summary */}
            {hasActiveFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center flex-wrap gap-2">
                  <span className="text-sm text-gray-600 font-medium">Active filters:</span>
                  {searchTerm && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#003366]/10 text-[#003366] rounded-full text-sm font-medium">
                      Search: "{searchTerm.substring(0, 15)}{searchTerm.length > 15 ? '...' : ''}"
                      <button onClick={() => setSearchTerm('')} className="hover:bg-[#003366]/20 rounded-full p-0.5">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {statusFilter !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#003366]/10 text-[#003366] rounded-full text-sm font-medium">
                      Status: {statusFilter.replace('_', ' ')}
                      <button onClick={() => setStatusFilter('all')} className="hover:bg-[#003366]/20 rounded-full p-0.5">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {departmentFilter !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#003366]/10 text-[#003366] rounded-full text-sm font-medium">
                      Dept: {departmentFilter}
                      <button onClick={() => setDepartmentFilter('all')} className="hover:bg-[#003366]/20 rounded-full p-0.5">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {sortBy !== 'newest' && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#003366]/10 text-[#003366] rounded-full text-sm font-medium">
                      Sort: {sortBy.replace('-', ' ')}
                      <button onClick={() => setSortBy('newest')} className="hover:bg-[#003366]/20 rounded-full p-0.5">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quick Search (always visible when filters are closed) */}
        {!showFilters && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Search className="w-4 h-4 inline mr-1" />
              Quick Search
            </label>
            <input
              type="text"
              placeholder="Enter student name, company, job title, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
            />
          </div>
        )}
      </div>

      {/* Statistics Cards - Hidden since they're in header now */}
      <div className="hidden grid-cols-2 md:grid-cols-6 gap-4">
        <Card className="group bg-white border border-gray-200 hover:border-[#003366] rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-[#003366] to-[#0059b3]"></div>
          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#003366] rounded-lg flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{stats.total}</h3>
                <p className="text-sm text-gray-600">Total</p>
              </div>
            </div>
          </div>
        </Card>
        
        <Card className="group bg-white border border-gray-200 hover:border-[#003366] rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-yellow-400 to-yellow-500"></div>
          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{stats.pending}</h3>
                <p className="text-sm text-gray-600">Pending</p>
              </div>
            </div>
          </div>
        </Card>
        
        <Card className="group bg-white border border-gray-200 hover:border-[#003366] rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-green-500 to-green-600"></div>
          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{stats.approved}</h3>
                <p className="text-sm text-gray-600">Approved</p>
              </div>
            </div>
          </div>
        </Card>
        
        <Card className="group bg-white border border-gray-200 hover:border-[#003366] rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-red-500 to-red-600"></div>
          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                <XCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{stats.rejected}</h3>
                <p className="text-sm text-gray-600">Rejected</p>
              </div>
            </div>
          </div>
        </Card>
        
        <Card className="group bg-white border border-gray-200 hover:border-[#003366] rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-blue-500 to-blue-600"></div>
          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{stats.pendingCompany}</h3>
                <p className="text-sm text-gray-600">Company</p>
              </div>
            </div>
          </div>
        </Card>
        
        <Card className="group bg-white border border-gray-200 hover:border-[#003366] rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-purple-500 to-purple-600"></div>
          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{stats.hired}</h3>
                <p className="text-sm text-gray-600">Hired</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <Card className="group bg-white border border-gray-200 hover:border-[#003366] rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-gray-300 to-gray-400"></div>
            <div className="p-8 text-center">
              <div className="flex flex-col items-center gap-6">
                <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                  <UserCheck className="w-8 h-8 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">No Job Applications</h3>
                  <p className="text-gray-600 max-w-md">
                    {searchTerm ? 'No applications match your search criteria.' : 'No job applications have been submitted yet.'}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        ) : (
          filteredRequests.map((request) => {
            const studentData = request.studentData || request;
            const jobData = request.jobData || request;
            return (
              <Card key={request._id} className="group bg-white border border-gray-200 hover:border-[#003366] rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
                <div className={`h-2 bg-gradient-to-r ${
                  request.supervisorStatus === 'pending' ? 'from-yellow-400 to-yellow-500' :
                  request.supervisorStatus === 'approved' ? 'from-green-500 to-green-600' :
                  'from-red-500 to-red-600'
                }`}></div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#003366] rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <UserCheck className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#003366] transition-colors">
                            {jobData.title || request.jobTitle}
                          </h3>
                          <Badge variant={getStatusColor(request.supervisorStatus)} className="px-3 py-1 text-sm font-semibold">
                            {request.supervisorStatus.charAt(0).toUpperCase() + request.supervisorStatus.slice(1)}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-600">
                            Student: {studentData.name || request.studentName}
                          </p>
                          <p className="text-sm text-gray-500">
                            Company: {jobData.companyName || request.companyName}
                          </p>
                          <p className="text-sm text-gray-500">
                            Applied: {new Date(request.appliedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {request.overallStatus && request.overallStatus !== request.supervisorStatus && (
                        <Badge variant={getOverallStatusColor(request.overallStatus)} className="px-3 py-1 text-sm font-semibold">
                          {getOverallStatusText(request.overallStatus)}
                        </Badge>
                      )}
                      <Button
                        onClick={() => handleViewRequest(request)}
                        className="bg-[#003366] hover:bg-[#0059b3] text-white px-4 py-2 rounded-lg font-medium transition-all duration-200"
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                  
                  {/* Student Profile Summary */}
                  {request.studentProfile && (
                    <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center space-x-4 text-sm">
                        {request.studentProfile.rollNumber && (
                          <span className="font-medium">Roll: {request.studentProfile.rollNumber}</span>
                        )}
                        {request.studentProfile.department && (
                          <span>Dept: {request.studentProfile.department}</span>
                        )}
                        {request.studentProfile.semester && (
                          <span>Sem: {request.studentProfile.semester}</span>
                        )}
                        {request.studentProfile.cgpa && (
                          <span>CGPA: {request.studentProfile.cgpa}</span>
                        )}
                        <div className="flex items-center space-x-2">
                          {request.studentProfile.cv && request.studentProfile.cv.path && (
                            <div className="flex items-center text-green-600">
                              <FileText className="w-4 h-4 mr-1" />
                              <span className="text-xs">CV</span>
                            </div>
                          )}
                          {request.studentProfile.certificates && request.studentProfile.certificates.length > 0 && (
                            <div className="flex items-center text-blue-600">
                              <Award className="w-4 h-4 mr-1" />
                              <span className="text-xs">{request.studentProfile.certificates.length} cert(s)</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Special Status Messages */}
                  {request.overallStatus === 'supervisor_changes_requested' && request.rejectionFeedback && (
                    <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-sm font-medium text-yellow-800">Changes Requested:</p>
                      <p className="text-sm text-yellow-700 mt-1">{request.rejectionFeedback.reason}</p>
                    </div>
                  )}
                  
                  {request.overallStatus === 'resubmitted_to_supervisor' && (
                    <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm font-medium text-blue-800">Resubmitted - Awaiting Review</p>
                    </div>
                  )}
                  
                  {request.supervisorStatus === 'rejected' && request.rejectionNote && (
                    <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-sm font-medium text-red-800">Supervisor Rejection:</p>
                      <p className="text-sm text-red-700 mt-1">{request.rejectionNote}</p>
                    </div>
                  )}
                  
                  {request.applicationStatus === 'rejected' && request.companyRejectionNote && (
                    <div className="mt-4 bg-orange-50 border border-orange-200 rounded-lg p-3">
                      <p className="text-sm font-medium text-orange-800">Company Rejection:</p>
                      <p className="text-sm text-orange-700 mt-1">{request.companyRejectionNote}</p>
                    </div>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Request Details Modal - Redesigned to match Supervisor Request style */}
      {showRequestModal && selectedRequest && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header with COMSATS Gradient */}
            <div className="sticky top-0 z-10 bg-gradient-to-r from-[#003366] to-[#00509E] px-6 py-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                    <UserCheck className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Job Application Details</h3>
                    <p className="text-sm text-blue-100">
                      {selectedRequest?.studentId?.name || 'Student'} • Applied on {new Date(selectedRequest?.appliedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Split Layout - Student Info | Job Details */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Side - Student Information */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-[#003366] to-[#00509E] p-4 flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white">Student Information</h3>
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</label>
                      <p className="text-base font-semibold text-gray-900 mt-1">{selectedRequest.studentId?.name || 'Unknown Student'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Email Address</label>
                      <p className="text-base font-semibold text-gray-900 mt-1">{selectedRequest.studentId?.email || 'Not provided'}</p>
                    </div>
                    {selectedRequest.studentProfile && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Roll Number</label>
                            <p className="text-base font-semibold text-gray-900 mt-1">{selectedRequest.studentProfile.rollNumber || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">CGPA</label>
                            <p className="text-base font-semibold text-gray-900 mt-1">{selectedRequest.studentProfile.cgpa || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Department</label>
                            <p className="text-base font-semibold text-gray-900 mt-1">{selectedRequest.studentProfile.department || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Semester</label>
                            <p className="text-base font-semibold text-gray-900 mt-1">{selectedRequest.studentProfile.semester || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance</label>
                            <p className="text-base font-semibold text-gray-900 mt-1">{selectedRequest.studentProfile.attendance ? `${selectedRequest.studentProfile.attendance}%` : 'N/A'}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Backlogs</label>
                            <p className="text-base font-semibold text-gray-900 mt-1">{selectedRequest.studentProfile.backlogs || 0}</p>
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Phone Number</label>
                          <p className="text-base font-semibold text-gray-900 mt-1">{selectedRequest.studentProfile.phoneNumber || 'Not provided'}</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Right Side - Job Details */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-[#003366] to-[#00509E] p-4 flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Building2 className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white">Job Details</h3>
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Company Name</label>
                      <p className="text-base font-semibold text-gray-900 mt-1">{selectedRequest.jobId?.companyName || 'Unknown Company'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Position Applied</label>
                      <p className="text-base font-semibold text-gray-900 mt-1">{selectedRequest.jobId?.jobTitle || 'Unknown Position'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Location</label>
                      <p className="text-base font-semibold text-gray-900 mt-1">{selectedRequest.jobId?.location || 'Not specified'}</p>
                    </div>
                    {selectedRequest.jobId?.salary && (
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Salary</label>
                        <p className="text-base font-semibold text-gray-900 mt-1">PKR {selectedRequest.jobId.salary.toLocaleString()}</p>
                      </div>
                    )}
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Application Status</label>
                      <div className="mt-2">
                        <Badge 
                          variant={getStatusColor(selectedRequest.supervisorStatus)} 
                          className="px-3 py-1 text-sm font-semibold"
                        >
                          {selectedRequest.supervisorStatus.charAt(0).toUpperCase() + selectedRequest.supervisorStatus.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Application Timeline */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-[#003366] to-[#00509E] p-4 flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Application Timeline</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className={`w-3 h-3 rounded-full mt-1 ${selectedRequest.supervisorStatus !== 'pending' ? 'bg-green-500' : 'bg-yellow-400'}`}></div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">Application Submitted</p>
                        <p className="text-sm text-gray-500">
                          {new Date(selectedRequest.appliedAt).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    {selectedRequest.supervisorStatus === 'approved' && (
                      <div className="flex items-start gap-4">
                        <div className="w-3 h-3 rounded-full bg-green-500 mt-1"></div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">Approved by Supervisor</p>
                          <p className="text-sm text-gray-500">Application forwarded to company</p>
                        </div>
                      </div>
                    )}
                    {selectedRequest.supervisorStatus === 'rejected' && (
                      <div className="flex items-start gap-4">
                        <div className="w-3 h-3 rounded-full bg-red-500 mt-1"></div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">Rejected by Supervisor</p>
                          <p className="text-sm text-gray-500">Application denied</p>
                        </div>
                      </div>
                    )}
                    {selectedRequest.supervisorStatus === 'pending' && (
                      <div className="flex items-start gap-4">
                        <div className="w-3 h-3 rounded-full bg-yellow-400 mt-1"></div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">Pending Supervisor Review</p>
                          <p className="text-sm text-gray-500">Awaiting decision</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* CV & Certificates Section */}
              {selectedRequest.studentProfile && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-[#003366] to-[#00509E] p-4 flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white">Documents & Certificates</h3>
                  </div>
                  <div className="p-6 space-y-6">
                    {/* CV Section */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#003366]" />
                        Curriculum Vitae
                      </h4>
                      {selectedRequest.studentProfile.cv && selectedRequest.studentProfile.cv.path ? (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-gray-900">{selectedRequest.studentProfile.cv.originalName}</p>
                              <p className="text-sm text-gray-500 mt-1">
                                Uploaded: {new Date(selectedRequest.studentProfile.cv.uploadedAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleFilePreview(selectedRequest._id, 'cv', selectedRequest.studentProfile.cv.filename)}
                                className="flex items-center gap-1 bg-[#003366] hover:bg-[#00509E] text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                                Preview
                              </Button>
                              <Button
                                onClick={() => handleFileDownload(selectedRequest._id, 'cv', selectedRequest.studentProfile.cv.filename)}
                                className="flex items-center gap-1 bg-[#003366] hover:bg-[#00509E] text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                              >
                                <Download className="w-4 h-4" />
                                Download
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <p className="text-sm text-gray-500 italic">No CV uploaded</p>
                        </div>
                      )}
                    </div>

                    {/* Certificates Section */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <Award className="w-4 h-4 text-[#003366]" />
                        Certificates
                      </h4>
                      {selectedRequest.studentProfile.certificates && selectedRequest.studentProfile.certificates.length > 0 ? (
                        <div className="space-y-3">
                          {selectedRequest.studentProfile.certificates.map((certificate, index) => (
                            <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-semibold text-gray-900">{certificate.originalName}</p>
                                  <p className="text-sm text-gray-500 mt-1">
                                    Uploaded: {new Date(certificate.uploadedAt).toLocaleDateString()}
                                  </p>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    onClick={() => handleFilePreview(selectedRequest._id, 'certificate', certificate.filename)}
                                    className="flex items-center gap-1 bg-[#003366] hover:bg-[#00509E] text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                                  >
                                    <Eye className="w-4 h-4" />
                                    Preview
                                  </Button>
                                  <Button
                                    onClick={() => handleFileDownload(selectedRequest._id, 'certificate', certificate.filename)}
                                    className="flex items-center gap-1 bg-[#003366] hover:bg-[#00509E] text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                                  >
                                    <Download className="w-4 h-4" />
                                    Download
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <p className="text-sm text-gray-500 italic">No certificates uploaded</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Cover Letter Section */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-[#003366] to-[#00509E] p-4 flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Cover Letter</h3>
                </div>
                <div className="p-6">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-gray-800 whitespace-pre-line leading-relaxed">
                      {selectedRequest.coverLetter || 'No cover letter provided'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Job Description */}
              {selectedRequest.jobId?.description && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-[#003366] to-[#00509E] p-4 flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Building2 className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white">Job Description</h3>
                  </div>
                  <div className="p-6">
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <p className="text-gray-800 whitespace-pre-line leading-relaxed">{selectedRequest.jobId.description}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Rejection Notes */}
              {selectedRequest.rejectionNote && (
                <div className="bg-white rounded-xl border border-red-200 shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-red-500 to-red-600 p-4 flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <XCircle className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white">Supervisor Rejection Reason</h3>
                  </div>
                  <div className="p-6">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-800 leading-relaxed">{selectedRequest.rejectionNote}</p>
                    </div>
                  </div>
                </div>
              )}

              {selectedRequest.companyRejectionNote && (
                <div className="bg-white rounded-xl border border-orange-200 shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Building2 className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white">Company Rejection Reason</h3>
                  </div>
                  <div className="p-6">
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <p className="text-orange-800 leading-relaxed">{selectedRequest.companyRejectionNote}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gradient-to-r from-blue-50 to-slate-50 px-6 py-4 border-t border-gray-200 rounded-b-2xl flex justify-between items-center">
              <div className="text-sm text-gray-600">
                <span className="font-medium">Application ID:</span> {selectedRequest._id?.slice(-8).toUpperCase()}
              </div>
              <div className="flex space-x-3">
                <Button
                  onClick={() => setShowRequestModal(false)}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#003366] hover:bg-[#00509E] text-white rounded-lg font-medium transition-colors focus:ring-[#003366] active:bg-[#002244]"
                >
                  <XCircle className="w-4 h-4" />
                  Close
                </Button>
                {(selectedRequest.supervisorStatus === 'pending' || selectedRequest.overallStatus === 'resubmitted_to_supervisor') && (
                  <>
                    <Button
                      disabled={actionLoading === selectedRequest._id}
                      onClick={() => {
                        handleRequestChangesClick(selectedRequest);
                        setShowRequestModal(false);
                      }}
                      className="flex items-center gap-2 px-6 py-2.5 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                      <Calendar className="w-4 h-4" />
                      {actionLoading === selectedRequest._id ? 'Processing...' : 'Request Changes'}
                    </Button>
                    <Button
                      disabled={actionLoading === selectedRequest._id}
                      onClick={() => {
                        handleApproveApplication(selectedRequest._id);
                        setShowRequestModal(false);
                      }}
                      className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4" />
                      {actionLoading === selectedRequest._id ? 'Processing...' : 'Approve Application'}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setRejectionNote('');
          setSelectedRequest(null);
        }}
        title="Reject Application"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Please provide a reason for rejecting this application. This message will be sent to the student.
          </p>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rejection Reason
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              placeholder="Enter reason for rejection..."
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
                setSelectedRequest(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              disabled={actionLoading || !rejectionNote.trim()}
              onClick={handleRejectWithNote}
            >
              {actionLoading ? 'Processing...' : 'Reject Application'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Request Changes Feedback Modal */}
      <Modal
        isOpen={showFeedbackModal}
        onClose={() => {
          setShowFeedbackModal(false);
          setFeedbackData({
            reason: '',
            details: '',
            requestedFixes: [],
            fieldsToEdit: []
          });
          setSelectedRequest(null);
        }}
        title="Request Changes"
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Provide specific feedback to help the student improve their application.
          </p>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Changes <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Cover letter needs improvement"
              value={feedbackData.reason}
              onChange={(e) => setFeedbackData(prev => ({ ...prev, reason: e.target.value }))}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Detailed Feedback <span className="text-red-500">*</span>
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              placeholder="Provide specific suggestions for improvement..."
              value={feedbackData.details}
              onChange={(e) => setFeedbackData(prev => ({ ...prev, details: e.target.value }))}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Requested Fixes
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="List specific items to fix (one per line)"
              value={feedbackData.requestedFixes.join('\n')}
              onChange={(e) => setFeedbackData(prev => ({ 
                ...prev, 
                requestedFixes: e.target.value.split('\n').filter(fix => fix.trim()) 
              }))}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fields to Edit
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['coverLetter', 'cvUrl', 'certificates', 'answers'].map(field => (
                <label key={field} className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={feedbackData.fieldsToEdit.includes(field)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFeedbackData(prev => ({ 
                          ...prev, 
                          fieldsToEdit: [...prev.fieldsToEdit, field] 
                        }));
                      } else {
                        setFeedbackData(prev => ({ 
                          ...prev, 
                          fieldsToEdit: prev.fieldsToEdit.filter(f => f !== field) 
                        }));
                      }
                    }}
                  />
                  {field === 'coverLetter' ? 'Cover Letter' :
                   field === 'cvUrl' ? 'CV/Resume' :
                   field === 'certificates' ? 'Certificates' :
                   'Additional Answers'}
                </label>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowFeedbackModal(false);
                setFeedbackData({
                  reason: '',
                  details: '',
                  requestedFixes: [],
                  fieldsToEdit: []
                });
                setSelectedRequest(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              disabled={actionLoading || !feedbackData.reason.trim() || !feedbackData.details.trim()}
              onClick={handleRejectWithFeedback}
            >
              {actionLoading ? 'Processing...' : 'Request Changes'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RequestsTab;