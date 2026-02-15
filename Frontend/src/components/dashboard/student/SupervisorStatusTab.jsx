import { useState, useEffect } from 'react';
import { 
  Clock, CheckCircle, XCircle, User, Mail, Phone, 
  MessageSquare, Award, Briefcase, ArrowRight,
  ChevronRight,
  BookOpen, Target
} from 'lucide-react';
import { useStudent } from '../../../context/StudentContext';
import { supervisionRequestAPI } from '../../../services/api';
import Card from '../../../ui/Card';
import Badge from '../../../ui/Badge';
import Button from '../../../ui/Button';
import PropTypes from 'prop-types';

const SupervisorStatusTab = ({ setActiveTab, supervisorTabIdx }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { selectedSupervisor } = useStudent();

  useEffect(() => {
    fetchRequests();
    // Enhanced debug: Log supervisor data structure
    if (selectedSupervisor) {
      console.log('=== SUPERVISOR DEBUG INFO ===');
      console.log('Selected Supervisor Data:', selectedSupervisor);
      console.log('Supervisor name:', selectedSupervisor.name);
      console.log('Supervisor email:', selectedSupervisor.email);
      console.log('Supervisor designation:', selectedSupervisor.designation);
      console.log('Supervisor department:', selectedSupervisor.department);
      console.log('Supervisor phone:', selectedSupervisor.phone);
      console.log('Supervisor office:', selectedSupervisor.office);
      console.log('All supervisor keys:', Object.keys(selectedSupervisor));
      console.log('==============================');
    } else {
      console.log('No selectedSupervisor data available');
    }
  }, [selectedSupervisor]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await supervisionRequestAPI.getStudentRequests();
      if (response.success) {
        setRequests(response.data || []);
      } else {
        setError('Failed to fetch supervision requests');
      }
    } catch (err) {
      console.error('Error fetching supervision requests:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-6 h-6 text-gray-500" />;
      case 'accepted':
        return <CheckCircle className="w-6 h-6 text-[#00509E]" />;
      case 'rejected':
        return <XCircle className="w-6 h-6 text-gray-700" />;
      default:
        return <Clock className="w-6 h-6 text-gray-500" />;
    }
  };

  const getStatusMessage = (request) => {
    switch (request.status) {
      case 'pending':
        return `Your request to ${request.supervisorName} is pending approval.`;
      case 'accepted':
        return `Your supervisor ${request.supervisorName} has accepted you. You can now apply for jobs.`;
      case 'rejected':
        return `Your request to ${request.supervisorName} was rejected. Please select a new supervisor.`;
      default:
        return 'Unknown status';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'accepted':
        return 'success';
      case 'rejected':
        return 'danger';
      default:
        return 'default';
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'pending':
        return {
          iconBg: 'bg-[#003366]',
          textColor: 'text-gray-700',
          dotColor: 'bg-[#003366]'
        };
      case 'accepted':
        return {
          iconBg: 'bg-[#00509E]',
          textColor: 'text-gray-700',
          dotColor: 'bg-[#00509E]'
        };
      case 'rejected':
        return {
          iconBg: 'bg-gray-700',
          textColor: 'text-gray-700',
          dotColor: 'bg-gray-700'
        };
      default:
        return {
          iconBg: 'bg-gray-500',
          textColor: 'text-gray-700',
          dotColor: 'bg-gray-500'
        };
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-gray-200 border-t-[#003366] rounded-full animate-spin"></div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Loading Supervision Status</h3>
              <p className="text-gray-600">Please wait while we fetch your supervision information...</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card className="p-8 text-center border-gray-200">
          <div className="flex flex-col items-center">
            <div className="p-4 bg-gray-500 rounded-full">
              <XCircle className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Something Went Wrong</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button 
                onClick={fetchRequests}
                className="bg-[#003366] hover:bg-[#00509E] text-white px-6 py-2 rounded-lg"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Show current supervisor if assigned
  if (selectedSupervisor) {
    return (
      <div className="space-y-6">
        {/* Simplified Header - Jobs Tab Style */}
        <div className="space-y-3 pb-6 border-b border-gray-200">
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">
            Supervision Status
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl">
            Your current supervision assignment and contact information
          </p>
          <div className="w-24 h-1 bg-[#003366] rounded-full mt-4"></div>
        </div>



        {/* Supervisor Information Card */}
        <Card className="group bg-white border border-gray-200 hover:border-[#003366] rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-green-500 to-green-600"></div>
          
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Supervision Approved!</h3>
                  <p className="text-gray-600">You are now under the supervision of <span className="font-semibold text-[#003366]">{selectedSupervisor.name}</span></p>
                </div>
              </div>
              <Badge className="bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-full text-sm font-medium">
                Active
              </Badge>
            </div>

            {/* Supervisor Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-[#003366] rounded-lg flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-500 font-medium mb-1">Supervisor Name</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedSupervisor.name}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-[#0059b3] rounded-lg flex items-center justify-center flex-shrink-0">
                    <Award className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-500 font-medium mb-1">Designation</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {selectedSupervisor.designation && selectedSupervisor.designation !== 'Designation not specified' 
                        ? selectedSupervisor.designation 
                        : 'Not specified'
                      }
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-500 font-medium mb-1">Email Address</p>
                    <p className="text-base font-semibold text-gray-900 break-words">
                      {selectedSupervisor.email || 'Not specified'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-500 font-medium mb-1">Phone Number</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {selectedSupervisor.phone && selectedSupervisor.phone !== 'Phone not specified' 
                        ? selectedSupervisor.phone 
                        : 'Not specified'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Department Info */}
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#003366] rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-1">Department</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedSupervisor.department && selectedSupervisor.department !== 'Department not specified' 
                      ? selectedSupervisor.department 
                      : 'Not specified'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Next Steps */}
        <Card className="group bg-white border border-gray-200 hover:border-[#003366] rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-[#003366] to-[#0059b3]"></div>
          
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#003366] to-[#0059b3] rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#003366] transition-colors">Ready for Internships!</h3>
                  <p className="text-gray-600">You can now apply for internship positions under supervision</p>
                </div>
              </div>
              <div className="flex items-center">
                <Target className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-sm font-medium text-green-700">All Set</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button 
            className="flex items-center justify-center gap-2 bg-[#003366] hover:bg-[#00509E] text-white py-3 rounded-lg transition-all duration-300"
            onClick={() => {/* Navigate to internships */}}
          >
            <Briefcase className="w-5 h-5" />
            <span>View Internships</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
          
          <Button 
            variant="outline"
            className="flex items-center justify-center gap-2 border border-gray-300 hover:border-gray-400 py-3 rounded-lg transition-all duration-300"
            onClick={() => {/* Contact supervisor */}}
          >
            <MessageSquare className="w-5 h-5" />
            <span>Contact Supervisor</span>
          </Button>
        </div>
      </div>
    );
  }

  // Show supervision requests
  return (
    <div className="space-y-6">
      {/* Simplified Header - Jobs Tab Style */}
      <div className="space-y-3 pb-6 border-b border-gray-200">
        <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">
          Supervision Status
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl">
          Track your supervision requests and current status
        </p>
        <div className="w-24 h-1 bg-[#003366] rounded-full mt-4"></div>
      </div>

      {requests.length === 0 ? (
        /* No Requests State */
        <Card className="group bg-white border border-gray-200 hover:border-[#003366] rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-gray-300 to-gray-400"></div>
          
          <div className="p-8 text-center">
            <div className="flex flex-col items-center gap-6">
              <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                <User className="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No Supervision Requests Yet</h3>
                <p className="text-gray-600 mb-8 max-w-md">
                  You haven&apos;t sent any supervision requests yet. Start your journey by selecting a supervisor to guide your internship experience.
                </p>
                <Button
                  onClick={() => setActiveTab && supervisorTabIdx !== undefined && setActiveTab(supervisorTabIdx)}
                  className="bg-[#003366] hover:bg-[#0059b3] text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                >
                  <User className="w-5 h-5 mr-2" />
                  Find Supervisors
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ) : (
        /* Requests List */
        <div className="space-y-4">
          {requests.map((request) => {
            const statusConfig = getStatusConfig(request.status);
            
            return (
              <Card 
                key={request._id} 
                className="group bg-white border border-gray-200 hover:border-[#003366] rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
              >
                <div className={`h-2 bg-gradient-to-r ${
                  request.status === 'pending' ? 'from-yellow-400 to-yellow-500' :
                  request.status === 'accepted' ? 'from-green-500 to-green-600' :
                  'from-red-500 to-red-600'
                }`}></div>
                
                <div className="p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 ${statusConfig.iconBg} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        {getStatusIcon(request.status)}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#003366] transition-colors">
                          {request.supervisorName}
                        </h3>
                        <p className={`${statusConfig.textColor} font-medium`}>
                          {getStatusMessage(request)}
                        </p>
                      </div>
                    </div>
                    <Badge variant={getStatusColor(request.status)} className="px-3 py-1 text-sm font-semibold">
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </Badge>
                  </div>

                  {/* Request Timeline */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-[#003366]" />
                      Request Timeline
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100">
                        <div className="w-3 h-3 bg-[#003366] rounded-full"></div>
                        <div>
                          <p className="text-gray-500 font-medium text-sm">Request Sent</p>
                          <p className="text-gray-900 font-semibold">
                            {new Date(request.requestedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      {request.respondedAt && (
                        <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100">
                          <div className={`w-3 h-3 ${statusConfig.dotColor} rounded-full`}></div>
                          <div>
                            <p className="text-gray-500 font-medium text-sm">Response Date</p>
                            <p className="text-gray-900 font-semibold">
                              {new Date(request.respondedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Supervisor Comments */}
                  {request.supervisorComments && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <MessageSquare className="w-4 h-4 mr-2 text-[#003366]" />
                        Supervisor&apos;s Feedback
                      </h4>
                      <div className="bg-white p-3 rounded-lg border border-blue-100">
                        <p className="text-gray-800 italic">&ldquo;{request.supervisorComments}&rdquo;</p>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    {request.status === 'rejected' && (
                      <Button
                        onClick={() => setActiveTab && supervisorTabIdx !== undefined && setActiveTab(supervisorTabIdx)}
                        className="flex items-center justify-center gap-2 bg-[#003366] hover:bg-[#0059b3] text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                      >
                        <User className="w-4 h-4" />
                        Select New Supervisor
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    )}

                    {request.status === 'accepted' && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                              <Briefcase className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900">Congratulations!</h4>
                              <p className="text-gray-600 text-sm">You can now apply for internships</p>
                            </div>
                          </div>
                          <Badge className="bg-green-100 text-green-700 border border-green-300 px-3 py-1 rounded-full text-sm font-medium">
                            Ready
                          </Badge>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

SupervisorStatusTab.propTypes = {
  setActiveTab: PropTypes.func,
  supervisorTabIdx: PropTypes.number
};

export default SupervisorStatusTab;