// Đường dẫn: src/services/groupService.js

import { API_CONFIG } from '../config/api.config';
import { getAccessToken } from './authService';

const base = API_CONFIG.BASE_URL;
const headers = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getAccessToken()}`,
});

// ============ CREATE GROUP ============

export const createGroup = async (groupIds, name) => {
  const res = await fetch(`${base}/conversations/group`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ groupIds, name }),
  });
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
};

// ============ CONVERSATION INFO ============

export const getConversationInfo = async (conversationId) => {
  const res = await fetch(`${base}/conversations/${conversationId}/info`, {
    headers: headers(),
  });
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
};

export const getConversationMedia = async (conversationId) => {
  const res = await fetch(`${base}/conversations/${conversationId}/info/media`, {
    headers: headers(),
  });
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
};

export const getConversationFiles = async (conversationId) => {
  const res = await fetch(`${base}/conversations/${conversationId}/info/file`, {
    headers: headers(),
  });
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
};

export const getConversationLinks = async (conversationId) => {
  const res = await fetch(`${base}/conversations/${conversationId}/info/link-preview`, {
    headers: headers(),
  });
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
};

// ============ MEMBERS MANAGEMENT ============

// Add members (member role → creates pending request; admin/owner → adds directly)
export const addGroupMembers = async (conversationId, userIds, description = '') => {
  const body = { userIds };
  if (description) body.description = description;
  const res = await fetch(`${base}/conversations/${conversationId}/members/add`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
};

// Remove members (admin/owner only)
export const removeGroupMembers = async (conversationId, userIds) => {
  const res = await fetch(`${base}/conversations/${conversationId}/members/remove`, {
    method: 'DELETE',
    headers: headers(),
    body: JSON.stringify({ userIds }),
  });
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
};

// Change member role
export const changeGroupMemberRole = async (conversationId, userId, role) => {
  const res = await fetch(`${base}/conversations/${conversationId}/members/role`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify({ id: userId, role }),
  });
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
};

// Leave group
export const leaveGroup = async (conversationId) => {
  const res = await fetch(`${base}/conversations/${conversationId}/members/leave`, {
    method: 'DELETE',
    headers: headers(),
  });
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
};

// ============ JOIN REQUESTS ============

// Get pending join requests (admin/owner only)
export const getGroupRequests = async (conversationId) => {
  const res = await fetch(`${base}/conversations/${conversationId}/requests`, {
    headers: headers(),
  });
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
};

// Handle join request (accept/reject)
export const handleGroupRequest = async (conversationId, requestId, action) => {
  const res = await fetch(`${base}/conversations/${conversationId}/request/handle`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify({ id: requestId, action }),
  });
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
};