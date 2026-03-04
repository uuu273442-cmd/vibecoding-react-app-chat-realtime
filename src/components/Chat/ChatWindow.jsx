// Đường dẫn: src/components/Chat/ChatWindow.jsx
// UPDATED: Phase 2 socket - group_member_added, group_member_removed, group_member_left, group_role_changed, group_join_requested, group_request_handled

import React, { useState, useEffect, useRef } from 'react';
import { User, Send, Search as SearchIcon, Info, ArrowLeft, Users, UserPlus } from 'lucide-react';
import {
  getMessages, getMoreMessages, markMessagesSeen,
  addReaction, removeReaction, sendMessageWithReply,
  editMessage as editMessageAPI, deleteMessage as deleteMessageAPI,
  forwardMessage as forwardMessageAPI,
  uploadFiles, uploadMedia, uploadVoice,
  pinMessage, unpinMessage, getPinnedMessages,
} from '../../services/chatService';
import { getConversationName, getConversationStatus, getConversationAvatar, getCurrentUserId } from '../../utils/chatHelpers';
import { chatWindowStyles as styles } from '../../styles/chatStyles';
import MessageBubble from './MessageBubble';
import SystemMessage from './SystemMessage';
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
import MentionInput from './MentionInput';
import AnnouncementBanner from './AnnouncementBanner';
import socketService from '../../services/socketService';

// Helper: merge conversation data, preserve userId objects when socket sends only id strings
const mergeConversation = (prev, updated) => {
  const mergedParticipants = updated.participants?.map(newP => {
    const newId = typeof newP.userId === 'string' ? newP.userId : newP.userId?._id;
    const existing = prev.participants?.find(p => {
      const exId = typeof p.userId === 'string' ? p.userId : p.userId?._id;
      return newId === exId;
    });
    if (existing && typeof newP.userId === 'string' && typeof existing.userId === 'object') {
      return { ...newP, userId: existing.userId };
    }
    return newP;
  }) || updated.participants;
  return { ...prev, ...updated, participants: mergedParticipants };
};

