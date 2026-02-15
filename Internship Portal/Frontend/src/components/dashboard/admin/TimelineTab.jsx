import React, { useState } from 'react';
import { Calendar, Save, Edit, Plus } from 'lucide-react';
import { mockTimeline } from '../../../data/mockData';
import { toast } from 'react-hot-toast';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import Input from '../../ui/Input';

const TimelineTab = () => {
  const [timeline, setTimeline] = useState(mockTimeline);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState(timeline);

  const handleSave = () => {
    setTimeline(formData);
    setEditing(false);
    toast.success('Timeline updated successfully!');
  };

  const handleCancel = () => {
    setFormData(timeline);
    setEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Internship Timeline Management</h2>
        {!editing ? (
          <Button onClick={() => setEditing(true)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Timeline
          </Button>
        ) : (
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        )}
      </div>

      {/* Timeline Overview */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Timeline</h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Application Deadline"
              type="date"
              value={formData.applicationDeadline}
              onChange={(e) => setFormData({...formData, applicationDeadline: e.target.value})}
              disabled={!editing}
            />
            <Input
              label="Internship Start Date"
              type="date"
              value={formData.internshipStart}
              onChange={(e) => setFormData({...formData, internshipStart: e.target.value})}
              disabled={!editing}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Internship End Date"
              type="date"
              value={formData.internshipEnd}
              onChange={(e) => setFormData({...formData, internshipEnd: e.target.value})}
              disabled={!editing}
            />
            <Input
              label="Joining Report Deadline"
              type="date"
              value={formData.reportDeadlines.joining}
              onChange={(e) => setFormData({
                ...formData, 
                reportDeadlines: {
                  ...formData.reportDeadlines,
                  joining: e.target.value
                }
              })}
              disabled={!editing}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Weekly Reports Schedule"
              value={formData.reportDeadlines.weekly}
              onChange={(e) => setFormData({
                ...formData, 
                reportDeadlines: {
                  ...formData.reportDeadlines,
                  weekly: e.target.value
                }
              })}
              disabled={!editing}
            />
            <Input
              label="Final Report Deadline"
              type="date"
              value={formData.reportDeadlines.final}
              onChange={(e) => setFormData({
                ...formData, 
                reportDeadlines: {
                  ...formData.reportDeadlines,
                  final: e.target.value
                }
              })}
              disabled={!editing}
            />
          </div>
        </div>
      </Card>

      {/* Timeline Visualization */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline Visualization</h3>
        
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-blue-200"></div>
          
          <div className="space-y-6">
            {/* Application Phase */}
            <div className="flex items-center space-x-4">
              <div className="bg-blue-500 w-8 h-8 rounded-full flex items-center justify-center relative z-10">
                <Calendar className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">Application Phase</h4>
                <p className="text-sm text-gray-600">
                  Deadline: {new Date(timeline.applicationDeadline).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Internship Period */}
            <div className="flex items-center space-x-4">
              <div className="bg-green-500 w-8 h-8 rounded-full flex items-center justify-center relative z-10">
                <Calendar className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">Internship Period</h4>
                <p className="text-sm text-gray-600">
                  {new Date(timeline.internshipStart).toLocaleDateString()} - {new Date(timeline.internshipEnd).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Joining Report */}
            <div className="flex items-center space-x-4">
              <div className="bg-yellow-500 w-8 h-8 rounded-full flex items-center justify-center relative z-10">
                <Calendar className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">Joining Report</h4>
                <p className="text-sm text-gray-600">
                  Due: {new Date(timeline.reportDeadlines.joining).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Weekly Reports */}
            <div className="flex items-center space-x-4">
              <div className="bg-purple-500 w-8 h-8 rounded-full flex items-center justify-center relative z-10">
                <Calendar className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">Weekly Reports</h4>
                <p className="text-sm text-gray-600">
                  Schedule: {timeline.reportDeadlines.weekly}
                </p>
              </div>
            </div>

            {/* Final Report */}
            <div className="flex items-center space-x-4">
              <div className="bg-red-500 w-8 h-8 rounded-full flex items-center justify-center relative z-10">
                <Calendar className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">Final Report & Evaluation</h4>
                <p className="text-sm text-gray-600">
                  Due: {new Date(timeline.reportDeadlines.final).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Important Dates Summary */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">Important Dates Summary</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="bg-blue-100 p-3 rounded-full w-12 h-12 mx-auto mb-2 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <p className="font-medium text-blue-900">Applications Close</p>
            <p className="text-sm text-blue-700">
              {new Date(timeline.applicationDeadline).toLocaleDateString()}
            </p>
          </div>

          <div className="text-center">
            <div className="bg-green-100 p-3 rounded-full w-12 h-12 mx-auto mb-2 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <p className="font-medium text-blue-900">Internships Begin</p>
            <p className="text-sm text-blue-700">
              {new Date(timeline.internshipStart).toLocaleDateString()}
            </p>
          </div>

          <div className="text-center">
            <div className="bg-yellow-100 p-3 rounded-full w-12 h-12 mx-auto mb-2 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-yellow-600" />
            </div>
            <p className="font-medium text-blue-900">Joining Report Due</p>
            <p className="text-sm text-blue-700">
              {new Date(timeline.reportDeadlines.joining).toLocaleDateString()}
            </p>
          </div>

          <div className="text-center">
            <div className="bg-red-100 p-3 rounded-full w-12 h-12 mx-auto mb-2 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-red-600" />
            </div>
            <p className="font-medium text-blue-900">Final Report Due</p>
            <p className="text-sm text-blue-700">
              {new Date(timeline.reportDeadlines.final).toLocaleDateString()}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TimelineTab;