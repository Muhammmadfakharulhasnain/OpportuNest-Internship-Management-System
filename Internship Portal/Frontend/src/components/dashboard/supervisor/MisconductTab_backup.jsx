import { useState, useEffect } from 'react';
import { AlertTriangle, Eye, CheckCircle, XCircle, Calendar, User, Download, AlertOctagon, Star } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Card from '../../../ui/Card';
import Button from '../../../ui/Button';
import Badge from '../../../ui/Badge';
import SearchBar from '../../../ui/SearchBar';
import Modal from '../../../ui/Modal';
import { PDFViewer } from '@react-pdf/renderer';
import MisconductReportPDF from '../../shared/MisconductReportPDF';
import { misconductReportAPI, progressReportAPI, internshipAppraisalAPI } from '../../../services/api';

const MisconductTab = () => {
  const [misconductReports, setMisconductReports] = useState([]);
  const [progressReports, setProgressReports] = useState([]);
  const [appraisals, setAppraisals] = useState([]);
  const [activeTab, setActiveTab] = useState('misconduct');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [actionType, setActionType] = useState('');
  const [supervisorComments, setSupervisorComments] = useState('');
  const [supervisorFeedback, setSupervisorFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMisconductReports();
    fetchProgressReports();
    fetchAppraisals();
  }, []);

  const fetchMisconductReports = async () => {
    try {
      setLoading(true);
      const response = await misconductReportAPI.getSupervisorReports();
      setMisconductReports(response.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to load misconduct reports');
    } finally {
      setLoading(false);
    }
  };

  const fetchProgressReports = async () => {
    try {
      const response = await progressReportAPI.getSupervisorReports();
      setProgressReports(response.data);
    } catch (error) {
      console.error('Error fetching progress reports:', error);
      toast.error('Failed to load progress reports');
    }
  };

  const fetchAppraisals = async () => {
    try {
      const response = await internshipAppraisalAPI.getSupervisorAppraisals();
      setAppraisals(response.data || []);
    } catch (error) {
      console.error('Error fetching appraisals:', error);
      toast.error('Failed to load internship appraisals');
    }
  };

  const handleViewReport = (report) => {
    setSelectedReport(report);
    setShowReportModal(true);
  };

  const handleActionClick = (action, report) => {
    setActionType(action);
    setSelectedReport(report);
    setSupervisorComments('');
    setShowActionModal(true);
  };

  const handleConfirmAction = async () => {
    if (!supervisorComments.trim()) {
      toast.error('Supervisor comments are required');
      return;
    }

    try {
      const statusMap = {
        'resolve': 'Resolved',
        'warning': 'Warning Issued',
        'cancel': 'Internship Cancelled'
      };

      await misconductReportAPI.updateReportStatus(selectedReport._id, {
        status: statusMap[actionType],
        supervisorComments
      });
      
      setMisconductReports(misconductReports.map(report => 
        report._id === selectedReport._id 
          ? { ...report, status: statusMap[actionType], supervisorComments }
          : report
      ));
      
      toast.success(`Misconduct report ${actionType === 'resolve' ? 'resolved' : actionType === 'warning' ? 'warning issued' : 'internship cancelled'} successfully`);
      setShowActionModal(false);
      setShowReportModal(false);
    } catch (error) {
      console.error('Error updating report status:', error);
      toast.error('Failed to update report status');
    }
  };

  const getSeverityColor = (issueType) => {
    const severityMap = {
      'Behavioral Issues': 'warning',
      'Attendance Problems': 'info',
      'Performance Issues': 'danger',
      'Code of Conduct Violation': 'danger',
      'Communication Issues': 'warning',
      'Other': 'secondary'
    };
    return severityMap[issueType] || 'secondary';
  };

  const getStatusColor = (status) => {
    const statusMap = {
      'Pending': 'warning',
      'Under Review': 'info',
      'Resolved': 'success',
      'Warning Issued': 'warning',
      'Internship Cancelled': 'danger'
    };
    return statusMap[status] || 'secondary';
  };

  const handleDownloadPDF = async (report) => {
    try {
      await misconductReportAPI.downloadMisconductReportPDF(report._id);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download PDF');
    }
  };

  const handleDownloadAppraisalPDF = async (appraisalId) => {
    try {
      await internshipAppraisalAPI.downloadInternshipAppraisalPDF(appraisalId);
    } catch (error) {
      console.error('Error downloading appraisal PDF:', error);
      toast.error('Failed to download appraisal PDF');
    }
  };

  // Filter function based on search term and active tab
  const getFilteredReports = () => {
    let reports = [];
    if (activeTab === 'misconduct') {
      reports = misconductReports;
    } else if (activeTab === 'progress') {
      reports = progressReports;
    } else {
      reports = appraisals;
    }

    return reports.filter(report => {
      const searchLower = searchTerm.toLowerCase();
      return (
        report.studentName?.toLowerCase().includes(searchLower) ||
        report.companyName?.toLowerCase().includes(searchLower) ||
        (report.issueType && report.issueType.toLowerCase().includes(searchLower)) ||
        (report.status && report.status.toLowerCase().includes(searchLower))
      );
    });
  };

  const filteredReports = getFilteredReports();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Company Reports</h2>
          <p className="text-gray-600">Review reports submitted by companies about your supervised students</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('misconduct')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'misconduct'
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Misconduct Reports ({misconductReports.length})</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('progress')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'progress'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span>Progress Reports ({progressReports.length})</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('appraisals')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'appraisals'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4" />
              <span>Internship Appraisals ({appraisals.length})</span>
            </div>
          </button>
        </nav>
      </div>

      {/* Search Bar */}
      <div className="flex justify-between items-center">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder={`Search ${activeTab} reports...`}
        />
      </div>

      {/* Reports List */}
      {loading ? (
        <Card className="p-12 text-center">
          <div className="text-gray-600">Loading reports...</div>
        </Card>
      ) : filteredReports.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="text-gray-400 mb-4">
            {activeTab === 'misconduct' ? (
              <AlertTriangle className="w-12 h-12 mx-auto" />
            ) : activeTab === 'progress' ? (
              <CheckCircle className="w-12 h-12 mx-auto" />
            ) : (
              <Star className="w-12 h-12 mx-auto" />
            )}
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No {activeTab === 'appraisals' ? 'Internship Appraisals' : `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Reports`}
          </h3>
          <p className="text-gray-600">
            {searchTerm 
              ? `No ${activeTab} reports match your search criteria.`
              : `No ${activeTab} reports have been submitted by companies.`
            }
          </p>
        </Card>
      ) : (
        activeTab === 'misconduct' ? (
          // Misconduct Reports
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <Card key={report._id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-full bg-red-100">
                      <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Misconduct Report
                        </h3>
                        <Badge variant={getSeverityColor(report.issueType)}>
                          {report.issueType}
                        </Badge>
                        <Badge variant={getStatusColor(report.status)}>
                          {report.status}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-1" />
                            {report.studentName}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(report.incidentDate).toLocaleDateString()}
                          </div>
                          <div>Company: {report.companyName}</div>
                        </div>
                        <p className="text-gray-500 line-clamp-2">
                          {report.description?.substring(0, 100)}...
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewReport(report)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadPDF(report)}
                      className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      PDF
                    </Button>
                    {report.status === 'Pending' && (
                      <>
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleActionClick('resolve', report)}
                        >
                          Resolve
                        </Button>
                        <Button
                          variant="info"
                          size="sm"
                          onClick={() => handleActionClick('warning', report)}
                        >
                          Warning
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleActionClick('cancel', report)}
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : activeTab === 'progress' ? (
          // Progress Reports
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <Card key={report._id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-full bg-blue-100">
                      <CheckCircle className="w-6 h-6 text-blue-600" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Progress Report
                        </h3>
                        <Badge variant={report.qualityOfWork === 'Excellent' ? 'success' : report.qualityOfWork === 'Good' ? 'info' : 'warning'}>
                          {report.qualityOfWork}
                        </Badge>
                        <Badge variant={report.status === 'Reviewed' ? 'success' : 'warning'}>
                          {report.status}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-1" />
                            {report.studentName}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(report.createdAt).toLocaleDateString()}
                          </div>
                          <div>Company: {report.companyName}</div>
                          <div>Period: {report.reportingPeriod}</div>
                        </div>
                        <p className="text-gray-500 line-clamp-2">
                          Tasks: {report.tasksAssigned?.substring(0, 100)}...
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewReport(report)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => progressReportAPI.downloadProgressReportPDF(report._id)}
                      className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      PDF
                    </Button>
                    {report.status === 'Submitted' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          setSelectedReport(report);
                          setSupervisorFeedback('');
                          setShowFeedbackModal(true);
                        }}
                      >
                        Add Feedback
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          // Internship Appraisals
          appraisals.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="text-gray-400 mb-4">
                <Star className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Internship Appraisals</h3>
              <p className="text-gray-600">
                No internship appraisals have been submitted by companies.
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {appraisals.map((appraisal) => (
                <Card key={appraisal._id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 rounded-full bg-purple-100">
                        <Star className="w-6 h-6 text-purple-600" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Internship Appraisal
                          </h3>
                          <Badge variant={appraisal.overallPerformance === 'Excellent' ? 'success' : appraisal.overallPerformance === 'Good' ? 'info' : 'warning'}>
                            {appraisal.overallPerformance}
                          </Badge>
                          <Badge variant="info">
                            {appraisal.rating}/10
                          </Badge>
                        </div>
                        
                        <div className="text-sm text-gray-600 space-y-1">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center">
                              <User className="w-4 h-4 mr-1" />
                              {appraisal.studentName}
                            </div>
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {new Date(appraisal.submissionDate).toLocaleDateString()}
                            </div>
                            <div>Company: {appraisal.companyName}</div>
                            <div>Title: {appraisal.internshipTitle}</div>
                          </div>
                          <p className="text-gray-500 line-clamp-2">
                            {appraisal.commentsAndFeedback?.substring(0, 100)}...
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewReport(appraisal)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadAppraisalPDF(appraisal._id)}
                        className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        PDF
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )
        )
      )}

      {/* NEW IMPROVED MODAL - Report Details Modal */}
      {showReportModal && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedReport?.issueType ? "Misconduct Report Details" : selectedReport?.overallPerformance ? "Internship Appraisal Details" : "Progress Report Details"}
              </h2>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Student Information */}
              <Card className="p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Student Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Student Name</p>
                    <p className="text-sm font-medium text-gray-900">{selectedReport.studentName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Roll Number</p>
                    <p className="text-sm font-medium text-gray-900">{selectedReport.rollNumber || selectedReport.studentRollNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Company</p>
                    <p className="text-sm font-medium text-gray-900">{selectedReport.companyName || 'N/A'}</p>
                  </div>
                </div>
              </Card>

              {/* Report Information */}
              <Card className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Report Information</h3>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (selectedReport.issueType) {
                          handleDownloadPDF(selectedReport);
                        } else if (selectedReport.overallPerformance) {
                          handleDownloadAppraisalPDF(selectedReport._id);
                        } else {
                          progressReportAPI.downloadProgressReportPDF(selectedReport._id);
                        }
                      }}
                      className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download PDF
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {selectedReport.issueType && (
                    <>
                      <div>
                        <p className="text-sm text-gray-500">Issue Type</p>
                        <Badge variant={getSeverityColor(selectedReport.issueType)}>
                          {selectedReport.issueType}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <Badge variant={getStatusColor(selectedReport.status)}>
                          {selectedReport.status}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Incident Date</p>
                        <p className="text-sm font-medium text-gray-900">{new Date(selectedReport.incidentDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Reported On</p>
                        <p className="text-sm font-medium text-gray-900">{new Date(selectedReport.createdAt).toLocaleDateString()}</p>
                      </div>
                    </>
                  )}
                  
                  {selectedReport.overallPerformance && (
                    <>
                      <div>
                        <p className="text-sm text-gray-500">Overall Performance</p>
                        <Badge variant={selectedReport.overallPerformance === 'Excellent' ? 'success' : selectedReport.overallPerformance === 'Good' ? 'info' : 'warning'}>
                          {selectedReport.overallPerformance}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Rating</p>
                        <Badge variant="info">
                          {selectedReport.rating}/10
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Internship Title</p>
                        <p className="text-sm font-medium text-gray-900">{selectedReport.internshipTitle}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Duration</p>
                        <p className="text-sm font-medium text-gray-900">{selectedReport.duration}</p>
                      </div>
                    </>
                  )}
                  
                  {!selectedReport.issueType && !selectedReport.overallPerformance && (
                    <>
                      <div>
                        <p className="text-sm text-gray-500">Reporting Period</p>
                        <p className="text-sm font-medium text-gray-900">{selectedReport.reportingPeriod}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <Badge variant={selectedReport.status === 'Reviewed' ? 'success' : 'warning'}>
                          {selectedReport.status}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Quality of Work</p>
                        <Badge variant={selectedReport.qualityOfWork === 'Excellent' ? 'success' : selectedReport.qualityOfWork === 'Good' ? 'info' : 'warning'}>
                          {selectedReport.qualityOfWork}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Submitted Date</p>
                        <p className="text-sm font-medium text-gray-900">{new Date(selectedReport.createdAt).toLocaleDateString()}</p>
                      </div>
                    </>
                  )}
                </div>
              </Card>

              {/* Main Content */}
              {selectedReport.issueType && (
                <Card className="p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Incident Details</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Detailed Description</p>
                      <p className="text-sm text-gray-900 bg-red-50 p-3 rounded-md border-l-4 border-red-400">
                        {selectedReport.description}
                      </p>
                    </div>
                  </div>
                </Card>
              )}

              {selectedReport.overallPerformance && (
                <>
                  <Card className="p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Evaluation</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-2">Key Strengths</p>
                        <p className="text-sm text-gray-900 bg-green-50 p-3 rounded-md border-l-4 border-green-400">
                          {selectedReport.keyStrengths}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-2">Areas for Improvement</p>
                        <p className="text-sm text-gray-900 bg-yellow-50 p-3 rounded-md border-l-4 border-yellow-400">
                          {selectedReport.areasForImprovement}
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Feedback & Recommendation</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-2">Comments & Feedback</p>
                        <p className="text-sm text-gray-900 bg-blue-50 p-3 rounded-md border-l-4 border-blue-400">
                          {selectedReport.commentsAndFeedback}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-2">Recommendation</p>
                        <p className="text-sm text-gray-900 bg-purple-50 p-3 rounded-md border-l-4 border-purple-400">
                          {selectedReport.recommendation}
                        </p>
                      </div>
                    </div>
                  </Card>
                </>
              )}

              {!selectedReport.issueType && !selectedReport.overallPerformance && (
                <>
                  <Card className="p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Progress Details</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-2">Tasks Assigned</p>
                        <p className="text-sm text-gray-900 bg-blue-50 p-3 rounded-md">
                          {selectedReport.tasksAssigned}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-2">Progress Made</p>
                        <p className="text-sm text-gray-900 bg-green-50 p-3 rounded-md">
                          {selectedReport.progressMade}
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-2">Areas of Improvement</p>
                        <p className="text-sm text-gray-900 bg-yellow-50 p-3 rounded-md">
                          {selectedReport.areasOfImprovement}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-2">Next Goals</p>
                        <p className="text-sm text-gray-900 bg-purple-50 p-3 rounded-md">
                          {selectedReport.nextGoals}
                        </p>
                      </div>
                    </div>
                  </Card>
                </>
              )}

              {/* Supervisor Feedback */}
              {(selectedReport.supervisorComments || selectedReport.supervisorFeedback) && (
                <Card className="p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Supervisor Decision/Feedback</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-2">
                        {selectedReport.supervisorComments ? 'Supervisor Decision' : 'Supervisor Feedback'}
                      </p>
                      <p className="text-sm text-gray-900 bg-blue-50 p-3 rounded-md border-l-4 border-blue-400">
                        {selectedReport.supervisorComments || selectedReport.supervisorFeedback}
                      </p>
                    </div>
                    {selectedReport.supervisorName && (
                      <div>
                        <p className="text-sm text-gray-500">Supervisor</p>
                        <p className="text-sm font-medium text-gray-900">{selectedReport.supervisorName}</p>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* Action Buttons */}
              {selectedReport.issueType && selectedReport.status === 'Pending' && (
                <Card className="p-4 bg-gray-50">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Take Action</h3>
                  <div className="flex justify-end space-x-3">
                    <Button
                      variant="success"
                      onClick={() => handleActionClick('resolve', selectedReport)}
                    >
                      Mark as Resolved
                    </Button>
                    <Button
                      variant="info"
                      onClick={() => handleActionClick('warning', selectedReport)}
                    >
                      Issue Warning
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleActionClick('cancel', selectedReport)}
                    >
                      Cancel Internship
                    </Button>
                  </div>
                </Card>
              )}

              {!selectedReport.issueType && !selectedReport.overallPerformance && selectedReport.status === 'Submitted' && (
                <Card className="p-4 bg-gray-50">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Supervisor Action</h3>
                  <div className="flex justify-end">
                    <Button
                      variant="primary"
                      onClick={() => {
                        setSupervisorFeedback('');
                        setShowFeedbackModal(true);
                      }}
                    >
                      Add Feedback
                    </Button>
                  </div>
                </Card>
              )}

              {/* Submission Details */}
              <Card className="p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Submission Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Report Type</p>
                    <p className="text-sm font-medium text-gray-900 capitalize">
                      {selectedReport.issueType ? 'Misconduct Report' : selectedReport.overallPerformance ? 'Internship Appraisal' : 'Progress Report'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Submitted On</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(selectedReport.createdAt || selectedReport.submissionDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Report ID</p>
                    <p className="text-sm font-medium text-gray-900 font-mono">{selectedReport._id?.slice(-8) || 'N/A'}</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* PDF Viewer Modal */}
      <Modal
        isOpen={showPDFModal}
        onClose={() => setShowPDFModal(false)}
        title="Company Report PDF"
        size="xl"
      >
        {selectedReport && (
          <div style={{ height: '80vh' }}>
            <PDFViewer width="100%" height="100%">
              <MisconductReportPDF report={selectedReport} />
            </PDFViewer>
          </div>
        )}
      </Modal>

      {/* Action Confirmation Modal */}
      <Modal
        isOpen={showActionModal}
        onClose={() => setShowActionModal(false)}
        title={`Confirm Action: ${actionType === 'resolve' ? 'Mark as Resolved' : actionType === 'warning' ? 'Issue Warning' : 'Cancel Internship'}`}
        size="md"
      >
        <div className="space-y-4">
          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-yellow-800 text-sm">
              {actionType === 'resolve' && 'This will mark the misconduct report as resolved and notify both the company and student.'}
              {actionType === 'warning' && 'This will issue a warning to the student and notify both the company and student.'}
              {actionType === 'cancel' && 'This will cancel the student\'s internship and notify both the company and student. This action cannot be undone.'}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Supervisor Comments *
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              rows="4"
              value={supervisorComments}
              onChange={(e) => setSupervisorComments(e.target.value)}
              placeholder="Provide your comments about this decision..."
              required
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowActionModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant={actionType === 'cancel' ? 'danger' : actionType === 'warning' ? 'info' : 'success'}
              onClick={handleConfirmAction}
              disabled={!supervisorComments.trim()}
            >
              Confirm {actionType === 'resolve' ? 'Resolution' : actionType === 'warning' ? 'Warning' : 'Cancellation'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Feedback Modal */}
      <Modal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        title="Add Supervisor Feedback"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Supervisor Feedback *
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              rows="4"
              value={supervisorFeedback}
              onChange={(e) => setSupervisorFeedback(e.target.value)}
              placeholder="Provide your feedback on the student's progress..."
              required
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowFeedbackModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={async () => {
                if (!supervisorFeedback.trim()) {
                  toast.error('Feedback is required');
                  return;
                }
                try {
                  await progressReportAPI.reviewReport(selectedReport._id, {
                    supervisorFeedback
                  });
                  toast.success('Feedback added successfully');
                  setShowFeedbackModal(false);
                  fetchProgressReports();
                } catch (error) {
                  toast.error('Failed to add feedback');
                }
              }}
              disabled={!supervisorFeedback.trim()}
            >
              Submit Feedback
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MisconductTab;
