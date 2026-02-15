import React from 'react';

const NotificationBadge = ({ count, className = '' }) => {
  if (!count || count === 0) return null;

  return (
    <span 
      className={`
        absolute -top-1 -right-1 
        inline-flex items-center justify-center 
        min-w-[18px] h-[18px] 
        text-xs font-bold text-white 
        bg-red-500 
        rounded-full 
        border-2 border-white
        shadow-lg
        animate-pulse
        ${className}
      `}
    >
      {count > 99 ? '99+' : count}
    </span>
  );
};

export default NotificationBadge;