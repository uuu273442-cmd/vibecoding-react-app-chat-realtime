// Đường dẫn: src/styles/chatStyles.js

// ChatLayout Styles
export const chatLayoutStyles = {
  container: {
    display: 'flex',
    height: '100vh',
    backgroundColor: '#f3f4f6',
  },
  
  // Sidebar Styles
  sidebar: {
    width: '360px',
    backgroundColor: 'white',
    borderRight: '1px solid #e5e7eb',
    display: 'flex',
    flexDirection: 'column',
  },
  
  sidebarHeader: {
    padding: '20px',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  logoSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  
  appTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1f2937',
    margin: 0,
  },
  
  logoutButton: {
    background: 'none',
    border: 'none',
    color: '#6b7280',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.2s',
  },
  
  searchContainer: {
    padding: '16px',
    borderBottom: '1px solid #e5e7eb',
    position: 'relative',
  },
  
  searchIcon: {
    position: 'absolute',
    left: '28px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#9ca3af',
    pointerEvents: 'none',
  },
  
  searchInput: {
    width: '100%',
    padding: '10px 12px 10px 40px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.2s',
    fontFamily: 'inherit',
  },
  
  conversationsContainer: {
    flex: 1,
    overflowY: 'auto',
  },
  
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    gap: '12px',
  },
  
  spinner: {
    fontSize: '32px',
    animation: 'spin 1s linear infinite',
  },
  
  loadingText: {
    color: '#6b7280',
    fontSize: '14px',
  },
  
  errorContainer: {
    padding: '40px 20px',
    textAlign: 'center',
  },
  
  errorText: {
    color: '#dc2626',
    fontSize: '14px',
    marginBottom: '16px',
  },
  
  retryButton: {
    background: '#764ba2',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
  
  // Chat Area Styles
  chatArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#f9fafb',
  },
  
  chatPlaceholder: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    padding: '40px',
  },
  
  placeholderTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#374151',
    margin: 0,
  },
  
  placeholderText: {
    fontSize: '14px',
    color: '#6b7280',
    margin: 0,
  },
};

// ConversationList Styles
export const conversationListStyles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
  },

  emptyState: {
    padding: '40px 20px',
    textAlign: 'center',
  },

  emptyText: {
    color: '#9ca3af',
    fontSize: '14px',
  },

  conversationItem: {
    display: 'flex',
    gap: '12px',
    padding: '12px 16px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    borderBottom: '1px solid #f3f4f6',
    position: 'relative',
  },

  conversationItemActive: {
    backgroundColor: '#f3f4f6',
  },

  avatarContainer: {
    position: 'relative',
    flexShrink: 0,
  },

  avatar: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    objectFit: 'cover',
  },

  avatarPlaceholder: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: '#f3f4f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  onlineIndicator: {
    position: 'absolute',
    bottom: '2px',
    right: '2px',
    width: '12px',
    height: '12px',
    backgroundColor: '#10b981',
    border: '2px solid white',
    borderRadius: '50%',
  },

  content: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },

  topRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '8px',
  },

  name: {
    fontSize: '15px',
    fontWeight: '500',
    color: '#1f2937',
    margin: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  nameUnread: {
    fontWeight: '700',
    color: '#111827',
  },

  time: {
    fontSize: '12px',
    color: '#9ca3af',
    flexShrink: 0,
  },

  bottomRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '8px',
  },

  lastMessage: {
    fontSize: '13px',
    color: '#6b7280',
    margin: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  unreadBadge: {
    backgroundColor: '#764ba2',
    color: 'white',
    fontSize: '11px',
    fontWeight: '600',
    padding: '2px 6px',
    borderRadius: '10px',
    minWidth: '18px',
    textAlign: 'center',
    flexShrink: 0,
  },
};