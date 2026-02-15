import React, { useState, useEffect } from 'react';
import { AlertTriangle, Eye, Download, Calendar, Building } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Card from '../../../ui/Card';
import Button from '../../../ui/Button';
import Badge from '../../../ui/Badge';
import Modal from '../../../ui/Modal';
import { misconductReportAPI } from '../../../services/api';

const ReportsViewTab = () => {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const userString = localStorage.getItem('user');
      if (!userString) return;
      
      const user = JSON.parse(userString);
      const studentId = user.id;
      
      // Get reports where this student is the subject
      const response = await misconductReportAPI.getStudentReports(studentId);
      setReports(response.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (report) => {
    setSelectedReport(report);
    setShowDetailsModal(true);
  };

  const handleDownloadPDF = async (reportId) => {
    try {
      await misconductReportAPI.downloadReportPDF(reportId);
      toast.success('Report downloaded successfully');
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error('Failed to download report');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
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

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003366]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Enhanced Header Section - COMSATS Design */}
      <div className="relative bg-gradient-to-r from-[#003366] via-[#00509E] to-[#003366] rounded-lg p-5 text-white shadow-md overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-white/10 rounded-lg shadow-sm">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-1 text-white">
                  Company Reports
                </h1>
                <p className="text-blue-100 text-sm font-medium">
                  View misconduct reports submitted by companies regarding your internship
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-blue-200 text-xs font-medium">Report Status</p>
                <div className="flex items-center gap-1 mt-1">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-white font-bold text-sm">Active</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Quick Stats - COMSATS Compact */}
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center gap-1 mb-0.5">
                <AlertTriangle className="w-3 h-3 text-blue-200" />
                <span className="text-blue-200 text-xs font-medium">Total Reports</span>
              </div>
              <p className="text-white font-bold text-sm">{reports.length}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center gap-1 mb-0.5">
                <Calendar className="w-3 h-3 text-blue-200" />
                <span className="text-blue-200 text-xs font-medium">Pending</span>
              </div>
              <p className="text-white font-bold text-sm">
                {reports.filter(report => report.status === 'Pending').length}
              </p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center gap-1 mb-0.5">
                <Eye className="w-3 h-3 text-blue-200" />
                <span className="text-blue-200 text-xs font-medium">Resolved</span>
              </div>
              <p className="text-white font-bold text-sm">
                {reports.filter(report => report.status === 'Resolved').length}
              </p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center gap-1 mb-0.5">
                <Building className="w-3 h-3 text-blue-200" />
                <span className="text-blue-200 text-xs font-medium">Companies</span>
              </div>
              <p className="text-white font-bold text-sm">
                {new Set(reports.map(report => report.companyName)).size}
              </p>
            </div>
          </div>
        </div>
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full transform translate-x-16 -translate-y-16"></div>
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-white rounded-full transform -translate-x-10 translate-y-10"></div>
        </div>
      </div>

      {/* Reports Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Issue Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Incident Date
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
              {reports.map((report) => (
                <tr key={report._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Building className="w-5 h-5 text-[#003366] mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {report.companyName}
                        </div>
                        <div className="text-sm text-gray-500">
                          Reported on {formatDate(report.createdAt)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <AlertTriangle className="w-4 h-4 text-[#00509E] mr-2" />
                      <span className="text-sm text-gray-900">{report.issueType}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1 text-gray-600" />
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
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(report)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadPDF(report._id)}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      PDF
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {reports.length === 0 && (
          <div className="p-12 text-center">
            <div className="bg-gray-100 p-6 rounded-full mx-auto w-20 h-20 flex items-center justify-center mb-4">
              <AlertTriangle className="w-10 h-10 text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Misconduct Reports
            </h3>
            <p className="text-gray-600">
              No misconduct reports have been filed against you.
            </p>
          </div>
        )}
      </Card>

      {/* Report Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Misconduct Report Details"
        size="lg"
      >
        {selectedReport && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Company Name</label>
                <p className="mt-1 text-sm text-gray-900">{selectedReport.companyName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Issue Type</label>
                <p className="mt-1 text-sm text-gray-900">{selectedReport.issueType}</p>
              </div>
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
              <div>
                <label className="block text-sm font-medium text-gray-700">Reported On</label>
                <p className="mt-1 text-sm text-gray-900">{formatDate(selectedReport.createdAt)}</p>
              </div>
              {selectedReport.resolvedAt && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Resolved At</label>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(selectedReport.resolvedAt)}</p>
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <div className="mt-1 p-3 bg-gray-50 border border-gray-200 rounded-md">
                <p className="text-sm text-gray-800 whitespace-pre-wrap">{selectedReport.description}</p>
              </div>
            </div>
            
            {selectedReport.supervisorComments && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Supervisor Comments</label>
                <div className="mt-1 p-3 bg-gray-50 border border-gray-200 rounded-md">
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">{selectedReport.supervisorComments}</p>
                </div>
              </div>
            )}
            
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => handleDownloadPDF(selectedReport._id)}
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowDetailsModal(false)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ReportsViewTab;