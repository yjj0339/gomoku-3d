/**
 * Gomoku 3D - Theme System v5.0
 * 
 * 14 professional themes with full color palettes
 * Based on various aesthetic styles: classic wood, modern, traditional Chinese, etc.
 */

const GomokuThemes = {
  // Classic themes
  classic: {
    name: '经典', nameEn: 'Classic',
    boardColor: '#dcb35c',
    boardColorDark: '#c89a3e',
    lineColor: '#5a4326',
    blackStone: '#1a1a1a',
    blackStoneHighlight: '#4a4a4a',
    whiteStone: '#f5f5f0',
    whiteStoneHighlight: '#ffffff',
    backgroundColor: '#2a2018',
    panelColor: 'rgba(42, 32, 24, 0.9)',
    textColor: '#e8dcc8',
    accentColor: '#d4a843',
    starPointColor: '#3a2818'
  },
  marble: {
    name: '大理石', nameEn: 'Marble',
    boardColor: '#e8e6e1',
    boardColorDark: '#d4d1ca',
    lineColor: '#6b6b6b',
    blackStone: '#2c2c2c',
    blackStoneHighlight: '#555555',
    whiteStone: '#fafaf8',
    whiteStoneHighlight: '#ffffff',
    backgroundColor: '#1a1a1f',
    panelColor: 'rgba(26, 26, 31, 0.92)',
    textColor: '#e8e6e1',
    accentColor: '#8b7d6b',
    starPointColor: '#4a4a4a'
  },
  oak: {
    name: '橡木', nameEn: 'Oak',
    boardColor: '#b8865a',
    boardColorDark: '#a06b3e',
    lineColor: '#4a3220',
    blackStone: '#1c1c1c',
    blackStoneHighlight: '#444444',
    whiteStone: '#f5f0e8',
    whiteStoneHighlight: '#ffffff',
    backgroundColor: '#2d1f12',
    panelColor: 'rgba(45, 31, 18, 0.92)',
    textColor: '#e8d5b8',
    accentColor: '#c89858',
    starPointColor: '#3a2812'
  },
  glass: {
    name: '琉璃', nameEn: 'Glass',
    boardColor: '#a8d4e8',
    boardColorDark: '#7ab8d4',
    lineColor: '#3a5a7a',
    blackStone: '#1a2a3a',
    blackStoneHighlight: '#3a5a7a',
    whiteStone: '#f0f8ff',
    whiteStoneHighlight: '#ffffff',
    backgroundColor: '#0d1929',
    panelColor: 'rgba(13, 25, 41, 0.88)',
    textColor: '#b8d4e8',
    accentColor: '#5ab8d4',
    starPointColor: '#2a4a6a'
  },
  sakura: {
    name: '樱花', nameEn: 'Sakura',
    boardColor: '#f5d0d9',
    boardColorDark: '#e8a8b8',
    lineColor: '#7a3a4a',
    blackStone: '#3a1a2a',
    blackStoneHighlight: '#6a3a4a',
    whiteStone: '#fff5f8',
    whiteStoneHighlight: '#ffffff',
    backgroundColor: '#1a0d12',
    panelColor: 'rgba(26, 13, 18, 0.92)',
    textColor: '#f0c8d4',
    accentColor: '#e8788a',
    starPointColor: '#5a2a3a'
  },
  mint: {
    name: '薄荷', nameEn: 'Mint',
    boardColor: '#a8e8c8',
    boardColorDark: '#78c8a0',
    lineColor: '#2a6a4a',
    blackStone: '#1a3a2a',
    blackStoneHighlight: '#3a6a4a',
    whiteStone: '#f0fff5',
    whiteStoneHighlight: '#ffffff',
    backgroundColor: '#0d1f15',
    panelColor: 'rgba(13, 31, 21, 0.92)',
    textColor: '#b8e8c8',
    accentColor: '#58c890',
    starPointColor: '#2a5a3a'
  },
  ivory: {
    name: '象牙', nameEn: 'Ivory',
    boardColor: '#f5edd6',
    boardColorDark: '#e8d8a8',
    lineColor: '#5a4a2a',
    blackStone: '#2a2018',
    blackStoneHighlight: '#5a4a3a',
    whiteStone: '#fffdf5',
    whiteStoneHighlight: '#ffffff',
    backgroundColor: '#1f1a12',
    panelColor: 'rgba(31, 26, 18, 0.92)',
    textColor: '#e8d8b8',
    accentColor: '#c8a858',
    starPointColor: '#4a3a1a'
  },
  midnight: {
    name: '午夜', nameEn: 'Midnight',
    boardColor: '#2a3a5a',
    boardColorDark: '#1a2a4a',
    lineColor: '#8a9ab8',
    blackStone: '#0a0a1a',
    blackStoneHighlight: '#2a2a4a',
    whiteStone: '#e8e8f0',
    whiteStoneHighlight: '#ffffff',
    backgroundColor: '#050510',
    panelColor: 'rgba(5, 5, 16, 0.95)',
    textColor: '#a8b8d8',
    accentColor: '#5a7ab8',
    starPointColor: '#3a4a6a'
  },
  // New themes
  ink: {
    name: '水墨', nameEn: 'Ink',
    boardColor: '#e8e4d8',
    boardColorDark: '#d4cfc0',
    lineColor: '#1a1a1a',
    blackStone: '#0a0a0a',
    blackStoneHighlight: '#2a2a2a',
    whiteStone: '#faf8f0',
    whiteStoneHighlight: '#ffffff',
    backgroundColor: '#1a1a1a',
    panelColor: 'rgba(26, 26, 26, 0.95)',
    textColor: '#e8e4d8',
    accentColor: '#8a8a8a',
    starPointColor: '#0a0a0a'
  },
  jade: {
    name: '翡翠', nameEn: 'Jade',
    boardColor: '#7ac8a0',
    boardColorDark: '#5aa880',
    lineColor: '#1a4a3a',
    blackStone: '#0a2a1a',
    blackStoneHighlight: '#2a5a3a',
    whiteStone: '#f0fff5',
    whiteStoneHighlight: '#ffffff',
    backgroundColor: '#0d1a12',
    panelColor: 'rgba(13, 26, 18, 0.92)',
    textColor: '#a8e8c8',
    accentColor: '#3ac890',
    starPointColor: '#1a4a2a'
  },
  bamboo: {
    name: '竹韵', nameEn: 'Bamboo',
    boardColor: '#c8d878',
    boardColorDark: '#a8c058',
    lineColor: '#3a4a1a',
    blackStone: '#1a2a0a',
    blackStoneHighlight: '#3a5a1a',
    whiteStone: '#f8fff0',
    whiteStoneHighlight: '#ffffff',
    backgroundColor: '#1a1f0d',
    panelColor: 'rgba(26, 31, 13, 0.92)',
    textColor: '#d8e8a8',
    accentColor: '#98c838',
    starPointColor: '#2a3a0a'
  },
  amber: {
    name: '琥珀', nameEn: 'Amber',
    boardColor: '#d4a040',
    boardColorDark: '#b88830',
    lineColor: '#4a2a08',
    blackStone: '#1a0a00',
    blackStoneHighlight: '#4a2a08',
    whiteStone: '#fff5e0',
    whiteStoneHighlight: '#ffffff',
    backgroundColor: '#1f1208',
    panelColor: 'rgba(31, 18, 8, 0.92)',
    textColor: '#e8c878',
    accentColor: '#f0a830',
    starPointColor: '#3a1a00'
  },
  rose: {
    name: '玫瑰', nameEn: 'Rose',
    boardColor: '#d4a0a8',
    boardColorDark: '#b8788a',
    lineColor: '#4a1a2a',
    blackStone: '#1a0a12',
    blackStoneHighlight: '#4a1a2a',
    whiteStone: '#fff0f5',
    whiteStoneHighlight: '#ffffff',
    backgroundColor: '#1f0d12',
    panelColor: 'rgba(31, 13, 18, 0.92)',
    textColor: '#e8b8c8',
    accentColor: '#e8587a',
    starPointColor: '#3a0a1a'
  },
  ocean: {
    name: '深海', nameEn: 'Ocean',
    boardColor: '#3a7ab8',
    boardColorDark: '#2a5a98',
    lineColor: '#a8d4f0',
    blackStone: '#0a1a2a',
    blackStoneHighlight: '#1a3a5a',
    whiteStone: '#e8f4ff',
    whiteStoneHighlight: '#ffffff',
    backgroundColor: '#050d1a',
    panelColor: 'rgba(5, 13, 26, 0.95)',
    textColor: '#a8c8e8',
    accentColor: '#3aa8d4',
    starPointColor: '#1a3a5a'
  },
  sunset: {
    name: '夕阳', nameEn: 'Sunset',
    boardColor: '#e89858',
    boardColorDark: '#c87838',
    lineColor: '#5a2a08',
    blackStone: '#1a0a00',
    blackStoneHighlight: '#5a2a08',
    whiteStone: '#fff0d8',
    whiteStoneHighlight: '#ffffff',
    backgroundColor: '#1f0d05',
    panelColor: 'rgba(31, 13, 5, 0.92)',
    textColor: '#e8c098',
    accentColor: '#f08838',
    starPointColor: '#3a1a00'
  },
  neon: {
    name: '霓虹', nameEn: 'Neon',
    boardColor: '#1a1a2e',
    boardColorDark: '#0d0d1f',
    lineColor: '#00ffaa',
    blackStone: '#0a0a1a',
    blackStoneHighlight: '#00ffaa',
    whiteStone: '#f0f0ff',
    whiteStoneHighlight: '#ffffff',
    backgroundColor: '#050510',
    panelColor: 'rgba(5, 5, 16, 0.95)',
    textColor: '#00ffaa',
    accentColor: '#ff00aa',
    starPointColor: '#00ffaa'
  },
  royal: {
    name: '皇室', nameEn: 'Royal',
    boardColor: '#6a4ab8',
    boardColorDark: '#4a2a98',
    lineColor: '#d4c8f0',
    blackStone: '#0a0a1a',
    blackStoneHighlight: '#2a2a5a',
    whiteStone: '#f0f0ff',
    whiteStoneHighlight: '#ffffff',
    backgroundColor: '#0d0518',
    panelColor: 'rgba(13, 5, 24, 0.95)',
    textColor: '#c8b8e8',
    accentColor: '#9a7af0',
    starPointColor: '#2a1a5a'
  }
};

