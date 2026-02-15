import React, { useState, useEffect } from 'react';
import { FileText, Eye, CheckCircle, Download, Calendar, User, Building, Clock, Building2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Card from '../../../ui/Card';
import Button from '../../../ui/Button';
import Badge from '../../../ui/Badge';
import Modal from '../../../ui/Modal';
import { joiningReportAPI, weeklyReportAPI } from '../../../services/api';

const ReportsTab = () => {
  const [joiningReports, setJoiningReports] = useState([]);
  const [weeklyReports, setWeeklyReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedWeeklyReport, setSelectedWeeklyReport] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showWeeklyViewModal, setShowWeeklyViewModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [weeklyLoading, setWeeklyLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('joining'); // 'joining' or 'weekly'

  useEffect(() => {
    fetchJoiningReports();
    fetchWeeklyReports();
  }, []);

  const fetchJoiningReports = async () => {
    try {
      const response = await joiningReportAPI.getSupervisorJoiningReports();
      
      if (response.success) {
        setJoiningReports(response.data);
      }
    } catch (error) {
      console.error('Error fetching joining reports:', error);
      toast.error('Failed to fetch joining reports');
    } finally {
      setLoading(false);
    }
  };

  const fetchWeeklyReports = async () => {
    try {
      setWeeklyLoading(true);
      const response = await weeklyReportAPI.getSupervisorReports();
      if (response.success) {
        setWeeklyReports(response.data.reports || []);
      }
    } catch (error) {
      console.error('Error fetching weekly reports:', error);
      toast.error('Failed to fetch weekly reports');
    } finally {
      setWeeklyLoading(false);
    }
  };

  const handleViewReport = async (reportId) => {
    try {
      const response = await joiningReportAPI.getJoiningReportById(reportId);
      
      if (response.success) {
        setSelectedReport(response.data);
        setShowViewModal(true);
      }
    } catch (error) {
      console.error('Error fetching report details:', error);
      toast.error('Failed to fetch report details');
    }
  };

  const handleVerifyReport = async (reportId) => {
    try {
      const response = await joiningReportAPI.verifyJoiningReport(reportId);
      
      if (response.success) {
        toast.success('Report verified successfully');
        fetchJoiningReports();
      }
    } catch (error) {
      console.error('Error verifying report:', error);
      toast.error('Failed to verify report');
    }
  };

  const handleDownloadPDF = async (reportId) => {
    try {
      await joiningReportAPI.downloadJoiningReportPDF(reportId);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download PDF');
    }
  };

  const handleViewWeeklyReport = async (report) => {
    try {
      setSelectedWeeklyReport(report);
      setShowWeeklyViewModal(true);
    } catch (error) {
      console.error('Error viewing weekly report:', error);
      toast.error('Failed to view weekly report');
    }
  };

  const handleDownloadWeeklyPDF = async (reportId) => {
    try {
      await weeklyReportAPI.downloadReportPDF(reportId);
      toast.success('Weekly report downloaded successfully');
    } catch (error) {
      console.error('Error downloading weekly report:', error);
      toast.error('Failed to download weekly report');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Student Reports</h2>
        <p className="text-gray-600">Review and manage student reports submitted to you</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('joining')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'joining'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Joining Reports ({joiningReports.length})
          </button>
          <button
            onClick={() => setActiveTab('weekly')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'weekly'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Weekly Reports ({weeklyReports.length})
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'joining' ? (
        /* Joining Reports Section */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Joining Reports
            </h3>
            <Badge variant="info">
              {joiningReports.length} Reports
            </Badge>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : joiningReports.length > 0 ? (
            joiningReports.map((report) => (
              <Card key={report._id} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">
                          {report.studentName}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Roll Number: {report.rollNumber}
                        </p>
                      </div>
                      <Badge 
                        variant={report.status === 'Verified' ? 'success' : 'warning'}
                        className="ml-auto"
                      >
                        {report.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Building className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">Company:</span>
                        <span className="font-medium">{report.companyName}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">Submitted:</span>
                        <span className="font-medium">
                          {new Date(report.reportDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {report.studentThoughts ? `"${report.studentThoughts.substring(0, 100)}..."` : 'No student thoughts provided'}
                      </p>
                    </div>
                  </div>

                  <div className="ml-6 space-y-2">
                    <Button
                      className="border-2 border-[#003366] text-[#003366] hover:bg-[#003366] hover:text-white font-medium py-2 px-3 rounded-lg transition-all duration-200"
                      size="sm"
                      onClick={() => handleViewReport(report._id)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                    
                    {report.status === 'Pending Review' && (
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => handleVerifyReport(report._id)}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Verify
                      </Button>
                    )}
                    
                    <Button
                      className="border-2 border-[#003366] text-[#003366] hover:bg-[#003366] hover:text-white font-medium py-2 px-3 rounded-lg transition-all duration-200"
                      size="sm"
                      onClick={() => handleDownloadPDF(report._id, report.studentName)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      PDF
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-12 text-center">
              <div className="text-gray-400 mb-4">
                <FileText className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Joining Reports
              </h3>
              <p className="text-gray-600">
                No students have submitted joining reports yet.
              </p>
            </Card>
          )}
        </div>
      ) : (
        /* Weekly Reports Section */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Weekly Reports
            </h3>
            <Badge variant="info">
              {weeklyReports.length} Reports
            </Badge>
          </div>

          {weeklyLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : weeklyReports.length > 0 ? (
            weeklyReports.map((report) => (
              <Card key={report._id} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <User className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">
                          {report.studentId?.name || 'Unknown Student'}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Week {report.weekNumber} Report
                        </p>
                      </div>
                      <Badge 
                        variant={report.status === 'reviewed' ? 'success' : 'warning'}
                        className="ml-auto"
                      >
                        {report.status || 'Pending'}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-blue-500" />
                        <span className="text-gray-600">Week Number:</span>
                        <Badge variant="info" size="sm">
                          Week {report.weekNumber}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">Submitted:</span>
                        <span className="font-medium">
                          {new Date(report.submittedAt).toLocaleDateString()}
                        </span>
                      </div>
                      {report.companyName && (
                        <div className="flex items-center space-x-2 md:col-span-2">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">Company:</span>
                          <span className="font-medium">{report.companyName}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {report.weeklyProgress ? `"${report.weeklyProgress.substring(0, 100)}..."` : 'No progress details provided'}
                      </p>
                    </div>
                  </div>

                  <div className="ml-6 space-y-2">
                    <Button
                      className="border-2 border-[#003366] text-[#003366] hover:bg-[#003366] hover:text-white font-medium py-2 px-3 rounded-lg transition-all duration-200"
                      size="sm"
                      onClick={() => handleViewWeeklyReport(report)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                    
                    <Button
                      className="border-2 border-[#003366] text-[#003366] hover:bg-[#003366] hover:text-white font-medium py-2 px-3 rounded-lg transition-all duration-200"
                      size="sm"
                      onClick={() => handleDownloadWeeklyPDF(report._id)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      PDF
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-12 text-center">
              <div className="text-gray-400 mb-4">
                <Clock className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Weekly Reports
              </h3>
              <p className="text-gray-600">
                No students have submitted weekly reports yet.
              </p>
            </Card>
          )}
        </div>
      )}

      {/* Joining Report View Modal */}
      <Modal 
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Joining Report Details"
        size="lg"
      >
        {selectedReport && (
          <div className="space-y-6">
            {/* Student Information */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-3">Student Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-700 font-medium">Student:</span> {selectedReport.studentName}
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Roll Number:</span> {selectedReport.rollNumber}
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Submitted:</span> {new Date(selectedReport.reportDate).toLocaleDateString()}
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Company:</span> {selectedReport.companyName || 'N/A'}
                </div>
              </div>
            </div>

            {/* Student Thoughts */}
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-900 mb-3">Student Thoughts</h4>
              <p className="text-green-900">{selectedReport.studentThoughts}</p>
            </div>

            {/* Acknowledgment */}
            {selectedReport.acknowledgment && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3">Acknowledgment</h4>
                <p className="text-gray-900">{selectedReport.acknowledgment}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Weekly Report View Modal - Redesigned with COMSATS Theme */}
      {showWeeklyViewModal && selectedWeeklyReport && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header with COMSATS Gradient */}
            <div className="sticky top-0 z-10 bg-gradient-to-r from-[#003366] to-[#00509E] px-6 py-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Weekly Report Details</h3>
                    <p className="text-sm text-blue-100">Week {selectedWeeklyReport.weekNumber} - {selectedWeeklyReport.studentId?.name || 'Unknown Student'}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowWeeklyViewModal(false)}
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
              {/* Student Information Card */}
              <div className="bg-gradient-to-br from-blue-50 to-slate-50 border border-[#00509E]/20 rounded-xl p-5 shadow-sm">
                <div className="flex items-center space-x-2 mb-4">
                  <User className="w-5 h-5 text-[#00509E]" />
                  <h4 className="font-semibold text-[#003366] text-lg">Student Information</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-[#00509E] rounded-full"></div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Student Name</p>
                      <p className="font-semibold text-gray-900">{selectedWeeklyReport.studentId?.name || 'Unknown'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-[#00509E] rounded-full"></div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Week Number</p>
                      <Badge variant="info" className="mt-1">Week {selectedWeeklyReport.weekNumber}</Badge>
                    </div>
                  </div>
                  {selectedWeeklyReport.companyName && (
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-[#00509E] rounded-full"></div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Company</p>
                        <p className="font-semibold text-gray-900">{selectedWeeklyReport.companyName}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-[#00509E] rounded-full"></div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Submitted On</p>
                      <p className="font-semibold text-gray-900">{new Date(selectedWeeklyReport.submittedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 md:col-span-2">
                    <div className="w-2 h-2 bg-[#00509E] rounded-full"></div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Status</p>
                      <Badge variant={selectedWeeklyReport.status === 'reviewed' ? 'success' : 'warning'} className="mt-1">
                        {selectedWeeklyReport.status || 'Pending Review'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tasks Completed / Weekly Progress */}
              {(selectedWeeklyReport.tasksCompleted || selectedWeeklyReport.weeklyProgress) && (
                <div className="border border-[#00509E]/20 rounded-xl p-5 bg-white shadow-sm">
                  <div className="flex items-center space-x-2 mb-3">
                    <CheckCircle className="w-5 h-5 text-[#00509E]" />
                    <h4 className="font-semibold text-[#003366] text-lg">Tasks Completed</h4>
                  </div>
                  <div className="bg-blue-50/50 rounded-lg p-4 border border-blue-100">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {selectedWeeklyReport.tasksCompleted || selectedWeeklyReport.weeklyProgress || 'No tasks reported'}
                    </p>
                  </div>
                </div>
              )}

              {/* Reflections */}
              {selectedWeeklyReport.reflections && (
                <div className="border border-[#00509E]/20 rounded-xl p-5 bg-white shadow-sm">
                  <div className="flex items-center space-x-2 mb-3">
                    <FileText className="w-5 h-5 text-[#00509E]" />
                    <h4 className="font-semibold text-[#003366] text-lg">Reflections & Learning</h4>
                  </div>
                  <div className="bg-blue-50/50 rounded-lg p-4 border border-blue-100">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {selectedWeeklyReport.reflections}
                    </p>
                  </div>
                </div>
              )}

              {/* Challenges Faced */}
              {selectedWeeklyReport.challengesFaced && (
                <div className="border border-amber-200 rounded-xl p-5 bg-white shadow-sm">
                  <div className="flex items-center space-x-2 mb-3">
                    <Clock className="w-5 h-5 text-amber-600" />
                    <h4 className="font-semibold text-amber-900 text-lg">Challenges Faced</h4>
                  </div>
                  <div className="bg-amber-50/50 rounded-lg p-4 border border-amber-100">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {selectedWeeklyReport.challengesFaced}
                    </p>
                  </div>
                </div>
              )}

              {/* Supporting Materials / Additional Comments */}
              {selectedWeeklyReport.supportingMaterials && (
                <div className="border border-[#00509E]/20 rounded-xl p-5 bg-white shadow-sm">
                  <div className="flex items-center space-x-2 mb-3">
                    <Building className="w-5 h-5 text-[#00509E]" />
                    <h4 className="font-semibold text-[#003366] text-lg">Additional Comments</h4>
                  </div>
                  <div className="bg-blue-50/50 rounded-lg p-4 border border-blue-100">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {selectedWeeklyReport.supportingMaterials}
                    </p>
                  </div>
                </div>
              )}

              {/* Supervisor Feedback */}
              {selectedWeeklyReport.supervisorFeedback?.feedback && (
                <div className="border border-green-200 rounded-xl p-5 bg-gradient-to-br from-green-50 to-emerald-50 shadow-sm">
                  <div className="flex items-center space-x-2 mb-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <h4 className="font-semibold text-green-900 text-lg">Supervisor Feedback</h4>
                  </div>
                  <div className="bg-white/70 rounded-lg p-4 border border-green-200">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {selectedWeeklyReport.supervisorFeedback.feedback}
                    </p>
                    {selectedWeeklyReport.supervisorFeedback.rating && (
                      <div className="mt-3 flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-600">Rating:</span>
                        <Badge variant="success">{selectedWeeklyReport.supervisorFeedback.rating}/5</Badge>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gradient-to-r from-blue-50 to-slate-50 px-6 py-4 border-t border-gray-200 rounded-b-2xl flex justify-between items-center">
              <div className="text-sm text-gray-600">
                <span className="font-medium">Report ID:</span> {selectedWeeklyReport._id?.slice(-8).toUpperCase()}
              </div>
              <div className="flex space-x-3">
                <Button
                  className="border-2 border-[#003366] text-[#003366] hover:bg-[#003366] hover:text-white font-medium py-2 px-4 rounded-lg transition-all duration-200"
                  onClick={() => setShowWeeklyViewModal(false)}
                >
                  Close
                </Button>
                <Button
                  onClick={() => handleDownloadWeeklyPDF(selectedWeeklyReport._id)}
                  className="bg-gradient-to-r from-[#003366] to-[#00509E] hover:from-[#00509E] hover:to-[#003366] text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsTab;
