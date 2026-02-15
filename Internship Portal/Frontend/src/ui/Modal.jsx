import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  showCloseButton = true 
}) => {
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
      {/* Enhanced Background Overlay with Blur Effect - Fixed positioning */}
      <div 
        className="fixed inset-0 bg-black/60 modal-backdrop transition-all duration-300"
        onClick={onClose}
      />
      
      {/* Scrollable Modal Container with maintained blur */}
      <div className="relative w-full max-h-[90vh] overflow-y-auto modal-scroll z-10"
           style={{
             scrollBehavior: 'smooth'
           }}>
        {/* Modal Panel */}
        <div className={`relative w-full ${sizes[size]} mx-auto my-8 text-left align-middle transition-all duration-300 transform bg-white/95 modal-container shadow-2xl rounded-2xl border border-white/20 overflow-hidden`}>
          {/* Enhanced Header with Gradient Background */}
          {title && (
            <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white drop-shadow-sm">
                  {title}
                </h3>
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-all duration-200 hover:scale-110"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          )}
          
          {/* Modal Content */}
          <div className={title ? "p-6" : "p-6"}>
            {!title && showCloseButton && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 text-gray-600 hover:text-gray-800 bg-white hover:bg-gray-100 p-2 rounded-lg transition-all duration-200 hover:scale-110 shadow-lg border border-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            )}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;