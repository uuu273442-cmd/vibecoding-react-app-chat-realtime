// Đường dẫn: src/services/chatService.js

import { API_CONFIG, API_ENDPOINTS } from "../config/api.config";
import { getAccessToken } from "./authService";

// ============ CONVERSATIONS ============

// Get all conversations
export const getConversations = async () => {
  try {
    const token = getAccessToken();
    if (!token) throw { message: "No access token found", statusCode: 401 };

    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_ENDPOINTS.CHAT.CONVERSATIONS}`,
      {
        method: "GET",
        headers: { ...API_CONFIG.HEADERS, Authorization: `Bearer ${token}` },
      }
    );

    const data = await response.json();
    if (!response.ok) throw data;
    return data;
  } catch (error) {
    throw error;
  }
};

// Get list of users (for creating new conversation)
export const getListUsers = async () => {
  try {
    const token = getAccessToken();
    if (!token) throw { message: "No access token found", statusCode: 401 };

    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_ENDPOINTS.CHAT.LIST_USERS}`,
      {
        method: "GET",
        headers: { ...API_CONFIG.HEADERS, Authorization: `Bearer ${token}` },
      }
    );

    const data = await response.json();
    if (!response.ok) throw data;
    return data;
  } catch (error) {
    throw error;
  }
};

// Create private conversation
export const createPrivateConversation = async (userId) => {
  try {
    const token = getAccessToken();
    if (!token) throw { message: "No access token found", statusCode: 401 };

    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_ENDPOINTS.CHAT.CREATE_PRIVATE}`,
      {
        method: "POST",
        headers: { ...API_CONFIG.HEADERS, Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId }),
      }
    );

    const data = await response.json();
    if (!response.ok) throw data;
    return data;
  } catch (error) {
    throw error;
  }
};

// ============ MESSAGES - CURSOR PAGINATION ============

/**
 * Initial load - server tự trả về 19 tin nhắn mới nhất
 * Response: { messages: [], nextCursor: "messageId", hasMore: bool }
 */
export const getMessages = async (conversationId) => {
  try {
    const token = getAccessToken();
    if (!token) throw { message: "No access token found", statusCode: 401 };

    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_ENDPOINTS.CHAT.MESSAGES}/${conversationId}`,
      {
        method: "GET",
        headers: { ...API_CONFIG.HEADERS, Authorization: `Bearer ${token}` },
      }
    );

    const data = await response.json();
    if (!response.ok) throw data;
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Load more - cursor-based pagination
 * Gọi khi scroll lên đầu, before = nextCursor từ response trước
 * Response: { messages: [], nextCursor: "messageId", hasMore: bool }
 */
export const getMoreMessages = async (conversationId, beforeMessageId, limit = 19) => {
  try {
    const token = getAccessToken();
    if (!token) throw { message: "No access token found", statusCode: 401 };

    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_ENDPOINTS.CHAT.MESSAGES}/${conversationId}?before=${beforeMessageId}&limit=${limit}`,
      {
        method: "GET",
        headers: { ...API_CONFIG.HEADERS, Authorization: `Bearer ${token}` },
      }
    );

    const data = await response.json();
    if (!response.ok) throw data;
    return data;
  } catch (error) {
    throw error;
  }
};

// Mark messages as seen
export const markMessagesSeen = async (conversationId) => {
  try {
    const token = getAccessToken();
    if (!token) throw { message: "No access token found", statusCode: 401 };

    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_ENDPOINTS.CHAT.MARK_SEEN}/${conversationId}/seen`,
      {
        method: "PATCH",
        headers: { ...API_CONFIG.HEADERS, Authorization: `Bearer ${token}` },
      }
    );

    const data = await response.json();
    if (!response.ok) throw data;
    return data;
  } catch (error) {
    throw error;
  }
};

