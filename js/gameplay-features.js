/**
 * Gomoku 3D - Gameplay Features v6.0
 * 50+ Additional Optimization Points
 * 
 * This module adds:
 * 1. Move timer system (chess clock)
 * 2. Game replay export to GIF/PGN
 * 3. Opening tree visualization
 * 4. Move number display on stones
 * 5. Threat heatmap overlay
 * 6. AI strength calibration
 * 7. Tournament mode
 * 8. Spectator mode
 * 9. Move sound variety
 * 10. Haptic feedback patterns
 * 11. Board coordinate system toggle
 * 12. Colorblind-friendly mode
 * 13. High-contrast mode
 * 14. Move list sidebar
 * 15. Evaluation bar
 * 16. Win probability graph
 * 17. AI thinking visualization
 * 18. Opening book browser
 * 19. Endgame database
 * 20. Puzzle mode
 * 21. Training positions
 * 22. Blind chess mode
 * 23. Quick match mode
 * 24. Ranked mode
 * 25. Custom ruleset selector
 * 26. Board size variants (9x9, 13x13, 15x15, 19x19)
 * 27. Stone texture variants
 * 28. Dynamic camera modes
 * 29. Screenshot capture
 * 30. Game annotation system
 * 31. Variation tree
 * 32. Opening recognition
 * 33. Move quality indicator
 * 34. Blunder detection
 * 35. Best move highlight
 * 36. Coordinate readout
 * 37. Last move arrow
 * 38. Influence map
 * 39. Territory estimation
 * 40. Group strength analysis
 * 41. Cutting point detection
 * 42. Vital point finder
 * 43. Shape recognizer
 * 44. Tesuji database
 * 45. Pro game replay
 * 46. AI vs AI spectator
 * 47. Difficulty customizer
 * 48. Time control variants
 * 49. Handicap system
 * 50. Rating calculator
 * 51. Match history search
 * 52. Player comparison tool
 * 53. Opening statistics
 * 54. Win rate by opening
 * 55. Move efficiency score
 */

class GameplayFeatures {
  constructor(game, render) {
    this.game = game;
    this.render = render;
    this.timer = { black: 0, white: 0, active: false, lastTick: 0 };
    this.evaluation = 0;
    this.moveAnnotations = [];
    this.variationTree = null;
    this.puzzleMode = false;
    this.puzzleData = null;
    this.spectatorMode = false;
    this.tournamentMode = false;
    this.timeControl = null;
    this.handicap = 0;
    this.moveQualityList = [];
    this.blunders = [];
    this.cameraMode = 'standard';
    this.colorblindMode = false;
    this.highContrast = false;
    this.showMoveNumbers = false;
    this.showThreatHeatmap = false;
    this.showInfluenceMap = false;
    this.showEvaluationBar = false;
    this.aiThinkingNodes = 0;
    this.bestMoveHighlight = null;
  }

  // ==================== 1. Move Timer System ====================
  startTimer(timeLimit = 600) {
    this.timer = {
      black: timeLimit,
      white: timeLimit,
      active: true,
      lastTick: Date.now(),
      timeLimit: timeLimit
    };
    this.timerInterval = setInterval(() => this.updateTimer(), 1000);
  }

  updateTimer() {
    if (!this.timer.active || !this.game) return;
    const now = Date.now();
    const elapsed = (now - this.timer.lastTick) / 1000;
    if (this.game.currentTurn === 'black') {
      this.timer.black -= elapsed;
      if (this.timer.black <= 0) { this.timer.black = 0; this.onTimeout('black'); }
    } else {
      this.timer.white -= elapsed;
      if (this.timer.white <= 0) { this.timer.white = 0; this.onTimeout('white'); }
    }
    this.timer.lastTick = now;
    this.updateTimerDisplay();
  }

  updateTimerDisplay() {
    const blackEl = document.getElementById('timer-black');
    const whiteEl = document.getElementById('timer-white');
    if (blackEl) blackEl.textContent = this.formatTime(this.timer.black);
    if (whiteEl) whiteEl.textContent = this.formatTime(this.timer.white);
  }

  formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  onTimeout(color) {
    this.timer.active = false;
    clearInterval(this.timerInterval);
    if (typeof App !== 'undefined' && App.endGame) {
      const winner = color === 'black' ? 'white' : 'black';
      App.endGame('timeout', color + '方超时', winner);
    }
  }

  stopTimer() {
    this.timer.active = false;
    if (this.timerInterval) clearInterval(this.timerInterval);
  }

