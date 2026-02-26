// Đường dẫn: src/components/Chat/ChatWindow.jsx
// UPDATED: Phase 2 - GroupInfo panel + back button + scroll fix (no auto-scroll to bottom on load)

import React, { useState, useEffect, useRef } from 'react';
import { User, Send, MoreVertical, Search as SearchIcon, Info, ArrowLeft, Users, UserPlus } from 'lucide-react';
import {
  getMessages,
  getMoreMessages,
  markMessagesSeen,
  addReaction,
  removeReaction,
  sendMessageWithReply,
  editMessage as editMessageAPI,
  deleteMessage as deleteMessageAPI,
  forwardMessage as forwardMessageAPI,
  uploadFiles,
  uploadMedia,
  uploadVoice,
  pinMessage,
  unpinMessage,
  getPinnedMessages,
} from '../../services/chatService';
import {
  getConversationName,
  getConversationStatus,
  getConversationAvatar,
  getCurrentUserId,
} from '../../utils/chatHelpers';
import { chatWindowStyles as styles } from '../../styles/chatStyles';

import MessageBubble from './MessageBubble';
import ReplyPreview from './ReplyPreview';
import MessageContextMenu from './MessageContextMenu';
import EditMessageModal from './EditMessageModal';
import DeleteMessageModal from './DeleteMessageModal';
import ForwardMessageModal from './ForwardMessageModal';
import FileUpload from './FileUpload';
import MediaUpload from './MediaUpload';
import VoiceRecorder from './VoiceRecorder';
import UploadButton from './UploadButton';
import UploadProgress from './UploadProgress';
import MessageSearch from './MessageSearch';
import PinnedMessages from './PinnedMessages';
import GroupInfo from './GroupInfo';
import GroupMembersManager from './GroupMembersManager';
import socketService from '../../services/socketService';