// Send a message (basic - không có replyTo)
export const sendMessage = async (conversationId, content) => {
  try {
    const token = getAccessToken();
    if (!token) throw { message: "No access token found", statusCode: 401 };

    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_ENDPOINTS.CHAT.SEND_MESSAGE}/${conversationId}`,
      {
        method: "POST",
        headers: { ...API_CONFIG.HEADERS, Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content }),
      }
    );

    const data = await response.json();
    if (!response.ok) throw data;
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Send message with optional reply
 */
export const sendMessageWithReply = async (conversationId, content, replyTo = null) => {
  try {
    const token = getAccessToken();
    if (!token) throw { message: "No access token found", statusCode: 401 };

    const body = { content };
    if (replyTo) body.replyTo = replyTo;

    const response = await fetch(
      `${API_CONFIG.BASE_URL}/messages/${conversationId}`,
      {
        method: "POST",
        headers: { ...API_CONFIG.HEADERS, Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();
    if (!response.ok) throw data;
    return data;
  } catch (error) {
    throw error;
  }
};

// ============ REACTIONS ============

/**
 * Add reaction to a message
 */
export const addReaction = async (conversationId, messageId, emoji) => {
  try {
    const token = getAccessToken();
    if (!token) throw { message: "No access token found", statusCode: 401 };

    const response = await fetch(
      `${API_CONFIG.BASE_URL}/messages/${conversationId}/react`,
      {
        method: "POST",
        headers: { ...API_CONFIG.HEADERS, Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id: messageId, emoji }),
      }
    );

    const data = await response.json();
    if (!response.ok) throw data;
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Remove reaction from a message
 */
export const removeReaction = async (conversationId, messageId, emoji) => {
  try {
    const token = getAccessToken();
    if (!token) throw { message: "No access token found", statusCode: 401 };

    const response = await fetch(
      `${API_CONFIG.BASE_URL}/messages/${conversationId}/unreact`,
      {
        method: "PATCH",
        headers: { ...API_CONFIG.HEADERS, Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id: messageId }),
      }
    );

    const data = await response.json();
    if (!response.ok) throw data;
    return data;
  } catch (error) {
    throw error;
  }
};

// Toggle reaction (alias - dùng addReaction vì backend tự toggle)
export const toggleReaction = async (conversationId, messageId, emoji) => {
  return addReaction(conversationId, messageId, emoji);
};

// ============ EDIT / DELETE / FORWARD ============

/**
 * Edit message content
 */
export const editMessage = async (conversationId, messageId, newContent) => {
  try {
    const token = getAccessToken();
    if (!token) throw { message: "No access token found", statusCode: 401 };

    const response = await fetch(
      `${API_CONFIG.BASE_URL}/messages/${conversationId}`,
      {
        method: "PATCH",
        headers: { ...API_CONFIG.HEADERS, Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id: messageId, content: newContent }),
      }
    );

    const data = await response.json();
    if (!response.ok) throw data;
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete message
 * scope: 'self' | 'everyone'
 */
export const deleteMessage = async (conversationId, messageId, scope = "self") => {
  try {
    const token = getAccessToken();
    if (!token) throw { message: "No access token found", statusCode: 401 };

    const response = await fetch(
      `${API_CONFIG.BASE_URL}/messages/${conversationId}?scope=${scope}`,
      {
        method: "DELETE",
        headers: { ...API_CONFIG.HEADERS, Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id: messageId }),
      }
    );

    const data = await response.json();
    if (!response.ok) throw data;
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Forward message to multiple conversations
 */
export const forwardMessage = async (conversationId, messageId, targetConversationIds) => {
  try {
    const token = getAccessToken();
    if (!token) throw { message: "No access token found", statusCode: 401 };

    const response = await fetch(
      `${API_CONFIG.BASE_URL}/messages/${conversationId}/forward`,
      {
        method: "POST",
        headers: { ...API_CONFIG.HEADERS, Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id: messageId, conversationIds: targetConversationIds }),
      }
    );

    const data = await response.json();
    if (!response.ok) throw data;
    return data;
  } catch (error) {
    throw error;
  }
};

// ============ PIN / UNPIN ============

/**
 * Pin a message (max 3 per conversation)
 */
export const pinMessage = async (conversationId, messageId) => {
  try {
    const token = getAccessToken();
    if (!token) throw { message: "No access token found", statusCode: 401 };

    const response = await fetch(
      `${API_CONFIG.BASE_URL}/messages/${conversationId}/pin`,
      {
        method: "POST",
        headers: { ...API_CONFIG.HEADERS, Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id: messageId }),
      }
    );

    const data = await response.json();
    if (!response.ok) throw data;
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Unpin a message
 */
export const unpinMessage = async (conversationId, messageId) => {
  try {
    const token = getAccessToken();
    if (!token) throw { message: "No access token found", statusCode: 401 };

    const response = await fetch(
      `${API_CONFIG.BASE_URL}/messages/${conversationId}/unpin`,
      {
        method: "PATCH",
        headers: { ...API_CONFIG.HEADERS, Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id: messageId }),
      }
    );

    const data = await response.json();
    if (!response.ok) throw data;
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get pinned messages từ messages array (client-side filter)
 * Max 3, sorted by pinnedAt desc
 */
export const getPinnedMessages = (messages) => {
  return messages
    .filter((msg) => msg.isPinned === true)
    .sort((a, b) => new Date(b.pinnedAt) - new Date(a.pinnedAt))
    .slice(0, 3);
};

// ============ SEARCH ============

/**
 * Search messages globally
 * Response: [{ ...message, score: 1.0 }, ...]
 */
export const searchMessages = async (query) => {
  try {
    const token = getAccessToken();
    if (!token) throw { message: "No access token found", statusCode: 401 };

    if (!query || query.trim().length === 0) return [];

    const response = await fetch(
      `${API_CONFIG.BASE_URL}/messages/search?q=${encodeURIComponent(query.trim())}`,
      {
        method: "GET",
        headers: { ...API_CONFIG.HEADERS, Authorization: `Bearer ${token}` },
      }
    );

    const data = await response.json();
    if (!response.ok) throw data;
    return data;
  } catch (error) {
    throw error;
  }
};

// ============ UPLOAD ============

const uploadWithXHR = (url, formData, token, onProgress) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener("load", () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(data);
        } else {
          reject(data);
        }
      } catch (e) {
        reject({ message: "Invalid response", statusCode: 500 });
      }
    });

    xhr.addEventListener("error", () => {
      reject({ message: "Upload failed", statusCode: 500 });
    });

    xhr.addEventListener("abort", () => {
      reject({ message: "Upload cancelled", statusCode: 0 });
    });

    xhr.open("POST", url);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.send(formData);
  });
};

/**
 * Upload files (documents) - max 10 files, mỗi file < 10MB
 */
export const uploadFiles = async (conversationId, files, replyTo = null, onProgress) => {
  try {
    const token = getAccessToken();
    if (!token) throw { message: "No access token found", statusCode: 401 };
    if (!files || files.length === 0) throw { message: "No files selected", statusCode: 400 };
    if (files.length > 10) throw { message: "Maximum 10 files allowed", statusCode: 400 };

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    if (replyTo) formData.append("replyTo", replyTo);

    return uploadWithXHR(
      `${API_CONFIG.BASE_URL}/messages/${conversationId}/file`,
      formData,
      token,
      onProgress
    );
  } catch (error) {
    throw error;
  }
};

/**
 * Upload media (images/videos) - max 10 files, mỗi file < 10MB
 */
export const uploadMedia = async (conversationId, files, replyTo = null, onProgress) => {
  try {
    const token = getAccessToken();
    if (!token) throw { message: "No access token found", statusCode: 401 };
    if (!files || files.length === 0) throw { message: "No files selected", statusCode: 400 };
    if (files.length > 10) throw { message: "Maximum 10 files allowed", statusCode: 400 };

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    if (replyTo) formData.append("replyTo", replyTo);

    return uploadWithXHR(
      `${API_CONFIG.BASE_URL}/messages/${conversationId}/media`,
      formData,
      token,
      onProgress
    );
  } catch (error) {
    throw error;
  }
};

/**
 * Upload voice message - single audio file < 10MB
 */
export const uploadVoice = async (conversationId, file, replyTo = null, onProgress) => {
  try {
    const token = getAccessToken();
    if (!token) throw { message: "No access token found", statusCode: 401 };
    if (!file) throw { message: "No file selected", statusCode: 400 };

    const formData = new FormData();
    formData.append("file", file);
    if (replyTo) formData.append("replyTo", replyTo);

    return uploadWithXHR(
      `${API_CONFIG.BASE_URL}/messages/${conversationId}/voice`,
      formData,
      token,
      onProgress
    );
  } catch (error) {
    throw error;
  }
};

// ============ HELPERS ============

/**
 * Format file size: bytes → "1.5 MB"
 */
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`;
};

/**
 * Format duration: seconds → "1:30"
 */
export const formatDuration = (seconds) => {
  if (!seconds || isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

/**
 * Get file icon name based on extension
 */
export const getFileIcon = (filename) => {
  if (!filename) return "file";
  const ext = filename.split(".").pop().toLowerCase();

  const iconMap = {
    pdf: "file-text",
    doc: "file-text",
    docx: "file-text",
    txt: "file-text",
    xls: "file-spreadsheet",
    xlsx: "file-spreadsheet",
    csv: "file-spreadsheet",
    ppt: "file-presentation",
    pptx: "file-presentation",
    zip: "file-archive",
    rar: "file-archive",
    "7z": "file-archive",
    js: "file-code",
    jsx: "file-code",
    ts: "file-code",
    tsx: "file-code",
    html: "file-code",
    css: "file-code",
    json: "file-code",
  };

  return iconMap[ext] || "file";
};