import { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, Users, Calendar, Trophy, FileText, 
  CheckCircle, AlertCircle, Clock, Star, Award, Target,
  MessageSquare, Bell, BookOpen, Search, User, ArrowRight
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import Card from '../../../ui/Card';
import Button from '../../../ui/Button';
import Badge from '../../../ui/Badge';
import { studentAPI, joiningReportAPI, weeklyReportAPI, internshipReportAPI } from '../../../services/api';
import { toast } from 'react-hot-toast';

const DashboardOverview = ({ setActiveTab }) => {
  const { currentUser } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    profile: null,
    reportsCount: {
      joining: 0,
      weekly: 0,
      internship: 0
    },
    applications: 0,
    supervisor: null,
    notifications: 0,
    messages: 0
  });
  const [loading, setLoading] = useState(true);

  // Load data on mount - component remounts when user switches back to dashboard tab
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load profile data
      try {
        const profileResponse = await studentAPI.getProfile();
        if (profileResponse.success) {
          setDashboardData(prev => ({
            ...prev,
            profile: profileResponse.data
          }));
        }
      } catch (error) {
        console.log('Profile not found - new user');
      }

      // Load reports data
      try {
        const joiningResponse = await joiningReportAPI.getStudentJoiningReport();
        const weeklyResponse = await weeklyReportAPI.getStudentReports();
        const internshipResponse = await internshipReportAPI.getStudentReport();
        
        setDashboardData(prev => ({
          ...prev,
          reportsCount: {
            joining: joiningResponse.success && joiningResponse.data ? 1 : 0,
            weekly: weeklyResponse.data?.reports?.length || 0,
            internship: internshipResponse.success && internshipResponse.data ? 1 : 0
          }
        }));
      } catch (error) {
        console.log('Reports data not available');
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Find Jobs',
      description: 'Browse available internship opportunities',
      icon: Search,
      color: 'text-[#003366]',
      bgColor: 'bg-blue-50',
      action: () => setActiveTab(1),
      badge: 'Hot'
    },
    {
      title: 'Submit Reports',
      description: 'Submit your weekly and internship reports',
      icon: FileText,
      color: 'text-[#00509E]',
      bgColor: 'bg-gray-50',
      action: () => setActiveTab(7),
      badge: dashboardData.reportsCount.weekly > 0 ? 'Active' : 'Start'
    },
    {
      title: 'Find Supervisor',
      description: 'Search and request supervision',
      icon: Users,
      color: 'text-[#003366]',
      bgColor: 'bg-blue-50',
      action: () => setActiveTab(4),
      badge: 'Required'
    },
    {
      title: 'Complete Profile',
      description: 'Update your academic profile',
      icon: User,
      color: 'text-[#00509E]',
      bgColor: 'bg-gray-50',
      action: () => setActiveTab(13),
      badge: `${dashboardData.profile?.profileCompletionPercentage || 0}%`
    }
  ];

  const statsCards = [
    {
      title: 'Profile Completion',
      value: `${dashboardData.profile?.profileCompletionPercentage || 0}%`,
      icon: User,
      color: dashboardData.profile?.profileCompletionPercentage >= 80 ? 'text-green-600' : 
             dashboardData.profile?.profileCompletionPercentage >= 50 ? 'text-yellow-600' : 'text-red-600',
      bgColor: dashboardData.profile?.profileCompletionPercentage >= 80 ? 'bg-green-50' : 
               dashboardData.profile?.profileCompletionPercentage >= 50 ? 'bg-yellow-50' : 'bg-red-50'
    },
    {
      title: 'Reports Submitted',
      value: dashboardData.reportsCount.joining + dashboardData.reportsCount.weekly + dashboardData.reportsCount.internship,
      icon: FileText,
      color: 'text-[#003366]',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Current CGPA',
      value: dashboardData.profile?.cgpa || 'N/A',
      icon: TrendingUp,
      color: 'text-[#00509E]',
      bgColor: 'bg-gray-50'
    },
    {
      title: 'Applications',
      value: dashboardData.applications,
      icon: BookOpen,
      color: 'text-[#003366]',
      bgColor: 'bg-blue-50'
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
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-1 text-white">
                  Student Dashboard
                </h1>
                <p className="text-blue-100 text-sm font-medium">
                  Your internship journey overview and quick actions
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-blue-200 text-xs font-medium">Academic Status</p>
                <div className="flex items-center gap-1 mt-1">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-white font-bold text-sm">Active Student</span>
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
            <p className="text-gray-600 text-sm mb-4">
              {action.description}
            </p>
            <div className="flex items-center text-[#003366] text-sm font-medium">
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Card>
        ))}
      </div>

      {/* Main Dashboard Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Academic Progress */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <Trophy className="w-5 h-5 mr-2 text-[#003366]" />
              Academic Progress
            </h2>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setActiveTab(13)}
              className="border-[#003366] text-[#003366] hover:bg-[#003366] hover:text-white"
            >
              View Profile
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-[#003366] mb-1">
                {dashboardData.profile?.cgpa || 'N/A'}
              </div>
              <div className="text-sm text-gray-600">Current CGPA</div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-[#00509E] mb-1">
                {dashboardData.profile?.semester || 'N/A'}
              </div>
              <div className="text-sm text-gray-600">Semester</div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-700 mb-1">
                {dashboardData.profile?.attendance ? `${dashboardData.profile.attendance}%` : 'N/A'}
              </div>
              <div className="text-sm text-gray-600">Attendance</div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-[#00509E] mb-1">
                {dashboardData.profile?.backlogs || 0}
              </div>
              <div className="text-sm text-gray-600">Backlogs</div>
            </div>
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-[#00509E]" />
            Recent Activity
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-[#003366] rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Profile Updated</p>
                <p className="text-xs text-gray-500">Completion: {dashboardData.profile?.profileCompletionPercentage || 0}%</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-[#00509E] rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Reports Status</p>
                <p className="text-xs text-gray-500">
                  {dashboardData.reportsCount.weekly} weekly reports submitted
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Dashboard Access</p>
                <p className="text-xs text-gray-500">Last login: Today</p>
              </div>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setActiveTab(11)} 
            className="w-full mt-4 border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            View All Notifications
          </Button>
        </Card>
      </div>

      {/* Reports Overview */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-[#003366]" />
            Reports Overview
          </h2>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setActiveTab(7)}
            className="border-[#003366] text-[#003366] hover:bg-[#003366] hover:text-white"
          >
            Manage Reports
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-6 h-6 text-[#003366]" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Joining Report</h3>
            <div className="text-2xl font-bold text-[#003366] mb-2">
              {dashboardData.reportsCount.joining}
            </div>
            <Badge 
              variant={dashboardData.reportsCount.joining > 0 ? 'success' : 'warning'}
              className={dashboardData.reportsCount.joining > 0 ? 'bg-gray-100 text-gray-700 border border-gray-200' : ''}
            >
              {dashboardData.reportsCount.joining > 0 ? 'Submitted' : 'Pending'}
            </Badge>
          </div>
          
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-6 h-6 text-[#00509E]" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Weekly Reports</h3>
            <div className="text-2xl font-bold text-[#00509E] mb-2">
              {dashboardData.reportsCount.weekly}
            </div>
            <Badge variant="info" className="bg-gray-100 text-gray-700 border border-gray-200">
              {dashboardData.reportsCount.weekly} Submitted
            </Badge>
          </div>
          
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-6 h-6 text-gray-700" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Final Report</h3>
            <div className="text-2xl font-bold text-gray-700 mb-2">
              {dashboardData.reportsCount.internship}
            </div>
            <Badge 
              variant={dashboardData.reportsCount.internship > 0 ? 'success' : 'secondary'}
              className="bg-gray-100 text-gray-700 border border-gray-200"
            >
              {dashboardData.reportsCount.internship > 0 ? 'Submitted' : 'Pending'}
            </Badge>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DashboardOverview;