// Đường dẫn: src/components/Chat/BlockUserModal.jsx

import React, { useState } from 'react';
import { ShieldOff, X, AlertTriangle } from 'lucide-react';
import { blockUser, unblockUser } from '../../services/privacyService';

export default function BlockUserModal({ user, isBlocked, onClose, onDone }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    setLoading(true);
    setError('');
    try {
      if (isBlocked) await unblockUser(user._id);
      else await blockUser(user._id);
      onDone?.(!isBlocked);
      onClose();
    } catch (e) {
      setError(e.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modal} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={S.closeBtn}><X size={18} /></button>

        <div style={S.iconWrap}>
          <ShieldOff size={28} color={isBlocked ? '#6b7280' : '#ef4444'} />
        </div>

        <h3 style={S.title}>{isBlocked ? `Bỏ chặn ${user.name}?` : `Chặn ${user.name}?`}</h3>

        <p style={S.desc}>
          {isBlocked
            ? `${user.name} sẽ có thể nhắn tin cho bạn trở lại.`
            : `Khi bị chặn, ${user.name} sẽ không thể gửi tin nhắn cho bạn và ngược lại.`
          }
        </p>

        {error && (
          <div style={S.error}>
            <AlertTriangle size={14} /><span>{error}</span>
          </div>
        )}

        <div style={S.actions}>
          <button onClick={onClose} style={S.cancelBtn}>Hủy</button>
          <button onClick={handleConfirm} disabled={loading}
            style={{ ...S.confirmBtn, background: isBlocked ? 'var(--accent)' : '#ef4444' }}
          >
            {loading ? '...' : isBlocked ? 'Bỏ chặn' : 'Chặn'}
          </button>
        </div>
      </div>
    </div>
  );
}

const S = {
  overlay: { position:'fixed', inset:0, backgroundColor:'rgba(0,0,0,0.5)', zIndex:9100, display:'flex', alignItems:'center', justifyContent:'center', padding:16 },
  modal: { position:'relative', backgroundColor:'var(--bg-sidebar)', borderRadius:20, padding:32, width:'100%', maxWidth:360, textAlign:'center', boxShadow:'0 20px 60px rgba(0,0,0,0.2)' },
  closeBtn: { position:'absolute', top:12, right:12, background:'none', border:'none', cursor:'pointer', color:'var(--text-secondary)', padding:6, borderRadius:'50%', display:'flex' },
  iconWrap: { width:64, height:64, borderRadius:'50%', background:'var(--bg-app)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' },
  title: { fontSize:18, fontWeight:700, color:'var(--text-primary)', margin:'0 0 10px' },
  desc: { fontSize:14, color:'var(--text-secondary)', lineHeight:1.6, margin:'0 0 20px' },
  error: { display:'flex', alignItems:'center', gap:6, color:'#ef4444', fontSize:13, marginBottom:16, justifyContent:'center' },
  actions: { display:'flex', gap:10 },
  cancelBtn: { flex:1, padding:'11px 0', border:'2px solid var(--border)', borderRadius:12, background:'none', cursor:'pointer', fontSize:14, fontWeight:600, color:'var(--text-secondary)' },
  confirmBtn: { flex:1, padding:'11px 0', border:'none', borderRadius:12, cursor:'pointer', fontSize:14, fontWeight:600, color:'white' },
};