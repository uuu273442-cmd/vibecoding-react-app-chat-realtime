// Đường dẫn: src/components/Settings/WallpaperSelector.jsx

import React, { useState, useRef } from 'react';
import { X, Check, Image, Globe, MessageSquare } from 'lucide-react';
import { WALLPAPERS } from '../../services/themeService';
import { useTheme } from '../../contexts/ThemeContext';

export default function WallpaperSelector({ conversationId, onClose }) {
  const { getWallpaper, setWallpaper } = useTheme();
  const [scope, setScope] = useState('conv'); // 'conv' | 'global'
  const [selected, setSelected] = useState(() => getWallpaper(scope === 'global' ? 'global' : conversationId));
  const [customUrl, setCustomUrl] = useState('');
  const fileRef = useRef(null);

  const activeId = scope === 'global' ? 'global' : conversationId;

  const handleSelect = (wpId) => {
    setSelected(wpId);
    setWallpaper(activeId, wpId);
  };

  const handleScopeChange = (s) => {
    setScope(s);
    setSelected(getWallpaper(s === 'global' ? 'global' : conversationId));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target.result;
      const customId = 'custom_' + Date.now();
      // Store as data URL — per-conversation
      const map = JSON.parse(localStorage.getItem('wallpaper_custom') || '{}');
      map[activeId] = { id: customId, value: `url("${url}")` };
      localStorage.setItem('wallpaper_custom', JSON.stringify(map));
      setSelected(customId);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={S.overlay} onClick={onClose}>
      <style>{`@keyframes slideUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>
      <div style={S.panel} onClick={e => e.stopPropagation()}>
        <div style={S.header}>
          <div style={S.headerLeft}><Image size={20} color="var(--accent)" /><h3 style={S.title}>Hình nền chat</h3></div>
          <button onClick={onClose} style={S.close}><X size={18} /></button>
        </div>

        {/* Scope toggle */}
        <div style={S.scopeRow}>
          <button style={{ ...S.scopeBtn, ...(scope==='conv' ? S.scopeActive : {}) }} onClick={() => handleScopeChange('conv')}>
            <MessageSquare size={15} /><span>Cuộc trò chuyện này</span>
          </button>
          <button style={{ ...S.scopeBtn, ...(scope==='global' ? S.scopeActive : {}) }} onClick={() => handleScopeChange('global')}>
            <Globe size={15} /><span>Tất cả cuộc trò chuyện</span>
          </button>
        </div>

        {/* Wallpaper grid */}
        <p style={S.label}>Chọn hình nền</p>
        <div style={S.grid}>
          {WALLPAPERS.map(wp => {
            const active = selected === wp.id;
            return (
              <button key={wp.id} style={{ ...S.wpBtn, ...(active ? S.wpBtnActive : {}) }} onClick={() => handleSelect(wp.id)}>
                <div style={{
                  ...S.wpThumb,
                  background: wp.preview || '#f0f2f5',
                  backgroundSize: wp.size || 'cover',
                }} />
                <span style={S.wpName}>{wp.name}</span>
                {active && <div style={S.checkDot}><Check size={9} color="white" /></div>}
              </button>
            );
          })}

          {/* Upload custom */}
          <button style={S.wpBtn} onClick={() => fileRef.current?.click()}>
            <div style={{ ...S.wpThumb, background: 'var(--bg-app)', display:'flex', alignItems:'center', justifyContent:'center', border:'2px dashed var(--border)' }}>
              <Image size={20} color="var(--text-secondary)" />
            </div>
            <span style={S.wpName}>Tải lên</span>
          </button>
          <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleFileUpload} />
        </div>
      </div>
    </div>
  );
}

const S = {
  overlay: { position:'fixed', inset:0, backgroundColor:'rgba(0,0,0,0.45)', zIndex:9000, display:'flex', alignItems:'flex-end', justifyContent:'center' },
  panel: { backgroundColor:'var(--bg-sidebar)', borderRadius:'20px 20px 0 0', width:'100%', maxWidth:480, padding:'24px 24px 36px', boxShadow:'0 -8px 32px rgba(0,0,0,0.2)', animation:'slideUp 0.25s ease' },
  header: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 },
  headerLeft: { display:'flex', alignItems:'center', gap:10 },
  title: { fontSize:17, fontWeight:700, color:'var(--text-primary)', margin:0 },
  close: { background:'none', border:'none', cursor:'pointer', color:'var(--text-secondary)', padding:6, borderRadius:'50%', display:'flex', alignItems:'center' },
  scopeRow: { display:'flex', gap:8, marginBottom:20 },
  scopeBtn: { flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'9px 12px', fontSize:13, fontWeight:500, border:'2px solid var(--border)', borderRadius:10, background:'var(--bg-app)', cursor:'pointer', color:'var(--text-secondary)', transition:'all 0.2s' },
  scopeActive: { borderColor:'var(--accent)', color:'var(--accent)', background:'var(--accent-light)' },
  label: { fontSize:11, fontWeight:700, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'0.07em', margin:'0 0 12px' },
  grid: { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10 },
  wpBtn: { position:'relative', border:'2px solid var(--border)', borderRadius:12, padding:0, background:'none', cursor:'pointer', overflow:'hidden', transition:'all 0.2s' },
  wpBtnActive: { borderColor:'var(--accent)', boxShadow:'0 0 0 3px var(--accent-light)' },
  wpThumb: { width:'100%', aspectRatio:'1', borderRadius:10 },
  wpName: { display:'block', fontSize:11, color:'var(--text-secondary)', padding:'4px 2px', textAlign:'center', fontWeight:500 },
  checkDot: { position:'absolute', top:4, right:4, width:16, height:16, borderRadius:'50%', background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center' },
};