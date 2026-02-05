// Đường dẫn: src/components/Chat/EditMessageModal.jsx

import React, { useState, useRef, useEffect } from 'react';
import { X, Check } from 'lucide-react';

const EditMessageModal = ({ message, onClose, onSubmit }) => {
  const [content, setContent] = useState(message.content);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    // Focus input and select all text
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const handleSubmit = async () => {
    const trimmedContent = content.trim();
    
    if (!trimmedContent) {
      alert('Tin nhắn không được để trống');
      return;
    }

    if (trimmedContent === message.content) {
      onClose();
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(message._id, trimmedContent);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div style={styles.backdrop} onClick={onClose} />

      {/* Modal */}
      <div style={styles.modal}>
        <div style={styles.header}>
          <h3 style={styles.title}>Chỉnh sửa tin nhắn</h3>
          <button onClick={onClose} style={styles.closeButton}>
            <X size={20} />
          </button>
        </div>

        <div style={styles.content}>
          <textarea
            ref={inputRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyPress}
            style={styles.textarea}
            rows={4}
            placeholder="Nhập nội dung tin nhắn..."
            disabled={isSubmitting}
          />
          <p style={styles.hint}>
            Press Enter to save, Esc to cancel
          </p>
        </div>

        <div style={styles.footer}>
          <button onClick={onClose} style={styles.cancelButton}>
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !content.trim()}
            style={{
              ...styles.submitButton,
              ...(isSubmitting || !content.trim() ? styles.submitButtonDisabled : {})
            }}
          >
            {isSubmitting ? (
              <span style={styles.loadingContainer}>
                <span style={styles.spinner}>⟳</span>
                Đang lưu...
              </span>
            ) : (
              <>
                <Check size={18} />
                Lưu thay đổi
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
    maxWidth: '500px',
    zIndex: 9999,
  },

  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 24px',
    borderBottom: '1px solid #e5e7eb',
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

  textarea: {
    width: '100%',
    padding: '12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'inherit',
    resize: 'vertical',
    outline: 'none',
    transition: 'all 0.2s',
  },

  hint: {
    fontSize: '12px',
    color: '#9ca3af',
    marginTop: '8px',
    marginBottom: 0,
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

  submitButton: {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.2s',
  },

  submitButtonDisabled: {
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

export default EditMessageModal;