// Đường dẫn: src/components/Chat/ConversationList.jsx

import React from 'react';
import { User } from 'lucide-react';
import { conversationListStyles as styles } from '../../styles/chatStyles';

export default function ConversationList({ conversations, selectedConversation, onConversationClick }) {
  
  if (conversations.length === 0) {
    return (
      <div style={styles.emptyState}>
        <p style={styles.emptyText}>Chưa có cuộc hội thoại nào</p>
      </div>
    );
  }

  const formatTime = (dateString) => {
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

  const getOtherParticipant = (conv) => {
    // Lấy participant không phải owner
    const other = conv.participants.find(p => p.role !== 'owner');
    return other ? other.userId : null;
  };

  const getConversationName = (conv) => {
    if (conv.type === 'group' && conv.name) {
      return conv.name;
    }
    
    const other = getOtherParticipant(conv);
    return other ? other.name : 'Unknown';
  };

  const getAvatar = (conv) => {
    const other = getOtherParticipant(conv);
    return other?.avatar || null;
  };

  const getStatus = (conv) => {
    const other = getOtherParticipant(conv);
    return other?.status || 'offline';
  };

  return (
    <div style={styles.container}>
      {conversations.map((conv) => {
        const isSelected = selectedConversation?._id === conv._id;
        const hasUnread = conv.unreadCount > 0;
        const status = getStatus(conv);
        const avatar = getAvatar(conv);

        return (
          <div
            key={conv._id}
            onClick={() => onConversationClick(conv)}
            style={{
              ...styles.conversationItem,
              ...(isSelected ? styles.conversationItemActive : {}),
            }}
          >
            {/* Avatar */}
            <div style={styles.avatarContainer}>
              {avatar ? (
                <img src={avatar} alt="" style={styles.avatar} />
              ) : (
                <div style={styles.avatarPlaceholder}>
                  <User size={24} color="#9ca3af" />
                </div>
              )}
              {/* Online status indicator */}
              {status === 'online' && <div style={styles.onlineIndicator} />}
            </div>

            {/* Content */}
            <div style={styles.content}>
              <div style={styles.topRow}>
                <h4 style={{
                  ...styles.name,
                  ...(hasUnread ? styles.nameUnread : {})
                }}>
                  {getConversationName(conv)}
                </h4>
                <span style={styles.time}>
                  {formatTime(conv.updatedAt)}
                </span>
              </div>
              
              <div style={styles.bottomRow}>
                <p style={styles.lastMessage}>
                  {conv.type === 'group' 
                    ? `Nhóm ${conv.participants.length} người` 
                    : status === 'online' ? 'Đang hoạt động' : 'Không hoạt động'}
                </p>
                {hasUnread && (
                  <div style={styles.unreadBadge}>
                    {conv.unreadCount}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}