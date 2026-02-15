import React from 'react';
import PropTypes from 'prop-types';

/**
 * Button component with customizable variant, size, icons, and loading state.
 * 
 * Props:
 * - children: the content inside the button
 * - variant: button style ('primary', 'secondary', 'outline', 'danger', 'success', 'ghost')
 * - size: button size ('sm', 'md', 'lg')
 * - fullWidth: make button take full width if true
 * - isLoading: show a loading spinner if true
 * - leftIcon: icon on the left side
 * - rightIcon: icon on the right side
 * - className: extra classes
 * - disabled: disables the button
 * - ...props: any other button props (like onClick, type, etc.)
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  // Common styling for all buttons
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';

  // Styles for each button variant
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    outline: 'bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
  };

  // Styles for each size
  const sizeClasses = {
    sm: 'text-sm px-3 py-1.5',
    md: 'text-base px-4 py-2',
    lg: 'text-lg px-6 py-3',
  };

  // If full width is enabled
  const widthClasses = fullWidth ? 'w-full' : '';

  // If the button is disabled or loading, reduce opacity and disable pointer
  const disabledClasses = (disabled || isLoading)
    ? 'opacity-60 cursor-not-allowed'
    : '';

  return (
    <button
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${widthClasses}
        ${disabledClasses}
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {/* Show loading spinner if loading */}
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}

      {/* Show left icon if present and not loading */}
      {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}

      {/* Main button content */}
      {children}

      {/* Show right icon if present and not loading */}
      {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node,
  variant: PropTypes.oneOf(['primary', 'secondary', 'outline', 'danger', 'success', 'ghost']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  fullWidth: PropTypes.bool,
  isLoading: PropTypes.bool,
  leftIcon: PropTypes.node,
  rightIcon: PropTypes.node,
  className: PropTypes.string,
  disabled: PropTypes.bool,
};

export default Button;
