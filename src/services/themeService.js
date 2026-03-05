// Đường dẫn: src/services/themeService.js
// Quản lý theme, wallpaper, per-conversation settings

const THEME_KEY = 'app_theme';
const WALLPAPER_KEY = 'wallpapers'; // object: { [convId]: wallpaperUrl }
const GLOBAL_WALLPAPER_KEY = 'global_wallpaper';

// ── Themes ────────────────────────────────────────────────────────────────────
export const THEMES = {
  light: {
    id: 'light',
    name: 'Sáng',
    emoji: '☀️',
    vars: {
      '--bg-app':        '#f0f2f5',
      '--bg-sidebar':    '#ffffff',
      '--bg-chat':       '#f0f2f5',
      '--bg-bubble-own': 'linear-gradient(135deg,#667eea,#764ba2)',
      '--bg-bubble-other': '#ffffff',
      '--bg-input':      '#f0f2f5',
      '--bg-header':     '#ffffff',
      '--text-primary':  '#111827',
      '--text-secondary':'#6b7280',
      '--text-bubble-own': '#ffffff',
      '--text-bubble-other': '#111827',
      '--border':        '#e5e7eb',
      '--accent':        '#764ba2',
      '--accent-light':  '#ede9fe',
      '--shadow':        'rgba(0,0,0,0.08)',
      '--bg-sidebar-nav': '#1e1b4b',
      '--nav-text': '#9ca3af',
      '--accent-nav-bg': 'rgba(167,139,250,0.15)',
      '--online':        '#22c55e',
    },
  },
  dark: {
    id: 'dark',
    name: 'Tối',
    emoji: '🌙',
    vars: {
      '--bg-app':        '#0f0f0f',
      '--bg-sidebar':    '#1a1a1a',
      '--bg-chat':       '#0f0f0f',
      '--bg-bubble-own': 'linear-gradient(135deg,#667eea,#764ba2)',
      '--bg-bubble-other': '#2a2a2a',
      '--bg-input':      '#2a2a2a',
      '--bg-header':     '#1a1a1a',
      '--text-primary':  '#f9fafb',
      '--text-secondary':'#9ca3af',
      '--text-bubble-own': '#ffffff',
      '--text-bubble-other': '#f9fafb',
      '--border':        '#2d2d2d',
      '--accent':        '#818cf8',
      '--accent-light':  '#312e81',
      '--shadow':        'rgba(0,0,0,0.3)',
      '--bg-sidebar-nav': '#0a0a0a',
      '--nav-text': '#6b7280',
      '--accent-nav-bg': 'rgba(129,140,248,0.2)',
      '--online':        '#22c55e',
    },
  },
  ocean: {
    id: 'ocean',
    name: 'Đại dương',
    emoji: '🌊',
    vars: {
      '--bg-app':        '#e0f2fe',
      '--bg-sidebar':    '#ffffff',
      '--bg-chat':       '#e0f2fe',
      '--bg-bubble-own': 'linear-gradient(135deg,#0284c7,#0369a1)',
      '--bg-bubble-other': '#ffffff',
      '--bg-input':      '#f0f9ff',
      '--bg-header':     '#ffffff',
      '--text-primary':  '#0c4a6e',
      '--text-secondary':'#0284c7',
      '--text-bubble-own': '#ffffff',
      '--text-bubble-other': '#0c4a6e',
      '--border':        '#bae6fd',
      '--accent':        '#0284c7',
      '--accent-light':  '#e0f2fe',
      '--shadow':        'rgba(2,132,199,0.1)',
      '--bg-sidebar-nav': '#0c2340',
      '--nav-text': '#7dd3fc',
      '--accent-nav-bg': 'rgba(2,132,199,0.25)',
      '--online':        '#22c55e',
    },
  },
  rose: {
    id: 'rose',
    name: 'Hồng',
    emoji: '🌸',
    vars: {
      '--bg-app':        '#fff1f2',
      '--bg-sidebar':    '#ffffff',
      '--bg-chat':       '#fff1f2',
      '--bg-bubble-own': 'linear-gradient(135deg,#f43f5e,#e11d48)',
      '--bg-bubble-other': '#ffffff',
      '--bg-input':      '#fff1f2',
      '--bg-header':     '#ffffff',
      '--text-primary':  '#881337',
      '--text-secondary':'#f43f5e',
      '--text-bubble-own': '#ffffff',
      '--text-bubble-other': '#881337',
      '--border':        '#fecdd3',
      '--accent':        '#f43f5e',
      '--accent-light':  '#ffe4e6',
      '--shadow':        'rgba(244,63,94,0.1)',
      '--bg-sidebar-nav': '#3d0019',
      '--nav-text': '#fda4af',
      '--accent-nav-bg': 'rgba(244,63,94,0.2)',
      '--online':        '#22c55e',
    },
  },
  forest: {
    id: 'forest',
    name: 'Rừng',
    emoji: '🌿',
    vars: {
      '--bg-app':        '#f0fdf4',
      '--bg-sidebar':    '#ffffff',
      '--bg-chat':       '#f0fdf4',
      '--bg-bubble-own': 'linear-gradient(135deg,#16a34a,#15803d)',
      '--bg-bubble-other': '#ffffff',
      '--bg-input':      '#f0fdf4',
      '--bg-header':     '#ffffff',
      '--text-primary':  '#14532d',
      '--text-secondary':'#16a34a',
      '--text-bubble-own': '#ffffff',
      '--text-bubble-other': '#14532d',
      '--border':        '#bbf7d0',
      '--accent':        '#16a34a',
      '--accent-light':  '#dcfce7',
      '--shadow':        'rgba(22,163,74,0.1)',
      '--bg-sidebar-nav': '#0a2318',
      '--nav-text': '#86efac',
      '--accent-nav-bg': 'rgba(22,163,74,0.2)',
      '--online':        '#22c55e',
    },
  },
};

