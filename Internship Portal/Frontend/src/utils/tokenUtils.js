// Token validation utility
export const tokenUtils = {
  // Get token from localStorage with validation
  getToken: () => {
    try {
      const userString = localStorage.getItem('user');
      if (userString) {
        const user = JSON.parse(userString);
        return user.token;
      }
      // Fallback to direct token storage
      return localStorage.getItem('token');
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  },

  // Validate if token is expired
  isTokenExpired: (token) => {
    if (!token) return true;
    
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return true;
      
      const payload = JSON.parse(atob(parts[1]));
      const currentTime = Date.now() / 1000;
      
      return payload.exp < currentTime;
    } catch (error) {
      console.error('Error validating token:', error);
      return true;
    }
  },

  // Get user info from token
  getUserFromToken: (token) => {
    if (!token) return null;
    
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      
      const payload = JSON.parse(atob(parts[1]));
      return payload;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  },

  // Clear invalid tokens
  clearInvalidTokens: () => {
    const token = tokenUtils.getToken();
    if (token && tokenUtils.isTokenExpired(token)) {
      console.log('🔄 Clearing expired token');
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      delete window.axios?.defaults?.headers?.common?.Authorization;
      return true;
    }
    return false;
  },

  // Validate user role
  validateUserRole: (requiredRole) => {
    try {
      const userString = localStorage.getItem('user');
      if (userString) {
        const user = JSON.parse(userString);
        return user.role === requiredRole;
      }
      return false;
    } catch (error) {
      console.error('Error validating user role:', error);
      return false;
    }
  }
};

export default tokenUtils;