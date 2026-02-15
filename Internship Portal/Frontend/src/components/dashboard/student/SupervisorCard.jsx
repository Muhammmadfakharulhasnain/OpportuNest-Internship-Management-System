import { 
  User, Mail, Phone, MapPin, Clock, Users, 
  CheckCircle2, AlertCircle, Zap, Award, ChevronRight,
  MessageCircle, BookOpen, TrendingUp
} from 'lucide-react';
import Card from '../../../ui/Card';
import Badge from '../../../ui/Badge';
import Button from '../../../ui/Button';
import PropTypes from 'prop-types';

const SupervisorCard = ({ 
  supervisor, 
  isSelected = false, 
  onSelect, 
  showSelectButton = true,
  isSelecting = false,
  supervisionRequest = null,
  viewMode = 'grid' // 'grid' or 'list'
}) => {
  const isAvailable = supervisor.currentStudents < supervisor.maxStudents;
  const availableSlots = supervisor.maxStudents - (supervisor.currentStudents || 0);
  const utilizationPercentage = Math.round(((supervisor.currentStudents || 0) / supervisor.maxStudents) * 100);
  
  // Determine if this supervisor has a pending/accepted request
  const hasActiveRequest = supervisionRequest && 
    (supervisionRequest.supervisorId._id === supervisor._id || supervisionRequest.supervisorId._id === supervisor.id);
  const requestStatus = hasActiveRequest ? supervisionRequest.status : null;
  
  // Check if student has ANY pending or accepted request (to any supervisor)
  const hasAnyActiveRequest = supervisionRequest && 
    (supervisionRequest.status === 'pending' || supervisionRequest.status === 'accepted');
  
  // Button should be disabled if:
  // 1. Supervisor has no slots available
  // 2. Student is currently selecting (loading state)
  // 3. Student has ANY pending request (to any supervisor)
  // 4. Student has an accepted request (assigned to a supervisor)
  const isButtonDisabled = !isAvailable || isSelecting || hasAnyActiveRequest;

  // Get status badge configuration
  const getStatusConfig = () => {
    if (isSelected) return { variant: 'success', text: 'Selected', icon: CheckCircle2 };
    if (hasActiveRequest && requestStatus === 'pending') return { variant: 'warning', text: 'Pending', icon: Clock };
    if (hasActiveRequest && requestStatus === 'accepted') return { variant: 'success', text: 'Accepted', icon: CheckCircle2 };
    if (isAvailable) return { variant: 'success', text: 'Available', icon: Users };
    return { variant: 'danger', text: 'Full', icon: AlertCircle };
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  // Enhanced List view layout with modern COMSATS design
  if (viewMode === 'list') {
    return (
      <Card 
        className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 border ${
          isSelected 
            ? 'border-[#003366] bg-blue-50/30 shadow-lg shadow-blue-500/20 ring-2 ring-blue-200' 
            : 'border-gray-200 hover:border-[#003366]/50 bg-white'
        }`}
      >
        {/* COMSATS Accent Bar */}
        <div className={`absolute top-0 left-0 right-0 h-2 ${
          isSelected 
            ? 'bg-gradient-to-r from-blue-500 to-blue-600 shadow-sm' 
            : 'bg-gradient-to-r from-gray-300 to-gray-400 group-hover:from-[#003366] group-hover:to-[#00509E] transition-all duration-300'
        }`} />
        
        <div className="p-4">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center shadow-md ${
              isSelected 
                ? 'bg-gradient-to-br from-blue-500 to-blue-600 ring-2 ring-blue-200' 
                : 'bg-gradient-to-br from-[#003366] to-[#00509E]'
            }`}>
              <User className="w-6 h-6 text-white" />
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0 mr-4">
                  <h3 className="text-lg font-bold text-gray-900 truncate mb-1">
                    {supervisor.name}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-[#003366] mb-2">
                    <span className="font-medium">{supervisor.designation}</span>
                    <span className="text-gray-400">•</span>
                    <span className="font-medium truncate">{supervisor.department}</span>
                  </div>
                </div>
                <Badge 
                  variant={statusConfig.variant} 
                  className="flex items-center gap-1 px-3 py-1 text-xs font-semibold flex-shrink-0"
                >
                  <StatusIcon className="w-3 h-3" />
                  <span>{statusConfig.text}</span>
                </Badge>
              </div>

              {/* Contact Info Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 mb-3">
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded text-xs">
                  <Mail className="w-3 h-3 text-[#003366] flex-shrink-0" />
                  <span className="truncate font-medium">{supervisor.email}</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded text-xs">
                  <MapPin className="w-3 h-3 text-[#00509E] flex-shrink-0" />
                  <span className="truncate font-medium">{supervisor.office}</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded text-xs">
                  <Clock className="w-3 h-3 text-[#003366] flex-shrink-0" />
                  <span className="truncate font-medium">{supervisor.officeHours}</span>
                </div>
              </div>

              {/* Bottom Row */}
              <div className="flex items-center justify-between gap-4">
                {/* Capacity */}
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <div className="text-xs text-gray-500 font-medium">Student Capacity</div>
                    <div className="text-sm font-bold text-[#003366]">
                      {supervisor.currentStudents || 0}/{supervisor.maxStudents}
                    </div>
                    {isAvailable && (
                      <div className="text-xs text-green-600 font-medium">
                        {availableSlots} available
                      </div>
                    )}
                  </div>
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        utilizationPercentage >= 90 ? 'bg-red-500' : 
                        utilizationPercentage >= 70 ? 'bg-yellow-500' : 
                        'bg-[#003366]'
                      }`}
                      style={{ width: `${utilizationPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Expertise */}
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Award className="w-4 h-4 text-[#003366] flex-shrink-0" />
                  <div className="flex flex-wrap gap-1 min-w-0">
                    {supervisor.expertise.slice(0, 2).map((skill) => (
                      <Badge key={skill} className="bg-[#003366]/10 text-[#003366] px-2 py-0.5 text-xs font-medium">
                        {skill}
                      </Badge>
                    ))}
                    {supervisor.expertise.length > 2 && (
                      <Badge className="bg-gray-100 text-gray-600 px-2 py-0.5 text-xs">
                        +{supervisor.expertise.length - 2}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                {showSelectButton && !isSelected && (
                  <div className="flex-shrink-0">
                    <Button
                      onClick={() => onSelect && onSelect(supervisor)}
                      disabled={isButtonDisabled}
                      className={`px-4 py-2 text-sm font-medium active:text-white active:[&_*]:text-white focus:text-white focus:[&_*]:text-white ${
                        !isButtonDisabled 
                          ? 'bg-[#003366] hover:bg-[#00509E] text-white' 
                          : hasAnyActiveRequest && !hasActiveRequest
                          ? 'bg-blue-400 text-white cursor-not-allowed'
                          : hasActiveRequest 
                          ? 'bg-blue-500 text-white cursor-not-allowed'
                          : 'bg-gray-400 text-white cursor-not-allowed'
                      }`}
                      title={
                        hasAnyActiveRequest && !hasActiveRequest
                          ? 'You have an active request to another supervisor'
                          : hasActiveRequest
                          ? 'Request already sent to this supervisor'
                          : !isAvailable
                          ? 'This supervisor has reached maximum capacity'
                          : ''
                      }
                    >
                      {isSelecting ? 'Sending...' : 
                       hasActiveRequest ? (requestStatus === 'accepted' ? 'Accepted' : 'Pending') : 
                       hasAnyActiveRequest ? 'Request Active' :
                       isAvailable ? 'Request Supervision' : 'Not Available'}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
      </Card>
    );
  }

  // Grid view layout (enhanced with modern COMSATS styling)
  return (
    <Card 
      className={`group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 hover:-translate-y-1 border h-full flex flex-col ${
        isSelected 
          ? 'border-[#003366] bg-blue-50/30 shadow-lg shadow-blue-500/20 ring-2 ring-blue-200' 
          : 'border-gray-200 hover:border-[#003366]/50 bg-white'
      }`}
    >
      {/* COMSATS Accent Bar */}
      <div className={`absolute top-0 left-0 right-0 h-2 ${
        isSelected 
          ? 'bg-gradient-to-r from-blue-500 to-blue-600 shadow-sm' 
          : 'bg-gradient-to-r from-gray-300 to-gray-400 group-hover:from-[#003366] group-hover:to-[#00509E] transition-all duration-300'
      }`} />
      
      {/* Header Section */}
      <div className="p-4 pb-3 flex-1 flex flex-col">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            {/* Enhanced Avatar */}
            <div className={`relative w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 flex-shrink-0 shadow-md ${
              isSelected 
                ? 'bg-gradient-to-br from-blue-500 to-blue-600 scale-110 ring-3 ring-blue-200' 
                : 'bg-gradient-to-br from-[#003366] to-[#00509E] group-hover:scale-105'
            }`}>
              <User className="w-5 h-5 text-white" />
              {isSelected && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center animate-pulse shadow-lg">
                  <CheckCircle2 className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
            
            {/* Name and Title */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-gray-900 truncate leading-tight mb-1">
                {supervisor.name}
              </h3>
              <p className="text-sm font-medium text-[#003366] truncate">{supervisor.designation}</p>
            </div>
          </div>
          
          {/* Enhanced Status Badge */}
          <Badge 
            variant={statusConfig.variant} 
            className={`flex items-center space-x-1 px-3 py-1 font-semibold text-xs shadow-sm border ${
              isSelected ? 'shadow-lg' : ''
            }`}
          >
            <StatusIcon className="w-3 h-3" />
            <span>{statusConfig.text}</span>
          </Badge>
        </div>

        {/* Enhanced Department Section */}
        <div className="flex items-center mb-3 p-2 bg-[#F5F6FA] rounded-lg border border-gray-100">
          <BookOpen className="w-4 h-4 mr-2 text-[#003366] flex-shrink-0" />
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Department</p>
            <p className="text-sm font-semibold text-gray-900 truncate">{supervisor.department}</p>
          </div>
        </div>

        {/* Enhanced Contact Info Grid */}
        <div className="space-y-2 mb-3">
          <div className="grid grid-cols-1 gap-1.5">
            <div className="flex items-center space-x-2 p-2 bg-white rounded-lg border border-gray-100 shadow-sm">
              <div className="w-6 h-6 bg-[#003366]/10 rounded-lg flex items-center justify-center">
                <Mail className="w-3 h-3 text-[#003366]" />
              </div>
              <span className="text-xs text-gray-700 truncate font-medium">{supervisor.email}</span>
            </div>
            
            <div className="flex items-center space-x-2 p-2 bg-white rounded-lg border border-gray-100 shadow-sm">
              <div className="w-6 h-6 bg-[#00509E]/10 rounded-lg flex items-center justify-center">
                <Phone className="w-3 h-3 text-[#00509E]" />
              </div>
              <span className="text-xs text-gray-700 truncate font-medium">{supervisor.phone}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-1.5">
              <div className="flex items-center space-x-1.5 p-2 bg-white rounded-lg border border-gray-100 shadow-sm">
                <MapPin className="w-3 h-3 text-[#003366] flex-shrink-0" />
                <span className="text-xs text-gray-700 truncate font-medium">{supervisor.office}</span>
              </div>
              <div className="flex items-center space-x-1.5 p-2 bg-white rounded-lg border border-gray-100 shadow-sm">
                <Clock className="w-3 h-3 text-[#00509E] flex-shrink-0" />
                <span className="text-xs text-gray-700 truncate font-medium">{supervisor.officeHours}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Expertise Section */}
        <div className="mb-3">
          <div className="flex items-center mb-2 p-1.5 bg-[#F5F6FA] rounded-lg">
            <Award className="w-3 h-3 text-[#003366] mr-1.5 flex-shrink-0" />
            <span className="text-xs font-bold text-gray-800 uppercase tracking-wide">Research Expertise</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {supervisor.expertise.slice(0, 2).map((skill) => (
              <Badge key={skill} className="bg-[#003366]/10 text-[#003366] border border-[#003366]/20 px-2 py-0.5 font-medium text-xs hover:bg-[#003366]/20 transition-colors">
                <span className="truncate">{skill}</span>
              </Badge>
            ))}
            {supervisor.expertise.length > 2 && (
              <Badge className="bg-gray-100 text-gray-700 border border-gray-200 px-2 py-0.5 font-medium text-xs">
                +{supervisor.expertise.length - 2} more
              </Badge>
            )}
          </div>
        </div>

        {/* Enhanced Capacity Visualization */}
        <div className="bg-gradient-to-r from-[#F5F6FA] to-white rounded-lg p-3 border border-[#003366]/10 shadow-sm mt-auto">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-1.5">
              <div className="w-5 h-5 bg-[#003366] rounded-lg flex items-center justify-center">
                <Users className="w-3 h-3 text-white" />
              </div>
              <span className="text-xs font-bold text-gray-800">Student Capacity</span>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-[#003366]">
                {supervisor.currentStudents || 0}<span className="text-gray-400 text-xs">/{supervisor.maxStudents}</span>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
              <div 
                className={`h-full rounded-full transition-all duration-500 shadow-sm ${
                  utilizationPercentage >= 90 ? 'bg-gradient-to-r from-red-500 to-red-600' : 
                  utilizationPercentage >= 70 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 
                  'bg-gradient-to-r from-[#003366] to-[#00509E]'
                }`}
                style={{ width: `${utilizationPercentage}%` }}
              />
            </div>
            {isAvailable && (
              <div className="mt-2 flex items-center text-xs font-semibold">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                <span className="text-green-700">
                  {availableSlots} slot{availableSlots !== 1 ? 's' : ''} available
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Action Button */}
      {showSelectButton && !isSelected && (
        <div className="p-4 pt-3 border-t border-gray-100 mt-auto">
          <Button
            onClick={() => onSelect && onSelect(supervisor)}
            disabled={isButtonDisabled}
            className={`w-full transition-all duration-300 py-3 px-4 font-semibold text-sm shadow-md active:text-white active:[&_*]:text-white focus:text-white focus:[&_*]:text-white disabled:opacity-100 ${
              !isButtonDisabled 
                ? 'bg-gradient-to-r from-[#003366] to-[#00509E] hover:from-[#00509E] hover:to-[#003366] text-white border-0 hover:scale-105 hover:shadow-lg' 
                : hasAnyActiveRequest && !hasActiveRequest
                ? 'bg-blue-400 text-white border-0 cursor-not-allowed'
                : hasActiveRequest
                ? 'bg-blue-500 text-white border-0 cursor-not-allowed'
                : 'bg-red-500 text-white border-0 cursor-not-allowed'
            }`}
            title={
              hasAnyActiveRequest && !hasActiveRequest
                ? 'You have an active request to another supervisor'
                : hasActiveRequest
                ? 'Request already sent to this supervisor'
                : !isAvailable
                ? 'This supervisor has reached maximum capacity'
                : ''
            }
          >
            {isSelecting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-3" />
                <span>Sending Request...</span>
              </div>
            ) : hasActiveRequest ? (
              <div className="flex items-center justify-center">
                <Clock className="w-4 h-4 mr-2" />
                <span>{requestStatus === 'accepted' ? 'Supervisor Accepted' : 'Request Pending'}</span>
              </div>
            ) : hasAnyActiveRequest ? (
              <div className="flex items-center justify-center">
                <AlertCircle className="w-4 h-4 mr-2" />
                <span>Request Already Active</span>
              </div>
            ) : isAvailable ? (
              <div className="flex items-center justify-center">
                <MessageCircle className="w-4 h-4 mr-2" />
                <span>Request Supervision</span>
                <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <AlertCircle className="w-4 h-4 mr-2" />
                <span>Slots Full</span>
              </div>
            )}
          </Button>
        </div>
      )}

    </Card>
  );
};

SupervisorCard.propTypes = {
  supervisor: PropTypes.shape({
    _id: PropTypes.string,
    id: PropTypes.string,
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    designation: PropTypes.string,
    department: PropTypes.string,
    phone: PropTypes.string,
    office: PropTypes.string,
    officeHours: PropTypes.string,
    maxStudents: PropTypes.number.isRequired,
    currentStudents: PropTypes.number,
    expertise: PropTypes.arrayOf(PropTypes.string)
  }).isRequired,
  isSelected: PropTypes.bool,
  onSelect: PropTypes.func,
  showSelectButton: PropTypes.bool,
  isSelecting: PropTypes.bool,
  supervisionRequest: PropTypes.shape({
    supervisorId: PropTypes.shape({
      _id: PropTypes.string
    }),
    status: PropTypes.string
  }),
  viewMode: PropTypes.oneOf(['grid', 'list'])
};

export default SupervisorCard;
