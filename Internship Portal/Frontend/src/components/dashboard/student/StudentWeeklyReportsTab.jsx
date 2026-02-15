import { useState, useEffect } from 'react';
import {
  FileText,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  User,
  Send,
  Eye
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Card from '../../../ui/Card';
import Button from '../../../ui/Button';
import Modal from '../../../ui/Modal';
import { weeklyReportAPI } from '../../../services/api';
import WeeklyReport from './WeeklyReport';

const StudentWeeklyReportsTab = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [supervisor, setSupervisor] = useState(null);

  // Form state
  const [submitForm, setSubmitForm] = useState({
    tasksCompleted: '',
    challengesFaced: '',
    reflections: '',
    supportingMaterials: ''
  });

  // Load pending events on component mount
  useEffect(() => {
    loadPendingEvents();
  }, []);

  const loadPendingEvents = async () => {
    try {
      setLoading(true);
      const response = await weeklyReportAPI.getStudentPendingEvents();
      setEvents(response.data.events || []);
      setSupervisor(response.data.supervisor || null);
    } catch (error) {
      console.error('Error loading pending events:', error);
      toast.error('Failed to load weekly report events');
    } finally {
      setLoading(false);
    }
  };

  // Submit weekly report
  const handleSubmitReport = async (e) => {
    e.preventDefault();
    
    if (!submitForm.tasksCompleted.trim()) {
      toast.error('Tasks completed field is required');
      return;
    }

    try {
      await weeklyReportAPI.submitReport(selectedEvent._id, {
        tasksCompleted: submitForm.tasksCompleted,
        challengesFaced: submitForm.challengesFaced,
        reflections: submitForm.reflections,
        supportingMaterials: submitForm.supportingMaterials
      });

      toast.success('Weekly report submitted successfully');
      setShowSubmitModal(false);
      setSelectedEvent(null);
      setSubmitForm({
        tasksCompleted: '',
        challengesFaced: '',
        reflections: '',
        supportingMaterials: ''
      });
      loadPendingEvents();
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error(error.response?.data?.message || 'Failed to submit report');
    }
  };

  // Open submit modal
  const openSubmitModal = (event) => {
    setSelectedEvent(event);
    setSubmitForm({
      tasksCompleted: '',
      challengesFaced: '',
      reflections: '',
      supportingMaterials: ''
    });
    setShowSubmitModal(true);
  };

  // View submitted report
  const viewReport = async () => {
    try {
      // Find the report ID - this would typically come from the event data
      // For now, we'll simulate this or you might need to add report ID to the event data
      toast.info('Report viewing functionality will be available soon');
    } catch (error) {
      console.error('Error viewing report:', error);
      toast.error('Failed to load report details');
    }
  };

  const getStatusColor = (event) => {
    if (event.isSubmitted) {
      return event.submissionStatus === 'reviewed' ? 'text-green-600' : 'text-blue-600';
    }
    if (event.isOverdue) {
      return 'text-red-600';
    }
    return 'text-yellow-600';
  };

  const getStatusBg = (event) => {
    if (event.isSubmitted) {
      return event.submissionStatus === 'reviewed' ? 'bg-green-100' : 'bg-blue-100';
    }
    if (event.isOverdue) {
      return 'bg-red-100';
    }
    return 'bg-yellow-100';
  };

  const getStatusText = (event) => {
    if (event.isSubmitted) {
      return event.submissionStatus === 'reviewed' ? 'Reviewed' : 'Submitted';
    }
    if (event.isOverdue) {
      return 'Overdue';
    }
    return 'Pending';
  };

  const getStatusIcon = (event) => {
    if (event.isSubmitted) {
      return event.submissionStatus === 'reviewed' ? 
        <CheckCircle className="w-5 h-5 text-green-600" /> : 
        <FileText className="w-5 h-5 text-blue-600" />;
    }
    if (event.isOverdue) {
      return <AlertTriangle className="w-5 h-5 text-red-600" />;
    }
    return <Clock className="w-5 h-5 text-yellow-600" />;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Weekly Reports</h2>
          <p className="text-gray-600">Submit and track your weekly internship reports</p>
        </div>
        {supervisor && (
          <Card className="p-3">
            <div className="flex items-center space-x-2 text-sm">
              <User className="w-4 h-4 text-gray-600" />
              <span className="text-gray-600">Supervisor:</span>
              <span className="font-medium text-gray-900">{supervisor.name}</span>
            </div>
          </Card>
        )}
      </div>

      {/* Simple Weekly Report Form */}
      <WeeklyReport />

      {/* No Supervisor Message */}
      {!supervisor && events.length === 0 && (
        <Card className="p-8 text-center">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Supervisor Assigned</h3>
          <p className="text-gray-600">
            You need to have an assigned supervisor to receive weekly report assignments.
          </p>
        </Card>
      )}

      {/* Summary Cards */}
      {events.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Reports</p>
                <p className="text-xl font-semibold text-gray-900">
                  {events.length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Submitted</p>
                <p className="text-xl font-semibold text-gray-900">
                  {events.filter(event => event.isSubmitted).length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-yellow-100 p-2 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-xl font-semibold text-gray-900">
                  {events.filter(event => !event.isSubmitted && !event.isOverdue).length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-red-100 p-2 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Overdue</p>
                <p className="text-xl font-semibold text-gray-900">
                  {events.filter(event => event.isOverdue).length}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Reports List */}
      <div className="space-y-4">
        {events.length === 0 && supervisor ? (
          <Card className="p-8 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Report Assignments</h3>
            <p className="text-gray-600">
              Your supervisor hasn&apos;t assigned any weekly report requirements yet.
            </p>
          </Card>
        ) : (
          events.map((event) => (
            <Card key={event._id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className={`p-2 rounded-lg ${getStatusBg(event)}`}>
                    {getStatusIcon(event)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{event.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBg(event)} ${getStatusColor(event)}`}>
                        {getStatusText(event)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>Week {event.weekNumber}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>Due: {new Date(event.dueDate).toLocaleDateString()}</span>
                      </div>
                      {event.isSubmitted && event.submittedAt && (
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4" />
                          <span>Submitted: {new Date(event.submittedAt).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                    
                    {event.instructions && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Instructions:</span> {event.instructions}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col space-y-2">
                  {event.canSubmit && (
                    <Button
                      onClick={() => openSubmitModal(event)}
                      className="flex items-center space-x-2"
                      size="sm"
                    >
                      <Send className="w-4 h-4" />
                      <span>Submit Report</span>
                    </Button>
                  )}
                  
                  {event.isSubmitted && (
                    <Button
                      variant="outline"
                      onClick={() => viewReport()}
                      className="flex items-center space-x-2"
                      size="sm"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View Report</span>
                    </Button>
                  )}
                  
                  {event.isOverdue && !event.isSubmitted && (
                    <div className="text-xs text-red-600 text-center">
                      Submission Closed
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Submit Report Modal */}
      <Modal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        title={`Submit Weekly Report - Week ${selectedEvent?.weekNumber}`}
        maxWidth="lg"
      >
        {selectedEvent && (
          <form onSubmit={handleSubmitReport} className="space-y-6">
            {/* Event Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Report:</span> {selectedEvent.title}
                </div>
                <div>
                  <span className="font-medium text-gray-700">Due Date:</span> {new Date(selectedEvent.dueDate).toLocaleDateString()}
                </div>
                {selectedEvent.instructions && (
                  <div className="col-span-2">
                    <span className="font-medium text-gray-700">Instructions:</span>
                    <p className="mt-1 text-gray-600">{selectedEvent.instructions}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tasks Completed *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe the tasks you completed this week..."
                  value={submitForm.tasksCompleted}
                  onChange={(e) => setSubmitForm(prev => ({ ...prev, tasksCompleted: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Challenges Faced (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe any challenges or difficulties you encountered..."
                  value={submitForm.challengesFaced}
                  onChange={(e) => setSubmitForm(prev => ({ ...prev, challengesFaced: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reflections / Learnings (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Share your reflections and key learnings from this week..."
                  value={submitForm.reflections}
                  onChange={(e) => setSubmitForm(prev => ({ ...prev, reflections: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supporting Materials (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Links to code repositories, documents, or other supporting materials..."
                  value={submitForm.supportingMaterials}
                  onChange={(e) => setSubmitForm(prev => ({ ...prev, supportingMaterials: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowSubmitModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                Submit Report
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default StudentWeeklyReportsTab;
