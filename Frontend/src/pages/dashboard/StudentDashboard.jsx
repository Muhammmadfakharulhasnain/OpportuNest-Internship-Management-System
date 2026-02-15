import { useState, useEffect, useMemo } from 'react';
import { 
  BookOpen, 
  FileText, 
  User, 
  CheckCircle, 
  Search,
  Calendar,
  UserCheck,
  Bell,
  MessageSquare,
  Trophy,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../../src/layouts/DashboardLayout';
import Tabs from '../../../src/ui/Tabs';
import { useLocation } from 'react-router-dom';
import Card from '../../../src/ui/Card';
import JobsTab from '../../components/dashboard/student/JobsTab';
import ApplicationsTab from '../../components/dashboard/student/ApplicationsTab';
import DashboardOverview from '../../components/dashboard/student/DashboardOverview';
import ReportsTab from '../../components/dashboard/student/ReportsTab';
import ResultsTab from '../../components/dashboard/student/ResultsTab';
import ProfileTab from '../../components/dashboard/student/ProfileTab';
import EligibilityTab from '../../components/dashboard/student/EligibilityTab';
import SupervisorSearch from '../../components/dashboard/student/SupervisorSearch';
import SupervisorStatusTab from '../../components/dashboard/student/SupervisorStatusTab';
import RegisteredCompaniesTab from '../../components/student/RegisteredCompaniesTab';
import NotificationsTab from '../../components/dashboard/student/NotificationsTab';
import ReportsViewTab from '../../components/dashboard/student/ReportsViewTab';
import InternshipApprovalView from '../../components/dashboard/student/InternshipApprovalView';
import SupervisorMessagesTab from '../../components/dashboard/student/SupervisorMessagesTab';
import ProfileCompletionWarning from '../../components/dashboard/student/ProfileCompletionWarning';
import NotificationBadge from '../../components/ui/NotificationBadge';
import { useUnreadMessages } from '../../hooks/useUnreadMessages';
import { StudentProvider } from '../../context/StudentContext';

const StudentDashboard = () => {
  const { currentUser } = useAuth();
  const { unreadCount, markAsRead, checkUnreadMessages } = useUnreadMessages();



  // Tab index for redirect
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(0);
  const [dashboardRefreshKey, setDashboardRefreshKey] = useState(0);

  // Refresh dashboard when switching back to it
  useEffect(() => {
    if (activeTab === 0) {
      setDashboardRefreshKey(prev => prev + 1);
    }
  }, [activeTab]);

  // Generate tabs with proper references
  const generateTabs = () => {
    const baseTabs = [
      {
        label: 'Dashboard',
        icon: BarChart3,
        content: <DashboardOverview key={dashboardRefreshKey} setActiveTab={setActiveTab} />
      },
      {
        label: 'Jobs',
        icon: Search,
        content: <JobsTab setActiveTab={setActiveTab} supervisorTabIdx={5} />
      },
      {
        label: 'Registered Companies',
        icon: BookOpen,
        content: <RegisteredCompaniesTab />
      },
      {
        label: 'My Applications',
        icon: FileText,
        content: <ApplicationsTab />
      },
      {
        label: 'Supervisors',
        icon: UserCheck,
        content: <SupervisorSearch />
      },
      {
        label: 'Supervisor Status',
        icon: CheckCircle,
        content: <SupervisorStatusTab setActiveTab={setActiveTab} supervisorTabIdx={4} />
      },
      {
        label: 'Supervisor Messages',
        icon: ({ className }) => (
          <div className="relative">
            <MessageSquare className={className} />
            <NotificationBadge count={unreadCount} />
          </div>
        ),
        content: <SupervisorMessagesTab />
      },
      {
        label: 'Reports',
        icon: Calendar,
        content: <ReportsTab />
      },
      {
        label: 'Internship Forms',
        icon: FileText,
        content: <InternshipApprovalView />
      },
      {
        label: 'Company Reports',
        icon: FileText,
        content: <ReportsViewTab />
      },
      {
        label: 'Results',
        icon: Trophy,
        content: <ResultsTab />
      },
      {
        label: 'Notifications',
        icon: Bell,
        content: <NotificationsTab />
      },
      {
        label: 'Eligibility',
        icon: CheckCircle,
        content: <EligibilityTab />
      },
      {
        label: 'Profile',
        icon: User,
        content: <ProfileTab />
      }
    ];
    return baseTabs;
  };

  const tabs = generateTabs();

  // Handle tab change and mark messages as read when Messages tab is opened
  const handleTabChange = async (newTabIndex) => {
    const messagesTabIndex = tabs.findIndex(tab => tab.label === 'Supervisor Messages');
    
    if (newTabIndex === messagesTabIndex) {
      await markAsRead();
      // Refresh unread count after marking as read
      setTimeout(() => {
        checkUnreadMessages();
      }, 500);
    }
    
    setActiveTab(newTabIndex);
  };

  const supervisorTabIdx = useMemo(() => {
    return tabs.findIndex(tab => tab.label === 'Supervisors');
  }, [tabs]);

  // Get profile tab index for warning component
  const profileTabIdx = useMemo(() => {
    return tabs.findIndex(tab => tab.label === 'Profile');
  }, [tabs]);

  // Handle initial tab from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabParam = urlParams.get('tab');
    
    if (tabParam) {
      switch (tabParam) {
        case 'dashboard':
          setActiveTab(0); // Dashboard tab index
          break;
        case 'jobs':
          setActiveTab(1); // Jobs tab index
          break;
        case 'supervisors':
          setActiveTab(4); // Supervisors tab index
          break;
        case 'supervisor-status':
          setActiveTab(5); // Supervisor Status tab index
          break;
        case 'reports-view':
          setActiveTab(9); // Company Reports tab index
          break;
        case 'notifications':
          setActiveTab(11); // Notifications tab index
          break;
        case 'profile':
          setActiveTab(13); // Profile tab index
          break;
        default:
          // Keep current active tab
          break;
      }
    }
  }, [location.search, tabs, supervisorTabIdx]);

  // Define sidebar content with access to supervisorTabIdx
  const sidebarContent = (
    <nav className="mt-8 px-4">
      <div className="space-y-2">
        <button 
          onClick={() => setActiveTab(0)}
          className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 0 
              ? 'text-white bg-blue-600' 
              : 'text-blue-100 hover:text-white hover:bg-blue-700'
          }`}
        >
          <BarChart3 className="w-5 h-5 mr-3" />
          Dashboard
        </button>
        <button 
          onClick={() => setActiveTab(1)}
          className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 1 
              ? 'text-white bg-blue-600' 
              : 'text-blue-100 hover:text-white hover:bg-blue-700'
          }`}
        >
          <Search className="w-5 h-5 mr-3" />
          Jobs
        </button>
        <button 
          onClick={() => setActiveTab(2)}
          className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 2 
              ? 'text-white bg-blue-600' 
              : 'text-blue-100 hover:text-white hover:bg-blue-700'
          }`}
        >
          <BookOpen className="w-5 h-5 mr-3" />
          Registered Companies
        </button>
        <button 
          onClick={() => setActiveTab(3)}
          className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 3 
              ? 'text-white bg-blue-600' 
              : 'text-blue-100 hover:text-white hover:bg-blue-700'
          }`}
        >
          <FileText className="w-5 h-5 mr-3" />
          My Applications
        </button>
        <button 
          onClick={() => setActiveTab(4)}
          className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 4 
              ? 'text-white bg-blue-600' 
              : 'text-blue-100 hover:text-white hover:bg-blue-700'
          }`}
        >
          <UserCheck className="w-5 h-5 mr-3" />
          Supervisors
        </button>
        <button 
          onClick={() => setActiveTab(5)}
          className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 5 
              ? 'text-white bg-blue-600' 
              : 'text-blue-100 hover:text-white hover:bg-blue-700'
          }`}
        >
          <CheckCircle className="w-5 h-5 mr-3" />
          Supervisor Status
        </button>
        <button 
          onClick={() => setActiveTab(6)}
          className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 6 
              ? 'text-white bg-blue-600' 
              : 'text-blue-100 hover:text-white hover:bg-blue-700'
          }`}
        >
          <MessageSquare className="w-5 h-5 mr-3" />
          Supervisor Messages
        </button>
        <button 
          onClick={() => setActiveTab(7)}
          className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 7 
              ? 'text-white bg-blue-600' 
              : 'text-blue-100 hover:text-white hover:bg-blue-700'
          }`}
        >
          <Calendar className="w-5 h-5 mr-3" />
          Reports
        </button>
        <button 
          onClick={() => setActiveTab(8)}
          className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 8 
              ? 'text-white bg-blue-600' 
              : 'text-blue-100 hover:text-white hover:bg-blue-700'
          }`}
        >
          <FileText className="w-5 h-5 mr-3" />
          Internship Forms
        </button>
        <button 
          onClick={() => setActiveTab(9)}
          className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 9 
              ? 'text-white bg-blue-600' 
              : 'text-blue-100 hover:text-white hover:bg-blue-700'
          }`}
        >
          <FileText className="w-5 h-5 mr-3" />
          Company Reports
        </button>
        <button 
          onClick={() => setActiveTab(10)}
          className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 10 
              ? 'text-white bg-blue-600' 
              : 'text-blue-100 hover:text-white hover:bg-blue-700'
          }`}
        >
          <Trophy className="w-5 h-5 mr-3" />
          Results
        </button>
        <button 
          onClick={() => setActiveTab(11)}
          className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 11 
              ? 'text-white bg-blue-600' 
              : 'text-blue-100 hover:text-white hover:bg-blue-700'
          }`}
        >
          <Bell className="w-5 h-5 mr-3" />
          Notifications
        </button>
        <button 
          onClick={() => setActiveTab(12)}
          className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 12 
              ? 'text-white bg-blue-600' 
              : 'text-blue-100 hover:text-white hover:bg-blue-700'
          }`}
        >
          <CheckCircle className="w-5 h-5 mr-3" />
          Eligibility
        </button>
        <button 
          onClick={() => setActiveTab(13)}
          className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 13 
              ? 'text-white bg-blue-600' 
              : 'text-blue-100 hover:text-white hover:bg-blue-700'
          }`}
        >
          <User className="w-5 h-5 mr-3" />
          Profile
        </button>
      </div>
    </nav>
  );

  return (
    <StudentProvider>
      <DashboardLayout 
        title="Student Dashboard" 
        sidebar={sidebarContent}
        userRole="student"
      >
        <div className="space-y-8 md:space-y-10 max-w-6xl mx-auto px-2 md:px-6">
          <ProfileCompletionWarning setActiveTab={setActiveTab} profileTabIndex={profileTabIdx} />
          
          {/* Main Content Card - Same as Company Dashboard */}
          <Card className="p-0 md:p-2 lg:p-4">
            <div className="px-2 md:px-4 py-2">
              {tabs[activeTab]?.content}
            </div>
          </Card>
        </div>
      </DashboardLayout>
    </StudentProvider>
  );
};

export default StudentDashboard;