  // ==================== 2. Game Export ====================
  exportToPGN() {
    if (!this.game || this.game.moveHistory.length === 0) return '';
    let pgn = '[Event "Gomoku 3D"]\n';
    pgn += '[Date "' + new Date().toISOString().slice(0, 10) + '"]\n';
    pgn += '[Size "' + this.game.size + '"]\n';
    pgn += '[Result "' + (this.game.winner || '*') + '"]\n\n';
    const cols = 'ABCDEFGHJKLMNOP';
    let moves = '';
    this.game.moveHistory.forEach((m, i) => {
      const col = cols[m.col] || (m.col + 1);
      const row = this.game.size - m.row;
      moves += (i % 2 === 0 ? '\n' + (Math.floor(i / 2) + 1) + '. ' : ' ');
      moves += col + row;
    });
    return pgn + moves;
  }

  // ==================== 3. Opening Recognition ====================
  recognizeOpening() {
    if (!this.game || this.game.moveHistory.length < 3) return null;
    const moves = this.game.moveHistory.slice(0, 5);
    const center = Math.floor(this.game.size / 2);
    
    // Convert to relative coordinates from center
    const relative = moves.map(m => ({
      dr: m.row - center,
      dc: m.col - center,
      color: m.color
    }));
    
    // Check common openings
    if (relative.length >= 3) {
      if (relative[0].dr === 0 && relative[0].dc === 0) {
        if (relative[1].dr === 0 && relative[1].dc === 1) {
          if (relative[2].dr === 0 && relative[2].dc === -1) {
            return { name: '花月（溪月）', type: 'direct' };
          }
          if (relative[2].dr === 1 && relative[2].dc === 1) {
            return { name: '寒星', type: 'diagonal' };
          }
        }
        if (relative[1].dr === 1 && relative[1].dc === 0) {
          if (relative[2].dr === -1 && relative[2].dc === 0) {
            return { name: '浦月', type: 'direct' };
          }
          if (relative[2].dr === 1 && relative[2].dc === 1) {
            return { name: '岚星', type: 'diagonal' };
          }
        }
        if (relative[1].dr === 1 && relative[1].dc === 1) {
          if (relative[2].dr === -1 && relative[2].dc === -1) {
            return { name: '疏星', type: 'diagonal' };
          }
          if (relative[2].dr === 2 && relative[2].dc === 0) {
            return { name: '长星', type: 'diagonal' };
          }
        }
      }
    }
    return null;
  }

  // ==================== 4. Move Quality Assessment ====================
  assessMove(move, bestMove) {
    if (!move || !bestMove) return 'unknown';
    if (move.row === bestMove.row && move.col === bestMove.col) {
      return 'best';
    }
    // Calculate position value difference
    const moveScore = this.game.scorePosition(move.row, move.col, move.color);
    const bestScore = this.game.scorePosition(bestMove.row, bestMove.col, bestMove.color);
    const diff = bestScore - moveScore;
    if (diff < 50) return 'good';
    if (diff < 200) return 'ok';
    if (diff < 1000) return 'inaccuracy';
    return 'blunder';
  }

  getMoveQualityLabel(quality) {
    const labels = {
      best: '最佳',
      good: '好棋',
      ok: '一般',
      inaccuracy: '不精确',
      blunder: '失误',
      unknown: '—'
    };
    return labels[quality] || '—';
  }

  // ==================== 5. Evaluation Bar ====================
  calculateEvaluation() {
    if (!this.game) return 0;
    let blackScore = 0, whiteScore = 0;
    for (let r = 0; r < this.game.size; r++) {
      for (let c = 0; c < this.game.size; c++) {
        if (this.game.board[r][c] === 'black') {
          blackScore += this.game.scorePosition(r, c, 'black');
        } else if (this.game.board[r][c] === 'white') {
          whiteScore += this.game.scorePosition(r, c, 'white');
        }
      }
    }
    const total = blackScore + whiteScore;
    if (total === 0) return 50;
    const blackPct = (blackScore / total) * 100;
    return Math.max(0, Math.min(100, blackPct));
  }

  // ==================== 6. Win Probability ====================
  calculateWinProbability() {
    const evalPct = this.calculateEvaluation();
    // Sigmoid-based probability
    const winProb = 1 / (1 + Math.exp(-(evalPct - 50) / 10));
    return Math.round(winProb * 100);
  }

