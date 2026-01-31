// Đường dẫn: src/services/friendsService.js

import { API_CONFIG, API_ENDPOINTS } from '../config/api.config';
import { getAccessToken } from './authService';

// Send friend request
export const sendFriendRequest = async (userId, message = '') => {
  try {
    const token = getAccessToken();
    
    if (!token) {
      throw { message: 'No access token found', statusCode: 401 };
    }

    const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.FRIENDS.SEND_REQUEST}`, {
      method: 'POST',
      headers: {
        ...API_CONFIG.HEADERS,
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ userId, message })
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

// Update friend request (accept/reject)
export const updateFriendRequest = async (requestId, action) => {
  try {
    const token = getAccessToken();
    
    if (!token) {
      throw { message: 'No access token found', statusCode: 401 };
    }

    const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.FRIENDS.UPDATE_REQUEST}/${requestId}`, {
      method: 'PATCH',
      headers: {
        ...API_CONFIG.HEADERS,
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ action })
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

// Get friend requests
export const getFriendRequests = async () => {
  try {
    const token = getAccessToken();
    
    if (!token) {
      throw { message: 'No access token found', statusCode: 401 };
    }

    const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.FRIENDS.GET_REQUESTS}`, {
      method: 'GET',
      headers: {
        ...API_CONFIG.HEADERS,
        'Authorization': `Bearer ${token}`
      }
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

// Get friends list
export const getFriends = async () => {
  try {
    const token = getAccessToken();
    
    if (!token) {
      throw { message: 'No access token found', statusCode: 401 };
    }

    const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.FRIENDS.GET_FRIENDS}`, {
      method: 'GET',
      headers: {
        ...API_CONFIG.HEADERS,
        'Authorization': `Bearer ${token}`
      }
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

// Remove friend
export const removeFriend = async (friendId) => {
  try {
    const token = getAccessToken();
    
    if (!token) {
      throw { message: 'No access token found', statusCode: 401 };
    }

    const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.FRIENDS.REMOVE_FRIEND}/${friendId}`, {
      method: 'DELETE',
      headers: {
        ...API_CONFIG.HEADERS,
        'Authorization': `Bearer ${token}`
      }
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