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

    // Lưu tokens
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);

    // Lưu thông tin user để tránh decode JWT nhiều lần
    if (data.user) {
      localStorage.setItem('currentUser', JSON.stringify(data.user));
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// Refresh access token
export const refreshAccessToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!refreshToken) {
      throw { message: 'No refresh token found', statusCode: 401 };
    }

    const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.AUTH.REFRESH_TOKEN}`, {
      method: 'POST',
      headers: API_CONFIG.HEADERS,
      body: JSON.stringify({ refreshToken })
    });

    const data = await response.json();

    if (!response.ok) {
      // RefreshToken hết hạn hoặc không hợp lệ -> xóa tokens
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      throw data;
    }

    // Lưu tokens mới
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);

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

    // Clear tokens regardless of response
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('currentUser');

    if (!response.ok) {
      const data = await response.json();
      throw data;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    // Still remove tokens even if API call fails
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('currentUser');
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

// Get current user info (saved at login) — never stale
export const getCurrentUser = () => {
  try {
    const raw = localStorage.getItem('currentUser');
    if (raw) return JSON.parse(raw);
  } catch {}
  // Fallback: decode JWT
  const token = localStorage.getItem('accessToken');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return { _id: payload.sub || payload.id, ...payload };
  } catch {}
  return null;
};

// Get refresh token
export const getRefreshToken = () => {
  return localStorage.getItem('refreshToken');
};