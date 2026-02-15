import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { AlertTriangle, X, User } from 'lucide-react';
import { studentAPI } from '../../../services/api';
import Button from '../../../ui/Button';
import Card from '../../../ui/Card';

const ProfileCompletionWarning = ({ setActiveTab, profileTabIndex }) => {
  const [showWarning, setShowWarning] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  // Profile completion check function
  const isProfileComplete = (profile) => {
    if (!profile) return false;

    // Required auto-fetched fields (name variations)
    const fullName = profile.fullName || profile.name;
    const requiredAuto = [fullName, profile.email, profile.department, profile.semester, profile.rollNumber];

    // Required student-provided fields (check for non-empty strings and valid numbers)
    const cgpa = profile.cgpa && profile.cgpa.toString().trim() !== '';
    const attendance = profile.attendance && profile.attendance.toString().trim() !== '';
    const phoneNumber = profile.phoneNumber && profile.phoneNumber.toString().trim() !== '';
    const backlogs = profile.backlogs !== null && profile.backlogs !== undefined;

    // CV/Resume: must exist
    const hasCV = profile.cv && (profile.cv.filename || profile.cv.url);

    // Certificates: at least 1
    const certs = profile.certificates || [];
    const hasCertificates = certs.length >= 1;

    // All required fields must be present and non-empty
    const autoFieldsComplete = requiredAuto.every(field => field && field.toString().trim() !== '');
    const studentFieldsComplete = cgpa && attendance && phoneNumber && backlogs !== undefined;

    return autoFieldsComplete && studentFieldsComplete && hasCV && hasCertificates;
  };

  // Calculate profile completion percentage
  const calculateProfileCompletion = (profile) => {
    if (!profile) return 0;

    let completed = 0;
    let total = 0;

    // Auto-fetched fields
    const fullName = profile.fullName || profile.name;
    const requiredAuto = [fullName, profile.email, profile.department, profile.semester, profile.rollNumber];
    total += requiredAuto.length;
    completed += requiredAuto.filter(field => field && field.toString().trim() !== '').length;

    // Student-provided fields
    total += 4; // cgpa, attendance, phoneNumber, backlogs
    if (profile.cgpa && profile.cgpa.toString().trim() !== '') completed++;
    if (profile.attendance && profile.attendance.toString().trim() !== '') completed++;
    if (profile.phoneNumber && profile.phoneNumber.toString().trim() !== '') completed++;
    if (profile.backlogs !== null && profile.backlogs !== undefined) completed++;

    // CV
    total += 1;
    if (profile.cv && (profile.cv.filename || profile.cv.url)) completed++;

    // Certificates
    total += 1;
    const certs = profile.certificates || [];
    if (certs.length >= 1) completed++;

    return Math.round((completed / total) * 100);
  };

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await studentAPI.getProfile();
        if (response.success) {
          setProfileData(response.data);
          const isComplete = isProfileComplete(response.data);
          setShowWarning(!isComplete && !dismissed);
        } else {
          // For new users without profile
          setProfileData(null);
          setShowWarning(!dismissed);
        }
      } catch (error) {
        console.log('Profile not found for new user, showing warning:', error.message);
        setProfileData(null);
        setShowWarning(!dismissed);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [dismissed]);

  const handleGoToProfile = () => {
    setActiveTab(profileTabIndex);
    setShowWarning(false);
  };

  const handleDismiss = () => {
    setDismissed(true);
    setShowWarning(false);
  };

  if (loading || !showWarning) {
    return null;
  }

  const completionPercentage = calculateProfileCompletion(profileData);

  return (
    <div className="mb-6 animate-in slide-in-from-top-2 duration-500">
      <Card className="border-l-4 border-l-yellow-500 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                ⚠️ Complete Your Profile
              </h3>
              <p className="text-gray-700 mb-3">
                Please complete your profile first before using dashboard features.
              </p>
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${completionPercentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-600">
                    {completionPercentage}% Complete
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={handleGoToProfile}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-medium"
                >
                  <User className="w-4 h-4 mr-2" />
                  Go to Profile Tab
                </Button>
                <Button
                  onClick={handleDismiss}
                  variant="secondary"
                  className="px-4 py-2 text-sm font-medium"
                >
                  Ok
                </Button>
              </div>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 ml-4 p-1 rounded-full hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </Card>
    </div>
  );
};

ProfileCompletionWarning.propTypes = {
  setActiveTab: PropTypes.func.isRequired,
  profileTabIndex: PropTypes.number.isRequired
};

export default ProfileCompletionWarning;