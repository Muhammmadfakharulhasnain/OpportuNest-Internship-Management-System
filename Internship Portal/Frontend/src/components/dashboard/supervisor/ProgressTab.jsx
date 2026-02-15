import { useState, useEffect } from 'react';
import { 
  TrendingUp, User, Calendar, CheckCircle, Clock, AlertCircle, 
  FileText, Eye, Download, Building2, Mail, BookOpen,
  Star, Activity,
  BarChart3, Target, Users
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Card from '../../../ui/Card';
import Badge from '../../../ui/Badge';
import Button from '../../../ui/Button';
import Modal from '../../../ui/Modal';
import LoadingSpinner from '../../../ui/LoadingSpinner';
import SearchBar from '../../../ui/SearchBar';
import { 
  applicationAPI, 
  weeklyReportAPI, 
  internshipReportAPI,
  supervisorEvaluationAPI 
} from '../../../services/api';

const ProgressTab = () => {
  const [hiredStudents, setHiredStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [studentProgress, setStudentProgress] = useState({});
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    fetchHiredStudents();
  }, []);

  const fetchHiredStudents = async () => {
    try {
      setLoading(true);
      console.log('🎓 Fetching hired students for progress tracking...');
      
      const response = await applicationAPI.getSupervised();
      
      if (response.success && response.data) {
        console.log('✅ Hired students data received:', response.data);
        
        const studentsData = response.data.map((student, index) => ({
          studentId: student.studentId,
          name: student.name,
          email: student.email,
          rollNumber: student.registrationNumber || student.rollNumber,
          department: student.department || 'Computer Science',
          semester: student.semester || 'N/A',
          jobTitle: student.jobTitle,
          companyName: student.companyName,
          companyId: student.companyId,
          startDate: student.internshipStartDate,
          endDate: student.internshipEndDate,
          duration: student.internshipDuration || 'N/A',
          applicationId: student.applicationId,
          uniqueKey: `${student.studentId}_${student.applicationId || index}`
        }));
        
        setHiredStudents(studentsData);
        
        // Fetch progress data for each student
        studentsData.forEach(student => {
          fetchStudentProgress(student.studentId);
        });
        
      } else {
        setHiredStudents([]);
        console.log('⚠️ No hired students found');
      }
    } catch (error) {
      console.error('❌ Error fetching hired students:', error);
      toast.error('Failed to fetch student list');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentProgress = async (studentId) => {
    try {
      // Fetch weekly reports
      const weeklyResponse = await weeklyReportAPI.getSupervisorStudentReports();
      const studentWeeklyReports = weeklyResponse.success 
        ? (weeklyResponse.data.reports || []).filter(report => report.studentId === studentId)
        : [];

      // Fetch internship report
      let internshipReport = null;
      try {
        const internshipResponse = await internshipReportAPI.getSupervisorReports();
        if (internshipResponse.success && internshipResponse.data) {
          internshipReport = internshipResponse.data.find(report => report.studentId === studentId);
        }
      } catch (error) {
        console.log('No internship report found for student:', studentId);
      }

      // Fetch evaluations
      let evaluations = [];
      try {
        const evalResponse = await supervisorEvaluationAPI.getSupervisorEvaluations();
        if (evalResponse.success && evalResponse.data) {
          evaluations = evalResponse.data.filter(evaluation => evaluation.studentId === studentId);
        }
      } catch (error) {
        console.log('No evaluations found for student:', studentId);
      }

      // Calculate progress
      const totalWeeks = 12; // Standard internship duration
      const weeklyProgress = (studentWeeklyReports.length / totalWeeks) * 100;
      const hasInternshipReport = !!internshipReport;
      const hasEvaluations = evaluations.length > 0;
      
      const overallProgress = Math.round(
        (weeklyProgress * 0.6) + 
        (hasInternshipReport ? 30 : 0) + 
        (hasEvaluations ? 10 : 0)
      );

      // Determine status
      let status = 'on-track';
      if (overallProgress < 30) status = 'at-risk';
      else if (overallProgress < 60) status = 'behind';

      // Generate timeline
      const timeline = generateStudentTimeline(studentWeeklyReports, internshipReport, evaluations);

      setStudentProgress(prev => ({
        ...prev,
        [studentId]: {
          weeklyReports: studentWeeklyReports,
          internshipReport,
          evaluations,
          overallProgress,
          status,
          timeline,
          lastActivity: getLastActivity(studentWeeklyReports, internshipReport)
        }
      }));

    } catch (error) {
      console.error('Error fetching progress for student:', studentId, error);
    }
  };

  const generateStudentTimeline = (weeklyReports, internshipReport, evaluations) => {
    const timeline = [];
    
    // Add weekly reports to timeline
    for (let week = 1; week <= 12; week++) {
      const report = weeklyReports.find(r => r.weekNumber === week);
      timeline.push({
        id: `week-${week}`,
        title: `Weekly Report #${week}`,
        type: 'weekly-report',
        status: report ? 'completed' : 'pending',
        date: report ? report.submittedAt : null,
        data: report
      });
    }

    // Add internship report
    timeline.push({
      id: 'internship-report',
      title: 'Final Internship Report',
      type: 'internship-report',
      status: internshipReport ? 'completed' : 'pending',
      date: internshipReport ? internshipReport.submittedAt : null,
      data: internshipReport
    });

    // Add evaluations
    evaluations.forEach((evaluation, index) => {
      timeline.push({
        id: `evaluation-${index}`,
        title: `Supervisor Evaluation`,
        type: 'evaluation',
        status: 'completed',
        date: evaluation.createdAt,
        data: evaluation
      });
    });

    return timeline.sort((a, b) => {
      if (!a.date && !b.date) return 0;
      if (!a.date) return 1;
      if (!b.date) return -1;
      return new Date(b.date) - new Date(a.date);
    });
  };

  const getLastActivity = (weeklyReports, internshipReport) => {
    const dates = [];
    
    if (weeklyReports.length > 0) {
      const lastWeekly = weeklyReports.reduce((latest, report) => 
        new Date(report.submittedAt) > new Date(latest.submittedAt) ? report : latest
      );
      dates.push(new Date(lastWeekly.submittedAt));
    }
    
    if (internshipReport) {
      dates.push(new Date(internshipReport.submittedAt));
    }
    
    return dates.length > 0 ? new Date(Math.max(...dates)) : null;
  };

  const handleViewStudentDetails = (student) => {
    setSelectedStudent(student);
    setShowDetailsModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'on-track': return 'success';
      case 'behind': return 'warning';
      case 'at-risk': return 'danger';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'pending': return Clock;
      case 'overdue': return AlertCircle;
      default: return Clock;
    }
  };

  // Filter and sort students
  const filteredStudents = hiredStudents
    .filter(student => {
      const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           student.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase());
      
      const progress = studentProgress[student.studentId];
      if (filterStatus === 'all') return matchesSearch;
      
      return matchesSearch && progress && progress.status === filterStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'progress': {
          const progressA = studentProgress[a.studentId]?.overallProgress || 0;
          const progressB = studentProgress[b.studentId]?.overallProgress || 0;
          return progressB - progressA;
        }
        case 'activity': {
          const activityA = studentProgress[a.studentId]?.lastActivity || new Date(0);
          const activityB = studentProgress[b.studentId]?.lastActivity || new Date(0);
          return new Date(activityB) - new Date(activityA);
        }
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-gray-600">Loading student progress...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Student Progress Dashboard</h2>
          <p className="text-gray-600">Track your supervised students&apos; internship progress and reports</p>
        </div>
        
        {/* Filter and Sort Controls */}
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="w-full sm:w-64">
            <SearchBar
              placeholder="Search students, companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="on-track">On Track</option>
              <option value="behind">Behind</option>
              <option value="at-risk">At Risk</option>
            </select>
            
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="name">Sort by Name</option>
              <option value="progress">Sort by Progress</option>
              <option value="activity">Sort by Activity</option>
            </select>
          </div>
        </div>
      </div>

      {/* Statistics Overview */}
      {hiredStudents.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg mr-4">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">{hiredStudents.length}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg mr-4">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">On Track</p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredStudents.filter(student => studentProgress[student.studentId]?.status === 'on-track').length}
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-3 rounded-lg mr-4">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Behind</p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredStudents.filter(student => studentProgress[student.studentId]?.status === 'behind').length}
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center">
              <div className="bg-red-100 p-3 rounded-lg mr-4">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">At Risk</p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredStudents.filter(student => studentProgress[student.studentId]?.status === 'at-risk').length}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Student Progress Cards */}
      <div className="space-y-6">
        {filteredStudents.map((student) => {
          const progress = studentProgress[student.studentId] || {};
          const weeklyReports = progress.weeklyReports || [];
          const overallProgress = progress.overallProgress || 0;
          const status = progress.status || 'pending';
          const lastActivity = progress.lastActivity;
          
          return (
            <Card key={student.uniqueKey} className="p-6 hover:shadow-lg transition-shadow">
              {/* Student Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-3 rounded-xl">
                    <User className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{student.name}</h3>
                    <div className="flex items-center space-x-3 text-sm text-gray-600 mt-1">
                      <span className="flex items-center">
                        <Mail className="w-4 h-4 mr-1" />
                        {student.rollNumber}
                      </span>
                      <span className="flex items-center">
                        <Building2 className="w-4 h-4 mr-1" />
                        {student.companyName}
                      </span>
                      <span className="flex items-center">
                        <BookOpen className="w-4 h-4 mr-1" />
                        {student.jobTitle}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Badge variant={getStatusColor(status)} size="lg">
                    {status.replace('-', ' ').charAt(0).toUpperCase() + status.replace('-', ' ').slice(1)}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewStudentDetails(student)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </div>

              {/* Quick Progress Stats */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                  <div className="text-xl font-bold text-blue-700">{overallProgress}%</div>
                  <div className="text-xs text-blue-600 font-medium">Overall Progress</div>
                </div>
                <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                  <div className="text-xl font-bold text-green-700">{weeklyReports.length}/12</div>
                  <div className="text-xs text-green-600 font-medium">Weekly Reports</div>
                </div>
                <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                  <div className="text-xl font-bold text-purple-700">
                    {progress.internshipReport ? '✓' : '○'}
                  </div>
                  <div className="text-xs text-purple-600 font-medium">Final Report</div>
                </div>
                <div className="text-center p-3 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
                  <div className="text-xl font-bold text-orange-700">
                    {progress.evaluations?.length || 0}
                  </div>
                  <div className="text-xs text-orange-600 font-medium">Evaluations</div>
                </div>
                <div className="text-center p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
                  <div className="text-xl font-bold text-gray-700">
                    {lastActivity ? new Date(lastActivity).toLocaleDateString() : 'N/A'}
                  </div>
                  <div className="text-xs text-gray-600 font-medium">Last Activity</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Internship Progress</span>
                  <span className="text-sm text-gray-500">{overallProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-500 ${
                      overallProgress >= 70 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                      overallProgress >= 40 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                      'bg-gradient-to-r from-red-500 to-red-600'
                    }`}
                    style={{ width: `${Math.min(overallProgress, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Recent Activity Summary */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <Activity className="w-4 h-4 mr-2" />
                  Recent Activity Summary
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Latest Week Report:</span>
                    <span className="ml-2 font-medium">
                      {weeklyReports.length > 0 ? `Week ${Math.max(...weeklyReports.map(r => r.weekNumber))}` : 'None'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Pending Reports:</span>
                    <span className="ml-2 font-medium text-orange-600">
                      {12 - weeklyReports.length} weeks
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <span className={`ml-2 font-medium ${
                      status === 'on-track' ? 'text-green-600' :
                      status === 'behind' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {status.replace('-', ' ').charAt(0).toUpperCase() + status.replace('-', ' ').slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {filteredStudents.length === 0 && !loading && (
        <Card className="p-12 text-center">
          <div className="text-gray-400 mb-4">
            <TrendingUp className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            No Students Found
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            {searchTerm || filterStatus !== 'all' 
              ? 'No students match your current search or filter criteria.' 
              : 'You don\'t have any hired students assigned yet. Students will appear here once they are hired by companies under your supervision.'}
          </p>
        </Card>
      )}

      {/* Student Details Modal */}
      <Modal 
        isOpen={showDetailsModal} 
        onClose={() => setShowDetailsModal(false)}
        title={selectedStudent ? `${selectedStudent.name} - Progress Details` : ''}
        size="xl"
      >
        {selectedStudent && (
          <StudentDetailsModal 
            student={selectedStudent}
            progress={studentProgress[selectedStudent.studentId] || {}}
            onClose={() => setShowDetailsModal(false)}
          />
        )}
      </Modal>
    </div>
  );
};

// Student Details Modal Component
/* eslint-disable react/prop-types */
const StudentDetailsModal = ({ student, progress }) => {
  const [activeTab, setActiveTab] = useState('overview');
  
  const weeklyReports = progress.weeklyReports || [];
  const internshipReport = progress.internshipReport;
  const evaluations = progress.evaluations || [];
  const timeline = progress.timeline || [];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'evaluations', label: 'Evaluations', icon: Star },
    { id: 'timeline', label: 'Timeline', icon: Calendar }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'on-track': return 'success';
      case 'behind': return 'warning';
      case 'at-risk': return 'danger';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'pending': return Clock;
      case 'overdue': return AlertCircle;
      default: return Clock;
    }
  };

  const downloadReport = async (reportId, type) => {
    try {
      if (type === 'weekly') {
        await weeklyReportAPI.downloadReportPDF(reportId);
        toast.success('Weekly report downloaded successfully');
      } else if (type === 'internship') {
        await internshipReportAPI.downloadReportPDF(reportId);
        toast.success('Internship report downloaded successfully');
      }
    } catch {
      toast.error('Failed to download report');
    }
  };

  return (
    <div className="space-y-6">
      {/* Student Info Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
        <div className="flex items-center space-x-4">
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <User className="w-8 h-8 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900">{student.name}</h3>
            <div className="flex items-center space-x-6 text-sm text-gray-600 mt-2">
              <span className="flex items-center">
                <Mail className="w-4 h-4 mr-1" />
                {student.email}
              </span>
              <span className="flex items-center">
                <BookOpen className="w-4 h-4 mr-1" />
                {student.rollNumber}
              </span>
              <span className="flex items-center">
                <Building2 className="w-4 h-4 mr-1" />
                {student.companyName}
              </span>
            </div>
          </div>
          <Badge variant={getStatusColor(progress.status)} size="lg">
            {progress.status?.replace('-', ' ').charAt(0).toUpperCase() + progress.status?.replace('-', ' ').slice(1)}
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-6">
          {tabs.map((tab) => {
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <TabIcon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-96">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Progress Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{progress.overallProgress || 0}%</div>
                  <div className="text-sm text-gray-600">Overall Progress</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress.overallProgress || 0}%` }}
                    ></div>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">{weeklyReports.length}/12</div>
                  <div className="text-sm text-gray-600">Weekly Reports</div>
                  <div className="text-xs text-gray-500 mt-2">
                    {12 - weeklyReports.length} reports pending
                  </div>
                </div>
              </Card>
              
              <Card className="p-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {evaluations.length}
                  </div>
                  <div className="text-sm text-gray-600">Evaluations</div>
                  <div className="text-xs text-gray-500 mt-2">
                    {internshipReport ? 'Final report submitted' : 'Final report pending'}
                  </div>
                </div>
              </Card>
            </div>

            {/* Internship Details */}
            <Card className="p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Internship Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Company:</span>
                    <span className="font-medium">{student.companyName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Position:</span>
                    <span className="font-medium">{student.jobTitle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">{student.duration}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Start Date:</span>
                    <span className="font-medium">
                      {student.startDate ? new Date(student.startDate).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">End Date:</span>
                    <span className="font-medium">
                      {student.endDate ? new Date(student.endDate).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Activity:</span>
                    <span className="font-medium">
                      {progress.lastActivity ? new Date(progress.lastActivity).toLocaleDateString() : 'No activity'}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-6">
            {/* Weekly Reports */}
            <Card className="p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Weekly Reports ({weeklyReports.length}/12)</h4>
              {weeklyReports.length > 0 ? (
                <div className="space-y-3">
                  {weeklyReports.map((report) => (
                    <div key={report._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="bg-green-100 p-2 rounded-lg">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">Week {report.weekNumber}</p>
                          <p className="text-sm text-gray-600">
                            Submitted: {new Date(report.submittedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadReport(report._id, 'weekly')}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No weekly reports submitted yet</p>
                </div>
              )}
            </Card>

            {/* Internship Report */}
            <Card className="p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Final Internship Report</h4>
              {internshipReport ? (
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-green-900">Report Submitted</p>
                      <p className="text-sm text-green-700">
                        Submitted: {new Date(internshipReport.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadReport(internshipReport._id, 'internship')}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8 bg-yellow-50 rounded-lg border border-yellow-200">
                  <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
                  <p className="text-yellow-800 font-medium">Final Report Pending</p>
                  <p className="text-yellow-700 text-sm">Student has not submitted the final internship report yet</p>
                </div>
              )}
            </Card>
          </div>
        )}

        {activeTab === 'evaluations' && (
          <Card className="p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Evaluations ({evaluations.length})</h4>
            {evaluations.length > 0 ? (
              <div className="space-y-4">
                {evaluations.map((evaluation, index) => (
                  <div key={evaluation._id || index} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-medium">Supervisor Evaluation #{index + 1}</h5>
                      <span className="text-sm text-gray-600">
                        {new Date(evaluation.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Overall Grade:</span>
                        <span className="ml-2 font-medium">{evaluation.overallGrade || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Performance:</span>
                        <span className="ml-2 font-medium">
                          {evaluation.overallPerformance || 'N/A'}/10
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Star className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No evaluations completed yet</p>
              </div>
            )}
          </Card>
        )}

        {activeTab === 'timeline' && (
          <Card className="p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Progress Timeline</h4>
            {timeline.length > 0 ? (
              <div className="space-y-4">
                {timeline.slice(0, 10).map((item) => {
                  const StatusIcon = getStatusIcon(item.status);
                  return (
                    <div key={item.id} className="flex items-start space-x-3">
                      <div className={`p-2 rounded-full ${
                        item.status === 'completed' ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        <StatusIcon className={`w-4 h-4 ${
                          item.status === 'completed' ? 'text-green-600' : 'text-gray-400'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.title}</p>
                        <p className="text-sm text-gray-600">
                          {item.date ? new Date(item.date).toLocaleDateString() : 'Pending'}
                        </p>
                      </div>
                      <Badge variant={item.status === 'completed' ? 'success' : 'warning'} size="sm">
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No timeline data available</p>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
};

export default ProgressTab;