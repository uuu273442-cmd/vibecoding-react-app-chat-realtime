// Đường dẫn: src/components/Chat/VoicePlayer.jsx
// FIXED: Hooks must be called before any conditionals

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';
import { formatDuration } from '../../services/chatService';

const VoicePlayer = ({ attachment, isOwn }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // ALL HOOKS FIRST - before any conditionals
  useEffect(() => {
    if (!attachment) return; // Guard inside hook is OK
    
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [attachment]);

  // Set initial duration from attachment if available
  useEffect(() => {
    if (!attachment) return; // Guard inside hook is OK
    
    if (attachment.duration && duration === 0) {
      setDuration(attachment.duration);
      setIsLoading(false);
    }
  }, [attachment, duration]);

  // NOW check conditionally AFTER all hooks
  if (!attachment) {
    console.error('VoicePlayer: attachment is undefined');
    return (
      <div style={styles.errorContainer}>
        <p style={styles.errorText}>Voice message not available</p>
      </div>
    );
  }

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().catch(err => {
        console.error('Play failed:', err);
        setIsPlaying(false);
      });
      setIsPlaying(true);
    }
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (!audio || duration === 0) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;
    
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Generate simple waveform bars
  const waveformBars = Array(40).fill(0).map((_, i) => {
    const height = Math.random() * 60 + 20;
    const isPassed = (i / 40) * 100 < progress;
    return { height, isPassed };
  });

  return (
    <div style={{
      ...styles.container,
      ...(isOwn ? styles.containerOwn : styles.containerOther)
    }}>
      {/* Play/Pause Button */}
      <button 
        onClick={togglePlay} 
        style={styles.playButton}
        disabled={isLoading}
      >
        {isPlaying ? (
          <Pause size={20} fill="currentColor" />
        ) : (
          <Play size={20} fill="currentColor" style={{ marginLeft: '2px' }} />
        )}
      </button>

      {/* Waveform */}
      <div style={styles.waveformContainer}>
        <div 
          style={styles.waveform}
          onClick={handleSeek}
        >
          {waveformBars.map((bar, i) => (
            <div
              key={i}
              style={{
                ...styles.waveBar,
                height: `${bar.height}%`,
                backgroundColor: bar.isPassed 
                  ? (isOwn ? 'rgba(255,255,255,0.9)' : '#764ba2')
                  : (isOwn ? 'rgba(255,255,255,0.4)' : 'rgba(118,75,162,0.3)')
              }}
            />
          ))}
        </div>

        {/* Time Display */}
        <div style={styles.timeContainer}>
          <span style={{
            ...styles.time,
            ...(isOwn ? styles.timeOwn : styles.timeOther)
          }}>
            {isPlaying || currentTime > 0 
              ? formatDuration(currentTime)
              : formatDuration(duration)
            }
          </span>
        </div>
      </div>

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src={attachment.url}
        preload="metadata"
      />
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: '18px',
    minWidth: '260px',
    maxWidth: '320px',
  },

  containerOwn: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },

  containerOther: {
    backgroundColor: '#f3f4f6',
  },

  playButton: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: 'none',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    color: 'white',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'all 0.2s',
  },

  waveformContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },

  waveform: {
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
    height: '32px',
    cursor: 'pointer',
  },

  waveBar: {
    flex: 1,
    borderRadius: '2px',
    transition: 'all 0.2s',
    minWidth: '2px',
  },

  timeContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
  },

  time: {
    fontSize: '12px',
    fontWeight: '500',
  },

  timeOwn: {
    color: 'rgba(255, 255, 255, 0.9)',
  },

  timeOther: {
    color: '#6b7280',
  },

  // Error styles
  errorContainer: {
    padding: '12px 16px',
    backgroundColor: '#fee2e2',
    borderRadius: '8px',
  },

  errorText: {
    fontSize: '13px',
    color: '#991b1b',
    margin: 0,
  },
};

export default VoicePlayer;