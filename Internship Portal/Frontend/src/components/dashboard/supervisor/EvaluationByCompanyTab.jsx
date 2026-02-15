import React, { useState, useEffect } from 'react';
import { Download, Eye, Calendar, Building, Search, User, Star } from 'lucide-react';
import Card from '../../../ui/Card';
import Button from '../../../ui/Button';
import Badge from '../../../ui/Badge';
import Modal from '../../../ui/Modal';
import { toast } from 'react-hot-toast';

// API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005/api';

// Helper function to get auth token
const getAuthToken = () => {
  const userString = localStorage.getItem('user');
  if (userString) {
    try {
      const user = JSON.parse(userString);
      return user.token;
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
    }
  }
  return localStorage.getItem('token');
};

const EvaluationByCompanyTab = () => {
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Evaluation criteria labels
  const criteriaLabels = {
    punctualityAndAttendance: 'Punctuality and Attendance',
    abilityToLinkTheoryToPractice: 'Ability to link theory to practice',
    demonstratedCriticalThinking: 'Demonstrated critical thinking and problem-solving skills',
    technicalKnowledge: 'Technical Knowledge',
    creativityConceptualAbility: 'Creativity / Conceptual Ability',
    abilityToAdaptToVarietyOfTasks: 'Ability to adapt to a variety of tasks',
    timeManagementDeadlineCompliance: 'Time Management & Deadline Compliance',
    behavedInProfessionalManner: 'Behaved in a professional manner',
    effectivelyPerformedAssignments: 'Effectively performed assignments',
    oralWrittenCommunicationSkills: 'Oral & Written communication skills'
  };

  // Fetch evaluations for students supervised by this supervisor
  const fetchEvaluations = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      
      const response = await fetch(`${API_BASE_URL}/internee-evaluations/supervisor/evaluations`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setEvaluations(data.data || []);
      } else {
        toast.error('Failed to fetch evaluations');
      }
    } catch (error) {
      console.error('Error fetching evaluations:', error);
      toast.error('Failed to fetch evaluations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvaluations();
  }, []);

  // Handle viewing evaluation details
  const handleViewDetails = (evaluation) => {
    setSelectedEvaluation(evaluation);
    setShowDetailsModal(true);
  };

  // Handle downloading evaluation PDF
  const handleDownloadPDF = async (evaluationId) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/internee-evaluations/${evaluationId}/pdf`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `evaluation-${evaluationId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('PDF downloaded successfully');
      } else {
        toast.error('Failed to download PDF');
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download PDF');
    }
  };

  // Calculate grade from total marks
  const calculateGrade = (totalMarks, maxMarks = 40) => {
    const percentage = (totalMarks / maxMarks) * 100;
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    return 'F';
  };

  // Filter evaluations based on search term
  const filteredEvaluations = evaluations.filter(evaluation => 
    evaluation.internName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    evaluation.internEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    evaluation.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    evaluation.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Evaluations By Companies</h2>
          <p className="text-gray-600 mt-1">
            View intern evaluations submitted by companies for your supervised students
          </p>
        </div>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by student name, email, company, or job title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </Card>

      {/* Evaluations List */}
      <Card className="p-6">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredEvaluations.length === 0 ? (
          <div className="text-center py-8">
            <Star className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {searchTerm ? 'No evaluations found' : 'No evaluations yet'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm 
                ? 'Try adjusting your search terms.' 
                : 'Company evaluations for your supervised students will appear here.'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEvaluations.map((evaluation) => (
              <div key={evaluation._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <p className="text-lg font-medium text-gray-900 truncate">
                            {evaluation.internName || 'Student Name'}
                          </p>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {evaluation.internEmail || 'student@example.com'}
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Building className="w-4 h-4 mr-1" />
                            Company: {evaluation.companyName || 'Not specified'}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            Job: {evaluation.jobTitle || 'Not specified'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center space-x-6">
                          <div className="text-center">
                            <p className="text-sm text-gray-500">Total Marks</p>
                            <p className="text-xl font-semibold text-blue-600">
                              {evaluation.evaluation?.totalMarks || 0}/40
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-500">Grade</p>
                            <Badge 
                              variant={
                                (evaluation.grade === 'A+' || evaluation.grade === 'A') ? 'success' :
                                (evaluation.grade === 'B' || evaluation.grade === 'C') ? 'warning' : 'danger'
                              }
                              className="text-lg font-semibold"
                            >
                              {evaluation.grade || calculateGrade(evaluation.evaluation?.totalMarks || 0)}
                            </Badge>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-500">Submitted</p>
                            <p className="text-sm font-medium text-gray-700">
                              {new Date(evaluation.submittedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex items-center justify-end space-x-2">
                      <Button
                        onClick={() => handleViewDetails(evaluation)}
                        variant="outline"
                        size="sm"
                        className="flex items-center"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </Button>
                      <Button
                        onClick={() => handleDownloadPDF(evaluation._id)}
                        variant="primary"
                        size="sm"
                        className="flex items-center"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download PDF
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Evaluation Details Modal */}
      {showDetailsModal && selectedEvaluation && (
        <Modal 
          isOpen={showDetailsModal} 
          onClose={() => setShowDetailsModal(false)}
          title="Evaluation Details"
          size="lg"
        >
          <div className="space-y-6">
            {/* Header Information */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-3">Evaluation Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-blue-800">Student:</span> 
                  <span className="text-blue-700 ml-2">{selectedEvaluation.internName}</span>
                </div>
                <div>
                  <span className="font-medium text-blue-800">Email:</span> 
                  <span className="text-blue-700 ml-2">{selectedEvaluation.internEmail}</span>
                </div>
                <div>
                  <span className="font-medium text-blue-800">Company:</span> 
                  <span className="text-blue-700 ml-2">{selectedEvaluation.companyName}</span>
                </div>
                <div>
                  <span className="font-medium text-blue-800">Job:</span> 
                  <span className="text-blue-700 ml-2">{selectedEvaluation.jobTitle}</span>
                </div>
                <div>
                  <span className="font-medium text-blue-800">Total Marks:</span> 
                  <span className="text-blue-700 ml-2 font-semibold">
                    {selectedEvaluation.evaluation?.totalMarks}/40
                  </span>
                </div>
                <div>
                  <span className="font-medium text-blue-800">Grade:</span> 
                  <Badge 
                    variant={
                      (selectedEvaluation.grade === 'A+' || selectedEvaluation.grade === 'A') ? 'success' :
                      (selectedEvaluation.grade === 'B' || selectedEvaluation.grade === 'C') ? 'warning' : 'danger'
                    }
                    className="ml-2"
                  >
                    {selectedEvaluation.grade}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Detailed Assessment Scores */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Detailed Assessment Scores</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid gap-3">
                  {Object.entries(criteriaLabels).map(([key, label], index) => (
                    <div key={key} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                      <div className="flex items-center">
                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-xs font-medium flex items-center justify-center mr-3">
                          {index + 1}
                        </span>
                        <span className="text-sm text-gray-700">{label}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-blue-600">
                          {selectedEvaluation.evaluation?.[key] || 0}/4
                        </span>
                        <div className="flex space-x-1">
                          {[1, 2, 3, 4].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= (selectedEvaluation.evaluation?.[key] || 0)
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Comments */}
            {selectedEvaluation.evaluation?.supervisorComments && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Company Comments</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {selectedEvaluation.evaluation.supervisorComments}
                  </p>
                </div>
              </div>
            )}

            {/* Evaluation Date */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Evaluation submitted on:</span>
                <span className="font-medium">
                  {new Date(selectedEvaluation.submittedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default EvaluationByCompanyTab;
