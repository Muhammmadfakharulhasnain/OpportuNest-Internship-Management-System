import { useState, useEffect } from 'react';
import { FileText, CheckCircle, Clock, AlertCircle, Building2, Users, Eye, Download, X, Calendar, MapPin, Mail, Phone, User, Briefcase, Star, Award, TrendingUp, Shield } from 'lucide-react';
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

  useEffect(() => {
    fetchApprovalForms();
    fetchOfferLetters();
  }, []);

  const fetchApprovalForms = async () => {
    try {
      setLoading(true);
      const response = await internshipApprovalAPI.getUserApprovalForms('student-id', 'student');
      if (response.success) {
        setApprovalForms(response.data);
      }
    } catch (error) {
      console.error('Error fetching approval forms:', error);
      toast.error('Failed to fetch approval forms');
      setApprovalForms([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchOfferLetters = async () => {
    try {
      const response = await offerLetterAPI.getStudentOfferLetters();
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
      <div className="max-w-7xl mx-auto p-8">
        <Card className="p-12 text-center border-2 border-gray-100">
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-gray-100 p-4 rounded-full animate-pulse">
              <FileText className="w-8 h-8 text-gray-500" />
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-32 animate-pulse"></div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#003366]"></div>
              <p className="text-gray-600 font-medium">Loading internship documents...</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (approvalForms.length === 0 && offerLetters.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <Card className="p-16 text-center border border-gray-200 bg-white">
          <div className="bg-gray-100 p-8 rounded-full mx-auto w-24 h-24 flex items-center justify-center mb-6">
            <FileText className="w-12 h-12 text-gray-500" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">No Internship Documents</h3>
          <p className="text-gray-600 text-lg max-w-md mx-auto">
            You will receive internship approval forms and offer letters here once a company hires you.
          </p>
          <div className="mt-6 flex justify-center space-x-4">
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="w-4 h-4 mr-2" />
              Pending applications
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Award className="w-4 h-4 mr-2" />
              Awaiting selection
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Enhanced Header Section - COMSATS Design */}
      <div className="relative bg-gradient-to-r from-[#003366] via-[#00509E] to-[#003366] rounded-lg p-5 text-white shadow-md overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-white/10 rounded-lg shadow-sm">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-1 text-white">
                  Internship Documents
                </h1>
                <p className="text-blue-100 text-sm font-medium">
                  Manage your internship forms, offer letters, and approval documents
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-blue-200 text-xs font-medium">Document Status</p>
                <div className="flex items-center gap-1 mt-1">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-white font-bold text-sm">Active</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Quick Stats - COMSATS Compact */}
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center gap-1 mb-0.5">
                <FileText className="w-3 h-3 text-blue-200" />
                <span className="text-blue-200 text-xs font-medium">Approval Forms</span>
              </div>
              <p className="text-white font-bold text-sm">{approvalForms.length}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center gap-1 mb-0.5">
                <Award className="w-3 h-3 text-blue-200" />
                <span className="text-blue-200 text-xs font-medium">Offer Letters</span>
              </div>
              <p className="text-white font-bold text-sm">{offerLetters.length}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center gap-1 mb-0.5">
                <CheckCircle className="w-3 h-3 text-blue-200" />
                <span className="text-blue-200 text-xs font-medium">Approved</span>
              </div>
              <p className="text-white font-bold text-sm">
                {approvalForms.filter(form => form.status === 'approved').length}
              </p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center gap-1 mb-0.5">
                <Clock className="w-3 h-3 text-blue-200" />
                <span className="text-blue-200 text-xs font-medium">Pending</span>
              </div>
              <p className="text-white font-bold text-sm">
                {approvalForms.filter(form => form.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full transform translate-x-16 -translate-y-16"></div>
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-white rounded-full transform -translate-x-10 translate-y-10"></div>
        </div>
      </div>
      
      {/* Enhanced Offer Letters Section */}
      {offerLetters.length > 0 ? (
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <div className="bg-[#003366] p-2 rounded-lg">
              <Award className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Offer Letters</h3>
            <Badge variant="success" size="sm" className="bg-gray-100 text-gray-700 border border-gray-200">
              {offerLetters.length} Active
            </Badge>
          </div>
          
          <div className="grid gap-6">
            {offerLetters.map((offerLetter) => (
              <Card key={offerLetter._id} className="group hover:shadow-xl transition-all duration-300 border border-gray-200 bg-white overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="bg-[#003366] p-4 rounded-xl shadow-lg">
                        <Building2 className="w-8 h-8 text-white" />
                      </div>
                      
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#00509E] transition-colors">
                            {offerLetter.organizationName}
                          </h3>
                          <Badge variant="success" size="sm" className="bg-gray-100 text-gray-700 border border-gray-200">
                            <Star className="w-3 h-3 mr-1" />
                            Offer Letter
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <Briefcase className="w-4 h-4 text-[#003366]" />
                            <span className="font-medium text-gray-700">Position:</span>
                            <span className="text-gray-900">{offerLetter.jobTitle}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-[#003366]" />
                            <span className="font-medium text-gray-700">Duration:</span>
                            <span className="text-gray-900">{formatDate(offerLetter.startDate)} - {formatDate(offerLetter.endDate)}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-[#00509E]" />
                            <span className="font-medium text-gray-700">Received:</span>
                            <span className="text-gray-900">{formatDate(offerLetter.sentAt)}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <TrendingUp className="w-4 h-4 text-[#00509E]" />
                            <span className="font-medium text-gray-700">Status:</span>
                            <Badge variant="success" size="xs" className="bg-gray-100 text-gray-700 border border-gray-200">Active</Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col space-y-3 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewOfferLetter(offerLetter)}
                        className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 hover:shadow-md transition-all duration-200"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Letter
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleDownloadOfferLetter(offerLetter._id)}
                        className="bg-[#003366] hover:bg-[#00509E] shadow-lg hover:shadow-xl transition-all duration-200 text-white"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Enhanced Footer */}
                <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span className="flex items-center">
                      <CheckCircle className="w-3 h-3 mr-1 text-[#003366]" />
                      Official Document
                    </span>
                    <span className="flex items-center">
                      <Shield className="w-3 h-3 mr-1 text-[#00509E]" />
                      Verified Company
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <Card className="p-8 text-center bg-white border border-gray-200">
          <div className="bg-gray-100 p-6 rounded-full mx-auto w-20 h-20 flex items-center justify-center mb-4">
            <Award className="w-10 h-10 text-gray-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Offer Letters Yet</h3>
          <p className="text-gray-600">Offer letters will appear here once companies extend offers to you</p>
        </Card>
      )}

      {/* Enhanced Approval Forms Section */}
      {approvalForms.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <div className="bg-[#00509E] p-2 rounded-lg">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Approval Forms</h3>
            <Badge variant="warning" size="sm" className="bg-gray-100 text-gray-700 border border-gray-200">
              {approvalForms.length} Pending Review
            </Badge>
          </div>

          <div className="grid gap-6">
            {approvalForms.map((form, index) => (
              <Card 
                key={form._id} 
                className="group hover:shadow-xl transition-all duration-300 border border-gray-200 bg-white overflow-hidden"
                style={{
                  animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
                }}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="bg-[#00509E] p-4 rounded-xl shadow-lg">
                        <Building2 className="w-8 h-8 text-white" />
                      </div>
                      
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#00509E] transition-colors">
                            {form.formData.organizationName}
                          </h3>
                          <Badge 
                            variant={getStatusColor(form.status)} 
                            size="sm" 
                            className="bg-gray-100 text-gray-700 border border-gray-200"
                          >
                            <Clock className="w-3 h-3 mr-1" />
                            {form.status.charAt(0).toUpperCase() + form.status.slice(1)}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <Briefcase className="w-4 h-4 text-[#003366]" />
                            <span className="font-medium text-gray-700">Positions:</span>
                            <span className="text-gray-900">{form.formData.numberOfPositions} Position{form.formData.numberOfPositions > 1 ? 's' : ''}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4 text-[#003366]" />
                            <span className="font-medium text-gray-700">Location:</span>
                            <span className="text-gray-900">{form.formData.internshipLocation}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-[#00509E]" />
                            <span className="font-medium text-gray-700">Duration:</span>
                            <span className="text-gray-900">{formatDate(form.formData.startDate)} - {formatDate(form.formData.endDate)}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-[#00509E]" />
                            <span className="font-medium text-gray-700">Submitted:</span>
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
                        className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 hover:shadow-md transition-all duration-200"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Enhanced Footer */}
                <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span className="flex items-center">
                      <FileText className="w-3 h-3 mr-1 text-[#003366]" />
                      Approval Document
                    </span>
                    <span className="flex items-center">
                      <TrendingUp className="w-3 h-3 mr-1 text-[#00509E]" />
                      Under Review
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
              <div className="bg-[#003366] px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-white/20 p-2 rounded-lg">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">Offer Letter</h3>
                      <p className="text-blue-100">{selectedOfferLetter.organizationName}</p>
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
              <div className="bg-gray-50 border-2 border-gray-200" style={{ height: '75vh' }}>
                <PDFViewer width="100%" height="100%">
                  <OfferLetterPDF offerLetter={selectedOfferLetter} />
                </PDFViewer>
              </div>

              {/* Enhanced Footer */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
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
                      className="bg-[#003366] hover:bg-[#00509E] shadow-lg hover:shadow-xl transition-all duration-200 text-white"
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
              <div className="bg-[#00509E] px-6 py-4">
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
                {/* Section A: Organization Information */}
                <Card className="overflow-hidden bg-white border border-gray-200">
                  <div className="bg-[#003366] px-4 py-3">
                    <div className="flex items-center text-white">
                      <Building2 className="w-5 h-5 mr-2" />
                      <h4 className="text-lg font-semibold">Section A: Organization Information</h4>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Building2 className="w-4 h-4 text-[#003366]" />
                          <p className="text-sm font-medium text-gray-700">Organization Name</p>
                        </div>
                        <p className="text-gray-900 font-semibold">{selectedForm.formData.organizationName}</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-[#003366]" />
                          <p className="text-sm font-medium text-gray-700">Address</p>
                        </div>
                        <p className="text-gray-900">{selectedForm.formData.address}</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Briefcase className="w-4 h-4 text-[#00509E]" />
                          <p className="text-sm font-medium text-gray-700">Industry Sector</p>
                        </div>
                        <p className="text-gray-900">{selectedForm.formData.industrySector || 'N/A'}</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-[#00509E]" />
                          <p className="text-sm font-medium text-gray-700">Contact Person</p>
                        </div>
                        <p className="text-gray-900">{selectedForm.formData.contactPersonName}</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Star className="w-4 h-4 text-[#003366]" />
                          <p className="text-sm font-medium text-gray-700">Designation</p>
                        </div>
                        <p className="text-gray-900">{selectedForm.formData.designation || 'N/A'}</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-[#00509E]" />
                          <p className="text-sm font-medium text-gray-700">Phone Number</p>
                        </div>
                        <p className="text-gray-900">{selectedForm.formData.phoneNumber}</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-[#003366]" />
                          <p className="text-sm font-medium text-gray-700">Email Address</p>
                        </div>
                        <p className="text-gray-900 break-words overflow-wrap-anywhere text-wrap-anywhere">{selectedForm.formData.emailAddress}</p>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Section B: Internship Position Details */}
                <Card className="overflow-hidden bg-white border border-gray-200">
                  <div className="bg-[#00509E] px-4 py-3">
                    <div className="flex items-center text-white">
                      <Users className="w-5 h-5 mr-2" />
                      <h4 className="text-lg font-semibold">Section B: Internship Position Details</h4>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-[#003366]" />
                          <p className="text-sm font-medium text-gray-700">Number of Positions</p>
                        </div>
                        <p className="text-gray-900 font-semibold">{selectedForm.formData.numberOfPositions}</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-[#003366]" />
                          <p className="text-sm font-medium text-gray-700">Location</p>
                        </div>
                        <p className="text-gray-900">{selectedForm.formData.internshipLocation}</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-[#00509E]" />
                          <p className="text-sm font-medium text-gray-700">Start Date</p>
                        </div>
                        <p className="text-gray-900">{formatDate(selectedForm.formData.startDate)}</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-[#00509E]" />
                          <p className="text-sm font-medium text-gray-700">End Date</p>
                        </div>
                        <p className="text-gray-900">{formatDate(selectedForm.formData.endDate)}</p>
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-[#003366]" />
                          <p className="text-sm font-medium text-gray-700">Working Days & Hours</p>
                        </div>
                        <p className="text-gray-900">{selectedForm.formData.workingDaysHours || 'N/A'}</p>
                      </div>
                      
                      <div className="md:col-span-2 space-y-3">
                        <div className="flex items-center space-x-2">
                          <Award className="w-4 h-4 text-[#00509E]" />
                          <p className="text-sm font-medium text-gray-700">Nature of Internship</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(selectedForm.formData.natureOfInternship).map(([key, value]) => {
                            if (value === true || (key === 'other' && selectedForm.formData.natureOfInternship.otherText)) {
                              const label = key === 'other' ? selectedForm.formData.natureOfInternship.otherText : 
                                          key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                              return (
                                <Badge key={key} variant="info" size="sm" className="bg-gray-100 text-gray-700 border border-gray-200">
                                  {label}
                                </Badge>
                              );
                            }
                            return null;
                          })}
                        </div>
                      </div>
                      
                      <div className="md:col-span-2 space-y-3">
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="w-4 h-4 text-[#003366]" />
                          <p className="text-sm font-medium text-gray-700">Mode</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(selectedForm.formData.mode).map(([key, value]) => {
                            if (value === true) {
                              const label = key === 'onSite' ? 'On-Site' : 
                                          key === 'virtual' ? 'Virtual' : 
                                          key === 'freelancingBased' ? 'Freelancing Based' : key;
                              return (
                                <Badge key={key} variant="success" size="sm" className="bg-gray-100 text-gray-700 border border-gray-200">
                                  {label}
                                </Badge>
                              );
                            }
                            return null;
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Section C: For Internship Office Use Only */}
                <Card className="overflow-hidden bg-white border border-gray-200">
                  <div className="bg-gray-700 px-4 py-3">
                    <div className="flex items-center text-white">
                      <Shield className="w-5 h-5 mr-2" />
                      <h4 className="text-lg font-semibold">Section C: For Internship Office Use Only</h4>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-gray-600" />
                          <p className="text-sm font-medium text-gray-700">Received By</p>
                        </div>
                        <p className="text-gray-900">{selectedForm.formData.receivedBy || 'N/A'}</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="w-4 h-4 text-gray-600" />
                          <p className="text-sm font-medium text-gray-700">Status</p>
                        </div>
                        <Badge variant={getStatusColor(selectedForm.status)} size="sm">
                          {selectedForm.formData.status || selectedForm.status || 'N/A'}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-gray-600" />
                          <p className="text-sm font-medium text-gray-700">Signature</p>
                        </div>
                        <p className="text-gray-900">{selectedForm.formData.signature || 'N/A'}</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-600" />
                          <p className="text-sm font-medium text-gray-700">Date</p>
                        </div>
                        <p className="text-gray-900">{selectedForm.formData.date ? formatDate(selectedForm.formData.date) : 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Enhanced Footer */}
              <div className="bg-gradient-to-r from-gray-50 to-orange-50 px-6 py-4 border-t border-orange-200">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4 text-orange-600" />
                    <span>Submitted on {formatDate(selectedForm.createdAt)}</span>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setShowFormDetails(false)}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InternshipApprovalView;
