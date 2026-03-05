// Đường dẫn: src/services/activeConversation.js
// Module-level singleton — track conversation đang mở
// ChatLayout ghi, ToastNotification / ChatLayout đọc để tránh notify trùng

let _activeConversationId = null;

export const setActiveConversationId = (id) => {
  _activeConversationId = id || null;
};

export const getActiveConversationId = () => _activeConversationId;