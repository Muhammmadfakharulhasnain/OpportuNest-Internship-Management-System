import { useState, useEffect, useCallback } from 'react';
import { 
  Building2, 
  CheckCircle, 
  XCircle, 
  Clock,
  Eye,
  Mail,
  AlertCircle,
  Users,
  X,
  ExternalLink
} from 'lucide-react';
import DataTable from '../../components/ui/DataTable';
import { getCompanies, updateCompanyStatus } from '../../services/adminAPI';

const AdminCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });
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
    status: '',
    type: ''
  });

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && showModal) {
        setShowModal(false);
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    
    // Prevent body scroll when modal is open
    if (showModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [showModal]);

  // Define table columns
  const columns = [
    {
      key: 'companyName',
      title: 'Company',
      render: (value, company) => (
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center mr-3">
            <Building2 className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{company.companyName || 'N/A'}</div>
            <div className="text-sm text-gray-500">{company.industry}</div>
          </div>
        </div>
      )
    },
    {
      key: 'contactEmail',
      title: 'Contact',
      render: (value, company) => (
        <div>
          <div className="text-sm text-gray-900">{company.contactPerson?.name || company.user?.name || 'N/A'}</div>
          <div className="text-sm text-gray-500">{company.companyEmail || company.user?.email}</div>
          <div className="text-sm text-gray-500">{company.companyPhone || company.contactPerson?.phone}</div>
        </div>
      )
    },
    {
      key: 'status',
      title: 'Status',
      type: 'badge',
      render: (value, company) => {
        // Map isVerified to status if status doesn't exist
        const status = company.status || (company.isVerified ? 'approved' : 'pending');
        const badgeColors = {
          approved: 'bg-green-100 text-green-800',
          pending: 'bg-yellow-100 text-yellow-800',
          rejected: 'bg-red-100 text-red-800'
        };
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${badgeColors[status]}`}>
            {status}
          </span>
        );
      }
    },
    {
      key: 'createdAt',
      title: 'Applied',
      type: 'date'
    }
  ];

  // Define filter options
  const filterOptions = [
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: 'pending', label: 'Pending' },
        { value: 'approved', label: 'Approved' },
        { value: 'rejected', label: 'Rejected' }
      ]
    },
    {
      key: 'type',
      label: 'Company Type',
      options: [
        { value: 'startup', label: 'Startup' },
        { value: 'corporation', label: 'Corporation' },
        { value: 'nonprofit', label: 'Non-Profit' },
        { value: 'government', label: 'Government' }
      ]
    }
  ];

  // Define table actions
  const actions = [
    {
      label: 'View',
      icon: Eye,
      onClick: (company) => handleViewCompany(company),
      className: 'text-blue-600 hover:text-blue-900'
    },
    {
      label: 'Approve',
      icon: CheckCircle,
      onClick: (company) => handleApproveCompany(company),
      className: 'text-green-600 hover:text-green-900'
    },
    {
      label: 'Reject',
      icon: XCircle,
      onClick: (company) => handleRejectCompany(company),
      className: 'text-red-600 hover:text-red-900'
    }
  ];

  // Fetch companies data
  const fetchCompanies = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      };
      
      const response = await getCompanies(params);
      console.log('📊 Companies response:', response);
      
      setCompanies(response.data.companies || []);
      setPagination(prev => ({
        ...prev,
        total: response.data.pagination?.total || 0,
        totalPages: response.data.pagination?.pages || 0
      }));
      setError(null);
    } catch (err) {
      setError('Failed to load companies');
      console.error('Companies fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  // Fetch company statistics
  const fetchCompanyStats = useCallback(async () => {
    try {
      // Fetch all companies to calculate stats
      const [allResponse, pendingResponse, approvedResponse, rejectedResponse] = await Promise.all([
        getCompanies({ limit: 1000 }), // Get a large number to get all
        getCompanies({ status: 'pending', limit: 1000 }),
        getCompanies({ status: 'approved', limit: 1000 }),
        getCompanies({ status: 'rejected', limit: 1000 })
      ]);

      setStats({
        total: allResponse.data.pagination?.total || 0,
        pending: pendingResponse.data.pagination?.total || 0,
        approved: approvedResponse.data.pagination?.total || 0,
        rejected: rejectedResponse.data.pagination?.total || 0
      });
    } catch (err) {
      console.error('Error fetching company stats:', err);
    }
  }, []);

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

  // Handle view company
  const handleViewCompany = (company) => {
    console.log('View company:', company);
    setSelectedCompany(company);
    setShowModal(true);
  };

  // Handle approve company
  const handleApproveCompany = async (company) => {
    if (company.status === 'approved') {
      alert('Company is already approved');
      return;
    }

    try {
      await updateCompanyStatus(company._id, { 
        status: 'approved',
        reason: 'Company approved by admin'
      });
      fetchCompanies(); // Refresh data
    } catch (err) {
      console.error('Error approving company:', err);
      alert('Failed to approve company');
    }
  };

  // Handle reject company
  const handleRejectCompany = async (company) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    try {
      await updateCompanyStatus(company._id, { 
        status: 'rejected',
        reason: reason
      });
      fetchCompanies(); // Refresh data
    } catch (err) {
      console.error('Error rejecting company:', err);
      alert('Failed to reject company');
    }
  };

  // Handle export
  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export companies');
  };

  // Fetch data on component mount and when dependencies change
  useEffect(() => {
    fetchCompanies();
    fetchCompanyStats();
  }, [fetchCompanies, fetchCompanyStats]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Company Management</h1>
          <p className="text-gray-600 mt-1">
            Review and approve company registrations
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Mail className="h-4 w-4 mr-2" />
            Send Notification
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
            <Building2 className="h-4 w-4 mr-2" />
            Bulk Actions
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Companies</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Approval</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.pending}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.approved}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.rejected}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions for Pending Approvals */}
      {companies.some(c => c.status === 'pending') && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-yellow-400 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">
                {companies.filter(c => c.status === 'pending').length} companies need your attention
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                Review and approve company registrations to allow them to post internship opportunities.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Companies Table */}
      <DataTable
        data={companies}
        columns={columns}
        loading={loading}
        error={error}
        pagination={pagination}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
        onSearch={handleSearch}
        onFilter={handleFilter}
        onRefresh={fetchCompanies}
        onExport={handleExport}
        searchable={true}
        filterable={true}
        exportable={true}
        refreshable={true}
        filters={filterOptions}
        activeFilters={filters}
        actions={actions}
      />

      {/* Company Details Modal */}
      {showModal && selectedCompany && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm overflow-y-auto"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl transform transition-all duration-300 scale-100 my-8 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors duration-200 p-1 rounded-full hover:bg-white hover:bg-opacity-20"
              >
                <X className="h-6 w-6" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                  <Building2 className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Company Registration Details</h3>
                  <p className="text-blue-100">Review company information from Step 3</p>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
              {/* Company Name */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="flex items-center space-x-3 mb-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Company Name</label>
                </div>
                <p className="text-xl font-bold text-gray-900 ml-8">
                  {selectedCompany.companyName || 'Not provided'}
                </p>
              </div>

              {/* Industry */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="flex items-center space-x-3 mb-2">
                  <Users className="h-5 w-5 text-green-600" />
                  <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Industry</label>
                </div>
                <p className="text-lg text-gray-900 ml-8">
                  {selectedCompany.industry || 'Not specified'}
                </p>
              </div>

              {/* Website */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="flex items-center space-x-3 mb-2">
                  <ExternalLink className="h-5 w-5 text-purple-600" />
                  <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Website</label>
                </div>
                <div className="ml-8">
                  {selectedCompany.website ? (
                    <a 
                      href={selectedCompany.website.startsWith('http') ? selectedCompany.website : `https://${selectedCompany.website}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-lg text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors duration-200 group"
                    >
                      {selectedCompany.website}
                      <ExternalLink className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                    </a>
                  ) : (
                    <p className="text-lg text-gray-500 italic">Not provided</p>
                  )}
                </div>
              </div>

              {/* About Company */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="flex items-center space-x-3 mb-3">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                  <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">About Company</label>
                </div>
                <div className="ml-8 bg-white rounded-lg p-4 border border-gray-200">
                  <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">
                    {selectedCompany.about || 'No description provided'}
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex justify-center">
                <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
                  selectedCompany.status === 'approved' ? 'bg-green-100 text-green-800 border border-green-200' :
                  selectedCompany.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' : 
                  'bg-red-100 text-red-800 border border-red-200'
                }`}>
                  {selectedCompany.status === 'approved' && <CheckCircle className="h-4 w-4 mr-2" />}
                  {selectedCompany.status === 'pending' && <Clock className="h-4 w-4 mr-2" />}
                  {selectedCompany.status === 'rejected' && <XCircle className="h-4 w-4 mr-2" />}
                  Status: {selectedCompany.status?.charAt(0).toUpperCase() + selectedCompany.status?.slice(1) || 'Unknown'}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 p-6 bg-gray-50 rounded-b-2xl border-t">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
              >
                Close
              </button>
              {selectedCompany.status === 'pending' && (
                <>
                  <button
                    onClick={() => {
                      handleApproveCompany(selectedCompany);
                      setShowModal(false);
                    }}
                    className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-green-600 to-green-700 rounded-lg hover:from-green-700 hover:to-green-800 transform hover:scale-105 transition-all duration-200 shadow-lg"
                  >
                    ✓ Approve Company
                  </button>
                  <button
                    onClick={() => {
                      handleRejectCompany(selectedCompany);
                      setShowModal(false);
                    }}
                    className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-700 rounded-lg hover:from-red-700 hover:to-red-800 transform hover:scale-105 transition-all duration-200 shadow-lg"
                  >
                    ✗ Reject Company
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCompanies;