import React, { useState } from 'react';
import { Download, Eye, FileText, Calendar, User, AlertTriangle } from 'lucide-react';
import { mockReports } from '../../../data/mockData';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import Badge from '../../ui/Badge';
import Modal from '../../ui/Modal';
import Select from '../../ui/Select';

const ReportsTab = () => {
  const [reports] = useState([
    ...mockReports,
    {
      id: 2,
      studentId: 1,
      type: 'misconduct',
      title: 'Misconduct Report - Absenteeism',
      studentName: 'Ahmad Ali',
      companyName: 'Tech Solutions Ltd',
      issueType: 'absenteeism',
      description: 'Student has been absent for 3 consecutive days without notice.',
      submittedAt: '2024-06-10',
      status: 'pending'
    },
    {
      id: 3,
      studentId: 1,
      type: 'appraisal',
      title: 'Internship Appraisal - Ahmad Ali',
      studentName: 'Ahmad Ali',
      companyName: 'Tech Solutions Ltd',
      performance: 'good',
      rating: 8,
      comments: 'Good performance overall, shows initiative and learns quickly.',
      submittedAt: '2024-08-25',
      status: 'submitted'
    }
  ]);
  
  const [selectedReport, setSelectedReport] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [filterType, setFilterType] = useState('');

  const handleViewReport = (report) => {
    setSelectedReport(report);
    setShowReportModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted': return 'success';
      case 'pending': return 'warning';
      case 'reviewed': return 'info';
      default: return 'default';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'weekly': return 'info';
      case 'misconduct': return 'danger';
      case 'appraisal': return 'success';
      case 'internship': return 'primary';
      default: return 'default';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'misconduct': return AlertTriangle;
      default: return FileText;
    }
  };

  const filteredReports = filterType 
    ? reports.filter(report => report.type === filterType)
    : reports;

  const reportTypeOptions = [
    { value: '', label: 'All Reports' },
    { value: 'weekly', label: 'Weekly Reports' },
    { value: 'misconduct', label: 'Misconduct Reports' },
    { value: 'appraisal', label: 'Appraisal Reports' },
    { value: 'internship', label: 'Internship Reports' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Reports Management</h2>
        <div className="flex items-center space-x-4">
          <Select
            options={reportTypeOptions}
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-48"
          />
          <div className="flex space-x-2">
            <Badge variant="info">Weekly: {reports.filter(r => r.type === 'weekly').length}</Badge>
            <Badge variant="danger">Misconduct: {reports.filter(r => r.type === 'misconduct').length}</Badge>
            <Badge variant="success">Appraisal: {reports.filter(r => r.type === 'appraisal').length}</Badge>
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.map((report) => {
          const TypeIcon = getTypeIcon(report.type);
          
          return (
            <Card key={report.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-full ${
                    report.type === 'misconduct' ? 'bg-red-100' : 'bg-blue-100'
                  }`}>
                    <TypeIcon className={`w-6 h-6 ${
                      report.type === 'misconduct' ? 'text-red-600' : 'text-blue-600'
                    }`} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {report.title}
                      </h3>
                      <Badge variant={getTypeColor(report.type)}>
                        {report.type.charAt(0).toUpperCase() + report.type.slice(1)}
                      </Badge>
                      <Badge variant={getStatusColor(report.status)}>
                        {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          {report.studentName || 'Ahmad Ali'}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(report.submittedAt).toLocaleDateString()}
                        </div>
                        {report.companyName && (
                          <div>Company: {report.companyName}</div>
                        )}
                      </div>
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
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {filteredReports.length === 0 && (
        <Card className="p-12 text-center">
          <div className="text-gray-400 mb-4">
            <FileText className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Reports Found
          </h3>
          <p className="text-gray-600">
            {filterType ? `No ${filterType} reports available.` : 'No reports have been submitted yet.'}
          </p>
        </Card>
      )}

      {/* Report Details Modal */}
      <Modal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        title="Report Details"
        size="lg"
      >
        {selectedReport && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedReport.title}
                </h2>
                <p className="text-gray-600">
                  Submitted by: {selectedReport.studentName || 'Ahmad Ali'}
                </p>
              </div>
              <div className="flex space-x-2">
                <Badge variant={getTypeColor(selectedReport.type)} size="md">
                  {selectedReport.type.charAt(0).toUpperCase() + selectedReport.type.slice(1)}
                </Badge>
                <Badge variant={getStatusColor(selectedReport.status)} size="md">
                  {selectedReport.status.charAt(0).toUpperCase() + selectedReport.status.slice(1)}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Submission Date</p>
                <p className="text-gray-900">
                  {new Date(selectedReport.submittedAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Report ID</p>
                <p className="text-gray-900">#{selectedReport.id}</p>
              </div>
              {selectedReport.companyName && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Company</p>
                  <p className="text-gray-900">{selectedReport.companyName}</p>
                </div>
              )}
            </div>

            {/* Report-specific content */}
            {selectedReport.type === 'weekly' && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Weekly Progress</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <div>
                    <p className="font-medium text-gray-700">Tasks Completed:</p>
                    <p className="text-gray-600">{selectedReport.tasksCompleted}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Challenges:</p>
                    <p className="text-gray-600">{selectedReport.challenges}</p>
                  </div>
                </div>
              </div>
            )}

            {selectedReport.type === 'misconduct' && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Misconduct Details</h3>
                <div className="bg-red-50 p-4 rounded-lg space-y-3">
                  <div>
                    <p className="font-medium text-red-800">Issue Type:</p>
                    <p className="text-red-700 capitalize">{selectedReport.issueType}</p>
                  </div>
                  <div>
                    <p className="font-medium text-red-800">Description:</p>
                    <p className="text-red-700">{selectedReport.description}</p>
                  </div>
                </div>
              </div>
            )}

            {selectedReport.type === 'appraisal' && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Performance Appraisal</h3>
                <div className="bg-green-50 p-4 rounded-lg space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="font-medium text-green-800">Performance:</p>
                      <p className="text-green-700 capitalize">{selectedReport.performance}</p>
                    </div>
                    <div>
                      <p className="font-medium text-green-800">Rating:</p>
                      <p className="text-green-700">{selectedReport.rating}/10</p>
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-green-800">Comments:</p>
                    <p className="text-green-700">{selectedReport.comments}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
              {selectedReport.type === 'misconduct' && selectedReport.status === 'pending' && (
                <Button variant="danger">
                  Take Action
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ReportsTab;