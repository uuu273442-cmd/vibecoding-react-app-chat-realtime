// Đường dẫn: src/contexts/ThemeContext.jsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import { loadTheme, saveTheme, applyTheme, loadWallpaper, saveWallpaper } from '../services/themeService';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [themeId, setThemeId] = useState(() => loadTheme());

  useEffect(() => { applyTheme(themeId); }, [themeId]);

  const changeTheme = (id) => {
    setThemeId(id);
    saveTheme(id);
    applyTheme(id);
  };

  const getWallpaper = (convId) => loadWallpaper(convId || 'global');
  const setWallpaper = (convId, wpId) => saveWallpaper(convId || 'global', wpId);

  return (
    <ThemeContext.Provider value={{ themeId, changeTheme, getWallpaper, setWallpaper }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};