// Đường dẫn: src/styles/chatStyles.js

// ChatLayout Styles
export const chatLayoutStyles = {
  container: {
    display: "flex",
    height: "100vh",
    backgroundColor: "#f3f4f6",
  },

  // Sidebar Styles
  sidebar: {
    width: "360px",
    backgroundColor: "white",
    borderRight: "1px solid #e5e7eb",
    display: "flex",
    flexDirection: "column",
  },

  sidebarHeader: {
    padding: "20px",
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  logoSection: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  appTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#1f2937",
    margin: 0,
  },

  logoutButton: {
    background: "none",
    border: "none",
    color: "#6b7280",
    cursor: "pointer",
    padding: "8px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    transition: "all 0.2s",
  },

  newChatButton: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    transition: "all 0.2s",
  },

  searchContainer: {
    padding: "16px",
    borderBottom: "1px solid #e5e7eb",
    position: "relative",
  },

  searchIcon: {
    position: "absolute",
    left: "28px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#9ca3af",
    pointerEvents: "none",
  },

  searchInput: {
    width: "100%",
    padding: "10px 12px 10px 40px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    fontSize: "14px",
    outline: "none",
    transition: "all 0.2s",
    fontFamily: "inherit",
  },

  conversationsContainer: {
    flex: 1,
    overflowY: "auto",
  },

  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 20px",
    gap: "12px",
  },

  spinner: {
    fontSize: "32px",
    animation: "spin 1s linear infinite",
  },

  loadingText: {
    color: "#6b7280",
    fontSize: "14px",
  },

  errorContainer: {
    padding: "40px 20px",
    textAlign: "center",
  },

  errorText: {
    color: "#dc2626",
    fontSize: "14px",
    marginBottom: "16px",
  },

  retryButton: {
    background: "#764ba2",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
  },

  // Chat Area Styles
  chatArea: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#f9fafb",
  },

  chatPlaceholder: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "16px",
    padding: "40px",
  },

  placeholderTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#374151",
    margin: 0,
  },

  placeholderText: {
    fontSize: "14px",
    color: "#6b7280",
    margin: 0,
  },
};

// ConversationList Styles
export const conversationListStyles = {
  container: {
    display: "flex",
    flexDirection: "column",
  },

  emptyState: {
    padding: "40px 20px",
    textAlign: "center",
  },

  emptyText: {
    color: "#9ca3af",
    fontSize: "14px",
  },

  conversationItem: {
    display: "flex",
    gap: "12px",
    padding: "12px 16px",
    cursor: "pointer",
    transition: "all 0.2s",
    borderBottom: "1px solid #f3f4f6",
    position: "relative",
  },

  conversationItemActive: {
    backgroundColor: "#f3f4f6",
  },

  avatarContainer: {
    position: "relative",
    flexShrink: 0,
  },

  avatar: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    objectFit: "cover",
  },

  avatarPlaceholder: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    backgroundColor: "#f3f4f6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  onlineIndicator: {
    position: "absolute",
    bottom: "2px",
    right: "2px",
    width: "12px",
    height: "12px",
    backgroundColor: "#10b981",
    border: "2px solid white",
    borderRadius: "50%",
  },

  content: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },

  topRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "8px",
  },

  name: {
    fontSize: "15px",
    fontWeight: "500",
    color: "#1f2937",
    margin: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  nameUnread: {
    fontWeight: "700",
    color: "#111827",
  },

  time: {
    fontSize: "12px",
    color: "#9ca3af",
    flexShrink: 0,
  },

  bottomRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "8px",
  },

  lastMessage: {
    fontSize: "13px",
    color: "#6b7280",
    margin: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  unreadBadge: {
    backgroundColor: "#764ba2",
    color: "white",
    fontSize: "11px",
    fontWeight: "600",
    padding: "2px 6px",
    borderRadius: "10px",
    minWidth: "18px",
    textAlign: "center",
    flexShrink: 0,
  },
};

// NewChatModal Styles
export const newChatModalStyles = {
  backdrop: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 1000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  modal: {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
    width: "90%",
    maxWidth: "480px",
    zIndex: 1001,
    display: "flex",
    flexDirection: "column",
    maxHeight: "90vh",
  },

  header: {
    padding: "20px 24px",
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1f2937",
    margin: 0,
  },

  closeButton: {
    background: "none",
    border: "none",
    color: "#6b7280",
    cursor: "pointer",
    padding: "4px",
    borderRadius: "6px",
    display: "flex",
    alignItems: "center",
    transition: "all 0.2s",
  },

  content: {
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },

  infoText: {
    fontSize: "14px",
    color: "#6b7280",
    margin: 0,
  },

  errorBox: {
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "8px",
    padding: "12px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  errorIcon: {
    color: "#dc2626",
    flexShrink: 0,
  },

  errorText: {
    color: "#991b1b",
    fontSize: "13px",
    margin: 0,
  },

  inputWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },

  inputIcon: {
    position: "absolute",
    left: "12px",
    color: "#9ca3af",
    pointerEvents: "none",
  },

  input: {
    width: "100%",
    padding: "12px 12px 12px 40px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "14px",
    outline: "none",
    transition: "all 0.2s",
    fontFamily: "inherit",
  },

  helperText: {
    fontSize: "13px",
    color: "#9ca3af",
    margin: 0,
    fontStyle: "italic",
  },

  searchWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },

  searchIcon: {
    position: "absolute",
    left: "12px",
    color: "#9ca3af",
    pointerEvents: "none",
  },

  searchInput: {
    width: "100%",
    padding: "10px 12px 10px 40px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    fontSize: "14px",
    outline: "none",
    transition: "all 0.2s",
    fontFamily: "inherit",
  },

  userListContainer: {
    maxHeight: "320px",
    overflowY: "auto",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    backgroundColor: "#f9fafb",
  },

  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 20px",
    gap: "12px",
  },

  loadingText: {
    color: "#6b7280",
    fontSize: "13px",
    margin: 0,
  },

  emptyState: {
    padding: "40px 20px",
    textAlign: "center",
  },

  emptyText: {
    color: "#9ca3af",
    fontSize: "14px",
    margin: 0,
  },

  userItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px",
    cursor: "pointer",
    transition: "all 0.2s",
    borderBottom: "1px solid #e5e7eb",
    backgroundColor: "white",
  },

  userItemSelected: {
    backgroundColor: "#f3f4f6",
    borderLeft: "3px solid #764ba2",
  },

  userAvatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    backgroundColor: "#f3f4f6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  userInfo: {
    flex: 1,
    minWidth: 0,
  },

  userName: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#1f2937",
    margin: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  userId: {
    fontSize: "12px",
    color: "#9ca3af",
    margin: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  selectedIndicator: {
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    backgroundColor: "#764ba2",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    fontWeight: "bold",
    flexShrink: 0,
  },

  footer: {
    padding: "16px 24px",
    borderTop: "1px solid #e5e7eb",
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
  },

  cancelButton: {
    background: "white",
    color: "#374151",
    border: "1px solid #d1d5db",
    padding: "10px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.2s",
  },

  submitButton: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.2s",
  },

  submitButtonDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },

  loadingContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },

  spinner: {
    display: "inline-block",
    animation: "spin 1s linear infinite",
    fontSize: "16px",
  },
};

