import { useState } from 'react';
import { Building2, CheckCircle, AlertCircle, Edit3 } from 'lucide-react';
import Modal from '../../../ui/Modal';
import Button from '../../../ui/Button';

const ProfileCompletionModal = ({ isOpen, onClose, onCompleteProfile, profileCompleteness = 0 }) => {
  const [requiredFields] = useState([
    { field: 'companyName', label: 'Company Name', required: true },
    { field: 'industry', label: 'Industry', required: true },
    { field: 'about', label: 'About Company', required: true },
    { field: 'companyEmail', label: 'Company Email', required: true },
    { field: 'website', label: 'Website', required: true },
    { field: 'foundedYear', label: 'Founded Year', required: true },
    { field: 'employeeCount', label: 'Employee Count', required: true },
    { field: 'headquartersLocation', label: 'Headquarters Location', required: true },
    { field: 'vision', label: 'Vision Statement', required: true },
    { field: 'mission', label: 'Mission Statement', required: true },
    { field: 'contactPerson', label: 'Contact Person Details', required: true },
    { field: 'profilePicture', label: 'Company Logo', required: false },
    { field: 'bannerImage', label: 'Banner Image', required: false },
    { field: 'socialMedia', label: 'Social Media Links', required: false },
    { field: 'specialties', label: 'Specialties', required: false }
  ]);

  const isProfileComplete = profileCompleteness >= 85; // Consider 85%+ as complete
  const requiredFieldsCount = requiredFields.filter(field => field.required).length;
  const estimatedComplete = Math.round((profileCompleteness / 100) * requiredFieldsCount);

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {}} // Prevent closing by clicking outside or escape
      title=""
      size="lg"
      showCloseButton={false} // Remove close button to make it mandatory
    >
      <div className="text-center space-y-6">
        {/* Header Icon */}
        <div className="mx-auto flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full">
          <Building2 className="w-8 h-8 text-blue-600" />
        </div>

        {/* Title and Message */}
        <div className="space-y-3">
          <h3 className="text-2xl font-bold text-gray-900">
            Complete Your Company Profile First
          </h3>
          <p className="text-gray-600 text-lg">
            Welcome to the platform! To access all features and start posting jobs, 
            you need to complete your company profile.
          </p>
        </div>

        {/* Progress Section */}
        <div className="bg-gray-50 rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Profile Completeness</span>
            <span className="text-sm font-bold text-blue-600">{profileCompleteness}%</span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-500 ${
                profileCompleteness < 50 ? 'bg-red-500' : 
                profileCompleteness < 85 ? 'bg-yellow-500' : 
                'bg-green-500'
              }`}
              style={{ width: `${profileCompleteness}%` }}
            ></div>
          </div>

          {/* Completion Status */}
          <div className="flex items-center justify-center space-x-2">
            {isProfileComplete ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-green-600 font-medium">Profile Complete!</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5 text-yellow-500" />
                <span className="text-gray-600">
                  {estimatedComplete} of {requiredFieldsCount} required fields completed
                </span>
              </>
            )}
          </div>
        </div>

        {/* Required Fields List */}
        {!isProfileComplete && (
          <div className="bg-blue-50 rounded-lg p-6 space-y-3">
            <h4 className="font-semibold text-gray-900 text-left">Required Information:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-left">
              {requiredFields.filter(field => field.required).map((field, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-gray-700">{field.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Benefits Section */}
        <div className="bg-green-50 rounded-lg p-6 space-y-3">
          <h4 className="font-semibold text-gray-900">After completing your profile, you can:</h4>
          <div className="space-y-2 text-sm text-left">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-gray-700">Post internship positions</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-gray-700">Review student applications</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-gray-700">Manage intern evaluations</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-gray-700">Access detailed reports</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col space-y-3 pt-4">
          <Button
            onClick={onCompleteProfile}
            className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white py-3"
            size="lg"
          >
            <Edit3 className="w-5 h-5" />
            <span>Complete Profile Now</span>
          </Button>
          
          {isProfileComplete && (
            <Button
              onClick={onClose}
              variant="outline"
              className="w-full py-3"
              size="lg"
            >
              Continue to Dashboard
            </Button>
          )}
        </div>

        {/* Note */}
        <p className="text-xs text-gray-500">
          This step is required to ensure quality connections between companies and students.
        </p>
      </div>
    </Modal>
  );
};

export default ProfileCompletionModal;