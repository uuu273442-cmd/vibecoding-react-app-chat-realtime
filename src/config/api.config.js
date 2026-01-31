// Đường dẫn: src/config/api.config.js

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api',
  TIMEOUT: 30000, // 30 seconds
  HEADERS: {
    'Content-Type': 'application/json',
  }
};

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh',
  },
  USER: {
    PROFILE: '/user/profile',
    UPDATE: '/user/update',
  },
  CHAT: {
    CONVERSATIONS: '/conversations',
    CREATE_PRIVATE: '/conversations/private',
    LIST_USERS: '/conversations/list-user',
    MESSAGES: '/messages', // GET /messages/:conversationId
    SEND_MESSAGE: '/messages', // POST /messages/:conversationId
    MARK_SEEN: '/messages', // PATCH /messages/:conversationId/seen
  },
  FRIENDS: {
    SEND_REQUEST: '/friends/request',
    UPDATE_REQUEST: '/friends/request', // PATCH /friends/request/:id
    GET_REQUESTS: '/friends/requests',
    GET_FRIENDS: '/friends',
    REMOVE_FRIEND: '/friends', // DELETE /friends/:id
  }
  // Thêm endpoints khác ở đây
};