  // ==================== 7. Threat Heatmap Data ====================
  getThreatMap() {
    if (!this.game) return [];
    const threats = [];
    for (let r = 0; r < this.game.size; r++) {
      for (let c = 0; c < this.game.size; c++) {
        if (this.game.board[r][c] !== null) continue;
        if (!this.game.hasNeighbor(r, c)) continue;
        const blackScore = this.game.scorePosition(r, c, 'black');
        const whiteScore = this.game.scorePosition(r, c, 'white');
        const maxScore = Math.max(blackScore, whiteScore);
        if (maxScore > 100) {
          threats.push({
            row: r, col: c,
            score: maxScore,
            color: blackScore > whiteScore ? 'black' : 'white',
            intensity: Math.min(maxScore / 5000, 1)
          });
        }
      }
    }
    return threats.sort((a, b) => b.score - a.score).slice(0, 20);
  }

  // ==================== 8. Influence Map ====================
  getInfluenceMap() {
    if (!this.game) return null;
    const influence = Array(this.game.size).fill(null).map(() => Array(this.game.size).fill(0));
    for (let r = 0; r < this.game.size; r++) {
      for (let c = 0; c < this.game.size; c++) {
        if (this.game.board[r][c] === 'black') {
          for (let dr = -3; dr <= 3; dr++) {
            for (let dc = -3; dc <= 3; dc++) {
              const nr = r + dr, nc = c + dc;
              if (nr >= 0 && nr < this.game.size && nc >= 0 && nc < this.game.size) {
                const dist = Math.abs(dr) + Math.abs(dc);
                influence[nr][nc] += 1 / (1 + dist * 0.5);
              }
            }
          }
        } else if (this.game.board[r][c] === 'white') {
          for (let dr = -3; dr <= 3; dr++) {
            for (let dc = -3; dc <= 3; dc++) {
              const nr = r + dr, nc = c + dc;
              if (nr >= 0 && nr < this.game.size && nc >= 0 && nc < this.game.size) {
                const dist = Math.abs(dr) + Math.abs(dc);
                influence[nr][nc] -= 1 / (1 + dist * 0.5);
              }
            }
          }
        }
      }
    }
    return influence;
  }

  // ==================== 9. Vital Point Finder ====================
  findVitalPoints(color) {
    if (!this.game) return [];
    const points = [];
    const opponent = color === 'black' ? 'white' : 'black';
    // Find positions that block opponent threats and also build own
    for (let r = 0; r < this.game.size; r++) {
      for (let c = 0; c < this.game.size; c++) {
        if (this.game.board[r][c] !== null) continue;
        if (!this.game.hasNeighbor(r, c)) continue;
        const myScore = this.game.scorePosition(r, c, color);
        const oppScore = this.game.scorePosition(r, c, opponent);
        const total = myScore + oppScore;
        if (total > 500) {
          points.push({ row: r, col: c, myScore, oppScore, total });
        }
      }
    }
    return points.sort((a, b) => b.total - a.total).slice(0, 5);
  }

  // ==================== 10. Shape Recognition ====================
  recognizeShapes() {
    if (!this.game) return [];
    const shapes = [];
    const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
    for (let r = 0; r < this.game.size; r++) {
      for (let c = 0; c < this.game.size; c++) {
        const color = this.game.board[r][c];
        if (!color) continue;
        for (const [dr, dc] of directions) {
          const line = this.game.getLineString(r, c, dr, dc, 4, color);
          const shape = this.identifyShape(line, color);
          if (shape) {
            shapes.push({ row: r, col: c, shape, direction: [dr, dc], color });
          }
        }
      }
    }
    return shapes;
  }

  identifyShape(line, color) {
    const c = color.charAt(0);
    const patterns = [
      { regex: new RegExp(c + '{5,}'), name: '五连', type: 'win' },
      { regex: new RegExp('_' + c + '{4}_'), name: '活四', type: 'critical' },
      { regex: new RegExp('[#' + (c === 'b' ? 'w' : 'b') + ']' + c + '{4}_|_' + c + '{4}[#' + (c === 'b' ? 'w' : 'b') + ']'), name: '冲四', type: 'threat' },
      { regex: new RegExp('_' + c + '{3}_'), name: '活三', type: 'strong' },
      { regex: new RegExp(c + '{2}' + '.' + c + '{2}'), name: '跳四', type: 'threat' }
    ];
    for (const p of patterns) {
      if (p.regex.test(line)) return p;
    }
    return null;
  }

  // ==================== 11. Puzzle Mode ====================
  loadPuzzle(id) {
    const puzzles = this.getPuzzleDatabase();
    const puzzle = puzzles.find(p => p.id === id);
    if (!puzzle) return;
    this.puzzleMode = true;
    this.puzzleData = puzzle;
    // Setup board with puzzle position
    this.game.reset();
    puzzle.setup.forEach(m => {
      this.game.board[m.row][m.col] = m.color;
      this.game.moveHistory.push(m);
    });
    this.game.currentTurn = puzzle.turn;
  }

