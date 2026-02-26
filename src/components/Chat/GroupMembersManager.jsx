// Đường dẫn: src/components/Chat/GroupMembersManager.jsx

import React, { useState, useEffect } from 'react';
import { X, Search, Check, AlertCircle, UserPlus } from 'lucide-react';
import { getListUsers } from '../../services/chatService';
import { addGroupMembers } from '../../services/groupService';

export default function GroupMembersManager({ conversationId, existingMemberIds = [], onClose, onMembersAdded }) {
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selected, setSelected] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const q = searchQuery.toLowerCase();
    setFiltered(
      users.filter(u =>
        !existingMemberIds.includes(u._id) &&
        u.name.toLowerCase().includes(q)
      )
    );
  }, [searchQuery, users, existingMemberIds]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await getListUsers();
      setUsers(data);
    } catch {
      setError('Không thể tải danh sách người dùng');
    } finally {
      setIsLoading(false);
    }
  };

  const toggle = (user) => {
    setSelected(prev =>
      prev.find(u => u._id === user._id)
        ? prev.filter(u => u._id !== user._id)
        : [...prev, user]
    );
    setError('');
  };

  const handleSubmit = async () => {
    if (selected.length === 0) {
      setError('Chọn ít nhất 1 thành viên');
      return;
    }
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const userIds = selected.map(u => u._id);
      const result = await addGroupMembers(conversationId, userIds, description);

      // Check if result is array (pending requests) or conversation object (added directly)
      if (Array.isArray(result)) {
        setSuccess(`Đã gửi ${result.length} yêu cầu tham gia, chờ admin duyệt.`);
      } else {
        setSuccess(`Đã thêm ${selected.length} thành viên vào nhóm.`);
        onMembersAdded?.(result);
      }
      setSelected([]);
    } catch (err) {
      const errMsg = err.message;
      if (errMsg === 'Some users already exist in group!') {
        setError('Một số người dùng đã là thành viên của nhóm');
      } else if (errMsg === 'Some users not found!') {
        setError('Một số người dùng không tồn tại');
      } else if (Array.isArray(errMsg)) {
        setError(errMsg.join(', '));
      } else {
        setError(errMsg || 'Không thể thêm thành viên');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div style={s.backdrop} onClick={onClose} />
      <div style={s.modal}>
        <div style={s.header}>
          <div style={s.headerLeft}>
            <div style={s.iconBadge}><UserPlus size={18} /></div>
            <h3 style={s.title}>Thêm thành viên</h3>
          </div>
          <button onClick={onClose} style={s.closeBtn}><X size={20} /></button>
        </div>

        <div style={s.content}>
          {/* Selected chips */}
          {selected.length > 0 && (
            <div style={s.chips}>
              {selected.map(u => (
                <div key={u._id} style={s.chip}>
                  <span>{u.name}</span>
                  <button onClick={() => toggle(u)} style={s.chipX}><X size={11} /></button>
                </div>
              ))}
            </div>
          )}

          {/* Search */}
          <div style={s.searchBox}>
            <Search size={16} color="#9ca3af" />
            <input
              autoFocus
              placeholder="Tìm kiếm người dùng..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={s.searchInput}
            />
          </div>

          {/* Error / Success */}
          {error && (
            <div style={s.errBox}>
              <AlertCircle size={14} color="#dc2626" />
              <span style={{ fontSize: 13, color: '#dc2626' }}>{error}</span>
            </div>
          )}
          {success && (
            <div style={s.successBox}>
              <Check size={14} color="#16a34a" />
              <span style={{ fontSize: 13, color: '#16a34a' }}>{success}</span>
            </div>
          )}

          {/* User list */}
          <div style={s.list}>
            {isLoading ? (
              <div style={s.center}>Đang tải...</div>
            ) : filtered.length === 0 ? (
              <div style={s.center}>
                {searchQuery ? 'Không tìm thấy' : 'Tất cả người dùng đã trong nhóm'}
              </div>
            ) : (
              filtered.map(user => {
                const isSel = selected.some(u => u._id === user._id);
                return (
                  <div
                    key={user._id}
                    onClick={() => toggle(user)}
                    style={{ ...s.userItem, ...(isSel ? s.userSelected : {}) }}
                  >
                    <div style={s.avatar}>{user.name.charAt(0).toUpperCase()}</div>
                    <span style={s.userName}>{user.name}</span>
                    <div style={{ ...s.check, ...(isSel ? s.checkActive : {}) }}>
                      {isSel && <Check size={13} color="white" />}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Description (optional) */}
          {selected.length > 0 && (
            <div style={s.descBlock}>
              <label style={s.descLabel}>Lời nhắn (tùy chọn)</label>
              <input
                placeholder="Mô tả lý do thêm thành viên..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                style={s.descInput}
              />
            </div>
          )}
        </div>

        <div style={s.footer}>
          <button onClick={onClose} style={s.cancelBtn}>Hủy</button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || selected.length === 0}
            style={{ ...s.primaryBtn, ...(isSubmitting || selected.length === 0 ? s.disabled : {}) }}
          >
            {isSubmitting ? '⟳ Đang thêm...' : `Thêm (${selected.length})`}
          </button>
        </div>
      </div>
    </>
  );
}

const s = {
  backdrop: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9998 },
  modal: {
    position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
    backgroundColor: 'white', borderRadius: 16, boxShadow: '0 24px 64px rgba(0,0,0,0.2)',
    width: '90%', maxWidth: 480, maxHeight: '80vh', display: 'flex', flexDirection: 'column', zIndex: 9999,
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '18px 22px', borderBottom: '1px solid #f3f4f6',
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 10 },
  iconBadge: {
    width: 36, height: 36, borderRadius: 9, background: 'linear-gradient(135deg,#667eea,#764ba2)',
    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  title: { fontSize: 16, fontWeight: 700, color: '#111827', margin: 0 },
  closeBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 4, display: 'flex', borderRadius: 6 },
  content: { flex: 1, overflowY: 'auto', padding: '14px 22px' },
  chips: { display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  chip: {
    display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px',
    backgroundColor: '#ede9fe', borderRadius: 20, fontSize: 13, color: '#5b21b6', fontWeight: 500,
  },
  chipX: { background: 'none', border: 'none', cursor: 'pointer', color: '#7c3aed', padding: 0, display: 'flex' },
  searchBox: {
    display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px',
    backgroundColor: '#f9fafb', borderRadius: 9, border: '1px solid #e5e7eb', marginBottom: 10,
  },
  searchInput: { flex: 1, border: 'none', outline: 'none', backgroundColor: 'transparent', fontSize: 14, color: '#111827' },
  errBox: {
    display: 'flex', alignItems: 'center', gap: 7, padding: '8px 12px',
    backgroundColor: '#fef2f2', borderRadius: 8, marginBottom: 10, border: '1px solid #fecaca',
  },
  successBox: {
    display: 'flex', alignItems: 'center', gap: 7, padding: '8px 12px',
    backgroundColor: '#f0fdf4', borderRadius: 8, marginBottom: 10, border: '1px solid #bbf7d0',
  },
  list: { display: 'flex', flexDirection: 'column', gap: 4 },
  center: { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 0', color: '#9ca3af', fontSize: 14 },
  userItem: {
    display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px',
    borderRadius: 9, cursor: 'pointer', border: '1px solid transparent',
  },
  userSelected: { backgroundColor: '#faf5ff', borderColor: '#e9d5ff' },
  avatar: {
    width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#667eea,#764ba2)',
    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0,
  },
  userName: { flex: 1, fontSize: 14, fontWeight: 500, color: '#111827' },
  check: {
    width: 20, height: 20, borderRadius: 5, border: '2px solid #d1d5db',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  checkActive: { background: 'linear-gradient(135deg,#667eea,#764ba2)', borderColor: 'transparent' },
  descBlock: { marginTop: 14 },
  descLabel: { fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 },
  descInput: {
    width: '100%', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: 8,
    fontSize: 13, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
  },
  footer: {
    display: 'flex', gap: 8, padding: '14px 22px', borderTop: '1px solid #f3f4f6', justifyContent: 'flex-end',
  },
  cancelBtn: {
    padding: '8px 16px', border: '1px solid #e5e7eb', borderRadius: 8,
    backgroundColor: 'white', color: '#6b7280', fontSize: 14, fontWeight: 500, cursor: 'pointer',
  },
  primaryBtn: {
    padding: '8px 20px', border: 'none', borderRadius: 8,
    background: 'linear-gradient(135deg,#667eea,#764ba2)',
    color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer',
  },
  disabled: { opacity: 0.45, cursor: 'not-allowed' },
};