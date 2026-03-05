// Đường dẫn: src/components/Settings/ThemeSettings.jsx

import React, { useState } from 'react';
import { X, Check, Palette, Sun, Moon } from 'lucide-react';
import { THEMES } from '../../services/themeService';
import { useTheme } from '../../contexts/ThemeContext';

export default function ThemeSettings({ onClose }) {
  const { themeId, changeTheme } = useTheme();
  const [selected, setSelected] = useState(themeId);

  const handleSelect = (id) => {
    setSelected(id);
    changeTheme(id);
  };

  return (
    <div style={S.overlay} onClick={onClose}>
      <style>{`@keyframes slideUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>
      <div style={S.panel} onClick={e => e.stopPropagation()}>
        <div style={S.header}>
          <div style={S.headerLeft}><Palette size={20} color="var(--accent)" /><h3 style={S.title}>Giao diện</h3></div>
          <button onClick={onClose} style={S.close}><X size={18} /></button>
        </div>

        <p style={S.label}>Chế độ</p>
        <div style={S.modeRow}>
          {['light','dark'].map(id => {
            const t = THEMES[id];
            const active = selected === id;
            return (
              <button key={id} style={{ ...S.modeBtn, ...(active ? S.modeBtnActive : {}) }} onClick={() => handleSelect(id)}>
                {id === 'light' ? <Sun size={18} /> : <Moon size={18} />}
                <span style={{ fontSize: 13, fontWeight: 500 }}>{t.name}</span>
                {active && <Check size={14} style={{ marginLeft: 'auto' }} />}
              </button>
            );
          })}
        </div>

        <p style={S.label}>Màu sắc</p>
        <div style={S.grid}>
          {Object.values(THEMES).filter(t => t.id !== 'light' && t.id !== 'dark').map(t => {
            const active = selected === t.id;
            return (
              <button key={t.id} style={{ ...S.card, ...(active ? S.cardActive : {}) }} onClick={() => handleSelect(t.id)}>
                <div style={{ ...S.preview, background: t.vars['--bg-app'] }}>
                  <div style={{ ...S.bubbleOther, background: t.vars['--bg-bubble-other'], border: `1px solid ${t.vars['--border']}` }} />
                  <div style={{ ...S.bubbleOwn, background: t.vars['--bg-bubble-own'] }} />
                </div>
                <div style={S.meta}><span>{t.emoji}</span><span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)' }}>{t.name}</span></div>
                {active && <div style={{ ...S.check, background: t.vars['--accent'] }}><Check size={10} color="white" /></div>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const S = {
  overlay: { position:'fixed', inset:0, backgroundColor:'rgba(0,0,0,0.45)', zIndex:9000, display:'flex', alignItems:'flex-end', justifyContent:'center' },
  panel: { backgroundColor:'var(--bg-sidebar)', borderRadius:'20px 20px 0 0', width:'100%', maxWidth:480, padding:'24px 24px 36px', boxShadow:'0 -8px 32px rgba(0,0,0,0.2)', animation:'slideUp 0.25s ease' },
  header: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 },
  headerLeft: { display:'flex', alignItems:'center', gap:10 },
  title: { fontSize:17, fontWeight:700, color:'var(--text-primary)', margin:0 },
  close: { background:'none', border:'none', cursor:'pointer', color:'var(--text-secondary)', padding:6, borderRadius:'50%', display:'flex', alignItems:'center' },
  label: { fontSize:11, fontWeight:700, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'0.07em', margin:'0 0 10px' },
  modeRow: { display:'flex', gap:10, marginBottom:24 },
  modeBtn: { flex:1, display:'flex', alignItems:'center', gap:8, padding:'12px 16px', border:'2px solid var(--border)', borderRadius:12, background:'var(--bg-app)', cursor:'pointer', color:'var(--text-secondary)', transition:'all 0.2s' },
  modeBtnActive: { borderColor:'var(--accent)', color:'var(--accent)', background:'var(--accent-light)' },
  grid: { display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 },
  card: { position:'relative', padding:10, border:'2px solid var(--border)', borderRadius:14, background:'var(--bg-app)', cursor:'pointer', transition:'all 0.2s', textAlign:'left' },
  cardActive: { borderColor:'var(--accent)', boxShadow:'0 0 0 3px var(--accent-light)' },
  preview: { height:48, borderRadius:8, padding:6, display:'flex', flexDirection:'column', gap:4, marginBottom:8, overflow:'hidden' },
  bubbleOther: { height:12, width:'60%', borderRadius:8, alignSelf:'flex-start' },
  bubbleOwn: { height:12, width:'50%', borderRadius:8, alignSelf:'flex-end' },
  meta: { display:'flex', alignItems:'center', gap:6 },
  check: { position:'absolute', top:6, right:6, width:18, height:18, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center' },
};