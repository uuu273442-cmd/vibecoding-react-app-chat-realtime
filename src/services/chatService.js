// Đường dẫn: src/services/chatService.js

import { API_CONFIG, API_ENDPOINTS } from '../config/api.config';
import { getAccessToken } from './authService';

// Get all conversations
export const getConversations = async () => {
  try {
    const token = getAccessToken();
    
    if (!token) {
      throw { message: 'No access token found', statusCode: 401 };
    }

    const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.CHAT.CONVERSATIONS}`, {
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

// Get messages for a conversation
export const getMessages = async (conversationId) => {
  try {
    const token = getAccessToken();
    
    if (!token) {
      throw { message: 'No access token found', statusCode: 401 };
    }

    const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.CHAT.MESSAGES}/${conversationId}`, {
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

// Send a message
export const sendMessage = async (messageData) => {
  try {
    const token = getAccessToken();
    
    if (!token) {
      throw { message: 'No access token found', statusCode: 401 };
    }

    const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.CHAT.SEND}`, {
      method: 'POST',
      headers: {
        ...API_CONFIG.HEADERS,
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(messageData)
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