// Đường dẫn: src/components/Chat/MessageReactions.jsx

import React, { useState, useRef } from 'react';
import { useOnClickOutside } from '../../hooks/useOnClickOutside';
import { getCurrentUserId } from '../../utils/chatHelpers';

// Available emojis
const REACTION_EMOJIS = ['❤️', '😂', '😮', '😢', '🙏', '👍'];

const MessageReactions = ({ message, onAddReaction, onRemoveReaction }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [hoveredReaction, setHoveredReaction] = useState(null);
  const pickerRef = useRef(null);
  const currentUserId = getCurrentUserId();

  // Close picker when clicking outside
  useOnClickOutside(pickerRef, () => setShowPicker(false));

  // Group reactions by emoji
  const groupedReactions = message.reactions?.reduce((acc, reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = {
        emoji: reaction.emoji,
        count: 0,
        users: [],
        hasCurrentUser: false
      };
    }
    acc[reaction.emoji].count++;
    acc[reaction.emoji].users.push(reaction.userId);
    if (reaction.userId === currentUserId) {
      acc[reaction.emoji].hasCurrentUser = true;
    }
    return acc;
  }, {}) || {};

  const handleReactionClick = (emoji) => {
    const reactionGroup = groupedReactions[emoji];
    
    if (reactionGroup?.hasCurrentUser) {
      // User already reacted with this emoji -> remove
      onRemoveReaction(message._id, emoji);
    } else {
      // User hasn't reacted -> add
      onAddReaction(message._id, emoji);
    }
  };

  const handlePickerEmojiClick = (emoji) => {
    handleReactionClick(emoji);
    setShowPicker(false);
  };

  if (!message.reactions || message.reactions.length === 0) {
    return (
      <div style={styles.emptyContainer}>
        <button
          onClick={() => setShowPicker(true)}
          style={styles.addReactionButton}
          title="Add reaction"
        >
          +
        </button>

        {/* Reaction Picker */}
        {showPicker && (
          <div ref={pickerRef} style={styles.picker}>
            {REACTION_EMOJIS.map(emoji => (
              <button
                key={emoji}
                onClick={() => handlePickerEmojiClick(emoji)}
                style={styles.pickerEmoji}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Display existing reactions */}
      {Object.values(groupedReactions).map((reaction) => (
        <div
          key={reaction.emoji}
          onClick={() => handleReactionClick(reaction.emoji)}
          onMouseEnter={() => setHoveredReaction(reaction)}
          onMouseLeave={() => setHoveredReaction(null)}
          style={{
            ...styles.reactionBubble,
            ...(reaction.hasCurrentUser ? styles.reactionBubbleActive : {})
          }}
          title={`${reaction.count} reaction${reaction.count > 1 ? 's' : ''}`}
        >
          <span style={styles.emoji}>{reaction.emoji}</span>
          <span style={styles.count}>{reaction.count}</span>

          {/* Tooltip showing users who reacted */}
          {hoveredReaction?.emoji === reaction.emoji && reaction.count > 0 && (
            <div style={styles.tooltip}>
              {reaction.users.slice(0, 3).map((userId, idx) => (
                <span key={idx}>User {userId.slice(-4)}</span>
              ))}
              {reaction.count > 3 && (
                <span>and {reaction.count - 3} more...</span>
              )}
            </div>
          )}
        </div>
      ))}

      {/* Add more reactions button */}
      <button
        onClick={() => setShowPicker(true)}
        style={styles.addReactionButton}
        title="Add reaction"
      >
        +
      </button>

      {/* Reaction Picker */}
      {showPicker && (
        <div ref={pickerRef} style={styles.picker}>
          {REACTION_EMOJIS.map(emoji => (
            <button
              key={emoji}
              onClick={() => handlePickerEmojiClick(emoji)}
              style={styles.pickerEmoji}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  emptyContainer: {
    position: 'relative',
    marginTop: '4px',
  },

  container: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    marginTop: '4px',
    flexWrap: 'wrap',
    position: 'relative',
  },

  reactionBubble: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '2px 8px',
    borderRadius: '12px',
    backgroundColor: '#f3f4f6',
    border: '1px solid #e5e7eb',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.2s',
    position: 'relative',
  },

  reactionBubbleActive: {
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6',
  },

  emoji: {
    fontSize: '16px',
  },

  count: {
    fontSize: '12px',
    color: '#6b7280',
    fontWeight: '500',
  },

  addReactionButton: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    border: '1px solid #e5e7eb',
    backgroundColor: 'white',
    color: '#6b7280',
    cursor: 'pointer',
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
    padding: 0,
  },

  picker: {
    position: 'absolute',
    bottom: '100%',
    left: 0,
    marginBottom: '8px',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    padding: '8px',
    display: 'flex',
    gap: '4px',
    zIndex: 1000,
  },

  pickerEmoji: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: '6px',
    transition: 'all 0.2s',
  },

  tooltip: {
    position: 'absolute',
    bottom: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    marginBottom: '8px',
    backgroundColor: '#1f2937',
    color: 'white',
    padding: '6px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    whiteSpace: 'nowrap',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
};

export default MessageReactions;