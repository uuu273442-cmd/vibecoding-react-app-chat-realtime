// Đường dẫn: src/components/Chat/SystemMessage.jsx

import React from 'react';

export default function SystemMessage({ message }) {
  return (
    <div style={styles.wrapper}>
      <span style={styles.text}>{message.content}</span>
    </div>
  );
}

const styles = {
  wrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '2px 24px',
    margin: '2px 0',
  },
  text: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 1.5,
  },
};