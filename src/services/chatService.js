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

// Get list of users (for creating new conversation)
export const getListUsers = async () => {
  try {
    const token = getAccessToken();
    
    if (!token) {
      throw { message: 'No access token found', statusCode: 401 };
    }

    const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.CHAT.LIST_USERS}`, {
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

// Create private conversation
export const createPrivateConversation = async (userId) => {
  try {
    const token = getAccessToken();
    
    if (!token) {
      throw { message: 'No access token found', statusCode: 401 };
    }

    const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.CHAT.CREATE_PRIVATE}`, {
      method: 'POST',
      headers: {
        ...API_CONFIG.HEADERS,
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ userId })
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
export const sendMessage = async (conversationId, content) => {
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
      body: JSON.stringify({ 
        conversationId, 
        content,
        type: 'text'
      })
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

// Mark messages as seen
export const markMessagesSeen = async (conversationId) => {
  try {
    const token = getAccessToken();
    
    if (!token) {
      throw { message: 'No access token found', statusCode: 401 };
    }

    const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.CHAT.MARK_SEEN}/${conversationId}`, {
      method: 'PATCH',
      headers: {
        ...API_CONFIG.HEADERS,
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const data = await response.json();
      throw data;
    }

    return { success: true };
  } catch (error) {
    throw error;
  }
};