import toast from 'react-hot-toast';
import { CheckCircle, XCircle, AlertTriangle, Info, Loader2 } from 'lucide-react';

// Custom toast styles with modern design
const toastStyles = {
  success: {
    style: {
      background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
      color: '#fff',
      fontWeight: '500',
      padding: '16px 20px',
      borderRadius: '12px',
      boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.25), 0 10px 10px -5px rgba(16, 185, 129, 0.04)',
      border: 'none',
      fontSize: '14px',
      maxWidth: '400px',
    },
    iconTheme: {
      primary: '#fff',
      secondary: '#10B981',
    },
  },
  error: {
    style: {
      background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
      color: '#fff',
      fontWeight: '500',
      padding: '16px 20px',
      borderRadius: '12px',
      boxShadow: '0 10px 25px -5px rgba(239, 68, 68, 0.25), 0 10px 10px -5px rgba(239, 68, 68, 0.04)',
      border: 'none',
      fontSize: '14px',
      maxWidth: '400px',
    },
    iconTheme: {
      primary: '#fff',
      secondary: '#EF4444',
    },
  },
  warning: {
    style: {
      background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
      color: '#fff',
      fontWeight: '500',
      padding: '16px 20px',
      borderRadius: '12px',
      boxShadow: '0 10px 25px -5px rgba(245, 158, 11, 0.25), 0 10px 10px -5px rgba(245, 158, 11, 0.04)',
      border: 'none',
      fontSize: '14px',
      maxWidth: '400px',
    },
    iconTheme: {
      primary: '#fff',
      secondary: '#F59E0B',
    },
  },
  info: {
    style: {
      background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
      color: '#fff',
      fontWeight: '500',
      padding: '16px 20px',
      borderRadius: '12px',
      boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.25), 0 10px 10px -5px rgba(59, 130, 246, 0.04)',
      border: 'none',
      fontSize: '14px',
      maxWidth: '400px',
    },
    iconTheme: {
      primary: '#fff',
      secondary: '#3B82F6',
    },
  },
  loading: {
    style: {
      background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
      color: '#fff',
      fontWeight: '500',
      padding: '16px 20px',
      borderRadius: '12px',
      boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.25), 0 10px 10px -5px rgba(99, 102, 241, 0.04)',
      border: 'none',
      fontSize: '14px',
      maxWidth: '400px',
    },
    iconTheme: {
      primary: '#fff',
      secondary: '#6366F1',
    },
  }
};

// Custom icon components for toasts
const CustomIcon = ({ type, className = "w-5 h-5" }) => {
  const iconProps = { className, strokeWidth: 2.5 };
  
  switch (type) {
    case 'success':
      return <CheckCircle {...iconProps} />;
    case 'error':
      return <XCircle {...iconProps} />;
    case 'warning':
      return <AlertTriangle {...iconProps} />;
    case 'info':
      return <Info {...iconProps} />;
    case 'loading':
      return <Loader2 {...iconProps} className={`${className} animate-spin`} />;
    default:
      return <Info {...iconProps} />;
  }
};

// Custom toast component with enhanced styling
const CustomToast = ({ message, type, title, description }) => (
  <div className="flex items-start space-x-3">
    <div className="flex-shrink-0 mt-0.5">
      <CustomIcon type={type} />
    </div>
    <div className="flex-1 min-w-0">
      {title && (
        <div className="text-sm font-semibold mb-1">
          {title}
        </div>
      )}
      <div className="text-sm opacity-95">
        {message}
      </div>
      {description && (
        <div className="text-xs opacity-80 mt-1">
          {description}
        </div>
      )}
    </div>
  </div>
);

// Notification service class
class NotificationService {
  // Success notifications
  success(message, options = {}) {
    const { title, description, duration = 4000 } = options;
    
    return toast.custom(
      (t) => (
        <div 
          className={`${t.visible ? 'animate-enter' : 'animate-leave'} transition-all duration-300 ease-out transform`}
          style={toastStyles.success.style}
        >
          <CustomToast 
            message={message} 
            type="success" 
            title={title}
            description={description}
          />
        </div>
      ),
      { duration }
    );
  }

  // Error notifications
  error(message, options = {}) {
    const { title, description, duration = 5000 } = options;
    
    return toast.custom(
      (t) => (
        <div 
          className={`${t.visible ? 'animate-enter' : 'animate-leave'} transition-all duration-300 ease-out transform`}
          style={toastStyles.error.style}
        >
          <CustomToast 
            message={message} 
            type="error" 
            title={title}
            description={description}
          />
        </div>
      ),
      { duration }
    );
  }

