/**
 * Gomoku 3D - Main App Controller v6.0
 * World Pro Database | 50+ Openings | 30+ Patterns | Player ELO & Achievements
 */

const App = {
  // State
  mode: null,
  game: null,
  aiWorker: null,
  tutor: null,
  history: null,
  render: null,
  network: null,
  sound: null,
  themeManager: null,
  playerData: null,
  achievements: null,
  analytics: null,
  selectedProPlayer: null,

  // UI state
  currentScreen: 'loading-screen',
  selectedDifficulty: 'medium',
  aiColor: 'white',
  selectedTheme: 'classic',
  selectedLocalMode: 'normal',
  selectedBoardSize: 15,
  settings: {
    sound: true,
    animation: true,
    coords: false,
    render3d: true,
    lastMove: true,
    forbidden: false
  },

  // Game state
  myColor: 'black',
  aiDifficulty: 'medium',
  onlineRoomCode: null,
  replayState: null,
  replayPlaying: false,
  replayTimer: null,
  tutorTab: 'analysis',

  // Worker
  useWorker: typeof Worker !== 'undefined',

  // ==================== Init ====================
  init() {
    this.themeManager = new ThemeManager();
    this.history = new GameHistory();
    this.sound = new SoundManager();
    this.playerData = new PlayerData();
    this.achievements = new AchievementSystem(this.playerData);
    this.analytics = new Analytics(this.playerData);

    this.loadSettings();
    this.applyTheme(this.selectedTheme);
    this.initRender();
    this.initInput();
    this.initNetworkHandlers();
    this.initOfflineDetection();
    this.renderThemeGrid();
    this.loadHistoryList();
    this.loadTutorKnowledge();
    this.loadProPlayerGrid();
    this.loadAchievementList();
    this.loadAnalyticsDashboard();
    this.checkDailyChallenge();

    // Hide loading, show menu
    setTimeout(() => {
      this.showScreen('menu-screen');
    }, 800);

    // Register Service Worker for PWA
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js').catch(err => {
        console.log('SW registration failed:', err);
      });
    }
  },

  // ==================== Offline Detection ====================
  initOfflineDetection() {
    const offlineBanner = document.createElement('div');
    offlineBanner.id = 'offline-banner';
    offlineBanner.className = 'offline-banner';
    offlineBanner.innerHTML = '<span class="offline-icon">&#9888;</span> 网络已断开，部分功能不可用';
    document.body.appendChild(offlineBanner);

    window.addEventListener('online', () => {
      offlineBanner.classList.remove('show');
      this.showToast('网络已恢复');
    });
    window.addEventListener('offline', () => {
      offlineBanner.classList.add('show');
    });

    if (!navigator.onLine) {
      offlineBanner.classList.add('show');
    }
  },

  initRender() {
    const canvas = document.getElementById('game-canvas');
    const theme = this.themeManager.getTheme(this.selectedTheme);
    this.render = new RenderEngine(canvas);
    this.render.init(theme);

    // Also init replay canvas
    const replayCanvas = document.getElementById('replay-canvas');
    if (replayCanvas) {
      this.replayRender = new RenderEngine(replayCanvas);
      this.replayRender.init(theme);
    }
  },

  // Guard: check if 3D rendering is ready
  isRenderReady() {
    return this.render && this.render._initialized === true;
  },

  initInput() {
    const canvas = document.getElementById('game-canvas');

    let touchTimer = null;
    let isLongPress = false;

    canvas.addEventListener('pointerdown', (e) => {
      isLongPress = false;
      touchTimer = setTimeout(() => {
        isLongPress = true;
      }, 500);
    });

    canvas.addEventListener('pointerup', (e) => {
      if (touchTimer) {
        clearTimeout(touchTimer);
        touchTimer = null;
      }
      if (!isLongPress) {
        this.handleClick(e);
      }
    });

    canvas.addEventListener('pointermove', (e) => {
      if (this.currentScreen !== 'game-screen') return;
      this.handleHover(e);
    });

    canvas.addEventListener('pointerleave', () => {
      if (this.render) this.render.hideHover();
    });

    // Replay canvas
    const replayCanvas = document.getElementById('replay-canvas');
    if (replayCanvas) {
      // Slider for replay
      const slider = document.getElementById('replay-slider');
      if (slider) {
        slider.addEventListener('input', (e) => {
          this.replayToStep(parseInt(e.target.value));
        });
      }
    }

    // Chat input
    const chatInput = document.getElementById('chat-input');
    if (chatInput) {
      chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') this.sendChat();
      });
    }
  },

  initNetworkHandlers() {
    if (!this.network) return;
    
    this.network.on('room_created', (data) => {
      this.onlineRoomCode = data.roomCode;
      const display = document.getElementById('room-code-display');
      if (display) display.textContent = data.roomCode;
      this.updateOnlineStatus('online');
      this.showScreen('room-waiting');
    });

    this.network.on('game_start', (data) => {
      this.myColor = data.color;
      this.updateOnlineStatus('online');
      this.startGame('online');
    });

    this.network.on('move', (data) => {
      if (this.game && data.playerId !== this.network.playerId) {
        this.handleRemoteMove(data.row, data.col);
      }
    });

    this.network.on('resign', () => {
      this.showToast('对方认输');
      this.endGame('win', '对手认输');
    });

    this.network.on('undo_request', () => {
      if (confirm('对方请求悔棋，是否同意？')) {
        this.network.sendUndoApprove();
        this.undoMove();
      }
    });

    this.network.on('undo_approve', () => {
      this.undoMove();
      this.showToast('对方同意悔棋');
    });

    this.network.on('chat', (data) => {
      this.receiveChat(data.name || '对手', data.message);
    });

    this.network.on('disconnect', () => {
      this.showToast('对手已断开连接');
      this.updateOnlineStatus('disconnected');
    });

    this.network.on('error', (data) => {
      this.showToast(data.message || '网络错误');
      this.updateOnlineStatus('disconnected');
    });
  },

  // ==================== Screen Management ====================
  showScreen(name) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const screen = document.getElementById(name);
    if (screen) {
      screen.classList.add('active');
      this.currentScreen = name;

      if (name === 'menu-screen') {
        this.loadStats();
      } else if (name === 'history-screen') {
        this.loadHistoryList();
      } else if (name === 'tutor-screen') {
        this.loadTutorKnowledge();
      } else       if (name === 'game-screen') {
        setTimeout(() => this.resizeCanvas(), 100);
      }
    }
  },

  // ==================== Theme ====================
  applyTheme(name) {
    this.selectedTheme = name;
    this.themeManager.setTheme(name);
    localStorage.setItem('gomoku_theme', name);
    if (this.render) {
      const theme = this.themeManager.getTheme(name);
      this.render.setTheme(theme);
    }
  },

  renderThemeGrid() {
    const grid = document.getElementById('theme-grid');
    if (!grid) return;
    grid.innerHTML = '';
    const allThemes = this.themeManager.getAllThemes();
    allThemes.forEach(theme => {
      const card = document.createElement('div');
      card.className = 'theme-card' + (theme.key === this.selectedTheme ? ' selected' : '');
      const colors = this.themeManager.getThemeColors(theme.key);
      const preview = document.createElement('div');
      preview.className = 'theme-preview';
      preview.style.background = `linear-gradient(135deg, ${colors.boardColor}, ${colors.accentColor})`;
      const name = document.createElement('div');
      name.className = 'theme-name';
      name.textContent = theme.name;
      card.appendChild(preview);
      card.appendChild(name);
      card.onclick = () => {
        this.applyTheme(theme.key);
        this.renderThemeGrid();
      };
      grid.appendChild(card);
    });
  },

  // ==================== AI Setup ====================
  selectDifficulty(element) {
    document.querySelectorAll('.diff-card').forEach(c => c.classList.remove('selected'));
    element.classList.add('selected');
    this.selectedDifficulty = element.dataset.difficulty;
  },

  selectColor(color) {
    document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('selected', 'active'));
    document.querySelector(`.color-btn[data-color="${color}"]`).classList.add('selected');
    this.aiColor = color;
  },

  selectLocalMode(mode) {
    document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('selected'));
    document.querySelector(`.mode-btn[data-mode="${mode}"]`).classList.add('selected');
    this.selectedLocalMode = mode;
  },

  selectBoardSize(size) {
    document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
    document.querySelector(`.size-btn[data-size="${size}"]`).classList.add('selected');
    this.selectedBoardSize = parseInt(size);
  },

  startAIGame() {
    this.aiDifficulty = this.selectedDifficulty;
    this.myColor = this.aiColor === 'white' ? 'black' : 'white';
    this.startGame('ai', { difficulty: this.selectedDifficulty });
  },

  startLocalGame() {
    this.startGame('local', { size: this.selectedBoardSize, mode: this.selectedLocalMode });
  },

  // ==================== Online ====================
  async createRoom() {
    try {
      this.updateOnlineStatus('connecting');
      if (!this.network) {
        this.network = new NetworkClient();
        this.initNetworkHandlers();
      }
      // PeerJS: createRoom handles connection internally
      this.network.createRoom('player');
    } catch (e) {
      this.showToast('创建失败，请稍后重试');
      this.updateOnlineStatus('disconnected');
    }
  },

  async joinRoom() {
    const code = document.getElementById('room-code-input').value.toUpperCase().trim();
    if (code.length < 4) {
      this.showToast('请输入正确的房间号');
      return;
    }
    try {
      this.updateOnlineStatus('connecting');
      if (!this.network) {
        this.network = new NetworkClient();
        this.initNetworkHandlers();
      }
      // PeerJS: joinRoom handles connection internally
      this.network.joinRoom(code, 'player');
    } catch (e) {
      this.showToast('连接失败，请稍后重试');
      this.updateOnlineStatus('disconnected');
    }
  },

  updateOnlineStatus(status) {
    const dot = document.querySelector('.status-dot');
    const text = document.querySelector('.status-text');
    if (!dot || !text) return;
    dot.className = 'status-dot ' + (status === 'online' ? 'online' : status === 'connecting' ? 'connecting' : '');
    text.textContent = status === 'online' ? '已连接' : status === 'connecting' ? '连接中...' : '未连接';
  },

  copyRoomCode() {
    const code = this.onlineRoomCode || '';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code).then(() => this.showToast('已复制房间号'));
    } else {
      const ta = document.createElement('textarea');
      ta.value = code;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      this.showToast('已复制房间号');
    }
  },

  // ==================== Game Start ====================
  startGame(mode, options = {}) {
    this.mode = mode;
    const size = options.size || 15;
    this.game = new GameEngine(size);

    // Init tutor with engine
    this.tutor = new AITutor(this.game);

    // Clear render - guard against uninitialized renderer
    if (this.isRenderReady()) {
      this.render.clearStones();
      this.render.clearEffects();
    }

    this.showScreen('game-screen');
    // Resize after DOM is visible - use longer delay for mobile
    setTimeout(() => {
      this.resizeCanvas();
      // Second resize after screen transition completes
      setTimeout(() => this.resizeCanvas(), 200);
    }, 100);
    this.updateTurnIndicator();

    // If AI moves first
    if (mode === 'ai' && this.aiColor === 'black') {
      setTimeout(() => this.makeAIMove(), 500);
    }

    if (this.settings.sound) this.sound.play('start');
  },

  // ==================== Move Handling ====================
  handleClick(e) {
    if (this.currentScreen !== 'game-screen' || !this.game || this.game.state === 'ended') return;
    if (!this.isRenderReady()) return;

    const pos = this.render.raycast(e.clientX, e.clientY);
    if (!pos) return;

    if (this.mode === 'ai' && this.game.currentTurn !== this.myColor) return;
    if (this.mode === 'online' && this.game.currentTurn !== this.myColor) return;

    this.makeMove(pos.row, pos.col);
  },

  handleHover(e) {
    if (!this.game || this.game.state === 'ended') return;
    if (!this.isRenderReady()) return;
    const pos = this.render.raycast(e.clientX, e.clientY);
    if (!pos) {
      this.render.hideHover();
      return;
    }
    if (this.game.board[pos.row][pos.col] !== null) {
      this.render.hideHover();
      return;
    }
    const color = this.game.currentTurn === 'black' ? 1 : 2;
    this.render.showHover(pos.row, pos.col, color);
  },

  makeMove(row, col) {
    const result = this.game.makeMove(row, col);
    if (!result.success) return false;

    const lastMove = this.game.moveHistory[this.game.moveHistory.length - 1];
    const stoneColor = lastMove.color === 'black' ? 1 : 2;

    if (this.isRenderReady()) {
      this.render.addStone(row, col, stoneColor);
      this.render.showLastMoveMarker(row, col);
    }
    if (this.settings.sound) this.sound.play('place');

    if (result.winner) {
      if (this.isRenderReady()) this.render.showWinLine(result.winLine);
      const winnerColor = result.winner === 'draw' ? null : result.winner;
      setTimeout(() => this.handleGameEnd(winnerColor), 600);
      return true;
    }

    this.updateTurnIndicator();

    if (this.mode === 'ai' && this.game.currentTurn !== this.myColor) {
      this.showAIThinking(true);
      setTimeout(() => this.makeAIMove(), 300);
    }

    if (this.mode === 'online') {
      this.network.sendMove(row, col);
    }

    return true;
  },

  handleRemoteMove(row, col) {
    const result = this.game.makeMove(row, col);
    if (!result.success) return;

    const lastMove = this.game.moveHistory[this.game.moveHistory.length - 1];
    const stoneColor = lastMove.color === 'black' ? 1 : 2;

    if (this.isRenderReady()) {
      this.render.addStone(row, col, stoneColor);
      this.render.showLastMoveMarker(row, col);
    }
    if (this.settings.sound) this.sound.play('place');

    if (result.winner) {
      if (this.isRenderReady()) this.render.showWinLine(result.winLine);
      const winnerColor = result.winner === 'draw' ? null : result.winner;
      setTimeout(() => this.handleGameEnd(winnerColor), 600);
      return;
    }
    this.updateTurnIndicator();
  },

  // ==================== AI ====================
  showAIThinking(show) {
    const el = document.getElementById('ai-thinking');
    if (el) el.style.display = show ? 'flex' : 'none';
  },

  makeAIMove() {
    if (!this.game || this.game.state === 'ended') return;

    const aiColor = this.myColor === 'black' ? 'white' : 'black';
    const difficulty = this.aiDifficulty;

    if (this.useWorker && (difficulty === 'hard' || difficulty === 'master' || difficulty === 'grandmaster')) {
      if (!this.aiWorker) {
        this.aiWorker = new Worker('./js/ai-worker.js');
        this.aiWorker.onmessage = (e) => {
          if (e.data.type === 'result') {
            const move = e.data.move;
            this.showAIThinking(false);
            if (move) {
              this.makeMove(move.row, move.col);
            }
          }
        };
      }
      this.aiWorker.postMessage({
        type: 'move',
        board: this.game.board,
        size: this.game.size,
        currentTurn: this.game.currentTurn,
        moveHistory: this.game.moveHistory,
        color: aiColor,
        difficulty: difficulty,
        state: this.game.state,
        winner: this.game.winner
      });
    } else {
      const ai = new AIBrain(difficulty);
      const move = ai.getBestMove(this.game, aiColor);
      this.showAIThinking(false);
      if (move) {
        this.makeMove(move.row, move.col);
      }
    }
  },

  // ==================== Tutor ====================
  selectTutorTab(tab) {
    this.tutorTab = tab;
    document.querySelectorAll('.tutor-tab').forEach(t => t.classList.remove('selected', 'active'));
    document.querySelector(`.tutor-tab[data-tab="${tab}"]`).classList.add('selected');
    this.loadTutorKnowledge();
  },

  loadTutorKnowledge() {
    const content = document.getElementById('tutor-content');
    if (!content) return;

    if (this.tutorTab === 'analysis') {
      if (!this.game || this.game.state !== 'playing') {
        content.innerHTML = '<div class="tutor-placeholder">开始对局后可使用AI分析功能</div>';
        return;
      }
      this.updateTutorAnalysis();
    } else if (this.tutorTab === 'openings') {
      this.renderOpeningTheory(content);
    } else if (this.tutorTab === 'patterns') {
      this.renderPatternKnowledge(content);
    } else if (this.tutorTab === 'tactics') {
      this.renderTacticsKnowledge(content);
    }
  },

  updateTutorAnalysis() {
    const content = document.getElementById('tutor-content');
    if (!content || !this.game) return;

    const color = this.myColor;
    const analysis = this.tutor.analyzePosition(color);
    content.innerHTML = '';

    // Phase indicator
    const phaseDiv = document.createElement('div');
    phaseDiv.className = 'tutor-card';
    const phaseNames = { opening: '布局阶段', middlegame: '中盘阶段', endgame: '终局阶段' };
    phaseDiv.innerHTML = `<div class="tutor-card-title">当前阶段</div><div class="tutor-card-desc">${phaseNames[analysis.phase] || '布局阶段'} · ${analysis.evaluation || '均势'}</div>`;
    content.appendChild(phaseDiv);

    // Advice
    if (analysis.advice && analysis.advice.length > 0) {
      analysis.advice.forEach(a => {
        const div = document.createElement('div');
        div.className = 'tutor-advice' + (a.urgency === 'critical' || a.urgency === 'high' ? ' urgent' : a.urgency === 'low' ? ' info' : '');
        div.textContent = a.text;
        content.appendChild(div);
      });
    } else {
      const div = document.createElement('div');
      div.className = 'tutor-advice info';
      div.textContent = '当前局面均衡，继续稳步发展。';
      content.appendChild(div);
    }
  },

  renderOpeningTheory(container) {
    container.innerHTML = '';
    const openings = this.tutor.getOpeningTheory();
    const allOpenings = Array.isArray(openings) ? openings : [...(openings.direct || []), ...(openings.diagonal || [])];

    allOpenings.forEach(opening => {
      const card = document.createElement('div');
      card.className = 'tutor-card';
      let tagClass = 'draw';
      if (opening.type.includes('黑必胜')) tagClass = 'win';
      if (opening.type.includes('白必胜')) tagClass = 'lose';
      card.innerHTML = `
        <div class="tutor-card-title">${opening.name}（${opening.pinyin || ''}）</div>
        <span class="tutor-card-tag ${tagClass}">${opening.type}</span>
        <span class="tutor-card-tag draw">${opening.winRate || ''}</span>
        <div class="tutor-card-desc">${opening.desc}</div>
        <div class="tutor-card-desc" style="margin-top:8px;opacity:0.6;">${opening.theory || ''}</div>
        <div class="tutor-card-desc" style="margin-top:8px;color:var(--accent-color);">要点：${opening.keyPoint || ''}</div>
      `;
      container.appendChild(card);
    });
  },

  renderPatternKnowledge(container) {
    container.innerHTML = '';
    const patterns = this.tutor.getPatternKnowledge();
    const patternList = Array.isArray(patterns) ? patterns : Object.values(patterns);

    patternList.forEach(p => {
      if (!p || !p.name) return;
      const card = document.createElement('div');
      card.className = 'tutor-card';
      card.innerHTML = `
        <div class="tutor-card-title">${p.cn || p.name}</div>
        <div class="tutor-card-desc">${p.desc || ''}</div>
      `;
      container.appendChild(card);
    });
  },

  renderTacticsKnowledge(container) {
    container.innerHTML = '';
    const tactics = this.tutor.getTactics();
    const tacticList = Array.isArray(tactics) ? tactics : Object.values(tactics);

    tacticList.forEach(t => {
      if (!t || !t.name) return;
      const card = document.createElement('div');
      card.className = 'tutor-card';
      card.innerHTML = `
        <div class="tutor-card-title">${t.name}</div>
        <div class="tutor-card-desc">${t.desc || ''}</div>
        ${t.when ? `<div class="tutor-card-desc" style="margin-top:8px;opacity:0.6;">适用时机：${t.when}</div>` : ''}
        ${t.principle ? `<div class="tutor-card-desc" style="margin-top:8px;opacity:0.6;">原则：${t.principle}</div>` : ''}
        ${t.example ? `<div class="tutor-card-desc" style="margin-top:8px;color:var(--accent-color);">示例：${t.example}</div>` : ''}
      `;
      container.appendChild(card);
    });
  },

  showHint() {
    if (!this.game || this.game.state === 'ended') {
      this.showToast('当前无对局');
      return;
    }
    const recommendation = this.tutor.recommendMove(this.myColor);
    if (recommendation && recommendation.move) {
      this.showToast(`推荐: (${recommendation.move.row + 1}, ${recommendation.move.col + 1}) - ${recommendation.reason}`);
      const colorNum = this.myColor === 'black' ? 1 : 2;
      this.render.showHover(recommendation.move.row, recommendation.move.col, colorNum);
      setTimeout(() => this.render.hideHover(), 3000);
    } else {
      this.showToast(recommendation ? recommendation.reason : '暂无推荐');
    }
  },

  // ==================== Game End ====================
  handleGameEnd(winnerColor) {
    let result;
    if (this.mode === 'ai' || this.mode === 'online') {
      if (!winnerColor) result = 'draw';
      else if (winnerColor === this.myColor) result = 'win';
      else result = 'lose';
    } else {
      result = 'draw';
    }

    this.endGame(result, '', winnerColor);
  },

  endGame(result, reason, winnerColor) {
    if (this.game.state === 'ended' && !reason) return;
    if (this.game.state !== 'ended') {
      this.game.state = 'ended';
      this.game.winner = winnerColor || 'draw';
    }

    // Save to history
    const gameRecord = {
      mode: this.mode,
      difficulty: this.aiDifficulty,
      result: result,
      moves: this.game.moveHistory.slice(),
      winner: winnerColor || 'draw',
      myColor: this.myColor,
      date: Date.now()
    };
    this.history.saveGame(gameRecord);

    // Show result modal
    const modal = document.getElementById('result-modal');
    const icon = document.getElementById('result-icon');
    const title = document.getElementById('result-title');
    const detail = document.getElementById('result-detail');

    if (result === 'win') {
      icon.textContent = '🏆';
      title.textContent = '胜利';
      detail.textContent = reason || '恭喜获胜！';
    } else if (result === 'lose') {
      icon.textContent = '💀';
      title.textContent = '失败';
      detail.textContent = reason || '再接再厉';
    } else {
      icon.textContent = '🤝';
      title.textContent = '平局';
      detail.textContent = reason || '棋逢对手';
    }

    modal.classList.add('show');
    this.showAIThinking(false);
    this.loadStats();

    if (this.settings.sound) this.sound.play(result);
  },

  // ==================== Undo / Restart / Resign ====================
  requestUndo() {
    if (!this.game || this.game.moveHistory.length === 0) {
      this.showToast('无棋可悔');
      return;
    }
    if (this.mode === 'online') {
      this.network.sendUndoRequest();
      this.showToast('已发送悔棋请求');
    } else if (this.mode === 'ai') {
      this.undoMove();
      this.undoMove();
    } else {
      this.undoMove();
    }
  },

  undoMove() {
    this.game.undo(1);
    if (this.isRenderReady()) {
      this.render.removeLastStone();
      this.render.clearEffects();
    }
    this.updateTurnIndicator();
  },

  restart() {
    if (this.game) {
      this.game = new GameEngine(this.game.size);
      this.tutor = new AITutor(this.game);
      if (this.isRenderReady()) {
        this.render.clearStones();
        this.render.clearEffects();
      }
      document.getElementById('result-modal').classList.remove('show');
      this.updateTurnIndicator();

      if (this.mode === 'ai' && this.aiColor === 'black') {
        setTimeout(() => this.makeAIMove(), 500);
      }
      if (this.settings.sound) this.sound.play('start');
    }
  },

  surrender() {
    if (confirm('确定认输？')) {
      if (this.mode === 'online') {
        this.network.sendResign();
      }
      const winnerColor = this.myColor === 'black' ? 'white' : 'black';
      this.endGame('lose', '认输', winnerColor);
    }
  },

  // ==================== Turn Indicator ====================
  updateTurnIndicator() {
    if (!this.game) return;
    const indicator = document.getElementById('turn-indicator');
    if (!indicator) return;
    const stone = indicator.querySelector('.turn-stone');
    const text = indicator.querySelector('.turn-text');

    if (this.game.state === 'ended') {
      text.textContent = '对局结束';
      return;
    }

    stone.className = 'turn-stone ' + this.game.currentTurn;
    const colorName = this.game.currentTurn === 'black' ? '黑方落子' : '白方落子';
    
    if (this.mode === 'ai' || this.mode === 'online') {
      if (this.game.currentTurn === this.myColor) {
        text.textContent = '你的回合';
      } else {
        text.textContent = this.mode === 'ai' ? 'AI回合' : '对手回合';
      }
    } else {
      text.textContent = colorName;
    }
  },

  // ==================== Chat ====================
  sendChat() {
    const input = document.getElementById('chat-input');
    const msg = input.value.trim();
    if (!msg) return;
    if (this.network && this.mode === 'online') {
      this.network.sendChat(msg);
    }
    this.receiveChat('你', msg);
    input.value = '';
  },

  receiveChat(name, message) {
    const container = document.getElementById('chat-messages');
    const div = document.createElement('div');
    div.className = 'chat-msg';
    div.innerHTML = `<span class="chat-name">${name}:</span> ${message}`;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
  },

  toggleChat() {
    const panel = document.getElementById('chat-panel');
    panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
  },

  // ==================== History / Replay ====================
  loadStats() {
    const stats = this.history.getStats();
    const total = document.getElementById('stat-total');
    const wins = document.getElementById('stat-wins');
    const losses = document.getElementById('stat-losses');
    if (total) total.textContent = stats.total || 0;
    if (wins) wins.textContent = stats.wins || 0;
    if (losses) losses.textContent = stats.losses || 0;
  },

  loadHistoryList() {
    const games = this.history.getAllGames();
    const list = document.getElementById('history-list');
    if (!list) return;

    list.innerHTML = '';

    if (games.length === 0) {
      list.innerHTML = '<div class="empty-state">暂无对局记录</div>';
      return;
    }

    games.forEach((g) => {
      const div = document.createElement('div');
      div.className = 'history-item';
      const resultClass = g.result === 'win' ? 'win' : g.result === 'lose' ? 'lose' : 'draw';
      const resultText = g.result === 'win' ? '胜' : g.result === 'lose' ? '负' : '平';
      const modeText = { ai: 'AI对战', local: '双人', online: '联机', tutor: '教学' };
      const moveCount = g.moves ? g.moves.length : 0;
      const date = new Date(g.date);
      const dateStr = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;

      div.innerHTML = `
        <div class="result-badge ${resultClass}">${resultText}</div>
        <div class="history-info">
          <div class="history-mode">${modeText[g.mode] || g.mode}${g.difficulty ? ' · ' + g.difficulty : ''}</div>
          <div class="history-detail">${moveCount}手 · ${dateStr}</div>
        </div>
        <div class="history-moves">${moveCount}手</div>
      `;
      div.onclick = () => this.openReplay(g);
      list.appendChild(div);
    });
  },

  openReplay(gameRecord) {
    this.replayState = {
      game: gameRecord,
      step: 0,
      playing: false
    };

    this.showScreen('replay-screen');

    const slider = document.getElementById('replay-slider');
    const moveInfo = document.getElementById('replay-move-info');
    const moves = gameRecord.moves || [];
    if (slider) slider.max = moves.length;
    if (slider) slider.value = 0;
    if (moveInfo) moveInfo.textContent = '第 0 手';

    // Clear replay canvas
    if (this.replayRender) {
      this.replayRender.clearStones();
      this.replayRender.clearEffects();
    }

    this.replayToStep(0);
  },

  replayToStep(step) {
    if (!this.replayState) return;
    const moves = this.replayState.game.moves || [];
    step = Math.max(0, Math.min(step, moves.length));
    this.replayState.step = step;

    if (this.replayRender) {
      this.replayRender.clearStones();
      this.replayRender.clearEffects();
      for (let i = 0; i < step; i++) {
        const m = moves[i];
        const colorNum = m.color === 'black' ? 1 : 2;
        this.replayRender.addStone(m.row, m.col, colorNum);
      }
      if (step > 0) {
        const last = moves[step - 1];
        this.replayRender.showLastMoveMarker(last.row, last.col);
      }
    }

    const slider = document.getElementById('replay-slider');
    const moveInfo = document.getElementById('replay-move-info');
    if (slider) slider.value = step;
    if (moveInfo) moveInfo.textContent = `第 ${step} 手 / 共 ${moves.length} 手`;
  },

  replayPrev() {
    if (this.replayState) this.replayToStep(this.replayState.step - 1);
  },

  replayNext() {
    if (this.replayState) this.replayToStep(this.replayState.step + 1);
  },

  replayPlay() {
    if (!this.replayState) return;
    if (this.replayPlaying) {
      this.replayPlaying = false;
      if (this.replayTimer) clearInterval(this.replayTimer);
      document.getElementById('replay-play').textContent = '▶';
    } else {
      this.replayPlaying = true;
      document.getElementById('replay-play').textContent = '⏸';
      const totalMoves = (this.replayState.game.moves || []).length;
      if (this.replayState.step >= totalMoves) {
        this.replayToStep(0);
      }
      this.replayTimer = setInterval(() => {
        if (this.replayState.step >= totalMoves) {
          this.replayPlay();
          return;
        }
        this.replayToStep(this.replayState.step + 1);
      }, 800);
    }
  },

  // ==================== Settings ====================
  loadSettings() {
    const saved = localStorage.getItem('gomoku_settings');
    if (saved) {
      Object.assign(this.settings, JSON.parse(saved));
    }
    const theme = localStorage.getItem('gomoku_theme');
    if (theme) this.selectedTheme = theme;

    // Apply to UI
    document.querySelectorAll('.toggle').forEach(t => {
      const key = t.dataset.setting;
      if (key) {
        t.classList.toggle('active', this.settings[key] !== undefined ? this.settings[key] : false);
      }
    });
  },

  toggleSetting(element) {
    const key = element.dataset.setting;
    if (!key) return;
    this.settings[key] = !this.settings[key];
    element.classList.toggle('active', this.settings[key]);
    localStorage.setItem('gomoku_settings', JSON.stringify(this.settings));

    if (key === 'coords' && this.render) {
      this.render.toggleCoords(this.settings.coords);
    }
    if (key === 'render3d' && this.render) {
      this.render.setRenderMode(this.settings.render3d);
    }
  },

  clearHistory() {
    if (confirm('确定清除所有对局记录？此操作不可撤销。')) {
      this.history.clearAll();
      this.loadHistoryList();
      this.loadStats();
      this.showToast('已清除所有记录');
    }
  },

  // ==================== Pro Player ====================
  loadProPlayerGrid() {
    const grid = document.getElementById('pro-player-grid');
    if (!grid) return;
    const players = ProPlayers.getPlayersSortedByElo();
    grid.innerHTML = players.map(p => `
      <div class="pro-player-card" data-id="${p.id}">
        <div class="pro-avatar">${p.avatar}</div>
        <div class="pro-info">
          <div class="pro-name">${p.name}</div>
          <div class="pro-title">${p.titles[0] || '职业棋手'}</div>
          <div class="pro-elo">ELO ${p.elo}</div>
        </div>
        <div class="pro-style" style="background:${ProPlayers.styles[p.style]?.color || '#666'}">${ProPlayers.styles[p.style]?.name || p.style}</div>
      </div>
    `).join('');
    grid.querySelectorAll('.pro-player-card').forEach(card => {
      card.addEventListener('click', () => this.showProPlayerDetail(card.dataset.id));
    });
  },

  showProPlayerDetail(playerId) {
    const player = ProPlayers.getPlayer(playerId);
    if (!player) return;
    this.selectedProPlayer = playerId;
    // Show pro player detail modal
    const modal = document.getElementById('pro-player-modal');
    if (modal) {
      document.getElementById('pro-detail-name').textContent = player.name;
      document.getElementById('pro-detail-nationality').textContent = player.nationality;
      document.getElementById('pro-detail-elo').textContent = 'ELO ' + player.elo;
      document.getElementById('pro-detail-style').textContent = ProPlayers.styles[player.style]?.name || player.style;
      document.getElementById('pro-detail-avatar').textContent = player.avatar;
      const achievementsEl = document.getElementById('pro-detail-achievements');
      if (achievementsEl) achievementsEl.innerHTML = player.achievements.map(a => `<li>${a}</li>`).join('');
      modal.classList.add('show');
    }
  },

  selectProPlayerForAI() {
    if (this.selectedProPlayer) {
      const player = ProPlayers.getPlayer(this.selectedProPlayer);
      if (player) {
        // Configure AI with player style parameters
        this.aiDifficulty = 'grandmaster';
        this.selectedProPlayerName = player.name;
        this.showToast(`已选择${player.name}风格对战`);
      }
    }
  },

  // ==================== Achievements ====================
  loadAchievementList() {
    const container = document.getElementById('achievement-list');
    if (!container || !this.achievements) return;
    const all = this.achievements.getAllAchievements();
    container.innerHTML = all.map(a => `
      <div class="achievement-item ${a.unlocked ? 'unlocked' : 'locked'}">
        <div class="achievement-icon">${a.icon}</div>
        <div class="achievement-info">
          <div class="achievement-name">${a.name}</div>
          <div class="achievement-desc">${a.description}</div>
          <div class="achievement-progress">${a.progress}/${a.target}</div>
        </div>
      </div>
    `).join('');
  },

  // ==================== Analytics ====================
  loadAnalyticsDashboard() {
    // Will be populated when player-data.js loads
  },

  // ==================== Daily Challenge ====================
  checkDailyChallenge() {
    if (!this.playerData) return;
    const today = new Date().toDateString();
    const lastCheck = localStorage.getItem('gomoku-last-challenge-date');
    if (lastCheck !== today) {
      localStorage.setItem('gomoku-last-challenge-date', today);
      // Generate new daily challenge
      const challenges = [
        '用黑棋赢一局AI对战',
        '用白棋赢一局AI对战',
        '完成一局在线对战',
        '学习3个开局知识',
        '赢一局困难难度AI',
        '连续赢2局',
        '在20步内赢一局'
      ];
      const challenge = challenges[Math.floor(Math.random() * challenges.length)];
      localStorage.setItem('gomoku-daily-challenge', challenge);
      this.showToast('今日挑战: ' + challenge);
    }
  },

  // ==================== Share ====================
  shareGameResult(result) {
    const text = `我在五子棋3D中${result.winner === 'draw' ? '打平' : result.winner === this.myColor ? '赢了' : '输了'}一局！`;
    if (navigator.share) {
      navigator.share({ title: '五子棋3D对战结果', text });
    } else {
      navigator.clipboard.writeText(text).then(() => this.showToast('结果已复制'));
    }
  },

  // ==================== Export/Import Game ====================
  exportGameRecord() {
    if (!this.game || this.game.moveHistory.length === 0) return;
    const record = {
      version: '1.0',
      date: new Date().toISOString(),
      size: this.game.size,
      moves: this.game.moveHistory.map(m => ({ r: m.row, c: m.col, p: m.color === 'black' ? 1 : 2 })),
      result: this.game.winner
    };
    const blob = new Blob([JSON.stringify(record, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gomoku_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.showToast('棋谱已导出');
  },

  // ==================== Game End with Stats ====================
  handleGameEnd(winner) {
    const result = {
      winner: winner,
      myColor: this.myColor,
      totalMoves: this.game.moveHistory.length,
      aiDifficulty: this.aiDifficulty,
      mode: this.mode,
      proPlayer: this.selectedProPlayerName || null
    };
    this.lastGameResult = result;
    // Record stats
    if (this.playerData) {
      this.playerData.recordGame(result);
    }
    // Check achievements
    if (this.achievements) {
      this.achievements.checkAll(result, this.game);
      const newUnlocks = this.achievements.getNewUnlocks();
      if (newUnlocks.length > 0) {
        newUnlocks.forEach(a => this.showToast(`🏆 解锁成就: ${a.name}`));
      }
    }
    // Show result modal
    this.showResultModal(result);
    // Check daily challenge
    const challenge = localStorage.getItem('gomoku-daily-challenge');
    if (challenge && this.playerData) {
      const completed = this.playerData.checkDailyChallenge(challenge, result);
      if (completed) {
        this.showToast('🎉 完成今日挑战！');
        localStorage.removeItem('gomoku-daily-challenge');
      }
    }
  },

  showResultModal(result) {
    const modal = document.getElementById('result-modal');
    if (!modal) return;
    const icon = document.getElementById('result-icon');
    const title = document.getElementById('result-title');
    const detail = document.getElementById('result-detail');
    if (result.winner === 'draw') {
      icon.textContent = '🤝';
      title.textContent = '平局';
    } else if (result.winner === this.myColor) {
      icon.textContent = '🏆';
      title.textContent = '胜利';
    } else {
      icon.textContent = '😔';
      title.textContent = '失败';
    }
    let detailText = `共 ${result.totalMoves} 步`;
    if (result.mode === 'ai' && result.aiDifficulty) {
      detailText += ` · 难度: ${result.aiDifficulty}`;
    }
    if (result.proPlayer) {
      detailText += ` · 对手: ${result.proPlayer}`;
    }
    detail.textContent = detailText;
    modal.classList.add('show');
    if (this.settings.sound) this.sound.play(result.winner === this.myColor ? 'win' : 'lose');
  },

  // ==================== Canvas Resize ====================
  resizeCanvas() {
    if (!this.isRenderReady()) return;
    const wrap = document.querySelector('.game-canvas-wrap');
    if (wrap) {
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      if (w > 0 && h > 0) {
        this.render.resize(w, h);
      }
    }
  },

  // ==================== Toast ====================
  showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2500);
  }
};

