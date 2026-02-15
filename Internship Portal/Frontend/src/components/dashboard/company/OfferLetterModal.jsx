import React, { useState, useEffect } from 'react';
import { FileText, Calendar, Send, Eye, X } from 'lucide-react';
import { PDFViewer } from '@react-pdf/renderer';
import Card from '../../../ui/Card';
import Button from '../../../ui/Button';
import Input from '../../../ui/Input';
import { toast } from 'react-hot-toast';
import { offerLetterAPI } from '../../../services/api';
import OfferLetterPDF from '../../shared/OfferLetterPDF';

const OfferLetterModal = ({ 
  isOpen, 
  onClose, 
  application, 
  onSubmit 
}) => {
  const [offerData, setOfferData] = useState({
    startDate: '',
    endDate: '',
    customMessage: ''
  });
  const [companyData, setCompanyData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingCompany, setFetchingCompany] = useState(false);

  // Fetch company data when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchCompanyData();
    }
  }, [isOpen]);

  const fetchCompanyData = async () => {
    try {
      setFetchingCompany(true);
      const token = localStorage.getItem('token') || JSON.parse(localStorage.getItem('user'))?.token;
      
      const response = await fetch('http://localhost:5005/api/company-profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📋 Company Profile Data:', data.data);
        
        // If company profile exists, use it with fallbacks from user data if needed
        if (data.data) {
          const profile = data.data;
          const userData = JSON.parse(localStorage.getItem('user'));
          
          setCompanyData({
            companyName: profile.companyName || userData?.name || 'Company Name',
            address: profile.address || profile.headquartersLocation || 'Address not specified',
            contactPerson: {
              name: profile.contactPerson?.name || userData?.name || 'Representative Name',
              designation: profile.contactPerson?.designation || 'Position not specified',
              email: profile.contactPerson?.email || profile.companyEmail || userData?.email || '',
              phone: profile.contactPerson?.phone || profile.companyPhone || ''
            },
            // Keep all other profile data
            ...profile
          });
        }
      } else {
        // If no company profile, use user data as fallback
        const userData = JSON.parse(localStorage.getItem('user'));
        setCompanyData({
          companyName: userData?.name || 'Company Name',
          address: 'Address not specified',
          contactPerson: {
            name: userData?.name || 'Representative Name',
            designation: 'Position not specified',
            email: userData?.email || '',
            phone: ''
          }
        });
        console.warn('No company profile found, using user data as fallback');
      }
    } catch (error) {
      console.error('Error fetching company data:', error);
      // Use user data as fallback on error
      const userData = JSON.parse(localStorage.getItem('user'));
      setCompanyData({
        companyName: userData?.name || 'Company Name',
        address: 'Address not specified',
        contactPerson: {
          name: userData?.name || 'Representative Name',
          designation: 'Position not specified',
          email: userData?.email || '',
          phone: ''
        }
      });
    } finally {
      setFetchingCompany(false);
    }
  };

  const handleInputChange = (field, value) => {
    setOfferData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateOfferLetter = () => {
    if (!application || !companyData) return '';

    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const startDate = offerData.startDate ? new Date(offerData.startDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : '[Start Date]';

    const endDate = offerData.endDate ? new Date(offerData.endDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : '[End Date]';

    const supervisorName = typeof application.supervisorId === 'object' 
      ? application.supervisorId.name 
      : 'Your Assigned Supervisor';

    return `INTERNSHIP OFFER LETTER

${companyData.companyName || '[Organization Name]'}
${companyData.address || '[Organization Address]'}

Date: ${currentDate}

To,
Mr./Ms. ${application.studentName}
Email: ${application.studentEmail}

Subject: Internship Offer for the role of "${application.jobTitle}"

Dear ${application.studentName},

We are pleased to offer you the position of ${application.jobTitle} Intern at ${companyData.companyName || '[Organization Name]'}.

Your internship will commence on ${startDate} and conclude on ${endDate}.

This internship will be conducted under the supervision of ${supervisorName}, who will guide you throughout your learning journey.

Additional Notes:
${offerData.customMessage || 'We look forward to your contribution and are excited to have you on board.'}

We look forward to your contribution and are excited to have you on board.

Sincerely,
${companyData.contactPerson?.name || '[Representative Name]'}
${companyData.contactPerson?.designation || '[Position]'}
${companyData.companyName || '[Organization Name]'}`;
  };



  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      // Validate required fields
      if (!offerData.startDate || !offerData.endDate) {
        toast.error('Please fill in both start and end dates');
        return;
      }

      if (new Date(offerData.startDate) >= new Date(offerData.endDate)) {
        toast.error('End date must be after start date');
        return;
      }

      const offerLetterContent = generateOfferLetter();
      const supervisorName = typeof application.supervisorId === 'object' 
        ? application.supervisorId.name 
        : 'Your Assigned Supervisor';
      
      // Prepare offer letter data with all required fields
      const studentId = typeof application.studentId === 'object' ? application.studentId._id : application.studentId;
      const jobId = typeof application.jobId === 'object' ? application.jobId._id : application.jobId;
      const supervisorId = typeof application.supervisorId === 'object' ? application.supervisorId._id : application.supervisorId;
      
      // Ensure all required fields are present
      if (!studentId || !jobId || !supervisorId) {
        console.error('Missing required IDs:', { studentId, jobId, supervisorId });
        toast.error('Missing required application data. Please try again.');
        return;
      }
      
      const offerLetterData = {
        studentId,
        jobId,
        supervisorId,
        offerLetterContent,
        applicationId: application._id,
        studentName: application.studentName || 'Student Name',
        studentEmail: application.studentEmail || 'student@email.com',
        jobTitle: application.jobTitle || 'Position',
        startDate: offerData.startDate,
        endDate: offerData.endDate,
        customMessage: offerData.customMessage || '',
        organizationName: companyData?.companyName || 'Organization Name',
        organizationAddress: companyData?.address || 'Organization Address',
        representativeName: companyData?.contactPerson?.name || 'Representative Name',
        representativePosition: companyData?.contactPerson?.designation || 'Representative Position',
        supervisorName: supervisorName
      };
      
      console.log('=== FRONTEND PAYLOAD DEBUG ===');
      console.log('Application object:', application);
      console.log('Extracted IDs:');
      console.log('- studentId:', studentId);
      console.log('- jobId:', jobId);
      console.log('- supervisorId:', supervisorId);
      console.log('Required fields check:');
      console.log('- studentName:', offerLetterData.studentName);
      console.log('- studentEmail:', offerLetterData.studentEmail);
      console.log('- jobTitle:', offerLetterData.jobTitle);
      console.log('- startDate:', offerLetterData.startDate);
      console.log('- endDate:', offerLetterData.endDate);
      console.log('- applicationId:', offerLetterData.applicationId);
      console.log('Final payload:', offerLetterData);

      // Send offer letter via API
      const response = await offerLetterAPI.sendOfferLetter(offerLetterData);
      
      if (response.success) {
        toast.success('Offer letter generated and sent successfully!');
        await onSubmit(); // This will handle the hiring process
        onClose();
        
        // Reset form
        setOfferData({
          startDate: '',
          endDate: '',
          customMessage: ''
        });
      } else {
        console.error('Backend response:', response);
        if (response.errors && Array.isArray(response.errors)) {
          toast.error(`Validation failed: ${response.errors.join(', ')}`);
        } else {
          toast.error(response.message || 'Failed to send offer letter');
        }
      }
    } catch (error) {
      console.error('Error sending offer letter:', error);
      toast.error('Failed to send offer letter');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900 bg-opacity-50">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />
        
        <div className="relative w-full h-full max-h-[95vh] p-6 text-left align-middle transition-all transform bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="flex items-center justify-between mb-6 bg-gradient-to-r from-[#003366] to-[#00509E] text-white p-4 rounded-t-lg -m-6 mb-4">
            <h3 className="text-2xl font-bold flex items-center">
              <FileText className="w-6 h-6 mr-2" />
              Generate & Send Offer Letter
            </h3>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {fetchingCompany ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00509E]"></div>
              <span className="ml-2 text-[#003366]">Loading company information...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-h-[60vh] overflow-y-auto">
              {/* Left Side - Form */}
              <div className="space-y-6">
                <Card className="p-6 bg-gradient-to-br from-[#003366]/5 to-[#00509E]/10 border-[#00509E]/20">
                  <h4 className="text-lg font-semibold text-[#003366] mb-4">Offer Details</h4>
                  
                  {application && (
                    <div className="mb-4 p-3 bg-white rounded border">
                      <p className="text-sm font-medium text-gray-700">Student: {application.studentName}</p>
                      <p className="text-sm text-gray-600">Position: {application.jobTitle}</p>
                      <p className="text-sm text-gray-600">Email: {application.studentEmail}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Start Date *"
                      type="date"
                      required
                      value={offerData.startDate}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                    <Input
                      label="End Date *"
                      type="date"
                      required
                      value={offerData.endDate}
                      onChange={(e) => handleInputChange('endDate', e.target.value)}
                      min={offerData.startDate || new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Custom Message (Optional)
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows="4"
                      placeholder="Add any additional message or instructions for the intern..."
                      value={offerData.customMessage}
                      onChange={(e) => handleInputChange('customMessage', e.target.value)}
                    />
                  </div>
                </Card>

                {companyData && (
                  <Card className="p-6 bg-blue-50 border-[#00509E]/20">
                    <h4 className="text-lg font-semibold text-[#003366] mb-4">Company Information</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Organization:</strong> {companyData.companyName}</p>
                      <p><strong>Address:</strong> {companyData.address}</p>
                      <p><strong>Representative:</strong> {companyData.contactPerson?.name}</p>
                      <p><strong>Position:</strong> {application?.jobTitle || 'Position not specified'}</p>
                      {companyData.contactPerson?.email && (
                        <p><strong>Email:</strong> {companyData.contactPerson.email}</p>
                      )}
                      {companyData.contactPerson?.phone && (
                        <p><strong>Phone:</strong> {companyData.contactPerson.phone}</p>
                      )}
                    </div>
                  </Card>
                )}
              </div>

              {/* Right Side - Live Preview */}
              <div className="space-y-6">
                <Card className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 border-[#003366]/20 flex flex-col">
                  <div className="flex items-center mb-4">
                    <Eye className="w-5 h-5 mr-2 text-[#00509E]" />
                    <h4 className="text-lg font-semibold text-[#003366]">Live Preview</h4>
                  </div>
                  
                  <div className="bg-white rounded border overflow-hidden" style={{ height: '500px' }}>
                    {application && companyData && offerData.startDate && offerData.endDate ? (
                      <PDFViewer width="100%" height="100%">
                        <OfferLetterPDF offerLetter={{
                          organizationName: companyData.companyName || 'Organization Name',
                          organizationAddress: companyData.address || 'Organization Address',
                          studentName: application.studentName || 'Student Name',
                          studentEmail: application.studentEmail || 'student@email.com',
                          jobTitle: application.jobTitle || 'Internship Position',
                          startDate: offerData.startDate,
                          endDate: offerData.endDate,
                          supervisorName: typeof application.supervisorId === 'object' ? (application.supervisorId.name || 'Assigned Supervisor') : 'Assigned Supervisor',
                          customMessage: offerData.customMessage || 'We look forward to your contribution.',
                          representativeName: companyData.contactPerson?.name || 'Representative Name',
                          representativePosition: `${application.jobTitle || 'Internship'} Coordinator`,
                          sentAt: new Date().toISOString()
                        }} />
                      </PDFViewer>
                    ) : (
                      <div className="flex items-center justify-center h-[500px] text-gray-500">
                        <p>Fill in the required fields to see the preview</p>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading || !offerData.startDate || !offerData.endDate || fetchingCompany}
              className="bg-green-600 hover:bg-green-700"
            >
              <Send className="w-4 h-4 mr-2" />
              {loading ? 'Sending...' : 'Hire & Send Offer Letter'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfferLetterModal;