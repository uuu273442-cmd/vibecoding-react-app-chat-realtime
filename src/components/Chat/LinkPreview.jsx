// Đường dẫn: src/components/Chat/LinkPreview.jsx
// Link preview cards trong messages

import React from 'react';
import { ExternalLink, Image as ImageIcon } from 'lucide-react';

const LinkPreview = ({ links }) => {
  if (!links || links.length === 0) return null;

  return (
    <div style={styles.container}>
      {links.map((link) => (
        <a
          key={link._id}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          style={styles.linkCard}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Image */}
          {link.image && (
            <div style={styles.imageContainer}>
              <img
                src={link.image}
                alt={link.title}
                style={styles.image}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}

          {/* Content */}
          <div style={styles.content}>
            {/* Title */}
            <div style={styles.titleContainer}>
              <h4 style={styles.title}>{link.title}</h4>
              <ExternalLink size={14} style={styles.externalIcon} />
            </div>

            {/* Description */}
            {link.description && (
              <p style={styles.description}>{link.description}</p>
            )}

            {/* URL */}
            <p style={styles.url}>
              {new URL(link.url).hostname}
            </p>
          </div>
        </a>
      ))}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginTop: '8px',
  },

  linkCard: {
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '12px',
    border: '1px solid rgba(0,0,0,0.1)',
    overflow: 'hidden',
    textDecoration: 'none',
    backgroundColor: 'rgba(0,0,0,0.02)',
    transition: 'all 0.2s',
    maxWidth: '400px',
  },

  imageContainer: {
    width: '100%',
    height: '200px',
    backgroundColor: '#f3f4f6',
    overflow: 'hidden',
  },

  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },

  content: {
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },

  titleContainer: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '8px',
  },

  title: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1f2937',
    margin: 0,
    flex: 1,
    lineHeight: '1.4',
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
  },

  externalIcon: {
    color: '#9ca3af',
    flexShrink: 0,
    marginTop: '2px',
  },

  description: {
    fontSize: '13px',
    color: '#6b7280',
    margin: 0,
    lineHeight: '1.4',
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
  },

  url: {
    fontSize: '12px',
    color: '#9ca3af',
    margin: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
};

export default LinkPreview;