// Đường dẫn: src/components/Chat/ArchivedChats.jsx

import React, { useState, useEffect } from 'react';
import { Archive, ArchiveRestore, User, Users, X, Loader } from 'lucide-react';
import { getArchivedConversations, unarchiveConversation } from '../../services/privacyService';
import { getConversationName, getConversationAvatar, getCurrentUserId } from '../../utils/chatHelpers';

export default function ArchivedChats({ onClose, onConversationSelect }) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unarchiving, setUnarchiving] = useState(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getArchivedConversations();
      setConversations(data);
    } catch {}
    finally { setLoading(false); }
  };

  const handleUnarchive = async (e, convId) => {
    e.stopPropagation();
    setUnarchiving(convId);
    try {
      await unarchiveConversation(convId);
      setConversations(prev => prev.filter(c => c._id !== convId));
    } catch {}
    finally { setUnarchiving(null); }
  };

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.panel} onClick={e => e.stopPropagation()}>
        <div style={S.header}>
          <div style={S.headerLeft}>
            <Archive size={20} color="var(--accent)" />
            <h3 style={S.title}>Hội thoại đã lưu trữ</h3>
          </div>
          <button onClick={onClose} style={S.closeBtn}><X size={18} /></button>
        </div>

        {loading ? (
          <div style={S.center}><Loader size={24} color="var(--accent)" style={{ animation:'spin 1s linear infinite' }} /></div>
        ) : conversations.length === 0 ? (
          <div style={S.empty}>
            <Archive size={40} color="var(--text-secondary)" style={{ opacity:0.4 }} />
            <p style={S.emptyText}>Chưa có hội thoại nào được lưu trữ</p>
          </div>
        ) : (
          <div style={S.list}>
            {conversations.map(conv => {
              const name = getConversationName(conv);
              const avatar = getConversationAvatar(conv);
              const isGroup = conv.type === 'group';

              return (
                <div key={conv._id} style={S.item} onClick={() => { onConversationSelect?.(conv); onClose(); }}>
                  {/* Avatar */}
                  <div style={S.avatarWrap}>
                    {avatar ? (
                      <img src={avatar} alt="" style={S.avatar} />
                    ) : isGroup ? (
                      <div style={{ ...S.avatarFallback, background:'linear-gradient(135deg,#667eea,#764ba2)' }}>
                        <Users size={18} color="white" />
                      </div>
                    ) : (
                      <div style={S.avatarFallback}><User size={18} color="var(--text-secondary)" /></div>
                    )}
                  </div>

                  {/* Info */}
                  <div style={S.info}>
                    <p style={S.name}>{name}</p>
                    <p style={S.sub}>{isGroup ? `${conv.participants?.length || 0} thành viên` : 'Đã lưu trữ'}</p>
                  </div>

                  {/* Unarchive button */}
                  <button
                    style={S.unarchiveBtn}
                    onClick={e => handleUnarchive(e, conv._id)}
                    disabled={unarchiving === conv._id}
                    title="Bỏ lưu trữ"
                  >
                    {unarchiving === conv._id
                      ? <Loader size={16} style={{ animation:'spin 1s linear infinite' }} />
                      : <ArchiveRestore size={16} />
                    }
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

const S = {
  overlay: { position:'fixed', inset:0, backgroundColor:'rgba(0,0,0,0.45)', zIndex:9000, display:'flex', alignItems:'flex-end', justifyContent:'center' },
  panel: { backgroundColor:'var(--bg-sidebar)', borderRadius:'20px 20px 0 0', width:'100%', maxWidth:480, maxHeight:'70vh', display:'flex', flexDirection:'column', boxShadow:'0 -8px 32px rgba(0,0,0,0.2)' },
  header: { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'20px 20px 16px', borderBottom:'1px solid var(--border)', flexShrink:0 },
  headerLeft: { display:'flex', alignItems:'center', gap:10 },
  title: { fontSize:16, fontWeight:700, color:'var(--text-primary)', margin:0 },
  closeBtn: { background:'none', border:'none', cursor:'pointer', color:'var(--text-secondary)', padding:6, borderRadius:'50%', display:'flex' },
  list: { overflowY:'auto', flex:1 },
  item: { display:'flex', alignItems:'center', gap:12, padding:'12px 20px', cursor:'pointer', borderBottom:'1px solid var(--border)', transition:'background 0.15s' },
  avatarWrap: { flexShrink:0 },
  avatar: { width:44, height:44, borderRadius:'50%', objectFit:'cover' },
  avatarFallback: { width:44, height:44, borderRadius:'50%', background:'var(--bg-app)', display:'flex', alignItems:'center', justifyContent:'center' },
  info: { flex:1, minWidth:0 },
  name: { fontSize:14, fontWeight:600, color:'var(--text-primary)', margin:'0 0 2px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' },
  sub: { fontSize:12, color:'var(--text-secondary)', margin:0 },
  unarchiveBtn: { flexShrink:0, background:'var(--accent-light)', border:'none', borderRadius:8, padding:'7px 8px', cursor:'pointer', color:'var(--accent)', display:'flex', alignItems:'center' },
  center: { display:'flex', justifyContent:'center', alignItems:'center', padding:40 },
  empty: { display:'flex', flexDirection:'column', alignItems:'center', gap:12, padding:40, color:'var(--text-secondary)' },
  emptyText: { fontSize:14, margin:0 },
};