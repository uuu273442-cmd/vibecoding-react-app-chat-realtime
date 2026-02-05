// Đường dẫn: src/components/Chat/ChatWindow.jsx
// CẬP NHẬT: Tích hợp Message Reactions, Reply, Edit, Delete, Forward

import React, { useState, useEffect, useRef } from 'react';
import { User, Send, MoreVertical } from 'lucide-react';
import { 
  getMessages, 
  markMessagesSeen,
  addReaction,
  sendMessageWithReply,
  editMessage as editMessageAPI,
  deleteMessage as deleteMessageAPI,
  forwardMessage as forwardMessageAPI
} from '../../services/chatService';
import { 
  getConversationName, 
  getConversationStatus, 
  getConversationAvatar, 
  getCurrentUserId 
} from '../../utils/chatHelpers';
import { chatWindowStyles as styles } from '../../styles/chatStyles';
import MessageBubble from './MessageBubble';
import ReplyPreview from './ReplyPreview';
import MessageContextMenu from './MessageContextMenu';
import EditMessageModal from './EditMessageModal';
import DeleteMessageModal from './DeleteMessageModal';
import ForwardMessageModal from './ForwardMessageModal';
import socketService from '../../services/socketService';

export default function ChatWindow({ conversation }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [typingUsers, setTypingUsers] = useState(new Set());
  
  // New states for message features
  const [replyTo, setReplyTo] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [deletingMessage, setDeletingMessage] = useState(null);
  const [forwardingMessage, setForwardingMessage] = useState(null);
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const inputRef = useRef(null);
  const currentUserId = getCurrentUserId();

  useEffect(() => {
    if (conversation) {
      fetchMessages();
      
      // Join conversation room
      socketService.joinConversation(conversation._id);
      
      // Setup socket listeners
      socketService.on('new_message', handleNewMessage);
      socketService.on('message_reacted', handleMessageReacted);
      socketService.on('message_edited', handleMessageEdited);
      socketService.on('message_deleted', handleMessageDeleted);
      socketService.on('message_forwarded', handleMessageForwarded);
      socketService.on('user_typing', handleUserTyping);
      socketService.on('user_stopped_typing', handleUserStoppedTyping);
      
      // Cleanup
      return () => {
        socketService.leaveConversation(conversation._id);
        socketService.off('new_message', handleNewMessage);
        socketService.off('message_reacted', handleMessageReacted);
        socketService.off('message_edited', handleMessageEdited);
        socketService.off('message_deleted', handleMessageDeleted);
        socketService.off('message_forwarded', handleMessageForwarded);
        socketService.off('user_typing', handleUserTyping);
        socketService.off('user_stopped_typing', handleUserStoppedTyping);
        setTypingUsers(new Set());
      };
    }
  }, [conversation?._id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Close context menu on scroll
  useEffect(() => {
    const handleScroll = () => setContextMenu(null);
    const container = document.getElementById('messages-container');
    container?.addEventListener('scroll', handleScroll);
    return () => container?.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await getMessages(conversation._id);
      setMessages(data);
      
      await markMessagesSeen(conversation._id);
    } catch (error) {
      if (error.statusCode === 403) {
        setError('Bạn không có quyền truy cập cuộc hội thoại này');
      } else if (error.statusCode === 401) {
        setError('Phiên đăng nhập hết hạn');
      } else {
        setError('Không thể tải tin nhắn');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ========== SOCKET EVENT HANDLERS ==========

  const handleNewMessage = (message) => {
    if (message.conversationId !== conversation._id) return;
    
    setMessages(prev => {
      const exists = prev.some(m => m._id === message._id);
      if (exists) return prev;
      return [...prev, message];
    });
  };

  const handleMessageReacted = (data) => {
    const { messageId, userId, emoji, action } = data;
    
    setMessages(prev => prev.map(msg => {
      if (msg._id !== messageId) return msg;
      
      let updatedReactions = [...(msg.reactions || [])];
      
      if (action === 'add') {
        // Add reaction
        updatedReactions.push({ userId, emoji });
      } else if (action === 'remove') {
        // Remove reaction
        updatedReactions = updatedReactions.filter(
          r => !(r.userId === userId && r.emoji === emoji)
        );
      }
      
      return { ...msg, reactions: updatedReactions };
    }));
  };

  const handleMessageEdited = (updatedMessage) => {
    setMessages(prev => prev.map(msg => 
      msg._id === updatedMessage._id ? updatedMessage : msg
    ));
  };

  const handleMessageDeleted = (data) => {
    const { messageId, scope, deletedBy } = data;
    
    setMessages(prev => prev.map(msg => {
      if (msg._id !== messageId) return msg;
      
      if (scope === 'everyone') {
        return {
          ...msg,
          content: 'Message deleted',
          isDeleted: true
        };
      } else {
        // scope === 'self' - hide for specific user
        if (deletedBy === currentUserId) {
          return {
            ...msg,
            deletedFor: [...(msg.deletedFor || []), currentUserId]
          };
        }
      }
      
      return msg;
    }));
  };

  const handleMessageForwarded = (message) => {
    if (message.conversationId !== conversation._id) return;
    handleNewMessage(message);
  };

  const handleUserTyping = (data) => {
    if (data.conversationId === conversation._id && data.userId !== currentUserId) {
      setTypingUsers(prev => new Set(prev).add(data.userId));
    }
  };

  const handleUserStoppedTyping = (data) => {
    if (data.conversationId === conversation._id) {
      setTypingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(data.userId);
        return newSet;
      });
    }
  };

  // ========== MESSAGE ACTIONS ==========

  const handleSendMessage = async () => {
    const content = inputMessage.trim();
    if (!content) return;

    setIsSending(true);
    
    try {
      // Send with optional reply
      const replyToId = replyTo?._id || null;
      socketService.sendMessage(conversation._id, content, replyToId);
      
      // Clear input & reply
      setInputMessage('');
      setReplyTo(null);
      
      // Stop typing indicator
      socketService.stopTyping(conversation._id);
      
    } catch (error) {
      console.error('Send message error:', error);
      alert('Không thể gửi tin nhắn. Vui lòng thử lại!');
    } finally {
      setIsSending(false);
    }
  };

  const handleAddReaction = async (messageId, emoji) => {
    try {
      await addReaction(conversation._id, messageId, emoji);
      // Socket event will update the UI
    } catch (error) {
      console.error('Add reaction failed:', error);
    }
  };

  const handleRemoveReaction = async (messageId, emoji) => {
    try {
      // Same endpoint toggles reaction
      await addReaction(conversation._id, messageId, emoji);
    } catch (error) {
      console.error('Remove reaction failed:', error);
    }
  };

  const handleReply = (message) => {
    setReplyTo(message);
    inputRef.current?.focus();
  };

  const handleCancelReply = () => {
    setReplyTo(null);
  };

  const handleEdit = (message) => {
    setEditingMessage(message);
  };

  const handleEditSubmit = async (messageId, newContent) => {
    try {
      await editMessageAPI(conversation._id, messageId, newContent);
      setEditingMessage(null);
      // Socket event will update the UI
    } catch (error) {
      console.error('Edit message failed:', error);
      alert(error.message || 'Không thể sửa tin nhắn');
    }
  };

  const handleDelete = (message) => {
    setDeletingMessage(message);
  };

  const handleDeleteConfirm = async (messageId, scope) => {
    try {
      await deleteMessageAPI(conversation._id, messageId, scope);
      setDeletingMessage(null);
      // Socket event will update the UI
    } catch (error) {
      console.error('Delete message failed:', error);
      alert(error.message || 'Không thể xóa tin nhắn');
    }
  };

  const handleForward = (message) => {
    setForwardingMessage(message);
  };

  const handleForwardSubmit = async (messageId, targetConversationIds) => {
    try {
      await forwardMessageAPI(conversation._id, messageId, targetConversationIds);
      setForwardingMessage(null);
      alert('Đã chuyển tiếp tin nhắn thành công!');
    } catch (error) {
      console.error('Forward message failed:', error);
      alert(error.message || 'Không thể chuyển tiếp tin nhắn');
    }
  };

  const handleCopy = (message) => {
    navigator.clipboard.writeText(message.content);
    // Optional: Show toast notification
  };

  const handleContextMenu = (e, message) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      message
    });
  };

  const handleInputChange = (e) => {
    setInputMessage(e.target.value);
    
    // Typing indicator
    if (e.target.value.trim()) {
      socketService.startTyping(conversation._id);
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        socketService.stopTyping(conversation._id);
      }, 2000);
    } else {
      socketService.stopTyping(conversation._id);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!conversation) {
    return null;
  }

  const name = getConversationName(conversation);
  const status = getConversationStatus(conversation);
  const avatar = getConversationAvatar(conversation);

  // Filter out messages deleted for current user
  const visibleMessages = messages.filter(msg => 
    !msg.deletedFor?.includes(currentUserId)
  );

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.avatarContainer}>
            {avatar ? (
              <img src={avatar} alt="" style={styles.avatar} />
            ) : (
              <div style={styles.avatarPlaceholder}>
                <User size={20} color="#9ca3af" />
              </div>
            )}
            {status === 'online' && <div style={styles.onlineIndicator} />}
          </div>

          <div style={styles.userInfo}>
            <h3 style={styles.userName}>{name}</h3>
            <p style={{
              ...styles.userStatus,
              color: status === 'online' ? '#10b981' : '#6b7280'
            }}>
              {status === 'online' ? 'Đang hoạt động' : 'Không hoạt động'}
            </p>
          </div>
        </div>

        <button style={styles.moreButton}>
          <MoreVertical size={20} />
        </button>
      </div>

      {/* Messages Area */}
      <div id="messages-container" style={styles.messagesContainer}>
        {isLoading ? (
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}>⟳</div>
            <p style={styles.loadingText}>Đang tải tin nhắn...</p>
          </div>
        ) : error ? (
          <div style={styles.errorContainer}>
            <p style={styles.errorText}>{error}</p>
          </div>
        ) : visibleMessages.length === 0 ? (
          <div style={styles.emptyContainer}>
            <p style={styles.emptyText}>Chưa có tin nhắn nào</p>
            <p style={styles.emptySubtext}>Gửi tin nhắn đầu tiên để bắt đầu trò chuyện</p>
          </div>
        ) : (
          <>
            {visibleMessages.map((message, index) => (
              <MessageBubble
                key={message._id}
                message={message}
                isOwn={message.senderId._id === currentUserId}
                showAvatar={
                  index === 0 || 
                  visibleMessages[index - 1].senderId._id !== message.senderId._id
                }
                onContextMenu={handleContextMenu}
                onAddReaction={handleAddReaction}
                onRemoveReaction={handleRemoveReaction}
              />
            ))}
            
            {/* Typing Indicator */}
            {typingUsers.size > 0 && (
              <div style={styles.typingIndicatorContainer}>
                <div style={styles.typingBubble}>
                  <span style={styles.typingDot}></span>
                  <span style={styles.typingDot}></span>
                  <span style={styles.typingDot}></span>
                </div>
                <p style={styles.typingText}>{name} đang nhập...</p>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Reply Preview */}
      {replyTo && (
        <ReplyPreview 
          replyToMessage={replyTo}
          onCancel={handleCancelReply}
        />
      )}

      {/* Input Area */}
      <div style={styles.inputContainer}>
        <input
          ref={inputRef}
          type="text"
          placeholder="Nhập tin nhắn..."
          value={inputMessage}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          style={styles.input}
          disabled={isSending}
        />
        <button
          onClick={handleSendMessage}
          disabled={!inputMessage.trim() || isSending}
          style={{
            ...styles.sendButton,
            ...((!inputMessage.trim() || isSending) ? styles.sendButtonDisabled : {})
          }}
        >
          {isSending ? (
            <span style={styles.spinner}>⟳</span>
          ) : (
            <Send size={20} />
          )}
        </button>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <MessageContextMenu
          position={{ x: contextMenu.x, y: contextMenu.y }}
          message={contextMenu.message}
          isOwn={contextMenu.message.senderId._id === currentUserId}
          onClose={() => setContextMenu(null)}
          onReply={handleReply}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onCopy={handleCopy}
          onForward={handleForward}
        />
      )}

      {/* Edit Modal */}
      {editingMessage && (
        <EditMessageModal
          message={editingMessage}
          onClose={() => setEditingMessage(null)}
          onSubmit={handleEditSubmit}
        />
      )}

      {/* Delete Modal */}
      {deletingMessage && (
        <DeleteMessageModal
          message={deletingMessage}
          onClose={() => setDeletingMessage(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}

      {/* Forward Modal */}
      {forwardingMessage && (
        <ForwardMessageModal
          message={forwardingMessage}
          onClose={() => setForwardingMessage(null)}
          onSubmit={handleForwardSubmit}
        />
      )}
    </div>
  );
}