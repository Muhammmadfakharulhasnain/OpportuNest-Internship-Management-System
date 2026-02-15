import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import PropTypes from 'prop-types';

const SupervisorSearchFilters = ({ 
  searchTerm = '',
  onSearchChange,
  filters = {}, 
  onFilterChange,
  supervisors = [],
  onClearFilters,
  sortBy = 'name',
  onSortChange
}) => {
  const [showFilters, setShowFilters] = useState(false);

  // Comprehensive list of all departments
  const allDepartments = [
    'Computer Science',
    'Software Engineering',
    'Information Technology',
    'Electrical Engineering',
    'Electronic Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Chemical Engineering',
    'Telecommunication Engineering',
    'Biomedical Engineering',
    'Aerospace Engineering',
    'Industrial Engineering',
    'Environmental Engineering',
    'Petroleum Engineering',
    'Business Administration',
    'Management Sciences',
    'Economics',
    'Finance',
    'Marketing',
    'Human Resource Management',
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biosciences',
    'Architecture',
    'Media Studies',
    'English Literature',
    'Social Sciences'
  ];

  // Comprehensive list of all designations
  const allDesignations = [
    'Professor',
    'Associate Professor',
    'Assistant Professor',
    'Lecturer',
    'Senior Lecturer',
    'Visiting Faculty',
    'Adjunct Professor',
    'Research Associate',
    'Lab Engineer',
    'Senior Lab Engineer',
    'Teaching Assistant',
    'Head of Department',
    'Dean',
    'Director'
  ];

  // Comprehensive list of all expertise areas
  const allExpertiseAreas = [
    'Machine Learning',
    'Artificial Intelligence',
    'Deep Learning',
    'Natural Language Processing',
    'Computer Vision',
    'Data Science',
    'Big Data Analytics',
    'Cloud Computing',
    'Cybersecurity',
    'Network Security',
    'Blockchain',
    'Internet of Things (IoT)',
    'Web Development',
    'Mobile App Development',
    'Software Engineering',
    'Database Management',
    'DevOps',
    'UI/UX Design',
    'Game Development',
    'Robotics',
    'Embedded Systems',
    'Digital Signal Processing',
    'Power Systems',
    'Control Systems',
    'Communication Systems',
    'VLSI Design',
    'Microelectronics',
    'Renewable Energy',
    'Structural Engineering',
    'Construction Management',
    'Transportation Engineering',
    'Water Resources',
    'Thermodynamics',
    'Fluid Mechanics',
    'Manufacturing',
    'CAD/CAM',
    'Quality Management',
    'Supply Chain Management',
    'Project Management',
    'Business Analytics',
    'Financial Analysis',
    'Digital Marketing',
    'Strategic Management',
    'Operations Research',
    'Entrepreneurship'
  ];

  // Get unique departments, designations, and expertise from supervisors
  const supervisorDepartments = [...new Set(supervisors.map(s => s.department).filter(Boolean))];
  const supervisorDesignations = [...new Set(supervisors.map(s => s.designation).filter(Boolean))];
  const supervisorExpertise = supervisors.reduce((acc, supervisor) => {
    if (supervisor.expertise && Array.isArray(supervisor.expertise)) {
      supervisor.expertise.forEach(skill => {
        if (skill && !acc.includes(skill)) {
          acc.push(skill);
        }
      });
    }
    return acc;
  }, []);

  // Combine static lists with supervisor data and remove duplicates
  const departments = [...new Set([...allDepartments, ...supervisorDepartments])].sort();
  const designations = [...new Set([...allDesignations, ...supervisorDesignations])].sort();
  const allExpertise = [...new Set([...allExpertiseAreas, ...supervisorExpertise])].sort();

  const handleFilterChange = (filterType, value) => {
    onFilterChange({
      ...filters,
      [filterType]: value
    });
  };

  // Count active filters (exclude undefined values)
  const activeFilterCount = Object.values(filters).filter(v => v !== undefined).length;

  return (
    <div className="mb-6">
      {/* Search Bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search by name, department, designation, email, or expertise..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-4 py-3 w-full text-base border-2 border-gray-300 rounded-lg focus:border-[#003366] focus:ring-2 focus:ring-[#003366] focus:outline-none"
        />
        {searchTerm && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter Button, Clear All, and Sort Buttons */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-[#003366] text-[#003366] rounded-lg hover:bg-[#003366] hover:text-white transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-[#003366] text-white text-xs font-semibold rounded-full">
                {activeFilterCount}
              </span>
            )}
          </button>

          {activeFilterCount > 0 && (
            <button
              onClick={onClearFilters}
              className="flex items-center gap-2 px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-4 h-4" />
              Clear all
            </button>
          )}
        </div>

        {/* Sort Buttons */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">Sort by:</span>
          <button
            onClick={() => onSortChange('name')}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              sortBy === 'name' 
                ? 'bg-[#003366] text-white' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Name ↕
          </button>
          <button
            onClick={() => onSortChange('availability')}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              sortBy === 'availability' 
                ? 'bg-[#003366] text-white' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Availability
          </button>
          <button
            onClick={() => onSortChange('students')}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              sortBy === 'students' 
                ? 'bg-[#003366] text-white' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Students
          </button>
          <button
            onClick={() => onSortChange('department')}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              sortBy === 'department' 
                ? 'bg-[#003366] text-white' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Department
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Department Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department
              </label>
              <select
                value={filters.department || 'all'}
                onChange={(e) => handleFilterChange('department', e.target.value === 'all' ? undefined : e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-[#003366] bg-white text-sm"
              >
                <option value="all">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            {/* Designation Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Designation
              </label>
              <select
                value={filters.designation || 'all'}
                onChange={(e) => handleFilterChange('designation', e.target.value === 'all' ? undefined : e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-[#003366] bg-white text-sm"
              >
                <option value="all">All Designations</option>
                {designations.map(designation => (
                  <option key={designation} value={designation}>{designation}</option>
                ))}
              </select>
            </div>

            {/* Availability Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Availability
              </label>
              <select
                value={filters.availability || 'all'}
                onChange={(e) => handleFilterChange('availability', e.target.value === 'all' ? undefined : e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-[#003366] bg-white text-sm"
              >
                <option value="all">All Supervisors</option>
                <option value="available">Available Only</option>
                <option value="full">Full Capacity</option>
              </select>
            </div>

            {/* Expertise Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expertise
              </label>
              <select
                value={filters.expertise || 'all'}
                onChange={(e) => handleFilterChange('expertise', e.target.value === 'all' ? undefined : e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-[#003366] bg-white text-sm"
              >
                <option value="all">All Expertise</option>
                {allExpertise.map(skill => (
                  <option key={skill} value={skill}>{skill}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

SupervisorSearchFilters.propTypes = {
  searchTerm: PropTypes.string,
  onSearchChange: PropTypes.func.isRequired,
  filters: PropTypes.object,
  onFilterChange: PropTypes.func.isRequired,
  supervisors: PropTypes.array,
  onClearFilters: PropTypes.func.isRequired,
  sortBy: PropTypes.string,
  onSortChange: PropTypes.func
};

export default SupervisorSearchFilters;