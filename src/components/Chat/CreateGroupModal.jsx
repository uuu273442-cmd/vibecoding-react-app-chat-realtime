// Đường dẫn: src/components/Chat/CreateGroupModal.jsx

import React, { useState, useEffect } from 'react';
import { X, Search, Users, Check, AlertCircle } from 'lucide-react';
import { getListUsers } from '../../services/chatService';
import { createGroup } from '../../services/groupService';

export default function CreateGroupModal({ isOpen, onClose, onGroupCreated }) {
  const [step, setStep] = useState(1); // 1: chọn members, 2: đặt tên
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [groupName, setGroupName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    } else {
      setStep(1);
      setSelectedUsers([]);
      setSearchQuery('');
      setGroupName('');
      setError('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
    } else {
      setFilteredUsers(
        users.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
  }, [searchQuery, users]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await getListUsers();
      setUsers(data);
      setFilteredUsers(data);
    } catch {
      setError('Không thể tải danh sách người dùng');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUser = (user) => {
    setSelectedUsers(prev =>
      prev.find(u => u._id === user._id)
        ? prev.filter(u => u._id !== user._id)
        : [...prev, user]
    );
    setError('');
  };

  const handleNext = () => {
    if (selectedUsers.length < 2) {
      setError('Cần chọn ít nhất 2 thành viên (nhóm tối thiểu 3 người bao gồm bạn)');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleCreate = async () => {
    if (!groupName.trim()) {
      setError('Vui lòng đặt tên nhóm');
      return;
    }
    setIsCreating(true);
    setError('');
    try {
      const groupIds = selectedUsers.map(u => u._id);
      const conversation = await createGroup(groupIds, groupName.trim());
      onGroupCreated(conversation);
      onClose();
    } catch (err) {
      if (err.message === 'Group must be at least 3 members') {
        setError('Nhóm phải có ít nhất 3 thành viên');
      } else if (err.message === 'Some user not found.') {
        setError('Một số người dùng không tồn tại');
      } else if (Array.isArray(err.message)) {
        setError(err.message.join(', '));
      } else {
        setError(err.message || 'Không thể tạo nhóm');
      }
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div style={s.backdrop} onClick={onClose} />
      <div style={s.modal}>
        {/* Header */}
        <div style={s.header}>
          <div style={s.headerLeft}>
            <div style={s.iconBadge}><Users size={18} /></div>
            <div>
              <h3 style={s.title}>Tạo nhóm mới</h3>
              <p style={s.subtitle}>
                {step === 1
                  ? `Đã chọn ${selectedUsers.length} thành viên`
                  : `${selectedUsers.length + 1} thành viên`}
              </p>
            </div>
          </div>
          <button onClick={onClose} style={s.closeBtn}><X size={20} /></button>
        </div>

        {/* Step indicator */}
        <div style={s.stepRow}>
          {[1, 2].map(n => (
            <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ ...s.stepDot, ...(step >= n ? s.stepDotActive : {}) }}>
                {step > n ? <Check size={12} /> : n}
              </div>
              <span style={{ ...s.stepLabel, ...(step >= n ? s.stepLabelActive : {}) }}>
                {n === 1 ? 'Chọn thành viên' : 'Đặt tên nhóm'}
              </span>
              {n < 2 && <div style={s.stepLine} />}
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div style={s.errorBox}>
            <AlertCircle size={16} color="#dc2626" />
            <span style={s.errorText}>{error}</span>
          </div>
        )}

        {/* Content */}
        <div style={s.content}>
          {step === 1 ? (
            <>
              {/* Selected chips */}
              {selectedUsers.length > 0 && (
                <div style={s.chips}>
                  {selectedUsers.map(u => (
                    <div key={u._id} style={s.chip}>
                      <span style={s.chipName}>{u.name}</span>
                      <button onClick={() => toggleUser(u)} style={s.chipRemove}>
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Search */}
              <div style={s.searchBox}>
                <Search size={16} style={s.searchIcon} />
                <input
                  placeholder="Tìm kiếm người dùng..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={s.searchInput}
                  autoFocus
                />
              </div>

              {/* User list */}
              <div style={s.userList}>
                {isLoading ? (
                  <div style={s.center}><span style={s.spinner}>⟳</span> Đang tải...</div>
                ) : filteredUsers.length === 0 ? (
                  <div style={s.center}>Không tìm thấy người dùng</div>
                ) : (
                  filteredUsers.map(user => {
                    const isSelected = selectedUsers.some(u => u._id === user._id);
                    return (
                      <div
                        key={user._id}
                        onClick={() => toggleUser(user)}
                        style={{ ...s.userItem, ...(isSelected ? s.userItemSelected : {}) }}
                      >
                        <div style={s.userAvatar}>
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <span style={s.userName}>{user.name}</span>
                        <div style={{ ...s.checkbox, ...(isSelected ? s.checkboxActive : {}) }}>
                          {isSelected && <Check size={14} color="white" />}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          ) : (
            /* Step 2: Group name */
            <div style={s.nameStep}>
              <div style={s.groupIconPreview}>
                <Users size={40} color="#764ba2" />
              </div>
              <p style={s.nameLabel}>Tên nhóm</p>
              <input
                autoFocus
                placeholder="Ví dụ: Team dự án, Bạn thân..."
                value={groupName}
                onChange={e => setGroupName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
                style={s.nameInput}
              />
              <div style={s.memberPreview}>
                {selectedUsers.slice(0, 5).map(u => (
                  <div key={u._id} style={s.memberChip}>
                    <div style={s.memberAvatar}>{u.name.charAt(0).toUpperCase()}</div>
                    <span style={s.memberChipName}>{u.name.split(' ').pop()}</span>
                  </div>
                ))}
                {selectedUsers.length > 5 && (
                  <div style={s.memberChip}>
                    <div style={{ ...s.memberAvatar, backgroundColor: '#e5e7eb', color: '#6b7280' }}>
                      +{selectedUsers.length - 5}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={s.footer}>
          {step === 2 && (
            <button onClick={() => { setStep(1); setError(''); }} style={s.backBtn}>
              Quay lại
            </button>
          )}
          <button onClick={onClose} style={s.cancelBtn}>Hủy</button>
          {step === 1 ? (
            <button
              onClick={handleNext}
              disabled={selectedUsers.length < 2}
              style={{ ...s.primaryBtn, ...(selectedUsers.length < 2 ? s.disabledBtn : {}) }}
            >
              Tiếp theo ({selectedUsers.length})
            </button>
          ) : (
            <button
              onClick={handleCreate}
              disabled={isCreating || !groupName.trim()}
              style={{ ...s.primaryBtn, ...(isCreating || !groupName.trim() ? s.disabledBtn : {}) }}
            >
              {isCreating ? '⟳ Đang tạo...' : 'Tạo nhóm'}
            </button>
          )}
        </div>
      </div>
    </>
  );
}

const s = {
  backdrop: {
    position: 'fixed', inset: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9998,
  },
  modal: {
    position: 'fixed', top: '50%', left: '50%',
    transform: 'translate(-50%,-50%)',
    backgroundColor: 'white', borderRadius: 16,
    boxShadow: '0 24px 64px rgba(0,0,0,0.25)',
    width: '90%', maxWidth: 520,
    maxHeight: '85vh', display: 'flex', flexDirection: 'column',
    zIndex: 9999,
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '20px 24px', borderBottom: '1px solid #f3f4f6',
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 12 },
  iconBadge: {
    width: 40, height: 40, borderRadius: 10,
    background: 'linear-gradient(135deg,#667eea,#764ba2)',
    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  title: { fontSize: 17, fontWeight: 700, color: '#111827', margin: 0 },
  subtitle: { fontSize: 12, color: '#9ca3af', margin: '2px 0 0 0' },
  closeBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    color: '#9ca3af', padding: 4, display: 'flex', borderRadius: 6,
  },
  stepRow: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '14px 24px', backgroundColor: '#fafafa',
    borderBottom: '1px solid #f3f4f6',
  },
  stepDot: {
    width: 24, height: 24, borderRadius: '50%',
    backgroundColor: '#e5e7eb', color: '#9ca3af',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 12, fontWeight: 600, flexShrink: 0,
  },
  stepDotActive: {
    background: 'linear-gradient(135deg,#667eea,#764ba2)', color: 'white',
  },
  stepLabel: { fontSize: 12, color: '#9ca3af', whiteSpace: 'nowrap' },
  stepLabelActive: { color: '#764ba2', fontWeight: 600 },
  stepLine: { width: 32, height: 2, backgroundColor: '#e5e7eb' },
  errorBox: {
    display: 'flex', alignItems: 'center', gap: 8,
    margin: '12px 24px 0', padding: '10px 14px',
    backgroundColor: '#fef2f2', borderRadius: 8,
    border: '1px solid #fecaca',
  },
  errorText: { fontSize: 13, color: '#dc2626' },
  content: { flex: 1, overflowY: 'auto', padding: '16px 24px' },
  chips: {
    display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12,
  },
  chip: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '4px 10px', backgroundColor: '#ede9fe',
    borderRadius: 20, border: '1px solid #c4b5fd',
  },
  chipName: { fontSize: 13, color: '#5b21b6', fontWeight: 500 },
  chipRemove: {
    background: 'none', border: 'none', cursor: 'pointer',
    color: '#7c3aed', padding: 0, display: 'flex', alignItems: 'center',
  },
  searchBox: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '10px 14px', backgroundColor: '#f9fafb',
    borderRadius: 10, border: '1px solid #e5e7eb', marginBottom: 12,
  },
  searchIcon: { color: '#9ca3af', flexShrink: 0 },
  searchInput: {
    flex: 1, border: 'none', outline: 'none',
    backgroundColor: 'transparent', fontSize: 14, color: '#111827',
  },
  userList: { display: 'flex', flexDirection: 'column', gap: 4 },
  userItem: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
    transition: 'background 0.15s', border: '1px solid transparent',
  },
  userItemSelected: {
    backgroundColor: '#faf5ff', borderColor: '#e9d5ff',
  },
  userAvatar: {
    width: 36, height: 36, borderRadius: '50%',
    background: 'linear-gradient(135deg,#667eea,#764ba2)',
    color: 'white', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: 14, fontWeight: 700, flexShrink: 0,
  },
  userName: { flex: 1, fontSize: 14, fontWeight: 500, color: '#111827' },
  checkbox: {
    width: 22, height: 22, borderRadius: 6,
    border: '2px solid #d1d5db', display: 'flex',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  checkboxActive: {
    background: 'linear-gradient(135deg,#667eea,#764ba2)', borderColor: 'transparent',
  },
  center: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '40px 0', color: '#9ca3af', fontSize: 14, gap: 8,
  },
  spinner: { fontSize: 20 },
  nameStep: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '20px 0',
  },
  groupIconPreview: {
    width: 80, height: 80, borderRadius: 24,
    backgroundColor: '#faf5ff', border: '2px dashed #c4b5fd',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  nameLabel: { fontSize: 14, fontWeight: 600, color: '#374151', margin: 0, alignSelf: 'flex-start' },
  nameInput: {
    width: '100%', padding: '12px 16px', fontSize: 15,
    border: '1px solid #d1d5db', borderRadius: 10, outline: 'none',
    fontFamily: 'inherit', transition: 'border 0.2s',
    boxSizing: 'border-box',
  },
  memberPreview: {
    display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center',
  },
  memberChip: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 },
  memberAvatar: {
    width: 40, height: 40, borderRadius: '50%',
    background: 'linear-gradient(135deg,#667eea,#764ba2)',
    color: 'white', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: 14, fontWeight: 700,
  },
  memberChipName: { fontSize: 11, color: '#6b7280' },
  footer: {
    display: 'flex', gap: 8, padding: '16px 24px',
    borderTop: '1px solid #f3f4f6', justifyContent: 'flex-end',
  },
  backBtn: {
    padding: '9px 16px', border: '1px solid #e5e7eb', borderRadius: 8,
    backgroundColor: 'white', color: '#6b7280', fontSize: 14,
    fontWeight: 500, cursor: 'pointer',
  },
  cancelBtn: {
    padding: '9px 16px', border: '1px solid #e5e7eb', borderRadius: 8,
    backgroundColor: 'white', color: '#6b7280', fontSize: 14,
    fontWeight: 500, cursor: 'pointer',
  },
  primaryBtn: {
    padding: '9px 20px', border: 'none', borderRadius: 8,
    background: 'linear-gradient(135deg,#667eea,#764ba2)',
    color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer',
  },
  disabledBtn: { opacity: 0.45, cursor: 'not-allowed' },
};