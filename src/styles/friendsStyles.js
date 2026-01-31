// Đường dẫn: src/styles/friendsStyles.js

export const friendsPageStyles = {
  container: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#f9fafb',
  },

  // Header
  header: {
    padding: '20px 24px',
    backgroundColor: 'white',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1f2937',
    margin: 0,
  },

  addButton: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s',
  },

  // Tabs
  tabs: {
    padding: '16px 24px',
    backgroundColor: 'white',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    gap: '12px',
  },

  tab: {
    background: 'none',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    color: '#6b7280',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s',
  },

  tabActive: {
    backgroundColor: '#f3f4f6',
    color: '#764ba2',
  },

  // Content
  content: {
    flex: 1,
    overflowY: 'auto',
    padding: '24px',
  },

  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
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
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
    padding: '60px 20px',
  },

  errorText: {
    color: '#dc2626',
    fontSize: '14px',
  },

  retryButton: {
    background: '#764ba2',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
  },

  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    gap: '12px',
  },

  emptyText: {
    color: '#6b7280',
    fontSize: '16px',
    fontWeight: '500',
    margin: 0,
  },

  emptySubtext: {
    color: '#9ca3af',
    fontSize: '14px',
    margin: 0,
  },

  // Friends Grid
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '16px',
  },

  friendCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    border: '1px solid #e5e7eb',
    transition: 'all 0.2s',
  },

  friendAvatar: {
    position: 'relative',
    width: '64px',
    height: '64px',
  },

  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    objectFit: 'cover',
  },

  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    fontWeight: '600',
  },

  onlineDot: {
    position: 'absolute',
    bottom: '2px',
    right: '2px',
    width: '14px',
    height: '14px',
    backgroundColor: '#10b981',
    border: '3px solid white',
    borderRadius: '50%',
  },

  friendName: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1f2937',
    margin: 0,
    textAlign: 'center',
  },

  friendStatus: {
    fontSize: '13px',
    color: '#6b7280',
    margin: 0,
  },

  removeButton: {
    background: 'none',
    border: '1px solid #e5e7eb',
    color: '#dc2626',
    padding: '6px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    transition: 'all 0.2s',
    marginTop: '4px',
  },

  // Friend Requests List
  requestsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },

  requestCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    border: '1px solid #e5e7eb',
  },

  requestAvatar: {
    flexShrink: 0,
  },

  requestInfo: {
    flex: 1,
    minWidth: 0,
  },

  requestName: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1f2937',
    margin: 0,
    marginBottom: '4px',
  },

  requestMessage: {
    fontSize: '14px',
    color: '#6b7280',
    margin: 0,
    marginBottom: '4px',
    fontStyle: 'italic',
  },

  requestTime: {
    fontSize: '12px',
    color: '#9ca3af',
    margin: 0,
  },

  requestActions: {
    display: 'flex',
    gap: '8px',
    flexShrink: 0,
  },

  acceptButton: {
    background: '#10b981',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.2s',
  },

  rejectButton: {
    background: '#ef4444',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.2s',
  },
};