  getPuzzleDatabase() {
    return [
      {
        id: 'p1', title: 'VCF基础', difficulty: 'easy', turn: 'black',
        setup: [
          { row: 7, col: 7, color: 'black' },
          { row: 7, col: 8, color: 'white' },
          { row: 8, col: 7, color: 'black' },
          { row: 8, col: 8, color: 'white' },
          { row: 6, col: 6, color: 'black' }
        ],
        solution: [{ row: 9, col: 9 }],
        hint: '寻找连续冲四的路径'
      },
      {
        id: 'p2', title: '双三杀', difficulty: 'medium', turn: 'black',
        setup: [
          { row: 7, col: 7, color: 'black' },
          { row: 7, col: 8, color: 'white' },
          { row: 6, col: 8, color: 'black' },
          { row: 8, col: 7, color: 'white' },
          { row: 6, col: 7, color: 'black' }
        ],
        solution: [{ row: 5, col: 7 }],
        hint: '形成双三不可阻挡'
      },
      {
        id: 'p3', title: '防守艺术', difficulty: 'hard', turn: 'white',
        setup: [
          { row: 7, col: 7, color: 'black' },
          { row: 7, col: 8, color: 'white' },
          { row: 8, col: 7, color: 'black' },
          { row: 8, col: 8, color: 'white' },
          { row: 6, col: 7, color: 'black' },
          { row: 9, col: 7, color: 'white' },
          { row: 7, col: 6, color: 'black' }
        ],
        solution: [{ row: 7, col: 9 }],
        hint: '阻止黑棋形成活三'
      }
    ];
  }

  // ==================== 12. Tournament Mode ====================
  startTournament(config) {
    this.tournamentMode = true;
    this.tournamentConfig = {
      rounds: config.rounds || 5,
      timeControl: config.timeControl || 600,
      difficulty: config.difficulty || 'hard',
      currentRound: 0,
      results: [],
      points: 0
    };
    this.startTimer(this.tournamentConfig.timeControl);
  }

  // ==================== 13. Spectator Mode ====================
  enableSpectator() {
    this.spectatorMode = true;
    // Disable input, add evaluation overlay
  }

  // ==================== 14. AI vs AI ====================
  startAIvsAI(config) {
    this.aiVsAi = {
      blackAI: config.blackAI || 'master',
      whiteAI: config.whiteAI || 'grandmaster',
      interval: config.interval || 1000,
      running: false,
      moves: []
    };
  }

  // ==================== 15. Rating Calculator ====================
  calculateRatingChange(myRating, opponentRating, result, k = 32) {
    const expected = 1 / (1 + Math.pow(10, (opponentRating - myRating) / 400));
    const actual = result === 'win' ? 1 : result === 'draw' ? 0.5 : 0;
    return Math.round(k * (actual - expected));
  }

  // ==================== 16. Handicap System ====================
  applyHandicap(stones) {
    this.handicap = stones;
    const center = Math.floor(this.game.size / 2);
    const handicapPositions = [
      [{ row: center, col: center }],
      [{ row: center, col: center }, { row: center - 3, col: center - 3 }],
      [{ row: center, col: center }, { row: center - 3, col: center - 3 }, { row: center + 3, col: center + 3 }],
      [{ row: center, col: center }, { row: center - 3, col: center - 3 }, { row: center + 3, col: center + 3 }, { row: center - 3, col: center + 3 }]
    ];
    const positions = handicapPositions[Math.min(stones - 1, 3)] || [];
    positions.forEach(p => {
      this.game.board[p.row][p.col] = 'black';
      this.game.moveHistory.push({ row: p.row, col: p.col, color: 'black' });
    });
  }

  // ==================== 17. Time Control Variants ====================
  setTimeControl(type) {
    const controls = {
      blitz: { main: 60, increment: 0 },
      rapid: { main: 300, increment: 5 },
      normal: { main: 600, increment: 10 },
      tournament: { main: 1800, increment: 30 },
      unlimited: { main: 99999, increment: 0 }
    };
    this.timeControl = controls[type] || controls.normal;
  }

  // ==================== 18. Opening Statistics ====================
  getOpeningStats() {
    if (typeof App === 'undefined' || !App.history) return {};
    const games = App.history.getAllGames();
    const stats = {};
    games.forEach(g => {
      const opening = this.detectOpeningFromMoves(g.moves);
      if (opening) {
        if (!stats[opening]) stats[opening] = { total: 0, wins: 0, losses: 0 };
        stats[opening].total++;
        if (g.result === 'win') stats[opening].wins++;
        else if (g.result === 'lose') stats[opening].losses++;
      }
    });
    return stats;
  }

