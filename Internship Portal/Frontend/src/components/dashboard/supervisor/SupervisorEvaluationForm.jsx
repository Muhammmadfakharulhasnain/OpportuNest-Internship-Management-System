import React, { useState, useEffect } from 'react';
import { Plus, Edit, Save, User, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { applicationAPI, supervisorEvaluationAPI } from '../../../services/api';
import Card from '../../../ui/Card';
import Button from '../../../ui/Button';
import Badge from '../../../ui/Badge';
import Input from '../../../ui/Input';
import Select from '../../../ui/Select';
import SearchBar from '../../../ui/SearchBar';

const SupervisorEvaluationForm = () => {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [evaluations, setEvaluations] = useState([]);
  const [supervisedStudents, setSupervisedStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    studentId: '',
    studentName: '',
    registrationNo: '',
    company: '',
    position: '',
    internshipDuration: 'N/A',
    startDate: '',
    endDate: '',
    platformActivity: 1,
    completionOfInternship: 1,
    businessCommunication: 1,
    learningCapacity: 1,
    professionalEthics: 1,
    punctualityAttendance: 1,
    overallGrade: ''
  });

  // Fetch supervised students and evaluations on component mount
  useEffect(() => {
    fetchSupervisedStudents();
    fetchEvaluations();
  }, []);

  const fetchSupervisedStudents = async () => {
    try {
      setLoading(true);
      const response = await applicationAPI.getSupervised();
      if (response.success) {
        setSupervisedStudents(response.applications || []);
      } else {
        toast.error('Failed to fetch supervised students');
      }
    } catch (error) {
      console.error('Error fetching supervised students:', error);
      toast.error('Error fetching supervised students');
    } finally {
      setLoading(false);
    }
  };

  const fetchEvaluations = async () => {
    try {
      const response = await supervisorEvaluationAPI.getSupervisorEvaluations();
      if (response.success) {
        setEvaluations(response.evaluations || []);
      }
    } catch (error) {
      console.error('Error fetching evaluations:', error);
    }
  };

  const handleStudentSelection = (studentId) => {
    const student = supervisedStudents.find(s => s.studentId._id === studentId);
    if (student) {
      setSelectedStudent(student);
      setFormData({
        ...formData,
        studentId: student.studentId._id,
        studentName: student.studentId.name,
        registrationNo: student.studentId.registrationNumber,
        company: student.jobId?.companyId?.name || 'N/A',
        position: student.position || 'N/A',
        internshipDuration: student.duration || 'N/A',
        startDate: student.startDate ? new Date(student.startDate).toISOString().split('T')[0] : '',
        endDate: student.endDate ? new Date(student.endDate).toISOString().split('T')[0] : '',
      });
    }
  };

  const handleGradeChange = (field, value) => {
    const numValue = parseInt(value);
    if (numValue >= 1 && numValue <= 10) {
      setFormData({
        ...formData,
        [field]: numValue
      });
    }
  };

  const calculateTotalMarks = () => {
    const { platformActivity, completionOfInternship, businessCommunication, 
            learningCapacity, professionalEthics, punctualityAttendance } = formData;
    const total = platformActivity + completionOfInternship + businessCommunication + 
                  learningCapacity + professionalEthics + punctualityAttendance;
    const percentage = (total / 60) * 100;
    
    let grade = 'F';
    if (percentage >= 85) grade = 'A+';
    else if (percentage >= 80) grade = 'A';
    else if (percentage >= 75) grade = 'B+';
    else if (percentage >= 70) grade = 'B';
    else if (percentage >= 65) grade = 'C+';
    else if (percentage >= 60) grade = 'C';
    else if (percentage >= 55) grade = 'D+';
    else if (percentage >= 50) grade = 'D';
    
    return { total, grade };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.studentId) {
      toast.error('Please select a student');
      return;
    }

    try {
      setLoading(true);
      const { total, grade } = calculateTotalMarks();
      
      const evaluationData = {
        ...formData,
        totalMarks: total,
        overallGrade: grade
      };

      const response = await supervisorEvaluationAPI.submitSupervisorEvaluation(evaluationData);
      
      if (response.success) {
        toast.success('Evaluation submitted successfully!');
        setShowModal(false);
        resetForm();
        fetchEvaluations(); // Refresh evaluations list
      } else {
        toast.error(response.message || 'Failed to submit evaluation');
      }
    } catch (error) {
      console.error('Error submitting evaluation:', error);
      toast.error('Error submitting evaluation');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      studentId: '',
      studentName: '',
      registrationNo: '',
      company: '',
      position: '',
      internshipDuration: 'N/A',
      startDate: '',
      endDate: '',
      platformActivity: 1,
      completionOfInternship: 1,
      businessCommunication: 1,
      learningCapacity: 1,
      professionalEthics: 1,
      punctualityAttendance: 1,
      overallGrade: ''
    });
    setSelectedStudent(null);
  };

  const filteredEvaluations = evaluations.filter(evaluation =>
    evaluation.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    evaluation.registrationNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    evaluation.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'A+':
      case 'A': return 'success';
      case 'B+':
      case 'B': return 'info';
      case 'C+':
      case 'C': return 'warning';
      default: return 'danger';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-xl font-semibold text-gray-900">Supervisor Evaluation Form</h2>
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="flex-1 md:w-64">
            <SearchBar
              placeholder="Search evaluations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button 
            onClick={() => setShowModal(true)}
            variant="primary"
            icon={Plus}
          >
            New Evaluation
          </Button>
        </div>
      </div>

      {/* Evaluations List */}
      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading evaluations...</p>
          </div>
        ) : filteredEvaluations.length === 0 ? (
          <Card className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No evaluations found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? 'No evaluations match your search criteria.' : 'Get started by creating your first evaluation.'}
            </p>
            <Button 
              onClick={() => setShowModal(true)}
              variant="primary"
              icon={Plus}
            >
              Create Evaluation
            </Button>
          </Card>
        ) : (
          filteredEvaluations.map((evaluation) => (
            <Card key={evaluation._id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <User className="h-5 w-5 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900">
                      {evaluation.studentName}
                    </h3>
                    <Badge variant={getGradeColor(evaluation.overallGrade)}>
                      {evaluation.overallGrade}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Registration:</span> {evaluation.registrationNo}
                    </div>
                    <div>
                      <span className="font-medium">Company:</span> {evaluation.company}
                    </div>
                    <div>
                      <span className="font-medium">Position:</span> {evaluation.position}
                    </div>
                    <div>
                      <span className="font-medium">Total Marks:</span> {evaluation.totalMarks}/60
                    </div>
                    <div>
                      <span className="font-medium">Submitted:</span> {new Date(evaluation.createdAt).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="font-medium">Status:</span> 
                      <Badge variant="success" className="ml-2">Completed</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Evaluation Form Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Create Supervisor Evaluation
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Student Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Student *
                  </label>
                  <Select
                    value={formData.studentId}
                    onChange={(e) => handleStudentSelection(e.target.value)}
                    required
                  >
                    <option value="">Choose a student...</option>
                    {supervisedStudents.map((student) => (
                      <option key={student.studentId._id} value={student.studentId._id}>
                        {student.studentId.name} - {student.studentId.registrationNumber}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              {/* Auto-populated fields (read-only) */}
              {selectedStudent && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Student Name"
                    value={formData.studentName}
                    readOnly
                    className="bg-gray-50"
                  />
                  <Input
                    label="Registration Number"
                    value={formData.registrationNo}
                    readOnly
                    className="bg-gray-50"
                  />
                  <Input
                    label="Company"
                    value={formData.company}
                    readOnly
                    className="bg-gray-50"
                  />
                  <Input
                    label="Position"
                    value={formData.position}
                    readOnly
                    className="bg-gray-50"
                  />
                  <Input
                    label="Internship Duration"
                    value={formData.internshipDuration}
                    readOnly
                    className="bg-gray-50"
                  />
                  <div></div> {/* Empty div for grid spacing */}
                  <Input
                    label="Internship Start Date"
                    type="date"
                    value={formData.startDate}
                    readOnly
                    className="bg-gray-50"
                  />
                  <Input
                    label="Internship End Date"
                    type="date"
                    value={formData.endDate}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
              )}

              {/* Evaluation Criteria (1-10 scale) */}
              {selectedStudent && (
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900">Evaluation Criteria (Scale: 1-10)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Platform Activity
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={formData.platformActivity}
                        onChange={(e) => handleGradeChange('platformActivity', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Completion of Internship
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={formData.completionOfInternship}
                        onChange={(e) => handleGradeChange('completionOfInternship', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Business Communication
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={formData.businessCommunication}
                        onChange={(e) => handleGradeChange('businessCommunication', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Learning Capacity
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={formData.learningCapacity}
                        onChange={(e) => handleGradeChange('learningCapacity', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Professional Ethics
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={formData.professionalEthics}
                        onChange={(e) => handleGradeChange('professionalEthics', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Punctuality & Attendance
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={formData.punctualityAttendance}
                        onChange={(e) => handleGradeChange('punctualityAttendance', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  {/* Grade Preview */}
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">
                        Total Marks: {calculateTotalMarks().total}/60
                      </span>
                      <span className="text-sm font-medium text-gray-700">
                        Grade: {calculateTotalMarks().grade}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  variant="secondary"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading || !formData.studentId}
                  icon={Save}
                >
                  {loading ? 'Submitting...' : 'Submit Evaluation'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupervisorEvaluationForm;
