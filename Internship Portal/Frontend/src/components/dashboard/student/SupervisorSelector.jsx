import { useState, useEffect } from 'react';
import { useStudent } from '../../../context/StudentContext';
import { User } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Button from '../../../ui/Button';
import Badge from '../../../ui/Badge';
import SearchBar from '../../../ui/SearchBar';
import LoadingSpinner from '../../../ui/LoadingSpinner';
import { applicationAPI } from '../../../services/api';
import PropTypes from 'prop-types';

const SupervisorSelector = () => {
  const { selectedSupervisor, updateSelectedSupervisor, loading } = useStudent();
  const [searchTerm, setSearchTerm] = useState('');
  const [supervisors, setSupervisors] = useState([]);
  const [error, setError] = useState(null);
  const [localLoading, setLocalLoading] = useState(true);

  useEffect(() => {
    if (!selectedSupervisor) fetchSupervisors();
    else setLocalLoading(false);
  }, [selectedSupervisor]);

  const fetchSupervisors = async () => {
    try {
      setLocalLoading(true);
      const response = await applicationAPI.getSupervisors();
      setSupervisors(response.data || []);
      setError(null);
    } catch (err) {
      setError(err.message);
      setSupervisors([]);
    } finally {
      setLocalLoading(false);
    }
  };

  const handleSelectSupervisor = async (supervisor) => {
    const maxStudents = supervisor.profile?.maxStudents || 10;
    const currentStudents = supervisor.profile?.currentStudents || 0;
    if (currentStudents >= maxStudents) {
      toast.error('This supervisor has reached maximum capacity');
      return;
    }
    await updateSelectedSupervisor(supervisor);
    toast.success(`${supervisor.name} selected as supervisor`);
  };

  const filteredSupervisors = supervisors.filter(supervisor =>
    supervisor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (supervisor.profile?.department || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (supervisor.profile?.specializations || []).some(skill => 
      skill.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  if (loading || localLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <LoadingSpinner />
      </div>
    );
  }

  if (selectedSupervisor) {
    return (
      <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
        <span className="font-medium text-gray-900">Supervisor:</span>
        <span className="text-gray-700">{selectedSupervisor.name}</span>
        <Badge variant="success">Selected</Badge>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        <p>Error loading supervisors: {error}</p>
        <Button onClick={fetchSupervisors} className="mt-2">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Select Supervisor</h3>
      </div>
      <SearchBar
        placeholder="Search supervisors..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {filteredSupervisors.length === 0 ? (
        <div className="text-center text-gray-500 p-4">
          <p>No supervisors found matching your search.</p>
        </div>
      ) : (
        <div className="max-h-64 overflow-y-auto space-y-2">
          {filteredSupervisors.map((supervisor) => (
            <div
              key={supervisor._id || supervisor.id}
              className={`p-4 border rounded-lg cursor-pointer transition-colors hover:border-blue-500 hover:bg-blue-50`}
              onClick={() => handleSelectSupervisor(supervisor)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{supervisor.name}</h4>
                    <p className="text-sm text-gray-600">{supervisor.email}</p>
                    <p className="text-xs text-gray-500">{supervisor.profile?.department || 'Department not specified'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge 
                    variant={(supervisor.profile?.currentStudents || 0) < (supervisor.profile?.maxStudents || 10) ? 'success' : 'danger'}
                    size="sm"
                  >
                    {(supervisor.profile?.currentStudents || 0) < (supervisor.profile?.maxStudents || 10) ? 'Available' : 'Full'}
                  </Badge>
                  <p className="text-xs text-gray-500 mt-1">
                    {supervisor.profile?.currentStudents || 0}/{supervisor.profile?.maxStudents || 10} students
                  </p>
                </div>
              </div>
              <div className="mt-2">
                <div className="flex flex-wrap gap-1">
                  {(supervisor.profile?.specializations || []).slice(0, 3).map((skill, index) => (
                    <Badge key={index} variant="default" size="sm">
                      {skill}
                    </Badge>
                  ))}
                  {(supervisor.profile?.specializations || []).length > 3 && (
                    <Badge variant="default" size="sm">
                      +{(supervisor.profile?.specializations || []).length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
SupervisorSelector.propTypes = {
  onSelect: PropTypes.func.isRequired,
  selectedSupervisorId: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ])
};

export default SupervisorSelector;
