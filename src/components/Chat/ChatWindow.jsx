// Đường dẫn: src/components/Chat/ChatWindow.jsx

import React, { useState, useEffect, useRef } from 'react';
import { User, Send, MoreVertical } from 'lucide-react';
import { getMessages, sendMessage, markMessagesSeen } from '../../services/chatService';
import { getConversationName, getConversationStatus, getConversationAvatar, getCurrentUserId } from '../../utils/chatHelpers';
import { chatWindowStyles as styles } from '../../styles/chatStyles';
import MessageBubble from './MessageBubble';

export default function ChatWindow({ conversation }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const currentUserId = getCurrentUserId();

  useEffect(() => {
    if (conversation) {
      fetchMessages();
    }
  }, [conversation?._id]);

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    const content = inputMessage.trim();
    
    if (!content) return;

    setIsSending(true);
    
    try {
      const newMessage = await sendMessage(conversation._id, content);
      
      // API trả về message chưa có full senderId object, cần thêm thông tin
      const currentUser = {
        _id: currentUserId,
        name: 'Bạn', // Tạm thời, sẽ update sau
        avatar: null
      };
      
      const messageWithSender = {
        ...newMessage,
        senderId: currentUser
      };
      
      // Add new message to list
      setMessages(prev => [...prev, messageWithSender]);
      
      // Clear input
      setInputMessage('');
    } catch (error) {
      console.error('Send message error:', error);
      
      if (error.statusCode === 403) {
        alert('Bạn không có quyền gửi tin nhắn trong cuộc hội thoại này!');
      } else if (error.statusCode === 401) {
        alert('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!');
      } else {
        alert('Không thể gửi tin nhắn. Vui lòng thử lại!');
      }
    } finally {
      setIsSending(false);
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
            <p style={styles.userStatus}>
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
          onChange={(e) => setInputMessage(e.target.value)}
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