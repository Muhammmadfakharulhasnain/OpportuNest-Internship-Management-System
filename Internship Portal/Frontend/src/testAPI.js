// Test script to verify frontend-backend connectivity
import { jobAPI, testAPI } from './services/api.js';

console.log('Testing API connectivity...');

// Test 1: Test endpoints (no auth required)
testAPI.getTestJobs()
  .then(response => {
    console.log('✅ Test API connection successful');
    console.log('Jobs in database:', response.count);
    
    // Test 2: Create a test job via API
    return testAPI.createTestJob({
      jobTitle: 'Frontend API Test Job',
      location: 'Test Location',
      workType: 'Remote',
      duration: '2 months',
      salary: 'Rs. 20,000/month',
      startDate: '2025-08-01',
      endDate: '2025-10-01',
      jobDescription: 'This job was created from the frontend API test',
      requirements: ['Frontend skills', 'API testing'],
      technologyStack: ['React', 'JavaScript'],
      isUrgent: true,
      tags: ['frontend-test', 'api-verification']
    });
  })
  .then(response => {
    console.log('✅ Job creation via API successful');
    console.log('Created job:', response.data.jobTitle);
    console.log('Job ID:', response.data._id);
    
    // Test 3: Fetch all test jobs again
    return testAPI.getTestJobs();
  })
  .then(response => {
    console.log('✅ Job fetching successful');
    console.log('Total jobs now:', response.count);
    console.log('Recent job titles:', response.data.map(job => job.jobTitle));
    
    console.log('\n🎉 All API tests passed! Frontend is connected to backend.');
    console.log('You can now use the Company Dashboard to post real jobs.');
  })
  .catch(error => {
    console.error('❌ API test failed:', error.message);
    console.log('Make sure the backend server is running on http://localhost:5000');
  });
