// Đường dẫn: src/components/Chat/UploadProgress.jsx
// Upload progress indicator

import React from 'react';
import { Upload, X } from 'lucide-react';

const UploadProgress = ({ progress, fileName, onCancel }) => {
  if (progress === 0 || progress === 100) return null;

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {/* Icon */}
        <div style={styles.iconContainer}>
          <Upload size={20} color="#764ba2" />
        </div>

        {/* Info */}
        <div style={styles.info}>
          <div style={styles.header}>
            <p style={styles.fileName}>{fileName || 'Uploading...'}</p>
            <span style={styles.percentage}>{Math.round(progress)}%</span>
          </div>

          {/* Progress Bar */}
          <div style={styles.progressBar}>
            <div 
              style={{
                ...styles.progress,
                width: `${progress}%`
              }}
            />
          </div>
        </div>

        {/* Cancel Button */}
        {onCancel && (
          <button onClick={onCancel} style={styles.cancelButton}>
            <X size={18} />
          </button>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    zIndex: 9999,
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    padding: '16px',
    minWidth: '320px',
    maxWidth: '400px',
  },

  content: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
  },

  iconContainer: {
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    backgroundColor: '#f3f4f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  info: {
    flex: 1,
    minWidth: 0,
  },

  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '8px',
  },

  fileName: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#1f2937',
    margin: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    flex: 1,
  },

  percentage: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#764ba2',
    marginLeft: '8px',
  },

  progressBar: {
    width: '100%',
    height: '6px',
    backgroundColor: '#f3f4f6',
    borderRadius: '3px',
    overflow: 'hidden',
  },

  progress: {
    height: '100%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '3px',
    transition: 'width 0.3s ease',
  },

  cancelButton: {
    background: 'none',
    border: 'none',
    color: '#9ca3af',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    borderRadius: '4px',
    flexShrink: 0,
  },
};

export default UploadProgress;