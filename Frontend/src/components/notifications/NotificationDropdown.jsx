import { useState, useEffect, useRef } from 'react';
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  X, 
  ExternalLink,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  User
} from 'lucide-react';
import { notificationAPI } from '../../services/api';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch notifications when dropdown opens
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (isOpen && user && (user.role === 'student' || user.role === 'supervisor')) {
      fetchNotifications();
    }
  }, [isOpen]);

  // Fetch unread count on component mount
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && (user.role === 'student' || user.role === 'supervisor')) {
      fetchUnreadCount();
      
      // Set up polling for real-time updates
      const interval = setInterval(fetchUnreadCount, 30000); // Every 30 seconds
      return () => clearInterval(interval);
    }
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationAPI.getStudentNotifications({
        limit: 10,
        page: 1
      });

      if (response.success) {
        setNotifications(response.data.notifications);
        setUnreadCount(response.data.unreadCount);
      }
    } catch (error) {
      console.warn('⚠️ Notifications:', error.message || 'Not available yet');
      // Don't show toast error for initial load
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationAPI.getUnreadCount();
      if (response.success) {
        setUnreadCount(response.data.unreadCount);
      }
    } catch (error) {
      console.warn('⚠️ Notification count:', error.message || 'Service unavailable');
    }
  };

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
        setIsOpen(false);
      }
    } catch (error) {
      console.warn('⚠️ Mark as read:', error.message);
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
      console.warn('⚠️ Mark all as read:', error.message);
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
      console.warn('⚠️ Delete notification:', error.message);
      toast.error('Failed to delete notification');
    } finally {
      setActionLoading(null);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'supervision_request_accepted':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'supervision_request_rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'application_approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'application_rejected':
      case 'application_feedback':
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
      default:
        return <Bell className="w-5 h-5 text-blue-500" />;
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

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell */}
      {(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || (user.role !== 'student' && user.role !== 'supervisor')) {
          return null;
        }
        return (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="relative text-black hover:text-gray-800 transition-colors duration-200 font-bold"
          >
            <Bell className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        );
      })()}

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  disabled={actionLoading === 'mark-all'}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50"
                >
                  {actionLoading === 'mark-all' ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent mr-1"></div>
                      Loading...
                    </div>
                  ) : (
                    <>
                      <CheckCheck className="w-4 h-4 inline mr-1" />
                      Mark all read
                    </>
                  )}
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
                <span className="ml-2 text-gray-600">Loading notifications...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-gray-500">
                <Bell className="w-12 h-12 text-gray-300 mb-2" />
                <p className="text-lg font-medium">No notifications</p>
                <p className="text-sm">You&apos;re all caught up!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-200 ${
                      notification.status === 'unread' ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      {/* Icon */}
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${
                              notification.status === 'unread' ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            
                            {/* Metadata */}
                            <div className="flex items-center mt-2 space-x-2 text-xs text-gray-500">
                              <Clock className="w-3 h-3" />
                              <span>{formatTimeAgo(notification.createdAt)}</span>
                              
                              {notification.metadata?.supervisorName && (
                                <>
                                  <span>•</span>
                                  <User className="w-3 h-3" />
                                  <span>{notification.metadata.supervisorName}</span>
                                </>
                              )}
                              
                              {notification.actionUrl && (
                                <>
                                  <span>•</span>
                                  <ExternalLink className="w-3 h-3" />
                                  <span>Click to view</span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex-shrink-0 ml-2">
                            {notification.status === 'unread' && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                            <button
                              onClick={(e) => handleDeleteNotification(notification._id, e)}
                              disabled={actionLoading === notification._id}
                              className="mt-1 text-gray-400 hover:text-red-500 transition-colors duration-200"
                            >
                              {actionLoading === notification._id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-transparent"></div>
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  navigate('/dashboard/student?tab=Notifications');
                  setIsOpen(false);
                }}
                className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium text-center"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
