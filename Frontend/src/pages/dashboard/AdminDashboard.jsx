import { useState, useEffect } from 'react'
import { FiBriefcase, FiUsers, FiSettings, FiSearch, FiFilter, FiTrash2, FiEye, FiUserCheck, FiUserX } from 'react-icons/fi'
import { toast } from 'react-toastify'
import { useAuth } from '../../context/AuthContext.jsx'
import DashboardLayout from '../../layouts/DashboardLayout.jsx'
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx'
import Modal from '../../components/common/Modal.jsx'
import { adminAPI } from '../../services/api.js'

// Mock data for all internships
const mockInternships = [
  {
    id: 1,
    title: 'Frontend Developer Intern',
    company: 'TechSolutions Inc.',
    location: 'Islamabad, Pakistan',
    type: 'Part-time',
    duration: '3 months',
    deadline: '2023-05-30',
    postedDate: '2023-04-10',
    status: 'active',
    applicants: 12
  },
  {
    id: 2,
    title: 'Backend Developer Intern',
    company: 'TechSolutions Inc.',
    location: 'Remote',
    type: 'Full-time',
    duration: '6 months',
    deadline: '2023-06-15',
    postedDate: '2023-04-05',
    status: 'active',
    applicants: 8
  },
  {
    id: 3,
    title: 'Data Analyst Intern',
    company: 'DataMetrics',
    location: 'Lahore, Pakistan',
    type: 'Full-time',
    duration: '6 months',
    deadline: '2023-06-20',
    postedDate: '2023-03-28',
    status: 'closed',
    applicants: 15
  },
  {
    id: 4,
    title: 'UI/UX Design Intern',
    company: 'Creative Designs',
    location: 'Islamabad, Pakistan',
    type: 'Remote',
    duration: '3 months',
    deadline: '2023-06-05',
    postedDate: '2023-04-12',
    status: 'active',
    applicants: 10
  }
]

// Mock data for companies
const mockCompanies = [
  {
    id: 1,
    name: 'TechSolutions Inc.',
    industry: 'Information Technology',
    location: 'Islamabad, Pakistan',
    email: 'contact@techsolutions.com',
    status: 'approved',
    joinedDate: '2023-01-15',
    logo: 'https://images.pexels.com/photos/5673488/pexels-photo-5673488.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    internships: 2
  },
  {
    id: 2,
    name: 'DataMetrics',
    industry: 'Data Analytics',
    location: 'Lahore, Pakistan',
    email: 'info@datametrics.com',
    status: 'approved',
    joinedDate: '2023-02-10',
    logo: 'https://images.pexels.com/photos/11035481/pexels-photo-11035481.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    internships: 1
  },
  {
    id: 3,
    name: 'Creative Designs',
    industry: 'Design',
    location: 'Islamabad, Pakistan',
    email: 'hello@creativedesigns.com',
    status: 'approved',
    joinedDate: '2023-03-05',
    logo: 'https://images.pexels.com/photos/13348192/pexels-photo-13348192.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    internships: 1
  },
  {
    id: 4,
    name: 'Innovate Solutions',
    industry: 'Software Development',
    location: 'Karachi, Pakistan',
    email: 'contact@innovatesolutions.com',
    status: 'pending',
    joinedDate: '2023-04-20',
    logo: 'https://images.pexels.com/photos/6802042/pexels-photo-6802042.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    internships: 0
  }
]

// Mock data for users (students)
const mockUsers = [
  {
    id: 1,
    name: 'Aisha Khan',
    email: 'aisha.khan@example.com',
    role: 'student',
    status: 'active',
    joinedDate: '2023-02-05',
    applications: 3,
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  },
  {
    id: 2,
    name: 'Muhammad Ali',
    email: 'muhammad.ali@example.com',
    role: 'student',
    status: 'active',
    joinedDate: '2023-01-20',
    applications: 2,
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  },
  {
    id: 3,
    name: 'Sara Ahmed',
    email: 'sara.ahmed@example.com',
    role: 'student',
    status: 'suspended',
    joinedDate: '2023-03-12',
    applications: 1,
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  },
  {
    id: 4,
    name: 'Hassan Ali',
    email: 'hassan.ali@example.com',
    role: 'student',
    status: 'active',
    joinedDate: '2023-04-05',
    applications: 0,
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  }
]

