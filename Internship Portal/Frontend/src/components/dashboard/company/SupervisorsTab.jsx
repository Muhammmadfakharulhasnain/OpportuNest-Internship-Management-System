import React, { useState } from 'react';
import { Plus, Edit, Trash2, UserCheck, Mail, Phone } from 'lucide-react';
import { mockSupervisors } from '../../../data/mockData';
import { toast } from 'react-hot-toast';
import Card from '../../../ui/Card';
import Button from '../../../ui/Button';
import Badge from '../../../ui/Badge';
import Modal from '../../../ui/Modal';
import Input from '../../../ui/Input';

const SupervisorsTab = () => {
  const [supervisors, setSupervisors] = useState(mockSupervisors);
  const [showSupervisorModal, setShowSupervisorModal] = useState(false);
  const [selectedSupervisor, setSelectedSupervisor] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    designation: '',
    email: '',
    phone: '',
    department: '',
    experience: ''
  });

  const handleCreateSupervisor = () => {
    setSelectedSupervisor(null);
    setFormData({
      name: '',
      designation: '',
      email: '',
      phone: '',
      department: '',
      experience: ''
    });
    setShowSupervisorModal(true);
  };

  const handleEditSupervisor = (supervisor) => {
    setSelectedSupervisor(supervisor);
    setFormData({
      name: supervisor.name,
      designation: supervisor.designation,
      email: supervisor.email,
      phone: supervisor.phone,
      department: supervisor.department || '',
      experience: supervisor.experience || ''
    });
    setShowSupervisorModal(true);
  };

  const handleSubmitSupervisor = () => {
    if (selectedSupervisor) {
      // Update existing supervisor
      setSupervisors(supervisors.map(supervisor => 
        supervisor.id === selectedSupervisor.id 
          ? { ...supervisor, ...formData }
          : supervisor
      ));
      toast.success('Supervisor updated successfully!');
    } else {
      // Create new supervisor
      const newSupervisor = {
        id: supervisors.length + 1,
        ...formData,
        companyId: 2,
        assignedStudents: []
      };
      setSupervisors([...supervisors, newSupervisor]);
      toast.success('Supervisor added successfully!');
    }
    setShowSupervisorModal(false);
  };

  const handleDeleteSupervisor = (supervisorId) => {
    setSupervisors(supervisors.filter(supervisor => supervisor.id !== supervisorId));
    toast.success('Supervisor removed successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Supervisors</h2>
        <Button onClick={handleCreateSupervisor}>
          <Plus className="w-4 h-4 mr-2" />
          Add Supervisor
        </Button>
      </div>

      {/* Supervisors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {supervisors.map((supervisor) => (
          <Card key={supervisor.id} className="p-6" hover>
            <div className="flex items-center space-x-4 mb-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <UserCheck className="w-8 h-8 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  {supervisor.name}
                </h3>
                <p className="text-gray-600">{supervisor.designation}</p>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="w-4 h-4 mr-2" />
                {supervisor.email}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="w-4 h-4 mr-2" />
                {supervisor.phone}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Badge variant="info">
                {supervisor.assignedStudents.length} Students
              </Badge>
              
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditSupervisor(supervisor)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDeleteSupervisor(supervisor.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {supervisors.length === 0 && (
        <Card className="p-12 text-center">
          <div className="text-gray-400 mb-4">
            <UserCheck className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Supervisors Added
          </h3>
          <p className="text-gray-600 mb-4">
            Add supervisors to manage and guide your interns effectively.
          </p>
          <Button onClick={handleCreateSupervisor}>
            <Plus className="w-4 h-4 mr-2" />
            Add First Supervisor
          </Button>
        </Card>
      )}

      {/* Supervisor Form Modal */}
      <Modal
        isOpen={showSupervisorModal}
        onClose={() => setShowSupervisorModal(false)}
        title={selectedSupervisor ? 'Edit Supervisor' : 'Add Supervisor'}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
            <Input
              label="Designation"
              required
              value={formData.designation}
              onChange={(e) => setFormData({...formData, designation: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Email Address"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
            <Input
              label="Phone Number"
              required
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Department"
              value={formData.department}
              onChange={(e) => setFormData({...formData, department: e.target.value})}
            />
            <Input
              label="Years of Experience"
              type="number"
              value={formData.experience}
              onChange={(e) => setFormData({...formData, experience: e.target.value})}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowSupervisorModal(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmitSupervisor}>
              {selectedSupervisor ? 'Update Supervisor' : 'Add Supervisor'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SupervisorsTab;