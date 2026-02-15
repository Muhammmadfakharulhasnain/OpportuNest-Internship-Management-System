import { Users, CheckCircle2, TrendingUp, Building, UserCheck, GraduationCap } from 'lucide-react';
import Card from '../../../ui/Card';
import PropTypes from 'prop-types';

const SupervisorStats = ({ supervisors }) => {
  const totalSupervisors = supervisors.length;
  const availableSupervisors = supervisors.filter(s => (s.currentStudents || 0) < s.maxStudents).length;
  const departments = [...new Set(supervisors.map(s => s.department))].length;
  const totalCapacity = supervisors.reduce((acc, s) => acc + s.maxStudents, 0);
  const totalOccupied = supervisors.reduce((acc, s) => acc + (s.currentStudents || 0), 0);
  const utilizationRate = totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Enhanced Header Section - COMSATS Design */}
      <div className="relative bg-gradient-to-r from-[#003366] via-[#00509E] to-[#003366] rounded-lg p-5 text-white shadow-md overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-white/10 rounded-lg shadow-sm">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-1 text-white">
                  Supervisor Directory
                </h1>
                <p className="text-blue-100 text-sm font-medium">
                  Find and connect with available faculty supervisors
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-blue-200 text-xs font-medium">Availability Status</p>
                <div className="flex items-center gap-1 mt-1">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-white font-bold text-sm">{availableSupervisors} Available</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Quick Stats - COMSATS Compact */}
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center gap-1 mb-0.5">
                <Users className="w-3 h-3 text-blue-200" />
                <span className="text-blue-200 text-xs font-medium">Total Faculty</span>
              </div>
              <p className="text-white font-bold text-sm">{totalSupervisors}</p>
            </div>
            
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center gap-1 mb-0.5">
                <UserCheck className="w-3 h-3 text-blue-200" />
                <span className="text-blue-200 text-xs font-medium">Available Now</span>
              </div>
              <p className="text-white font-bold text-sm">{availableSupervisors}</p>
            </div>
            
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center gap-1 mb-0.5">
                <Building className="w-3 h-3 text-blue-200" />
                <span className="text-blue-200 text-xs font-medium">Departments</span>
              </div>
              <p className="text-white font-bold text-sm">{departments}</p>
            </div>
            
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center gap-1 mb-0.5">
                <TrendingUp className="w-3 h-3 text-blue-200" />
                <span className="text-blue-200 text-xs font-medium">Utilization</span>
              </div>
              <p className="text-white font-bold text-sm">{utilizationRate}%</p>
            </div>
          </div>
        </div>
        
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[#003366]/10 opacity-50"></div>
        <div className="absolute -top-5 -right-5 w-20 h-20 bg-[#003366]/20 rounded-full blur-xl"></div>
        <div className="absolute -bottom-3 -left-3 w-16 h-16 bg-[#00509E]/20 rounded-full blur-lg"></div>
      </div>

      {/* Detailed Stats Cards - Jobs Tab Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Supervisors Card */}
        <Card className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#003366] rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xl font-semibold text-gray-900">{totalSupervisors}</p>
              <p className="text-xs text-gray-600 font-medium">Total Faculty</p>
            </div>
          </div>
        </Card>

        {/* Available Supervisors Card */}
        <Card className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#00509E] rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xl font-semibold text-gray-900">{availableSupervisors}</p>
              <p className="text-xs text-gray-600 font-medium">Available Now</p>
            </div>
          </div>
        </Card>

        {/* Departments Card */}
        <Card className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
              <Building className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xl font-semibold text-gray-900">{departments}</p>
              <p className="text-xs text-gray-600 font-medium">Departments</p>
            </div>
          </div>
        </Card>

        {/* Utilization Rate Card */}
        <Card className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xl font-semibold text-gray-900">{utilizationRate}%</p>
              <p className="text-xs text-gray-600 font-medium">Utilization Rate</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

SupervisorStats.propTypes = {
  supervisors: PropTypes.arrayOf(PropTypes.shape({
    currentStudents: PropTypes.number,
    maxStudents: PropTypes.number.isRequired,
    department: PropTypes.string
  })).isRequired
};

export default SupervisorStats;