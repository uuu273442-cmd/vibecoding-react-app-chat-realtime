// Đường dẫn: src/components/Chat/GroupInfo.jsx
// UPDATED: fix requests loading, keep panel open on action, private tabs, multi-remove

import React, { useState, useEffect, useCallback } from 'react';
import {
  X, Users, Image as ImageIcon, File, Link,
  Crown, Shield, User, UserMinus, LogOut,
  ChevronDown, ChevronUp, MoreVertical, Clock,
  Check, AlertCircle, Download, ExternalLink, Trash2,
} from 'lucide-react';
import {
  getConversationInfo,
  getConversationMedia,
  getConversationFiles,
  getConversationLinks,
  removeGroupMembers,
  changeGroupMemberRole,
  leaveGroup,
  getGroupRequests,
  handleGroupRequest,
  getConversationPins,
} from '../../services/groupService';
import { getCurrentUserId } from '../../utils/chatHelpers';

const GROUP_TABS = ['Thành viên', 'Ảnh/Video', 'File', 'Link', 'Pins'];
const PRIVATE_TABS = ['Thành viên', 'Ảnh/Video', 'File', 'Link'];

export default function GroupInfo({ conversation, onClose, onConversationUpdate, onLeave, reloadRef }) {
  const [activeTab, setActiveTab] = useState(0);
  const [info, setInfo] = useState(null);
  const [media, setMedia] = useState({});
  const [files, setFiles] = useState({});
  const [links, setLinks] = useState({});
  const [pins, setPins] = useState([]);
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [expandedYears, setExpandedYears] = useState({});

  const currentUserId = getCurrentUserId();
  const isGroup = conversation?.type === 'group';
  const TABS = isGroup ? GROUP_TABS : PRIVATE_TABS;

  // Compute role from loaded info
  const currentUserRole = info?.participants?.find(p => {
    const uid = typeof p.userId === 'string' ? p.userId : p.userId?._id;
    return uid === currentUserId;
  })?.role;
  const isAdminOrOwner = currentUserRole === 'admin' || currentUserRole === 'owner';

  // ── Khai báo tất cả load functions TRƯỚC useEffect ────────────────────────
  const loadInfo = React.useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await getConversationInfo(conversation._id);
      setInfo(data);
    } catch {
      setError('Không thể tải thông tin');
    } finally {
      setIsLoading(false);
    }
  }, [conversation._id]);

  const loadMedia = async () => {
    try { const d = await getConversationMedia(conversation._id); setMedia(d); } catch {}
  };
  const loadFiles = async () => {
    try { const d = await getConversationFiles(conversation._id); setFiles(d); } catch {}
  };
  const loadLinks = async () => {
    try { const d = await getConversationLinks(conversation._id); setLinks(d); } catch {}
  };
  const loadPins = async () => {
    try { const d = await getConversationPins(conversation._id); setPins(d); } catch {}
  };

  // ── useEffect SAU khi tất cả functions đã được khai báo ─────────────────
  useEffect(() => {
    if (conversation?._id) loadInfo();
  }, [conversation?._id]);

  // Expose loadInfo ra ngoài qua reloadRef (ChatWindow dùng khi nhận socket events)
  useEffect(() => {
    if (reloadRef) reloadRef.current = loadInfo;
  }, [reloadRef, loadInfo]);

  // Khi ChatWindow update conversation qua socket → reload để lấy userId objects đầy đủ
  useEffect(() => {
    if (!conversation?._id || isLoading) return;
    const newCount = conversation.participants?.length;
    const currentCount = info?.participants?.length;
    if (newCount !== currentCount && newCount !== undefined) {
      loadInfo();
    }
  }, [conversation?.participants?.length]);

  // Load requests AFTER info is loaded and role is known
  useEffect(() => {
    if (info && isGroup && isAdminOrOwner) {
      getGroupRequests(conversation._id)
        .then(setRequests)
        .catch(() => setRequests([]));
    }
  }, [info, isAdminOrOwner]);

  // Nhận CustomEvent từ ChatLayout khi có join request mới (user room event)
  useEffect(() => {
    if (!isGroup || !isAdminOrOwner) return;
    const handleJoinRequestEvent = (e) => {
      if (e.detail?.conversationId !== conversation._id) return;
      // Reload requests list
      getGroupRequests(conversation._id)
        .then(setRequests)
        .catch(() => {});
    };
    window.addEventListener('group_join_requested', handleJoinRequestEvent);
    return () => window.removeEventListener('group_join_requested', handleJoinRequestEvent);
  }, [conversation._id, isGroup, isAdminOrOwner]);

  useEffect(() => {
    setActionError('');
    setActionSuccess('');
    if (activeTab === 1 && Object.keys(media).length === 0) loadMedia();
    if (activeTab === 2 && Object.keys(files).length === 0) loadFiles();
    if (activeTab === 3 && Object.keys(links).length === 0) loadLinks();
    if (activeTab === 4 && pins.length === 0) loadPins();
  }, [activeTab]);

  const showAction = (err, ok) => {
    setActionError(err || '');
    setActionSuccess(ok || '');
    if (ok) setTimeout(() => setActionSuccess(''), 3000);
  };

  const handleRemoveMembers = async (userIds) => {
    setActionError(''); setActionSuccess('');
    try {
      const updated = await removeGroupMembers(conversation._id, userIds);
      // Re-fetch để có userId objects đầy đủ (API response chỉ trả string ID)
      await loadInfo();
      onConversationUpdate?.(updated);
      showAction('', `Đã xóa ${userIds.length} thành viên`);
    } catch (err) {
      const msg = err.message;
      if (msg === 'User role must be a owner or admin!') showAction('Bạn không có quyền xóa thành viên');
      else if (msg === "Can't remove member for this conversation!") showAction('Không thể xóa thành viên này');
      else showAction(msg || 'Không thể xóa thành viên');
    }
  };

  const handleChangeRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'member' : 'admin';
    setActionError(''); setActionSuccess('');
    try {
      const updated = await changeGroupMemberRole(conversation._id, userId, newRole);
      // Re-fetch để có userId objects đầy đủ
      await loadInfo();
      onConversationUpdate?.(updated);
      showAction('', `Đã ${newRole === 'admin' ? 'thăng lên Admin' : 'hạ xuống Thành viên'}`);
    } catch (err) {
      showAction(err.message || 'Không thể thay đổi vai trò');
    }
  };

  const handleLeave = async () => {
    if (!window.confirm('Bạn có chắc muốn rời khỏi nhóm này?')) return;
    setActionError('');
    try {
      await leaveGroup(conversation._id);
      onLeave?.();
    } catch (err) {
      showAction(err.message || 'Không thể rời nhóm');
    }
  };

  const handleRequest = async (requestId, action) => {
    setActionError('');
    try {
      const result = await handleGroupRequest(conversation._id, requestId, action);
      setRequests(prev => prev.filter(r => r._id !== requestId));
      if (action === 'accept' && result?.participants) {
        // Re-fetch để có userId objects đầy đủ
        await loadInfo();
        onConversationUpdate?.(result);
      }
      showAction('', action === 'accept' ? 'Đã chấp nhận yêu cầu' : 'Đã từ chối yêu cầu');
    } catch (err) {
      showAction(err.message || 'Không thể xử lý yêu cầu');
    }
  };

  const toggleYear = (key) => {
    setExpandedYears(prev => ({ ...prev, [key]: prev[key] === false ? true : false }));
  };

  const getRoleIcon = (role) => {
    if (role === 'owner') return <Crown size={13} color="#f59e0b" />;
    if (role === 'admin') return <Shield size={13} color="#3b82f6" />;
    return null;
  };
  const getRoleLabel = (role) => {
    if (role === 'owner') return 'Chủ nhóm';
    if (role === 'admin') return 'Quản trị';
    return 'Thành viên';
  };

  const flattenGrouped = (obj) => {
    const items = [];
    Object.entries(obj).sort((a, b) => b[0] - a[0]).forEach(([year, months]) => {
      Object.entries(months).sort((a, b) => b[0] - a[0]).forEach(([month, list]) => {
        items.push({ year, month, list });
      });
    });
    return items;
  };

  if (!conversation) return null;

  return (
    <div style={s.overlay}>
      <div style={s.panel}>
        <div style={s.header}>
          <h3 style={s.headerTitle}>
            {isGroup ? 'Thông tin nhóm' : 'Thông tin hội thoại'}
          </h3>
          <button onClick={onClose} style={s.closeBtn}><X size={20} /></button>
        </div>

        {isLoading ? (
          <div style={s.center}><span style={s.spin}>⟳</span> Đang tải...</div>
        ) : error ? (
          <div style={s.center}>{error}</div>
        ) : (
          <>
            <div style={s.convInfo}>
              <div style={s.convAvatar}>
                {isGroup ? <Users size={32} color="white" /> : <User size={32} color="white" />}
              </div>
              <h2 style={s.convName}>{info?.name || (isGroup ? 'Nhóm chat' : 'Hội thoại')}</h2>
              <p style={s.convSub}>
                {isGroup
                  ? `${info?.participants?.length || 0} thành viên`
                  : info?.participants?.find(p => {
                      const uid = typeof p.userId === 'string' ? p.userId : p.userId?._id;
                      return uid !== currentUserId;
                    })?.userId?.status === 'online' ? '🟢 Đang hoạt động' : '⚫ Không hoạt động'
                }
              </p>
            </div>

            {/* Action feedback */}
            {actionError && (
              <div style={s.alertError}>
                <AlertCircle size={14} /><span>{actionError}</span>
              </div>
            )}
            {actionSuccess && (
              <div style={s.alertSuccess}>
                <Check size={14} /><span>{actionSuccess}</span>
              </div>
            )}

            {/* Tabs */}
            <div style={s.tabs}>
              {TABS.map((tab, i) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(i)}
                  style={{ ...s.tab, ...(activeTab === i ? s.tabActive : {}) }}
                >
                  {tab}
                  {i === 0 && isGroup && isAdminOrOwner && requests.length > 0 && (
                    <span style={s.reqBadge}>{requests.length}</span>
                  )}
                </button>
              ))}
            </div>

            <div style={s.tabContent}>
              {activeTab === 0 && (
                <MembersTab
                  info={info}
                  requests={requests}
                  currentUserId={currentUserId}
                  isAdminOrOwner={isAdminOrOwner}
                  isGroup={isGroup}
                  getRoleIcon={getRoleIcon}
                  getRoleLabel={getRoleLabel}
                  onRemoveMembers={handleRemoveMembers}
                  onChangeRole={handleChangeRole}
                  onLeave={handleLeave}
                  onHandleRequest={handleRequest}
                />
              )}
              {activeTab === 1 && (
                <MediaTab grouped={media} flattenGrouped={flattenGrouped} expandedYears={expandedYears} toggleYear={toggleYear} />
              )}
              {activeTab === 2 && (
                <FilesTab grouped={files} flattenGrouped={flattenGrouped} expandedYears={expandedYears} toggleYear={toggleYear} />
              )}
              {activeTab === 3 && (
                <LinksTab grouped={links} flattenGrouped={flattenGrouped} expandedYears={expandedYears} toggleYear={toggleYear} />
              )}
              {activeTab === 4 && isGroup && (
                <PinsTab pins={pins} />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ---- MEMBERS TAB ----
function MembersTab({ info, requests, currentUserId, isAdminOrOwner, isGroup, getRoleIcon, getRoleLabel, onRemoveMembers, onChangeRole, onLeave, onHandleRequest }) {
  const [openMenu, setOpenMenu] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [multiSelectMode, setMultiSelectMode] = useState(false);

  const toggleSelect = (userId) => {
    setSelectedIds(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleBulkRemove = () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Xóa ${selectedIds.length} thành viên khỏi nhóm?`)) return;
    onRemoveMembers(selectedIds);
    setSelectedIds([]);
    setMultiSelectMode(false);
  };

  return (
    <div style={s.section}>
      {/* Pending join requests */}
      {isAdminOrOwner && isGroup && requests.length > 0 && (
        <div style={s.requestsBlock}>
          <h4 style={s.sectionTitle}><Clock size={13} /> Yêu cầu tham gia ({requests.length})</h4>
          {requests.map(req => (
            <div key={req._id} style={s.requestItem}>
              <div style={s.memberAvatar}>{req.userId?.name?.charAt(0)?.toUpperCase()}</div>
              <div style={s.memberInfo}>
                <p style={s.memberName}>{req.userId?.name}</p>
                {req.description && <p style={s.memberSub}>"{req.description}"</p>}
                <p style={s.memberSub}>Được thêm bởi {req.actor?.name}</p>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => onHandleRequest(req._id, 'accept')} style={s.acceptBtn}><Check size={14} /></button>
                <button onClick={() => onHandleRequest(req._id, 'reject')} style={s.rejectBtn}><X size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Members header with multi-select toggle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '8px 0' }}>
        <h4 style={s.sectionTitle}><Users size={13} /> Thành viên ({info?.participants?.length || 0})</h4>
        {isAdminOrOwner && isGroup && (
          <div style={{ display: 'flex', gap: 6 }}>
            {multiSelectMode && selectedIds.length > 0 && (
              <button onClick={handleBulkRemove} style={s.bulkRemoveBtn}>
                <Trash2 size={13} /> Xóa ({selectedIds.length})
              </button>
            )}
            <button
              onClick={() => { setMultiSelectMode(!multiSelectMode); setSelectedIds([]); }}
              style={s.multiSelectToggle}
            >
              {multiSelectMode ? 'Hủy' : 'Chọn nhiều'}
            </button>
          </div>
        )}
      </div>

      {info?.participants?.map(p => {
        const user = typeof p.userId === 'object' ? p.userId : { _id: p.userId, name: 'Unknown' };
        const isMe = user?._id === currentUserId;
        const canManage = isAdminOrOwner && isGroup && !isMe && p.role !== 'owner';
        const isSelected = selectedIds.includes(user?._id);

        return (
          <div
            key={p._id}
            onClick={multiSelectMode && canManage ? () => toggleSelect(user?._id) : undefined}
            style={{
              ...s.memberRow,
              ...(multiSelectMode && canManage ? { cursor: 'pointer' } : {}),
              ...(isSelected ? { backgroundColor: '#faf5ff' } : {}),
            }}
          >
            {/* Multi-select checkbox */}
            {multiSelectMode && canManage && (
              <div style={{ ...s.checkbox, ...(isSelected ? s.checkboxActive : {}) }}>
                {isSelected && <Check size={11} color="white" />}
              </div>
            )}

            <div style={s.memberAvatar}>{user?.name?.charAt(0)?.toUpperCase()}</div>
            <div style={s.memberInfo}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <p style={s.memberName}>{user?.name}{isMe ? ' (Bạn)' : ''}</p>
                {getRoleIcon(p.role)}
              </div>
              <p style={s.memberSub}>{getRoleLabel(p.role)}</p>
            </div>

            {/* Single-member action menu */}
            {!multiSelectMode && canManage && (
              <div style={{ position: 'relative' }}>
                <button onClick={() => setOpenMenu(openMenu === p._id ? null : p._id)} style={s.menuBtn}>
                  <MoreVertical size={16} />
                </button>
                {openMenu === p._id && (
                  <>
                    <div style={s.menuBackdrop} onClick={() => setOpenMenu(null)} />
                    <div style={s.dropdown}>
                      <button
                        onClick={() => { onChangeRole(user._id, p.role); setOpenMenu(null); }}
                        style={s.dropItem}
                      >
                        <Shield size={13} />
                        {p.role === 'admin' ? 'Hạ xuống thành viên' : 'Thăng lên Admin'}
                      </button>
                      <div style={s.dropDivider} />
                      <button
                        onClick={() => { onRemoveMembers([user._id]); setOpenMenu(null); }}
                        style={{ ...s.dropItem, color: '#dc2626' }}
                      >
                        <UserMinus size={13} /> Xóa khỏi nhóm
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Leave group button */}
      {isGroup && (
        <button onClick={onLeave} style={s.leaveBtn}>
          <LogOut size={15} /> Rời khỏi nhóm
        </button>
      )}
    </div>
  );
}

// ---- MEDIA TAB ----
function MediaTab({ grouped, flattenGrouped, expandedYears, toggleYear }) {
  const sections = flattenGrouped(grouped);
  if (sections.length === 0) return <div style={s.empty}>Chưa có ảnh hoặc video nào</div>;
  return (
    <div style={s.section}>
      {sections.map(({ year, month, list }) => {
        const key = `${year}-${month}`;
        const isOpen = expandedYears[key] !== false;
        return (
          <div key={key} style={s.yearBlock}>
            <button onClick={() => toggleYear(key)} style={s.yearHeader}>
              <span style={s.yearLabel}>Tháng {month}/{year}</span>
              <span style={s.yearCount}>{list.length} mục</span>
              {isOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>
            {isOpen && (
              <div style={s.mediaGrid}>
                {list.map(item => (
                  <a key={item._id} href={item.url} target="_blank" rel="noreferrer" style={s.mediaItem}>
                    {item.type === 'image' ? (
                      <img src={item.thumbnail || item.url} alt={item.originalName} style={s.mediaImg} />
                    ) : (
                      <div style={s.videoThumb}>
                        <ImageIcon size={22} color="#9ca3af" />
                        <span style={s.videoLabel}>Video</span>
                      </div>
                    )}
                  </a>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ---- FILES TAB ----
function FilesTab({ grouped, flattenGrouped, expandedYears, toggleYear }) {
  const sections = flattenGrouped(grouped);
  if (sections.length === 0) return <div style={s.empty}>Chưa có file nào được chia sẻ</div>;
  const fmtSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };
  return (
    <div style={s.section}>
      {sections.map(({ year, month, list }) => {
        const key = `${year}-${month}`;
        const isOpen = expandedYears[key] !== false;
        return (
          <div key={key} style={s.yearBlock}>
            <button onClick={() => toggleYear(key)} style={s.yearHeader}>
              <span style={s.yearLabel}>Tháng {month}/{year}</span>
              <span style={s.yearCount}>{list.length} file</span>
              {isOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>
            {isOpen && list.map(file => (
              <a key={file._id} href={file.url} download={file.originalName} target="_blank" rel="noreferrer" style={s.fileRow}>
                <div style={s.fileIcon}><File size={17} color="#764ba2" /></div>
                <div style={s.fileInfo}>
                  <p style={s.fileName}>{file.originalName}</p>
                  <p style={s.fileMeta}>{fmtSize(file.size)}</p>
                </div>
                <Download size={15} color="#9ca3af" />
              </a>
            ))}
          </div>
        );
      })}
    </div>
  );
}

// ---- LINKS TAB ----
function LinksTab({ grouped, flattenGrouped, expandedYears, toggleYear }) {
  const sections = flattenGrouped(grouped);
  if (sections.length === 0) return <div style={s.empty}>Chưa có link nào được chia sẻ</div>;
  const getDomain = (url) => { try { return new URL(url).hostname; } catch { return url; } };
  return (
    <div style={s.section}>
      {sections.map(({ year, month, list }) => {
        const key = `${year}-${month}`;
        const isOpen = expandedYears[key] !== false;
        return (
          <div key={key} style={s.yearBlock}>
            <button onClick={() => toggleYear(key)} style={s.yearHeader}>
              <span style={s.yearLabel}>Tháng {month}/{year}</span>
              <span style={s.yearCount}>{list.length} link</span>
              {isOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>
            {isOpen && list.map(link => (
              <a key={link._id} href={link.url} target="_blank" rel="noreferrer" style={s.linkRow}>
                {link.image && (
                  <img src={link.image} alt={link.title} style={s.linkThumb} onError={e => e.target.style.display = 'none'} />
                )}
                <div style={s.linkInfo}>
                  <p style={s.linkTitle}>{link.title || link.url}</p>
                  {link.description && <p style={s.linkDesc}>{link.description}</p>}
                  <p style={s.linkDomain}>{getDomain(link.url)}</p>
                </div>
                <ExternalLink size={13} color="#9ca3af" style={{ flexShrink: 0 }} />
              </a>
            ))}
          </div>
        );
      })}
    </div>
  );
}

// ---- PINS TAB ----
function PinsTab({ pins }) {
  const formatTime = (d) => new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

  if (!pins || pins.length === 0) {
    return <div style={s.empty}>Chưa có tin nhắn nào được ghim</div>;
  }

  return (
    <div style={{ padding: '10px 14px' }}>
      {pins.map(msg => (
        <div key={msg._id} style={pinStyle.row}>
          <div style={pinStyle.avatarWrap}>
            {msg.senderId?.avatar ? (
              <img src={msg.senderId.avatar} alt="" style={pinStyle.avatar} />
            ) : (
              <div style={pinStyle.avatarFallback}>
                {(msg.senderId?.name || 'U').charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div style={pinStyle.content}>
            <div style={pinStyle.meta}>
              <span style={pinStyle.name}>{msg.senderId?.name || 'Unknown'}</span>
              <span style={pinStyle.time}>{formatTime(msg.pinnedAt || msg.createdAt)}</span>
            </div>
            <p style={pinStyle.text}>
              {msg.isDeleted ? <em style={{ color: '#9ca3af' }}>Tin nhắn đã bị xóa</em> : msg.content || `[${msg.type}]`}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

const pinStyle = {
  row: { display: 'flex', gap: 10, padding: '9px 0', borderBottom: '1px solid #f3f4f6' },
  avatarWrap: { width: 32, height: 32, borderRadius: '50%', overflow: 'hidden', flexShrink: 0 },
  avatar: { width: '100%', height: '100%', objectFit: 'cover' },
  avatarFallback: { width: '100%', height: '100%', background: 'linear-gradient(135deg,#667eea,#764ba2)', color: 'white', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1, minWidth: 0 },
  meta: { display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 },
  name: { fontSize: 13, fontWeight: 600, color: '#111827' },
  time: { fontSize: 11, color: '#9ca3af' },
  text: { fontSize: 13, color: '#374151', margin: 0, wordBreak: 'break-word', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' },
};

// ---- STYLES ----
const s = {
  overlay: { position: 'fixed', inset: 0, zIndex: 9990, display: 'flex', justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.3)' },
  panel: { width: 340, backgroundColor: 'white', height: '100%', display: 'flex', flexDirection: 'column', boxShadow: '-4px 0 20px rgba(0,0,0,0.12)' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid #f3f4f6', flexShrink: 0 },
  headerTitle: { fontSize: 16, fontWeight: 700, color: '#111827', margin: 0 },
  closeBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 4, display: 'flex', borderRadius: 6 },
  center: { display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, color: '#9ca3af', fontSize: 14, gap: 8 },
  spin: { fontSize: 20 },
  convInfo: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '20px 20px 14px', flexShrink: 0 },
  convAvatar: { width: 68, height: 68, borderRadius: 18, background: 'linear-gradient(135deg,#667eea,#764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  convName: { fontSize: 17, fontWeight: 700, color: '#111827', margin: 0, textAlign: 'center' },
  convSub: { fontSize: 13, color: '#9ca3af', margin: 0 },
  alertError: { display: 'flex', alignItems: 'center', gap: 7, margin: '0 16px 6px', padding: '8px 12px', backgroundColor: '#fef2f2', borderRadius: 8, fontSize: 13, color: '#dc2626', flexShrink: 0, border: '1px solid #fecaca' },
  alertSuccess: { display: 'flex', alignItems: 'center', gap: 7, margin: '0 16px 6px', padding: '8px 12px', backgroundColor: '#f0fdf4', borderRadius: 8, fontSize: 13, color: '#16a34a', flexShrink: 0, border: '1px solid #bbf7d0' },
  tabs: { display: 'flex', borderBottom: '1px solid #f3f4f6', flexShrink: 0, overflowX: 'auto' },
  tab: { flex: 1, padding: '10px 4px', border: 'none', backgroundColor: 'transparent', fontSize: 12, fontWeight: 500, color: '#9ca3af', cursor: 'pointer', borderBottom: '2px solid transparent', transition: 'all 0.15s', position: 'relative', whiteSpace: 'nowrap' },
  tabActive: { color: '#764ba2', borderBottomColor: '#764ba2' },
  reqBadge: { position: 'absolute', top: 4, right: 2, width: 16, height: 16, borderRadius: '50%', backgroundColor: '#ef4444', color: 'white', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  tabContent: { flex: 1, overflowY: 'auto' },
  section: { padding: '10px 14px', display: 'flex', flexDirection: 'column' },
  sectionTitle: { display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 },
  requestsBlock: { backgroundColor: '#fffbeb', borderRadius: 10, padding: '10px 12px', marginBottom: 10, border: '1px solid #fde68a' },
  requestItem: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 },
  memberRow: { display: 'flex', alignItems: 'center', gap: 10, padding: '7px 6px', borderRadius: 8 },
  memberAvatar: { width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#667eea,#764ba2)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 },
  memberInfo: { flex: 1, minWidth: 0 },
  memberName: { fontSize: 14, fontWeight: 600, color: '#111827', margin: 0 },
  memberSub: { fontSize: 12, color: '#9ca3af', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  menuBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 4, borderRadius: 6, display: 'flex' },
  menuBackdrop: { position: 'fixed', inset: 0, zIndex: 99 },
  dropdown: { position: 'absolute', right: 0, top: '100%', zIndex: 100, backgroundColor: 'white', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.15)', padding: 6, minWidth: 190 },
  dropItem: { display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', fontSize: 13, color: '#374151', borderRadius: 6, textAlign: 'left' },
  dropDivider: { height: 1, backgroundColor: '#f3f4f6', margin: '4px 0' },
  acceptBtn: { width: 28, height: 28, borderRadius: '50%', backgroundColor: '#d1fae5', border: 'none', color: '#10b981', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  rejectBtn: { width: 28, height: 28, borderRadius: '50%', backgroundColor: '#fee2e2', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  checkbox: { width: 18, height: 18, borderRadius: 4, border: '2px solid #d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  checkboxActive: { background: 'linear-gradient(135deg,#667eea,#764ba2)', borderColor: 'transparent' },
  multiSelectToggle: { fontSize: 12, padding: '3px 10px', border: '1px solid #e5e7eb', borderRadius: 6, background: 'none', cursor: 'pointer', color: '#6b7280' },
  bulkRemoveBtn: { display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, padding: '3px 10px', border: '1px solid #fecaca', borderRadius: 6, background: '#fef2f2', cursor: 'pointer', color: '#dc2626' },
  leaveBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', marginTop: 16, padding: '10px 0', border: '1px solid #fecaca', borderRadius: 10, backgroundColor: 'white', color: '#dc2626', fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  empty: { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', color: '#9ca3af', fontSize: 14 },
  yearBlock: { marginBottom: 10 },
  yearHeader: { display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '7px 4px', background: 'none', border: 'none', cursor: 'pointer', color: '#374151' },
  yearLabel: { fontSize: 13, fontWeight: 700, flex: 1, textAlign: 'left' },
  yearCount: { fontSize: 12, color: '#9ca3af' },
  mediaGrid: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 4, marginTop: 8 },
  mediaItem: { aspectRatio: '1', borderRadius: 7, overflow: 'hidden', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  mediaImg: { width: '100%', height: '100%', objectFit: 'cover' },
  videoThumb: { width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3 },
  videoLabel: { fontSize: 10, color: '#9ca3af' },
  fileRow: { display: 'flex', alignItems: 'center', gap: 10, padding: '9px 8px', borderRadius: 8, textDecoration: 'none', backgroundColor: '#f9fafb', marginBottom: 6, border: '1px solid #f3f4f6' },
  fileIcon: { width: 34, height: 34, borderRadius: 8, backgroundColor: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  fileInfo: { flex: 1, minWidth: 0 },
  fileName: { fontSize: 13, fontWeight: 500, color: '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  fileMeta: { fontSize: 11, color: '#9ca3af', margin: 0 },
  linkRow: { display: 'flex', alignItems: 'flex-start', gap: 10, padding: '9px 8px', borderRadius: 8, textDecoration: 'none', backgroundColor: '#f9fafb', marginBottom: 6, border: '1px solid #f3f4f6' },
  linkThumb: { width: 44, height: 44, borderRadius: 6, objectFit: 'cover', flexShrink: 0 },
  linkInfo: { flex: 1, minWidth: 0 },
  linkTitle: { fontSize: 13, fontWeight: 600, color: '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  linkDesc: { fontSize: 11, color: '#6b7280', margin: '2px 0 0', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' },
  linkDomain: { fontSize: 11, color: '#9ca3af', margin: '3px 0 0' },
};