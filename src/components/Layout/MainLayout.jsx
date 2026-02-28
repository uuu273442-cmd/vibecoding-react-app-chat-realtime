// Đường dẫn: src/components/Layout/MainLayout.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MessageCircle, Users, LogOut } from 'lucide-react';
import { logoutUser } from '../../services/authService';
import { getFriendRequests } from '../../services/friendsService';
import { mainLayoutStyles as styles } from '../../styles/layoutStyles';
import socketService from '../../services/socketService';

export default function MainLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [friendRequestsCount, setFriendRequestsCount] = useState(0);

  useEffect(() => {
    // Fetch initial friend requests count
    fetchFriendRequestsCount();

    // Setup socket listeners for real-time updates
    setupSocketListeners();

    return () => {
      cleanupSocketListeners();
    };
  }, []);

  const fetchFriendRequestsCount = async () => {
    try {
      const requests = await getFriendRequests();
      setFriendRequestsCount(requests.length);
    } catch (error) {
      console.error('Error fetching friend requests:', error);
    }
  };

  const setupSocketListeners = () => {
    // Nhận lời mời kết bạn mới → tăng badge
    socketService.onFriendRequestReceived((data) => {
      if (!data?.request) return;
      setFriendRequestsCount(prev => prev + 1);
    });

    // Request được accept → không ảnh hưởng badge (badge chỉ đếm incoming requests)
    socketService.onFriendRequestAccepted((_data) => {});

    socketService.onFriendRequestRejected((_data) => {});
  };

  const cleanupSocketListeners = () => {
    socketService.removeAllListeners('friend_request_received');
    socketService.removeAllListeners('friend_request_accepted');
    socketService.removeAllListeners('friend_request_rejected');
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      navigate('/login');
    }
  };

  const handleNavClick = (path) => {
    navigate(path);
    
    // Reset badge count when navigating to Friends page
    if (path === '/friends') {
      setFriendRequestsCount(0);
    }
  };

  const navItems = [
    {
      icon: MessageCircle,
      label: 'Chat',
      path: '/chat',
      badge: 0,
    },
    {
      icon: Users,
      label: 'Bạn bè',
      path: '/friends',
      badge: friendRequestsCount,
    },
  ];

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        {/* Logo */}
        <div style={styles.logo}>
          <div style={styles.logoIcon}>
            <MessageCircle size={24} color="white" />
          </div>
        </div>

        {/* Navigation */}
        <div style={styles.nav}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                style={{
                  ...styles.navItem,
                  ...(isActive ? styles.navItemActive : {})
                }}
                title={item.label}
              >
                {/* Icon with badge */}
                <div style={styles.iconWrapper}>
                  <Icon size={24} />
                  {item.badge > 0 && (
                    <div style={styles.badge}>
                      {item.badge > 99 ? '99+' : item.badge}
                    </div>
                  )}
                </div>
                <span style={styles.navLabel}>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Logout */}
        <div style={styles.sidebarFooter}>
          <button
            onClick={handleLogout}
            style={styles.logoutButton}
            title="Đăng xuất"
          >
            <LogOut size={24} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {children}
      </div>
    </div>
  );
}