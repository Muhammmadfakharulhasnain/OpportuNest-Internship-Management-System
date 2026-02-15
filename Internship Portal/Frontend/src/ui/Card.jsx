import React from 'react';

const Card = ({ 
  children, 
  className = '', 
  padding = 'p-6',
  hover = false,
  ...props 
}) => {
  const hoverClasses = hover ? 'hover:shadow-lg hover:-translate-y-1 transition-all duration-200' : '';
  
  return (
    <div 
      className={`bg-white rounded-lg shadow-sm border border-gray-200 ${padding} ${hoverClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;