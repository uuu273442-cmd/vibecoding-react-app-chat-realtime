// Đường dẫn: src/components/Chat/ReplyPreview.jsx

import React from 'react';
import { X, CornerDownRight } from 'lucide-react';

const ReplyPreview = ({ replyToMessage, onCancel }) => {
  if (!replyToMessage) return null;

  // Truncate content if too long
  const truncateContent = (text, maxLength = 60) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <CornerDownRight size={16} style={styles.icon} />
        <div style={styles.textContainer}>
          <p style={styles.label}>Replying to {replyToMessage.senderId?.name || 'Unknown'}</p>
          <p style={styles.message}>
            {truncateContent(replyToMessage.content)}
          </p>
        </div>
      </div>
      <button onClick={onCancel} style={styles.cancelButton} title="Cancel reply">
        <X size={18} />
      </button>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    backgroundColor: '#f9fafb',
    borderLeft: '3px solid #764ba2',
    borderRadius: '8px 8px 0 0',
    gap: '12px',
  },

  content: {
    flex: 1,
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    minWidth: 0,
  },

  icon: {
    color: '#764ba2',
    flexShrink: 0,
    marginTop: '2px',
  },

  textContainer: {
    flex: 1,
    minWidth: 0,
  },

  label: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#764ba2',
    margin: 0,
    marginBottom: '2px',
  },

  message: {
    fontSize: '14px',
    color: '#6b7280',
    margin: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  cancelButton: {
    background: 'none',
    border: 'none',
    color: '#9ca3af',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
    flexShrink: 0,
  },
};

export default ReplyPreview;