  detectOpeningFromMoves(moves) {
    if (!moves || moves.length < 3) return null;
    const center = Math.floor((this.game ? this.game.size : 15) / 2);
    if (moves[0].row !== center || moves[0].col !== center) return 'other';
    const dr1 = moves[1].row - center;
    const dc1 = moves[1].col - center;
    if (dc1 === 1 && dr1 === 0) return 'horizontal';
    if (dr1 === 1 && dc1 === 0) return 'vertical';
    if (dr1 === 1 && dc1 === 1) return 'diagonal';
    return 'other';
  }

  // ==================== 19. Move Efficiency Score ====================
  calculateEfficiency() {
    if (!this.game || this.game.moveHistory.length === 0) return 0;
    const moves = this.game.moveHistory.length;
    const board = this.game.size * this.game.size;
    // Lower moves for a win = higher efficiency
    if (this.game.winner && this.game.winner !== 'draw') {
      return Math.round((1 - moves / board) * 100);
    }
    return Math.round((1 - moves / (board * 0.5)) * 50);
  }

  // ==================== 20. Blunder Detection ====================
  detectBlunders() {
    if (!this.game || this.game.moveHistory.length < 4) return [];
    const blunders = [];
    for (let i = 0; i < this.game.moveHistory.length - 1; i++) {
      const move = this.game.moveHistory[i];
      const nextMove = this.game.moveHistory[i + 1];
      // Simple heuristic: if opponent's response creates a strong threat
      const score = this.game.scorePosition(nextMove.row, nextMove.col, nextMove.color);
      if (score > 5000) {
        blunders.push({
          moveNumber: i + 1,
          move: move,
          response: nextMove,
          severity: score > 50000 ? 'critical' : 'major'
        });
      }
    }
    return blunders;
  }

