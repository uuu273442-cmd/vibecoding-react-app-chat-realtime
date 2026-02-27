// Đường dẫn: src/components/Chat/MessageBubble.jsx
// FIXED: Handle missing attachments safely

import React from 'react';
import { User, Check, CheckCheck, CornerDownRight } from 'lucide-react';
import { messageBubbleStyles as styles } from '../../styles/chatStyles';
import { getCurrentUserId } from '../../utils/chatHelpers';

// Message Type Components
import MessageReactions from './MessageReactions';
import FileMessage from './FileMessage';
import MediaMessage from './MediaMessage';
import VoicePlayer from './VoicePlayer';
import LinkPreview from './LinkPreview';

export default function MessageBubble({ 
  message, 
  isOwn, 
  showAvatar,
  seenAvatars = [],
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
  const isSeenByOther = isSeen && message.seenBy.some(id => {
    const userId = typeof id === 'string' ? id : id._id;
    return userId !== message.senderId._id;
  });

  const isDeleted = message.isDeleted || message.content === 'Message deleted';

  // Render message content based on type
  const renderMessageContent = () => {
    if (isDeleted) {
      return (
        <p style={{
          ...styles.content,
          fontStyle: 'italic',
          color: '#9ca3af'
        }}>
          Tin nhắn đã bị xóa
        </p>
      );
    }

    switch (message.type) {
      case 'file':
        // FIX: Check if attachments exist
        if (!message.attachments || message.attachments.length === 0) {
          return (
            <p style={{ fontSize: '13px', color: '#9ca3af', fontStyle: 'italic' }}>
              File not available
            </p>
          );
        }
        return (
          <FileMessage
            attachments={message.attachments}
            attachmentCount={message.attachmentCount || message.attachments.length}
          />
        );
        
      case 'media':
        // FIX: Check if attachments exist
        if (!message.attachments || message.attachments.length === 0) {
          return (
            <p style={{ fontSize: '13px', color: '#9ca3af', fontStyle: 'italic' }}>
              Media not available
            </p>
          );
        }
        return (
          <MediaMessage
            attachments={message.attachments}
            attachmentCount={message.attachmentCount || message.attachments.length}
          />
        );
        
      case 'voice':
        // FIX: Check if attachments exist and get first item
        const voiceAttachment = message.attachments?.[0];
        
        if (!voiceAttachment) {
          console.error('Voice message missing attachment:', message);
          return (
            <p style={{ fontSize: '13px', color: '#9ca3af', fontStyle: 'italic' }}>
              Voice message not available
            </p>
          );
        }
        
        return (
          <VoicePlayer
            attachment={voiceAttachment}
            isOwn={isOwn}
          />
        );
        
      case 'text':
      default:
        return (
          <>
            {message.content && (
              <p style={styles.content}>
                {message.content}
              </p>
            )}
            
            {/* Link Previews */}
            {message.linkPreviews && message.linkPreviews.length > 0 && (
              <LinkPreview links={message.linkPreviews} />
            )}
          </>
        );
    }
  };

  return (
    <div 
      style={{
        ...styles.container,
        ...(isOwn ? styles.containerOwn : {})
      }}
      onContextMenu={(e) => onContextMenu?.(e, message)}
    >
      {/* Avatar */}
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
      
      {!isOwn && !showAvatar && <div style={styles.avatarSpacer} />}

      {/* Message Content */}
      <div style={{
        ...styles.messageWrapper,
        ...(isOwn ? styles.messageWrapperOwn : {})
      }}>
        {/* Sender Name */}
        {!isOwn && showAvatar && (
          <p style={styles.senderName}>{message.senderId.name}</p>
        )}

        {/* Reply Quote */}
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
          ...(message.type === 'voice' ? { backgroundColor: 'transparent', padding: 0 } : {}),
          ...(message.type === 'file' || message.type === 'media' ? { backgroundColor: 'transparent', padding: '8px' } : {})
        }}>
          {/* Forwarded Badge */}
          {message.type === 'forward' && (
            <div style={styles.forwardedBadge}>
              <CornerDownRight size={12} />
              <span>Forwarded</span>
            </div>
          )}

          {/* Content */}
          {renderMessageContent()}
        </div>

        {/* Reactions */}
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
          
          {isOwn && !isDeleted && (
            <span style={styles.seenIndicator}>
              {seenAvatars.length > 0 ? (
                <CheckCheck size={14} color="#10b981" />
              ) : (
                <Check size={14} color="#9ca3af" />
              )}
            </span>
          )}
        </div>
      </div>

      {/* Seen avatars — Messenger style */}
      {isOwn && seenAvatars.length > 0 && (
        <div style={seenStyle.row}>
          {seenAvatars.slice(0, 5).map((user, i) => {
            const id = typeof user === 'string' ? user : user._id;
            const name = typeof user === 'object' ? user.name : '';
            const avatar = typeof user === 'object' ? user.avatar : null;
            return (
              <div key={id || i} title={name} style={seenStyle.avatarWrap}>
                {avatar ? (
                  <img src={avatar} alt={name} style={seenStyle.avatar} />
                ) : (
                  <div style={seenStyle.avatarFallback}>
                    {name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                )}
              </div>
            );
          })}
          {seenAvatars.length > 5 && (
            <div style={{ ...seenStyle.avatarFallback, fontSize: 8 }}>
              +{seenAvatars.length - 5}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const seenStyle = {
  row: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 2,
    paddingRight: 4,
    marginTop: 2,
    marginBottom: 2,
  },
  avatarWrap: {
    width: 14,
    height: 14,
    borderRadius: '50%',
    overflow: 'hidden',
    flexShrink: 0,
  },
  avatar: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  avatarFallback: {
    width: 14,
    height: 14,
    borderRadius: '50%',
    background: 'linear-gradient(135deg,#667eea,#764ba2)',
    color: 'white',
    fontSize: 7,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
};