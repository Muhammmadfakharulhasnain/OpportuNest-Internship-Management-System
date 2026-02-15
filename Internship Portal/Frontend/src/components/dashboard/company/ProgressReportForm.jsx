import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Card from '../../../ui/Card';
import Button from '../../../ui/Button';
import Input from '../../../ui/Input';
import Select from '../../../ui/Select';
import { misconductReportAPI, progressReportAPI } from '../../../services/api';

const ProgressReportForm = ({ onClose }) => {
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({
    studentId: '',
    reportingPeriod: '',
    tasksAssigned: '',
    progressMade: '',
    hoursWorked: '',
    qualityOfWork: '',
    areasOfImprovement: '',
    nextGoals: '',
    remarks: ''
  });
  const [loading, setLoading] = useState(false);

  const qualityOptions = [
    { value: 'Excellent', label: 'Excellent' },
    { value: 'Good', label: 'Good' },
    { value: 'Average', label: 'Average' },
    { value: 'Poor', label: 'Poor' }
  ];

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const userString = localStorage.getItem('user');
      if (!userString) {
        toast.error('User not found. Please login again.');
        return;
      }
      
      const user = JSON.parse(userString);
      const companyId = user.id;
      
      const response = await misconductReportAPI.getEligibleStudents(companyId);
      
      if (response.data.length === 0) {
        setStudents([]);
        return;
      }
      
      setStudents(response.data.map(student => ({
        value: student._id,
        label: `${student.name || 'Unknown'} (${student.rollNumber || 'No Roll'}) - ${student.jobTitle || 'No Job Title'}`
      })));
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to load students');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.studentId || formData.studentId.trim() === '') {
      toast.error('Please select a student');
      return;
    }
    
    if (!formData.tasksAssigned || formData.tasksAssigned.trim() === '') {
      toast.error('Tasks assigned is required');
      return;
    }
    
    if (!formData.progressMade || formData.progressMade.trim() === '') {
      toast.error('Progress made is required');
      return;
    }

    setLoading(true);
    try {
      await progressReportAPI.createProgressReport(formData);
      toast.success('Progress report submitted successfully');
      
      setFormData({
        studentId: '',
        reportingPeriod: '',
        tasksAssigned: '',
        progressMade: '',
        hoursWorked: '',
        qualityOfWork: '',
        areasOfImprovement: '',
        nextGoals: '',
        remarks: ''
      });
      
      if (onClose) onClose();
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error(error.message || 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };



  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-6">Create Progress Report</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {students.length === 0 ? (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-yellow-800 text-sm">
              No hired students available for progress reporting.
            </p>
          </div>
        ) : (
          <Select
            label="Student Name"
            required
            options={students}
            value={formData.studentId}
            onChange={(e) => setFormData({...formData, studentId: e.target.value})}
          />
        )}
        
        <Input
          label="Reporting Period"
          type="text"
          required
          value={formData.reportingPeriod}
          onChange={(e) => setFormData({...formData, reportingPeriod: e.target.value})}
          placeholder="e.g., Week 1-4, Month 1, etc."
        />
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tasks Assigned *
          </label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            rows="3"
            required
            value={formData.tasksAssigned}
            onChange={(e) => setFormData({...formData, tasksAssigned: e.target.value})}
            placeholder="Describe the tasks assigned to the student..."
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Progress Made *
          </label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            rows="3"
            required
            value={formData.progressMade}
            onChange={(e) => setFormData({...formData, progressMade: e.target.value})}
            placeholder="Describe the progress made by the student..."
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Hours Worked"
            type="number"
            min="0"
            value={formData.hoursWorked}
            onChange={(e) => setFormData({...formData, hoursWorked: e.target.value})}
            placeholder="Total hours worked"
          />
          
          <Select
            label="Quality of Work"
            required
            options={qualityOptions}
            value={formData.qualityOfWork}
            onChange={(e) => setFormData({...formData, qualityOfWork: e.target.value})}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Areas of Improvement
          </label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            rows="2"
            value={formData.areasOfImprovement}
            onChange={(e) => setFormData({...formData, areasOfImprovement: e.target.value})}
            placeholder="e.g., Needs to work on communication, Should improve debugging skills"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Next Goals / Objectives
          </label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            rows="2"
            value={formData.nextGoals}
            onChange={(e) => setFormData({...formData, nextGoals: e.target.value})}
            placeholder="e.g., Prepare final presentation, Improve testing coverage"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Remarks / Notes
          </label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            rows="2"
            value={formData.remarks}
            onChange={(e) => setFormData({...formData, remarks: e.target.value})}
            placeholder="e.g., Very proactive during meetings, Needs to be punctual in submissions"
          />
        </div>
        
        <Button type="submit" disabled={loading || students.length === 0}>
          {loading ? 'Submitting...' : 'Submit Report'}
        </Button>
      </form>
    </Card>
  );
};

export default ProgressReportForm;