// Đường dẫn: src/components/Chat/FileUpload.jsx
// File Upload với Drag & Drop

import React, { useRef, useState } from 'react';
import { Upload, File, X, AlertCircle } from 'lucide-react';
import { formatFileSize } from '../../services/chatService';

const FileUpload = ({ onFilesSelected, onClose, maxFiles = 10, maxSize = 10 * 1024 * 1024 }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
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

  const validateFiles = (files) => {
    const errors = [];
    
    if (files.length > maxFiles) {
      errors.push(`Maximum ${maxFiles} files allowed`);
    }
    
    for (const file of files) {
      if (file.size > maxSize) {
        errors.push(`${file.name}: File size exceeds ${formatFileSize(maxSize)}`);
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
    
    setSelectedFiles(prev => [...prev, ...files].slice(0, maxFiles));
  };

  const handleFileSelect = (e) => {
    setError('');
    const files = Array.from(e.target.files);
    const validationErrors = validateFiles(files);
    
    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '));
      return;
    }
    
    setSelectedFiles(prev => [...prev, ...files].slice(0, maxFiles));
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
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
          <h3 style={styles.title}>Upload Files</h3>
          <button onClick={onClose} style={styles.closeButton}>
            <X size={20} />
          </button>
        </div>

        <div style={styles.content}>
          {/* Drag & Drop Area */}
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
            <Upload size={48} style={styles.uploadIcon} />
            <p style={styles.dropText}>
              Drag & drop files here, or click to select
            </p>
            <p style={styles.dropHint}>
              Max {maxFiles} files, {formatFileSize(maxSize)} each
            </p>
            
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              style={styles.hiddenInput}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div style={styles.errorBox}>
              <AlertCircle size={16} style={styles.errorIcon} />
              <p style={styles.errorText}>{error}</p>
            </div>
          )}

          {/* Selected Files List */}
          {selectedFiles.length > 0 && (
            <div style={styles.filesList}>
              <p style={styles.filesCount}>
                {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected
              </p>
              {selectedFiles.map((file, index) => (
                <div key={index} style={styles.fileItem}>
                  <File size={20} style={styles.fileIcon} />
                  <div style={styles.fileInfo}>
                    <p style={styles.fileName}>{file.name}</p>
                    <p style={styles.fileSize}>{formatFileSize(file.size)}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveFile(index)}
                    style={styles.removeButton}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
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
    maxWidth: '600px',
    maxHeight: '80vh',
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
    padding: '40px 20px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
    marginBottom: '20px',
  },

  dropZoneActive: {
    borderColor: '#764ba2',
    backgroundColor: '#f3f4f6',
  },

  uploadIcon: {
    color: '#9ca3af',
    marginBottom: '16px',
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

  filesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },

  filesCount: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#764ba2',
    margin: '0 0 8px 0',
  },

  fileItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
  },

  fileIcon: {
    color: '#764ba2',
    flexShrink: 0,
  },

  fileInfo: {
    flex: 1,
    minWidth: 0,
  },

  fileName: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#1f2937',
    margin: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  fileSize: {
    fontSize: '12px',
    color: '#6b7280',
    margin: '4px 0 0 0',
  },

  removeButton: {
    background: 'none',
    border: 'none',
    color: '#dc2626',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    borderRadius: '4px',
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

export default FileUpload;