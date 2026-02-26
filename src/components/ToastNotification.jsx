// Đường dẫn: src/components/ToastNotification.jsx
// UPDATED: Phase 2 - group events notifications

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { UserPlus, UserCheck, UserX, Users, LogOut, Shield, Bell, X } from 'lucide-react';
import socketService from '../services/socketService';
import { getCurrentUserId } from '../utils/chatHelpers';

// ── Toast hook ────────────────────────────────────────────────────────────────
export const useToast = () => {
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
};

// ── Icon map ──────────────────────────────────────────────────────────────────
const ICONS = {
  friend_request:   <UserPlus  size={18} />,
  friend_accepted:  <UserCheck size={18} />,
  friend_rejected:  <UserX    size={18} />,
  group_created:    <Users    size={18} />,
  group_added:      <UserPlus  size={18} />,
  group_removed:    <UserX    size={18} />,
  group_left:       <LogOut   size={18} />,
  group_role:       <Shield   size={18} />,
  group_request:    <Bell     size={18} />,
  default:          <Bell     size={18} />,
};

const COLORS = {
  friend_request:   { bg: '#eff6ff', border: '#bfdbfe', icon: '#3b82f6', text: '#1e40af' },
  friend_accepted:  { bg: '#f0fdf4', border: '#bbf7d0', icon: '#16a34a', text: '#166534' },
  friend_rejected:  { bg: '#fef2f2', border: '#fecaca', icon: '#dc2626', text: '#991b1b' },
  group_created:    { bg: '#faf5ff', border: '#e9d5ff', icon: '#7c3aed', text: '#5b21b6' },
  group_added:      { bg: '#f0fdf4', border: '#bbf7d0', icon: '#16a34a', text: '#166534' },
  group_removed:    { bg: '#fef2f2', border: '#fecaca', icon: '#dc2626', text: '#991b1b' },
  group_left:       { bg: '#fff7ed', border: '#fed7aa', icon: '#ea580c', text: '#9a3412' },
  group_role:       { bg: '#eff6ff', border: '#bfdbfe', icon: '#3b82f6', text: '#1e40af' },
  group_request:    { bg: '#fffbeb', border: '#fde68a', icon: '#d97706', text: '#92400e' },
  default:          { bg: '#f9fafb', border: '#e5e7eb', icon: '#6b7280', text: '#374151' },
};

