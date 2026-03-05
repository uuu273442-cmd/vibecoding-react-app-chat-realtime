// Đường dẫn: src/components/Chat/RichTextEditor.jsx
// Input giàu tính năng: markdown shortcuts, emoji picker, @mention

import React, { useState, useRef, useCallback } from 'react';
import { Smile, Bold, Italic, Code } from 'lucide-react';

// ── Emoji groups ─────────────────────────────────────────────────────────────
const EMOJI_GROUPS = [
  { label: '😀 Biểu cảm', emojis: ['😀','😂','🥹','😍','🥰','😎','🤔','😅','😭','🥺','😡','🤯','🤗','😴','🤩','😏','🙄','😤','🫡','🥳'] },
  { label: '👋 Cử chỉ', emojis: ['👍','👎','❤️','🔥','🎉','✨','💯','👏','🙏','💪','🤝','✌️','🫶','💀','🤌','🫠'] },
  { label: '🌿 Thiên nhiên', emojis: ['🌸','🌺','🌻','🍀','🌈','☀️','🌙','⭐','🌊','🍃','🦋','🐶','🐱','🐼','🦊'] },
  { label: '🍕 Ẩm thực', emojis: ['🍕','🍔','🍜','🍱','🧋','☕','🍰','🎂','🍩','🍓','🥑','🍺','🥂','🎊'] },
];

// ── Markdown format helpers ───────────────────────────────────────────────────
const FORMATS = [
  { icon: Bold,   wrap: '**', title: 'Bold (Ctrl+B)',   shortcut: 'b' },
  { icon: Italic, wrap: '_',  title: 'Italic (Ctrl+I)', shortcut: 'i' },
  { icon: Code,   wrap: '`',  title: 'Code (Ctrl+`)',   shortcut: '`' },
];

export default function RichTextEditor({
  value, onChange, onKeyPress, onKeyDown,
  disabled, placeholder, style, inputRef,
}) {
  const [showEmoji, setShowEmoji] = useState(false);
  const [emojiGroup, setEmojiGroup] = useState(0);
  const internalRef = useRef(null);
  const ref = inputRef || internalRef;

  const applyFormat = useCallback((wrap) => {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const before = value.slice(0, start);
    const selected = value.slice(start, end);
    const after = value.slice(end);
    const newText = before + wrap + (selected || 'text') + wrap + after;
    onChange(newText);
    // Restore selection after render
    requestAnimationFrame(() => {
      el.focus();
      const newStart = start + wrap.length;
      const newEnd = newStart + (selected || 'text').length;
      el.setSelectionRange(newStart, newEnd);
    });
  }, [value, onChange, ref]);

  const handleKeyDown = (e) => {
    // Keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'b') { e.preventDefault(); applyFormat('**'); return; }
      if (e.key === 'i') { e.preventDefault(); applyFormat('_'); return; }
      if (e.key === '`') { e.preventDefault(); applyFormat('`'); return; }
    }
    if (e.key === 'Escape') { setShowEmoji(false); }
    onKeyDown?.(e);
    onKeyPress?.(e); // backward compat
  };

  const insertEmoji = (emoji) => {
    const el = ref.current;
    const pos = el?.selectionStart ?? value.length;
    const newText = value.slice(0, pos) + emoji + value.slice(pos);
    onChange(newText);
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(pos + emoji.length, pos + emoji.length);
    });
  };

  return (
    <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
      {/* Emoji picker */}
      {showEmoji && (
        <div style={EP.box} onClick={e => e.stopPropagation()}>
          {/* Group tabs */}
          <div style={EP.tabs}>
            {EMOJI_GROUPS.map((g, i) => (
              <button
                key={i}
                style={{ ...EP.tab, ...(emojiGroup === i ? EP.tabActive : {}) }}
                onClick={() => setEmojiGroup(i)}
              >
                {g.emojis[0]}
              </button>
            ))}
          </div>
          <p style={EP.groupLabel}>{EMOJI_GROUPS[emojiGroup].label}</p>
          <div style={EP.grid}>
            {EMOJI_GROUPS[emojiGroup].emojis.map(em => (
              <button
                key={em}
                style={EP.emojiBtn}
                onClick={() => { insertEmoji(em); setShowEmoji(false); }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-light)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {em}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div style={TB.bar}>
        {FORMATS.map(({ icon: Icon, wrap, title }) => (
          <button
            key={wrap}
            style={TB.btn}
            title={title}
            onMouseDown={e => { e.preventDefault(); applyFormat(wrap); }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-light)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <Icon size={15} color="var(--text-secondary)" />
          </button>
        ))}
        <button
          style={{ ...TB.btn, color: showEmoji ? 'var(--accent)' : 'var(--text-secondary)' }}
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
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        style={{ ...style, paddingRight: 120 }}
        onClick={() => setShowEmoji(false)}
      />
    </div>
  );
}

// Toolbar styles
const TB = {
  bar: {
    position: 'absolute',
    right: 0,
    top: '50%',
    transform: 'translateY(-50%)',
    display: 'flex',
    alignItems: 'center',
    gap: 0,
    zIndex: 2,
    paddingRight: 4,
  },
  btn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '5px 6px',
    borderRadius: 6,
    display: 'flex',
    alignItems: 'center',
    transition: 'background 0.15s',
  },
};

// Emoji picker styles
const EP = {
  box: {
    position: 'absolute',
    bottom: '52px',
    right: 0,
    backgroundColor: 'var(--bg-sidebar)',
    border: '1px solid var(--border)',
    borderRadius: 16,
    boxShadow: '0 -4px 24px var(--shadow)',
    width: 280,
    zIndex: 300,
    overflow: 'hidden',
    animation: 'emojiIn 0.15s ease',
  },
  tabs: {
    display: 'flex',
    borderBottom: '1px solid var(--border)',
    padding: '4px 8px 0',
    gap: 2,
  },
  tab: {
    flex: 1,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: 18,
    padding: '4px 0 6px',
    borderBottom: '2px solid transparent',
    transition: 'all 0.15s',
  },
  tabActive: {
    borderBottomColor: 'var(--accent)',
  },
  groupLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: 'var(--text-secondary)',
    margin: '8px 12px 4px',
    letterSpacing: '0.05em',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7,1fr)',
    gap: 2,
    padding: '4px 8px 12px',
  },
  emojiBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: 20,
    padding: '4px',
    borderRadius: 6,
    transition: 'background 0.1s',
    lineHeight: 1.2,
  },
};