// Đường dẫn: src/components/Chat/PinnedMessages.jsx
// Pinned messages bar at top of chat

import React, { useState } from 'react';
import { Pin, X, ChevronDown, ChevronUp } from 'lucide-react';

const PinnedMessages = ({ pinnedMessages, onUnpin, onMessageClick, currentUserId }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!pinnedMessages || pinnedMessages.length === 0) {
    return null;
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
    });
  };

  const truncateText = (text, maxLength = 50) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  const firstPinned = pinnedMessages[0];
  const remainingCount = pinnedMessages.length - 1;

  return (
    <div style={styles.container}>
      {/* Main Pinned Message */}
      <div 
        style={styles.mainPinned}
        onClick={() => onMessageClick?.(firstPinned)}
      >
        <div style={styles.iconContainer}>
          <Pin size={16} color="#764ba2" />
        </div>

        <div style={styles.content}>
          <div style={styles.header}>
            <span style={styles.label}>Pinned</span>
            {remainingCount > 0 && (
              <span style={styles.count}>+{remainingCount}</span>
            )}
          </div>

          <p style={styles.text}>
            {firstPinned.type === 'text' 
              ? truncateText(firstPinned.content)
              : `[${firstPinned.type}] message`
            }
          </p>

          <span style={styles.date}>
            {formatTime(firstPinned.pinnedAt || firstPinned.createdAt)}
          </span>
        </div>

        {/* Actions */}
        <div style={styles.actions}>
          {remainingCount > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              style={styles.actionButton}
              title={isExpanded ? 'Collapse' : 'Show all'}
            >
              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onUnpin?.(firstPinned._id);
            }}
            style={styles.actionButton}
            title="Unpin"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Expanded List */}
      {isExpanded && remainingCount > 0 && (
        <div style={styles.expandedList}>
          {pinnedMessages.slice(1).map((message) => (
            <div
              key={message._id}
              style={styles.pinnedItem}
              onClick={() => onMessageClick?.(message)}
            >
              <div style={styles.itemContent}>
                <p style={styles.itemText}>
                  {message.type === 'text'
                    ? truncateText(message.content, 40)
                    : `[${message.type}] message`
                  }
                </p>
                <span style={styles.itemDate}>
                  {formatTime(message.pinnedAt || message.createdAt)}
                </span>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onUnpin?.(message._id);
                }}
                style={styles.itemUnpin}
                title="Unpin"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: '#fef3c7',
    borderBottom: '1px solid #fde68a',
  },

  mainPinned: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },

  iconContainer: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: 'rgba(118, 75, 162, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  content: {
    flex: 1,
    minWidth: 0,
  },

  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '4px',
  },

  label: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#92400e',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },

  count: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#92400e',
    backgroundColor: '#fde68a',
    padding: '2px 6px',
    borderRadius: '10px',
  },

  text: {
    fontSize: '14px',
    color: '#78350f',
    margin: '0 0 4px 0',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  date: {
    fontSize: '11px',
    color: '#a16207',
  },

  actions: {
    display: 'flex',
    gap: '4px',
    alignItems: 'center',
  },

  actionButton: {
    background: 'none',
    border: 'none',
    color: '#92400e',
    cursor: 'pointer',
    padding: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px',
    transition: 'background-color 0.2s',
  },

  expandedList: {
    borderTop: '1px solid #fde68a',
    backgroundColor: '#fffbeb',
  },

  pinnedItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 16px 10px 60px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    borderBottom: '1px solid #fef3c7',
  },

  itemContent: {
    flex: 1,
    minWidth: 0,
  },

  itemText: {
    fontSize: '13px',
    color: '#78350f',
    margin: '0 0 4px 0',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  itemDate: {
    fontSize: '11px',
    color: '#a16207',
  },

  itemUnpin: {
    background: 'none',
    border: 'none',
    color: '#92400e',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    borderRadius: '4px',
    transition: 'background-color 0.2s',
  },
};

export default PinnedMessages;