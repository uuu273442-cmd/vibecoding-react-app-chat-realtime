// Đường dẫn: src/components/Chat/ForwardMessageModal.jsx

import React, { useState, useEffect } from 'react';
import { X, Forward, Search, Check } from 'lucide-react';
import { getConversations } from '../../services/chatService';

const ForwardMessageModal = ({ message, onClose, onSubmit }) => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversations, setSelectedConversations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isForwarding, setIsForwarding] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    setIsLoading(true);
    try {
      const data = await getConversations();
      // Exclude current conversation
      const filtered = data.filter(conv => conv._id !== message.conversationId);
      setConversations(filtered);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleConversation = (conversationId) => {
    setSelectedConversations(prev => {
      if (prev.includes(conversationId)) {
        return prev.filter(id => id !== conversationId);
      } else {
        return [...prev, conversationId];
      }
    });
  };

  const handleForward = async () => {
    if (selectedConversations.length === 0) {
      alert('Vui lòng chọn ít nhất một cuộc hội thoại');
      return;
    }

    setIsForwarding(true);
    try {
      await onSubmit(message._id, selectedConversations);
    } finally {
      setIsForwarding(false);
    }
  };

  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery) return true;
    
    // Search by participant names
    return conv.participants.some(p => 
      p.userId.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const getConversationName = (conv) => {
    if (conv.type === 'group' && conv.name) {
      return conv.name;
    }
    
    // For private chats, show other participant's name
    const other = conv.participants.find(p => p.userId._id !== message.senderId._id);
    return other?.userId.name || 'Unknown';
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
              <Forward size={20} />
            </div>
            <h3 style={styles.title}>Chuyển tiếp tin nhắn</h3>
          </div>
          <button onClick={onClose} style={styles.closeButton}>
            <X size={20} />
          </button>
        </div>

        <div style={styles.content}>
          {/* Message Preview */}
          <div style={styles.messagePreview}>
            <p style={styles.previewLabel}>Tin nhắn:</p>
            <p style={styles.messageContent}>{message.content}</p>
          </div>

          {/* Search */}
          <div style={styles.searchWrapper}>
            <Search size={18} style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Tìm kiếm cuộc hội thoại..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          {/* Selected count */}
          {selectedConversations.length > 0 && (
            <p style={styles.selectedCount}>
              Đã chọn {selectedConversations.length} cuộc hội thoại
            </p>
          )}

          {/* Conversations List */}
          <div style={styles.conversationsList}>
            {isLoading ? (
              <div style={styles.loadingContainer}>
                <div style={styles.spinner}>⟳</div>
                <p style={styles.loadingText}>Đang tải...</p>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div style={styles.emptyState}>
                <p style={styles.emptyText}>
                  {searchQuery ? 'Không tìm thấy cuộc hội thoại' : 'Không có cuộc hội thoại nào'}
                </p>
              </div>
            ) : (
              filteredConversations.map(conv => {
                const isSelected = selectedConversations.includes(conv._id);
                return (
                  <div
                    key={conv._id}
                    onClick={() => handleToggleConversation(conv._id)}
                    style={{
                      ...styles.conversationItem,
                      ...(isSelected ? styles.conversationItemSelected : {})
                    }}
                  >
                    <div style={styles.checkbox}>
                      {isSelected && <Check size={16} color="white" />}
                    </div>
                    <div style={styles.conversationInfo}>
                      <p style={styles.conversationName}>{getConversationName(conv)}</p>
                      <p style={styles.conversationType}>
                        {conv.type === 'group' ? `Nhóm ${conv.participants.length} người` : 'Cá nhân'}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div style={styles.footer}>
          <button onClick={onClose} style={styles.cancelButton}>
            Hủy
          </button>
          <button
            onClick={handleForward}
            disabled={isForwarding || selectedConversations.length === 0}
            style={{
              ...styles.forwardButton,
              ...(isForwarding || selectedConversations.length === 0 ? styles.forwardButtonDisabled : {})
            }}
          >
            {isForwarding ? (
              <span style={styles.loadingContainer}>
                <span style={styles.spinner}>⟳</span>
                Đang gửi...
              </span>
            ) : (
              <>
                <Forward size={18} />
                Chuyển tiếp ({selectedConversations.length})
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
    maxHeight: '80vh',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 9999,
  },

  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 24px',
    borderBottom: '1px solid #e5e7eb',
    flexShrink: 0,
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
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
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
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },

  messagePreview: {
    padding: '12px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    borderLeft: '3px solid #764ba2',
  },

  previewLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#764ba2',
    margin: 0,
    marginBottom: '4px',
  },

  messageContent: {
    fontSize: '14px',
    color: '#6b7280',
    margin: 0,
  },

  searchWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },

  searchIcon: {
    position: 'absolute',
    left: '12px',
    color: '#9ca3af',
    pointerEvents: 'none',
  },

  searchInput: {
    width: '100%',
    padding: '10px 12px 10px 40px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.2s',
  },

  selectedCount: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#764ba2',
    margin: 0,
  },

  conversationsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    flex: 1,
    overflowY: 'auto',
  },

  conversationItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },

  conversationItemSelected: {
    backgroundColor: '#f3f4f6',
    borderColor: '#764ba2',
  },

  checkbox: {
    width: '20px',
    height: '20px',
    borderRadius: '4px',
    border: '2px solid #d1d5db',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
    flexShrink: 0,
  },

  conversationInfo: {
    flex: 1,
    minWidth: 0,
  },

  conversationName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1f2937',
    margin: 0,
    marginBottom: '2px',
  },

  conversationType: {
    fontSize: '12px',
    color: '#6b7280',
    margin: 0,
  },

  footer: {
    display: 'flex',
    gap: '12px',
    padding: '16px 24px',
    borderTop: '1px solid #e5e7eb',
    flexShrink: 0,
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

  forwardButton: {
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

  forwardButtonDisabled: {
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

  emptyState: {
    textAlign: 'center',
    padding: '40px 20px',
  },

  emptyText: {
    color: '#9ca3af',
    fontSize: '14px',
  },
};

export default ForwardMessageModal;