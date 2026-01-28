// Đường dẫn: src/utils/chatHelpers.js

// Get current user ID from token
export const getCurrentUserId = () => {
  const token = localStorage.getItem('accessToken');
  if (!token) return null;
  
  try {
    // Decode JWT token để lấy user ID
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub; // 'sub' là user ID trong JWT
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

// Get other participant (not current user) from conversation
export const getOtherParticipant = (conversation) => {
  const currentUserId = getCurrentUserId();
  if (!currentUserId) return null;
  
  // Tìm participant KHÔNG PHẢI user hiện tại
  const other = conversation.participants.find(
    p => p.userId._id !== currentUserId
  );
  
  return other ? other.userId : null;
};

// Get conversation name
export const getConversationName = (conversation) => {
  if (conversation.type === 'group' && conversation.name) {
    return conversation.name;
  }
  
  const other = getOtherParticipant(conversation);
  return other ? other.name : 'Unknown';
};

// Get conversation avatar
export const getConversationAvatar = (conversation) => {
  const other = getOtherParticipant(conversation);
  return other?.avatar || null;
};

// Get conversation status
export const getConversationStatus = (conversation) => {
  const other = getOtherParticipant(conversation);
  return other?.status || 'offline';
};

// Format time
export const formatTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Vừa xong';
  if (minutes < 60) return `${minutes} phút`;
  if (hours < 24) return `${hours} giờ`;
  if (days < 7) return `${days} ngày`;
  
  return date.toLocaleDateString('vi-VN');
};