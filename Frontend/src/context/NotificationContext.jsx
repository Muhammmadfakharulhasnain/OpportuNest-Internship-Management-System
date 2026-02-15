import React, { createContext, useContext, useCallback } from 'react';
import { toast, Toaster } from 'react-hot-toast';  // Correct import syntax

const NotificationContext = createContext({
  showNotification: () => {},
  dismissNotification: () => {},
  dismissAllNotifications: () => {},
});

export const NotificationProvider = ({ children }) => {
  const showNotification = useCallback((message, type = 'info', duration = 4000) => {
    const baseOptions = {
      duration,
      position: 'top-right',
      style: {
        background: '#fff',
        color: '#333',
        padding: '16px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      },
    };

    switch (type) {
      case 'success':
        return toast.success(message, {
          ...baseOptions,
          iconTheme: {
            primary: '#10B981',
            secondary: '#fff',
          },
        });
      case 'error':
        return toast.error(message, {
          ...baseOptions,
          duration: 5000, // Longer duration for errors
          iconTheme: {
            primary: '#EF4444',
            secondary: '#fff',
          },
        });
      case 'loading':
        return toast.loading(message, baseOptions);
      default:
        return toast(message, baseOptions);
    }
  }, []);

  const dismissNotification = useCallback((toastId) => {
    toast.dismiss(toastId);
  }, []);

  const dismissAllNotifications = useCallback(() => {
    toast.dismiss();
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        showNotification,
        dismissNotification,
        dismissAllNotifications,
      }}
    >
      <Toaster
        position="top-right"
        gutter={8}
        toastOptions={{
          className: 'react-hot-toast',
        }}
      />
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};