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
  },
  // ============= New v6.0 Themes =============
  cosmic: {
    name: '宇宙', nameEn: 'Cosmic',
    boardColor: '#1a0a3a',
    boardColorDark: '#0d0520',
    lineColor: '#5a3a9a',
    blackStone: '#050510',
    blackStoneHighlight: '#1a1a40',
    whiteStone: '#e8e0ff',
    whiteStoneHighlight: '#ffffff',
    backgroundColor: '#0a0518',
    panelColor: 'rgba(10, 5, 24, 0.95)',
    textColor: '#c8b8ff',
    accentColor: '#8a6af0',
    starPointColor: '#3a2080'
  },
  forest: {
    name: '森林', nameEn: 'Forest',
    boardColor: '#4a7c3a',
    boardColorDark: '#2e5c22',
    lineColor: '#1a3a12',
    blackStone: '#0a1a0a',
    blackStoneHighlight: '#1a3a1a',
    whiteStone: '#e8f5e0',
    whiteStoneHighlight: '#ffffff',
    backgroundColor: '#0d1a0a',
    panelColor: 'rgba(13, 26, 10, 0.95)',
    textColor: '#b8e8a0',
    accentColor: '#6abf40',
    starPointColor: '#1a400a'
  },
  ice: {
    name: '冰川', nameEn: 'Ice',
    boardColor: '#c8e8f0',
    boardColorDark: '#a0d0e0',
    lineColor: '#5080a0',
    blackStone: '#0a1a2a',
    blackStoneHighlight: '#1a3a5a',
    whiteStone: '#f0f8ff',
    whiteStoneHighlight: '#ffffff',
    backgroundColor: '#051018',
    panelColor: 'rgba(5, 16, 24, 0.95)',
    textColor: '#a0d0e8',
    accentColor: '#40a0d0',
    starPointColor: '#0a3050'
  },
  fire: {
    name: '火焰', nameEn: 'Fire',
    boardColor: '#b85020',
    boardColorDark: '#8a3010',
    lineColor: '#4a1a0a',
    blackStone: '#1a0500',
    blackStoneHighlight: '#4a1a0a',
    whiteStone: '#ffe8d0',
    whiteStoneHighlight: '#ffffff',
    backgroundColor: '#1a0800',
    panelColor: 'rgba(26, 8, 0, 0.95)',
    textColor: '#f0c0a0',
    accentColor: '#e06020',
    starPointColor: '#5a2000'
  },
  gold: {
    name: '黄金', nameEn: 'Gold',
    boardColor: '#d4b040',
    boardColorDark: '#b89020',
    lineColor: '#6a5000',
    blackStone: '#1a1400',
    blackStoneHighlight: '#4a3a00',
    whiteStone: '#fff8e0',
    whiteStoneHighlight: '#ffffff',
    backgroundColor: '#1a1508',
    panelColor: 'rgba(26, 21, 8, 0.95)',
    textColor: '#f0d880',
    accentColor: '#d4a820',
    starPointColor: '#5a4000'
  },
  silver: {
    name: '银白', nameEn: 'Silver',
    boardColor: '#c0c0c8',
    boardColorDark: '#a0a0a8',
    lineColor: '#505058',
    blackStone: '#0a0a0a',
    blackStoneHighlight: '#2a2a2a',
    whiteStone: '#f8f8ff',
    whiteStoneHighlight: '#ffffff',
    backgroundColor: '#0a0a0f',
    panelColor: 'rgba(10, 10, 15, 0.95)',
    textColor: '#d0d0d8',
    accentColor: '#a0a0b0',
    starPointColor: '#404048'
  },
  cyberpunk: {
    name: '赛博', nameEn: 'Cyberpunk',
    boardColor: '#0a0a20',
    boardColorDark: '#050510',
    lineColor: '#ff00ff',
    blackStone: '#000005',
    blackStoneHighlight: '#ff00ff',
    whiteStone: '#00ffff',
    whiteStoneHighlight: '#ffffff',
    backgroundColor: '#00000a',
    panelColor: 'rgba(0, 0, 10, 0.95)',
    textColor: '#00ffff',
    accentColor: '#ff00ff',
    starPointColor: '#00ff00'
  },
  zen: {
    name: '禅意', nameEn: 'Zen',
    boardColor: '#e8e0d8',
    boardColorDark: '#d0c8c0',
    lineColor: '#808078',
    blackStone: '#1a1a18',
    blackStoneHighlight: '#3a3a38',
    whiteStone: '#fafaf8',
    whiteStoneHighlight: '#ffffff',
    backgroundColor: '#f0ece8',
    panelColor: 'rgba(240, 236, 232, 0.95)',
    textColor: '#5a5a58',
    accentColor: '#8a8a80',
    starPointColor: '#a0a098'
  },
  cherry: {
    name: '樱桃', nameEn: 'Cherry',
    boardColor: '#c04050',
    boardColorDark: '#a02030',
    lineColor: '#501018',
    blackStone: '#1a0505',
    blackStoneHighlight: '#501010',
    whiteStone: '#ffe0e0',
    whiteStoneHighlight: '#ffffff',
    backgroundColor: '#1a0808',
    panelColor: 'rgba(26, 8, 8, 0.95)',
    textColor: '#f0a0a8',
    accentColor: '#e04050',
    starPointColor: '#601018'
  },
  lavender: {
    name: '薰衣草', nameEn: 'Lavender',
    boardColor: '#c8b8e0',
    boardColorDark: '#b0a0c8',
    lineColor: '#7050a0',
    blackStone: '#100a20',
    blackStoneHighlight: '#301850',
    whiteStone: '#f5f0ff',
    whiteStoneHighlight: '#ffffff',
    backgroundColor: '#100818',
    panelColor: 'rgba(16, 8, 24, 0.95)',
    textColor: '#d8c8f0',
    accentColor: '#a080e0',
    starPointColor: '#402060'
  },
  terracotta: {
    name: '陶土', nameEn: 'Terracotta',
    boardColor: '#c87040',
    boardColorDark: '#a85028',
    lineColor: '#582810',
    blackStone: '#1a0800',
    blackStoneHighlight: '#4a2010',
    whiteStone: '#f5e0d0',
    whiteStoneHighlight: '#ffffff',
    backgroundColor: '#1a0f08',
    panelColor: 'rgba(26, 15, 8, 0.95)',
    textColor: '#e0b090',
    accentColor: '#d08040',
    starPointColor: '#582010'
  },
  arctic: {
    name: '北极', nameEn: 'Arctic',
    boardColor: '#e8f0ff',
    boardColorDark: '#c8d8f0',
    lineColor: '#6080b0',
    blackStone: '#0a1520',
    blackStoneHighlight: '#1a3050',
    whiteStone: '#ffffff',
    whiteStoneHighlight: '#f0f8ff',
    backgroundColor: '#080f18',
    panelColor: 'rgba(8, 15, 24, 0.95)',
    textColor: '#b0d0f0',
    accentColor: '#4090d0',
    starPointColor: '#103050'
  },
  desert: {
    name: '沙漠', nameEn: 'Desert',
    boardColor: '#d8b878',
    boardColorDark: '#c0a058',
    lineColor: '#785830',
    blackStone: '#1a1200',
    blackStoneHighlight: '#483810',
    whiteStone: '#fff8e0',
    whiteStoneHighlight: '#ffffff',
    backgroundColor: '#1a1408',
    panelColor: 'rgba(26, 20, 8, 0.95)',
    textColor: '#e0c890',
    accentColor: '#d0a840',
    starPointColor: '#583800'
  },
  vintage: {
    name: '复古', nameEn: 'Vintage',
    boardColor: '#b8a880',
    boardColorDark: '#a08860',
    lineColor: '#5a4830',
    blackStone: '#1a1208',
    blackStoneHighlight: '#3a2820',
    whiteStone: '#f5f0e0',
    whiteStoneHighlight: '#ffffff',
    backgroundColor: '#1a150c',
    panelColor: 'rgba(26, 21, 12, 0.95)',
    textColor: '#d0c0a0',
    accentColor: '#b09050',
    starPointColor: '#483818'
  },
  matrix: {
    name: '矩阵', nameEn: 'Matrix',
    boardColor: '#0a1a0a',
    boardColorDark: '#050d05',
    lineColor: '#00ff00',
    blackStone: '#000500',
    blackStoneHighlight: '#004400',
    whiteStone: '#c8ffc8',
    whiteStoneHighlight: '#ffffff',
    backgroundColor: '#000a00',
    panelColor: 'rgba(0, 10, 0, 0.95)',
    textColor: '#00ff00',
    accentColor: '#00ff00',
    starPointColor: '#00cc00'
  },
  starlight: {
    name: '星光', nameEn: 'Starlight',
    boardColor: '#102040',
    boardColorDark: '#081830',
    lineColor: '#ffcc00',
    blackStone: '#040810',
    blackStoneHighlight: '#102040',
    whiteStone: '#ffe8c0',
    whiteStoneHighlight: '#ffffff',
    backgroundColor: '#020510',
    panelColor: 'rgba(2, 5, 16, 0.95)',
    textColor: '#ffcc80',
    accentColor: '#ffcc00',
    starPointColor: '#ffaa00'
  },
  sakura2: {
    name: '樱花II', nameEn: 'Sakura II',
    boardColor: '#f0d0d8',
    boardColorDark: '#e0b8c0',
    lineColor: '#a06070',
    blackStone: '#1a0810',
    blackStoneHighlight: '#4a1830',
    whiteStone: '#fff0f5',
    whiteStoneHighlight: '#ffffff',
    backgroundColor: '#180810',
    panelColor: 'rgba(24, 8, 16, 0.95)',
    textColor: '#f0b0c0',
    accentColor: '#e08090',
    starPointColor: '#803040'
  },
  thunder: {
    name: '雷霆', nameEn: 'Thunder',
    boardColor: '#1a2a4a',
    boardColorDark: '#0a1a3a',
    lineColor: '#ffff00',
    blackStone: '#050a10',
    blackStoneHighlight: '#0a1a3a',
    whiteStone: '#f0f0ff',
    whiteStoneHighlight: '#ffffff',
    backgroundColor: '#020510',
    panelColor: 'rgba(2, 5, 16, 0.95)',
    textColor: '#c0d0ff',
    accentColor: '#ffd700',
    starPointColor: '#ffcc00'
  },
  dragon: {
    name: '龙纹', nameEn: 'Dragon',
    boardColor: '#8a0a0a',
    boardColorDark: '#600505',
    lineColor: '#ffd700',
    blackStone: '#1a0000',
    blackStoneHighlight: '#4a0000',
    whiteStone: '#fff8e0',
    whiteStoneHighlight: '#ffffff',
    backgroundColor: '#1a0500',
    panelColor: 'rgba(26, 5, 0, 0.95)',
    textColor: '#ffd700',
    accentColor: '#ff6600',
    starPointColor: '#ff3300'
  },
  moonlight: {
    name: '月光', nameEn: 'Moonlight',
    boardColor: '#203050',
    boardColorDark: '#102040',
    lineColor: '#c0d0e0',
    blackStone: '#0a1018',
    blackStoneHighlight: '#1a3050',
    whiteStone: '#e0f0ff',
    whiteStoneHighlight: '#ffffff',
    backgroundColor: '#050a10',
    panelColor: 'rgba(5, 10, 16, 0.95)',
    textColor: '#c0d0e0',
    accentColor: '#80b0e0',
    starPointColor: '#406080'
  },
  rainbow: {
    name: '彩虹', nameEn: 'Rainbow',
    boardColor: '#f0e8d0',
    boardColorDark: '#e0d0b0',
    lineColor: '#ff6b6b',
    blackStone: '#2a0000',
    blackStoneHighlight: '#6b0000',
    whiteStone: '#ffffff',
    whiteStoneHighlight: '#f0f0f0',
    backgroundColor: '#1a1a1a',
    panelColor: 'rgba(26, 26, 26, 0.95)',
    textColor: '#ff9999',
    accentColor: '#ff6b6b',
    starPointColor: '#ffcc00'
  },
  nebula: {
    name: '星云', nameEn: 'Nebula',
    boardColor: '#3a1a4a',
    boardColorDark: '#2a0a3a',
    lineColor: '#ff80ff',
    blackStone: '#0a050a',
    blackStoneHighlight: '#2a0a3a',
    whiteStone: '#ffe0ff',
    whiteStoneHighlight: '#ffffff',
    backgroundColor: '#0a0510',
    panelColor: 'rgba(10, 5, 16, 0.95)',
    textColor: '#ffccff',
    accentColor: '#e040ff',
    starPointColor: '#c020ff'
  },
  obsidian: {
    name: '黑曜', nameEn: 'Obsidian',
    boardColor: '#1a1a1a',
    boardColorDark: '#0a0a0a',
    lineColor: '#4a4a4a',
    blackStone: '#000000',
    blackStoneHighlight: '#1a1a1a',
    whiteStone: '#f0f0f0',
    whiteStoneHighlight: '#ffffff',
    backgroundColor: '#050505',
    panelColor: 'rgba(5, 5, 5, 0.95)',
    textColor: '#c0c0c0',
    accentColor: '#808080',
    starPointColor: '#404040'
  },
  emerald: {
    name: '翡翠', nameEn: 'Emerald',
    boardColor: '#1a4a2a',
    boardColorDark: '#0a3a1a',
    lineColor: '#40ff80',
    blackStone: '#051008',
    blackStoneHighlight: '#0a3a1a',
    whiteStone: '#d0ffe0',
    whiteStoneHighlight: '#ffffff',
    backgroundColor: '#020a05',
    panelColor: 'rgba(2, 10, 5, 0.95)',
    textColor: '#80ffa0',
    accentColor: '#20d060',
    starPointColor: '#008020'
  },
  crystal: {
    name: '水晶', nameEn: 'Crystal',
    boardColor: '#d0e8f0',
    boardColorDark: '#b0d0e0',
    lineColor: '#6080a0',
    blackStone: '#0a1520',
    blackStoneHighlight: '#1a4050',
    whiteStone: '#ffffff',
    whiteStoneHighlight: '#f0f8ff',
    backgroundColor: '#080f18',
    panelColor: 'rgba(8, 15, 24, 0.95)',
    textColor: '#a0c0d0',
    accentColor: '#40a0c0',
    starPointColor: '#206080'
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
    
    // Only set board/stone visual properties - keep white glass UI shell
    root.style.setProperty('--board-color', theme.boardColor);
    root.style.setProperty('--board-color-dark', theme.boardColorDark);
    root.style.setProperty('--line-color', theme.lineColor);
    root.style.setProperty('--black-stone', theme.blackStone);
    root.style.setProperty('--black-stone-highlight', theme.blackStoneHighlight);
    root.style.setProperty('--white-stone', theme.whiteStone);
    root.style.setProperty('--white-stone-highlight', theme.whiteStoneHighlight);
    root.style.setProperty('--accent-color', theme.accentColor);
    root.style.setProperty('--star-point-color', theme.starPointColor);
    // Update accent gradient based on theme accent
    root.style.setProperty('--accent-gradient', `linear-gradient(135deg, ${theme.accentColor}, ${this._shiftHue(theme.accentColor)})`);

    // Update meta theme color to white glass
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', '#f0f2f5');
    }
  }

  _shiftHue(hex) {
    // Simple helper to create a gradient companion color
    const r = parseInt(hex.slice(1,3), 16);
    const g = parseInt(hex.slice(3,5), 16);
    const b = parseInt(hex.slice(5,7), 16);
    // Shift towards purple/blue for gradient variety
    const nr = Math.max(0, Math.min(255, Math.round(r * 0.7 + 60)));
    const ng = Math.max(0, Math.min(255, Math.round(g * 0.7 + 80)));
    const nb = Math.max(0, Math.min(255, Math.round(b * 0.7 + 120)));
    return '#' + ((1 << 24) + (nr << 16) + (ng << 8) + nb).toString(16).slice(1);
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
