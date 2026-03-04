// Đường dẫn: src/components/Layout/MainLayout.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MessageCircle, Users, LogOut } from 'lucide-react';
import { logoutUser } from '../../services/authService';
import { getFriendRequests } from '../../services/friendsService';
import { mainLayoutStyles as styles } from '../../styles/layoutStyles';
import socketService from '../../services/socketService';
import ToastNotification from '../ToastNotification';

export default function MainLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [friendRequestsCount, setFriendRequestsCount] = useState(0);

  useEffect(() => {
    // Connect socket ngay khi user đã login và MainLayout mount
    socketService.connect();

    fetchFriendRequestsCount();
    setupSocketListeners();

    return () => {
      cleanupSocketListeners();
      // KHÔNG disconnect ở đây — ChatLayout cũng dùng socket
      // Disconnect chỉ xảy ra khi logout (handleLogout)
    };
  }, []);

  const fetchFriendRequestsCount = async () => {
    try {
      const requests = await getFriendRequests();
      setFriendRequestsCount(requests.length);
    } catch {}
  };

  const setupSocketListeners = () => {
    socketService.onFriendRequestReceived((data) => {
      if (!data?.request) return;
      setFriendRequestsCount(prev => prev + 1);
    });
    socketService.onFriendRequestAccepted((_data) => {});
    socketService.onFriendRequestRejected((_data) => {});
  };

  const cleanupSocketListeners = () => {
    socketService.removeAllListeners('friend_request_received');
    socketService.removeAllListeners('friend_request_accepted');
    socketService.removeAllListeners('friend_request_rejected');
  };

  const handleLogout = async () => {
    // Disconnect socket TRƯỚC KHI clear token — đảm bảo sạch hoàn toàn
    socketService.disconnect();
    try { await logoutUser(); } catch {}
    navigate('/login');
  };

  const handleNavClick = (path) => {
    navigate(path);
    if (path === '/friends') setFriendRequestsCount(0);
  };

  const handleToastNavigate = (path) => {
    navigate(path || '/chat');
  };

  const navItems = [
    { icon: MessageCircle, label: 'Chat', path: '/chat', badge: 0 },
    { icon: Users, label: 'Bạn bè', path: '/friends', badge: friendRequestsCount },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}><MessageCircle size={24} color="white" /></div>
        </div>
        <div style={styles.nav}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                style={{ ...styles.navItem, ...(isActive ? styles.navItemActive : {}) }}
                title={item.label}
              >
                <div style={styles.iconWrapper}>
                  <Icon size={24} />
                  {item.badge > 0 && (
                    <div style={styles.badge}>{item.badge > 99 ? '99+' : item.badge}</div>
                  )}
                </div>
                <span style={styles.navLabel}>{item.label}</span>
              </button>
            );
          })}
        </div>
        <div style={styles.sidebarFooter}>
          <button onClick={handleLogout} style={styles.logoutButton} title="Đăng xuất">
            <LogOut size={24} />
          </button>
        </div>
      </div>

      <div style={styles.mainContent}>{children}</div>

      {/* Toast notifications — mounted once at layout level */}
      <ToastNotification onNavigate={handleToastNavigate} />
    </div>
  );
}