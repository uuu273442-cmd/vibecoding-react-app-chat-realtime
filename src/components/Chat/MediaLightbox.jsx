// Đường dẫn: src/components/Chat/MediaLightbox.jsx
// Fullscreen lightbox for images and videos

import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Download, ZoomIn, ZoomOut } from 'lucide-react';

const MediaLightbox = ({ media, initialIndex = 0, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);

  const currentMedia = media[currentIndex];
  const isImage = currentMedia.type === 'image';
  const isVideo = currentMedia.type === 'video';

  useEffect(() => {
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    // Keyboard navigation
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrevious();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = 'auto';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentIndex]);

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setZoom(1);
    }
  };

  const handleNext = () => {
    if (currentIndex < media.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setZoom(1);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = currentMedia.url;
    link.download = currentMedia.originalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5));
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      {/* Close Button */}
      <button style={styles.closeButton} onClick={onClose}>
        <X size={24} />
      </button>

      {/* Navigation Arrows */}
      {media.length > 1 && (
        <>
          <button
            style={{
              ...styles.navButton,
              ...styles.navButtonLeft,
              ...(currentIndex === 0 ? styles.navButtonDisabled : {})
            }}
            onClick={(e) => {
              e.stopPropagation();
              handlePrevious();
            }}
            disabled={currentIndex === 0}
          >
            <ChevronLeft size={32} />
          </button>

          <button
            style={{
              ...styles.navButton,
              ...styles.navButtonRight,
              ...(currentIndex === media.length - 1 ? styles.navButtonDisabled : {})
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            disabled={currentIndex === media.length - 1}
          >
            <ChevronRight size={32} />
          </button>
        </>
      )}

      {/* Media Container */}
      <div 
        style={styles.mediaContainer}
        onClick={(e) => e.stopPropagation()}
      >
        {isImage && (
          <img
            src={currentMedia.url}
            alt={currentMedia.originalName}
            style={{
              ...styles.image,
              transform: `scale(${zoom})`
            }}
          />
        )}

        {isVideo && (
          <video
            src={currentMedia.url}
            controls
            autoPlay
            style={styles.video}
          />
        )}
      </div>

      {/* Controls Bar */}
      <div style={styles.controlsBar} onClick={(e) => e.stopPropagation()}>
        {/* Info */}
        <div style={styles.info}>
          <p style={styles.filename}>{currentMedia.originalName}</p>
          {media.length > 1 && (
            <p style={styles.counter}>
              {currentIndex + 1} / {media.length}
            </p>
          )}
        </div>

        {/* Actions */}
        <div style={styles.actions}>
          {isImage && (
            <>
              <button style={styles.actionButton} onClick={handleZoomOut}>
                <ZoomOut size={20} />
              </button>
              <span style={styles.zoomLevel}>{Math.round(zoom * 100)}%</span>
              <button style={styles.actionButton} onClick={handleZoomIn}>
                <ZoomIn size={20} />
              </button>
            </>
          )}
          
          <button style={styles.actionButton} onClick={handleDownload}>
            <Download size={20} />
          </button>
        </div>
      </div>

      {/* Thumbnails */}
      {media.length > 1 && (
        <div style={styles.thumbnails}>
          {media.map((item, index) => (
            <div
              key={item._id}
              style={{
                ...styles.thumbnail,
                ...(index === currentIndex ? styles.thumbnailActive : {})
              }}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(index);
                setZoom(1);
              }}
            >
              <img
                src={item.thumbnail || item.url}
                alt=""
                style={styles.thumbnailImage}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    zIndex: 10000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },

  closeButton: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
    zIndex: 10001,
  },

  navButton: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
    zIndex: 10001,
  },

  navButtonLeft: {
    left: '20px',
  },

  navButtonRight: {
    right: '20px',
  },

  navButtonDisabled: {
    opacity: 0.3,
    cursor: 'not-allowed',
  },

  mediaContainer: {
    maxWidth: '90vw',
    maxHeight: '85vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'auto',
  },

  image: {
    maxWidth: '100%',
    maxHeight: '85vh',
    objectFit: 'contain',
    transition: 'transform 0.2s',
    cursor: 'zoom-in',
  },

  video: {
    maxWidth: '100%',
    maxHeight: '85vh',
  },

  controlsBar: {
    position: 'absolute',
    top: '20px',
    left: '20px',
    right: '80px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 20px',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: '12px',
    backdropFilter: 'blur(10px)',
    zIndex: 10001,
  },

  info: {
    flex: 1,
    minWidth: 0,
  },

  filename: {
    color: 'white',
    fontSize: '14px',
    fontWeight: '500',
    margin: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  counter: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '12px',
    margin: '4px 0 0 0',
  },

  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },

  actionButton: {
    background: 'none',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    padding: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '6px',
    transition: 'all 0.2s',
  },

  zoomLevel: {
    color: 'white',
    fontSize: '14px',
    fontWeight: '500',
    minWidth: '50px',
    textAlign: 'center',
  },

  thumbnails: {
    position: 'absolute',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    gap: '8px',
    padding: '12px',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: '12px',
    backdropFilter: 'blur(10px)',
    maxWidth: '90vw',
    overflowX: 'auto',
    zIndex: 10001,
  },

  thumbnail: {
    width: '60px',
    height: '60px',
    borderRadius: '6px',
    overflow: 'hidden',
    cursor: 'pointer',
    border: '2px solid transparent',
    transition: 'all 0.2s',
    flexShrink: 0,
  },

  thumbnailActive: {
    borderColor: '#764ba2',
  },

  thumbnailImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
};

export default MediaLightbox;