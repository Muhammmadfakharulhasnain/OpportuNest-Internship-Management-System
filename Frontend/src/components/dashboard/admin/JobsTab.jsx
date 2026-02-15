import React, { useState } from 'react';
import { Eye, Trash2, CheckCircle, XCircle, AlertTriangle, ExternalLink } from 'lucide-react';
import { mockJobs } from '../../../data/mockData';
import { toast } from 'react-hot-toast';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import Badge from '../../ui/Badge';
import Modal from '../../ui/Modal';

const JobsTab = () => {
  const [jobs, setJobs] = useState(mockJobs);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showJobModal, setShowJobModal] = useState(false);

  const handleDeleteJob = (jobId) => {
    setJobs(jobs.filter(job => job.id !== jobId));
    toast.success('Job deleted successfully!');
  };

  const handleViewDetails = (job) => {
    setSelectedJob(job);
    setShowJobModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'default';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Job Management</h2>
        <div className="flex space-x-2">
          <Badge variant="success">Active: {jobs.filter(j => j.status === 'active').length}</Badge>
          <Badge variant="warning">Pending: {jobs.filter(j => j.status === 'pending').length}</Badge>
        </div>
      </div>

      {/* Jobs List */}
      <div className="space-y-4">
        {jobs.map((job) => (
          <Card key={job.id} className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {job.title}
                  </h3>
                  <Badge variant={getStatusColor(job.status)}>
                    {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                  </Badge>
                </div>
                
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Company: {job.company}</p>
                  <p>Location: <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.location)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-1"
                  >
                    {job.location}
                    <ExternalLink className="w-3 h-3" />
                  </a> • Type: {job.type}</p>
                  <p>Duration: {job.duration} • Salary: {job.salary}</p>
                  <p>Applications: {job.applications} • Posted: {new Date(job.postedAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewDetails(job)}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDeleteJob(job.id)}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Job Details Modal */}
      <Modal
        isOpen={showJobModal}
        onClose={() => setShowJobModal(false)}
        title="Job Details"
        size="lg"
      >
        {selectedJob && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedJob.title}
                </h2>
                <p className="text-gray-600">{selectedJob.company}</p>
              </div>
              <Badge variant={getStatusColor(selectedJob.status)} size="md">
                {selectedJob.status.charAt(0).toUpperCase() + selectedJob.status.slice(1)}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Location</p>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedJob.location)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
                >
                  {selectedJob.location}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Work Type</p>
                <p className="text-gray-900">{selectedJob.type}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Duration</p>
                <p className="text-gray-900">{selectedJob.duration}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Salary</p>
                <p className="text-gray-900">{selectedJob.salary}</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Job Description</h3>
              <p className="text-gray-600">{selectedJob.description}</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Requirements</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                {selectedJob.requirements.map((req, index) => (
                  <li key={index}>{req}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Technology Stack</h3>
              <div className="flex flex-wrap gap-2">
                {selectedJob.techStack.map((tech) => (
                  <Badge key={tech} variant="default">
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-gray-700">Applications Received</p>
                  <p className="text-2xl font-bold text-blue-600">{selectedJob.applications}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Posted Date</p>
                  <p className="text-gray-900">{new Date(selectedJob.postedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default JobsTab;