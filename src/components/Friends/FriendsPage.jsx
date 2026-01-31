// Đường dẫn: src/components/Friends/FriendsPage.jsx

import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Clock, Check, X } from 'lucide-react';
import { getFriends, getFriendRequests, updateFriendRequest, removeFriend } from '../../services/friendsService';
import { friendsPageStyles as styles } from '../../styles/friendsStyles';
import AddFriendModal from './AddFriendModal';

export default function FriendsPage() {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'requests'
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

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
      
      alert('Đã chấp nhận lời mời kết bạn!');
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
      
      alert('Đã từ chối lời mời kết bạn');
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
      
      alert('Đã xóa bạn bè');
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
    alert('Đã gửi lời mời kết bạn!');
    setIsAddModalOpen(false);
  };

  return (
    <div style={styles.container}>
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