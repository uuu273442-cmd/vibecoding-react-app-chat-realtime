// Đường dẫn: src/components/Chat/ConversationList.jsx

import React from 'react';
import { User } from 'lucide-react';
import { conversationListStyles as styles } from '../../styles/chatStyles';
import { 
  getConversationName, 
  getConversationAvatar, 
  getConversationStatus,
  formatTime 
} from '../../utils/chatHelpers';

export default function ConversationList({ conversations, selectedConversation, onConversationClick }) {
  
  if (conversations.length === 0) {
    return (
      <div style={styles.emptyState}>
        <p style={styles.emptyText}>Chưa có cuộc hội thoại nào</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {conversations.map((conv) => {
        const isSelected = selectedConversation?._id === conv._id;
        const hasUnread = conv.unreadCount > 0;
        const status = getConversationStatus(conv);
        const avatar = getConversationAvatar(conv);
        const name = getConversationName(conv);

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
                  {name}
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