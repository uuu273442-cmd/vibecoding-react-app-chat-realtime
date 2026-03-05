// Đường dẫn: src/components/ToastNotification.jsx
// Global toast — mount một lần ở MainLayout, lắng nghe tất cả socket events

import React, { useState, useEffect, useCallback } from 'react';
import { UserPlus, UserCheck, UserX, Users, LogOut, Shield, Bell, X, AtSign } from 'lucide-react';
import socketService from '../services/socketService';
import { getCurrentUserId } from '../utils/chatHelpers';
import { getActiveConversationId } from '../services/activeConversation';

// ── Hook ─────────────────────────────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, ...toast }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, toast.duration || 5000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
}

// ── Config ────────────────────────────────────────────────────────────────────
const CONFIG = {
  friend_request:  { icon: UserPlus,  bg: '#eff6ff', border: '#3b82f6', text: '#1e40af' },
  friend_accepted: { icon: UserCheck, bg: '#f0fdf4', border: '#16a34a', text: '#166534' },
  friend_rejected: { icon: UserX,     bg: '#fef2f2', border: '#dc2626', text: '#991b1b' },
  group_created:   { icon: Users,     bg: '#faf5ff', border: '#7c3aed', text: '#5b21b6' },
  group_added:     { icon: UserPlus,  bg: '#f0fdf4', border: '#16a34a', text: '#166534' },
  group_removed:   { icon: UserX,     bg: '#fef2f2', border: '#dc2626', text: '#991b1b' },
  group_role:      { icon: Shield,    bg: '#eff6ff', border: '#3b82f6', text: '#1e40af' },
  group_request:   { icon: Bell,      bg: '#fffbeb', border: '#d97706', text: '#92400e' },
  mention:         { icon: AtSign,    bg: '#faf5ff', border: '#7c3aed', text: '#5b21b6' },
  default:         { icon: Bell,      bg: '#f9fafb', border: '#6b7280', text: '#374151' },
};

