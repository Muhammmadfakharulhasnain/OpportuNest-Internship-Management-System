import PropTypes from 'prop-types';
import { AlertTriangle, Info } from 'lucide-react';

const DevelopmentNotice = ({ 
  type = 'info', 
  title = 'Development Notice', 
  message = 'This feature is currently under development.',
  className = ''
}) => {
  const getIconAndStyles = () => {
    switch (type) {
      case 'warning':
        return {
          icon: <AlertTriangle className="w-5 h-5" />,
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          iconColor: 'text-yellow-600',
          titleColor: 'text-yellow-800',
          textColor: 'text-yellow-700'
        };
      case 'info':
      default:
        return {
          icon: <Info className="w-5 h-5" />,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          iconColor: 'text-blue-600',
          titleColor: 'text-blue-800',
          textColor: 'text-blue-700'
        };
    }
  };

  const { icon, bgColor, borderColor, iconColor, titleColor, textColor } = getIconAndStyles();

  return (
    <div className={`rounded-lg border p-4 ${bgColor} ${borderColor} ${className}`}>
      <div className="flex items-start space-x-3">
        <div className={iconColor}>
          {icon}
        </div>
        <div className="flex-1">
          <h3 className={`text-sm font-medium ${titleColor}`}>
            {title}
          </h3>
          <p className={`mt-1 text-sm ${textColor}`}>
            {message}
          </p>
        </div>
      </div>
    </div>
  );
};

DevelopmentNotice.propTypes = {
  type: PropTypes.oneOf(['info', 'warning']),
  title: PropTypes.string,
  message: PropTypes.string,
  className: PropTypes.string
};

export default DevelopmentNotice;