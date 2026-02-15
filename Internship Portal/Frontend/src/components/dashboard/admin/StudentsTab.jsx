import React, { useState } from 'react';
import { Eye, CheckCircle, XCircle, Trash2, GraduationCap } from 'lucide-react';
import { mockUsers } from '../../../data/mockData';
import { toast } from 'react-hot-toast';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import Badge from '../../ui/Badge';
import Modal from '../../ui/Modal';

const StudentsTab = () => {
  const [students, setStudents] = useState(
    mockUsers.filter(user => user.role === 'student')
  );
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showStudentModal, setShowStudentModal] = useState(false);

  const handleStatusUpdate = (studentId, newStatus) => {
    setStudents(students.map(student => 
      student.id === studentId 
        ? { ...student, status: newStatus }
        : student
    ));
    toast.success(`Student ${newStatus} successfully!`);
  };

  const handleDeleteStudent = (studentId) => {
    setStudents(students.filter(student => student.id !== studentId));
    toast.success('Student deleted successfully!');
  };

  const handleViewDetails = (student) => {
    setSelectedStudent(student);
    setShowStudentModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'suspended': return 'danger';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const getEligibilityStatus = (student) => {
    const profile = student.profile;
    if (!profile) return { eligible: false, reason: 'No profile data' };
    
    if (profile.cgpa < 2.5) return { eligible: false, reason: 'CGPA below 2.5' };
    if (profile.semester < 7) return { eligible: false, reason: 'Below 7th semester' };
    if (profile.backlogs > 0) return { eligible: false, reason: 'Has backlogs' };
    if (profile.attendance < 75) return { eligible: false, reason: 'Low attendance' };
    
    return { eligible: true, reason: 'Eligible' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Student Management</h2>
        <div className="flex space-x-2">
          <Badge variant="success">Active: {students.filter(s => s.status === 'active' || !s.status).length}</Badge>
          <Badge variant="danger">Suspended: {students.filter(s => s.status === 'suspended').length}</Badge>
        </div>
      </div>

      {/* Students Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {students.map((student) => {
          const eligibility = getEligibilityStatus(student);
          
          return (
            <Card key={student.id} className="p-6" hover>
              <div className="flex items-center space-x-4 mb-4">
                <img
                  src={student.avatar}
                  alt={student.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {student.name}
                  </h3>
                  <p className="text-gray-600">{student.profile?.rollNumber}</p>
                  <div className="flex space-x-2 mt-1">
                    <Badge variant={getStatusColor(student.status || 'active')}>
                      {(student.status || 'active').charAt(0).toUpperCase() + (student.status || 'active').slice(1)}
                    </Badge>
                    <Badge variant={eligibility.eligible ? 'success' : 'danger'}>
                      {eligibility.eligible ? 'Eligible' : 'Not Eligible'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4 text-sm text-gray-600">
                <p>Department: {student.profile?.department}</p>
                <p>CGPA: {student.profile?.cgpa} | Semester: {student.profile?.semester}</p>
                <p>Attendance: {student.profile?.attendance}%</p>
                <p>Email: {student.email}</p>
              </div>

              <div className="flex justify-between items-center">
                <div className="text-sm">
                  <span className="font-medium text-blue-600">3 Applications</span>
                  <p className="text-gray-500">1 Active Internship</p>
                </div>
                
                <div className="flex space-x-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetails(student)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  
                  {(!student.status || student.status === 'active') ? (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleStatusUpdate(student.id, 'suspended')}
                    >
                      <XCircle className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => handleStatusUpdate(student.id, 'active')}
                    >
                      <CheckCircle className="w-4 h-4" />
                    </Button>
                  )}
                  
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteStudent(student.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Student Details Modal */}
      <Modal
        isOpen={showStudentModal}
        onClose={() => setShowStudentModal(false)}
        title="Student Details"
        size="lg"
      >
        {selectedStudent && (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <img
                src={selectedStudent.avatar}
                alt={selectedStudent.name}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedStudent.name}
                </h2>
                <p className="text-gray-600">{selectedStudent.profile?.rollNumber}</p>
                <div className="flex space-x-2 mt-2">
                  <Badge variant={getStatusColor(selectedStudent.status || 'active')} size="md">
                    {(selectedStudent.status || 'active').charAt(0).toUpperCase() + (selectedStudent.status || 'active').slice(1)}
                  </Badge>
                  <Badge variant={getEligibilityStatus(selectedStudent).eligible ? 'success' : 'danger'} size="md">
                    {getEligibilityStatus(selectedStudent).reason}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Email</p>
                <p className="text-gray-900">{selectedStudent.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Phone</p>
                <p className="text-gray-900">{selectedStudent.profile?.phone}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Department</p>
                <p className="text-gray-900">{selectedStudent.profile?.department}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Roll Number</p>
                <p className="text-gray-900">{selectedStudent.profile?.rollNumber}</p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">Academic Performance</h4>
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-blue-600">{selectedStudent.profile?.cgpa}</p>
                  <p className="text-sm text-gray-600">CGPA</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{selectedStudent.profile?.semester}</p>
                  <p className="text-sm text-gray-600">Semester</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600">{selectedStudent.profile?.attendance}%</p>
                  <p className="text-sm text-gray-600">Attendance</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-600">{selectedStudent.profile?.backlogs}</p>
                  <p className="text-sm text-gray-600">Backlogs</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Activity Summary</h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-blue-600">3</p>
                  <p className="text-sm text-gray-600">Applications</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">1</p>
                  <p className="text-sm text-gray-600">Active Internship</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600">2</p>
                  <p className="text-sm text-gray-600">Reports Submitted</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              {(!selectedStudent.status || selectedStudent.status === 'active') ? (
                <Button
                  variant="danger"
                  onClick={() => {
                    handleStatusUpdate(selectedStudent.id, 'suspended');
                    setShowStudentModal(false);
                  }}
                >
                  Suspend Student
                </Button>
              ) : (
                <Button
                  variant="success"
                  onClick={() => {
                    handleStatusUpdate(selectedStudent.id, 'active');
                    setShowStudentModal(false);
                  }}
                >
                  Activate Student
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StudentsTab;