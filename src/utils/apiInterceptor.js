// Đường dẫn: src/utils/apiInterceptor.js

import { refreshAccessToken, getAccessToken } from '../services/authService';

/**
 * Wrapper cho fetch API với auto refresh token
 * Khi gặp 401, tự động refresh token và retry request
 */
export const fetchWithAuth = async (url, options = {}) => {
  const token = getAccessToken();
  
  // Add Authorization header
  const authOptions = {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    }
  };

  // First attempt
  let response = await fetch(url, authOptions);

  // If 401, try to refresh token and retry
  if (response.status === 401) {
    try {
      // Refresh token
      await refreshAccessToken();
      
      // Retry with new token
      const newToken = getAccessToken();
      authOptions.headers['Authorization'] = `Bearer ${newToken}`;
      response = await fetch(url, authOptions);
      
    } catch (error) {
      // Refresh token failed -> redirect to login
      console.error('Token refresh failed:', error);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
      throw error;
    }
  }

  return response;
};

/**
 * Setup automatic token refresh
 * Tự động refresh token trước khi hết hạn
 */
export const setupAutoRefresh = () => {
  const checkAndRefresh = async () => {
    const token = getAccessToken();
    
    if (!token) return;

    try {
      // Decode token to check expiry
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiresAt = payload.exp * 1000; // Convert to milliseconds
      const now = Date.now();
      const timeUntilExpiry = expiresAt - now;

      // Refresh if token expires in less than 5 minutes
      if (timeUntilExpiry < 5 * 60 * 1000) {
        console.log('Token expiring soon, refreshing...');
        await refreshAccessToken();
        console.log('Token refreshed successfully');
      }
    } catch (error) {
      console.error('Auto refresh error:', error);
    }
  };

  // Check every 1 minute
  setInterval(checkAndRefresh, 60 * 1000);
  
  // Check immediately on setup
  checkAndRefresh();
};