import { useState, useEffect } from 'react';
import { 
  FileText, 
  AlertTriangle, 
  UserCheck,
  MessageSquare,
  Calendar,
  ClipboardCheck,
  Users,
  Settings,
  UserPlus,
  Trophy,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import Tabs from '../../ui/Tabs';
import Card from '../../ui/Card';
import NotificationBadge from '../../components/ui/NotificationBadge';
import { useUnreadMessages } from '../../hooks/useUnreadMessages';
import DashboardOverview from '../../components/dashboard/supervisor/DashboardOverview';
import ReportsTab from '../../components/dashboard/supervisor/ReportsTab';
import EvaluationsTab from '../../components/dashboard/supervisor/EvaluationsTab';
import FinalEvaluationTab from '../../components/dashboard/supervisor/FinalEvaluationTab';
import MisconductTab from '../../components/dashboard/supervisor/MisconductTab';
import RequestsTab from '../../components/dashboard/supervisor/RequestsTab';
import SupervisionRequestsTab from '../../components/dashboard/supervisor/SupervisionRequestsTab';
import StudentApplicationsTab from '../../components/dashboard/supervisor/StudentApplicationsTab';
import MessagesTab from '../../components/dashboard/supervisor/MessagesTab';
import ScheduleTab from '../../components/dashboard/supervisor/ScheduleTab';
import EditProfileTab from '../../components/dashboard/supervisor/EditProfileTab';
import InternshipApprovalView from '../../components/dashboard/supervisor/InternshipApprovalView';

// Fixed dynamic import issue - 2025-10-06
const SupervisorDashboard = () => {
  const { currentUser } = useAuth();
  const { unreadCount, markAsRead, checkUnreadMessages } = useUnreadMessages();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(0);
  const [dashboardRefreshKey, setDashboardRefreshKey] = useState(0);

  // Refresh dashboard when switching back to it
  useEffect(() => {
    if (activeTab === 0) {
      setDashboardRefreshKey(prev => prev + 1);
    }
  }, [activeTab]);

  // Global refresh function for other tabs to trigger dashboard refresh
  const refreshDashboard = () => {
    setDashboardRefreshKey(prev => prev + 1);
  };

  // Make refresh function available globally
  useEffect(() => {
    window.refreshSupervisorDashboard = refreshDashboard;
    return () => {
      delete window.refreshSupervisorDashboard;
    };
  }, []);

  // Handle initial tab from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabParam = urlParams.get('tab');
    
    if (tabParam) {
      switch (tabParam) {
        case 'dashboard':
          setActiveTab(0); // Dashboard tab index
          break;
        case 'reports':
          setActiveTab(1); // Reports tab index
          break;
        case 'evaluations':
          setActiveTab(2); // Evaluations tab index
          break;
        case 'final-evaluation':
          setActiveTab(3); // Final Evaluation tab index
          break;
        case 'company-reports':
          setActiveTab(4); // Company Reports tab index
          break;
        case 'requests':
          setActiveTab(5); // Supervision Requests tab index
          break;
        case 'applications':
          setActiveTab(7); // Student Applications tab index
          break;
        default:
          // Keep current active tab
          break;
      }
    }
  }, [location.search]);

  const sidebarContent = (
    <nav className="mt-8 px-4">
      <div className="space-y-2">
        {/* 1. Dashboard */}
        <button 
          onClick={() => setActiveTab(0)}
          className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 0 
              ? 'text-white bg-[#003366]' 
              : 'text-blue-100 hover:text-white hover:bg-[#00509E]'
          }`}
        >
          <BarChart3 className="w-5 h-5 mr-3" />
          Dashboard
        </button>
        {/* 2. Supervisor Requests */}
        <button 
          onClick={() => setActiveTab(1)}
          className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 1 
              ? 'text-white bg-[#003366]' 
              : 'text-blue-100 hover:text-white hover:bg-[#00509E]'
          }`}
        >
          <UserPlus className="w-5 h-5 mr-3" />
          Supervisor Requests
        </button>
        {/* 3. Job Applications */}
        <button 
          onClick={() => setActiveTab(2)}
          className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 2 
              ? 'text-white bg-[#003366]' 
              : 'text-blue-100 hover:text-white hover:bg-[#00509E]'
          }`}
        >
          <UserCheck className="w-5 h-5 mr-3" />
          Job Applications
        </button>
        {/* 4. Student Applications */}
        <button 
          onClick={() => setActiveTab(3)}
          className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 3 
              ? 'text-white bg-[#003366]' 
              : 'text-blue-100 hover:text-white hover:bg-[#00509E]'
          }`}
        >
          <Users className="w-5 h-5 mr-3" />
          Student Applications
        </button>
        {/* 5. Messages */}
        <button 
          onClick={async () => {
            setActiveTab(4);
            await markAsRead(); // Mark messages as read when clicking Messages tab
            // Refresh unread count after marking as read
            setTimeout(() => {
              checkUnreadMessages();
            }, 500);
          }}
          className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 4 
              ? 'text-white bg-[#003366]' 
              : 'text-blue-100 hover:text-white hover:bg-[#00509E]'
          }`}
        >
          <div className="relative mr-3">
            <MessageSquare className="w-5 h-5" />
            <NotificationBadge count={unreadCount} className="scale-75" />
          </div>
          Messages
        </button>
        {/* 6. Internship Forms */}
        <button 
          onClick={() => setActiveTab(5)}
          className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 5 
              ? 'text-white bg-[#003366]' 
              : 'text-blue-100 hover:text-white hover:bg-[#00509E]'
          }`}
        >
          <FileText className="w-5 h-5 mr-3" />
          Internship Forms
        </button>
        {/* 7. Student Requests (Student Reports) */}
        <button 
          onClick={() => setActiveTab(6)}
          className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 6 
              ? 'text-white bg-[#003366]' 
              : 'text-blue-100 hover:text-white hover:bg-[#00509E]'
          }`}
        >
          <FileText className="w-5 h-5 mr-3" />
          Student Requests
        </button>
        {/* 8. Company Requests (Company Reports) */}
        <button 
          onClick={() => setActiveTab(7)}
          className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 7 
              ? 'text-white bg-[#003366]' 
              : 'text-blue-100 hover:text-white hover:bg-[#00509E]'
          }`}
        >
          <AlertTriangle className="w-5 h-5 mr-3" />
          Company Requests
        </button>
        {/* 9. Evaluations */}
        <button 
          onClick={() => setActiveTab(8)}
          className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 8 
              ? 'text-white bg-[#003366]' 
              : 'text-blue-100 hover:text-white hover:bg-[#00509E]'
          }`}
        >
          <ClipboardCheck className="w-5 h-5 mr-3" />
          Evaluations
        </button>
        {/* 10. Final Evaluations */}
        <button 
          onClick={() => setActiveTab(9)}
          className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 9 
              ? 'text-white bg-[#003366]' 
              : 'text-blue-100 hover:text-white hover:bg-[#00509E]'
          }`}
        >
          <Trophy className="w-5 h-5 mr-3" />
          Final Evaluations
        </button>
        {/* 11. Schedule */}
        <button 
          onClick={() => setActiveTab(10)}
          className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 10 
              ? 'text-white bg-[#003366]' 
              : 'text-blue-100 hover:text-white hover:bg-[#00509E]'
          }`}
        >
          <Calendar className="w-5 h-5 mr-3" />
          Schedule
        </button>
        {/* 12. Edit Profile */}
        <button 
          onClick={() => setActiveTab(11)}
          className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 11 
              ? 'text-white bg-[#003366]' 
              : 'text-blue-100 hover:text-white hover:bg-[#00509E]'
          }`}
        >
          <Settings className="w-5 h-5 mr-3" />
          Edit Profile
        </button>
      </div>
    </nav>
  );

  const tabs = [
    // 1. Dashboard
    {
      label: 'Dashboard',
      icon: BarChart3,
      content: <DashboardOverview key={dashboardRefreshKey} setActiveTab={setActiveTab} />
    },
    // 2. Supervisor Requests
    {
      label: 'Supervisor Requests',
      icon: UserPlus,
      content: <SupervisionRequestsTab />
    },
    // 3. Job Applications
    {
      label: 'Job Applications',
      icon: UserCheck,
      content: <RequestsTab />
    },
    // 4. Student Applications
    {
      label: 'Student Applications',
      icon: Users,
      content: <StudentApplicationsTab />
    },
    // 5. Messages
    {
      label: 'Messages',
      icon: MessageSquare,
      content: <MessagesTab />
    },
    // 6. Internship Forms
    {
      label: 'Internship Forms',
      icon: FileText,
      content: <InternshipApprovalView />
    },
    // 7. Student Requests (Student Reports)
    {
      label: 'Student Requests',
      icon: FileText,
      content: <ReportsTab />
    },
    // 8. Company Requests (Company Reports)
    {
      label: 'Company Requests',
      icon: AlertTriangle,
      content: <MisconductTab />
    },
    // 9. Evaluations
    {
      label: 'Evaluations',
      icon: ClipboardCheck,
      content: <EvaluationsTab />
    },
    // 10. Final Evaluations
    {
      label: 'Final Evaluations',
      icon: Trophy,
      content: <FinalEvaluationTab />
    },
    // 11. Schedule
    {
      label: 'Schedule',
      icon: Calendar,
      content: <ScheduleTab />
    },
    // 12. Edit Profile
    {
      label: 'Edit Profile',
      icon: Settings,
      content: <EditProfileTab />
    }
  ];

  return (
    <DashboardLayout 
      title="Supervisor Dashboard" 
      sidebar={sidebarContent}
      userRole="supervisor"
    >
      <div className="space-y-8 md:space-y-10 max-w-6xl mx-auto px-2 md:px-6">
        {/* Main Content Card - Same as Student/Company Dashboard */}
        <Card className="p-0 md:p-2 lg:p-4">
          <div className="px-2 md:px-4 py-2">
            {tabs[activeTab]?.content}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SupervisorDashboard;