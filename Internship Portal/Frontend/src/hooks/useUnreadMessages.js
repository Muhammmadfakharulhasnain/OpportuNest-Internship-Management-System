import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { studentChatAPI, supervisorChatAPI } from '../services/api';

// Helper function to get auth token
const getAuthToken = () => {
  const userString = localStorage.getItem('user');
  if (userString) {
    try {
      const user = JSON.parse(userString);
      return user.token;
    } catch (e) {
      console.error('Error parsing user from localStorage:', e);
    }
  }
  return localStorage.getItem('token') || sessionStorage.getItem('token');
};

export const useUnreadMessages = () => {
  const { currentUser } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  // Function to check unread messages
  const checkUnreadMessages = async () => {
    if (!currentUser?.email) return;

    try {
      const userType = currentUser.role === 'supervisor' ? 'supervisor' : 'student';
      let data;
      
      if (userType === 'supervisor') {
        data = await supervisorChatAPI.getUnreadCount(currentUser.email);
      } else {
        data = await studentChatAPI.getUnreadCount(currentUser.email);
      }
      
      setUnreadCount(data.unreadCount || 0);
      console.log('📧 Unread messages check - Role:', userType, 'Count:', data.unreadCount);
    } catch (error) {
      console.warn('⚠️ Messages service:', error.message || 'Not available yet');
    }
  };

  // Function to mark messages as read
  const markAsRead = async () => {
    if (!currentUser?.email) return;

    try {
      const token = getAuthToken();
      if (!token) {
        console.warn('⚠️ No auth token available for mark as read');
        return;
      }

      const userType = currentUser.role === 'supervisor' ? 'supervisor' : 'student';
      
      if (userType === 'supervisor') {
        // For supervisors, mark all student messages as read
        const response = await fetch('/api/supervisor-chat/mark-all-read', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            email: currentUser.email
          })
        });
        
        if (response.ok) {
          setUnreadCount(0);
          // Force immediate refresh
          setTimeout(checkUnreadMessages, 100);
        } else {
          console.warn('⚠️ Mark as read:', response.status);
        }
      } else {
        // For students, mark supervisor messages as read
        const response = await fetch('/api/student-chat/mark-supervisor-read', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            email: currentUser.email
          })
        });
        
        if (response.ok) {
          setUnreadCount(0);
          // Force immediate refresh
          setTimeout(checkUnreadMessages, 100);
        } else {
          console.warn('⚠️ Mark as read:', response.status);
        }
      }
    } catch (error) {
      console.warn('⚠️ Mark messages:', error.message || 'Service unavailable');
    }
  };

  // Check for unread messages periodically
  useEffect(() => {
    const checkMessages = async () => {
      if (!currentUser?.email) return;

      try {
        const token = getAuthToken();
        if (!token) {
          console.warn('⚠️ No auth token available for polling');
          return;
        }

        const userType = currentUser.role === 'supervisor' ? 'supervisor' : 'student';
        const endpoint = userType === 'supervisor' 
          ? '/api/supervisor-chat/unread-count'
          : '/api/student-chat/unread-count';

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            email: currentUser.email
          })
        });

        if (response.ok) {
          const data = await response.json();
          setUnreadCount(data.unreadCount || 0);
        } else {
          console.warn('⚠️ Messages check:', response.status);
        }
      } catch (error) {
        console.warn('⚠️ Messages polling:', error.message || 'Service temporarily unavailable');
      }
    };

    if (currentUser?.email) {
      // Initial check
      checkMessages();
      
      // Set up polling every 10 seconds (faster for better UX)
      const interval = setInterval(checkMessages, 10000);
      
      return () => clearInterval(interval);
    }
  }, [currentUser?.email, currentUser?.role]);

  return {
    unreadCount,
    markAsRead,
    checkUnreadMessages
  };
};