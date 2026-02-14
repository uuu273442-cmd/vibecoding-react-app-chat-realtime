// Đường dẫn: src/components/Chat/FileMessage.jsx
// Render file attachments trong chat bubble

import React from 'react';
import { 
  File, 
  Download, 
  FileText, 
  FileSpreadsheet, 
  FileCode,
  Archive
} from 'lucide-react';
import { formatFileSize } from '../../services/chatService';

const FileMessage = ({ attachments, attachmentCount }) => {
  // Get icon based on file extension
  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    
    const iconMap = {
      pdf: FileText,
      doc: FileText,
      docx: FileText,
      txt: FileText,
      xls: FileSpreadsheet,
      xlsx: FileSpreadsheet,
      csv: FileSpreadsheet,
      js: FileCode,
      jsx: FileCode,
      ts: FileCode,
      tsx: FileCode,
      html: FileCode,
      css: FileCode,
      json: FileCode,
      zip: Archive,
      rar: Archive,
      '7z': Archive,
    };
    
    return iconMap[ext] || File;
  };

  // Get file color based on type
  const getFileColor = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    
    const colorMap = {
      pdf: '#dc2626',
      doc: '#2563eb',
      docx: '#2563eb',
      xls: '#16a34a',
      xlsx: '#16a34a',
      zip: '#9333ea',
      rar: '#9333ea',
    };
    
    return colorMap[ext] || '#6b7280';
  };

  if (!attachments || attachments.length === 0) {
    return null;
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <File size={14} style={styles.headerIcon} />
        <span style={styles.headerText}>
          {attachmentCount} file{attachmentCount > 1 ? 's' : ''}
        </span>
      </div>

      {/* Files List */}
      <div style={styles.filesList}>
        {attachments.map((file) => {
          const IconComponent = getFileIcon(file.filename);
          const iconColor = getFileColor(file.filename);
          
          return (
            <a
              key={file._id}
              href={file.url}
              download={file.originalName}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.fileItem}
              onClick={(e) => e.stopPropagation()} // Prevent message context menu
            >
              <div style={{
                ...styles.fileIconContainer,
                backgroundColor: `${iconColor}15`
              }}>
                <IconComponent size={20} color={iconColor} />
              </div>
              
              <div style={styles.fileInfo}>
                <p style={styles.fileName}>{file.originalName}</p>
                <p style={styles.fileSize}>{formatFileSize(file.size)}</p>
              </div>
              
              <div style={styles.downloadIcon}>
                <Download size={16} color="#6b7280" />
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    minWidth: '280px',
    maxWidth: '400px',
  },

  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    paddingBottom: '8px',
    borderBottom: '1px solid rgba(0,0,0,0.1)',
  },

  headerIcon: {
    color: '#6b7280',
  },

  headerText: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#6b7280',
  },

  filesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },

  fileItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 12px',
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: '8px',
    border: '1px solid rgba(0,0,0,0.05)',
    textDecoration: 'none',
    transition: 'all 0.2s',
    cursor: 'pointer',
  },

  fileIconContainer: {
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
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
    margin: '2px 0 0 0',
  },

  downloadIcon: {
    flexShrink: 0,
    opacity: 0.6,
    transition: 'opacity 0.2s',
  },
};

export default FileMessage;