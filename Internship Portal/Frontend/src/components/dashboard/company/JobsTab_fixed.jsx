import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Plus, Edit, Trash2, Eye, MapPin, Calendar, Users, Briefcase, ExternalLink } from 'lucide-react';
import { jobAPI } from '../../../services/api';
import Button from '../../../ui/Button';
import Card from '../../../ui/Card';
import Badge from '../../../ui/Badge';
import Modal from '../../../ui/Modal';
import Input from '../../../ui/Input';
import Select from '../../../ui/Select';
import LoadingSpinner from '../../../ui/LoadingSpinner';

const JobsTab = ({ onJobChange }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showJobModal, setShowJobModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [submitting, setSubmitting] = useState(false);
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
    isUrgent: false,
    tags: ''
  });

  // Fetch jobs on component mount
  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await jobAPI.getCompanyJobs();
      setJobs(response.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError(err.message);
      // Fallback to empty array
      setJobs([]);
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-8">
        <Card className="p-12 text-center border-2 border-gray-100">
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-4 rounded-full">
              <LoadingSpinner className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Loading Jobs</h3>
              <p className="text-gray-600">Fetching your job postings...</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Briefcase className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Job Postings</h2>
              <p className="text-gray-600">Manage your internship opportunities</p>
              {error && (
                <p className="text-sm text-red-600 mt-1">
                  {error} - Showing offline data
                </p>
              )}
            </div>
          </div>
          <Button
            onClick={handleCreateJob}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            Post New Job
          </Button>
        </div>
      </div>

      {/* Jobs Grid */}
      {jobs.length === 0 ? (
        <Card className="p-8 text-center hover:shadow-lg transition-all duration-300 border-2 border-gray-100">
          <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <Briefcase className="w-10 h-10 text-gray-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No jobs posted yet</h3>
          <p className="text-gray-600 mb-6 text-lg">Start by posting your first internship opportunity</p>
          <Button
            onClick={handleCreateJob}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="w-5 h-5 mr-2" />
            Post Your First Job
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6">
          {jobs.map((job) => (
            <Card key={job._id || job.id} className="p-4 sm:p-6 hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-200 bg-white group h-full">
              <div className="flex flex-col h-full">
                <div className="flex-1">
                  <div className="flex items-start space-x-3 mb-4">
                    <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-2 sm:p-3 rounded-xl shadow-sm flex-shrink-0">
                      <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors duration-200 line-clamp-2 leading-tight">
                        {job.jobTitle || job.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={(job.workType || job.type) === 'Remote' ? 'success' : 'primary'} className="font-semibold text-xs sm:text-sm">
                          {job.workType || job.type}
                        </Badge>
                        <Badge variant={job.status === 'Active' || job.status === 'active' ? 'success' : 'default'} className="font-semibold text-xs sm:text-sm">
                          {job.status}
                        </Badge>
                        {job.isUrgent && (
                          <Badge variant="danger" size="sm" className="font-semibold animate-pulse text-xs sm:text-sm">
                            Urgent
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                      <div className="flex items-center bg-gray-50 px-2 sm:px-3 py-1 rounded-lg flex-shrink-0">
                        <MapPin className="w-4 h-4 mr-1 sm:mr-2 text-gray-400 flex-shrink-0" />
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.location)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 hover:underline font-medium truncate max-w-[120px] sm:max-w-none"
                        >
                          {job.location}
                          <ExternalLink className="w-3 h-3 ml-1 flex-shrink-0" />
                        </a>
                      </div>
                      <div className="flex items-center bg-gray-50 px-2 sm:px-3 py-1 rounded-lg flex-shrink-0">
                        <Calendar className="w-4 h-4 mr-1 sm:mr-2 text-gray-400 flex-shrink-0" />
                        <span className="font-medium truncate">{job.duration}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 bg-gray-50 p-3 rounded-lg">
                    {job.jobDescription || job.description}
                  </p>

                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    {(job.technologyStack || job.techStack || []).slice(0, 3).map((tech, index) => (
                      <Badge key={index} variant="default" size="sm" className="bg-blue-50 text-blue-700 border-blue-200 font-medium text-xs">
                        {tech}
                      </Badge>
                    ))}
                    {(job.technologyStack || job.techStack || []).length > 3 && (
                      <Badge variant="default" size="sm" className="bg-gray-100 text-gray-600 border-gray-300 text-xs">
                        +{(job.technologyStack || job.techStack).length - 3}
                      </Badge>
                    )}
                  </div>

                  <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-3 sm:p-4 rounded-lg border border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-6">
                      <div className="flex items-center space-x-4 sm:space-x-6 text-sm">
                        <div className="flex items-center text-green-600">
                          <span className="font-bold text-base sm:text-lg">{job.salary}</span>
                        </div>
                        <div className="flex items-center text-gray-500">
                          <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-gray-400" />
                          <span className="font-medium text-xs sm:text-sm">{job.applicationsCount || job.applications || 0} applications</span>
                        </div>
                        <div className="flex items-center text-gray-400">
                          <Eye className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                          <span className="font-medium text-xs sm:text-sm">{job.viewsCount || 0} views</span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditJob(job)}
                          className="font-semibold border-2 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 text-sm"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteJob(job._id || job.id)}
                          className="font-semibold hover:shadow-lg transition-all duration-200 text-sm"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

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
              placeholder="e.g., Unpaid or $500/month"
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
