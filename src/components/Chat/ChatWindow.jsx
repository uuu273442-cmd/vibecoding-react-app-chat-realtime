// Đường dẫn: src/components/Chat/ChatWindow.jsx
// FULL COMPLETE VERSION - File/Media/Voice Upload Integration

import React, { useState, useEffect, useRef } from 'react';
import { User, Send, MoreVertical } from 'lucide-react';
import { 
  getMessages, 
  markMessagesSeen,
  addReaction,
  removeReaction,
  sendMessageWithReply,
  editMessage as editMessageAPI,
  deleteMessage as deleteMessageAPI,
  forwardMessage as forwardMessageAPI,
  uploadFiles,
  uploadMedia,
  uploadVoice
} from '../../services/chatService';
import { 
  getConversationName, 
  getConversationStatus, 
  getConversationAvatar, 
  getCurrentUserId 
} from '../../utils/chatHelpers';
import { chatWindowStyles as styles } from '../../styles/chatStyles';

// Message Components
import MessageBubble from './MessageBubble';
import ReplyPreview from './ReplyPreview';
import MessageContextMenu from './MessageContextMenu';

// Modal Components
import EditMessageModal from './EditMessageModal';
import DeleteMessageModal from './DeleteMessageModal';
import ForwardMessageModal from './ForwardMessageModal';

// Upload Components
import FileUpload from './FileUpload';
import MediaUpload from './MediaUpload';
import VoiceRecorder from './VoiceRecorder';
import UploadButton from './UploadButton';
import UploadProgress from './UploadProgress';

import socketService from '../../services/socketService';

