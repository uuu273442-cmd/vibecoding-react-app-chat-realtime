// Đường dẫn: src/components/Chat/NewChatModal.jsx

import React, { useState, useEffect } from 'react';
import { X, Search, User, AlertCircle } from 'lucide-react';
import { createPrivateConversation, getListUsers } from '../../services/chatService';
import { newChatModalStyles as styles } from '../../styles/chatStyles';

export default function NewChatModal({ isOpen, onClose, onConversationCreated }) {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    } else {
      // Reset khi đóng modal
      setUsers([]);
      setFilteredUsers([]);
      setSelectedUserId('');
      setSearchQuery('');
      setError('');
    }
  }, [isOpen]);

  useEffect(() => {
    // Filter users theo search query
    if (searchQuery.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    setError('');
    
    try {
      const data = await getListUsers();
      setUsers(data);
      setFilteredUsers(data);
    } catch (error) {
      if (error.statusCode === 401) {
        setError('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!');
      } else {
        setError('Không thể tải danh sách người dùng!');
      }
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleCreateConversation = async () => {
    if (!selectedUserId) {
      setError('Vui lòng chọn một người dùng');
      return;
    }

    setIsCreating(true);
    setError('');

    try {
      const conversation = await createPrivateConversation(selectedUserId);
      
      // Thông báo đã tạo thành công
      onConversationCreated(conversation);
      
      // Đóng modal
      onClose();
    } catch (error) {
      if (error.statusCode === 400) {
        if (Array.isArray(error.message)) {
          setError(error.message.join(', '));
        } else {
          setError(error.message);
        }
      } else if (error.statusCode === 403) {
        if (error.message === 'Cannot chat with yourself') {
          setError('Không thể tạo cuộc hội thoại với chính mình!');
        } else if (error.message === 'User not found!') {
          setError('Không tìm thấy người dùng này!');
        } else {
          setError(error.message);
        }
      } else if (error.statusCode === 401) {
        setError('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!');
      } else {
        setError('Không thể tạo cuộc hội thoại. Vui lòng thử lại!');
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleUserClick = (userId) => {
    setSelectedUserId(userId);
    setError('');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div style={styles.backdrop} onClick={onClose} />

      {/* Modal */}
      <div style={styles.modal}>
        {/* Header */}
        <div style={styles.header}>
          <h3 style={styles.title}>Tạo cuộc hội thoại mới</h3>
          <button onClick={onClose} style={styles.closeButton}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={styles.content}>
          {/* Search */}
          <div style={styles.searchWrapper}>
            <Search size={18} style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Tìm kiếm người dùng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
              autoFocus
            />
          </div>

          {/* Error Message */}
          {error && (
            <div style={styles.errorBox}>
              <AlertCircle size={16} style={styles.errorIcon} />
              <p style={styles.errorText}>{error}</p>
            </div>
          )}

          {/* Users List */}
          <div style={styles.userListContainer}>
            {isLoadingUsers ? (
              <div style={styles.loadingContainer}>
                <div style={styles.spinner}>⟳</div>
                <p style={styles.loadingText}>Đang tải danh sách người dùng...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div style={styles.emptyState}>
                <p style={styles.emptyText}>
                  {searchQuery ? 'Không tìm thấy người dùng phù hợp' : 'Không có người dùng nào'}
                </p>
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user._id}
                  onClick={() => handleUserClick(user._id)}
                  style={{
                    ...styles.userItem,
                    ...(selectedUserId === user._id ? styles.userItemSelected : {})
                  }}
                >
                  {/* Avatar */}
                  <div style={styles.userAvatar}>
                    <User size={20} color="#9ca3af" />
                  </div>

                  {/* User Info */}
                  <div style={styles.userInfo}>
                    <p style={styles.userName}>{user.name}</p>
                    <p style={styles.userId}>ID: {user._id}</p>
                  </div>

                  {/* Selected Indicator */}
                  {selectedUserId === user._id && (
                    <div style={styles.selectedIndicator}>✓</div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <button onClick={onClose} style={styles.cancelButton}>
            Hủy
          </button>
          <button
            onClick={handleCreateConversation}
            disabled={isCreating || !selectedUserId || isLoadingUsers}
            style={{
              ...styles.submitButton,
              ...(isCreating || !selectedUserId || isLoadingUsers ? styles.submitButtonDisabled : {})
            }}
          >
            {isCreating ? (
              <span style={styles.loadingContainer}>
                <span style={styles.spinner}>⟳</span>
                Đang tạo...
              </span>
            ) : (
              'Tạo cuộc hội thoại'
            )}
          </button>
        </div>
      </div>
    </>
  );
}