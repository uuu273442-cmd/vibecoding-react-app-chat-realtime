// Đường dẫn: src/components/Chat/MessageSearch.jsx

import React, { useState, useRef, useEffect } from 'react';
import { Search, X, ArrowRight } from 'lucide-react';
import { searchMessages } from '../../services/chatService';

const MessageSearch = ({ conversationId, onResultClick, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const inputRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (overlayRef.current && e.target === overlayRef.current) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSearch = async (searchQuery) => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    setError('');
    setHasSearched(true);

    try {
      // API: GET /messages/:conversationId/search?q=keyword
      const data = await searchMessages(conversationId, searchQuery.trim());
      setResults(data);
    } catch (err) {
      console.error('Search failed:', err);
      setError('Tìm kiếm thất bại. Vui lòng thử lại.');
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    searchTimeoutRef.current = setTimeout(() => {
      handleSearch(value);
    }, 500);
  };

  const handleClearInput = () => {
    setQuery('');
    setResults([]);
    setHasSearched(false);
    setError('');
    inputRef.current?.focus();
  };

  const handleResultClick = (result) => {
    onResultClick?.(result);
    onClose();
  };

  const highlightText = (text, searchQuery) => {
    if (!searchQuery || !text) return text;

    const escaped = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    const parts = text.split(regex);

    return (
      <span>
        {parts.map((part, i) =>
          regex.test(part) ? (
            <mark key={i} style={styles.highlight}>{part}</mark>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </span>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    if (diffDays === 1) return 'Hôm qua';
    if (diffDays < 7) return date.toLocaleDateString('vi-VN', { weekday: 'short' });
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  };

  return (
    <div ref={overlayRef} style={styles.overlay}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <h3 style={styles.title}>Tìm kiếm tin nhắn</h3>
          <button onClick={onClose} style={styles.closeButton}>
            <X size={20} />
          </button>
        </div>

        {/* Search Input */}
        <div style={styles.searchBox}>
          <Search size={18} style={styles.searchIcon} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Nhập từ khóa tìm kiếm..."
            value={query}
            onChange={handleInputChange}
            style={styles.input}
          />
          {query && (
            <button onClick={handleClearInput} style={styles.clearButton}>
              <X size={16} />
            </button>
          )}
        </div>

        {/* Results */}
        <div style={styles.results}>
          {isSearching ? (
            <div style={styles.center}>
              <div style={styles.spinner} />
              <p style={styles.centerText}>Đang tìm kiếm...</p>
            </div>
          ) : error ? (
            <div style={styles.center}>
              <p style={styles.errorText}>{error}</p>
            </div>
          ) : results.length > 0 ? (
            <>
              <div style={styles.resultCount}>
                Tìm thấy {results.length} kết quả
              </div>

              {results.map((result) => (
                <div
                  key={result._id}
                  style={styles.resultItem}
                  onClick={() => handleResultClick(result)}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div style={styles.resultContent}>
                    <p style={styles.resultText}>
                      {highlightText(result.content, query)}
                    </p>
                    <div style={styles.resultMeta}>
                      <span style={styles.resultDate}>
                        {formatDate(result.createdAt)}
                      </span>
                      {result.score !== undefined && (
                        <span style={styles.resultScore}>
                          {Math.round(result.score * 100)}% khớp
                        </span>
                      )}
                    </div>
                  </div>
                  <ArrowRight size={16} style={styles.resultArrow} />
                </div>
              ))}
            </>
          ) : hasSearched && query.trim().length >= 2 ? (
            <div style={styles.center}>
              <p style={styles.centerText}>Không tìm thấy tin nhắn nào</p>
              <p style={styles.centerHint}>Thử từ khóa khác</p>
            </div>
          ) : (
            <div style={styles.center}>
              <p style={styles.centerHint}>Nhập ít nhất 2 ký tự để tìm kiếm</p>
            </div>
          )}
        </div>
      </div>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 10000,
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingTop: '80px',
  },
  container: {
    width: '90%',
    maxWidth: '580px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    overflow: 'hidden',
    maxHeight: '75vh',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    borderBottom: '1px solid #e5e7eb',
    flexShrink: 0,
  },
  title: {
    fontSize: '17px',
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
    alignItems: 'center',
    borderRadius: '4px',
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '14px 20px',
    borderBottom: '1px solid #e5e7eb',
    flexShrink: 0,
  },
  searchIcon: {
    color: '#9ca3af',
    flexShrink: 0,
  },
  input: {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: '15px',
    color: '#1f2937',
    backgroundColor: 'transparent',
  },
  clearButton: {
    background: 'none',
    border: 'none',
    color: '#9ca3af',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    borderRadius: '4px',
  },
  results: {
    flex: 1,
    overflowY: 'auto',
    padding: '8px',
  },
  center: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 20px',
    gap: '8px',
  },
  spinner: {
    width: '28px',
    height: '28px',
    border: '3px solid #e5e7eb',
    borderTopColor: '#764ba2',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
    marginBottom: '8px',
  },
  centerText: {
    fontSize: '14px',
    color: '#6b7280',
    margin: 0,
  },
  centerHint: {
    fontSize: '13px',
    color: '#9ca3af',
    margin: 0,
  },
  errorText: {
    fontSize: '14px',
    color: '#dc2626',
    margin: 0,
  },
  resultCount: {
    fontSize: '12px',
    color: '#6b7280',
    padding: '8px 12px 4px',
    fontWeight: '500',
  },
  resultItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.15s',
    marginBottom: '2px',
  },
  resultContent: {
    flex: 1,
    minWidth: 0,
  },
  resultText: {
    fontSize: '14px',
    color: '#1f2937',
    margin: '0 0 6px 0',
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    lineHeight: '1.5',
  },
  highlight: {
    backgroundColor: '#fef08a',
    color: '#854d0e',
    padding: '1px 3px',
    borderRadius: '3px',
    fontWeight: '600',
  },
  resultMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  resultDate: {
    fontSize: '12px',
    color: '#9ca3af',
  },
  resultScore: {
    fontSize: '11px',
    color: '#10b981',
    backgroundColor: '#d1fae5',
    padding: '2px 6px',
    borderRadius: '4px',
    fontWeight: '500',
  },
  resultArrow: {
    color: '#d1d5db',
    flexShrink: 0,
  },
};

// Inject spinner animation
const styleTag = document.createElement('style');
styleTag.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
if (!document.head.querySelector('[data-search-spin]')) {
  styleTag.setAttribute('data-search-spin', '1');
  document.head.appendChild(styleTag);
}

export default MessageSearch;