import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-hot-toast';
import Card from '../../../ui/Card';
import Button from '../../../ui/Button';
import Input from '../../../ui/Input';
import Select from '../../../ui/Select';
import { internshipAppraisalAPI } from '../../../services/api';
import { X as XIcon, Upload as UploadIcon, Trash2 as TrashIcon } from 'lucide-react';

const InternshipAppraisalForm = ({ onClose }) => {
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({
    studentId: '',
    internshipTitle: '',
    duration: '',
    overallPerformance: '',
    rating: '',
    keyStrengths: '',
    areasForImprovement: '',
    commentsAndFeedback: '',
    recommendation: ''
  });
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(true);

  const performanceOptions = [
    { value: 'Excellent', label: 'Excellent', color: 'text-green-600' },
    { value: 'Good', label: 'Good', color: 'text-blue-600' },
    { value: 'Average', label: 'Average', color: 'text-yellow-600' },
    { value: 'Needs Improvement', label: 'Needs Improvement', color: 'text-orange-600' },
    { value: 'Poor', label: 'Poor', color: 'text-red-600' }
  ];

  const recommendationOptions = [
    { value: 'Highly Recommend', label: 'Highly Recommend', color: 'text-green-600' },
    { value: 'Recommend', label: 'Recommend', color: 'text-blue-600' },
    { value: 'Neutral', label: 'Neutral', color: 'text-gray-600' },
    { value: 'Do Not Recommend', label: 'Do Not Recommend', color: 'text-red-600' }
  ];

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoadingStudents(true);
      const response = await internshipAppraisalAPI.getEligibleStudents();
      console.log('Eligible students received:', response.data);
      
      if (response.success && response.data) {
        setStudents(response.data.map(student => ({
          value: student._id,
          label: `${student.name} (${student.email})`,
          internshipTitle: student.internshipTitle,
          duration: student.duration
        })));
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to load eligible students');
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleStudentChange = (studentId) => {
    const selectedStudent = students.find(s => s.value === studentId);
    setFormData(prev => ({
      ...prev,
      studentId,
      internshipTitle: selectedStudent?.internshipTitle || '',
      duration: selectedStudent?.duration || ''
    }));
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file types and sizes
    const validFiles = files.filter(file => {
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      const maxSize = 5 * 1024 * 1024; // 5MB
      
      if (!validTypes.includes(file.type)) {
        toast.error(`${file.name}: Invalid file type. Only PDF, DOC, DOCX, JPG, JPEG, PNG are allowed.`);
        return false;
      }
      
      if (file.size > maxSize) {
        toast.error(`${file.name}: File size exceeds 5MB limit.`);
        return false;
      }
      
      return true;
    });
    
    setAttachments(prev => [...prev, ...validFiles]);
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.studentId) {
      toast.error('Please select a student');
      return;
    }
    
    if (!formData.overallPerformance || !formData.rating || !formData.keyStrengths || 
        !formData.areasForImprovement || !formData.commentsAndFeedback || !formData.recommendation) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (formData.rating < 1 || formData.rating > 10) {
      toast.error('Rating must be between 1 and 10');
      return;
    }
    
    if (formData.keyStrengths.length < 10) {
      toast.error('Key strengths must be at least 10 characters');
      return;
    }
    
    if (formData.areasForImprovement.length < 10) {
      toast.error('Areas for improvement must be at least 10 characters');
      return;
    }
    
    if (formData.commentsAndFeedback.length < 50) {
      toast.error('Comments and feedback must be at least 50 characters');
      return;
    }

    try {
      setLoading(true);
      
      // Create FormData for file upload
      const submitData = new FormData();
      
      // Append form fields
      Object.keys(formData).forEach(key => {
        submitData.append(key, formData[key]);
      });
      
      // Append files
      attachments.forEach(file => {
        submitData.append('attachments', file);
      });
      
      console.log('=== FRONTEND PAYLOAD ===');
      console.log('Form data being sent:', Object.fromEntries(submitData.entries()));
      
      const response = await internshipAppraisalAPI.createAppraisal(submitData);
      
      if (response.success) {
        toast.success('Internship appraisal created successfully!');
        onClose();
      }
    } catch (error) {
      console.error('Error submitting appraisal:', error);
      toast.error(error.message || 'Failed to create internship appraisal');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Create Internship Appraisal</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Student Info Section */}
          <Card className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Student Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student Name <span className="text-red-500">*</span>
                </label>
                {loadingStudents ? (
                  <div className="animate-pulse bg-gray-200 h-10 rounded-md"></div>
                ) : (
                  <select
                    value={formData.studentId}
                    onChange={(e) => handleStudentChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select an option</option>
                    {students.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Internship Title
                </label>
                <Input
                  value={formData.internshipTitle}
                  onChange={(e) => handleInputChange('internshipTitle', e.target.value)}
                  placeholder="Enter internship title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration
                </label>
                <Input
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  placeholder="Enter duration (e.g., 3 months)"
                />
              </div>
            </div>
          </Card>

          {/* Performance Evaluation Section */}
          <Card className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Evaluation</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Overall Performance <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.overallPerformance}
                  onChange={(e) => handleInputChange('overallPerformance', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select an option</option>
                  {performanceOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating (1-10) <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.rating}
                  onChange={(e) => handleInputChange('rating', e.target.value)}
                  placeholder="Rate from 1 (Poor) to 10 (Excellent)"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Key Strengths <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.keyStrengths}
                  onChange={(e) => handleInputChange('keyStrengths', e.target.value)}
                  placeholder="Describe the intern's key strengths and positive aspects..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Minimum 10 characters</p>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Areas for Improvement <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.areasForImprovement}
                  onChange={(e) => handleInputChange('areasForImprovement', e.target.value)}
                  placeholder="Suggest areas where the intern can improve..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Minimum 10 characters</p>
              </div>
            </div>
          </Card>

          {/* Feedback Section */}
          <Card className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Feedback</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comments & Feedback <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.commentsAndFeedback}
                  onChange={(e) => handleInputChange('commentsAndFeedback', e.target.value)}
                  placeholder="Provide detailed feedback about the intern's performance, work quality, attitude, and overall contribution..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={5}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Minimum 50 characters ({formData.commentsAndFeedback.length}/50)
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recommendation <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.recommendation}
                  onChange={(e) => handleInputChange('recommendation', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select an option</option>
                  {recommendationOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Card>

          {/* Attachments Section */}
          <Card className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Attachments (Optional)</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Supporting Documents
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
                  <div className="space-y-1 text-center">
                    <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                        <span>Upload files</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          multiple
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          onChange={handleFileChange}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PDF, DOC, DOCX, JPG, JPEG, PNG up to 5MB each
                    </p>
                  </div>
                </div>
              </div>

              {/* File List */}
              {attachments.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">Selected Files:</h4>
                  {attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                            <span className="text-xs font-medium text-blue-600">
                              {file.name.split('.').pop().toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{file.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttachment(index)}
                        className="text-red-400 hover:text-red-600 transition-colors"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loading}
              disabled={loading}
            >
              Submit Report
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

InternshipAppraisalForm.propTypes = {
  onClose: PropTypes.func.isRequired
};

export default InternshipAppraisalForm;