export default function ChatWindow({ conversation, onBack, onConversationUpdate }) {
  // ============ STATES ============
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [typingUsers, setTypingUsers] = useState(new Set());

  const [replyTo, setReplyTo] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [deletingMessage, setDeletingMessage] = useState(null);
  const [forwardingMessage, setForwardingMessage] = useState(null);

  const [isFileUploadOpen, setIsFileUploadOpen] = useState(false);
  const [isMediaUploadOpen, setIsMediaUploadOpen] = useState(false);
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingFileName, setUploadingFileName] = useState('');

  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [showSearch, setShowSearch] = useState(false);
  const [pinnedMessages, setPinnedMessages] = useState([]);

  // Phase 2 states
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [showAddMembers, setShowAddMembers] = useState(false);

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const inputRef = useRef(null);
  // Track if initial load → scroll to bottom once
  const initialLoadDone = useRef(false);

  const currentUserId = getCurrentUserId();
  const isGroup = conversation?.type === 'group';

  // ============ EFFECTS ============
  useEffect(() => {
    if (conversation) {
      initialLoadDone.current = false;
      fetchMessages();
      socketService.joinConversation(conversation._id);

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
      socketService.on('message_pinned', handleMessagePinned);
      socketService.on('message_unpinned', handleMessageUnpinned);

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
        socketService.off('message_pinned', handleMessagePinned);
        socketService.off('message_unpinned', handleMessageUnpinned);
        setTypingUsers(new Set());
      };
    }
  }, [conversation?._id]);

  // Scroll to bottom ONLY on initial load (not on loadMore)
  useEffect(() => {
    if (!isLoading && !initialLoadDone.current && messages.length > 0) {
      initialLoadDone.current = true;
      // Use setTimeout to ensure DOM is ready
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
      }, 50);
    }
  }, [isLoading, messages.length]);

  useEffect(() => {
    setPinnedMessages(getPinnedMessages(messages));
  }, [messages]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const handleScroll = () => {
      setContextMenu(null);
      if (container.scrollTop === 0 && hasMore && !isLoadingMore) {
        loadMoreMessages();
      }
    };
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [hasMore, isLoadingMore, nextCursor]);

  // ============ FETCH MESSAGES ============
  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await getMessages(conversation._id);
      setMessages(data.messages);
      setNextCursor(data.nextCursor);
      setHasMore(data.hasMore);
      await markMessagesSeen(conversation._id);
    } catch (error) {
      if (error.statusCode === 403) setError('Bạn không có quyền truy cập cuộc hội thoại này');
      else if (error.statusCode === 401) setError('Phiên đăng nhập hết hạn');
      else setError('Không thể tải tin nhắn');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreMessages = async () => {
    if (isLoadingMore || !hasMore || !nextCursor) return;
    setIsLoadingMore(true);
    try {
      const container = messagesContainerRef.current;
      const scrollHeightBefore = container?.scrollHeight || 0;
      const data = await getMoreMessages(conversation._id, nextCursor, 19);
      setMessages(prev => [...data.messages, ...prev]);
      setNextCursor(data.nextCursor);
      setHasMore(data.hasMore);
      requestAnimationFrame(() => {
        if (container) {
          container.scrollTop = container.scrollHeight - scrollHeightBefore;
        }
      });
    } catch (error) {
      console.error('Load more failed:', error);
    } finally {
      setIsLoadingMore(false);
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
    // Scroll to bottom on new message
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
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
          if (emoji) return !(rUserId === userId && r.emoji === emoji);
          return rUserId !== userId;
        });
      }
      return { ...msg, reactions: updatedReactions };
    }));
  };

  const handleMessageEdited = (updatedMessage) => {
    setMessages(prev => prev.map(msg => msg._id === updatedMessage._id ? updatedMessage : msg));
  };

  const handleMessageDeleted = (data) => {
    const { messageId, scope, deletedBy } = data;
    setMessages(prev => prev.map(msg => {
      if (msg._id !== messageId) return msg;
      if (scope === 'everyone') return { ...msg, content: 'Message deleted', isDeleted: true };
      if (deletedBy === currentUserId) return { ...msg, deletedFor: [...(msg.deletedFor || []), currentUserId] };
      return msg;
    }));
  };

  const handleMessageForwarded = (message) => {
    if (message.conversationId !== conversation._id) return;
    handleNewMessage(message);
  };

  const handleMessageSeen = (data) => {
    const { conversationId, userId } = data;
    if (conversationId !== conversation._id || userId === currentUserId) return;
    setMessages(prev => prev.map(msg => {
      const isMine = typeof msg.senderId === 'string' ? msg.senderId === currentUserId : msg.senderId?._id === currentUserId;
      if (!isMine) return msg;
      const seenByIds = msg.seenBy?.map(sb => typeof sb === 'string' ? sb : sb._id) || [];
      if (!seenByIds.includes(userId)) return { ...msg, seenBy: [...(msg.seenBy || []), userId] };
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
      setTypingUsers(prev => { const n = new Set(prev); n.delete(data.userId); return n; });
    }
  };

  const handleNewMessageFile = (data) => {
    const { message, attachments } = data;
    if (message.conversationId !== conversation._id) return;
    setMessages(prev => {
      if (prev.some(m => m._id === message._id)) return prev;
      return [...prev, { ...message, attachments }];
    });
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    if (message.senderId._id !== currentUserId) setTimeout(() => markMessagesSeen(conversation._id).catch(console.error), 500);
  };

  const handleNewMessageMedia = (data) => {
    const { message, attachments } = data;
    if (message.conversationId !== conversation._id) return;
    setMessages(prev => {
      if (prev.some(m => m._id === message._id)) return prev;
      return [...prev, { ...message, attachments }];
    });
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    if (message.senderId._id !== currentUserId) setTimeout(() => markMessagesSeen(conversation._id).catch(console.error), 500);
  };

  const handleNewMessageVoice = (data) => {
    const { message, attachments } = data;
    if (message.conversationId !== conversation._id) return;
    setMessages(prev => {
      if (prev.some(m => m._id === message._id)) return prev;
      return [...prev, { ...message, attachments: [attachments] }];
    });
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    if (message.senderId._id !== currentUserId) setTimeout(() => markMessagesSeen(conversation._id).catch(console.error), 500);
  };

  const handleNewMessageLinkPreview = (links) => {
    if (!links || links.length === 0) return;
    setMessages(prev => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      if (links[0].messageId === last._id) {
        return prev.map((msg, idx) => idx === prev.length - 1 ? { ...msg, linkPreviews: links } : msg);
      }
      return prev;
    });
  };

  const handleMessagePinned = (data) => {
    const { messageId, isPinned, pinByUser, pinnedAt } = data;
    setMessages(prev => prev.map(msg => msg._id === messageId ? { ...msg, isPinned, pinByUser, pinnedAt } : msg));
  };

  const handleMessageUnpinned = (data) => {
    const { messageId } = data;
    setMessages(prev => prev.map(msg => msg._id === messageId ? { ...msg, isPinned: false, pinByUser: null, pinnedAt: null } : msg));
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
    try { await addReaction(conversation._id, messageId, emoji); } catch (err) { console.error(err); }
  };

  const handleRemoveReaction = async (messageId, emoji) => {
    try { await removeReaction(conversation._id, messageId, emoji); } catch (err) { console.error(err); }
  };

  const handleReply = (message) => { setReplyTo(message); inputRef.current?.focus(); };
  const handleEdit = (message) => setEditingMessage(message);
  const handleEditSubmit = async (messageId, newContent) => {
    try { await editMessageAPI(conversation._id, messageId, newContent); setEditingMessage(null); }
    catch (error) { alert(error.message || 'Không thể sửa tin nhắn'); }
  };
  const handleDelete = (message) => setDeletingMessage(message);
  const handleDeleteConfirm = async (messageId, scope) => {
    try { await deleteMessageAPI(conversation._id, messageId, scope); setDeletingMessage(null); }
    catch (error) { alert(error.message || 'Không thể xóa tin nhắn'); }
  };
  const handleForward = (message) => setForwardingMessage(message);
  const handleForwardSubmit = async (messageId, targetConversationIds) => {
    try {
      await forwardMessageAPI(conversation._id, messageId, targetConversationIds);
      setForwardingMessage(null);
      alert('Đã chuyển tiếp tin nhắn thành công!');
    } catch (error) { alert(error.message || 'Không thể chuyển tiếp tin nhắn'); }
  };
  const handleCopy = (message) => { if (message.content) navigator.clipboard.writeText(message.content); };
  const handleContextMenu = (e, message) => { e.preventDefault(); setContextMenu({ x: e.clientX, y: e.clientY, message }); };
  const handlePinMessage = async (messageId) => {
    try { await pinMessage(conversation._id, messageId); }
    catch (error) { alert(error.message || 'Không thể ghim tin nhắn'); }
  };
  const handleUnpinMessage = async (messageId) => {
    try { await unpinMessage(conversation._id, messageId); }
    catch (error) { alert(error.message || 'Không thể bỏ ghim tin nhắn'); }
  };
  const handleJumpToMessage = (message) => {
    setShowSearch(false);
    const el = document.getElementById(`message-${message._id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.style.backgroundColor = '#fef3c7';
      setTimeout(() => { el.style.backgroundColor = ''; }, 2000);
    } else {
      alert('Tin nhắn không tìm thấy, cuộn lên để tải thêm.');
    }
  };

  // ============ UPLOAD HANDLERS ============
  const handleFileUpload = async (files) => {
    setIsUploading(true); setUploadProgress(0);
    setUploadingFileName(files.length > 1 ? `${files.length} files` : files[0].name);
    try {
      await uploadFiles(conversation._id, files, replyTo?._id || null, p => setUploadProgress(p));
      setIsFileUploadOpen(false); setReplyTo(null);
    } catch (error) { alert(error.message || 'Upload thất bại'); }
    finally { setIsUploading(false); setUploadProgress(0); setUploadingFileName(''); }
  };
  const handleMediaUpload = async (files) => {
    setIsUploading(true); setUploadProgress(0);
    setUploadingFileName(files.length > 1 ? `${files.length} files` : files[0].name);
    try {
      await uploadMedia(conversation._id, files, replyTo?._id || null, p => setUploadProgress(p));
      setIsMediaUploadOpen(false); setReplyTo(null);
    } catch (error) { alert(error.message || 'Upload thất bại'); }
    finally { setIsUploading(false); setUploadProgress(0); setUploadingFileName(''); }
  };
  const handleVoiceUpload = async (audioBlob) => {
    setIsUploading(true); setUploadProgress(0); setUploadingFileName('Voice message');
    try {
      const file = new File([audioBlob], 'voice-message.mp3', { type: 'audio/mpeg' });
      await uploadVoice(conversation._id, file, replyTo?._id || null, p => setUploadProgress(p));
      setIsVoiceRecording(false); setReplyTo(null);
    } catch (error) { alert(error.message || 'Upload thất bại'); }
    finally { setIsUploading(false); setUploadProgress(0); setUploadingFileName(''); }
  };

  const handleInputChange = (e) => {
    setInputMessage(e.target.value);
    if (e.target.value.trim()) {
      socketService.startTyping(conversation._id);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => socketService.stopTyping(conversation._id), 2000);
    } else {
      socketService.stopTyping(conversation._id);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }
  };

  // ============ RENDER ============
  if (!conversation) return null;

  const name = getConversationName(conversation);
  const status = getConversationStatus(conversation);
  const avatar = getConversationAvatar(conversation);
  const visibleMessages = messages.filter(msg => !msg.deletedFor?.includes(currentUserId));
  const existingMemberIds = conversation.participants?.map(p =>
    typeof p.userId === 'string' ? p.userId : p.userId?._id
  ) || [];

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          {/* Back button for mobile */}
          {onBack && (
            <button onClick={onBack} style={backBtnStyle}>
              <ArrowLeft size={22} />
            </button>
          )}

          <div style={styles.avatarContainer}>
            {avatar ? (
              <img src={avatar} alt="" style={styles.avatar} />
            ) : isGroup ? (
              <div style={{ ...styles.avatarPlaceholder, background: 'linear-gradient(135deg,#667eea,#764ba2)' }}>
                <Users size={20} color="white" />
              </div>
            ) : (
              <div style={styles.avatarPlaceholder}>
                <User size={20} color="#9ca3af" />
              </div>
            )}
            {!isGroup && status === 'online' && <div style={styles.onlineIndicator} />}
          </div>

          <div style={styles.userInfo}>
            <h3 style={styles.userName}>{name}</h3>
            <p style={{ ...styles.userStatus, color: status === 'online' ? '#10b981' : '#6b7280' }}>
              {isGroup
                ? `${conversation.participants?.length || 0} thành viên`
                : status === 'online' ? 'Đang hoạt động' : 'Không hoạt động'
              }
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 4 }}>
          <button onClick={() => setShowSearch(true)} style={styles.moreButton} title="Tìm kiếm">
            <SearchIcon size={20} />
          </button>
          {isGroup && (
            <button onClick={() => setShowAddMembers(true)} style={styles.moreButton} title="Thêm thành viên">
              <UserPlus size={20} />
            </button>
          )}
          <button onClick={() => setShowGroupInfo(true)} style={styles.moreButton} title="Thông tin">
            <Info size={20} />
          </button>
        </div>
      </div>

      {/* Pinned Messages */}
      {pinnedMessages.length > 0 && (
        <PinnedMessages
          pinnedMessages={pinnedMessages}
          onUnpin={handleUnpinMessage}
          onMessageClick={handleJumpToMessage}
          currentUserId={currentUserId}
        />
      )}

      {/* Messages Area */}
      <div ref={messagesContainerRef} id="messages-container" style={styles.messagesContainer}>
        {isLoading ? (
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}>⟳</div>
            <p style={styles.loadingText}>Đang tải tin nhắn...</p>
          </div>
        ) : error ? (
          <div style={styles.errorContainer}><p style={styles.errorText}>{error}</p></div>
        ) : (
          <>
            {isLoadingMore && (
              <div style={styles.loadMoreIndicator}>
                <div style={styles.spinner}>⟳</div>
                <span style={{ fontSize: 13, color: '#6b7280' }}>Đang tải thêm...</span>
              </div>
            )}
            {!hasMore && messages.length > 0 && (
              <div style={styles.noMoreMessages}><span>Đã tải hết tin nhắn</span></div>
            )}
            {visibleMessages.length === 0 ? (
              <div style={styles.emptyContainer}>
                <p style={styles.emptyText}>Chưa có tin nhắn nào</p>
                <p style={styles.emptySubtext}>Gửi tin nhắn đầu tiên để bắt đầu trò chuyện</p>
              </div>
            ) : (
              <>
                {visibleMessages.map((message, index) => (
                  <div key={message._id} id={`message-${message._id}`}>
                    <MessageBubble
                      message={message}
                      isOwn={message.senderId._id === currentUserId}
                      showAvatar={index === 0 || visibleMessages[index - 1].senderId._id !== message.senderId._id}
                      onContextMenu={handleContextMenu}
                      onAddReaction={handleAddReaction}
                      onRemoveReaction={handleRemoveReaction}
                    />
                  </div>
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
          </>
        )}
      </div>

      {/* Reply Preview */}
      {replyTo && <ReplyPreview replyToMessage={replyTo} onCancel={() => setReplyTo(null)} />}

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
          style={{ ...styles.sendButton, ...((!inputMessage.trim() || isSending) ? styles.sendButtonDisabled : {}) }}
        >
          {isSending ? <span style={styles.spinner}>⟳</span> : <Send size={20} />}
        </button>
      </div>

      {/* Modals */}
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
          onPin={handlePinMessage}
          onUnpin={handleUnpinMessage}
          isPinned={contextMenu.message.isPinned}
        />
      )}
      {editingMessage && <EditMessageModal message={editingMessage} onClose={() => setEditingMessage(null)} onSubmit={handleEditSubmit} />}
      {deletingMessage && <DeleteMessageModal message={deletingMessage} onClose={() => setDeletingMessage(null)} onConfirm={handleDeleteConfirm} />}
      {forwardingMessage && <ForwardMessageModal message={forwardingMessage} onClose={() => setForwardingMessage(null)} onSubmit={handleForwardSubmit} />}
      {isFileUploadOpen && <FileUpload onFilesSelected={handleFileUpload} onClose={() => setIsFileUploadOpen(false)} />}
      {isMediaUploadOpen && <MediaUpload onFilesSelected={handleMediaUpload} onClose={() => setIsMediaUploadOpen(false)} />}
      {isVoiceRecording && <VoiceRecorder onRecordingComplete={handleVoiceUpload} onCancel={() => setIsVoiceRecording(false)} />}
      {isUploading && <UploadProgress progress={uploadProgress} fileName={uploadingFileName} />}
      {showSearch && <MessageSearch conversationId={conversation._id} onResultClick={handleJumpToMessage} onClose={() => setShowSearch(false)} />}

      {/* Group Info Panel */}
      {showGroupInfo && (
        <GroupInfo
          conversation={conversation}
          onClose={() => setShowGroupInfo(false)}
          onConversationUpdate={(updated) => {
            // Do NOT close panel — keep info open after role change / member removal
            onConversationUpdate?.(updated);
          }}
          onLeave={(result) => {
            setShowGroupInfo(false);
            // Always deselect on leave (null triggers ChatLayout to go back to list)
            onConversationUpdate?.(null);
          }}
        />
      )}

      {/* Add Members Modal */}
      {showAddMembers && (
        <GroupMembersManager
          conversationId={conversation._id}
          existingMemberIds={existingMemberIds}
          onClose={() => setShowAddMembers(false)}
          onMembersAdded={(updated) => {
            onConversationUpdate?.(updated);
            setShowAddMembers(false);
          }}
        />
      )}
    </div>
  );
}

const backBtnStyle = {
  background: 'none', border: 'none', cursor: 'pointer',
  color: '#6b7280', padding: '4px 8px 4px 0', display: 'flex',
  alignItems: 'center', flexShrink: 0,
};