export default function ChatWindow({ conversation }) {
  // ============ STATES ============
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [typingUsers, setTypingUsers] = useState(new Set());
  
  // Message Features
  const [replyTo, setReplyTo] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [deletingMessage, setDeletingMessage] = useState(null);
  const [forwardingMessage, setForwardingMessage] = useState(null);
  
  // Upload States
  const [isFileUploadOpen, setIsFileUploadOpen] = useState(false);
  const [isMediaUploadOpen, setIsMediaUploadOpen] = useState(false);
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingFileName, setUploadingFileName] = useState('');
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const inputRef = useRef(null);
  const currentUserId = getCurrentUserId();

  // ============ EFFECTS ============
  useEffect(() => {
    if (conversation) {
      fetchMessages();
      socketService.joinConversation(conversation._id);
      
      // Socket listeners
      socketService.on('new_message', handleNewMessage);
      socketService.on('message_reacted', handleMessageReacted);
      socketService.on('message_edited', handleMessageEdited);
      socketService.on('message_deleted', handleMessageDeleted);
      socketService.on('message_forwarded', handleMessageForwarded);
      socketService.on('message_seen', handleMessageSeen);
      socketService.on('user_typing', handleUserTyping);
      socketService.on('user_stopped_typing', handleUserStoppedTyping);
      socketService.on('new_message_file', handleNewMessageFile);
      socketService.on('new_message_media', handleNewMessageMedia);
      socketService.on('new_message_voice', handleNewMessageVoice);
      socketService.on('new_message_linkPreview', handleNewMessageLinkPreview);
      
      return () => {
        socketService.leaveConversation(conversation._id);
        socketService.off('new_message', handleNewMessage);
        socketService.off('message_reacted', handleMessageReacted);
        socketService.off('message_edited', handleMessageEdited);
        socketService.off('message_deleted', handleMessageDeleted);
        socketService.off('message_forwarded', handleMessageForwarded);
        socketService.off('message_seen', handleMessageSeen);
        socketService.off('user_typing', handleUserTyping);
        socketService.off('user_stopped_typing', handleUserStoppedTyping);
        socketService.off('new_message_file', handleNewMessageFile);
        socketService.off('new_message_media', handleNewMessageMedia);
        socketService.off('new_message_voice', handleNewMessageVoice);
        socketService.off('new_message_linkPreview', handleNewMessageLinkPreview);
        setTypingUsers(new Set());
      };
    }
  }, [conversation?._id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleScroll = () => setContextMenu(null);
    const container = document.getElementById('messages-container');
    container?.addEventListener('scroll', handleScroll);
    return () => container?.removeEventListener('scroll', handleScroll);
  }, []);

  // ============ FETCH MESSAGES ============
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

  // ============ SOCKET HANDLERS ============
  const handleNewMessage = (message) => {
    if (message.conversationId !== conversation._id) return;
    
    setMessages(prev => {
      const exists = prev.some(m => m._id === message._id);
      if (exists) return prev;
      return [...prev, message];
    });

    if (message.senderId._id !== currentUserId) {
      setTimeout(() => markMessagesSeen(conversation._id).catch(console.error), 500);
    }
  };

  const handleMessageReacted = (data) => {
    const { messageId, userId, emoji, action } = data;
    
    setMessages(prev => prev.map(msg => {
      if (msg._id !== messageId) return msg;
      
      let updatedReactions = [...(msg.reactions || [])];
      
      if (action === 'add') {
        updatedReactions = updatedReactions.filter(r => {
          const rUserId = typeof r.userId === 'string' ? r.userId : r.userId?._id;
          return rUserId !== userId;
        });
        updatedReactions.push({ userId, emoji });
      } else if (action === 'remove') {
        updatedReactions = updatedReactions.filter(r => {
          const rUserId = typeof r.userId === 'string' ? r.userId : r.userId?._id;
          if (emoji) {
            return !(rUserId === userId && r.emoji === emoji);
          } else {
            return rUserId !== userId;
          }
        });
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

  const handleMessageSeen = (data) => {
    const { conversationId, userId } = data;
    
    if (conversationId !== conversation._id) return;
    if (userId === currentUserId) return;
    
    setMessages(prev => prev.map(msg => {
      const isMine = typeof msg.senderId === 'string' 
        ? msg.senderId === currentUserId
        : msg.senderId?._id === currentUserId;

      if (!isMine) return msg;

      const seenByIds = msg.seenBy?.map(sb => 
        typeof sb === 'string' ? sb : sb._id
      ) || [];

      if (!seenByIds.includes(userId)) {
        return {
          ...msg,
          seenBy: [...(msg.seenBy || []), userId]
        };
      }

      return msg;
    }));
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

  // ============ UPLOAD SOCKET HANDLERS ============
  const handleNewMessageFile = (data) => {
    const { message, attachments } = data;
    
    if (message.conversationId !== conversation._id) return;
    
    setMessages(prev => {
      const exists = prev.some(m => m._id === message._id);
      if (exists) return prev;
      return [...prev, { ...message, attachments }];
    });
    
    if (message.senderId._id !== currentUserId) {
      setTimeout(() => markMessagesSeen(conversation._id).catch(console.error), 500);
    }
  };

  const handleNewMessageMedia = (data) => {
    const { message, attachments } = data;
    
    if (message.conversationId !== conversation._id) return;
    
    setMessages(prev => {
      const exists = prev.some(m => m._id === message._id);
      if (exists) return prev;
      return [...prev, { ...message, attachments }];
    });
    
    if (message.senderId._id !== currentUserId) {
      setTimeout(() => markMessagesSeen(conversation._id).catch(console.error), 500);
    }
  };

  const handleNewMessageVoice = (data) => {
    const { message, attachments } = data;
    
    if (message.conversationId !== conversation._id) return;
    
    setMessages(prev => {
      const exists = prev.some(m => m._id === message._id);
      if (exists) return prev;
      return [...prev, { ...message, attachments: [attachments] }];
    });
    
    if (message.senderId._id !== currentUserId) {
      setTimeout(() => markMessagesSeen(conversation._id).catch(console.error), 500);
    }
  };

  const handleNewMessageLinkPreview = (links) => {
    if (!links || links.length === 0) return;
    
    setMessages(prev => {
      if (prev.length === 0) return prev;
      
      const lastMessage = prev[prev.length - 1];
      
      if (links[0].messageId === lastMessage._id) {
        return prev.map((msg, idx) => 
          idx === prev.length - 1 
            ? { ...msg, linkPreviews: links }
            : msg
        );
      }
      
      return prev;
    });
  };

  // ============ MESSAGE ACTIONS ============
  const handleSendMessage = async () => {
    const content = inputMessage.trim();
    if (!content) return;

    setIsSending(true);
    
    try {
      const replyToId = replyTo?._id || null;
      await sendMessageWithReply(conversation._id, content, replyToId);
      
      setInputMessage('');
      setReplyTo(null);
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
    } catch (error) {
      console.error('Add reaction failed:', error);
    }
  };

  const handleRemoveReaction = async (messageId, emoji) => {
    try {
      await removeReaction(conversation._id, messageId, emoji);
    } catch (error) {
      console.error('Remove reaction failed:', error);
    }
  };

  const handleReply = (message) => {
    setReplyTo(message);
    inputRef.current?.focus();
  };

  const handleEdit = (message) => {
    setEditingMessage(message);
  };

  const handleEditSubmit = async (messageId, newContent) => {
    try {
      await editMessageAPI(conversation._id, messageId, newContent);
      setEditingMessage(null);
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
  };

  const handleContextMenu = (e, message) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      message
    });
  };

  // ============ UPLOAD HANDLERS ============
  const handleFileUpload = async (files) => {
    setIsUploading(true);
    setUploadProgress(0);
    setUploadingFileName(files.length > 1 ? `${files.length} files` : files[0].name);
    
    try {
      const replyToId = replyTo?._id || null;
      
      await uploadFiles(
        conversation._id,
        files,
        replyToId,
        (progress) => setUploadProgress(progress)
      );
      
      setIsFileUploadOpen(false);
      setReplyTo(null);
      
    } catch (error) {
      console.error('File upload failed:', error);
      alert(error.message || 'Upload failed');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setUploadingFileName('');
    }
  };

  const handleMediaUpload = async (files) => {
    setIsUploading(true);
    setUploadProgress(0);
    setUploadingFileName(files.length > 1 ? `${files.length} files` : files[0].name);
    
    try {
      const replyToId = replyTo?._id || null;
      
      await uploadMedia(
        conversation._id,
        files,
        replyToId,
        (progress) => setUploadProgress(progress)
      );
      
      setIsMediaUploadOpen(false);
      setReplyTo(null);
      
    } catch (error) {
      console.error('Media upload failed:', error);
      alert(error.message || 'Upload failed');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setUploadingFileName('');
    }
  };

  const handleVoiceUpload = async (audioBlob) => {
    setIsUploading(true);
    setUploadProgress(0);
    setUploadingFileName('Voice message');
    
    try {
      const file = new File([audioBlob], 'voice-message.mp3', {
        type: 'audio/mpeg'
      });
      
      const replyToId = replyTo?._id || null;
      
      await uploadVoice(
        conversation._id,
        file,
        replyToId,
        (progress) => setUploadProgress(progress)
      );
      
      setIsVoiceRecording(false);
      setReplyTo(null);
      
    } catch (error) {
      console.error('Voice upload failed:', error);
      alert(error.message || 'Upload failed');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setUploadingFileName('');
    }
  };

  // ============ INPUT HANDLERS ============
  const handleInputChange = (e) => {
    setInputMessage(e.target.value);
    
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

  // ============ RENDER ============
  if (!conversation) {
    return null;
  }

  const name = getConversationName(conversation);
  const status = getConversationStatus(conversation);
  const avatar = getConversationAvatar(conversation);
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
          onCancel={() => setReplyTo(null)}
        />
      )}

      {/* Input Area */}
      <div style={styles.inputContainer}>
        <UploadButton
          onFileClick={() => setIsFileUploadOpen(true)}
          onMediaClick={() => setIsMediaUploadOpen(true)}
          onVoiceClick={() => setIsVoiceRecording(true)}
        />
        
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

      {/* Upload Modals */}
      {isFileUploadOpen && (
        <FileUpload
          onFilesSelected={handleFileUpload}
          onClose={() => setIsFileUploadOpen(false)}
        />
      )}

      {isMediaUploadOpen && (
        <MediaUpload
          onFilesSelected={handleMediaUpload}
          onClose={() => setIsMediaUploadOpen(false)}
        />
      )}

      {isVoiceRecording && (
        <VoiceRecorder
          onRecordingComplete={handleVoiceUpload}
          onCancel={() => setIsVoiceRecording(false)}
        />
      )}

      {/* Upload Progress */}
      {isUploading && (
        <UploadProgress
          progress={uploadProgress}
          fileName={uploadingFileName}
        />
      )}
    </div>
  );
}