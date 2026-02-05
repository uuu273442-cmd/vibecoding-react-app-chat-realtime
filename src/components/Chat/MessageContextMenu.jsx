// Đường dẫn: src/components/Chat/MessageContextMenu.jsx

import React, { useRef, useEffect } from 'react';
import { 
  Reply, 
  Edit3, 
  Trash2, 
  Copy, 
  Forward,
  MoreHorizontal 
} from 'lucide-react';
import { useOnClickOutside } from '../../hooks/useOnClickOutside';

const MessageContextMenu = ({ 
  position, 
  message,
  isOwn,
  onClose, 
  onReply,
  onEdit,
  onDelete,
  onCopy,
  onForward
}) => {
  const menuRef = useRef(null);

  // Close on click outside
  useOnClickOutside(menuRef, onClose);

  // Close on Esc key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Adjust position if menu goes off screen
  const adjustedStyle = {
    ...styles.menu,
    left: position.x,
    top: position.y,
  };

  const menuItems = [
    {
      icon: Reply,
      label: 'Reply',
      action: () => {
        onReply(message);
        onClose();
      },
      show: true,
    },
    {
      icon: Copy,
      label: 'Copy',
      action: () => {
        navigator.clipboard.writeText(message.content);
        onCopy?.(message);
        onClose();
      },
      show: true,
    },
    {
      icon: Forward,
      label: 'Forward',
      action: () => {
        onForward(message);
        onClose();
      },
      show: true,
    },
    {
      icon: Edit3,
      label: 'Edit',
      action: () => {
        onEdit(message);
        onClose();
      },
      show: isOwn && !message.isDeleted,
    },
    {
      icon: Trash2,
      label: 'Delete',
      action: () => {
        onDelete(message);
        onClose();
      },
      show: isOwn && !message.isDeleted,
      danger: true,
    },
  ];

  return (
    <div ref={menuRef} style={adjustedStyle}>
      {menuItems
        .filter(item => item.show)
        .map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={index}
              onClick={item.action}
              style={{
                ...styles.menuItem,
                ...(item.danger ? styles.menuItemDanger : {}),
              }}
            >
              <Icon size={16} />
              <span>{item.label}</span>
            </button>
          );
        })}
    </div>
  );
};

const styles = {
  menu: {
    position: 'fixed',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    padding: '4px',
    minWidth: '160px',
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
    color: '#1f2937',
    fontSize: '14px',
    cursor: 'pointer',
    borderRadius: '6px',
    transition: 'all 0.2s',
    textAlign: 'left',
  },

  menuItemDanger: {
    color: '#dc2626',
  },
};

export default MessageContextMenu;