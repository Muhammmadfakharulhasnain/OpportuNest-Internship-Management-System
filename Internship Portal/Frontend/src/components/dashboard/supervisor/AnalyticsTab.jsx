import React from 'react';
import { TrendingUp, Users, FileText, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import Card from '../../../ui/Card';
import Badge from '../../../ui/Badge';

const AnalyticsTab = () => {
  const analyticsData = {
    totalStudents: 5,
    activeInternships: 3,
    completedInternships: 2,
    totalReports: 45,
    pendingReports: 3,
    averageScore: 82,
    misconductReports: 1,
    evaluationsCompleted: 2
  };

  const recentActivity = [
    {
      id: 1,
      type: 'report_submitted',
      student: 'Ahmad Ali',
      description: 'Weekly Report #8 submitted',
      timestamp: '2024-06-15T10:30:00',
      status: 'success'
    },
    {
      id: 2,
      type: 'evaluation_completed',
      student: 'Sara Ahmed',
      description: 'Final evaluation completed',
      timestamp: '2024-06-14T14:20:00',
      status: 'success'
    },
    {
      id: 3,
      type: 'misconduct_reported',
      student: 'Ahmad Ali',
      description: 'Misconduct report received',
      timestamp: '2024-06-10T09:15:00',
      status: 'warning'
    }
  ];

  const performanceMetrics = [
    { label: 'Weekly Reports', submitted: 32, total: 35, percentage: 91 },
    { label: 'Joining Reports', submitted: 5, total: 5, percentage: 100 },
    { label: 'Final Reports', submitted: 2, total: 2, percentage: 100 },
    { label: 'Evaluations', submitted: 2, total: 3, percentage: 67 }
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case 'report_submitted': return FileText;
      case 'evaluation_completed': return CheckCircle;
      case 'misconduct_reported': return AlertTriangle;
      default: return Clock;
    }
  };

  const getActivityColor = (status) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <h2 className="text-xl font-semibold text-gray-900">Analytics & Reports</h2>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-4">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.totalStudents}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-full">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Internships</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.activeInternships}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-full">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Reports</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.totalReports}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center">
            <div className="bg-orange-100 p-3 rounded-full">
              <CheckCircle className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg. Score</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.averageScore}%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
        <div className="space-y-4">
          {performanceMetrics.map((metric, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">{metric.label}</span>
                  <span className="text-sm text-gray-500">
                    {metric.submitted}/{metric.total} ({metric.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      metric.percentage >= 90 ? 'bg-green-500' :
                      metric.percentage >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${metric.percentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent Activity */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {recentActivity.map((activity) => {
            const ActivityIcon = getActivityIcon(activity.type);
            
            return (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`p-2 rounded-full ${getActivityColor(activity.status)}`}>
                  <ActivityIcon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-500">
                    {activity.student} • {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-green-50 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-800">Completed Internships</p>
              <p className="text-2xl font-bold text-green-900">{analyticsData.completedInternships}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-6 bg-yellow-50 border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-800">Pending Reports</p>
              <p className="text-2xl font-bold text-yellow-900">{analyticsData.pendingReports}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </Card>

        <Card className="p-6 bg-red-50 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-800">Misconduct Reports</p>
              <p className="text-2xl font-bold text-red-900">{analyticsData.misconductReports}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsTab;