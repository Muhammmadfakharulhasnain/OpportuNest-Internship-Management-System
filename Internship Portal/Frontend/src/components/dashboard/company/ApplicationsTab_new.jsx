import { useState, useEffect } from 'react';
import { 
  Eye, 
  CheckCircle, 
  XCircle, 
  Calendar,
  Video,
  MapPin,
  Users,
  FileText
} from 'lucide-react';
import { applicationAPI, supervisorReportAPI } from '../../../services/api';
import { toast } from 'react-hot-toast';
import Card from '../../../ui/Card';
import Button from '../../../ui/Button';
import Badge from '../../../ui/Badge';
import Modal from '../../../ui/Modal';
import Input from '../../../ui/Input';
import Select from '../../../ui/Select';

const ApplicationsTab = () => {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  // Interview form data
  const [interviewData, setInterviewData] = useState({
    type: 'remote',
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
  const handleStatusUpdate = async (applicationId, newStatus) => {
    try {
      setActionLoading(applicationId);
      
      const response = await applicationAPI.updateApplicationStatus(applicationId, newStatus);
      
      if (response.success) {
        await fetchApplications();
        toast.success(`Application status updated to ${newStatus}`);
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

  // Schedule interview
  const handleScheduleInterview = async () => {
    try {
      setActionLoading(selectedApplication._id);
      
      const response = await applicationAPI.updateInterviewDetails(selectedApplication._id, interviewData);
      
      if (response.success) {
        await fetchApplications();
        setShowInterviewModal(false);
        toast.success('Interview scheduled successfully');
      } else {
        toast.error(response.message || 'Failed to schedule interview');
      }
    } catch (error) {
      console.error('Error scheduling interview:', error);
      toast.error('Failed to schedule interview');
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

  const openInterviewModal = (application) => {
    setSelectedApplication(application);
    setShowInterviewModal(true);
  };

  const openReportModal = (application) => {
    setSelectedApplication(application);
    setShowReportModal(true);
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
      case 'interview_scheduled': return 'Interview Scheduled';
      case 'interview_done': return 'Interview Complete';
      case 'hired': return 'Hired';
      case 'rejected': return 'Rejected';
      default: return 'Pending Review';
    }
  };

  const getApplicationStats = () => {
    return {
      total: applications.length,
      pending: applications.filter(app => !app.applicationStatus || app.applicationStatus === 'pending').length,
      interview_scheduled: applications.filter(app => app.applicationStatus === 'interview_scheduled').length,
      interview_done: applications.filter(app => app.applicationStatus === 'interview_done').length,
      hired: applications.filter(app => app.applicationStatus === 'hired').length,
      rejected: applications.filter(app => app.applicationStatus === 'rejected').length
    };
  };

  const stats = getApplicationStats();

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Stats */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card className="p-4">
          <h3 className="font-semibold text-lg text-gray-900">{stats.total}</h3>
          <p className="text-sm text-gray-600">Total Applications</p>
        </Card>
        <Card className="p-4">
          <h3 className="font-semibold text-lg text-yellow-600">{stats.pending}</h3>
          <p className="text-sm text-gray-600">Pending</p>
        </Card>
        <Card className="p-4">
          <h3 className="font-semibold text-lg text-blue-600">{stats.interview_scheduled}</h3>
          <p className="text-sm text-gray-600">Interview Scheduled</p>
        </Card>
        <Card className="p-4">
          <h3 className="font-semibold text-lg text-purple-600">{stats.interview_done}</h3>
          <p className="text-sm text-gray-600">Interview Done</p>
        </Card>
        <Card className="p-4">
          <h3 className="font-semibold text-lg text-green-600">{stats.hired}</h3>
          <p className="text-sm text-gray-600">Hired</p>
        </Card>
        <Card className="p-4">
          <h3 className="font-semibold text-lg text-red-600">{stats.rejected}</h3>
          <p className="text-sm text-gray-600">Rejected</p>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg overflow-x-auto">
        {[
          { value: 'all', label: 'All Applications' },
          { value: 'pending', label: 'Pending' },
          { value: 'interview_scheduled', label: 'Interview Scheduled' },
          { value: 'interview_done', label: 'Interview Done' },
          { value: 'hired', label: 'Hired' },
          { value: 'rejected', label: 'Rejected' }
        ].map((filter) => (
          <button
            key={filter.value}
            onClick={() => setStatusFilter(filter.value)}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
              statusFilter === filter.value
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApplications.length === 0 ? (
          <Card className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No applications</h3>
            <p className="mt-1 text-sm text-gray-500">
              {statusFilter === 'all' 
                ? 'No applications have been submitted yet.' 
                : `No applications with status "${getStatusText(statusFilter)}".`}
            </p>
          </Card>
        ) : (
          filteredApplications.map((application) => (
            <Card key={application._id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-lg font-medium text-gray-900 truncate">
                        {application.studentName}
                      </p>
                      <p className="text-sm text-gray-500">{application.studentEmail}</p>
                      <p className="text-sm text-gray-500">
                        Job: {application.jobTitle}
                      </p>
                      <p className="text-sm text-gray-500">
                        Applied: {new Date(application.appliedAt).toLocaleDateString()}
                      </p>
                      {application.interviewDetails?.date && (
                        <p className="text-sm text-blue-600">
                          <Calendar className="inline w-4 h-4 mr-1" />
                          Interview: {new Date(application.interviewDetails.date).toLocaleDateString()} 
                          at {application.interviewDetails.time}
                          {application.interviewDetails.type === 'remote' && application.interviewDetails.meetingLink && (
                            <span className="ml-2">
                              <Video className="inline w-4 h-4 mr-1" />
                              Remote
                            </span>
                          )}
                          {application.interviewDetails.type === 'onsite' && application.interviewDetails.location && (
                            <span className="ml-2">
                              <MapPin className="inline w-4 h-4 mr-1" />
                              {application.interviewDetails.location}
                            </span>
                          )}
                        </p>
                      )}
                      {application.hiringDate && (
                        <p className="text-sm text-green-600">
                          Hired: {new Date(application.hiringDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Badge variant={getStatusColor(application.applicationStatus || 'pending')}>
                    {getStatusText(application.applicationStatus || 'pending')}
                  </Badge>
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(application)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View Details
                    </Button>
                    
                    {/* Action buttons based on status */}
                    {(!application.applicationStatus || application.applicationStatus === 'pending') && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => openInterviewModal(application)}
                          disabled={actionLoading === application._id}
                        >
                          <Calendar className="w-4 h-4 mr-1" />
                          Schedule Interview
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleStatusUpdate(application._id, 'rejected')}
                          disabled={actionLoading === application._id}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}
                    
                    {application.applicationStatus === 'interview_scheduled' && (
                      <Button
                        size="sm"
                        onClick={() => handleStatusUpdate(application._id, 'interview_done')}
                        disabled={actionLoading === application._id}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Mark Interview Done
                      </Button>
                    )}
                    
                    {application.applicationStatus === 'interview_done' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleStatusUpdate(application._id, 'hired')}
                          disabled={actionLoading === application._id}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Hire
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleStatusUpdate(application._id, 'rejected')}
                          disabled={actionLoading === application._id}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}
                    
                    {application.applicationStatus === 'hired' && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => openReportModal(application)}
                      >
                        <FileText className="w-4 h-4 mr-1" />
                        Send Report
                      </Button>
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-gray-900">Student Information</h3>
                <p className="text-sm text-gray-600">Name: {selectedApplication.studentName}</p>
                <p className="text-sm text-gray-600">Email: {selectedApplication.studentEmail}</p>
                <p className="text-sm text-gray-600">
                  Supervisor: {selectedApplication.supervisorName}
                </p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Application Details</h3>
                <p className="text-sm text-gray-600">Job: {selectedApplication.jobTitle}</p>
                <p className="text-sm text-gray-600">
                  Applied: {new Date(selectedApplication.appliedAt).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600">
                  Status: {getStatusText(selectedApplication.applicationStatus || 'pending')}
                </p>
              </div>
            </div>
            
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
    </div>
  );
};

export default ApplicationsTab;
