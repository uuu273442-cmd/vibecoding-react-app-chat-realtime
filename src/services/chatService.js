// Đường dẫn: src/services/chatService.js

import { API_CONFIG, API_ENDPOINTS } from "../config/api.config";
import { getAccessToken } from "./authService";

// Get all conversations
export const getConversations = async () => {
  try {
    const token = getAccessToken();

    if (!token) {
      throw { message: "No access token found", statusCode: 401 };
    }

    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_ENDPOINTS.CHAT.CONVERSATIONS}`,
      {
        method: "GET",
        headers: {
          ...API_CONFIG.HEADERS,
          Authorization: `Bearer ${token}`,
        },
      },
    );

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
      throw { message: "No access token found", statusCode: 401 };
    }

    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_ENDPOINTS.CHAT.LIST_USERS}`,
      {
        method: "GET",
        headers: {
          ...API_CONFIG.HEADERS,
          Authorization: `Bearer ${token}`,
        },
      },
    );

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
      throw { message: "No access token found", statusCode: 401 };
    }

    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_ENDPOINTS.CHAT.CREATE_PRIVATE}`,
      {
        method: "POST",
        headers: {
          ...API_CONFIG.HEADERS,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId }),
      },
    );

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
      throw { message: "No access token found", statusCode: 401 };
    }

    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_ENDPOINTS.CHAT.MESSAGES}/${conversationId}`,
      {
        method: "GET",
        headers: {
          ...API_CONFIG.HEADERS,
          Authorization: `Bearer ${token}`,
        },
      },
    );

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
      throw { message: "No access token found", statusCode: 401 };
    }

    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_ENDPOINTS.CHAT.SEND_MESSAGE}/${conversationId}`,
      {
        method: "POST",
        headers: {
          ...API_CONFIG.HEADERS,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      },
    );

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
      throw { message: "No access token found", statusCode: 401 };
    }

    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_ENDPOINTS.CHAT.MARK_SEEN}/${conversationId}/seen`,
      {
        method: "PATCH",
        headers: {
          ...API_CONFIG.HEADERS,
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw data;
    }

    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Remove reaction from a message (same endpoint as add)
 * Backend should toggle: add if not exists, remove if exists
 * @param {string} conversationId
 * @param {string} messageId
 * @param {string} emoji
 * @returns {Promise<Object>} Updated message
 */
export const toggleReaction = async (conversationId, messageId, emoji) => {
  return addReaction(conversationId, messageId, emoji);
};

// ============ MESSAGE FEATURES - UPDATED ============

/**
 * Add reaction to a message
 * @param {string} conversationId 
 * @param {string} messageId 
 * @param {string} emoji 
 * @returns {Promise<Object>} Updated message with reactions
 */
export const addReaction = async (conversationId, messageId, emoji) => {
  try {
    const token = getAccessToken();
    
    if (!token) {
      throw { message: 'No access token found', statusCode: 401 };
    }

    const response = await fetch(`${API_CONFIG.BASE_URL}/messages/${conversationId}/react`, {
      method: 'POST',
      headers: {
        ...API_CONFIG.HEADERS,
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ 
        id: messageId, 
        emoji 
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

/**
 * Remove reaction from a message
 * NEW: Separate unreact endpoint
 * @param {string} conversationId 
 * @param {string} messageId 
 * @param {string} emoji - Emoji to remove (optional, backend might not use it)
 * @returns {Promise<Object>} Updated message
 */
export const removeReaction = async (conversationId, messageId, emoji) => {
  try {
    const token = getAccessToken();
    
    if (!token) {
      throw { message: 'No access token found', statusCode: 401 };
    }

    const response = await fetch(`${API_CONFIG.BASE_URL}/messages/${conversationId}/unreact`, {
      method: 'PATCH',
      headers: {
        ...API_CONFIG.HEADERS,
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ 
        id: messageId
        // Note: Backend nhận messageId, tự tìm và remove reaction của user hiện tại
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

/**
 * Send message with optional reply
 * @param {string} conversationId 
 * @param {string} content 
 * @param {string|null} replyTo - Message ID to reply to (optional)
 * @returns {Promise<Object>} Created message
 */
export const sendMessageWithReply = async (conversationId, content, replyTo = null) => {
  try {
    const token = getAccessToken();
    
    if (!token) {
      throw { message: 'No access token found', statusCode: 401 };
    }

    const body = { content };
    if (replyTo) {
      body.replyTo = replyTo;
    }

    const response = await fetch(`${API_CONFIG.BASE_URL}/messages/${conversationId}`, {
      method: 'POST',
      headers: {
        ...API_CONFIG.HEADERS,
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(body)
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

/**
 * Edit message content
 * @param {string} conversationId 
 * @param {string} messageId 
 * @param {string} newContent 
 * @returns {Promise<Object>} Updated message with isEdited flag
 */
export const editMessage = async (conversationId, messageId, newContent) => {
  try {
    const token = getAccessToken();
    
    if (!token) {
      throw { message: 'No access token found', statusCode: 401 };
    }

    const response = await fetch(`${API_CONFIG.BASE_URL}/messages/${conversationId}`, {
      method: 'PATCH',
      headers: {
        ...API_CONFIG.HEADERS,
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ 
        id: messageId,
        content: newContent
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

/**
 * Delete message
 * @param {string} conversationId 
 * @param {string} messageId 
 * @param {string} scope - 'self' or 'everyone'
 * @returns {Promise<Object>} Updated message
 */
export const deleteMessage = async (conversationId, messageId, scope = 'self') => {
  try {
    const token = getAccessToken();
    
    if (!token) {
      throw { message: 'No access token found', statusCode: 401 };
    }

    const response = await fetch(
      `${API_CONFIG.BASE_URL}/messages/${conversationId}?scope=${scope}`,
      {
        method: 'DELETE',
        headers: {
          ...API_CONFIG.HEADERS,
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id: messageId })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw data;
    }

    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Forward message to multiple conversations
 * @param {string} conversationId - Source conversation
 * @param {string} messageId 
 * @param {Array<string>} targetConversationIds 
 * @returns {Promise<Array>} Array of forwarded messages
 */
export const forwardMessage = async (conversationId, messageId, targetConversationIds) => {
  try {
    const token = getAccessToken();
    
    if (!token) {
      throw { message: 'No access token found', statusCode: 401 };
    }

    const response = await fetch(
      `${API_CONFIG.BASE_URL}/messages/${conversationId}/forward`,
      {
        method: 'POST',
        headers: {
          ...API_CONFIG.HEADERS,
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          id: messageId,
          conversationIds: targetConversationIds
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw data;
    }

    return data;
  } catch (error) {
    throw error;
  }
};