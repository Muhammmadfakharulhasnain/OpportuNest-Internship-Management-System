import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Plus, Edit, Trash2, MapPin, Briefcase, Globe, AlertTriangle, Clock, Building2, Calendar, Grid, List, Users, Tag, Search, X, Filter, ChevronDown, SlidersHorizontal } from 'lucide-react';
import { jobAPI } from '../../../services/api';
import Button from '../../../ui/Button';
import Card from '../../../ui/Card';
import Badge from '../../../ui/Badge';
import Modal from '../../../ui/Modal';
import Input from '../../../ui/Input';
import Select from '../../../ui/Select';
import './JobsTab.css';

const JobsTab = ({ onJobChange }) => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showJobModal, setShowJobModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'grid' or 'list'
  
  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [workTypeFilter, setWorkTypeFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('');
  const [salaryFilter, setSalaryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  
  const [formData, setFormData] = useState({
    jobTitle: '',
    location: '',
    workType: '',
    duration: '',
    startDate: '',
    endDate: '',
    jobDescription: '',
    requirements: '',
    technologyStack: '',
    salary: '',
    applicationLimit: '50',
    applicationDeadline: '',
    isUrgent: false,
    tags: ''
  });

  // Fetch jobs on component mount
  useEffect(() => {
    fetchJobs();
  }, []);

  // Apply filters whenever jobs or filter values change
  useEffect(() => {
    applyFilters();
  }, [jobs, searchTerm, statusFilter, workTypeFilter, locationFilter, salaryFilter, sortBy]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await jobAPI.getCompanyJobs({ limit: 1000 }); // Fetch all jobs
      const jobsData = response.data || [];
      setJobs(jobsData);
      setFilteredJobs(jobsData);
      setError(null);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError(err.message);
      setJobs([]);
      setFilteredJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...jobs];

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(job => 
        (job.jobTitle || job.title || '').toLowerCase().includes(term) ||
        (job.location || '').toLowerCase().includes(term) ||
        (job.jobDescription || '').toLowerCase().includes(term)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      const now = new Date();
      if (statusFilter === 'active') {
        result = result.filter(job => new Date(job.applicationDeadline) > now);
      } else if (statusFilter === 'expired') {
        result = result.filter(job => new Date(job.applicationDeadline) <= now);
      } else if (statusFilter === 'urgent') {
        result = result.filter(job => job.isUrgent);
      }
    }

    // Work type filter
    if (workTypeFilter !== 'all') {
      result = result.filter(job => job.workType === workTypeFilter);
    }

    // Location filter
    if (locationFilter.trim()) {
      const locTerm = locationFilter.toLowerCase();
      result = result.filter(job => 
        (job.location || '').toLowerCase().includes(locTerm)
      );
    }

    // Salary filter
    if (salaryFilter !== 'all') {
      if (salaryFilter === 'paid') {
        result = result.filter(job => job.salary && job.salary !== 'Unpaid' && job.salary !== '0');
      } else if (salaryFilter === 'unpaid') {
        result = result.filter(job => !job.salary || job.salary === 'Unpaid' || job.salary === '0');
      }
    }

    // Sort
    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === 'oldest') {
      result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortBy === 'most-applications') {
      result.sort((a, b) => (b.applicationsCount || 0) - (a.applicationsCount || 0));
    } else if (sortBy === 'title-az') {
      result.sort((a, b) => (a.jobTitle || '').localeCompare(b.jobTitle || ''));
    }

    setFilteredJobs(result);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setWorkTypeFilter('all');
    setLocationFilter('');
    setSalaryFilter('all');
    setSortBy('newest');
  };

  // Get unique locations for filter dropdown
  const getUniqueLocations = () => {
    const locations = jobs.map(job => job.location).filter(Boolean);
    return [...new Set(locations)];
  };

  // Count active filters
  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchTerm.trim()) count++;
    if (statusFilter !== 'all') count++;
    if (workTypeFilter !== 'all') count++;
    if (locationFilter.trim()) count++;
    if (salaryFilter !== 'all') count++;
    if (sortBy !== 'newest') count++;
    return count;
  };

  const handleCreateJob = () => {
    setSelectedJob(null);
    setFormData({
      jobTitle: '',
      location: '',
      workType: '',
      duration: '',
      startDate: '',
      endDate: '',
      jobDescription: '',
      requirements: '',
      technologyStack: '',
      salary: '',
      applicationLimit: '50',
      applicationDeadline: '',
      isUrgent: false,
      tags: ''
    });
    setShowJobModal(true);
  };

  const handleEditJob = (job) => {
    setSelectedJob(job);
    setFormData({
      jobTitle: job.jobTitle,
      location: job.location,
      workType: job.workType,
      duration: job.duration,
      startDate: job.startDate ? job.startDate.split('T')[0] : '',
      endDate: job.endDate ? job.endDate.split('T')[0] : '',
      jobDescription: job.jobDescription,
      requirements: Array.isArray(job.requirements) ? job.requirements.join(', ') : job.requirements,
      technologyStack: Array.isArray(job.technologyStack) ? job.technologyStack.join(', ') : job.technologyStack,
      salary: job.salary,
      applicationLimit: job.applicationLimit || '50',
      applicationDeadline: job.applicationDeadline ? job.applicationDeadline.split('T')[0] : '',
      isUrgent: job.isUrgent || false,
      tags: Array.isArray(job.tags) ? job.tags.join(', ') : job.tags || ''
    });
    setShowJobModal(true);
  };

  const handleSubmitJob = async () => {
    try {
      setSubmitting(true);
      
      // Prepare job data
      const jobData = {
        jobTitle: formData.jobTitle.trim(),
        location: formData.location.trim(),
        workType: formData.workType,
        duration: formData.duration.trim(),
        salary: formData.salary.trim(),
        startDate: formData.startDate,
        endDate: formData.endDate,
        jobDescription: formData.jobDescription.trim(),
        requirements: formData.requirements.split(',').map(req => req.trim()).filter(req => req),
        technologyStack: formData.technologyStack.split(',').map(tech => tech.trim()).filter(tech => tech),
        applicationLimit: parseInt(formData.applicationLimit),
        applicationDeadline: formData.applicationDeadline,
        isUrgent: formData.isUrgent,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
      };

      if (selectedJob) {
        // Update existing job
        await jobAPI.updateJob(selectedJob._id, jobData);
        alert('Job updated successfully!');
      } else {
        // Create new job
        await jobAPI.createJob(jobData);
        alert('Job posted successfully!');
      }
      
      // Refresh jobs list
      await fetchJobs();
      
      // Call parent callback to refresh dashboard stats
      if (onJobChange) {
        onJobChange();
      }
      
      setShowJobModal(false);
    } catch (err) {
      console.error('Error submitting job:', err);
      alert(`Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        await jobAPI.deleteJob(jobId);
        await fetchJobs();
        
        // Call parent callback to refresh dashboard stats
        if (onJobChange) {
          onJobChange();
        }
        
        alert('Job deleted successfully!');
      } catch (err) {
        console.error('Error deleting job:', err);
        alert(`Error: ${err.message}`);
      }
    }
  };

  const workTypeOptions = [
    { value: 'Remote', label: 'Remote' },
    { value: 'On-site', label: 'On-site' },
    { value: 'Hybrid', label: 'Hybrid' }
  ];

  // Helper function to get job stats
  const getJobStats = () => {
    const now = new Date();
    return {
      total: jobs.length,
      active: jobs.filter(job => new Date(job.applicationDeadline) > now).length,
      expired: jobs.filter(job => new Date(job.applicationDeadline) <= now).length,
      urgent: jobs.filter(job => job.isUrgent).length,
      totalApplications: jobs.reduce((total, job) => total + (job.applicationsCount || 0), 0),
      remote: jobs.filter(job => job.workType === 'Remote').length,
      onsite: jobs.filter(job => job.workType === 'On-site').length
    };
  };

  const stats = getJobStats();

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-8">
        <Card className="p-12 text-center border-2 border-gray-100">
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-gray-100 p-4 rounded-full animate-pulse">
              <Briefcase className="w-8 h-8 text-gray-400" />
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-32 animate-pulse"></div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400"></div>
              <p className="text-gray-600 font-medium">Loading jobs...</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Enhanced Header - COMSATS Design (Matching ApplicationsTab) */}
      <div className="bg-gradient-to-r from-[#003366] via-[#00509E] to-[#003366] rounded-lg p-4 text-white shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-md backdrop-blur-sm">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Job Postings Management</h2>
              <p className="text-blue-100 mt-0.5 text-sm">Create and manage internship opportunities for students</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4 text-blue-100">
            <div className="text-center">
              <div className="text-lg font-bold text-white">{stats.total}</div>
              <div className="text-xs">Total Jobs</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-white">{stats.totalApplications}</div>
              <div className="text-xs">Applications</div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Statistics Dashboard - COMSATS Design (Matching ApplicationsTab) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="p-3 text-center bg-gradient-to-br from-[#003366]/5 to-[#003366]/10 border border-[#003366]/20 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-center mb-1">
            <div className="p-1.5 bg-[#003366]/20 rounded-md">
              <Briefcase className="w-4 h-4 text-[#003366]" />
            </div>
          </div>
          <div className="text-lg font-bold text-[#003366]">{stats.total}</div>
          <div className="text-xs text-[#003366] font-medium">Total Jobs</div>
        </Card>
        
        <Card className="p-3 text-center bg-gradient-to-br from-green-50 to-green-100 border border-green-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-center mb-1">
            <div className="p-1.5 bg-green-200 rounded-md">
              <Globe className="w-4 h-4 text-green-700" />
            </div>
          </div>
          <div className="text-lg font-bold text-green-800">{stats.active}</div>
          <div className="text-xs text-green-700 font-medium">Active Jobs</div>
        </Card>
        
        <Card className="p-3 text-center bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-center mb-1">
            <div className="p-1.5 bg-gray-200 rounded-md">
              <Clock className="w-4 h-4 text-gray-600" />
            </div>
          </div>
          <div className="text-lg font-bold text-gray-700">{stats.expired}</div>
          <div className="text-xs text-gray-600 font-medium">Expired</div>
        </Card>
        
        <Card className="p-3 text-center bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-center mb-1">
            <div className="p-1.5 bg-amber-200 rounded-md">
              <AlertTriangle className="w-4 h-4 text-amber-700" />
            </div>
          </div>
          <div className="text-lg font-bold text-amber-800">{stats.urgent}</div>
          <div className="text-xs text-amber-700 font-medium">Urgent</div>
        </Card>
        
        <Card className="p-3 text-center bg-gradient-to-br from-[#00509E]/5 to-[#00509E]/10 border border-[#00509E]/20 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-center mb-1">
            <div className="p-1.5 bg-[#00509E]/20 rounded-md">
              <Users className="w-4 h-4 text-[#00509E]" />
            </div>
          </div>
          <div className="text-lg font-bold text-[#00509E]">{stats.totalApplications}</div>
          <div className="text-xs text-[#00509E] font-medium">Applications</div>
        </Card>
        
        <Card className="p-3 text-center bg-gradient-to-br from-blue-50 to-blue-100 border border-[#003366]/20 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-center mb-1">
            <div className="p-1.5 bg-[#003366]/20 rounded-md">
              <MapPin className="w-4 h-4 text-[#003366]" />
            </div>
          </div>
          <div className="text-lg font-bold text-[#003366]">{stats.remote}</div>
          <div className="text-xs text-[#003366] font-medium">Remote</div>
        </Card>
      </div>

      {/* Enhanced Tab Navigation - COMSATS Design (Matching ApplicationsTab) */}
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
                <Briefcase className="w-4 h-4" />
                <span>All Jobs</span>
                <span className="ml-1 bg-[#003366]/10 text-[#003366] px-2 py-0.5 rounded-full text-xs font-bold">
                  {stats.total}
                </span>
              </div>
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                statusFilter === 'active'
                  ? 'border-[#003366] text-[#003366]'
                  : 'border-transparent text-gray-500 hover:text-[#00509E] hover:border-[#00509E]'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4" />
                <span>Active</span>
                <span className="ml-1 bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-bold">
                  {stats.active}
                </span>
              </div>
            </button>
            <button
              onClick={() => setStatusFilter('expired')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                statusFilter === 'expired'
                  ? 'border-[#003366] text-[#003366]'
                  : 'border-transparent text-gray-500 hover:text-[#00509E] hover:border-[#00509E]'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>Expired</span>
                <span className="ml-1 bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs font-bold">
                  {stats.expired}
                </span>
              </div>
            </button>
            <button
              onClick={() => setStatusFilter('urgent')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                statusFilter === 'urgent'
                  ? 'border-[#003366] text-[#003366]'
                  : 'border-transparent text-gray-500 hover:text-[#00509E] hover:border-[#00509E]'
              }`}
            >
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Urgent</span>
                <span className="ml-1 bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-xs font-bold">
                  {stats.urgent}
                </span>
              </div>
            </button>
          </nav>
        </div>
        
        {/* Enhanced Search Section - COMSATS Design (Matching ApplicationsTab) */}
        <div className="p-6 bg-gradient-to-r from-[#003366]/5 to-[#00509E]/5">
          {/* Row 1: Search Input, Filter Button, and Post New Job Button */}
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#003366] w-5 h-5" />
              <Input
                type="text"
                placeholder="Search by job title, location, or description..."
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
              onClick={handleCreateJob}
              className="bg-gradient-to-r from-[#003366] to-[#00509E] hover:from-[#003366]/90 hover:to-[#00509E]/90 text-white whitespace-nowrap px-6 py-3"
            >
              <Plus className="w-4 h-4 mr-2" />
              Post New Job
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
                  onClick={clearFilters}
                  className="text-sm text-[#003366] hover:text-[#00509E] font-medium flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-[#003366]/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Clear All
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Work Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Briefcase className="w-4 h-4 inline mr-1" />
                    Work Type
                  </label>
                  <select
                    value={workTypeFilter}
                    onChange={(e) => setWorkTypeFilter(e.target.value)}
                    className="w-full px-4 py-2.5 border border-[#003366]/20 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-[#003366] bg-white text-gray-700 text-sm"
                  >
                    <option value="all">All Types</option>
                    <option value="On-site">On-site</option>
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>

                {/* Location Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="Search location..."
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="w-full px-4 py-2.5 border border-[#003366]/20 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-[#003366] bg-white text-gray-700 text-sm"
                    list="location-suggestions"
                  />
                  <datalist id="location-suggestions">
                    {getUniqueLocations().map((loc, idx) => (
                      <option key={idx} value={loc} />
                    ))}
                  </datalist>
                </div>

                {/* Salary Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Tag className="w-4 h-4 inline mr-1" />
                    Salary
                  </label>
                  <select
                    value={salaryFilter}
                    onChange={(e) => setSalaryFilter(e.target.value)}
                    className="w-full px-4 py-2.5 border border-[#003366]/20 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-[#003366] bg-white text-gray-700 text-sm"
                  >
                    <option value="all">All (Paid & Unpaid)</option>
                    <option value="paid">Paid Only</option>
                    <option value="unpaid">Unpaid Only</option>
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
                    <option value="most-applications">Most Applications</option>
                    <option value="title-az">Title: A-Z</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Row 2: View Toggle and Results Count */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Results Count */}
            <div className="text-sm text-gray-600">
              Showing <span className="font-bold text-[#003366]">{filteredJobs.length}</span> of <span className="font-bold text-[#003366]">{stats.total}</span> jobs
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-white rounded-lg border border-[#003366]/20 p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  viewMode === 'grid' 
                    ? 'bg-[#003366] text-white shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
                title="Grid View"
              >
                <Grid className="w-4 h-4" />
                <span className="hidden sm:inline">Grid</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  viewMode === 'list' 
                    ? 'bg-[#003366] text-white shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
                <span className="hidden sm:inline">List</span>
              </button>
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
              {workTypeFilter !== 'all' && (
                <span className="bg-[#00509E] text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                  Type: {workTypeFilter}
                  <button onClick={() => setWorkTypeFilter('all')} className="ml-1 hover:bg-white/20 rounded-full p-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {locationFilter && (
                <span className="bg-[#003366] text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                  Location: {locationFilter}
                  <button onClick={() => setLocationFilter('')} className="ml-1 hover:bg-white/20 rounded-full p-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {salaryFilter !== 'all' && (
                <span className="bg-[#00509E] text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                  Salary: {salaryFilter}
                  <button onClick={() => setSalaryFilter('all')} className="ml-1 hover:bg-white/20 rounded-full p-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {searchTerm && (
                <span className="bg-[#003366] text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
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

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          <span className="text-sm text-red-700">{error} - Showing offline data</span>
        </div>
      )}

      {/* Jobs List */}
      <div className="space-y-4">
        {/* Special Header for Active Jobs */}
        {statusFilter === 'active' && filteredJobs.length > 0 && (
          <Card className="p-6 bg-gray-50 border border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <Globe className="w-8 h-8 text-green-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  Active Jobs ({stats.active})
                </h2>
                <p className="text-gray-600 font-medium">
                  Jobs that are currently accepting applications
                </p>
              </div>
              <div className="text-right">
                <div className="bg-white rounded-lg px-4 py-2 border border-gray-200">
                  <div className="text-2xl font-bold text-gray-900">{stats.active}</div>
                  <div className="text-xs text-gray-500 font-medium">Open Positions</div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {filteredJobs.length === 0 ? (
          <Card className="text-center py-16 bg-gray-50 border border-gray-200">
            <div className="bg-gray-100 p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              {statusFilter === 'active' ? (
                <Globe className="h-12 w-12 text-gray-500" />
              ) : statusFilter === 'urgent' ? (
                <AlertTriangle className="h-12 w-12 text-gray-500" />
              ) : (
                <Briefcase className="h-12 w-12 text-gray-500" />
              )}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {jobs.length === 0 ? 'No Job Postings Yet' : 'No Jobs Found'}
            </h3>
            <p className="text-gray-600 font-medium">
              {jobs.length === 0
                ? 'You haven\'t created any job postings yet. Post your first job to attract talented students!'
                : statusFilter === 'all'
                  ? 'No jobs match your search criteria. Try adjusting your filters.'
                  : `No jobs with status "${statusFilter}" found.`}
            </p>
            {jobs.length === 0 ? (
              <button
                onClick={handleCreateJob}
                className="mt-4 bg-gradient-to-r from-[#003366] to-[#00509E] hover:from-[#003366]/90 hover:to-[#00509E]/90 text-white font-bold py-2 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
              >
                <Plus className="w-4 h-4 inline mr-2" />
                Post Your First Job
              </button>
            ) : statusFilter !== 'all' && (
              <button
                onClick={clearFilters}
                className="mt-4 bg-gradient-to-r from-[#003366] to-[#00509E] hover:from-[#003366]/90 hover:to-[#00509E]/90 text-white font-bold py-2 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
              >
                View All Jobs
              </button>
            )}
          </Card>
        ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {filteredJobs.map((job) => (
              viewMode === 'grid' ? (
                // GRID VIEW
                <Card
                  key={job._id || job.id}
                  className="group relative border-2 border-gray-300 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 bg-white hover:border-[#003366] overflow-hidden"
                >
                  <div className="p-5 flex flex-col h-full">
                    {/* Job Status Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <Badge 
                        variant={new Date(job.applicationDeadline) > new Date() ? 'success' : 'secondary'}
                        className="text-xs font-semibold px-3 py-1"
                      >
                        {new Date(job.applicationDeadline) > new Date() ? '✓ Active' : 'Expired'}
                      </Badge>
                      {job.isUrgent && (
                        <Badge variant="warning" className="text-xs font-semibold px-3 py-1">
                          ⚡ Urgent
                        </Badge>
                      )}
                    </div>
                    
                    {/* Header Section */}
                    <div className="flex items-start space-x-3 mb-4 pb-4 border-b-2 border-gray-100">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#003366] to-[#00509E] rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                        <Briefcase className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 leading-tight">
                          {job.jobTitle || job.title}
                        </h3>
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Building2 className="w-4 h-4 text-[#00509E]" />
                          <span className="font-medium text-sm">{job.companyName || 'Your Company'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Job Details Section */}
                    <div className="flex-1 space-y-3 mb-4">
                      {/* Info Grid */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center space-x-2 p-2.5 bg-[#003366]/5 rounded-lg border border-[#003366]/20">
                          <MapPin className="w-4 h-4 text-[#003366] flex-shrink-0" />
                          <span className="text-sm text-gray-800 font-medium truncate">{job.location}</span>
                        </div>
                        <div className="flex items-center space-x-2 p-2.5 bg-[#00509E]/5 rounded-lg border border-[#00509E]/20">
                          <Clock className="w-4 h-4 text-[#00509E] flex-shrink-0" />
                          <span className="text-sm text-gray-800 font-medium truncate">{job.workType || job.type}</span>
                        </div>
                        <div className="flex items-center space-x-2 p-2.5 bg-[#003366]/5 rounded-lg border border-[#003366]/20">
                          <Calendar className="w-4 h-4 text-[#003366] flex-shrink-0" />
                          <span className="text-sm text-gray-800 font-medium truncate">{job.duration || 'Flexible'}</span>
                        </div>
                        <div className="flex items-center space-x-2 p-2.5 bg-[#00509E]/5 rounded-lg border border-[#00509E]/20">
                          {(job.salary && job.salary !== 'Unpaid' && job.salary !== '0') ? (
                            <>
                              <span className="text-sm text-[#003366] font-bold flex-shrink-0">Rs</span>
                              <span className="text-sm text-[#003366] font-bold truncate">{job.salary}</span>
                            </>
                          ) : (
                            <>
                              <Globe className="w-4 h-4 text-gray-500 flex-shrink-0" />
                              <span className="text-sm text-gray-700 font-medium truncate">Unpaid</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Dates */}
                      {(job.startDate || job.endDate) && (
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {job.startDate && (
                              <div>
                                <span className="text-gray-500 font-medium">Start:</span>
                                <span className="text-gray-800 font-semibold ml-1">
                                  {new Date(job.startDate).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                            {job.endDate && (
                              <div>
                                <span className="text-gray-500 font-medium">End:</span>
                                <span className="text-gray-800 font-semibold ml-1">
                                  {new Date(job.endDate).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Tags */}
                      {job.tags && job.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {(Array.isArray(job.tags) ? job.tags : job.tags.split(',')).slice(0, 3).map((tag, idx) => (
                            <span key={idx} className="px-2 py-1 bg-gray-200 text-gray-700 text-xs font-medium rounded-md flex items-center gap-1">
                              <Tag className="w-3 h-3" />
                              {tag.trim()}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Application Status */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg border-2 border-blue-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-[#003366]" />
                            <span className="text-sm text-gray-700 font-semibold">Applications</span>
                          </div>
                          <div className="text-right">
                            <span className="text-xl font-bold text-[#003366]">
                              {job.applicationsCount || job.applications || 0}
                            </span>
                            <span className="text-gray-500 font-medium">/{job.applicationLimit || 50}</span>
                            {(job.applicationsCount || 0) >= (job.applicationLimit || 50) && (
                              <Badge variant="danger" className="ml-2 text-xs font-bold">
                                ⚠ Full
                              </Badge>
                            )}
                          </div>
                        </div>
                        {job.applicationDeadline && (
                          <div className="mt-2 pt-2 border-t border-blue-200">
                            <span className="text-xs text-gray-600 font-medium">Deadline: </span>
                            <span className="text-xs text-gray-800 font-bold">
                              {new Date(job.applicationDeadline).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t-2 border-gray-200">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditJob(job)}
                        className="flex-1 border-2 border-[#003366] text-[#003366] hover:bg-[#003366] hover:text-[#003366] hover:[&_*]:text-[#003366] active:bg-[#00509E] active:text-[#003366] active:[&_*]:text-[#003366] focus:text-[#003366] focus:[&_*]:text-[#003366] font-bold py-2.5 transition-all duration-200"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteJob(job._id || job.id)}
                        className="flex-1 border-2 border-red-500 text-red-600 hover:bg-red-500 hover:text-white font-bold py-2.5 transition-all duration-200"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ) : (
                // LIST VIEW - Matching ReportsTab Design
                <div key={job._id || job.id} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300">
                  <div className="p-6">
                    <div className="flex items-start space-x-6">
                      {/* Large Avatar Icon */}
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#003366] to-[#00509E] flex items-center justify-center">
                          <Briefcase className="w-8 h-8 text-white" />
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="flex-1 min-w-0">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="text-xl font-bold text-gray-900 mb-1">
                              {job.jobTitle || job.title}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {job.companyName || 'Your Company'}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={new Date(job.applicationDeadline) > new Date() ? 'success' : 'secondary'}
                              className="px-3 py-1"
                            >
                              {new Date(job.applicationDeadline) > new Date() ? '✓ Active' : 'Expired'}
                            </Badge>
                            {job.isUrgent && (
                              <Badge variant="warning" className="px-3 py-1">
                                ⚡ Urgent
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Info Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
                          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
                            <div className="flex items-center space-x-2 mb-1">
                              <MapPin className="w-4 h-4 text-[#003366]" />
                              <p className="text-xs font-medium text-gray-600 uppercase">Location</p>
                            </div>
                            <p className="text-base font-bold text-[#003366]">
                              {job.location}
                            </p>
                          </div>
                          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
                            <div className="flex items-center space-x-2 mb-1">
                              <Clock className="w-4 h-4 text-[#003366]" />
                              <p className="text-xs font-medium text-gray-600 uppercase">Work Type</p>
                            </div>
                            <p className="text-base font-bold text-[#003366]">
                              {job.workType || job.type}
                            </p>
                          </div>
                          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
                            <div className="flex items-center space-x-2 mb-1">
                              <Calendar className="w-4 h-4 text-[#003366]" />
                              <p className="text-xs font-medium text-gray-600 uppercase">Duration</p>
                            </div>
                            <p className="text-base font-bold text-[#003366]">
                              {job.duration || 'Flexible'}
                            </p>
                          </div>
                          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
                            <div className="flex items-center space-x-2 mb-1">
                              <Users className="w-4 h-4 text-[#003366]" />
                              <p className="text-xs font-medium text-gray-600 uppercase">Applications</p>
                            </div>
                            <p className="text-base font-bold text-[#003366]">
                              {job.applicationsCount || 0}/{job.applicationLimit || 50}
                            </p>
                          </div>
                        </div>

                        {/* Description Preview */}
                        {job.jobDescription && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                            <h5 className="text-xs font-semibold text-gray-700 mb-2 uppercase">Description</h5>
                            <p className="text-sm text-gray-700 line-clamp-2">
                              {job.jobDescription}
                            </p>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => handleEditJob(job)}
                            className="flex-1 bg-[#003366] hover:bg-[#004080] text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Job
                          </button>
                          <button
                            onClick={() => handleDeleteJob(job._id || job.id)}
                            className="bg-red-500 hover:bg-red-600 text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            ))}
          </div>
        )}
      </div>

        {/* Job Form Modal */}
        <Modal
          isOpen={showJobModal}
          onClose={() => setShowJobModal(false)}
          title={selectedJob ? 'Edit Job' : 'Post New Job'}
          size="lg"
        >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Job Title"
              required
              value={formData.jobTitle}
              onChange={(e) => setFormData({...formData, jobTitle: e.target.value})}
            />
            <Input
              label="Location"
              required
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Work Type"
              required
              options={workTypeOptions}
              value={formData.workType}
              onChange={(e) => setFormData({...formData, workType: e.target.value})}
            />
            <Input
              label="Duration"
              required
              placeholder="e.g., 3 months"
              value={formData.duration}
              onChange={(e) => setFormData({...formData, duration: e.target.value})}
            />
            <Input
              label="Salary"
              placeholder="e.g., Unpaid or Rs 50,000/month"
              value={formData.salary}
              onChange={(e) => setFormData({...formData, salary: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({...formData, startDate: e.target.value})}
            />
            <Input
              label="End Date"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({...formData, endDate: e.target.value})}
            />
            <Input
              label="Application Deadline *"
              type="date"
              required
              value={formData.applicationDeadline}
              onChange={(e) => setFormData({...formData, applicationDeadline: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job Description *
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows="4"
              required
              value={formData.jobDescription}
              onChange={(e) => setFormData({...formData, jobDescription: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Requirements (comma-separated)
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows="3"
              placeholder="e.g., Bachelor's degree, Knowledge of React, 2+ years experience"
              value={formData.requirements}
              onChange={(e) => setFormData({...formData, requirements: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Technology Stack (comma-separated)
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows="2"
              placeholder="e.g., React, Node.js, MongoDB, JavaScript"
              value={formData.technologyStack}
              onChange={(e) => setFormData({...formData, technologyStack: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Application Limit *
              </label>
              <Input
                type="number"
                min="1"
                required
                placeholder="Maximum number of students allowed to apply"
                value={formData.applicationLimit}
                onChange={(e) => setFormData({...formData, applicationLimit: e.target.value})}
              />
              <p className="text-xs text-gray-500 mt-1">
                Once this limit is reached, the job will be automatically closed and hidden from students. You can reopen it later by increasing the limit.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags (comma-separated)
              </label>
              <Input
                placeholder="e.g., frontend, backend, fullstack"
                value={formData.tags}
                onChange={(e) => setFormData({...formData, tags: e.target.value})}
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isUrgent"
              checked={formData.isUrgent}
              onChange={(e) => setFormData({...formData, isUrgent: e.target.checked})}
              className="mr-2"
            />
            <label htmlFor="isUrgent" className="text-sm font-medium text-gray-700">
              Mark as urgent
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowJobModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitJob}
              disabled={submitting}
              className="flex-1"
            >
              {submitting ? 'Saving...' : (selectedJob ? 'Update Job' : 'Post Job')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

JobsTab.propTypes = {
  onJobChange: PropTypes.func
};

export default JobsTab;
