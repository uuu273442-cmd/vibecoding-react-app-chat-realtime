// Đường dẫn: src/styles/layoutStyles.js

export const mainLayoutStyles = {
  container: {
    display: 'flex',
    height: '100vh',
    overflow: 'hidden',
  },

  // Sidebar
  sidebar: {
    width: '80px',
    backgroundColor: '#1f2937',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '16px 0',
    flexShrink: 0,
  },

  logo: {
    marginBottom: '32px',
  },

  logoIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },

  // Navigation
  nav: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    width: '100%',
    padding: '0 12px',
  },

  navItem: {
    width: '100%',
    height: '56px',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '12px',
    color: '#9ca3af',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    transition: 'all 0.2s',
    position: 'relative',
  },

  navItemActive: {
    backgroundColor: 'rgba(118, 75, 162, 0.1)',
    color: '#a78bfa',
  },

  navLabel: {
    fontSize: '11px',
    fontWeight: '500',
  },

  // Footer
  sidebarFooter: {
    width: '100%',
    padding: '0 12px',
    marginTop: '16px',
  },

  logoutButton: {
    width: '100%',
    height: '48px',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '12px',
    color: '#9ca3af',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
  },

  // Main Content
  mainContent: {
    flex: 1,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
};