  // Warning notifications
  warning(message, options = {}) {
    const { title, description, duration = 4500 } = options;
    
    return toast.custom(
      (t) => (
        <div 
          className={`${t.visible ? 'animate-enter' : 'animate-leave'} transition-all duration-300 ease-out transform`}
          style={toastStyles.warning.style}
        >
          <CustomToast 
            message={message} 
            type="warning" 
            title={title}
            description={description}
          />
        </div>
      ),
      { duration }
    );
  }

  // Info notifications
  info(message, options = {}) {
    const { title, description, duration = 4000 } = options;
    
    return toast.custom(
      (t) => (
        <div 
          className={`${t.visible ? 'animate-enter' : 'animate-leave'} transition-all duration-300 ease-out transform`}
          style={toastStyles.info.style}
        >
          <CustomToast 
            message={message} 
            type="info" 
            title={title}
            description={description}
          />
        </div>
      ),
      { duration }
    );
  }

  // Loading notifications
  loading(message, options = {}) {
    const { title, description } = options;
    
    return toast.custom(
      (t) => (
        <div 
          className={`${t.visible ? 'animate-enter' : 'animate-leave'} transition-all duration-300 ease-out transform`}
          style={toastStyles.loading.style}
        >
          <CustomToast 
            message={message} 
            type="loading" 
            title={title}
            description={description}
          />
        </div>
      ),
      { duration: Infinity }
    );
  }

  // Promise-based notifications for async operations
  promise(promise, messages, options = {}) {
    const { 
      success: successMsg = 'Operation completed successfully',
      error: errorMsg = 'Operation failed',
      loading: loadingMsg = 'Processing...'
    } = messages;

    return toast.promise(
      promise,
      {
        loading: (
          <CustomToast 
            message={loadingMsg} 
            type="loading"
            title={options.loadingTitle}
          />
        ),
        success: (data) => (
          <CustomToast 
            message={typeof successMsg === 'function' ? successMsg(data) : successMsg}
            type="success"
            title={options.successTitle}
          />
        ),
        error: (err) => (
          <CustomToast 
            message={typeof errorMsg === 'function' ? errorMsg(err) : errorMsg}
            type="error"
            title={options.errorTitle}
          />
        ),
      },
      {
        loading: toastStyles.loading,
        success: toastStyles.success,
        error: toastStyles.error,
      }
    );
  }

  // Dismiss all notifications
  dismiss() {
    toast.dismiss();
  }

  // Dismiss specific notification
  dismissById(id) {
    toast.dismiss(id);
  }

  // Job-specific notifications
  job = {
    applied: (jobTitle, companyName) => this.success(
      `Your application has been submitted successfully!`,
      {
        title: '🎉 Application Submitted',
        description: `Applied for ${jobTitle} at ${companyName}`
      }
    ),

    applicationError: (error) => this.error(
      'Failed to submit your application. Please try again.',
      {
        title: '❌ Application Failed',
        description: error
      }
    ),

    alreadyApplied: (jobTitle) => this.warning(
      `You have already applied for this position.`,
      {
        title: '⚠️ Already Applied',
        description: `Your application for ${jobTitle} is being reviewed`
      }
    ),

    saved: (jobTitle) => this.success(
      `Job saved to your favorites!`,
      {
        title: '💾 Job Saved',
        description: jobTitle
      }
    ),

    removed: (jobTitle) => this.info(
      `Job removed from favorites`,
      {
        title: '🗑️ Job Removed',
        description: jobTitle
      }
    )
  };

  // Profile-specific notifications
  profile = {
    updated: () => this.success(
      'Your profile has been updated successfully!',
      {
        title: '✅ Profile Updated',
        description: 'Changes have been saved'
      }
    ),

    uploadSuccess: (fileName) => this.success(
      `File uploaded successfully!`,
      {
        title: '📁 Upload Complete',
        description: fileName
      }
    ),

    uploadError: (error) => this.error(
      'Failed to upload file. Please try again.',
      {
        title: '❌ Upload Failed',
        description: error
      }
    )
  };

  // Authentication notifications
  auth = {
    loginSuccess: (userName) => this.success(
      `Welcome back, ${userName}!`,
      {
        title: '🎉 Login Successful',
        description: 'You have been successfully logged in'
      }
    ),

    logoutSuccess: () => this.info(
      'You have been logged out successfully',
      {
        title: '👋 Logged Out',
        description: 'See you next time!'
      }
    ),

    registrationSuccess: () => this.success(
      'Account created successfully!',
      {
        title: '🎉 Welcome!',
        description: 'Please check your email to verify your account'
      }
    ),

    passwordReset: () => this.info(
      'Password reset link sent to your email',
      {
        title: '📧 Reset Link Sent',
        description: 'Check your inbox and spam folder'
      }
    )
  };
}

// Create and export a singleton instance
const notificationService = new NotificationService();
export default notificationService;