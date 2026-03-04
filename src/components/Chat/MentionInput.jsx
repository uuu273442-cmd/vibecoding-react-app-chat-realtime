// Đường dẫn: src/components/Chat/MentionInput.jsx
// @mention autocomplete — tracks mentionIds chính xác theo text

import React, { useState, useRef, useEffect } from 'react';

/**
 * Props:
 *  - value: string
 *  - onChange: (text: string, mentionIds: string[]) => void
 *  - onKeyPress: (e) => void
 *  - participants: [{ userId: { _id, name, avatar } | string, role }]
 *  - currentUserId: string
 *  - disabled: bool
 *  - inputRef: ref
 *  - style: object
 *  - placeholder: string
 */
export default function MentionInput({
  value,
  onChange,
  onKeyPress,
  participants = [],
  currentUserId,
  disabled,
  inputRef,
  style,
  placeholder,
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownItems, setDropdownItems] = useState([]);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionStart, setMentionStart] = useState(-1);

  const dropdownRef = useRef(null);
  const internalRef = useRef(null);
  const ref = inputRef || internalRef;

  // Build member list — loại bỏ chính mình
  const members = participants
    .map(p => {
      const u = typeof p.userId === 'object' ? p.userId : null;
      if (!u || u._id === currentUserId) return null;
      return { _id: u._id, name: u.name || 'Unknown', avatar: u.avatar || null };
    })
    .filter(Boolean);

  // Source of truth: tính mentionIds từ text (không dùng state riêng)
  const computeMentionIds = (text) =>
    members.filter(m => text.includes(`@${m.name}`)).map(m => m._id);

  useEffect(() => {
    const handler = (e) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target) &&
        ref.current && !ref.current.contains(e.target)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleChange = (e) => {
    const text = e.target.value;
    const cursor = e.target.selectionStart;
    const textUpToCursor = text.slice(0, cursor);
    const atIdx = textUpToCursor.lastIndexOf('@');

    if (atIdx !== -1) {
      const query = textUpToCursor.slice(atIdx + 1);
      if (!query.includes(' ') && !query.includes('\n')) {
        const filtered = members.filter(m =>
          m.name.toLowerCase().includes(query.toLowerCase())
        );
        setMentionQuery(query);
        setMentionStart(atIdx);
        if (filtered.length > 0) {
          setDropdownItems(filtered);
          setShowDropdown(true);
        } else {
          setShowDropdown(false);
        }
      } else {
        setShowDropdown(false);
      }
    } else {
      setShowDropdown(false);
    }

    onChange(text, computeMentionIds(text));
  };

  const handleSelectMention = (member) => {
    const before = value.slice(0, mentionStart);
    const after = value.slice(mentionStart + 1 + mentionQuery.length);
    const newText = `${before}@${member.name} ${after}`;

    setShowDropdown(false);
    setMentionQuery('');
    setMentionStart(-1);

    onChange(newText, computeMentionIds(newText));

    setTimeout(() => {
      if (ref.current) {
        ref.current.focus();
        const pos = before.length + member.name.length + 2;
        ref.current.setSelectionRange(pos, pos);
      }
    }, 0);
  };

  const handleKeyDown = (e) => {
    if (showDropdown) {
      if (e.key === 'Escape') { setShowDropdown(false); return; }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); return; }
      if (e.key === 'Enter' && dropdownItems.length > 0) {
        e.preventDefault();
        handleSelectMention(dropdownItems[0]);
        return;
      }
    }
    onKeyPress?.(e);
  };

  return (
    <div style={{ position: 'relative', flex: 1 }}>
      <input
        ref={ref}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        style={style}
        disabled={disabled}
      />

      {showDropdown && (
        <div ref={dropdownRef} style={dd.container}>
          {dropdownItems.map((member) => (
            <button
              key={member._id}
              style={dd.item}
              onMouseDown={(e) => { e.preventDefault(); handleSelectMention(member); }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f3f4f6'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <div style={dd.avatarWrap}>
                {member.avatar
                  ? <img src={member.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={dd.avatarFallback}>{member.name.charAt(0).toUpperCase()}</div>
                }
              </div>
              <p style={dd.name}>{member.name}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const dd = {
  container: {
    position: 'absolute',
    bottom: '52px',
    left: 0,
    right: 0,
    backgroundColor: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    boxShadow: '0 -4px 20px rgba(0,0,0,0.12)',
    zIndex: 200,
    overflow: 'hidden',
    maxHeight: '220px',
    overflowY: 'auto',
  },
  item: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '8px 14px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    textAlign: 'left',
  },
  avatarWrap: {
    width: 32, height: 32,
    borderRadius: '50%',
    overflow: 'hidden',
    flexShrink: 0,
  },
  avatarFallback: {
    width: '100%', height: '100%',
    background: 'linear-gradient(135deg,#667eea,#764ba2)',
    color: 'white',
    fontSize: 13,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: 500,
    margin: 0,
  },
};