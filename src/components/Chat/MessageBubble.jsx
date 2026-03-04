// Đường dẫn: src/components/Chat/MessageBubble.jsx

import React, { useState } from 'react';
import { User, Check, CheckCheck, CornerDownRight, SmilePlus } from 'lucide-react';
import { getCurrentUserId } from '../../utils/chatHelpers';
import MessageReactions from './MessageReactions';
import FileMessage from './FileMessage';
import MediaMessage from './MediaMessage';
import VoicePlayer from './VoicePlayer';
import LinkPreview from './LinkPreview';

// Highlight @Name trong text
function renderTextWithMentions(text, isOwn) {
  const parts = text.split(/(@\S+)/g);
  return parts.map((part, i) => {
    if (part.startsWith('@')) {
      return (
        <span key={i} style={{
          backgroundColor: isOwn ? 'rgba(255,255,255,0.25)' : '#ede9fe',
          color: isOwn ? 'white' : '#7c3aed',
          borderRadius: 4,
          padding: '0 3px',
          fontWeight: 600,
        }}>
          {part}
        </span>
      );
    }
    return part;
  });
}

export default function MessageBubble({
  message,
  isOwn,
  showAvatar,
  seenAvatars = [],
  isLastMessage = false,
  onContextMenu,
  onAddReaction,
  onRemoveReaction,
}) {
  const currentUserId = getCurrentUserId();
  const [isHovered, setIsHovered] = useState(false);

  const formatTime = (d) =>
    new Date(d).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

  const isDeleted = message.isDeleted || message.content === 'Message deleted';

  const renderContent = () => {
    if (isDeleted) {
      return (
        <p style={{ fontSize: 14, fontStyle: 'italic', color: isOwn ? 'rgba(255,255,255,0.6)' : '#9ca3af', margin: 0 }}>
          Tin nhắn đã bị xóa
        </p>
      );
    }
    switch (message.type) {
      case 'file':
        if (!message.attachments?.length) return <p style={ghostText}>File không tìm thấy</p>;
        return <FileMessage attachments={message.attachments} attachmentCount={message.attachmentCount || message.attachments.length} />;
      case 'media':
        if (!message.attachments?.length) return <p style={ghostText}>Media không tìm thấy</p>;
        return <MediaMessage attachments={message.attachments} attachmentCount={message.attachmentCount || message.attachments.length} />;
      case 'voice':
        const va = message.attachments?.[0];
        if (!va) return <p style={ghostText}>Voice message không tìm thấy</p>;
        return <VoicePlayer attachment={va} isOwn={isOwn} />;
      default:
        return (
          <>
            {message.content && (
              <p style={{ fontSize: 14, margin: 0, lineHeight: '1.5', wordBreak: 'break-word' }}>
                {renderTextWithMentions(message.content, isOwn)}
              </p>
            )}
            {message.linkPreviews?.length > 0 && <LinkPreview links={message.linkPreviews} />}
          </>
        );
    }
  };

  const hasReactions = message.reactions?.length > 0;
  const isMedia = message.type === 'file' || message.type === 'media';
  const isVoice = message.type === 'voice';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isOwn ? 'flex-end' : 'flex-start',
        marginBottom: 2,
        position: 'relative',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Sender name — group only */}
      {!isOwn && showAvatar && (
        <p style={{ fontSize: 11, color: '#6b7280', margin: '0 0 2px 40px', fontWeight: 500 }}>
          {message.senderId?.name}
        </p>
      )}

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, flexDirection: isOwn ? 'row-reverse' : 'row' }}>
        {/* Avatar */}
        {!isOwn && (
          <div style={{ width: 28, height: 28, flexShrink: 0, alignSelf: 'flex-end' }}>
            {showAvatar ? (
              message.senderId?.avatar
                ? <img src={message.senderId.avatar} alt="" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
                : <div style={avatarFallback}><User size={14} color="#9ca3af" /></div>
            ) : null}
          </div>
        )}

        {/* Message + hover action row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexDirection: isOwn ? 'row-reverse' : 'row', maxWidth: '65vw' }}>

          {/* Bubble */}
          <div
            style={{ position: 'relative' }}
            onContextMenu={(e) => onContextMenu?.(e, message)}
          >
            {/* Forward badge */}
            {message.type === 'forward' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#9ca3af', marginBottom: 3, paddingLeft: isOwn ? 0 : 12 }}>
                <CornerDownRight size={11} /> Forwarded
              </div>
            )}

            {/* Reply quote */}
            {message.replyTo && (
              <div style={{
                ...(isOwn ? replyOwn : replyOther),
                marginBottom: 4,
              }}>
                <div style={{ width: 3, backgroundColor: isOwn ? 'rgba(255,255,255,0.6)' : '#764ba2', borderRadius: 2, flexShrink: 0 }} />
                <div style={{ paddingLeft: 8, overflow: 'hidden' }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: isOwn ? 'rgba(255,255,255,0.8)' : '#764ba2', margin: '0 0 1px' }}>
                    {message.replyTo.senderId?.name || 'Unknown'}
                  </p>
                  <p style={{ fontSize: 12, color: isOwn ? 'rgba(255,255,255,0.65)' : '#6b7280', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {message.replyTo.content?.slice(0, 60)}{message.replyTo.content?.length > 60 ? '...' : ''}
                  </p>
                </div>
              </div>
            )}

            {/* Main bubble */}
            <div style={{
              padding: isMedia || isVoice ? '6px' : '9px 13px',
              borderRadius: isOwn ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
              ...(isOwn
                ? { background: 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)', color: 'white' }
                : { backgroundColor: 'white', color: '#1f2937', boxShadow: '0 1px 2px rgba(0,0,0,0.08)' }),
              ...(isDeleted ? { backgroundColor: '#f3f4f6', background: 'none', color: '#9ca3af' } : {}),
            }}>
              {renderContent()}
            </div>

            {/* Reactions — absolute, below bubble */}
            {hasReactions && (
              <div style={{
                position: 'absolute',
                bottom: -14,
                ...(isOwn ? { right: 4 } : { left: 4 }),
                zIndex: 2,
              }}>
                <MessageReactions message={message} onAddReaction={onAddReaction} onRemoveReaction={onRemoveReaction} compact />
              </div>
            )}
          </div>

          {/* Hover actions — absolute positioned, no layout shift */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 0.15s',
            pointerEvents: isHovered ? 'auto' : 'none',
          }}>
            {/* Emoji quick react */}
            {!isDeleted && (
              <button
                onClick={() => onAddReaction?.(message._id, '❤️')}
                style={actionBtn}
                title="React"
                onContextMenu={(e) => { e.preventDefault(); onContextMenu?.(e, message); }}
              >
                <SmilePlus size={16} color="#6b7280" />
              </button>
            )}
            {/* More options → context menu */}
            {!isDeleted && (
              <button
                style={actionBtn}
                title="More"
                onClick={(e) => onContextMenu?.(e, message)}
              >
                <span style={{ fontSize: 16, color: '#6b7280', lineHeight: 1 }}>···</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Time + seen status */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 4,
        marginTop: hasReactions ? 18 : 3,
        paddingLeft: isOwn ? 0 : 40,
        justifyContent: isOwn ? 'flex-end' : 'flex-start',
      }}>
        <span style={{ fontSize: 11, color: '#9ca3af' }}>
          {formatTime(message.createdAt)}
          {message.isEdited && <span style={{ fontStyle: 'italic', marginLeft: 3 }}>(đã sửa)</span>}
        </span>
        {isOwn && !isDeleted && (
          seenAvatars.length > 0
            ? <CheckCheck size={13} color="#667eea" />
            : <Check size={13} color="#9ca3af" />
        )}
      </div>

      {/* Seen avatars — chỉ ở message của mình mà được người khác seen */}
      {isOwn && seenAvatars.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 2, marginTop: 1 }}>
          {seenAvatars.slice(0, 5).map((u, i) => {
            const name = typeof u === 'object' ? (u.name || '') : '';
            const av = typeof u === 'object' ? u.avatar : null;
            const key = (typeof u === 'object' ? u._id : u) || name || i;
            return (
              <div key={key} title={name} style={{ width: 14, height: 14, borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                {av
                  ? <img src={av} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ ...seenFallback, fontSize: 7 }}>{name?.charAt(0)?.toUpperCase() || '?'}</div>
                }
              </div>
            );
          })}
          {seenAvatars.length > 5 && <div style={{ ...seenFallback, fontSize: 7, width: 14, height: 14 }}>+{seenAvatars.length - 5}</div>}
        </div>
      )}
    </div>
  );
}

const ghostText = { fontSize: 13, color: '#9ca3af', fontStyle: 'italic', margin: 0 };
const avatarFallback = { width: 28, height: 28, borderRadius: '50%', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const seenFallback = { width: 14, height: 14, borderRadius: '50%', background: 'linear-gradient(135deg,#667eea,#764ba2)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const actionBtn = { width: 28, height: 28, borderRadius: '50%', border: 'none', background: 'white', boxShadow: '0 1px 4px rgba(0,0,0,0.12)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 };
const replyOwn = { display: 'flex', gap: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8, padding: '5px 8px', maxWidth: 260 };
const replyOther = { display: 'flex', gap: 6, backgroundColor: '#f3f4f6', borderRadius: 8, padding: '5px 8px', maxWidth: 260 };