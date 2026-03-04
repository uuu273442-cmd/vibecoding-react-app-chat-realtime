// Đường dẫn: src/services/socketService.js

import { io } from 'socket.io-client';
import { getAccessToken } from './authService';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3000';

class SocketService {
  constructor() {
    this.socket = null;
    this._pendingListeners = [];
    this._currentToken = null;
  }

  connect() {
    const token = getAccessToken();
    if (!token) {
      console.error('[Socket] No token — not connecting');
      return;
    }

    // Nếu đang connected với cùng token → skip
    if (this.socket?.connected && this._currentToken === token) return;

    // Nếu có socket cũ (user khác hoặc stale) → disconnect sạch trước
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }

    this._currentToken = token;

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket.id);
      // Flush pending listeners
      this._pendingListeners.forEach(({ event, cb }) => {
        this.socket.on(event, cb);
      });
      this._pendingListeners = [];
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (err) => {
      console.error('[Socket] connect_error:', err.message);
    });
  }

  // Gọi khi logout — xóa HOÀN TOÀN, không để lại gì
  disconnect() {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
    this._pendingListeners = [];
    this._currentToken = null;
    console.log('[Socket] Fully disconnected');
  }

  isConnected() {
    return this.socket?.connected || false;
  }

  // ── Rooms ──────────────────────────────────────────────────────────────
  joinConversation(conversationId) {
    this.socket?.emit('join_conversation', { conversationId });
  }

  leaveConversation(conversationId) {
    this.socket?.emit('leave_conversation', { conversationId });
  }

  // ── Typing ─────────────────────────────────────────────────────────────
  startTyping(conversationId) {
    this.socket?.emit('typing_start', { conversationId });
  }

  stopTyping(conversationId) {
    this.socket?.emit('typing_stop', { conversationId });
  }

  // ── Generic on/off ─────────────────────────────────────────────────────
  on(event, callback) {
    if (!this.socket || !this.socket.connected) {
      // Queue lại — sẽ flush khi socket connect xong
      this._pendingListeners.push({ event, cb: callback });
      return;
    }
    this.socket.on(event, callback);
  }

  off(event, callback) {
    // Xóa khỏi pending
    this._pendingListeners = this._pendingListeners.filter(
      p => !(p.event === event && p.cb === callback)
    );
    this.socket?.off(event, callback);
  }

  removeAllListeners(event) {
    this._pendingListeners = this._pendingListeners.filter(p => p.event !== event);
    this.socket?.removeAllListeners(event);
  }

  // ── Friends ────────────────────────────────────────────────────────────
  onFriendRequestReceived(cb)  { this.on('friend_request_received', cb); }
  onFriendRequestAccepted(cb)  { this.on('friend_request_accepted', cb); }
  onFriendRequestRejected(cb)  { this.on('friend_request_rejected', cb); }
  offFriendRequestReceived(cb) { this.off('friend_request_received', cb); }
  offFriendRequestAccepted(cb) { this.off('friend_request_accepted', cb); }
  offFriendRequestRejected(cb) { this.off('friend_request_rejected', cb); }

  // ── Group (user room) ──────────────────────────────────────────────────
  onGroupCreated(cb)        { this.on('group_created', cb); }
  offGroupCreated(cb)       { this.off('group_created', cb); }
  onGroupAdded(cb)          { this.on('group_added', cb); }
  offGroupAdded(cb)         { this.off('group_added', cb); }
  onGroupRemoved(cb)        { this.on('group_removed', cb); }
  offGroupRemoved(cb)       { this.off('group_removed', cb); }
  onGroupLeftSelf(cb)       { this.on('group_left_self', cb); }
  offGroupLeftSelf(cb)      { this.off('group_left_self', cb); }
  onGroupRequestAdded(cb)   { this.on('group_request_added', cb); }
  offGroupRequestAdded(cb)  { this.off('group_request_added', cb); }

  // ── Group (conversation room) ──────────────────────────────────────────
  onGroupMemberAdded(cb)    { this.on('group_member_added', cb); }
  offGroupMemberAdded(cb)   { this.off('group_member_added', cb); }
  onGroupMemberRemoved(cb)  { this.on('group_member_removed', cb); }
  offGroupMemberRemoved(cb) { this.off('group_member_removed', cb); }
  onGroupMemberLeft(cb)     { this.on('group_member_left', cb); }
  offGroupMemberLeft(cb)    { this.off('group_member_left', cb); }
  onGroupRoleChanged(cb)    { this.on('group_role_changed', cb); }
  offGroupRoleChanged(cb)   { this.off('group_role_changed', cb); }
  onGroupJoinRequested(cb)  { this.on('group_join_requested', cb); }
  offGroupJoinRequested(cb) { this.off('group_join_requested', cb); }
  onGroupRequestHandled(cb) { this.on('group_request_handled', cb); }
  offGroupRequestHandled(cb){ this.off('group_request_handled', cb); }

  // ── Announcement ───────────────────────────────────────────────────────
  onAnnouncementCreated(cb)  { this.on('announcement_created', cb); }
  offAnnouncementCreated(cb) { this.off('announcement_created', cb); }
}

export default new SocketService();