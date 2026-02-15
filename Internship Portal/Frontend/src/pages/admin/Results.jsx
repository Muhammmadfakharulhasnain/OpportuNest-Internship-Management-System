import { useState, useEffect, useCallback } from 'react';
import { 
  Trophy, 
  Users, 
  Building2,
  Search,
  Download,
  Filter,
  Eye,
  Star,
  GraduationCap,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  FileText,
  Award,
  User,
  Calendar
} from 'lucide-react';
import { getAllFinalResults, downloadResultsPDF, downloadResultsExcel } from '../../services/adminAPI';
import toast from 'react-hot-toast';

const AdminResults = () => {
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [companyFilter, setCompanyFilter] = useState('all');
  const [sortBy, setSortBy] = useState('totalMarks');
  const [sortOrder, setSortOrder] = useState('desc');
  const [stats, setStats] = useState({
    totalStudents: 0,
    averageCgpa: 0,
    completedEvaluations: 0,
    pendingEvaluations: 0,
    completionRate: 0
  });

  // Fetch all final results
  const fetchResults = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Admin Results: Starting to fetch results...', new Date().toLocaleString());
      
      const response = await getAllFinalResults();

      console.log('📊 Admin Results: Response received:', {
        success: response?.success,
        resultsCount: response?.data?.results?.length || 0,
        statistics: response?.data?.statistics
      });

      if (response?.success) {
        setResults(response.data.results || []);
        setStats(response.data.statistics || {});
        
        const resultsCount = response.data.results?.length || 0;
        toast.success(`Results loaded successfully! Found ${resultsCount} students with completed evaluations.`);
        
        console.log('✅ Admin Results: State updated with', resultsCount, 'results');
      } else {
        throw new Error(response?.message || 'Failed to fetch results');
      }
    } catch (err) {
      console.error('❌ Error fetching results:', err);
      
      let errorMessage = 'Failed to fetch student results';
      
      if (err.code === 'ERR_NETWORK') {
        errorMessage = 'Unable to connect to server. Please check if the backend is running.';
      } else if (err.response?.status === 401) {
        errorMessage = 'Authentication failed. Please login again.';
      } else if (err.response?.status === 503) {
        errorMessage = 'Database connection unavailable. Please check MongoDB connection.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Force refresh with cache clearing
  const forceRefresh = useCallback(async () => {
    // Clear any cached data
    setResults([]);
    setStats({
      totalStudents: 0,
      averageCgpa: 0,
      completedEvaluations: 0,
      pendingEvaluations: 0,
      completionRate: 0
    });
    
    console.log('🔄 Force refresh initiated - clearing cache and fetching fresh data...');
    await fetchResults();
  }, [fetchResults]);

  // Filter and sort results
  useEffect(() => {
    let filtered = [...results];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(result => 
        result.studentInfo?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.studentInfo?.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.internshipInfo?.companyName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Grade filter
    if (gradeFilter !== 'all') {
      filtered = filtered.filter(result => result.evaluation?.grade === gradeFilter);
    }

    // Company filter
    if (companyFilter !== 'all') {
      filtered = filtered.filter(result => result.internshipInfo?.companyName === companyFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'totalMarks':
          aValue = a.evaluation?.totalMarks || 0;
          bValue = b.evaluation?.totalMarks || 0;
          break;
        case 'name':
          aValue = a.studentInfo?.name || '';
          bValue = b.studentInfo?.name || '';
          break;
        case 'company':
          aValue = a.internshipInfo?.companyName || '';
          bValue = b.internshipInfo?.companyName || '';
          break;
        case 'grade':
          aValue = a.evaluation?.grade || '';
          bValue = b.evaluation?.grade || '';
          break;
        default:
          aValue = a.evaluation?.totalMarks || 0;
          bValue = b.evaluation?.totalMarks || 0;
      }

      if (typeof aValue === 'string') {
        return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      } else {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }
    });

    setFilteredResults(filtered);
  }, [results, searchTerm, gradeFilter, companyFilter, sortBy, sortOrder]);

  // Get grade color
  const getGradeColor = (grade) => {
    const colors = {
      'A+': 'bg-green-100 text-green-800 border-green-200',
      'A': 'bg-green-100 text-green-800 border-green-200',
      'A-': 'bg-green-100 text-green-700 border-green-200',
      'B+': 'bg-blue-100 text-blue-800 border-blue-200',
      'B': 'bg-blue-100 text-blue-800 border-blue-200',
      'B-': 'bg-blue-100 text-blue-700 border-blue-200',
      'C+': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'C': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'C-': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'D': 'bg-orange-100 text-orange-800 border-orange-200',
      'F': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[grade] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Get unique companies for filter
  const uniqueCompanies = [...new Set(results.map(result => result.internshipInfo?.companyName).filter(Boolean))];

  // Export functions
  const handleExportPDF = async () => {
    try {
      toast.loading('Generating PDF...', { id: 'pdf-export' });
      await downloadResultsPDF(filteredResults);
      toast.success('PDF downloaded successfully!', { id: 'pdf-export' });
    } catch (error) {
      console.error('PDF Export Error:', error);
      toast.error('Failed to generate PDF', { id: 'pdf-export' });
    }
  };

  const handleExportExcel = async () => {
    try {
      toast.loading('Generating Excel...', { id: 'excel-export' });
      await downloadResultsExcel(filteredResults);
      toast.success('Excel downloaded successfully!', { id: 'excel-export' });
    } catch (error) {
      console.error('Excel Export Error:', error);
      toast.error('Failed to generate Excel', { id: 'excel-export' });
    }
  };

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-xl shadow-lg border">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white border border-red-200 rounded-2xl p-8 shadow-lg">
            <div className="flex items-start">
              <AlertCircle className="h-8 w-8 text-red-600 mr-4 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-red-800 mb-3">Error Loading Results</h3>
                <p className="text-red-600 mb-6 text-lg">{error}</p>
                
                <div className="bg-red-50 rounded-xl p-6 mb-6">
                  <h4 className="text-lg font-semibold text-red-800 mb-3">Troubleshooting Steps:</h4>
                  <ul className="text-red-700 space-y-2">
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2" />Check if the backend server is running on port 5005</li>
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2" />Verify MongoDB Atlas connection and IP whitelist</li>
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2" />Ensure your network connection is stable</li>
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2" />Try refreshing the page</li>
                  </ul>
                </div>
                
                <div className="flex space-x-4">
                  <button
                    onClick={forceRefresh}
                    disabled={loading}
                    className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center font-semibold transition-all duration-200"
                  >
                    <RefreshCw className="h-5 w-5 mr-2" />
                    {loading ? 'Retrying...' : 'Force Retry'}
                  </button>
                  <button
                    onClick={() => window.location.href = '/admin/dashboard'}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-4 focus:ring-gray-500 focus:ring-opacity-50 font-semibold transition-all duration-200"
                  >
                    Back to Dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-xl border border-white/20 p-8 backdrop-blur-sm bg-white/90">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-3">
                  🏆 Student Final Results
                </h1>
                <p className="text-gray-600 text-lg">
                  Comprehensive final evaluation results for all students
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleExportPDF}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-opacity-20 flex items-center font-medium transition-all duration-200"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  PDF
                </button>
                <button
                  onClick={handleExportExcel}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-500 focus:ring-opacity-20 flex items-center font-medium transition-all duration-200"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Excel
                </button>
                <button
                  onClick={forceRefresh}
                  disabled={loading}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center font-medium"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Force Refresh
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-white/20 p-6 backdrop-blur-sm bg-white/90">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-blue-50">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-gray-900">{stats.totalStudents}</p>
                <p className="text-sm text-gray-600">Total Students</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-white/20 p-6 backdrop-blur-sm bg-white/90">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-green-50">
                <Star className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-gray-900">{stats.averageCgpa || 0}</p>
                <p className="text-sm text-gray-600">Average CGPA</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-white/20 p-6 backdrop-blur-sm bg-white/90">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-blue-50">
                <CheckCircle className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-gray-900">{stats.completedEvaluations || 0}</p>
                <p className="text-sm text-gray-600">Completed Evaluations</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-white/20 p-6 backdrop-blur-sm bg-white/90">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-orange-50">
                <AlertCircle className="h-8 w-8 text-orange-600" />
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-gray-900">{stats.completionRate || 0}%</p>
                <p className="text-sm text-gray-600">Completion Rate</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg border border-white/20 p-6 mb-8 backdrop-blur-sm bg-white/90">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Grades</option>
              <option value="A+">A+</option>
              <option value="A">A</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B">B</option>
              <option value="B-">B-</option>
              <option value="C+">C+</option>
              <option value="C">C</option>
              <option value="C-">C-</option>
              <option value="D">D</option>
              <option value="F">F</option>
            </select>

            <select
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Companies</option>
              {uniqueCompanies.map(company => (
                <option key={company} value={company}>{company}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="totalMarks">Sort by Marks</option>
              <option value="name">Sort by Name</option>
              <option value="company">Sort by Company</option>
              <option value="grade">Sort by Grade</option>
            </select>

            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="desc">Highest First</option>
              <option value="asc">Lowest First</option>
            </select>
          </div>
        </div>

        {/* Results Grid */}
        {filteredResults.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-white/20 p-12 text-center backdrop-blur-sm bg-white/90">
            <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Results Found</h3>
            <p className="text-gray-600">
              {results.length === 0 
                ? "No final results have been published yet. Results will appear here once evaluations are completed."
                : "No results match your current filters. Try adjusting your search criteria."
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredResults.map((result) => (
              <div key={result.id} className="bg-white rounded-2xl shadow-lg border border-white/20 p-6 backdrop-blur-sm bg-white/90 hover:shadow-xl transition-all duration-200">
                {/* Student Header */}
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 rounded-lg bg-blue-50">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{result.studentInfo?.name}</h3>
                    <p className="text-sm text-gray-600">{result.studentInfo?.rollNumber}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-bold border ${getGradeColor(result.evaluation?.grade)}`}>
                    {result.evaluation?.grade}
                  </div>
                </div>

                {/* Score Display */}
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Total Score</span>
                    <span className="text-2xl font-bold text-gray-900">
                      {result.evaluation?.totalMarks || 0}/100
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${(result.evaluation?.totalMarks || 0)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Breakdown */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Supervisor (60%)</span>
                    <span className="font-semibold">{result.evaluation?.supervisorMarks || 0}/60</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Company (40%)</span>
                    <span className="font-semibold">{result.evaluation?.companyMarks || 0}/40</span>
                  </div>
                </div>

                {/* Company Info */}
                <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
                  <Building2 className="h-4 w-4" />
                  <span>{result.internshipInfo?.companyName}</span>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <button 
                    onClick={() => {/* View detailed result */}}
                    className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </button>
                  <button 
                    onClick={() => {/* Download individual PDF */}}
                    className="px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminResults;