// Đường dẫn: src/components/Chat/MediaUpload.jsx
// Image/Video upload với preview

import React, { useState, useRef } from 'react';
import { X, Image, Video, Upload, AlertCircle } from 'lucide-react';
import { formatFileSize } from '../../services/chatService';

const MediaUpload = ({ onFilesSelected, onClose, maxFiles = 10, maxSize = 10 * 1024 * 1024 }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const createPreviews = (files) => {
    const newPreviews = [];
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        newPreviews.push({
          file,
          url: e.target.result,
          type: file.type.startsWith('image/') ? 'image' : 'video'
        });
        
        if (newPreviews.length === files.length) {
          setPreviews(prev => [...prev, ...newPreviews].slice(0, maxFiles));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const validateFiles = (files) => {
    const errors = [];
    
    if (selectedFiles.length + files.length > maxFiles) {
      errors.push(`Maximum ${maxFiles} files allowed`);
    }
    
    for (const file of files) {
      if (file.size > maxSize) {
        errors.push(`${file.name}: File size exceeds ${formatFileSize(maxSize)}`);
      }
      
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        errors.push(`${file.name}: Only images and videos allowed`);
      }
    }
    
    return errors;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError('');
    
    const files = Array.from(e.dataTransfer.files);
    const validationErrors = validateFiles(files);
    
    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '));
      return;
    }
    
    const newFiles = [...selectedFiles, ...files].slice(0, maxFiles);
    setSelectedFiles(newFiles);
    createPreviews(files);
  };

  const handleFileSelect = (e) => {
    setError('');
    const files = Array.from(e.target.files);
    const validationErrors = validateFiles(files);
    
    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '));
      return;
    }
    
    const newFiles = [...selectedFiles, ...files].slice(0, maxFiles);
    setSelectedFiles(newFiles);
    createPreviews(files);
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (selectedFiles.length === 0) {
      setError('Please select at least one file');
      return;
    }
    
    onFilesSelected(selectedFiles);
  };

  return (
    <>
      {/* Backdrop */}
      <div style={styles.backdrop} onClick={onClose} />

      {/* Modal */}
      <div style={styles.modal}>
        <div style={styles.header}>
          <h3 style={styles.title}>Upload Images & Videos</h3>
          <button onClick={onClose} style={styles.closeButton}>
            <X size={20} />
          </button>
        </div>

        <div style={styles.content}>
          {/* Drag & Drop Area */}
          {previews.length === 0 && (
            <div
              style={{
                ...styles.dropZone,
                ...(dragActive ? styles.dropZoneActive : {})
              }}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div style={styles.uploadIcon}>
                <Image size={32} />
                <Video size={32} />
              </div>
              <p style={styles.dropText}>
                Drag & drop images or videos here
              </p>
              <p style={styles.dropHint}>
                or click to browse
              </p>
              <p style={styles.dropLimit}>
                Max {maxFiles} files, {formatFileSize(maxSize)} each
              </p>
              
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileSelect}
                style={styles.hiddenInput}
              />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div style={styles.errorBox}>
              <AlertCircle size={16} style={styles.errorIcon} />
              <p style={styles.errorText}>{error}</p>
            </div>
          )}

          {/* Preview Grid */}
          {previews.length > 0 && (
            <div style={styles.previewContainer}>
              <div style={styles.previewHeader}>
                <p style={styles.previewCount}>
                  {previews.length} file{previews.length > 1 ? 's' : ''} selected
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  style={styles.addMoreButton}
                >
                  <Upload size={16} />
                  Add more
                </button>
              </div>

              <div style={styles.previewGrid}>
                {previews.map((preview, index) => (
                  <div key={index} style={styles.previewItem}>
                    {preview.type === 'image' ? (
                      <img
                        src={preview.url}
                        alt=""
                        style={styles.previewImage}
                      />
                    ) : (
                      <video
                        src={preview.url}
                        style={styles.previewVideo}
                        muted
                      />
                    )}
                    
                    <div style={styles.previewOverlay}>
                      <div style={styles.previewInfo}>
                        {preview.type === 'video' && (
                          <div style={styles.videoBadge}>
                            <Video size={14} />
                          </div>
                        )}
                        <p style={styles.previewSize}>
                          {formatFileSize(preview.file.size)}
                        </p>
                      </div>
                      
                      <button
                        onClick={() => handleRemoveFile(index)}
                        style={styles.removeButton}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileSelect}
                style={styles.hiddenInput}
              />
            </div>
          )}
        </div>

        <div style={styles.footer}>
          <button onClick={onClose} style={styles.cancelButton}>
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={selectedFiles.length === 0}
            style={{
              ...styles.uploadButton,
              ...(selectedFiles.length === 0 ? styles.uploadButtonDisabled : {})
            }}
          >
            Upload {selectedFiles.length > 0 && `(${selectedFiles.length})`}
          </button>
        </div>
      </div>
    </>
  );
};