export const WALLPAPERS = [
  { id: 'none',     name: 'Mặc định', preview: null, value: null },
  { id: 'gradient1', name: 'Aurora',   preview: 'linear-gradient(135deg,#667eea,#764ba2)',
    value: 'linear-gradient(135deg,#667eea 0%,#764ba2 50%,#f093fb 100%)' },
  { id: 'gradient2', name: 'Sunset',   preview: 'linear-gradient(135deg,#f093fb,#f5576c)',
    value: 'linear-gradient(135deg,#f093fb 0%,#f5576c 50%,#fda085 100%)' },
  { id: 'gradient3', name: 'Ocean',    preview: 'linear-gradient(135deg,#4facfe,#00f2fe)',
    value: 'linear-gradient(135deg,#4facfe 0%,#00f2fe 100%)' },
  { id: 'gradient4', name: 'Forest',   preview: 'linear-gradient(135deg,#43e97b,#38f9d7)',
    value: 'linear-gradient(135deg,#43e97b 0%,#38f9d7 100%)' },
  { id: 'gradient5', name: 'Rose',     preview: 'linear-gradient(135deg,#f9a8d4,#fda4af)',
    value: 'linear-gradient(135deg,#fdf2f8 0%,#fce7f3 40%,#fbcfe8 100%)' },
  { id: 'dots',      name: 'Chấm',     preview: '#f0f2f5',
    value: 'radial-gradient(circle,#d1d5db 1px,transparent 1px)', size: '20px 20px' },
  { id: 'lines',     name: 'Kẻ ô',     preview: '#f0f2f5',
    value: 'linear-gradient(#e5e7eb 1px,transparent 1px),linear-gradient(90deg,#e5e7eb 1px,transparent 1px)',
    size: '24px 24px' },
];

// ── Persistence ───────────────────────────────────────────────────────────────
export const saveTheme = (themeId) => {
  localStorage.setItem(THEME_KEY, themeId);
};

export const loadTheme = () => {
  return localStorage.getItem(THEME_KEY) || 'light';
};

export const saveWallpaper = (convId, wallpaperId) => {
  if (convId === 'global') {
    localStorage.setItem(GLOBAL_WALLPAPER_KEY, wallpaperId);
    return;
  }
  const map = JSON.parse(localStorage.getItem(WALLPAPER_KEY) || '{}');
  map[convId] = wallpaperId;
  localStorage.setItem(WALLPAPER_KEY, JSON.stringify(map));
};

export const loadWallpaper = (convId) => {
  if (convId === 'global') {
    return localStorage.getItem(GLOBAL_WALLPAPER_KEY) || 'none';
  }
  const map = JSON.parse(localStorage.getItem(WALLPAPER_KEY) || '{}');
  return map[convId] || localStorage.getItem(GLOBAL_WALLPAPER_KEY) || 'none';
};

// ── Apply CSS vars ─────────────────────────────────────────────────────────────
export const applyTheme = (themeId) => {
  const theme = THEMES[themeId] || THEMES.light;
  const root = document.documentElement;
  Object.entries(theme.vars).forEach(([k, v]) => root.style.setProperty(k, v));
};

// ── Get wallpaper style ───────────────────────────────────────────────────────
export const getWallpaperStyle = (wallpaperId) => {
  const wp = WALLPAPERS.find(w => w.id === wallpaperId);
  if (!wp || !wp.value) return {};
  return {
    backgroundImage: wp.value,
    backgroundSize: wp.size || 'cover',
    backgroundRepeat: wp.size ? 'repeat' : 'no-repeat',
  };
};