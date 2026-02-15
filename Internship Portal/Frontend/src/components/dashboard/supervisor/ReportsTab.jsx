import { useState, useEffect } from 'react';
import { 
  FileText, Eye, CheckCircle, Download, Calendar, User, Building, Clock, Star, Building2, AlertCircle, X, Filter, Search, SlidersHorizontal, ChevronDown
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Button from '../../../ui/Button';
import Badge from '../../../ui/Badge';
import Modal from '../../../ui/Modal';
import { joiningReportAPI, weeklyReportAPI, internshipReportAPI } from '../../../services/api';
import completionCertificateAPI from '../../../services/completionCertificateAPI';

const ReportsTab = () => {
  const [joiningReports, setJoiningReports] = useState([]);
  const [weeklyReports, setWeeklyReports] = useState([]);
  const [internshipReports, setInternshipReports] = useState([]);
  const [completionCertificates, setCompletionCertificates] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedWeeklyReport, setSelectedWeeklyReport] = useState(null);
  const [selectedInternshipReport, setSelectedInternshipReport] = useState(null);
  const [selectedCompletionCertificate, setSelectedCompletionCertificate] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showWeeklyViewModal, setShowWeeklyViewModal] = useState(false);
  const [showInternshipViewModal, setShowInternshipViewModal] = useState(false);
  const [showCompletionViewModal, setShowCompletionViewModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [weeklyLoading, setWeeklyLoading] = useState(true);
  const [internshipLoading, setInternshipLoading] = useState(true);
  const [completionLoading, setCompletionLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('joining'); // 'joining', 'weekly', 'internship', or 'completion'

  // Filter states for all tabs
  const [showJoiningFilters, setShowJoiningFilters] = useState(false);
  const [showWeeklyFilters, setShowWeeklyFilters] = useState(false);
  const [showInternshipFilters, setShowInternshipFilters] = useState(false);
  const [showCompletionFilters, setShowCompletionFilters] = useState(false);

  // Filter values for Joining Reports
  const [joiningSearchTerm, setJoiningSearchTerm] = useState('');
  const [joiningSortBy, setJoiningSortBy] = useState('date-desc'); // date-desc, date-asc, name-asc, name-desc

  // Filter values for Weekly Reports
  const [weeklySearchTerm, setWeeklySearchTerm] = useState('');
  const [weeklySortBy, setWeeklySortBy] = useState('week-desc'); // week-desc, week-asc, date-desc, date-asc, name-asc, name-desc

  // Filter values for Internship Reports
  const [internshipSearchTerm, setInternshipSearchTerm] = useState('');
  const [internshipSortBy, setInternshipSortBy] = useState('date-desc');

  // Filter values for Completion Certificates
  const [completionSearchTerm, setCompletionSearchTerm] = useState('');
  const [completionSortBy, setCompletionSortBy] = useState('date-desc');

  useEffect(() => {
    fetchJoiningReports();
    fetchWeeklyReports();
    fetchInternshipReports();
    fetchCompletionCertificates();
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
      const response = await weeklyReportAPI.getSupervisorStudentReports();
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

  const fetchInternshipReports = async () => {
    try {
      setInternshipLoading(true);
      const response = await internshipReportAPI.getSupervisorReports();
      if (response.success) {
        setInternshipReports(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching internship reports:', error);
      toast.error('Failed to fetch internship reports');
    } finally {
      setInternshipLoading(false);
    }
  };

  const fetchCompletionCertificates = async () => {
    try {
      setCompletionLoading(true);
      const response = await completionCertificateAPI.getAllCertificates();
      if (response.success) {
        console.log('🎓 Completion Certificates fetched:', response.data);
        console.log('📋 First certificate sample:', response.data[0]);
        if (response.data[0]) {
          console.log('📊 Sample certificate fields:', Object.keys(response.data[0]));
          console.log('📋 Student Roll Number:', response.data[0].studentRollNumber);
          console.log('📋 Department:', response.data[0].department);
          console.log('📋 Start Date:', response.data[0].internshipStartDate);
          console.log('📋 End Date:', response.data[0].internshipEndDate);
        }
        setCompletionCertificates(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching completion certificates:', error);
      toast.error('Failed to fetch completion certificates');
    } finally {
      setCompletionLoading(false);
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

  const handleViewInternshipReport = async (report) => {
    try {
      setSelectedInternshipReport(report);
      setShowInternshipViewModal(true);
    } catch (error) {
      console.error('Error viewing internship report:', error);
      toast.error('Failed to view internship report');
    }
  };

  const handleDownloadInternshipPDF = async (reportId) => {
    try {
      await internshipReportAPI.downloadPDF(reportId);
      toast.success('Internship report downloaded successfully');
    } catch (error) {
      console.error('Error downloading internship report:', error);
      toast.error('Failed to download internship report');
    }
  };

  const handleAddFeedback = async (reportId, feedback, grade) => {
    try {
      const response = await internshipReportAPI.addFeedback(reportId, { feedback, grade });
      if (response.success) {
        toast.success('Feedback added successfully');
        fetchInternshipReports();
        setShowInternshipViewModal(false);
      }
    } catch (error) {
      console.error('Error adding feedback:', error);
      toast.error('Failed to add feedback');
    }
  };

  const handleViewCompletionCertificate = async (certificate) => {
    try {
      console.log('🔍 Completion Certificate Data:', certificate);
      console.log('📊 Certificate fields:', Object.keys(certificate));
      console.log('📋 Student Name:', certificate.studentName);
      console.log('📋 Registration:', certificate.registrationNumber);
      console.log('📋 Program:', certificate.program);
      console.log('📋 Company:', certificate.companyName);
      console.log('📋 Duration:', certificate.durationMonths);
      console.log('📋 Start Date:', certificate.startDate);
      console.log('📋 End Date:', certificate.endDate);
      
      setSelectedCompletionCertificate(certificate);
      setShowCompletionViewModal(true);
    } catch (error) {
      console.error('Error viewing completion certificate:', error);
      toast.error('Failed to view completion certificate');
    }
  };

  const handleDownloadCompletionPDF = async (certificateId) => {
    try {
      await completionCertificateAPI.downloadPDF(certificateId);
      toast.success('Completion certificate downloaded successfully');
    } catch (error) {
      console.error('Error downloading completion certificate:', error);
      toast.error('Failed to download completion certificate');
    }
  };

  const handleAddCompletionFeedback = async (certificateId, feedback, grade, status) => {
    try {
      const response = await completionCertificateAPI.updateStatus(certificateId, { 
        status, 
        supervisorFeedback: feedback, 
        supervisorGrade: grade 
      });
      if (response.success) {
        toast.success('Feedback added successfully');
        fetchCompletionCertificates();
        setShowCompletionViewModal(false);
      }
    } catch (error) {
      console.error('Error adding completion feedback:', error);
      toast.error('Failed to add feedback');
    }
  };

  const handleDownloadSupportingFile = async (reportId, fileIndex, fileName) => {
    try {
      await weeklyReportAPI.downloadSupportingFile(reportId, fileIndex, fileName);
      toast.success(`File "${fileName}" downloaded successfully`);
    } catch (error) {
      console.error('Error downloading supporting file:', error);
      toast.error('Failed to download file');
    }
  };

  // Filter and Sort Joining Reports
  const getFilteredJoiningReports = () => {
    let filtered = [...joiningReports];

    // Search filter
    if (joiningSearchTerm) {
      const searchLower = joiningSearchTerm.toLowerCase();
      filtered = filtered.filter(report => 
        report.studentName?.toLowerCase().includes(searchLower) ||
        report.rollNumber?.toLowerCase().includes(searchLower) ||
        report.companyName?.toLowerCase().includes(searchLower)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (joiningSortBy) {
        case 'date-desc':
          return new Date(b.reportDate) - new Date(a.reportDate);
        case 'date-asc':
          return new Date(a.reportDate) - new Date(b.reportDate);
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

  // Filter and Sort Weekly Reports
  const getFilteredWeeklyReports = () => {
    let filtered = [...weeklyReports];

    // Search filter
    if (weeklySearchTerm) {
      const searchLower = weeklySearchTerm.toLowerCase();
      filtered = filtered.filter(report => 
        report.studentId?.name?.toLowerCase().includes(searchLower) ||
        report.studentId?.rollNumber?.toLowerCase().includes(searchLower) ||
        report.companyName?.toLowerCase().includes(searchLower)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (weeklySortBy) {
        case 'week-desc':
          return (b.weekNumber || 0) - (a.weekNumber || 0);
        case 'week-asc':
          return (a.weekNumber || 0) - (b.weekNumber || 0);
        case 'date-desc':
          return new Date(b.submittedAt) - new Date(a.submittedAt);
        case 'date-asc':
          return new Date(a.submittedAt) - new Date(b.submittedAt);
        case 'name-asc':
          return (a.studentId?.name || '').localeCompare(b.studentId?.name || '');
        case 'name-desc':
          return (b.studentId?.name || '').localeCompare(a.studentId?.name || '');
        default:
          return 0;
      }
    });

    return filtered;
  };

  // Filter and Sort Internship Reports
  const getFilteredInternshipReports = () => {
    let filtered = [...internshipReports];

    // Search filter
    if (internshipSearchTerm) {
      const searchLower = internshipSearchTerm.toLowerCase();
      filtered = filtered.filter(report => 
        report.studentId?.name?.toLowerCase().includes(searchLower) ||
        report.studentId?.rollNumber?.toLowerCase().includes(searchLower) ||
        report.studentId?.email?.toLowerCase().includes(searchLower) ||
        report.companyId?.companyName?.toLowerCase().includes(searchLower)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (internshipSortBy) {
        case 'date-desc':
          return new Date(b.submittedAt) - new Date(a.submittedAt);
        case 'date-asc':
          return new Date(a.submittedAt) - new Date(b.submittedAt);
        case 'name-asc':
          return (a.studentId?.name || '').localeCompare(b.studentId?.name || '');
        case 'name-desc':
          return (b.studentId?.name || '').localeCompare(a.studentId?.name || '');
        default:
          return 0;
      }
    });

    return filtered;
  };

  // Filter and Sort Completion Certificates
  const getFilteredCompletionCertificates = () => {
    let filtered = [...completionCertificates];

    // Search filter
    if (completionSearchTerm) {
      const searchLower = completionSearchTerm.toLowerCase();
      filtered = filtered.filter(cert => 
        cert.studentName?.toLowerCase().includes(searchLower) ||
        cert.studentRollNumber?.toLowerCase().includes(searchLower) ||
        cert.certificateNumber?.toLowerCase().includes(searchLower) ||
        cert.companyName?.toLowerCase().includes(searchLower)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (completionSortBy) {
        case 'date-desc':
          return new Date(b.submittedAt) - new Date(a.submittedAt);
        case 'date-asc':
          return new Date(a.submittedAt) - new Date(b.submittedAt);
        case 'name-asc':
          return (a.studentName || '').localeCompare(b.studentName || '');
        case 'name-desc':
          return (b.studentName || '').localeCompare(a.studentName || '');
        case 'rating-desc':
          return (b.performanceRating || 0) - (a.performanceRating || 0);
        case 'rating-asc':
          return (a.performanceRating || 0) - (b.performanceRating || 0);
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
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold mb-1 text-white">
                  Student Reports
                </h1>
                <p className="text-blue-100 text-sm">
                  Review and manage student submissions
                </p>
              </div>
            </div>
          </div>

          {/* Quick Stats - COMSATS Compact */}
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-white/10 rounded-lg p-2">
              <div className="flex items-center gap-1 mb-0.5">
                <FileText className="w-3 h-3 text-blue-200" />
                <span className="text-blue-200 text-xs font-medium">Joining</span>
              </div>
              <p className="text-white font-bold text-sm">
                {joiningReports.length} Reports
              </p>
            </div>
            <div className="bg-white/10 rounded-lg p-2">
              <div className="flex items-center gap-1 mb-0.5">
                <Clock className="w-3 h-3 text-blue-200" />
                <span className="text-blue-200 text-xs font-medium">Weekly</span>
              </div>
              <p className="text-white font-bold text-sm">
                {weeklyReports.length} Reports
              </p>
            </div>
            <div className="bg-white/10 rounded-lg p-2">
              <div className="flex items-center gap-1 mb-0.5">
                <Building className="w-3 h-3 text-blue-200" />
                <span className="text-blue-200 text-xs font-medium">Internship</span>
              </div>
              <p className="text-white font-bold text-sm">
                {internshipReports.length} Reports
              </p>
            </div>
            <div className="bg-white/10 rounded-lg p-2">
              <div className="flex items-center gap-1 mb-0.5">
                <CheckCircle className="w-3 h-3 text-blue-200" />
                <span className="text-blue-200 text-xs font-medium">Certificates</span>
              </div>
              <p className="text-white font-bold text-sm">
                {completionCertificates.length} Issued
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
              onClick={() => setActiveTab('joining')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'joining'
                  ? 'border-[#003366] text-[#003366]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>Joining Reports ({joiningReports.length})</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('weekly')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'weekly'
                  ? 'border-[#003366] text-[#003366]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>Weekly Reports ({weeklyReports.length})</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('internship')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'internship'
                  ? 'border-[#003366] text-[#003366]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Building className="w-4 h-4" />
                <span>Internship Reports ({internshipReports.length})</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('completion')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'completion'
                  ? 'border-[#003366] text-[#003366]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4" />
                <span>Certificates ({completionCertificates.length})</span>
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'joining' && (
        <div className="space-y-4">
          {/* Section Header */}
          <div className="bg-gradient-to-r from-blue-50 to-white border border-blue-100 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-[#003366] rounded-lg shadow-md">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Joining Reports</h3>
                  <p className="text-sm text-gray-600 mt-1">Student reports submitted after joining internships</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowJoiningFilters(!showJoiningFilters)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    showJoiningFilters
                      ? 'bg-[#003366] text-white shadow-md'
                      : 'bg-[#003366] text-white border-2 border-[#003366] hover:bg-[#00509E] shadow-sm'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  Filters
                  <ChevronDown className={`w-4 h-4 transition-transform ${
                    showJoiningFilters ? 'rotate-180' : ''
                  }`} />
                </button>
                <div className="text-right">
                  <div className="text-2xl font-bold text-[#003366]">{getFilteredJoiningReports().length}</div>
                  <div className="text-xs text-gray-500">
                    {joiningReports.filter(r => r.status === 'Verified').length} verified
                  </div>
                </div>
              </div>
            </div>

            {/* Filter Panel */}
            {showJoiningFilters && (
              <div className="mt-4 pt-4 border-t border-blue-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Search Box */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Search className="w-4 h-4 inline mr-1" />
                      Search by Name or Roll Number
                    </label>
                    <input
                      type="text"
                      placeholder="Enter student name or roll number..."
                      value={joiningSearchTerm}
                      onChange={(e) => setJoiningSearchTerm(e.target.value)}
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
                      value={joiningSortBy}
                      onChange={(e) => setJoiningSortBy(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent bg-white"
                    >
                      <option value="date-desc">Date: Newest First</option>
                      <option value="date-asc">Date: Oldest First</option>
                      <option value="name-asc">Name: A to Z</option>
                      <option value="name-desc">Name: Z to A</option>
                    </select>
                  </div>
                </div>

                {/* Clear Filters Button */}
                {(joiningSearchTerm || joiningSortBy !== 'date-desc') && (
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={() => {
                        setJoiningSearchTerm('');
                        setJoiningSortBy('date-desc');
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
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-600">Loading joining reports...</p>
              </div>
            </div>
          ) : getFilteredJoiningReports().length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {getFilteredJoiningReports().map((report) => (
                <div key={report._id} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg hover:border-blue-200 transition-all duration-300">
                  <div className="p-5">
                    <div className="flex items-start gap-5">
                      {/* Student Avatar & Info */}
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 bg-gradient-to-br from-[#003366] to-[#00509E] rounded-xl flex items-center justify-center shadow-lg">
                          <User className="w-8 h-8 text-white" />
                        </div>
                      </div>

                      {/* Main Content */}
                      <div className="flex-1 min-w-0">
                        {/* Header Row */}
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="text-lg font-bold text-gray-900">
                              {report.studentName}
                            </h4>
                            <p className="text-sm text-gray-600 mt-0.5">
                              Roll Number: <span className="font-medium text-gray-900">{report.rollNumber}</span>
                            </p>
                          </div>
                          <Badge 
                            variant={report.status === 'Verified' ? 'success' : 'warning'}
                            className="px-3 py-1.5 text-xs font-semibold"
                          >
                            {report.status}
                          </Badge>
                        </div>

                        {/* Info Cards Grid */}
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div className="flex items-center gap-2 p-3 bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-lg">
                            <Building className="w-5 h-5 text-[#003366] flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs text-gray-500 font-medium">COMPANY</p>
                              <p className="font-semibold text-gray-900 truncate text-sm">{report.companyName}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 p-3 bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-lg">
                            <Calendar className="w-5 h-5 text-[#003366] flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs text-gray-500 font-medium">SUBMITTED</p>
                              <p className="font-semibold text-gray-900 text-sm">
                                {new Date(report.reportDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Student Thoughts */}
                        {report.studentThoughts && (
                          <div className="bg-gradient-to-r from-blue-50 to-white border border-blue-100 rounded-lg p-3 mb-4">
                            <h5 className="text-xs font-bold text-[#003366] mb-1.5 uppercase tracking-wide">Student Thoughts</h5>
                            <p className="text-sm text-gray-700 line-clamp-2">
                              {report.studentThoughts}
                            </p>
                          </div>
                        )}

                        {/* Action Buttons Row */}
                        <div className="flex flex-wrap gap-2">
                          <Button
                            onClick={() => handleViewReport(report._id)}
                            className="flex-1 min-w-[140px] bg-[#003366] hover:bg-[#00509E] text-white font-semibold py-2.5 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            View Details
                          </Button>
                          
                          <Button
                            onClick={() => handleDownloadPDF(report._id, report.studentName)}
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
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm">
              <div className="flex flex-col items-center">
                <div className="p-4 bg-gray-50 rounded-full mb-4">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Joining Reports
                </h3>
                <p className="text-gray-600 max-w-md">
                  No students have submitted joining reports yet. Reports will appear here once students start their internships.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'weekly' && (
        <div className="space-y-6">
          {/* Section Header */}
          <div className="bg-gradient-to-r from-blue-50 to-white border border-blue-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-[#003366] rounded-xl">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Weekly Reports</h3>
                  <p className="text-sm text-gray-600">Regular progress reports submitted by students</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowWeeklyFilters(!showWeeklyFilters)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    showWeeklyFilters
                      ? 'bg-[#003366] text-white shadow-md'
                      : 'bg-[#003366] text-white border-2 border-[#003366] hover:bg-[#00509E] shadow-sm'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  Filters
                  <ChevronDown className={`w-4 h-4 transition-transform ${
                    showWeeklyFilters ? 'rotate-180' : ''
                  }`} />
                </button>
                <div className="text-sm font-medium text-gray-700">
                  <span className="text-[#003366] font-semibold">{getFilteredWeeklyReports().filter(r => r.status === 'reviewed').length}</span> reviewed of <span className="text-[#003366] font-semibold">{getFilteredWeeklyReports().length}</span> total
                </div>
              </div>
            </div>

            {/* Filter Panel */}
            {showWeeklyFilters && (
              <div className="mt-4 pt-4 border-t border-blue-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Search Box */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Search className="w-4 h-4 inline mr-1" />
                      Search by Name or Roll Number
                    </label>
                    <input
                      type="text"
                      placeholder="Enter student name or roll number..."
                      value={weeklySearchTerm}
                      onChange={(e) => setWeeklySearchTerm(e.target.value)}
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
                      value={weeklySortBy}
                      onChange={(e) => setWeeklySortBy(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent bg-white"
                    >
                      <option value="week-desc">Week: Latest First</option>
                      <option value="week-asc">Week: Earliest First</option>
                      <option value="date-desc">Date: Newest First</option>
                      <option value="date-asc">Date: Oldest First</option>
                      <option value="name-asc">Name: A to Z</option>
                      <option value="name-desc">Name: Z to A</option>
                    </select>
                  </div>
                </div>

                {/* Clear Filters Button */}
                {(weeklySearchTerm || weeklySortBy !== 'week-desc') && (
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={() => {
                        setWeeklySearchTerm('');
                        setWeeklySortBy('week-desc');
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

          {weeklyLoading ? (
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mb-4"></div>
                <p className="text-gray-600">Loading weekly reports...</p>
              </div>
            </div>
          ) : getFilteredWeeklyReports().length > 0 ? (
            <div className="space-y-4">
              {getFilteredWeeklyReports().map((report) => (
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
                              {report.studentId?.name || 'Unknown Student'}
                            </h4>
                            <p className="text-sm text-gray-600">
                              Week {report.weekNumber} Report
                            </p>
                          </div>
                          <Badge 
                            variant={report.status === 'reviewed' ? 'success' : 'warning'}
                            className="px-3 py-1"
                          >
                            {report.status || 'Pending'}
                          </Badge>
                        </div>

                        {/* Info Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
                            <div className="flex items-center space-x-2 mb-1">
                              <FileText className="w-4 h-4 text-[#003366]" />
                              <p className="text-xs font-medium text-gray-600 uppercase">Week Number</p>
                            </div>
                            <p className="text-base font-bold text-[#003366]">
                              Week {report.weekNumber}
                            </p>
                          </div>
                          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
                            <div className="flex items-center space-x-2 mb-1">
                              <Clock className="w-4 h-4 text-[#003366]" />
                              <p className="text-xs font-medium text-gray-600 uppercase">Submitted</p>
                            </div>
                            <p className="text-base font-bold text-[#003366]">
                              {new Date(report.submittedAt).toLocaleDateString()}
                            </p>
                          </div>
                          {report.companyName && (
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200 md:col-span-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <Building2 className="w-4 h-4 text-[#003366]" />
                                <p className="text-xs font-medium text-gray-600 uppercase">Company</p>
                              </div>
                              <p className="text-sm font-bold text-[#003366] truncate">
                                {report.companyName}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Tasks Preview */}
                        {report.weeklyTasks && report.weeklyTasks.length > 0 && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                            <h5 className="text-xs font-semibold text-gray-700 mb-2 uppercase">Tasks Completed</h5>
                            <p className="text-sm text-gray-700 line-clamp-1">
                              {report.weeklyTasks.slice(0, 3).map(task => task.task).join(', ')}
                              {report.weeklyTasks.length > 3 && ` and ${report.weeklyTasks.length - 3} more...`}
                            </p>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex items-center space-x-3">
                          <Button
                            onClick={() => handleViewWeeklyReport(report)}
                            className="flex-1 bg-[#003366] hover:bg-[#004080] text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                          <Button
                            onClick={() => handleDownloadWeeklyPDF(report._id)}
                            className="bg-[#00509E] hover:bg-[#0066CC] text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            PDF
                          </Button>
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
                  <Clock className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Weekly Reports
                </h3>
                <p className="text-gray-600 max-w-md">
                  No weekly reports have been submitted yet. Students will submit weekly progress reports during their internships.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'internship' && (
        <div className="space-y-6">
          {/* Section Header */}
          <div className="bg-gradient-to-r from-blue-50 to-white border border-blue-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-[#003366] rounded-xl">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Internship Reports</h3>
                  <p className="text-sm text-gray-600">Final comprehensive reports submitted by students</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowInternshipFilters(!showInternshipFilters)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    showInternshipFilters
                      ? 'bg-[#003366] text-white shadow-md'
                      : 'bg-[#003366] text-white border-2 border-[#003366] hover:bg-[#00509E] shadow-sm'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  Filters
                  <ChevronDown className={`w-4 h-4 transition-transform ${
                    showInternshipFilters ? 'rotate-180' : ''
                  }`} />
                </button>
                <div className="text-sm font-medium text-gray-700">
                  <span className="text-[#003366] font-semibold">{getFilteredInternshipReports().filter(r => r.status === 'reviewed').length}</span> reviewed of <span className="text-[#003366] font-semibold">{getFilteredInternshipReports().length}</span> total
                </div>
              </div>
            </div>

            {/* Filter Panel */}
            {showInternshipFilters && (
              <div className="mt-4 pt-4 border-t border-blue-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Search Box */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Search className="w-4 h-4 inline mr-1" />
                      Search by Name or Roll Number
                    </label>
                    <input
                      type="text"
                      placeholder="Enter student name or roll number..."
                      value={internshipSearchTerm}
                      onChange={(e) => setInternshipSearchTerm(e.target.value)}
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
                      value={internshipSortBy}
                      onChange={(e) => setInternshipSortBy(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent bg-white"
                    >
                      <option value="date-desc">Date: Newest First</option>
                      <option value="date-asc">Date: Oldest First</option>
                      <option value="name-asc">Name: A to Z</option>
                      <option value="name-desc">Name: Z to A</option>
                    </select>
                  </div>
                </div>

                {/* Clear Filters Button */}
                {(internshipSearchTerm || internshipSortBy !== 'date-desc') && (
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={() => {
                        setInternshipSearchTerm('');
                        setInternshipSortBy('date-desc');
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

          {internshipLoading ? (
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-4"></div>
                <p className="text-gray-600">Loading internship reports...</p>
              </div>
            </div>
          ) : getFilteredInternshipReports().length > 0 ? (
            <div className="space-y-4">
              {getFilteredInternshipReports().map((report) => (
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
                              {report.studentId?.name || 'Unknown Student'}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {report.studentId?.email || 'No email'}
                            </p>
                          </div>
                          <Badge 
                            variant={report.status === 'reviewed' ? 'success' : 'warning'}
                            className="px-3 py-1"
                          >
                            {report.status || 'Submitted'}
                          </Badge>
                        </div>

                        {/* Info Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
                            <div className="flex items-center space-x-2 mb-1">
                              <Building className="w-4 h-4 text-[#003366]" />
                              <p className="text-xs font-medium text-gray-600 uppercase">Company</p>
                            </div>
                            <p className="text-base font-bold text-[#003366]">
                              {report.companyId?.companyName || 'Company N/A'}
                            </p>
                          </div>
                          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
                            <div className="flex items-center space-x-2 mb-1">
                              <Calendar className="w-4 h-4 text-[#003366]" />
                              <p className="text-xs font-medium text-gray-600 uppercase">Submitted</p>
                            </div>
                            <p className="text-base font-bold text-[#003366]">
                              {new Date(report.submittedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {/* Executive Summary Preview */}
                        {report.executiveSummary && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                            <h5 className="text-xs font-semibold text-gray-700 mb-2 uppercase">Executive Summary</h5>
                            <p className="text-sm text-gray-700 line-clamp-2">
                              {report.executiveSummary.length > 120 
                                ? `${report.executiveSummary.substring(0, 120)}...` 
                                : report.executiveSummary}
                            </p>
                          </div>
                        )}

                        {/* Supervisor Feedback */}
                        {report.supervisorFeedback && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                            <h5 className="text-xs font-semibold text-gray-700 mb-2 uppercase">Your Feedback</h5>
                            <p className="text-sm text-gray-700 line-clamp-2">
                              {typeof report.supervisorFeedback === 'object' 
                                ? report.supervisorFeedback.feedback || JSON.stringify(report.supervisorFeedback)
                                : report.supervisorFeedback}
                            </p>
                            {report.grade && (
                              <div className="mt-2">
                                <span className="text-xs text-[#003366] font-bold">Grade: {report.grade}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex items-center space-x-3">
                          <Button
                            onClick={() => handleViewInternshipReport(report)}
                            className="flex-1 bg-[#003366] hover:bg-[#004080] text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                          <Button
                            onClick={() => handleDownloadInternshipPDF(report._id)}
                            className="bg-[#00509E] hover:bg-[#0066CC] text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            PDF
                          </Button>
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
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Internship Reports
                </h3>
                <p className="text-gray-600 max-w-md">
                  No final internship reports have been submitted yet. Students will submit comprehensive reports at the end of their internships.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Completion Certificates Section */}
      {activeTab === 'completion' && (
        <div className="space-y-6">
          {/* Section Header */}
          <div className="bg-gradient-to-r from-blue-50 to-white border border-blue-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-[#003366] rounded-xl">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Completion Certificates</h3>
                  <p className="text-sm text-gray-600">Certificates issued upon successful internship completion</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowCompletionFilters(!showCompletionFilters)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    showCompletionFilters
                      ? 'bg-[#003366] text-white shadow-md'
                      : 'bg-[#003366] text-white border-2 border-[#003366] hover:bg-[#00509E] shadow-sm'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  Filters
                  <ChevronDown className={`w-4 h-4 transition-transform ${
                    showCompletionFilters ? 'rotate-180' : ''
                  }`} />
                </button>
                <div className="text-sm font-medium text-gray-700">
                  <span className="text-[#003366] font-semibold">{getFilteredCompletionCertificates().length}</span> certificate{getFilteredCompletionCertificates().length !== 1 ? 's' : ''} issued
                </div>
              </div>
            </div>

            {/* Filter Panel */}
            {showCompletionFilters && (
              <div className="mt-4 pt-4 border-t border-blue-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Search Box */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Search className="w-4 h-4 inline mr-1" />
                      Search by Name or Roll Number
                    </label>
                    <input
                      type="text"
                      placeholder="Enter student name or roll number..."
                      value={completionSearchTerm}
                      onChange={(e) => setCompletionSearchTerm(e.target.value)}
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
                      value={completionSortBy}
                      onChange={(e) => setCompletionSortBy(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent bg-white"
                    >
                      <option value="date-desc">Date: Newest First</option>
                      <option value="date-asc">Date: Oldest First</option>
                      <option value="name-asc">Name: A to Z</option>
                      <option value="name-desc">Name: Z to A</option>
                      <option value="rating-desc">Rating: High to Low</option>
                      <option value="rating-asc">Rating: Low to High</option>
                    </select>
                  </div>
                </div>

                {/* Clear Filters Button */}
                {(completionSearchTerm || completionSortBy !== 'date-desc') && (
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={() => {
                        setCompletionSearchTerm('');
                        setCompletionSortBy('date-desc');
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

          {completionLoading ? (
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mb-4"></div>
                <p className="text-gray-600">Loading completion certificates...</p>
              </div>
            </div>
          ) : getFilteredCompletionCertificates().length > 0 ? (
            <div className="space-y-4">
              {getFilteredCompletionCertificates().map((certificate) => (
                <div key={certificate._id} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300">
                  <div className="p-6">
                    <div className="flex items-start space-x-6">
                      {/* Large Avatar Icon */}
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#003366] to-[#00509E] flex items-center justify-center">
                          <CheckCircle className="w-8 h-8 text-white" />
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="flex-1 min-w-0">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="text-xl font-bold text-gray-900 mb-1">
                              {certificate.studentName}
                            </h4>
                            <p className="text-sm text-gray-600">
                              Certificate No: {certificate.certificateNumber}
                            </p>
                          </div>
                          <Badge 
                            variant="success"
                            className="px-3 py-1"
                          >
                            {certificate.status || 'Issued'}
                          </Badge>
                        </div>

                        {/* Info Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
                            <div className="flex items-center space-x-2 mb-1">
                              <Building className="w-4 h-4 text-[#003366]" />
                              <p className="text-xs font-medium text-gray-600 uppercase">Company</p>
                            </div>
                            <p className="text-base font-bold text-[#003366]">
                              {certificate.companyName}
                            </p>
                          </div>
                          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
                            <div className="flex items-center space-x-2 mb-1">
                              <Calendar className="w-4 h-4 text-[#003366]" />
                              <p className="text-xs font-medium text-gray-600 uppercase">Issued</p>
                            </div>
                            <p className="text-base font-bold text-[#003366]">
                              {new Date(certificate.submittedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
                            <div className="flex items-center space-x-2 mb-1">
                              <Star className="w-4 h-4 text-[#003366]" />
                              <p className="text-xs font-medium text-gray-600 uppercase">Rating</p>
                            </div>
                            <p className="text-base font-bold text-[#003366]">
                              {certificate.performanceRating}/5
                            </p>
                          </div>
                        </div>

                        {/* Key Achievements */}
                        {certificate.keyAchievements && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                            <h5 className="text-xs font-semibold text-gray-700 mb-2 uppercase">Key Achievements</h5>
                            <p className="text-sm text-gray-700 line-clamp-2">
                              {certificate.keyAchievements.length > 120 
                                ? `${certificate.keyAchievements.substring(0, 120)}...` 
                                : certificate.keyAchievements}
                            </p>
                          </div>
                        )}

                        {/* Supervisor Feedback */}
                        {certificate.supervisorFeedback && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                            <h5 className="text-xs font-semibold text-gray-700 mb-2 uppercase">Your Feedback</h5>
                            <p className="text-sm text-gray-700 line-clamp-2">
                              {typeof certificate.supervisorFeedback === 'object' 
                                ? certificate.supervisorFeedback.feedback || JSON.stringify(certificate.supervisorFeedback)
                                : certificate.supervisorFeedback}
                            </p>
                            {certificate.supervisorGrade && (
                              <div className="mt-2">
                                <span className="text-xs text-[#003366] font-bold">
                                  Grade: {certificate.supervisorGrade}
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex items-center space-x-3">
                          <Button
                            onClick={() => handleViewCompletionCertificate(certificate)}
                            className="flex-1 bg-[#003366] hover:bg-[#004080] text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                          <Button
                            onClick={() => handleDownloadCompletionPDF(certificate._id)}
                            className="bg-[#00509E] hover:bg-[#0066CC] text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            PDF
                          </Button>
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
                  <CheckCircle className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Completion Certificates
                </h3>
                <p className="text-gray-600 max-w-md">
                  No completion certificates have been issued yet. Certificates will be generated when students successfully complete their internships.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Joining Report View Modal - COMSATS Theme */}
      {showViewModal && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#003366] to-[#00509E] p-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Joining Report
                  </h2>
                  <p className="text-blue-100 text-sm mt-1">
                    {selectedReport.studentName || 'Student Name'} • 
                    Submitted on {new Date(selectedReport.reportDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowViewModal(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">

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
                        {selectedReport.rollNumber || 'Not Provided'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-blue-100">
                      <span className="text-sm text-gray-600">Email</span>
                      <span className="text-sm font-medium text-gray-900">
                        {selectedReport.studentEmail || 'Not Provided'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-gray-600">Submission Date</span>
                      <span className="text-sm font-medium text-gray-900">
                        {new Date(selectedReport.reportDate).toLocaleDateString()}
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
                    <div className="flex justify-between items-center py-2 border-b border-blue-100">
                      <span className="text-sm text-gray-600">Position</span>
                      <span className="text-sm font-medium text-gray-900">
                        {selectedReport.position || 'Not Specified'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-blue-100">
                      <span className="text-sm text-gray-600">Department</span>
                      <span className="text-sm font-medium text-gray-900">
                        {selectedReport.department || 'Not Specified'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-gray-600">Report Status</span>
                      <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                        selectedReport.status === 'Verified'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {selectedReport.status || 'Pending Review'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Student Thoughts Section */}
              <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-xl p-5 mb-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 bg-[#003366] rounded-lg">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Student Thoughts & Experience</h3>
                </div>
                <div className="bg-white border border-blue-200 rounded-lg p-4">
                  <p className="text-gray-800 leading-relaxed">
                    {selectedReport.studentThoughts || 'No thoughts provided by the student.'}
                  </p>
                </div>
              </div>

              {/* Report Timeline */}
              <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-xl p-5">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 bg-[#00509E] rounded-lg">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Report Timeline</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-4 p-3 bg-white border border-blue-200 rounded-lg">
                    <div className="w-3 h-3 bg-[#003366] rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Report Submitted</p>
                      <p className="text-xs text-gray-600">
                        {new Date(selectedReport.reportDate).toLocaleDateString()} at{' '}
                        {new Date(selectedReport.reportDate).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  {selectedReport.status === 'Verified' && (
                    <div className="flex items-center space-x-4 p-3 bg-white border border-green-200 rounded-lg">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Report Verified</p>
                        <p className="text-xs text-gray-600">Verified by supervisor</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Weekly Report View Modal - COMSATS Theme */}
      {showWeeklyViewModal && selectedWeeklyReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#003366] to-[#00509E] p-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Week {selectedWeeklyReport.weekNumber} Report
                  </h2>
                  <p className="text-blue-100 text-sm mt-1">
                    By {selectedWeeklyReport.studentId?.name || 'Unknown Student'} • 
                    Submitted on {new Date(selectedWeeklyReport.submittedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowWeeklyViewModal(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Student & Report Info Cards */}
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
                        {selectedWeeklyReport.studentId?.name || 'Unknown'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-blue-100">
                      <span className="text-sm text-gray-600">Email</span>
                      <span className="text-sm font-medium text-gray-900">
                        {selectedWeeklyReport.studentId?.email || 'Not Provided'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-gray-600">Week Number</span>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#003366] text-white">
                        Week {selectedWeeklyReport.weekNumber}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Report Details Card */}
                <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-xl p-5">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-[#00509E] rounded-lg">
                      <Building2 className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Report Details</h3>
                  </div>
                  <div className="space-y-3">
                    {selectedWeeklyReport.companyName && (
                      <div className="flex justify-between items-center py-2 border-b border-blue-100">
                        <span className="text-sm text-gray-600">Company</span>
                        <span className="text-sm font-medium text-gray-900">
                          {selectedWeeklyReport.companyName}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center py-2 border-b border-blue-100">
                      <span className="text-sm text-gray-600">Submission Date</span>
                      <span className="text-sm font-medium text-gray-900">
                        {new Date(selectedWeeklyReport.submittedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-gray-600">Status</span>
                      <span className="text-sm font-medium px-3 py-1 rounded-full bg-green-100 text-green-700">
                        Completed
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Weekly Work Summary Section */}
              <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-xl p-5 mb-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 bg-[#003366] rounded-lg">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Weekly Work Summary</h3>
                </div>
                <div className="bg-white border border-blue-200 rounded-lg p-4">
                  <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {selectedWeeklyReport.tasksCompleted || selectedWeeklyReport.weeklyProgress || 'No work summary provided.'}
                  </p>
                </div>
              </div>

              {/* Reflections Section */}
              {selectedWeeklyReport.reflections && (
                <div className="bg-gradient-to-br from-green-50 to-white border border-green-100 rounded-xl p-5 mb-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-2 bg-green-600 rounded-lg">
                      <Star className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Reflections - What Did You Learn This Week?</h3>
                  </div>
                  <div className="bg-white border border-green-200 rounded-lg p-4">
                    <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                      {selectedWeeklyReport.reflections}
                    </p>
                  </div>
                </div>
              )}

              {/* Challenges & Plans Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                {/* Challenges Faced */}
                {selectedWeeklyReport.challengesFaced && (
                  <div className="bg-gradient-to-br from-orange-50 to-white border border-orange-100 rounded-xl p-5">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="p-2 bg-orange-500 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Challenges Faced</h3>
                    </div>
                    <div className="bg-white border border-orange-200 rounded-lg p-4">
                      <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                        {selectedWeeklyReport.challengesFaced}
                      </p>
                    </div>
                  </div>
                )}

                {/* Plans for Next Week */}
                {(selectedWeeklyReport.plansForNextWeek || selectedWeeklyReport.goalsNextWeek) && (
                  <div className="bg-gradient-to-br from-purple-50 to-white border border-purple-100 rounded-xl p-5">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="p-2 bg-purple-500 rounded-lg">
                        <Star className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Plans for Next Week</h3>
                    </div>
                    <div className="bg-white border border-purple-200 rounded-lg p-4">
                      <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                        {selectedWeeklyReport.plansForNextWeek || selectedWeeklyReport.goalsNextWeek}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Additional Comments Section */}
              {selectedWeeklyReport.supportingMaterials && (
                <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-xl p-5 mb-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-2 bg-[#00509E] rounded-lg">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Additional Comments</h3>
                  </div>
                  <div className="bg-white border border-blue-200 rounded-lg p-4">
                    <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                      {selectedWeeklyReport.supportingMaterials}
                    </p>
                  </div>
                </div>
              )}

              {/* Supporting Files Section */}
              {selectedWeeklyReport.supportingFiles && selectedWeeklyReport.supportingFiles.length > 0 && (
                <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-xl p-5 mb-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-2 bg-[#003366] rounded-lg">
                      <Download className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Supporting Files ({selectedWeeklyReport.supportingFiles.length})</h3>
                  </div>
                  <div className="space-y-2">
                    {selectedWeeklyReport.supportingFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg border border-blue-200 hover:border-blue-300 transition-colors">
                        <div className="flex items-center space-x-3">
                          <FileText className="w-5 h-5 text-[#003366]" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{file.originalname}</p>
                            <p className="text-xs text-gray-500">
                              {(file.size / 1024).toFixed(2)} KB • Uploaded {new Date(file.uploadedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleDownloadSupportingFile(selectedWeeklyReport._id, index, file.originalname)}
                          size="sm"
                          variant="outline"
                          className="hover:bg-[#003366] hover:text-white"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Supervisor Feedback Section */}
              <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-xl p-5 mt-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 bg-[#00509E] rounded-lg">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Supervisor Feedback</h3>
                </div>
                
                {selectedWeeklyReport.supervisorFeedback ? (
                  <div className="bg-white border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-[#003366]" />
                      <span className="text-sm font-medium text-[#003366]">Feedback Provided</span>
                    </div>
                    <p className="text-gray-800 leading-relaxed">
                      {typeof selectedWeeklyReport.supervisorFeedback === 'object' 
                        ? selectedWeeklyReport.supervisorFeedback.feedback || 'Feedback provided'
                        : selectedWeeklyReport.supervisorFeedback}
                    </p>
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                    <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">No supervisor feedback provided yet.</p>
                    <p className="text-sm text-gray-500 mt-1">Feedback will appear here once reviewed.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Internship Report View Modal - COMSATS Theme */}
      {showInternshipViewModal && selectedInternshipReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#003366] to-[#00509E] p-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Internship Report
                  </h2>
                  <p className="text-blue-100 text-sm mt-1">
                    {selectedInternshipReport.studentId?.name || 'Student Name'} • 
                    Submitted on {new Date(selectedInternshipReport.submittedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowInternshipViewModal(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Student Information */}
              <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-xl p-5 mb-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 bg-[#003366] rounded-lg">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900">Student Information</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between items-center py-2 border-b border-blue-100">
                    <span className="text-gray-600">Student Name</span>
                    <span className="font-medium text-gray-900">{selectedInternshipReport.studentId?.name}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-blue-100">
                    <span className="text-gray-600">Email</span>
                    <span className="font-medium text-gray-900">{selectedInternshipReport.studentId?.email}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-blue-100">
                    <span className="text-gray-600">Submitted</span>
                    <span className="font-medium text-gray-900">{new Date(selectedInternshipReport.submittedAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-blue-100">
                    <span className="text-gray-600">Company</span>
                    <span className="font-medium text-gray-900">{selectedInternshipReport.companyId?.companyName || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Report Content */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-2 h-2 bg-[#003366] rounded-full"></div>
                      <h5 className="font-semibold text-gray-900">Executive Summary</h5>
                    </div>
                    <div className="text-sm text-gray-700 max-h-32 overflow-y-auto bg-white rounded-lg p-3 border border-blue-100">
                      <p className="break-words whitespace-pre-wrap">{selectedInternshipReport.executiveSummary}</p>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-2 h-2 bg-[#00509E] rounded-full"></div>
                      <h5 className="font-semibold text-gray-900">Project Requirements</h5>
                    </div>
                    <div className="text-sm text-gray-700 max-h-32 overflow-y-auto bg-white rounded-lg p-3 border border-blue-100">
                      <p className="break-words whitespace-pre-wrap">{selectedInternshipReport.projectRequirements}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-2 h-2 bg-[#003366] rounded-full"></div>
                      <h5 className="font-semibold text-gray-900">Approach & Tools</h5>
                    </div>
                    <div className="text-sm text-gray-700 max-h-32 overflow-y-auto bg-white rounded-lg p-3 border border-blue-100">
                      <p className="break-words whitespace-pre-wrap">{selectedInternshipReport.approachAndTools}</p>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-2 h-2 bg-[#00509E] rounded-full"></div>
                      <h5 className="font-semibold text-gray-900">Outcomes Achieved</h5>
                    </div>
                    <div className="text-sm text-gray-700 max-h-32 overflow-y-auto bg-white rounded-lg p-3 border border-blue-100">
                      <p className="break-words whitespace-pre-wrap">{selectedInternshipReport.outcomesAchieved}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-xl p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-2 h-2 bg-[#003366] rounded-full"></div>
                    <h5 className="font-semibold text-gray-900">Skills Learned</h5>
                  </div>
                  <div className="text-sm text-gray-700 max-h-32 overflow-y-auto bg-white rounded-lg p-3 border border-blue-100">
                    <p className="break-words whitespace-pre-wrap">{selectedInternshipReport.skillsLearned}</p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-white border border-orange-100 rounded-xl p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="p-1.5 bg-orange-500 rounded">
                      <AlertCircle className="w-4 h-4 text-white" />
                    </div>
                    <h5 className="font-semibold text-gray-900">Challenges & Solutions</h5>
                  </div>
                  <div className="text-sm text-gray-700 max-h-32 overflow-y-auto bg-white rounded-lg p-3 border border-orange-100">
                    <p className="break-words whitespace-pre-wrap">{selectedInternshipReport.challengesAndSolutions}</p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-white border border-purple-100 rounded-xl p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="p-1.5 bg-purple-500 rounded">
                      <Star className="w-4 h-4 text-white" />
                    </div>
                    <h5 className="font-semibold text-gray-900">Reflection & Conclusion</h5>
                  </div>
                  <div className="text-sm text-gray-700 max-h-32 overflow-y-auto bg-white rounded-lg p-3 border border-purple-100">
                    <p className="break-words whitespace-pre-wrap">{selectedInternshipReport.reflectionAndConclusion}</p>
                  </div>
                </div>

                {/* Appendices */}
                {selectedInternshipReport.appendices && selectedInternshipReport.appendices.length > 0 && (
                  <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="p-1.5 bg-[#003366] rounded">
                        <Download className="w-4 h-4 text-white" />
                      </div>
                      <h5 className="font-semibold text-gray-900">Appendices ({selectedInternshipReport.appendices.length} files)</h5>
                    </div>
                    <div className="space-y-2">
                      {selectedInternshipReport.appendices.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg border border-blue-200">
                          <span className="text-sm text-gray-700">{file.originalName}</span>
                          <Button
                            onClick={() => window.open(`/api/internship-reports/${selectedInternshipReport._id}/files/${index}`, '_blank')}
                            size="sm"
                            variant="outline"
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Feedback Section */}
              <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-xl p-5 mt-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 bg-[#00509E] rounded-lg">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900">Supervisor Feedback</h4>
                </div>
                {selectedInternshipReport.supervisorFeedback ? (
                  <div className="bg-white border border-green-200 rounded-lg p-4">
                    <div className="mb-2">
                      <div className="flex items-center space-x-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800">Your Feedback</span>
                      </div>
                      <p className="text-sm text-gray-800 leading-relaxed">
                        {typeof selectedInternshipReport.supervisorFeedback === 'object' 
                          ? selectedInternshipReport.supervisorFeedback.feedback || JSON.stringify(selectedInternshipReport.supervisorFeedback)
                          : selectedInternshipReport.supervisorFeedback}
                      </p>
                    </div>
                    {selectedInternshipReport.grade && (
                      <div className="mt-3 pt-3 border-t border-green-200">
                        <span className="text-sm font-medium text-gray-900">Grade: </span>
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                          {selectedInternshipReport.grade}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-white rounded-lg p-4">
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.target);
                      const feedback = formData.get('feedback');
                      const grade = formData.get('grade');
                      handleAddFeedback(selectedInternshipReport._id, feedback, grade);
                    }}>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Feedback <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            name="feedback"
                            required
                            rows="4"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366]"
                            placeholder="Provide your feedback on the internship report..."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Grade (Optional)
                          </label>
                          <select
                            name="grade"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366]"
                          >
                            <option value="">Select Grade</option>
                            <option value="A+">A+</option>
                            <option value="A">A</option>
                            <option value="A-">A-</option>
                            <option value="B+">B+</option>
                            <option value="B">B</option>
                            <option value="B-">B-</option>
                            <option value="C+">C+</option>
                            <option value="C">C</option>
                            <option value="C-">C-</option>
                            <option value="D">D</option>
                            <option value="F">F</option>
                          </select>
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowInternshipViewModal(false)}
                          >
                            Cancel
                          </Button>
                          <Button type="submit" className="bg-[#003366] hover:bg-[#00509E]">
                            Submit Feedback
                          </Button>
                        </div>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Completion Certificate View Modal - COMSATS Theme */}
      {showCompletionViewModal && selectedCompletionCertificate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#003366] to-[#00509E] p-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Completion Certificate
                  </h2>
                  <p className="text-blue-100 text-sm mt-1">
                    {selectedCompletionCertificate.studentName || 'Student Name'} • 
                    Certificate No: {selectedCompletionCertificate.certificateNumber || 'Not Assigned'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCompletionViewModal(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">

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
                      <span className="text-sm text-gray-600">Full Name</span>
                      <span className="text-sm font-medium text-gray-900">
                        {selectedCompletionCertificate.studentName || 'Not Provided'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-blue-100">
                      <span className="text-sm text-gray-600">Registration</span>
                      <span className="text-sm font-medium text-gray-900">
                        {selectedCompletionCertificate.studentRollNumber || 'Not Provided'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-blue-100">
                      <span className="text-sm text-gray-600">Email</span>
                      <span className="text-sm font-medium text-gray-900">
                        {selectedCompletionCertificate.studentEmail || 'Not Provided'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-gray-600">Department</span>
                      <span className="text-sm font-medium text-gray-900">
                        {selectedCompletionCertificate.department || 'General'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Internship Details Card */}
                <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-xl p-5">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-[#00509E] rounded-lg">
                      <Building className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Internship Details</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-blue-100">
                      <span className="text-sm text-gray-600">Company</span>
                      <span className="text-sm font-medium text-gray-900">
                        {selectedCompletionCertificate.companyName || 'Not Specified'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-blue-100">
                      <span className="text-sm text-gray-600">Supervisor</span>
                      <span className="text-sm font-medium text-gray-900">
                        {selectedCompletionCertificate.companySupervisor || 'Not Assigned'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-blue-100">
                      <span className="text-sm text-gray-600">Designation</span>
                      <span className="text-sm font-medium text-gray-900">
                        {selectedCompletionCertificate.designation || 'Not Specified'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-blue-100">
                      <span className="text-sm text-gray-600">Duration</span>
                      <span className="text-sm font-medium text-gray-900">
                        {selectedCompletionCertificate.internshipDuration || 'Not Specified'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-blue-100">
                      <span className="text-sm text-gray-600">Start Date</span>
                      <span className="text-sm font-medium text-gray-900">
                        {selectedCompletionCertificate.internshipStartDate 
                          ? new Date(selectedCompletionCertificate.internshipStartDate).toLocaleDateString()
                          : 'Not Available'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-gray-600">End Date</span>
                      <span className="text-sm font-medium text-gray-900">
                        {selectedCompletionCertificate.internshipEndDate 
                          ? new Date(selectedCompletionCertificate.internshipEndDate).toLocaleDateString()
                          : 'Not Available'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance & Skills Section */}
              <div className="bg-gradient-to-br from-purple-50 to-white border border-purple-100 rounded-xl p-5 mb-4">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-purple-500 rounded-lg">
                    <Star className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Performance & Skills</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-600 mb-2 block">Performance Rating</label>
                      <div className="flex items-center space-x-2">
                        {selectedCompletionCertificate.performanceRating ? (
                          <>
                            <Badge 
                              variant={
                                selectedCompletionCertificate.performanceRating >= 4 ? 'success' : 
                                selectedCompletionCertificate.performanceRating >= 3 ? 'info' : 'warning'
                              }
                              className="px-3 py-1"
                            >
                              {selectedCompletionCertificate.performanceRating}/5
                            </Badge>
                            <span className="text-xs text-gray-500">
                              ({selectedCompletionCertificate.performanceRating >= 4 ? 'Excellent' : 
                               selectedCompletionCertificate.performanceRating >= 3 ? 'Good' : 'Average'})
                            </span>
                          </>
                        ) : (
                          <span className="text-sm text-gray-500">Not Rated</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 mb-2 block">Projects Completed</label>
                      <div className="bg-white border border-purple-100 rounded-lg p-3">
                        <p className="text-sm text-gray-900">
                          {selectedCompletionCertificate.projectsCompleted || 'No projects specified'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-600 mb-2 block">Technical Skills</label>
                      <div className="bg-white border border-purple-100 rounded-lg p-3">
                        <p className="text-sm text-gray-900">
                          {selectedCompletionCertificate.technicalSkills || 'No technical skills specified'}
                        </p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 mb-2 block">Soft Skills</label>
                      <div className="bg-white border border-purple-100 rounded-lg p-3">
                        <p className="text-sm text-gray-900">
                          {selectedCompletionCertificate.softSkills || 'No soft skills specified'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Report Summary & Achievements */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-xl p-5">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-2 bg-[#003366] rounded-lg">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900">Report Summary</h4>
                  </div>
                  <div className="bg-white border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {selectedCompletionCertificate.reportSummary || 'No report summary provided'}
                    </p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-white border border-green-100 rounded-xl p-5">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-2 bg-green-600 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900">Key Achievements</h4>
                  </div>
                  <div className="bg-white border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {selectedCompletionCertificate.keyAchievements || 'No achievements specified'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Learning & Future Plans */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                <div className="bg-gradient-to-br from-green-50 to-white border border-green-100 rounded-xl p-5">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-2 bg-green-600 rounded-lg">
                      <Star className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900">Overall Learning</h4>
                  </div>
                  <div className="bg-white border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {selectedCompletionCertificate.overallLearning || 'No learning summary provided'}
                    </p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-white border border-purple-100 rounded-xl p-5">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-2 bg-purple-500 rounded-lg">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900">Future Plans</h4>
                  </div>
                  <div className="bg-white border border-purple-200 rounded-lg p-4">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {selectedCompletionCertificate.futurePlans || 'No future plans specified'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Attachments Section */}
              {(selectedCompletionCertificate.certificateFile || selectedCompletionCertificate.appraisalForm) && (
                <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-xl p-5 mb-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-2 bg-[#003366] rounded-lg">
                      <Download className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Attachments</h3>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {selectedCompletionCertificate.certificateFile && (
                      <Button
                        variant="outline"
                        onClick={() => handleDownloadCompletionPDF(selectedCompletionCertificate._id, 'certificate')}
                        className="flex items-center space-x-2 hover:bg-blue-100"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download Certificate</span>
                      </Button>
                    )}
                    {selectedCompletionCertificate.appraisalForm && (
                      <Button
                        variant="outline"
                        onClick={() => handleDownloadCompletionPDF(selectedCompletionCertificate._id, 'appraisal')}
                        className="flex items-center space-x-2 hover:bg-green-100"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download Appraisal</span>
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Supervisor Feedback Section */}
              <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-xl p-5">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 bg-[#00509E] rounded-lg">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Supervisor Feedback</h3>
                </div>
                
                {selectedCompletionCertificate.supervisorFeedback ? (
                  <div className="bg-white border border-green-200 rounded-lg p-4">
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <label className="text-sm font-medium text-green-800">Your Feedback</label>
                        </div>
                        <p className="text-sm text-gray-800 leading-relaxed">
                          {typeof selectedCompletionCertificate.supervisorFeedback === 'object' 
                            ? selectedCompletionCertificate.supervisorFeedback.feedback || 'Feedback provided'
                            : selectedCompletionCertificate.supervisorFeedback}
                        </p>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-green-200">
                        <div className="flex items-center space-x-2">
                          <Badge variant="success" className="text-xs">
                            Feedback Provided
                          </Badge>
                        </div>
                        <span className="text-xs text-gray-600">
                          {selectedCompletionCertificate.feedbackDate 
                            ? new Date(selectedCompletionCertificate.feedbackDate).toLocaleDateString()
                            : 'Date not recorded'}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg p-4">
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.target);
                      const feedback = formData.get('feedback');
                      handleAddCompletionFeedback(selectedCompletionCertificate._id, feedback);
                    }}>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Provide Your Feedback <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            name="feedback"
                            required
                            rows="4"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-[#003366] resize-none"
                            placeholder="Share your thoughts on the student's completion certificate and overall internship performance..."
                          />
                        </div>
                        <div className="flex justify-end space-x-3">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowCompletionViewModal(false)}
                            className="px-4 py-2"
                          >
                            Cancel
                          </Button>
                          <Button 
                            type="submit"
                            className="px-4 py-2 bg-[#003366] hover:bg-[#00509E]"
                          >
                            Submit Feedback
                          </Button>
                        </div>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsTab;
