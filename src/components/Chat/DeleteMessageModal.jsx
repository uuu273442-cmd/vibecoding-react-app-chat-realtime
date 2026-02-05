// Đường dẫn: src/components/Chat/DeleteMessageModal.jsx

import React, { useState } from 'react';
import { X, Trash2, AlertCircle } from 'lucide-react';

const DeleteMessageModal = ({ message, onClose, onConfirm }) => {
  const [scope, setScope] = useState('self'); // 'self' or 'everyone'
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm(message._id, scope);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div style={styles.backdrop} onClick={onClose} />

      {/* Modal */}
      <div style={styles.modal}>
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={styles.iconContainer}>
              <Trash2 size={20} />
            </div>
            <h3 style={styles.title}>Xóa tin nhắn</h3>
          </div>
          <button onClick={onClose} style={styles.closeButton}>
            <X size={20} />
          </button>
        </div>

        <div style={styles.content}>
          <div style={styles.warningBox}>
            <AlertCircle size={18} style={styles.warningIcon} />
            <p style={styles.warningText}>
              Bạn có chắc muốn xóa tin nhắn này?
            </p>
          </div>

          <div style={styles.messagePreview}>
            <p style={styles.messageContent}>{message.content}</p>
          </div>

          <div style={styles.options}>
            <label style={styles.option}>
              <input
                type="radio"
                name="deleteScope"
                value="self"
                checked={scope === 'self'}
                onChange={(e) => setScope(e.target.value)}
                style={styles.radio}
              />
              <div style={styles.optionText}>
                <p style={styles.optionTitle}>Xóa cho mình</p>
                <p style={styles.optionDesc}>
                  Tin nhắn sẽ chỉ bị xóa cho bạn. Người khác vẫn có thể xem.
                </p>
              </div>
            </label>

            <label style={styles.option}>
              <input
                type="radio"
                name="deleteScope"
                value="everyone"
                checked={scope === 'everyone'}
                onChange={(e) => setScope(e.target.value)}
                style={styles.radio}
              />
              <div style={styles.optionText}>
                <p style={styles.optionTitle}>Xóa cho mọi người</p>
                <p style={styles.optionDesc}>
                  Tin nhắn sẽ bị xóa cho tất cả mọi người trong cuộc hội thoại.
                </p>
              </div>
            </label>
          </div>
        </div>

        <div style={styles.footer}>
          <button onClick={onClose} style={styles.cancelButton}>
            Hủy
          </button>
          <button
            onClick={handleConfirm}
            disabled={isDeleting}
            style={{
              ...styles.deleteButton,
              ...(isDeleting ? styles.deleteButtonDisabled : {})
            }}
          >
            {isDeleting ? (
              <span style={styles.loadingContainer}>
                <span style={styles.spinner}>⟳</span>
                Đang xóa...
              </span>
            ) : (
              <>
                <Trash2 size={18} />
                Xóa tin nhắn
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
};

const styles = {
  backdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 9998,
  },

  modal: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    width: '90%',
    maxWidth: '480px',
    zIndex: 9999,
  },

  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 24px',
    borderBottom: '1px solid #e5e7eb',
  },

  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },

  iconContainer: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1f2937',
    margin: 0,
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
  },

  content: {
    padding: '24px',
  },

  warningBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    marginBottom: '16px',
  },

  warningIcon: {
    color: '#dc2626',
    flexShrink: 0,
  },

  warningText: {
    fontSize: '14px',
    color: '#991b1b',
    margin: 0,
  },

  messagePreview: {
    padding: '12px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    marginBottom: '20px',
  },

  messageContent: {
    fontSize: '14px',
    color: '#6b7280',
    margin: 0,
    fontStyle: 'italic',
  },

  options: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },

  option: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '12px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },

  radio: {
    marginTop: '2px',
    cursor: 'pointer',
  },

  optionText: {
    flex: 1,
  },

  optionTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1f2937',
    margin: 0,
    marginBottom: '4px',
  },

  optionDesc: {
    fontSize: '13px',
    color: '#6b7280',
    margin: 0,
  },

  footer: {
    display: 'flex',
    gap: '12px',
    padding: '16px 24px',
    borderTop: '1px solid #e5e7eb',
    justifyContent: 'flex-end',
  },

  cancelButton: {
    padding: '8px 16px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    backgroundColor: 'white',
    color: '#6b7280',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },

  deleteButton: {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#dc2626',
    color: 'white',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.2s',
  },

  deleteButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },

  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },

  spinner: {
    display: 'inline-block',
    animation: 'spin 1s linear infinite',
  },
};

export default DeleteMessageModal;