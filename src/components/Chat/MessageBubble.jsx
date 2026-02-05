// Đường dẫn: src/components/Chat/MessageBubble.jsx
// CẬP NHẬT: Hiển thị reactions, reply message, edited badge

import React from 'react';
import { User, Check, CheckCheck, CornerDownRight } from 'lucide-react';
import { messageBubbleStyles as styles } from '../../styles/chatStyles';
import { getCurrentUserId } from '../../utils/chatHelpers';
import MessageReactions from './MessageReactions';

export default function MessageBubble({ 
  message, 
  isOwn, 
  showAvatar,
  onContextMenu,
  onAddReaction,
  onRemoveReaction
}) {
  const currentUserId = getCurrentUserId();
  
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const isSeen = message.seenBy && message.seenBy.length > 1;
  const isSeenByOther = isSeen && message.seenBy.some(id => id !== message.senderId._id);

  // Check if message is deleted
  const isDeleted = message.isDeleted || message.content === 'Message deleted';

  return (
    <div 
      style={{
        ...styles.container,
        ...(isOwn ? styles.containerOwn : {})
      }}
      onContextMenu={(e) => onContextMenu?.(e, message)}
    >
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

        {/* Reply Quote (if message is replying to another) */}
        {message.replyTo && (
          <div style={styles.replyQuote}>
            <div style={styles.quoteBar} />
            <div style={styles.quoteContent}>
              <CornerDownRight size={12} style={styles.quoteIcon} />
              <div>
                <p style={styles.quoteAuthor}>
                  {message.replyTo.senderId?.name || 'Unknown'}
                </p>
                <p style={styles.quoteText}>
                  {message.replyTo.content?.slice(0, 50)}
                  {message.replyTo.content?.length > 50 ? '...' : ''}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Message Bubble */}
        <div style={{
          ...styles.bubble,
          ...(isOwn ? styles.bubbleOwn : styles.bubbleOther),
          ...(isDeleted ? styles.bubbleDeleted : {})
        }}>
          {/* Forwarded indicator */}
          {message.type === 'forward' && (
            <div style={styles.forwardedBadge}>
              <CornerDownRight size={12} />
              <span>Forwarded</span>
            </div>
          )}

          {/* Content */}
          <p style={{
            ...styles.content,
            ...(isDeleted ? styles.contentDeleted : {})
          }}>
            {isDeleted ? (
              <em>Tin nhắn đã bị xóa</em>
            ) : (
              message.content
            )}
          </p>
        </div>

        {/* Message Reactions */}
        {!isDeleted && (
          <MessageReactions
            message={message}
            onAddReaction={onAddReaction}
            onRemoveReaction={onRemoveReaction}
          />
        )}

        {/* Time & Status */}
        <div style={{
          ...styles.footer,
          ...(isOwn ? styles.footerOwn : {})
        }}>
          <span style={styles.time}>
            {formatTime(message.createdAt)}
            {message.isEdited && (
              <span style={styles.editedBadge}> (edited)</span>
            )}
          </span>
          
          {/* Seen indicator (only for own messages) */}
          {isOwn && !isDeleted && (
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

// Add these to your messageBubbleStyles in chatStyles.js:
const additionalStyles = {
  replyQuote: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: '8px',
    padding: '8px',
    marginBottom: '6px',
  },

  quoteBar: {
    width: '3px',
    backgroundColor: '#764ba2',
    borderRadius: '2px',
  },

  quoteContent: {
    display: 'flex',
    gap: '6px',
    paddingLeft: '8px',
  },

  quoteIcon: {
    color: '#764ba2',
    flexShrink: 0,
    marginTop: '2px',
  },

  quoteAuthor: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#764ba2',
    margin: 0,
    marginBottom: '2px',
  },

  quoteText: {
    fontSize: '13px',
    color: '#6b7280',
    margin: 0,
  },

  bubbleDeleted: {
    backgroundColor: '#f3f4f6',
    borderColor: '#d1d5db',
  },

  contentDeleted: {
    color: '#9ca3af',
    fontStyle: 'italic',
  },

  editedBadge: {
    fontSize: '11px',
    color: '#9ca3af',
    fontStyle: 'italic',
  },

  forwardedBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '11px',
    color: '#9ca3af',
    marginBottom: '4px',
  },
};