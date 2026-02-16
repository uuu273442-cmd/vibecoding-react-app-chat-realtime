// Đường dẫn: src/components/Chat/MessageSearch.jsx
// Search messages với highlight results

import React, { useState, useRef, useEffect } from 'react';
import { Search, X, ArrowRight } from 'lucide-react';
import { searchMessages } from '../../services/chatService';
import { useOnClickOutside } from '../../hooks/useOnClickOutside';

const MessageSearch = ({ onResultClick, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');
  
  const searchRef = useRef(null);
  const inputRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  useOnClickOutside(searchRef, onClose);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSearch = async (searchQuery) => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    setError('');

    try {
      const data = await searchMessages(searchQuery.trim());
      setResults(data);
      
      if (data.length === 0) {
        setError('No messages found');
      }
    } catch (err) {
      console.error('Search failed:', err);
      setError('Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    // Debounce search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      handleSearch(value);
    }, 500);
  };

  const handleResultClick = (result) => {
    onResultClick?.(result);
    onClose();
  };

  const highlightText = (text, query) => {
    if (!query) return text;

    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === query.toLowerCase() ? (
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

    if (diffDays === 0) {
      return date.toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString('vi-VN', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('vi-VN', { 
        day: '2-digit',
        month: '2-digit'
      });
    }
  };

  return (
    <div style={styles.overlay}>
      <div ref={searchRef} style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <h3 style={styles.title}>Search Messages</h3>
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
            placeholder="Search for messages..."
            value={query}
            onChange={handleInputChange}
            style={styles.input}
          />
          {query && (
            <button 
              onClick={() => {
                setQuery('');
                setResults([]);
                inputRef.current?.focus();
              }}
              style={styles.clearButton}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Results */}
        <div style={styles.results}>
          {isSearching ? (
            <div style={styles.loading}>
              <div style={styles.spinner}>⟳</div>
              <p>Searching...</p>
            </div>
          ) : error ? (
            <div style={styles.empty}>
              <p style={styles.emptyText}>{error}</p>
            </div>
          ) : results.length > 0 ? (
            <>
              <div style={styles.resultCount}>
                {results.length} result{results.length > 1 ? 's' : ''} found
              </div>
              
              {results.map((result) => (
                <div
                  key={result._id}
                  style={styles.resultItem}
                  onClick={() => handleResultClick(result)}
                >
                  <div style={styles.resultContent}>
                    <p style={styles.resultText}>
                      {highlightText(result.content, query)}
                    </p>
                    
                    <div style={styles.resultMeta}>
                      <span style={styles.resultDate}>
                        {formatDate(result.createdAt)}
                      </span>
                      
                      {result.score && (
                        <span style={styles.resultScore}>
                          {Math.round(result.score * 100)}% match
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <ArrowRight size={16} style={styles.resultArrow} />
                </div>
              ))}
            </>
          ) : query.trim().length >= 2 ? (
            <div style={styles.empty}>
              <p style={styles.emptyText}>No messages found</p>
              <p style={styles.emptyHint}>Try different keywords</p>
            </div>
          ) : (
            <div style={styles.empty}>
              <p style={styles.emptyHint}>
                Type at least 2 characters to search
              </p>
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
    paddingTop: '100px',
  },

  container: {
    width: '90%',
    maxWidth: '600px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    overflow: 'hidden',
    maxHeight: '80vh',
    display: 'flex',
    flexDirection: 'column',
  },

  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    borderBottom: '1px solid #e5e7eb',
  },

  title: {
    fontSize: '18px',
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

  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px 20px',
    borderBottom: '1px solid #e5e7eb',
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
  },

  clearButton: {
    background: 'none',
    border: 'none',
    color: '#9ca3af',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
  },

  results: {
    flex: 1,
    overflowY: 'auto',
    padding: '12px',
  },

  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    color: '#6b7280',
  },

  spinner: {
    fontSize: '32px',
    animation: 'spin 1s linear infinite',
    marginBottom: '12px',
  },

  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    textAlign: 'center',
  },

  emptyText: {
    fontSize: '15px',
    color: '#6b7280',
    margin: '0 0 8px 0',
  },

  emptyHint: {
    fontSize: '13px',
    color: '#9ca3af',
    margin: 0,
  },

  resultCount: {
    fontSize: '13px',
    color: '#6b7280',
    padding: '8px 12px',
    fontWeight: '500',
  },

  resultItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    marginBottom: '4px',
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
  },

  highlight: {
    backgroundColor: '#fef08a',
    color: '#854d0e',
    padding: '2px 4px',
    borderRadius: '3px',
    fontWeight: '600',
  },

  resultMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
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

// Add hover effect
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}

export default MessageSearch;