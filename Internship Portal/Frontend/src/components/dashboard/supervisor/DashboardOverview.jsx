import { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, Users, Calendar, Trophy, FileText, 
  CheckCircle, AlertCircle, Clock, Star, Award, Target,
  MessageSquare, Bell, BookOpen, Search, User, ArrowRight,
  UserCheck, ClipboardCheck, AlertTriangle, UserPlus
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import Card from '../../../ui/Card';
import Button from '../../../ui/Button';
import Badge from '../../../ui/Badge';
import { supervisorAPI } from '../../../services/api';

const DashboardOverview = ({ setActiveTab, refreshTrigger }) => {
  const { currentUser } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    profile: null,
    studentsCount: 0,
    activeStudents: 0,
    completedStudents: 0,
    reportsCount: {
      pending: 0,
      reviewed: 0,
      total: 0
    },
    evaluationsCount: {
      pending: 0,
      completed: 0,
      total: 0
    },
    supervisionRequests: 0,
    applications: 0,
    messages: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Refresh data when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger) {
      loadDashboardData();
    }
  }, [refreshTrigger]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load supervisor dashboard stats from API
      try {
        const statsResponse = await supervisorAPI.getDashboardStats();
        if (statsResponse.success) {
          const data = statsResponse.data;
          setDashboardData({
            profile: data.profile,
            studentsCount: data.studentsCount || 0,
            activeStudents: data.activeStudents || 0,
            completedStudents: data.completedStudents || 0,
            inProgressStudents: data.inProgressStudents || 0,
            reportsCount: {
              pending: data.reportsCount?.pending || 0,
              reviewed: data.reportsCount?.reviewed || 0,
              total: data.reportsCount?.total || 0
            },
            evaluationsCount: {
              pending: data.evaluationsCount?.pending || 0,
              completed: data.evaluationsCount?.completed || 0,
              total: data.evaluationsCount?.total || 0
            },
            supervisionRequests: data.supervisionRequests || 0,
            applications: data.jobApplications || 0,
            messages: data.unreadMessages || 0,
            recentActivity: data.recentActivity || []
          });
        }
      } catch (error) {
        console.warn('⚠️ Dashboard stats not available:', error.message || 'No data yet');
        // Set default values if API fails
        setDashboardData({
          profile: null,
          studentsCount: 0,
          activeStudents: 0,
          completedStudents: 0,
          inProgressStudents: 0,
          reportsCount: { pending: 0, reviewed: 0, total: 0 },
          evaluationsCount: { pending: 0, completed: 0, total: 0 },
          supervisionRequests: 0,
          applications: 0,
          messages: 0,
          recentActivity: []
        });
      }

    } catch (error) {
      console.warn('⚠️ Dashboard initialization:', error.message || 'Loading default values');
    } finally {
      setLoading(false);
    }
  };

  // Expose refresh function for parent component
  window.refreshSupervisorDashboard = loadDashboardData;

  const quickActions = [
    {
      title: 'Review Reports',
      description: 'Review pending student reports',
      icon: FileText,
      color: 'text-[#003366]',
      bgColor: 'bg-blue-50',
      action: () => setActiveTab(0),
      badge: dashboardData.reportsCount.pending > 0 ? `${dashboardData.reportsCount.pending} Pending` : 'Up to date'
    },
    {
      title: 'Student Evaluations',
      description: 'Complete student evaluations',
      icon: ClipboardCheck,
      color: 'text-[#00509E]',
      bgColor: 'bg-gray-50',
      action: () => setActiveTab(1),
      badge: dashboardData.evaluationsCount.pending > 0 ? `${dashboardData.evaluationsCount.pending} Due` : 'Current'
    },
    {
      title: 'Supervision Requests',
      description: 'Manage supervision requests',
      icon: UserPlus,
      color: 'text-[#003366]',
      bgColor: 'bg-blue-50',
      action: () => setActiveTab(4),
      badge: dashboardData.supervisionRequests > 0 ? `${dashboardData.supervisionRequests} New` : 'None'
    },
    {
      title: 'Student Progress',
      description: 'Monitor student progress',
      icon: TrendingUp,
      color: 'text-[#00509E]',
      bgColor: 'bg-gray-50',
      action: () => setActiveTab(7),
      badge: 'Active'
    }
  ];

  const statsCards = [
    {
      title: 'Supervised Students',
      value: dashboardData.studentsCount,
      icon: Users,
      color: 'text-[#003366]',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Pending Reports',
      value: dashboardData.reportsCount.pending,
      icon: FileText,
      color: dashboardData.reportsCount.pending > 0 ? 'text-red-600' : 'text-green-600',
      bgColor: dashboardData.reportsCount.pending > 0 ? 'bg-red-50' : 'bg-green-50'
    },
    {
      title: 'Evaluations Due',
      value: dashboardData.evaluationsCount.pending,
      icon: ClipboardCheck,
      color: dashboardData.evaluationsCount.pending > 0 ? 'text-yellow-600' : 'text-green-600',
      bgColor: dashboardData.evaluationsCount.pending > 0 ? 'bg-yellow-50' : 'bg-green-50'
    },
    {
      title: 'New Requests',
      value: dashboardData.supervisionRequests,
      icon: UserPlus,
      color: 'text-[#00509E]',
      bgColor: 'bg-gray-50'
    }
  ];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <Card className="p-8 md:p-12 text-center border border-gray-200">
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-gray-100 p-3 md:p-4 rounded-full animate-pulse">
              <BarChart3 className="w-6 h-6 md:w-8 md:h-8 text-gray-500" />
            </div>
            <div className="space-y-2">
              <div className="h-3 md:h-4 bg-gray-200 rounded w-36 md:w-48 animate-pulse"></div>
              <div className="h-2 md:h-3 bg-gray-200 rounded w-24 md:w-32 animate-pulse"></div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 md:h-6 md:w-6 border-b-2 border-[#003366]"></div>
              <p className="text-sm md:text-base text-gray-600 font-medium">Loading dashboard...</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 space-y-4 md:space-y-8">
      {/* Enhanced Header Section - COMSATS Design - RESPONSIVE */}
      <div className="relative bg-gradient-to-r from-[#003366] via-[#00509E] to-[#003366] rounded-lg p-4 md:p-5 text-white shadow-md overflow-hidden">
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="p-2 bg-white/10 rounded-lg shadow-sm">
                <BarChart3 className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold mb-1 text-white">
                  Supervisor Dashboard
                </h1>
                <p className="text-blue-100 text-xs md:text-sm font-medium">
                  Manage student supervision and academic oversight
                </p>
              </div>
            </div>
            <div className="text-left md:text-right">
              <div className="bg-white/10 rounded-lg p-2 md:p-3">
                <p className="text-blue-200 text-xs font-medium">Supervision Status</p>
                <div className="flex items-center gap-1 mt-1">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-white font-bold text-xs md:text-sm">Active Supervisor</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Quick Stats - COMSATS Compact - RESPONSIVE */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
            {statsCards.map((stat, index) => (
              <div key={index} className="bg-white/10 rounded-lg p-2.5 md:p-3">
                <div className="flex items-center gap-1 mb-0.5">
                  <stat.icon className="w-3 h-3 text-blue-200" />
                  <span className="text-blue-200 text-xs font-medium truncate">{stat.title}</span>
                </div>
                <p className="text-white font-bold text-sm md:text-base">{stat.value}</p>
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

      {/* Quick Actions Grid - RESPONSIVE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {quickActions.map((action, index) => (
          <Card key={index} className="p-4 md:p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group" onClick={action.action}>
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <div className={`p-2 md:p-3 rounded-lg ${action.bgColor}`}>
                <action.icon className={`w-5 h-5 md:w-6 md:h-6 ${action.color}`} />
              </div>
              <Badge variant="info" size="sm" className="bg-gray-100 text-gray-700 border border-gray-200 text-xs">
                {action.badge}
              </Badge>
            </div>
            <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-1 md:mb-2 group-hover:text-[#00509E] transition-colors">
              {action.title}
            </h3>
            <p className="text-gray-600 text-xs md:text-sm mb-3 md:mb-4">
              {action.description}
            </p>
            <div className="flex items-center text-[#003366] text-xs md:text-sm font-medium">
              <span>Manage</span>
              <ArrowRight className="w-3 h-3 md:w-4 md:h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Card>
        ))}
      </div>

      {/* Main Dashboard Content Grid - RESPONSIVE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
        
        {/* Supervision Overview */}
        <Card className="lg:col-span-2 p-4 md:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 md:mb-6">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 flex items-center">
              <Users className="w-4 h-4 md:w-5 md:h-5 mr-2 text-[#003366]" />
              Supervision Overview
            </h2>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setActiveTab(7)}
              className="border-[#003366] text-[#003366] hover:bg-[#003366] hover:text-white text-xs md:text-sm"
            >
              View Progress
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <div className="text-center p-3 md:p-4 bg-gray-50 rounded-lg">
              <div className="text-xl md:text-2xl font-bold text-[#003366] mb-1">
                {dashboardData.studentsCount}
              </div>
              <div className="text-xs md:text-sm text-gray-600">Total Students</div>
            </div>
            
            <div className="text-center p-3 md:p-4 bg-gray-50 rounded-lg">
              <div className="text-xl md:text-2xl font-bold text-green-600 mb-1">
                {dashboardData.activeStudents}
              </div>
              <div className="text-xs md:text-sm text-gray-600">Active</div>
            </div>
            
            <div className="text-center p-3 md:p-4 bg-gray-50 rounded-lg">
              <div className="text-xl md:text-2xl font-bold text-yellow-600 mb-1">
                {dashboardData.inProgressStudents || 0}
              </div>
              <div className="text-xs md:text-sm text-gray-600">In Progress</div>
            </div>
            
            <div className="text-center p-3 md:p-4 bg-gray-50 rounded-lg">
              <div className="text-xl md:text-2xl font-bold text-[#00509E] mb-1">
                {dashboardData.completedStudents}
              </div>
              <div className="text-xs md:text-sm text-gray-600">Completed</div>
            </div>
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6 flex items-center">
            <Clock className="w-4 h-4 md:w-5 md:h-5 mr-2 text-[#00509E]" />
            Recent Activity
          </h2>
          
          <div className="space-y-3 md:space-y-4">
            {dashboardData.recentActivity && dashboardData.recentActivity.length > 0 ? (
              dashboardData.recentActivity.slice(0, 3).map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 p-2.5 md:p-3 bg-gray-50 rounded-lg">
                  <div className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${
                    activity.status === 'pending' || activity.status === 'submitted' ? 'bg-yellow-600' : 
                    activity.status === 'reviewed' || activity.status === 'approved' ? 'bg-green-600' : 
                    'bg-[#003366]'
                  }`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs md:text-sm font-medium text-gray-900 truncate">{activity.title}</p>
                    <p className="text-xs text-gray-500 truncate">{activity.description}</p>
                  </div>
                </div>
              ))
            ) : (
              <>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-xs md:text-sm font-medium text-gray-500">No Recent Activity</p>
                    <p className="text-xs text-gray-400">Check back later for updates</p>
                  </div>
                </div>
              </>
            )}
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setActiveTab(9)} 
            className="w-full mt-3 md:mt-4 border-gray-300 text-gray-700 hover:bg-gray-50 text-xs md:text-sm"
          >
            View All Messages
          </Button>
        </Card>
      </div>

      {/* Reports & Evaluations Overview - RESPONSIVE */}
      <Card className="p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 md:mb-6">
          <h2 className="text-lg md:text-xl font-bold text-gray-900 flex items-center">
            <FileText className="w-4 h-4 md:w-5 md:h-5 mr-2 text-[#003366]" />
            Reports & Evaluations
          </h2>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setActiveTab(0)}
            className="border-[#003366] text-[#003366] hover:bg-[#003366] hover:text-white text-xs md:text-sm"
          >
            Manage All
          </Button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="text-center p-4 md:p-6 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
              <FileText className="w-5 h-5 md:w-6 md:h-6 text-[#003366]" />
            </div>
            <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-2">Student Reports</h3>
            <div className="text-xl md:text-2xl font-bold text-[#003366] mb-2">
              {dashboardData.reportsCount.total}
            </div>
            <Badge 
              variant={dashboardData.reportsCount.pending > 0 ? 'warning' : 'success'}
              className="bg-gray-100 text-gray-700 border border-gray-200 text-xs"
            >
              {dashboardData.reportsCount.pending > 0 ? `${dashboardData.reportsCount.pending} Pending` : 'All Reviewed'}
            </Badge>
          </div>
          
          <div className="text-center p-4 md:p-6 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
              <ClipboardCheck className="w-5 h-5 md:w-6 md:h-6 text-[#00509E]" />
            </div>
            <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-2">Evaluations</h3>
            <div className="text-xl md:text-2xl font-bold text-[#00509E] mb-2">
              {dashboardData.evaluationsCount.total}
            </div>
            <Badge variant="info" className="bg-gray-100 text-gray-700 border border-gray-200 text-xs">
              {dashboardData.evaluationsCount.completed} Completed
            </Badge>
          </div>
          
          <div className="text-center p-4 md:p-6 bg-gray-50 rounded-lg sm:col-span-2 lg:col-span-1">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
              <UserPlus className="w-5 h-5 md:w-6 md:h-6 text-gray-700" />
            </div>
            <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-2">Requests</h3>
            <div className="text-xl md:text-2xl font-bold text-gray-700 mb-2">
              {dashboardData.supervisionRequests}
            </div>
            <Badge 
              variant={dashboardData.supervisionRequests > 0 ? 'info' : 'secondary'}
              className="bg-gray-100 text-gray-700 border border-gray-200 text-xs"
            >
              {dashboardData.supervisionRequests > 0 ? 'New Requests' : 'No Requests'}
            </Badge>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DashboardOverview;