import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { 
  Users, 
  Building2, 
  BriefcaseIcon, 
  ClipboardList,
  TrendingUp,
  TrendingDown,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { getDashboardStats } from '../../services/adminAPI';

const StatCard = ({ title, value, icon: Icon, trend, trendValue, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200'
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {trend && (
            <div className="flex items-center mt-2">
              {trend === 'up' ? (
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {trendValue}%
              </span>
              <span className="text-sm text-gray-500 ml-1">vs last month</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
};

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.elementType.isRequired,
  trend: PropTypes.oneOf(['up', 'down']),
  trendValue: PropTypes.number,
  color: PropTypes.oneOf(['blue', 'green', 'yellow', 'red', 'purple', 'indigo', 'orange'])
};

const QuickActions = () => {
  const actions = [
    {
      title: 'Review Applications',
      description: 'Check pending student applications',
      icon: ClipboardList,
      color: 'bg-blue-500',
      href: '/admin/applications'
    },
    {
      title: 'Approve Companies',
      description: 'Review company registrations',
      icon: Building2,
      color: 'bg-green-500',
      href: '/admin/companies'
    },
    {
      title: 'Manage Users',
      description: 'User accounts and roles',
      icon: Users,
      color: 'bg-purple-500',
      href: '/admin/users'
    },
    {
      title: 'Student Results',
      description: 'View final evaluation results',
      icon: TrendingUp,
      color: 'bg-orange-500',
      href: '/admin/results'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {actions.map((action, index) => (
          <a
            key={index}
            href={action.href}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className={`p-2 rounded-lg ${action.color} text-white mr-4`}>
              <action.icon className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">{action.title}</h4>
              <p className="text-sm text-gray-600">{action.description}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

const RecentActivity = ({ stats }) => {
  const recentActivity = stats?.data?.recentActivity || [];

  // Format audit logs for display
  const activities = recentActivity.map((log) => ({
    type: log.action || 'activity',
    message: log.description || `${log.action} by ${log.adminUserId?.name || 'Admin'}`,
    time: new Date(log.timestamp).toLocaleDateString(),
    icon: getIconForAction(log.action)
  }));

  function getIconForAction(action) {
    switch(action) {
      case 'create_user':
      case 'update_user':
      case 'delete_user':
        return Users;
      case 'create_company':
      case 'update_company':
        return Building2;
      case 'create_application':
      case 'update_application':
        return ClipboardList;
      default:
        return AlertCircle;
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {activities.length > 0 ? activities.map((activity, index) => (
          <div key={index} className="flex items-start">
            <div className="p-2 rounded-lg bg-gray-100 mr-3 text-gray-600">
              <activity.icon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{activity.message}</p>
              <p className="text-xs text-gray-500">{activity.time}</p>
            </div>
          </div>
        )) : (
          <p className="text-sm text-gray-500">No recent activity</p>
        )}
      </div>
    </div>
  );
};

RecentActivity.propTypes = {
  stats: PropTypes.object
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch real statistics from backend
        const response = await getDashboardStats();
        console.log('📊 Dashboard stats received:', response);
        setStats(response);
        
      } catch (err) {
        console.error('Dashboard stats error:', err);
        setError('Failed to load dashboard statistics');
        
        // Fallback to mock data if API fails
        const mockStats = {
          totalStudents: 0,
          totalCompanies: 0,
          activeJobs: 0,
          pendingApplications: 0,
          totalApplications: 0,
          approvedApplications: 0,
          totalSupervisors: 0
        };
        setStats(mockStats);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back! Here&apos;s what&apos;s happening with your internship portal.
          </p>
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <Calendar className="h-4 w-4 mr-2" />
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Students"
          value={stats?.data?.users?.students || 0}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Total Companies"
          value={stats?.data?.users?.companies || 0}
          icon={Building2}
          color="green"
        />
        <StatCard
          title="Active Jobs"
          value={stats?.data?.jobs?.active || 0}
          icon={BriefcaseIcon}
          color="purple"
        />
        <StatCard
          title="Pending Applications"
          value={stats?.data?.applications?.pending || 0}
          icon={ClipboardList}
          color="orange"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Supervisors"
          value={stats?.data?.users?.supervisors || 0}
          icon={Users}
          color="indigo"
        />
        <StatCard
          title="Pending Companies"
          value={stats?.data?.companies?.pending || 0}
          icon={Building2}
          color="yellow"
        />
        <StatCard
          title="Total Reports"
          value={stats?.data?.reports?.total || 0}
          icon={ClipboardList}
          color="blue"
        />
      </div>

      {/* Quick Actions and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QuickActions />
        <RecentActivity stats={stats} />
      </div>
    </div>
  );
};

export default AdminDashboard;