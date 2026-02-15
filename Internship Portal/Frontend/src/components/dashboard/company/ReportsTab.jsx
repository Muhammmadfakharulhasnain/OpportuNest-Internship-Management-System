import { useState, useEffect } from 'react';
import { AlertTriangle, Plus, Calendar, User, Eye, Download, TrendingUp, Award, FileText, Clock, Hash, Filter, Search, SlidersHorizontal, ChevronDown, X, Building } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Card from '../../../ui/Card';
import Button from '../../../ui/Button';
import Badge from '../../../ui/Badge';
import Modal from '../../../ui/Modal';
import MisconductReportForm from './MisconductReportForm';
import ProgressReportForm from './ProgressReportForm';
import InternshipAppraisalTab from './InternshipAppraisalTab';
import { misconductReportAPI, progressReportAPI } from '../../../services/api';
import './ReportsTab.css';

const ReportsTab = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [misconductReports, setMisconductReports] = useState([]);
  const [progressReports, setProgressReports] = useState([]);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportType, setReportType] = useState('');

  // Filter states
  const [showMisconductFilters, setShowMisconductFilters] = useState(false);
  const [showProgressFilters, setShowProgressFilters] = useState(false);
  const [misconductSearchTerm, setMisconductSearchTerm] = useState('');
  const [misconductSortBy, setMisconductSortBy] = useState('date-desc');
  const [progressSearchTerm, setProgressSearchTerm] = useState('');
  const [progressSortBy, setProgressSortBy] = useState('date-desc');

  // Fetch reports when component mounts or tab changes
  useEffect(() => {
    if (activeTab === 0) {
      fetchMisconductReports();
    } else if (activeTab === 1) {
      fetchProgressReports();
    }
    // Internship Appraisal tab handles its own data fetching
  }, [activeTab]);

  const fetchMisconductReports = async () => {
    try {
      const userString = localStorage.getItem('user');
      if (!userString) {
        toast.error('User not found. Please login again.');
        return;
      }
      
      const user = JSON.parse(userString);
      const companyId = user.id;
      
      const response = await misconductReportAPI.getCompanyReports(companyId);
      setMisconductReports(response.data);
    } catch (error) {
      console.error('Error fetching misconduct reports:', error);
      toast.error('Failed to load reports');
    }
  };

  const fetchProgressReports = async () => {
    try {
      const userString = localStorage.getItem('user');
      if (!userString) return;
      
      const user = JSON.parse(userString);
      const companyId = user.id;
      
      const response = await progressReportAPI.getCompanyReports(companyId);
      setProgressReports(response.data);
    } catch (error) {
      console.error('Error fetching progress reports:', error);
      toast.error('Failed to load progress reports');
    }
  };

  const handleCreateReport = (type) => {
    setReportType(type);
    setShowReportModal(true);
  };

  const handleCloseModal = () => {
    setShowReportModal(false);
    setSelectedReport(null);
    setReportType('');
    // Refresh reports after creating/editing
    if (activeTab === 0) {
      fetchMisconductReports();
    } else if (activeTab === 1) {
      fetchProgressReports();
    }
  };

  const handleViewDetails = (report, type = 'misconduct') => {
    setSelectedReport({...report, reportType: type});
    setShowDetailsModal(true);
  };

  // Filter and Sort Misconduct Reports
  const getFilteredMisconductReports = () => {
    let filtered = [...misconductReports];

    // Search filter
    if (misconductSearchTerm) {
      const searchLower = misconductSearchTerm.toLowerCase();
      filtered = filtered.filter(report => 
        report.studentName?.toLowerCase().includes(searchLower) ||
        report.rollNumber?.toLowerCase().includes(searchLower) ||
        report.issueType?.toLowerCase().includes(searchLower)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (misconductSortBy) {
        case 'date-desc':
          return new Date(b.incidentDate) - new Date(a.incidentDate);
        case 'date-asc':
          return new Date(a.incidentDate) - new Date(b.incidentDate);
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
        report.studentRollNumber?.toLowerCase().includes(searchLower) ||
        report.reportingPeriod?.toLowerCase().includes(searchLower)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (progressSortBy) {
        case 'date-desc':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'date-asc':
          return new Date(a.createdAt) - new Date(b.createdAt);
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

  const handleDownloadPDF = async (reportId, reportType = 'misconduct') => {
    try {
      if (reportType === 'progress') {
        await progressReportAPI.downloadProgressReportPDF(reportId);
      } else {
        await misconductReportAPI.downloadReportPDF(reportId);
      }
      toast.success('Report downloaded successfully');
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error('Failed to download report');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending Review':
      case 'Pending': return 'warning';
      case 'Resolved': return 'success';
      case 'Warning Issued': return 'info';
      case 'Internship Cancelled': return 'danger';
      default: return 'default';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const tabs = [
    {
      name: 'Misconduct Reports',
      label: 'Misconduct Reports',
      icon: AlertTriangle,
      color: 'text-red-500',
      bgColor: 'bg-red-50 border-red-200',
      activeColor: 'bg-gradient-to-r from-red-500 to-orange-600'
    },
    {
      name: 'Progress Reports',
      label: 'Progress Reports',
      icon: TrendingUp,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 border-blue-200',
      activeColor: 'bg-gradient-to-r from-blue-500 to-indigo-600'
    },
    {
      name: 'Internship Appraisals',
      label: 'Internship Appraisals',
      icon: Award,
      color: 'text-green-500',
      bgColor: 'bg-green-50 border-green-200',
      activeColor: 'bg-gradient-to-r from-green-500 to-emerald-600'
    }
  ];

  const renderMisconductReports = () => (
    <div className="space-y-6 fade-in">
      {/* Enhanced Header Section with Filters */}
      <div className="bg-gradient-to-r from-blue-50 to-white border border-blue-100 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-[#003366] rounded-lg shadow-md">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Misconduct Reports</h3>
              <p className="text-sm text-gray-600 mt-1">Report student misconduct and track resolutions</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
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
            <Button 
              onClick={() => handleCreateReport('misconduct')} 
              className="bg-gradient-to-r from-[#003366] to-[#00509E] hover:from-[#003366]/90 hover:to-[#00509E]/90 text-white px-4 py-2 font-semibold shadow-md hover:shadow-lg transition-all duration-300"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Report
            </Button>
          </div>
        </div>

        {/* Filter Panel */}
        {showMisconductFilters && (
          <div className="mt-4 pt-4 border-t border-blue-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Search className="w-4 h-4 inline mr-1" />
                  Search by Name or Roll Number
                </label>
                <input
                  type="text"
                  placeholder="Enter student name or roll number..."
                  value={misconductSearchTerm}
                  onChange={(e) => setMisconductSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
                />
              </div>
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
                  <option value="name-asc">Name: A to Z</option>
                  <option value="name-desc">Name: Z to A</option>
                </select>
              </div>
            </div>
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

        <div className="mt-4 text-right">
          <div className="text-2xl font-bold text-[#003366]">{getFilteredMisconductReports().length}</div>
          <div className="text-xs text-gray-500">Total Reports</div>
        </div>
      </div>

      {/* Enhanced Reports Display */}
      {misconductReports.length === 0 ? (
        <Card className="report-card p-12 text-center bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300">
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-[#003366]/10 to-[#00509E]/10 p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-10 h-10 text-[#003366]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Misconduct Reports</h3>
              <p className="text-gray-600">You haven&apos;t submitted any misconduct reports yet.</p>
            </div>
            <Button 
              onClick={() => handleCreateReport('misconduct')} 
              className="bg-gradient-to-r from-[#003366] to-[#00509E] hover:from-[#003366]/90 hover:to-[#00509E]/90 text-white px-6 py-3 font-semibold mt-4"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Report
            </Button>
          </div>
        </Card>
      ) : getFilteredMisconductReports().length > 0 ? (
        <div className="space-y-4">
          {getFilteredMisconductReports().map((report) => (
            <div key={report._id} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="p-6">
                <div className="flex items-start space-x-6">
                  {/* Large Avatar Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#003366] to-[#00509E] flex items-center justify-center">
                      <User className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-xl font-bold text-gray-900 mb-1">
                          {report.studentName}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Roll: {report.rollNumber || 'N/A'}
                        </p>
                      </div>
                      <Badge 
                        variant={getStatusColor(report.status)}
                        className="px-3 py-1"
                      >
                        {report.status}
                      </Badge>
                    </div>

                    {/* Info Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
                        <div className="flex items-center space-x-2 mb-1">
                          <AlertTriangle className="w-4 h-4 text-[#003366]" />
                          <p className="text-xs font-medium text-gray-600 uppercase">Issue Type</p>
                        </div>
                        <p className="text-base font-bold text-[#003366]">
                          {report.issueType}
                        </p>
                      </div>
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
                        <div className="flex items-center space-x-2 mb-1">
                          <Calendar className="w-4 h-4 text-[#003366]" />
                          <p className="text-xs font-medium text-gray-600 uppercase">Incident Date</p>
                        </div>
                        <p className="text-base font-bold text-[#003366]">
                          {formatDate(report.incidentDate)}
                        </p>
                      </div>
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
                        <div className="flex items-center space-x-2 mb-1">
                          <Hash className="w-4 h-4 text-[#003366]" />
                          <p className="text-xs font-medium text-gray-600 uppercase">Report ID</p>
                        </div>
                        <p className="text-sm font-bold text-[#003366] font-mono">
                          #{report._id?.slice(-6)}
                        </p>
                      </div>
                    </div>

                    {/* Description Preview */}
                    {report.description && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                        <h5 className="text-xs font-semibold text-gray-700 mb-2 uppercase">Description</h5>
                        <p className="text-sm text-gray-700 line-clamp-2">
                          {report.description}
                        </p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleViewDetails(report, 'misconduct')}
                        className="flex-1 bg-[#003366] hover:bg-[#004080] text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </button>
                      <button
                        onClick={() => handleDownloadPDF(report._id, 'misconduct')}
                        className="bg-[#00509E] hover:bg-[#0066CC] text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        PDF
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm">
          <div className="flex flex-col items-center">
            <div className="p-4 bg-gray-50 rounded-full mb-4">
              <AlertTriangle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Reports Found
            </h3>
            <p className="text-gray-600 max-w-md">
              {misconductSearchTerm ? 'No reports match your search criteria.' : 'No misconduct reports have been submitted yet.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );

  const renderProgressReports = () => (
    <div className="space-y-6 fade-in">
      {/* Enhanced Header Section with Filters */}
      <div className="bg-gradient-to-r from-blue-50 to-white border border-blue-100 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-[#003366] rounded-lg shadow-md">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Progress Reports</h3>
              <p className="text-sm text-gray-600 mt-1">Track student progress and provide feedback</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
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
            <Button 
              onClick={() => handleCreateReport('progress')} 
              className="bg-gradient-to-r from-[#003366] to-[#00509E] hover:from-[#003366]/90 hover:to-[#00509E]/90 text-white px-4 py-2 font-semibold shadow-md hover:shadow-lg transition-all duration-300"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Report
            </Button>
          </div>
        </div>

        {/* Filter Panel */}
        {showProgressFilters && (
          <div className="mt-4 pt-4 border-t border-blue-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Search className="w-4 h-4 inline mr-1" />
                  Search by Name or Roll Number
                </label>
                <input
                  type="text"
                  placeholder="Enter student name or roll number..."
                  value={progressSearchTerm}
                  onChange={(e) => setProgressSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
                />
              </div>
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
                  <option value="name-asc">Name: A to Z</option>
                  <option value="name-desc">Name: Z to A</option>
                </select>
              </div>
            </div>
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

        <div className="mt-4 text-right">
          <div className="text-2xl font-bold text-[#003366]">{getFilteredProgressReports().length}</div>
          <div className="text-xs text-gray-500">Total Reports</div>
        </div>
      </div>

      {/* Enhanced Reports Display */}
      {progressReports.length === 0 ? (
        <Card className="report-card p-12 text-center bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300">
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-[#003366]/10 to-[#00509E]/10 p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
              <TrendingUp className="w-10 h-10 text-[#003366]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Progress Reports</h3>
              <p className="text-gray-600">You haven&apos;t submitted any progress reports yet.</p>
            </div>
            <Button 
              onClick={() => handleCreateReport('progress')} 
              className="bg-gradient-to-r from-[#003366] to-[#00509E] hover:from-[#003366]/90 hover:to-[#00509E]/90 text-white px-6 py-3 font-semibold mt-4"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Report
            </Button>
          </div>
        </Card>
      ) : getFilteredProgressReports().length > 0 ? (
        <div className="space-y-4">
          {getFilteredProgressReports().map((report) => (
            <div key={report._id} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="p-6">
                <div className="flex items-start space-x-6">
                  {/* Large Avatar Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#003366] to-[#00509E] flex items-center justify-center">
                      <User className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-xl font-bold text-gray-900 mb-1">
                          {report.studentName}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Roll: {report.studentRollNumber || 'N/A'}
                        </p>
                      </div>
                      <Badge 
                        variant="success"
                        className="px-3 py-1"
                      >
                        Active
                      </Badge>
                    </div>

                    {/* Info Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
                        <div className="flex items-center space-x-2 mb-1">
                          <Calendar className="w-4 h-4 text-[#003366]" />
                          <p className="text-xs font-medium text-gray-600 uppercase">Period</p>
                        </div>
                        <p className="text-base font-bold text-[#003366]">
                          {report.reportingPeriod}
                        </p>
                      </div>
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
                        <div className="flex items-center space-x-2 mb-1">
                          <Clock className="w-4 h-4 text-[#003366]" />
                          <p className="text-xs font-medium text-gray-600 uppercase">Submitted</p>
                        </div>
                        <p className="text-base font-bold text-[#003366]">
                          {formatDate(report.createdAt)}
                        </p>
                      </div>
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
                        <div className="flex items-center space-x-2 mb-1">
                          <TrendingUp className="w-4 h-4 text-[#003366]" />
                          <p className="text-xs font-medium text-gray-600 uppercase">Quality</p>
                        </div>
                        <p className="text-base font-bold text-[#003366]">
                          {report.qualityOfWork || 'N/A'}
                        </p>
                      </div>
                    </div>

                    {/* Progress Preview */}
                    {report.progressMade && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                        <h5 className="text-xs font-semibold text-gray-700 mb-2 uppercase">Progress Made</h5>
                        <p className="text-sm text-gray-700 line-clamp-2">
                          {report.progressMade}
                        </p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleViewDetails(report, 'progress')}
                        className="flex-1 bg-[#003366] hover:bg-[#004080] text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </button>
                      <button
                        onClick={() => handleDownloadPDF(report._id, 'progress')}
                        className="bg-[#00509E] hover:bg-[#0066CC] text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        PDF
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm">
          <div className="flex flex-col items-center">
            <div className="p-4 bg-gray-50 rounded-full mb-4">
              <TrendingUp className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Reports Found
            </h3>
            <p className="text-gray-600 max-w-md">
              {progressSearchTerm ? 'No reports match your search criteria.' : 'No progress reports have been submitted yet.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Enhanced Header Section - COMSATS Design */}
      <div className="relative bg-gradient-to-r from-[#003366] via-[#00509E] to-[#003366] rounded-lg p-5 text-white shadow-md overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-white/10 rounded-lg shadow-sm">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-1 text-white">
                  Company Reports Dashboard
                </h1>
                <p className="text-blue-100 text-sm font-medium">
                  Monitor and manage all internship reports
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-blue-200 text-xs font-medium">Status Overview</p>
                <div className="flex items-center gap-1 mt-1">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-white font-bold text-sm">Active</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Quick Stats - COMSATS Compact */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center gap-1 mb-0.5">
                <AlertTriangle className="w-3 h-3 text-blue-200" />
                <span className="text-blue-200 text-xs font-medium">Misconduct</span>
              </div>
              <p className="text-white font-bold text-sm">{misconductReports.length}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center gap-1 mb-0.5">
                <TrendingUp className="w-3 h-3 text-blue-200" />
                <span className="text-blue-200 text-xs font-medium">Progress</span>
              </div>
              <p className="text-white font-bold text-sm">{progressReports.length}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center gap-1 mb-0.5">
                <Award className="w-3 h-3 text-blue-200" />
                <span className="text-blue-200 text-xs font-medium">Appraisals</span>
              </div>
              <p className="text-white font-bold text-sm">Active</p>
            </div>
          </div>
        </div>
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full transform translate-x-16 -translate-y-16"></div>
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-white rounded-full transform -translate-x-10 translate-y-10"></div>
        </div>
      </div>

      {/* Enhanced Tab Navigation - COMSATS Design */}
      <Card className="overflow-hidden shadow-md">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab(0)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 0
                  ? 'border-[#003366] text-[#003366]'
                  : 'border-transparent text-gray-500 hover:text-[#00509E] hover:border-[#00509E]'
              }`}
            >
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Misconduct Reports</span>
                <span className="ml-1 bg-[#003366]/10 text-[#003366] px-2 py-0.5 rounded-full text-xs font-bold">
                  {misconductReports.length}
                </span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab(1)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 1
                  ? 'border-[#003366] text-[#003366]'
                  : 'border-transparent text-gray-500 hover:text-[#00509E] hover:border-[#00509E]'
              }`}
            >
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4" />
                <span>Progress Reports</span>
                <span className="ml-1 bg-[#003366]/10 text-[#003366] px-2 py-0.5 rounded-full text-xs font-bold">
                  {progressReports.length}
                </span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab(2)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 2
                  ? 'border-[#003366] text-[#003366]'
                  : 'border-transparent text-gray-500 hover:text-[#00509E] hover:border-[#00509E]'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Award className="w-4 h-4" />
                <span>Internship Appraisals</span>
              </div>
            </button>
          </nav>
        </div>
      </Card>

      {/* Tab Content */}
      <div>
        {activeTab === 0 && renderMisconductReports()}
        {activeTab === 1 && renderProgressReports()}
        {activeTab === 2 && <InternshipAppraisalTab />}
      </div>

      {/* Create Report Modal */}
      {showReportModal && (
        <Modal isOpen={showReportModal} onClose={handleCloseModal} title={`Create ${reportType} Report`}>
          {reportType === 'misconduct' ? (
            <MisconductReportForm onClose={handleCloseModal} />
          ) : reportType === 'progress' ? (
            <ProgressReportForm onClose={handleCloseModal} />
          ) : null}
        </Modal>
      )}

      {/* Enhanced View Details Modal - COMSATS Theme */}
      {showDetailsModal && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header - COMSATS Blue */}
            <div className="bg-gradient-to-r from-[#003366] to-[#00509E] p-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                  {selectedReport.reportType === 'progress' ? (
                    <TrendingUp className="w-8 h-8 text-white" />
                  ) : (
                    <AlertTriangle className="w-8 h-8 text-white" />
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {selectedReport.reportType === 'progress' ? 'Progress Report Details' : 'Misconduct Report Details'}
                  </h2>
                  <p className="text-blue-100 text-sm mt-1">
                    {selectedReport.studentName} • Submitted on {formatDate(selectedReport.createdAt)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Student Information Card */}
              <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-xl p-5 mb-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-[#003366] rounded-lg">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Student Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-3 border border-blue-200">
                    <p className="text-xs text-gray-600 font-medium uppercase tracking-wider">Student Name</p>
                    <p className="text-sm font-bold text-gray-900 mt-1">{selectedReport.studentName}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-blue-200">
                    <p className="text-xs text-gray-600 font-medium uppercase tracking-wider">Roll Number</p>
                    <p className="text-sm font-bold text-gray-900 mt-1">{selectedReport.rollNumber || selectedReport.studentRollNumber || 'N/A'}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-blue-200">
                    <p className="text-xs text-gray-600 font-medium uppercase tracking-wider">Company</p>
                    <p className="text-sm font-bold text-gray-900 mt-1">{selectedReport.companyName || 'N/A'}</p>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {selectedReport.reportType === 'misconduct' && (
                    <>
                      <div className="bg-white rounded-lg p-3 border border-blue-200">
                        <p className="text-xs text-gray-600 font-medium uppercase tracking-wider">Issue Type</p>
                        <p className="text-sm font-bold text-gray-900 mt-1">{selectedReport.issueType}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-blue-200">
                        <p className="text-xs text-gray-600 font-medium uppercase tracking-wider">Incident Date</p>
                        <p className="text-sm font-bold text-gray-900 mt-1">{formatDate(selectedReport.incidentDate)}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-blue-200">
                        <p className="text-xs text-gray-600 font-medium uppercase tracking-wider">Status</p>
                        <Badge variant={getStatusColor(selectedReport.status)} className="mt-1">
                          {selectedReport.status}
                        </Badge>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-blue-200">
                        <p className="text-xs text-gray-600 font-medium uppercase tracking-wider">Reported On</p>
                        <p className="text-sm font-bold text-gray-900 mt-1">{formatDate(selectedReport.createdAt)}</p>
                      </div>
                    </>
                  )}
                  
                  {selectedReport.reportType === 'progress' && (
                    <>
                      <div className="bg-white rounded-lg p-3 border border-blue-200">
                        <p className="text-xs text-gray-600 font-medium uppercase tracking-wider">Reporting Period</p>
                        <p className="text-sm font-bold text-gray-900 mt-1">{selectedReport.reportingPeriod}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-blue-200">
                        <p className="text-xs text-gray-600 font-medium uppercase tracking-wider">Report Date</p>
                        <p className="text-sm font-bold text-gray-900 mt-1">{formatDate(selectedReport.createdAt)}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-blue-200">
                        <p className="text-xs text-gray-600 font-medium uppercase tracking-wider">Quality of Work</p>
                        <p className="text-sm font-bold text-gray-900 mt-1">{selectedReport.qualityOfWork || 'N/A'}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-blue-200">
                        <p className="text-xs text-gray-600 font-medium uppercase tracking-wider">Hours Worked</p>
                        <p className="text-sm font-bold text-gray-900 mt-1">{selectedReport.hoursWorked || 'N/A'}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Main Content Section */}
              <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-xl p-5 mb-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-[#003366] rounded-lg">
                    {selectedReport.reportType === 'progress' ? (
                      <TrendingUp className="w-5 h-5 text-white" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedReport.reportType === 'progress' ? 'Progress Details' : 'Incident Details'}
                  </h3>
                </div>
                <div className="space-y-4">
                  {selectedReport.reportType === 'misconduct' && (
                    <div className="bg-white rounded-lg p-4 border border-blue-200">
                      <p className="text-xs text-gray-600 font-medium uppercase tracking-wider mb-2">Description</p>
                      <p className="text-sm text-gray-900 bg-blue-50 p-4 rounded-lg border border-blue-100">
                        {selectedReport.description || 'No description provided'}
                      </p>
                    </div>
                  )}
                  
                  {selectedReport.reportType === 'progress' && (
                    <>
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
                    </>
                  )}
                </div>
              </div>

              {/* Additional Information */}
              {selectedReport.reportType === 'progress' && (
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

              {/* Submission Details */}
              <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-xl p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Submission Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-3 border border-blue-200">
                    <p className="text-xs text-gray-600 font-medium uppercase tracking-wider">Report Type</p>
                    <p className="text-sm font-bold text-gray-900 capitalize mt-1">{selectedReport.reportType}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-blue-200">
                    <p className="text-xs text-gray-600 font-medium uppercase tracking-wider">Submitted On</p>
                    <p className="text-sm font-bold text-gray-900 mt-1">{formatDate(selectedReport.createdAt)}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-blue-200">
                    <p className="text-xs text-gray-600 font-medium uppercase tracking-wider">Report ID</p>
                    <p className="text-sm font-bold text-gray-900 font-mono mt-1">{selectedReport._id?.slice(-8) || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsTab;
