// Đường dẫn: src/components/Chat/VideoMessage.jsx
// Render video player trong chat

import React, { useState, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react';
import { formatDuration, formatFileSize } from '../../services/chatService';

const VideoMessage = ({ video }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(video.duration || 0);
  const [showControls, setShowControls] = useState(true);

  const togglePlay = () => {
    if (isPlaying) {
      videoRef.current?.pause();
    } else {
      videoRef.current?.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = (e) => {
    setCurrentTime(e.target.currentTime);
  };

  const handleLoadedMetadata = (e) => {
    setDuration(e.target.duration);
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;
    
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      } else if (videoRef.current.webkitRequestFullscreen) {
        videoRef.current.webkitRequestFullscreen();
      }
    }
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div 
      style={styles.container}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(isPlaying ? false : true)}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={video.url}
        style={styles.video}
        onClick={togglePlay}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Play/Pause Overlay */}
      {!isPlaying && (
        <div style={styles.playOverlay} onClick={togglePlay}>
          <div style={styles.playButton}>
            <Play size={40} color="white" fill="white" />
          </div>
        </div>
      )}

      {/* Controls */}
      {showControls && (
        <div style={styles.controls}>
          {/* Progress Bar */}
          <div style={styles.progressBar} onClick={handleSeek}>
            <div 
              style={{
                ...styles.progress,
                width: `${progress}%`
              }} 
            />
          </div>

          {/* Control Buttons */}
          <div style={styles.controlButtons}>
            <div style={styles.leftControls}>
              <button onClick={togglePlay} style={styles.controlButton}>
                {isPlaying ? <Pause size={18} /> : <Play size={18} />}
              </button>
              
              <button onClick={toggleMute} style={styles.controlButton}>
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              
              <span style={styles.time}>
                {formatDuration(currentTime)} / {formatDuration(duration)}
              </span>
            </div>

            <div style={styles.rightControls}>
              <span style={styles.fileSize}>{formatFileSize(video.size)}</span>
              
              <button onClick={handleFullscreen} style={styles.controlButton}>
                <Maximize size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    position: 'relative',
    maxWidth: '400px',
    minWidth: '280px',
    borderRadius: '12px',
    overflow: 'hidden',
    backgroundColor: '#000',
  },

  video: {
    width: '100%',
    display: 'block',
    cursor: 'pointer',
  },

  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    cursor: 'pointer',
  },

  playButton: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
  },

  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
    padding: '12px',
  },

  progressBar: {
    width: '100%',
    height: '4px',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: '2px',
    marginBottom: '8px',
    cursor: 'pointer',
  },

  progress: {
    height: '100%',
    backgroundColor: '#764ba2',
    borderRadius: '2px',
    transition: 'width 0.1s',
  },

  controlButtons: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  leftControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },

  rightControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },

  controlButton: {
    background: 'none',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'opacity 0.2s',
  },

  time: {
    fontSize: '12px',
    color: 'white',
    fontWeight: '500',
  },

  fileSize: {
    fontSize: '11px',
    color: 'rgba(255, 255, 255, 0.8)',
  },
};

export default VideoMessage;