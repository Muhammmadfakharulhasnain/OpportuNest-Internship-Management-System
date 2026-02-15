import React, { useState, useEffect } from 'react';
import Badge from '../../../ui/Badge';
import { Eye, Clock, CheckCircle, XCircle, Calendar, Building2, User, TrendingUp, Briefcase, Filter, MapPin, FileText, Mail, Building, Award, BarChart3 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { applicationAPI } from '../../../services/api';
import Card from '../../../ui/Card';
import Button from '../../../ui/Button';
import Modal from '../../../ui/Modal';
import LoadingSpinner from '../../../ui/LoadingSpinner';
import SearchBar from '../../../ui/SearchBar';

const ApplicationsTab = () => {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showResubmitModal, setShowResubmitModal] = useState(false);
  const [resubmissionData, setResubmissionData] = useState({
    coverLetter: '',
    note: ''
  });
  const [resubmitLoading, setResubmitLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    const filterApplications = () => {
      let filtered = applications;

      // Filter by search term
      if (searchTerm) {
        filtered = filtered.filter(app =>
          app.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.jobId?.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.jobId?.companyName?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Filter by status
      if (statusFilter !== 'all') {
        filtered = filtered.filter(app => {
          const status = app.applicationStatus || app.overallStatus;
          if (statusFilter === 'pending') {
            return status === 'pending' || status === 'pending_supervisor' || status === 'pending_company';
          }
          return status === statusFilter;
        });
      }

      setFilteredApplications(filtered);
    };

    filterApplications();
  }, [applications, searchTerm, statusFilter]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await applicationAPI.getStudentApplications();
      setApplications(response.data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (application) => {
    // Use applicationStatus first, fallback to overallStatus
    const status = application.applicationStatus || application.overallStatus;
    
    switch (status) {
      case 'pending': return 'warning';
      case 'pending_supervisor': return 'warning';
      case 'supervisor_changes_requested': return 'warning';
      case 'resubmitted_to_supervisor': return 'info';
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
      case 'supervisor_changes_requested': return 'Changes Requested';
      case 'resubmitted_to_supervisor': return 'Resubmitted';
      case 'pending_company': return 'Pending Company';
      case 'interview_scheduled': return 'Interview Scheduled';
      case 'interview_done': return 'Interview Completed';
      case 'hired': return 'Hired!';
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };

  const handleFixAndResubmit = (application) => {
    setSelectedApplication(application);
    setResubmissionData({
      coverLetter: application.coverLetter || '',
      note: ''
    });
    setShowResubmitModal(true);
  };

  const handleResubmit = async () => {
    if (!selectedApplication || !resubmissionData.coverLetter.trim()) {
      toast.error('Cover letter is required');
      return;
    }

    try {
      setResubmitLoading(true);
      
      const response = await applicationAPI.studentResubmitApplication(selectedApplication._id, resubmissionData);
      
      if (response.success) {
        await fetchApplications();
        toast.success('Application resubmitted successfully');
        setShowResubmitModal(false);
        setResubmissionData({ coverLetter: '', note: '' });
        setSelectedApplication(null);
      } else {
        toast.error(response.message || 'Failed to resubmit application');
      }
    } catch (error) {
      console.error('Error resubmitting application:', error);
      toast.error('Failed to resubmit application');
    } finally {
      setResubmitLoading(false);
    }
  };

  // Calculate statistics
  const getStatistics = () => {
    const stats = {
      total: applications.length,
      pending: 0,
      interview_scheduled: 0,
      interview_done: 0,
      hired: 0,
      rejected: 0
    };

    applications.forEach(app => {
      const status = app.applicationStatus || app.overallStatus;
      if (status === 'pending' || status === 'pending_supervisor' || status === 'pending_company') {
        stats.pending++;
      } else if (Object.prototype.hasOwnProperty.call(stats, status)) {
        stats[status]++;
      }
    });

    return stats;
  };

  const handleViewDetails = (application) => {
    setSelectedApplication(application);
    setShowDetailsModal(true);
  };

  const statistics = getStatistics();

  if (loading) {
    return (
      <Card className="p-16 text-center bg-gradient-to-br from-blue-50 to-indigo-50 border-0 shadow-lg">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-6 rounded-full">
              <LoadingSpinner className="w-10 h-10 text-blue-600" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full animate-ping"></div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Loading Your Applications</h3>
            <p className="text-gray-600 max-w-md">We&apos;re gathering all your application data and status updates...</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header - COMSATS Design */}
      <div className="bg-gradient-to-r from-[#003366] via-[#00509E] to-[#003366] rounded-lg p-4 text-white shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-md backdrop-blur-sm">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">My Applications</h2>
              <p className="text-blue-100 mt-0.5 text-sm">Track all your job applications from start to finish</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4 text-blue-100">
            <div className="text-center">
              <div className="text-lg font-bold text-white">{statistics.total}</div>
              <div className="text-xs">Total Applied</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-white">{statistics.hired}</div>
              <div className="text-xs">Successful</div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Statistics Dashboard - COMSATS Design */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="p-3 text-center bg-gradient-to-br from-[#003366]/5 to-[#003366]/10 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-center mb-1">
            <div className="p-1.5 bg-[#003366]/20 rounded-md">
              <Briefcase className="w-4 h-4 text-[#003366]" />
            </div>
          </div>
          <div className="text-lg font-bold text-[#003366]">{statistics.total}</div>
          <div className="text-xs text-[#003366] font-medium">Total Applications</div>
        </Card>
        
        <Card className="p-3 text-center bg-gradient-to-br from-amber-50 to-amber-100 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-center mb-1">
            <div className="p-1.5 bg-amber-200 rounded-md">
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
          </div>
          <div className="text-lg font-bold text-amber-700">{statistics.pending}</div>
          <div className="text-xs text-amber-600 font-medium">Pending Review</div>
        </Card>
        
        <Card className="p-3 text-center bg-gradient-to-br from-[#00509E]/5 to-[#00509E]/10 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-center mb-1">
            <div className="p-1.5 bg-[#00509E]/20 rounded-md">
              <Calendar className="w-4 h-4 text-[#00509E]" />
            </div>
          </div>
          <div className="text-lg font-bold text-[#00509E]">{statistics.interview_scheduled}</div>
          <div className="text-xs text-[#00509E] font-medium">Interview Scheduled</div>
        </Card>
        
        <Card className="p-3 text-center bg-gradient-to-br from-green-50 to-green-100 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-center mb-1">
            <div className="p-1.5 bg-green-200 rounded-md">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
          </div>
          <div className="text-lg font-bold text-green-700">{statistics.interview_done}</div>
          <div className="text-xs text-green-600 font-medium">Interview Done</div>
        </Card>
        
        <Card className="p-3 text-center bg-gradient-to-br from-green-50 to-green-100 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-center mb-1">
            <div className="p-1.5 bg-green-200 rounded-md">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
          </div>
          <div className="text-lg font-bold text-green-700">{statistics.hired}</div>
          <div className="text-xs text-green-600 font-medium">Hired</div>
        </Card>
        
        <Card className="p-3 text-center bg-gradient-to-br from-red-50 to-red-100 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-center mb-1">
            <div className="p-1.5 bg-red-200 rounded-md">
              <XCircle className="w-4 h-4 text-red-600" />
            </div>
          </div>
          <div className="text-lg font-bold text-red-700">{statistics.rejected}</div>
          <div className="text-xs text-red-600 font-medium">Rejected</div>
        </Card>
      </div>

      {/* Enhanced Filters and Search - COMSATS Design */}
      <Card className="p-4 bg-white border border-gray-200 shadow-sm">
        <div className="mb-3">
          <h3 className="text-base font-semibold text-[#003366] mb-1">Filter Your Applications</h3>
          <p className="text-gray-600 text-xs">Search and filter to quickly find specific applications</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 mb-3">
          <div className="flex-1">
            <SearchBar
              placeholder="Search by job title or company..."
              value={searchTerm}
              onChange={setSearchTerm}
            />
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'All', count: statistics.total, color: 'blue' },
            { key: 'pending', label: 'Pending', count: statistics.pending, color: 'amber' },
            { key: 'interview_scheduled', label: 'Interview', count: statistics.interview_scheduled, color: 'purple' },
            { key: 'interview_done', label: 'Completed', count: statistics.interview_done, color: 'indigo' },
            { key: 'hired', label: 'Hired', count: statistics.hired, color: 'green' },
            { key: 'rejected', label: 'Rejected', count: statistics.rejected, color: 'red' }
          ].map(filter => (
            <Button
              key={filter.key}
              variant={statusFilter === filter.key ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(filter.key)}
              className={`whitespace-nowrap transition-all ${
                statusFilter === filter.key 
                  ? `bg-${filter.color}-600 hover:bg-${filter.color}-700 text-white border-${filter.color}-600` 
                  : `border-${filter.color}-200 text-${filter.color}-600 hover:bg-${filter.color}-50 hover:border-${filter.color}-300`
              }`}
            >
              {filter.label}
              {filter.count > 0 && (
                <span className="ml-2 px-1.5 py-0.5 text-xs bg-white/20 rounded-full">
                  {filter.count}
                </span>
              )}
            </Button>
          ))}
        </div>

        {/* Active Search/Filter Indicator */}
        {(searchTerm || statusFilter !== 'all') && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                <Filter className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Active Filters:</span>
                {searchTerm && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    Search: &ldquo;{searchTerm}&rdquo;
                  </Badge>
                )}
                {statusFilter !== 'all' && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    Status: {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1).replace('_', ' ')}
                  </Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
                className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
              >
                Clear All
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Enhanced Applications List */}
      <div className="space-y-4">
        {filteredApplications.map((application) => {
          const StatusIcon = getStatusIcon(application);
          const currentStatus = application.applicationStatus || application.overallStatus;
          
          return (
            <Card key={application._id} className="p-4 bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-[#003366]/10 rounded-md">
                        <Briefcase className="w-4 h-4 text-[#003366]" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-[#003366]">
                          {application.jobId?.jobTitle || application.jobTitle}
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-gray-600 mt-0.5">
                          <div className="flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            <span className="font-medium">{application.jobId?.companyName || application.companyName}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span>Supervisor: {application.supervisorId?.name || application.supervisorName}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Badge 
                      variant={getStatusColor(application)}
                      className="px-2 py-0.5 text-xs font-medium"
                    >
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {getStatusText(application)}
                    </Badge>
                  </div>

                  {/* Enhanced Application Timeline - COMSATS Compact */}
                  <div className="bg-gradient-to-r from-[#003366]/5 to-[#00509E]/5 border border-gray-200 rounded-lg p-3 mb-3">
                    <div className="flex items-center gap-1 mb-2">
                      <TrendingUp className="w-4 h-4 text-[#003366]" />
                      <span className="text-xs font-semibold text-[#003366]">Application Progress</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full mb-1 ${
                          currentStatus !== 'pending' ? 'bg-green-500' : 'bg-[#003366]'
                        }`}></div>
                        <span className="text-xs font-medium text-gray-700">Applied</span>
                      </div>
                      
                      <div className={`flex-1 h-0.5 mx-2 rounded ${
                        ['interview_scheduled', 'interview_done', 'hired'].includes(currentStatus) ? 'bg-green-400' : 'bg-gray-300'
                      }`}></div>
                      
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full mb-1 ${
                          ['interview_scheduled', 'interview_done', 'hired'].includes(currentStatus) ? 'bg-green-500' : 
                          currentStatus === 'rejected' ? 'bg-red-500' : 'bg-gray-300'
                        }`}></div>
                        <span className="text-xs font-medium text-gray-700">Interview</span>
                      </div>
                      
                      <div className={`flex-1 h-0.5 mx-2 rounded ${
                        currentStatus === 'hired' ? 'bg-green-400' : 'bg-gray-300'
                      }`}></div>
                      
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full mb-1 ${
                          currentStatus === 'hired' ? 'bg-green-500' : 
                          currentStatus === 'rejected' ? 'bg-red-500' : 'bg-gray-300'
                        }`}></div>
                        <span className="text-xs font-medium text-gray-700">Decision</span>
                      </div>
                    </div>
                  </div>

                  {/* Interview Details */}
                  {currentStatus === 'interview_scheduled' && application.interviewDetails && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2">
                      <div className="flex items-center space-x-2 mb-1">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">Interview Scheduled</span>
                      </div>
                      <div className="text-sm text-blue-700 space-y-1">
                        <p><strong>Date:</strong> {new Date(application.interviewDetails.date).toLocaleDateString()}</p>
                        <p><strong>Time:</strong> {application.interviewDetails.time || 'Not specified'}</p>
                        <p><strong>Type:</strong> {application.interviewDetails.type === 'remote' ? 'Remote' : 'On-site'}</p>
                        {application.interviewDetails.type === 'remote' && application.interviewDetails.meetingLink && (
                          <p><strong>Meeting Link:</strong> 
                            <a href={application.interviewDetails.meetingLink} target="_blank" rel="noopener noreferrer" 
                               className="text-blue-600 hover:underline ml-1">
                              Join Interview
                            </a>
                          </p>
                        )}
                        {application.interviewDetails.type === 'onsite' && application.interviewDetails.location && (
                          <p><strong>Location:</strong> {application.interviewDetails.location}</p>
                        )}
                        {application.interviewDetails.notes && (
                          <p><strong>Notes:</strong> {application.interviewDetails.notes}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Changes Requested Alert */}
                  {application.overallStatus === 'supervisor_changes_requested' && application.rejectionFeedback && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-2">
                      <div className="flex items-center space-x-2 mb-2">
                        <XCircle className="w-4 h-4 text-yellow-600" />
                        <span className="text-sm font-medium text-yellow-800">
                          Changes requested by your supervisor
                        </span>
                      </div>
                      <div className="text-sm text-yellow-700 space-y-1">
                        <p><strong>Reason:</strong> {application.rejectionFeedback.reason}</p>
                        <p><strong>Details:</strong> {application.rejectionFeedback.details}</p>
                        {application.rejectionFeedback.requestedFixes && application.rejectionFeedback.requestedFixes.length > 0 && (
                          <div>
                            <p><strong>Requested Fixes:</strong></p>
                            <ul className="list-disc list-inside ml-4">
                              {application.rejectionFeedback.requestedFixes.map((fix, index) => (
                                <li key={index}>{fix}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      <div className="mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleFixAndResubmit(application)}
                        >
                          Fix & Resubmit
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Resubmitted Status */}
                  {application.overallStatus === 'resubmitted_to_supervisor' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">
                          Resubmitted — awaiting supervisor review
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Supervisor Rejection */}
                  {application.supervisorStatus === 'rejected' && application.rejectionNote && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-2">
                      <div className="flex items-center space-x-2 mb-2">
                        <XCircle className="w-4 h-4 text-red-600" />
                        <span className="text-sm font-medium text-red-800">
                          Rejected by Supervisor
                        </span>
                      </div>
                      <div className="text-sm text-red-700">
                        <p><strong>Reason:</strong> {application.rejectionNote}</p>
                      </div>
                    </div>
                  )}

                  {/* Company Rejection */}
                  {application.applicationStatus === 'rejected' && application.companyRejectionNote && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-2">
                      <div className="flex items-center space-x-2 mb-2">
                        <XCircle className="w-4 h-4 text-orange-600" />
                        <span className="text-sm font-medium text-orange-800">
                          Rejected by Company
                        </span>
                      </div>
                      <div className="text-sm text-orange-700">
                        <p><strong>Reason:</strong> {application.companyRejectionNote}</p>
                      </div>
                    </div>
                  )}

                  {/* Interview Done Status */}
                  {currentStatus === 'interview_done' && (
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-2">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-medium text-purple-800">
                          Interview completed! Waiting for company decision.
                        </span>
                      </div>
                      {application.interviewDetails && (
                        <p className="text-sm text-purple-700 mt-1">
                          Interview was on: {new Date(application.interviewDetails.date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Hired Message */}
                  {currentStatus === 'hired' && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-2">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800">
                          Congratulations! You have been hired. Your supervisor will receive regular reports.
                        </span>
                      </div>
                      {application.hiringDate && (
                        <p className="text-sm text-green-700 mt-1">
                          Hired on: {new Date(application.hiringDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Rejected Message */}
                  {currentStatus === 'rejected' && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-2">
                      <div className="flex items-center space-x-2">
                        <XCircle className="w-4 h-4 text-red-600" />
                        <span className="text-sm font-medium text-red-800">
                          Application was not successful at this time.
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {/* Enhanced Application Meta Information - COMSATS Compact */}
                  <div className="flex items-center justify-between pt-2 mt-2 border-t border-gray-100">
                    <div className="flex items-center gap-3 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>Applied on {new Date(application.appliedAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{application.jobId?.location || 'Remote'}</span>
                      </div>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(application)}
                      className="bg-[#003366]/5 border-[#003366]/20 text-[#003366] hover:bg-[#003366]/10 hover:border-[#003366]/30 font-medium text-xs px-3 py-1"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Enhanced Empty State - COMSATS Compact */}
      {filteredApplications.length === 0 && !loading && (
        <Card className="p-12 text-center bg-gradient-to-br from-gray-50 to-[#003366]/5 border border-gray-200 shadow-sm">
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-gradient-to-br from-[#003366]/10 to-[#003366]/20 p-4 rounded-full">
              {searchTerm || statusFilter !== 'all' ? (
                <Filter className="w-8 h-8 text-[#003366]" />
              ) : (
                <Briefcase className="w-8 h-8 text-[#003366]" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#003366] mb-1">
                {searchTerm || statusFilter !== 'all' ? 'No Applications Match Your Filters' : 'Ready to Start Your Journey?'}
              </h3>
              <p className="text-gray-600 max-w-md text-sm">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search terms or filter criteria to find the applications you&apos;re looking for.'
                  : 'You haven&apos;t applied for any internships yet. Browse our available opportunities and take the first step toward your career!'
                }
              </p>
              {(!searchTerm && statusFilter === 'all') && (
                <Button 
                  className="mt-4 bg-gradient-to-r from-[#003366] to-[#00509E] hover:from-[#003366]/90 hover:to-[#00509E]/90 font-semibold px-4 py-2 shadow-md text-sm"
                  onClick={() => window.location.href = '#jobs'}
                >
                  <Briefcase className="w-3 h-3 mr-1" />
                  Browse Available Jobs
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Enhanced Application Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title=""
        size="xl"
      >
        {selectedApplication && (
          <div className="space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Enhanced Modal Header - COMSATS Design */}
            <div className="relative bg-gradient-to-r from-[#003366] to-[#00509E] rounded-lg p-5 text-white shadow-lg overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#003366]/20 to-[#00509E]/20 backdrop-blur-3xl"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-white/15 rounded-lg backdrop-blur-sm border border-white/20 shadow-sm">
                      <Briefcase className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold mb-1 text-white">
                        Application Details
                      </h1>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-1.5 h-1.5 bg-blue-300 rounded-full"></div>
                        <h2 className="text-lg font-bold text-blue-100">
                          {selectedApplication.jobId?.jobTitle || selectedApplication.jobTitle}
                        </h2>
                      </div>
                      <div className="flex items-center gap-1">
                        <Building className="w-4 h-4 text-blue-300" />
                        <p className="text-blue-200 text-sm font-medium">
                          {selectedApplication.jobId?.companyName || selectedApplication.companyName}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge 
                      variant={getStatusColor(selectedApplication)}
                      className="px-3 py-1 text-sm font-bold shadow-md border border-white/20 backdrop-blur-sm"
                    >
                      {React.createElement(getStatusIcon(selectedApplication), { className: "w-3 h-3 mr-1" })}
                      {getStatusText(selectedApplication)}
                    </Badge>
                    <p className="text-blue-200 text-xs mt-1 font-medium">
                      Applied on {new Date(selectedApplication.appliedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                {/* Quick Stats - COMSATS Compact */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                    <div className="flex items-center gap-1 mb-0.5">
                      <Calendar className="w-3 h-3 text-blue-300" />
                      <span className="text-blue-200 text-xs font-medium">Applied</span>
                    </div>
                    <p className="text-white font-bold text-sm">
                      {new Date(selectedApplication.appliedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                    <div className="flex items-center gap-1 mb-0.5">
                      <MapPin className="w-3 h-3 text-blue-300" />
                      <span className="text-blue-200 text-xs font-medium">Location</span>
                    </div>
                    <p className="text-white font-bold text-sm">
                      {selectedApplication.jobId?.location || 'Remote'}
                    </p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                    <div className="flex items-center gap-1 mb-0.5">
                      <TrendingUp className="w-3 h-3 text-blue-300" />
                      <span className="text-blue-200 text-xs font-medium">Progress</span>
                    </div>
                    <p className="text-white font-bold text-sm">
                      {getStatusText(selectedApplication)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Student Information Section - COMSATS Compact */}
            <Card className="p-4 bg-gradient-to-br from-[#003366]/5 to-[#00509E]/5 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-bold text-[#003366] mb-3 flex items-center">
                <User className="w-4 h-4 mr-2 text-[#003366]" />
                Student Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 bg-white rounded-md shadow-sm border border-gray-200">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-3 h-3 text-[#003366]" />
                    <p className="text-xs font-semibold text-gray-700">Name</p>
                  </div>
                  <p className="text-sm font-bold text-gray-900">
                    {selectedApplication.studentId?.name || selectedApplication.studentName}
                  </p>
                </div>
                <div className="p-3 bg-white rounded-md shadow-sm border border-gray-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Mail className="w-3 h-3 text-[#003366]" />
                    <p className="text-xs font-semibold text-gray-700">Email</p>
                  </div>
                  <p className="text-sm font-bold text-gray-900 break-words overflow-wrap-anywhere text-wrap-anywhere">
                    {selectedApplication.studentId?.email || selectedApplication.studentEmail}
                  </p>
                </div>
              </div>
            </Card>

            {/* Job Information Section - COMSATS Compact */}
            <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-bold text-[#003366] mb-3 flex items-center">
                <Briefcase className="w-4 h-4 mr-2 text-green-600" />
                Job Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 bg-white rounded-md shadow-sm border border-gray-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Briefcase className="w-3 h-3 text-green-600" />
                    <p className="text-xs font-semibold text-gray-700">Job Title</p>
                  </div>
                  <p className="text-sm font-bold text-gray-900">
                    {selectedApplication.jobId?.jobTitle || selectedApplication.jobTitle}
                  </p>
                </div>
                <div className="p-3 bg-white rounded-md shadow-sm border border-gray-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Building className="w-3 h-3 text-green-600" />
                    <p className="text-xs font-semibold text-gray-700">Company</p>
                  </div>
                  <p className="text-sm font-bold text-gray-900">
                    {selectedApplication.jobId?.companyName || selectedApplication.companyName}
                  </p>
                </div>
                <div className="p-3 bg-white rounded-md shadow-sm border border-gray-200">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="w-3 h-3 text-green-600" />
                    <p className="text-xs font-semibold text-gray-700">Location</p>
                  </div>
                  <p className="text-sm font-bold text-gray-900">
                    {selectedApplication.jobId?.location || 'Remote'}
                  </p>
                </div>
                <div className="p-3 bg-white rounded-md shadow-sm border border-gray-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-3 h-3 text-green-600" />
                    <p className="text-xs font-semibold text-gray-700">Applied On</p>
                  </div>
                  <p className="text-sm font-bold text-gray-900">
                    {new Date(selectedApplication.appliedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </Card>

            {/* Enhanced Application Progress - COMSATS Compact */}
            <Card className="p-4 bg-gradient-to-br from-[#003366]/5 to-[#00509E]/5 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-bold text-[#003366] mb-3 flex items-center">
                <TrendingUp className="w-4 h-4 mr-2 text-[#003366]" />
                Application Progress
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-3 bg-white rounded-md shadow-sm border border-gray-200">
                  <div className="w-4 h-4 bg-[#003366] rounded-full flex items-center justify-center">
                    <CheckCircle className="w-2 h-2 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 text-sm">Application Submitted</p>
                    <p className="text-xs text-gray-600">
                      {new Date(selectedApplication.appliedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <CheckCircle className="w-4 h-4 text-[#003366]" />
                </div>
                
                {['interview_scheduled', 'interview_done', 'hired'].includes(selectedApplication.applicationStatus) && (
                  <div className="flex items-center gap-3 p-3 bg-white rounded-md shadow-sm border border-gray-200">
                    <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <Calendar className="w-2 h-2 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 text-sm">Interview Scheduled</p>
                      {selectedApplication.interviewDetails && (
                        <p className="text-xs text-gray-600">
                          {new Date(selectedApplication.interviewDetails.date).toLocaleDateString()} at {selectedApplication.interviewDetails.time || 'TBD'}
                        </p>
                      )}
                    </div>
                    <Calendar className="w-4 h-4 text-green-500" />
                  </div>
                )}

                {selectedApplication.applicationStatus === 'hired' && (
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-md shadow-sm border border-green-300">
                    <div className="w-4 h-4 bg-green-600 rounded-full flex items-center justify-center">
                      <Award className="w-2 h-2 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-green-800 flex items-center text-sm">
                        <Award className="w-3 h-3 mr-1" />
                        🎉 Congratulations! You&apos;re Hired!
                      </p>
                      {selectedApplication.hiringDate && (
                        <p className="text-xs text-green-700">
                          Hired on {new Date(selectedApplication.hiringDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                )}
              </div>
            </Card>

            {/* Enhanced Status Overview */}
            <Card className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-bold text-[#003366] mb-3 flex items-center">
                <BarChart3 className="w-4 h-4 mr-2 text-yellow-600" />
                Application Status
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 bg-white rounded-md border border-gray-200 shadow-sm">
                  <p className="text-xs font-bold text-gray-600 mb-1">Overall Status</p>
                  <Badge variant={getStatusColor(selectedApplication)} className="text-xs font-semibold">
                    {getStatusText(selectedApplication.overallStatus)}
                  </Badge>
                </div>
                <div className="p-3 bg-white rounded-md border border-gray-200 shadow-sm">
                  <p className="text-xs font-bold text-gray-600 mb-1">Supervisor Status</p>
                  <span className={`text-xs font-bold capitalize px-2 py-1 rounded-full ${
                    selectedApplication.supervisorStatus === 'approved' ? 'bg-green-100 text-green-800' :
                    selectedApplication.supervisorStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedApplication.supervisorStatus || 'pending'}
                  </span>
                </div>
                <div className="p-3 bg-white rounded-md border border-gray-200 shadow-sm">
                  <p className="text-xs font-bold text-gray-600 mb-1">Company Status</p>
                  <span className={`text-xs font-bold capitalize px-2 py-1 rounded-full ${
                    selectedApplication.companyStatus === 'approved' ? 'bg-green-100 text-green-800' :
                    selectedApplication.companyStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedApplication.companyStatus || 'pending'}
                  </span>
                </div>
              </div>
            </Card>

            {/* Enhanced Application Details Grid - COMSATS Compact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Card className="p-3 border border-gray-200 bg-gray-50">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-3 h-3 text-[#003366]" />
                  <p className="text-xs font-semibold text-gray-700">Application Date</p>
                </div>
                <p className="text-sm font-bold text-gray-900">
                  {new Date(selectedApplication.appliedAt).toLocaleDateString()}
                </p>
              </Card>

              <Card className="p-3 border border-gray-200 bg-gray-50">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="w-3 h-3 text-[#003366]" />
                  <p className="text-xs font-semibold text-gray-700">Location</p>
                </div>
                <p className="text-sm font-bold text-gray-900">{selectedApplication.jobId?.location || 'Remote'}</p>
              </Card>

              <Card className="p-3 border border-gray-200 bg-gray-50 md:col-span-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="w-3 h-3 text-[#003366]" />
                    <div>
                      <p className="text-xs font-semibold text-gray-700">Supervisor</p>
                      <p className="text-sm font-bold text-gray-900">{selectedApplication.supervisorId?.name || selectedApplication.supervisorName}</p>
                    </div>
                  </div>
                  <Badge variant="success" className="px-2 py-0.5 text-xs">
                    <CheckCircle className="w-3 h-3 mr-0.5" />
                    Selected
                  </Badge>
                </div>
              </Card>
            </div>

            {/* Enhanced Interview Details - COMSATS Compact */}
            {selectedApplication.interviewDetails && (
              <Card className="p-4 bg-gradient-to-br from-cyan-50 to-blue-50 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-[#003366] mb-3 flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-cyan-600" />
                  Interview Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <div className="p-3 bg-white rounded-md shadow-sm border border-gray-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-3 h-3 text-cyan-600" />
                      <p className="text-xs font-bold text-gray-700">Date</p>
                    </div>
                    <p className="text-sm font-bold text-gray-900">
                      {new Date(selectedApplication.interviewDetails.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-md shadow-sm border border-gray-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-3 h-3 text-cyan-600" />
                      <p className="text-xs font-bold text-gray-700">Time</p>
                    </div>
                    <p className="text-sm font-bold text-gray-900">
                      {selectedApplication.interviewDetails.time || 'Not specified'}
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-md shadow-sm border border-gray-200">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="w-3 h-3 text-cyan-600" />
                      <p className="text-xs font-bold text-gray-700">Type</p>
                    </div>
                    <p className="text-sm font-bold text-gray-900">
                      {selectedApplication.interviewDetails.type === 'remote' ? 'Remote Interview' : 'In-Person Interview'}
                    </p>
                  </div>
                  {selectedApplication.interviewDetails.location && (
                    <div className="p-3 bg-white rounded-md shadow-sm border border-gray-200">
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="w-3 h-3 text-cyan-600" />
                        <p className="text-xs font-bold text-gray-700">Location</p>
                      </div>
                      <p className="text-sm font-bold text-gray-900 break-words">
                        {selectedApplication.interviewDetails.location}
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Interview Meeting Link Button - COMSATS Compact */}
                {selectedApplication.interviewDetails.meetingLink && (
                  <div className="mb-3">
                    <Button 
                      variant="primary"
                      onClick={() => window.open(selectedApplication.interviewDetails.meetingLink, '_blank')}
                      className="w-full bg-gradient-to-r from-[#003366] to-[#00509E] hover:from-[#003366]/90 hover:to-[#00509E]/90 text-white font-bold py-2 px-4 rounded-md shadow-md hover:shadow-lg transition-all duration-200 text-sm"
                    >
                      <Calendar className="w-3 h-3 mr-1" />
                      Join Interview Meeting
                    </Button>
                  </div>
                )}
                
                {/* Interview Notes - COMSATS Compact */}
                {selectedApplication.interviewDetails.notes && (
                  <div className="p-3 bg-white rounded-md shadow-sm border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-3 h-3 text-cyan-600" />
                      <p className="text-xs font-bold text-gray-700">Additional Notes</p>
                    </div>
                    <div className="bg-cyan-50 p-3 rounded-md border border-cyan-200">
                      <p className="text-gray-800 leading-relaxed break-words whitespace-pre-wrap text-sm">
                        {selectedApplication.interviewDetails.notes}
                      </p>
                    </div>
                  </div>
                )}
              </Card>
            )}

            {/* Enhanced Comments Section - COMSATS Compact */}
            {selectedApplication.supervisorComments && (
              <Card className="p-4 border border-gray-200 bg-gray-50 shadow-sm">
                <h3 className="text-lg font-bold text-[#003366] mb-3 flex items-center">
                  <User className="w-4 h-4 mr-2 text-[#003366]" />
                  Supervisor Comments
                </h3>
                <div className="bg-white p-3 rounded-md shadow-sm border border-gray-200">
                  <p className="text-gray-800 leading-relaxed break-words whitespace-pre-wrap text-sm">{selectedApplication.supervisorComments}</p>
                </div>
              </Card>
            )}

            {selectedApplication.companyComments && (
              <Card className="p-4 border border-gray-200 bg-gray-50 shadow-sm">
                <h3 className="text-lg font-bold text-[#003366] mb-3 flex items-center">
                  <Building2 className="w-4 h-4 mr-2 text-[#003366]" />
                  Company Comments
                </h3>
                <div className="bg-white p-3 rounded-md shadow-sm border border-gray-200">
                  <p className="text-gray-800 leading-relaxed break-words whitespace-pre-wrap text-sm">{selectedApplication.companyComments}</p>
                </div>
              </Card>
            )}

            {/* Enhanced Rejection Reasons - COMSATS Compact */}
            {selectedApplication.rejectionNote && selectedApplication.supervisorStatus === 'rejected' && (
              <Card className="p-4 border border-gray-200 bg-red-50 shadow-sm">
                <h3 className="text-lg font-bold text-red-900 mb-3 flex items-center">
                  <XCircle className="w-4 h-4 mr-2 text-red-600" />
                  Supervisor Rejection Reason
                </h3>
                <div className="bg-white p-3 rounded-md shadow-sm border border-red-200">
                  <p className="text-red-800 leading-relaxed break-words whitespace-pre-wrap text-sm">{selectedApplication.rejectionNote}</p>
                </div>
              </Card>
            )}

            {selectedApplication.companyRejectionNote && selectedApplication.applicationStatus === 'rejected' && (
              <Card className="p-4 border border-gray-200 bg-orange-50 shadow-sm">
                <h3 className="text-lg font-bold text-orange-900 mb-3 flex items-center">
                  <Building2 className="w-4 h-4 mr-2 text-orange-600" />
                  Company Rejection Reason
                </h3>
                <div className="bg-white p-3 rounded-md shadow-sm border border-orange-200">
                  <p className="text-orange-800 leading-relaxed break-words whitespace-pre-wrap text-sm">{selectedApplication.companyRejectionNote}</p>
                </div>
              </Card>
            )}

            {/* Enhanced Cover Letter Section - COMSATS Compact */}
            <Card className="p-4 bg-gradient-to-br from-[#003366]/5 to-[#00509E]/5 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-bold text-[#003366] mb-3 flex items-center">
                <FileText className="w-4 h-4 mr-2 text-[#003366]" />
                Cover Letter
              </h3>
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="bg-[#003366]/5 p-3 rounded-md border border-[#003366]/20">
                  <p className="text-[#003366] leading-relaxed break-words whitespace-pre-wrap font-medium text-sm">
                    {selectedApplication.coverLetter === 'http://localhost:5174/dashboard/companyhttp://localhost:5174/dashboard/companyhttp://localhost:5174/dashboard/companyhttp://localhost:5174/dashboard/company' 
                      ? 'Cover letter not available. Please contact the company for more details.'
                      : selectedApplication.coverLetter || 'No cover letter provided'
                    }
                  </p>
                </div>
              </div>
            </Card>

            {/* Enhanced Job Description - COMSATS Compact */}
            {selectedApplication.jobId?.jobDescription && (
              <Card className="p-4 bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-[#003366] mb-3 flex items-center">
                  <Briefcase className="w-4 h-4 mr-2 text-gray-600" />
                  Job Description
                </h3>
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                    <p className="text-gray-800 leading-relaxed break-words whitespace-pre-wrap text-sm">
                      {selectedApplication.jobId.jobDescription === 'http://localhost:5174/dashboard/companyhttp://localhost:5174/dashboard/companyhttp://localhost:5174/dashboard/companyhttp://localhost:5174/dashboard/company' 
                        ? 'Job description not available. Please contact the company for more details.'
                        : selectedApplication.jobId.jobDescription
                      }
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}
      </Modal>

      {/* Resubmission Modal */}
      <Modal
        isOpen={showResubmitModal}
        onClose={() => {
          setShowResubmitModal(false);
          setResubmissionData({ coverLetter: '', note: '' });
          setSelectedApplication(null);
        }}
        title="Fix & Resubmit Application"
        size="lg"
      >
        {selectedApplication && (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <h4 className="font-medium text-yellow-800 mb-2">Supervisor Feedback:</h4>
              {selectedApplication.rejectionFeedback && (
                <div className="text-sm text-yellow-700 space-y-1">
                  <p><strong>Reason:</strong> {selectedApplication.rejectionFeedback.reason}</p>
                  <p><strong>Details:</strong> {selectedApplication.rejectionFeedback.details}</p>
                  {selectedApplication.rejectionFeedback.requestedFixes && selectedApplication.rejectionFeedback.requestedFixes.length > 0 && (
                    <div>
                      <p><strong>Requested Fixes:</strong></p>
                      <ul className="list-disc list-inside ml-4">
                        {selectedApplication.rejectionFeedback.requestedFixes.map((fix, index) => (
                          <li key={index}>{fix}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cover Letter <span className="text-red-500">*</span>
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={6}
                placeholder="Update your cover letter based on the feedback..."
                value={resubmissionData.coverLetter}
                onChange={(e) => setResubmissionData(prev => ({ ...prev, coverLetter: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resubmission Note (Optional)
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Briefly explain the changes you made..."
                value={resubmissionData.note}
                onChange={(e) => setResubmissionData(prev => ({ ...prev, note: e.target.value }))}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowResubmitModal(false);
                  setResubmissionData({ coverLetter: '', note: '' });
                  setSelectedApplication(null);
                }}
                className="text-sm px-3 py-1"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={resubmitLoading || !resubmissionData.coverLetter.trim()}
                onClick={handleResubmit}
                className="bg-[#003366] hover:bg-[#003366]/90 text-sm px-3 py-1"
              >
                {resubmitLoading ? 'Resubmitting...' : 'Resubmit Application'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ApplicationsTab;