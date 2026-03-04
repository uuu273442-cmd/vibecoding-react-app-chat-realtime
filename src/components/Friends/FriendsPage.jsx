// Đường dẫn: src/components/Friends/FriendsPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserPlus, Clock, Check, X } from 'lucide-react';
import { getFriends, getFriendRequests, updateFriendRequest, removeFriend } from '../../services/friendsService';
import { friendsPageStyles as styles } from '../../styles/friendsStyles';
import AddFriendModal from './AddFriendModal';
import ToastNotification, { useToast } from '../Shared/ToastNotification';
import socketService from '../../services/socketService';

export default function FriendsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'requests'
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Toast notifications
  const { toasts, showToast, removeToast } = useToast();

  useEffect(() => {
    fetchData();
    
    // Setup socket listeners
    setupSocketListeners();
    
    // Cleanup on unmount
    return () => {
      cleanupSocketListeners();
    };
  }, []);

  const setupSocketListeners = () => {
    console.log('🔔 Setting up friend notification listeners...');
    
    // Event 1: Nhận friend request mới
    socketService.onFriendRequestReceived(handleFriendRequestReceived);
    
    // Event 2: Request được accept
    socketService.onFriendRequestAccepted(handleFriendRequestAccepted);
    
    // Event 3: Request bị reject
    socketService.onFriendRequestRejected(handleFriendRequestRejected);
  };

  const cleanupSocketListeners = () => {
    console.log('🧹 Cleaning up friend notification listeners...');
    socketService.offFriendRequestReceived(handleFriendRequestReceived);
    socketService.offFriendRequestAccepted(handleFriendRequestAccepted);
    socketService.offFriendRequestRejected(handleFriendRequestRejected);
  };

  // ============ SOCKET EVENT HANDLERS ============

  const handleFriendRequestReceived = (data) => {
    if (!data?.request) return;
    const { request } = data;

    // Thêm vào danh sách requests (tránh duplicate)
    setRequests(prev => prev.some(r => r._id === request._id) ? prev : [request, ...prev]);

    // request.from là string ID (chưa populate) → hiển thị "Lời mời kết bạn mới"
    const senderName = typeof request.from === 'object'
      ? (request.from.name || 'Ai đó')
      : 'Ai đó';

    showToast({
      type: 'friend_request_received',
      title: 'Lời mời kết bạn mới',
      message: `${senderName} muốn kết bạn với bạn`,
    });

    playNotificationSound();
  };

  const handleFriendRequestAccepted = (data) => {
    if (!data?.friend) return;
    const { friend, conversationId } = data;

    // Thêm vào danh sách bạn bè (tránh duplicate)
    setFriends(prev => prev.some(f => f._id === friend._id) ? prev : [friend, ...prev]);

    showToast({
      type: 'friend_request_accepted',
      title: 'Kết bạn thành công',
      message: `${friend.name} đã chấp nhận lời mời kết bạn của bạn`,
      conversationId, // Dùng để navigate vào chat khi click toast
    });

    playNotificationSound();
  };

  const handleFriendRequestRejected = (data) => {
    console.log('❌ Friend request rejected:', data);
    
    // Show toast notification
    showToast({
      type: 'friend_request_rejected',
      title: 'Lời mời bị từ chối',
      message: `${data.rejectedBy.name} đã từ chối lời mời kết bạn của bạn`,
    });
  };

  // ===============================================

  const playNotificationSound = () => {
    // Simple notification sound using Web Audio API
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      console.log('Could not play notification sound:', error);
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const [friendsData, requestsData] = await Promise.all([
        getFriends(),
        getFriendRequests()
      ]);
      
      setFriends(friendsData);
      setRequests(requestsData);
    } catch (error) {
      console.error('Fetch friends error:', error);
      setError('Không thể tải danh sách bạn bè');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      const result = await updateFriendRequest(requestId, 'accepted');
      
      // Remove from requests
      setRequests(prev => prev.filter(r => r._id !== requestId));
      
      // Add to friends (lấy thông tin từ request)
      const acceptedRequest = requests.find(r => r._id === requestId);
      if (acceptedRequest) {
        setFriends(prev => [...prev, acceptedRequest.from]);
      }
      
      showToast({
        type: 'friend_request_accepted',
        title: 'Thành công',
        message: 'Đã chấp nhận lời mời kết bạn!',
      });
    } catch (error) {
      console.error('Accept request error:', error);
      alert('Không thể chấp nhận lời mời');
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await updateFriendRequest(requestId, 'rejected');
      
      // Remove from requests
      setRequests(prev => prev.filter(r => r._id !== requestId));
      
      showToast({
        type: 'friend_request_rejected',
        title: 'Đã từ chối',
        message: 'Đã từ chối lời mời kết bạn',
      });
    } catch (error) {
      console.error('Reject request error:', error);
      alert('Không thể từ chối lời mời');
    }
  };

  const handleRemoveFriend = async (friendId, friendName) => {
    if (!window.confirm(`Bạn có chắc muốn xóa ${friendName} khỏi danh sách bạn bè?`)) {
      return;
    }
    
    try {
      await removeFriend(friendId);
      
      // Remove from list
      setFriends(prev => prev.filter(f => f._id !== friendId));
      
      showToast({
        type: 'friend_request_rejected',
        title: 'Đã xóa',
        message: `Đã xóa ${friendName} khỏi danh sách bạn bè`,
      });
    } catch (error) {
      console.error('Remove friend error:', error);
      
      if (error.statusCode === 404) {
        alert('Người dùng không phải bạn bè của bạn');
      } else {
        alert('Không thể xóa bạn bè');
      }
    }
  };

  const handleFriendRequestSent = () => {
    showToast({
      type: 'friend_request_received',
      title: 'Thành công',
      message: 'Đã gửi lời mời kết bạn!',
    });
    setIsAddModalOpen(false);
  };

  const handleToastClick = (toast) => {
    // Navigate to requests tab when clicking on notification
    if (toast.type === 'friend_request_received') {
      setActiveTab('requests');
    }
  };

  return (
    <div style={styles.container}>
      {/* Toast Notifications */}
      <ToastNotification
        toasts={toasts}
        onClose={removeToast}
        onClick={handleToastClick}
      />

      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Bạn bè</h1>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          style={styles.addButton}
        >
          <UserPlus size={20} />
          Thêm bạn
        </button>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        <button
          onClick={() => setActiveTab('all')}
          style={{
            ...styles.tab,
            ...(activeTab === 'all' ? styles.tabActive : {})
          }}
        >
          <Users size={18} />
          Tất cả bạn bè ({friends.length})
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          style={{
            ...styles.tab,
            ...(activeTab === 'requests' ? styles.tabActive : {})
          }}
        >
          <Clock size={18} />
          Lời mời kết bạn ({requests.length})
        </button>
      </div>

      {/* Content */}
      <div style={styles.content}>
        {isLoading ? (
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}>⟳</div>
            <p style={styles.loadingText}>Đang tải...</p>
          </div>
        ) : error ? (
          <div style={styles.errorContainer}>
            <p style={styles.errorText}>{error}</p>
            <button onClick={fetchData} style={styles.retryButton}>
              Thử lại
            </button>
          </div>
        ) : activeTab === 'all' ? (
          // Friends List
          friends.length === 0 ? (
            <div style={styles.emptyState}>
              <Users size={48} color="#d1d5db" />
              <p style={styles.emptyText}>Chưa có bạn bè nào</p>
              <p style={styles.emptySubtext}>Gửi lời mời kết bạn để bắt đầu trò chuyện</p>
            </div>
          ) : (
            <div style={styles.grid}>
              {friends.map(friend => (
                <div key={friend._id} style={styles.friendCard}>
                  <div style={styles.friendAvatar}>
                    {friend.avatar ? (
                      <img src={friend.avatar} alt="" style={styles.avatarImage} />
                    ) : (
                      <div style={styles.avatarPlaceholder}>
                        {friend.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {friend.status === 'online' && <div style={styles.onlineDot} />}
                  </div>
                  <h3 style={styles.friendName}>{friend.name}</h3>
                  <p style={styles.friendStatus}>
                    {friend.status === 'online' ? 'Đang hoạt động' : 'Không hoạt động'}
                  </p>
                  <button
                    onClick={() => handleRemoveFriend(friend._id, friend.name)}
                    style={styles.removeButton}
                  >
                    Xóa bạn bè
                  </button>
                </div>
              ))}
            </div>
          )
        ) : (
          // Friend Requests
          requests.length === 0 ? (
            <div style={styles.emptyState}>
              <Clock size={48} color="#d1d5db" />
              <p style={styles.emptyText}>Không có lời mời kết bạn nào</p>
            </div>
          ) : (
            <div style={styles.requestsList}>
              {requests.map(request => (
                <div key={request._id} style={styles.requestCard}>
                  <div style={styles.requestAvatar}>
                    {request.from.avatar ? (
                      <img src={request.from.avatar} alt="" style={styles.avatarImage} />
                    ) : (
                      <div style={styles.avatarPlaceholder}>
                        {request.from.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div style={styles.requestInfo}>
                    <h3 style={styles.requestName}>{request.from.name}</h3>
                    {request.message && (
                      <p style={styles.requestMessage}>"{request.message}"</p>
                    )}
                    <p style={styles.requestTime}>
                      {new Date(request.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  <div style={styles.requestActions}>
                    <button
                      onClick={() => handleAcceptRequest(request._id)}
                      style={styles.acceptButton}
                    >
                      <Check size={18} />
                      Chấp nhận
                    </button>
                    <button
                      onClick={() => handleRejectRequest(request._id)}
                      style={styles.rejectButton}
                    >
                      <X size={18} />
                      Từ chối
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* Add Friend Modal */}
      <AddFriendModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onRequestSent={handleFriendRequestSent}
      />
    </div>
  );
}