import React, { useState } from 'react';
import { Calendar, Clock, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Card from '../../../ui/Card';
import Button from '../../../ui/Button';
import Badge from '../../../ui/Badge';
import Input from '../../../ui/Input';
import Select from '../../../ui/Select';

const ScheduleTab = () => {
  const [schedule, setSchedule] = useState([
    {
      id: 1,
      day: 'Monday',
      startTime: '10:00',
      endTime: '12:00',
      type: 'office-hours',
      description: 'Regular office hours for student consultations'
    },
    {
      id: 2,
      day: 'Wednesday',
      startTime: '14:00',
      endTime: '16:00',
      type: 'office-hours',
      description: 'Regular office hours for student consultations'
    },
    {
      id: 3,
      day: 'Friday',
      startTime: '09:00',
      endTime: '11:00',
      type: 'viva',
      description: 'Viva sessions and final evaluations'
    }
  ]);

  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [formData, setFormData] = useState({
    day: '',
    startTime: '',
    endTime: '',
    type: '',
    description: ''
  });

  const handleCreateSchedule = () => {
    setEditingSchedule(null);
    setFormData({
      day: '',
      startTime: '',
      endTime: '',
      type: '',
      description: ''
    });
    setShowScheduleForm(true);
  };

  const handleEditSchedule = (scheduleItem) => {
    setEditingSchedule(scheduleItem);
    setFormData({
      day: scheduleItem.day,
      startTime: scheduleItem.startTime,
      endTime: scheduleItem.endTime,
      type: scheduleItem.type,
      description: scheduleItem.description
    });
    setShowScheduleForm(true);
  };

  const handleSubmitSchedule = () => {
    if (editingSchedule) {
      // Update existing schedule
      setSchedule(schedule.map(item => 
        item.id === editingSchedule.id 
          ? { ...item, ...formData }
          : item
      ));
      toast.success('Schedule updated successfully!');
    } else {
      // Create new schedule
      const newSchedule = {
        id: schedule.length + 1,
        ...formData
      };
      setSchedule([...schedule, newSchedule]);
      toast.success('Schedule added successfully!');
    }
    setShowScheduleForm(false);
  };

  const handleDeleteSchedule = (scheduleId) => {
    setSchedule(schedule.filter(item => item.id !== scheduleId));
    toast.success('Schedule deleted successfully!');
  };

  const dayOptions = [
    { value: 'Monday', label: 'Monday' },
    { value: 'Tuesday', label: 'Tuesday' },
    { value: 'Wednesday', label: 'Wednesday' },
    { value: 'Thursday', label: 'Thursday' },
    { value: 'Friday', label: 'Friday' },
    { value: 'Saturday', label: 'Saturday' },
    { value: 'Sunday', label: 'Sunday' }
  ];

  const typeOptions = [
    { value: 'office-hours', label: 'Office Hours' },
    { value: 'viva', label: 'Viva Sessions' },
    { value: 'meetings', label: 'Meetings' },
    { value: 'consultations', label: 'Consultations' }
  ];

  const getTypeColor = (type) => {
    switch (type) {
      case 'office-hours': return 'info';
      case 'viva': return 'warning';
      case 'meetings': return 'success';
      case 'consultations': return 'primary';
      default: return 'default';
    }
  };

  const sortedSchedule = schedule.sort((a, b) => {
    const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Schedule Management</h2>
        <Button onClick={handleCreateSchedule}>
          <Plus className="w-4 h-4 mr-2" />
          Add Schedule
        </Button>
      </div>

      {/* Current Schedule */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Schedule</h3>
        
        <div className="space-y-4">
          {sortedSchedule.map((scheduleItem) => (
            <div key={scheduleItem.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-1">
                    <h4 className="font-semibold text-gray-900">{scheduleItem.day}</h4>
                    <Badge variant={getTypeColor(scheduleItem.type)}>
                      {scheduleItem.type.replace('-', ' ').charAt(0).toUpperCase() + scheduleItem.type.replace('-', ' ').slice(1)}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {scheduleItem.startTime} - {scheduleItem.endTime}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-500 mt-1">{scheduleItem.description}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditSchedule(scheduleItem)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDeleteSchedule(scheduleItem.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {schedule.length === 0 && (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Schedule Set
            </h3>
            <p className="text-gray-600 mb-4">
              Add your availability for student meetings and consultations.
            </p>
            <Button onClick={handleCreateSchedule}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Schedule
            </Button>
          </div>
        )}
      </Card>

      {/* Schedule Form Modal */}
      {showScheduleForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" />
            
            <div className="inline-block w-full max-w-lg p-6 my-8 text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingSchedule ? 'Edit Schedule' : 'Add Schedule'}
                </h3>
                <button
                  onClick={() => setShowScheduleForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Day"
                    required
                    options={dayOptions}
                    value={formData.day}
                    onChange={(e) => setFormData({...formData, day: e.target.value})}
                  />
                  <Select
                    label="Type"
                    required
                    options={typeOptions}
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Start Time"
                    type="time"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                  />
                  <Input
                    label="End Time"
                    type="time"
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowScheduleForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSubmitSchedule}>
                    {editingSchedule ? 'Update' : 'Add'} Schedule
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

export default ScheduleTab;