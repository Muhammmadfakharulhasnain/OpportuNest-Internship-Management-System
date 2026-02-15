import { useState, useEffect } from 'react';
import { AlertTriangle, Plus, FileText, Calendar, User, Eye, Download, TrendingUp, Award } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Card from '../../../ui/Card';
import Button from '../../../ui/Button';
import Badge from '../../../ui/Badge';
import Modal from '../../../ui/Modal';
import MisconductReportForm from './MisconductReportForm';
import ProgressReportForm from './ProgressReportForm';
import InternshipAppraisalTab from './InternshipAppraisalTab';
import { misconductReportAPI, progressReportAPI } from '../../../services/api';

const ReportsTab = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [misconductReports, setMisconductReports] = useState([]);
  const [progressReports, setProgressReports] = useState([]);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportType, setReportType] = useState('');

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
      
      const response = await progressReportAPI.getCompanyProgressReports(companyId);
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
      icon: AlertTriangle,
      color: 'text-red-500',
      bgColor: 'bg-red-50 border-red-200',
      activeColor: 'border-red-500 text-red-600'
    },
    {
      name: 'Progress Reports',
      icon: TrendingUp,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 border-blue-200',
      activeColor: 'border-blue-500 text-blue-600'
    },
    {
      name: 'Internship Appraisals',
      icon: Award,
      color: 'text-green-500',
      bgColor: 'bg-green-50 border-green-200',
      activeColor: 'border-green-500 text-green-600'
    }
  ];

  const renderMisconductReports = () => (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
            Misconduct Reports
          </h3>
          <p className="text-gray-600">Report student misconduct and track resolutions</p>
        </div>
        <Button onClick={() => handleCreateReport('misconduct')} variant="danger">
          <Plus className="w-4 h-4 mr-2" />
          Create Report
        </Button>
      </div>

      {/* Reports Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Issue Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {misconductReports.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    <AlertTriangle className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                    <p className="text-lg font-medium text-gray-900 mb-2">No Misconduct Reports</p>
                    <p>You haven't submitted any misconduct reports yet.</p>
                  </td>
                </tr>
              ) : (
                misconductReports.map((report) => (
                  <tr key={report._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="w-5 h-5 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">{report.studentName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{report.issueType}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(report.incidentDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getStatusColor(report.status)}>
                        {report.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleViewDetails(report, 'misconduct')}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleDownloadPDF(report._id, 'misconduct')}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        PDF
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  const renderProgressReports = () => (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
            Progress Reports
          </h3>
          <p className="text-gray-600">Track student progress and provide feedback</p>
        </div>
        <Button onClick={() => handleCreateReport('progress')} variant="primary">
          <Plus className="w-4 h-4 mr-2" />
          Create Report
        </Button>
      </div>

      {/* Reports Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Report Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {progressReports.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    <TrendingUp className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                    <p className="text-lg font-medium text-gray-900 mb-2">No Progress Reports</p>
                    <p>You haven't submitted any progress reports yet.</p>
                  </td>
                </tr>
              ) : (
                progressReports.map((report) => (
                  <tr key={report._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="w-5 h-5 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">{report.studentName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{report.reportPeriod}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{report.overallPerformance}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(report.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleViewDetails(report, 'progress')}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleDownloadPDF(report._id, 'progress')}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        PDF
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {tabs.map((tab, index) => {
          const Icon = tab.icon;
          const isActive = activeTab === index;
          
          return (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                isActive
                  ? `bg-white shadow-sm ${tab.activeColor}`
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className={`w-4 h-4 mr-2 ${isActive ? '' : 'text-gray-400'}`} />
              {tab.name}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
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

      {/* View Details Modal */}
      {showDetailsModal && selectedReport && (
        <Modal 
          isOpen={showDetailsModal} 
          onClose={() => setShowDetailsModal(false)} 
          title={`${selectedReport.reportType === 'progress' ? 'Progress' : 'Misconduct'} Report Details`}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Student Name</label>
                <p className="mt-1 text-sm text-gray-900">{selectedReport.studentName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {selectedReport.reportType === 'progress' ? 'Report Period' : 'Issue Type'}
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedReport.reportType === 'progress' ? selectedReport.reportPeriod : selectedReport.issueType}
                </p>
              </div>
            </div>
            
            {selectedReport.reportType === 'misconduct' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Incident Date</label>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(selectedReport.incidentDate)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <Badge variant={getStatusColor(selectedReport.status)} className="mt-1">
                    {selectedReport.status}
                  </Badge>
                </div>
              </>
            )}
            
            {selectedReport.reportType === 'progress' && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Overall Performance</label>
                <p className="mt-1 text-sm text-gray-900">{selectedReport.overallPerformance}</p>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Description/Comments</label>
              <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                {selectedReport.description || selectedReport.comments || 'No description provided.'}
              </p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ReportsTab;
