import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, FileText, RefreshCw } from 'lucide-react';
import { studentAPI } from '../../../services/api';
import Card from '../../../ui/Card';
import Badge from '../../../ui/Badge';
import Button from '../../../ui/Button';
import LoadingSpinner from '../../../ui/LoadingSpinner';
import { toast } from 'react-hot-toast';

const EligibilityTab = () => {
  const [eligibilityData, setEligibilityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  // Fetch current profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await studentAPI.getProfile();
        if (response.success) {
          // Profile data is not used directly but fetched to ensure it's updated
          console.log('Profile fetched for eligibility check');
        }
      } catch (error) {
        // For new users without profile, this is expected
        if (error.message === 'Student not found') {
          console.log('New user detected - no profile found yet for eligibility check');
        } else {
          console.error('Error fetching profile:', error);
        }
      }
    };
    fetchProfile();
  }, []);

  // Check eligibility on component mount
  useEffect(() => {
    checkEligibility();
  }, []);

  const checkEligibility = async () => {
    try {
      setChecking(true);
      const response = await studentAPI.checkEligibility();
      if (response.success) {
        setEligibilityData(response.data);
      } else {
        toast.error('Failed to check eligibility');
      }
    } catch (error) {
      console.error('Error checking eligibility:', error);
      toast.error('Error checking eligibility');
    } finally {
      setLoading(false);
      setChecking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  if (!eligibilityData) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to check eligibility</h3>
            <p className="text-gray-600 mb-4">There was an error checking your eligibility status.</p>
            <Button onClick={checkEligibility} disabled={checking}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const { eligible, requirements, unmetRequirements } = eligibilityData;

  const eligibilityChecks = [
    {
      id: 1,
      requirement: 'CGPA ≥ 2.5',
      status: requirements.cgpa?.met ? 'met' : 'not-met',
      value: requirements.cgpa?.value ? `${requirements.cgpa.value}` : 'Not provided',
      description: 'Minimum CGPA requirement for internship eligibility'
    },
    {
      id: 2,
      requirement: 'Semester ≥ 5',
      status: requirements.semester?.met ? 'met' : 'not-met',
      value: requirements.semester?.value || 'Not provided',
      description: 'Must be in 5th semester or higher'
    },
    {
      id: 3,
      requirement: 'No Active Backlogs',
      status: requirements.backlogs?.met ? 'met' : 'not-met',
      value: requirements.backlogs?.value !== null ? `${requirements.backlogs.value} backlogs` : 'Not provided',
      description: 'No pending course failures'
    },
    {
      id: 4,
      requirement: 'Attendance ≥ 75%',
      status: requirements.attendance?.met ? 'met' : 'not-met',
      value: requirements.attendance?.value ? `${requirements.attendance.value}%` : 'Not provided',
      description: 'Minimum attendance requirement'
    },
    {
      id: 5,
      requirement: 'Code of Conduct Acknowledgment',
      status: requirements.codeOfConduct?.met ? 'met' : 'not-met',
      value: requirements.codeOfConduct?.met ? 'Acknowledged' : 'Not acknowledged',
      description: 'Must acknowledge internship code of conduct'
    }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'met': return CheckCircle;
      case 'not-met': return XCircle;
      case 'warning': return AlertCircle;
      default: return AlertCircle;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'met': return 'success';
      case 'not-met': return 'danger';
      case 'warning': return 'warning';
      default: return 'default';
    }
  };

  const handleCodeOfConductAcknowledge = async () => {
    try {
      // Update profile with code of conduct acknowledgment
      const formData = new FormData();
      formData.append('codeOfConduct', 'true');
      
      const response = await studentAPI.updateProfile(formData);
      if (response.success) {
        toast.success('Code of Conduct acknowledged successfully');
        // Refresh eligibility check
        checkEligibility();
      } else {
        toast.error('Failed to acknowledge Code of Conduct');
      }
    } catch (error) {
      console.error('Error acknowledging code of conduct:', error);
      toast.error('Error acknowledging Code of Conduct');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Page Title Section - Matching Jobs Tab */}
        <div className="space-y-3 pb-6 border-b border-gray-200">
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">
            Internship Eligibility
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl">
            Check your eligibility status and requirements for internship applications
          </p>
          <div className="w-24 h-1 bg-[#003366] rounded-full mt-4"></div>
        </div>

        {/* Overall Status Card - Enhanced Design */}
        <Card className={`p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${
          eligible ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-lg ${
              eligible ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {eligible ? (
                <CheckCircle className="w-8 h-8 text-green-600" />
              ) : (
                <XCircle className="w-8 h-8 text-red-600" />
              )}
            </div>
            <div>
              <h3 className={`text-2xl font-bold ${
                eligible ? 'text-green-900' : 'text-red-900'
              }`}>
                {eligible ? 'Eligible for Internship' : 'Not Eligible for Internship'}
              </h3>
              <p className={`text-lg ${
                eligible ? 'text-green-700' : 'text-red-700'
              }`}>
                {eligible 
                  ? 'You meet all requirements and can apply for internships.'
                  : 'Please address the requirements below to become eligible.'
                }
              </p>
            </div>
          </div>
          
          {!eligible && unmetRequirements.length > 0 && (
            <div className="mt-6 p-4 bg-red-100 rounded-lg border border-red-200">
              <h4 className="font-semibold text-red-900 mb-3">Requirements Not Met:</h4>
              <ul className="text-sm text-red-800 space-y-2">
                {unmetRequirements.map((req, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-red-600 mt-1">•</span>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>

        {/* Detailed Requirements Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-900">Eligibility Requirements</h2>
            <Button 
              onClick={checkEligibility} 
              disabled={checking}
              variant="outline"
              className="text-[#003366] border-[#003366] hover:bg-[#003366] hover:text-white"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${checking ? 'animate-spin' : ''}`} />
              {checking ? 'Checking...' : 'Refresh Status'}
            </Button>
          </div>
        
          <div className="grid gap-4">
            {eligibilityChecks.map((check) => {
              const StatusIcon = getStatusIcon(check.status);
              
              return (
                <Card key={check.id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-lg ${
                        check.status === 'met' ? 'bg-green-100' : 
                        check.status === 'warning' ? 'bg-yellow-100' : 'bg-red-100'
                      }`}>
                        <StatusIcon className={`w-5 h-5 ${
                          check.status === 'met' ? 'text-green-600' : 
                          check.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
                        }`} />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">{check.requirement}</h4>
                        <p className="text-sm text-gray-600 mt-1">{check.description}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <Badge variant={getStatusColor(check.status)} className="mb-2">
                        {check.status === 'met' ? 'Met' : check.status === 'warning' ? 'Warning' : 'Not Met'}
                      </Badge>
                      <p className="text-sm font-medium text-gray-700">{check.value}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
      </div>

        {/* Code of Conduct Section */}
        {!requirements.codeOfConduct?.met && (
          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 p-6">
            <div className="flex items-start space-x-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Code of Conduct
                </h3>
                <p className="text-gray-600 mb-4 text-base">
                  Please review and acknowledge the internship code of conduct to complete your eligibility.
                </p>
                
                <div className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3">Key Requirements:</h4>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex items-start space-x-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>Maintain professional behavior at all times</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>Submit all reports on time</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>Follow company policies and procedures</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>Represent COMSATS University positively</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>Complete the full internship duration</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>Respect confidentiality and intellectual property</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>Communicate regularly with your supervisor</span>
                    </li>
                  </ul>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Button 
                    variant="outline"
                    className="text-[#003366] border-[#003366] hover:bg-[#003366] hover:text-white"
                  >
                    View Full Document
                  </Button>
                  <Button 
                    onClick={handleCodeOfConductAcknowledge}
                    className="bg-[#003366] hover:bg-[#00509E] text-white"
                  >
                    I Acknowledge & Agree
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Next Steps */}
        {eligible && (
          <Card className="bg-green-50 border border-green-200 shadow-sm p-6">
            <div className="flex items-start space-x-4">
              <div className="bg-green-100 p-2 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-green-900 mb-3">
                  Ready to Apply!
                </h3>
                <p className="text-green-800 mb-4 text-base">
                  You meet all eligibility requirements. Here's what you can do next:
                </p>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-green-700">Browse available internship positions in the Jobs tab</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-green-700">Complete your profile with CV and certificates</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-green-700">Select a supervisor for your internship</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-green-700">Submit applications to preferred companies</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-green-700">Wait for responses and prepare for interviews</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Profile Completion Reminder */}
        {!eligible && (
          <Card className="bg-yellow-50 border border-yellow-200 shadow-sm p-6">
            <div className="flex items-start space-x-4">
              <div className="bg-yellow-100 p-2 rounded-lg">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-yellow-900 mb-3">
                  Complete Your Profile
                </h3>
                <p className="text-yellow-800 mb-4 text-base">
                  Make sure to update your profile with all required information to meet eligibility requirements.
                </p>
                <Button 
                  variant="outline" 
                  className="text-yellow-800 border-yellow-400 hover:bg-yellow-100"
                >
                  Go to Profile Tab
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default EligibilityTab;