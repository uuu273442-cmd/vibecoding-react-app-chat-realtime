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

/**
 * Upload files (documents)
 * @param {string} conversationId 
 * @param {Array<File>} files - Max 10 files, each < 10MB
 * @param {string|null} replyTo - Optional message ID to reply to
 * @param {Function} onProgress - Progress callback (0-100)
 * @returns {Promise<Object>} { message, attachments }
 */
export const uploadFiles = async (conversationId, files, replyTo = null, onProgress) => {
  try {
    const token = getAccessToken();
    
    if (!token) {
      throw { message: 'No access token found', statusCode: 401 };
    }

    // Validate
    if (!files || files.length === 0) {
      throw { message: 'No files selected', statusCode: 400 };
    }

    if (files.length > 10) {
      throw { message: 'Maximum 10 files allowed', statusCode: 400 };
    }

    // Create FormData
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    if (replyTo) {
      formData.append('replyTo', replyTo);
    }

    // Upload with progress tracking
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Progress tracking
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          const progress = Math.round((e.loaded / e.total) * 100);
          onProgress(progress);
        }
      });

      // Success
      xhr.addEventListener('load', () => {
        if (xhr.status === 200 || xhr.status === 201) {
          const data = JSON.parse(xhr.responseText);
          resolve(data);
        } else {
          const error = JSON.parse(xhr.responseText);
          reject(error);
        }
      });

      // Error
      xhr.addEventListener('error', () => {
        reject({ message: 'Upload failed', statusCode: 500 });
      });

      // Abort
      xhr.addEventListener('abort', () => {
        reject({ message: 'Upload cancelled', statusCode: 0 });
      });

      // Open and send
      xhr.open('POST', `${API_CONFIG.BASE_URL}/messages/${conversationId}/file`);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(formData);
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Upload media (images/videos)
 * @param {string} conversationId 
 * @param {Array<File>} files - Max 10 files, each < 10MB
 * @param {string|null} replyTo - Optional message ID to reply to
 * @param {Function} onProgress - Progress callback (0-100)
 * @returns {Promise<Object>} { message, attachments }
 */
export const uploadMedia = async (conversationId, files, replyTo = null, onProgress) => {
  try {
    const token = getAccessToken();
    
    if (!token) {
      throw { message: 'No access token found', statusCode: 401 };
    }

    if (!files || files.length === 0) {
      throw { message: 'No files selected', statusCode: 400 };
    }

    if (files.length > 10) {
      throw { message: 'Maximum 10 files allowed', statusCode: 400 };
    }

    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    if (replyTo) {
      formData.append('replyTo', replyTo);
    }

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          const progress = Math.round((e.loaded / e.total) * 100);
          onProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200 || xhr.status === 201) {
          const data = JSON.parse(xhr.responseText);
          resolve(data);
        } else {
          const error = JSON.parse(xhr.responseText);
          reject(error);
        }
      });

      xhr.addEventListener('error', () => {
        reject({ message: 'Upload failed', statusCode: 500 });
      });

      xhr.addEventListener('abort', () => {
        reject({ message: 'Upload cancelled', statusCode: 0 });
      });

      xhr.open('POST', `${API_CONFIG.BASE_URL}/messages/${conversationId}/media`);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(formData);
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Upload voice message
 * @param {string} conversationId 
 * @param {File} file - Single audio file < 10MB
 * @param {string|null} replyTo - Optional message ID to reply to
 * @param {Function} onProgress - Progress callback (0-100)
 * @returns {Promise<Object>} { message, attachments }
 */
export const uploadVoice = async (conversationId, file, replyTo = null, onProgress) => {
  try {
    const token = getAccessToken();
    
    if (!token) {
      throw { message: 'No access token found', statusCode: 401 };
    }

    if (!file) {
      throw { message: 'No file selected', statusCode: 400 };
    }

    const formData = new FormData();
    formData.append('files', file); // Backend expect 'files' field

    if (replyTo) {
      formData.append('replyTo', replyTo);
    }

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          const progress = Math.round((e.loaded / e.total) * 100);
          onProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200 || xhr.status === 201) {
          const data = JSON.parse(xhr.responseText);
          resolve(data);
        } else {
          const error = JSON.parse(xhr.responseText);
          reject(error);
        }
      });

      xhr.addEventListener('error', () => {
        reject({ message: 'Upload failed', statusCode: 500 });
      });

      xhr.addEventListener('abort', () => {
        reject({ message: 'Upload cancelled', statusCode: 0 });
      });

      xhr.open('POST', `${API_CONFIG.BASE_URL}/messages/${conversationId}/voice`);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(formData);
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Get file icon based on file extension
 * @param {string} filename 
 * @returns {string} Icon name
 */
export const getFileIcon = (filename) => {
  const ext = filename.split('.').pop().toLowerCase();
  
  const iconMap = {
    // Documents
    pdf: 'file-text',
    doc: 'file-text',
    docx: 'file-text',
    txt: 'file-text',
    
    // Spreadsheets
    xls: 'file-spreadsheet',
    xlsx: 'file-spreadsheet',
    csv: 'file-spreadsheet',
    
    // Presentations
    ppt: 'file-presentation',
    pptx: 'file-presentation',
    
    // Archives
    zip: 'file-archive',
    rar: 'file-archive',
    '7z': 'file-archive',
    
    // Code
    js: 'file-code',
    jsx: 'file-code',
    ts: 'file-code',
    tsx: 'file-code',
    html: 'file-code',
    css: 'file-code',
    json: 'file-code',
    
    // Default
    default: 'file'
  };
  
  return iconMap[ext] || iconMap.default;
};

/**
 * Format file size
 * @param {number} bytes 
 * @returns {string} Formatted size (e.g., "1.5 MB")
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Format duration (seconds to MM:SS)
 * @param {number} seconds 
 * @returns {string} Formatted duration
 */
export const formatDuration = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};
