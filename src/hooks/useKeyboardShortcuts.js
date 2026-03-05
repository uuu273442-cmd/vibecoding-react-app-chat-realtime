// Đường dẫn: src/hooks/useKeyboardShortcuts.js
// Global keyboard shortcuts: Ctrl+K (search), Ctrl+N (new chat), Esc (close modal), ↑ (edit last)

import { useEffect } from 'react';

/**
 * shortcuts: [{ key, ctrl?, meta?, shift?, action }]
 */
export function useKeyboardShortcuts(shortcuts, deps = []) {
  useEffect(() => {
    const handler = (e) => {
      for (const s of shortcuts) {
        const ctrlMatch  = s.ctrl  ? (e.ctrlKey || e.metaKey) : (!s.ctrl && !s.meta ? true : false);
        const metaMatch  = s.meta  ? e.metaKey : true;
        const shiftMatch = s.shift ? e.shiftKey : true;
        const keyMatch   = e.key?.toLowerCase() === s.key?.toLowerCase();

        if (keyMatch && ctrlMatch && shiftMatch) {
          // Don't intercept Ctrl+B/I/` when typing in input
          const tag = document.activeElement?.tagName;
          const isInput = tag === 'INPUT' || tag === 'TEXTAREA';
          if (isInput && !s.allowInInput) continue;

          e.preventDefault();
          s.action(e);
          break;
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}