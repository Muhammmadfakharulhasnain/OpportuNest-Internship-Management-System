import { useState, useEffect, useCallback } from 'react';
import { 
  UserCheck, 
  UserX, 
  Trash2,
  Edit,
  Mail,
  Shield,
  AlertCircle,
  X,
  Save,
  User,
  Users,
  Calendar,
  Building2,
  Send,
  Hash,
  MessageSquare,
  AlertTriangle,
  Info
} from 'lucide-react';
import DataTable from '../../components/ui/DataTable';
import { getUsers, getUserDetails, updateUserRole, updateUserStatus, deleteUser, markInactiveUsers, sendNotificationToUser, exportUsers } from '../../services/adminAPI';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    status: ''
  });

  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    role: '',
    status: '',
    department: '',
    semester: '',
    regNo: '',
    designation: '',
    companyName: '',
    industry: ''
  });

  // Notification form state
  const [notificationForm, setNotificationForm] = useState({
    userType: '', // student, company, supervisor, admin
    specificUsers: [], // selected specific users
    sendToAll: false, // send to all users of selected type
    subject: '',
    message: ''
  });



  // Handle escape key to close modal
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && showEditModal) {
        setShowEditModal(false);
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    
    // Prevent body scroll when modal is open
    if (showEditModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [showEditModal]);

  // Define table columns
  const columns = [
    {
      key: 'name',
      title: 'Name',
      render: (value, user) => (
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center mr-3">
            <span className="text-sm font-medium text-gray-700">
              {user.name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <div>
            <div className="font-medium text-gray-900">{user.name || 'N/A'}</div>
            <div className="text-sm text-gray-500">{user.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'role',
      title: 'Role',
      type: 'badge',
      badgeColors: {
        admin: 'bg-red-100 text-red-800',
        supervisor: 'bg-blue-100 text-blue-800',
        company: 'bg-green-100 text-green-800',
        student: 'bg-gray-100 text-gray-800'
      }
    },
    {
      key: 'status',
      title: 'Status',
      type: 'badge',
      badgeColors: {
        active: 'bg-green-100 text-green-800',
        inactive: 'bg-red-100 text-red-800',
        pending: 'bg-yellow-100 text-yellow-800'
      }
    },
    {
      key: 'lastLogin',
      title: 'Last Login',
      render: (value) => {
        if (!value) return <span className="text-gray-400 text-sm">Never</span>;
        const date = new Date(value);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        let textColor = 'text-gray-900';
        if (diffDays > 90) textColor = 'text-red-600';
        else if (diffDays > 30) textColor = 'text-yellow-600';
        else if (diffDays > 7) textColor = 'text-orange-600';
        
        return (
          <div>
            <div className={`text-sm font-medium ${textColor}`}>
              {date.toLocaleDateString()}
            </div>
            <div className="text-xs text-gray-500">
              {diffDays === 0 ? 'Today' : `${diffDays} days ago`}
            </div>
          </div>
        );
      }
    },
    {
      key: 'createdAt',
      title: 'Created',
      type: 'date'
    }
  ];

  // Define filter options
  const filterOptions = [
    {
      key: 'role',
      label: 'Role',
      options: [
        { value: 'admin', label: 'Admin' },
        { value: 'supervisor', label: 'Supervisor' },
        { value: 'company', label: 'Company' },
        { value: 'student', label: 'Student' }
      ]
    },
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'pending', label: 'Pending' }
      ]
    }
  ];

  // Define table actions
  const actions = [
    {
      label: 'Edit',
      icon: Edit,
      onClick: (user) => handleEditUser(user),
      className: 'text-blue-600 hover:text-blue-900'
    },
    {
      label: 'Toggle Status',
      icon: UserCheck,
      onClick: (user) => handleToggleStatus(user),
      className: 'text-green-600 hover:text-green-900'
    },
    {
      label: 'Delete',
      icon: Trash2,
      onClick: (user) => handleDeleteUser(user),
      className: 'text-red-600 hover:text-red-900'
    }
  ];

  // Fetch users data
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      };
      
      const response = await getUsers(params);
      setUsers(response.data.users || []);
      setPagination(prev => ({
        ...prev,
        total: response.data.total || 0,
        totalPages: response.data.totalPages || 0
      }));
      setError(null);
    } catch (err) {
      setError('Failed to load users');
      console.error('Users fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  // Handle search
  const handleSearch = (searchTerm) => {
    setFilters({ ...filters, search: searchTerm });
    setPagination({ ...pagination, page: 1 });
  };

  // Handle filter changes
  const handleFilter = (newFilters) => {
    setFilters({ ...filters, ...newFilters });
    setPagination({ ...pagination, page: 1 });
  };

  // Handle page changes
  const handlePageChange = (newPage) => {
    setPagination({ ...pagination, page: newPage });
  };

  // Handle limit changes
  const handleLimitChange = (newLimit) => {
    setPagination({ ...pagination, limit: newLimit, page: 1 });
  };

  // Handle edit user
  const handleEditUser = async (user) => {
    setSelectedUser(user);
    
    // If it's a company user, fetch detailed company profile
    if (user.role === 'company') {
      try {
        const response = await getUserDetails(user._id);
        const userWithProfile = response.data.user;
        
        setEditFormData({
          name: userWithProfile.name || '',
          email: userWithProfile.email || '',
          role: userWithProfile.role || '',
          status: userWithProfile.status || 'active',
          // Student specific fields
          department: userWithProfile.student?.department || '',
          semester: userWithProfile.student?.semester || '',
          regNo: userWithProfile.student?.regNo || '',
          // Supervisor specific fields
          designation: userWithProfile.supervisor?.designation || '',
          // Company specific fields from CompanyProfile
          companyName: userWithProfile.companyProfile?.companyName || '',
          industry: userWithProfile.companyProfile?.industry || ''
        });
        
        // Update selectedUser with full profile data
        setSelectedUser(userWithProfile);
      } catch (error) {
        console.error('Error fetching user details:', error);
        // Fallback to basic user data
        setEditFormData({
          name: user.name || '',
          email: user.email || '',
          role: user.role || '',
          status: user.status || 'active',
          department: user.student?.department || '',
          semester: user.student?.semester || '',
          regNo: user.student?.regNo || '',
          designation: user.supervisor?.designation || '',
          companyName: '',
          industry: ''
        });
      }
    } else {
      // For non-company users, use existing data
      setEditFormData({
        name: user.name || '',
        email: user.email || '',
        role: user.role || '',
        status: user.status || 'active',
        // Student specific fields
        department: user.student?.department || '',
        semester: user.student?.semester || '',
        regNo: user.student?.regNo || '',
        // Supervisor specific fields
        designation: user.supervisor?.designation || '',
        // Company specific fields
        companyName: '',
        industry: ''
      });
    }
    
    setShowEditModal(true);
  };

  // Handle form input changes
  const handleFormChange = (field, value) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle save user changes
  const handleSaveUser = async () => {
    try {
      const updateData = {
        name: editFormData.name,
        role: editFormData.role,
        status: editFormData.status
      };

      // Add role-specific data
      if (editFormData.role === 'student') {
        updateData.student = {
          department: editFormData.department,
          semester: editFormData.semester,
          regNo: editFormData.regNo
        };
      } else if (editFormData.role === 'supervisor') {
        updateData.supervisor = {
          department: editFormData.department,
          designation: editFormData.designation
        };
      } else if (editFormData.role === 'company') {
        updateData.companyProfile = {
          companyName: editFormData.companyName,
          industry: editFormData.industry
        };
      }

      await updateUserRole(selectedUser._id, updateData);
      setShowEditModal(false);
      fetchUsers(); // Refresh data
      alert('User updated successfully!');
    } catch (err) {
      console.error('Error updating user:', err);
      alert('Failed to update user');
    }
  };

  // Handle toggle user status
  const handleToggleStatus = async (user) => {
    if (user.role === 'admin') {
      alert('Cannot change admin user status');
      return;
    }

    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    const actionText = newStatus === 'active' ? 'activate' : 'deactivate';
    
    if (confirm(`Are you sure you want to ${actionText} ${user.name}?`)) {
      try {
        await updateUserStatus(user._id, newStatus);
        fetchUsers(); // Refresh data
        alert(`User ${actionText}d successfully!`);
      } catch (err) {
        console.error('Error updating user status:', err);
        alert('Failed to update user status');
      }
    }
  };

  // Handle delete user
  const handleDeleteUser = async (user) => {
    if (user.role === 'admin') {
      alert('Cannot delete admin users');
      return;
    }

    const confirmMessage = `⚠️ WARNING: This action cannot be undone!\n\nAre you sure you want to permanently delete "${user.name}"?\n\nThis will remove:\n• User account and profile\n• All associated data\n• Any applications or submissions\n\nType "DELETE" to confirm:`;
    
    const userInput = prompt(confirmMessage);
    
    if (userInput === 'DELETE') {
      try {
        await deleteUser(user._id);
        fetchUsers(); // Refresh data
        alert('User deleted successfully!');
      } catch (err) {
        console.error('Error deleting user:', err);
        alert('Failed to delete user: ' + (err.response?.data?.message || err.message));
      }
    } else if (userInput !== null) {
      alert('Deletion cancelled. You must type "DELETE" exactly to confirm.');
    }
  };

  // Handle mark inactive users
  const handleMarkInactiveUsers = async () => {
    const days = prompt('Mark users as inactive who haven\'t logged in for how many days?\n\nEnter number of days (default: 90):', '90');
    
    if (days === null) return; // User cancelled
    
    const dayNumber = parseInt(days);
    if (isNaN(dayNumber) || dayNumber < 1 || dayNumber > 365) {
      alert('Please enter a valid number between 1 and 365');
      return;
    }
    
    if (confirm(`⚠️ This will mark users as INACTIVE who haven't logged in for ${dayNumber} days.\n\nInactive users cannot login until reactivated.\n\nContinue?`)) {
      try {
        const response = await markInactiveUsers(dayNumber);
        
        if (response.success) {
          alert(`✅ Successfully marked ${response.data.affectedUsers} users as inactive`);
          fetchUsers(); // Refresh the table
        } else {
          alert('Failed to mark users as inactive: ' + response.message);
        }
      } catch (err) {
        console.error('Error marking inactive users:', err);
        alert('Failed to mark inactive users: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  // Handle send notification
  const handleSendNotification = async () => {
    // If called without form data, open the modal
    if (!notificationForm.userType || !notificationForm.subject || !notificationForm.message) {
      setShowNotificationModal(true);
      return;
    }

    // Validate that user has selected recipients
    if (!notificationForm.sendToAll && notificationForm.specificUsers.length === 0) {
      alert('Please select specific users or choose "Send to All"');
      return;
    }

    // Otherwise, send the notification
    try {
      const response = await sendNotificationToUser({
        recipients: notificationForm.sendToAll ? notificationForm.userType + 's' : 'specific',
        specificUserIds: notificationForm.sendToAll ? undefined : notificationForm.specificUsers,
        userType: notificationForm.userType,
        subject: notificationForm.subject,
        message: notificationForm.message
      });

      if (response.success) {
        alert('✅ Notification sent successfully!');
        setShowNotificationModal(false);
        setNotificationForm({
          userType: '',
          specificUsers: [],
          sendToAll: false,
          subject: '',
          message: ''
        });
      } else {
        alert('Failed to send notification: ' + response.message);
      }
    } catch (err) {
      console.error('Error sending notification:', err);
      alert('Failed to send notification: ' + (err.response?.data?.message || err.message));
    }
  };



  // Handle export
  const handleExport = async () => {
    try {
      const format = prompt('Export format (csv/excel):', 'csv');
      if (!format) return;

      const response = await exportUsers(format.toLowerCase(), filters);
      
      if (format.toLowerCase() === 'csv') {
        // Handle CSV blob response
        const url = window.URL.createObjectURL(new Blob([response]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `users-export-${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } else if (format.toLowerCase() === 'excel') {
        // Handle Excel JSON response (convert to downloadable file)
        const jsonStr = JSON.stringify(response.data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `users-export-${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      }
      
      alert('✅ Users exported successfully!');
    } catch (err) {
      console.error('Error exporting users:', err);
      alert('Failed to export users: ' + (err.response?.data?.message || err.message));
    }
  };

  // Get recipient count for notification modal
  const getRecipientCount = (userType, sendToAll, specificUsers) => {
    if (!userType || !users.length) return '0 users';
    
    if (sendToAll) {
      const filteredUsers = getUsersByType(userType);
      return `${filteredUsers.length} ${userType}${filteredUsers.length !== 1 ? 's' : ''}`;
    } else {
      return `${specificUsers.length} selected user${specificUsers.length !== 1 ? 's' : ''}`;
    }
  };

  // Get users by type for cascading dropdown
  const getUsersByType = (userType) => {
    if (!userType) return [];
    return users.filter(user => user.role === userType);
  };

  // Handle user type change in notification modal
  const handleUserTypeChange = (userType) => {
    setNotificationForm(prev => ({
      ...prev,
      userType,
      specificUsers: [],
      sendToAll: false
    }));
  };

  // Handle specific user selection
  const handleSpecificUserChange = (userId, isChecked) => {
    setNotificationForm(prev => ({
      ...prev,
      specificUsers: isChecked 
        ? [...prev.specificUsers, userId]
        : prev.specificUsers.filter(id => id !== userId)
    }));
  };

  // Fetch data on component mount and when dependencies change
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">
            Manage user accounts, roles, and permissions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleMarkInactiveUsers}
            className="inline-flex items-center px-4 py-2 border border-orange-300 rounded-md shadow-sm text-sm font-medium text-orange-700 bg-orange-50 hover:bg-orange-100"
          >
            <UserX className="h-4 w-4 mr-2" />
            Mark Inactive Users
          </button>
          <button 
            onClick={handleSendNotification}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Mail className="h-4 w-4 mr-2" />
            Send Notification
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
            <Shield className="h-4 w-4 mr-2" />
            Manage Roles
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <UserCheck className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <UserX className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Inactive</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.status === 'inactive').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <DataTable
        data={users}
        columns={columns}
        loading={loading}
        error={error}
        pagination={pagination}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
        onSearch={handleSearch}
        onFilter={handleFilter}
        onRefresh={fetchUsers}
        onExport={handleExport}
        searchable={true}
        filterable={true}
        exportable={true}
        refreshable={true}
        filters={filterOptions}
        activeFilters={filters}
        actions={actions}
      />

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm overflow-y-auto"
          onClick={() => setShowEditModal(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl transform transition-all duration-300 scale-100 my-8 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-2xl">
              <button
                onClick={() => setShowEditModal(false)}
                className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors duration-200 p-1 rounded-full hover:bg-white hover:bg-opacity-20"
              >
                <X className="h-6 w-6" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                  <Edit className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Edit User Details</h3>
                  <p className="text-indigo-100">Modify user information and permissions</p>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                    <User className="h-5 w-5 mr-2 text-indigo-600" />
                    Basic Information
                  </h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={editFormData.name}
                      onChange={(e) => handleFormChange('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      value={editFormData.email}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                      placeholder="Email cannot be changed"
                    />
                    <p className="text-xs text-gray-500 mt-1">Email address cannot be modified</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                    <select
                      value={editFormData.role}
                      onChange={(e) => handleFormChange('role', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="student">Student</option>
                      <option value="supervisor">Supervisor</option>
                      <option value="company">Company</option>
                      {selectedUser.role === 'admin' && <option value="admin">Admin</option>}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={editFormData.status}
                      onChange={(e) => handleFormChange('status', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                </div>

                {/* Role-Specific Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Building2 className="h-5 w-5 mr-2 text-purple-600" />
                    Role-Specific Details
                  </h4>

                  {editFormData.role === 'student' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                        <input
                          type="text"
                          value={editFormData.department}
                          onChange={(e) => handleFormChange('department', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="e.g., Computer Science"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Semester</label>
                        <input
                          type="text"
                          value={editFormData.semester}
                          onChange={(e) => handleFormChange('semester', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="e.g., 8th"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Registration Number</label>
                        <input
                          type="text"
                          value={editFormData.regNo}
                          onChange={(e) => handleFormChange('regNo', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="e.g., SP21-BCS-001"
                        />
                      </div>
                    </>
                  )}

                  {editFormData.role === 'supervisor' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                        <input
                          type="text"
                          value={editFormData.department}
                          onChange={(e) => handleFormChange('department', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="e.g., Computer Science"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Designation</label>
                        <input
                          type="text"
                          value={editFormData.designation}
                          onChange={(e) => handleFormChange('designation', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="e.g., Assistant Professor"
                        />
                      </div>
                    </>
                  )}

                  {editFormData.role === 'company' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Company Name
                          <span className="text-xs text-gray-500 ml-1">(from Step 3 registration)</span>
                        </label>
                        <input
                          type="text"
                          value={editFormData.companyName}
                          onChange={(e) => handleFormChange('companyName', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="Enter company name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Industry
                          <span className="text-xs text-gray-500 ml-1">(from Step 3 registration)</span>
                        </label>
                        <input
                          type="text"
                          value={editFormData.industry}
                          onChange={(e) => handleFormChange('industry', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="e.g., Information Technology"
                        />
                      </div>
                    </>
                  )}

                  {(editFormData.role === 'admin') && (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-sm text-amber-800">
                        <strong>Admin User:</strong> Limited modifications available for security reasons.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* User Stats */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-gray-600" />
                  Account Information
                </h5>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Created:</span>
                    <span className="ml-2 font-medium">
                      {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Last Login:</span>
                    <span className="ml-2 font-medium">
                      {selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleDateString() : 'Never'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Email Verified:</span>
                    <span className={`ml-2 font-medium ${selectedUser.isVerified ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedUser.isVerified ? '✓ Verified' : '✗ Not Verified'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">User ID:</span>
                    <span className="ml-2 font-mono text-xs">{selectedUser._id}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 p-6 bg-gray-50 rounded-b-2xl border-t">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveUser}
                className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:from-indigo-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Notification Modal */}
      {showNotificationModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm overflow-y-auto"
          onClick={() => setShowNotificationModal(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl transform transition-all duration-300 scale-100 my-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-2xl">
              <button
                onClick={() => setShowNotificationModal(false)}
                className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors duration-200 p-1 rounded-full hover:bg-white hover:bg-opacity-20"
              >
                <X className="h-6 w-6" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                  <Send className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Send Notification</h3>
                  <p className="text-blue-100">Send an email notification to selected users</p>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Step 1: User Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="h-4 w-4 inline mr-2" />
                  1. Select User Type
                </label>
                <select
                  value={notificationForm.userType}
                  onChange={(e) => handleUserTypeChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Choose user type...</option>
                  <option value="student">Students</option>
                  <option value="company">Companies</option>
                  <option value="supervisor">Supervisors</option>
                  <option value="admin">Admins</option>
                </select>
              </div>

              {/* Step 2: Send to All or Select Specific Users */}
              {notificationForm.userType && (
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">
                    <MessageSquare className="h-4 w-4 inline mr-2" />
                    2. Choose Recipients
                  </label>
                  
                  {/* Send to All Toggle */}
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="sendToAll"
                      checked={notificationForm.sendToAll}
                      onChange={(e) => setNotificationForm(prev => ({
                        ...prev,
                        sendToAll: e.target.checked,
                        specificUsers: e.target.checked ? [] : prev.specificUsers
                      }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="sendToAll" className="text-sm font-medium text-gray-700">
                      Send to all {notificationForm.userType}s ({getUsersByType(notificationForm.userType).length} users)
                    </label>
                  </div>

                  {/* Specific Users Selection */}
                  {!notificationForm.sendToAll && (
                    <div className="border border-gray-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                      <p className="text-sm text-gray-600 mb-3">Select specific {notificationForm.userType}s:</p>
                      <div className="space-y-2">
                        {getUsersByType(notificationForm.userType).map(user => (
                          <div key={user._id} className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              id={`user-${user._id}`}
                              checked={notificationForm.specificUsers.includes(user._id)}
                              onChange={(e) => handleSpecificUserChange(user._id, e.target.checked)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor={`user-${user._id}`} className="flex-1 text-sm">
                              <span className="font-medium">{user.name || 'No Name'}</span>
                              <span className="text-gray-500 ml-2">({user.email})</span>
                            </label>
                          </div>
                        ))}
                        {getUsersByType(notificationForm.userType).length === 0 && (
                          <p className="text-sm text-gray-500 italic">No {notificationForm.userType}s found</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Hash className="h-4 w-4 inline mr-2" />
                  3. Subject
                </label>
                <input
                  type="text"
                  value={notificationForm.subject}
                  onChange={(e) => setNotificationForm(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter notification subject"
                  required
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Edit className="h-4 w-4 inline mr-2" />
                  4. Message
                </label>
                <textarea
                  value={notificationForm.message}
                  onChange={(e) => setNotificationForm(prev => ({ ...prev, message: e.target.value }))}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  placeholder="Enter your notification message..."
                  required
                />
              </div>

              {/* Warning Message */}
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">Important Notice</p>
                    <p className="text-sm text-amber-700 mt-1">
                      This notification will be sent via email to all selected users. 
                      Please review the content carefully before sending as this action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>

              {/* Recipient Count Info */}
              {notificationForm.userType && (notificationForm.sendToAll || notificationForm.specificUsers.length > 0) && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <Info className="h-4 w-4 inline mr-2" />
                    This notification will be sent to: <strong>{getRecipientCount(notificationForm.userType, notificationForm.sendToAll, notificationForm.specificUsers)}</strong>
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 p-6 bg-gray-50 rounded-b-2xl border-t">
              <button
                onClick={() => setShowNotificationModal(false)}
                className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSendNotification}
                disabled={
                  !notificationForm.userType || 
                  !notificationForm.subject || 
                  !notificationForm.message ||
                  (!notificationForm.sendToAll && notificationForm.specificUsers.length === 0)
                }
                className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <Send className="h-4 w-4 mr-2" />
                Send Notification
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;