// ChatWindow Styles
export const chatWindowStyles = {
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    backgroundColor: "#f0f2f5",
  },
  header: {
    padding: "10px 16px",
    backgroundColor: "white",
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    flexShrink: 0,
    minHeight: 60,
  },
  headerLeft: { display: "flex", alignItems: "center", gap: "10px" },
  avatarContainer: { position: "relative", flexShrink: 0 },
  avatar: { width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" },
  avatarPlaceholder: {
    width: "40px", height: "40px", borderRadius: "50%",
    backgroundColor: "#f3f4f6",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  onlineIndicator: {
    position: "absolute", bottom: 1, right: 1,
    width: "10px", height: "10px",
    backgroundColor: "#22c55e", border: "2px solid white", borderRadius: "50%",
  },
  userInfo: { display: "flex", flexDirection: "column", gap: 1 },
  statusContainer: { display: "flex", alignItems: "center", gap: 4 },
  userName: { fontSize: "15px", fontWeight: "600", color: "#111827", margin: 0 },
  userStatus: { fontSize: "12px", margin: 0 },
  typingStatus: { fontSize: "12px", color: "#764ba2", margin: 0, fontStyle: "italic" },
  moreButton: {
    background: "none", border: "none", color: "#6b7280",
    cursor: "pointer", padding: "8px", borderRadius: "50%",
    display: "flex", alignItems: "center",
    transition: "background 0.15s",
  },
  messagesContainer: {
    flex: 1, overflowY: "auto", padding: "12px 16px",
    display: "flex", flexDirection: "column", gap: 0,
    backgroundColor: "#f0f2f5",
  },
  loadingContainer: {
    flex: 1, display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center", gap: 12,
  },
  spinner: { fontSize: "28px", animation: "spin 1s linear infinite" },
  loadingText: { color: "#6b7280", fontSize: "14px", margin: 0 },
  errorContainer: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 40 },
  errorText: { color: "#dc2626", fontSize: "14px", textAlign: "center" },
  emptyContainer: {
    flex: 1, display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center", gap: 8,
  },
  emptyText: { color: "#6b7280", fontSize: "16px", fontWeight: "500", margin: 0 },
  emptySubtext: { color: "#9ca3af", fontSize: "14px", margin: 0 },
  loadMoreIndicator: {
    display: "flex", alignItems: "center", justifyContent: "center",
    gap: 8, padding: "8px 0",
  },
  noMoreMessages: {
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "8px 0", fontSize: 12, color: "#9ca3af",
  },
  inputContainer: {
    padding: "10px 12px",
    backgroundColor: "white",
    borderTop: "1px solid #e5e7eb",
    display: "flex",
    gap: 8,
    alignItems: "center",
    flexShrink: 0,
  },
  input: {
    flex: 1, padding: "10px 16px",
    border: "none",
    borderRadius: "22px",
    fontSize: "14px",
    outline: "none",
    fontFamily: "inherit",
    backgroundColor: "#f0f2f5",
    color: "#1f2937",
  },
  sendButton: {
    background: "linear-gradient(135deg,#667eea 0%,#764ba2 100%)",
    color: "white", border: "none",
    width: "40px", height: "40px", borderRadius: "50%",
    cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    transition: "opacity 0.2s", flexShrink: 0,
  },
  sendButtonDisabled: { opacity: 0.45, cursor: "not-allowed" },
  typingIndicatorContainer: {
    display: "flex", alignItems: "center", gap: 8,
    padding: "4px 0", marginLeft: 34,
  },
  typingBubble: {
    backgroundColor: "white", borderRadius: "18px",
    padding: "10px 14px",
    display: "flex", gap: 4, alignItems: "center",
    boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
  },
  typingDot: {
    width: "6px", height: "6px",
    backgroundColor: "#9ca3af", borderRadius: "50%",
    animation: "typing 1.4s infinite",
  },
  typingText: { fontSize: "12px", color: "#6b7280", margin: 0, fontStyle: "italic" },
};

// MessageBubble Styles
export const messageBubbleStyles = {};