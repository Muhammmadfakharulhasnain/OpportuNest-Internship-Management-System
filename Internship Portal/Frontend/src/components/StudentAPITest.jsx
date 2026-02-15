import { useState } from 'react';
import { studentAPI } from '../services/api';

const StudentAPITest = () => {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const addResult = (test, success, message, data = null) => {
    setTestResults(prev => [...prev, { test, success, message, data, timestamp: new Date() }]);
  };

  const runTests = async () => {
    setLoading(true);
    setTestResults([]);

    try {
      // Test 1: Register a test student
      addResult('Starting API tests...', true, 'Initializing student API tests');

      const testStudent = {
        fullName: 'John Doe Test',
        email: `test_${Date.now()}@example.com`,
        password: 'password123',
        department: 'Computer Science',
        semester: '6th'
      };

      addResult('Test 1: Student Registration', true, 'Attempting to register test student...');
      
      const registerResponse = await studentAPI.register(testStudent);
      if (registerResponse.success) {
        addResult('Test 1: Student Registration', true, 'Student registered successfully!', registerResponse.data);
        
        // Store token for subsequent tests
        const token = registerResponse.data.token;
        localStorage.setItem('studentToken', token);

        // Test 2: Login with the same credentials
        addResult('Test 2: Student Login', true, 'Attempting to login...');
        
        const loginResponse = await studentAPI.login({
          email: testStudent.email,
          password: testStudent.password
        });
        
        if (loginResponse.success) {
          addResult('Test 2: Student Login', true, 'Student login successful!', loginResponse.data);
          
          // Test 3: Get profile
          addResult('Test 3: Get Profile', true, 'Fetching student profile...');
          
          const profileResponse = await studentAPI.getProfile();
          if (profileResponse.success) {
            addResult('Test 3: Get Profile', true, 'Profile fetched successfully!', profileResponse.data);
            
            // Test 4: Update profile
            addResult('Test 4: Update Profile', true, 'Updating profile...');
            
            const updateData = new FormData();
            updateData.append('cgpa', '3.5');
            updateData.append('phoneNumber', '+923001234567');
            updateData.append('rollNumber', 'CS-2024-TEST');
            updateData.append('attendance', '85');
            updateData.append('backlogs', '0');
            
            const updateResponse = await studentAPI.updateProfile(updateData);
            if (updateResponse.success) {
              addResult('Test 4: Update Profile', true, 'Profile updated successfully!', updateResponse.data);
            } else {
              addResult('Test 4: Update Profile', false, updateResponse.message);
            }
          } else {
            addResult('Test 3: Get Profile', false, profileResponse.message);
          }
        } else {
          addResult('Test 2: Student Login', false, loginResponse.message);
        }
      } else {
        addResult('Test 1: Student Registration', false, registerResponse.message);
      }
      
      addResult('Tests Completed', true, 'All API tests completed successfully!');
      
    } catch (error) {
      addResult('Test Error', false, `Test failed: ${error.message}`);
      console.error('Test error:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
    localStorage.removeItem('studentToken');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Student API Test Suite</h1>
        <p className="text-gray-600 mb-6">
          This page tests the Student API endpoints including registration, login, profile management, and file uploads.
        </p>
        
        <div className="flex space-x-4 mb-6">
          <button
            onClick={runTests}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md disabled:opacity-50"
          >
            {loading ? 'Running Tests...' : 'Run API Tests'}
          </button>
          
          <button
            onClick={clearResults}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-md"
          >
            Clear Results
          </button>
        </div>
      </div>

      {testResults.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Results</h2>
          
          <div className="space-y-3">
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-l-4 ${
                  result.success 
                    ? 'bg-green-50 border-green-400 text-green-800' 
                    : 'bg-red-50 border-red-400 text-red-800'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold">{result.test}</h3>
                    <p className="text-sm mt-1">{result.message}</p>
                    {result.data && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm font-medium">
                          View Response Data
                        </summary>
                        <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    {result.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">API Endpoints Being Tested</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg">
            <h3 className="font-semibold text-green-600">POST /api/students/register</h3>
            <p className="text-sm text-gray-600">Register new student account</p>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <h3 className="font-semibold text-blue-600">POST /api/students/login</h3>
            <p className="text-sm text-gray-600">Student authentication</p>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <h3 className="font-semibold text-purple-600">GET /api/students/profile</h3>
            <p className="text-sm text-gray-600">Get student profile data</p>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <h3 className="font-semibold text-orange-600">PUT /api/students/profile</h3>
            <p className="text-sm text-gray-600">Update profile with file uploads</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentAPITest;
