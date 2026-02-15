import React, { useState, useEffect } from 'react';
import InternshipCard from '../components/internships/InternshipCard.jsx';
import { FiSearch, FiFilter, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const InternshipsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    location: 'all',
    type: 'all',
    duration: 'all'
  });
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch internships from API
  useEffect(() => {
    const fetchInternships = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/jobs');
        if (response.ok) {
          const data = await response.json();
          console.log('API Response:', data);
          
          // Handle different response structures
          let jobsArray = [];
          if (Array.isArray(data)) {
            jobsArray = data;
          } else if (data.jobs && Array.isArray(data.jobs)) {
            jobsArray = data.jobs;
          } else if (data.data && Array.isArray(data.data)) {
            jobsArray = data.data;
          }
          
          // Transform the data to match our component structure
          const transformedJobs = jobsArray.map((job) => ({
            id: job._id || job.id,
            title: job.title || job.jobTitle || 'Internship Position',
            company: job.companyName || job.company || 'Company',
            logo: job.companyLogo || 'https://via.placeholder.com/150',
            location: job.location || 'Pakistan',
            type: job.type || job.jobType || job.workType || 'Full-time',
            duration: job.duration || '3-6 months',
            posted: getDaysAgo(job.createdAt || job.datePosted || new Date()),
            deadline: job.deadline || job.applicationDeadline || new Date(Date.now() + 30*24*60*60*1000),
            skills: job.requirements || job.skills || job.technologyStack || job.requiredSkills || [],
            description: job.description || job.jobDescription || 'Join our team for an exciting internship opportunity.',
            featured: job.featured || false
          }));
          setInternships(transformedJobs);
        } else {
          console.error('Failed to fetch jobs');
          setInternships([]);
        }
      } catch (error) {
        console.error('Error fetching internships:', error);
        setInternships([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInternships();
  }, []);

  // Helper function to calculate days ago
  const getDaysAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 14) return '1 week ago';
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  // Sample internship data (OLD - REMOVED)
  /*  const internships = [
     {
       id: 1,
       title: 'Frontend Developer Intern',
       company: 'TechCorp',
       logo: 'https://via.placeholder.com/150',
       location: 'San Francisco, CA',
       type: 'Full-time',
       duration: '3 months',
       posted: '2 days ago',
       deadline: '2023-06-15',
       skills: ['React', 'JavaScript', 'CSS', 'HTML'],
       featured: true
     },
     {
       id: 2,
       title: 'Data Science Intern',
       company: 'DataSystems',
       logo: 'https://via.placeholder.com/150',
       location: 'Remote',
       type: 'Part-time',
       duration: '6 months',
       posted: '1 week ago',
       deadline: '2023-07-01',
       skills: ['Python', 'Pandas', 'Machine Learning', 'SQL'],
       featured: false
     },
     {
       id: 3,
       title: 'UX Design Intern',
       company: 'DesignHub',
       logo: 'https://via.placeholder.com/150',
       location: 'New York, NY',
       type: 'Full-time',
       duration: '4 months',
       posted: '3 days ago',
       deadline: '2023-06-20',
       skills: ['Figma', 'User Research', 'Wireframing', 'Prototyping'],
       featured: false
     },
     {
       id: 4,
       title: 'Backend Developer Intern',
       company: 'ServerTech',
       logo: 'https://via.placeholder.com/150',
       location: 'Austin, TX',
       type: 'Full-time',
       duration: '3 months',
       posted: '5 days ago',
       deadline: '2023-06-25',
       skills: ['Node.js', 'Express', 'MongoDB', 'AWS'],
       featured: true
     },
     {
       id: 5,
       title: 'Marketing Intern',
       company: 'GrowthMarketing',
       logo: 'https://via.placeholder.com/150',
       location: 'Chicago, IL',
       type: 'Part-time',
       duration: '5 months',
       posted: '1 day ago',
       deadline: '2023-06-30',
       skills: ['Social Media', 'Content Creation', 'SEO', 'Analytics'],
       featured: false
     },
     {
       id: 6,
       title: 'DevOps Intern',
       company: 'CloudSolutions',
       logo: 'https://via.placeholder.com/150',
       location: 'Remote',
       type: 'Full-time',
       duration: '6 months',
       posted: '2 weeks ago',
       deadline: '2023-07-10',
       skills: ['Docker', 'Kubernetes', 'CI/CD', 'Linux'],
       featured: false
     }
   ]; */


  // Filter internships based on search and filters
  const filteredInternships = internships.filter(internship => {
    const matchesSearch = internship.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      internship.company.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLocation = filters.location === 'all' ||
      (filters.location === 'remote' ? internship.location === 'Remote' :
        internship.location.includes(filters.location));

    const matchesType = filters.type === 'all' || internship.type === filters.type;
    const matchesDuration = filters.duration === 'all' || internship.duration === filters.duration;

    return matchesSearch && matchesLocation && matchesType && matchesDuration;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-[#003366] via-[#00509E] to-[#003366] pt-24 pb-20 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgdmlld0JveD0iMCAwIDUwIDUwIj48cGF0aCBkPSJNMjUgMTVMMTUgMjVMMjUgMzVMMzUgMjVMMjUgMTVaIiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS13aWR0aD0iMSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIvPjwvc3ZnPg==')] opacity-10 z-0"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#003366]/60 via-transparent to-[#003366]/30 z-0"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Animated heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
              <span className="block text-white drop-shadow-lg">Find Your Dream</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-200 mt-2">Internship</span>
            </h1>

            {/* Subheading with animation */}
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-10 leading-relaxed">
              Discover <span className="font-semibold text-white">200+ opportunities</span> from top companies to kickstart your career journey
            </p>

            {/* Enhanced Search Bar */}
            <div className="max-w-2xl mx-auto relative shadow-2xl rounded-xl overflow-hidden">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-[#00509E]" />
              </div>
              <input
                type="text"
                placeholder="Search internships by role, company, or skills..."
                className="w-full pl-14 pr-32 py-5 bg-white border-2 border-white/20 focus:ring-4 focus:ring-[#00509E]/30 focus:border-white text-gray-800 placeholder-gray-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="absolute right-2 top-2 px-6 py-3 bg-gradient-to-r from-[#00509E] to-[#003366] text-white font-semibold rounded-lg hover:from-[#003366] hover:to-[#00509E] transition-all shadow-lg hover:shadow-xl transform hover:scale-105">
                Search
              </button>
            </div>

            {/* Stats Cards */}
            <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[
                { value: '200+', label: 'Active Internships' },
                { value: '50+', label: 'Partner Companies' },
                { value: '1000+', label: 'Students Placed' }
              ].map((stat, index) => (
                <div
                  key={index}
                  className="bg-white/95 backdrop-blur-sm p-6 rounded-xl shadow-lg border-2 border-white/30 hover:shadow-2xl hover:border-white transition-all transform hover:-translate-y-1"
                >
                  <p className="text-3xl font-bold text-[#003366]">{stat.value}</p>
                  <p className="text-[#00509E] text-sm mt-2 font-medium">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Floating elements */}
        <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-[#00509E]/20 blur-xl z-0"></div>
        <div className="absolute -top-10 -right-10 w-60 h-60 rounded-full bg-white/10 blur-xl z-0"></div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-2">
              <FiFilter className="h-5 w-5 text-[#003366]" />
              <h2 className="text-xl font-semibold text-[#003366]">
                Filter Internships
              </h2>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <select
                className="px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00509E] focus:border-[#003366] text-gray-700 font-medium"
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              >
                <option value="all">All Locations</option>
                <option value="remote">Remote</option>
                <option value="San Francisco">Lahore</option>
                <option value="New York">Karachi</option>
                <option value="Austin">Islamabad</option>
                <option value="Chicago">Rawalpindi</option>
              </select>

              <select
                className="px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00509E] focus:border-[#003366] text-gray-700 font-medium"
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              >
                <option value="all">All Types</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
              </select>

              <select
                className="px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00509E] focus:border-[#003366] text-gray-700 font-medium"
                value={filters.duration}
                onChange={(e) => setFilters({ ...filters, duration: e.target.value })}
              >
                <option value="all">All Durations</option>
                <option value="3 months">3 months</option>
                <option value="4 months">4 months</option>
                <option value="5 months">5 months</option>
                <option value="6 months">6 months</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-[#003366]">
            {filteredInternships.length} {filteredInternships.length === 1 ? 'Opportunity' : 'Opportunities'} Found
          </h3>
          <div className="text-sm text-[#00509E]">
            Sorted by: <span className="font-semibold">Most Recent</span>
          </div>
        </div>

        {/* Internship Listings */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-[#003366] animate-spin"></div>
          </div>
        ) : filteredInternships.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
            {filteredInternships.map((internship) => (
              <InternshipCard key={internship.id} internship={internship} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center">
            <div className="mx-auto max-w-md">
              <FiFilter className="mx-auto h-12 w-12 text-[#00509E]" />
              <h3 className="mt-4 text-xl font-semibold text-[#003366]">
                No internships found
              </h3>
              <p className="mt-2 text-[#00509E]">
                Try adjusting your search or filter criteria
              </p>
            </div>
          </div>
        )}

        {/* Pagination */}
        {filteredInternships.length > 0 && (
          <div className="mt-12 flex justify-center">
            <nav className="flex items-center gap-2">
              <button className="p-2 rounded-lg border-2 border-gray-300 bg-white text-[#003366] hover:bg-[#003366] hover:text-white hover:border-[#003366] disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                <FiChevronLeft className="h-5 w-5" />
              </button>
              <button className="px-4 py-2 rounded-lg border-2 border-[#003366] bg-[#003366] text-white font-semibold shadow-md">
                1
              </button>
              <button className="px-4 py-2 rounded-lg border-2 border-gray-300 bg-white text-[#003366] hover:bg-[#00509E] hover:text-white hover:border-[#00509E] transition-all">
                2
              </button>
              <button className="px-4 py-2 rounded-lg border-2 border-gray-300 bg-white text-[#003366] hover:bg-[#00509E] hover:text-white hover:border-[#00509E] transition-all">
                3
              </button>
              <span className="px-2 py-2 text-[#003366] font-medium">...</span>
              <button className="px-4 py-2 rounded-lg border-2 border-gray-300 bg-white text-[#003366] hover:bg-[#00509E] hover:text-white hover:border-[#00509E] transition-all">
                8
              </button>
              <button className="p-2 rounded-lg border-2 border-gray-300 bg-white text-[#003366] hover:bg-[#003366] hover:text-white hover:border-[#003366] transition-all">
                <FiChevronRight className="h-5 w-5" />
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default InternshipsPage;