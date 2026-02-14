// Đường dẫn: src/components/Chat/MediaMessage.jsx
// Wrapper component cho media (images + videos)

import React, { useState } from 'react';
import ImageMessage from './ImageMessage';
import VideoMessage from './VideoMessage';
import MediaLightbox from './MediaLightbox';

const MediaMessage = ({ attachments, attachmentCount }) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  if (!attachments || attachments.length === 0) return null;

  // Separate images and videos
  const images = attachments.filter(a => a.type === 'image');
  const videos = attachments.filter(a => a.type === 'video');

  // Prepare media for lightbox (images only, videos play inline)
  const lightboxMedia = images.map(img => ({
    ...img,
    type: 'image'
  }));

  const handleImageClick = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <div style={styles.container}>
      {/* Images */}
      {images.length > 0 && (
        <ImageMessage 
          images={images}
          onImageClick={handleImageClick}
        />
      )}

      {/* Videos */}
      {videos.length > 0 && (
        <div style={styles.videosContainer}>
          {videos.map(video => (
            <VideoMessage
              key={video._id}
              video={video}
            />
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxOpen && lightboxMedia.length > 0 && (
        <MediaLightbox
          media={lightboxMedia}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },

  videosContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
};

export default MediaMessage;