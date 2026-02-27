// Đường dẫn: src/services/socketService.js
// UPDATED: Phase 2 - Group Chat realtime events + preserve all original methods

import { io } from 'socket.io-client';
import { getAccessToken } from './authService';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3000';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect() {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    const token = getAccessToken();
    if (!token) {
      console.error('No access token found');
      return;
    }

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
      console.log('Socket disconnected');
    }
  }

  isConnected() {
    return this.socket?.connected || false;
  }

  // ── Conversation rooms ──────────────────────────────────────────────────

  joinConversation(conversationId) {
    if (!this.socket) return;
    console.log('📥 Joining conversation:', conversationId);
    this.socket.emit('join_conversation', { conversationId });
  }

  leaveConversation(conversationId) {
    if (!this.socket) return;
    console.log('📤 Leaving conversation:', conversationId);
    this.socket.emit('leave_conversation', { conversationId });
  }

  // ── Typing ──────────────────────────────────────────────────────────────

  startTyping(conversationId) {
    this.socket?.emit('typing_start', { conversationId });
  }

  stopTyping(conversationId) {
    this.socket?.emit('typing_stop', { conversationId });
  }

  // ── Friends (original methods — preserved) ──────────────────────────────

  onFriendRequestReceived(callback)  { this.on('friend_request_received', callback); }
  onFriendRequestAccepted(callback)  { this.on('friend_request_accepted', callback); }
  onFriendRequestRejected(callback)  { this.on('friend_request_rejected', callback); }

  offFriendRequestReceived(callback) { this.off('friend_request_received', callback); }
  offFriendRequestAccepted(callback) { this.off('friend_request_accepted', callback); }
  offFriendRequestRejected(callback) { this.off('friend_request_rejected', callback); }

  // ── Group events (Phase 2) ──────────────────────────────────────────────

  // user room — nhóm mới tạo
  onGroupCreated(callback)        { this.on('group_created', callback); }
  offGroupCreated(callback)       { this.off('group_created', callback); }

  // user room — được admin add vào nhóm có sẵn
  onGroupAdded(callback)          { this.on('group_added', callback); }
  offGroupAdded(callback)         { this.off('group_added', callback); }

  // user room — bị xóa khỏi nhóm
  onGroupRemoved(callback)        { this.on('group_removed', callback); }
  offGroupRemoved(callback)       { this.off('group_removed', callback); }

  // user room — tự rời nhóm (self-confirm)
  onGroupLeftSelf(callback)       { this.on('group_left_self', callback); }
  offGroupLeftSelf(callback)      { this.off('group_left_self', callback); }

  // user room — request được accept → thêm group vào sidebar
  onGroupRequestAdded(callback)   { this.on('group_request_added', callback); }
  offGroupRequestAdded(callback)  { this.off('group_request_added', callback); }

  // conversation room — có người được thêm vào
  onGroupMemberAdded(callback)    { this.on('group_member_added', callback); }
  offGroupMemberAdded(callback)   { this.off('group_member_added', callback); }

  // conversation room — có người bị xóa
  onGroupMemberRemoved(callback)  { this.on('group_member_removed', callback); }
  offGroupMemberRemoved(callback) { this.off('group_member_removed', callback); }

  // conversation room — có người tự rời
  onGroupMemberLeft(callback)     { this.on('group_member_left', callback); }
  offGroupMemberLeft(callback)    { this.off('group_member_left', callback); }

  // conversation room — role thay đổi
  onGroupRoleChanged(callback)    { this.on('group_role_changed', callback); }
  offGroupRoleChanged(callback)   { this.off('group_role_changed', callback); }

  // conversation room — admin/owner nhận request mới
  onGroupJoinRequested(callback)  { this.on('group_join_requested', callback); }
  offGroupJoinRequested(callback) { this.off('group_join_requested', callback); }

  // conversation room — request được xử lý
  onGroupRequestHandled(callback) { this.on('group_request_handled', callback); }
  offGroupRequestHandled(callback){ this.off('group_request_handled', callback); }

  // ── Generic ─────────────────────────────────────────────────────────────

  on(event, callback) {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event).push(callback);
    this.socket.on(event, callback);
  }

  off(event, callback) {
    if (!this.socket) return;
    this.socket.off(event, callback);
    if (this.listeners.has(event)) {
      const cbs = this.listeners.get(event);
      const idx = cbs.indexOf(callback);
      if (idx > -1) cbs.splice(idx, 1);
    }
  }

  removeAllListeners(event) {
    if (!this.socket) return;
    this.socket.removeAllListeners(event);
    this.listeners.delete(event);
  }
}

export default new SocketService();