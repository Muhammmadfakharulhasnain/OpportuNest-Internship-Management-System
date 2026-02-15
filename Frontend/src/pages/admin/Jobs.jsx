import { useState, useEffect, useCallback } from 'react';
import { 
  Briefcase, 
  CheckCircle, 
  XCircle, 
  Clock,
  Eye,
  Edit,
  Trash2,
  AlertCircle,
  MapPin,
  DollarSign,
  Calendar,
  Building2
} from 'lucide-react';
import DataTable from '../../components/ui/DataTable';
import { getJobs, getJobDetails, updateJob, updateJobStatus, deleteJob } from '../../services/adminAPI';

const AdminJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    closed: 0,
    draft: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    type: '',
    location: ''
  });
  const [selectedJob, setSelectedJob] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Define table columns
  const columns = [
    {
      key: 'title',
      title: 'Job',
      render: (value, job) => (
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center mr-3">
            <Briefcase className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{job.jobTitle || job.title || 'N/A'}</div>
            <div className="text-sm text-gray-500">{job.workType || job.jobType || 'Full-time'}</div>
          </div>
        </div>
      )
    },
    {
      key: 'company',
      title: 'Company',
      render: (value, job) => (
        <div className="flex items-center">
          <Building2 className="h-4 w-4 text-gray-400 mr-2" />
          <div>
            <div className="text-sm text-gray-900">{job.companyName || job.companyId?.company?.companyName || job.companyId?.name || 'N/A'}</div>
            <div className="text-sm text-gray-500">{job.companyId?.company?.industry || 'N/A'}</div>
          </div>
        </div>
      )
    },
    {
      key: 'location',
      title: 'Location',
      render: (value, job) => (
        <div className="flex items-center">
          <MapPin className="h-4 w-4 text-gray-400 mr-1" />
          <span className="text-sm text-gray-900">{job.location || 'Remote'}</span>
        </div>
      )
    },
    {
      key: 'salary',
      title: 'Salary',
      render: (value, job) => (
        <div className="flex items-center">
          <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
          <span className="text-sm text-gray-900">
            {job.salaryRange ? `${job.salaryRange.min || ''} - ${job.salaryRange.max || ''}` : job.salary || 'Not specified'}
          </span>
        </div>
      )
    },
    {
      key: 'status',
      title: 'Status',
      render: (value, job) => {
        // Handle both capitalized (Active, Inactive, Closed, Draft) and lowercase statuses
        const status = (job.status || 'active').toLowerCase();
        const normalizedStatus = status === 'inactive' ? 'pending' : status;
        const badgeColors = {
          active: 'bg-green-100 text-green-800',
          pending: 'bg-yellow-100 text-yellow-800',
          closed: 'bg-red-100 text-red-800',
          draft: 'bg-gray-100 text-gray-800'
        };
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${badgeColors[normalizedStatus]}`}>
            {normalizedStatus}
          </span>
        );
      }
    },
    {
      key: 'applications',
      title: 'Applications',
      render: (value, job) => (
        <div className="text-sm text-gray-900">
          {job.applicationsCount || job.applications?.length || 0}
        </div>
      )
    },
    {
      key: 'deadline',
      title: 'Deadline',
      render: (value, job) => (
        <div className="flex items-center">
          <Calendar className="h-4 w-4 text-gray-400 mr-1" />
          <span className="text-sm text-gray-900">
            {job.applicationDeadline || job.deadline ? new Date(job.applicationDeadline || job.deadline).toLocaleDateString() : 'No deadline'}
          </span>
        </div>
      )
    },
    {
      key: 'createdAt',
      title: 'Posted',
      type: 'date'
    }
  ];

  // Define filter options
  const filterOptions = [
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'pending', label: 'Pending' },
        { value: 'closed', label: 'Closed' },
        { value: 'draft', label: 'Draft' }
      ]
    },
    {
      key: 'type',
      label: 'Job Type',
      options: [
        { value: 'internship', label: 'Internship' },
        { value: 'full-time', label: 'Full-time' },
        { value: 'part-time', label: 'Part-time' },
        { value: 'contract', label: 'Contract' }
      ]
    },
    {
      key: 'location',
      label: 'Location Type',
      options: [
        { value: 'remote', label: 'Remote' },
        { value: 'onsite', label: 'On-site' },
        { value: 'hybrid', label: 'Hybrid' }
      ]
    }
  ];

  // Define table actions
  const actions = [
    {
      label: 'View',
      icon: Eye,
      onClick: (job) => handleViewJob(job),
      className: 'text-blue-600 hover:text-blue-900'
    },
    {
      label: 'Edit',
      icon: Edit,
      onClick: (job) => handleEditJob(job),
      className: 'text-green-600 hover:text-green-900'
    },
    {
      label: 'Close',
      icon: XCircle,
      onClick: (job) => handleCloseJob(job),
      className: 'text-orange-600 hover:text-orange-900',
      condition: (job) => (job.status || '').toLowerCase() === 'active'
    },
    {
      label: 'Activate',
      icon: CheckCircle,
      onClick: (job) => handleActivateJob(job),
      className: 'text-green-600 hover:text-green-900',
      condition: (job) => (job.status || '').toLowerCase() !== 'active'
    },
    {
      label: 'Delete',
      icon: Trash2,
      onClick: (job) => handleDeleteJob(job),
      className: 'text-red-600 hover:text-red-900'
    }
  ];

  // Fetch jobs data
  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      };
      
      const response = await getJobs(params);
      console.log('📊 Jobs response:', response);
      
      setJobs(response.data?.jobs || response.jobs || []);
      setPagination(prev => ({
        ...prev,
        total: response.data?.pagination?.total || response.pagination?.total || 0,
        totalPages: response.data?.pagination?.pages || response.pagination?.pages || 0
      }));
      setError(null);
    } catch (err) {
      setError('Failed to load jobs');
      console.error('Jobs fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  // Fetch job statistics
  const fetchJobStats = useCallback(async () => {
    try {
      // Fetch jobs with different statuses to calculate stats
      // Note: Backend uses capitalized status values (Active, Inactive, Closed, Draft)
      const [allResponse, activeResponse, pendingResponse, closedResponse, draftResponse] = await Promise.all([
        getJobs({ limit: 1000 }), // Get a large number to get all
        getJobs({ status: 'Active', limit: 1000 }),
        getJobs({ status: 'Inactive', limit: 1000 }),
        getJobs({ status: 'Closed', limit: 1000 }),
        getJobs({ status: 'Draft', limit: 1000 })
      ]);

      setStats({
        total: allResponse.data?.pagination?.total || allResponse.pagination?.total || 0,
        active: activeResponse.data?.pagination?.total || activeResponse.pagination?.total || 0,
        pending: pendingResponse.data?.pagination?.total || pendingResponse.pagination?.total || 0,
        closed: closedResponse.data?.pagination?.total || closedResponse.pagination?.total || 0,
        draft: draftResponse.data?.pagination?.total || draftResponse.pagination?.total || 0
      });
    } catch (err) {
      console.error('Error fetching job stats:', err);
    }
  }, []);

  // Handle search
  const handleSearch = (searchTerm) => {
    setFilters({ ...filters, search: searchTerm });
    setPagination({ ...pagination, page: 1 });
  };

  // Handle filter changes
  const handleFilter = (newFilters) => {
    setFilters({ ...filters, ...newFilters });
    setPagination({ ...pagination, page: 1 });
  };

  // Handle page changes
  const handlePageChange = (newPage) => {
    setPagination({ ...pagination, page: newPage });
  };

  // Handle limit changes
  const handleLimitChange = (newLimit) => {
    setPagination({ ...pagination, limit: newLimit, page: 1 });
  };

  // Handle view job
  const handleViewJob = async (job) => {
    try {
      setLoading(true);
      const response = await getJobDetails(job._id);
      if (response.success) {
        setSelectedJob(response.data);
        setShowViewModal(true);
      }
    } catch (err) {
      console.error('Error fetching job details:', err);
      alert('Failed to fetch job details');
    } finally {
      setLoading(false);
    }
  };

  // Handle edit job
  const handleEditJob = async (job) => {
    try {
      setLoading(true);
      const response = await getJobDetails(job._id);
      if (response.success) {
        setSelectedJob(response.data);
        setShowEditModal(true);
      }
    } catch (err) {
      console.error('Error fetching job details:', err);
      alert('Failed to fetch job details');
    } finally {
      setLoading(false);
    }
  };

  // Handle close job
  const handleCloseJob = async (job) => {
    const currentStatus = (job.status || '').toLowerCase();
    if (currentStatus === 'closed') {
      alert('Job is already closed');
      return;
    }

    const reason = prompt(`Closing job "${job.jobTitle}". Please provide a reason (optional):`);
    if (reason === null) return; // User cancelled

    try {
      await updateJobStatus(job._id, { 
        status: 'closed',
        reason: reason || 'Job closed by admin'
      });
      alert('Job closed successfully');
      fetchJobs(); // Refresh data
      fetchJobStats(); // Refresh stats
    } catch (err) {
      console.error('Error closing job:', err);
      alert('Failed to close job');
    }
  };

  // Handle activate job
  const handleActivateJob = async (job) => {
    const currentStatus = (job.status || '').toLowerCase();
    if (currentStatus === 'active') {
      alert('Job is already active');
      return;
    }

    if (!confirm(`Are you sure you want to activate the job "${job.jobTitle}"?`)) {
      return;
    }

    try {
      await updateJobStatus(job._id, { 
        status: 'active',
        reason: 'Job activated by admin'
      });
      alert('Job activated successfully');
      fetchJobs(); // Refresh data
      fetchJobStats(); // Refresh stats
    } catch (err) {
      console.error('Error activating job:', err);
      alert('Failed to activate job');
    }
  };

  // Handle delete job
  const handleDeleteJob = async (job) => {
    const jobTitle = job.jobTitle || job.title || 'this job';
    if (!confirm(`Are you sure you want to delete the job "${jobTitle}"? This action cannot be undone and will remove all associated applications.`)) {
      return;
    }

    // Double confirmation for delete
    if (!confirm('This is a permanent action. Type "DELETE" if you really want to continue.') && 
        prompt('Type "DELETE" to confirm deletion:') !== 'DELETE') {
      return;
    }

    try {
      await deleteJob(job._id);
      alert('Job deleted successfully');
      fetchJobs(); // Refresh data
      fetchJobStats(); // Refresh stats
    } catch (err) {
      console.error('Error deleting job:', err);
      alert('Failed to delete job');
    }
  };

  // Handle export
  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export jobs');
  };

  // Fetch data on component mount and when dependencies change
  useEffect(() => {
    fetchJobs();
    fetchJobStats();
  }, [fetchJobs, fetchJobStats]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Job Management</h1>
          <p className="text-gray-600 mt-1">
            Monitor and manage job postings across the platform
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <AlertCircle className="h-4 w-4 mr-2" />
            Bulk Actions
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
            <Briefcase className="h-4 w-4 mr-2" />
            Export Data
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Briefcase className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Jobs</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Jobs</p>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Closed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.closed}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Edit className="h-6 w-6 text-gray-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Draft</p>
              <p className="text-2xl font-bold text-gray-900">{stats.draft}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions for Pending Jobs */}
      {jobs.some(j => (j.status || '').toLowerCase() === 'pending' || j.status === 'Inactive') && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-yellow-400 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">
                {jobs.filter(j => (j.status || '').toLowerCase() === 'pending' || j.status === 'Inactive').length} jobs need your attention
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                Review and approve job postings to make them visible to students.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Jobs Table */}
      <DataTable
        data={jobs}
        columns={columns}
        loading={loading}
        error={error}
        pagination={pagination}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
        onSearch={handleSearch}
        onFilter={handleFilter}
        onRefresh={fetchJobs}
        onExport={handleExport}
        searchable={true}
        filterable={true}
        exportable={true}
        refreshable={true}
        filters={filterOptions}
        activeFilters={filters}
        actions={actions}
      />

      {/* View Job Modal */}
      {showViewModal && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full m-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Job Details</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Basic Job Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Job Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Job Title</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedJob.jobTitle}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Company</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedJob.companyName || selectedJob.companyId?.company?.companyName || selectedJob.companyId?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Location</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedJob.location}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Work Type</label>
                      <p className="mt-1 text-sm text-gray-900 capitalize">{selectedJob.workType}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Status</label>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        selectedJob.status === 'Active' ? 'bg-green-100 text-green-800' :
                        selectedJob.status === 'Closed' ? 'bg-red-100 text-red-800' :
                        selectedJob.status === 'Draft' ? 'bg-gray-100 text-gray-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {selectedJob.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Details</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Salary</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedJob.salary || 'Not specified'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Duration</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedJob.duration || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Start Date</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedJob.startDate ? new Date(selectedJob.startDate).toLocaleDateString() : 'Not specified'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Application Deadline</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedJob.applicationDeadline ? new Date(selectedJob.applicationDeadline).toLocaleDateString() : 'No deadline set'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Posted Date</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(selectedJob.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Application Stats */}
              {selectedJob.applicationStats && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Application Statistics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{selectedJob.applicationStats.total}</p>
                      <p className="text-sm text-blue-600">Total Applications</p>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded-lg">
                      <p className="text-2xl font-bold text-yellow-600">{selectedJob.applicationStats.pending}</p>
                      <p className="text-sm text-yellow-600">Pending</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{selectedJob.applicationStats.shortlisted}</p>
                      <p className="text-sm text-green-600">Shortlisted</p>
                    </div>
                    <div className="bg-emerald-50 p-3 rounded-lg">
                      <p className="text-2xl font-bold text-emerald-600">{selectedJob.applicationStats.accepted}</p>
                      <p className="text-sm text-emerald-600">Accepted</p>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg">
                      <p className="text-2xl font-bold text-red-600">{selectedJob.applicationStats.rejected}</p>
                      <p className="text-sm text-red-600">Rejected</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Job Description */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Job Description</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {selectedJob.jobDescription}
                  </p>
                </div>
              </div>

              {/* Requirements */}
              {selectedJob.requirements && selectedJob.requirements.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Requirements</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                      {selectedJob.requirements.map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Technology Stack */}
              {selectedJob.technologyStack && selectedJob.technologyStack.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Technology Stack</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex flex-wrap gap-2">
                      {selectedJob.technologyStack.map((tech, index) => (
                        <span key={index} className="inline-flex px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end p-6 border-t space-x-3">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Job Modal */}
      {showEditModal && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full m-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Edit Job</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const jobData = {
                jobTitle: formData.get('jobTitle'),
                jobDescription: formData.get('jobDescription'),
                requirements: formData.get('requirements').split('\n').filter(req => req.trim()),
                technologyStack: formData.get('technologyStack').split(',').map(tech => tech.trim()).filter(tech => tech),
                location: formData.get('location'),
                workType: formData.get('workType'),
                salary: formData.get('salary'),
                duration: formData.get('duration'),
                startDate: formData.get('startDate'),
                endDate: formData.get('endDate'),
                applicationDeadline: formData.get('applicationDeadline'),
                status: formData.get('status')
              };

              try {
                const response = await updateJob(selectedJob._id, jobData);
                if (response.success) {
                  alert('Job updated successfully');
                  setShowEditModal(false);
                  fetchJobs(); // Refresh the jobs list
                }
              } catch (error) {
                console.error('Error updating job:', error);
                alert('Failed to update job');
              }
            }}>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
                    <input
                      type="text"
                      name="jobTitle"
                      defaultValue={selectedJob.jobTitle}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <input
                      type="text"
                      name="location"
                      defaultValue={selectedJob.location}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Work Type</label>
                    <select
                      name="workType"
                      defaultValue={selectedJob.workType}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="On-site">On-site</option>
                      <option value="Remote">Remote</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      name="status"
                      defaultValue={selectedJob.status}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Closed">Closed</option>
                      <option value="Draft">Draft</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Salary</label>
                    <input
                      type="text"
                      name="salary"
                      defaultValue={selectedJob.salary}
                      placeholder="e.g., $50,000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                    <input
                      type="text"
                      name="duration"
                      defaultValue={selectedJob.duration}
                      placeholder="e.g., 3 months"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                    <input
                      type="date"
                      name="startDate"
                      defaultValue={selectedJob.startDate ? selectedJob.startDate.split('T')[0] : ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                    <input
                      type="date"
                      name="endDate"
                      defaultValue={selectedJob.endDate ? selectedJob.endDate.split('T')[0] : ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Application Deadline</label>
                    <input
                      type="date"
                      name="applicationDeadline"
                      defaultValue={selectedJob.applicationDeadline ? selectedJob.applicationDeadline.split('T')[0] : ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Job Description</label>
                  <textarea
                    name="jobDescription"
                    defaultValue={selectedJob.jobDescription}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Requirements (one per line)</label>
                  <textarea
                    name="requirements"
                    defaultValue={Array.isArray(selectedJob.requirements) ? selectedJob.requirements.join('\n') : selectedJob.requirements}
                    rows={3}
                    placeholder="Enter each requirement on a new line"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Technology Stack (comma separated)</label>
                  <input
                    type="text"
                    name="technologyStack"
                    defaultValue={Array.isArray(selectedJob.technologyStack) ? selectedJob.technologyStack.join(', ') : selectedJob.technologyStack}
                    placeholder="e.g., React, Node.js, MongoDB"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end p-6 border-t space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  Update Job
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminJobs;