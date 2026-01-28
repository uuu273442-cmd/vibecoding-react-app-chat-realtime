// Đường dẫn: src/services/authService.js

import { API_CONFIG, API_ENDPOINTS } from '../config/api.config';

// Register user
export const registerUser = async (userData) => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.AUTH.REGISTER}`, {
      method: 'POST',
      headers: API_CONFIG.HEADERS,
      body: JSON.stringify(userData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw data;
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// Login user
export const loginUser = async (credentials) => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.AUTH.LOGIN}`, {
      method: 'POST',
      headers: API_CONFIG.HEADERS,
      body: JSON.stringify(credentials)
    });

    const data = await response.json();

    if (!response.ok) {
      throw data;
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// Logout user
export const logoutUser = async () => {
  try {
    const token = localStorage.getItem('accessToken');
    
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.AUTH.LOGOUT}`, {
      method: 'POST',
      headers: {
        ...API_CONFIG.HEADERS,
        'Authorization': `Bearer ${token}`
      }
    });

    // Clear token regardless of response
    localStorage.removeItem('accessToken');

    if (!response.ok) {
      const data = await response.json();
      throw data;
    }

    return { success: true };
  } catch (error) {
    // Still remove token even if API call fails
    localStorage.removeItem('accessToken');
    throw error;
  }
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!localStorage.getItem('accessToken');
};

// Get access token
export const getAccessToken = () => {
  return localStorage.getItem('accessToken');
};