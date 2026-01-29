// Đường dẫn: src/components/Chat/ChatWindow.jsx

import React, { useState, useEffect, useRef } from 'react';
import { User, Send, MoreVertical } from 'lucide-react';
import { getMessages, sendMessage as sendMessageAPI, markMessagesSeen } from '../../services/chatService';
import { getConversationName, getConversationStatus, getConversationAvatar, getCurrentUserId } from '../../utils/chatHelpers';
import { chatWindowStyles as styles } from '../../styles/chatStyles';
import MessageBubble from './MessageBubble';
import socketService from '../../services/socketService';

export default function ChatWindow({ conversation }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [typingUsers, setTypingUsers] = useState(new Set());
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const currentUserId = getCurrentUserId();

  useEffect(() => {
    if (conversation) {
      fetchMessages();
      
      // Join conversation room
      socketService.joinConversation(conversation._id);
      
      // Listen for new messages
      socketService.on('new_message', handleNewMessage);
      
      // Listen for typing indicators
      socketService.on('user_typing', handleUserTyping);
      socketService.on('user_stopped_typing', handleUserStoppedTyping);
      
      // Cleanup on unmount or conversation change
      return () => {
        socketService.leaveConversation(conversation._id);
        socketService.off('new_message', handleNewMessage);
        socketService.off('user_typing', handleUserTyping);
        socketService.off('user_stopped_typing', handleUserStoppedTyping);
        setTypingUsers(new Set()); // Clear typing users
      };
    }
  }, [conversation?._id]); // Only re-run when conversation ID changes

  useEffect(() => {
    // Auto scroll to bottom when messages change
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await getMessages(conversation._id);
      setMessages(data);
      
      // Mark messages as seen
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

  const handleNewMessage = (message) => {
    console.log('📩 New message received via socket:', message);
    console.log('Current conversation:', conversation._id);
    console.log('Message conversation:', message.conversationId);
    
    // Only add if message belongs to current conversation
    if (message.conversationId !== conversation._id) {
      console.log('⚠️ Message not for current conversation, ignoring');
      return;
    }
    
    // Check if message already exists (avoid duplicates)
    setMessages(prev => {
      const exists = prev.some(m => m._id === message._id);
      if (exists) {
        console.log('⚠️ Message already exists, skipping');
        return prev;
      }
      console.log('✅ Adding new message to list');
      return [...prev, message];
    });
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    const content = inputMessage.trim();
    
    if (!content) return;

    setIsSending(true);
    
    try {
      // Gửi message qua Socket (KHÔNG dùng REST API)
      socketService.sendMessage(conversation._id, content);
      
      // Clear input ngay
      setInputMessage('');
      
      // Stop typing indicator
      socketService.stopTyping(conversation._id);
      
      // Message sẽ được nhận qua event 'new_message'
      // Không cần thêm vào state ở đây
      
    } catch (error) {
      console.error('Send message error:', error);
      alert('Không thể gửi tin nhắn. Vui lòng thử lại!');
    } finally {
      setIsSending(false);
    }
  };

  const handleInputChange = (e) => {
    setInputMessage(e.target.value);
    
    // Typing indicator
    if (e.target.value.trim()) {
      socketService.startTyping(conversation._id);
      
      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Stop typing after 2 seconds of inactivity
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

  if (!conversation) {
    return null;
  }

  const name = getConversationName(conversation);
  const status = getConversationStatus(conversation);
  const avatar = getConversationAvatar(conversation);

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          {/* Avatar */}
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

          {/* User Info */}
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

        {/* Actions */}
        <button style={styles.moreButton}>
          <MoreVertical size={20} />
        </button>
      </div>

      {/* Messages Area */}
      <div style={styles.messagesContainer}>
        {isLoading ? (
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}>⟳</div>
            <p style={styles.loadingText}>Đang tải tin nhắn...</p>
          </div>
        ) : error ? (
          <div style={styles.errorContainer}>
            <p style={styles.errorText}>{error}</p>
          </div>
        ) : messages.length === 0 ? (
          <div style={styles.emptyContainer}>
            <p style={styles.emptyText}>Chưa có tin nhắn nào</p>
            <p style={styles.emptySubtext}>Gửi tin nhắn đầu tiên để bắt đầu trò chuyện</p>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <MessageBubble
                key={message._id}
                message={message}
                isOwn={message.senderId._id === currentUserId}
                showAvatar={
                  index === 0 || 
                  messages[index - 1].senderId._id !== message.senderId._id
                }
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

      {/* Input Area */}
      <div style={styles.inputContainer}>
        <input
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
    </div>
  );
}