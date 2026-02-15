import { useState } from 'react';
import { 
  Users, 
  Building2, 
  BriefcaseIcon, 
  ClipboardList,
  TrendingUp,
  Settings,
  Bell,
  Search
} from 'lucide-react';

const SimpleAdminDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const stats = [
    {
      title: 'Total Students',
      value: '1,234',
      icon: Users,
      color: 'blue',
      trend: 'up',
      trendValue: 12
    },
    {
      title: 'Active Companies',
      value: '89',
      icon: Building2,
      color: 'green',
      trend: 'up',
      trendValue: 8
    },
    {
      title: 'Available Jobs',
      value: '156',
      icon: BriefcaseIcon,
      color: 'purple',
      trend: 'down',
      trendValue: 3
    },
    {
      title: 'Pending Applications',
      value: '42',
      icon: ClipboardList,
      color: 'orange',
      trend: 'up',
      trendValue: 15
    }
  ];

  const quickActions = [
    {
      title: 'Manage Users',
      description: 'View and manage all users',
      icon: Users,
      color: 'bg-blue-500',
      href: '/admin/users'
    },
    {
      title: 'Company Management',
      description: 'Approve and manage companies',
      icon: Building2,
      color: 'bg-green-500',
      href: '/admin/companies'
    },
    {
      title: 'Job Listings',
      description: 'Monitor job postings',
      icon: BriefcaseIcon,
      color: 'bg-purple-500',
      href: '/admin/jobs'
    },
    {
      title: 'System Settings',
      description: 'Configure system settings',
      icon: Settings,
      color: 'bg-gray-500',
      href: '/admin/settings'
    }
  ];

  const recentActivities = [
    {
      type: 'user_registration',
      message: 'New student John Doe registered',
      time: '5 minutes ago',
      icon: Users
    },
    {
      type: 'company_approval',
      message: 'TechCorp approved as partner company',
      time: '1 hour ago',
      icon: Building2
    },
    {
      type: 'job_posting',
      message: 'New internship posted by Microsoft',
      time: '2 hours ago',
      icon: BriefcaseIcon
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">
                Welcome back! Here's what's happening with your platform.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button className="p-2 text-gray-400 hover:text-gray-500">
                <Bell className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className={`h-4 w-4 mr-1 ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`} />
                    <span className={`text-sm ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.trendValue}%
                    </span>
                    <span className="text-sm text-gray-500 ml-1">vs last month</span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg bg-${stat.color}-50 text-${stat.color}-600`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickActions.map((action, index) => (
                  <a
                    key={index}
                    href={action.href}
                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all duration-200"
                  >
                    <div className={`p-3 rounded-lg ${action.color} mr-4`}>
                      <action.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{action.title}</h4>
                      <p className="text-sm text-gray-500 mt-1">{action.description}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 p-2 bg-gray-100 rounded-lg">
                      <activity.icon className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 font-medium">{activity.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium">
                View all activities
              </button>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <h4 className="font-medium text-gray-900">API Services</h4>
                <p className="text-sm text-green-600">All systems operational</p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <h4 className="font-medium text-gray-900">Database</h4>
                <p className="text-sm text-green-600">Connected and healthy</p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <h4 className="font-medium text-gray-900">Email Service</h4>
                <p className="text-sm text-green-600">Sending emails normally</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleAdminDashboard;