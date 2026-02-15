import { useState, useEffect, useCallback } from 'react';
import { 
  Save, Edit, Download, X, 
  FileText, Award, TrendingUp, Users, GraduationCap,
  Camera, AlertCircle, Plus, Edit3
} from 'lucide-react';
import { studentAPI } from '../../../services/api';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';
import Card from '../../../ui/Card';
import Button from '../../../ui/Button';
import Input from '../../../ui/Input';
import Badge from '../../../ui/Badge';
import CVBuilder from './CVBuilder';

const ProfileTab = () => {
  const { currentUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [showCVBuilder, setShowCVBuilder] = useState(false);
  const [formData, setFormData] = useState({
    cgpa: '',
    phoneNumber: '',
    rollNumber: '',
    attendance: '',
    backlogs: '',
    codeOfConduct: false
  });
  const [files, setFiles] = useState({
    profilePicture: null,
    cv: null,
    certificates: []
  });
  const [filePreviews, setFilePreviews] = useState({
    profilePicture: null,
    cv: null,
    certificates: []
  });

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      const response = await studentAPI.getProfile();
      
      if (response.success) {
        setProfileData(response.data);
        setFormData({
          cgpa: response.data.cgpa || '',
          phoneNumber: response.data.phoneNumber || '',
          rollNumber: response.data.rollNumber || '',
          attendance: response.data.attendance || '',
          backlogs: response.data.backlogs || '',
          codeOfConduct: response.data.codeOfConduct || false
        });
      } else {
        toast.error('Failed to load profile');
      }
    } catch (error) {
      // Handle 404 error specifically (student profile not found)
      if (error.message === 'Student not found' || error.message.includes('404')) {
        console.log('👤 Student profile not found - this is normal for new users');
        // Initialize with empty profile data for new students
        setProfileData({
          profileCompletion: 0,
          name: currentUser?.name || '',
          email: currentUser?.email || '',
          department: currentUser?.department || '',
          semester: currentUser?.semester || ''
        });
        setFormData({
          cgpa: '',
          phoneNumber: '',
          rollNumber: '',
          attendance: '',
          backlogs: '',
          codeOfConduct: false
        });
        toast('Complete your profile to get started!', { 
          icon: 'ℹ️',
          style: {
            background: '#3b82f6',
            color: 'white',
          }
        });
      } else {
        console.error('Error loading profile:', error);
        toast.error('Failed to load profile: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (field, selectedFiles) => {
    if (field === 'certificates') {
      const fileArray = Array.from(selectedFiles);
      setFiles(prev => ({
        ...prev,
        [field]: fileArray
      }));
      
      // Create previews for certificates
      const previews = fileArray.map(file => ({
        name: file.name,
        size: file.size,
        type: file.type
      }));
      setFilePreviews(prev => ({
        ...prev,
        [field]: previews
      }));
    } else {
      const file = selectedFiles[0];
      setFiles(prev => ({
        ...prev,
        [field]: file
      }));
      
      // Create preview for profile picture
      if (field === 'profilePicture' && file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setFilePreviews(prev => ({
            ...prev,
            [field]: e.target.result
          }));
        };
        reader.readAsDataURL(file);
      } else if (field === 'cv' && file) {
        setFilePreviews(prev => ({
          ...prev,
          [field]: {
            name: file.name,
            size: file.size,
            type: file.type
          }
        }));
      }
    }
  };

  const removeFile = (field, index = null) => {
    if (field === 'certificates' && index !== null) {
      setFiles(prev => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index)
      }));
      setFilePreviews(prev => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index)
      }));
    } else {
      setFiles(prev => ({
        ...prev,
        [field]: null
      }));
      setFilePreviews(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Create FormData for file uploads
      const formDataToSend = new FormData();
      
      // Add text fields
      Object.keys(formData).forEach(key => {
        if (formData[key] !== '') {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      // Add files
      if (files.profilePicture) {
        formDataToSend.append('profilePicture', files.profilePicture);
      }
      if (files.cv) {
        formDataToSend.append('cv', files.cv);
      }
      if (files.certificates.length > 0) {
        files.certificates.forEach(file => {
          formDataToSend.append('certificates', file);
        });
      }
      
      const response = await studentAPI.updateProfile(formDataToSend);
      
      if (response.success) {
        setProfileData(response.data);
        setEditing(false);
        setFiles({ profilePicture: null, cv: null, certificates: [] });
        setFilePreviews({ profilePicture: null, cv: null, certificates: [] });
        toast.success('Profile updated successfully!');
      } else {
        toast.error(response.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      cgpa: profileData?.cgpa || '',
      phoneNumber: profileData?.phoneNumber || '',
      rollNumber: profileData?.rollNumber || '',
      attendance: profileData?.attendance || '',
      backlogs: profileData?.backlogs || ''
    });
    setFiles({ profilePicture: null, cv: null, certificates: [] });
    setFilePreviews({ profilePicture: null, cv: null, certificates: [] });
    setEditing(false);
  };

  const deleteCertificate = async (certificateId) => {
    try {
      const response = await studentAPI.deleteCertificate(certificateId);
      if (response.success) {
        toast.success('Certificate deleted successfully');
        loadProfile(); // Reload profile to reflect changes
      } else {
        toast.error('Failed to delete certificate');
      }
    } catch (error) {
      console.error('Error deleting certificate:', error);
      toast.error('Failed to delete certificate');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getCompletionColor = (percentage) => {
    if (percentage >= 80) return 'success';
    if (percentage >= 50) return 'warning';
    return 'danger';
  };

  // Render CV Builder if showCVBuilder is true
  if (showCVBuilder) {
    return (
      <CVBuilder 
        onBack={() => setShowCVBuilder(false)}
        profileData={profileData}
      />
    );
  }

  if (loading && !profileData) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003366]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Enhanced Header Section - COMSATS Design */}
      <div className="relative bg-gradient-to-r from-[#003366] via-[#00509E] to-[#003366] rounded-lg p-5 text-white shadow-md overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-white/10 rounded-lg shadow-sm">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-1 text-white">
                  Student Profile
                </h1>
                <p className="text-blue-100 text-sm font-medium">
                  Manage your academic profile and personal information
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setShowCVBuilder(true)}
                className="bg-white/10 border-white/30 text-white hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-all duration-300 font-semibold px-4 py-2"
              >
                <FileText className="w-4 h-4 mr-2" />
                CV Builder
              </Button>
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-blue-200 text-xs font-medium">Profile Status</p>
                <div className="flex items-center gap-1 mt-1">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-white font-bold text-sm">Active</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Quick Stats - COMSATS Compact */}
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center gap-1 mb-0.5">
                <Award className="w-3 h-3 text-blue-200" />
                <span className="text-blue-200 text-xs font-medium">Completion</span>
              </div>
              <p className="text-white font-bold text-sm">
                {profileData?.profileCompletionPercentage || 0}%
              </p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center gap-1 mb-0.5">
                <TrendingUp className="w-3 h-3 text-blue-200" />
                <span className="text-blue-200 text-xs font-medium">CGPA</span>
              </div>
              <p className="text-white font-bold text-sm">
                {formData.cgpa || 'N/A'}
              </p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center gap-1 mb-0.5">
                <GraduationCap className="w-3 h-3 text-blue-200" />
                <span className="text-blue-200 text-xs font-medium">Semester</span>
              </div>
              <p className="text-white font-bold text-sm">
                {profileData?.semester || 'N/A'}
              </p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center gap-1 mb-0.5">
                <FileText className="w-3 h-3 text-blue-200" />
                <span className="text-blue-200 text-xs font-medium">Documents</span>
              </div>
              <p className="text-white font-bold text-sm">
                {(profileData?.cvUrl ? 1 : 0) + (profileData?.certificates?.length || 0)}
              </p>
            </div>
          </div>
        </div>
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full transform translate-x-16 -translate-y-16"></div>
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-white rounded-full transform -translate-x-10 translate-y-10"></div>
        </div>
      </div>

      {/* Profile Header */}
      <Card className="p-6">
        <div className="flex items-center space-x-6">
          <div className="relative">
            {profileData?.profilePictureUrl ? (
              <img
                src={profileData.profilePictureUrl}
                alt={profileData?.fullName || 'Student'}
                className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-200 border-4 border-gray-300 flex items-center justify-center">
                <Camera className="w-8 h-8 text-gray-400" />
              </div>
            )}
            {editing && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                <Camera className="w-6 h-6 text-white" />
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">
              {profileData?.fullName || 'Student Name'}
            </h2>
            <p className="text-gray-600">{profileData?.email}</p>
            <p className="text-gray-600">
              {profileData?.department} • {profileData?.semester} Semester
            </p>
            {profileData?.rollNumber && (
              <p className="text-sm text-gray-500">Roll No: {profileData.rollNumber}</p>
            )}
          </div>
          
          <div className="flex flex-col items-end space-y-2">
            <div className="text-right">
              <div className="text-sm text-gray-500">Profile Completion</div>
              <Badge variant={getCompletionColor(profileData?.profileCompletionPercentage || 0)}>
                {profileData?.profileCompletionPercentage || 0}%
              </Badge>
            </div>
            
            <div className="flex space-x-2">
              <div className="flex space-x-2">
                {!editing ? (
                  <>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowCVBuilder(true)} 
                      disabled={loading}
                      className="bg-white border-[#003366] text-[#003366] hover:bg-blue-600 hover:border-blue-600 hover:text-white"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      CV Builder
                    </Button>
                    <Button onClick={() => setEditing(true)} disabled={loading} className="bg-[#003366] hover:bg-[#00509E] text-white">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" onClick={handleCancel} disabled={loading}>
                      Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={loading} className="bg-[#003366] hover:bg-[#00509E] text-white">
                      <Save className="w-4 h-4 mr-2" />
                      {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Fixed Information (Non-editable) */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2 text-[#003366]" />
          Registration Information (Non-editable)
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-md text-gray-800">
              {profileData?.fullName || 'Not set'}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-md text-gray-800">
              {profileData?.email || 'Not set'}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-md text-gray-800">
              {profileData?.department || 'Not set'}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-md text-gray-800">
              {profileData?.semester || 'Not set'}
            </div>
          </div>
        </div>
      </Card>

      {/* Profile Picture Upload */}
      {editing && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Camera className="w-5 h-5 mr-2 text-[#00509E]" />
            Profile Picture
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Profile Picture (JPEG, PNG, GIF - Max 5MB)
              </label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/gif"
                onChange={(e) => handleFileChange('profilePicture', e.target.files)}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            
            {filePreviews.profilePicture && (
              <div className="flex items-center space-x-4">
                <img
                  src={filePreviews.profilePicture}
                  alt="Profile preview"
                  className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeFile('profilePicture')}
                >
                  <X className="w-4 h-4 mr-1" />
                  Remove
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Editable Academic Information */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <GraduationCap className="w-5 h-5 mr-2 text-[#003366]" />
          Academic Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Current CGPA (0.0 - 4.0)"
            type="number"
            step="0.01"
            min="0"
            max="4"
            value={formData.cgpa}
            onChange={(e) => handleInputChange('cgpa', e.target.value)}
            disabled={!editing}
            placeholder="e.g., 3.75"
          />
          
          <Input
            label="Phone Number"
            type="tel"
            value={formData.phoneNumber}
            onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
            disabled={!editing}
            placeholder="e.g., +923001234567"
          />
          
          <Input
            label="Roll Number"
            type="text"
            value={formData.rollNumber}
            onChange={(e) => handleInputChange('rollNumber', e.target.value)}
            disabled={!editing}
            placeholder="e.g., CS-2020-123"
          />
          
          <Input
            label="Attendance (%)"
            type="number"
            min="0"
            max="100"
            value={formData.attendance}
            onChange={(e) => handleInputChange('attendance', e.target.value)}
            disabled={!editing}
            placeholder="e.g., 85"
          />
          
          <Input
            label="Backlogs"
            type="number"
            min="0"
            value={formData.backlogs}
            onChange={(e) => handleInputChange('backlogs', e.target.value)}
            disabled={!editing}
            placeholder="e.g., 0"
          />
        </div>
      </Card>

      {/* Code of Conduct */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <FileText className="w-5 h-5 mr-2 text-[#00509E]" />
          Code of Conduct
        </h3>
        
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Internship Code of Conduct</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Maintain professional behavior at all times</li>
              <li>• Submit all reports on time</li>
              <li>• Follow company policies and procedures</li>
              <li>• Represent COMSATS University positively</li>
              <li>• Complete the full internship duration</li>
              <li>• Respect confidentiality and intellectual property</li>
              <li>• Communicate regularly with your supervisor</li>
            </ul>
          </div>
          
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="codeOfConduct"
              checked={formData.codeOfConduct}
              onChange={(e) => handleInputChange('codeOfConduct', e.target.checked)}
              disabled={!editing}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="codeOfConduct" className="text-sm text-gray-700">
              I have read and agree to abide by the internship code of conduct
            </label>
          </div>
          
          {profileData?.codeOfConduct && (
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-sm text-green-800 font-medium">
                ✅ Code of Conduct acknowledged
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* CV Upload */}
      {editing && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-[#003366]" />
            CV / Resume
          </h3>
          
          <div className="space-y-6">
            {/* CV Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Upload CV Option */}
              <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors">
                <div className="text-center">
                  <FileText className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <h4 className="font-medium text-gray-900 mb-2">Upload CV</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Upload your existing CV file
                  </p>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => handleFileChange('cv', e.target.files)}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    PDF, DOC, DOCX - Max 10MB
                  </p>
                </div>
              </div>

              {/* Build CV Option */}
              <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 transition-colors">
                <div className="text-center">
                  <Edit3 className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <h4 className="font-medium text-gray-900 mb-2">Build CV</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Create your CV using our builder
                  </p>
                  <Button
                    onClick={() => setShowCVBuilder(true)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Start Building
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">
                    Professional CV templates
                  </p>
                </div>
              </div>
            </div>
            
            {filePreviews.cv && (
              <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="w-6 h-6 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{filePreviews.cv.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(filePreviews.cv.size)}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeFile('cv')}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Current CV Display */}
      {profileData?.cv && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-[#00509E]" />
            Current CV
          </h3>
          
          <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <FileText className="w-8 h-8 text-[#003366]" />
              <div>
                <p className="font-medium text-gray-900">{profileData.cv.originalName}</p>
                <p className="text-sm text-gray-500">
                  {formatFileSize(profileData.cv.size)} • 
                  Uploaded {new Date(profileData.cv.uploadedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(profileData.cv.url, '_blank')}
              className="border-[#003366] text-[#003366] hover:bg-[#003366] hover:text-white"
            >
              <Download className="w-4 h-4 mr-1" />
              Download
            </Button>
          </div>
        </Card>
      )}

      {/* Certificates Upload */}
      {editing && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Award className="w-5 h-5 mr-2 text-[#00509E]" />
            Certificates
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Certificates (PDF, DOC, DOCX, Images - Max 10MB each, Max 5 files)
              </label>
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,image/jpeg,image/png"
                onChange={(e) => handleFileChange('certificates', e.target.files)}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-[#003366] hover:file:bg-blue-100"
              />
            </div>
            
            {filePreviews.certificates.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Selected certificates:</p>
                {filePreviews.certificates.map((cert, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Award className="w-5 h-5 text-[#00509E]" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{cert.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(cert.size)}</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeFile('certificates', index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Current Certificates Display */}
      {profileData?.certificates && profileData.certificates.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Award className="w-5 h-5 mr-2 text-[#00509E]" />
            Current Certificates
          </h3>
          
          <div className="space-y-3">
            {profileData.certificates.map((cert, index) => (
              <div key={cert._id || index} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Award className="w-6 h-6 text-[#00509E]" />
                  <div>
                    <p className="font-medium text-gray-900">{cert.originalName}</p>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(cert.size)} • 
                      Uploaded {new Date(cert.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(cert.url, '_blank')}
                    className="border-[#003366] text-[#003366] hover:bg-[#003366] hover:text-white"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  {editing && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => deleteCertificate(cert._id)}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Academic Performance Summary */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-[#003366]" />
          Academic Performance Summary
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-[#003366]">
              {profileData?.cgpa || '-'}
            </div>
            <div className="text-sm text-gray-700">Current CGPA</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-[#00509E]">
              {profileData?.attendance ? `${profileData.attendance}%` : '-'}
            </div>
            <div className="text-sm text-gray-700">Attendance</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-700">
              {profileData?.backlogs || 0}
            </div>
            <div className="text-sm text-gray-700">Backlogs</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-[#00509E]">
              {profileData?.profileCompletionPercentage || 0}%
            </div>
            <div className="text-sm text-gray-700">Profile Complete</div>
          </div>
        </div>
      </Card>

      {/* Profile Completion Tips */}
      {profileData && profileData.profileCompletionPercentage < 100 && (
        <Card className="p-6 border-blue-200 bg-blue-50">
          <h3 className="text-lg font-semibold text-[#003366] mb-4 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 text-[#00509E]" />
            Complete Your Profile
          </h3>
          
          <div className="space-y-2 text-sm text-[#003366]">
            {!profileData.profilePicture && (
              <p>• Add a profile picture to help employers recognize you</p>
            )}
            {!profileData.cgpa && (
              <p>• Add your CGPA to showcase your academic performance</p>
            )}
            {!profileData.phoneNumber && (
              <p>• Add your phone number for easy contact</p>
            )}
            {!profileData.rollNumber && (
              <p>• Add your roll number for identification</p>
            )}
            {!profileData.attendance && (
              <p>• Add your attendance percentage</p>
            )}
            {(!profileData.cv || !profileData.cv.filename) && (
              <p>• Upload your CV/Resume to apply for internships</p>
            )}
            {(!profileData.certificates || profileData.certificates.length === 0) && (
              <p>• Upload certificates to highlight your achievements</p>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default ProfileTab;