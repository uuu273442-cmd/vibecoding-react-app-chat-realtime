// Đường dẫn: src/components/Chat/MentionInput.jsx
// @mention autocomplete + emoji picker + markdown toolbar (parity với RichTextEditor)

import React, { useState, useRef, useCallback } from 'react';
import { Smile, Bold, Italic, Code } from 'lucide-react';

const EMOJI_GROUPS = [
  { label: '😀 Biểu cảm', emojis: ['😀','😂','🥹','😍','🥰','😎','🤔','😅','😭','🥺','😡','🤯','🤗','😴','🤩','😏','🙄','😤','🫡','🥳'] },
  { label: '👋 Cử chỉ',   emojis: ['👍','👎','❤️','🔥','🎉','✨','💯','👏','🙏','💪','🤝','✌️','🫶','💀','🤌','🫠'] },
  { label: '🌿 Thiên nhiên', emojis: ['🌸','🌺','🌻','🍀','🌈','☀️','🌙','⭐','🌊','🍃','🦋','🐶','🐱','🐼','🦊'] },
  { label: '🍕 Ẩm thực',  emojis: ['🍕','🍔','🍜','🍱','🧋','☕','🍰','🎂','🍩','🍓','🥑','🍺','🥂','🎊'] },
];

const FORMATS = [
  { icon: Bold,   wrap: '**', title: 'Bold (Ctrl+B)' },
  { icon: Italic, wrap: '_',  title: 'Italic (Ctrl+I)' },
  { icon: Code,   wrap: '`',  title: 'Code (Ctrl+`)' },
];

/**
 * Props:
 *  - value, onChange(text, mentionIds), onKeyPress
 *  - participants, currentUserId
 *  - disabled, inputRef, style, placeholder
 */
export default function MentionInput({
  value, onChange, onKeyPress,
  participants = [], currentUserId,
  disabled, inputRef, style, placeholder,
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownItems, setDropdownItems] = useState([]);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionStart, setMentionStart] = useState(-1);
  const [showEmoji, setShowEmoji] = useState(false);
  const [emojiGroup, setEmojiGroup] = useState(0);

  const dropdownRef = useRef(null);
  const internalRef = useRef(null);
  const ref = inputRef || internalRef;

  // Build member list (exclude self)
  const members = participants
    .map(p => {
      const u = typeof p.userId === 'object' ? p.userId : null;
      if (!u || u._id === currentUserId) return null;
      return { _id: u._id, name: u.name || 'Unknown', avatar: u.avatar || null };
    })
    .filter(Boolean);

  const computeMentionIds = (text) =>
    members.filter(m => text.includes(`@${m.name}`)).map(m => m._id);

  // ── Format (markdown wrapping) ──────────────────────────────────────────
  const applyFormat = useCallback((wrap) => {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.slice(start, end);
    const newText = value.slice(0, start) + wrap + (selected || 'text') + wrap + value.slice(end);
    const ids = computeMentionIds(newText);
    onChange(newText, ids);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + wrap.length, start + wrap.length + (selected || 'text').length);
    });
  }, [value, onChange, ref]);

  // ── Insert emoji ────────────────────────────────────────────────────────
  const insertEmoji = (emoji) => {
    const el = ref.current;
    const pos = el?.selectionStart ?? value.length;
    const newText = value.slice(0, pos) + emoji + value.slice(pos);
    onChange(newText, computeMentionIds(newText));
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(pos + emoji.length, pos + emoji.length);
    });
  };

  // ── Input change (mention detection) ───────────────────────────────────
  const handleChange = (e) => {
    const text = e.target.value;
    const cursor = e.target.selectionStart;
    const textUpToCursor = text.slice(0, cursor);
    const atIdx = textUpToCursor.lastIndexOf('@');

    if (atIdx !== -1) {
      const query = textUpToCursor.slice(atIdx + 1);
      if (!query.includes(' ') && !query.includes('\n')) {
        const filtered = members.filter(m => m.name.toLowerCase().includes(query.toLowerCase()));
        setMentionQuery(query);
        setMentionStart(atIdx);
        if (filtered.length > 0) { setDropdownItems(filtered); setShowDropdown(true); }
        else setShowDropdown(false);
      } else setShowDropdown(false);
    } else setShowDropdown(false);

    onChange(text, computeMentionIds(text));
  };

  const handleSelectMention = (member) => {
    const before = value.slice(0, mentionStart);
    const after = value.slice(mentionStart + 1 + mentionQuery.length);
    const newText = `${before}@${member.name} ${after}`;
    setShowDropdown(false); setMentionQuery(''); setMentionStart(-1);
    onChange(newText, computeMentionIds(newText));
    setTimeout(() => {
      if (ref.current) {
        ref.current.focus();
        const pos = before.length + member.name.length + 2;
        ref.current.setSelectionRange(pos, pos);
      }
    }, 0);
  };

  // ── Keyboard ────────────────────────────────────────────────────────────
  const handleKeyDown = (e) => {
    // Markdown shortcuts
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'b') { e.preventDefault(); applyFormat('**'); return; }
      if (e.key === 'i') { e.preventDefault(); applyFormat('_'); return; }
      if (e.key === '`') { e.preventDefault(); applyFormat('`'); return; }
    }
    if (e.key === 'Escape') { setShowDropdown(false); setShowEmoji(false); }
    if (showDropdown) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); return; }
      if (e.key === 'Enter' && dropdownItems.length > 0) { e.preventDefault(); handleSelectMention(dropdownItems[0]); return; }
    }
    onKeyPress?.(e);
  };

  return (
    <div style={{ position: 'relative', flex: 1 }}>
      {/* Mention dropdown */}
      {showDropdown && (
        <div ref={dropdownRef} style={dd.container}>
          {dropdownItems.map(member => (
            <button
              key={member._id}
              style={dd.item}
              onMouseDown={e => { e.preventDefault(); handleSelectMention(member); }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--accent-light)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <div style={dd.avatarWrap}>
                {member.avatar
                  ? <img src={member.avatar} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                  : <div style={dd.avatarFallback}>{member.name.charAt(0).toUpperCase()}</div>
                }
              </div>
              <p style={dd.name}>{member.name}</p>
            </button>
          ))}
        </div>
      )}

      {/* Emoji picker */}
      {showEmoji && (
        <div style={EP.box} onClick={e => e.stopPropagation()}>
          <div style={EP.tabs}>
            {EMOJI_GROUPS.map((g, i) => (
              <button key={i} style={{ ...EP.tab, ...(emojiGroup===i ? EP.tabActive : {}) }} onClick={() => setEmojiGroup(i)}>
                {g.emojis[0]}
              </button>
            ))}
          </div>
          <p style={EP.groupLabel}>{EMOJI_GROUPS[emojiGroup].label}</p>
          <div style={EP.grid}>
            {EMOJI_GROUPS[emojiGroup].emojis.map(em => (
              <button key={em} style={EP.emojiBtn}
                onClick={() => { insertEmoji(em); setShowEmoji(false); }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-light)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >{em}</button>
            ))}
          </div>
        </div>
      )}

      {/* Toolbar (absolute right of input) */}
      <div style={TB.bar}>
        {FORMATS.map(({ icon: Icon, wrap, title }) => (
          <button key={wrap} style={TB.btn} title={title}
            onMouseDown={e => { e.preventDefault(); applyFormat(wrap); }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-light)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <Icon size={15} color="var(--text-secondary)" />
          </button>
        ))}
        <button style={{ ...TB.btn, color: showEmoji ? 'var(--accent)' : 'var(--text-secondary)' }}
          title="Emoji"
          onClick={() => setShowEmoji(v => !v)}
        >
          <Smile size={17} color={showEmoji ? 'var(--accent)' : 'var(--text-secondary)'} />
        </button>
      </div>

      {/* Input */}
      <input
        ref={ref}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        style={{ ...style, paddingRight: 120 }}
        disabled={disabled}
        onClick={() => setShowEmoji(false)}
      />
    </div>
  );
}

