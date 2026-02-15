import { useState, useEffect } from 'react';
import { 
  AlertTriangle, Eye, CheckCircle, Calendar, User, Download, Star, Building, Building2, 
  Filter, Search, SlidersHorizontal, ChevronDown, X, FileText 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Button from '../../../ui/Button';
import Badge from '../../../ui/Badge';
import Modal from '../../../ui/Modal';
import { PDFViewer } from '@react-pdf/renderer';
import MisconductReportPDF from '../../shared/MisconductReportPDF';
import { misconductReportAPI, progressReportAPI, internshipAppraisalAPI } from '../../../services/api';

const MisconductTab = () => {
  const [misconductReports, setMisconductReports] = useState([]);
  const [progressReports, setProgressReports] = useState([]);
  const [appraisals, setAppraisals] = useState([]);
  const [activeTab, setActiveTab] = useState('misconduct');
  
  // Filter states for all tabs
  const [showMisconductFilters, setShowMisconductFilters] = useState(false);
  const [showProgressFilters, setShowProgressFilters] = useState(false);
  const [showAppraisalFilters, setShowAppraisalFilters] = useState(false);

  // Filter values for Misconduct Reports
  const [misconductSearchTerm, setMisconductSearchTerm] = useState('');
  const [misconductSortBy, setMisconductSortBy] = useState('date-desc');

  // Filter values for Progress Reports
  const [progressSearchTerm, setProgressSearchTerm] = useState('');
  const [progressSortBy, setProgressSortBy] = useState('date-desc');

  // Filter values for Appraisal Reports
  const [appraisalSearchTerm, setAppraisalSearchTerm] = useState('');
  const [appraisalSortBy, setAppraisalSortBy] = useState('date-desc');

  const [selectedReport, setSelectedReport] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [actionType, setActionType] = useState('');
  const [supervisorComments, setSupervisorComments] = useState('');
  const [supervisorFeedback, setSupervisorFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [progressLoading, setProgressLoading] = useState(false);
  const [appraisalLoading, setAppraisalLoading] = useState(false);

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
      setProgressLoading(true);
      const response = await progressReportAPI.getSupervisorReports();
      setProgressReports(response.data);
    } catch (error) {
      console.error('Error fetching progress reports:', error);
      toast.error('Failed to load progress reports');
    } finally {
      setProgressLoading(false);
    }
  };

  const fetchAppraisals = async () => {
    try {
      setAppraisalLoading(true);
      const response = await internshipAppraisalAPI.getSupervisorAppraisals();
      setAppraisals(response.data || []);
    } catch (error) {
      console.error('Error fetching appraisals:', error);
      toast.error('Failed to load internship appraisals');
    } finally {
      setAppraisalLoading(false);
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
      
      // Refresh dashboard overview
      if (window.refreshSupervisorDashboard) {
        window.refreshSupervisorDashboard();
      }
    } catch (error) {
      console.error('Error updating report status:', error);
      toast.error('Failed to update report status');
    }
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
      await misconductReportAPI.downloadReportPDF(report._id);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download PDF');
    }
  };

  const handleDownloadAppraisalPDF = async (appraisal) => {
    try {
      await internshipAppraisalAPI.downloadAppraisalPDF(appraisal);
    } catch (error) {
      console.error('Error downloading appraisal PDF:', error);
      toast.error('Failed to download appraisal PDF');
    }
  };

  // Filter and Sort Misconduct Reports
  const getFilteredMisconductReports = () => {
    let filtered = [...misconductReports];

    // Search filter
    if (misconductSearchTerm) {
      const searchLower = misconductSearchTerm.toLowerCase();
      filtered = filtered.filter(report => 
        report.studentName?.toLowerCase().includes(searchLower) ||
        report.companyName?.toLowerCase().includes(searchLower) ||
        report.issueType?.toLowerCase().includes(searchLower) ||
        report.status?.toLowerCase().includes(searchLower)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (misconductSortBy) {
        case 'date-desc':
          return new Date(b.incidentDate || b.createdAt) - new Date(a.incidentDate || a.createdAt);
        case 'date-asc':
          return new Date(a.incidentDate || a.createdAt) - new Date(b.incidentDate || b.createdAt);
        case 'name-asc':
          return (a.studentName || '').localeCompare(b.studentName || '');
        case 'name-desc':
          return (b.studentName || '').localeCompare(a.studentName || '');
        default:
          return 0;
      }
    });

    return filtered;
  };

  // Filter and Sort Progress Reports
  const getFilteredProgressReports = () => {
    let filtered = [...progressReports];

    // Search filter
    if (progressSearchTerm) {
      const searchLower = progressSearchTerm.toLowerCase();
      filtered = filtered.filter(report => 
        report.studentName?.toLowerCase().includes(searchLower) ||
        report.companyName?.toLowerCase().includes(searchLower) ||
        report.status?.toLowerCase().includes(searchLower)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (progressSortBy) {
        case 'date-desc':
          return new Date(b.reportDate || b.createdAt) - new Date(a.reportDate || a.createdAt);
        case 'date-asc':
          return new Date(a.reportDate || a.createdAt) - new Date(b.reportDate || b.createdAt);
        case 'name-asc':
          return (a.studentName || '').localeCompare(b.studentName || '');
        case 'name-desc':
          return (b.studentName || '').localeCompare(a.studentName || '');
        default:
          return 0;
      }
    });

    return filtered;
  };

  // Filter and Sort Appraisal Reports
  const getFilteredAppraisals = () => {
    let filtered = [...appraisals];

    // Search filter
    if (appraisalSearchTerm) {
      const searchLower = appraisalSearchTerm.toLowerCase();
      filtered = filtered.filter(appraisal => 
        appraisal.studentName?.toLowerCase().includes(searchLower) ||
        appraisal.companyName?.toLowerCase().includes(searchLower) ||
        appraisal.status?.toLowerCase().includes(searchLower)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (appraisalSortBy) {
        case 'date-desc':
          return new Date(b.submittedAt || b.createdAt) - new Date(a.submittedAt || a.createdAt);
        case 'date-asc':
          return new Date(a.submittedAt || a.createdAt) - new Date(b.submittedAt || b.createdAt);
        case 'name-asc':
          return (a.studentName || '').localeCompare(b.studentName || '');
        case 'name-desc':
          return (b.studentName || '').localeCompare(a.studentName || '');
        case 'rating-desc':
          return (b.overallRating || 0) - (a.overallRating || 0);
        case 'rating-asc':
          return (a.overallRating || 0) - (b.overallRating || 0);
        default:
          return 0;
      }
    });

    return filtered;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* COMSATS Header Section */}
      <div className="relative bg-gradient-to-r from-[#003366] via-[#00509E] to-[#003366] rounded-lg p-4 text-white shadow-md overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-lg shadow-sm">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold mb-1 text-white">
                  Company Reports
                </h1>
                <p className="text-blue-100 text-sm">
                  Review and manage reports submitted by companies
                </p>
              </div>
            </div>
          </div>

          {/* Quick Stats - COMSATS Compact */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white/10 rounded-lg p-2">
              <div className="flex items-center gap-1 mb-0.5">
                <AlertTriangle className="w-3 h-3 text-blue-200" />
                <span className="text-blue-200 text-xs font-medium">Misconduct</span>
              </div>
              <p className="text-white font-bold text-sm">
                {misconductReports.length} Reports
              </p>
            </div>
            <div className="bg-white/10 rounded-lg p-2">
              <div className="flex items-center gap-1 mb-0.5">
                <CheckCircle className="w-3 h-3 text-blue-200" />
                <span className="text-blue-200 text-xs font-medium">Progress</span>
              </div>
              <p className="text-white font-bold text-sm">
                {progressReports.length} Reports
              </p>
            </div>
            <div className="bg-white/10 rounded-lg p-2">
              <div className="flex items-center gap-1 mb-0.5">
                <Star className="w-3 h-3 text-yellow-200" />
                <span className="text-blue-200 text-xs font-medium">Appraisals</span>
              </div>
              <p className="text-white font-bold text-sm">
                {appraisals.length} Reports
              </p>
            </div>
          </div>
        </div>
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white rounded-full transform translate-x-10 -translate-y-10"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-white rounded-full transform -translate-x-8 translate-y-8"></div>
        </div>
      </div>

      {/* COMSATS Tab Navigation */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-4" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('misconduct')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'misconduct'
                  ? 'border-[#003366] text-[#003366]'
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
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'progress'
                  ? 'border-[#003366] text-[#003366]'
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
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'appraisals'
                  ? 'border-[#003366] text-[#003366]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4" />
                <span>Appraisals ({appraisals.length})</span>
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'misconduct' && (
        <div className="space-y-4">
          {/* Section Header */}
          <div className="bg-gradient-to-r from-blue-50 to-white border border-blue-100 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-[#003366] rounded-lg shadow-md">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Misconduct Reports</h3>
                  <p className="text-sm text-gray-600 mt-1">Reports about student misconduct submitted by companies</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowMisconductFilters(!showMisconductFilters)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    showMisconductFilters
                      ? 'bg-[#003366] text-white shadow-md'
                      : 'bg-[#003366] text-white border-2 border-[#003366] hover:bg-[#00509E] shadow-sm'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  Filters
                  <ChevronDown className={`w-4 h-4 transition-transform ${
                    showMisconductFilters ? 'rotate-180' : ''
                  }`} />
                </button>
                <div className="text-right">
                  <div className="text-2xl font-bold text-[#003366]">{getFilteredMisconductReports().length}</div>
                  <div className="text-xs text-gray-500">
                    {misconductReports.filter(r => r.status === 'Resolved').length} resolved
                  </div>
                </div>
              </div>
            </div>

            {/* Filter Panel */}
            {showMisconductFilters && (
              <div className="mt-4 pt-4 border-t border-blue-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Search Box */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Search className="w-4 h-4 inline mr-1" />
                      Search by Student, Company, or Issue Type
                    </label>
                    <input
                      type="text"
                      placeholder="Enter student name, company, or issue type..."
                      value={misconductSearchTerm}
                      onChange={(e) => setMisconductSearchTerm(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
                    />
                  </div>

                  {/* Sort Dropdown */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <SlidersHorizontal className="w-4 h-4 inline mr-1" />
                      Sort By
                    </label>
                    <select
                      value={misconductSortBy}
                      onChange={(e) => setMisconductSortBy(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent bg-white"
                    >
                      <option value="date-desc">Date: Newest First</option>
                      <option value="date-asc">Date: Oldest First</option>
                      <option value="name-asc">Student: A to Z</option>
                      <option value="name-desc">Student: Z to A</option>
                    </select>
                  </div>
                </div>

                {/* Clear Filters Button */}
                {(misconductSearchTerm || misconductSortBy !== 'date-desc') && (
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={() => {
                        setMisconductSearchTerm('');
                        setMisconductSortBy('date-desc');
                      }}
                      className="text-sm text-[#003366] hover:text-[#00509E] font-medium flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Clear Filters
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {loading ? (
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003366] mb-4"></div>
                <p className="text-gray-600">Loading misconduct reports...</p>
              </div>
            </div>
          ) : getFilteredMisconductReports().length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm">
              <div className="flex flex-col items-center">
                <div className="p-4 bg-gray-50 rounded-full mb-4">
                  <AlertTriangle className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Misconduct Reports
                </h3>
                <p className="text-gray-600 max-w-md">
                  {misconductSearchTerm 
                    ? 'No misconduct reports match your search criteria.'
                    : 'No misconduct reports have been submitted by companies yet.'
                  }
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {getFilteredMisconductReports().map((report) => (
                <div key={report._id} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg hover:border-blue-200 transition-all duration-300">
                  <div className="p-5">
                    <div className="flex items-start gap-5">
                      {/* Company Icon */}
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 bg-gradient-to-br from-[#003366] to-[#00509E] rounded-xl flex items-center justify-center shadow-lg">
                          <Building className="w-8 h-8 text-white" />
                        </div>
                      </div>

                      {/* Main Content */}
                      <div className="flex-1 min-w-0">
                        {/* Header Row */}
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="text-lg font-bold text-gray-900">
                              {report.companyName || 'N/A'}
                            </h4>
                            <p className="text-sm text-gray-600 mt-0.5">
                              Misconduct Report - <span className="font-medium text-gray-900">{report.issueType}</span>
                            </p>
                          </div>
                          <Badge 
                            variant={getStatusColor(report.status)}
                            className="px-3 py-1.5 text-xs font-semibold"
                          >
                            {report.status}
                          </Badge>
                        </div>

                        {/* Info Cards Grid */}
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div className="flex items-center gap-2 p-3 bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-lg">
                            <User className="w-5 h-5 text-[#003366] flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs text-gray-500 font-medium">STUDENT</p>
                              <p className="font-semibold text-gray-900 truncate text-sm">{report.studentName}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 p-3 bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-lg">
                            <Calendar className="w-5 h-5 text-[#003366] flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs text-gray-500 font-medium">INCIDENT DATE</p>
                              <p className="font-semibold text-gray-900 text-sm">
                                {new Date(report.incidentDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Description Preview */}
                        {report.description && (
                          <div className="bg-gradient-to-r from-blue-50 to-white border border-blue-100 rounded-lg p-3 mb-4">
                            <h5 className="text-xs font-bold text-[#003366] mb-1.5 uppercase tracking-wide">Issue Description</h5>
                            <p className="text-sm text-gray-700 line-clamp-2">
                              {report.description}
                            </p>
                          </div>
                        )}

                        {/* Action Buttons Row */}
                        <div className="flex flex-wrap gap-2">
                          <Button
                            onClick={() => handleViewReport(report)}
                            className="flex-1 min-w-[140px] bg-[#003366] hover:bg-[#00509E] text-white font-semibold py-2.5 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            View Details
                          </Button>
                          
                          <Button
                            onClick={() => handleDownloadPDF(report)}
                            className="bg-[#00509E] hover:bg-[#003366] text-white font-semibold py-2.5 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                          >
                            <Download className="w-4 h-4" />
                            PDF
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'progress' && (
        <div className="space-y-4">
          {/* Section Header */}
          <div className="bg-gradient-to-r from-blue-50 to-white border border-blue-100 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-[#003366] rounded-lg shadow-md">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Progress Reports</h3>
                  <p className="text-sm text-gray-600 mt-1">Regular progress reports submitted by companies</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowProgressFilters(!showProgressFilters)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    showProgressFilters
                      ? 'bg-[#003366] text-white shadow-md'
                      : 'bg-[#003366] text-white border-2 border-[#003366] hover:bg-[#00509E] shadow-sm'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  Filters
                  <ChevronDown className={`w-4 h-4 transition-transform ${
                    showProgressFilters ? 'rotate-180' : ''
                  }`} />
                </button>
                <div className="text-right">
                  <div className="text-2xl font-bold text-[#003366]">{getFilteredProgressReports().length}</div>
                  <div className="text-xs text-gray-500">
                    {progressReports.filter(r => r.status === 'Reviewed').length} reviewed
                  </div>
                </div>
              </div>
            </div>

            {/* Filter Panel */}
            {showProgressFilters && (
              <div className="mt-4 pt-4 border-t border-blue-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Search Box */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Search className="w-4 h-4 inline mr-1" />
                      Search by Student or Company
                    </label>
                    <input
                      type="text"
                      placeholder="Enter student name or company..."
                      value={progressSearchTerm}
                      onChange={(e) => setProgressSearchTerm(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
                    />
                  </div>

                  {/* Sort Dropdown */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <SlidersHorizontal className="w-4 h-4 inline mr-1" />
                      Sort By
                    </label>
                    <select
                      value={progressSortBy}
                      onChange={(e) => setProgressSortBy(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent bg-white"
                    >
                      <option value="date-desc">Date: Newest First</option>
                      <option value="date-asc">Date: Oldest First</option>
                      <option value="name-asc">Student: A to Z</option>
                      <option value="name-desc">Student: Z to A</option>
                    </select>
                  </div>
                </div>

                {/* Clear Filters Button */}
                {(progressSearchTerm || progressSortBy !== 'date-desc') && (
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={() => {
                        setProgressSearchTerm('');
                        setProgressSortBy('date-desc');
                      }}
                      className="text-sm text-[#003366] hover:text-[#00509E] font-medium flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Clear Filters
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {progressLoading ? (
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003366] mb-4"></div>
                <p className="text-gray-600">Loading progress reports...</p>
              </div>
            </div>
          ) : getFilteredProgressReports().length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm">
              <div className="flex flex-col items-center">
                <div className="p-4 bg-gray-50 rounded-full mb-4">
                  <CheckCircle className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Progress Reports
                </h3>
                <p className="text-gray-600 max-w-md">
                  {progressSearchTerm 
                    ? 'No progress reports match your search criteria.'
                    : 'No progress reports have been submitted by companies yet.'
                  }
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {getFilteredProgressReports().map((report) => (
                <div key={report._id} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg hover:border-blue-200 transition-all duration-300">
                  <div className="p-5">
                    <div className="flex items-start gap-5">
                      {/* Company Icon */}
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 bg-gradient-to-br from-[#003366] to-[#00509E] rounded-xl flex items-center justify-center shadow-lg">
                          <Building className="w-8 h-8 text-white" />
                        </div>
                      </div>

                      {/* Main Content */}
                      <div className="flex-1 min-w-0">
                        {/* Header Row */}
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="text-lg font-bold text-gray-900">
                              {report.companyName || 'N/A'}
                            </h4>
                            <p className="text-sm text-gray-600 mt-0.5">
                              Progress Report - <span className="font-medium text-gray-900">{report.reportingPeriod}</span>
                            </p>
                          </div>
                          <Badge 
                            variant={report.status === 'Reviewed' ? 'success' : 'warning'}
                            className="px-3 py-1.5 text-xs font-semibold"
                          >
                            {report.status || 'Pending'}
                          </Badge>
                        </div>

                        {/* Info Cards Grid */}
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div className="flex items-center gap-2 p-3 bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-lg">
                            <User className="w-5 h-5 text-[#003366] flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs text-gray-500 font-medium">STUDENT</p>
                              <p className="font-semibold text-gray-900 truncate text-sm">{report.studentName}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 p-3 bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-lg">
                            <Calendar className="w-5 h-5 text-[#003366] flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs text-gray-500 font-medium">SUBMITTED</p>
                              <p className="font-semibold text-gray-900 text-sm">
                                {new Date(report.createdAt || report.reportDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Tasks Preview */}
                        {report.tasksAssigned && (
                          <div className="bg-gradient-to-r from-blue-50 to-white border border-blue-100 rounded-lg p-3 mb-4">
                            <h5 className="text-xs font-bold text-[#003366] mb-1.5 uppercase tracking-wide">Tasks Assigned</h5>
                            <p className="text-sm text-gray-700 line-clamp-2">
                              {report.tasksAssigned}
                            </p>
                          </div>
                        )}

                        {/* Action Buttons Row */}
                        <div className="flex flex-wrap gap-2">
                          <Button
                            onClick={() => handleViewReport(report)}
                            className="flex-1 min-w-[140px] bg-[#003366] hover:bg-[#00509E] text-white font-semibold py-2.5 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            View Details
                          </Button>
                          
                          <Button
                            onClick={() => progressReportAPI.downloadProgressReportPDF(report._id)}
                            className="bg-[#00509E] hover:bg-[#003366] text-white font-semibold py-2.5 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                          >
                            <Download className="w-4 h-4" />
                            PDF
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'appraisals' && (
        <div className="space-y-4">
          {/* Section Header */}
          <div className="bg-gradient-to-r from-blue-50 to-white border border-blue-100 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-[#003366] rounded-lg shadow-md">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Internship Appraisals</h3>
                  <p className="text-sm text-gray-600 mt-1">Final performance appraisals submitted by companies</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowAppraisalFilters(!showAppraisalFilters)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    showAppraisalFilters
                      ? 'bg-[#003366] text-white shadow-md'
                      : 'bg-[#003366] text-white border-2 border-[#003366] hover:bg-[#00509E] shadow-sm'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  Filters
                  <ChevronDown className={`w-4 h-4 transition-transform ${
                    showAppraisalFilters ? 'rotate-180' : ''
                  }`} />
                </button>
                <div className="text-right">
                  <div className="text-2xl font-bold text-[#003366]">{getFilteredAppraisals().length}</div>
                  <div className="text-xs text-gray-500">total appraisals</div>
                </div>
              </div>
            </div>

            {/* Filter Panel */}
            {showAppraisalFilters && (
              <div className="mt-4 pt-4 border-t border-blue-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Search Box */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Search className="w-4 h-4 inline mr-1" />
                      Search by Student or Company
                    </label>
                    <input
                      type="text"
                      placeholder="Enter student name or company..."
                      value={appraisalSearchTerm}
                      onChange={(e) => setAppraisalSearchTerm(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
                    />
                  </div>

                  {/* Sort Dropdown */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <SlidersHorizontal className="w-4 h-4 inline mr-1" />
                      Sort By
                    </label>
                    <select
                      value={appraisalSortBy}
                      onChange={(e) => setAppraisalSortBy(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent bg-white"
                    >
                      <option value="date-desc">Date: Newest First</option>
                      <option value="date-asc">Date: Oldest First</option>
                      <option value="name-asc">Student: A to Z</option>
                      <option value="name-desc">Student: Z to A</option>
                      <option value="rating-desc">Rating: Highest First</option>
                      <option value="rating-asc">Rating: Lowest First</option>
                    </select>
                  </div>
                </div>

                {/* Clear Filters Button */}
                {(appraisalSearchTerm || appraisalSortBy !== 'date-desc') && (
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={() => {
                        setAppraisalSearchTerm('');
                        setAppraisalSortBy('date-desc');
                      }}
                      className="text-sm text-[#003366] hover:text-[#00509E] font-medium flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Clear Filters
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {appraisalLoading ? (
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003366] mb-4"></div>
                <p className="text-gray-600">Loading appraisals...</p>
              </div>
            </div>
          ) : getFilteredAppraisals().length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm">
              <div className="flex flex-col items-center">
                <div className="p-4 bg-gray-50 rounded-full mb-4">
                  <Star className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Internship Appraisals
                </h3>
                <p className="text-gray-600 max-w-md">
                  {appraisalSearchTerm 
                    ? 'No appraisals match your search criteria.'
                    : 'No internship appraisals have been submitted by companies yet.'
                  }
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {getFilteredAppraisals().map((appraisal) => (
                <div key={appraisal._id} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg hover:border-blue-200 transition-all duration-300">
                  <div className="p-5">
                    <div className="flex items-start gap-5">
                      {/* Company Icon */}
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 bg-gradient-to-br from-[#003366] to-[#00509E] rounded-xl flex items-center justify-center shadow-lg">
                          <Building className="w-8 h-8 text-white" />
                        </div>
                      </div>

                      {/* Main Content */}
                      <div className="flex-1 min-w-0">
                        {/* Header Row */}
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="text-lg font-bold text-gray-900">
                              {appraisal.companyName || 'N/A'}
                            </h4>
                            <p className="text-sm text-gray-600 mt-0.5">
                              Internship Appraisal - <span className="font-medium text-gray-900">{appraisal.internshipTitle}</span>
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Badge 
                              variant={appraisal.overallPerformance === 'Excellent' ? 'success' : appraisal.overallPerformance === 'Good' ? 'info' : 'warning'}
                              className="px-3 py-1.5 text-xs font-semibold"
                            >
                              {appraisal.overallPerformance}
                            </Badge>
                            <Badge variant="info" className="px-3 py-1.5 text-xs font-semibold">
                              ⭐ {appraisal.rating || appraisal.overallRating}/10
                            </Badge>
                          </div>
                        </div>

                        {/* Info Cards Grid */}
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div className="flex items-center gap-2 p-3 bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-lg">
                            <User className="w-5 h-5 text-[#003366] flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs text-gray-500 font-medium">STUDENT</p>
                              <p className="font-semibold text-gray-900 truncate text-sm">{appraisal.studentName}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 p-3 bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-lg">
                            <Calendar className="w-5 h-5 text-[#003366] flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs text-gray-500 font-medium">SUBMITTED</p>
                              <p className="font-semibold text-gray-900 text-sm">
                                {new Date(appraisal.submissionDate || appraisal.submittedAt || appraisal.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Feedback Preview */}
                        {appraisal.commentsAndFeedback && (
                          <div className="bg-gradient-to-r from-blue-50 to-white border border-blue-100 rounded-lg p-3 mb-4">
                            <h5 className="text-xs font-bold text-[#003366] mb-1.5 uppercase tracking-wide">Comments & Feedback</h5>
                            <p className="text-sm text-gray-700 line-clamp-2">
                              {appraisal.commentsAndFeedback}
                            </p>
                          </div>
                        )}

                        {/* Action Buttons Row */}
                        <div className="flex flex-wrap gap-2">
                          <Button
                            onClick={() => handleViewReport(appraisal)}
                            className="flex-1 min-w-[140px] bg-[#003366] hover:bg-[#00509E] text-white font-semibold py-2.5 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            View Details
                          </Button>
                          
                          <Button
                            onClick={() => handleDownloadAppraisalPDF(appraisal)}
                            className="bg-[#00509E] hover:bg-[#003366] text-white font-semibold py-2.5 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                          >
                            <Download className="w-4 h-4" />
                            PDF
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* NEW IMPROVED MODAL - Report Details Modal */}
      {showReportModal && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header - COMSATS Theme */}
            <div className="bg-gradient-to-r from-[#003366] to-[#00509E] p-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                  {selectedReport?.issueType ? (
                    <AlertTriangle className="w-8 h-8 text-white" />
                  ) : selectedReport?.overallPerformance ? (
                    <Star className="w-8 h-8 text-white" />
                  ) : (
                    <CheckCircle className="w-8 h-8 text-white" />
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {selectedReport?.issueType ? "Misconduct Report" : selectedReport?.overallPerformance ? "Internship Appraisal" : "Progress Report"}
                  </h2>
                  <p className="text-blue-100 text-sm mt-1">
                    {selectedReport.companyName || 'Company'} • 
                    Submitted on {new Date(selectedReport.createdAt || selectedReport.submissionDate || selectedReport.reportDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Student & Company Info Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                {/* Student Information Card */}
                <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-xl p-5">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-[#003366] rounded-lg">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Student Information</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-blue-100">
                      <span className="text-sm text-gray-600">Student Name</span>
                      <span className="text-sm font-medium text-gray-900">
                        {selectedReport.studentName || 'Not Provided'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-blue-100">
                      <span className="text-sm text-gray-600">Roll Number</span>
                      <span className="text-sm font-medium text-gray-900">
                        {selectedReport.rollNumber || selectedReport.studentRollNumber || 'Not Provided'}
                      </span>
                    </div>
                    {selectedReport.internshipTitle && (
                      <div className="flex justify-between items-center py-2 border-b border-blue-100">
                        <span className="text-sm text-gray-600">Internship Title</span>
                        <span className="text-sm font-medium text-gray-900">
                          {selectedReport.internshipTitle}
                        </span>
                      </div>
                    )}
                    {selectedReport.duration && (
                      <div className="flex justify-between items-center py-2 border-b border-blue-100">
                        <span className="text-sm text-gray-600">Duration</span>
                        <span className="text-sm font-medium text-gray-900">
                          {selectedReport.duration}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-gray-600">Status</span>
                      <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                        selectedReport.status === 'Reviewed' || selectedReport.status === 'Resolved'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {selectedReport.status || 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Company Information Card */}
                <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-xl p-5">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-[#00509E] rounded-lg">
                      <Building className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Company Details</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-blue-100">
                      <span className="text-sm text-gray-600">Company Name</span>
                      <span className="text-sm font-medium text-gray-900">
                        {selectedReport.companyName || 'Not Specified'}
                      </span>
                    </div>
                    {selectedReport.issueType && (
                      <>
                        <div className="flex justify-between items-center py-2 border-b border-blue-100">
                          <span className="text-sm text-gray-600">Issue Type</span>
                          <span className="text-sm font-medium text-gray-900">
                            {selectedReport.issueType}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-sm text-gray-600">Incident Date</span>
                          <span className="text-sm font-medium text-gray-900">
                            {new Date(selectedReport.incidentDate).toLocaleDateString()}
                          </span>
                        </div>
                      </>
                    )}
                    {selectedReport.overallPerformance && (
                      <>
                        <div className="flex justify-between items-center py-2 border-b border-blue-100">
                          <span className="text-sm text-gray-600">Performance</span>
                          <span className="text-sm font-medium text-gray-900">
                            {selectedReport.overallPerformance}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-sm text-gray-600">Rating</span>
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#003366] text-white">
                            ⭐ {selectedReport.rating || selectedReport.overallRating}/10
                          </span>
                        </div>
                      </>
                    )}
                    {!selectedReport.issueType && !selectedReport.overallPerformance && (
                      <>
                        <div className="flex justify-between items-center py-2 border-b border-blue-100">
                          <span className="text-sm text-gray-600">Period</span>
                          <span className="text-sm font-medium text-gray-900">
                            {selectedReport.reportingPeriod || 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-blue-100">
                          <span className="text-sm text-gray-600">Quality of Work</span>
                          <span className="text-sm font-medium text-gray-900">
                            {selectedReport.qualityOfWork || 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-sm text-gray-600">Hours Worked</span>
                          <span className="text-sm font-medium text-gray-900">
                            {selectedReport.hoursWorked || 'N/A'}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Report Information Card */}
              <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-xl p-5 mb-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-[#003366] rounded-lg">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Report Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedReport.issueType && (
                    <>
                      <div className="bg-white rounded-lg p-3 border border-blue-200">
                        <p className="text-xs text-gray-600 font-medium uppercase tracking-wider mb-1">Issue Type</p>
                        <p className="text-sm font-bold text-gray-900">{selectedReport.issueType}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-blue-200">
                        <p className="text-xs text-gray-600 font-medium uppercase tracking-wider mb-1">Incident Date</p>
                        <p className="text-sm font-bold text-gray-900">{new Date(selectedReport.incidentDate).toLocaleDateString()}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-blue-200">
                        <p className="text-xs text-gray-600 font-medium uppercase tracking-wider mb-1">Status</p>
                        <span className={`inline-block text-xs font-medium px-3 py-1 rounded-full ${
                          selectedReport.status === 'Reviewed' || selectedReport.status === 'Resolved'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {selectedReport.status}
                        </span>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-blue-200">
                        <p className="text-xs text-gray-600 font-medium uppercase tracking-wider mb-1">Reported On</p>
                        <p className="text-sm font-bold text-gray-900">{new Date(selectedReport.createdAt).toLocaleDateString()}</p>
                      </div>
                    </>
                  )}
                  
                  {selectedReport.overallPerformance && (
                    <>
                      <div className="bg-white rounded-lg p-3 border border-blue-200">
                        <p className="text-xs text-gray-600 font-medium uppercase tracking-wider mb-1">Overall Performance</p>
                        <p className="text-sm font-bold text-gray-900">{selectedReport.overallPerformance}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-blue-200">
                        <p className="text-xs text-gray-600 font-medium uppercase tracking-wider mb-1">Overall Rating</p>
                        <p className="text-sm font-bold text-gray-900">⭐ {selectedReport.rating || selectedReport.overallRating}/10</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-blue-200">
                        <p className="text-xs text-gray-600 font-medium uppercase tracking-wider mb-1">Status</p>
                        <span className={`inline-block text-xs font-medium px-3 py-1 rounded-full ${
                          selectedReport.status === 'Reviewed' || selectedReport.status === 'Resolved'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {selectedReport.status}
                        </span>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-blue-200">
                        <p className="text-xs text-gray-600 font-medium uppercase tracking-wider mb-1">Submitted On</p>
                        <p className="text-sm font-bold text-gray-900">{new Date(selectedReport.submissionDate || selectedReport.createdAt).toLocaleDateString()}</p>
                      </div>
                    </>
                  )}
                  
                  {!selectedReport.issueType && !selectedReport.overallPerformance && (
                    <>
                      <div className="bg-white rounded-lg p-3 border border-blue-200">
                        <p className="text-xs text-gray-600 font-medium uppercase tracking-wider mb-1">Reporting Period</p>
                        <p className="text-sm font-bold text-gray-900">{selectedReport.reportingPeriod || 'N/A'}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-blue-200">
                        <p className="text-xs text-gray-600 font-medium uppercase tracking-wider mb-1">Report Date</p>
                        <p className="text-sm font-bold text-gray-900">{new Date(selectedReport.createdAt || selectedReport.reportDate).toLocaleDateString()}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-blue-200">
                        <p className="text-xs text-gray-600 font-medium uppercase tracking-wider mb-1">Quality of Work</p>
                        <p className="text-sm font-bold text-gray-900">{selectedReport.qualityOfWork || 'N/A'}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-blue-200">
                        <p className="text-xs text-gray-600 font-medium uppercase tracking-wider mb-1">Hours Worked</p>
                        <p className="text-sm font-bold text-gray-900">{selectedReport.hoursWorked || 'N/A'}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Main Content Section */}
              {selectedReport.issueType && (
                <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-xl p-5 mb-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-[#003366] rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Incident Details</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4 border border-blue-200">
                      <p className="text-xs text-gray-600 font-medium uppercase tracking-wider mb-2">Description</p>
                      <p className="text-sm text-gray-900 bg-blue-50 p-4 rounded-lg border border-blue-100">
                        {selectedReport.description || 'No description provided'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Internship Appraisal Content */}
              {selectedReport.overallPerformance && (
                <>
                  <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-xl p-5 mb-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-[#003366] rounded-lg">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Performance Evaluation</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-white rounded-lg p-4 border border-blue-200">
                        <p className="text-xs text-gray-600 font-medium uppercase tracking-wider mb-2">Key Strengths</p>
                        <p className="text-sm text-gray-900 bg-blue-50 p-4 rounded-lg border border-blue-100">
                          {selectedReport.keyStrengths || 'Not provided'}
                        </p>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-blue-200">
                        <p className="text-xs text-gray-600 font-medium uppercase tracking-wider mb-2">Areas for Improvement</p>
                        <p className="text-sm text-gray-900 bg-blue-50 p-4 rounded-lg border border-blue-100">
                          {selectedReport.areasForImprovement || 'Not provided'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-xl p-5 mb-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-[#00509E] rounded-lg">
                        <Star className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Feedback & Recommendation</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-white rounded-lg p-4 border border-blue-200">
                        <p className="text-xs text-gray-600 font-medium uppercase tracking-wider mb-2">Comments & Feedback</p>
                        <p className="text-sm text-gray-900 bg-blue-50 p-4 rounded-lg border border-blue-100">
                          {selectedReport.commentsAndFeedback || 'Not provided'}
                        </p>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-blue-200">
                        <p className="text-xs text-gray-600 font-medium uppercase tracking-wider mb-2">Recommendation</p>
                        <p className="text-sm text-gray-900 bg-blue-50 p-4 rounded-lg border border-blue-100">
                          {selectedReport.recommendation || 'Not provided'}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Main Content Section */}
              {!selectedReport.issueType && !selectedReport.overallPerformance && (
                <>
                  <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-xl p-5 mb-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-[#003366] rounded-lg">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Progress Details</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-white rounded-lg p-4 border border-blue-200">
                        <p className="text-xs text-gray-600 font-medium uppercase tracking-wider mb-2">Tasks Assigned</p>
                        <p className="text-sm text-gray-900 bg-blue-50 p-4 rounded-lg border border-blue-100">
                          {selectedReport.tasksAssigned || 'No tasks specified'}
                        </p>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-blue-200">
                        <p className="text-xs text-gray-600 font-medium uppercase tracking-wider mb-2">Progress Made</p>
                        <p className="text-sm text-gray-900 bg-blue-50 p-4 rounded-lg border border-blue-100">
                          {selectedReport.progressMade || 'No progress details provided'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {(selectedReport.areasOfImprovement || selectedReport.nextGoals || selectedReport.remarks) && (
                    <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-xl p-5 mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
                      <div className="space-y-4">
                        {selectedReport.areasOfImprovement && (
                          <div className="bg-white rounded-lg p-4 border border-blue-200">
                            <p className="text-xs text-gray-600 font-medium uppercase tracking-wider mb-2">Areas of Improvement</p>
                            <p className="text-sm text-gray-900">
                              {selectedReport.areasOfImprovement}
                            </p>
                          </div>
                        )}
                        {selectedReport.nextGoals && (
                          <div className="bg-white rounded-lg p-4 border border-blue-200">
                            <p className="text-xs text-gray-600 font-medium uppercase tracking-wider mb-2">Next Goals</p>
                            <p className="text-sm text-gray-900">
                              {selectedReport.nextGoals}
                            </p>
                          </div>
                        )}
                        {selectedReport.remarks && (
                          <div className="bg-white rounded-lg p-4 border border-blue-200">
                            <p className="text-xs text-gray-600 font-medium uppercase tracking-wider mb-2">Remarks</p>
                            <p className="text-sm text-gray-900">
                              {selectedReport.remarks}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Supervisor Feedback */}
              {(selectedReport.supervisorComments || selectedReport.supervisorFeedback) && (
                <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-xl p-5 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Supervisor Feedback</h3>
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4 border border-blue-200">
                      <p className="text-xs text-gray-600 font-medium uppercase tracking-wider mb-2">Comments</p>
                      <p className="text-sm text-gray-900 bg-blue-50 p-3 rounded-md border-l-4 border-[#003366]">
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
                </div>
              )}

              {/* Attachments Section - For Appraisals */}
              {selectedReport.attachments && selectedReport.attachments.length > 0 && (
                <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-xl p-5 mb-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-[#003366] rounded-lg">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Attachments</h3>
                  </div>
                  <div className="space-y-3">
                    {selectedReport.attachments.map((file, index) => (
                      <div key={index} className="flex items-center gap-4 p-4 bg-white rounded-lg border border-blue-200">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center border border-blue-300">
                            <span className="text-xs font-bold text-[#003366]">
                              {file.originalName?.split('.').pop().toUpperCase() || 'FILE'}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{file.originalName || 'Attachment'}</p>
                          {file.size && (
                            <p className="text-xs text-gray-500 mt-0.5">
                              {(file.size / 1024).toFixed(2)} KB
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submission Details */}
              <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-xl p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Submission Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-3 border border-blue-200">
                    <p className="text-xs text-gray-600 font-medium uppercase tracking-wider mb-1">Report Type</p>
                    <p className="text-sm font-bold text-gray-900 capitalize">
                      {selectedReport.issueType ? 'Misconduct' : selectedReport.overallPerformance ? 'Appraisal' : 'Progress'}
                    </p>
                  </div>
                  {selectedReport.submittedBy && (
                    <div className="bg-white rounded-lg p-3 border border-blue-200">
                      <p className="text-xs text-gray-600 font-medium uppercase tracking-wider mb-1">Submitted By</p>
                      <p className="text-sm font-bold text-gray-900">{selectedReport.submittedBy}</p>
                    </div>
                  )}
                  {selectedReport.submittedByEmail && (
                    <div className="bg-white rounded-lg p-3 border border-blue-200">
                      <p className="text-xs text-gray-600 font-medium uppercase tracking-wider mb-1">Email</p>
                      <p className="text-sm font-bold text-gray-900 break-words">{selectedReport.submittedByEmail}</p>
                    </div>
                  )}
                  <div className="bg-white rounded-lg p-3 border border-blue-200">
                    <p className="text-xs text-gray-600 font-medium uppercase tracking-wider mb-1">Submitted On</p>
                    <p className="text-sm font-bold text-gray-900">
                      {new Date(selectedReport.createdAt || selectedReport.submissionDate || selectedReport.reportDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-blue-200">
                    <p className="text-xs text-gray-600 font-medium uppercase tracking-wider mb-1">Report ID</p>
                    <p className="text-sm font-bold text-gray-900 font-mono">{selectedReport._id?.slice(-8) || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer with Actions */}
            <div className="border-t border-gray-200 p-6 bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  {selectedReport.issueType && selectedReport.status === 'Pending' && (
                    <div className="flex space-x-3">
                      <Button
                        onClick={() => handleActionClick('resolve', selectedReport)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
                      >
                        Mark as Resolved
                      </Button>
                      <Button
                        onClick={() => handleActionClick('warning', selectedReport)}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-medium"
                      >
                        Issue Warning
                      </Button>
                      <Button
                        onClick={() => handleActionClick('cancel', selectedReport)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium"
                      >
                        Cancel Internship
                      </Button>
                    </div>
                  )}
                  {!selectedReport.issueType && !selectedReport.overallPerformance && selectedReport.status === 'Submitted' && (
                    <Button
                      onClick={() => {
                        setSupervisorFeedback('');
                        setShowFeedbackModal(true);
                      }}
                      className="bg-[#003366] hover:bg-[#00509E] text-white px-4 py-2 rounded-lg font-medium"
                    >
                      Add Feedback
                    </Button>
                  )}
                </div>
                <Button
                  onClick={() => {
                    if (selectedReport.issueType) {
                      handleDownloadPDF(selectedReport);
                    } else if (selectedReport.overallPerformance) {
                      handleDownloadAppraisalPDF(selectedReport);
                    } else {
                      progressReportAPI.downloadProgressReportPDF(selectedReport._id);
                    }
                  }}
                  className="bg-[#003366] hover:bg-[#00509E] text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Modal */}
      <Modal
        isOpen={showActionModal}
        onClose={() => setShowActionModal(false)}
        title={`${actionType === 'resolve' ? 'Resolve' : actionType === 'warning' ? 'Issue Warning' : 'Cancel'} Misconduct Report`}
        size="md"
      >
        <div className="space-y-4">
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
                    console.error('Error adding feedback:', error);
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
                  
                  // Refresh dashboard overview
                  if (window.refreshSupervisorDashboard) {
                    window.refreshSupervisorDashboard();
                  }
                } catch (error) {
                  console.error('Error adding feedback:', error);
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
