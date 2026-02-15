import React, { useState, useEffect } from 'react';
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
  const [misconductReports, setMisconductReports] = useState([]);
  const [progressReports, setProgressReports] = useState([]);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportType, setReportType] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch reports when component mounts
  useEffect(() => {
    fetchMisconductReports();
    fetchProgressReports();
  }, []);

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

  const handleReportCreated = () => {
    setShowReportModal(false);
    if (reportType === 'misconduct') {
      fetchMisconductReports();
    } else if (reportType === 'progress') {
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

  return (
    <div className="space-y-6">
      {/* Header with Create Buttons */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Reports</h2>
        <div className="flex space-x-3">
          <Button onClick={() => handleCreateReport('misconduct')} variant="danger">
            <Plus className="w-4 h-4 mr-2" />
            Misconduct Report
          </Button>
          <Button onClick={() => handleCreateReport('progress')} variant="primary">
            <Plus className="w-4 h-4 mr-2" />
            Progress Report
          </Button>
        </div>
      </div>

      {/* Misconduct Reports */}
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
            Misconduct Reports
          </h3>
        </div>
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
              {misconductReports.map((report) => (
                <tr key={report._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {report.studentName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {report.issueType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(report.incidentDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={getStatusColor(report.status)}>
                      {report.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(report)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {misconductReports.length === 0 && (
          <div className="p-8 text-center">
            <AlertTriangle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">No misconduct reports</p>
          </div>
        )}
      </Card>

      {/* Progress Reports */}
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
            Progress Reports
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quality
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
              {progressReports.map((report) => (
                <tr key={report._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {report.studentName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {report.reportingPeriod}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={report.qualityOfWork === 'Excellent' ? 'success' : report.qualityOfWork === 'Good' ? 'info' : 'warning'}>
                      {report.qualityOfWork}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={report.status === 'Reviewed' ? 'success' : 'warning'}>
                      {report.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(report, 'progress')}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {progressReports.length === 0 && (
          <div className="p-8 text-center">
            <TrendingUp className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">No progress reports</p>
          </div>
        )}
      </Card>

      {/* Report Creation Modal */}
      <Modal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        title={reportType === 'misconduct' ? 'Create Misconduct Report' : 'Create Progress Report'}
        size="lg"
      >
        {reportType === 'misconduct' ? (
          <MisconductReportForm onClose={handleReportCreated} />
        ) : (
          <ProgressReportForm onClose={handleReportCreated} />
        )}
      </Modal>

      {/* Report Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title=""
        size="xl"
      >
        {selectedReport && selectedReport.reportType === 'progress' ? (
          <div className="p-6 bg-white rounded-xl shadow-lg max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-center text-blue-700 mb-4 border-b pb-2">
              Progress Report
            </h1>

            <h2 className="text-lg font-semibold text-gray-700 mt-4">Student Information</h2>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <p><span className="font-medium text-gray-600">Name:</span> {selectedReport.studentName}</p>
              <p><span className="font-medium text-gray-600">Roll No:</span> {selectedReport.rollNumber}</p>
              <p><span className="font-medium text-gray-600">Department:</span> {selectedReport.department}</p>
            </div>

            <h2 className="text-lg font-semibold text-gray-700 mt-4">Report Information</h2>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <p><span className="font-medium text-gray-600">Reporting Period:</span> {selectedReport.reportingPeriod}</p>
              <p><span className="font-medium text-gray-600">Hours Worked:</span> {selectedReport.hoursWorked || 'Not specified'}</p>
              <div>
                <span className="font-medium text-gray-600">Quality of Work:</span>
                <Badge variant={selectedReport.qualityOfWork === 'Excellent' ? 'success' : selectedReport.qualityOfWork === 'Good' ? 'info' : 'warning'} className="ml-2">
                  {selectedReport.qualityOfWork}
                </Badge>
              </div>
              <div>
                <span className="font-medium text-gray-600">Status:</span>
                <Badge variant={selectedReport.status === 'Reviewed' ? 'success' : 'warning'} className="ml-2">
                  {selectedReport.status}
                </Badge>
              </div>
            </div>

            <h2 className="text-lg font-semibold text-gray-700 mt-4">Tasks Assigned</h2>
            <div className="bg-gray-50 border rounded-lg p-4 mt-2">
              <p className="text-gray-700 leading-relaxed">{selectedReport.tasksAssigned}</p>
            </div>

            <h2 className="text-lg font-semibold text-gray-700 mt-4">Progress Made</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-2">
              <p className="text-blue-800 leading-relaxed">{selectedReport.progressMade}</p>
            </div>

            {selectedReport.areasOfImprovement && (
              <>
                <h2 className="text-lg font-semibold text-gray-700 mt-4">Areas of Improvement</h2>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-2">
                  <p className="text-yellow-800 leading-relaxed">{selectedReport.areasOfImprovement}</p>
                </div>
              </>
            )}

            {selectedReport.nextGoals && (
              <>
                <h2 className="text-lg font-semibold text-gray-700 mt-4">Next Goals / Objectives</h2>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-2">
                  <p className="text-green-800 leading-relaxed">{selectedReport.nextGoals}</p>
                </div>
              </>
            )}

            {selectedReport.remarks && (
              <>
                <h2 className="text-lg font-semibold text-gray-700 mt-4">Remarks / Notes</h2>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mt-2">
                  <p className="text-purple-800 leading-relaxed">{selectedReport.remarks}</p>
                </div>
              </>
            )}

            {selectedReport.supervisorFeedback && (
              <>
                <h2 className="text-lg font-semibold text-gray-700 mt-4">Supervisor Feedback</h2>
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mt-2">
                  <p className="text-indigo-800 leading-relaxed">{selectedReport.supervisorFeedback}</p>
                </div>
              </>
            )}

            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => handleDownloadPDF(selectedReport._id, 'progress')}
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
              <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
                Close
              </Button>
            </div>
          </div>
        ) : selectedReport && (
          <div className="p-6 bg-white rounded-xl shadow-lg max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-center text-red-700 mb-4 border-b pb-2">
              Misconduct Report
            </h1>

            <h2 className="text-lg font-semibold text-gray-700 mt-4">Student Information</h2>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <p><span className="font-medium text-gray-600">Name:</span> {selectedReport.studentName}</p>
              <p><span className="font-medium text-gray-600">Roll No:</span> {selectedReport.rollNumber}</p>
            </div>

            <h2 className="text-lg font-semibold text-gray-700 mt-4">Report Details</h2>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <p><span className="font-medium text-gray-600">Issue Type:</span> {selectedReport.issueType}</p>
              <p><span className="font-medium text-gray-600">Incident Date:</span> {formatDate(selectedReport.incidentDate)}</p>
              <p><span className="font-medium text-gray-600">Submitted On:</span> {formatDate(selectedReport.createdAt)}</p>
              <div>
                <span className="font-medium text-gray-600">Status:</span>
                <Badge variant={getStatusColor(selectedReport.status)} className="ml-2">
                  {selectedReport.status}
                </Badge>
              </div>
            </div>

            <h2 className="text-lg font-semibold text-gray-700 mt-4">Description</h2>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-2">
              <p className="text-red-800 leading-relaxed">{selectedReport.description}</p>
            </div>

            {selectedReport.supervisorComments && (
              <>
                <h2 className="text-lg font-semibold text-gray-700 mt-4">Supervisor Comments</h2>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-2">
                  <p className="text-blue-800 leading-relaxed">{selectedReport.supervisorComments}</p>
                </div>
              </>
            )}

            {selectedReport.resolvedAt && (
              <div className="mt-4">
                <p><span className="font-medium text-gray-600">Resolved At:</span> {formatDate(selectedReport.resolvedAt)}</p>
              </div>
            )}

            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => handleDownloadPDF(selectedReport._id)}
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
              <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ReportsTab;