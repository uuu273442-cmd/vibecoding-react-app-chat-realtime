// Đường dẫn: src/components/Chat/VoiceRecorder.jsx
// Voice recording component

import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Send, X, Trash2 } from 'lucide-react';
import { formatDuration } from '../../services/chatService';

const VoiceRecorder = ({ onRecordingComplete, onCancel, maxDuration = 60 }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioURL, setAudioURL] = useState(null);
  
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    return () => {
      // Cleanup
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });
      
      streamRef.current = stream;
      
      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioURL(url);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };
      
      // Start recording
      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setDuration(prev => {
          const newDuration = prev + 1;
          
          // Auto-stop at max duration
          if (newDuration >= maxDuration) {
            stopRecording();
          }
          
          return newDuration;
        });
      }, 1000);
      
    } catch (error) {
      console.error('Microphone access denied:', error);
      alert('Please allow microphone access to record voice messages');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const togglePause = () => {
    if (mediaRecorderRef.current) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        timerRef.current = setInterval(() => {
          setDuration(prev => prev + 1);
        }, 1000);
      } else {
        mediaRecorderRef.current.pause();
        clearInterval(timerRef.current);
      }
      setIsPaused(!isPaused);
    }
  };

  const handleDelete = () => {
    setAudioBlob(null);
    setAudioURL(null);
    setDuration(0);
  };

  const handleSend = () => {
    if (audioBlob) {
      onRecordingComplete(audioBlob);
    }
  };

  const handleReRecord = () => {
    handleDelete();
    startRecording();
  };

  return (
    <div style={styles.container}>
      {!audioBlob ? (
        // Recording UI
        <div style={styles.recordingUI}>
          <div style={styles.recordingHeader}>
            <h3 style={styles.title}>Voice Message</h3>
            <button onClick={onCancel} style={styles.closeButton}>
              <X size={20} />
            </button>
          </div>

          <div style={styles.recordingContent}>
            {/* Waveform Animation */}
            {isRecording && (
              <div style={styles.waveformContainer}>
                <div style={styles.waveform}>
                  <span style={{
                    ...styles.wave,
                    animationDelay: '0s'
                  }}></span>
                  <span style={{
                    ...styles.wave,
                    animationDelay: '0.2s'
                  }}></span>
                  <span style={{
                    ...styles.wave,
                    animationDelay: '0.4s'
                  }}></span>
                  <span style={{
                    ...styles.wave,
                    animationDelay: '0.6s'
                  }}></span>
                  <span style={{
                    ...styles.wave,
                    animationDelay: '0.8s'
                  }}></span>
                </div>
              </div>
            )}

            {/* Duration */}
            <div style={styles.durationContainer}>
              <span style={styles.duration}>
                {formatDuration(duration)}
              </span>
              <span style={styles.maxDuration}>
                / {formatDuration(maxDuration)}
              </span>
            </div>

            {/* Record Button */}
            <button
              onClick={isRecording ? stopRecording : startRecording}
              style={{
                ...styles.recordButton,
                ...(isRecording ? styles.recordButtonActive : {})
              }}
            >
              {isRecording ? (
                <Square size={32} fill="white" />
              ) : (
                <Mic size={32} />
              )}
            </button>

            {/* Hint */}
            <p style={styles.hint}>
              {!isRecording && 'Tap to start recording'}
              {isRecording && 'Tap to stop recording'}
            </p>
          </div>
        </div>
      ) : (
        // Preview UI
        <div style={styles.previewUI}>
          <div style={styles.previewHeader}>
            <h3 style={styles.title}>Voice Message Preview</h3>
            <button onClick={onCancel} style={styles.closeButton}>
              <X size={20} />
            </button>
          </div>

          <div style={styles.previewContent}>
            {/* Audio Player */}
            <audio 
              src={audioURL} 
              controls 
              style={styles.audioPlayer}
            />

            {/* Duration */}
            <p style={styles.previewDuration}>
              Duration: {formatDuration(duration)}
            </p>

            {/* Actions */}
            <div style={styles.previewActions}>
              <button onClick={handleReRecord} style={styles.deleteButton}>
                <Trash2 size={18} />
                Re-record
              </button>
              
              <button onClick={handleSend} style={styles.sendButton}>
                <Send size={18} />
                Send
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
    width: '100%',
    maxWidth: '400px',
  },

  // Recording UI
  recordingUI: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    overflow: 'hidden',
  },

  recordingHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    borderBottom: '1px solid #e5e7eb',
  },

  title: {
    fontSize: '16px',
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

  recordingContent: {
    padding: '40px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '24px',
  },

  waveformContainer: {
    height: '60px',
    display: 'flex',
    alignItems: 'center',
  },

  waveform: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    height: '100%',
  },

  wave: {
    width: '4px',
    backgroundColor: '#764ba2',
    borderRadius: '2px',
    animation: 'wave 1s ease-in-out infinite',
  },

  durationContainer: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '4px',
  },

  duration: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#1f2937',
  },

  maxDuration: {
    fontSize: '16px',
    color: '#9ca3af',
  },

  recordButton: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    border: 'none',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
    boxShadow: '0 4px 12px rgba(118, 75, 162, 0.3)',
  },

  recordButtonActive: {
    backgroundColor: '#dc2626',
    background: '#dc2626',
  },

  hint: {
    fontSize: '14px',
    color: '#6b7280',
    margin: 0,
  },

  // Preview UI
  previewUI: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    overflow: 'hidden',
  },

  previewHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    borderBottom: '1px solid #e5e7eb',
  },

  previewContent: {
    padding: '24px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
  },

  audioPlayer: {
    width: '100%',
    outline: 'none',
  },

  previewDuration: {
    fontSize: '14px',
    color: '#6b7280',
    margin: 0,
  },

  previewActions: {
    display: 'flex',
    gap: '12px',
    width: '100%',
  },

  deleteButton: {
    flex: 1,
    padding: '10px 16px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    backgroundColor: 'white',
    color: '#dc2626',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
  },

  sendButton: {
    flex: 1,
    padding: '10px 16px',
    border: 'none',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
  },
};

// Add CSS animation
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes wave {
      0%, 100% {
        height: 20%;
      }
      50% {
        height: 100%;
      }
    }
  `;
  document.head.appendChild(style);
}

export default VoiceRecorder;