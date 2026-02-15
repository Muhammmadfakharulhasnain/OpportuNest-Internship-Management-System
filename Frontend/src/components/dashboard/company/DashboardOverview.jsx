import { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, Users, Calendar, Trophy, FileText, 
  CheckCircle, AlertCircle, Clock, Star, Award, Target,
  MessageSquare, Bell, BookOpen, Search, User, ArrowRight,
  Briefcase, Building2, ClipboardCheck
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import Card from '../../../ui/Card';
import Button from '../../../ui/Button';
import Badge from '../../../ui/Badge';
import { toast } from 'react-hot-toast';
import { applicationAPI, internshipReportAPI } from '../../../services/api';

const DashboardOverview = ({ setActiveTab }) => {
  const { currentUser } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    profile: null,
    jobsCount: 0,
    applicationsCount: 0,
    recentApplications: [],
    recentReports: [],
    reportsCount: {
      misconduct: 0,
      progress: 0,
      appraisals: 0
    },
    notifications: 0,
    messages: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      try {
        const applicationsResponse = await applicationAPI.getCompanyApplications();
        if (applicationsResponse.success && applicationsResponse.data) {
          const recentApps = applicationsResponse.data.slice(0, 3);
          setDashboardData(prev => ({
            ...prev,
            recentApplications: recentApps,
            applicationsCount: applicationsResponse.data.length
          }));
        }
      } catch (error) {
        console.log('Could not fetch applications:', error.message);
      }

      try {
        const reportsResponse = await internshipReportAPI.getCompanyReports();
        if (reportsResponse.success && reportsResponse.data) {
          const recentReps = reportsResponse.data.slice(0, 3);
          setDashboardData(prev => ({
            ...prev,
            recentReports: recentReps,
            reportsCount: {
              misconduct: reportsResponse.data.filter(r => r.type === 'misconduct').length,
              progress: reportsResponse.data.filter(r => r.type === 'progress').length,
              appraisals: reportsResponse.data.filter(r => r.type === 'appraisal').length
            }
          }));
        }
      } catch (error) {
        console.log('Could not fetch reports:', error.message);
      }

      setDashboardData(prev => ({
        ...prev,
        jobsCount: 5
      }));

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Post Jobs',
      description: 'Create new internship opportunities',
      icon: Briefcase,
      color: 'text-[#003366]',
      bgColor: 'bg-blue-50',
      action: () => setActiveTab(1),
      badge: 'Active'
    },
    {
      title: 'View Applications',
      description: 'Review student applications',
      icon: Users,
      color: 'text-[#00509E]',
      bgColor: 'bg-gray-50',
      action: () => setActiveTab(2),
      badge: dashboardData.applicationsCount > 0 ? `${dashboardData.applicationsCount}` : '0'
    },
    {
      title: 'Manage Reports',
      description: 'Create and review reports',
      icon: FileText,
      color: 'text-[#003366]',
      bgColor: 'bg-blue-50',
      action: () => setActiveTab(3),
      badge: 'Reports'
    },
    {
      title: 'Company Profile',
      description: 'Update company information',
      icon: Building2,
      color: 'text-[#00509E]',
      bgColor: 'bg-gray-50',
      action: () => setActiveTab(5),
      badge: 'Profile'
    }
  ];

  const statsCards = [
    {
      title: 'Active Jobs',
      value: dashboardData.jobsCount,
      icon: Briefcase,
      color: 'text-[#003366]',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Applications',
      value: dashboardData.applicationsCount,
      icon: Users,
      color: 'text-[#00509E]',
      bgColor: 'bg-gray-50'
    },
    {
      title: 'Reports',
      value: dashboardData.reportsCount.misconduct + dashboardData.reportsCount.progress + dashboardData.reportsCount.appraisals,
      icon: FileText,
      color: 'text-[#003366]',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Evaluations',
      value: dashboardData.reportsCount.appraisals,
      icon: ClipboardCheck,
      color: 'text-[#00509E]',
      bgColor: 'bg-gray-50'
    }
  ];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-8">
        <Card className="p-12 text-center border border-gray-200">
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-gray-100 p-4 rounded-full animate-pulse">
              <BarChart3 className="w-8 h-8 text-gray-500" />
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-32 animate-pulse"></div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#003366]"></div>
              <p className="text-gray-600 font-medium">Loading dashboard...</p>
            </div>
          </div>
        </Card>
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
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-1 text-white">
                  Company Dashboard
                </h1>
                <p className="text-blue-100 text-sm font-medium">
                  Manage your internship programs and connect with students
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-blue-200 text-xs font-medium">Company Status</p>
                <div className="flex items-center gap-1 mt-1">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-white font-bold text-sm">Active Company</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Quick Stats - COMSATS Compact */}
          <div className="grid grid-cols-4 gap-3">
            {statsCards.map((stat, index) => (
              <div key={index} className="bg-white/10 rounded-lg p-3">
                <div className="flex items-center gap-1 mb-0.5">
                  <stat.icon className="w-3 h-3 text-blue-200" />
                  <span className="text-blue-200 text-xs font-medium">{stat.title}</span>
                </div>
                <p className="text-white font-bold text-sm">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full transform translate-x-16 -translate-y-16"></div>
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-white rounded-full transform -translate-x-10 translate-y-10"></div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickActions.map((action, index) => (
          <Card key={index} className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group" onClick={action.action}>
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${action.bgColor}`}>
                <action.icon className={`w-6 h-6 ${action.color}`} />
              </div>
              <Badge variant="info" size="sm" className="bg-gray-100 text-gray-700 border border-gray-200">
                {action.badge}
              </Badge>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-[#00509E] transition-colors">
              {action.title}
            </h3>
            <p className="text-gray-600 text-sm">
              {action.description}
            </p>
          </Card>
        ))}
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#003366]" />
              Recent Applications
            </h3>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setActiveTab(2)}
              className="text-[#003366] border-[#003366] hover:bg-[#003366] hover:text-white"
            >
              View All
            </Button>
          </div>
          <div className="space-y-3">
            {dashboardData.recentApplications.length > 0 ? (
              dashboardData.recentApplications.map((app, index) => (
                <div key={app._id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#003366] rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{app.studentName || 'Student Application'}</p>
                      <p className="text-sm text-gray-600">{app.jobTitle || 'Internship Position'}</p>
                    </div>
                  </div>
                  <Badge variant="info" size="sm">{app.status || 'New'}</Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">
                <p className="text-sm">No recent applications</p>
              </div>
            )}
          </div>
        </Card>

        {/* Recent Reports */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#003366]" />
              Recent Reports
            </h3>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setActiveTab(3)}
              className="text-[#003366] border-[#003366] hover:bg-[#003366] hover:text-white"
            >
              View All
            </Button>
          </div>
          <div className="space-y-3">
            {dashboardData.recentReports.length > 0 ? (
              dashboardData.recentReports.map((report, index) => (
                <div key={report._id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#00509E] rounded-full flex items-center justify-center">
                      <FileText className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{report.reportType || 'Report'}</p>
                      <p className="text-sm text-gray-600">{report.studentName || 'Student'}</p>
                    </div>
                  </div>
                  <Badge 
                    variant={report.status === 'Completed' ? 'success' : report.status === 'Pending' ? 'warning' : 'info'} 
                    size="sm"
                  >
                    {report.status || 'Pending'}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">
                <p className="text-sm">No recent reports</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardOverview;