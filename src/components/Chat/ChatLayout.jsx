// Đường dẫn: src/components/Chat/ChatLayout.jsx
// UPDATED: Phase 2 socket - group_created, group_added, group_removed, group_left_self, group_request_added

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, Search, Plus, Users } from 'lucide-react';
import { getConversations } from '../../services/chatService';
import ConversationList from './ConversationList';
import NewChatModal from './NewChatModal';
import CreateGroupModal from './CreateGroupModal';
import ChatWindow from './ChatWindow';
import { chatLayoutStyles as styles } from '../../styles/chatStyles';
import socketService from '../../services/socketService';
import { getCurrentUserId } from '../../utils/chatHelpers';

export default function ChatLayout() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const plusMenuRef = useRef(null);
  const selectedConvRef = useRef(null);

  // Keep ref in sync so socket handlers can read latest value
  useEffect(() => { selectedConvRef.current = selectedConversation; }, [selectedConversation]);

  const currentUserId = getCurrentUserId();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (plusMenuRef.current && !plusMenuRef.current.contains(e.target)) {
        setShowPlusMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    socketService.connect();
    fetchConversations();
    return () => { /* socket lifecycle managed by MainLayout */ };
  }, []);

  // ── Register group socket handlers ──────────────────────────────────────
  useEffect(() => {
    // 1. Nhóm mới tạo → người được thêm nhận qua user room
    // payload: { conversation, createdBy: { _id, name } }
    const handleGroupCreated = (data) => {
      const { conversation } = data;
      if (!conversation) return;
      setConversations(prev => {
        if (prev.some(c => c._id === conversation._id)) return prev;
        return [conversation, ...prev];
      });
    };

    // 2. Được admin thêm vào nhóm có sẵn → nhận qua user room
    // payload: { conversationId, addedUsers, addedBy, conversation }
    const handleGroupAdded = (data) => {
      const { conversation } = data;
      if (!conversation) return;
      setConversations(prev => {
        if (prev.some(c => c._id === conversation._id)) return prev;
        return [conversation, ...prev];
      });
    };

    // 3. Bị admin xóa khỏi nhóm → nhận qua user room
    // payload: { conversationId, removedUserIds, removedBy, conversation }
    const handleGroupRemoved = (data) => {
      const { conversationId } = data;
      if (!conversationId) return;
      setConversations(prev => prev.filter(c => c._id !== conversationId));
      if (selectedConvRef.current?._id === conversationId) {
        setSelectedConversation(null);
      }
    };

    // 4. Tự rời nhóm → nhận qua user room (self-confirm)
    // payload: { conversationId, leftUser, conversation }
    const handleGroupLeftSelf = (data) => {
      const { conversationId } = data;
      if (!conversationId) return;
      setConversations(prev => prev.filter(c => c._id !== conversationId));
      if (selectedConvRef.current?._id === conversationId) {
        setSelectedConversation(null);
      }
    };

    // 5. Request được accept → user mới nhận qua user room
    // payload: { conversationId, requestId, action, handledBy, conversation }
    const handleGroupRequestAdded = (data) => {
      const { conversation } = data;
      if (!conversation) return;
      setConversations(prev => {
        if (prev.some(c => c._id === conversation._id)) return prev;
        return [conversation, ...prev];
      });
    };

    // 6. Member thêm user → admin/owner nhận qua user room
    // payload: { conversationId, request }
    const handleGroupJoinRequested = (data) => {
      if (!data?.request) return;
      window.dispatchEvent(new CustomEvent('group_join_requested', {
        detail: { conversationId: data.conversationId || data.request?.conversationId }
      }));
    };

    // 7. Được mention trong nhóm → nhận qua user room (emitMentions)
    // payload: { message, conversation: conversationId, mentions: [userId,...] }
    const handleMentionReceived = (data) => {
      const { message, conversation: convId } = data;
      if (!message || !convId) return;
      // Nếu đang mở đúng conversation đó → không cần notify thêm
      if (selectedConvRef.current?._id === convId) return;
      // Bump unreadCount + badge cho conversation đó trong sidebar
      setConversations(prev => prev.map(c =>
        c._id === convId
          ? { ...c, unreadCount: (c.unreadCount || 0) + 1, hasMention: true }
          : c
      ));
      // Toast notification
    };

    socketService.onGroupCreated(handleGroupCreated);
    socketService.onGroupAdded(handleGroupAdded);
    socketService.onGroupRemoved(handleGroupRemoved);
    socketService.onGroupLeftSelf(handleGroupLeftSelf);
    socketService.onGroupRequestAdded(handleGroupRequestAdded);
    socketService.onGroupJoinRequested(handleGroupJoinRequested);
    socketService.on('mention_received', handleMentionReceived);

    return () => {
      socketService.off('group_created', handleGroupCreated);
      socketService.off('group_added', handleGroupAdded);
      socketService.off('group_removed', handleGroupRemoved);
      socketService.off('group_left_self', handleGroupLeftSelf);
      socketService.off('group_request_added', handleGroupRequestAdded);
      socketService.off('group_join_requested', handleGroupJoinRequested);
      socketService.off('mention_received', handleMentionReceived);
    };
  }, []);
  // ────────────────────────────────────────────────────────────────────────

  const fetchConversations = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await getConversations();
      setConversations(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err.statusCode === 401) setError('Phiên đăng nhập hết hạn');
      else setError('Không thể tải danh sách hội thoại');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConversationClick = (conv) => setSelectedConversation(conv);
  const handleBackToList = () => setSelectedConversation(null);

  const handleConversationCreated = async (newConv) => {
    await fetchConversations();
    setSelectedConversation(newConv);
  };

  const handleGroupCreated = async (newGroup) => {
    await fetchConversations();
    setSelectedConversation(newGroup);
  };

  // null = left/removed/deleted → go back to list
  const handleConversationUpdate = async (updated) => {
    if (updated === null) {
      setSelectedConversation(null);
      await fetchConversations();
      return;
    }
    setSelectedConversation(prev => prev ? { ...prev, ...updated } : prev);
    fetchConversations();
  };

  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      conv.name?.toLowerCase().includes(q) ||
      conv.participants?.some(p => p.userId?.name?.toLowerCase().includes(q))
    );
  });

  const showSidebar = !isMobile || !selectedConversation;
  const showChat = !isMobile || selectedConversation;

  return (
    <div style={{ ...styles.container, ...(isMobile ? { flexDirection: 'column' } : {}) }}>
      {showSidebar && (
        <div style={{ ...styles.sidebar, ...(isMobile ? { width: '100%', height: '100%' } : {}) }}>
          <div style={styles.sidebarHeader}>
            <div style={styles.logoSection}>
              <MessageCircle size={28} color="#764ba2" />
              <h2 style={styles.appTitle}>Tin nhắn</h2>
            </div>
            <div ref={plusMenuRef} style={{ position: 'relative' }}>
              <button onClick={() => setShowPlusMenu(!showPlusMenu)} style={styles.newChatButton}>
                <Plus size={18} />
              </button>
              {showPlusMenu && (
                <div style={plusMenuStyle.menu}>
                  <button onClick={() => { setIsNewChatModalOpen(true); setShowPlusMenu(false); }} style={plusMenuStyle.item}>
                    <MessageCircle size={16} color="#764ba2" /><span>Tin nhắn mới</span>
                  </button>
                  <button onClick={() => { setIsCreateGroupModalOpen(true); setShowPlusMenu(false); }} style={plusMenuStyle.item}>
                    <Users size={16} color="#10b981" /><span>Tạo nhóm</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div style={styles.searchContainer}>
            <Search size={18} style={styles.searchIcon} />
            <input type="text" placeholder="Tìm kiếm cuộc hội thoại..." value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)} style={styles.searchInput} />
          </div>

          <div style={styles.conversationsContainer}>
            {isLoading ? (
              <div style={styles.loadingContainer}>
                <div style={styles.spinner}>⟳</div>
                <p style={styles.loadingText}>Đang tải...</p>
              </div>
            ) : error ? (
              <div style={styles.errorContainer}>
                <p style={styles.errorText}>{error}</p>
                <button onClick={fetchConversations} style={styles.retryButton}>Thử lại</button>
              </div>
            ) : (
              <ConversationList conversations={filteredConversations} selectedConversation={selectedConversation} onConversationClick={handleConversationClick} />
            )}
          </div>
        </div>
      )}

      {showChat && (
        <div style={{ ...styles.chatArea, ...(isMobile ? { width: '100%', height: '100%' } : {}) }}>
          {selectedConversation ? (
            <ChatWindow conversation={selectedConversation} onBack={isMobile ? handleBackToList : undefined} onConversationUpdate={handleConversationUpdate} />
          ) : (
            <div style={styles.chatPlaceholder}>
              <MessageCircle size={64} color="#d1d5db" />
              <h3 style={styles.placeholderTitle}>Chào mừng đến Chat App</h3>
              <p style={styles.placeholderText}>Chọn một cuộc hội thoại để bắt đầu chat</p>
            </div>
          )}
        </div>
      )}

      <NewChatModal isOpen={isNewChatModalOpen} onClose={() => setIsNewChatModalOpen(false)} onConversationCreated={handleConversationCreated} />
      <CreateGroupModal isOpen={isCreateGroupModalOpen} onClose={() => setIsCreateGroupModalOpen(false)} onGroupCreated={handleGroupCreated} />

    </div>
  );
}

const plusMenuStyle = {
  menu: { position: 'absolute', right: 0, top: '100%', marginTop: 6, backgroundColor: 'white', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', padding: 6, minWidth: 180, zIndex: 100, border: '1px solid #f3f4f6' },
  item: { display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 14px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', fontSize: 14, color: '#374151', borderRadius: 7, textAlign: 'left' },
};