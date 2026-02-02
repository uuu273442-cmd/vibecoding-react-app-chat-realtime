// Đường dẫn: src/components/Shared/ToastNotification.jsx

import React, { useEffect, useState } from 'react';
import { X, UserPlus, UserCheck, UserX } from 'lucide-react';

const toastStyles = {
  container: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    pointerEvents: 'none',
  },

  toast: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '16px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    minWidth: '320px',
    maxWidth: '400px',
    pointerEvents: 'auto',
    animation: 'slideIn 0.3s ease-out',
    cursor: 'pointer',
    border: '1px solid #e5e7eb',
    transition: 'all 0.2s',
  },

  iconContainer: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  iconReceived: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
  },

  iconAccepted: {
    backgroundColor: '#dcfce7',
    color: '#16a34a',
  },

  iconRejected: {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
  },

  content: {
    flex: 1,
    minWidth: 0,
  },

  title: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '4px',
  },

  message: {
    fontSize: '13px',
    color: '#6b7280',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  closeButton: {
    background: 'none',
    border: 'none',
    color: '#9ca3af',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.2s',
    flexShrink: 0,
  },
};

// Toast Item Component
function ToastItem({ toast, onClose, onClick }) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Auto close after 5 seconds
    const timer = setTimeout(() => {
      handleClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(toast.id);
    }, 300);
  };

  const handleClick = () => {
    if (onClick) {
      onClick(toast);
    }
    handleClose();
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'friend_request_received':
        return <UserPlus size={20} />;
      case 'friend_request_accepted':
        return <UserCheck size={20} />;
      case 'friend_request_rejected':
        return <UserX size={20} />;
      default:
        return <UserPlus size={20} />;
    }
  };

  const getIconStyle = () => {
    switch (toast.type) {
      case 'friend_request_received':
        return toastStyles.iconReceived;
      case 'friend_request_accepted':
        return toastStyles.iconAccepted;
      case 'friend_request_rejected':
        return toastStyles.iconRejected;
      default:
        return toastStyles.iconReceived;
    }
  };

  return (
    <div
      onClick={handleClick}
      style={{
        ...toastStyles.toast,
        animation: isExiting ? 'slideOut 0.3s ease-in' : 'slideIn 0.3s ease-out',
      }}
    >
      <div style={{ ...toastStyles.iconContainer, ...getIconStyle() }}>
        {getIcon()}
      </div>

      <div style={toastStyles.content}>
        <p style={toastStyles.title}>{toast.title}</p>
        <p style={toastStyles.message}>{toast.message}</p>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          handleClose();
        }}
        style={toastStyles.closeButton}
      >
        <X size={18} />
      </button>
    </div>
  );
}

// Main Toast Container Component
export default function ToastNotification({ toasts, onClose, onClick }) {
  return (
    <>
      <style>
        {`
          @keyframes slideIn {
            from {
              transform: translateX(400px);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }

          @keyframes slideOut {
            from {
              transform: translateX(0);
              opacity: 1;
            }
            to {
              transform: translateX(400px);
              opacity: 0;
            }
          }
        `}
      </style>

      <div style={toastStyles.container}>
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onClose={onClose}
            onClick={onClick}
          />
        ))}
      </div>
    </>
  );
}

// Hook to manage toasts
export function useToast() {
  const [toasts, setToasts] = useState([]);

  const showToast = (toast) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { ...toast, id }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const clearAllToasts = () => {
    setToasts([]);
  };

  return {
    toasts,
    showToast,
    removeToast,
    clearAllToasts,
  };
}