// ── Single Toast ──────────────────────────────────────────────────────────────
function Toast({ toast, onRemove, onNavigate }) {
  const cfg = CONFIG[toast.type] || CONFIG.default;
  const Icon = cfg.icon;

  return (
    <div
      onClick={() => { toast.onAction?.(); onNavigate?.(toast.path); onRemove(toast.id); }}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 10,
        padding: '12px 14px',
        backgroundColor: cfg.bg,
        borderLeft: `4px solid ${cfg.border}`,
        borderRadius: 10,
        boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
        cursor: toast.path ? 'pointer' : 'default',
        minWidth: 280, maxWidth: 340,
        animation: 'toastIn 0.25s ease',
      }}
    >
      <div style={{
        width: 34, height: 34, borderRadius: 8, flexShrink: 0,
        backgroundColor: cfg.border + '22',
        color: cfg.border,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={17} />
      </div>
      <div style={{ flex: 1, minWidth: 0, paddingTop: 1 }}>
        {toast.title && (
          <p style={{ fontSize: 13, fontWeight: 700, color: cfg.text, margin: '0 0 2px' }}>
            {toast.title}
          </p>
        )}
        <p style={{ fontSize: 13, color: cfg.text, margin: 0, opacity: 0.85, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {toast.message}
        </p>
      </div>
      <button
        onClick={e => { e.stopPropagation(); onRemove(toast.id); }}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: cfg.text, padding: 2, opacity: 0.5, display: 'flex', flexShrink: 0 }}
      >
        <X size={14} />
      </button>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ToastNotification({ onNavigate }) {
  const { toasts, addToast, removeToast } = useToast();
  const currentUserId = getCurrentUserId();

  useEffect(() => {
    if (!currentUserId) return; // Chưa đăng nhập

    // ── Friend events (user room) ─────────────────────────────────────────
    // payload: { request: { _id, from: "userId_string", to: {_id,name,avatar}, message, status } }
    // QUAN TRỌNG: request.from là string ID, không có name
    // Người nhận event này = req.to → người gửi request = from (chỉ có ID)
    // BE cần populate from hoặc FE dùng "Ai đó" làm fallback
    const onFriendRequest = (data) => {
      if (!data?.request) return;
      const { request } = data;
      // request.from là string ID → không có name
      // Nếu BE populate thành object thì dùng from.name, fallback "Người dùng mới"
      const senderName = typeof request.from === 'object'
        ? (request.from.name || 'Ai đó')
        : 'Ai đó'; // BE chưa populate from
      addToast({
        type: 'friend_request',
        title: 'Lời mời kết bạn',
        message: `${senderName} đã gửi lời mời kết bạn`,
        path: '/friends',
      });
    };

    // payload: { friend: { _id, name, avatar }, conversationId }
    const onFriendAccepted = (data) => {
      if (!data?.friend) return;
      addToast({
        type: 'friend_accepted',
        title: 'Kết bạn thành công',
        message: `${data.friend.name || 'Ai đó'} đã chấp nhận lời mời kết bạn`,
        path: '/chat',
      });
    };

    // payload: { rejectedBy: { _id, name } } (nếu BE có emit)
    const onFriendRejected = (data) => {
      addToast({
        type: 'friend_rejected',
        title: 'Lời mời bị từ chối',
        message: `${data?.rejectedBy?.name || 'Ai đó'} đã từ chối lời mời kết bạn`,
      });
    };

    // ── Group events (user room) ──────────────────────────────────────────
    // payload: { conversation, createdBy: { _id, name } }
    const onGroupCreated = (data) => {
      if (!data?.conversation) return;
      addToast({
        type: 'group_created',
        title: 'Nhóm mới',
        message: `${data.createdBy?.name || 'Ai đó'} đã tạo nhóm "${data.conversation.name}"`,
        path: '/chat',
      });
    };

    // payload: { conversationId, addedUsers, addedBy, conversation }
    const onGroupAdded = (data) => {
      if (!data?.conversation) return;
      addToast({
        type: 'group_added',
        title: 'Được thêm vào nhóm',
        message: `${data.addedBy?.name || 'Ai đó'} đã thêm bạn vào nhóm "${data.conversation.name}"`,
        path: '/chat',
      });
    };

    // payload: { conversationId, removedUserIds, removedBy, conversation }
    const onGroupRemoved = (data) => {
      addToast({
        type: 'group_removed',
        title: 'Bị xóa khỏi nhóm',
        message: `${data?.removedBy?.name || 'Quản trị viên'} đã xóa bạn khỏi nhóm`,
      });
    };

    // payload: { conversationId, leftUser, conversation } — tự rời, silent
    const onGroupLeftSelf = (_data) => {};

    // payload: { conversationId, targetUser, changedBy, newRole, conversation }
    const onGroupRoleChanged = (data) => {
      if (!data?.targetUser || data.targetUser._id !== currentUserId) return;
      const roleLabel = data.newRole === 'admin' ? 'Quản trị viên' : 'Thành viên';
      addToast({
        type: 'group_role',
        title: 'Thay đổi vai trò',
        message: `Bạn đã được ${data.newRole === 'admin' ? 'thăng lên' : 'hạ xuống'} ${roleLabel} trong "${data.conversation?.name || 'nhóm'}"`,
        path: '/chat',
      });
    };

    // payload: { conversationId, request } — chỉ admin/owner nhận
    const onGroupJoinRequested = (data) => {
      if (!data?.request) return;
      addToast({
        type: 'group_request',
        title: 'Yêu cầu tham gia nhóm',
        message: `${data.request.actor?.name || 'Ai đó'} muốn thêm người vào nhóm`,
        duration: 7000,
        path: '/chat',
      });
    };

    // payload: { conversationId, requestId, action, handledBy, conversation }
    const onGroupRequestAdded = (data) => {
      if (!data?.conversation) return;
      addToast({
        type: 'group_added',
        title: 'Yêu cầu được chấp nhận',
        message: `Bạn đã được thêm vào nhóm "${data.conversation.name}"`,
        path: '/chat',
      });
    };

    // payload: { message, conversation: conversationId, mentions: [userId,...] }
    const onMentionReceived = (data) => {
      if (!data?.message) return;
      const convId = data.conversation;

      // Nếu user đang mở đúng conversation được mention → KHÔNG toast
      // (message đã hiển thị trực tiếp trên màn hình)
      if (convId && convId === getActiveConversationId()) return;

      const senderName = data.message.senderId?.name || 'Ai đó';
      const preview = data.message.content?.slice(0, 60) || '';
      addToast({
        type: 'mention',
        title: `${senderName} đã nhắc đến bạn`,
        message: preview || '...',
        path: '/chat',
        duration: 6000,
      });
    };

    socketService.on('friend_request_received', onFriendRequest);
    socketService.on('friend_request_accepted', onFriendAccepted);
    socketService.on('friend_request_rejected', onFriendRejected);
    socketService.on('group_created', onGroupCreated);
    socketService.on('group_added', onGroupAdded);
    socketService.on('group_removed', onGroupRemoved);
    socketService.on('group_left_self', onGroupLeftSelf);
    socketService.on('group_role_changed', onGroupRoleChanged);
    socketService.on('group_join_requested', onGroupJoinRequested);
    socketService.on('group_request_added', onGroupRequestAdded);
    socketService.on('mention_received', onMentionReceived);

    return () => {
      socketService.off('friend_request_received', onFriendRequest);
      socketService.off('friend_request_accepted', onFriendAccepted);
      socketService.off('friend_request_rejected', onFriendRejected);
      socketService.off('group_created', onGroupCreated);
      socketService.off('group_added', onGroupAdded);
      socketService.off('group_removed', onGroupRemoved);
      socketService.off('group_left_self', onGroupLeftSelf);
      socketService.off('group_role_changed', onGroupRoleChanged);
      socketService.off('group_join_requested', onGroupJoinRequested);
      socketService.off('group_request_added', onGroupRequestAdded);
      socketService.off('mention_received', onMentionReceived);
    };
  }, [currentUserId, addToast]);

  if (toasts.length === 0) return null;

  return (
    <>
      <style>{`
        @keyframes toastIn {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);   opacity: 1; }
        }
      `}</style>
      <div style={{
        position: 'fixed', bottom: 24, right: 24,
        display: 'flex', flexDirection: 'column-reverse', gap: 10,
        zIndex: 99999, pointerEvents: 'none',
      }}>
        {toasts.map(toast => (
          <div key={toast.id} style={{ pointerEvents: 'auto' }}>
            <Toast toast={toast} onRemove={removeToast} onNavigate={onNavigate} />
          </div>
        ))}
      </div>
    </>
  );
}