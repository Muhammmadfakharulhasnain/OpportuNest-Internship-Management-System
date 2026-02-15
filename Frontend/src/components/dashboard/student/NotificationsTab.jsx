import { useState, useEffect, useCallback } from 'react';
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  Filter,
  Search,
  ExternalLink,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  User,
  Archive,
  RefreshCw
} from 'lucide-react';
import { notificationAPI } from '../../../services/api';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import Card from '../../../ui/Card';
import Button from '../../../ui/Button';
import Badge from '../../../ui/Badge';

const NotificationsTab = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10
  });
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.currentPage,
        limit: pagination.limit
      };

      if (filter !== 'all') {
        params.status = filter;
      }

      if (typeFilter !== 'all') {
        params.type = typeFilter;
      }

      const response = await notificationAPI.getStudentNotifications(params);

      if (response.success) {
        setNotifications(response.data.notifications);
        setPagination(response.data.pagination);
        setUnreadCount(response.data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [filter, typeFilter, pagination.currentPage, pagination.limit]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleNotificationClick = async (notification) => {
    try {
      // Mark as read if unread
      if (notification.status === 'unread') {
        setActionLoading(notification._id);
        await notificationAPI.markAsRead(notification._id);
        
        // Update local state
        setNotifications(prev => 
          prev.map(n => 
            n._id === notification._id 
              ? { ...n, status: 'read', readAt: new Date() }
              : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }

      // Navigate to action URL if available
      if (notification.actionUrl) {
        navigate(notification.actionUrl);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to update notification');
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setActionLoading('mark-all');
      await notificationAPI.markAllAsRead();
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => ({ ...n, status: 'read', readAt: new Date() }))
      );
      setUnreadCount(0);
      
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Failed to mark all as read');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteNotification = async (notificationId, event) => {
    event.stopPropagation();
    
    try {
      setActionLoading(notificationId);
      await notificationAPI.deleteNotification(notificationId);
      
      // Update local state
      const deletedNotification = notifications.find(n => n._id === notificationId);
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      
      if (deletedNotification?.status === 'unread') {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    } finally {
      setActionLoading(null);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'supervision_request_accepted':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'supervision_request_rejected':
        return <XCircle className="w-6 h-6 text-red-500" />;
      case 'application_approved':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'application_rejected':
      case 'application_feedback':
        return <AlertCircle className="w-6 h-6 text-orange-500" />;
      default:
        return <Bell className="w-6 h-6 text-blue-500" />;
    }
  };

  const getNotificationTypeLabel = (type) => {
    switch (type) {
      case 'supervision_request_accepted':
        return 'Supervision Accepted';
      case 'supervision_request_rejected':
        return 'Supervision Rejected';
      case 'application_approved':
        return 'Application Approved';
      case 'application_rejected':
        return 'Application Rejected';
      case 'application_feedback':
        return 'Application Feedback';
      default:
        return 'Notification';
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const createdAt = new Date(date);
    const diffMs = now - createdAt;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return createdAt.toLocaleDateString();
  };

  const filteredNotifications = notifications.filter(notification =>
    notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    notification.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const notificationTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'supervision_request_accepted', label: 'Supervision Accepted' },
    { value: 'supervision_request_rejected', label: 'Supervision Rejected' },
    { value: 'application_approved', label: 'Application Approved' },
    { value: 'application_rejected', label: 'Application Rejected' },
    { value: 'application_feedback', label: 'Application Feedback' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
          <p className="text-gray-600">
            Stay updated with your internship applications and supervision requests
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Badge variant="info">
            {unreadCount} unread
          </Badge>
          <Button
            onClick={fetchNotifications}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {unreadCount > 0 && (
            <Button
              onClick={handleMarkAllAsRead}
              variant="primary"
              size="sm"
              disabled={actionLoading === 'mark-all'}
            >
              <CheckCheck className="w-4 h-4 mr-2" />
              Mark All Read
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {notificationTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Notifications List */}
      <div className="space-y-3">
        {loading ? (
          <Card className="p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mr-3"></div>
              <span className="text-gray-600">Loading notifications...</span>
            </div>
          </Card>
        ) : filteredNotifications.length === 0 ? (
          <Card className="p-8">
            <div className="flex flex-col items-center justify-center text-gray-500">
              <Archive className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium mb-2">No notifications found</h3>
              <p className="text-center">
                {searchTerm 
                  ? `No notifications match "${searchTerm}"`
                  : 'You have no notifications at the moment'
                }
              </p>
            </div>
          </Card>
        ) : (
          filteredNotifications.map((notification) => (
            <Card
              key={notification._id}
              className={`p-4 hover:shadow-md transition-shadow duration-200 cursor-pointer ${
                notification.status === 'unread' 
                  ? 'border-l-4 border-blue-500 bg-blue-50' 
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex items-start space-x-4">
                {/* Icon */}
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className={`font-semibold ${
                          notification.status === 'unread' ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {notification.title}
                        </h3>
                        <Badge variant="outline" size="sm">
                          {getNotificationTypeLabel(notification.type)}
                        </Badge>
                        {notification.status === 'unread' && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        )}
                      </div>
                      
                      <p className="text-gray-600 mb-3">
                        {notification.message}
                      </p>
                      
                      {/* Metadata */}
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{formatTimeAgo(notification.createdAt)}</span>
                        </div>
                        
                        {notification.metadata?.supervisorName && (
                          <div className="flex items-center space-x-1">
                            <User className="w-4 h-4" />
                            <span>{notification.metadata.supervisorName}</span>
                          </div>
                        )}
                        
                        {notification.metadata?.jobTitle && (
                          <div className="flex items-center space-x-1">
                            <span>Job:</span>
                            <span className="font-medium">{notification.metadata.jobTitle}</span>
                          </div>
                        )}
                        
                        {notification.actionUrl && (
                          <div className="flex items-center space-x-1 text-blue-600">
                            <ExternalLink className="w-4 h-4" />
                            <span>Click to view</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex-shrink-0 ml-4">
                      <button
                        onClick={(e) => handleDeleteNotification(notification._id, e)}
                        disabled={actionLoading === notification._id}
                        className="text-gray-400 hover:text-red-500 transition-colors duration-200 p-1"
                        title="Delete notification"
                      >
                        {actionLoading === notification._id ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-300 border-t-transparent"></div>
                        ) : (
                          <Trash2 className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)} of{' '}
              {pagination.totalCount} notifications
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                disabled={pagination.currentPage === 1 || loading}
              >
                Previous
              </Button>
              
              <span className="text-sm text-gray-600">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                disabled={pagination.currentPage === pagination.totalPages || loading}
              >
                Next
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default NotificationsTab;
