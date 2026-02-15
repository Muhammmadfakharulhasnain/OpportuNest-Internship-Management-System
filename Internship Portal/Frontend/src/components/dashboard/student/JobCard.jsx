import { 
  Briefcase, Building2, MapPin, Clock, DollarSign, 
  Eye, Send, AlertTriangle, User, Calendar, Globe,
  Code, Users, Tag
} from 'lucide-react';
import Card from '../../../ui/Card';
import Badge from '../../../ui/Badge';
import Button from '../../../ui/Button';
import PropTypes from 'prop-types';

const JobCard = ({ 
  job, 
  index, 
  viewMode = 'grid',
  canApplyForJobs = false,
  onViewDetails,
  onApply,
  onViewCompanyProfile,
  getApplyButtonText,
  activeApplication = null
}) => {
  
  // Check if this specific job has an application
  const hasAppliedToThisJob = activeApplication && 
    (activeApplication.jobId === job._id || activeApplication.jobId?._id === job._id);
  
  // Determine if button should be disabled
  const isApplyDisabled = !canApplyForJobs || 
    (job.applicationsCount || 0) >= (job.applicationLimit || 50) ||
    Boolean(activeApplication); // Disable if ANY active application exists
  // Helper function to get the correct company name
  const getCompanyName = (job) => {
    // The primary field should be the companyName stored in the job document
    // If companyId is populated, it will have user data, check companyId.name as backup
    return job.companyName || 
           job.companyId?.name || 
           job.companyId?.companyName ||
           job.company || 
           job.postedBy || 
           job.createdBy?.companyName || 
           job.createdBy?.name ||
           job.companyDetails?.name ||
           job.companyInfo?.name ||
           'Unknown Company';
  };

  // List view layout - COMSATS Professional Design
  if (viewMode === 'list') {
    return (
      <Card className="group border-2 border-gray-300 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 bg-white hover:border-[#003366]">
        <div className="p-5">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Left Section - Icon & Title */}
            <div className="flex items-start space-x-4 flex-1 min-w-0">
              <div className="w-14 h-14 bg-gradient-to-br from-[#003366] to-[#00509E] rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                <Briefcase className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-bold text-gray-900">
                    {job.jobTitle || job.title}
                  </h3>
                </div>
                <button
                  onClick={() => onViewCompanyProfile && onViewCompanyProfile(job)}
                  className="flex items-center space-x-2 text-gray-600 mb-3 hover:text-[#003366] transition-colors duration-200"
                  title={`View ${getCompanyName(job)} Profile`}
                >
                  <Building2 className="w-4 h-4 text-[#00509E]" />
                  <span className="font-medium text-sm">{getCompanyName(job)}</span>
                </button>
                
                {/* Job Info Row */}
                <div className="flex flex-wrap gap-2 mb-3">
                  <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-100">
                    <MapPin className="w-4 h-4 text-[#003366]" />
                    <span className="text-sm text-gray-800 font-medium">{job.location}</span>
                  </div>
                  <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-100">
                    <Clock className="w-4 h-4 text-[#003366]" />
                    <span className="text-sm text-gray-800 font-medium">{job.workType || job.type}</span>
                  </div>
                  <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-100">
                    <Calendar className="w-4 h-4 text-[#003366]" />
                    <span className="text-sm text-gray-800 font-medium">{job.duration || '3 Months'}</span>
                  </div>
                  <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-100">
                    {(job.salary && job.salary !== 'Unpaid' && job.salary !== '0') ? (
                      <>
                        <span className="text-sm text-[#003366] font-bold">Rs</span>
                        <span className="text-sm text-gray-800 font-bold">{job.salary}</span>
                      </>
                    ) : (
                      <>
                        <Globe className="w-4 h-4 text-[#003366]" />
                        <span className="text-sm text-gray-800 font-medium">Unpaid</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Tags */}
                {job.tags && job.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {(Array.isArray(job.tags) ? job.tags : job.tags.split(',')).slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs font-medium rounded-md flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Section - Stats & Actions */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 lg:border-l-2 lg:border-gray-200 lg:pl-4">
              {/* Application Stats */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border-2 border-blue-200 min-w-[200px]">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-[#003366]" />
                  <span className="text-sm text-gray-700 font-semibold">Applications</span>
                </div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-3xl font-bold text-[#003366]">
                    {job.applicationsCount || job.applications || 0}
                  </span>
                  <span className="text-lg text-gray-500 font-medium">/{job.applicationLimit || 50}</span>
                </div>
                {(job.applicationDeadline || job.deadline) && (
                  <div className="text-xs text-gray-600">
                    <span className="font-medium">Deadline: </span>
                    <span className="font-bold text-gray-800">
                      {new Date(job.applicationDeadline || job.deadline).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {(job.applicationsCount || 0) >= (job.applicationLimit || 50) && (
                  <Badge variant="danger" className="mt-2 text-xs font-bold w-full text-center">
                    ⚠ Position Full
                  </Badge>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 min-w-[120px]">
                <Button
                  onClick={() => onViewDetails(job)}
                  className="border-2 border-[#003366] text-[#003366] hover:bg-[#003366] hover:text-white hover:[&_*]:text-white font-bold py-2.5 transition-all duration-200 w-full"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View
                </Button>
              
              {!isApplyDisabled ? (
                <Button
                  onClick={() => onApply(job)}
                  className="bg-[#003366] hover:bg-[#00509E] text-white font-bold py-2.5 transition-all duration-200 w-full"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Apply
                </Button>
              ) : (job.applicationsCount || 0) >= (job.applicationLimit || 50) ? (
                <Button
                  className="border-2 border-red-600 bg-red-500 text-white cursor-not-allowed font-bold py-2.5 transition-all duration-200 w-full disabled:opacity-100 hover:bg-red-500"
                  disabled
                  title="Job has reached maximum hired students"
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Slots Full
                </Button>
              ) : hasAppliedToThisJob ? (
                <Button
                  className="border-2 border-blue-500 bg-blue-100 text-blue-700 cursor-not-allowed font-bold py-2.5 transition-all duration-200 w-full"
                  disabled
                  title="You have already applied to this job"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Applied
                </Button>
              ) : activeApplication ? (
                <Button
                  className="border-2 border-blue-500 bg-blue-100 text-blue-700 cursor-not-allowed font-bold py-2.5 transition-all duration-200 w-full"
                  disabled
                  title="You have an active application to another job"
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Pending Job
                </Button>
              ) : (
                <Button
                  className="bg-[#003366] text-white cursor-not-allowed font-bold py-2.5 transition-all duration-200 w-full"
                  disabled
                >
                  <User className="w-4 h-4 mr-2" />
                  {getApplyButtonText()}
                </Button>
              )}
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Grid view layout - COMSATS Modern Premium Design
  return (
    <Card className="group relative border-2 border-gray-300 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 bg-white hover:border-[#003366] overflow-hidden">
      <div className="p-5 h-full flex flex-col">
        {/* Header Section */}
        <div className="flex items-start space-x-3 mb-4 pb-4 border-b-2 border-gray-100">
          <div className="w-12 h-12 bg-gradient-to-br from-[#003366] to-[#00509E] rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
            <Briefcase className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 leading-tight">
              {job.jobTitle || job.title}
            </h3>
            <button
              onClick={() => onViewCompanyProfile && onViewCompanyProfile(job)}
              className="flex items-center space-x-2 text-gray-600 hover:text-[#003366] transition-colors duration-200"
              title={`View ${getCompanyName(job)} Profile`}
            >
              <Building2 className="w-4 h-4 text-[#00509E]" />
              <span className="font-medium text-sm truncate">{getCompanyName(job)}</span>
            </button>
          </div>
        </div>

        {/* Job Details */}
        <div className="space-y-3 mb-4 flex-1">
          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center space-x-2 p-2.5 bg-blue-50 rounded-lg border border-blue-100">
              <MapPin className="w-4 h-4 text-[#003366] flex-shrink-0" />
              <span className="text-sm text-gray-800 font-medium truncate">{job.location}</span>
            </div>
            <div className="flex items-center space-x-2 p-2.5 bg-blue-50 rounded-lg border border-blue-100">
              <Clock className="w-4 h-4 text-[#003366] flex-shrink-0" />
              <span className="text-sm text-gray-800 font-medium truncate">{job.workType || job.type}</span>
            </div>
            <div className="flex items-center space-x-2 p-2.5 bg-blue-50 rounded-lg border border-blue-100">
              <Calendar className="w-4 h-4 text-[#003366] flex-shrink-0" />
              <span className="text-sm text-gray-800 font-medium truncate">{job.duration || '3 Months'}</span>
            </div>
            <div className="flex items-center space-x-2 p-2.5 bg-blue-50 rounded-lg border border-blue-100">
              {(job.salary && job.salary !== 'Unpaid' && job.salary !== '0') ? (
                <>
                  <span className="text-sm text-[#003366] font-bold flex-shrink-0">Rs</span>
                  <span className="text-sm text-gray-800 font-bold truncate">{job.salary}</span>
                </>
              ) : (
                <>
                  <Globe className="w-4 h-4 text-[#003366] flex-shrink-0" />
                  <span className="text-sm text-gray-800 font-medium truncate">Unpaid</span>
                </>
              )}
            </div>
          </div>

          {/* Dates */}
          {(job.startDate || job.endDate) && (
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <div className="grid grid-cols-2 gap-2 text-xs">
                {job.startDate && (
                  <div>
                    <span className="text-gray-500 font-medium">Start:</span>
                    <span className="text-gray-800 font-semibold ml-1">
                      {new Date(job.startDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {job.endDate && (
                  <div>
                    <span className="text-gray-500 font-medium">End:</span>
                    <span className="text-gray-800 font-semibold ml-1">
                      {new Date(job.endDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Previous Type section - keeping the rest of code */}
          <div className="hidden">
            <div className="flex items-center space-x-1 p-1.5 bg-gray-50 rounded text-xs">
              <Globe className="w-3 h-3 text-[#003366]" />
              <span className="text-gray-700 font-medium">{job.workType || job.type}</span>
            </div>
          </div>



          {/* Skills */}
          {(job.technologyStack || job.requiredSkills) && (job.technologyStack || job.requiredSkills).length > 0 && (
            <div className="bg-gray-50 rounded p-1.5">
              <div className="flex flex-wrap gap-1">
                {(job.technologyStack || job.requiredSkills).slice(0, 2).map((skill, idx) => (
                  <span key={idx} className="bg-[#003366] text-white text-xs px-1.5 py-0.5 rounded font-medium">
                    {skill}
                  </span>
                ))}
                {(job.technologyStack || job.requiredSkills).length > 2 && (
                  <span className="bg-gray-600 text-white text-xs px-1.5 py-0.5 rounded font-medium">
                    +{(job.technologyStack || job.requiredSkills).length - 2}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Application Status */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg border-2 border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#003366]" />
                <span className="text-sm text-gray-700 font-semibold">Applications</span>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold text-[#003366]">
                  {job.applicationsCount || job.applications || 0}
                </span>
                <span className="text-gray-500 font-medium">/{job.applicationLimit || 50}</span>
                {(job.applicationsCount || 0) >= (job.applicationLimit || 50) && (
                  <Badge variant="danger" className="ml-2 text-xs font-bold">
                    ⚠ Full
                  </Badge>
                )}
              </div>
            </div>
            {(job.applicationDeadline || job.deadline) && (
              <div className="mt-2 pt-2 border-t border-blue-200">
                <span className="text-xs text-gray-600 font-medium">Deadline: </span>
                <span className="text-xs text-gray-800 font-bold">
                  {new Date(job.applicationDeadline || job.deadline).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t-2 border-gray-200">
          <Button
            onClick={() => onViewDetails(job)}
            className="flex-1 border-2 border-[#003366] text-[#003366] hover:bg-[#003366] hover:text-white hover:[&_*]:text-white font-bold py-2.5 rounded-lg transition-all duration-200 text-xs"
          >
            <Eye className="w-4 h-4 mr-1" />
            View
          </Button>
          
          {!isApplyDisabled ? (
            <Button
              onClick={() => onApply(job)}
              className="flex-1 bg-[#003366] hover:bg-[#00509E] text-white font-bold py-2.5 rounded-lg transition-all duration-200 text-xs"
            >
              <Send className="w-4 h-4 mr-1" />
              Apply
            </Button>
          ) : (job.applicationsCount || 0) >= (job.applicationLimit || 50) ? (
            <Button
              className="flex-1 border-2 border-red-600 bg-red-500 text-white cursor-not-allowed font-bold py-2.5 rounded-lg text-xs disabled:opacity-100 hover:bg-red-500"
              disabled
              title="Job has reached maximum hired students"
            >
              <AlertTriangle className="w-4 h-4 mr-1" />
              Slots Full
            </Button>
          ) : hasAppliedToThisJob ? (
            <Button
              className="flex-1 border-2 border-blue-500 bg-blue-100 text-blue-700 cursor-not-allowed font-bold py-2.5 rounded-lg text-xs"
              disabled
              title="You have already applied to this job"
            >
              <Clock className="w-4 h-4 mr-1" />
              Applied
            </Button>
          ) : activeApplication ? (
            <Button
              className="flex-1 border-2 border-blue-500 bg-blue-100 text-blue-700 cursor-not-allowed font-bold py-2.5 rounded-lg text-xs"
              disabled
              title="You have an active application to another job"
            >
              <AlertTriangle className="w-4 h-4 mr-1" />
              Pending
            </Button>
          ) : (
            <Button
              className="flex-1 bg-[#003366] text-white cursor-not-allowed font-bold py-2.5 rounded-lg text-xs"
              disabled
            >
              <User className="w-4 h-4 mr-1" />
              {getApplyButtonText()}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

JobCard.propTypes = {
  job: PropTypes.shape({
    _id: PropTypes.string,
    id: PropTypes.string,
    jobTitle: PropTypes.string,
    title: PropTypes.string,
    companyName: PropTypes.string,
    company: PropTypes.string,
    location: PropTypes.string,
    type: PropTypes.string,
    workType: PropTypes.string,
    isPaid: PropTypes.string,
    salary: PropTypes.string,
    description: PropTypes.string,
    jobDescription: PropTypes.string,
    requirements: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string)
    ]),
    duration: PropTypes.string,
    deadline: PropTypes.string,
    applicationDeadline: PropTypes.string,
    applicationsCount: PropTypes.number,
    applications: PropTypes.number,
    applicationLimit: PropTypes.number,
    requiredSkills: PropTypes.arrayOf(PropTypes.string),
    technologyStack: PropTypes.arrayOf(PropTypes.string)
  }).isRequired,
  index: PropTypes.number,
  viewMode: PropTypes.oneOf(['grid', 'list']),
  canApplyForJobs: PropTypes.bool,
  onViewDetails: PropTypes.func.isRequired,
  onApply: PropTypes.func.isRequired,
  onViewCompanyProfile: PropTypes.func,
  getApplyButtonText: PropTypes.func.isRequired,
  activeApplication: PropTypes.object
};

export default JobCard;