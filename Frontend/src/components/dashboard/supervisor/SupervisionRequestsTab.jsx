import { useState, useEffect } from 'react';
import { UserCheck, CheckCircle, XCircle, Calendar, User, Clock, FileText, GraduationCap, Filter, Search, SortAsc, SortDesc, ChevronDown, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supervisionRequestAPI } from '../../../services/api';
import Card from '../../../ui/Card';
import Button from '../../../ui/Button';
import Badge from '../../../ui/Badge';

const SupervisionRequestsTab = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [supervisorComments, setSupervisorComments] = useState('');
  const [stats, setStats] = useState({ total: 0, pending: 0, accepted: 0, rejected: 0 });
  const [showFilters, setShowFilters] = useState(false);
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchSupervisionRequests();
  }, []);

  const fetchSupervisionRequests = async () => {
    try {
      setLoading(true);
      const response = await supervisionRequestAPI.getSupervisorRequests();
      
      if (response.success) {
        setRequests(response.data || []);
        // Use stats from API response if available, otherwise calculate locally
        if (response.stats) {
          setStats(response.stats);
        } else {
          const data = response.data || [];
          setStats({
            total: data.length,
            pending: data.filter(r => r.status === 'pending').length,
            accepted: data.filter(r => r.status === 'accepted').length,
            rejected: data.filter(r => r.status === 'rejected').length
          });
        }
      }
    } catch (error) {
      console.error('Error fetching supervision requests:', error);
      toast.error('Failed to load supervision requests');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAction = async (requestId, action) => {
    try {
      setActionLoading(requestId);
      
      const status = action === 'approve' ? 'accepted' : 'rejected';
      const response = await supervisionRequestAPI.updateRequestStatus(
        requestId, 
        status, 
        supervisorComments
      );
      
      if (response.success) {
        // Refresh the requests list to get the updated data
        await fetchSupervisionRequests();
        toast.success(`Supervision request ${status} successfully!`);
        setShowRequestModal(false);
        setSupervisorComments('');
      } else {
        toast.error(response.message || 'Failed to update request');
      }
    } catch (error) {
      console.error('Error updating supervision request:', error);
      toast.error('Failed to update request');
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewRequest = (request) => {
    setSelectedRequest(request);
    setSupervisorComments('');
    setShowRequestModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'accepted': return 'success';
      case 'rejected': return 'danger';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'accepted': return 'Accepted';
      case 'rejected': return 'Rejected';
      default: return status?.charAt(0).toUpperCase() + status?.slice(1) || 'Unknown';
    }
  };

  // Get unique departments for filter dropdown
  const departments = [...new Set(requests.map(r => {
    const studentData = r.studentData || r;
    return studentData.department || r.studentDepartment || 'Unknown';
  }).filter(d => d && d !== 'Unknown'))].sort();

  const filteredRequests = requests.filter(request => {
    const studentData = request.studentData || request;
    
    // Filter by status
    const statusMatch = statusFilter === 'all' || request.status === statusFilter;
    
    // Filter by department
    const dept = studentData.department || request.studentDepartment || '';
    const departmentMatch = departmentFilter === 'all' || dept.toLowerCase() === departmentFilter.toLowerCase();
    
    // Filter by search term
    const searchMatch = searchTerm === '' || (
      studentData.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      studentData.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.studentEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      studentData.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.studentRollNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      studentData.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.studentDepartment?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    return statusMatch && searchMatch && departmentMatch;
  }).sort((a, b) => {
    // Sort logic
    const dateA = new Date(a.requestedAt || a.createdAt);
    const dateB = new Date(b.requestedAt || b.createdAt);
    const studentDataA = a.studentData || a;
    const studentDataB = b.studentData || b;
    const nameA = (studentDataA.fullName || a.studentName || '').toLowerCase();
    const nameB = (studentDataB.fullName || b.studentName || '').toLowerCase();
    const cgpaA = parseFloat(studentDataA.cgpa || a.studentCGPA || 0);
    const cgpaB = parseFloat(studentDataB.cgpa || b.studentCGPA || 0);
    
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

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="group bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-[#003366] to-[#0059b3]"></div>
          <div className="p-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-gray-200 border-t-[#003366] rounded-full animate-spin"></div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Loading Supervision Requests</h3>
                <p className="text-gray-600">Please wait while we fetch the requests...</p>
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
                  Supervision Requests
                </h1>
                <p className="text-blue-100 text-sm">
                  Manage and respond to student supervision requests
                </p>
              </div>
            </div>
          </div>

          {/* Quick Stats - COMSATS Compact */}
          <div className="grid grid-cols-4 gap-2">
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
                <span className="text-blue-200 text-xs font-medium">Accepted</span>
              </div>
              <p className="text-white font-bold text-sm">{stats.accepted}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-2">
              <div className="flex items-center gap-1 mb-0.5">
                <XCircle className="w-3 h-3 text-red-200" />
                <span className="text-blue-200 text-xs font-medium">Rejected</span>
              </div>
              <p className="text-white font-bold text-sm">{stats.rejected}</p>
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
              <h3 className="text-xl font-bold text-gray-900">Student Requests</h3>
              <p className="text-sm text-gray-600 mt-1">Review and respond to supervision requests</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-[#003366]">{filteredRequests.length}</div>
              <div className="text-xs text-gray-500">
                {stats.accepted} accepted • {stats.rejected} rejected
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
                  placeholder="Name, email, roll no..."
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
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
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
                      Status: {statusFilter}
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
              placeholder="Enter student name, email, roll number, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
            />
          </div>
        )}
      </div>

      {/* Requests List */}
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
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">No Supervision Requests</h3>
                  <p className="text-gray-600 max-w-md">
                    {searchTerm ? 'No requests match your search criteria.' : 'No supervision requests have been submitted yet.'}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        ) : (
          filteredRequests.map((request) => {
            const studentData = request.studentData || request;
            return (
              <Card key={request._id} className="group bg-white border border-gray-200 hover:border-[#003366] rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
                <div className={`h-2 bg-gradient-to-r ${
                  request.status === 'pending' ? 'from-yellow-400 to-yellow-500' :
                  request.status === 'accepted' ? 'from-green-500 to-green-600' :
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
                            {studentData.fullName || request.studentName}
                          </h3>
                          <Badge variant={getStatusColor(request.status)} className="px-3 py-1 text-sm font-semibold">
                            {getStatusText(request.status)}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-600">
                            Roll: {studentData.rollNumber || request.studentRollNumber || 'N/A'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {studentData.department || request.studentDepartment} • {studentData.semester || request.studentSemester} Semester
                          </p>
                          <p className="text-sm text-gray-500">
                            Applied: {new Date(request.requestedAt || request.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <Button
                        onClick={() => handleViewRequest(request)}
                        className="bg-[#003366] hover:bg-[#0059b3] text-white px-4 py-2 rounded-lg font-medium transition-all duration-200"
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Request Details Modal - Redesigned to match Joining Report style */}
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
                    <h3 className="text-xl font-bold text-white">Supervision Request Details</h3>
                    <p className="text-sm text-blue-100">
                      {(() => {
                        const studentData = selectedRequest?.studentData || selectedRequest;
                        return `${studentData?.fullName || selectedRequest?.studentName || 'Student'} • Submitted on ${new Date(selectedRequest?.requestedAt || selectedRequest?.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
                      })()}
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
              {(() => {
                const studentData = selectedRequest.studentData || selectedRequest;
                return (
                  <>
                    {/* Split Layout - Student Info | Academic Details */}
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
                            <p className="text-base font-semibold text-gray-900 mt-1">{studentData.fullName || selectedRequest.studentName || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Roll Number</label>
                            <p className="text-base font-semibold text-gray-900 mt-1">{studentData.rollNumber || selectedRequest.studentRollNumber || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Email Address</label>
                            <p className="text-base font-semibold text-gray-900 mt-1">{studentData.email || selectedRequest.studentEmail || 'N/A'}</p>
                          </div>
                          {(studentData.phoneNumber || selectedRequest.studentPhoneNumber) && (
                            <div>
                              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Phone Number</label>
                              <p className="text-base font-semibold text-gray-900 mt-1">{studentData.phoneNumber || selectedRequest.studentPhoneNumber}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right Side - Academic Details */}
                      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="bg-gradient-to-r from-[#003366] to-[#00509E] p-4 flex items-center gap-3">
                          <div className="p-2 bg-white/20 rounded-lg">
                            <GraduationCap className="w-5 h-5 text-white" />
                          </div>
                          <h3 className="text-lg font-bold text-white">Academic Details</h3>
                        </div>
                        <div className="p-6 space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Department</label>
                              <p className="text-base font-semibold text-gray-900 mt-1">{studentData.department || selectedRequest.studentDepartment || 'N/A'}</p>
                            </div>
                            <div>
                              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Semester</label>
                              <p className="text-base font-semibold text-gray-900 mt-1">{studentData.semester || selectedRequest.studentSemester || 'N/A'}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">CGPA</label>
                              <p className="text-base font-semibold text-gray-900 mt-1">{studentData.cgpa || selectedRequest.studentCGPA || 'N/A'}</p>
                            </div>
                            <div>
                              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Request Status</label>
                              <div className="mt-2">
                                <Badge 
                                  variant={getStatusColor(selectedRequest.status)} 
                                  className="px-3 py-1 text-sm font-semibold"
                                >
                                  {getStatusText(selectedRequest.status)}
                                </Badge>
                              </div>
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
                        <h3 className="text-lg font-bold text-white">Request Timeline</h3>
                      </div>
                      <div className="p-6">
                        <div className="space-y-4">
                          <div className="flex items-start gap-4">
                            <div className={`w-3 h-3 rounded-full mt-1 ${selectedRequest.status !== 'pending' ? 'bg-green-500' : 'bg-yellow-400'}`}></div>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">Request Submitted</p>
                              <p className="text-sm text-gray-500">
                                {new Date(selectedRequest.requestedAt || selectedRequest.createdAt).toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                          {selectedRequest.status === 'accepted' && (
                            <div className="flex items-start gap-4">
                              <div className="w-3 h-3 rounded-full bg-green-500 mt-1"></div>
                              <div className="flex-1">
                                <p className="font-semibold text-gray-900">Request Accepted</p>
                                <p className="text-sm text-gray-500">
                                  {selectedRequest.respondedAt 
                                    ? new Date(selectedRequest.respondedAt).toLocaleDateString('en-US', { 
                                        year: 'numeric', 
                                        month: 'long', 
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })
                                    : 'Supervision approved'}
                                </p>
                              </div>
                            </div>
                          )}
                          {selectedRequest.status === 'rejected' && (
                            <div className="flex items-start gap-4">
                              <div className="w-3 h-3 rounded-full bg-red-500 mt-1"></div>
                              <div className="flex-1">
                                <p className="font-semibold text-gray-900">Request Rejected</p>
                                <p className="text-sm text-gray-500">
                                  {selectedRequest.respondedAt 
                                    ? new Date(selectedRequest.respondedAt).toLocaleDateString('en-US', { 
                                        year: 'numeric', 
                                        month: 'long', 
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })
                                    : 'Supervision denied'}
                                </p>
                              </div>
                            </div>
                          )}
                          {selectedRequest.status === 'pending' && (
                            <div className="flex items-start gap-4">
                              <div className="w-3 h-3 rounded-full bg-yellow-400 mt-1"></div>
                              <div className="flex-1">
                                <p className="font-semibold text-gray-900">Pending Review</p>
                                <p className="text-sm text-gray-500">Awaiting supervisor decision</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Student Message */}
                    {(selectedRequest.message || selectedRequest.reason) && (
                      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="bg-gradient-to-r from-[#003366] to-[#00509E] p-4 flex items-center gap-3">
                          <div className="p-2 bg-white/20 rounded-lg">
                            <FileText className="w-5 h-5 text-white" />
                          </div>
                          <h3 className="text-lg font-bold text-white">Student Message</h3>
                        </div>
                        <div className="p-6">
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <p className="text-gray-800 whitespace-pre-line leading-relaxed">
                              {selectedRequest.message || selectedRequest.reason}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Supervisor Comments - Only show if exists */}
                    {selectedRequest.supervisorComments && (
                      <div className={`bg-white rounded-xl border shadow-sm overflow-hidden ${
                        selectedRequest.status === 'accepted' ? 'border-green-200' : 'border-red-200'
                      }`}>
                        <div className={`p-4 flex items-center gap-3 ${
                          selectedRequest.status === 'accepted' 
                            ? 'bg-gradient-to-r from-green-500 to-green-600' 
                            : 'bg-gradient-to-r from-red-500 to-red-600'
                        }`}>
                          <div className="p-2 bg-white/20 rounded-lg">
                            {selectedRequest.status === 'accepted' 
                              ? <CheckCircle className="w-5 h-5 text-white" />
                              : <XCircle className="w-5 h-5 text-white" />
                            }
                          </div>
                          <h3 className="text-lg font-bold text-white">Supervisor Comments</h3>
                        </div>
                        <div className="p-6">
                          <div className={`rounded-lg p-4 ${
                            selectedRequest.status === 'accepted' 
                              ? 'bg-green-50 border border-green-200' 
                              : 'bg-red-50 border border-red-200'
                          }`}>
                            <p className={`leading-relaxed ${
                              selectedRequest.status === 'accepted' ? 'text-green-800' : 'text-red-800'
                            }`}>
                              {selectedRequest.supervisorComments}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Section for Pending Requests */}
                    {selectedRequest.status === 'pending' && (
                      <div className="bg-white rounded-xl border border-yellow-200 shadow-sm overflow-hidden">
                        <div className="bg-gradient-to-r from-yellow-500 to-amber-500 p-4 flex items-center gap-3">
                          <div className="p-2 bg-white/20 rounded-lg">
                            <FileText className="w-5 h-5 text-white" />
                          </div>
                          <h3 className="text-lg font-bold text-white">Add Comments & Take Action</h3>
                        </div>
                        <div className="p-6">
                          <textarea
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-[#003366] transition-all duration-200 text-sm"
                            rows={4}
                            placeholder="Add any comments for the student (optional)..."
                            value={supervisorComments}
                            onChange={(e) => setSupervisorComments(e.target.value)}
                          />
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gradient-to-r from-blue-50 to-slate-50 px-6 py-4 border-t border-gray-200 rounded-b-2xl flex justify-between items-center">
              <div className="text-sm text-gray-600">
                <span className="font-medium">Request ID:</span> {selectedRequest._id?.slice(-8).toUpperCase()}
              </div>
              <div className="flex space-x-3">
                <Button
                  onClick={() => setShowRequestModal(false)}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#003366] hover:bg-[#00509E] text-white rounded-lg font-medium transition-colors focus:ring-[#003366] active:bg-[#002244]"
                >
                  <XCircle className="w-4 h-4" />
                  Close
                </Button>
                {selectedRequest.status === 'pending' && (
                  <>
                    <Button
                      onClick={() => handleRequestAction(selectedRequest._id, 'reject')}
                      disabled={actionLoading === selectedRequest._id}
                      className="flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" />
                      {actionLoading === selectedRequest._id ? 'Processing...' : 'Reject Request'}
                    </Button>
                    <Button
                      onClick={() => handleRequestAction(selectedRequest._id, 'approve')}
                      disabled={actionLoading === selectedRequest._id}
                      className="flex items-center gap-2 px-6 py-2.5 bg-[#003366] hover:bg-[#00509E] text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4" />
                      {actionLoading === selectedRequest._id ? 'Processing...' : 'Accept Request'}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupervisionRequestsTab;
