import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { User, Mail, Phone, MapPin, Clock, Save, Plus, X, Edit, Shield, Award, Settings } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { supervisorAPI } from '../../../services/api';
import Card from '../../../ui/Card';
import Button from '../../../ui/Button';
import Input from '../../../ui/Input';
import Badge from '../../../ui/Badge';
import './EditProfileTab.css';

const EditProfileTab = () => {
  const { currentUser, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    department: '',
    designation: '',
    phone: '',
    office: '',
    officeHours: '',
    maxStudents: 10,
    expertise: []
  });
  const [newExpertise, setNewExpertise] = useState('');

  // Fetch supervisor profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        
        console.log('DEBUG: Current user from auth context:', currentUser);
        console.log('DEBUG: Calling supervisorAPI.getProfile()');
        
        const response = await supervisorAPI.getProfile();
        
        console.log('DEBUG: Full API response:', response);
        
        if (response.success) {
          const data = response.data;
          
          console.log('DEBUG: Response data:', data);
          console.log('DEBUG: data._id:', data._id);
          console.log('DEBUG: data.supervisor:', data.supervisor);
          console.log('DEBUG: data.supervisor?.designation:', data.supervisor?.designation);
          
          setProfile({
            name: data.name || '',
            email: data.email || '',
            department: data.supervisor?.department || 'Not specified',
            designation: data.supervisor?.designation || 'Not specified',
            phone: data.supervisor?.phone || '',
            office: data.supervisor?.office || '',
            officeHours: data.supervisor?.officeHours || '',
            maxStudents: data.supervisor?.maxStudents || 10,
            expertise: data.supervisor?.expertise || []
          });
          
          console.log('DEBUG: Profile state set with designation:', data.supervisor?.designation || 'Not specified');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [currentUser]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Add new expertise
  const addExpertise = () => {
    if (newExpertise.trim() && !profile.expertise.includes(newExpertise.trim())) {
      setProfile(prev => ({
        ...prev,
        expertise: [...prev.expertise, newExpertise.trim()]
      }));
      setNewExpertise('');
    }
  };

  // Remove expertise
  const removeExpertise = (index) => {
    setProfile(prev => ({
      ...prev,
      expertise: prev.expertise.filter((_, i) => i !== index)
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      // Create update object with only editable fields (no validation needed for non-editable fields)
      const updateData = {
        phone: profile.phone,
        office: profile.office,
        officeHours: profile.officeHours,
        maxStudents: profile.maxStudents,
        expertise: profile.expertise
      };

      const response = await supervisorAPI.updateProfile(updateData);
      
      if (response.success) {
        toast.success('Profile updated successfully!');
        setIsEditing(false); // Exit edit mode after successful save
        // Update user context if needed
        if (updateUser) {
          updateUser(response.data);
        }
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Handle edit button click
  const handleEditClick = () => {
    setIsEditing(true);
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setIsEditing(false);
    // You might want to reset form to original values here if needed
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Loading Header */}
        <div className="relative bg-gradient-to-r from-[#003366] via-[#00509E] to-[#003366] rounded-lg p-6 overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full transform translate-x-16 -translate-y-16"></div>
          </div>
          <div className="relative">
            <div className="w-48 h-8 bg-white/20 rounded-lg mb-2 animate-pulse"></div>
            <div className="w-72 h-4 bg-white/20 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Loading Cards */}
        <div className="grid gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-6 border border-gray-200 shadow-sm">
              <div className="space-y-4">
                <div className="w-48 h-6 bg-gray-200 rounded animate-pulse"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="w-full h-10 bg-gray-200 rounded animate-pulse"></div>
                  <div className="w-full h-10 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header Section - COMSATS Design */}
      <div className="relative bg-gradient-to-r from-[#003366] via-[#00509E] to-[#003366] rounded-lg p-6 text-white shadow-lg overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full transform translate-x-16 -translate-y-16"></div>
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-white rounded-full transform -translate-x-10 translate-y-10"></div>
        </div>
        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="bg-white/10 p-3 rounded-lg shadow-sm backdrop-blur-sm">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Edit Profile</h2>
              <p className="text-blue-100 text-sm">
                Update your supervisor profile information and settings
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {!isEditing ? (
              <Button
                onClick={handleEditClick}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 backdrop-blur-sm"
              >
                <Edit className="w-4 h-4" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  onClick={handleCancelEdit}
                  variant="outline"
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/20"
                >
                  Cancel
                </Button>
                <Badge 
                  variant="warning" 
                  size="lg"
                  className="bg-yellow-400 text-gray-900 border border-yellow-500 px-4 py-2 font-semibold"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editing Mode
                </Badge>
              </div>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card className="overflow-hidden border border-gray-200 shadow-sm">
          <div className="bg-gradient-to-r from-[#003366] to-[#00509E] px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
                  <User className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white">Basic Information</h3>
              </div>
              <Badge variant="info" size="sm" className="bg-white/10 text-white border border-white/20">
                <Shield className="w-3 h-3 mr-1" />
                Protected
              </Badge>
            </div>
          </div>
          
          <div className="p-6">
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Shield className="w-5 h-5 text-[#003366]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#003366]">Protected Information</p>
                  <p className="text-sm text-gray-700">
                    Name, Email, Department, and Designation are secured and cannot be modified after registration.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <User className="w-4 h-4 text-[#003366]" />
                  Full Name
                </label>
                <Input
                  type="text"
                  name="name"
                  value={profile.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  disabled
                  className="bg-gray-100 cursor-not-allowed border-gray-300"
                />
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Protected field - Cannot be changed after registration
                </p>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#003366]" />
                  Email Address
                </label>
                <Input
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  disabled
                  className="bg-gray-100 cursor-not-allowed border-gray-300"
                />
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Protected field - Cannot be changed after registration
                </p>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Settings className="w-4 h-4 text-[#003366]" />
                  Department
                </label>
                <Input
                  type="text"
                  name="department"
                  value={profile.department}
                  onChange={handleChange}
                  placeholder="e.g., Computer Science"
                  disabled
                  className="bg-gray-100 cursor-not-allowed border-gray-300"
                />
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Protected field - Cannot be changed after registration
                </p>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#003366]" />
                  Designation
                </label>
                <Input
                  type="text"
                  name="designation"
                  value={profile.designation}
                  onChange={handleChange}
                  placeholder="e.g., Assistant Professor"
                  disabled
                  className="bg-gray-100 cursor-not-allowed border-gray-300"
                />
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Protected field - Cannot be changed after registration
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Contact Information */}
        <Card className="overflow-hidden border border-gray-200 shadow-sm">
          <div className="bg-gradient-to-r from-[#003366] to-[#00509E] px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white">Contact Information</h3>
              </div>
              <Badge 
                variant={isEditing ? "warning" : "success"} 
                size="sm" 
                className={isEditing ? "bg-yellow-400 text-gray-900 border border-yellow-500" : "bg-white/10 text-white border border-white/20"}
              >
                {isEditing ? <Edit className="w-3 h-3 mr-1" /> : <Shield className="w-3 h-3 mr-1" />}
                {isEditing ? "Editable" : "View Mode"}
              </Badge>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#003366]" />
                  Phone Number
                </label>
                <Input
                  type="tel"
                  name="phone"
                  value={profile.phone}
                  onChange={handleChange}
                  placeholder="+92-XXX-XXXXXXX"
                  disabled={!isEditing}
                  className={!isEditing ? "bg-gray-100 cursor-not-allowed border-gray-300" : "border-[#00509E] focus:border-[#003366]"}
                />
                {!isEditing && (
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Click Edit Profile to modify this field
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#003366]" />
                  Office Location
                </label>
                <Input
                  type="text"
                  name="office"
                  value={profile.office}
                  onChange={handleChange}
                  placeholder="e.g., Room 301, CS Department"
                  disabled={!isEditing}
                  className={!isEditing ? "bg-gray-100 cursor-not-allowed border-gray-300" : "border-[#00509E] focus:border-[#003366]"}
                />
                {!isEditing && (
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Click Edit Profile to modify this field
                  </p>
                )}
              </div>
            </div>
            
            <div className="mt-6 space-y-2">
              <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#003366]" />
                Office Hours
              </label>
              <Input
                type="text"
                name="officeHours"
                value={profile.officeHours}
                onChange={handleChange}
                placeholder="e.g., Mon-Wed-Fri, 10AM-12PM"
                disabled={!isEditing}
                className={!isEditing ? "bg-gray-100 cursor-not-allowed border-gray-300" : "border-[#00509E] focus:border-[#003366]"}
              />
              {!isEditing && (
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Click Edit Profile to modify this field
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* Supervision Settings */}
        <Card className="overflow-hidden border border-gray-200 shadow-sm">
          <div className="bg-gradient-to-r from-[#003366] to-[#00509E] px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white">Supervision Settings</h3>
              </div>
              <Badge 
                variant={isEditing ? "warning" : "success"} 
                size="sm" 
                className={isEditing ? "bg-yellow-400 text-gray-900 border border-yellow-500" : "bg-white/10 text-white border border-white/20"}
              >
                {isEditing ? <Edit className="w-3 h-3 mr-1" /> : <Shield className="w-3 h-3 mr-1" />}
                {isEditing ? "Editable" : "View Mode"}
              </Badge>
            </div>
          </div>
          
          <div className="p-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#003366]" />
                Maximum Students
              </label>
              <Input
                type="number"
                name="maxStudents"
                value={profile.maxStudents}
                onChange={handleChange}
                min="1"
                max="20"
                placeholder="10"
                disabled={!isEditing}
                className={!isEditing ? "bg-gray-100 cursor-not-allowed border-gray-300" : "border-[#00509E] focus:border-[#003366]"}
              />
              <p className="text-sm text-gray-500 flex items-center gap-2">
                <Award className="w-4 h-4 text-[#00509E]" />
                Maximum number of students you can supervise simultaneously
              </p>
              {!isEditing && (
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Click Edit Profile to modify this field
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* Areas of Expertise */}
        <Card className="overflow-hidden border border-gray-200 shadow-sm">
          <div className="bg-gradient-to-r from-[#003366] to-[#00509E] px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white">Areas of Expertise</h3>
              </div>
              <Badge 
                variant={isEditing ? "warning" : "success"} 
                size="sm" 
                className={isEditing ? "bg-yellow-400 text-gray-900 border border-yellow-500" : "bg-white/10 text-white border border-white/20"}
              >
                {isEditing ? <Edit className="w-3 h-3 mr-1" /> : <Shield className="w-3 h-3 mr-1" />}
                {isEditing ? "Editable" : "View Mode"}
              </Badge>
            </div>
          </div>
          
          <div className="p-6">
            {/* Current Expertise */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <Award className="w-4 h-4 text-[#003366]" />
                Current Expertise Areas
              </label>
              <div className="flex flex-wrap gap-3">
                {profile.expertise.map((skill, index) => (
                  <Badge 
                    key={index} 
                    variant="default" 
                    className="flex items-center gap-2 bg-blue-50 text-[#003366] border border-blue-200 px-3 py-2"
                  >
                    <Award className="w-3 h-3" />
                    {skill}
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => removeExpertise(index)}
                        className="ml-1 hover:text-red-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </Badge>
                ))}
                {profile.expertise.length === 0 && (
                  <div className="flex items-center gap-2 text-gray-500 text-sm bg-gray-50 px-4 py-2 rounded-lg">
                    <MapPin className="w-4 h-4" />
                    No expertise areas added yet
                  </div>
                )}
              </div>
            </div>
            
            {/* Add New Expertise - Only show when editing */}
            {isEditing && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-[#003366]" />
                  Add New Expertise Area
                </label>
                <div className="flex gap-3">
                  <Input
                    type="text"
                    value={newExpertise}
                    onChange={(e) => setNewExpertise(e.target.value)}
                    placeholder="Enter expertise area (e.g., Machine Learning)"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addExpertise())}
                    className="border-[#00509E] focus:border-[#003366]"
                  />
                  <Button
                    type="button"
                    onClick={addExpertise}
                    variant="outline"
                    className="flex items-center gap-2 border-[#00509E] text-[#003366] hover:bg-blue-50"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </Button>
                </div>
              </div>
            )}
            
            {!isEditing && (
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-4">
                <Shield className="w-3 h-3" />
                Click Edit Profile to modify expertise areas
              </p>
            )}
          </div>
        </Card>

        {/* Submit Section - Only show when editing */}
        {isEditing && (
          <div className="flex justify-center">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200 shadow-sm">
              <div className="flex items-center justify-between max-w-md mx-auto">
                <div className="flex items-center gap-3">
                  <div className="bg-[#003366] p-2 rounded-lg">
                    <Save className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Ready to save changes?</p>
                    <p className="text-sm text-gray-600">Your updates will be saved securely</p>
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-[#003366] hover:bg-[#00509E] text-white shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default EditProfileTab;
