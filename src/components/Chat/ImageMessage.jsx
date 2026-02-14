// Đường dẫn: src/components/Chat/ImageMessage.jsx
// Render images trong chat với smart layouts

import React from 'react';

const ImageMessage = ({ images, onImageClick }) => {
  if (!images || images.length === 0) return null;

  // Determine layout based on count
  const getLayout = () => {
    switch (images.length) {
      case 1:
        return 'single';
      case 2:
        return 'double';
      case 3:
        return 'triple';
      case 4:
        return 'quad';
      default:
        return 'grid';
    }
  };

  const layout = getLayout();

  return (
    <div style={styles.container}>
      <div style={styles[layout]}>
        {images.slice(0, layout === 'grid' ? 4 : images.length).map((image, index) => (
          <div
            key={image._id}
            style={{
              ...styles.imageWrapper,
              ...(layout === 'grid' && index === 3 && images.length > 4 ? styles.lastImageWrapper : {})
            }}
            onClick={() => onImageClick?.(index)}
          >
            <img
              src={image.thumbnail || image.url}
              alt={image.originalName}
              style={styles.image}
              loading="lazy"
            />
            
            {/* Show count overlay for 5+ images */}
            {layout === 'grid' && index === 3 && images.length > 4 && (
              <div style={styles.moreOverlay}>
                <span style={styles.moreText}>+{images.length - 4}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '400px',
    minWidth: '200px',
  },

  // Single image - full width
  single: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '4px',
    borderRadius: '12px',
    overflow: 'hidden',
  },

  // 2 images - side by side
  double: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '4px',
    borderRadius: '12px',
    overflow: 'hidden',
  },

  // 3 images - 2 on top, 1 below
  triple: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gridTemplateRows: '1fr 1fr',
    gap: '4px',
    borderRadius: '12px',
    overflow: 'hidden',
  },

  // 4 images - 2x2 grid
  quad: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gridTemplateRows: '1fr 1fr',
    gap: '4px',
    borderRadius: '12px',
    overflow: 'hidden',
  },

  // 5+ images - 2x2 grid with +N overlay
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gridTemplateRows: '1fr 1fr',
    gap: '4px',
    borderRadius: '12px',
    overflow: 'hidden',
  },

  imageWrapper: {
    position: 'relative',
    width: '100%',
    paddingBottom: '100%', // Square aspect ratio
    backgroundColor: '#f3f4f6',
    cursor: 'pointer',
    overflow: 'hidden',
  },

  lastImageWrapper: {
    position: 'relative',
  },

  image: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.2s',
  },

  moreOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },

  moreText: {
    fontSize: '32px',
    fontWeight: '700',
    color: 'white',
  },
};

// Add hover effect via style tag
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    .image-wrapper:hover img {
      transform: scale(1.05);
    }
  `;
  document.head.appendChild(style);
}

export default ImageMessage;