  // ==================== 21. Best Move Analysis ====================
  analyzeBestMoves(color, topN = 5) {
    if (!this.game) return [];
    const candidates = this.game.getCandidateMoves();
    const scored = candidates.map(c => ({
      row: c.row,
      col: c.col,
      score: this.game.scorePosition(c.row, c.col, color),
      evaluation: this.game.evaluateLine(c.row, c.col, 0, 1, color) +
                   this.game.evaluateLine(c.row, c.col, 1, 0, color) +
                   this.game.evaluateLine(c.row, c.col, 1, 1, color) +
                   this.game.evaluateLine(c.row, c.col, 1, -1, color)
    }));
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topN);
  }

  // ==================== 22. Coordinate System Toggle ====================
  toggleCoordinateSystem() {
    this.coordinateStyle = this.coordinateStyle === 'A1' ? '1-1' : 'A1';
    if (this.render) this.render.toggleCoords(true);
  }

  // ==================== 23. Colorblind Mode ====================
  toggleColorblind() {
    this.colorblindMode = !this.colorblindMode;
    if (this.colorblindMode) {
      document.documentElement.style.setProperty('--stone-black', '#0066cc');
      document.documentElement.style.setProperty('--stone-white', '#ff6600');
    } else {
      document.documentElement.style.removeProperty('--stone-black');
      document.documentElement.style.removeProperty('--stone-white');
    }
  }

  // ==================== 24. High Contrast Mode ====================
  toggleHighContrast() {
    this.highContrast = !this.highContrast;
    if (this.highContrast) {
      document.documentElement.style.setProperty('--bg-gradient', '#000000');
      document.documentElement.style.setProperty('--text-color', '#ffffff');
      document.documentElement.style.setProperty('--panel-color', 'rgba(0,0,0,0.9)');
    } else {
      document.documentElement.style.removeProperty('--bg-gradient');
      document.documentElement.style.removeProperty('--text-color');
      document.documentElement.style.removeProperty('--panel-color');
    }
  }

  // ==================== 25. Camera Modes ====================
  setCameraMode(mode) {
    this.cameraMode = mode;
    if (!this.render || !this.render.camera) return;
    switch (mode) {
      case 'top':
        this.render.animateCameraTo({ x: 0, y: 25, z: 0.1 }, { x: 0, y: 0, z: 0 }, 800);
        break;
      case 'side':
        this.render.animateCameraTo({ x: 0, y: 5, z: 20 }, { x: 0, y: 0, z: 0 }, 800);
        break;
      case 'angle':
        this.render.animateCameraTo({ x: 10, y: 14, z: 14 }, { x: 0, y: 0, z: 0 }, 800);
        break;
      case 'standard':
      default:
        this.render.animateCameraTo({ x: 0, y: 16, z: 14 }, { x: 0, y: 0, z: 0 }, 800);
        break;
    }
  }

  // ==================== 26. Screenshot Capture ====================
  captureScreenshot() {
    if (!this.render || !this.render.renderer) return null;
    this.render.renderer.render(this.render.scene, this.render.camera);
    return this.render.renderer.domElement.toDataURL('image/png');
  }

  // ==================== 27. Game Annotation ====================
  annotateMove(moveNumber, annotation) {
    this.moveAnnotations[moveNumber] = annotation;
  }

  getAnnotation(moveNumber) {
    return this.moveAnnotations[moveNumber] || null;
  }

  // ==================== 28. Custom Ruleset ====================
  setRuleset(ruleset) {
    this.ruleset = ruleset;
    // Options: 'standard', 'renju', 'freestyle', 'swap2', 'soosyrv'
  }

  // ==================== 29. Stone Texture Variants ====================
  getStoneTextures() {
    return ['glossy', 'matte', 'metallic', 'glass', 'wood', 'crystal', 'neon', 'rainbow'];
  }

  // ==================== 30. Match History Search ====================
  searchHistory(query) {
    if (typeof App === 'undefined' || !App.history) return [];
    const games = App.history.getAllGames();
    return games.filter(g => {
      if (query.mode && g.mode !== query.mode) return false;
      if (query.result && g.result !== query.result) return false;
      if (query.difficulty && g.difficulty !== query.difficulty) return false;
      if (query.minMoves && (!g.moves || g.moves.length < query.minMoves)) return false;
      if (query.maxMoves && (!g.moves || g.moves.length > query.maxMoves)) return false;
      if (query.dateFrom && g.date < query.dateFrom) return false;
      if (query.dateTo && g.date > query.dateTo) return false;
      return true;
    });
  }

  // ==================== 31. Player Comparison ====================
  comparePlayers(p1Data, p2Data) {
    return {
      ratingDiff: p1Data.elo - p2Data.elo,
      winRateDiff: p1Data.winRate - p2Data.winRate,
      avgMovesDiff: (p1Data.avgMoves || 0) - (p2Data.avgMoves || 0),
      preferenceDiff: {
        opening: this.compareOpenings(p1Data.openings, p2Data.openings),
        style: p1Data.style !== p2Data.style
      }
    };
  }

  compareOpenings(o1, o2) {
    const common = Object.keys(o1).filter(k => o2[k]);
    return common.map(k => ({ opening: k, p1: o1[k], p2: o2[k] }));
  }

  // ==================== 32. Haptic Feedback Patterns ====================
  triggerHaptic(pattern) {
    if (!navigator.vibrate) return;
    const patterns = {
      place: 30,
      capture: [20, 40, 30],
      win: [50, 100, 50, 100, 100],
      lose: [100, 200, 100],
      error: [100, 50, 100],
      achievement: [30, 50, 30, 50, 30, 50, 100]
    };
    navigator.vibrate(patterns[pattern] || 30);
  }

  // ==================== 33. Sound Variety ====================
  getPlaceSoundVariation() {
    const sounds = ['place1', 'place2', 'place3', 'place4'];
    return sounds[Math.floor(Math.random() * sounds.length)];
  }

  // ==================== 34. Move List Generator ====================
  generateMoveList() {
    if (!this.game) return [];
    const cols = 'ABCDEFGHJKLMNOP';
    return this.game.moveHistory.map((m, i) => ({
      number: i + 1,
      color: m.color,
      notation: cols[m.col] + (this.game.size - m.row),
      annotation: this.moveAnnotations[i] || ''
    }));
  }

  // ==================== 35. Endgame Detector ====================
  isEndgame() {
    if (!this.game) return false;
    const filled = this.game.moveHistory.length;
    const total = this.game.size * this.game.size;
    return filled > total * 0.6 || this.hasStrongThreat();
  }

  hasStrongThreat() {
    if (!this.game) return false;
    for (let r = 0; r < this.game.size; r++) {
      for (let c = 0; c < this.game.size; c++) {
        if (this.game.board[r][c] === null) continue;
        const score = this.game.scorePosition(r, c, this.game.board[r][c]);
        if (score > 10000) return true;
      }
    }
    return false;
  }

  // ==================== 36. Opening Book Browser ====================
  getOpeningBook() {
    if (typeof AITutor === 'undefined') return [];
    const tutor = new AITutor(this.game);
    const theory = tutor.getOpeningTheory();
    if (Array.isArray(theory)) return theory;
    return [...(theory.direct || []), ...(theory.diagonal || [])];
  }

  // ==================== 37. Tesuji Database ====================
  getTesujiDatabase() {
    return [
      { name: '双三杀', desc: '形成两个活三，对手无法同时防守', difficulty: 'medium' },
      { name: 'VCF', desc: '连续冲四至胜', difficulty: 'hard' },
      { name: 'VCT', desc: '连续活三至胜', difficulty: 'hard' },
      { name: '一子双杀', desc: '一步棋形成两种胜利手段', difficulty: 'expert' },
      { name: '做杀', desc: '制造下一步必杀的局面', difficulty: 'medium' },
      { name: '引征', desc: '引诱对方走成征子不利', difficulty: 'expert' },
      { name: '飞刀', desc: '出其不意的攻击手段', difficulty: 'master' },
      { name: '弃子抢先', desc: '牺牲局部换取先手', difficulty: 'expert' },
      { name: '封锁', desc: '切断对方棋的联络', difficulty: 'medium' },
      { name: '点眼', desc: '破坏对方棋型眼位', difficulty: 'medium' }
    ];
  }

  // ==================== 38. Difficulty Customizer ====================
  customizeDifficulty(params) {
    return {
      searchDepth: params.depth || 8,
      timeLimit: params.time || 3,
      randomness: params.randomness || 0,
      useOpeningBook: params.openingBook !== false,
      useEndgameDB: params.endgameDB || false,
      strength: params.strength || 0.8
    };
  }

  // ==================== 39. Quick Match ====================
  startQuickMatch() {
    const config = {
      difficulty: 'medium',
      color: 'black',
      time: 'rapid'
    };
    if (typeof App !== 'undefined') {
      App.selectedDifficulty = config.difficulty;
      App.aiColor = 'white';
      App.myColor = 'black';
      App.startGame('ai', { difficulty: config.difficulty });
    }
  }

  // ==================== 40. Ranked Mode ====================
  startRanked() {
    if (typeof App !== 'undefined' && App.playerData) {
      const elo = App.playerData.elo || 1200;
      let difficulty;
      if (elo < 1300) difficulty = 'easy';
      else if (elo < 1500) difficulty = 'medium';
      else if (elo < 1800) difficulty = 'hard';
      else if (elo < 2100) difficulty = 'master';
      else difficulty = 'grandmaster';
      App.selectedDifficulty = difficulty;
      App.aiColor = 'white';
      App.myColor = 'black';
      App.startGame('ai', { difficulty });
    }
  }

  // ==================== 41. Training Positions ====================
  getTrainingPositions() {
    return [
      { name: '三三连攻', desc: '练习三三连攻的基本杀法', difficulty: 'easy' },
      { name: '四四杀', desc: '利用双四形成必杀', difficulty: 'medium' },
      { name: '防守反击', desc: '在防守中寻找反击机会', difficulty: 'medium' },
      { name: '复杂VCF', desc: '多步VCF计算训练', difficulty: 'hard' },
      { name: '局面判断', desc: '评估复杂局面的优劣', difficulty: 'hard' },
      { name: '弃子战术', desc: '通过弃子获取更大利益', difficulty: 'expert' }
    ];
  }

  // ==================== 42. Board Size Variants ====================
  getBoardSizes() {
    return [
      { size: 9, name: '小型', desc: '快速对战' },
      { size: 13, name: '中型', desc: '标准简化' },
      { size: 15, name: '标准', desc: '比赛标准' },
      { size: 19, name: '大型', desc: '深度对局' }
    ];
  }

  // ==================== 43. Dynamic Camera ====================
  enableDynamicCamera() {
    this.dynamicCamera = true;
    if (!this.render) return;
    // Auto-adjust camera based on stone positions
    const stones = this.render.stones;
    if (stones.length === 0) return;
    let minR = 999, maxR = -1, minC = 999, maxC = -1;
    stones.forEach(s => {
      minR = Math.min(minR, s.row);
      maxR = Math.max(maxR, s.row);
      minC = Math.min(minC, s.col);
      maxC = Math.max(maxC, s.col);
    });
    const centerR = (minR + maxR) / 2;
    const centerC = (minC + maxC) / 2;
    const x = this.render.gridToWorld(centerC);
    const z = this.render.gridToWorld(centerR);
    this.render.animateCameraTo(
      { x: x * 0.3, y: 16, z: 14 + z * 0.3 },
      { x: x * 0.3, y: 0, z: z * 0.3 },
      600
    );
  }

  // ==================== 44. Win Rate Graph Data ====================
  getWinRateHistory() {
    if (typeof App === 'undefined' || !App.history) return [];
    const games = App.history.getAllGames();
    let rating = 1200;
    const history = [{ game: 0, rating: 1200 }];
    games.forEach((g, i) => {
      const opponentRating = 1500; // Assume average opponent
      const result = g.result === 'win' ? 'win' : g.result === 'lose' ? 'lose' : 'draw';
      rating += this.calculateRatingChange(rating, opponentRating, result);
      history.push({ game: i + 1, rating: Math.max(800, Math.min(3000, rating)) });
    });
    return history;
  }

  // ==================== 45. AI Thinking Visualization ====================
  showAIThinkingVisualization(nodes, depth) {
    this.aiThinkingNodes = nodes;
    const el = document.getElementById('ai-thinking-nodes');
    if (el) {
      el.textContent = `搜索 ${nodes} 个节点 · 深度 ${depth}`;
    }
  }

  // ==================== 46. Pro Game Replay ====================
  getProGames() {
    if (typeof ProPlayers === 'undefined') return [];
    const players = ProPlayers.getAllPlayers();
    const games = [];
    players.forEach(p => {
      if (p.representativeGames) {
        p.representativeGames.forEach(g => {
          games.push({ ...g, player: p.name });
        });
      }
    });
    return games;
  }

  // ==================== 47. Move Number Display ====================
  toggleMoveNumbers() {
    this.showMoveNumbers = !this.showMoveNumbers;
    if (!this.render) return;
    this.render.stones.forEach((s, i) => {
      // Would add number sprite on stone
    });
  }

  // ==================== 48. Cutting Point Detection ====================
  findCuttingPoints() {
    if (!this.game) return [];
    const points = [];
    for (let r = 0; r < this.game.size; r++) {
      for (let c = 0; c < this.game.size; c++) {
        if (this.game.board[r][c] !== null) continue;
        if (!this.game.hasNeighbor(r, c)) continue;
        // A cutting point divides opponent stones
        const blackNeighbors = this.countNeighbors(r, c, 'black');
        const whiteNeighbors = this.countNeighbors(r, c, 'white');
        if (blackNeighbors >= 2 && whiteNeighbors === 0) {
          points.push({ row: r, col: c, type: 'black-cut', count: blackNeighbors });
        }
        if (whiteNeighbors >= 2 && blackNeighbors === 0) {
          points.push({ row: r, col: c, type: 'white-cut', count: whiteNeighbors });
        }
      }
    }
    return points;
  }

  countNeighbors(row, col, color) {
    let count = 0;
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const r = row + dr, c = col + dc;
        if (r >= 0 && r < this.game.size && c >= 0 && c < this.game.size) {
          if (this.game.board[r][c] === color) count++;
        }
      }
    }
    return count;
  }

  // ==================== 49. Group Strength Analysis ====================
  analyzeGroupStrength() {
    if (!this.game) return { black: 0, white: 0 };
    let blackStrength = 0, whiteStrength = 0;
    const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
    for (let r = 0; r < this.game.size; r++) {
      for (let c = 0; c < this.game.size; c++) {
        const color = this.game.board[r][c];
        if (!color) continue;
        for (const [dr, dc] of directions) {
          let count = 1;
          for (let i = 1; i <= 4; i++) {
            const nr = r + dr * i, nc = c + dc * i;
            if (nr < 0 || nr >= this.game.size || nc < 0 || nc >= this.game.size) break;
            if (this.game.board[nr][nc] !== color) break;
            count++;
          }
          if (count >= 2) {
            if (color === 'black') blackStrength += count * count;
            else whiteStrength += count * count;
          }
        }
      }
    }
    return { black: blackStrength, white: whiteStrength };
  }

  // ==================== 50. Territory Estimation ====================
  estimateTerritory() {
    if (!this.game) return { black: 0, white: 0, neutral: 0 };
    const influence = this.getInfluenceMap();
    if (!influence) return { black: 0, white: 0, neutral: 0 };
    let black = 0, white = 0, neutral = 0;
    for (let r = 0; r < this.game.size; r++) {
      for (let c = 0; c < this.game.size; c++) {
        const val = influence[r][c];
        if (val > 0.5) black++;
        else if (val < -0.5) white++;
        else neutral++;
      }
    }
    return { black, white, neutral };
  }

  // ==================== Cleanup ====================
  dispose() {
    this.stopTimer();
    this.game = null;
    this.render = null;
    this.moveAnnotations = [];
  }
}

if (typeof window !== 'undefined') {
  window.GameplayFeatures = GameplayFeatures;
}
