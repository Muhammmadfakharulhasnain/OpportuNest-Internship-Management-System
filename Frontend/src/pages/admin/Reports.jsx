import { useState, useEffect, useCallback } from 'react';
import { 
  BarChart3, 
  Users, 
  Building2,
  TrendingUp,
  Download,
  PieChart,
  Target,
  AlertCircle,
  CheckCircle,
  FileText,
  Activity,
  Star,
  UserCheck,
  BookOpen,
  ChevronRight,
  Eye,
  RefreshCw
} from 'lucide-react';
import { getAnalytics, generateReport } from '../../services/adminAPI';
import toast from 'react-hot-toast';

const AdminReports = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCompanies: 0,
    totalJobs: 0,
    totalApplications: 0,
    activeInternships: 0,
    completedInternships: 0
  });
  const [recentActivity, setRecentActivity] = useState({
    users: [],
    applications: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch analytics data
  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getAnalytics({
        type: 'overview',
        timeframe
      });

      if (response?.success) {
        setStats(response.stats);
        // Create some mock recent activity since backend doesn't provide it yet
        setRecentActivity({
          users: [
            { name: 'John Doe', email: 'john@example.com', role: 'student', createdAt: new Date() },
            { name: 'Tech Corp', email: 'hr@techcorp.com', role: 'company', createdAt: new Date() },
            { name: 'Dr. Smith', email: 'smith@university.edu', role: 'supervisor', createdAt: new Date() }
          ],
          applications: [
            { jobTitle: 'Software Developer', rollNumber: { name: 'Alice Johnson' }, overallStatus: 'approved', createdAt: new Date() },
            { jobTitle: 'Data Analyst', rollNumber: { name: 'Bob Wilson' }, overallStatus: 'pending', createdAt: new Date() }
          ]
        });
      } else {
        throw new Error(response?.message || 'Failed to fetch analytics');
      }
      
      toast.success('Reports loaded successfully!');
    } catch (err) {
      console.error('❌ Error fetching analytics:', err);
      
      let errorMessage = 'Failed to fetch analytics data';
      
      if (err.code === 'ERR_NETWORK' || err.message.includes('ERR_CONNECTION_REFUSED')) {
        errorMessage = 'Unable to connect to server. Please check if the backend is running.';
      } else if (err.response?.status === 503) {
        errorMessage = err.response.data?.message || 'Database connection unavailable. Please check MongoDB connection.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.status === 404) {
        errorMessage = 'Analytics endpoint not found. Please check backend configuration.';
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [timeframe]);

  // Generate and download report
  const handleGenerateReport = async (type) => {
    try {
      toast.loading('Generating report...', { id: 'report-generation' });
      
      const response = await generateReport({
        type,
        timeframe
      });

      // Create download link
      const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${type}_report_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Report downloaded successfully!', { id: 'report-generation' });
    } catch (err) {
      console.error('❌ Error generating report:', err);
      toast.error(err.response?.data?.message || 'Failed to generate report', { id: 'report-generation' });
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-xl shadow-lg border">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white border border-red-200 rounded-2xl p-8 shadow-lg">
            <div className="flex items-start">
              <AlertCircle className="h-8 w-8 text-red-600 mr-4 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-red-800 mb-3">Error Loading Reports</h3>
                <p className="text-red-600 mb-6 text-lg">{error}</p>
                
                <div className="bg-red-50 rounded-xl p-6 mb-6">
                  <h4 className="text-lg font-semibold text-red-800 mb-3">Troubleshooting Steps:</h4>
                  <ul className="text-red-700 space-y-2">
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2" />Check if the backend server is running on port 5005</li>
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2" />Verify MongoDB Atlas connection and IP whitelist</li>
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2" />Ensure your network connection is stable</li>
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2" />Try refreshing the page</li>
                  </ul>
                </div>
                
                <div className="flex space-x-4">
                  <button
                    onClick={fetchAnalytics}
                    disabled={loading}
                    className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center font-semibold transition-all duration-200"
                  >
                    <RefreshCw className="h-5 w-5 mr-2" />
                    {loading ? 'Retrying...' : 'Retry'}
                  </button>
                  <button
                    onClick={() => window.location.href = '/admin/dashboard'}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-4 focus:ring-gray-500 focus:ring-opacity-50 font-semibold transition-all duration-200"
                  >
                    Back to Dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      change: '+12%',
      trend: 'up'
    },
    {
      title: 'Companies',
      value: stats.totalCompanies,
      icon: Building2,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      change: '+8%',
      trend: 'up'
    },
    {
      title: 'Job Postings',
      value: stats.totalJobs,
      icon: BookOpen,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      change: '+15%',
      trend: 'up'
    },
    {
      title: 'Applications',
      value: stats.totalApplications,
      icon: Target,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
      change: '+23%',
      trend: 'up'
    },
    {
      title: 'Active Internships',
      value: stats.activeInternships,
      icon: UserCheck,
      color: 'from-teal-500 to-teal-600',
      bgColor: 'bg-teal-50',
      iconColor: 'text-teal-600',
      change: '+18%',
      trend: 'up'
    },
    {
      title: 'Completed',
      value: stats.completedInternships,
      icon: CheckCircle,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      change: '+12%',
      trend: 'up'
    },
    {
      title: 'Success Rate',
      value: stats.totalApplications > 0 ? Math.round((stats.activeInternships / stats.totalApplications) * 100) : 0,
      icon: Star,
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50',
      iconColor: 'text-pink-600',
      change: '+5%',
      trend: 'up',
      suffix: '%'
    },
    {
      title: 'Platform Growth',
      value: Math.round((stats.totalUsers + stats.totalCompanies) / 10),
      icon: TrendingUp,
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
      change: '+20%',
      trend: 'up'
    }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'students', label: 'Student Reports', icon: BookOpen },
    { id: 'companies', label: 'Company Reports', icon: Building2 },
    { id: 'applications', label: 'Applications', icon: Target },
    { id: 'analytics', label: 'Analytics', icon: Activity }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-xl border border-white/20 p-8 backdrop-blur-sm bg-white/90">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-3">
                  📊 Reports & Analytics
                </h1>
                <p className="text-gray-600 text-lg">
                  Comprehensive insights and analytics for your internship platform
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <select
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                  className="px-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-20 focus:border-blue-500 font-medium"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 3 months</option>
                  <option value="365d">Last year</option>
                </select>
                <button
                  onClick={fetchAnalytics}
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center font-semibold shadow-lg"
                >
                  <RefreshCw className={`h-5 w-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-white/20 p-2 backdrop-blur-sm bg-white/90">
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg transform scale-105'
                        : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div key={index} className="group hover:scale-105 transition-all duration-200">
                <div className="bg-white rounded-2xl shadow-lg border border-white/20 p-6 backdrop-blur-sm bg-white/90 h-full">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl ${card.bgColor}`}>
                      <Icon className={`h-8 w-8 ${card.iconColor}`} />
                    </div>
                    <div className={`flex items-center text-sm font-semibold ${
                      card.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      <TrendingUp className={`h-4 w-4 mr-1 ${card.trend === 'down' ? 'rotate-180' : ''}`} />
                      {card.change}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">{card.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mb-2">
                      {card.value?.toLocaleString() || 0}{card.suffix || ''}
                    </p>
                    <p className="text-xs text-gray-500">vs last month</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Recent Activity & Performance Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Activity */}
              <div className="bg-white rounded-2xl shadow-lg border border-white/20 p-6 backdrop-blur-sm bg-white/90">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center">
                    <Activity className="h-6 w-6 mr-3 text-blue-600" />
                    Recent Activity
                  </h3>
                  <button className="text-blue-600 hover:text-blue-700 font-semibold flex items-center">
                    View All <ChevronRight className="h-4 w-4 ml-1" />
                  </button>
                </div>
                <div className="space-y-4">
                  {recentActivity.users?.slice(0, 4).map((user, index) => (
                    <div key={index} className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                      <div className={`h-3 w-3 rounded-full mr-4 ${
                        user.role === 'student' ? 'bg-blue-500' :
                        user.role === 'company' ? 'bg-green-500' :
                        user.role === 'supervisor' ? 'bg-purple-500' : 'bg-gray-500'
                      }`}></div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">{user.name} joined as {user.role}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                        <p className="text-xs text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        user.role === 'student' ? 'bg-blue-100 text-blue-700' :
                        user.role === 'company' ? 'bg-green-100 text-green-700' :
                        user.role === 'supervisor' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {user.role}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Application Performance */}
              <div className="bg-white rounded-2xl shadow-lg border border-white/20 p-6 backdrop-blur-sm bg-white/90">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center">
                    <Target className="h-6 w-6 mr-3 text-green-600" />
                    Application Performance
                  </h3>
                  <div className="text-2xl font-bold text-green-600">
                    {stats.totalApplications > 0 ? Math.round((stats.activeInternships / stats.totalApplications) * 100) : 0}%
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                    <span className="font-semibold text-green-800">Success Rate</span>
                    <span className="text-2xl font-bold text-green-600">
                      {stats.totalApplications > 0 ? Math.round((stats.activeInternships / stats.totalApplications) * 100) : 0}%
                    </span>
                  </div>
                  <div className="space-y-3">
                    {recentActivity.applications?.slice(0, 3).map((app, index) => (
                      <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900">{app.jobTitle}</p>
                          <p className="text-xs text-gray-500">
                            {app.rollNumber?.name} • {new Date(app.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          app.overallStatus === 'approved' ? 'bg-green-100 text-green-700' :
                          app.overallStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {app.overallStatus}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions & Export Reports */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Quick Actions */}
              <div className="bg-white rounded-2xl shadow-lg border border-white/20 p-6 backdrop-blur-sm bg-white/90">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <Eye className="h-6 w-6 mr-3 text-purple-600" />
                  Quick Views
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setActiveTab('students')}
                    className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl hover:from-blue-100 hover:to-blue-200 transition-all duration-200 border border-blue-200"
                  >
                    <BookOpen className="h-8 w-8 text-blue-600 mb-2" />
                    <p className="font-semibold text-blue-800">Job Postings</p>
                    <p className="text-xs text-blue-600">{stats.totalJobs} jobs</p>
                  </button>
                  <button
                    onClick={() => setActiveTab('companies')}
                    className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl hover:from-green-100 hover:to-green-200 transition-all duration-200 border border-green-200"
                  >
                    <Building2 className="h-8 w-8 text-green-600 mb-2" />
                    <p className="font-semibold text-green-800">Company Reports</p>
                    <p className="text-xs text-green-600">{stats.totalCompanies} companies</p>
                  </button>
                  <button
                    onClick={() => setActiveTab('applications')}
                    className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl hover:from-purple-100 hover:to-purple-200 transition-all duration-200 border border-purple-200"
                  >
                    <Target className="h-8 w-8 text-purple-600 mb-2" />
                    <p className="font-semibold text-purple-800">Applications</p>
                    <p className="text-xs text-purple-600">{stats.totalApplications} total</p>
                  </button>
                  <button
                    onClick={() => setActiveTab('analytics')}
                    className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl hover:from-orange-100 hover:to-orange-200 transition-all duration-200 border border-orange-200"
                  >
                    <BarChart3 className="h-8 w-8 text-orange-600 mb-2" />
                    <p className="font-semibold text-orange-800">Deep Analytics</p>
                    <p className="text-xs text-orange-600">Advanced insights</p>
                  </button>
                </div>
              </div>

              {/* Export Reports */}
              <div className="bg-white rounded-2xl shadow-lg border border-white/20 p-6 backdrop-blur-sm bg-white/90">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <Download className="h-6 w-6 mr-3 text-teal-600" />
                  Export Reports
                </h3>
                <div className="space-y-4">
                  <button
                    onClick={() => handleGenerateReport('users')}
                    className="w-full flex items-center justify-between p-4 border-2 border-blue-200 rounded-xl hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 group"
                  >
                    <div className="flex items-center">
                      <Users className="h-6 w-6 text-blue-600 mr-3" />
                      <div className="text-left">
                        <p className="font-semibold text-blue-800">User Report</p>
                        <p className="text-xs text-blue-600">Complete user analytics</p>
                      </div>
                    </div>
                    <Download className="h-5 w-5 text-blue-400 group-hover:text-blue-600" />
                  </button>
                  
                  <button
                    onClick={() => handleGenerateReport('companies')}
                    className="w-full flex items-center justify-between p-4 border-2 border-green-200 rounded-xl hover:bg-green-50 hover:border-green-300 transition-all duration-200 group"
                  >
                    <div className="flex items-center">
                      <Building2 className="h-6 w-6 text-green-600 mr-3" />
                      <div className="text-left">
                        <p className="font-semibold text-green-800">Company Report</p>
                        <p className="text-xs text-green-600">Company performance data</p>
                      </div>
                    </div>
                    <Download className="h-5 w-5 text-green-400 group-hover:text-green-600" />
                  </button>
                  
                  <button
                    onClick={() => handleGenerateReport('applications')}
                    className="w-full flex items-center justify-between p-4 border-2 border-purple-200 rounded-xl hover:bg-purple-50 hover:border-purple-300 transition-all duration-200 group"
                  >
                    <div className="flex items-center">
                      <Target className="h-6 w-6 text-purple-600 mr-3" />
                      <div className="text-left">
                        <p className="font-semibold text-purple-800">Applications Report</p>
                        <p className="text-xs text-purple-600">Application trends & stats</p>
                      </div>
                    </div>
                    <Download className="h-5 w-5 text-purple-400 group-hover:text-purple-600" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Student Reports Tab */}
        {activeTab === 'students' && (
          <div className="bg-white rounded-2xl shadow-lg border border-white/20 p-8 backdrop-blur-sm bg-white/90">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <BookOpen className="h-8 w-8 mr-3 text-blue-600" />
              Job Postings & Opportunities
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                <h4 className="font-bold text-blue-800 mb-2">Total Job Postings</h4>
                <p className="text-3xl font-bold text-blue-600">{stats.totalJobs}</p>
                <p className="text-sm text-blue-600">Available positions</p>
              </div>
              <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                <h4 className="font-bold text-green-800 mb-2">Active Applications</h4>
                <p className="text-3xl font-bold text-green-600">{stats.totalApplications}</p>
                <p className="text-sm text-green-600">Currently in process</p>
              </div>
              <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
                <h4 className="font-bold text-purple-800 mb-2">Success Rate</h4>
                <p className="text-3xl font-bold text-purple-600">
                  {stats.totalApplications > 0 ? Math.round((stats.activeInternships / stats.totalApplications) * 100) : 0}%
                </p>
                <p className="text-sm text-purple-600">Application success</p>
              </div>
            </div>
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">Job posting analytics and application tracking</p>
              <p className="text-gray-500">Including posting performance, application rates, and hiring success metrics</p>
            </div>
          </div>
        )}

        {/* Company Reports Tab */}
        {activeTab === 'companies' && (
          <div className="bg-white rounded-2xl shadow-lg border border-white/20 p-8 backdrop-blur-sm bg-white/90">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Building2 className="h-8 w-8 mr-3 text-green-600" />
              Company Reports & Performance
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                <h4 className="font-bold text-green-800 mb-2">Total Companies</h4>
                <p className="text-3xl font-bold text-green-600">{stats.totalCompanies}</p>
                <p className="text-sm text-green-600">Registered partners</p>
              </div>
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                <h4 className="font-bold text-blue-800 mb-2">Applications Received</h4>
                <p className="text-3xl font-bold text-blue-600">{stats.totalApplications}</p>
                <p className="text-sm text-blue-600">Total submissions</p>
              </div>
              <div className="bg-orange-50 p-6 rounded-xl border border-orange-200">
                <h4 className="font-bold text-orange-800 mb-2">Success Rate</h4>
                <p className="text-3xl font-bold text-orange-600">
                  {stats.totalApplications > 0 ? Math.round((stats.activeInternships / stats.totalApplications) * 100) : 0}%
                </p>
                <p className="text-sm text-orange-600">Hiring success rate</p>
              </div>
            </div>
            <div className="text-center py-12">
              <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">Comprehensive company reports and analytics</p>
              <p className="text-gray-500">Including hiring patterns, application processing, and performance metrics</p>
            </div>
          </div>
        )}

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <div className="bg-white rounded-2xl shadow-lg border border-white/20 p-8 backdrop-blur-sm bg-white/90">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Target className="h-8 w-8 mr-3 text-purple-600" />
              Application Analytics & Trends
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
                <h4 className="font-bold text-purple-800 mb-2">Total Applications</h4>
                <p className="text-3xl font-bold text-purple-600">{stats.totalApplications}</p>
                <p className="text-sm text-purple-600">All time</p>
              </div>
              <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200">
                <h4 className="font-bold text-yellow-800 mb-2">Active Internships</h4>
                <p className="text-3xl font-bold text-yellow-600">{stats.activeInternships}</p>
                <p className="text-sm text-yellow-600">Currently ongoing</p>
              </div>
              <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                <h4 className="font-bold text-green-800 mb-2">Completed</h4>
                <p className="text-3xl font-bold text-green-600">{stats.completedInternships}</p>
                <p className="text-sm text-green-600">Successfully finished</p>
              </div>
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                <h4 className="font-bold text-blue-800 mb-2">Success Rate</h4>
                <p className="text-3xl font-bold text-blue-600">
                  {stats.totalApplications > 0 ? Math.round((stats.activeInternships / stats.totalApplications) * 100) : 0}%
                </p>
                <p className="text-sm text-blue-600">Approval percentage</p>
              </div>
            </div>
            <div className="text-center py-12">
              <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">Detailed application analytics and trend analysis</p>
              <p className="text-gray-500">Including success rates, processing times, and seasonal patterns</p>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="bg-white rounded-2xl shadow-lg border border-white/20 p-8 backdrop-blur-sm bg-white/90">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <BarChart3 className="h-8 w-8 mr-3 text-orange-600" />
              Advanced Analytics & Insights
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                <h4 className="font-bold text-blue-800 mb-4 flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  User Activity Trends
                </h4>
                <div className="h-48 flex items-center justify-center">
                  <div className="text-center">
                    <PieChart className="h-12 w-12 text-blue-400 mx-auto mb-2" />
                    <p className="text-blue-600">User activity charts</p>
                    <p className="text-sm text-blue-500">Registration & engagement patterns</p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                <h4 className="font-bold text-green-800 mb-4 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Performance Metrics
                </h4>
                <div className="h-48 flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-green-400 mx-auto mb-2" />
                    <p className="text-green-600">Performance analytics</p>
                    <p className="text-sm text-green-500">Success rates & efficiency metrics</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReports;