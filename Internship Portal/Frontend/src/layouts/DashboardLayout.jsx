import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Menu, 
  X, 
  LogOut, 
  User, 
  Settings
} from 'lucide-react';
import Button from '../ui/Button';
import NotificationDropdown from '../components/notifications/NotificationDropdown';
// Import the COMSATS logo
import comsatsLogo from '../assets/download.png';

const DashboardLayout = ({ children, title, sidebar, userRole }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Get the dashboard title based on user role
  const getDashboardTitle = () => {
    if (userRole === 'supervisor') return 'Supervisor Dashboard';
    if (userRole === 'student') return 'Student Dashboard';
    if (userRole === 'company') return 'Company Dashboard';
    if (userRole === 'admin') return 'Admin Dashboard';
    return title || 'Dashboard';
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-blue-800 shadow-xl transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-blue-700">
          <div className="flex items-center space-x-3">
            <div className="bg-white rounded-full p-2 shadow-lg border-2 border-blue-200 flex items-center justify-center min-w-[2.5rem] min-h-[2.5rem]">
              <img 
                src={comsatsLogo} 
                alt="COMSATS Logo" 
                className="h-8 w-8 object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="hidden h-8 w-8 bg-blue-600 rounded-full items-center justify-center text-white font-bold text-lg">
                C
              </div>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">COMSATS</h1>
              <p className="text-xs text-blue-200">{getDashboardTitle()}</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-blue-200 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto bg-blue-800">
          {sidebar}
        </div>

        {/* User Profile Section */}
        <div className="border-t border-blue-700 p-4 bg-blue-800">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-blue-100 truncate">
                {user?.name}
              </p>
              <p className="text-xs text-blue-200 capitalize truncate">
                {user?.role}
              </p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button variant="" size="sm" className="flex-1 text-blue-100 hover:text-white hover:bg-blue-600">
              <User className="w-4 h-4 mr-1" />
              Profile
            </Button>
            <Button variant="" size="sm" onClick={handleLogout} className="text-blue-100 hover:text-white hover:bg-blue-600">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Top bar */}
        <header className="bg-blue-500 shadow-sm border-b border-blue-700">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-black hover:text-gray-800 lg:hidden font-bold"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h2 className="text-xl font-bold text-white">
                {title}
              </h2>
            </div>
            
            <div className="flex items-center space-x-4">
              <NotificationDropdown />
              <button className="text-black hover:text-gray-800 font-bold">
                <Settings className="w-6 h-6" />
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;