// Đường dẫn: src/components/Chat/MessageContextMenu.jsx
// UPDATED: Add Pin/Unpin option

import React from 'react';
import { 
  CornerDownRight, 
  Copy, 
  Share2, 
  Edit, 
  Trash2,
  Pin,
  PinOff
} from 'lucide-react';
import { useOnClickOutside } from '../../hooks/useOnClickOutside';

export default function MessageContextMenu({ 
  position, 
  message, 
  isOwn, 
  onClose, 
  onReply, 
  onEdit, 
  onDelete, 
  onCopy, 
  onForward,
  onPin,      // NEW
  onUnpin,    // NEW
  isPinned    // NEW
}) {
  const menuRef = React.useRef(null);
  
  useOnClickOutside(menuRef, onClose);

  React.useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleAction = (action, arg) => {
    action(arg !== undefined ? arg : message);
    onClose();
  };

  const canEdit = isOwn && !message.isDeleted && message.type === 'text';
  const canDelete = isOwn && !message.isDeleted;

  return (
    <div 
      ref={menuRef}
      style={{
        ...styles.menu,
        top: position.y,
        left: position.x
      }}
    >
      {/* Reply */}
      <button 
        onClick={() => handleAction(onReply)}
        style={styles.menuItem}
      >
        <CornerDownRight size={16} style={styles.menuIcon} />
        <span>Reply</span>
      </button>

      {/* Copy (only for text messages) */}
      {message.type === 'text' && message.content && (
        <button 
          onClick={() => handleAction(onCopy)}
          style={styles.menuItem}
        >
          <Copy size={16} style={styles.menuIcon} />
          <span>Copy</span>
        </button>
      )}

      {/* Forward */}
      <button 
        onClick={() => handleAction(onForward)}
        style={styles.menuItem}
      >
        <Share2 size={16} style={styles.menuIcon} />
        <span>Forward</span>
      </button>

      {/* NEW: Pin/Unpin */}
      {isPinned ? (
        <button 
          onClick={() => handleAction(onUnpin, message._id)}
          style={styles.menuItem}
        >
          <PinOff size={16} style={styles.menuIcon} />
          <span>Unpin</span>
        </button>
      ) : (
        <button 
          onClick={() => handleAction(onPin, message._id)}
          style={styles.menuItem}
        >
          <Pin size={16} style={styles.menuIcon} />
          <span>Pin</span>
        </button>
      )}

      {/* Divider (if has edit or delete) */}
      {(canEdit || canDelete) && <div style={styles.divider} />}

      {/* Edit (only own text messages) */}
      {canEdit && (
        <button 
          onClick={() => handleAction(onEdit)}
          style={styles.menuItem}
        >
          <Edit size={16} style={styles.menuIcon} />
          <span>Edit</span>
        </button>
      )}

      {/* Delete (only own messages) */}
      {canDelete && (
        <button 
          onClick={() => handleAction(onDelete)}
          style={{
            ...styles.menuItem,
            color: '#dc2626'
          }}
        >
          <Trash2 size={16} style={styles.menuIcon} />
          <span>Delete</span>
        </button>
      )}
    </div>
  );
}

const styles = {
  menu: {
    position: 'fixed',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    padding: '6px',
    minWidth: '180px',
    zIndex: 10000,
  },

  menuItem: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 12px',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#1f2937',
    borderRadius: '4px',
    transition: 'background-color 0.2s',
    textAlign: 'left',
  },

  menuIcon: {
    flexShrink: 0,
  },

  divider: {
    height: '1px',
    backgroundColor: '#e5e7eb',
    margin: '4px 0',
  },
};