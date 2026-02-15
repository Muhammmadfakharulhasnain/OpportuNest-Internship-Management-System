import { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Users, 
  FileText,
  Building2,
  ClipboardCheck,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../ui/Card';
import DashboardOverview from '../../components/dashboard/company/DashboardOverview';
import JobsTab from '../../components/dashboard/company/JobsTab';
import ApplicationsTab from '../../components/dashboard/company/ApplicationsTab';
import ReportsTab from '../../components/dashboard/company/ReportsTab';
import CompanyProfileTab from '../../components/dashboard/company/CompanyProfileTab';
import InterneeEvaluationTab from '../../components/dashboard/company/InterneeEvaluationTab';
import ProfileCompletionModal from '../../components/dashboard/company/ProfileCompletionModal';
import useCompanyProfileCheck from '../../hooks/useCompanyProfileCheck';

const CompanyDashboard = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState(0); // Start with dashboard tab
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [modalShownThisSession, setModalShownThisSession] = useState(false);
  
  // Use the profile check hook
  const { 
    profileData, 
    loading, 
    isProfileComplete, 
    refreshProfile
  } = useCompanyProfileCheck();

  // Show modal if profile is incomplete (only once per session)
  useEffect(() => {
    // Check if modal was already dismissed this session
    const modalDismissed = sessionStorage.getItem('profileModalDismissed');
    
    if (!loading && profileData && !isProfileComplete && !modalShownThisSession && !modalDismissed) {
      setShowProfileModal(true);
      setActiveTab(4); // Force to profile tab
      setModalShownThisSession(true); // Mark as shown for this session
    }
    
    // Clear dismissed flag if profile becomes complete
    if (isProfileComplete && modalDismissed) {
      sessionStorage.removeItem('profileModalDismissed');
    }
  }, [loading, profileData, isProfileComplete, modalShownThisSession]);

  // Handle tab change - prevent access to other tabs if profile incomplete
  const handleTabChange = (tabIndex) => {
    if (!isProfileComplete && tabIndex !== 0 && tabIndex !== 5) {
      setShowProfileModal(true);
      return;
    }
    setActiveTab(tabIndex);
  };

  // Handle profile completion
  const handleCompleteProfile = () => {
    setShowProfileModal(false);
    setActiveTab(5); // Go to profile tab
    // Don't mark as dismissed since user is going to complete profile
  };

  // Handle profile updates without triggering modal
  const handleProfileUpdate = () => {
    // Set flag to prevent modal from showing during updates
    setModalShownThisSession(true);
    // Refresh profile data
    refreshProfile();
  };

  // Close modal after profile completion
  const handleModalClose = () => {
    if (isProfileComplete) {
      setShowProfileModal(false);
      sessionStorage.setItem('profileModalDismissed', 'true');
      // Don't automatically change tab, stay on current tab
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Company Dashboard" userRole="company">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  const isProfileIncomplete = !isProfileComplete;

  const sidebarContent = (
    <nav className="mt-8 px-4">
      <div className="space-y-2">
        <button 
          onClick={() => handleTabChange(0)}
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
          onClick={() => handleTabChange(1)}
          disabled={isProfileIncomplete}
          className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 1 
              ? 'text-white bg-blue-600' 
              : isProfileIncomplete 
                ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                : 'text-blue-100 hover:text-white hover:bg-blue-700'
          }`}
        >
          <Briefcase className="w-5 h-5 mr-3" />
          Jobs
          {isProfileIncomplete && <span className="ml-auto text-xs">🔒</span>}
        </button>
        <button 
          onClick={() => handleTabChange(2)}
          disabled={isProfileIncomplete}
          className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 2 
              ? 'text-white bg-blue-600' 
              : isProfileIncomplete 
                ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                : 'text-blue-100 hover:text-white hover:bg-blue-700'
          }`}
        >
          <Users className="w-5 h-5 mr-3" />
          Applications
          {isProfileIncomplete && <span className="ml-auto text-xs">🔒</span>}
        </button>
        <button 
          onClick={() => handleTabChange(3)}
          disabled={isProfileIncomplete}
          className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 3 
              ? 'text-white bg-blue-600' 
              : isProfileIncomplete 
                ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                : 'text-blue-100 hover:text-white hover:bg-blue-700'
          }`}
        >
          <FileText className="w-5 h-5 mr-3" />
          Reports
          {isProfileIncomplete && <span className="ml-auto text-xs">🔒</span>}
        </button>
        <button 
          onClick={() => handleTabChange(4)}
          disabled={isProfileIncomplete}
          className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 4 
              ? 'text-white bg-blue-600' 
              : isProfileIncomplete 
                ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                : 'text-blue-100 hover:text-white hover:bg-blue-700'
          }`}
        >
          <ClipboardCheck className="w-5 h-5 mr-3" />
          Internee Evaluation
          {isProfileIncomplete && <span className="ml-auto text-xs">🔒</span>}
        </button>
        <button 
          onClick={() => handleTabChange(5)}
          className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 5 
              ? 'text-white bg-blue-600' 
              : 'text-blue-100 hover:text-white hover:bg-blue-700'
          }`}
        >
          <Building2 className="w-5 h-5 mr-3" />
          Company Profile
          {isProfileIncomplete && (
            <span className="ml-auto text-xs bg-red-500 text-white px-1 rounded">!</span>
          )}
        </button>
      </div>
    </nav>
  );

  const tabs = [
    {
      label: 'Dashboard',
      icon: BarChart3,
      content: <DashboardOverview setActiveTab={setActiveTab} />
    },
    {
      label: 'Jobs',
      icon: Briefcase,
      content: <JobsTab />,
      disabled: isProfileIncomplete
    },
    {
      label: 'Applications',
      icon: Users,
      content: <ApplicationsTab />,
      disabled: isProfileIncomplete
    },
    {
      label: 'Reports',
      icon: FileText,
      content: <ReportsTab />,
      disabled: isProfileIncomplete
    },
    {
      label: 'Internee Evaluation',
      icon: ClipboardCheck,
      content: <InterneeEvaluationTab />,
      disabled: isProfileIncomplete
    },
    {
      label: 'Profile',
      icon: Building2,
      content: <CompanyProfileTab onProfileUpdate={handleProfileUpdate} />
    }
  ];

  return (
    <DashboardLayout 
      title="Company Dashboard" 
      sidebar={sidebarContent}
      userRole="company"
    >
      <div className="space-y-8 md:space-y-10 max-w-6xl mx-auto px-2 md:px-6">


        {/* Main Content Card - Same as Student Dashboard */}
        <Card className="p-0 md:p-2 lg:p-4">
          <div className="px-2 md:px-4 py-2">
            {tabs[activeTab]?.content}
          </div>
        </Card>

        {/* Profile Completion Modal */}
        <ProfileCompletionModal
          isOpen={showProfileModal}
          onClose={handleModalClose}
          onCompleteProfile={handleCompleteProfile}
          profileCompleteness={profileData?.profileCompleteness || 0}
        />
      </div>
    </DashboardLayout>
  );
};

export default CompanyDashboard;