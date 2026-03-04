// Đường dẫn: src/components/Chat/AnnouncementBanner.jsx
// Hiển thị announcement + form tạo mới (admin/owner)

import React, { useState, useEffect } from 'react';
import { Megaphone, X, Plus, ChevronDown, ChevronUp, Loader } from 'lucide-react';
import { getAnnouncements, createAnnouncement } from '../../services/groupService';
import { getCurrentUserId } from '../../utils/chatHelpers';

/**
 * Props:
 *  - conversationId: string
 *  - isAdminOrOwner: bool
 *  - onClose: () => void  (nút X ẩn banner)
 */
export default function AnnouncementBanner({ conversationId, isAdminOrOwner, onClose }) {
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnnouncements();
  }, [conversationId]);

  // Nhận realtime khi ChatWindow dispatch announcement_created
  useEffect(() => {
    const handler = (e) => {
      if (e.detail?.conversationId !== conversationId) return;
      const newAnn = e.detail?.announcement;
      if (!newAnn) { fetchAnnouncements(); return; }
      setAnnouncements(prev =>
        prev.some(a => a._id === newAnn._id) ? prev : [newAnn, ...prev]
      );
    };
    window.addEventListener('announcement_created', handler);
    return () => window.removeEventListener('announcement_created', handler);
  }, [conversationId]);

  const fetchAnnouncements = async () => {
    try {
      setIsLoading(true);
      const data = await getAnnouncements(conversationId);
      setAnnouncements(data);
    } catch {
      // không hiển thị lỗi, chỉ để trống
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!content.trim()) return;
    setIsSubmitting(true);
    setError('');
    try {
      const newAnn = await createAnnouncement(conversationId, content.trim());
      setAnnouncements(prev => [newAnn, ...prev]);
      setContent('');
      setShowForm(false);
    } catch (err) {
      setError(err.message || 'Không thể tạo thông báo');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeAnnouncements = announcements.filter(a => a.status === 'active');
  const latest = activeAnnouncements[0];

  // Nếu không có gì và không phải admin thì không render
  if (!isLoading && activeAnnouncements.length === 0 && !isAdminOrOwner) return null;

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div style={s.wrapper}>
      {/* Header row */}
      <div style={s.header}>
        <div style={s.headerLeft}>
          <Megaphone size={15} color="#f59e0b" />
          <span style={s.title}>Thông báo nhóm</span>
          {activeAnnouncements.length > 1 && (
            <span style={s.badge}>{activeAnnouncements.length}</span>
          )}
        </div>
        <div style={s.actions}>
          {isAdminOrOwner && (
            <button
              style={s.iconBtn}
              title="Tạo thông báo mới"
              onClick={() => setShowForm(v => !v)}
            >
              <Plus size={15} />
            </button>
          )}
          {activeAnnouncements.length > 1 && (
            <button style={s.iconBtn} onClick={() => setIsExpanded(v => !v)}>
              {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>
          )}
          <button style={s.iconBtn} onClick={onClose}>
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div style={s.loading}>
          <Loader size={14} color="#9ca3af" style={{ animation: 'spin 1s linear infinite' }} />
          <span style={s.loadingText}>Đang tải...</span>
        </div>
      )}

      {/* Latest announcement */}
      {!isLoading && latest && (
        <div style={s.contentRow}>
          <div style={s.pinnerInfo}>
            {latest.pinnedBy?.avatar ? (
              <img src={latest.pinnedBy.avatar} alt="" style={s.pinnerAvatar} />
            ) : (
              <div style={s.pinnerAvatarFallback}>
                {(latest.pinnedBy?.name || 'A').charAt(0).toUpperCase()}
              </div>
            )}
            <span style={s.pinnerName}>{latest.pinnedBy?.name || 'Admin'}</span>
            <span style={s.pinnerTime}>{formatTime(latest.createdAt)}</span>
          </div>
          <p style={s.content}>{latest.content}</p>
        </div>
      )}

      {/* Expanded — các announcement khác */}
      {isExpanded && activeAnnouncements.slice(1).map(ann => (
        <div key={ann._id} style={{ ...s.contentRow, borderTop: '1px solid #fde68a' }}>
          <div style={s.pinnerInfo}>
            {ann.pinnedBy?.avatar ? (
              <img src={ann.pinnedBy.avatar} alt="" style={s.pinnerAvatar} />
            ) : (
              <div style={s.pinnerAvatarFallback}>
                {(ann.pinnedBy?.name || 'A').charAt(0).toUpperCase()}
              </div>
            )}
            <span style={s.pinnerName}>{ann.pinnedBy?.name || 'Admin'}</span>
            <span style={s.pinnerTime}>{formatTime(ann.createdAt)}</span>
          </div>
          <p style={s.content}>{ann.content}</p>
        </div>
      ))}

      {/* Không có announcement */}
      {!isLoading && activeAnnouncements.length === 0 && isAdminOrOwner && (
        <p style={s.empty}>Chưa có thông báo. Tạo thông báo đầu tiên!</p>
      )}

      {/* Form tạo mới */}
      {showForm && (
        <div style={s.form}>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Nhập nội dung thông báo..."
            style={s.textarea}
            rows={3}
            maxLength={500}
          />
          {error && <p style={s.errorText}>{error}</p>}
          <div style={s.formActions}>
            <span style={s.charCount}>{content.length}/500</span>
            <button style={s.cancelBtn} onClick={() => { setShowForm(false); setContent(''); setError(''); }}>
              Hủy
            </button>
            <button
              style={{ ...s.submitBtn, opacity: (!content.trim() || isSubmitting) ? 0.5 : 1 }}
              disabled={!content.trim() || isSubmitting}
              onClick={handleCreate}
            >
              {isSubmitting ? <Loader size={13} /> : 'Đăng'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  wrapper: {
    backgroundColor: '#fffbeb',
    borderBottom: '1px solid #fde68a',
    padding: '10px 16px',
    flexShrink: 0,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 13,
    fontWeight: 600,
    color: '#92400e',
  },
  badge: {
    backgroundColor: '#f59e0b',
    color: 'white',
    fontSize: 11,
    fontWeight: 700,
    borderRadius: 8,
    padding: '0 6px',
    minWidth: 18,
    textAlign: 'center',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
  },
  iconBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#92400e',
    padding: '3px 5px',
    borderRadius: 6,
    display: 'flex',
    alignItems: 'center',
  },
  loading: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '4px 0',
  },
  loadingText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  contentRow: {
    padding: '4px 0',
  },
  pinnerInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    marginBottom: 3,
  },
  pinnerAvatar: {
    width: 18,
    height: 18,
    borderRadius: '50%',
    objectFit: 'cover',
  },
  pinnerAvatarFallback: {
    width: 18,
    height: 18,
    borderRadius: '50%',
    background: 'linear-gradient(135deg,#667eea,#764ba2)',
    color: 'white',
    fontSize: 9,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinnerName: {
    fontSize: 12,
    fontWeight: 600,
    color: '#92400e',
  },
  pinnerTime: {
    fontSize: 11,
    color: '#a16207',
  },
  content: {
    fontSize: 13,
    color: '#78350f',
    margin: 0,
    lineHeight: '1.5',
    wordBreak: 'break-word',
  },
  empty: {
    fontSize: 12,
    color: '#a16207',
    margin: '4px 0 0',
    fontStyle: 'italic',
  },
  form: {
    marginTop: 8,
    borderTop: '1px solid #fde68a',
    paddingTop: 8,
  },
  textarea: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #fde68a',
    borderRadius: 8,
    fontSize: 13,
    backgroundColor: '#fefce8',
    color: '#78350f',
    resize: 'none',
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  },
  formActions: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 6,
  },
  charCount: {
    fontSize: 11,
    color: '#a16207',
    marginRight: 'auto',
  },
  cancelBtn: {
    padding: '5px 12px',
    border: '1px solid #fde68a',
    borderRadius: 8,
    background: 'transparent',
    color: '#92400e',
    fontSize: 13,
    cursor: 'pointer',
  },
  submitBtn: {
    padding: '5px 14px',
    border: 'none',
    borderRadius: 8,
    background: 'linear-gradient(135deg,#f59e0b,#d97706)',
    color: 'white',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    margin: '4px 0 0',
  },
};