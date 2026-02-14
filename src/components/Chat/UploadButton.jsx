// Đường dẫn: src/components/Chat/UploadButton.jsx
// Unified upload button với menu selector

import React, { useState, useRef } from 'react';
import { Paperclip, File, Image, Mic, X } from 'lucide-react';
import { useOnClickOutside } from '../../hooks/useOnClickOutside';

const UploadButton = ({ onFileClick, onMediaClick, onVoiceClick }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useOnClickOutside(menuRef, () => setShowMenu(false));

  const handleFileClick = () => {
    setShowMenu(false);
    onFileClick?.();
  };

  const handleMediaClick = () => {
    setShowMenu(false);
    onMediaClick?.();
  };

  const handleVoiceClick = () => {
    setShowMenu(false);
    onVoiceClick?.();
  };

  return (
    <div style={styles.container} ref={menuRef}>
      {/* Main Button */}
      <button
        onClick={() => setShowMenu(!showMenu)}
        style={styles.mainButton}
        title="Attach files"
      >
        {showMenu ? <X size={20} /> : <Paperclip size={20} />}
      </button>

      {/* Menu */}
      {showMenu && (
        <div style={styles.menu}>
          <button onClick={handleFileClick} style={styles.menuItem}>
            <div style={{...styles.menuIcon, backgroundColor: '#dbeafe'}}>
              <File size={18} color="#2563eb" />
            </div>
            <span style={styles.menuLabel}>File</span>
          </button>

          <button onClick={handleMediaClick} style={styles.menuItem}>
            <div style={{...styles.menuIcon, backgroundColor: '#fce7f3'}}>
              <Image size={18} color="#ec4899" />
            </div>
            <span style={styles.menuLabel}>Photo & Video</span>
          </button>

          <button onClick={handleVoiceClick} style={styles.menuItem}>
            <div style={{...styles.menuIcon, backgroundColor: '#dcfce7'}}>
              <Mic size={18} color="#16a34a" />
            </div>
            <span style={styles.menuLabel}>Voice</span>
          </button>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    position: 'relative',
  },

  mainButton: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#6b7280',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
  },

  menu: {
    position: 'absolute',
    bottom: '100%',
    left: 0,
    marginBottom: '8px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    padding: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    minWidth: '180px',
    zIndex: 1000,
  },

  menuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 12px',
    border: 'none',
    backgroundColor: 'transparent',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textAlign: 'left',
  },

  menuIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  menuLabel: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#1f2937',
  },
};

export default UploadButton;