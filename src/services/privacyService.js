// Đường dẫn: src/services/privacyService.js
// Block, Archive, Mute APIs — mapping theo tài liệu BE 3.2

import { API_CONFIG } from '../config/api.config';
import { getAccessToken } from './authService';

const authHeaders = () => ({
  ...API_CONFIG.HEADERS,
  'Authorization': `Bearer ${getAccessToken()}`,
});

const base = API_CONFIG.BASE_URL;

// ── Block ─────────────────────────────────────────────────────────────────────
export const blockUser = async (userId) => {
  const res = await fetch(`${base}/users/block/${userId}`, {
    method: 'POST', headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw data;
  return data; // { success: true }
};

export const unblockUser = async (userId) => {
  const res = await fetch(`${base}/users/block/${userId}`, {
    method: 'DELETE', headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
};

export const getBlockedUsers = async () => {
  const res = await fetch(`${base}/users/blocked`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw data;
  return Array.isArray(data) ? data : [];
  // [{ blockedId: { _id, name, avatar }, createdAt }]
};

// ── Archive ───────────────────────────────────────────────────────────────────
export const archiveConversation = async (conversationId) => {
  const res = await fetch(`${base}/conversations/${conversationId}/archive`, {
    method: 'POST', headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw data;
  return data; // { success: true, archived: true }
};

export const unarchiveConversation = async (conversationId) => {
  const res = await fetch(`${base}/conversations/${conversationId}/archive`, {
    method: 'DELETE', headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
};

export const getArchivedConversations = async () => {
  const res = await fetch(`${base}/conversations?archived=true`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw data;
  return Array.isArray(data) ? data : [];
};

// ── Mute ──────────────────────────────────────────────────────────────────────
// duration: '1h' | '8h' | '24h' | 'forever'
export const muteConversation = async (conversationId, duration) => {
  const res = await fetch(`${base}/conversations/${conversationId}/mute`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ duration }),
  });
  const data = await res.json();
  if (!res.ok) throw data;
  return data; // { success: true, mutedUntil: ISO | null }
};

export const unmuteConversation = async (conversationId) => {
  const res = await fetch(`${base}/conversations/${conversationId}/mute`, {
    method: 'DELETE', headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
};

// ── Mute helpers ──────────────────────────────────────────────────────────────
export const isMutedNow = (participant) => {
  if (!participant?.isMuted) return false;
  if (participant.mutedUntil === null) return true; // forever
  return new Date(participant.mutedUntil) > new Date();
};

export const getMuteStatus = (participant) => {
  if (!isMutedNow(participant)) return 'Thông báo: Bật';
  if (!participant.mutedUntil) return 'Thông báo: Tắt mãi mãi';
  const hours = Math.ceil((new Date(participant.mutedUntil) - new Date()) / 3600000);
  if (hours < 1) return 'Thông báo: Tắt (sắp hết)';
  return `Thông báo: Tắt còn ${hours}h`;
};

export const MUTE_OPTIONS = [
  { label: '1 giờ',     value: '1h' },
  { label: '8 giờ',     value: '8h' },
  { label: '24 giờ',    value: '24h' },
  { label: 'Mãi mãi',  value: 'forever' },
];