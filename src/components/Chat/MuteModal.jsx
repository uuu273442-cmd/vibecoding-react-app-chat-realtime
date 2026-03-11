// Đường dẫn: src/components/Chat/MuteModal.jsx

import React, { useState } from 'react';
import { BellOff, Bell, X, Check } from 'lucide-react';
import { muteConversation, unmuteConversation, MUTE_OPTIONS, getMuteStatus } from '../../services/privacyService';

export default function MuteModal({ conversationId, currentParticipant, onClose, onDone }) {
  const isMuted = currentParticipant?.isMuted &&
    (currentParticipant.mutedUntil === null || new Date(currentParticipant.mutedUntil) > new Date());

  const [selectedDuration, setSelectedDuration] = useState('8h');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleMute = async () => {
    setLoading(true); setError('');
    try {
      const result = await muteConversation(conversationId, selectedDuration);
      onDone?.({ isMuted: true, mutedUntil: result.mutedUntil });
      onClose();
    } catch (e) { setError(e.message || 'Lỗi'); }
    finally { setLoading(false); }
  };

  const handleUnmute = async () => {
    setLoading(true); setError('');
    try {
      await unmuteConversation(conversationId);
      onDone?.({ isMuted: false, mutedUntil: null });
      onClose();
    } catch (e) { setError(e.message || 'Lỗi'); }
    finally { setLoading(false); }
  };

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modal} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={S.closeBtn}><X size={18} /></button>

        <div style={S.iconWrap}>
          {isMuted ? <Bell size={26} color="var(--accent)" /> : <BellOff size={26} color="var(--text-secondary)" />}
        </div>
        <h3 style={S.title}>{isMuted ? 'Đang tắt thông báo' : 'Tắt thông báo'}</h3>

        {isMuted ? (
          <>
            <p style={S.desc}>{getMuteStatus(currentParticipant)}</p>
            <button onClick={handleUnmute} disabled={loading} style={S.primaryBtn}>
              {loading ? '...' : '🔔 Bật thông báo lại'}
            </button>
          </>
        ) : (
          <>
            <p style={S.desc}>Chọn thời gian tắt thông báo:</p>
            <div style={S.options}>
              {MUTE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  style={{ ...S.optionBtn, ...(selectedDuration === opt.value ? S.optionBtnActive : {}) }}
                  onClick={() => setSelectedDuration(opt.value)}
                >
                  <span>{opt.label}</span>
                  {selectedDuration === opt.value && <Check size={15} color="var(--accent)" />}
                </button>
              ))}
            </div>
            {error && <p style={S.error}>{error}</p>}
            <button onClick={handleMute} disabled={loading} style={S.primaryBtn}>
              {loading ? '...' : '🔕 Tắt thông báo'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

const S = {
  overlay: { position:'fixed', inset:0, backgroundColor:'rgba(0,0,0,0.5)', zIndex:9100, display:'flex', alignItems:'center', justifyContent:'center', padding:16 },
  modal: { position:'relative', backgroundColor:'var(--bg-sidebar)', borderRadius:20, padding:28, width:'100%', maxWidth:340, textAlign:'center', boxShadow:'0 20px 60px rgba(0,0,0,0.2)' },
  closeBtn: { position:'absolute', top:12, right:12, background:'none', border:'none', cursor:'pointer', color:'var(--text-secondary)', padding:6, borderRadius:'50%', display:'flex' },
  iconWrap: { width:56, height:56, borderRadius:'50%', background:'var(--bg-app)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px' },
  title: { fontSize:17, fontWeight:700, color:'var(--text-primary)', margin:'0 0 8px' },
  desc: { fontSize:13, color:'var(--text-secondary)', margin:'0 0 18px' },
  options: { display:'flex', flexDirection:'column', gap:8, marginBottom:20 },
  optionBtn: { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 16px', border:'2px solid var(--border)', borderRadius:12, background:'var(--bg-app)', cursor:'pointer', fontSize:14, fontWeight:500, color:'var(--text-primary)', transition:'all 0.15s' },
  optionBtnActive: { borderColor:'var(--accent)', background:'var(--accent-light)', color:'var(--accent)' },
  primaryBtn: { width:'100%', padding:'12px 0', border:'none', borderRadius:12, background:'var(--accent)', color:'white', fontSize:14, fontWeight:600, cursor:'pointer' },
  error: { fontSize:13, color:'#ef4444', margin:'0 0 12px' },
};