const statusColors = {
  active: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800',
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  suspended: 'bg-red-100 text-red-800'
}

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('internships')
  const [internships, setInternships] = useState([])
  const [companies, setCompanies] = useState([])
  const [users, setUsers] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  
  // Debug state changes
  useEffect(() => {
    console.log('🔍 showDetailsModal changed:', showDetailsModal);
  }, [showDetailsModal]);
  
  useEffect(() => {
    console.log('🔍 selectedItem changed:', selectedItem);
  }, [selectedItem]);
  
  const { currentUser } = useAuth()
  
  useEffect(() => {
    // Fetch real admin data from API
    const fetchData = async () => {
      setLoading(true)
      try {
        // Fetch companies data from backend
        if (activeTab === 'companies') {
          const response = await adminAPI.getCompanies();
          
          if (response.success) {
            const companiesData = response.data.companies.map(company => ({
              id: company._id,
              name: company.user?.name || company.companyName,
              email: company.user?.email || '',
              industry: company.industry || 'Not specified',
              location: company.address || 'Not specified',
              status: company.status,
              joinedDate: company.user?.createdAt ? new Date(company.user.createdAt).toLocaleDateString() : 'N/A',
              logo: 'https://images.pexels.com/photos/5673488/pexels-photo-5673488.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2', // Default logo
              internships: 0, // Will be calculated separately if needed
              // Additional company details for modal
              companyName: company.companyName,
              website: company.website,
              about: company.about,
              isVerified: company.user?.isVerified || false
            }));
            
            setCompanies(companiesData);
            setFilteredData(companiesData);
          } else {
            toast.error('Failed to load companies data');
          }
        } else {
          // Keep mock data for other tabs for now
          setInternships(mockInternships)
          setUsers(mockUsers)
          
          if (activeTab === 'internships') {
            setFilteredData(mockInternships)
          } else if (activeTab === 'users') {
            setFilteredData(mockUsers)
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        toast.error('Failed to load data. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])
  
  // Update filtered data when tab changes
  useEffect(() => {
    setStatusFilter('all')
    setSearchQuery('')
    
    // Close any open modals when switching tabs
    setShowDetailsModal(false)
    setSelectedItem(null)
    
    if (activeTab === 'internships') {
      setFilteredData(internships)
    } else if (activeTab === 'companies') {
      setFilteredData(companies)
    } else if (activeTab === 'users') {
      setFilteredData(users)
    }
  }, [activeTab, internships, companies, users])
  
  // Filter data when filter or search changes
  useEffect(() => {
    let result = []
    
    if (activeTab === 'internships') {
      result = [...internships]
    } else if (activeTab === 'companies') {
      result = [...companies]
    } else if (activeTab === 'users') {
      result = [...users]
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(item => item.status === statusFilter)
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      
      if (activeTab === 'internships') {
        result = result.filter(
          item => item.title.toLowerCase().includes(query) || 
                 item.company.toLowerCase().includes(query)
        )
      } else if (activeTab === 'companies') {
        result = result.filter(
          item => item.name.toLowerCase().includes(query) || 
                 item.industry.toLowerCase().includes(query)
        )
      } else if (activeTab === 'users') {
        result = result.filter(
          item => item.name.toLowerCase().includes(query) || 
                 item.email.toLowerCase().includes(query)
        )
      }
    }
    
    setFilteredData(result)
  }, [statusFilter, searchQuery, activeTab, internships, companies, users])
  
  const handleStatusFilterChange = (status) => {
    setStatusFilter(status)
  }
  
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
  }
  
  const handleTabChange = (tab) => {
    setActiveTab(tab)
  }
  
  const handleDeleteClick = (item) => {
    setItemToDelete(item)
    setShowDeleteModal(true)
  }
  
  const confirmDelete = () => {
    if (itemToDelete) {
      if (activeTab === 'internships') {
        const updatedInternships = internships.filter(item => item.id !== itemToDelete.id)
        setInternships(updatedInternships)
        setFilteredData(updatedInternships)
        toast.success('Internship deleted successfully')
      } else if (activeTab === 'companies') {
        const updatedCompanies = companies.filter(item => item.id !== itemToDelete.id)
        setCompanies(updatedCompanies)
        setFilteredData(updatedCompanies)
        toast.success('Company deleted successfully')
      } else if (activeTab === 'users') {
        const updatedUsers = users.filter(item => item.id !== itemToDelete.id)
        setUsers(updatedUsers)
        setFilteredData(updatedUsers)
        toast.success('User deleted successfully')
      }
      
      setShowDeleteModal(false)
    }
  }
  
  const handleViewDetails = (item) => {
    console.log('=== HANDLE VIEW DETAILS START ===');
    console.log('🔍 View button clicked for item:', item);
    
    // Set state synchronously first
    setSelectedItem(item);
    setShowDetailsModal(true);
    
    console.log('🔄 Modal should open immediately');
    console.log('=== HANDLE VIEW DETAILS END ===');
    
    // Fetch additional data asynchronously (don't block modal opening)
    if (activeTab === 'companies') {
      fetchCompanyDetails(item);
    }
  }
  
  const fetchCompanyDetails = async (item) => {
    try {
      console.log('📡 Fetching company details for ID:', item.id);
      const response = await adminAPI.getCompanyDetails(item.id);
      
      if (response && response.success) {
        const detailedCompany = {
          ...item,
          companyName: response.data.companyName || item.companyName,
          industry: response.data.industry || item.industry,
          website: response.data.website || item.website,
          about: response.data.about || item.about,
          isVerified: response.data.user?.isVerified || item.isVerified || false,
          email: response.data.user?.email || item.email,
          name: response.data.user?.name || item.name,
          joinedDate: response.data.user?.createdAt ? new Date(response.data.user.createdAt).toLocaleDateString() : item.joinedDate
        };
        
        setSelectedItem(detailedCompany);
      }
    } catch (error) {
      console.error('❌ Error fetching company details:', error);
    }
  }
  
  const handleUpdateStatus = async (id, newStatus) => {
    if (activeTab === 'companies') {
      try {
        let response;
        
        // Use specific approve/reject API endpoints for better UX
        if (newStatus === 'approved') {
          response = await adminAPI.approveCompany(id);
        } else if (newStatus === 'rejected') {
          response = await adminAPI.rejectCompany(id);
        } else {
          response = await adminAPI.updateCompanyStatus(id, newStatus);
        }
        
        if (response.success) {
          // Update local state with the response data
          const updatedCompanies = companies.map(company => 
            company.id === id ? { ...company, status: newStatus } : company
          )
          setCompanies(updatedCompanies)
          setFilteredData(updatedCompanies.filter(company => 
            statusFilter === 'all' || company.status === statusFilter
          ))
          toast.success(`Company ${newStatus} successfully`)
        } else {
          toast.error(response.message || 'Failed to update company status')
        }
      } catch (error) {
        console.error('Update company status error:', error)
        toast.error('Failed to update company status. Please try again.')
      }
    } else if (activeTab === 'users') {
      const updatedUsers = users.map(user => 
        user.id === id ? { ...user, status: newStatus } : user
      )
      setUsers(updatedUsers)
      setFilteredData(updatedUsers.filter(user => 
        statusFilter === 'all' || user.status === statusFilter
      ))
      toast.success(`User status updated to ${newStatus}`)
    }
  }
  
  // Render tabs
  const renderTabs = () => {
    const tabs = [
      { id: 'internships', label: 'Internships', icon: <FiBriefcase /> },
      { id: 'companies', label: 'Companies', icon: <FiUsers /> },
      { id: 'users', label: 'Users', icon: <FiUsers /> }
    ]
    
    return (
      <div className="border-b border-gray-200 mb-8">
        <nav className="flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`
                py-4 px-1 flex items-center text-sm font-medium border-b-2 
                ${activeTab === tab.id 
                  ? 'border-primary-500 text-primary-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    )
  }
  
  // Render filters
  const renderFilters = () => {
    let statusOptions = []
    
    if (activeTab === 'internships') {
      statusOptions = [
        { value: 'all', label: 'All Status' },
        { value: 'active', label: 'Active' },
        { value: 'closed', label: 'Closed' }
      ]
    } else if (activeTab === 'companies') {
      statusOptions = [
        { value: 'all', label: 'All Status' },
        { value: 'approved', label: 'Approved' },
        { value: 'pending', label: 'Pending' },
        { value: 'suspended', label: 'Suspended' }
      ]
    } else if (activeTab === 'users') {
      statusOptions = [
        { value: 'all', label: 'All Status' },
        { value: 'active', label: 'Active' },
        { value: 'suspended', label: 'Suspended' }
      ]
    }
    
    return (
      <div className="mb-6 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            className="form-input pl-10 w-full"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
        
        <div className="relative inline-block sm:w-48">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiFilter className="h-5 w-5 text-gray-400" />
          </div>
          <select
            className="form-input pl-10 w-full appearance-none pr-8"
            value={statusFilter}
            onChange={(e) => handleStatusFilterChange(e.target.value)}
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
    )
  }
  
  // Render internships table
  const renderInternshipsTable = () => {
    if (loading) {
      return (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      )
    }
    
    if (filteredData.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <FiBriefcase className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No internships found</h3>
          <p className="text-gray-600">
            {internships.length === 0 
              ? "There are no internships in the system."
              : "No internships match your current filters."
            }
          </p>
        </div>
      )
    }
    
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Internship
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Company
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Details
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Applicants
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredData.map((internship) => (
              <tr key={internship.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{internship.title}</div>
                  <div className="text-sm text-gray-500">Posted on {internship.postedDate}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{internship.company}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{internship.location}</div>
                  <div className="text-sm text-gray-500">{internship.type} • {internship.duration}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[internship.status]}`}>
                    {internship.status.charAt(0).toUpperCase() + internship.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {internship.applicants}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handleViewDetails(internship)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <FiEye />
                      <span className="sr-only">View</span>
                    </button>
                    <button
                      onClick={() => handleDeleteClick(internship)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <FiTrash2 />
                      <span className="sr-only">Delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }
  
  // Render companies table
  const renderCompaniesTable = () => {
    if (loading) {
      return (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      )
    }
    
    if (filteredData.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <FiUsers className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No companies found</h3>
          <p className="text-gray-600">
            {companies.length === 0 
              ? "There are no companies in the system."
              : "No companies match your current filters."
            }
          </p>
        </div>
      )
    }
    
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Company
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Details
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Internships
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredData.map((company) => (
              <tr key={company.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <img 
                        className="h-10 w-10 rounded-full object-cover" 
                        src={company.logo} 
                        alt={company.name} 
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{company.name}</div>
                      <div className="text-sm text-gray-500">{company.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{company.industry}</div>
                  <div className="text-sm text-gray-500">{company.location}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[company.status]}`}>
                    {company.status.charAt(0).toUpperCase() + company.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {company.internships}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={(e) => {
                        console.log('=== VIEW BUTTON CLICKED ===');
                        console.log('Event:', e);
                        console.log('Company:', company);
                        e.preventDefault();
                        e.stopPropagation();
                        handleViewDetails(company);
                      }}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <FiEye />
                      <span className="sr-only">View</span>
                    </button>
                    {company.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(company.id, 'approved')}
                          className="text-green-600 hover:text-green-900"
                          title="Approve Company"
                        >
                          <FiUserCheck />
                          <span className="sr-only">Approve</span>
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(company.id, 'rejected')}
                          className="text-red-600 hover:text-red-900"
                          title="Reject Company"
                        >
                          <FiUserX />
                          <span className="sr-only">Reject</span>
                        </button>
                      </>
                    )}
                    {company.status === 'approved' && (
                      <button
                        onClick={() => handleUpdateStatus(company.id, 'rejected')}
                        className="text-red-600 hover:text-red-900"
                        title="Reject Company"
                      >
                        <FiUserX />
                        <span className="sr-only">Reject</span>
                      </button>
                    )}
                    {company.status === 'rejected' && (
                      <button
                        onClick={() => handleUpdateStatus(company.id, 'approved')}
                        className="text-green-600 hover:text-green-900"
                        title="Approve Company"
                      >
                        <FiUserCheck />
                        <span className="sr-only">Approve</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteClick(company)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <FiTrash2 />
                      <span className="sr-only">Delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }
  
  // Render users table
  const renderUsersTable = () => {
    if (loading) {
      return (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      )
    }
    
    if (filteredData.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <FiUsers className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
          <p className="text-gray-600">
            {users.length === 0 
              ? "There are no users in the system."
              : "No users match your current filters."
            }
          </p>
        </div>
      )
    }
    
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Joined
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Applications
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredData.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <img 
                        className="h-10 w-10 rounded-full object-cover" 
                        src={user.avatar} 
                        alt={user.name} 
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{user.joinedDate}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[user.status]}`}>
                    {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.applications}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handleViewDetails(user)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <FiEye />
                      <span className="sr-only">View</span>
                    </button>
                    {user.status === 'active' && (
                      <button
                        onClick={() => handleUpdateStatus(user.id, 'suspended')}
                        className="text-orange-600 hover:text-orange-900"
                        title="Suspend User"
                      >
                        <FiUserX />
                        <span className="sr-only">Suspend</span>
                      </button>
                    )}
                    {user.status === 'suspended' && (
                      <button
                        onClick={() => handleUpdateStatus(user.id, 'active')}
                        className="text-green-600 hover:text-green-900"
                        title="Reactivate User"
                      >
                        <FiUserCheck />
                        <span className="sr-only">Reactivate</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteClick(user)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <FiTrash2 />
                      <span className="sr-only">Delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }
  
  // Render details modal content
  const renderDetailsModal = () => {
    if (!selectedItem) return null
    
    if (activeTab === 'internships') {
      return (
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">{selectedItem.title}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm font-medium text-gray-500">Company</p>
              <p className="text-base text-gray-900">{selectedItem.company}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Location</p>
              <p className="text-base text-gray-900">{selectedItem.location}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Type</p>
              <p className="text-base text-gray-900">{selectedItem.type}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Duration</p>
              <p className="text-base text-gray-900">{selectedItem.duration}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Posted Date</p>
              <p className="text-base text-gray-900">{selectedItem.postedDate}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Deadline</p>
              <p className="text-base text-gray-900">{selectedItem.deadline}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Status</p>
              <p className="text-base text-gray-900">{selectedItem.status}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Applicants</p>
              <p className="text-base text-gray-900">{selectedItem.applicants}</p>
            </div>
          </div>
        </div>
      )
    } else if (activeTab === 'companies') {
      return (
        <div className="p-6">
          <div className="flex items-center mb-6">
            <div className="h-16 w-16 rounded-full overflow-hidden bg-gray-100">
              <img src={selectedItem.logo} alt={selectedItem.companyName || selectedItem.name} className="h-full w-full object-cover" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">{selectedItem.companyName || selectedItem.name}</h3>
              <p className="text-sm text-gray-500">{selectedItem.email}</p>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[selectedItem.status]}`}>
                {selectedItem.status?.charAt(0).toUpperCase() + selectedItem.status?.slice(1)}
              </span>
            </div>
          </div>
          
          {/* Company Registration Details */}
          <div className="mb-6 bg-gray-50 p-4 rounded-lg">
            <h4 className="text-md font-semibold text-gray-900 mb-4">Company Registration Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Company Name</p>
                <p className="text-base text-gray-900 mt-1">{selectedItem.companyName || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Industry</p>
                <p className="text-base text-gray-900 mt-1">{selectedItem.industry || 'Not specified'}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm font-medium text-gray-500">Website</p>
                {selectedItem.website ? (
                  <a 
                    href={selectedItem.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-base text-blue-600 hover:text-blue-800 underline mt-1 inline-block"
                  >
                    {selectedItem.website}
                  </a>
                ) : (
                  <p className="text-base text-gray-900 mt-1">Not provided</p>
                )}
              </div>
              <div className="md:col-span-2">
                <p className="text-sm font-medium text-gray-500">About Company</p>
                <p className="text-base text-gray-900 whitespace-pre-wrap mt-1">
                  {selectedItem.about || 'No description provided'}
                </p>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="border-t pt-4">
            <h4 className="text-md font-semibold text-gray-900 mb-4">System Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Registration Date</p>
                <p className="text-base text-gray-900 mt-1">{selectedItem.joinedDate}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Email Verified</p>
                <p className="text-base text-gray-900 mt-1">
                  {selectedItem.isVerified ? (
                    <span className="text-green-600 font-medium">✓ Verified</span>
                  ) : (
                    <span className="text-red-600 font-medium">✗ Not Verified</span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">User Name</p>
                <p className="text-base text-gray-900 mt-1">{selectedItem.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Contact Email</p>
                <p className="text-base text-gray-900 mt-1">{selectedItem.email}</p>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          {selectedItem.status === 'pending' && (
            <div className="border-t mt-6 pt-4">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    handleUpdateStatus(selectedItem.id, 'rejected');
                    setShowDetailsModal(false);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Reject Company
                </button>
                <button
                  onClick={() => {
                    handleUpdateStatus(selectedItem.id, 'approved');
                    setShowDetailsModal(false);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  Approve Company
                </button>
              </div>
            </div>
          )}
        </div>
      )
    } else if (activeTab === 'users') {
      return (
        <div className="p-6">
          <div className="flex items-center mb-6">
            <div className="h-16 w-16 rounded-full overflow-hidden bg-gray-100">
              <img src={selectedItem.avatar} alt={selectedItem.name} className="h-full w-full object-cover" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">{selectedItem.name}</h3>
              <p className="text-sm text-gray-500">{selectedItem.email}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm font-medium text-gray-500">Role</p>
              <p className="text-base text-gray-900">{selectedItem.role}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Status</p>
              <p className="text-base text-gray-900">{selectedItem.status}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Joined Date</p>
              <p className="text-base text-gray-900">{selectedItem.joinedDate}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Applications</p>
              <p className="text-base text-gray-900">{selectedItem.applications}</p>
            </div>
          </div>
        </div>
      )
    }
    
    return null
  }

  return (
    <DashboardLayout>
      <div className="mb-8" >
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">
          Welcome back, {currentUser?.name || 'Admin'}! Manage the platform, users, and content.
        </p>
      </div>
      
      {/* Dashboard tabs */}
      {renderTabs()}
      
      {/* Filters */}
      {renderFilters()}
      
      {/* Debug Test Buttons */}
      {activeTab === 'companies' && (
        <div className="mb-4 space-x-2">
          <button
            onClick={() => {
              console.log('📝 Test Modal button clicked');
              console.log('📝 Current state - showDetailsModal:', showDetailsModal, 'selectedItem:', selectedItem);
              const testItem = { 
                id: 'test', 
                name: 'Test Company', 
                email: 'test@test.com',
                companyName: 'Test Company Name',
                industry: 'Technology',
                website: 'https://test.com',
                about: 'This is a test company description',
                status: 'pending',
                logo: 'https://images.pexels.com/photos/5673488/pexels-photo-5673488.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2'
              };
              console.log('📝 Setting selectedItem to:', testItem);
              setSelectedItem(testItem);
              console.log('📝 Setting showDetailsModal to true');
              setShowDetailsModal(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Test Modal
          </button>
          <button
            onClick={() => {
              console.log('📝 Test View Details with real company');
              if (filteredData.length > 0) {
                const firstCompany = filteredData[0];
                console.log('📝 Calling handleViewDetails with:', firstCompany);
                handleViewDetails(firstCompany);
              } else {
                console.log('⚠️ No companies in filteredData');
              }
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Test Real Company
          </button>
        </div>
      )}
      
      {/* Tab content */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {activeTab === 'internships' && renderInternshipsTable()}
        {activeTab === 'companies' && renderCompaniesTable()}
        {activeTab === 'users' && renderUsersTable()}
      </div>
      
      {/* Debug Info */}
      <div className="mt-4 p-4 bg-gray-100 rounded text-sm">
        <p><strong>Debug Info:</strong></p>
        <p>showDetailsModal: <span className={showDetailsModal ? 'text-green-600' : 'text-red-600'}>{showDetailsModal.toString()}</span></p>
        <p>selectedItem: <span className={selectedItem ? 'text-green-600' : 'text-red-600'}>{selectedItem ? 'exists' : 'null'}</span></p>
        <p>activeTab: {activeTab}</p>
        <p>filteredData length: {filteredData.length}</p>
        <p>companies length: {companies.length}</p>
        {selectedItem && (
          <div className="mt-2 p-2 bg-white rounded">
            <p><strong>Selected Item:</strong></p>
            <pre className="text-xs">{JSON.stringify(selectedItem, null, 2)}</pre>
          </div>
        )}
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && itemToDelete && (
        <Modal
          title={`Delete ${activeTab === 'internships' ? 'Internship' : activeTab === 'companies' ? 'Company' : 'User'}`}
          onClose={() => setShowDeleteModal(false)}
          size="small"
        >
          <div className="p-6">
            <p className="mb-4 text-gray-700">
              Are you sure you want to delete {
                activeTab === 'internships' 
                  ? `the internship "${itemToDelete.title}"`
                  : activeTab === 'companies'
                    ? `the company "${itemToDelete.name}"`
                    : `the user "${itemToDelete.name}"`
              }? 
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                className="btn btn-outline"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </Modal>
      )}
      
      {/* Details Modal */}
      {showDetailsModal && selectedItem && (
        <Modal
          title={
            activeTab === 'internships' 
              ? 'Internship Details'
              : activeTab === 'companies'
                ? 'Company Details'
                : 'User Details'
          }
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedItem(null);
          }}
        >
          {renderDetailsModal()}
        </Modal>
      )}
    </DashboardLayout>
  )
}

export default AdminDashboard