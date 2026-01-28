// Đường dẫn: src/components/Chat/MessageBubble.jsx

import React from 'react';
import { User, Check, CheckCheck } from 'lucide-react';
import { messageBubbleStyles as styles } from '../../styles/chatStyles';
import { getCurrentUserId } from '../../utils/chatHelpers';

export default function MessageBubble({ message, isOwn, showAvatar }) {
  const currentUserId = getCurrentUserId();
  
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const isSeen = message.seenBy && message.seenBy.length > 1; // Seen by others (not just sender)
  const isSeenByOther = isSeen && message.seenBy.some(id => id !== message.senderId._id);

  return (
    <div style={{
      ...styles.container,
      ...(isOwn ? styles.containerOwn : {})
    }}>
      {/* Avatar (only for other's messages) */}
      {!isOwn && showAvatar && (
        <div style={styles.avatarContainer}>
          {message.senderId.avatar ? (
            <img src={message.senderId.avatar} alt="" style={styles.avatar} />
          ) : (
            <div style={styles.avatarPlaceholder}>
              <User size={16} color="#9ca3af" />
            </div>
          )}
        </div>
      )}
      
      {/* Spacer when no avatar */}
      {!isOwn && !showAvatar && <div style={styles.avatarSpacer} />}

      {/* Message Content */}
      <div style={{
        ...styles.messageWrapper,
        ...(isOwn ? styles.messageWrapperOwn : {})
      }}>
        {/* Sender Name (only for other's messages with avatar) */}
        {!isOwn && showAvatar && (
          <p style={styles.senderName}>{message.senderId.name}</p>
        )}

        {/* Bubble */}
        <div style={{
          ...styles.bubble,
          ...(isOwn ? styles.bubbleOwn : styles.bubbleOther)
        }}>
          <p style={styles.content}>{message.content}</p>
        </div>

        {/* Time & Status */}
        <div style={{
          ...styles.footer,
          ...(isOwn ? styles.footerOwn : {})
        }}>
          <span style={styles.time}>{formatTime(message.createdAt)}</span>
          
          {/* Seen indicator (only for own messages) */}
          {isOwn && (
            <span style={styles.seenIndicator}>
              {isSeenByOther ? (
                <CheckCheck size={14} color="#10b981" />
              ) : (
                <Check size={14} color="#9ca3af" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}