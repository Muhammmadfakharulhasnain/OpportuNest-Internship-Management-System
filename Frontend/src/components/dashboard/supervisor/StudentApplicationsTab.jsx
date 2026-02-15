import React, { useState, useEffect } from 'react';
import { 
  Eye, Calendar, User, Building2, Clock, CheckCircle, XCircle,
  Mail, MapPin, Briefcase, FileText, TrendingUp, BarChart3,
  Award, Building, Filter, Search, SortAsc, ChevronDown, X, GraduationCap
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { applicationAPI } from '../../../services/api';
import Card from '../../../ui/Card';
import Button from '../../../ui/Button';
import Badge from '../../../ui/Badge';
import SearchBar from '../../../ui/SearchBar';
import Modal from '../../../ui/Modal';
import LoadingSpinner from '../../../ui/LoadingSpinner';

const StudentApplicationsTab = () => {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchApplications();
  }, []);

  // Get unique departments for filter dropdown
  const departments = [...new Set(applications.map(app => {
    return app.studentProfile?.department || 'Unknown';
  }).filter(d => d && d !== 'Unknown'))].sort();

  const clearAllFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDepartmentFilter('all');
    setSortBy('newest');
  };

  const hasActiveFilters = searchTerm || statusFilter !== 'all' || departmentFilter !== 'all' || sortBy !== 'newest';

  useEffect(() => {
    const filterApplications = () => {
      let filtered = applications;

      // Filter by search term
      if (searchTerm && typeof searchTerm === 'string') {
        const searchLower = searchTerm.toLowerCase();
        filtered = filtered.filter(app =>
          app.studentId?.name?.toLowerCase().includes(searchLower) ||
          app.studentName?.toLowerCase().includes(searchLower) ||
          app.jobTitle?.toLowerCase().includes(searchLower) ||
          app.companyName?.toLowerCase().includes(searchLower) ||
          app.studentProfile?.rollNumber?.toLowerCase().includes(searchLower) ||
          app.studentProfile?.department?.toLowerCase().includes(searchLower)
        );
      }

      // Filter by status
      if (statusFilter !== 'all') {
        filtered = filtered.filter(app => {
          const status = app.applicationStatus || app.overallStatus;
          return status === statusFilter;
        });
      }

      // Filter by department
      if (departmentFilter !== 'all') {
        filtered = filtered.filter(app => {
          const dept = app.studentProfile?.department || '';
          return dept.toLowerCase() === departmentFilter.toLowerCase();
        });
      }

      // Sort
      filtered = [...filtered].sort((a, b) => {
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

      setFilteredApplications(filtered);
    };

    filterApplications();
  }, [applications, searchTerm, statusFilter, departmentFilter, sortBy]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await applicationAPI.getAllSupervisorApplications();
      setApplications(response.data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (application) => {
    const status = application.applicationStatus || application.overallStatus;
    
    switch (status) {
      case 'pending': return 'warning';
      case 'pending_supervisor': return 'warning';
      case 'pending_company': return 'info';
      case 'interview_scheduled': return 'info';
      case 'interview_done': return 'info';
      case 'hired': return 'success';
      case 'approved': return 'success';
      case 'rejected': return 'danger';
      default: return 'default';
    }
  };

  const getStatusIcon = (application) => {
    const status = application.applicationStatus || application.overallStatus;
    
    switch (status) {
      case 'pending': return Clock;
      case 'pending_supervisor': return Clock;
      case 'pending_company': return Clock;
      case 'interview_scheduled': return Calendar;
      case 'interview_done': return Calendar;
      case 'hired': return CheckCircle;
      case 'approved': return CheckCircle;
      case 'rejected': return XCircle;
      default: return Clock;
    }
  };

  const getStatusText = (application) => {
    const status = application.applicationStatus || application.overallStatus;
    
    switch (status) {
      case 'pending': return 'Pending Review';
      case 'pending_supervisor': return 'Pending Supervisor';
      case 'pending_company': return 'Pending Company';
      case 'interview_scheduled': return 'Interview Scheduled';
      case 'interview_done': return 'Interview Completed';
      case 'hired': return 'Hired';
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };

  const handleViewDetails = (application) => {
    setSelectedApplication(application);
    setShowDetailsModal(true);
  };

  const getStatusCounts = () => {
    const counts = {
      all: applications.length,
      pending: 0,
      interview_scheduled: 0,
      interview_done: 0,
      hired: 0,
      rejected: 0
    };

    applications.forEach(app => {
      const status = app.applicationStatus || app.overallStatus;
      if (Object.prototype.hasOwnProperty.call(counts, status)) {
        counts[status]++;
      } else if (status === 'pending_supervisor' || status === 'pending_company') {
        counts.pending++;
      }
    });

    return counts;
  };

  const statusCounts = getStatusCounts();

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
                <h3 className="text-xl font-bold text-gray-900 mb-2">Loading Student Applications</h3>
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
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold mb-1 text-white">
                  Student Applications
                </h1>
                <p className="text-blue-100 text-sm">
                  Monitor all job applications from your supervised students
                </p>
              </div>
            </div>
          </div>

          {/* Quick Stats - COMSATS Compact */}
          <div className="grid grid-cols-6 gap-2">
            <div className="bg-white/10 rounded-lg p-2">
              <div className="flex items-center gap-1 mb-0.5">
                <User className="w-3 h-3 text-blue-200" />
                <span className="text-blue-200 text-xs font-medium">Total</span>
              </div>
              <p className="text-white font-bold text-sm">{statusCounts.all}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-2">
              <div className="flex items-center gap-1 mb-0.5">
                <Clock className="w-3 h-3 text-yellow-200" />
                <span className="text-blue-200 text-xs font-medium">Pending</span>
              </div>
              <p className="text-white font-bold text-sm">{statusCounts.pending}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-2">
              <div className="flex items-center gap-1 mb-0.5">
                <Calendar className="w-3 h-3 text-blue-200" />
                <span className="text-blue-200 text-xs font-medium">Interviews</span>
              </div>
              <p className="text-white font-bold text-sm">{statusCounts.interview_scheduled}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-2">
              <div className="flex items-center gap-1 mb-0.5">
                <CheckCircle className="w-3 h-3 text-purple-200" />
                <span className="text-blue-200 text-xs font-medium">Completed</span>
              </div>
              <p className="text-white font-bold text-sm">{statusCounts.interview_done}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-2">
              <div className="flex items-center gap-1 mb-0.5">
                <CheckCircle className="w-3 h-3 text-green-200" />
                <span className="text-blue-200 text-xs font-medium">Hired</span>
              </div>
              <p className="text-white font-bold text-sm">{statusCounts.hired}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-2">
              <div className="flex items-center gap-1 mb-0.5">
                <XCircle className="w-3 h-3 text-red-200" />
                <span className="text-blue-200 text-xs font-medium">Rejected</span>
              </div>
              <p className="text-white font-bold text-sm">{statusCounts.rejected}</p>
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
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">All Applications</h3>
              <p className="text-sm text-gray-600 mt-1">Review student application progress</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-[#003366]">{filteredApplications.length}</div>
              <div className="text-xs text-gray-500">
                {statusCounts.hired} hired • {statusCounts.rejected} rejected
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
                  <option value="pending_supervisor">Pending Supervisor</option>
                  <option value="pending_company">Pending Company</option>
                  <option value="interview_scheduled">Interview Scheduled</option>
                  <option value="interview_done">Interview Completed</option>
                  <option value="hired">Hired</option>
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
              placeholder="Enter student name, job title, company, or department..."
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
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{statusCounts.all}</h3>
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
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{statusCounts.pending}</h3>
                <p className="text-sm text-gray-600">Pending</p>
              </div>
            </div>
          </div>
        </Card>
        
        <Card className="group bg-white border border-gray-200 hover:border-[#003366] rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-blue-500 to-blue-600"></div>
          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{statusCounts.interview_scheduled}</h3>
                <p className="text-sm text-gray-600">Interviews</p>
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
                <h3 className="text-2xl font-bold text-gray-900">{statusCounts.interview_done}</h3>
                <p className="text-sm text-gray-600">Completed</p>
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
                <h3 className="text-2xl font-bold text-gray-900">{statusCounts.hired}</h3>
                <p className="text-sm text-gray-600">Hired</p>
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
                <h3 className="text-2xl font-bold text-gray-900">{statusCounts.rejected}</h3>
                <p className="text-sm text-gray-600">Rejected</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'all', label: 'All' },
          { key: 'pending', label: 'Pending' },
          { key: 'interview_scheduled', label: 'Interviews' },
          { key: 'interview_done', label: 'Completed' },
          { key: 'hired', label: 'Hired' },
          { key: 'rejected', label: 'Rejected' }
        ].map(filter => (
          <button
            key={filter.key}
            onClick={() => setStatusFilter(filter.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              statusFilter === filter.key
                ? 'bg-[#003366] text-white'
                : 'bg-white text-gray-600 border border-gray-300 hover:border-[#003366] hover:text-[#003366]'
            }`}
          >
            {filter.label}
            {filter.key !== 'all' && statusCounts[filter.key] > 0 && (
              <span className="ml-1 text-xs opacity-75">
                ({statusCounts[filter.key]})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApplications.length === 0 && !loading ? (
          <Card className="group bg-white border border-gray-200 hover:border-[#003366] rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-gray-300 to-gray-400"></div>
            <div className="p-8 text-center">
              <div className="flex flex-col items-center gap-6">
                <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                  <User className="w-8 h-8 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {searchTerm || statusFilter !== 'all' ? 'No Applications Found' : 'No Applications Yet'}
                  </h3>
                  <p className="text-gray-600 max-w-md">
                    {searchTerm || statusFilter !== 'all' 
                      ? 'Try adjusting your search or filter criteria.'
                      : 'Your supervised students haven\'t applied for any jobs yet.'
                    }
                  </p>
                </div>
              </div>
            </div>
          </Card>
        ) : (
          filteredApplications.map((application) => {
            const StatusIcon = getStatusIcon(application);
            const currentStatus = application.applicationStatus || application.overallStatus;
            
            return (
              <Card key={application._id} className="group bg-white border border-gray-200 hover:border-[#003366] rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
                <div className={`h-2 bg-gradient-to-r ${
                  currentStatus === 'pending' || currentStatus === 'pending_supervisor' || currentStatus === 'pending_company' ? 'from-yellow-400 to-yellow-500' :
                  currentStatus === 'hired' || currentStatus === 'approved' ? 'from-green-500 to-green-600' :
                  currentStatus === 'interview_scheduled' || currentStatus === 'interview_done' ? 'from-blue-500 to-blue-600' :
                  'from-red-500 to-red-600'
                }`}></div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#003366] rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#003366] transition-colors">
                            {application.studentId?.name || application.studentName}
                          </h3>
                          <Badge variant={getStatusColor(application)} className="px-3 py-1 text-sm font-semibold">
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {getStatusText(application)}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-600">
                            Job: {application.jobId?.jobTitle || application.jobTitle}
                          </p>
                          <p className="text-sm text-gray-500">
                            Company: {application.jobId?.companyName || application.companyName}
                          </p>
                          <p className="text-sm text-gray-500">
                            Applied: {new Date(application.appliedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right text-sm text-gray-500">
                        <div className="mb-1">
                          <span className="font-medium">Location:</span> {application.jobId?.location || 'N/A'}
                        </div>
                      </div>
                      <Button
                        onClick={() => handleViewDetails(application)}
                        className="bg-[#003366] hover:bg-[#0059b3] text-white px-4 py-2 rounded-lg font-medium transition-all duration-200"
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                  
                  {/* Interview Details */}
                  {currentStatus === 'interview_scheduled' && application.interviewDetails && (
                    <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">Interview Scheduled</span>
                      </div>
                      <div className="text-sm text-blue-700 space-y-1">
                        <p><strong>Date:</strong> {new Date(application.interviewDetails.date).toLocaleDateString()}</p>
                        <p><strong>Time:</strong> {application.interviewDetails.time}</p>
                        <p><strong>Type:</strong> {application.interviewDetails.type === 'remote' ? 'Remote' : 'On-site'}</p>
                      </div>
                    </div>
                  )}

                  {/* Hired Status */}
                  {currentStatus === 'hired' && (
                    <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800">
                          Student has been hired! You will receive company reports.
                        </span>
                      </div>
                      {application.hiringDate && (
                        <p className="text-sm text-green-700 mt-1">
                          Hired on: {new Date(application.hiringDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Student Application Details Modal - Redesigned */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title={
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Student Application Details</h2>
            <p className="text-sm text-gray-500 mt-1">
              {selectedApplication?.studentId?.name || selectedApplication?.studentName} • Applied on {selectedApplication && new Date(selectedApplication.appliedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        }
        size="xl"
      >
        {selectedApplication && (
          <div className="space-y-6 p-6">
            {/* Split Layout - Student Info | Application Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Side - Student Information */}
              <div className="space-y-4">
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
                      <p className="text-base font-semibold text-gray-900 mt-1">{selectedApplication.studentId?.name || selectedApplication.studentName}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Email Address</label>
                      <p className="text-base font-semibold text-gray-900 mt-1 break-words">{selectedApplication.studentId?.email || selectedApplication.studentEmail}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Application Date</label>
                      <p className="text-base font-semibold text-gray-900 mt-1">{new Date(selectedApplication.appliedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side - Application Details */}
              <div className="space-y-4">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-[#003366] to-[#00509E] p-4 flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Building2 className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white">Application Details</h3>
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Company Name</label>
                      <p className="text-base font-semibold text-gray-900 mt-1">{selectedApplication.jobId?.companyName || selectedApplication.companyName}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Position Applied</label>
                      <p className="text-base font-semibold text-gray-900 mt-1">{selectedApplication.jobId?.jobTitle || selectedApplication.jobTitle}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Location</label>
                      <p className="text-base font-semibold text-gray-900 mt-1">{selectedApplication.jobId?.location || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Application Status</label>
                      <div className="mt-2">
                        <Badge variant={getStatusColor(selectedApplication)} className="px-3 py-1 text-sm font-semibold">
                          {React.createElement(getStatusIcon(selectedApplication), { className: "w-4 h-4 mr-1" })}
                          {getStatusText(selectedApplication)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Application Progress Timeline */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-[#003366] to-[#00509E] p-4 flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white">Application Progress Timeline</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-3 h-3 rounded-full bg-green-500 mt-1"></div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">Application Submitted</p>
                      <p className="text-sm text-gray-500">
                        {new Date(selectedApplication.appliedAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  {selectedApplication.supervisorStatus === 'approved' && (
                    <div className="flex items-start gap-4">
                      <div className="w-3 h-3 rounded-full bg-green-500 mt-1"></div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">Approved by Supervisor</p>
                        <p className="text-sm text-gray-500">Application forwarded to company</p>
                      </div>
                    </div>
                  )}
                  {(selectedApplication.applicationStatus === 'interview_scheduled' || selectedApplication.overallStatus === 'interview_scheduled') && (
                    <div className="flex items-start gap-4">
                      <div className="w-3 h-3 rounded-full bg-blue-500 mt-1"></div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">Interview Scheduled</p>
                        <p className="text-sm text-gray-500">Awaiting interview completion</p>
                      </div>
                    </div>
                  )}
                  {(selectedApplication.applicationStatus === 'interview_done' || selectedApplication.overallStatus === 'interview_done') && (
                    <div className="flex items-start gap-4">
                      <div className="w-3 h-3 rounded-full bg-purple-500 mt-1"></div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">Interview Completed</p>
                        <p className="text-sm text-gray-500">Awaiting final decision</p>
                      </div>
                    </div>
                  )}
                  {(selectedApplication.applicationStatus === 'hired' || selectedApplication.overallStatus === 'hired') && (
                    <div className="flex items-start gap-4">
                      <div className="w-3 h-3 rounded-full bg-green-500 mt-1"></div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">Student Hired!</p>
                        <p className="text-sm text-gray-500">
                          {selectedApplication.hiringDate && `Hired on: ${new Date(selectedApplication.hiringDate).toLocaleDateString()}`}
                        </p>
                      </div>
                    </div>
                  )}
                  {(selectedApplication.applicationStatus === 'rejected' || selectedApplication.overallStatus === 'rejected') && (
                    <div className="flex items-start gap-4">
                      <div className="w-3 h-3 rounded-full bg-red-500 mt-1"></div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">Application Rejected</p>
                        <p className="text-sm text-gray-500">Application process ended</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Application Status Breakdown */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-[#003366] to-[#00509E] p-4 flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white">Status Breakdown</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-2">Overall Status</label>
                    <Badge variant={getStatusColor(selectedApplication)} className="text-sm font-semibold">
                      {React.createElement(getStatusIcon(selectedApplication), { className: "w-4 h-4 mr-2" })}
                      {getStatusText(selectedApplication)}
                    </Badge>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-2">Supervisor Status</label>
                    <span className={`inline-flex items-center text-sm font-bold capitalize px-3 py-1 rounded-full ${
                      selectedApplication.supervisorStatus === 'approved' ? 'bg-green-100 text-green-800' :
                      selectedApplication.supervisorStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedApplication.supervisorStatus || 'pending'}
                    </span>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-2">Company Status</label>
                    <span className={`inline-flex items-center text-sm font-bold capitalize px-3 py-1 rounded-full ${
                      selectedApplication.companyStatus === 'approved' ? 'bg-green-100 text-green-800' :
                      selectedApplication.companyStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedApplication.companyStatus || 'pending'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Interview Details */}
            {selectedApplication.interviewDetails && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-[#003366] to-[#00509E] p-4 flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Interview Details</h3>
                </div>
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Interview Date</label>
                      <p className="text-base font-semibold text-gray-900 mt-1">
                        {new Date(selectedApplication.interviewDetails.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Time</label>
                      <p className="text-base font-semibold text-gray-900 mt-1">
                        {selectedApplication.interviewDetails.time || 'Not specified'}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Interview Type</label>
                      <p className="text-base font-semibold text-gray-900 mt-1">
                        {selectedApplication.interviewDetails.type === 'remote' ? 'Remote Interview' : 'On-site Interview'}
                      </p>
                    </div>
                    {selectedApplication.interviewDetails.location && (
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Location</label>
                        <p className="text-base font-semibold text-gray-900 mt-1 break-words">
                          {selectedApplication.interviewDetails.location}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {/* Interview Notes */}
                  {selectedApplication.interviewDetails.notes && (
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-2">Additional Notes</label>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-gray-800 leading-relaxed break-words whitespace-pre-wrap">
                          {selectedApplication.interviewDetails.notes}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Cover Letter */}
            {selectedApplication.coverLetter && (
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
                      {selectedApplication.coverLetter === 'http://localhost:5174/dashboard/companyhttp://localhost:5174/dashboard/companyhttp://localhost:5174/dashboard/companyhttp://localhost:5174/dashboard/company' 
                        ? 'Cover letter not available. Please contact the company for more details.'
                        : selectedApplication.coverLetter || 'No cover letter provided'
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Job Description */}
            {selectedApplication.jobId?.description && (
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-purple-500 to-purple-600"></div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Building2 className="w-5 h-5 mr-2 text-[#003366]" />
                    Job Description
                  </h3>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-gray-800 whitespace-pre-line">{selectedApplication.jobId.description}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Congratulations Section for Hired Students */}
            {selectedApplication.applicationStatus === 'hired' && (
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-green-500 to-green-600"></div>
                <div className="p-6">
                  <div className="text-center">
                    <div className="flex justify-center mb-4">
                      <div className="p-4 bg-green-500 rounded-full">
                        <Award className="w-12 h-12 text-white" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-green-800 mb-2">
                      🎉 Student Successfully Hired!
                    </h3>
                    <p className="text-green-700 text-lg font-medium">
                      Your supervised student has been hired for this position.
                    </p>
                    {selectedApplication.hiringDate && (
                      <p className="text-green-600 text-sm mt-2">
                        Hired on {new Date(selectedApplication.hiringDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
              <Button
                onClick={() => setShowDetailsModal(false)}
                className="px-6 py-2 border border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 transition-all duration-200"
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

export default StudentApplicationsTab;
