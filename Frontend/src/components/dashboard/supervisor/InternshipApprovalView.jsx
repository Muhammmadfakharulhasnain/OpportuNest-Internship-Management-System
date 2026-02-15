import { useState, useEffect } from 'react';
import { FileText, CheckCircle, Clock, AlertCircle, Building2, Users, Calendar, User, Mail, Eye, Download, X, MapPin, Phone, Briefcase, Star, Award, TrendingUp, Shield } from 'lucide-react';
import { PDFViewer } from '@react-pdf/renderer';
import Card from '../../../ui/Card';
import Button from '../../../ui/Button';
import Badge from '../../../ui/Badge';
import internshipApprovalAPI from '../../../services/internshipApprovalAPI';
import { offerLetterAPI } from '../../../services/api';
import { toast } from 'react-hot-toast';
import OfferLetterPDF from '../../shared/OfferLetterPDF';
import './InternshipApprovalView.css';

const InternshipApprovalView = () => {
  const [approvalForms, setApprovalForms] = useState([]);
  const [offerLetters, setOfferLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedForm, setSelectedForm] = useState(null);
  const [selectedOfferLetter, setSelectedOfferLetter] = useState(null);
  const [showFormDetails, setShowFormDetails] = useState(false);
  const [showOfferLetterModal, setShowOfferLetterModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchApprovalForms();
    fetchOfferLetters();
  }, []);

  const fetchApprovalForms = async () => {
    try {
      setLoading(true);
      const response = await internshipApprovalAPI.getUserApprovalForms('supervisor-id', 'supervisor');
      if (response.success) {
        setApprovalForms(response.data);
      }
    } catch (error) {
      console.error('Error fetching approval forms:', error);
      toast.error('Failed to fetch approval forms');
    } finally {
      setLoading(false);
    }
  };

  const fetchOfferLetters = async () => {
    try {
      const response = await offerLetterAPI.getSupervisorOfferLetters();
      if (response.success) {
        setOfferLetters(response.data);
      }
    } catch (error) {
      console.error('Error fetching offer letters:', error);
      setOfferLetters([]);
    }
  };

  const handleViewOfferLetter = (offerLetter) => {
    setSelectedOfferLetter(offerLetter);
    setShowOfferLetterModal(true);
  };

  const handleDownloadOfferLetter = async (offerId) => {
    try {
      await offerLetterAPI.downloadOfferLetter(offerId);
      toast.success('Offer letter downloaded successfully');
    } catch (error) {
      console.error('Error downloading offer letter:', error);
      toast.error('Failed to download offer letter');
    }
  };

  const handleFormAction = async (formId, action, notes = '') => {
    try {
      setActionLoading(formId);
      
      const response = await internshipApprovalAPI.updateFormStatus(formId, action, notes);
      
      if (response.success) {
        await fetchApprovalForms();
        toast.success(`Form ${action} successfully`);
        
        if (action === 'approved') {
          // Send notification to student about approval
          toast.success('Student has been notified of the approval');
        }
      } else {
        toast.error(response.message || `Failed to ${action} form`);
      }
    } catch (error) {
      console.error(`Error ${action}ing form:`, error);
      toast.error(`Failed to ${action} form`);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'danger';
      case 'completed': return 'info';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <AlertCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Enhanced Loading Header */}
        <div className="relative bg-gradient-to-br from-blue-50 to-slate-50 rounded-2xl p-6 border border-[#00509E]/30 overflow-hidden shadow-md">
          <div className="absolute top-0 right-0 w-20 h-20 bg-[#00509E]/10 rounded-full -translate-y-10 translate-x-10"></div>
          <div className="relative">
            <div className="flex items-center justify-between">
              <div>
                <div className="w-48 h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg mb-2 loading-skeleton"></div>
                <div className="w-72 h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded loading-skeleton"></div>
              </div>
              <div className="flex gap-3">
                <div className="w-20 h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full loading-skeleton"></div>
                <div className="w-24 h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full loading-skeleton"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Loading Cards */}
        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6 bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200/60">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl loading-skeleton"></div>
                <div className="flex-1 space-y-3">
                  <div className="w-48 h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded loading-skeleton"></div>
                  <div className="space-y-2">
                    <div className="w-64 h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded loading-skeleton"></div>
                    <div className="w-56 h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded loading-skeleton"></div>
                    <div className="w-40 h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded loading-skeleton"></div>
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  <div className="w-24 h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded loading-skeleton"></div>
                  <div className="w-28 h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded loading-skeleton"></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (approvalForms.length === 0 && offerLetters.length === 0) {
    return (
      <div className="space-y-6">
        {/* Enhanced Header */}
        <div className="relative bg-gradient-to-br from-blue-50 to-slate-50 rounded-2xl p-6 border border-[#00509E]/30 overflow-hidden shadow-md">
          <div className="absolute top-0 right-0 w-20 h-20 bg-[#00509E]/10 rounded-full -translate-y-10 translate-x-10"></div>
          <div className="relative">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Internship Documents</h2>
            <p className="text-gray-600 text-sm lg:text-base">
              Manage internship forms, offer letters, and approval documents for your supervised students
            </p>
          </div>
        </div>

        {/* Enhanced Empty State */}
        <Card className="p-12 text-center bg-gradient-to-br from-gray-50 to-blue-50 border-2 border-blue-200/60">
          <div className="bg-gradient-to-br from-[#003366] to-[#00509E] p-6 rounded-full mx-auto w-20 h-20 flex items-center justify-center mb-6 shadow-lg">
            <FileText className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">No Internship Documents Yet</h3>
          <p className="text-gray-600 text-lg max-w-md mx-auto leading-relaxed">
            You will receive internship approval forms and offer letters here when companies hire your supervised students.
          </p>
          <div className="mt-6 flex justify-center">
            <Badge variant="info" size="lg" className="bg-[#00509E]/10 text-[#003366] border border-[#00509E]/30 px-4 py-2">
              <Users className="w-4 h-4 mr-2" />
              Supervisor Dashboard
            </Badge>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Header Section */}
      <div className="relative bg-gradient-to-r from-[#003366] to-[#00509E] rounded-2xl p-6 border border-[#00509E]/30 overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2">Internship Documents</h2>
            <p className="text-blue-100 text-sm lg:text-base">
              Manage internship forms, offer letters, and approval documents for your supervised students
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Badge 
              variant="info" 
              size="lg"
              className="bg-white/20 text-white border border-white/30 px-4 py-2 font-semibold backdrop-blur-sm"
            >
              <FileText className="w-4 h-4 mr-2" />
              {approvalForms.length} Form{approvalForms.length !== 1 ? 's' : ''}
            </Badge>
            <Badge 
              variant="success" 
              size="lg"
              className="bg-white/20 text-white border border-white/30 px-4 py-2 font-semibold backdrop-blur-sm"
            >
              <Award className="w-4 h-4 mr-2" />
              {offerLetters.length} Offer Letter{offerLetters.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>
      </div>

      {/* Enhanced Offer Letters Section */}
      {offerLetters.length > 0 ? (
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-[#003366] to-[#00509E] p-2 rounded-lg shadow-md">
              <Award className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-[#003366]">Student Offer Letters</h3>
            <Badge variant="success" size="sm" className="bg-[#00509E]/10 text-[#003366] border border-[#00509E]/20">
              {offerLetters.length} Active
            </Badge>
          </div>
          
          <div className="grid gap-6">
            {offerLetters.map((offerLetter, index) => (
              <Card 
                key={offerLetter._id} 
                className="group hover:shadow-xl transition-all duration-300 border-2 border-[#00509E]/20 bg-gradient-to-br from-white to-blue-50 overflow-hidden"
                style={{
                  animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
                }}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="bg-gradient-to-br from-[#003366] to-[#00509E] p-4 rounded-xl shadow-lg">
                        <Building2 className="w-8 h-8 text-white" />
                      </div>
                      
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-xl font-bold text-[#003366] group-hover:text-[#00509E] transition-colors">
                            {offerLetter.organizationName}
                          </h3>
                          <Badge variant="success" size="sm" className="bg-[#00509E]/10 text-[#003366] border border-[#00509E]/30">
                            <Star className="w-3 h-3 mr-1" />
                            Offer Letter
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-[#00509E]" />
                            <span className="font-medium text-[#003366]">Student:</span>
                            <span className="text-gray-900 font-semibold">{offerLetter.studentName}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Briefcase className="w-4 h-4 text-[#00509E]" />
                            <span className="font-medium text-[#003366]">Position:</span>
                            <span className="text-gray-900 font-semibold">{offerLetter.jobTitle}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-[#00509E]" />
                            <span className="font-medium text-[#003366]">Duration:</span>
                            <span className="text-gray-900 font-semibold">{formatDate(offerLetter.startDate)} - {formatDate(offerLetter.endDate)}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-[#00509E]" />
                            <span className="font-medium text-gray-700">Sent:</span>
                            <span className="text-gray-900">{formatDate(offerLetter.sentAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col space-y-3 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewOfferLetter(offerLetter)}
                        className="bg-white border-[#00509E]/30 text-[#003366] hover:bg-blue-50 hover:border-[#00509E] hover:shadow-md transition-all duration-200"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Letter
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleDownloadOfferLetter(offerLetter._id)}
                        className="bg-gradient-to-r from-[#003366] to-[#00509E] hover:from-[#003366]/90 hover:to-[#00509E]/90 shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Enhanced Footer */}
                <div className="bg-gradient-to-r from-blue-50 to-slate-50 px-6 py-3 border-t border-[#00509E]/20">
                  <div className="flex items-center justify-between text-xs text-[#003366] font-medium">
                    <span className="flex items-center">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Official Document
                    </span>
                    <span className="flex items-center">
                      <Shield className="w-3 h-3 mr-1" />
                      Verified Company
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <Card className="p-8 text-center bg-gradient-to-br from-blue-50 to-slate-50 border-2 border-[#00509E]/20">
          <div className="bg-gradient-to-br from-[#003366]/10 to-[#00509E]/20 p-6 rounded-full mx-auto w-20 h-20 flex items-center justify-center mb-4">
            <Award className="w-10 h-10 text-[#00509E]" />
          </div>
          <h3 className="text-lg font-semibold text-[#003366] mb-2">No Student Offer Letters Yet</h3>
          <p className="text-gray-600">Offer letters for your supervised students will appear here</p>
        </Card>
      )}

      {/* Enhanced Approval Forms Section */}
      {approvalForms.length > 0 && (
        <div className="space-y-6">
          <div className="relative bg-gradient-to-br from-blue-50 to-slate-50 rounded-2xl p-6 border border-[#00509E]/30 shadow-md">
            <div className="absolute top-0 right-0 w-20 h-20 bg-[#00509E]/10 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="relative flex items-center space-x-3">
              <div className="bg-gradient-to-br from-[#003366] to-[#00509E] p-2 rounded-lg shadow-md">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#003366]">Approval Forms</h3>
              <Badge variant="warning" size="sm" className="bg-[#00509E]/10 text-[#003366] border border-[#00509E]/30">
                {approvalForms.filter(form => form.status === 'pending').length} Pending Review
              </Badge>
            </div>
          </div>

          <div className="grid gap-6">
            {approvalForms.map((form, index) => (
              <Card 
                key={form._id} 
                className="group hover:shadow-xl transition-all duration-300 border-2 border-[#00509E]/20 bg-gradient-to-br from-white to-blue-50 overflow-hidden"
                style={{
                  animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
                }}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="bg-gradient-to-br from-[#003366] to-[#00509E] p-4 rounded-xl shadow-lg">
                        <Building2 className="w-8 h-8 text-white" />
                      </div>
                      
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-xl font-bold text-[#003366] group-hover:text-[#00509E] transition-colors">
                            {form.formData.organizationName}
                          </h3>
                          <Badge 
                            variant={getStatusColor(form.status)} 
                            size="sm" 
                            className="bg-[#00509E]/10 text-[#003366] border border-[#00509E]/30"
                          >
                            <Clock className="w-3 h-3 mr-1" />
                            {form.status.charAt(0).toUpperCase() + form.status.slice(1)}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-[#00509E]" />
                            <span className="font-medium text-[#003366]">Student:</span>
                            <span className="text-gray-900">{form.studentName || 'N/A'}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Briefcase className="w-4 h-4 text-[#00509E]" />
                            <span className="font-medium text-[#003366]">Positions:</span>
                            <span className="text-gray-900">{form.formData.numberOfPositions} Position{form.formData.numberOfPositions > 1 ? 's' : ''}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4 text-[#00509E]" />
                            <span className="font-medium text-[#003366]">Location:</span>
                            <span className="text-gray-900">{form.formData.internshipLocation}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-[#00509E]" />
                            <span className="font-medium text-[#003366]">Duration:</span>
                            <span className="text-gray-900">{formatDate(form.formData.startDate)} - {formatDate(form.formData.endDate)}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-[#00509E]" />
                            <span className="font-medium text-[#003366]">Received:</span>
                            <span className="text-gray-900">{formatDate(form.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col space-y-3 ml-4">
                      <div className="text-right mb-2">
                        <p className="text-xs text-gray-500 mb-1">Status</p>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(form.status)}
                          <span className="text-sm font-medium text-gray-900">
                            {form.status.charAt(0).toUpperCase() + form.status.slice(1)}
                          </span>
                        </div>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedForm(form);
                          setShowFormDetails(true);
                        }}
                        className="bg-white border-[#00509E]/30 text-[#003366] hover:bg-blue-50 hover:border-[#00509E] hover:shadow-md transition-all duration-200"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                      
                      {form.status === 'pending' && (
                        <div className="flex flex-col space-y-2">
                          <Button
                            size="sm"
                            onClick={() => handleFormAction(form._id, 'approved')}
                            disabled={actionLoading === form._id}
                            className="bg-gradient-to-r from-[#003366] to-[#00509E] hover:from-[#00509E] hover:to-[#003366] shadow-lg hover:shadow-xl transition-all duration-200 text-white"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleFormAction(form._id, 'rejected')}
                            disabled={actionLoading === form._id}
                            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl transition-all duration-200"
                          >
                            <AlertCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Enhanced Footer */}
                <div className="bg-gradient-to-r from-blue-50 to-slate-50 px-6 py-3 border-t border-[#00509E]/20">
                  <div className="flex items-center justify-between text-xs text-[#003366]">
                    <span className="flex items-center">
                      <FileText className="w-3 h-3 mr-1" />
                      Approval Document
                    </span>
                    <span className="flex items-center">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {form.status === 'pending' ? 'Awaiting Review' : 'Processed'}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Enhanced Offer Letter Modal */}
      {showOfferLetterModal && selectedOfferLetter && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={() => setShowOfferLetterModal(false)} />
            
            <div className="inline-block w-full max-w-7xl p-0 my-8 text-left align-middle transition-all transform bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-200">
              {/* Enhanced Header */}
              <div className="bg-gradient-to-r from-[#003366] to-[#00509E] px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-white/20 p-2 rounded-lg">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">Offer Letter</h3>
                      <p className="text-blue-100">Student: {selectedOfferLetter.studentName}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowOfferLetterModal(false)}
                    className="bg-white/20 hover:bg-white/30 text-white rounded-lg p-2 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* PDF Viewer */}
              <div className="bg-gray-50 border-2 border-[#00509E]/20" style={{ height: '75vh' }}>
                <PDFViewer width="100%" height="100%">
                  <OfferLetterPDF offerLetter={selectedOfferLetter} />
                </PDFViewer>
              </div>

              {/* Enhanced Footer */}
              <div className="bg-gradient-to-r from-blue-50 to-slate-50 px-6 py-4 border-t border-[#00509E]/20">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2 text-sm text-[#003366]">
                    <CheckCircle className="w-4 h-4 text-[#00509E]" />
                    <span>Official Document • Verified Company</span>
                  </div>
                  <div className="flex space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowOfferLetterModal(false)}
                      className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      Close
                    </Button>
                    <Button
                      onClick={() => handleDownloadOfferLetter(selectedOfferLetter._id)}
                      className="bg-gradient-to-r from-[#003366] to-[#00509E] hover:from-[#00509E] hover:to-[#003366] shadow-lg hover:shadow-xl transition-all duration-200 text-white"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Offer Letter
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Form Details Modal */}
      {showFormDetails && selectedForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={() => setShowFormDetails(false)} />
            
            <div className="inline-block w-full max-w-5xl p-0 my-8 text-left align-middle transition-all transform bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-200">
              {/* Enhanced Header */}
              <div className="bg-gradient-to-r from-[#003366] to-[#00509E] px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-white/20 p-2 rounded-lg">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">Internship Approval Form</h3>
                      <p className="text-blue-100">{selectedForm.formData.organizationName}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowFormDetails(false)}
                    className="bg-white/20 hover:bg-white/30 text-white rounded-lg p-2 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Enhanced Content */}
              <div className="space-y-6 max-h-[70vh] overflow-y-auto p-6 bg-gray-50">
                {/* Student Information */}
                <Card className="overflow-hidden bg-gradient-to-br from-blue-50 to-slate-50 border-2 border-[#00509E]/20">
                  <div className="bg-gradient-to-r from-[#003366] to-[#00509E] px-4 py-3">
                    <div className="flex items-center text-white">
                      <User className="w-5 h-5 mr-2" />
                      <h4 className="text-lg font-semibold">Student Information</h4>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-[#00509E]" />
                          <p className="text-sm font-medium text-[#003366]">Student Name</p>
                        </div>
                        <p className="text-gray-900 font-semibold">{selectedForm.studentName || 'N/A'}</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Star className="w-4 h-4 text-[#00509E]" />
                          <p className="text-sm font-medium text-[#003366]">Student ID</p>
                        </div>
                        <p className="text-gray-900">{selectedForm.studentId || 'N/A'}</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="w-4 h-4 text-[#00509E]" />
                          <p className="text-sm font-medium text-[#003366]">Application Status</p>
                        </div>
                        <Badge variant={getStatusColor(selectedForm.applicationStatus)} size="sm">
                          {selectedForm.applicationStatus || 'N/A'}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-[#00509E]" />
                          <p className="text-sm font-medium text-gray-700">Form Status</p>
                        </div>
                        <Badge variant={getStatusColor(selectedForm.status)} size="sm">
                          {selectedForm.status || 'N/A'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Section A: Organization Information */}
                <Card className="p-6 bg-blue-50 border-[#00509E]/30">
                  <div className="flex items-center mb-4">
                    <Building2 className="w-5 h-5 mr-2 text-[#00509E]" />
                    <h4 className="text-lg font-semibold text-[#003366]">Section A: Organization Information</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Organization Name</p>
                      <p className="text-gray-900">{selectedForm.formData.organizationName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Address</p>
                      <p className="text-gray-900">{selectedForm.formData.address}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Industry Sector</p>
                      <p className="text-gray-900">{selectedForm.formData.industrySector || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Contact Person</p>
                      <p className="text-gray-900">{selectedForm.formData.contactPersonName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Designation</p>
                      <p className="text-gray-900">{selectedForm.formData.designation || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Phone Number</p>
                      <p className="text-gray-900">{selectedForm.formData.phoneNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Email Address</p>
                      <p className="text-gray-900">{selectedForm.formData.emailAddress}</p>
                    </div>
                  </div>
                </Card>

                {/* Section B: Internship Position Details */}
                <Card className="p-6 bg-blue-50 border-[#00509E]/30">
                  <div className="flex items-center mb-4">
                    <Users className="w-5 h-5 mr-2 text-[#00509E]" />
                    <h4 className="text-lg font-semibold text-[#003366]">Section B: Internship Position Details</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Number of Positions</p>
                      <p className="text-gray-900">{selectedForm.formData.numberOfPositions}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Location</p>
                      <p className="text-gray-900">{selectedForm.formData.internshipLocation}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Start Date</p>
                      <p className="text-gray-900">{formatDate(selectedForm.formData.startDate)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">End Date</p>
                      <p className="text-gray-900">{formatDate(selectedForm.formData.endDate)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Working Days & Hours</p>
                      <p className="text-gray-900">{selectedForm.formData.workingDaysHours || 'N/A'}</p>
                    </div>
                    
                    <div className="md:col-span-2">
                      <p className="text-sm font-medium text-gray-700 mb-2">Nature of Internship</p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(selectedForm.formData.natureOfInternship).map(([key, value]) => {
                          if (value === true || (key === 'other' && selectedForm.formData.natureOfInternship.otherText)) {
                            const label = key === 'other' ? selectedForm.formData.natureOfInternship.otherText : 
                                        key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                            return (
                              <Badge key={key} variant="info" size="sm">
                                {label}
                              </Badge>
                            );
                          }
                          return null;
                        })}
                      </div>
                    </div>
                    
                    <div className="md:col-span-2">
                      <p className="text-sm font-medium text-gray-700 mb-2">Mode</p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(selectedForm.formData.mode).map(([key, value]) => {
                          if (value === true) {
                            const label = key === 'onSite' ? 'On-Site' : 
                                        key === 'virtual' ? 'Virtual' : 
                                        key === 'freelancingBased' ? 'Freelancing Based' : key;
                            return (
                              <Badge key={key} variant="success" size="sm">
                                {label}
                              </Badge>
                            );
                          }
                          return null;
                        })}
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Section C: For Internship Office Use Only */}
                <Card className="p-6 bg-slate-50 border-[#00509E]/20">
                  <div className="flex items-center mb-4">
                    <FileText className="w-5 h-5 mr-2 text-[#00509E]" />
                    <h4 className="text-lg font-semibold text-[#003366]">Section C: For Internship Office Use Only</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Received By</p>
                      <p className="text-gray-900">{selectedForm.formData.receivedBy || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Status</p>
                      <p className="text-gray-900">{selectedForm.formData.status || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Signature</p>
                      <p className="text-gray-900">{selectedForm.formData.signature || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Date</p>
                      <p className="text-gray-900">{selectedForm.formData.date ? formatDate(selectedForm.formData.date) : 'N/A'}</p>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="flex justify-between pt-6 border-t border-[#00509E]/20">
                <div className="flex space-x-3">
                  {selectedForm.status === 'pending' && (
                    <>
                      <Button
                        onClick={() => handleFormAction(selectedForm._id, 'approved')}
                        disabled={actionLoading === selectedForm._id}
                        className="bg-gradient-to-r from-[#003366] to-[#00509E] hover:from-[#00509E] hover:to-[#003366] text-white shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve Internship
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => handleFormAction(selectedForm._id, 'rejected')}
                        disabled={actionLoading === selectedForm._id}
                      >
                        <AlertCircle className="w-4 h-4 mr-2" />
                        Reject Internship
                      </Button>
                    </>
                  )}
                </div>
                
                <Button
                  variant="outline"
                  onClick={() => setShowFormDetails(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InternshipApprovalView;
