import { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import { 
  Search, 
  MapPin, 
  Briefcase, 
  ExternalLink, 
  Eye,
  Building2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Calendar,
  DollarSign,
  Globe,
  Code,
  Send,
  User,
  Users,
  Award,
  Star,
  Target,
  TrendingUp,
  Zap,
  Settings,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import Modal from '../../ui/Modal';

const RegisteredCompaniesTab = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    industry: '',
    location: '',
    companySize: '',
    hasActiveJobs: false
  });
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [companyJobs, setCompanyJobs] = useState([]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState('companies'); // 'companies' or 'appliedJobs'
  const [appliedJobs, setAppliedJobs] = useState([]);
  
  // Job modal state for viewing job details
  const [selectedJob, setSelectedJob] = useState(null);
  const [showJobModal, setShowJobModal] = useState(false);

  const COMPANIES_PER_PAGE = 12;

  // Fetch all companies
  const fetchCompanies = async (page = 1, searchQuery = '', filterData = {}) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: COMPANIES_PER_PAGE,
        search: searchQuery,
        ...filterData
      };
      
      const response = await api.get('/companies', { params });

      setCompanies(response.data.data.companies);
      setTotalPages(response.data.data.totalPages);
      setCurrentPage(response.data.data.currentPage);
    } catch (err) {
      console.error('Error fetching companies:', err);
      setError('Failed to fetch companies');
    } finally {
      setLoading(false);
    }
  };

  // Fetch company details and jobs
  const fetchCompanyDetails = async (companyId) => {
    try {
      const [companyResponse, jobsResponse] = await Promise.all([
        api.get(`/companies/${companyId}`),
        api.get(`/companies/${companyId}/jobs`)
      ]);

      setSelectedCompany(companyResponse.data.data);
      setCompanyJobs(jobsResponse.data.data);
    } catch (err) {
      console.error('Error fetching company details:', err);
      setError('Failed to fetch company details');
    }
  };

  // Fetch applied jobs
  const fetchAppliedJobs = async () => {
    try {
      const response = await api.get('/applications/my-applications');
      setAppliedJobs(response.data.data || []);
    } catch (err) {
      console.error('Error fetching applied jobs:', err);
    }
  };

  useEffect(() => {
    fetchCompanies();
    fetchAppliedJobs();
    
    // Check if we need to highlight a specific company from Jobs tab
    const checkSelectedCompany = () => {
      const storedCompanyInfo = sessionStorage.getItem('selectedCompany');
      if (storedCompanyInfo) {
        try {
          const companyInfo = JSON.parse(storedCompanyInfo);
          if (companyInfo.searchFrom === 'jobs' && companyInfo.name) {
            // Set search term to find the company
            setSearchTerm(companyInfo.name);
            // Clear the stored info after using it
            sessionStorage.removeItem('selectedCompany');
          }
        } catch (error) {
          console.error('Error parsing stored company info:', error);
          sessionStorage.removeItem('selectedCompany');
        }
      }
    };
    
    checkSelectedCompany();
  }, []);

  useEffect(() => {
    const delayedSearch = setTimeout(async () => {
      await fetchCompanies(1, searchTerm, filters);
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm, filters]);

  const openCompanyDetail = useCallback((company) => {
    setSelectedCompany(company);
    fetchCompanyDetails(company._id);
    setShowDetailModal(true);
  }, []);

  // Separate effect for handling company selection from Jobs tab
  useEffect(() => {
    const storedCompanyInfo = sessionStorage.getItem('selectedCompany');
    if (storedCompanyInfo && searchTerm && companies.length > 0) {
      try {
        const companyInfo = JSON.parse(storedCompanyInfo);
        if (companyInfo.searchFrom === 'jobs') {
          // Find the company in the loaded companies and auto-select it
          const foundCompany = companies.find(company => 
            company.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            company.companyName?.toLowerCase().includes(searchTerm.toLowerCase())
          );
          
          if (foundCompany) {
            openCompanyDetail(foundCompany);
            // Clear the stored info after successful selection
            sessionStorage.removeItem('selectedCompany');
          }
        }
      } catch (error) {
        console.error('Error handling stored company info:', error);
        sessionStorage.removeItem('selectedCompany');
      }
    }
  }, [companies, searchTerm, openCompanyDetail]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...filters, [filterType]: value };
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const closeCompanyDetail = () => {
    setShowDetailModal(false);
    setSelectedCompany(null);
    setCompanyJobs([]);
  };

  // Handle opening job details modal
  const handleViewJobDetails = (job) => {
    setSelectedJob(job);
    setShowJobModal(true);
  };

  // Helper function to get company name (similar to JobsTab)
  const getCompanyName = (job) => {
    return job.companyName || 
           job.companyId?.name || 
           job.companyId?.companyName ||
           job.company || 
           job.createdBy?.name || 
           job.createdBy?.companyName || 
           selectedCompany?.companyName || 
           'Unknown Company';
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      fetchCompanies(newPage, searchTerm, filters);
    }
  };

  // Enhanced Company Card Component with Rich Data Display - COMSATS Design
  const CompanyCard = ({ company }) => (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border border-gray-200 group">
      {/* Company Banner */}
      <div className="relative h-28 bg-gradient-to-br from-[#003366] via-[#00509E] to-[#003366] group-hover:from-[#00509E] group-hover:to-[#003366] transition-all duration-300">
        {company.bannerImage ? (
          <img 
            src={`http://localhost:5005/${company.bannerImage.path}`}
            alt={`${company.companyName} banner`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#003366] via-[#00509E] to-[#003366] group-hover:from-[#00509E] group-hover:to-[#003366] transition-all duration-300">
            <Building2 className="w-12 h-12 text-white opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-300" />
          </div>
        )}
        
        {/* Verified Badge */}
        <div className="absolute top-2 right-2">
          <div className="bg-emerald-500 backdrop-blur-sm text-white px-2 py-1 rounded-md text-xs font-bold flex items-center shadow-sm hover:bg-emerald-600 transition-all duration-300">
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            VERIFIED
          </div>
        </div>
        
        {/* Company Logo */}
        <div className="absolute -bottom-6 left-4">
          {company.logoImage ? (
            <img 
              src={`http://localhost:5005/${company.logoImage.path}`}
              alt={`${company.companyName} logo`}
              className="w-12 h-12 rounded-lg border-2 border-white object-cover bg-white shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300"
            />
          ) : (
            <div className="w-12 h-12 rounded-lg border-2 border-white bg-white shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-gray-500" />
            </div>
          )}
        </div>
      </div>

      {/* Company Information */}
      <div className="p-4 pt-8">
        {/* Company Name & Industry */}
        <div className="mb-3">
          <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-[#003366] transition-colors duration-300">
            {company.companyName}
          </h3>
          {company.industry && (
            <div className="flex items-center text-[#003366] bg-[#003366]/5 px-2 py-1 rounded-md mb-1">
              <Briefcase className="w-3 h-3 mr-1" />
              <span className="text-xs font-semibold">{company.industry}</span>
            </div>
          )}
        </div>

        {/* Company Stats */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          {company.foundedYear && (
            <div className="text-center p-2 bg-gray-50 rounded-md">
              <div className="text-sm font-bold text-gray-900">{company.foundedYear}</div>
              <div className="text-xs text-gray-500">Founded</div>
            </div>
          )}
          {company.employeeCount && (
            <div className="text-center p-2 bg-gray-50 rounded-md">
              <div className="text-sm font-bold text-gray-900">{company.employeeCount}</div>
              <div className="text-xs text-gray-500">Employees</div>
            </div>
          )}
        </div>

        {/* Location */}
        {company.location && (
          <div className="flex items-center text-gray-600 mb-2">
            <MapPin className="w-3 h-3 mr-1" />
            <span className="text-xs">{company.location}</span>
          </div>
        )}

        {/* Mission Preview */}
        {company.mission && (
          <div className="mb-2">
            <p className="text-xs text-gray-600 line-clamp-1 italic">
              &ldquo;{company.mission}&rdquo;
            </p>
          </div>
        )}

        {/* Description Preview */}
        {company.description && (
          <div className="mb-2">
            <p className="text-xs text-gray-600 line-clamp-1">
              {company.description}
            </p>
          </div>
        )}

        {/* Active Jobs & Profile Completeness */}
        <div className="flex items-center justify-between mb-3 py-1.5 px-2 bg-gray-50 rounded-md">
          <div className="flex items-center text-green-600">
            <Briefcase className="w-3 h-3 mr-1" />
            <span className="text-xs font-medium">
              {company.activeJobsCount || 0} Active Jobs
            </span>
          </div>
          
          <div className="flex items-center text-[#00509E]">
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-xs font-bold">{company.profileCompleteness}%</span>
          </div>
        </div>

        {/* Social Media Links */}
        {company.socialMedia && (company.socialMedia.linkedin || company.socialMedia.twitter || company.socialMedia.facebook) && (
          <div className="flex items-center space-x-1 mb-3">
            <span className="text-xs text-gray-500">Connect:</span>
            {company.socialMedia.linkedin && (
              <a href={company.socialMedia.linkedin} target="_blank" rel="noopener noreferrer" 
                 className="w-5 h-5 bg-[#003366] rounded text-white flex items-center justify-center hover:bg-[#00509E] transition-colors">
                <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
                </svg>
              </a>
            )}
            {company.socialMedia.twitter && (
              <a href={company.socialMedia.twitter} target="_blank" rel="noopener noreferrer"
                 className="w-6 h-6 bg-sky-500 rounded text-white flex items-center justify-center hover:bg-sky-600 transition-colors">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
            )}
            {company.socialMedia.facebook && (
              <a href={company.socialMedia.facebook} target="_blank" rel="noopener noreferrer"
                 className="w-6 h-6 bg-blue-700 rounded text-white flex items-center justify-center hover:bg-blue-800 transition-colors">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M20 10C20 4.477 15.523 0 10 0S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z" clipRule="evenodd" />
                </svg>
              </a>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <button
            onClick={() => openCompanyDetail(company)}
            className="flex-1 bg-gradient-to-r from-[#003366] to-[#00509E] text-white px-3 py-2 rounded-md hover:from-[#00509E] hover:to-[#003366] transition-all duration-300 flex items-center justify-center text-xs font-semibold shadow-md hover:shadow-lg"
          >
            <Eye className="w-3 h-3 mr-1" />
            View Profile
          </button>
          
          {company.website && company.website !== 'http://localhost:5173/dashboard/company' && (
            <a
              href={company.website}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2 py-2 border border-gray-300 rounded-md hover:border-[#003366] hover:bg-[#003366]/5 transition-all duration-300 flex items-center justify-center group"
            >
              <ExternalLink className="w-3 h-3 text-gray-500 group-hover:text-[#003366]" />
            </a>
          )}
        </div>
      </div>
    </div>
  );

  // Enhanced Company Detail Modal with Complete Profile Information - COMSATS Design
  const CompanyDetailModal = () => {
    if (!selectedCompany) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[85vh] overflow-y-auto shadow-xl">
          {/* Modal Header with Banner */}
          <div className="relative">
            {/* Company Banner */}
            <div className="h-40 bg-gradient-to-r from-[#003366] via-[#00509E] to-[#003366] relative">
              {selectedCompany.bannerImage ? (
                <img 
                  src={`http://localhost:5005/${selectedCompany.bannerImage.path}`}
                  alt={`${selectedCompany.companyName} banner`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-[#003366] via-[#00509E] to-[#003366]">
                  <Building2 className="w-16 h-16 text-white opacity-30" />
                </div>
              )}
              
              {/* Close Button */}
              <button
                onClick={closeCompanyDetail}
                className="absolute top-3 right-3 w-7 h-7 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-md flex items-center justify-center text-white hover:text-gray-200 transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Verified Badge */}
              <div className="absolute top-3 left-3">
                <div className="bg-green-500 text-white px-2 py-1 rounded-md text-xs font-semibold flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  VERIFIED COMPANY
                </div>
              </div>
            </div>

            {/* Company Logo & Basic Info */}
            <div className="relative px-6 pb-4">
              <div className="flex items-end space-x-4 -mt-12">
                {/* Logo */}
                <div className="flex-shrink-0">
                  {selectedCompany.logoImage ? (
                    <img 
                      src={`http://localhost:5005/${selectedCompany.logoImage.path}`}
                      alt={`${selectedCompany.companyName} logo`}
                      className="w-16 h-16 rounded-lg border-2 border-white object-cover bg-white shadow-md"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg border-2 border-white bg-white shadow-md flex items-center justify-center">
                      <Building2 className="w-8 h-8 text-gray-500" />
                    </div>
                  )}
                </div>

                {/* Company Title & Industry */}
                <div className="flex-1 pt-6">
                  <h1 className="text-xl font-bold text-[#003366] mb-1">{selectedCompany.companyName}</h1>
                  <div className="flex items-center space-x-3 text-gray-600">
                    {selectedCompany.industry && (
                      <div className="flex items-center">
                        <Briefcase className="w-4 h-4 mr-1 text-[#00509E]" />
                        <span className="font-medium text-sm">{selectedCompany.industry}</span>
                      </div>
                    )}
                    {selectedCompany.location && (
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1 text-[#003366]" />
                        <span className="text-sm">{selectedCompany.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Company Stats */}
                <div className="flex space-x-2 pt-6">
                  {selectedCompany.foundedYear && (
                    <div className="text-center bg-[#003366]/5 px-3 py-2 rounded-md">
                      <div className="text-sm font-bold text-[#003366]">{selectedCompany.foundedYear}</div>
                      <div className="text-xs text-gray-500">Founded</div>
                    </div>
                  )}
                  {selectedCompany.employeeCount && (
                    <div className="text-center bg-[#00509E]/5 px-3 py-2 rounded-md">
                      <div className="text-sm font-bold text-[#00509E]">{selectedCompany.employeeCount}</div>
                      <div className="text-xs text-gray-500">Employees</div>
                    </div>
                  )}
                  <div className="text-center bg-green-50 px-3 py-2 rounded-md">
                    <div className="text-sm font-bold text-green-600">{selectedCompany.profileCompleteness}%</div>
                    <div className="text-xs text-gray-500">Complete</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Content */}
          <div className="px-6 pb-6">
            {/* Navigation Tabs */}
            <div className="border-b border-gray-200 mb-4">
              <nav className="flex space-x-6">
                <button className="border-b-2 border-[#003366] text-[#003366] font-medium py-2 text-sm">Overview</button>
                <button className="text-gray-500 hover:text-[#003366] py-2 text-sm">Jobs ({companyJobs.length})</button>
                <button className="text-gray-500 hover:text-[#003366] py-2 text-sm">Contact</button>
              </nav>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-4">
                {/* About Company */}
                {selectedCompany.description && (
                  <div className="bg-[#003366]/5 rounded-lg p-4">
                    <h3 className="text-base font-bold text-[#003366] mb-3 flex items-center">
                      <Building2 className="w-4 h-4 mr-2 text-[#00509E]" />
                      About {selectedCompany.companyName}
                    </h3>
                    <p className="text-gray-700 leading-relaxed text-sm">{selectedCompany.description}</p>
                  </div>
                )}

                {/* Mission & Vision */}
                <div className="grid md:grid-cols-2 gap-4">
                  {selectedCompany.mission && (
                    <div className="bg-[#00509E]/5 rounded-lg p-4">
                      <h4 className="text-sm font-bold text-[#00509E] mb-2 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                        </svg>
                        Our Mission
                      </h4>
                      <p className="text-[#00509E] italic text-xs">&ldquo;{selectedCompany.mission}&rdquo;</p>
                    </div>
                  )}

                  {selectedCompany.vision && (
                    <div className="bg-[#003366]/5 rounded-lg p-4">
                      <h4 className="text-sm font-bold text-[#003366] mb-2 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                        Our Vision
                      </h4>
                      <p className="text-[#003366] italic text-xs">&ldquo;{selectedCompany.vision}&rdquo;</p>
                    </div>
                  )}
                </div>

                {/* Values */}
                {selectedCompany.values && (
                  <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="text-sm font-bold text-green-900 mb-2 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                      </svg>
                      Our Values
                    </h4>
                    <p className="text-green-800 text-sm">{selectedCompany.values}</p>
                  </div>
                )}

                {/* Active Jobs */}
                {companyJobs.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h3 className="text-base font-bold text-[#003366] mb-3 flex items-center">
                      <Briefcase className="w-4 h-4 mr-2 text-green-600" />
                      Available Positions ({companyJobs.length})
                    </h3>
                    <div className="space-y-2">
                      {companyJobs.slice(0, 3).map((job, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                          <div>
                            <h4 className="font-semibold text-gray-900 text-sm">{job.jobTitle}</h4>
                            <p className="text-xs text-gray-600">{job.location} • {job.workType}</p>
                          </div>
                          <button 
                            onClick={() => handleViewJobDetails(job)}
                            className="bg-[#003366] text-white px-3 py-1 rounded-md text-xs hover:bg-[#00509E] transition-colors"
                          >
                            Apply Now
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                {/* Contact Information */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="text-base font-bold text-[#003366] mb-3 flex items-center">
                    <svg className="w-4 h-4 mr-1 text-[#00509E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Contact Information
                  </h3>
                  
                  {selectedCompany.contactPerson && (
                    <div className="space-y-2">
                      {selectedCompany.contactPerson.name && (
                        <div>
                          <span className="font-medium text-gray-700 text-xs">Contact Person:</span>
                          <p className="text-gray-900 text-sm">{selectedCompany.contactPerson.name}</p>
                        </div>
                      )}
                      
                      {selectedCompany.contactPerson.designation && (
                        <div>
                          <span className="font-medium text-gray-700 text-xs">Position:</span>
                          <p className="text-gray-900 text-sm">{selectedCompany.contactPerson.designation}</p>
                        </div>
                      )}
                      
                      {selectedCompany.contactPerson.email && (
                        <div>
                          <span className="font-medium text-gray-700 text-xs">Email:</span>
                          <a href={`mailto:${selectedCompany.contactPerson.email}`} 
                             className="block text-[#003366] hover:text-[#00509E] hover:underline break-words overflow-wrap-anywhere text-wrap-anywhere text-sm">
                            {selectedCompany.contactPerson.email}
                          </a>
                        </div>
                      )}
                      
                      {selectedCompany.contactPerson.phone && (
                        <div>
                          <span className="font-medium text-gray-700 text-xs">Phone:</span>
                          <a href={`tel:${selectedCompany.contactPerson.phone}`} 
                             className="block text-[#003366] hover:text-[#00509E] hover:underline text-sm">
                            {selectedCompany.contactPerson.phone}
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Social Media */}
                {selectedCompany.socialMedia && (selectedCompany.socialMedia.linkedin || selectedCompany.socialMedia.twitter || selectedCompany.socialMedia.facebook) && (
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h3 className="text-base font-bold text-[#003366] mb-3">Follow Us</h3>
                    <div className="space-y-2">
                      {selectedCompany.socialMedia.linkedin && (
                        <a href={selectedCompany.socialMedia.linkedin} target="_blank" rel="noopener noreferrer"
                           className="flex items-center space-x-2 text-[#003366] hover:text-[#00509E] transition-colors">
                          <div className="w-6 h-6 bg-[#003366] rounded text-white flex items-center justify-center">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <span className="text-sm">LinkedIn</span>
                        </a>
                      )}
                      
                      {selectedCompany.socialMedia.twitter && (
                        <a href={selectedCompany.socialMedia.twitter} target="_blank" rel="noopener noreferrer"
                           className="flex items-center space-x-2 text-[#00509E] hover:text-[#003366] transition-colors">
                          <div className="w-6 h-6 bg-[#00509E] rounded text-white flex items-center justify-center">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                            </svg>
                          </div>
                          <span className="text-sm">Twitter</span>
                        </a>
                      )}
                      
                      {selectedCompany.socialMedia.facebook && (
                        <a href={selectedCompany.socialMedia.facebook} target="_blank" rel="noopener noreferrer"
                           className="flex items-center space-x-2 text-gray-600 hover:text-[#003366] transition-colors">
                          <div className="w-6 h-6 bg-gray-600 rounded text-white flex items-center justify-center">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M20 10C20 4.477 15.523 0 10 0S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <span className="text-sm">Facebook</span>
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Quick Stats */}
                <div className="bg-gradient-to-br from-[#003366]/5 to-[#00509E]/5 rounded-lg p-4">
                  <h3 className="text-base font-bold text-[#003366] mb-3">Quick Stats</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 text-xs">Profile Completion</span>
                      <div className="flex items-center">
                        <div className="w-12 bg-gray-200 rounded-full h-1.5 mr-2">
                          <div className="bg-green-500 h-1.5 rounded-full" style={{width: `${selectedCompany.profileCompleteness}%`}}></div>
                        </div>
                        <span className="font-bold text-green-600 text-xs">{selectedCompany.profileCompleteness}%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 text-xs">Active Jobs</span>
                      <span className="font-bold text-[#003366] text-xs">{companyJobs.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 text-xs">Industry</span>
                      <span className="font-bold text-[#00509E] text-xs">{selectedCompany.industry}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const AppliedJobsView = () => (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold mb-4">My Applied Jobs</h3>
      
      {appliedJobs.length > 0 ? (
        <div className="space-y-4">
          {appliedJobs.map((application) => (
            <div key={application._id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">
                    {application.job?.title}
                  </h4>
                  <div className="flex items-center text-gray-600 mb-2">
                    <Building2 className="w-4 h-4 mr-2" />
                    <span>{application.job?.companyName}</span>
                  </div>
                  {application.job?.location && (
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(application.job.location)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center"
                      >
                        {application.job.location}
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </div>
                  )}
                </div>
                
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    application.status === 'accepted' ? 'bg-green-100 text-green-800' :
                    application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                  </span>
                  <div className="text-sm text-gray-500 mt-1">
                    Applied: {new Date(application.appliedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              {application.rejectionReason && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                  <p className="text-red-800 text-sm">
                    <strong>Rejection Reason:</strong> {application.rejectionReason}
                  </p>
                </div>
              )}
              
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  <span>Job Type: {application.job?.jobType}</span>
                  {application.job?.salary && (
                    <span className="ml-4">Salary: {application.job.salary}</span>
                  )}
                </div>
                
                <a 
                  href={`/jobs/${application.job?._id}`}
                  className="text-blue-600 hover:underline text-sm"
                >
                  View Job Details
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">You haven&apos;t applied to any jobs yet.</p>
        </div>
      )}
    </div>
  );

  const Pagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-center space-x-2 mt-8">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        {[...Array(totalPages)].map((_, index) => {
          const page = index + 1;
          return (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-4 py-2 rounded-md ${
                currentPage === page
                  ? 'bg-blue-600 text-white'
                  : 'border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          );
        })}
        
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    );
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Header with View Toggle - COMSATS Design */}
      <div className="mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
          <h2 className="text-xl font-bold text-[#003366] mb-3 sm:mb-0">
            {viewMode === 'companies' ? 'Registered Companies' : 'My Applied Jobs'}
          </h2>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode('companies')}
              className={`px-3 py-2 rounded-md transition-colors text-sm font-medium ${
                viewMode === 'companies'
                  ? 'bg-[#003366] text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-[#003366]/10 hover:text-[#003366]'
              }`}
            >
              All Companies
            </button>
            <button
              onClick={() => setViewMode('appliedJobs')}
              className={`px-3 py-2 rounded-md transition-colors text-sm font-medium ${
                viewMode === 'appliedJobs'
                  ? 'bg-[#003366] text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-[#003366]/10 hover:text-[#003366]'
              }`}
            >
              My Applied Jobs
            </button>
          </div>
        </div>

        {/* Information Note for Companies View - COMSATS Colors */}
        {viewMode === 'companies' && (
          <div className="bg-[#003366]/5 border border-[#003366]/20 rounded-lg p-3 mb-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="w-4 h-4 text-[#00509E] mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-2">
                <h3 className="text-xs font-medium text-[#003366]">Verified Companies Only</h3>
                <p className="text-xs text-[#00509E] mt-0.5">
                  Only companies with 100% complete profiles and verified information are displayed. 
                  This ensures you&apos;re viewing legitimate opportunities from established organizations.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {viewMode === 'appliedJobs' ? (
        <AppliedJobsView />
      ) : (
        <>
          {/* Search and Filters - COMSATS Styling */}
          <div className="mb-4 space-y-3">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search companies by name, industry, or location..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] text-sm"
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <select
                value={filters.industry}
                onChange={(e) => handleFilterChange('industry', e.target.value)}
                className="border border-gray-300 rounded-md px-2 py-2 focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] text-sm"
              >
                <option value="">All Industries</option>
                <option value="Technology">Technology</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Finance">Finance</option>
                <option value="Education">Education</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Retail">Retail</option>
                <option value="Other">Other</option>
              </select>

              <select
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                className="border border-gray-300 rounded-md px-2 py-2 focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] text-sm"
              >
                <option value="">All Locations</option>
                <option value="Karachi">Karachi</option>
                <option value="Lahore">Lahore</option>
                <option value="Islamabad">Islamabad</option>
                <option value="Rawalpindi">Rawalpindi</option>
                <option value="Faisalabad">Faisalabad</option>
                <option value="Remote">Remote</option>
              </select>

              <select
                value={filters.companySize}
                onChange={(e) => handleFilterChange('companySize', e.target.value)}
                className="border border-gray-300 rounded-md px-2 py-2 focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] text-sm"
              >
                <option value="">All Sizes</option>
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="201-500">201-500 employees</option>
                <option value="500+">500+ employees</option>
              </select>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.hasActiveJobs}
                  onChange={(e) => handleFilterChange('hasActiveJobs', e.target.checked)}
                  className="rounded border-gray-300 text-[#003366] focus:ring-[#003366]"
                />
                <span className="text-xs text-gray-700">Has Active Jobs</span>
              </label>
            </div>
          </div>

          {/* Companies Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg h-80 animate-pulse shadow-md">
                  <div className="h-28 bg-gradient-to-r from-[#003366]/30 to-[#00509E]/30 rounded-t-lg mb-3"></div>
                  <div className="p-4 space-y-2">
                    <div className="h-5 bg-gray-300 rounded-md w-3/4"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : companies.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {companies.map((company) => (
                  <CompanyCard key={company._id} company={company} />
                ))}
              </div>
              <Pagination />
            </>
          ) : (
            <div className="text-center py-8">
              <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-[#003366] mb-2">No Companies Available</h3>
              <p className="text-gray-500 mb-1 text-sm">
                Only companies with 100% complete profiles are displayed here.
              </p>
              <p className="text-xs text-gray-400">
                Companies must upload all required information including company details, 
                contact information, and verification documents to appear in this listing.
              </p>
            </div>
          )}
        </>
      )}

      {/* Job Details Modal - COMSATS Design */}
      <Modal
        isOpen={showJobModal}
        onClose={() => setShowJobModal(false)}
        size="lg"
      >
        {selectedJob && (
          <div className="space-y-4">
            {/* Job Header - COMSATS Design */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#003366] via-[#00509E] to-[#003366] rounded-lg border border-[#003366]/20 p-4 -mx-6 -mt-6 mb-4 shadow-lg">
              {/* COMSATS background elements */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#003366]/10 to-[#00509E]/10"></div>
              <div className="absolute -top-8 -right-8 w-16 h-16 bg-[#003366]/30 rounded-full blur-lg animate-pulse"></div>
              <div className="absolute -bottom-8 -left-8 w-16 h-16 bg-[#00509E]/30 rounded-full blur-lg animate-pulse delay-1000"></div>
              
              <div className="relative flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-md border border-white/20">
                    <Briefcase className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white mb-0.5">{selectedJob.jobTitle || selectedJob.title}</h2>
                    <p className="text-blue-100 font-medium text-sm">
                      {getCompanyName(selectedJob)}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-md text-xs font-semibold">
                    {selectedJob.workType || selectedJob.type || 'Full-time'}
                  </span>
                </div>
              </div>
            </div>

            {/* Job Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {/* Location */}
              <div className="bg-[#003366]/5 rounded-lg p-3 border border-[#003366]/10">
                <div className="flex items-center space-x-2 mb-1">
                  <div className="w-6 h-6 bg-[#003366] rounded-md flex items-center justify-center">
                    <MapPin className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-xs font-medium text-gray-600">Location</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">{selectedJob.location || 'Not specified'}</p>
              </div>

              {/* Duration */}
              <div className="bg-[#00509E]/5 rounded-lg p-3 border border-[#00509E]/10">
                <div className="flex items-center space-x-2 mb-1">
                  <div className="w-6 h-6 bg-[#00509E] rounded-md flex items-center justify-center">
                    <Clock className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-xs font-medium text-gray-600">Duration</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">{selectedJob.duration || 'Not specified'}</p>
              </div>

              {/* Salary */}
              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <div className="flex items-center space-x-2 mb-1">
                  <div className="w-6 h-6 bg-green-600 rounded-md flex items-center justify-center">
                    <DollarSign className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-xs font-medium text-gray-600">Salary</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">{selectedJob.salary || 'Unpaid'}</p>
              </div>

              {/* Posted Date */}
              <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                <div className="flex items-center space-x-2 mb-1">
                  <div className="w-6 h-6 bg-purple-600 rounded-md flex items-center justify-center">
                    <Calendar className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-xs font-medium text-gray-600">Posted</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  {selectedJob.createdAt ? new Date(selectedJob.createdAt).toLocaleDateString() : 'Recently'}
                </p>
              </div>
            </div>

            {/* Job Description */}
            {selectedJob.description && (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
                <h3 className="text-base font-bold text-[#003366] mb-2 flex items-center">
                  <div className="w-6 h-6 bg-[#003366] rounded-md flex items-center justify-center mr-2">
                    <Briefcase className="w-3 h-3 text-white" />
                  </div>
                  Job Description
                </h3>
                <div className="text-sm text-gray-700 whitespace-pre-wrap">
                  {selectedJob.description}
                </div>
              </div>
            )}

            {/* Requirements */}
            {selectedJob.requirements && (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
                <h3 className="text-base font-bold text-[#00509E] mb-2 flex items-center">
                  <div className="w-6 h-6 bg-[#00509E] rounded-md flex items-center justify-center mr-2">
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                  Requirements
                </h3>
                <div className="text-sm text-gray-700 whitespace-pre-wrap">
                  {selectedJob.requirements}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-[#003366]/20">
              <button
                onClick={() => setShowJobModal(false)}
                className="px-6 py-2 text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-[#003366]/30 hover:text-[#003366] transition-all duration-300 font-medium rounded-md shadow-sm text-sm"
              >
                Close
              </button>
              <button
                onClick={() => {
                  // Store job info and navigate to jobs tab
                  sessionStorage.setItem('selectedJobForApplication', JSON.stringify({
                    ...selectedJob,
                    fromCompaniesTab: true
                  }));
                  setShowJobModal(false);
                  // You can add navigation logic here if needed
                  window.location.hash = '#jobs'; // Simple navigation to jobs tab
                }}
                className="px-8 py-2 bg-gradient-to-r from-[#003366] to-[#00509E] hover:from-[#00509E] hover:to-[#003366] text-white transition-all duration-300 font-bold rounded-md text-sm shadow-md hover:shadow-lg"
              >
                <Send className="w-4 h-4 mr-1 inline" />
                Apply Now
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Company Detail Modal */}
      {showDetailModal && <CompanyDetailModal />}
    </div>
  );
};

export default RegisteredCompaniesTab;
