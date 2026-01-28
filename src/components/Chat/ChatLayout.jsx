// Đường dẫn: src/components/Chat/ChatLayout.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, LogOut, Search, Plus } from 'lucide-react';
import { getConversations } from '../../services/chatService';
import { logoutUser } from '../../services/authService';
import ConversationList from './ConversationList';
import NewChatModal from './NewChatModal';
import ChatWindow from './ChatWindow';
import { chatLayoutStyles as styles } from '../../styles/chatStyles';
import { getConversationName } from '../../utils/chatHelpers';

export default function ChatLayout() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await getConversations();
      setConversations(data);
    } catch (error) {
      if (error.statusCode === 401) {
        // Token hết hạn hoặc không hợp lệ
        handleLogout();
      } else {
        setError('Không thể tải danh sách hội thoại');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      navigate('/login');
    }
  };

  const handleConversationClick = (conversation) => {
    setSelectedConversation(conversation);
  };

  const handleConversationCreated = async (newConversation) => {
    // Refresh lại toàn bộ danh sách để có đầy đủ thông tin
    await fetchConversations();
    
    // Tìm conversation vừa tạo trong danh sách mới
    // (vì API response có thể thiếu thông tin user details)
    setSelectedConversation(prev => {
      const found = conversations.find(c => c._id === newConversation._id);
      return found || newConversation;
    });
  };

  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery) return true;
    
    // Tìm theo tên người dùng trong participants
    return conv.participants.some(p => 
      p.userId.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div style={styles.container}>
      {/* Sidebar - Danh sách conversations */}
      <div style={styles.sidebar}>
        {/* Header */}
        <div style={styles.sidebarHeader}>
          <div style={styles.logoSection}>
            <MessageCircle size={28} color="#764ba2" />
            <h2 style={styles.appTitle}>Chat App</h2>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={() => setIsNewChatModalOpen(true)} 
              style={styles.newChatButton}
              title="Tạo cuộc hội thoại mới"
            >
              <Plus size={18} />
              Mới
            </button>
            <button onClick={handleLogout} style={styles.logoutButton} title="Đăng xuất">
              <LogOut size={20} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div style={styles.searchContainer}>
          <Search size={18} style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Tìm kiếm cuộc hội thoại..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        {/* Conversations List */}
        <div style={styles.conversationsContainer}>
          {isLoading ? (
            <div style={styles.loadingContainer}>
              <div style={styles.spinner}>⟳</div>
              <p style={styles.loadingText}>Đang tải...</p>
            </div>
          ) : error ? (
            <div style={styles.errorContainer}>
              <p style={styles.errorText}>{error}</p>
              <button onClick={fetchConversations} style={styles.retryButton}>
                Thử lại
              </button>
            </div>
          ) : (
            <ConversationList
              conversations={filteredConversations}
              selectedConversation={selectedConversation}
              onConversationClick={handleConversationClick}
            />
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div style={styles.chatArea}>
        {selectedConversation ? (
          <ChatWindow conversation={selectedConversation} />
        ) : (
          <div style={styles.chatPlaceholder}>
            <MessageCircle size={64} color="#d1d5db" />
            <h3 style={styles.placeholderTitle}>Chào mừng đến Chat App</h3>
            <p style={styles.placeholderText}>
              Chọn một cuộc hội thoại để bắt đầu chat
            </p>
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      <NewChatModal
        isOpen={isNewChatModalOpen}
        onClose={() => setIsNewChatModalOpen(false)}
        onConversationCreated={handleConversationCreated}
      />
    </div>
  );
}