import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Card from '../../../ui/Card';
import Button from '../../../ui/Button';
import Input from '../../../ui/Input';
import { internshipAppraisalAPI } from '../../../services/api';
import InternshipAppraisalForm from './InternshipAppraisalForm';
import { 
  Plus as PlusIcon, 
  Eye as EyeIcon, 
  Trash2 as TrashIcon,
  Star as StarIcon,
  Calendar as CalendarIcon,
  User as UserIcon,
  FileText as DocumentTextIcon,
  Search,
  Award,
  TrendingUp,
  Hash,
  Filter,
  SlidersHorizontal,
  ChevronDown,
  X
} from 'lucide-react';
import './InternshipAppraisalTab.css';

const InternshipAppraisalTab = () => {
  const [appraisals, setAppraisals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedAppraisal, setSelectedAppraisal] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('submissionDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchAppraisals();
  }, []);

  const fetchAppraisals = async () => {
    try {
      setLoading(true);
      const response = await internshipAppraisalAPI.getCompanyAppraisals();
      
      if (response.success) {
        setAppraisals(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching appraisals:', error);
      toast.error('Failed to load appraisals');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAppraisal = () => {
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    fetchAppraisals(); // Refresh the list
  };

  const handleViewDetails = async (appraisalId) => {
    try {
      const response = await internshipAppraisalAPI.getAppraisalById(appraisalId);
      if (response.success) {
        setSelectedAppraisal(response.data);
        setShowDetails(true);
      }
    } catch (error) {
      console.error('Error fetching appraisal details:', error);
      toast.error('Failed to load appraisal details');
    }
  };

  const handleDeleteAppraisal = async (appraisalId) => {
    if (!window.confirm('Are you sure you want to delete this appraisal? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await internshipAppraisalAPI.deleteAppraisal(appraisalId);
      if (response.success) {
        toast.success('Appraisal deleted successfully');
        fetchAppraisals();
      }
    } catch (error) {
      console.error('Error deleting appraisal:', error);
      toast.error('Failed to delete appraisal');
    }
  };

  const getPerformanceBadgeColor = (performance) => {
    const colors = {
      'Excellent': 'bg-green-100 text-green-800',
      'Good': 'bg-blue-100 text-blue-800',
      'Average': 'bg-yellow-100 text-yellow-800',
      'Needs Improvement': 'bg-orange-100 text-orange-800',
      'Poor': 'bg-red-100 text-red-800'
    };
    return colors[performance] || 'bg-gray-100 text-gray-800';
  };

  const getRecommendationBadgeColor = (recommendation) => {
    const colors = {
      'Highly Recommend': 'bg-green-100 text-green-800',
      'Recommend': 'bg-blue-100 text-blue-800',
      'Neutral': 'bg-gray-100 text-gray-800',
      'Do Not Recommend': 'bg-red-100 text-red-800'
    };
    return colors[recommendation] || 'bg-gray-100 text-gray-800';
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <StarIcon key={i} className="rating-star h-5 w-5 text-yellow-400" fill="currentColor" />
        );
      } else {
        stars.push(
          <StarIcon key={i} className="h-5 w-5 text-gray-300" />
        );
      }
    }
    
    return (
      <div className="flex items-center space-x-1">
        <div className="flex">{stars}</div>
      </div>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Filter and sort appraisals
  const getFilteredAppraisals = () => {
    return appraisals
      .filter(appraisal => {
        const searchLower = searchTerm.toLowerCase();
        return (
          appraisal.studentName.toLowerCase().includes(searchLower) ||
          appraisal.internshipTitle.toLowerCase().includes(searchLower) ||
          appraisal.overallPerformance.toLowerCase().includes(searchLower) ||
          (appraisal.studentRollNo && appraisal.studentRollNo.toLowerCase().includes(searchLower))
        );
      })
      .sort((a, b) => {
        let aValue, bValue;
        
        switch (sortBy) {
          case 'studentName':
            aValue = a.studentName.toLowerCase();
            bValue = b.studentName.toLowerCase();
            break;
          case 'rating':
            aValue = a.rating;
            bValue = b.rating;
            break;
          case 'overallPerformance':
            aValue = a.overallPerformance;
            bValue = b.overallPerformance;
            break;
          case 'submissionDate':
          default:
            aValue = new Date(a.submissionDate);
            bValue = new Date(b.submissionDate);
            break;
        }
        
        if (sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
  };

  const filteredAndSortedAppraisals = getFilteredAppraisals();

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 h-32 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in-up">
      {/* COMSATS Header Section */}
      <div className="bg-gradient-to-r from-[#003366] to-[#00509E] rounded-xl p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="bg-white/10 backdrop-blur-sm p-3 rounded-lg border border-white/20">
              <Award className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Internship Appraisals</h2>
              <p className="text-blue-100">Evaluate and provide feedback on intern performance</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-lg border border-white/20 transition-all duration-200"
            >
              <Filter className="h-4 w-4" />
              <span className="font-medium">Filters</span>
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
            </button>
            <button
              onClick={handleCreateAppraisal}
              className="flex items-center gap-2 px-6 py-2.5 bg-white hover:bg-blue-50 text-[#003366] rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <PlusIcon className="h-5 w-5" />
              <span>Create Appraisal</span>
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-white/20">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-100" />
                <input
                  type="text"
                  placeholder="Search by name, roll number, or performance..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-100 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                <option value="submissionDate" className="bg-[#003366] text-white">Sort by Date</option>
                <option value="studentName" className="bg-[#003366] text-white">Sort by Student</option>
                <option value="rating" className="bg-[#003366] text-white">Sort by Rating</option>
                <option value="overallPerformance" className="bg-[#003366] text-white">Sort by Performance</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all duration-200 font-bold"
              >
                {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Appraisals List */}
      {filteredAndSortedAppraisals.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-12 text-center">
          <div className="flex flex-col items-center">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-full mb-6">
              <Award className="h-16 w-16 text-[#003366]" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">No Appraisals Found</h3>
            <p className="text-gray-600 text-base mb-6 max-w-md">
              {searchTerm ? 'No appraisals match your search criteria. Try adjusting your filters.' : 'You haven\'t created any internship appraisals yet. Click the button below to create your first appraisal.'}
            </p>
            {!searchTerm && (
              <button
                onClick={handleCreateAppraisal}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#003366] to-[#00509E] hover:from-[#003366]/90 hover:to-[#00509E]/90 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <PlusIcon className="h-5 w-5" />
                Create Your First Appraisal
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAndSortedAppraisals.map((appraisal) => (
            <div key={appraisal._id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200 p-6">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-[#003366] to-[#00509E] flex items-center justify-center text-white font-bold text-xl shadow-md">
                    {appraisal.studentName.charAt(0).toUpperCase()}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">
                        {appraisal.studentName}
                      </h3>
                      <p className="text-gray-600 text-sm mb-1">{appraisal.internshipTitle}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Hash className="w-3 h-3" />
                        <span className="font-mono">#{appraisal._id?.slice(-6)}</span>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap ${getPerformanceBadgeColor(appraisal.overallPerformance)}`}>
                      <Award className="w-3 h-3 mr-1" />
                      {appraisal.overallPerformance}
                    </span>
                  </div>

                  {/* Info Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg border border-blue-200">
                      <p className="text-xs text-blue-700 font-semibold mb-1 flex items-center gap-1">
                        <StarIcon className="w-3 h-3" />
                        Rating
                      </p>
                      <div className="flex items-center gap-1">
                        {renderStars(appraisal.rating)}
                        <span className="text-xs font-bold text-gray-700 ml-1">({appraisal.rating}/5)</span>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg border border-blue-200">
                      <p className="text-xs text-blue-700 font-semibold mb-1 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        Recommendation
                      </p>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold ${getRecommendationBadgeColor(appraisal.recommendation)}`}>
                        {appraisal.recommendation}
                      </span>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg border border-blue-200">
                      <p className="text-xs text-blue-700 font-semibold mb-1 flex items-center gap-1">
                        <CalendarIcon className="w-3 h-3" />
                        Duration
                      </p>
                      <p className="text-sm font-bold text-gray-900">{appraisal.duration}</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg border border-blue-200">
                      <p className="text-xs text-blue-700 font-semibold mb-1 flex items-center gap-1">
                        <CalendarIcon className="w-3 h-3" />
                        Submitted
                      </p>
                      <p className="text-sm font-bold text-gray-900">{formatDate(appraisal.submissionDate)}</p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between gap-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-gray-600">Status:</span>
                        <span className="font-semibold text-gray-900">{appraisal.status}</span>
                      </div>
                      {appraisal.attachments && appraisal.attachments.length > 0 && (
                        <div className="flex items-center gap-1 text-gray-500">
                          <DocumentTextIcon className="w-3 h-3" />
                          <span className="text-xs">{appraisal.attachments.length} attachment(s)</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewDetails(appraisal._id)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-[#003366] hover:bg-[#00509E] text-white rounded-lg transition-all duration-200 font-medium text-sm"
                      >
                        <EyeIcon className="h-4 w-4" />
                        View Details
                      </button>
                      <button
                        onClick={() => handleDeleteAppraisal(appraisal._id)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-200 font-medium text-sm"
                      >
                        <TrashIcon className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Appraisal Form Modal */}
      {showForm && (
        <InternshipAppraisalForm onClose={handleCloseForm} />
      )}

      {/* View Details Modal - COMSATS Theme */}
      {showDetails && selectedAppraisal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-[#003366] to-[#00509E] px-8 py-6 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="bg-white/10 backdrop-blur-sm p-2 rounded-lg border border-white/20">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">Appraisal Details</h2>
              </div>
              <button
                onClick={() => setShowDetails(false)}
                className="text-white/80 hover:text-white hover:bg-white/10 rounded-lg p-2 transition-all duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 space-y-6">
              {/* Student Information */}
              <div className="bg-gradient-to-br from-blue-50 via-blue-50 to-white border-2 border-blue-100 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-gradient-to-br from-[#003366] to-[#00509E] p-2.5 rounded-lg">
                    <UserIcon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-[#003366]">Student Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-100">
                    <p className="text-xs text-[#003366] font-semibold uppercase tracking-wide mb-2">Student Name</p>
                    <p className="text-base font-bold text-gray-900">{selectedAppraisal.studentName}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-100">
                    <p className="text-xs text-[#003366] font-semibold uppercase tracking-wide mb-2">Internship Title</p>
                    <p className="text-base font-bold text-gray-900">{selectedAppraisal.internshipTitle}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-100">
                    <p className="text-xs text-[#003366] font-semibold uppercase tracking-wide mb-2">Duration</p>
                    <p className="text-base font-bold text-gray-900">{selectedAppraisal.duration}</p>
                  </div>
                </div>
              </div>

              {/* Performance Evaluation */}
              <div className="bg-gradient-to-br from-blue-50 via-blue-50 to-white border-2 border-blue-100 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-gradient-to-br from-[#003366] to-[#00509E] p-2.5 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-[#003366]">Performance Evaluation</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-100">
                    <p className="text-xs text-[#003366] font-semibold uppercase tracking-wide mb-2">Overall Performance</p>
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-bold ${getPerformanceBadgeColor(selectedAppraisal.overallPerformance)}`}>
                      <Award className="w-4 h-4 mr-2" />
                      {selectedAppraisal.overallPerformance}
                    </span>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-100">
                    <p className="text-xs text-[#003366] font-semibold uppercase tracking-wide mb-2">Rating</p>
                    <div className="flex items-center gap-2">
                      {renderStars(selectedAppraisal.rating)}
                      <span className="text-sm font-bold text-gray-700">({selectedAppraisal.rating}/5)</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-100">
                    <p className="text-sm text-[#003366] font-semibold mb-3">Key Strengths</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{selectedAppraisal.keyStrengths}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-100">
                    <p className="text-sm text-[#003366] font-semibold mb-3">Areas for Improvement</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{selectedAppraisal.areasForImprovement}</p>
                  </div>
                </div>
              </div>

              {/* Feedback */}
              <div className="bg-gradient-to-br from-blue-50 via-blue-50 to-white border-2 border-blue-100 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-gradient-to-br from-[#003366] to-[#00509E] p-2.5 rounded-lg">
                    <DocumentTextIcon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-[#003366]">Feedback & Recommendations</h3>
                </div>
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-100">
                    <p className="text-sm text-[#003366] font-semibold mb-3">Comments & Feedback</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{selectedAppraisal.commentsAndFeedback}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-100">
                    <p className="text-sm text-[#003366] font-semibold mb-3">Recommendation</p>
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-bold ${getRecommendationBadgeColor(selectedAppraisal.recommendation)}`}>
                      <TrendingUp className="w-4 h-4 mr-2" />
                      {selectedAppraisal.recommendation}
                    </span>
                  </div>
                </div>
              </div>

              {/* Attachments */}
              {selectedAppraisal.attachments && selectedAppraisal.attachments.length > 0 && (
                <div className="bg-gradient-to-br from-blue-50 via-blue-50 to-white border-2 border-blue-100 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-gradient-to-br from-[#003366] to-[#00509E] p-2.5 rounded-lg">
                      <DocumentTextIcon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-[#003366]">Attachments</h3>
                  </div>
                  <div className="space-y-3">
                    {selectedAppraisal.attachments.map((file, index) => (
                      <div key={index} className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm border border-blue-100">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center border border-blue-300">
                            <span className="text-xs font-bold text-[#003366]">
                              {file.originalName.split('.').pop().toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{file.originalName}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submission Details */}
              <div className="bg-gradient-to-br from-blue-50 via-blue-50 to-white border-2 border-blue-100 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-gradient-to-br from-[#003366] to-[#00509E] p-2.5 rounded-lg">
                    <CalendarIcon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-[#003366]">Submission Details</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-100">
                    <p className="text-xs text-[#003366] font-semibold uppercase tracking-wide mb-2">Submitted By</p>
                    <p className="text-base font-bold text-gray-900">{selectedAppraisal.submittedBy}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-100">
                    <p className="text-xs text-[#003366] font-semibold uppercase tracking-wide mb-2">Email</p>
                    <p className="text-base font-bold text-gray-900 break-words">{selectedAppraisal.submittedByEmail}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-100">
                    <p className="text-xs text-[#003366] font-semibold uppercase tracking-wide mb-2">Submission Date</p>
                    <p className="text-base font-bold text-gray-900">{formatDate(selectedAppraisal.submissionDate)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InternshipAppraisalTab;
