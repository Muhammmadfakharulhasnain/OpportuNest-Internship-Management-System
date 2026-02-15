import React from 'react';

const Select = ({ 
  label, 
  options, 
  error, 
  className = '', 
  required = false,
  ...props 
}) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
          error ? 'border-red-300' : ''
        } ${className}`}
        {...props}
      >
        <option value="">Select an option</option>
        {options.map((option, index) => (
          <option 
            key={option.key || option.value || index} 
            value={option.value}
            disabled={option.disabled}
            style={option.disabled ? { color: '#9ca3af', fontStyle: 'italic' } : {}}
          >
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Select;