export default function ChatWindow({ conversation, onBack, onConversationUpdate }) {
  // ── Message states ───────────────────────────────────────────────────────
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [pinnedMessages, setPinnedMessages] = useState([]);

  // ── Action modals ────────────────────────────────────────────────────────
  const [replyTo, setReplyTo] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [deletingMessage, setDeletingMessage] = useState(null);
  const [forwardingMessage, setForwardingMessage] = useState(null);

  // ── Upload states ────────────────────────────────────────────────────────
  const [isFileUploadOpen, setIsFileUploadOpen] = useState(false);
  const [isMediaUploadOpen, setIsMediaUploadOpen] = useState(false);
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingFileName, setUploadingFileName] = useState('');

  // ── Panel states ─────────────────────────────────────────────────────────
  const [showSearch, setShowSearch] = useState(false);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [showAddMembers, setShowAddMembers] = useState(false);
  const [showAnnouncement, setShowAnnouncement] = useState(true);

  // ── Mention state ─────────────────────────────────────────────────────────
  const [mentionIds, setMentionIds] = useState([]);

  // ── Conversation state (local copy for realtime updates) ─────────────────
  const [localConversation, setLocalConversation] = useState(conversation);

  // ── Refs ─────────────────────────────────────────────────────────────────
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const inputRef = useRef(null);
  const initialLoadDone = useRef(false);
  // Ref để trigger GroupInfo reload khi nhận socket event
  const groupInfoReloadRef = useRef(null);

  const currentUserId = getCurrentUserId();
  const isGroup = localConversation?.type === 'group';

  // Sync localConversation when prop changes (different chat selected)
  useEffect(() => {
    setLocalConversation(conversation);
  }, [conversation?._id]);

  // ── Main effect: load messages + register ALL socket listeners ───────────
  useEffect(() => {
    if (!conversation?._id) return;
    initialLoadDone.current = false;
    fetchMessages();
    socketService.joinConversation(conversation._id);

    // ── Phase 1: message events ──────────────────────────────────────────
    const handleNewMessage = (message) => {
      if (message.conversationId !== conversation._id) return;
      setMessages(prev => prev.some(m => m._id === message._id) ? prev : [...prev, message]);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
      if (message.senderId._id !== currentUserId) {
        setTimeout(() => markMessagesSeen(conversation._id).catch(console.error), 500);
      }
    };

    const handleMessageReacted = ({ messageId, userId, emoji, action }) => {
      setMessages(prev => prev.map(msg => {
        if (msg._id !== messageId) return msg;
        let reactions = [...(msg.reactions || [])];
        if (action === 'add') {
          reactions = reactions.filter(r => (typeof r.userId === 'string' ? r.userId : r.userId?._id) !== userId);
          reactions.push({ userId, emoji });
        } else {
          reactions = reactions.filter(r => {
            const uid = typeof r.userId === 'string' ? r.userId : r.userId?._id;
            return emoji ? !(uid === userId && r.emoji === emoji) : uid !== userId;
          });
        }
        return { ...msg, reactions };
      }));
    };

    const handleMessageEdited = (updated) => {
      setMessages(prev => prev.map(m => m._id === updated._id ? updated : m));
    };

    const handleMessageDeleted = ({ messageId, scope, deletedBy }) => {
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

    const handleMessageSeen = ({ conversationId, messageId, seenBy }) => {
      if (conversationId !== conversation._id) return;
      if (!seenBy) return;

      // BE gửi seenBy: { _id?, name, avatar }
      // Nếu _id trùng với currentUserId → bỏ qua (mình tự seen)
      const seenById = seenBy._id;
      if (seenById && seenById === currentUserId) return;

      setMessages(prev => prev.map(msg => {
        // Xóa entry cũ của user này khỏi tất cả messages
        // Match bằng _id nếu có, fallback bằng name
        const withoutUser = (msg.seenBy || []).filter(sb => {
          if (seenById) {
            const sbId = typeof sb === 'string' ? sb : sb._id;
            return sbId !== seenById;
          }
          // fallback: match by name
          const sbName = typeof sb === 'object' ? sb.name : null;
          return sbName !== seenBy.name;
        });

        if (msg._id === messageId) {
          return { ...msg, seenBy: [...withoutUser, seenBy] };
        }
        return { ...msg, seenBy: withoutUser };
      }));
    };

    const handleUserTyping = ({ conversationId, userId }) => {
      if (conversationId === conversation._id && userId !== currentUserId) {
        setTypingUsers(prev => new Set(prev).add(userId));
      }
    };

    const handleUserStoppedTyping = ({ conversationId, userId }) => {
      if (conversationId === conversation._id) {
        setTypingUsers(prev => { const n = new Set(prev); n.delete(userId); return n; });
      }
    };

    const handleNewFile = ({ message, attachments }) => {
      if (message.conversationId !== conversation._id) return;
      setMessages(prev => prev.some(m => m._id === message._id) ? prev : [...prev, { ...message, attachments }]);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    };

    const handleNewMedia = ({ message, attachments }) => {
      if (message.conversationId !== conversation._id) return;
      setMessages(prev => prev.some(m => m._id === message._id) ? prev : [...prev, { ...message, attachments }]);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    };

    const handleNewVoice = ({ message, attachments }) => {
      if (message.conversationId !== conversation._id) return;
      setMessages(prev => prev.some(m => m._id === message._id) ? prev : [...prev, { ...message, attachments: [attachments] }]);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    };

    const handleLinkPreview = (links) => {
      if (!links?.length) return;
      setMessages(prev => {
        if (!prev.length) return prev;
        const last = prev[prev.length - 1];
        if (links[0].messageId === last._id) {
          return prev.map((m, i) => i === prev.length - 1 ? { ...m, linkPreviews: links } : m);
        }
        return prev;
      });
    };

    // System messages (group events: add member, remove, role change, leave...)
    const handleSystemMessages = (messages) => {
      if (!Array.isArray(messages) || messages.length === 0) return;
      // Chỉ xử lý messages thuộc conversation hiện tại
      const relevant = messages.filter(m => m.conversationId === conversation._id);
      if (relevant.length === 0) return;
      setMessages(prev => {
        const existingIds = new Set(prev.map(m => m._id));
        const newMsgs = relevant.filter(m => !existingIds.has(m._id));
        if (newMsgs.length === 0) return prev;
        return [...prev, ...newMsgs];
      });
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    };

    const handleMessagePinned = ({ messageId, isPinned, pinByUser, pinnedAt }) => {
      setMessages(prev => prev.map(m => m._id === messageId ? { ...m, isPinned, pinByUser, pinnedAt } : m));
    };

    const handleMessageUnpinned = ({ messageId }) => {
      setMessages(prev => prev.map(m => m._id === messageId ? { ...m, isPinned: false, pinByUser: null, pinnedAt: null } : m));
    };

    // Notification khi bị mention trong nhóm
    const handleMentionReceived = ({ message, conversationId: convId }) => {
      // Nếu đang ở đúng conversation → message đã được add qua new_message
      // Nếu ở conversation khác → ChatLayout xử lý toast + badge
    };

    // Admin tạo announcement mới → reload banner
    const handleAnnouncementCreated = (data) => {
      if (!data?.announcement) return;
      if (data.conversationId !== conversation._id) return;
      // Dispatch để AnnouncementBanner tự reload
      window.dispatchEvent(new CustomEvent('announcement_created', {
        detail: { conversationId: conversation._id, announcement: data.announcement }
      }));
    };

    // ── Phase 2: group events ────────────────────────────────────────────

    // Helper: reload GroupInfo nếu đang mở
    const reloadGroupInfo = () => {
      if (groupInfoReloadRef.current) groupInfoReloadRef.current();
    };

    // Members trong room nhận khi có người được thêm
    const handleGroupMemberAdded = (data) => {
      if (!data) return;
      const updatedConv = data.conversation;
      if (!updatedConv || updatedConv._id !== conversation._id) return;
      setLocalConversation(prev => mergeConversation(prev, updatedConv));
      onConversationUpdate?.(updatedConv);
      reloadGroupInfo();
    };

    // Members còn lại nhận khi có người bị xóa
    const handleGroupMemberRemoved = (data) => {
      if (!data) return;
      const { conversation: updatedConv, removedUserIds } = data;
      if (!updatedConv || updatedConv._id !== conversation._id) return;
      if (removedUserIds?.includes(currentUserId)) return;
      setLocalConversation(prev => mergeConversation(prev, updatedConv));
      onConversationUpdate?.(updatedConv);
      reloadGroupInfo();
    };

    // Members còn lại nhận khi có người tự rời
    const handleGroupMemberLeft = (data) => {
      if (!data) return;
      const updatedConv = data.conversation;
      if (!updatedConv || updatedConv._id !== conversation._id) return;
      setLocalConversation(prev => mergeConversation(prev, updatedConv));
      onConversationUpdate?.(updatedConv);
      reloadGroupInfo();
    };

    // Toàn bộ members nhận khi role thay đổi
    const handleGroupRoleChanged = (data) => {
      if (!data) return;
      const updatedConv = data.conversation;
      if (!updatedConv || updatedConv._id !== conversation._id) return;
      setLocalConversation(prev => mergeConversation(prev, updatedConv));
      onConversationUpdate?.(updatedConv);
      reloadGroupInfo();
    };

    // group_join_requested được handle ở ChatLayout (user room)
    // ChatWindow không cần handle — GroupInfo tự nhận qua CustomEvent
    const handleGroupJoinRequested = () => {};

    // Members trong room nhận khi request được xử lý (accept)
    const handleGroupRequestHandled = (data) => {
      if (!data) return;
      const updatedConv = data.conversation;
      // reject không có conversation field
      if (!updatedConv || updatedConv._id !== conversation._id) return;
      setLocalConversation(prev => mergeConversation(prev, updatedConv));
      onConversationUpdate?.(updatedConv);
      reloadGroupInfo();
    };

    // Register all
    socketService.on('message_system_room', handleSystemMessages);
    socketService.on('new_message', handleNewMessage);
    socketService.on('message_reacted', handleMessageReacted);
    socketService.on('message_edited', handleMessageEdited);
    socketService.on('message_deleted', handleMessageDeleted);
    socketService.on('message_forwarded', handleMessageForwarded);
    socketService.on('message_seen', handleMessageSeen);
    socketService.on('user_typing', handleUserTyping);
    socketService.on('user_stopped_typing', handleUserStoppedTyping);
    socketService.on('new_message_file', handleNewFile);
    socketService.on('new_message_media', handleNewMedia);
    socketService.on('new_message_voice', handleNewVoice);
    socketService.on('new_message_linkPreview', handleLinkPreview);
    socketService.on('message_pinned', handleMessagePinned);
    socketService.on('message_unpinned', handleMessageUnpinned);
    socketService.on('mention_received', handleMentionReceived);
    socketService.on('announcement_created', handleAnnouncementCreated);
    // Group
    socketService.on('group_member_added', handleGroupMemberAdded);
    socketService.on('group_member_removed', handleGroupMemberRemoved);
    socketService.on('group_member_left', handleGroupMemberLeft);
    socketService.on('group_role_changed', handleGroupRoleChanged);
    socketService.on('group_join_requested', handleGroupJoinRequested);
    socketService.on('group_request_handled', handleGroupRequestHandled);

    return () => {
      socketService.leaveConversation(conversation._id);
      socketService.off('message_system_room', handleSystemMessages);
      socketService.off('new_message', handleNewMessage);
      socketService.off('message_reacted', handleMessageReacted);
      socketService.off('message_edited', handleMessageEdited);
      socketService.off('message_deleted', handleMessageDeleted);
      socketService.off('message_forwarded', handleMessageForwarded);
      socketService.off('message_seen', handleMessageSeen);
      socketService.off('user_typing', handleUserTyping);
      socketService.off('user_stopped_typing', handleUserStoppedTyping);
      socketService.off('new_message_file', handleNewFile);
      socketService.off('new_message_media', handleNewMedia);
      socketService.off('new_message_voice', handleNewVoice);
      socketService.off('new_message_linkPreview', handleLinkPreview);
      socketService.off('message_pinned', handleMessagePinned);
      socketService.off('message_unpinned', handleMessageUnpinned);
      socketService.off('mention_received', handleMentionReceived);
      socketService.off('announcement_created', handleAnnouncementCreated);
      socketService.off('group_member_added', handleGroupMemberAdded);
      socketService.off('group_member_removed', handleGroupMemberRemoved);
      socketService.off('group_member_left', handleGroupMemberLeft);
      socketService.off('group_role_changed', handleGroupRoleChanged);
      socketService.off('group_join_requested', handleGroupJoinRequested);
      socketService.off('group_request_handled', handleGroupRequestHandled);
      setTypingUsers(new Set());
    };
  }, [conversation?._id]);

  // Scroll to bottom only on initial load
  useEffect(() => {
    if (!isLoading && !initialLoadDone.current && messages.length > 0) {
      initialLoadDone.current = true;
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'auto' }), 50);
    }
  }, [isLoading, messages.length]);

  useEffect(() => {
    setPinnedMessages(getPinnedMessages ? getPinnedMessages(messages) : messages.filter(m => m.isPinned));
  }, [messages]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const handleScroll = () => {
      setContextMenu(null);
      if (container.scrollTop === 0 && hasMore && !isLoadingMore) loadMoreMessages();
    };
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [hasMore, isLoadingMore, nextCursor]);

  // ── Fetch ────────────────────────────────────────────────────────────────
  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await getMessages(conversation._id);
      setMessages(data.messages);
      setNextCursor(data.nextCursor);
      setHasMore(data.hasMore);
      await markMessagesSeen(conversation._id);
    } catch (err) {
      if (err.statusCode === 403) setError('Bạn không có quyền truy cập');
      else if (err.statusCode === 401) setError('Phiên đăng nhập hết hạn');
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
      const before = container?.scrollHeight || 0;
      const data = await getMoreMessages(conversation._id, nextCursor, 19);
      setMessages(prev => [...data.messages, ...prev]);
      setNextCursor(data.nextCursor);
      setHasMore(data.hasMore);
      requestAnimationFrame(() => {
        if (container) container.scrollTop = container.scrollHeight - before;
      });
    } catch (err) {
      console.error('Load more failed:', err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // ── Message actions ──────────────────────────────────────────────────────
  const handleSendMessage = async () => {
    const content = inputMessage.trim();
    if (!content) return;
    setIsSending(true);
    try {
      await sendMessageWithReply(conversation._id, content, replyTo?._id || null, mentionIds.length > 0 ? mentionIds : null);
      setInputMessage('');
      setReplyTo(null);
      setMentionIds([]);
      socketService.stopTyping(conversation._id);
    } catch {
      alert('Không thể gửi tin nhắn. Vui lòng thử lại!');
    } finally {
      setIsSending(false);
    }
  };

  const handleAddReaction = async (messageId, emoji) => {
    try { await addReaction(conversation._id, messageId, emoji); } catch {}
  };

  const handleRemoveReaction = async (messageId, emoji) => {
    try { await removeReaction(conversation._id, messageId, emoji); } catch {}
  };

  const handleReply = (msg) => { setReplyTo(msg); inputRef.current?.focus(); };
  const handleEdit = (msg) => setEditingMessage(msg);
  const handleDelete = (msg) => setDeletingMessage(msg);
  const handleForward = (msg) => setForwardingMessage(msg);
  const handleCopy = (msg) => { if (msg.content) navigator.clipboard.writeText(msg.content); };

  const handleEditSubmit = async (messageId, newContent) => {
    try { await editMessageAPI(conversation._id, messageId, newContent); setEditingMessage(null); }
    catch (err) { alert(err.message || 'Không thể sửa tin nhắn'); }
  };

  const handleDeleteConfirm = async (messageId, scope) => {
    try { await deleteMessageAPI(conversation._id, messageId, scope); setDeletingMessage(null); }
    catch (err) { alert(err.message || 'Không thể xóa tin nhắn'); }
  };

  const handleForwardSubmit = async (messageId, targetIds) => {
    try {
      await forwardMessageAPI(conversation._id, messageId, targetIds);
      setForwardingMessage(null);
      alert('Đã chuyển tiếp tin nhắn thành công!');
    } catch (err) { alert(err.message || 'Không thể chuyển tiếp'); }
  };

  const handleContextMenu = (e, msg) => { e.preventDefault(); setContextMenu({ x: e.clientX, y: e.clientY, message: msg }); };

  const handlePinMessage = async (messageId) => {
    try { await pinMessage(conversation._id, messageId); }
    catch (err) { alert(err.message || 'Không thể ghim tin nhắn'); }
  };

  const handleUnpinMessage = async (messageId) => {
    try { await unpinMessage(conversation._id, messageId); }
    catch (err) { alert(err.message || 'Không thể bỏ ghim'); }
  };

  const handleJumpToMessage = (msg) => {
    setShowSearch(false);
    const el = document.getElementById(`message-${msg._id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.style.backgroundColor = '#fef3c7';
      setTimeout(() => { el.style.backgroundColor = ''; }, 2000);
    } else {
      alert('Tin nhắn không tìm thấy, cuộn lên để tải thêm.');
    }
  };

  // ── Upload handlers ──────────────────────────────────────────────────────
  const handleFileUpload = async (files) => {
    setIsUploading(true); setUploadProgress(0);
    setUploadingFileName(files.length > 1 ? `${files.length} files` : files[0].name);
    try { await uploadFiles(conversation._id, files, replyTo?._id || null, p => setUploadProgress(p)); setIsFileUploadOpen(false); setReplyTo(null); }
    catch (err) { alert(err.message || 'Upload thất bại'); }
    finally { setIsUploading(false); setUploadProgress(0); setUploadingFileName(''); }
  };

  const handleMediaUpload = async (files) => {
    setIsUploading(true); setUploadProgress(0);
    setUploadingFileName(files.length > 1 ? `${files.length} files` : files[0].name);
    try { await uploadMedia(conversation._id, files, replyTo?._id || null, p => setUploadProgress(p)); setIsMediaUploadOpen(false); setReplyTo(null); }
    catch (err) { alert(err.message || 'Upload thất bại'); }
    finally { setIsUploading(false); setUploadProgress(0); setUploadingFileName(''); }
  };

  const handleVoiceUpload = async (audioBlob) => {
    setIsUploading(true); setUploadProgress(0); setUploadingFileName('Voice message');
    try {
      const file = new File([audioBlob], 'voice-message.mp3', { type: 'audio/mpeg' });
      await uploadVoice(conversation._id, file, replyTo?._id || null, p => setUploadProgress(p));
      setIsVoiceRecording(false); setReplyTo(null);
    } catch (err) { alert(err.message || 'Upload thất bại'); }
    finally { setIsUploading(false); setUploadProgress(0); setUploadingFileName(''); }
  };

  const handleInputChange = (text, ids) => {
    setInputMessage(text);
    if (ids !== undefined) setMentionIds(ids);
    if (text.trim()) {
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

  // ── Render ───────────────────────────────────────────────────────────────
  if (!localConversation) return null;

  const name = getConversationName(localConversation);
  const status = getConversationStatus(localConversation);
  const avatar = getConversationAvatar(localConversation);
  const visibleMessages = messages.filter(msg => {
    if (msg.type === 'system') return true; // System messages luôn hiển thị
    return !msg.deletedFor?.includes(currentUserId);
  });
  const existingMemberIds = localConversation.participants?.map(p =>
    typeof p.userId === 'string' ? p.userId : p.userId?._id
  ).filter(Boolean) || [];

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          {onBack && (
            <button onClick={onBack} style={backBtnStyle}><ArrowLeft size={22} /></button>
          )}
          <div style={styles.avatarContainer}>
            {avatar ? (
              <img src={avatar} alt="" style={styles.avatar} />
            ) : isGroup ? (
              <div style={{ ...styles.avatarPlaceholder, background: 'linear-gradient(135deg,#667eea,#764ba2)' }}>
                <Users size={20} color="white" />
              </div>
            ) : (
              <div style={styles.avatarPlaceholder}><User size={20} color="#9ca3af" /></div>
            )}
            {!isGroup && status === 'online' && <div style={styles.onlineIndicator} />}
          </div>
          <div style={styles.userInfo}>
            <h3 style={styles.userName}>{name}</h3>
            <p style={{ ...styles.userStatus, color: status === 'online' ? '#10b981' : '#6b7280' }}>
              {isGroup
                ? `${localConversation.participants?.length || 0} thành viên`
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

      {/* Announcement Banner — chỉ hiện với group */}
      {isGroup && showAnnouncement && (
        <AnnouncementBanner
          conversationId={conversation._id}
          isAdminOrOwner={(() => {
            const me = localConversation?.participants?.find(p => {
              const uid = typeof p.userId === 'string' ? p.userId : p.userId?._id;
              return uid === currentUserId;
            });
            return me?.role === 'admin' || me?.role === 'owner';
          })()}
          onClose={() => setShowAnnouncement(false)}
        />
      )}

      {/* Pinned */}
      {pinnedMessages.length > 0 && (
        <PinnedMessages pinnedMessages={pinnedMessages} onUnpin={handleUnpinMessage} onMessageClick={handleJumpToMessage} currentUserId={currentUserId} />
      )}

      {/* Messages */}
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
            {!hasMore && messages.length >= 19 && (
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
                    {message.type === 'system' ? (
                      <SystemMessage message={message} />
                    ) : (
                      <MessageBubble
                        message={message}
                        isOwn={(typeof message.senderId === 'string' ? message.senderId : message.senderId?._id) === currentUserId}
                        showAvatar={(() => {
                          if (index === 0) return true;
                          const prev = visibleMessages[index - 1];
                          if (prev.type === 'system') return true;
                          const prevId = typeof prev.senderId === 'string' ? prev.senderId : prev.senderId?._id;
                          const curId = typeof message.senderId === 'string' ? message.senderId : message.senderId?._id;
                          return prevId !== curId;
                        })()}
                        isLastMessage={false}
                        seenAvatars={(() => {
                          const msgSenderId = typeof message.senderId === 'string' ? message.senderId : message.senderId?._id;
                          if (msgSenderId !== currentUserId) return [];
                          // seenBy entries từ initial load có _id, từ socket có thể không có _id
                          return (message.seenBy || []).filter(sb => {
                            const id = typeof sb === 'string' ? sb : sb?._id;
                            // Nếu có _id → filter chính mình
                            if (id) return id !== currentUserId;
                            // Không có _id (từ socket) → luôn hiện (là người khác)
                            return true;
                          });
                        })()}
                        onContextMenu={handleContextMenu}
                        onAddReaction={handleAddReaction}
                        onRemoveReaction={handleRemoveReaction}
                      />
                    )}
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

      {/* Reply preview */}
      {replyTo && <ReplyPreview replyToMessage={replyTo} onCancel={() => setReplyTo(null)} />}

      {/* Input */}
      <div style={styles.inputContainer}>
        <UploadButton onFileClick={() => setIsFileUploadOpen(true)} onMediaClick={() => setIsMediaUploadOpen(true)} onVoiceClick={() => setIsVoiceRecording(true)} />
        {isGroup ? (
          <MentionInput
            inputRef={inputRef}
            value={inputMessage}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            participants={localConversation?.participants || []}
            currentUserId={currentUserId}
            disabled={isSending}
            style={styles.input}
            placeholder="Nhập tin nhắn... (@mention)"
          />
        ) : (
          <input ref={inputRef} type="text" placeholder="Nhập tin nhắn..." value={inputMessage}
            onChange={e => handleInputChange(e.target.value)}
            onKeyPress={handleKeyPress} style={styles.input} disabled={isSending} />
        )}
        <button onClick={handleSendMessage} disabled={!inputMessage.trim() || isSending}
          style={{ ...styles.sendButton, ...((!inputMessage.trim() || isSending) ? styles.sendButtonDisabled : {}) }}>
          {isSending ? <span style={styles.spinner}>⟳</span> : <Send size={20} />}
        </button>
      </div>

      {/* Modals */}
      {contextMenu && (
        <MessageContextMenu position={{ x: contextMenu.x, y: contextMenu.y }} message={contextMenu.message}
          isOwn={(typeof contextMenu.message.senderId === 'string' ? contextMenu.message.senderId : contextMenu.message.senderId?._id) === currentUserId}
          onClose={() => setContextMenu(null)} onReply={handleReply} onEdit={handleEdit}
          onDelete={handleDelete} onCopy={handleCopy} onForward={handleForward}
          onPin={handlePinMessage} onUnpin={handleUnpinMessage} isPinned={contextMenu.message.isPinned} />
      )}
      {editingMessage && <EditMessageModal message={editingMessage} onClose={() => setEditingMessage(null)} onSubmit={handleEditSubmit} />}
      {deletingMessage && <DeleteMessageModal message={deletingMessage} onClose={() => setDeletingMessage(null)} onConfirm={handleDeleteConfirm} />}
      {forwardingMessage && <ForwardMessageModal message={forwardingMessage} onClose={() => setForwardingMessage(null)} onSubmit={handleForwardSubmit} />}
      {isFileUploadOpen && <FileUpload onFilesSelected={handleFileUpload} onClose={() => setIsFileUploadOpen(false)} />}
      {isMediaUploadOpen && <MediaUpload onFilesSelected={handleMediaUpload} onClose={() => setIsMediaUploadOpen(false)} />}
      {isVoiceRecording && <VoiceRecorder onRecordingComplete={handleVoiceUpload} onCancel={() => setIsVoiceRecording(false)} />}
      {isUploading && <UploadProgress progress={uploadProgress} fileName={uploadingFileName} />}
      {showSearch && <MessageSearch conversationId={conversation._id} onResultClick={handleJumpToMessage} onClose={() => setShowSearch(false)} />}

      {/* Group Info — giữ nguyên khi action, chỉ đóng khi close/leave */}
      {showGroupInfo && (
        <GroupInfo
          conversation={localConversation}
          onClose={() => setShowGroupInfo(false)}
          onConversationUpdate={(updated) => {
            onConversationUpdate?.(updated);
            // KHÔNG đóng panel
          }}
          onLeave={() => {
            setShowGroupInfo(false);
            onConversationUpdate?.(null);
          }}
          reloadRef={groupInfoReloadRef}
        />
      )}

      {/* Add Members */}
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
  color: '#6b7280', padding: '4px 8px 4px 0', display: 'flex', alignItems: 'center', flexShrink: 0,
};