import React, { useState } from 'react';
import { Plus, Edit, Save, User, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import Badge from '../../ui/Badge';
import Input from '../../ui/Input';
import Select from '../../ui/Select';

const EvaluationsTab = () => {
  const [evaluations, setEvaluations] = useState([
    {
      id: 1,
      studentId: 1,
      studentName: 'Ahmad Ali',
      rollNumber: 'FA19-BSE-001',
      weeklyReports: 18,
      internshipReport: 17,
      presentation: 42,
      supervisorAssessment: 9,
      totalMarks: 86,
      grade: 'A',
      status: 'completed'
    }
  ]);
  
  const [showEvaluationForm, setShowEvaluationForm] = useState(false);
  const [editingEvaluation, setEditingEvaluation] = useState(null);
  const [formData, setFormData] = useState({
    studentName: '',
    rollNumber: '',
    weeklyReports: '',
    internshipReport: '',
    presentation: '',
    supervisorAssessment: ''
  });

  const handleCreateEvaluation = () => {
    setEditingEvaluation(null);
    setFormData({
      studentName: '',
      rollNumber: '',
      weeklyReports: '',
      internshipReport: '',
      presentation: '',
      supervisorAssessment: ''
    });
    setShowEvaluationForm(true);
  };

  const handleEditEvaluation = (evaluation) => {
    setEditingEvaluation(evaluation);
    setFormData({
      studentName: evaluation.studentName,
      rollNumber: evaluation.rollNumber,
      weeklyReports: evaluation.weeklyReports,
      internshipReport: evaluation.internshipReport,
      presentation: evaluation.presentation,
      supervisorAssessment: evaluation.supervisorAssessment
    });
    setShowEvaluationForm(true);
  };

  const calculateGrade = (totalMarks) => {
    if (totalMarks >= 85) return 'A+';
    if (totalMarks >= 80) return 'A';
    if (totalMarks >= 75) return 'B+';
    if (totalMarks >= 70) return 'B';
    if (totalMarks >= 65) return 'C+';
    if (totalMarks >= 60) return 'C';
    if (totalMarks >= 55) return 'D+';
    if (totalMarks >= 50) return 'D';
    return 'F';
  };

  const handleSubmitEvaluation = () => {
    const weeklyReports = parseInt(formData.weeklyReports) || 0;
    const internshipReport = parseInt(formData.internshipReport) || 0;
    const presentation = parseInt(formData.presentation) || 0;
    const supervisorAssessment = parseInt(formData.supervisorAssessment) || 0;
    
    const totalMarks = weeklyReports + internshipReport + presentation + supervisorAssessment;
    const grade = calculateGrade(totalMarks);

    if (editingEvaluation) {
      // Update existing evaluation
      setEvaluations(evaluations.map(evaluation => 
        evaluation.id === editingEvaluation.id 
          ? {
              ...evaluation,
              ...formData,
              weeklyReports,
              internshipReport,
              presentation,
              supervisorAssessment,
              totalMarks,
              grade,
              status: 'completed'
            }
          : evaluation
      ));
      toast.success('Evaluation updated successfully!');
    } else {
      // Create new evaluation
      const newEvaluation = {
        id: evaluations.length + 1,
        studentId: evaluations.length + 1,
        ...formData,
        weeklyReports,
        internshipReport,
        presentation,
        supervisorAssessment,
        totalMarks,
        grade,
        status: 'completed'
      };
      setEvaluations([...evaluations, newEvaluation]);
      toast.success('Evaluation created successfully!');
    }
    
    setShowEvaluationForm(false);
  };

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
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Student Evaluations</h2>
        <Button onClick={handleCreateEvaluation}>
          <Plus className="w-4 h-4 mr-2" />
          Add Evaluation
        </Button>
      </div>

      {/* Evaluation Criteria Info */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Evaluation Criteria</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <p className="font-medium text-blue-800">Weekly Reports</p>
            <p className="text-blue-600">20 Marks</p>
          </div>
          <div className="text-center">
            <p className="font-medium text-blue-800">Internship Report & Certificate</p>
            <p className="text-blue-600">20 Marks</p>
          </div>
          <div className="text-center">
            <p className="font-medium text-blue-800">Presentation & Viva</p>
            <p className="text-blue-600">50 Marks</p>
          </div>
          <div className="text-center">
            <p className="font-medium text-blue-800">Supervisor's Assessment</p>
            <p className="text-blue-600">10 Marks</p>
          </div>
        </div>
      </Card>

      {/* Evaluations List */}
      <div className="space-y-4">
        {evaluations.map((evaluation) => (
          <Card key={evaluation.id} className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {evaluation.studentName}
                    </h3>
                    <Badge variant={getGradeColor(evaluation.grade)} size="md">
                      Grade: {evaluation.grade}
                    </Badge>
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Roll Number: {evaluation.rollNumber}</p>
                    <p>Total Marks: {evaluation.totalMarks}/100</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{evaluation.totalMarks}</p>
                  <p className="text-sm text-gray-500">out of 100</p>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditEvaluation(evaluation)}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              </div>
            </div>

            {/* Marks Breakdown */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <p className="font-medium text-gray-700">Weekly Reports</p>
                  <p className="text-lg font-bold text-blue-600">{evaluation.weeklyReports}/20</p>
                </div>
                <div className="text-center">
                  <p className="font-medium text-gray-700">Internship Report</p>
                  <p className="text-lg font-bold text-green-600">{evaluation.internshipReport}/20</p>
                </div>
                <div className="text-center">
                  <p className="font-medium text-gray-700">Presentation</p>
                  <p className="text-lg font-bold text-purple-600">{evaluation.presentation}/50</p>
                </div>
                <div className="text-center">
                  <p className="font-medium text-gray-700">Supervisor</p>
                  <p className="text-lg font-bold text-orange-600">{evaluation.supervisorAssessment}/10</p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {evaluations.length === 0 && (
        <Card className="p-12 text-center">
          <div className="text-gray-400 mb-4">
            <FileText className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Evaluations Yet
          </h3>
          <p className="text-gray-600 mb-4">
            Start evaluating student internship performance.
          </p>
          <Button onClick={handleCreateEvaluation}>
            <Plus className="w-4 h-4 mr-2" />
            Create First Evaluation
          </Button>
        </Card>
      )}

      {/* Evaluation Form Modal */}
      {showEvaluationForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" />
            
            <div className="inline-block w-full max-w-2xl p-6 my-8 text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingEvaluation ? 'Edit Evaluation' : 'Create Evaluation'}
                </h3>
                <button
                  onClick={() => setShowEvaluationForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Student Name"
                    required
                    value={formData.studentName}
                    onChange={(e) => setFormData({...formData, studentName: e.target.value})}
                  />
                  <Input
                    label="Roll Number"
                    required
                    value={formData.rollNumber}
                    onChange={(e) => setFormData({...formData, rollNumber: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Input
                    label="Weekly Reports (20)"
                    type="number"
                    min="0"
                    max="20"
                    required
                    value={formData.weeklyReports}
                    onChange={(e) => setFormData({...formData, weeklyReports: e.target.value})}
                  />
                  <Input
                    label="Internship Report (20)"
                    type="number"
                    min="0"
                    max="20"
                    required
                    value={formData.internshipReport}
                    onChange={(e) => setFormData({...formData, internshipReport: e.target.value})}
                  />
                  <Input
                    label="Presentation (50)"
                    type="number"
                    min="0"
                    max="50"
                    required
                    value={formData.presentation}
                    onChange={(e) => setFormData({...formData, presentation: e.target.value})}
                  />
                  <Input
                    label="Supervisor (10)"
                    type="number"
                    min="0"
                    max="10"
                    required
                    value={formData.supervisorAssessment}
                    onChange={(e) => setFormData({...formData, supervisorAssessment: e.target.value})}
                  />
                </div>

                {/* Total Preview */}
                {(formData.weeklyReports || formData.internshipReport || formData.presentation || formData.supervisorAssessment) && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">Total Marks:</span>
                      <span className="text-2xl font-bold text-blue-600">
                        {(parseInt(formData.weeklyReports) || 0) + 
                         (parseInt(formData.internshipReport) || 0) + 
                         (parseInt(formData.presentation) || 0) + 
                         (parseInt(formData.supervisorAssessment) || 0)}/100
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="font-medium text-gray-700">Grade:</span>
                      <Badge variant={getGradeColor(calculateGrade(
                        (parseInt(formData.weeklyReports) || 0) + 
                        (parseInt(formData.internshipReport) || 0) + 
                        (parseInt(formData.presentation) || 0) + 
                        (parseInt(formData.supervisorAssessment) || 0)
                      ))}>
                        {calculateGrade(
                          (parseInt(formData.weeklyReports) || 0) + 
                          (parseInt(formData.internshipReport) || 0) + 
                          (parseInt(formData.presentation) || 0) + 
                          (parseInt(formData.supervisorAssessment) || 0)
                        )}
                      </Badge>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowEvaluationForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSubmitEvaluation}>
                    <Save className="w-4 h-4 mr-2" />
                    {editingEvaluation ? 'Update' : 'Create'} Evaluation
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

export default EvaluationsTab;