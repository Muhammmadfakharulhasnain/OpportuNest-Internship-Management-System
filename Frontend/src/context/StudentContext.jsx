import React, { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { studentAPI, supervisionRequestAPI } from '../services/api';

const StudentContext = createContext();

export { StudentContext };
export const useStudent = () => useContext(StudentContext);

export const StudentProvider = ({ children }) => {
  const [selectedSupervisor, setSelectedSupervisor] = useState(null);
  const [supervisionRequest, setSupervisionRequest] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch selected supervisor and supervision request status from backend on mount
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setLoading(true);
        
        // Fetch student profile (for already assigned supervisor)
        const profile = await studentAPI.getProfile();
        console.log('=== STUDENT CONTEXT DEBUG ===');
        console.log('Full profile response:', profile);
        console.log('Profile data:', profile.data);
        console.log('Selected supervisor from backend:', profile.data?.selectedSupervisor);
        console.log('==============================');
        
        if (profile.data?.selectedSupervisor) {
          setSelectedSupervisor(profile.data.selectedSupervisor);
        } else {
          setSelectedSupervisor(null);
        }

        // Fetch supervision requests to check status
        const requestsResponse = await supervisionRequestAPI.getStudentRequests();
        if (requestsResponse.success && requestsResponse.data) {
          // Find the most recent active request (pending or accepted)
          const activeRequest = requestsResponse.data.find(req => 
            req.status === 'pending' || req.status === 'accepted'
          );
          setSupervisionRequest(activeRequest || null);
        }
        
      } catch (err) {
        // For new users without profile, this is expected
        if (err.message === 'Student not found') {
          console.log('New user detected - no profile found yet, this is normal');
        } else {
          console.error('Error fetching student data:', err);
        }
        setSelectedSupervisor(null);
        setSupervisionRequest(null);
      } finally {
        setLoading(false);
      }
    };
    fetchStudentData();
  }, []);

  // Create supervision request instead of direct assignment
  const requestSupervision = async (supervisor) => {
    try {
      setLoading(true);
      
      const result = await supervisionRequestAPI.createRequest(supervisor._id || supervisor.id);
      if (result.success) {
        // Update supervision request state
        setSupervisionRequest({
          ...result.data,
          supervisorId: supervisor
        });
        return result;
      } else {
        throw new Error(result.message || 'Failed to send supervision request');
      }
    } catch (err) {
      console.error('Error creating supervision request:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Refresh student data (useful after request status changes)
  const refreshStudentData = async () => {
    try {
      setLoading(true);
      
      // Fetch updated profile
      const profile = await studentAPI.getProfile();
      console.log('=== REFRESH STUDENT DATA DEBUG ===');
      console.log('Refreshed profile response:', profile);
      console.log('Refreshed profile data:', profile.data);
      console.log('Refreshed selected supervisor:', profile.data?.selectedSupervisor);
      console.log('===================================');
      
      if (profile.data?.selectedSupervisor) {
        setSelectedSupervisor(profile.data.selectedSupervisor);
      } else {
        setSelectedSupervisor(null);
      }

      // Fetch updated requests
      const requestsResponse = await supervisionRequestAPI.getStudentRequests();
      if (requestsResponse.success && requestsResponse.data) {
        const activeRequest = requestsResponse.data.find(req => 
          req.status === 'pending' || req.status === 'accepted'
        );
        setSupervisionRequest(activeRequest || null);
      }
      
    } catch (err) {
      console.error('Error refreshing student data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <StudentContext.Provider value={{ 
      selectedSupervisor, 
      supervisionRequest,
      requestSupervision,
      refreshStudentData,
      loading 
    }}>
      {children}
    </StudentContext.Provider>
  );
};

StudentProvider.propTypes = {
  children: PropTypes.node.isRequired
};
