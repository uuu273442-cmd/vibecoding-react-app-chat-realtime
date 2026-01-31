// Đường dẫn: src/components/Friends/AddFriendModal.jsx

import React, { useState, useEffect } from 'react';
import { X, Search, User, Send } from 'lucide-react';
import { getListUsers } from '../../services/chatService';
import { sendFriendRequest } from '../../services/friendsService';
import { newChatModalStyles as styles } from '../../styles/chatStyles';

export default function AddFriendModal({ isOpen, onClose, onRequestSent }) {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState('Mình kết bạn với nhau nhé!');
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    } else {
      // Reset
      setUsers([]);
      setFilteredUsers([]);
      setSelectedUser(null);
      setSearchQuery('');
      setMessage('Mình kết bạn với nhau nhé!');
      setError('');
    }
  }, [isOpen]);

  useEffect(() => {
    // Filter users
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
      setError('Không thể tải danh sách người dùng!');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleSendRequest = async () => {
    if (!selectedUser) {
      setError('Vui lòng chọn người dùng');
      return;
    }

    setIsSending(true);
    setError('');

    try {
      await sendFriendRequest(selectedUser._id, message.trim());
      onRequestSent();
    } catch (error) {
      if (error.statusCode === 400) {
        if (error.message === 'Request already pending') {
          setError('Đã gửi lời mời kết bạn cho người này rồi!');
        } else if (error.message === 'Already friend') {
          setError('Đã là bạn bè rồi!');
        } else {
          setError(error.message);
        }
      } else if (error.statusCode === 403) {
        setError('Người dùng không tồn tại!');
      } else {
        setError('Không thể gửi lời mời kết bạn!');
      }
    } finally {
      setIsSending(false);
    }
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
          <h3 style={styles.title}>Thêm bạn bè</h3>
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

          {/* Error */}
          {error && (
            <div style={styles.errorBox}>
              <p style={styles.errorText}>{error}</p>
            </div>
          )}

          {/* Users List */}
          <div style={styles.userListContainer}>
            {isLoadingUsers ? (
              <div style={styles.loadingContainer}>
                <div style={styles.spinner}>⟳</div>
                <p style={styles.loadingText}>Đang tải...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div style={styles.emptyState}>
                <p style={styles.emptyText}>
                  {searchQuery ? 'Không tìm thấy người dùng' : 'Không có người dùng nào'}
                </p>
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user._id}
                  onClick={() => setSelectedUser(user)}
                  style={{
                    ...styles.userItem,
                    ...(selectedUser?._id === user._id ? styles.userItemSelected : {})
                  }}
                >
                  <div style={styles.userAvatar}>
                    <User size={20} color="#9ca3af" />
                  </div>
                  <div style={styles.userInfo}>
                    <p style={styles.userName}>{user.name}</p>
                    <p style={styles.userId}>ID: {user._id}</p>
                  </div>
                  {selectedUser?._id === user._id && (
                    <div style={styles.selectedIndicator}>✓</div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Message Input */}
          {selectedUser && (
            <div style={styles.inputWrapper}>
              <Send size={18} style={styles.inputIcon} />
              <input
                type="text"
                placeholder="Tin nhắn kèm theo (tùy chọn)..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                style={styles.input}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <button onClick={onClose} style={styles.cancelButton}>
            Hủy
          </button>
          <button
            onClick={handleSendRequest}
            disabled={!selectedUser || isSending}
            style={{
              ...styles.submitButton,
              ...(!selectedUser || isSending ? styles.submitButtonDisabled : {})
            }}
          >
            {isSending ? (
              <span style={styles.loadingContainer}>
                <span style={styles.spinner}>⟳</span>
                Đang gửi...
              </span>
            ) : (
              'Gửi lời mời'
            )}
          </button>
        </div>
      </div>
    </>
  );
}