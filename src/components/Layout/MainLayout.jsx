// Đường dẫn: src/components/Layout/MainLayout.jsx
// UPDATED: Phase 2 - mount ToastNotification with navigation support

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MessageCircle, Users, LogOut } from 'lucide-react';
import { logoutUser } from '../../services/authService';
import { mainLayoutStyles as styles } from '../../styles/layoutStyles';
import ToastNotification from '../ToastNotification';

export default function MainLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [friendRequestCount, setFriendRequestCount] = useState(0);

  const navItems = [
    { icon: <MessageCircle size={22} />, label: 'Chat', path: '/chat' },
    { icon: <Users size={22} />, label: 'Bạn bè', path: '/friends', badge: friendRequestCount },
  ];

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch {}
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate('/login');
  };

  // Toast navigation handler
  const handleToastNavigate = (path, conversation) => {
    if (path) navigate(path);
    // conversation param available for future deep-link (e.g. open specific group)
  };

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>
            <MessageCircle size={24} color="white" />
          </div>
        </div>

        <nav style={styles.nav}>
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                ...styles.navItem,
                ...(location.pathname === item.path ? styles.navItemActive : {}),
              }}
            >
              <div style={styles.iconWrapper}>
                {item.icon}
                {item.badge > 0 && (
                  <span style={styles.badge}>{item.badge > 99 ? '99+' : item.badge}</span>
                )}
              </div>
              <span style={styles.navLabel}>{item.label}</span>
            </button>
          ))}
        </nav>

        <div style={styles.sidebarFooter}>
          <button onClick={handleLogout} style={styles.logoutButton} title="Đăng xuất">
            <LogOut size={22} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {children}
      </div>

      {/* Toast Notifications — mounted once at layout level */}
      <ToastNotification onNavigate={handleToastNavigate} />
    </div>
  );
}