// ── Single Toast ──────────────────────────────────────────────────────────────
function Toast({ toast, onRemove, onNavigate }) {
  const color = COLORS[toast.type] || COLORS.default;
  const icon = ICONS[toast.type] || ICONS.default;

  return (
    <div
      onClick={() => { toast.onClick?.(); onNavigate?.(); onRemove(toast.id); }}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 12,
        padding: '12px 14px',
        backgroundColor: color.bg,
        border: `1px solid ${color.border}`,
        borderRadius: 12,
        boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
        cursor: toast.onClick ? 'pointer' : 'default',
        minWidth: 280, maxWidth: 340,
        animation: 'slideIn 0.25s ease',
        position: 'relative',
      }}
    >
      <div style={{
        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
        backgroundColor: color.border,
        color: color.icon,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        {toast.title && (
          <p style={{ fontSize: 13, fontWeight: 700, color: color.text, margin: '0 0 2px' }}>
            {toast.title}
          </p>
        )}
        <p style={{ fontSize: 13, color: color.text, margin: 0, opacity: 0.85 }}>
          {toast.message}
        </p>
      </div>
      <button
        onClick={e => { e.stopPropagation(); onRemove(toast.id); }}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: color.icon, padding: 2, display: 'flex', flexShrink: 0 }}
      >
        <X size={14} />
      </button>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ToastNotification({ onNavigate }) {
  const { toasts, addToast, removeToast } = useToast();
  const currentUserId = getCurrentUserId();

  useEffect(() => {
    // ── Friend events ──────────────────────────────────────────────────────
    const handleFriendRequest = (data) => {
      addToast({
        type: 'friend_request',
        title: 'Lời mời kết bạn',
        message: `${data.from?.name || 'Ai đó'} đã gửi lời mời kết bạn`,
        onClick: () => onNavigate?.('/friends'),
      });
    };

    const handleFriendAccepted = (data) => {
      addToast({
        type: 'friend_accepted',
        title: 'Kết bạn thành công',
        message: `${data.user?.name || 'Ai đó'} đã chấp nhận lời mời kết bạn`,
        onClick: () => onNavigate?.('/friends'),
      });
    };

    const handleFriendRejected = (data) => {
      addToast({
        type: 'friend_rejected',
        title: 'Lời mời bị từ chối',
        message: `${data.rejectedBy?.name || 'Ai đó'} đã từ chối lời mời kết bạn`,
      });
    };

    // ── Group events ───────────────────────────────────────────────────────
    const handleGroupCreated = (data) => {
      const { conversation, createdBy } = data;
      if (!conversation) return;
      addToast({
        type: 'group_created',
        title: 'Nhóm mới',
        message: `${createdBy?.name || 'Ai đó'} đã thêm bạn vào nhóm "${conversation.name}"`,
        onClick: () => onNavigate?.('/chat', conversation),
      });
    };

    const handleGroupAdded = (data) => {
      const { conversation, addedBy } = data;
      if (!conversation) return;
      addToast({
        type: 'group_added',
        title: 'Được thêm vào nhóm',
        message: `${addedBy?.name || 'Ai đó'} đã thêm bạn vào nhóm "${conversation.name}"`,
        onClick: () => onNavigate?.('/chat', conversation),
      });
    };

    const handleGroupRemoved = (data) => {
      const { conversationId, removedBy } = data;
      addToast({
        type: 'group_removed',
        title: 'Bị xóa khỏi nhóm',
        message: `${removedBy?.name || 'Quản trị viên'} đã xóa bạn khỏi nhóm`,
      });
    };

    const handleGroupLeftSelf = (data) => {
      // Silent — user tự rời, không cần toast
    };

    const handleGroupRoleChanged = (data) => {
      const { targetUser, newRole, changedBy, conversation: conv } = data;
      if (!targetUser || targetUser._id !== currentUserId) return;
      const roleLabel = newRole === 'admin' ? 'Quản trị viên' : 'Thành viên';
      addToast({
        type: 'group_role',
        title: 'Thay đổi vai trò',
        message: `Bạn đã được ${newRole === 'admin' ? 'thăng lên' : 'hạ xuống'} ${roleLabel} trong nhóm "${conv?.name || ''}"`,
        onClick: () => onNavigate?.('/chat', conv),
      });
    };

    const handleGroupJoinRequested = (data) => {
      if (!data?.request) return;
      const { request } = data;
      addToast({
        type: 'group_request',
        title: 'Yêu cầu tham gia nhóm',
        message: `${request.actor?.name || 'Ai đó'} muốn thêm ${request.userId?.name || 'người dùng'} vào nhóm`,
        duration: 7000,
      });
    };

    const handleGroupRequestAdded = (data) => {
      if (!data?.conversation) return;
      const { conversation: conv } = data;
      addToast({
        type: 'group_added',
        title: 'Yêu cầu được chấp nhận',
        message: `Bạn đã được thêm vào nhóm "${conv.name}"`,
        onClick: () => onNavigate?.('/chat', conv),
      });
    };

    socketService.on('friend_request_received', handleFriendRequest);
    socketService.on('friend_request_accepted', handleFriendAccepted);
    socketService.on('friend_request_rejected', handleFriendRejected);
    socketService.on('group_created', handleGroupCreated);
    socketService.on('group_added', handleGroupAdded);
    socketService.on('group_removed', handleGroupRemoved);
    socketService.on('group_left_self', handleGroupLeftSelf);
    socketService.on('group_role_changed', handleGroupRoleChanged);
    socketService.on('group_join_requested', handleGroupJoinRequested);
    socketService.on('group_request_added', handleGroupRequestAdded);

    return () => {
      socketService.off('friend_request_received', handleFriendRequest);
      socketService.off('friend_request_accepted', handleFriendAccepted);
      socketService.off('friend_request_rejected', handleFriendRejected);
      socketService.off('group_created', handleGroupCreated);
      socketService.off('group_added', handleGroupAdded);
      socketService.off('group_removed', handleGroupRemoved);
      socketService.off('group_left_self', handleGroupLeftSelf);
      socketService.off('group_role_changed', handleGroupRoleChanged);
      socketService.off('group_join_requested', handleGroupJoinRequested);
      socketService.off('group_request_added', handleGroupRequestAdded);
    };
  }, [currentUserId]);

  if (toasts.length === 0) return null;

  return (
    <>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);   opacity: 1; }
        }
      `}</style>
      <div style={{
        position: 'fixed', bottom: 24, right: 24,
        display: 'flex', flexDirection: 'column', gap: 10,
        zIndex: 99999,
      }}>
        {toasts.map(toast => (
          <Toast key={toast.id} toast={toast} onRemove={removeToast} onNavigate={onNavigate} />
        ))}
      </div>
    </>
  );
}