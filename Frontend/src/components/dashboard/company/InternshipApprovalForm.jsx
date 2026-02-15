import React, { useState } from 'react';
import { Building2, MapPin, Calendar, Users, FileText, Send } from 'lucide-react';
import Card from '../../../ui/Card';
import Button from '../../../ui/Button';
import Input from '../../../ui/Input';
import Select from '../../../ui/Select';
import { toast } from 'react-hot-toast';

const InternshipApprovalForm = ({ 
  isOpen, 
  onClose, 
  application, 
  onSubmit 
}) => {
  const [formData, setFormData] = useState({
    // Section A: Organization Information
    organizationName: '',
    address: '',
    industrySector: '',
    contactPersonName: '',
    designation: '',
    phoneNumber: '',
    emailAddress: '',
    
    // Section B: Internship Position Details
    numberOfPositions: '',
    natureOfInternship: {
      softwareDevelopment: false,
      dataScience: false,
      networking: false,
      cyberSecurity: false,
      webMobileDevelopment: false,
      other: false,
      otherText: ''
    },
    internshipLocation: '',
    startDate: '',
    endDate: '',
    workingDaysHours: '',
    mode: {
      onSite: false,
      virtual: false,
      freelancingBased: false
    },
    
    // Section C: For Internship Office Use Only
    receivedBy: '',
    status: '',
    signature: '',
    date: ''
  });

  const [loading, setLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCheckboxChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      // Validate required fields
      const requiredFields = [
        'organizationName', 'address', 'contactPersonName', 
        'phoneNumber', 'emailAddress', 'numberOfPositions',
        'internshipLocation', 'startDate', 'endDate'
      ];
      
      const missingFields = requiredFields.filter(field => !formData[field]);
      if (missingFields.length > 0) {
        toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
        return;
      }

      // Check if at least one nature of internship is selected
      const selectedNatures = Object.values(formData.natureOfInternship).filter(val => val === true);
      if (selectedNatures.length === 0) {
        toast.error('Please select at least one nature of internship');
        return;
      }

      // Check if at least one mode is selected
      const selectedModes = Object.values(formData.mode).filter(val => val === true);
      if (selectedModes.length === 0) {
        toast.error('Please select at least one internship mode');
        return;
      }

      await onSubmit(formData);
      toast.success('Internship approval form submitted successfully!');
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to submit form');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" />
        
        <div className="inline-block w-full max-w-4xl p-6 my-8 text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900 flex items-center">
              <FileText className="w-6 h-6 mr-2 text-blue-600" />
              Internship Approval Form
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="space-y-8 max-h-[70vh] overflow-y-auto">
            {/* Section A: Organization Information */}
            <Card className="p-6 bg-blue-50 border-blue-200">
              <div className="flex items-center mb-4">
                <Building2 className="w-5 h-5 mr-2 text-blue-600" />
                <h4 className="text-lg font-semibold text-blue-900">Section A: Organization Information</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Organization Name *"
                  required
                  value={formData.organizationName}
                  onChange={(e) => handleInputChange('organizationName', e.target.value)}
                />
                <Input
                  label="Address *"
                  required
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                />
                <Input
                  label="Industry Sector"
                  value={formData.industrySector}
                  onChange={(e) => handleInputChange('industrySector', e.target.value)}
                />
                <Input
                  label="Contact Person Name *"
                  required
                  value={formData.contactPersonName}
                  onChange={(e) => handleInputChange('contactPersonName', e.target.value)}
                />
                <Input
                  label="Designation"
                  value={formData.designation}
                  onChange={(e) => handleInputChange('designation', e.target.value)}
                />
                <Input
                  label="Phone Number *"
                  required
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                />
                <Input
                  label="Email Address *"
                  required
                  type="email"
                  value={formData.emailAddress}
                  onChange={(e) => handleInputChange('emailAddress', e.target.value)}
                />
              </div>
            </Card>

            {/* Section B: Internship Position Details */}
            <Card className="p-6 bg-green-50 border-green-200">
              <div className="flex items-center mb-4">
                <Users className="w-5 h-5 mr-2 text-green-600" />
                <h4 className="text-lg font-semibold text-green-900">Section B: Internship Position Details</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nature of Internship *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      { key: 'softwareDevelopment', label: 'Software Development' },
                      { key: 'dataScience', label: 'Data Science' },
                      { key: 'networking', label: 'Networking' },
                      { key: 'cyberSecurity', label: 'Cyber Security' },
                      { key: 'webMobileDevelopment', label: 'Web/Mobile Development' },
                      { key: 'other', label: 'Other' }
                    ].map((item) => (
                      <label key={item.key} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.natureOfInternship[item.key]}
                          onChange={(e) => handleCheckboxChange('natureOfInternship', item.key, e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{item.label}</span>
                      </label>
                    ))}
                  </div>
                  {formData.natureOfInternship.other && (
                    <Input
                      label="Other (Please specify)"
                      className="mt-3"
                      value={formData.natureOfInternship.otherText}
                      onChange={(e) => handleCheckboxChange('natureOfInternship', 'otherText', e.target.value)}
                    />
                  )}
                </div>

                <Input
                  label="Internship Location *"
                  required
                  value={formData.internshipLocation}
                  onChange={(e) => handleInputChange('internshipLocation', e.target.value)}
                />
                <Input
                  label="Start Date *"
                  required
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                />
                <Input
                  label="End Date *"
                  required
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                />
                <Input
                  label="Working Days & Hours"
                  value={formData.workingDaysHours}
                  onChange={(e) => handleInputChange('workingDaysHours', e.target.value)}
                />
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mode *
                  </label>
                  <div className="flex space-x-6">
                    {[
                      { key: 'onSite', label: 'On-Site' },
                      { key: 'virtual', label: 'Virtual' },
                      { key: 'freelancingBased', label: 'Freelancing Based' }
                    ].map((item) => (
                      <label key={item.key} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.mode[item.key]}
                          onChange={(e) => handleCheckboxChange('mode', item.key, e.target.checked)}
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-700">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="w-4 h-4 mr-2" />
              {loading ? 'Submitting...' : 'Submit Form'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InternshipApprovalForm;
