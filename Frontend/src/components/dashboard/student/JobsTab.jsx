import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useStudent } from '../../../context/StudentContext';
import { Search, MapPin, Clock, Building2, Calendar, Filter, AlertCircle, CheckCircle, Briefcase, Globe, Code, Send, User, AlertTriangle, FileText, Grid, List, Users, Award, Star, Target, TrendingUp, Zap, Settings, BookOpen, Layers } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Button from '../../../ui/Button';
import Card from '../../../ui/Card';
import Badge from '../../../ui/Badge';
import Input from '../../../ui/Input';
import Select from '../../../ui/Select';
import Modal from '../../../ui/Modal';
import JobCard from './JobCard';
import { jobAPI, applicationAPI, studentAPI } from '../../../services/api';
import LoadingSpinner from '../../../ui/LoadingSpinner';

const JobsTab = ({ setActiveTab, supervisorTabIdx }) => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [paidFilter, setPaidFilter] = useState('');
  const [skillsFilter, setSkillsFilter] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [companySizeFilter, setCompanySizeFilter] = useState('');
  const [experienceFilter, setExperienceFilter] = useState('');
  const [durationFilter, setDurationFilter] = useState('');
  const [salaryRangeFilter, setSalaryRangeFilter] = useState('');
  const [postedDateFilter, setPostedDateFilter] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [selectedJob, setSelectedJob] = useState(null);
  const [showJobModal, setShowJobModal] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const { selectedSupervisor, supervisionRequest, loading: supervisorLoading } = useStudent();
  const [profileData, setProfileData] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [eligibilityData, setEligibilityData] = useState(null);
  const [eligibilityLoading, setEligibilityLoading] = useState(true);
  const [myApplications, setMyApplications] = useState([]);
  const [activeApplication, setActiveApplication] = useState(null);

  // Fetch student profile for completeness check
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setProfileLoading(true);
        const response = await studentAPI.getProfile();
        if (response.success) {
          setProfileData(response.data);
        } else {
          setProfileData(null);
        }
      } catch (error) {
        console.log('Profile not found for new user, this is normal:', error.message);
        setProfileData(null);
      } finally {
        setProfileLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Fetch eligibility status
  useEffect(() => {
    const fetchEligibility = async () => {
      try {
        setEligibilityLoading(true);
        const response = await studentAPI.checkEligibility();
        if (response.success) {
          setEligibilityData(response.data);
        } else {
          setEligibilityData(null);
        }
      } catch (error) {
        console.log('Eligibility check failed, user may need to complete profile:', error.message);
        setEligibilityData(null);
      } finally {
        setEligibilityLoading(false);
      }
    };
    fetchEligibility();
  }, []);

  // Fetch student's applications to check for active ones
  useEffect(() => {
    const fetchMyApplications = async () => {
      try {
        const response = await applicationAPI.getStudentApplications();
        if (response.success) {
          const applications = response.data || [];
          setMyApplications(applications);
          
          // Find any active (non-rejected) application
          const active = applications.find(app => {
            const status = app.applicationStatus || app.overallStatus;
            return status !== 'rejected' && 
                   status !== 'rejected_by_supervisor' && 
                   status !== 'rejected_by_company';
          });
          setActiveApplication(active || null);
          
          console.log('Active application:', active);
        }
      } catch (error) {
        console.log('No applications found or error fetching:', error.message);
        setMyApplications([]);
        setActiveApplication(null);
      }
    };
    fetchMyApplications();
  }, []);

  // Helper function to get apply button text
  // Helper function to get the correct company name
  const getCompanyName = (job) => {
    // Debug log to see what's in the job object
    console.log('Getting company name for job:', {
      _id: job._id,
      jobTitle: job.jobTitle,
      companyName: job.companyName,
      company: job.company,
      postedBy: job.postedBy,
      createdBy: job.createdBy,
      userId: job.userId,
      companyId: job.companyId,
      fullJobObject: job
    });

    // The primary field should be the companyName stored in the job document
    // If companyId is populated, it will have user data, check companyId.name as backup
    const companyName = job.companyName || 
                       job.companyId?.name || 
                       job.companyId?.companyName ||
                       job.company || 
                       job.postedBy || 
                       job.createdBy?.companyName || 
                       job.createdBy?.name ||
                       job.companyDetails?.name ||
                       job.companyInfo?.name ||
                       job.owner?.name ||
                       job.employer?.name ||
                       'Unknown Company';
    
    console.log('Resolved company name:', companyName);
    return companyName;
  };

  const getApplyButtonText = () => {
    if (activeApplication) {
      return "Application Pending";
    }
    if (!selectedSupervisor && !(supervisionRequest && supervisionRequest.status === 'accepted')) {
      return "Select Supervisor to Apply";
    }
    if (!eligibilityData?.eligible) {
      return "Complete Eligibility Requirements";
    }
    return "Apply Now";
  };
  const isProfileComplete = (profile) => {
    if (!profile) return false;
    
    // Required auto-fetched fields (name variations)
    const fullName = profile.fullName || profile.name;
    const requiredAuto = [fullName, profile.email, profile.department, profile.semester, profile.rollNumber];
    
    // Required student-provided fields (check for non-empty strings and valid numbers)
    const cgpa = profile.cgpa && profile.cgpa.toString().trim() !== '';
    const attendance = profile.attendance && profile.attendance.toString().trim() !== '';
    const phoneNumber = profile.phoneNumber && profile.phoneNumber.toString().trim() !== '';
    const backlogs = profile.backlogs !== null && profile.backlogs !== undefined;
    
    // CV/Resume: must exist
    const hasCV = profile.cv && (profile.cv.filename || profile.cv.url);
    
    // Certificates: at least 1
    const certs = profile.certificates || [];
    const hasCertificates = certs.length >= 1;
    
    // All required fields must be present and non-empty
    const autoFieldsComplete = requiredAuto.every(field => field && field.toString().trim() !== '');
    const studentFieldsComplete = cgpa && attendance && phoneNumber && backlogs !== undefined;
    
    return autoFieldsComplete && studentFieldsComplete && hasCV && hasCertificates;
  };

  // Check if student has approved supervisor (either assigned or accepted request)
  const hasApprovedSupervisor = Boolean(
    selectedSupervisor || (supervisionRequest && supervisionRequest.status === 'accepted')
  );

  // Check if student can apply for jobs (needs supervisor, eligibility, complete profile, AND no active application)
  const canApplyForJobs = Boolean(
    hasApprovedSupervisor &&
    eligibilityData?.eligible &&
    isProfileComplete(profileData) &&
    !activeApplication // NEW: Can't apply if already have active application
  );

  // Fetch all jobs on component mount
  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await jobAPI.getAllJobs({ limit: 1000 }); // Fetch all jobs
      const jobsData = response.data || [];
      
      // Debug log to see job data structure
      if (jobsData.length > 0) {
        console.log('Sample job data:', jobsData[0]);
        console.log('Available company fields:', {
          companyName: jobsData[0].companyName,
          company: jobsData[0].company,
          postedBy: jobsData[0].postedBy,
          companyId: jobsData[0].companyId,
          userId: jobsData[0].userId,
          createdBy: jobsData[0].createdBy
        });
      }
      
      setJobs(jobsData);
      setFilteredJobs(jobsData);
      setError(null);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError(err.message);
      setJobs([]);
      setFilteredJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term) => {
    const trimmedTerm = term.trim();
    setSearchTerm(trimmedTerm);
    applyAllFilters({ searchTerm: trimmedTerm });
  };

  const handleLocationFilter = (location) => {
    setLocationFilter(location);
    applyAllFilters({ locationFilter: location });
  };

  const handleTypeFilter = (type) => {
    setTypeFilter(type);
    applyAllFilters({ typeFilter: type });
  };

  const handlePaidFilter = (paid) => {
    setPaidFilter(paid);
    applyAllFilters({ paidFilter: paid });
  };

  const handleSkillsFilter = (skills) => {
    setSkillsFilter(skills);
    applyAllFilters({ skillsFilter: skills });
  };

  const handleIndustryFilter = (industry) => {
    setIndustryFilter(industry);
    applyAllFilters({ industryFilter: industry });
  };

  const handleCompanySizeFilter = (size) => {
    setCompanySizeFilter(size);
    applyAllFilters({ companySizeFilter: size });
  };

  const handleExperienceFilter = (experience) => {
    setExperienceFilter(experience);
    applyAllFilters({ experienceFilter: experience });
  };

  const handleDurationFilter = (duration) => {
    setDurationFilter(duration);
    applyAllFilters({ durationFilter: duration });
  };

  const handleSalaryRangeFilter = (range) => {
    setSalaryRangeFilter(range);
    applyAllFilters({ salaryRangeFilter: range });
  };

  const handlePostedDateFilter = (date) => {
    setPostedDateFilter(date);
    applyAllFilters({ postedDateFilter: date });
  };

  const handleSortBy = (sort) => {
    setSortBy(sort);
    applyAllFilters({ sortBy: sort });
  };

  const applyAllFilters = (updates = {}) => {
    const filters = {
      searchTerm: updates.searchTerm !== undefined ? updates.searchTerm : searchTerm,
      locationFilter: updates.locationFilter !== undefined ? updates.locationFilter : locationFilter,
      typeFilter: updates.typeFilter !== undefined ? updates.typeFilter : typeFilter,
      paidFilter: updates.paidFilter !== undefined ? updates.paidFilter : paidFilter,
      skillsFilter: updates.skillsFilter !== undefined ? updates.skillsFilter : skillsFilter,
      industryFilter: updates.industryFilter !== undefined ? updates.industryFilter : industryFilter,
      companySizeFilter: updates.companySizeFilter !== undefined ? updates.companySizeFilter : companySizeFilter,
      experienceFilter: updates.experienceFilter !== undefined ? updates.experienceFilter : experienceFilter,
      durationFilter: updates.durationFilter !== undefined ? updates.durationFilter : durationFilter,
      salaryRangeFilter: updates.salaryRangeFilter !== undefined ? updates.salaryRangeFilter : salaryRangeFilter,
      postedDateFilter: updates.postedDateFilter !== undefined ? updates.postedDateFilter : postedDateFilter,
      sortBy: updates.sortBy !== undefined ? updates.sortBy : sortBy
    };

    let filtered = [...jobs];

    // Text Search (jobs, companies, skills, descriptions)
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(job => {
        // Search in job title
        const titleMatch = job.jobTitle?.toLowerCase().includes(searchLower);
        
        // Search in job description
        const descMatch = job.jobDescription?.toLowerCase().includes(searchLower);
        
        // Search in company name
        const companyMatch = getCompanyName(job).toLowerCase().includes(searchLower);
        
        // Search in technology stack
        const techMatch = job.technologyStack && job.technologyStack.some(tech => 
          tech.toLowerCase().includes(searchLower)
        );
        
        // Search in skills
        const skillsMatch = job.skills && job.skills.some(skill => 
          skill.toLowerCase().includes(searchLower)
        );
        
        // Search in requirements (handle both string and array)
        let reqMatch = false;
        if (job.requirements) {
          if (Array.isArray(job.requirements)) {
            reqMatch = job.requirements.some(req => 
              req.toLowerCase().includes(searchLower)
            );
          } else {
            reqMatch = job.requirements.toLowerCase().includes(searchLower);
          }
        }
        
        // Search in benefits
        const benefitsMatch = job.benefits?.toLowerCase().includes(searchLower);
        
        // Search in location
        const locationMatch = job.location?.toLowerCase().includes(searchLower);
        
        // Search in work type
        const workTypeMatch = job.workType?.toLowerCase().includes(searchLower);
        
        return titleMatch || descMatch || companyMatch || techMatch || skillsMatch || reqMatch || benefitsMatch || locationMatch || workTypeMatch;
      });
    }

    // Location Filter
    if (filters.locationFilter) {
      filtered = filtered.filter(job => 
        job.location?.toLowerCase().includes(filters.locationFilter.toLowerCase())
      );
    }

    // Work Type Filter
    if (filters.typeFilter) {
      filtered = filtered.filter(job => 
        job.workType?.toLowerCase() === filters.typeFilter.toLowerCase()
      );
    }

    // Salary/Stipend Filter
    if (filters.paidFilter) {
      if (filters.paidFilter === 'paid') {
        filtered = filtered.filter(job => 
          job.salary && job.salary !== 'Unpaid' && job.salary !== '0'
        );
      } else if (filters.paidFilter === 'unpaid') {
        filtered = filtered.filter(job => 
          !job.salary || job.salary === 'Unpaid' || job.salary === '0'
        );
      }
    }

    // Skills Filter
    if (filters.skillsFilter) {
      const skillsLower = filters.skillsFilter.toLowerCase();
      filtered = filtered.filter(job => 
        (job.technologyStack && job.technologyStack.some(tech => 
          tech.toLowerCase().includes(skillsLower)
        )) ||
        (job.skills && job.skills.some(skill => 
          skill.toLowerCase().includes(skillsLower)
        )) ||
        (job.requirements && job.requirements.toLowerCase().includes(skillsLower))
      );
    }

    // Industry Filter
    if (filters.industryFilter) {
      filtered = filtered.filter(job => 
        job.industry?.toLowerCase() === filters.industryFilter.toLowerCase() ||
        job.companyType?.toLowerCase().includes(filters.industryFilter.toLowerCase())
      );
    }

    // Company Size Filter
    if (filters.companySizeFilter) {
      filtered = filtered.filter(job => {
        const size = job.companySize || job.employeeCount || 'Unknown';
        return size.toString().toLowerCase().includes(filters.companySizeFilter.toLowerCase());
      });
    }

    // Experience Level Filter
    if (filters.experienceFilter) {
      filtered = filtered.filter(job => {
        const experience = job.experienceLevel || job.experience || 'entry';
        return experience.toLowerCase() === filters.experienceFilter.toLowerCase();
      });
    }

    // Duration Filter
    if (filters.durationFilter) {
      filtered = filtered.filter(job => {
        const duration = job.duration || job.internshipDuration || '';
        return duration.toLowerCase().includes(filters.durationFilter.toLowerCase());
      });
    }

    // Salary Range Filter
    if (filters.salaryRangeFilter) {
      filtered = filtered.filter(job => {
        if (!job.salary || job.salary === 'Unpaid' || job.salary === '0') return false;
        
        const salaryNum = parseInt(job.salary.replace(/[^\d]/g, '')) || 0;
        
        switch (filters.salaryRangeFilter) {
          case '0-10000':
            return salaryNum >= 0 && salaryNum <= 10000;
          case '10000-25000':
            return salaryNum > 10000 && salaryNum <= 25000;
          case '25000-50000':
            return salaryNum > 25000 && salaryNum <= 50000;
          case '50000+':
            return salaryNum > 50000;
          default:
            return true;
        }
      });
    }

    // Posted Date Filter
    if (filters.postedDateFilter) {
      const now = new Date();
      filtered = filtered.filter(job => {
        if (!job.createdAt && !job.postedDate) return false;
        
        const jobDate = new Date(job.createdAt || job.postedDate);
        const diffTime = now - jobDate;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        switch (filters.postedDateFilter) {
          case 'today':
            return diffDays <= 1;
          case 'week':
            return diffDays <= 7;
          case 'month':
            return diffDays <= 30;
          case '3months':
            return diffDays <= 90;
          default:
            return true;
        }
      });
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'recent':
          return new Date(b.createdAt || b.postedDate || 0) - new Date(a.createdAt || a.postedDate || 0);
        case 'oldest':
          return new Date(a.createdAt || a.postedDate || 0) - new Date(b.createdAt || b.postedDate || 0);
        case 'salary-high':
          const salaryA = parseInt((a.salary || '0').replace(/[^\d]/g, '')) || 0;
          const salaryB = parseInt((b.salary || '0').replace(/[^\d]/g, '')) || 0;
          return salaryB - salaryA;
        case 'salary-low':
          const salaryA2 = parseInt((a.salary || '0').replace(/[^\d]/g, '')) || 0;
          const salaryB2 = parseInt((b.salary || '0').replace(/[^\d]/g, '')) || 0;
          return salaryA2 - salaryB2;
        case 'alphabetical':
          return (a.jobTitle || '').localeCompare(b.jobTitle || '');
        case 'company':
          return getCompanyName(a).localeCompare(getCompanyName(b));
        default:
          return 0;
      }
    });

    setFilteredJobs(filtered);
  };

  // Legacy filterJobs function for compatibility
  const filterJobs = (search, location, type, paid) => {
    applyAllFilters({
      searchTerm: search,
      locationFilter: location,
      typeFilter: type,
      paidFilter: paid
    });
  };

  const handleApply = (job) => {
    // Check if application limit reached
    const currentApplications = job.applicationsCount || 0;
    const applicationLimit = job.applicationLimit || 50;
    
    if (currentApplications >= applicationLimit) {
      toast.error('Application limit has been reached for this job. Please check other opportunities.');
      return;
    }

    setSelectedJob(job);
    setShowApplicationModal(true);
  };

  const handleSubmitApplication = async () => {
    if (!canApplyForJobs) {
      toast.error('Please get supervisor approval before applying');
      return;
    }
    if (!coverLetter.trim()) {
      toast.error('Please write a cover letter');
      return;
    }
    try {
      // Get supervisor ID from either direct selection or supervision request
      const supervisorId = selectedSupervisor 
        ? (selectedSupervisor.id || selectedSupervisor._id)
        : supervisionRequest?.supervisorId;
        
      const applicationData = {
        jobId: selectedJob._id || selectedJob.id,
        supervisorId: supervisorId,
        coverLetter: coverLetter.trim()
      };
      await applicationAPI.submitApplication(applicationData);
      toast.success('Application submitted successfully! Waiting for supervisor approval.');
      
      // Refresh applications to update active application status
      const response = await applicationAPI.getStudentApplications();
      if (response.success) {
        const applications = response.data || [];
        setMyApplications(applications);
        
        // Find the newly submitted application (it will be pending)
        const active = applications.find(app => {
          const status = app.applicationStatus || app.overallStatus;
          return status !== 'rejected' && 
                 status !== 'rejected_by_supervisor' && 
                 status !== 'rejected_by_company';
        });
        setActiveApplication(active || null);
      }
      
      setShowApplicationModal(false);
      setCoverLetter('');
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    }
  };

  const handleViewDetails = (job) => {
    setSelectedJob(job);
    setShowJobModal(true);
  };

  const handleViewCompanyProfile = (job) => {
    // Navigate to Registered Companies tab (index 1) with company information
    const companyName = getCompanyName(job);
    const companyId = job.companyId || job.company_id || job._id;
    
    // Store company info in sessionStorage for the RegisteredCompaniesTab to access
    const companyInfo = {
      name: companyName,
      id: companyId,
      searchFrom: 'jobs',
      timestamp: Date.now()
    };
    
    sessionStorage.setItem('selectedCompany', JSON.stringify(companyInfo));
    
    // Navigate to Registered Companies tab (index 1)
    if (setActiveTab) {
      setActiveTab(1); // Registered Companies tab index
    }
  };

  const locationOptions = [
    { value: '', label: 'All Locations' },
    { value: 'Islamabad', label: 'Islamabad' },
    { value: 'Lahore', label: 'Lahore' },
    { value: 'Karachi', label: 'Karachi' },
    { value: 'Rawalpindi', label: 'Rawalpindi' },
    { value: 'Faisalabad', label: 'Faisalabad' },
    { value: 'Multan', label: 'Multan' },
    { value: 'Peshawar', label: 'Peshawar' },
    { value: 'Quetta', label: 'Quetta' },
    { value: 'Hyderabad', label: 'Hyderabad' },
    { value: 'Gujranwala', label: 'Gujranwala' },
    { value: 'Remote', label: 'Remote/Online' }
  ];

  const typeOptions = [
    { value: '', label: 'All Types' },
    { value: 'Remote', label: 'Remote' },
    { value: 'On-site', label: 'On-site' },
    { value: 'Hybrid', label: 'Hybrid' }
  ];

  const paidOptions = [
    { value: '', label: 'All Stipends' },
    { value: 'paid', label: 'Paid Internships' },
    { value: 'unpaid', label: 'Unpaid/Experience' }
  ];

  const industryOptions = [
    { value: '', label: 'All Industries' },
    { value: 'Technology', label: 'Technology & Software' },
    { value: 'Finance', label: 'Finance & Banking' },
    { value: 'Healthcare', label: 'Healthcare & Medical' },
    { value: 'Education', label: 'Education & Training' },
    { value: 'Marketing', label: 'Marketing & Advertising' },
    { value: 'Engineering', label: 'Engineering & Manufacturing' },
    { value: 'Media', label: 'Media & Communications' },
    { value: 'Consulting', label: 'Consulting & Business' },
    { value: 'Retail', label: 'Retail & E-commerce' },
    { value: 'Government', label: 'Government & NGO' },
    { value: 'Startups', label: 'Startups & Innovation' },
    { value: 'Research', label: 'Research & Development' }
  ];

  const companySizeOptions = [
    { value: '', label: 'Any Company Size' },
    { value: 'startup', label: 'Startup (1-50 employees)' },
    { value: 'small', label: 'Small (51-200 employees)' },
    { value: 'medium', label: 'Medium (201-1000 employees)' },
    { value: 'large', label: 'Large (1000+ employees)' },
    { value: 'enterprise', label: 'Enterprise (5000+ employees)' }
  ];

  const experienceOptions = [
    { value: '', label: 'All Experience Levels' },
    { value: 'entry', label: 'Entry Level (No Experience)' },
    { value: 'beginner', label: 'Beginner (Some Projects)' },
    { value: 'intermediate', label: 'Intermediate (1+ Years)' },
    { value: 'advanced', label: 'Advanced (2+ Years)' }
  ];

  const durationOptions = [
    { value: '', label: 'Any Duration' },
    { value: '1-2', label: '1-2 Months' },
    { value: '2-3', label: '2-3 Months' },
    { value: '3-6', label: '3-6 Months' },
    { value: '6+', label: '6+ Months' },
    { value: 'flexible', label: 'Flexible Duration' }
  ];

  const salaryRangeOptions = [
    { value: '', label: 'Any Salary Range' },
    { value: '0-10000', label: 'PKR 0 - 10,000' },
    { value: '10000-25000', label: 'PKR 10,000 - 25,000' },
    { value: '25000-50000', label: 'PKR 25,000 - 50,000' },
    { value: '50000+', label: 'PKR 50,000+' }
  ];

  const postedDateOptions = [
    { value: '', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: '3months', label: 'Last 3 Months' }
  ];

  const sortByOptions = [
    { value: 'recent', label: 'Most Recent' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'salary-high', label: 'Highest Salary' },
    { value: 'salary-low', label: 'Lowest Salary' },
    { value: 'alphabetical', label: 'Job Title A-Z' },
    { value: 'company', label: 'Company Name A-Z' }
  ];

  const clearAllFilters = () => {
    setSearchTerm('');
    setLocationFilter('');
    setTypeFilter('');
    setPaidFilter('');
    setSkillsFilter('');
    setIndustryFilter('');
    setCompanySizeFilter('');
    setExperienceFilter('');
    setDurationFilter('');
    setSalaryRangeFilter('');
    setPostedDateFilter('');
    setSortBy('recent');
    applyAllFilters({
      searchTerm: '',
      locationFilter: '',
      typeFilter: '',
      paidFilter: '',
      skillsFilter: '',
      industryFilter: '',
      companySizeFilter: '',
      experienceFilter: '',
      durationFilter: '',
      salaryRangeFilter: '',
      postedDateFilter: '',
      sortBy: 'recent'
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchTerm) count++;
    if (locationFilter) count++;
    if (typeFilter) count++;
    if (paidFilter) count++;
    if (skillsFilter) count++;
    if (industryFilter) count++;
    if (companySizeFilter) count++;
    if (experienceFilter) count++;
    if (durationFilter) count++;
    if (salaryRangeFilter) count++;
    if (postedDateFilter) count++;
    return count;
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* 1. Page Title Section */}
        <div className="space-y-3 pb-6 border-b border-gray-200">
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">
            Internship Opportunities
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl">
            Find internship opportunities based on skills, tags, or location
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-[#003366] to-[#00509E] rounded-full mt-4"></div>
        </div>

        {/* 2. Top Stats Cards (3 Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Available Internships Card */}
          <Card className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#003366] rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xl font-semibold text-gray-900">{jobs.length}</p>
                <p className="text-xs text-gray-600 font-medium">Available Internships</p>
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
                <p className="text-xl font-semibold text-gray-900">{filteredJobs.length}</p>
                <p className="text-xs text-gray-600 font-medium">Filtered Results</p>
              </div>
            </div>
          </Card>

          {/* Total Applications Card */}
          <Card className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                <Send className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xl font-semibold text-gray-900">-</p>
                <p className="text-xs text-gray-600 font-medium">Applications Submitted</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Supervisor Status Alert - Only show if no approved supervisor */}
        {!supervisorLoading && !hasApprovedSupervisor && (
          <Card className="bg-amber-50 border border-amber-200 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-amber-900 mb-2">Supervisor Approval Required</h3>
                <p className="text-amber-700 mb-4 leading-relaxed">
                  To apply for internships, you need to have an approved supervisor. This ensures proper guidance throughout your internship journey.
                </p>
                <Button
                  onClick={async () => {
                    if (profileLoading) {
                      toast.error('Checking profile completion...');
                      return;
                    }
                    if (!isProfileComplete(profileData)) {
                      toast.error('Please complete your profile (CGPA, Phone, Attendance, CV, Certificates, etc.) before requesting a supervisor.');
                      return;
                    }
                    if (setActiveTab && supervisorTabIdx !== undefined) setActiveTab(supervisorTabIdx);
                  }}
                  className="bg-[#003366] hover:bg-[#00509E] text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
                >
                  <User className="w-4 h-4 mr-2" />
                  Request Supervision
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* 3. Comprehensive Search & Filter Panel */}
        <Card className="bg-gradient-to-br from-comsats-primary/5 to-comsats-secondary/5 rounded-xl border-2 border-comsats-primary/20 p-5 shadow-lg">
          <div className="space-y-5">
            {/* Enhanced Search Bar with Skills */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search jobs, companies, or skills..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 h-12 text-sm border-2 border-comsats-primary/20 focus:border-comsats-primary focus:ring-3 focus:ring-comsats-primary/15 bg-white rounded-lg font-medium shadow-sm"
                />
              </div>
              <div className="relative">
                <Code className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Filter by skills (React, Python, etc.)..."
                  value={skillsFilter}
                  onChange={(e) => handleSkillsFilter(e.target.value)}
                  className="pl-10 h-12 text-sm border-2 border-comsats-primary/20 focus:border-comsats-primary focus:ring-3 focus:ring-comsats-primary/15 bg-white rounded-lg font-medium shadow-sm"
                />
              </div>
            </div>

            {/* Primary Filters Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {/* Location */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-comsats-primary flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  Location
                </label>
                <Select
                  options={locationOptions}
                  value={locationFilter}
                  onChange={(e) => handleLocationFilter(e.target.value)}
                  className="h-10 border-2 border-comsats-primary/20 focus:border-comsats-primary bg-white rounded-lg font-medium text-sm"
                />
              </div>

              {/* Job Type */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-comsats-primary flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  Work Type
                </label>
                <Select
                  options={typeOptions}
                  value={typeFilter}
                  onChange={(e) => handleTypeFilter(e.target.value)}
                  className="h-10 border-2 border-comsats-primary/20 focus:border-comsats-primary bg-white rounded-lg font-medium text-sm"
                />
              </div>

              {/* Stipend */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-comsats-primary flex items-center gap-1">
                  <span className="w-3 h-3 text-xs font-bold">₹</span>
                  Stipend Type
                </label>
                <Select
                  options={paidOptions}
                  value={paidFilter}
                  onChange={(e) => handlePaidFilter(e.target.value)}
                  className="h-10 border-2 border-comsats-primary/20 focus:border-comsats-primary bg-white rounded-lg font-medium text-sm"
                />
              </div>

              {/* Sort By */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-comsats-primary flex items-center gap-1">
                  <Filter className="w-3 h-3" />
                  Sort By
                </label>
                <Select
                  options={sortByOptions}
                  value={sortBy}
                  onChange={(e) => handleSortBy(e.target.value)}
                  className="h-10 border-2 border-comsats-primary/20 focus:border-comsats-primary bg-white rounded-lg font-medium text-sm"
                />
              </div>
            </div>

            {/* Advanced Filters Toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-comsats-primary/10">
              <Button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="bg-[#003366] hover:bg-[#00509E] text-white border border-[#003366] hover:border-[#00509E] px-3 py-2 rounded-lg font-medium transition-all duration-200 text-sm"
              >
                <Filter className="w-3 h-3 mr-1" />
                {showAdvancedFilters ? 'Hide Advanced' : 'More Filters'}
                {getActiveFiltersCount() > 4 && (
                  <span className="ml-1 bg-white text-[#003366] px-1.5 py-0.5 rounded-full text-xs font-bold">
                    +{getActiveFiltersCount() - 4}
                  </span>
                )}
              </Button>
              
              {getActiveFiltersCount() > 0 && (
                <Button
                  onClick={clearAllFilters}
                  className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 px-3 py-2 rounded-lg font-medium transition-all duration-200 text-sm"
                >
                  Clear All ({getActiveFiltersCount()})
                </Button>
              )}
            </div>

            {/* Advanced Filters Panel */}
            {showAdvancedFilters && (
              <div className="bg-white/70 rounded-lg border border-comsats-primary/20 p-4 space-y-3 shadow-sm backdrop-blur-sm">
                <h4 className="text-sm font-bold text-comsats-primary mb-2">Advanced Filters</h4>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {/* Industry */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700">Industry</label>
                    <Select
                      options={industryOptions}
                      value={industryFilter}
                      onChange={(e) => handleIndustryFilter(e.target.value)}
                      className="h-9 border border-gray-300 focus:border-comsats-primary bg-white rounded-md text-sm"
                    />
                  </div>

                  {/* Company Size */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700">Company Size</label>
                    <Select
                      options={companySizeOptions}
                      value={companySizeFilter}
                      onChange={(e) => handleCompanySizeFilter(e.target.value)}
                      className="h-9 border border-gray-300 focus:border-comsats-primary bg-white rounded-md text-sm"
                    />
                  </div>

                  {/* Experience Level */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700">Experience Level</label>
                    <Select
                      options={experienceOptions}
                      value={experienceFilter}
                      onChange={(e) => handleExperienceFilter(e.target.value)}
                      className="h-9 border border-gray-300 focus:border-comsats-primary bg-white rounded-md text-sm"
                    />
                  </div>

                  {/* Duration */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700">Duration</label>
                    <Select
                      options={durationOptions}
                      value={durationFilter}
                      onChange={(e) => handleDurationFilter(e.target.value)}
                      className="h-9 border border-gray-300 focus:border-comsats-primary bg-white rounded-md text-sm"
                    />
                  </div>

                  {/* Salary Range */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700">Salary Range</label>
                    <Select
                      options={salaryRangeOptions}
                      value={salaryRangeFilter}
                      onChange={(e) => handleSalaryRangeFilter(e.target.value)}
                      className="h-9 border border-gray-300 focus:border-comsats-primary bg-white rounded-md text-sm"
                    />
                  </div>

                  {/* Posted Date */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700">Posted Date</label>
                    <Select
                      options={postedDateOptions}
                      value={postedDateFilter}
                      onChange={(e) => handlePostedDateFilter(e.target.value)}
                      className="h-9 border border-gray-300 focus:border-comsats-primary bg-white rounded-md text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Active Filters Display */}
            {getActiveFiltersCount() > 0 && (
              <div className="bg-white/80 rounded-lg border border-comsats-primary/30 p-3 shadow-md backdrop-blur-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-1 mb-2">
                      <Filter className="w-3 h-3 text-comsats-primary" />
                      <span className="text-xs font-bold text-comsats-primary">Active Filters ({getActiveFiltersCount()}):</span>
                    </div>
                    <div className="flex items-center gap-1 flex-wrap">
                      {searchTerm && (
                        <span className="bg-comsats-primary text-white px-2 py-0.5 rounded-md text-xs font-semibold shadow-sm" style={{backgroundColor: '#003366', color: 'white'}}>
                          Search: {searchTerm.length > 15 ? searchTerm.substring(0, 15) + '...' : searchTerm}
                        </span>
                      )}
                      {locationFilter && (
                        <span className="bg-comsats-secondary text-white px-2 py-0.5 rounded-md text-xs font-semibold shadow-sm" style={{backgroundColor: '#00509E', color: 'white'}}>
                          📍 {locationFilter}
                        </span>
                      )}
                      {typeFilter && (
                        <span className="bg-gray-600 text-white px-2 py-0.5 rounded-md text-xs font-semibold shadow-sm">
                          💼 {typeFilter}
                        </span>
                      )}
                      {paidFilter && (
                        <span className="bg-green-600 text-white px-2 py-0.5 rounded-md text-xs font-semibold shadow-sm">
                          💰 {paidFilter === 'paid' ? 'Paid' : 'Unpaid'}
                        </span>
                      )}
                      {skillsFilter && (
                        <span className="bg-purple-600 text-white px-2 py-0.5 rounded-md text-xs font-semibold shadow-sm">
                          🛠️ {skillsFilter.length > 10 ? skillsFilter.substring(0, 10) + '...' : skillsFilter}
                        </span>
                      )}
                      {industryFilter && (
                        <span className="bg-blue-600 text-white px-2 py-0.5 rounded-md text-xs font-semibold shadow-sm">
                          🏢 {industryFilter}
                        </span>
                      )}
                      {companySizeFilter && (
                        <span className="bg-indigo-600 text-white px-2 py-0.5 rounded-md text-xs font-semibold shadow-sm">
                          👥 {companySizeOptions.find(opt => opt.value === companySizeFilter)?.label?.split('(')[0]}
                        </span>
                      )}
                      {experienceFilter && (
                        <span className="bg-orange-600 text-white px-2 py-0.5 rounded-md text-xs font-semibold shadow-sm">
                          📊 {experienceOptions.find(opt => opt.value === experienceFilter)?.label?.split('(')[0]}
                        </span>
                      )}
                      {durationFilter && (
                        <span className="bg-teal-600 text-white px-2 py-0.5 rounded-md text-xs font-semibold shadow-sm">
                          ⏱️ {durationFilter}
                        </span>
                      )}
                      {salaryRangeFilter && (
                        <span className="bg-emerald-600 text-white px-2 py-0.5 rounded-md text-xs font-semibold shadow-sm">
                          💵 {salaryRangeOptions.find(opt => opt.value === salaryRangeFilter)?.label}
                        </span>
                      )}
                      {postedDateFilter && (
                        <span className="bg-rose-600 text-white px-2 py-0.5 rounded-md text-xs font-semibold shadow-sm">
                          📅 {postedDateOptions.find(opt => opt.value === postedDateFilter)?.label}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={clearAllFilters}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded-md font-medium transition-all duration-200 whitespace-nowrap text-xs"
                  >
                    Clear All
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>        {/* Eligibility Status Warning */}
        {!eligibilityLoading && (!eligibilityData?.eligible || !selectedSupervisor || !isProfileComplete(profileData)) && (
          <Card className="bg-orange-50 border border-orange-200 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-orange-900 mb-3">Application Requirements Checklist</h3>
                <div className="space-y-2 mb-4">
                  {!isProfileComplete(profileData) && (
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-orange-200">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <p className="text-orange-800 font-medium">Complete your profile (CGPA, Phone, Attendance, CV, Certificates)</p>
                    </div>
                  )}
                  {!selectedSupervisor && !(supervisionRequest && supervisionRequest.status === 'accepted') && (
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-orange-200">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <p className="text-orange-800 font-medium">Get approval from a supervisor</p>
                    </div>
                  )}
                  {!eligibilityData?.eligible && (
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-orange-200">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <p className="text-orange-800 font-medium">Meet all eligibility requirements</p>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-3">
                  {!isProfileComplete(profileData) && (
                    <Button
                      onClick={() => setActiveTab && setActiveTab(6)} // Profile tab
                      className="bg-orange-600 text-white border border-orange-600 hover:bg-orange-700 hover:border-orange-700 px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Complete Profile
                    </Button>
                  )}
                  {!selectedSupervisor && !(supervisionRequest && supervisionRequest.status === 'accepted') && (
                    <Button
                      onClick={() => setActiveTab && setActiveTab(supervisorTabIdx)}
                      className="bg-blue-600 text-white border border-blue-600 hover:bg-blue-700 hover:border-blue-700 px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Select Supervisor
                    </Button>
                  )}
                  {!eligibilityData?.eligible && (
                    <Button
                      onClick={() => setActiveTab && setActiveTab(1)} // Eligibility tab
                      className="bg-orange-600 text-white border border-orange-600 hover:bg-orange-700 hover:border-orange-700 px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Check Eligibility
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* 4. View Mode Toggle and Results Counter */}
        {!loading && !error && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-comsats-primary" />
                  <span className="text-gray-900 font-medium">
                    Showing <span className="font-bold text-comsats-primary">{filteredJobs.length}</span> of{' '}
                    <span className="font-semibold text-gray-700">{jobs.length}</span> opportunities
                  </span>
                </div>
                {getActiveFiltersCount() > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="bg-comsats-primary text-white px-3 py-1 rounded-lg text-sm font-semibold shadow-md" style={{backgroundColor: '#003366', color: 'white'}}>
                      {getActiveFiltersCount()} Filter{getActiveFiltersCount() !== 1 ? 's' : ''} Active
                    </span>
                    {(filteredJobs.length !== jobs.length) && (
                      <span className="text-sm text-gray-600 font-medium">
                        ({jobs.length - filteredJobs.length} filtered out)
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* 4. View Mode Toggle */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 hidden sm:block font-medium">View:</span>
              <div className="flex items-center bg-[#F5F6FA] rounded-lg border border-gray-200 p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    viewMode === 'grid' 
                      ? 'bg-[#003366] text-white shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                  <span className="hidden sm:inline">Grid</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    viewMode === 'list' 
                      ? 'bg-[#003366] text-white shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white'
                  }`}
                >
                  <List className="w-4 h-4" />
                  <span className="hidden sm:inline">List</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Job Content States */}
        {loading ? (
          /* Loading State */
          <Card className="p-16 text-center bg-white border border-gray-200 rounded-xl">
            <div className="flex flex-col items-center space-y-6">
              <div className="w-16 h-16 bg-[#F5F6FA] rounded-full flex items-center justify-center">
                <LoadingSpinner className="w-8 h-8 text-[#003366]" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading Opportunities</h3>
                <p className="text-gray-600 max-w-md">Searching through available internship positions...</p>
              </div>
            </div>
          </Card>
        ) : error ? (
          /* Error State */
          <Card className="p-16 text-center bg-white border border-gray-200 rounded-xl">
            <div className="flex flex-col items-center space-y-6">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h3>
                <p className="text-gray-600 mb-6 max-w-md">{error}</p>
                <Button
                  onClick={fetchJobs}
                  className="bg-[#003366] hover:bg-[#00509E] text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
                >
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              </div>
            </div>
          </Card>
        ) : filteredJobs.length === 0 ? (
          /* 6. Empty State Design */
          <Card className="p-16 text-center bg-white border border-gray-200 rounded-xl">
            <div className="flex flex-col items-center space-y-6">
              <div className="w-20 h-20 bg-[#F5F6FA] rounded-full flex items-center justify-center">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No opportunities found</h3>
                <p className="text-gray-600 mb-6 max-w-lg">
                  {getActiveFiltersCount() > 0
                    ? `No internships match your current filters. Try adjusting or clearing some filters to see more opportunities.` 
                    : 'New internship positions will appear here when companies post them.'}
                </p>
                {getActiveFiltersCount() > 0 && (
                  <div className="space-y-3">
                    <div className="text-sm text-gray-500">
                      Active filters: {getActiveFiltersCount()}
                    </div>
                    <Button
                      onClick={clearAllFilters}
                      className="bg-comsats-primary hover:bg-comsats-secondary text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
                    >
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Clear All Filters
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ) : (
          /* 5. Job Cards */
          <div className={`${
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
              : 'space-y-4'
          }`}>
            {filteredJobs.map((job, index) => (
              <JobCard
                key={job._id || job.id}
                job={job}
                index={index}
                viewMode={viewMode}
                canApplyForJobs={canApplyForJobs}
                onViewDetails={handleViewDetails}
                onApply={handleApply}
                onViewCompanyProfile={handleViewCompanyProfile}
                getApplyButtonText={getApplyButtonText}
                activeApplication={activeApplication}
              />
            ))}
          </div>
        )}

      {/* Enhanced Job Details Modal */}
      <Modal
        isOpen={showJobModal}
        onClose={() => setShowJobModal(false)}
        title=""
        size="xl"
        className="max-h-[90vh] overflow-y-auto"
      >
        {selectedJob && (
          <div className="space-y-6">
            {/* Modern Header Section with COMSATS Colors */}
            <div className="relative overflow-hidden bg-gradient-to-r from-[#003366] via-[#00509E] to-[#003366] rounded-lg border border-gray-300 p-4">
              {/* COMSATS themed background pattern */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#003366]/10 to-[#00509E]/10 opacity-50"></div>
              <div className="absolute -top-5 -right-5 w-20 h-20 bg-[#003366]/20 rounded-full blur-xl"></div>
              <div className="absolute -bottom-3 -left-3 w-16 h-16 bg-[#00509E]/20 rounded-full blur-lg"></div>
              
              <div className="relative flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-md transform hover:scale-105 transition-transform duration-200 border border-white/20">
                    <Briefcase className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white mb-1 leading-tight drop-shadow-sm">
                      {selectedJob.jobTitle || selectedJob.title}
                    </h1>
                    <button
                      onClick={() => handleViewCompanyProfile(selectedJob)}
                      className="text-sm font-semibold text-blue-100 hover:text-white hover:underline transition-colors duration-200 flex items-center space-x-1"
                    >
                      <Building2 className="w-4 h-4" />
                      <span>{getCompanyName(selectedJob)}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Info Cards Grid - COMSATS Design */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white rounded-lg border border-gray-300 p-3 hover:border-[#003366] hover:shadow-md transition-all duration-200">
                <div className="flex items-center space-x-2 mb-1">
                  <div className="w-8 h-8 bg-[#F5F6FA] rounded-md flex items-center justify-center border border-gray-200">
                    <MapPin className="w-4 h-4 text-[#003366]" />
                  </div>
                  <span className="text-xs font-medium text-gray-700">Location</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">{selectedJob.location}</p>
              </div>

              <div className="bg-white rounded-lg border border-gray-300 p-3 hover:border-[#003366] hover:shadow-md transition-all duration-200">
                <div className="flex items-center space-x-2 mb-1">
                  <div className="w-8 h-8 bg-[#F5F6FA] rounded-md flex items-center justify-center border border-gray-200">
                    <Clock className="w-4 h-4 text-[#00509E]" />
                  </div>
                  <span className="text-xs font-medium text-gray-700">Duration</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">{selectedJob.duration}</p>
              </div>

              <div className="bg-white rounded-lg border border-gray-300 p-3 hover:border-[#003366] hover:shadow-md transition-all duration-200">
                <div className="flex items-center space-x-2 mb-1">
                  <div className="w-8 h-8 bg-[#F5F6FA] rounded-md flex items-center justify-center border border-gray-200">
                    <span className="text-sm font-bold text-green-600">Rs</span>
                  </div>
                  <span className="text-xs font-medium text-gray-700">Stipend</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">{selectedJob.salary || 'Unpaid'}</p>
              </div>

              <div className="bg-white rounded-lg border border-gray-300 p-3 hover:border-[#003366] hover:shadow-md transition-all duration-200">
                <div className="flex items-center space-x-2 mb-1">
                  <div className="w-8 h-8 bg-[#F5F6FA] rounded-md flex items-center justify-center border border-gray-200">
                    <Globe className="w-4 h-4 text-[#003366]" />
                  </div>
                  <span className="text-xs font-medium text-gray-700">Work Type</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">{selectedJob.workType || selectedJob.type}</p>
              </div>
            </div>

            {/* Status Badges - COMSATS Design */}
            <div className="flex flex-wrap gap-2">
              <span className="bg-[#003366] text-white border-0 px-3 py-1 text-xs font-medium shadow-sm hover:shadow-md transition-shadow duration-200 rounded-md flex items-center">
                <Globe className="w-3 h-3 mr-1" />
                {selectedJob.workType || selectedJob.type}
              </span>

              <span className={`border-0 px-3 py-1 text-xs font-medium shadow-sm hover:shadow-md transition-shadow duration-200 rounded-md flex items-center ${
                  (selectedJob.salary && selectedJob.salary !== 'Unpaid' && selectedJob.salary !== '0')
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-600 text-white'
                }`}>
                <span className="text-xs font-bold mr-1">Rs</span>
                {(selectedJob.salary && selectedJob.salary !== 'Unpaid' && selectedJob.salary !== '0') ? 'Paid Position' : 'Unpaid Position'}
              </span>

              {selectedJob.isUrgent && (
                <span className="bg-red-600 text-white border-0 px-3 py-1 text-xs font-medium shadow-sm hover:shadow-md transition-shadow duration-200 animate-pulse rounded-md flex items-center">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Urgent Hiring
                </span>
              )}
            </div>

            {/* Job Description Section - COMSATS Design */}
            <div className="bg-white rounded-lg border border-gray-300 shadow-sm hover:shadow-md transition-shadow duration-200 p-4">
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-8 h-8 bg-[#003366] rounded-md flex items-center justify-center shadow-sm">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Job Description</h2>
              </div>
              <div className="bg-[#F5F6FA] rounded-md p-3 border border-gray-300 border-l-2 border-l-[#003366]">
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-800 leading-relaxed text-sm break-words overflow-wrap-anywhere whitespace-pre-wrap font-medium">
                    {selectedJob.jobDescription || selectedJob.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Company Section - COMSATS Design */}
            <div className="bg-white rounded-lg border border-gray-300 shadow-sm hover:shadow-md transition-shadow duration-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-[#003366] rounded-md flex items-center justify-center shadow-sm">
                    <Building2 className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">About Company</h2>
                </div>
                <Button
                  onClick={() => handleViewCompanyProfile(selectedJob)}
                  className="bg-[#003366] hover:bg-[#00509E] text-white shadow-sm hover:shadow-md transition-all duration-200 font-medium px-3 py-1.5 rounded-md text-sm"
                >
                  <Building2 className="w-3 h-3 mr-1" />
                  View Profile
                </Button>
              </div>
              
              <div className="bg-[#F5F6FA] rounded-md p-4 border border-gray-300">
                <h3 className="text-base font-semibold text-gray-900 mb-2">
                  {getCompanyName(selectedJob)}
                </h3>
                <div className="prose prose-sm max-w-none mb-3">
                  <p className="text-gray-800 leading-relaxed break-words overflow-wrap-anywhere whitespace-pre-wrap font-medium text-sm">
                    {selectedJob.createdBy?.companyProfile?.about || 
                     selectedJob.companyDescription || 
                     selectedJob.companyInfo || 
                     `${getCompanyName(selectedJob)} is a leading organization offering exciting internship opportunities for students.`}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    {(selectedJob.createdBy?.companyProfile?.employeeCount || selectedJob.companySize) && (
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-white rounded-md flex items-center justify-center border border-gray-200">
                          <User className="w-3 h-3 text-[#003366]" />
                        </div>
                        <span className="text-gray-800 text-sm">Company Size: <span className="font-semibold">{selectedJob.createdBy?.companyProfile?.employeeCount || selectedJob.companySize}</span></span>
                      </div>
                    )}
                    
                    {(selectedJob.createdBy?.companyProfile?.industry || selectedJob.industry) && (
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-white rounded-md flex items-center justify-center border border-gray-200">
                          <Briefcase className="w-3 h-3 text-[#00509E]" />
                        </div>
                        <span className="text-gray-800 text-sm">Industry: <span className="font-semibold">{selectedJob.createdBy?.companyProfile?.industry || selectedJob.industry}</span></span>
                      </div>
                    )}
                    
                    {(selectedJob.createdBy?.companyProfile?.website || selectedJob.companyWebsite) && (
                      <div className="flex items-start space-x-2">
                        <div className="w-6 h-6 bg-white rounded-md flex items-center justify-center flex-shrink-0 border border-gray-200">
                          <Globe className="w-3 h-3 text-[#003366]" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <a 
                            href={(selectedJob.createdBy?.companyProfile?.website || selectedJob.companyWebsite || '').startsWith('http') 
                              ? (selectedJob.createdBy?.companyProfile?.website || selectedJob.companyWebsite) 
                              : `https://${selectedJob.createdBy?.companyProfile?.website || selectedJob.companyWebsite}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#003366] hover:text-[#00509E] hover:underline font-medium break-all"
                            title={selectedJob.createdBy?.companyProfile?.website || selectedJob.companyWebsite}
                          >
                            {(selectedJob.createdBy?.companyProfile?.website || selectedJob.companyWebsite || '').length > 40 
                              ? `${(selectedJob.createdBy?.companyProfile?.website || selectedJob.companyWebsite).substring(0, 40)}...` 
                              : (selectedJob.createdBy?.companyProfile?.website || selectedJob.companyWebsite)}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {(selectedJob.createdBy?.companyProfile?.vision || selectedJob.createdBy?.companyProfile?.mission) && (
                    <div className="bg-white rounded-lg p-4 border border-blue-200">
                      {selectedJob.createdBy?.companyProfile?.vision && (
                        <div className="mb-3">
                          <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                            <CheckCircle className="w-5 h-5 text-blue-600 mr-2" />
                            Vision
                          </h4>
                          <p className="text-gray-700 text-sm leading-relaxed">
                            {selectedJob.createdBy.companyProfile.vision}
                          </p>
                        </div>
                      )}
                      {selectedJob.createdBy?.companyProfile?.mission && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                            <CheckCircle className="w-5 h-5 text-blue-600 mr-2" />
                            Mission
                          </h4>
                          <p className="text-gray-700 text-sm leading-relaxed">
                            {selectedJob.createdBy.companyProfile.mission}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Requirements Section - COMSATS Design */}
            {(selectedJob.requirements && selectedJob.requirements.length > 0) && (
              <div className="bg-white rounded-lg border border-gray-300 shadow-sm hover:shadow-md transition-shadow duration-200 p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-8 h-8 bg-[#003366] rounded-md flex items-center justify-center shadow-sm">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">Requirements</h2>
                </div>
                <div className="bg-[#F5F6FA] rounded-md p-3 border border-gray-300 border-l-2 border-l-[#003366]">
                  <ul className="space-y-2">
                    {selectedJob.requirements.map((req, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <div className="w-4 h-4 bg-[#003366] rounded-full flex items-center justify-center mt-1 flex-shrink-0">
                          <CheckCircle className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-gray-800 leading-relaxed break-words overflow-wrap-anywhere flex-1 font-medium text-sm">
                          {req}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Technology Stack Section - COMSATS Design */}
            {(selectedJob.technologyStack || selectedJob.techStack) && (selectedJob.technologyStack || selectedJob.techStack).length > 0 && (
              <div className="bg-white rounded-lg border border-gray-300 shadow-sm hover:shadow-md transition-shadow duration-200 p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-8 h-8 bg-[#003366] rounded-md flex items-center justify-center shadow-sm">
                    <Code className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">Technology Stack</h2>
                </div>
                <div className="bg-[#F5F6FA] rounded-md p-3 border border-gray-300 border-l-2 border-l-[#003366]">
                  <div className="flex flex-wrap gap-2">
                    {(selectedJob.technologyStack || selectedJob.techStack).map((tech, index) => (
                      <span
                        key={index}
                        className="bg-[#003366] text-white border-0 px-2 py-1 text-xs font-medium shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105 break-words max-w-xs rounded-md flex items-center"
                        title={tech}
                        style={{backgroundColor: '#003366', color: 'white'}}
                      >
                        <Code className="w-3 h-3 mr-1 flex-shrink-0" />
                        <span className="truncate">{tech}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Application Info Section - COMSATS Design */}
            <div className="bg-[#F5F6FA] rounded-lg border border-gray-300 shadow-sm hover:shadow-md transition-shadow duration-200 p-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="bg-white rounded-md p-3 border border-gray-300 shadow-sm">
                    <div className="flex items-center space-x-2 mb-1">
                      <div className="w-8 h-8 bg-[#003366] rounded-md flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-xs font-medium text-gray-800">Application Period</span>
                    </div>
                    <p className="text-gray-900 font-semibold text-sm">
                      {selectedJob.startDate ? new Date(selectedJob.startDate).toLocaleDateString() : 'TBD'} - {selectedJob.endDate ? new Date(selectedJob.endDate).toLocaleDateString() : 'TBD'}
                    </p>
                  </div>

                  <div className="bg-white rounded-md p-3 border border-gray-300 shadow-sm">
                    <div className="flex items-center space-x-2 mb-1">
                      <div className="w-8 h-8 bg-[#00509E] rounded-md flex items-center justify-center">
                        <Clock className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-xs font-medium text-gray-800">Application Deadline</span>
                    </div>
                    <p className="text-gray-900 font-semibold text-sm">
                      {selectedJob.applicationDeadline ? new Date(selectedJob.applicationDeadline).toLocaleDateString() : (selectedJob.deadline ? new Date(selectedJob.deadline).toLocaleDateString() : 'Open')}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="bg-white rounded-md p-4 border border-gray-300 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-xl font-bold text-gray-900">{selectedJob.applicationsCount || selectedJob.applications || 0}</p>
                        <p className="text-xs text-gray-700 font-medium">Applications Received</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-[#003366]">{selectedJob.applicationLimit || 50}</p>
                        <p className="text-xs text-gray-700 font-medium">Application Limit</p>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                      <div 
                        className="bg-[#003366] h-3 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${Math.min(((selectedJob.applicationsCount || 0) / (selectedJob.applicationLimit || 50)) * 100, 100)}%` 
                        }}
                      ></div>
                    </div>

                    {canApplyForJobs && (selectedJob.applicationsCount || 0) < (selectedJob.applicationLimit || 50) ? (
                      <Button
                        onClick={() => handleApply(selectedJob)}
                        className="w-full bg-[#003366] hover:bg-[#00509E] text-white py-2 shadow-md hover:shadow-lg transition-all duration-200 font-medium rounded-md text-sm"
                      >
                        <Send className="w-4 h-4 mr-1" />
                        Apply Now
                      </Button>
                    ) : (selectedJob.applicationsCount || 0) >= (selectedJob.applicationLimit || 50) ? (
                      <Button
                        disabled
                        className="w-full bg-red-500 text-white py-2 cursor-not-allowed opacity-75 rounded-md font-medium text-sm"
                      >
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        Application Limit Reached
                      </Button>
                    ) : (
                      <Button
                        disabled
                        className="w-full bg-gray-500 text-white py-2 cursor-not-allowed opacity-75 rounded-md font-medium text-sm"
                      >
                        {getApplyButtonText()}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
      {/* Beautiful Application Modal */}
      <Modal
        isOpen={showApplicationModal}
        onClose={() => setShowApplicationModal(false)}
        size="lg"
      >
        {selectedJob && (
          <div className="space-y-6">
            {/* Application Header - COMSATS Design */}
            <div className="relative overflow-hidden bg-gradient-to-br from-comsats-primary via-comsats-secondary to-comsats-primary rounded-xl border border-comsats-primary/20 p-5 -mx-6 -mt-6 mb-6 shadow-lg">
              {/* COMSATS background elements */}
              <div className="absolute inset-0 bg-gradient-to-r from-comsats-primary/10 to-comsats-secondary/10"></div>
              <div className="absolute -top-12 -right-12 w-24 h-24 bg-comsats-primary/30 rounded-full blur-xl animate-pulse"></div>
              <div className="absolute -bottom-12 -left-12 w-24 h-24 bg-comsats-secondary/30 rounded-full blur-xl animate-pulse delay-1000"></div>
              
              <div className="relative flex items-center space-x-4">
                <div className="w-14 h-14 bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300 border border-white/20">
                  <Send className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-black text-white mb-1 drop-shadow-sm">Apply Now!</h2>
                  <p className="text-blue-100 font-medium text-sm">Ready to start your internship journey? Let&apos;s make it happen!</p>
                </div>
              </div>

              {/* Job Summary Card */}
              <div className="relative bg-white/90 backdrop-blur-sm rounded-lg p-3 border border-comsats-primary/20 shadow-md mt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-comsats-primary">
                      {selectedJob.jobTitle || selectedJob.title}
                    </h3>
                    <p className="text-gray-700 flex items-center text-xs font-medium mt-0.5">
                      <Building2 className="w-3 h-3 mr-1 text-comsats-secondary" />
                      {getCompanyName(selectedJob)}
                    </p>
                  </div>
                  <span className="bg-comsats-primary text-white border-0 shadow-sm px-3 py-1 rounded-md text-xs font-semibold">
                    {selectedJob.workType || selectedJob.type}
                  </span>
                </div>
              </div>
            </div>

            {/* Status Information */}
            <div>
              {canApplyForJobs ? (
                <div className="bg-gradient-to-r from-comsats-secondary/10 to-comsats-primary/10 border border-comsats-primary/20 rounded-lg p-4 shadow-md">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-comsats-secondary to-comsats-primary rounded-lg flex items-center justify-center shadow-md">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-comsats-primary text-base">Ready to Apply!</h4>
                      <p className="text-gray-700 text-xs font-medium">Your approved supervisor will be included in this application.</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-300 rounded-lg p-4 shadow-md">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center shadow-md">
                      <AlertCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-yellow-900 text-base">Supervisor Approval Required</h4>
                      <p className="text-yellow-700 text-xs font-medium">You must get supervisor approval before applying for internships.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Supervisor Info */}
              {canApplyForJobs && (
                <div className="bg-gradient-to-r from-comsats-primary/5 to-comsats-secondary/5 border border-comsats-primary/15 rounded-lg p-3 mt-3 shadow-sm">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-comsats-secondary to-comsats-primary rounded-lg flex items-center justify-center shadow-md">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 text-xs">Supervisor</p>
                      <p className="text-comsats-primary font-bold text-sm">
                        {selectedSupervisor ? selectedSupervisor.name : supervisionRequest?.supervisorName}
                      </p>
                    </div>
                    <span className="bg-gradient-to-r from-comsats-secondary to-comsats-primary text-white border-0 shadow-sm px-3 py-1 rounded-md text-xs font-semibold">
                      Approved
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Beautiful Cover Letter Section */}
            <div className="bg-white rounded-lg border border-comsats-primary/20 shadow-md p-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-comsats-secondary to-comsats-primary rounded-lg flex items-center justify-center shadow-md">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <label className="block text-base font-bold text-comsats-primary">
                    Cover Letter *
                  </label>
                  <p className="text-gray-700 text-xs font-medium">Write a compelling cover letter explaining your interest in this position</p>
                </div>
              </div>

              <div className="relative">
                <textarea
                  className="w-full px-3 py-3 border border-comsats-primary/20 rounded-lg focus:border-comsats-primary focus:ring-2 focus:ring-comsats-primary/20 transition-all duration-300 text-gray-900 placeholder-gray-500 bg-gradient-to-r from-comsats-primary/5 to-comsats-secondary/5 resize-none overflow-hidden font-medium shadow-inner text-sm"
                  rows="6"
                  placeholder="Dear Hiring Manager,

I am writing to express my interest in the internship position at your company. I am particularly excited about this opportunity because...

[Write about your relevant skills, experiences, and why you're passionate about this role]

I would welcome the opportunity to discuss how my background and enthusiasm align with your team&apos;s needs.

Best regards,
[Your Name]"
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  required
                  style={{ 
                    minHeight: '150px',
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word'
                  }}
                />
                <div className="absolute bottom-3 right-3">
                  <span className={`text-xs px-2 py-1 rounded-md font-semibold shadow-sm ${
                    coverLetter.length >= 100 
                      ? 'bg-comsats-primary text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {coverLetter.length} chars
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-2 flex items-center font-medium">
                <CheckCircle className={`w-3 h-3 mr-1 ${coverLetter.length >= 100 ? 'text-comsats-primary' : 'text-gray-400'}`} />
                Minimum 100 characters recommended
              </p>
            </div>

            {/* Elegant Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-comsats-primary/20">
              <Button
                variant="outline"
                onClick={() => setShowApplicationModal(false)}
                className="px-6 py-2 text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-comsats-primary/30 hover:text-comsats-primary transition-all duration-300 font-semibold rounded-md shadow-sm text-sm"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitApplication}
                disabled={!coverLetter.trim() || !canApplyForJobs}
                className={`px-8 py-2 shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 font-bold rounded-md text-sm ${
                  coverLetter.trim() && canApplyForJobs
                    ? 'bg-gradient-to-r from-comsats-secondary to-comsats-primary hover:from-comsats-primary hover:to-comsats-secondary text-white hover:shadow-xl'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Send className="w-4 h-4 mr-1" />
                Submit Application
              </Button>
            </div>
          </div>
        )}
      </Modal>
      </div>
    </div>
  );
};

JobsTab.propTypes = {
  setActiveTab: PropTypes.func,
  supervisorTabIdx: PropTypes.number
};

export default JobsTab;