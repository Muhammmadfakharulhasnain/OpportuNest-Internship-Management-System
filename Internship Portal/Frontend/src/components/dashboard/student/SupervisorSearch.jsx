import { useState, useEffect, useContext } from 'react';
import { 
  Search, Grid, List, RefreshCw, Users, CheckCircle2, X, Filter, GraduationCap, UserCheck
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supervisorAPI } from '../../../services/api';
import { StudentContext } from '../../../context/StudentContext';
import SupervisorCard from './SupervisorCard';
import SupervisorStats from './SupervisorStats';
import SupervisorSearchFilters from './SupervisorSearchFilters';
import Button from '../../../ui/Button';
import Card from '../../../ui/Card';
import Badge from '../../../ui/Badge';

const SupervisorSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [supervisors, setSupervisors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectingId, setSelectingId] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('name'); // 'name', 'availability', 'department'
  const [sortOrder, setSortOrder] = useState('asc');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterAvailability, setFilterAvailability] = useState('all');
  const [filterDesignation, setFilterDesignation] = useState('all');
  const [filterExpertise, setFilterExpertise] = useState('all');
  
  // Use StudentContext
  const studentContext = useContext(StudentContext);
  const { selectedSupervisor, supervisionRequest, requestSupervision } = studentContext || {};

  // Fetch supervisors on component mount
  useEffect(() => {
    fetchSupervisors();
  }, []);

  // Fetch supervisors from API
  const fetchSupervisors = async () => {
    try {
      setError(null);
      const response = await supervisorAPI.getAllSupervisors();
      
      console.log('Fetched supervisors:', response);
      
      if (response.success && response.data) {
        setSupervisors(response.data);
      } else {
        throw new Error('Failed to fetch supervisors');
      }
      
    } catch (err) {
      console.error('Error fetching supervisors:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle supervisor selection
  const handleSelectSupervisor = async (supervisor) => {
    try {
      setSelectingId(supervisor._id || supervisor.id);
      
      // Check if supervisor has capacity
      if ((supervisor.currentStudents || 0) >= supervisor.maxStudents) {
        toast.error('This supervisor has reached maximum capacity');
        return;
      }

      await requestSupervision(supervisor);
      toast.success(`Supervision request sent to ${supervisor.name}! Please wait for approval.`);
      
    } catch (error) {
      console.error('Error sending supervision request:', error);
      toast.error(error.message || 'Failed to send supervision request. Please try again.');
    } finally {
      setSelectingId(null);
    }
  };

  // Handle search
  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    console.log('Applying filters:', newFilters);
    setFilterDepartment(newFilters.department ? newFilters.department : 'all');
    setFilterAvailability(newFilters.availability ? newFilters.availability : 'all');
    setFilterDesignation(newFilters.designation ? newFilters.designation : 'all');
    setFilterExpertise(newFilters.expertise ? newFilters.expertise : 'all');
  };

  // Handle sort changes
  const handleSortChange = (field) => {
    setSortBy(field);
  };

  // Filter and sort supervisors
  const filteredAndSortedSupervisors = supervisors
    .filter(supervisor => {
      // Enhanced search functionality
      const searchLower = searchTerm.toLowerCase().trim();
      const matchesSearch = searchTerm === '' || (
        supervisor.name?.toLowerCase().includes(searchLower) ||
        supervisor.department?.toLowerCase().includes(searchLower) ||
        supervisor.designation?.toLowerCase().includes(searchLower) ||
        supervisor.email?.toLowerCase().includes(searchLower) ||
        supervisor.expertise?.some(skill => skill.toLowerCase().includes(searchLower))
      );
      
      // Department filter
      const matchesDepartment = filterDepartment === 'all' || 
        supervisor.department?.toLowerCase() === filterDepartment.toLowerCase();
      
      // Designation filter
      const matchesDesignation = filterDesignation === 'all' || 
        supervisor.designation?.toLowerCase() === filterDesignation.toLowerCase();
      
      // Availability filter
      const isAvailable = (supervisor.currentStudents || 0) < supervisor.maxStudents;
      const matchesAvailability = 
        filterAvailability === 'all' || 
        (filterAvailability === 'available' && isAvailable) ||
        (filterAvailability === 'full' && !isAvailable);
      
      // Expertise filter
      const matchesExpertise = filterExpertise === 'all' || 
        supervisor.expertise?.includes(filterExpertise);
      
      return matchesSearch && matchesDepartment && matchesDesignation && matchesAvailability && matchesExpertise;
    })
    .sort((a, b) => {
      let result = 0;
      switch (sortBy) {
        case 'availability': {
          const aAvailable = a.maxStudents - (a.currentStudents || 0);
          const bAvailable = b.maxStudents - (b.currentStudents || 0);
          result = bAvailable - aAvailable;
          break;
        }
        case 'students': {
          const aLoad = (a.currentStudents || 0);
          const bLoad = (b.currentStudents || 0);
          result = aLoad - bLoad;
          break;
        }
        case 'department':
          result = (a.department || '').localeCompare(b.department || '');
          break;
        case 'designation':
          result = (a.designation || '').localeCompare(b.designation || '');
          break;
        default:
          result = (a.name || '').localeCompare(b.name || '');
      }
      return sortOrder === 'desc' ? -result : result;
    });

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-gray-200 border-t-[#003366] rounded-full animate-spin mx-auto"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <GraduationCap className="w-6 h-6 text-[#003366]" />
                </div>
              </div>
              <p className="mt-4 text-lg font-medium text-gray-900">Finding Supervisors</p>
              <p className="text-gray-500">Loading available faculty members...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center p-12">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Supervisors</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={fetchSupervisors} className="bg-[#003366] hover:bg-[#00509E] text-white inline-flex items-center">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* 1. Page Title Section - Same as Jobs Tab */}
        <div className="space-y-3 pb-6 border-b border-gray-200">
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">
            Find Your Supervisor
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl">
            Discover and connect with faculty members who align with your research interests
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-[#003366] to-[#00509E] rounded-full mt-4"></div>
        </div>

        {/* 2. Top Stats Cards - Same as Jobs Tab */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total Supervisors Card */}
          <Card className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#003366] rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xl font-semibold text-gray-900">{supervisors.length}</p>
                <p className="text-xs text-gray-600 font-medium">Total Supervisors</p>
              </div>
            </div>
          </Card>

          {/* Filtered Results Card */}
          <Card className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#00509E] rounded-lg flex items-center justify-center">
                <Filter className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xl font-semibold text-gray-900">{filteredAndSortedSupervisors.length}</p>
                <p className="text-xs text-gray-600 font-medium">Filtered Results</p>
              </div>
            </div>
          </Card>

          {/* Available Supervisors Card */}
          <Card className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xl font-semibold text-gray-900">
                  {supervisors.filter(s => (s.currentStudents || 0) < s.maxStudents).length}
                </p>
                <p className="text-xs text-gray-600 font-medium">Available Now</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Selected Supervisor Alert - Keep green as requested */}
        {selectedSupervisor && (
          <Card className="p-4 bg-green-50 border-green-200 border-l-4 border-l-green-500">
            <div className="flex items-center">
              <CheckCircle2 className="w-5 h-5 text-green-600 mr-3" />
              <div className="flex-1">
                <h3 className="font-medium text-green-900">Supervisor Selected</h3>
                <p className="text-green-700 text-sm">
                  {selectedSupervisor.name} • {selectedSupervisor.department}
                </p>
              </div>
              <Badge variant="success" className="ml-2">Active</Badge>
            </div>
          </Card>
        )}

        {/* Filters Section */}
        <SupervisorSearchFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filters={{ 
            department: filterDepartment !== 'all' ? filterDepartment : undefined,
            availability: filterAvailability !== 'all' ? filterAvailability : undefined,
            designation: filterDesignation !== 'all' ? filterDesignation : undefined,
            expertise: filterExpertise !== 'all' ? filterExpertise : undefined
          }}
          onFilterChange={handleFilterChange}
          supervisors={supervisors}
          sortBy={sortBy}
          onSortChange={handleSortChange}
          onClearFilters={() => {
            setSearchTerm('');
            setFilterDepartment('all');
            setFilterDesignation('all');
            setFilterAvailability('all');
            setFilterExpertise('all');
          }}
        />

        {/* View Mode Toggle - Same as Jobs Tab */}
        <div className="flex justify-end mb-6">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">View:</span>
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'} transition-colors`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'} transition-colors`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Results Summary - Same as Jobs Tab */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-gray-600">
              Showing <span className="font-semibold text-[#003366]">{filteredAndSortedSupervisors.length}</span> of{' '}
              <span className="font-semibold">{supervisors.length}</span> supervisors
            </p>
            {(searchTerm || filterDepartment !== 'all' || filterAvailability !== 'all' || filterDesignation !== 'all' || filterExpertise !== 'all') && (
              <p className="text-sm text-gray-500 mt-1">
                {searchTerm && `Search: "${searchTerm}"`}
                {filterDepartment !== 'all' && ` • Department: ${filterDepartment}`}
                {filterDesignation !== 'all' && ` • Designation: ${filterDesignation}`}
                {filterAvailability !== 'all' && ` • ${filterAvailability === 'available' ? 'Available Only' : 'Full Capacity'}`}
                {filterExpertise !== 'all' && ` • Expertise: ${filterExpertise}`}
              </p>
            )}
          </div>
          <div className="text-sm text-gray-500">
            Sorted by: <span className="font-medium">{sortBy}</span> ({sortOrder})
          </div>
        </div>

        {/* Supervisors Display - Same as Jobs Tab */}
        {filteredAndSortedSupervisors.length > 0 ? (
          <div className={
            viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" 
              : "space-y-4"
          }>
            {filteredAndSortedSupervisors.map((supervisor) => {
              const supervisorId = supervisor._id || supervisor.id;
              const selectedId = selectedSupervisor?._id || selectedSupervisor?.id;
              const isSelected = selectedId === supervisorId;
              const isSelecting = selectingId === supervisorId;
              
              return (
                <SupervisorCard
                  key={supervisorId}
                  supervisor={supervisor}
                  isSelected={isSelected}
                  onSelect={handleSelectSupervisor}
                  supervisionRequest={supervisionRequest}
                  isSelecting={isSelecting}
                  viewMode={viewMode}
                />
              );
            })}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Supervisors Found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filterDepartment !== 'all' || filterAvailability !== 'all'
                ? 'No supervisors match your current filters. Try adjusting your search criteria.'
                : 'No supervisors are currently available.'}
            </p>
            {(searchTerm || filterDepartment !== 'all' || filterAvailability !== 'all') && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setFilterDepartment('all');
                  setFilterAvailability('all');
                }}
              >
                Clear Filters
              </Button>
            )}
          </Card>
        )}
      </div>
    </div>
  );
};

export default SupervisorSearch;