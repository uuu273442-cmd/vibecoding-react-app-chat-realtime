// Đường dẫn: src/components/Layout/MainLayout.jsx

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MessageCircle, Users, LogOut } from 'lucide-react';
import { logoutUser } from '../../services/authService';
import { mainLayoutStyles as styles } from '../../styles/layoutStyles';

export default function MainLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      navigate('/login');
    }
  };

  const navItems = [
    {
      icon: MessageCircle,
      label: 'Chat',
      path: '/chat',
    },
    {
      icon: Users,
      label: 'Bạn bè',
      path: '/friends',
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
                onClick={() => navigate(item.path)}
                style={{
                  ...styles.navItem,
                  ...(isActive ? styles.navItemActive : {})
                }}
                title={item.label}
              >
                <Icon size={24} />
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