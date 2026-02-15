// Auth Debug Script
// Run this in browser console to debug authentication issues

console.log('🔍 Authentication Debug Information:');
console.log('===========================================');

// Check localStorage
const userString = localStorage.getItem('user');
const directToken = localStorage.getItem('token');

console.log('1. User in localStorage:', userString ? 'EXISTS' : 'NOT FOUND');
if (userString) {
  try {
    const user = JSON.parse(userString);
    console.log('   - Role:', user.role);
    console.log('   - Has token:', !!user.token);
    console.log('   - Token length:', user.token ? user.token.length : 0);
    console.log('   - Name:', user.name);
    console.log('   - Email:', user.email);
    
    // Try to decode JWT (basic check)
    if (user.token) {
      try {
        const parts = user.token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          console.log('   - Token payload:', payload);
          console.log('   - Token expires:', new Date(payload.exp * 1000));
          console.log('   - Token expired?', Date.now() > payload.exp * 1000);
        }
      } catch (e) {
        console.log('   - Token decode error:', e.message);
      }
    }
  } catch (e) {
    console.log('   - Parse error:', e.message);
  }
}

console.log('2. Direct token in localStorage:', directToken ? 'EXISTS' : 'NOT FOUND');
if (directToken) {
  console.log('   - Direct token length:', directToken.length);
}

// Check axios defaults
console.log('3. Axios default headers:', window.axios?.defaults?.headers?.common?.Authorization || 'NOT SET');

// Test API call
console.log('4. Testing API call...');
const API_BASE_URL = 'http://localhost:5005/api';
const token = userString ? JSON.parse(userString).token : directToken;

if (token) {
  fetch(`${API_BASE_URL}/company-profile`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  .then(response => {
    console.log('   - Response status:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('   - Response data:', data);
  })
  .catch(error => {
    console.log('   - Request error:', error);
  });
} else {
  console.log('   - No token found for API test');
}

console.log('===========================================');