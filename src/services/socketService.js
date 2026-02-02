// Đường dẫn: src/services/socketService.js

import { io } from 'socket.io-client';
import { getAccessToken } from './authService';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3000';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  // Connect to socket server
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
      auth: {
        token: token
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    // Connection events
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

  // Disconnect from socket server
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
      console.log('Socket disconnected');
    }
  }

  // Check if connected
  isConnected() {
    return this.socket?.connected || false;
  }

  // Join conversation room
  joinConversation(conversationId) {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }

    console.log('📥 Joining conversation:', conversationId);
    this.socket.emit('join_conversation', { conversationId });
  }

  // Leave conversation room
  leaveConversation(conversationId) {
    if (!this.socket) return;

    console.log('📤 Leaving conversation:', conversationId);
    this.socket.emit('leave_conversation', { conversationId });
  }

  // Send message via socket
  sendMessage(conversationId, content) {
    if (!this.socket) {
      console.error('Socket not connected');
      throw new Error('Socket not connected');
    }

    console.log('💬 Sending message via socket:', { conversationId, content });
    this.socket.emit('send_message', { conversationId, content });
  }

  // Typing indicators
  startTyping(conversationId) {
    if (!this.socket) return;
    this.socket.emit('typing_start', { conversationId });
  }

  stopTyping(conversationId) {
    if (!this.socket) return;
    this.socket.emit('typing_stop', { conversationId });
  }

  // ============ FRIEND NOTIFICATIONS ============
  
  // Listen to friend request received event
  onFriendRequestReceived(callback) {
    this.on('friend_request_received', callback);
  }

  // Listen to friend request accepted event
  onFriendRequestAccepted(callback) {
    this.on('friend_request_accepted', callback);
  }

  // Listen to friend request rejected event
  onFriendRequestRejected(callback) {
    this.on('friend_request_rejected', callback);
  }

  // Remove friend notification listeners
  offFriendRequestReceived(callback) {
    this.off('friend_request_received', callback);
  }

  offFriendRequestAccepted(callback) {
    this.off('friend_request_accepted', callback);
  }

  offFriendRequestRejected(callback) {
    this.off('friend_request_rejected', callback);
  }

  // ==============================================

  // Listen to events
  on(event, callback) {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }

    // Store listener for cleanup
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);

    this.socket.on(event, callback);
  }

  // Remove event listener
  off(event, callback) {
    if (!this.socket) return;

    this.socket.off(event, callback);

    // Remove from stored listeners
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // Remove all listeners for an event
  removeAllListeners(event) {
    if (!this.socket) return;
    
    this.socket.removeAllListeners(event);
    this.listeners.delete(event);
  }
}

// Singleton instance
const socketService = new SocketService();

export default socketService;
