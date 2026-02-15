import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Card from '../../../ui/Card';
import Button from '../../../ui/Button';
import Input from '../../../ui/Input';
import Select from '../../../ui/Select';
import { misconductReportAPI } from '../../../services/api';

const MisconductReportForm = ({ onClose }) => {
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({
    studentId: '',
    issueType: '',
    incidentDate: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);

  const issueTypes = [
    { value: 'Absenteeism', label: 'Absenteeism' },
    { value: 'Unprofessional Behavior', label: 'Unprofessional Behavior' },
    { value: 'Misconduct', label: 'Other Misconduct' }
  ];

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      // Get company ID from localStorage
      const userString = localStorage.getItem('user');
      if (!userString) {
        toast.error('User not found. Please login again.');
        return;
      }
      
      const user = JSON.parse(userString);
      const companyId = user.id;
      
      const response = await misconductReportAPI.getEligibleStudents(companyId);
      console.log('Students received:', response.data);
      
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
    
    // Validate student selection
    if (!formData.studentId || formData.studentId.trim() === '') {
      toast.error('Please select a student');
      return;
    }
    
    if (formData.description.length < 200) {
      toast.error('Description must be at least 200 characters');
      return;
    }

    console.log('=== FRONTEND PAYLOAD ===');
    console.log('Form data being sent:', formData);
    console.log('Student ID type:', typeof formData.studentId);
    console.log('Student ID value:', formData.studentId);

    setLoading(true);
    try {
      await misconductReportAPI.createMisconductReport(formData);
      toast.success('Misconduct report submitted successfully');
      setFormData({
        studentId: '',
        issueType: '',
        incidentDate: '',
        description: ''
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
      <h2 className="text-xl font-semibold mb-6">Create Misconduct Report</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {students.length === 0 ? (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-yellow-800 text-sm">
              No hired students available for misconduct reporting.
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
        
        <Select
          label="Issue Type"
          required
          options={issueTypes}
          value={formData.issueType}
          onChange={(e) => setFormData({...formData, issueType: e.target.value})}
        />
        
        <Input
          label="Date of Incident"
          type="date"
          required
          value={formData.incidentDate}
          onChange={(e) => setFormData({...formData, incidentDate: e.target.value})}
        />
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Detailed Description (Minimum 200 characters) *
          </label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            rows="6"
            required
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            placeholder="Provide detailed description of the incident..."
          />
          <div className="text-sm text-gray-500 mt-1">
            {formData.description.length}/200 characters
          </div>
        </div>
        
        <Button type="submit" disabled={loading || students.length === 0}>
          {loading ? 'Submitting...' : 'Submit Report'}
        </Button>
      </form>
    </Card>
  );
};

export default MisconductReportForm;