const TB = {
  bar: { position:'absolute', right:0, top:'50%', transform:'translateY(-50%)', display:'flex', alignItems:'center', zIndex:2, paddingRight:4 },
  btn: { background:'transparent', border:'none', cursor:'pointer', padding:'5px 6px', borderRadius:6, display:'flex', alignItems:'center', transition:'background 0.15s' },
};

const EP = {
  box: { position:'absolute', bottom:'52px', right:0, backgroundColor:'var(--bg-sidebar)', border:'1px solid var(--border)', borderRadius:16, boxShadow:'0 -4px 24px var(--shadow)', width:280, zIndex:300, overflow:'hidden', animation:'emojiIn 0.15s ease' },
  tabs: { display:'flex', borderBottom:'1px solid var(--border)', padding:'4px 8px 0', gap:2 },
  tab: { flex:1, background:'none', border:'none', cursor:'pointer', fontSize:18, padding:'4px 0 6px', borderBottom:'2px solid transparent', transition:'all 0.15s' },
  tabActive: { borderBottomColor:'var(--accent)' },
  groupLabel: { fontSize:11, fontWeight:700, color:'var(--text-secondary)', margin:'8px 12px 4px', letterSpacing:'0.05em' },
  grid: { display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2, padding:'4px 8px 12px' },
  emojiBtn: { background:'transparent', border:'none', cursor:'pointer', fontSize:20, padding:4, borderRadius:6, transition:'background 0.1s', lineHeight:1.2 },
};

const dd = {
  container: { position:'absolute', bottom:'52px', left:0, right:0, backgroundColor:'var(--bg-sidebar)', border:'1px solid var(--border)', borderRadius:12, boxShadow:'0 -4px 20px var(--shadow)', zIndex:200, overflow:'hidden', maxHeight:220, overflowY:'auto' },
  item: { width:'100%', display:'flex', alignItems:'center', gap:10, padding:'8px 14px', border:'none', background:'transparent', cursor:'pointer', textAlign:'left' },
  avatarWrap: { width:32, height:32, borderRadius:'50%', overflow:'hidden', flexShrink:0 },
  avatarFallback: { width:'100%', height:'100%', background:'linear-gradient(135deg,#667eea,#764ba2)', color:'white', fontSize:13, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center' },
  name: { fontSize:14, color:'var(--text-primary)', fontWeight:500, margin:0 },
};