// ==================== Event Listeners ====================
window.addEventListener('DOMContentLoaded', () => {
  App.init();

  // Menu navigation
  document.querySelectorAll('.menu-btn').forEach(btn => {
    btn.onclick = () => {
      const screen = btn.dataset.screen;
      if (screen) App.showScreen(screen);
    };
  });

  document.querySelectorAll('.footer-btn').forEach(btn => {
    btn.onclick = () => {
      const screen = btn.dataset.screen;
      if (screen) App.showScreen(screen);
    };
  });

  // Back buttons
  document.querySelectorAll('.back-btn').forEach(btn => {
    btn.onclick = () => {
      const back = btn.dataset.back;
      if (back) App.showScreen(back);
    };
  });

  // Difficulty selection
  document.querySelectorAll('.diff-card').forEach(card => {
    card.onclick = () => App.selectDifficulty(card);
  });

  // Color selection
  document.querySelectorAll('.color-btn').forEach(btn => {
    btn.onclick = () => App.selectColor(btn.dataset.color);
  });

  // Local mode selection
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.onclick = () => App.selectLocalMode(btn.dataset.mode);
  });

  // Board size selection
  document.querySelectorAll('.size-btn').forEach(btn => {
    btn.onclick = () => App.selectBoardSize(btn.dataset.size);
  });

  // Start buttons
  const startAI = document.getElementById('start-ai-game');
  if (startAI) startAI.onclick = () => App.startAIGame();

  const startLocal = document.getElementById('start-local-game');
  if (startLocal) startLocal.onclick = () => App.startLocalGame();

  // Online
  const createRoomBtn = document.getElementById('create-room-btn');
  if (createRoomBtn) createRoomBtn.onclick = () => App.createRoom();

  const joinRoomBtn = document.getElementById('join-room-btn');
  if (joinRoomBtn) joinRoomBtn.onclick = () => App.joinRoom();

  const copyCode = document.getElementById('copy-room-code');
  if (copyCode) copyCode.onclick = () => App.copyRoomCode();

  // Game buttons
  const btnUndo = document.getElementById('btn-undo');
  if (btnUndo) btnUndo.onclick = () => App.requestUndo();

  const btnMenu = document.getElementById('btn-menu');
  if (btnMenu) btnMenu.onclick = () => {
    if (confirm('退出当前对局？')) {
      App.render.clearStones();
      App.render.clearEffects();
      App.showScreen('menu-screen');
    }
  };

  const btnHint = document.getElementById('btn-hint');
  if (btnHint) btnHint.onclick = () => App.showHint();

  const btnRestart = document.getElementById('btn-restart');
  if (btnRestart) btnRestart.onclick = () => App.restart();

  const btnSurrender = document.getElementById('btn-surrender');
  if (btnSurrender) btnSurrender.onclick = () => App.surrender();

  // Tutor tabs
  document.querySelectorAll('.tutor-tab').forEach(tab => {
    tab.onclick = () => App.selectTutorTab(tab.dataset.tab);
  });

  // Settings toggles
  document.querySelectorAll('.toggle').forEach(toggle => {
    toggle.onclick = () => App.toggleSetting(toggle);
  });

  // Clear history
  const clearBtn = document.getElementById('clear-history-btn');
  if (clearBtn) clearBtn.onclick = () => App.clearHistory();

  // Result modal buttons
  const resultReplay = document.getElementById('result-replay');
  if (resultReplay) resultReplay.onclick = () => {
    document.getElementById('result-modal').classList.remove('show');
    const games = App.history.getAllGames();
    if (games.length > 0) App.openReplay(games[0]);
  };

  const resultRestart = document.getElementById('result-restart');
  if (resultRestart) resultRestart.onclick = () => App.restart();

  const resultMenu = document.getElementById('result-menu');
  if (resultMenu) resultMenu.onclick = () => {
    document.getElementById('result-modal').classList.remove('show');
    App.render.clearStones();
    App.render.clearEffects();
    App.showScreen('menu-screen');
  };

  // Replay controls
  const replayPrev = document.getElementById('replay-prev');
  if (replayPrev) replayPrev.onclick = () => App.replayPrev();

  const replayPlay = document.getElementById('replay-play');
  if (replayPlay) replayPlay.onclick = () => App.replayPlay();

  const replayNext = document.getElementById('replay-next');
  if (replayNext) replayNext.onclick = () => App.replayNext();

  // Chat
  const chatSend = document.getElementById('chat-send');
  if (chatSend) chatSend.onclick = () => App.sendChat();

  // Window resize
  window.addEventListener('resize', () => {
    if (App.currentScreen === 'game-screen') {
      App.resizeCanvas();
    }
  });

  // Prevent context menu on canvas
  document.getElementById('game-canvas').addEventListener('contextmenu', e => e.preventDefault());

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.key === 'u' || e.key === 'U') {
      if (App.currentScreen === 'game-screen') App.requestUndo();
    }
    if (e.key === 'r' || e.key === 'R') {
      if (App.currentScreen === 'game-screen') App.restart();
    }
    if (e.key === 'h' || e.key === 'H') {
      if (App.currentScreen === 'game-screen') App.showHint();
    }
    if (e.key === 'Escape') {
      if (App.currentScreen === 'game-screen') {
        if (confirm('退出当前对局？')) {
          if (App.isRenderReady()) {
            App.render.clearStones();
            App.render.clearEffects();
          }
          App.showScreen('menu-screen');
        }
      }
    }
    if (e.key === ' ') {
      if (App.currentScreen === 'replay-screen') App.replayPlay();
    }
    if (e.key === 'ArrowLeft') {
      if (App.currentScreen === 'replay-screen') App.replayPrev();
    }
    if (e.key === 'ArrowRight') {
      if (App.currentScreen === 'replay-screen') App.replayNext();
    }
  });

  // Modal close buttons
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
      const modalId = btn.dataset.close;
      if (modalId) document.getElementById(modalId).classList.remove('show');
    });
  });

  // Select pro player button
  const selectProBtn = document.getElementById('select-pro-btn');
  if (selectProBtn) selectProBtn.onclick = () => App.selectProPlayerForAI();

  // Share buttons
  const shareCopyBtn = document.getElementById('share-copy');
  if (shareCopyBtn) shareCopyBtn.onclick = () => App.shareGameResult(App.lastGameResult);

  const shareExportBtn = document.getElementById('share-export');
  if (shareExportBtn) shareExportBtn.onclick = () => App.exportGameRecord();
});