const styles = {
  backdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 9998,
  },

  modal: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    width: '90%',
    maxWidth: '700px',
    maxHeight: '85vh',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 9999,
  },

  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 24px',
    borderBottom: '1px solid #e5e7eb',
  },

  title: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1f2937',
    margin: 0,
  },

  closeButton: {
    background: 'none',
    border: 'none',
    color: '#9ca3af',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
  },

  content: {
    padding: '24px',
    flex: 1,
    overflowY: 'auto',
  },

  dropZone: {
    border: '2px dashed #d1d5db',
    borderRadius: '12px',
    padding: '60px 20px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },

  dropZoneActive: {
    borderColor: '#764ba2',
    backgroundColor: '#f3f4f6',
  },

  uploadIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    color: '#9ca3af',
    marginBottom: '20px',
  },

  dropText: {
    fontSize: '16px',
    fontWeight: '500',
    color: '#1f2937',
    margin: '0 0 8px 0',
  },

  dropHint: {
    fontSize: '14px',
    color: '#6b7280',
    margin: '0 0 12px 0',
  },

  dropLimit: {
    fontSize: '12px',
    color: '#9ca3af',
    margin: 0,
  },

  hiddenInput: {
    display: 'none',
  },

  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    marginBottom: '16px',
  },

  errorIcon: {
    color: '#dc2626',
    flexShrink: 0,
  },

  errorText: {
    fontSize: '14px',
    color: '#991b1b',
    margin: 0,
  },

  previewContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },

  previewHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  previewCount: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#764ba2',
    margin: 0,
  },

  addMoreButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    backgroundColor: 'white',
    color: '#6b7280',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
  },

  previewGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: '12px',
  },

  previewItem: {
    position: 'relative',
    aspectRatio: '1',
    borderRadius: '8px',
    overflow: 'hidden',
    backgroundColor: '#f3f4f6',
  },

  previewImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },

  previewVideo: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },

  previewOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), transparent, rgba(0,0,0,0.3))',
    opacity: 0,
    transition: 'opacity 0.2s',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '8px',
  },

  previewInfo: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  videoBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 8px',
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: '4px',
    color: 'white',
    fontSize: '12px',
  },

  previewSize: {
    fontSize: '11px',
    color: 'white',
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: '2px 6px',
    borderRadius: '4px',
    margin: 0,
  },

  removeButton: {
    alignSelf: 'flex-end',
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: 'rgba(220, 38, 38, 0.9)',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  footer: {
    display: 'flex',
    gap: '12px',
    padding: '16px 24px',
    borderTop: '1px solid #e5e7eb',
    justifyContent: 'flex-end',
  },

  cancelButton: {
    padding: '8px 16px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    backgroundColor: 'white',
    color: '#6b7280',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },

  uploadButton: {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },

  uploadButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
};

// Add CSS for hover effect
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(`
  .preview-item:hover .preview-overlay {
    opacity: 1 !important;
  }
`, styleSheet.cssRules.length);

export default MediaUpload;