class ThemeManager {
  constructor() {
    this.currentTheme = 'classic';
    this.themes = GomokuThemes;
  }

  getTheme(name) {
    return this.themes[name] || this.themes.classic;
  }

  getAllThemes() {
    return Object.entries(this.themes).map(([key, theme]) => ({
      key,
      name: theme.name,
      nameEn: theme.nameEn
    }));
  }

  setTheme(name) {
    if (this.themes[name]) {
      this.currentTheme = name;
      this.applyTheme(name);
      return true;
    }
    return false;
  }

  applyTheme(name) {
    const theme = this.getTheme(name);
    const root = document.documentElement;
    
    root.style.setProperty('--board-color', theme.boardColor);
    root.style.setProperty('--board-color-dark', theme.boardColorDark);
    root.style.setProperty('--line-color', theme.lineColor);
    root.style.setProperty('--black-stone', theme.blackStone);
    root.style.setProperty('--black-stone-highlight', theme.blackStoneHighlight);
    root.style.setProperty('--white-stone', theme.whiteStone);
    root.style.setProperty('--white-stone-highlight', theme.whiteStoneHighlight);
    root.style.setProperty('--bg-color', theme.backgroundColor);
    root.style.setProperty('--panel-color', theme.panelColor);
    root.style.setProperty('--text-color', theme.textColor);
    root.style.setProperty('--accent-color', theme.accentColor);
    root.style.setProperty('--star-point-color', theme.starPointColor);

    // Update meta theme color
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', theme.backgroundColor);
    }

    // Update body background
    document.body.style.backgroundColor = theme.backgroundColor;
    document.body.style.color = theme.textColor;
  }

  getCurrentTheme() {
    return this.currentTheme;
  }

  getThemeColors(name) {
    return this.getTheme(name);
  }
}

if (typeof window !== 'undefined') {
  window.GomokuThemes = GomokuThemes;
  window.ThemeManager = ThemeManager;
}
