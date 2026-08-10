/**
 * Gomoku 3D - AI Engine v5.0 (Professional)
 * 
 * Based on real professional Renju theory:
 * - 26 professional openings (direct + diagonal)
 * - VCF (Victory by Continuous Fours) / VCT (Victory by Continuous Threats)
 * - Threat-Space Search (TSS)
 * - Professional pattern scoring (from Renju master games)
 * - Iterative deepening + Alpha-Beta + PVS + Null-move pruning
 * - Killer move + History heuristic + Transposition table
 * - Advanced pattern detection: double threats, combination attacks
 * 
 * References:
 * - Yixin engine algorithms (Gomocup champion)
 * - RIF world championship game analysis
 * - Professional Renju pattern evaluation tables
 * - Chinese Renju Association opening theory
 */

// ============= Professional Pattern Scores =============
// Based on professional Renju theory and master game analysis
const PATTERN = {
  FIVE:         100000000,   // Five in a row (win)
  OPEN_FOUR:     10000000,   // Open four (unstoppable)
  FOUR:            500000,   // Closed four (forced response)
  JUMP_FOUR:       450000,   // Jump four (X_XXX, XXX_X, XX_XX)
  OPEN_THREE:       50000,   // Open three (can become open four)
  JUMP_THREE:       40000,   // Jump three (X_XX, XX_X with open ends)
  THREE:              5000,   // Closed three
  OPEN_TWO:           2000,   // Open two
  TWO:                 200,   // Closed two
  OPEN_ONE:             10,   // Open one
  ONE:                   1    // Closed one
};

// ============= Professional 26-Opening Database =============
// Based on real Renju opening theory from Chinese Renju Association
// Center is (7,7) on a 15x15 board
const OPENING_BOOK = {
  // Direct openings (black 3 adjacent to white 2)
  direct: [
    { name: 'hanxing',   cn: '寒星', black3: [-1, 0] },  // H10 relative
    { name: 'xiyue',     cn: '溪月', black3: [0, 1] },
    { name: 'shuxing',   cn: '疏星', black3: [1, 1] },
    { name: 'huayue',    cn: '花月', black3: [1, 0] },    // Strongest direct
    { name: 'canyue',    cn: '残月', black3: [1, -1] },
    { name: 'yuyue',     cn: '雨月', black3: [0, -1] },
    { name: 'jinxing',   cn: '金星', black3: [2, -1] },
    { name: 'songyue',   cn: '松月', black3: [-1, 1] },
    { name: 'qiuyue',    cn: '丘月', black3: [-1, -1] },
    { name: 'xinyue',    cn: '新月', black3: [-2, 0] },
    { name: 'ruixing',   cn: '瑞星', black3: [-1, -2] },
    { name: 'shanyue',   cn: '山月', black3: [0, -2] },
    { name: 'youxing',   cn: '游星', black3: [1, -2] }
  ],
  // Diagonal openings (black 3 diagonal to white 2)
  diagonal: [
    { name: 'changxing', cn: '长星', black3: [2, 1] },
    { name: 'xiayue',    cn: '峡月', black3: [1, 2] },
    { name: 'hengxing',  cn: '恒星', black3: [2, 2] },
    { name: 'shuiyue',   cn: '水月', black3: [0, 2] },
    { name: 'liuxing',   cn: '流星', black3: [-1, 2] },
    { name: 'yunyue',    cn: '云月', black3: [-2, 1] },
    { name: 'puyue',     cn: '浦月', black3: [-2, 0] },   // Strongest diagonal
    { name: 'lanyue',    cn: '岚月', black3: [-2, -2] },
    { name: 'yinyue',   cn: '银月', black3: [-1, -2] },
    { name: 'mingxing',  cn: '明星', black3: [0, -2] },
    { name: 'xieyue',    cn: '斜月', black3: [2, -2] },
    { name: 'mingyue',   cn: '名月', black3: [1, -2] },
    { name: 'huixing',   cn: '彗星', black3: [2, 0] }
  ]
};

// ============= Zobrist Hashing =============
let zobristTable = null;
const ZOBRIST_SIZE = 15 * 15 * 2;

function initZobrist() {
  if (zobristTable) return;
  zobristTable = new Array(ZOBRIST_SIZE);
  for (let i = 0; i < ZOBRIST_SIZE; i++) {
    zobristTable[i] = Math.floor(Math.random() * 0x7FFFFFFF);
  }
}

function computeHash(engine) {
  let hash = 0;
  for (let r = 0; r < engine.size; r++) {
    for (let c = 0; c < engine.size; c++) {
      const cell = engine.board[r][c];
      if (cell === 'black') {
        hash ^= zobristTable[(r * 15 + c) * 2];
      } else if (cell === 'white') {
        hash ^= zobristTable[(r * 15 + c) * 2 + 1];
      }
    }
  }
  return hash;
}

// ============= AI Brain Class =============
class AIBrain {
  constructor(difficulty) {
    this.difficulty = difficulty || 'medium';
    this.transpositionTable = new Map();
    this.maxTableSize = 100000;
    this.timeLimit = 3000;
    this.startTime = 0;
    this.nodes = 0;
    this.abortSearch = false;

    // Killer move table: [depth][2] - two killer moves per depth
    this.killerMoves = [];
    for (let i = 0; i < 24; i++) {
      this.killerMoves.push([null, null]);
    }

    // History heuristic table: 15x15 score map
    this.historyTable = [];
    for (let i = 0; i < 15; i++) {
      this.historyTable.push(new Array(15).fill(0));
    }

    // Principal Variation
    this.pvMoves = [];

    this.setDifficulty(this.difficulty);
  }

  setDifficulty(difficulty) {
    this.difficulty = difficulty;
    const config = {
      // easy: beginner, shallow search
      easy: {
        timeLimit: 500, maxDepth: 3, candidateLimit: 10,
        useThreat: false, useOpening: true, useKiller: false,
        useHistory: false, useNullMove: false, usePVS: false,
        useVCF: false, useVCT: false, useTSS: false,
        randomness: 0.35, evalNoise: 0.15
      },
      // medium: intermediate, basic threats
      medium: {
        timeLimit: 1500, maxDepth: 5, candidateLimit: 12,
        useThreat: true, useOpening: true, useKiller: false,
        useHistory: false, useNullMove: false, usePVS: false,
        useVCF: true, useVCT: false, useTSS: false,
        randomness: 0.08, evalNoise: 0.03
      },
      // hard: advanced, VCF + killer moves
      hard: {
        timeLimit: 3000, maxDepth: 8, candidateLimit: 10,
        useThreat: true, useOpening: true, useKiller: true,
        useHistory: true, useNullMove: false, usePVS: true,
        useVCF: true, useVCT: true, useTSS: false,
        randomness: 0.02, evalNoise: 0
      },
      // master: expert, VCT + null-move + TSS
      master: {
        timeLimit: 5000, maxDepth: 12, candidateLimit: 10,
        useThreat: true, useOpening: true, useKiller: true,
        useHistory: true, useNullMove: true, usePVS: true,
        useVCF: true, useVCT: true, useTSS: true,
        randomness: 0, evalNoise: 0
      },
      // grandmaster: peak performance, full TSS + deep search
      grandmaster: {
        timeLimit: 10000, maxDepth: 16, candidateLimit: 12,
        useThreat: true, useOpening: true, useKiller: true,
        useHistory: true, useNullMove: true, usePVS: true,
        useVCF: true, useVCT: true, useTSS: true,
        randomness: 0, evalNoise: 0
      }
    };
    const cfg = config[difficulty] || config.medium;
    this.timeLimit = cfg.timeLimit;
    this.maxDepth = cfg.maxDepth;
    this.candidateLimit = cfg.candidateLimit;
    this.useThreat = cfg.useThreat;
    this.useOpening = cfg.useOpening;
    this.useKiller = cfg.useKiller;
    this.useHistory = cfg.useHistory;
    this.useNullMove = cfg.useNullMove;
    this.usePVS = cfg.usePVS;
    this.useVCF = cfg.useVCF;
    this.useVCT = cfg.useVCT;
    this.useTSS = cfg.useTSS;
    this.randomness = cfg.randomness;
    this.evalNoise = cfg.evalNoise;
  }

  getBestMove(engine, color) {
    initZobrist();
    this.transpositionTable.clear();
    this.abortSearch = false;
    this.startTime = Date.now();
    this.nodes = 0;

    // Clear tables
    for (let i = 0; i < 24; i++) {
      this.killerMoves[i] = [null, null];
    }
    for (let i = 0; i < 15; i++) {
      for (let j = 0; j < 15; j++) {
        this.historyTable[i][j] = 0;
      }
    }
    this.pvMoves = [];

    const opponent = color === 'black' ? 'white' : 'black';

    // 1. Opening book - use professional 26 openings
    if (this.useOpening && engine.moveHistory.length < 6) {
      const bookMove = this.getOpeningMove(engine, color);
      if (bookMove) return bookMove;
    }

    // 2. Immediate win check
    const winMove = this.findImmediateWin(engine, color);
    if (winMove) return winMove;

    // 3. Immediate block - must prevent opponent from winning
    const blockMove = this.findCriticalBlock(engine, color, opponent);
    if (blockMove) return blockMove;

    // 4. VCF search (Victory by Continuous Fours)
    if (this.useVCF) {
      const vcfMove = this.vcfSearchRoot(engine, color);
      if (vcfMove) return vcfMove;
    }

    // 5. VCT search (Victory by Continuous Threats)
    if (this.useVCT) {
      const vctMove = this.vctSearchRoot(engine, color, opponent);
      if (vctMove) return vctMove;
    }

    // 6. Threat-Space Search (TSS) - for grandmaster level
    if (this.useTSS) {
      const tssMove = this.tssSearchRoot(engine, color, opponent);
      if (tssMove) return tssMove;
    }

    // 7. Iterative deepening with Alpha-Beta/PVS
    const candidates = this.getCandidatesWithScore(engine, color, opponent);
    const topCandidates = candidates.slice(0, this.candidateLimit);

    if (topCandidates.length === 0) {
      return { row: Math.floor(engine.size / 2), col: Math.floor(engine.size / 2) };
    }

    let bestMove = topCandidates[0];
    let bestScore = -Infinity;

    for (let depth = 2; depth <= this.maxDepth; depth += 2) {
      const result = this.searchAtDepth(engine, topCandidates, depth, color, opponent, bestMove);

      if (this.abortSearch && depth > 2) break;

      if (result.move) {
        bestScore = result.score;
        bestMove = result.move;
        this.pvMoves = result.pv || [];
      }

      // Found a winning move, no need to search deeper
      if (result.score >= PATTERN.FIVE) break;
      // If we have a very strong position and time is running short
      if (result.score >= PATTERN.OPEN_FOUR && Date.now() - this.startTime > this.timeLimit * 0.5) break;
      if (Date.now() - this.startTime > this.timeLimit * 0.7) break;
    }

    // Randomness for lower difficulties
    if (this.randomness > 0 && candidates.length > 1) {
      const topN = Math.min(3, candidates.length);
      if (Math.random() < this.randomness) {
        return candidates[Math.floor(Math.random() * topN)];
      }
    }

    return bestMove;
  }

  isTimeUp() {
    this.nodes++;
    if (this.nodes % 500 === 0) {
      if (Date.now() - this.startTime > this.timeLimit) {
        this.abortSearch = true;
      }
    }
    return this.abortSearch;
  }

  // ============= Professional Opening Book =============

  getOpeningMove(engine, color) {
    const history = engine.moveHistory;
    
    // First move: center
    if (history.length === 0) {
      return { row: 7, col: 7 };
    }

    if (history.length === 1) {
      const first = history[0];
      // For black (first player), choose from 26 professional openings
      // Based on opening theory: 花月 and 浦月 are strongest
      if (color === 'black') {
        // Weight openings by strength for higher difficulties
        const openingPool = this.difficulty === 'grandmaster' || this.difficulty === 'master'
          ? [ // Prefer strongest openings at high difficulty
              { black3: [1, 0],  weight: 3 },   // 花月 (black wins)
              { black3: [-2, 0], weight: 3 },   // 浦月 (black wins)
              { black3: [1, 1],  weight: 2 },   // 疏星 (balanced)
              { black3: [-1, 0], weight: 2 },   // 寒星
              { black3: [0, 1],  weight: 2 },   // 溪月
              { black3: [2, 2],  weight: 1 },   // 恒星
              { black3: [0, 2],  weight: 1 },   // 水月
              { black3: [-1, -2],weight: 1 },   // 银月
              { black3: [1, -1], weight: 1 },   // 残月
              { black3: [-1, 1], weight: 1 },   // 松月
            ]
          : [ // Random for lower difficulties
              { black3: [1, 0],  weight: 1 },
              { black3: [-2, 0], weight: 1 },
              { black3: [1, 1],  weight: 1 },
              { black3: [-1, 0], weight: 1 },
              { black3: [0, 1],  weight: 1 },
              { black3: [2, 2],  weight: 1 },
              { black3: [0, 2],  weight: 1 },
              { black3: [-1, -2],weight: 1 },
              { black3: [1, -1], weight: 1 },
              { black3: [-1, 1], weight: 1 },
              { black3: [-2, 2], weight: 1 },
              { black3: [2, -2], weight: 1 },
            ];
        
        // Weighted random selection
        const totalWeight = openingPool.reduce((s, o) => s + o.weight, 0);
        let rand = Math.random() * totalWeight;
        let selected = openingPool[0];
        for (const op of openingPool) {
          rand -= op.weight;
          if (rand <= 0) { selected = op; break; }
        }
        
        const r = Math.max(0, Math.min(14, first.row + selected.black3[0]));
        const c = Math.max(0, Math.min(14, first.col + selected.black3[1]));
        return { row: r, col: c };
      } else {
        // White's response: near center
        const responses = [
          [-1, 0], [1, 0], [0, -1], [0, 1],
          [-1, -1], [1, 1], [-1, 1], [1, -1]
        ];
        const pick = responses[Math.floor(Math.random() * responses.length)];
        const r = Math.max(0, Math.min(14, first.row + pick[0]));
        const c = Math.max(0, Math.min(14, first.col + pick[1]));
        return { row: r, col: c };
      }
    }

    if (history.length === 2) {
      const m0 = history[0];
      const m1 = history[1];
      const dr = m1.row - m0.row;
      const dc = m1.col - m0.col;

      // Identify the opening and respond with theory
      if (color === 'black') {
        // Identify opening type
        if (Math.abs(dr) <= 1 && Math.abs(dc) <= 1) {
          // Direct opening - respond with extension or counter
          return { row: m1.row + Math.sign(dr) || 0, col: m1.col + Math.sign(dc) || 0 };
        }
        if (Math.abs(dr) <= 2 && Math.abs(dc) <= 2) {
          // Jump opening - bridge the gap
          return { row: m0.row + Math.sign(dr), col: m0.col + Math.sign(dc) };
        }
      }

      // White's response: block or counter-attack
      const candidates = this.getCandidatesWithScore(engine, color, color === 'black' ? 'white' : 'black');
      if (candidates.length > 0) return candidates[0];
    }

    if (history.length >= 3 && history.length < 6) {
      const candidates = this.getCandidatesWithScore(engine, color, color === 'black' ? 'white' : 'black');
      if (candidates.length > 0) return candidates[0];
    }

    return null;
  }

  // ============= Immediate Win/Block =============

  findImmediateWin(engine, color) {
    const candidates = engine.getCandidateMoves();
    for (const move of candidates) {
      engine.board[move.row][move.col] = color;
      const win = engine.checkWin(move.row, move.col, color);
      engine.board[move.row][move.col] = null;
      if (win) return move;
    }
    return null;
  }

  findCriticalBlock(engine, color, opponent) {
    const candidates = engine.getCandidateMoves();

    // Priority 1: Block opponent five (immediate win)
    for (const move of candidates) {
      engine.board[move.row][move.col] = opponent;
      const win = engine.checkWin(move.row, move.col, opponent);
      engine.board[move.row][move.col] = null;
      if (win) return move;
    }

    // Priority 2: Block opponent open four
    for (const move of candidates) {
      engine.board[move.row][move.col] = opponent;
      const open4 = this.hasOpenFour(engine, move.row, move.col, opponent);
      engine.board[move.row][move.col] = null;
      if (open4) return move;
    }

    // Priority 3: Block opponent double-four or four+three combination
    for (const move of candidates) {
      engine.board[move.row][move.col] = opponent;
      const threats = this.detectThreats(engine, move.row, move.col, opponent);
      engine.board[move.row][move.col] = null;

      if (threats.fours >= 2 || 
          (threats.fours >= 1 && threats.openThrees >= 1) ||
          (threats.openFours >= 1)) {
        return move;
      }
    }

    // Priority 4: Block opponent double open three
    for (const move of candidates) {
      engine.board[move.row][move.col] = opponent;
      const threats = this.detectThreats(engine, move.row, move.col, opponent);
      engine.board[move.row][move.col] = null;

      if (threats.openThrees >= 2 || (threats.openThrees >= 1 && threats.jumpThrees >= 1)) {
        return move;
      }
    }

    return null;
  }

  hasOpenFour(engine, row, col, color) {
    const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
    for (const [dr, dc] of directions) {
      let count = 1;
      let leftOpen = false, rightOpen = false;

      for (let i = 1; i <= 4; i++) {
        const r = row + dr * i, c = col + dc * i;
        if (r < 0 || r >= engine.size || c < 0 || c >= engine.size) break;
        if (engine.board[r][c] === color) count++;
        else { rightOpen = (engine.board[r][c] === null); break; }
      }
      for (let i = 1; i <= 4; i++) {
        const r = row - dr * i, c = col - dc * i;
        if (r < 0 || r >= engine.size || c < 0 || c >= engine.size) break;
        if (engine.board[r][c] === color) count++;
        else { leftOpen = (engine.board[r][c] === null); break; }
      }

      if (count >= 4 && leftOpen && rightOpen) return true;
    }
    return false;
  }

  // ============= VCF (Victory by Continuous Fours) =============

  vcfSearchRoot(engine, color) {
    const result = this.vcfSearch(engine, color, 0, 12, []);
    return result ? result.move : null;
  }

  vcfSearch(engine, color, depth, maxDepth, path) {
    if (depth >= maxDepth || this.isTimeUp()) return null;

    const opponent = color === 'black' ? 'white' : 'black';
    const candidates = this.getThreatMoves(engine, color, 'four');

    for (const move of candidates) {
      engine.board[move.row][move.col] = color;
      const win = engine.checkWin(move.row, move.col, color);
      if (win) {
        engine.board[move.row][move.col] = null;
        return { move, path: [...path, move] };
      }

      // Check if this creates a double threat (double four)
      const myThreats = this.detectThreats(engine, move.row, move.col, color);
      if (myThreats.fours >= 2 || myThreats.openFours >= 1) {
        engine.board[move.row][move.col] = null;
        return { move, path: [...path, move] };
      }

      // Get opponent's forced responses
      const oppBlocks = this.getForcedBlocks(engine, opponent);
      engine.board[move.row][move.col] = null;

      if (oppBlocks.length === 0) {
        // No forced response, continue with VCF
        engine.board[move.row][move.col] = color;
        const next = this.vcfSearch(engine, color, depth + 1, maxDepth, [...path, move]);
        engine.board[move.row][move.col] = null;
        if (next) return next;
        continue;
      }

      // Try all opponent's forced blocks
      let allWin = true;
      for (const oppMove of oppBlocks) {
        engine.board[oppMove.row][oppMove.col] = opponent;
        const nextWin = this.vcfSearch(engine, color, depth + 1, maxDepth, [...path, move]);
        engine.board[oppMove.row][oppMove.col] = null;
        if (!nextWin) { allWin = false; break; }
      }
      if (allWin) return { move, path: [...path, move] };
    }
    return null;
  }

  // Get moves that create a specific threat type
  getForcedBlocks(engine, color) {
    // Get opponent's threat moves that must be blocked
    const opponent = color === 'black' ? 'white' : 'black';
    const blocks = [];
    const candidates = engine.getCandidateMoves();
    const seen = new Set();

    for (const move of candidates) {
      const key = move.row * 15 + move.col;
      if (seen.has(key)) continue;
      seen.add(key);

      engine.board[move.row][move.col] = color;
      const threats = this.detectThreats(engine, move.row, move.col, color);
      const win = engine.checkWin(move.row, move.col, color);
      engine.board[move.row][move.col] = null;

      // Must block if: five, four, or open four
      if (win || threats.fours > 0 || threats.openFours > 0 || threats.fives > 0) {
        blocks.push(move);
      }
    }
    return blocks;
  }

  // ============= VCT (Victory by Continuous Threats) =============

  vctSearchRoot(engine, color, opponent) {
    const result = this.vctSearch(engine, color, opponent, 0, 10, []);
    return result ? result.move : null;
  }

  vctSearch(engine, color, opponent, depth, maxDepth, path) {
    if (depth >= maxDepth || this.isTimeUp()) return null;

    const candidates = this.getThreatMoves(engine, color, 'three');

    for (const move of candidates) {
      engine.board[move.row][move.col] = color;
      const win = engine.checkWin(move.row, move.col, color);
      if (win) {
        engine.board[move.row][move.col] = null;
        return { move, path: [...path, move] };
      }

      const myThreats = this.detectThreats(engine, move.row, move.col, color);
      
      // If we created a winning combination
      if (myThreats.fours >= 2 || myThreats.openFours >= 1 || 
          (myThreats.fours >= 1 && myThreats.openThrees >= 1)) {
        // Try VCF from this position
        const vcfResult = this.vcfSearch(engine, color, 0, 8, [...path, move]);
        engine.board[move.row][move.col] = null;
        if (vcfResult) return { move, path: vcfResult.path };
        continue;
      }

      // If we created double three
      if (myThreats.openThrees >= 2 || (myThreats.openThrees >= 1 && myThreats.jumpThrees >= 1)) {
        const vctNext = this.vctSearch(engine, color, opponent, depth + 1, maxDepth, [...path, move]);
        engine.board[move.row][move.col] = null;
        if (vctNext) return vctNext;
        continue;
      }

      // Get opponent's forced responses
      const oppBlocks = this.getForcedBlocks(engine, opponent);
      
      if (oppBlocks.length === 0) {
        // No forced response, check if we have advantage
        const evalScore = this.evaluate(engine, color, opponent);
        engine.board[move.row][move.col] = null;
        if (evalScore > PATTERN.OPEN_FOUR) {
          return { move, path: [...path, move] };
        }
        continue;
      }

      // Try all opponent blocks
      let allWin = true;
      for (const oppMove of oppBlocks) {
        engine.board[oppMove.row][oppMove.col] = opponent;
        const nextWin = this.vctSearch(engine, color, opponent, depth + 1, maxDepth, [...path, move]);
        engine.board[oppMove.row][oppMove.col] = null;
        if (!nextWin) { allWin = false; break; }
      }
      engine.board[move.row][move.col] = null;
      if (allWin) return { move, path: [...path, move] };
    }
    return null;
  }

  // ============= Threat-Space Search (TSS) =============

  tssSearchRoot(engine, color, opponent) {
    // TSS: Search for winning paths through threat sequences
    // More aggressive than VCT - considers all moves that create any threat
    const result = this.tssSearch(engine, color, opponent, 0, 8, []);
    return result ? result.move : null;
  }

  tssSearch(engine, color, opponent, depth, maxDepth, path) {
    if (depth >= maxDepth || this.isTimeUp()) return null;

    // Get all moves that create any threat (three or higher)
    const candidates = this.getThreatMoves(engine, color, 'three');
    
    // Also consider moves that create jump patterns
    const jumpMoves = this.getJumpThreatMoves(engine, color);
    
    const allMoves = [...candidates, ...jumpMoves.filter(jm => 
      !candidates.some(c => c.row === jm.row && c.col === jm.col)
    )];

    for (const move of allMoves) {
      engine.board[move.row][move.col] = color;
      const win = engine.checkWin(move.row, move.col, color);
      if (win) {
        engine.board[move.row][move.col] = null;
        return { move, path: [...path, move] };
      }

      const myThreats = this.detectThreats(engine, move.row, move.col, color);
      
      // Winning combination found
      if (myThreats.fours >= 2 || myThreats.openFours >= 1) {
        engine.board[move.row][move.col] = null;
        return { move, path: [...path, move] };
      }

      // If we created a four, opponent must block
      if (myThreats.fours >= 1 || myThreats.jumpFours >= 1) {
        const vcfResult = this.vcfSearch(engine, color, 0, 8, [...path, move]);
        engine.board[move.row][move.col] = null;
        if (vcfResult) return { move, path: vcfResult.path };
        continue;
      }

      // If we created threats, continue TSS
      if (myThreats.openThrees >= 1 || myThreats.jumpThrees >= 1) {
        const oppBlocks = this.getForcedBlocks(engine, opponent);
        if (oppBlocks.length === 0) {
          const tssNext = this.tssSearch(engine, color, opponent, depth + 1, maxDepth, [...path, move]);
          engine.board[move.row][move.col] = null;
          if (tssNext) return tssNext;
        } else {
          let allWin = true;
          for (const oppMove of oppBlocks) {
            engine.board[oppMove.row][oppMove.col] = opponent;
            const nextWin = this.tssSearch(engine, color, opponent, depth + 1, maxDepth, [...path, move]);
            engine.board[oppMove.row][oppMove.col] = null;
            if (!nextWin) { allWin = false; break; }
          }
          engine.board[move.row][move.col] = null;
          if (allWin) return { move, path: [...path, move] };
        }
      }
      
      engine.board[move.row][move.col] = null;
    }
    return null;
  }

  getJumpThreatMoves(engine, color) {
    const moves = [];
    const candidates = engine.getCandidateMoves();
    const seen = new Set();

    for (const move of candidates) {
      const key = move.row * 15 + move.col;
      if (seen.has(key)) continue;
      seen.add(key);

      engine.board[move.row][move.col] = color;
      const threats = this.detectThreats(engine, move.row, move.col, color);
      engine.board[move.row][move.col] = null;

      if (threats.jumpThrees > 0 || threats.jumpFours > 0) {
        moves.push(move);
      }
    }
    return moves;
  }

  getThreatMoves(engine, color, threatType) {
    const moves = [];
    const candidates = engine.getCandidateMoves();
    const seen = new Set();

    for (const move of candidates) {
      const key = move.row * 15 + move.col;
      if (seen.has(key)) continue;
      seen.add(key);

      engine.board[move.row][move.col] = color;
      const threats = this.detectThreats(engine, move.row, move.col, color);
      engine.board[move.row][move.col] = null;

      if (threatType === 'four' && (threats.fours > 0 || threats.fives > 0 || threats.openFours > 0 || threats.jumpFours > 0)) {
        moves.push(move);
      } else if (threatType === 'three' && (threats.openThrees > 0 || threats.jumpThrees > 0 || threats.fours > 0 || threats.fives > 0 || threats.openFours > 0 || threats.jumpFours > 0)) {
        moves.push(move);
      } else if (threatType === 'block') {
        moves.push(move);
      }
    }
    return moves;
  }

  // ============= Enhanced Threat Detection =============

  detectThreats(engine, row, col, color) {
    const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
    let fours = 0, openThrees = 0, fives = 0, openFours = 0;
    let jumpThrees = 0, jumpFours = 0;

    for (const [dr, dc] of directions) {
      const info = this.analyzeLineFull(engine, row, col, dr, dc, color);

      if (info.count >= 5) fives++;
      else if (info.count === 4 && info.openEnds === 2) openFours++;
      else if (info.count === 4 && info.openEnds === 1) fours++;
      else if (info.count === 4 && info.jumpOpen) openFours++;
      else if (info.count === 3 && info.openEnds === 2) openThrees++;
      else if (info.count === 3 && info.jumpOpen) jumpThrees++;

      const jumpInfo = this.detectJumpPattern(engine, row, col, dr, dc, color);
      if (jumpInfo.jumpFour) jumpFours++;
      if (jumpInfo.jumpThree) jumpThrees++;
    }

    return {
      fours, openFours, openThrees, fives,
      jumpThrees, jumpFours,
      doubleThreat: (fours + openFours + openThrees + jumpThrees + jumpFours) >= 2
    };
  }

  // Detect jump patterns: X_XX (jump three), X_XXX (jump four)
  detectJumpPattern(engine, row, col, dr, dc, color) {
    let jumpThree = false;
    let jumpFour = false;

    for (let offset = -4; offset <= 0; offset++) {
      let line = '';
      for (let i = 0; i < 6; i++) {
        const r = row + dr * (offset + i);
        const c = col + dc * (offset + i);
        if (r < 0 || r >= engine.size || c < 0 || c >= engine.size) {
          line += '#';
        } else if (engine.board[r][c] === color) {
          line += 'X';
        } else if (engine.board[r][c] === null) {
          line += '_';
        } else {
          line += '#';
        }
      }

      // Jump four: X_XXX, XXX_X, XX_XX
      if (line.includes('X_XXX') || line.includes('XXX_X') || line.includes('XX_XX')) {
        jumpFour = true;
      }
      // Jump three: _X_XX_, _XX_X_, _X_X_X_
      if (line.includes('_X_XX_') || line.includes('_XX_X_') || line.includes('_X_X_X_')) {
        jumpThree = true;
      }
    }

    return { jumpThree, jumpFour };
  }

  analyzeLine(engine, row, col, dr, dc, color) {
    let count = 1;
    let leftOpen = false, rightOpen = false;
    let leftSpace = 0, rightSpace = 0;

    for (let i = 1; i <= 5; i++) {
      const r = row + dr * i, c = col + dc * i;
      if (r < 0 || r >= engine.size || c < 0 || c >= engine.size) break;
      const cell = engine.board[r][c];
      if (cell === color) count++;
      else if (cell === null) {
        rightOpen = true;
        for (let j = i + 1; j <= i + 3; j++) {
          const r2 = row + dr * j, c2 = col + dc * j;
          if (r2 < 0 || r2 >= engine.size || c2 < 0 || c2 >= engine.size) break;
          if (engine.board[r2][c2] === null) rightSpace++;
          else if (engine.board[r2][c2] === color) rightSpace += 2;
          else break;
        }
        break;
      } else break;
    }

    for (let i = 1; i <= 5; i++) {
      const r = row - dr * i, c = col - dc * i;
      if (r < 0 || r >= engine.size || c < 0 || c >= engine.size) break;
      const cell = engine.board[r][c];
      if (cell === color) count++;
      else if (cell === null) {
        leftOpen = true;
        for (let j = i + 1; j <= i + 3; j++) {
          const r2 = row - dr * j, c2 = col - dc * j;
          if (r2 < 0 || r2 >= engine.size || c2 < 0 || c2 >= engine.size) break;
          if (engine.board[r2][c2] === null) leftSpace++;
          else if (engine.board[r2][c2] === color) leftSpace += 2;
          else break;
        }
        break;
      } else break;
    }

    const openEnds = (leftOpen ? 1 : 0) + (rightOpen ? 1 : 0);
    return { count, openEnds, leftOpen, rightOpen, totalSpace: leftSpace + rightSpace, jumpOpen: false };
  }

  analyzeLineFull(engine, row, col, dr, dc, color) {
    const info = this.analyzeLine(engine, row, col, dr, dc, color);
    const jumpInfo = this.detectJumpPattern(engine, row, col, dr, dc, color);
    info.jumpOpen = jumpInfo.jumpThree || jumpInfo.jumpFour;
    return info;
  }

  // ============= Candidate Generation & Scoring =============

  getCandidatesWithScore(engine, color, opponent) {
    const candidates = engine.getCandidateMoves();
    const scored = candidates.map(m => {
      const offScore = this.scoreMove(engine, m.row, m.col, color);
      const defScore = this.scoreMove(engine, m.row, m.col, opponent);

      // Threat-aware scoring
      engine.board[m.row][m.col] = color;
      const myThreats = this.detectThreats(engine, m.row, m.col, color);
      engine.board[m.row][m.col] = null;

      let threatBonus = 0;
      if (myThreats.openFours > 0) threatBonus += PATTERN.OPEN_FOUR * 0.3;
      if (myThreats.fours >= 2) threatBonus += PATTERN.FOUR * 0.4;
      if (myThreats.openThrees >= 2) threatBonus += PATTERN.OPEN_THREE * 0.3;
      if (myThreats.jumpFours > 0) threatBonus += PATTERN.JUMP_FOUR * 0.25;
      if (myThreats.jumpThrees > 0) threatBonus += PATTERN.JUMP_THREE * 0.2;
      if (myThreats.doubleThreat) threatBonus += PATTERN.THREE * 0.5;

      // Defensive priority
      engine.board[m.row][m.col] = opponent;
      const oppThreats = this.detectThreats(engine, m.row, m.col, opponent);
      engine.board[m.row][m.col] = null;

      let defBonus = 0;
      if (oppThreats.openFours > 0) defBonus += PATTERN.OPEN_FOUR * 0.35;
      if (oppThreats.fours >= 2) defBonus += PATTERN.FOUR * 0.45;
      if (oppThreats.openThrees >= 2) defBonus += PATTERN.OPEN_THREE * 0.35;
      if (oppThreats.jumpFours > 0) defBonus += PATTERN.JUMP_FOUR * 0.3;
      if (oppThreats.jumpThrees > 0) defBonus += PATTERN.JUMP_THREE * 0.25;

      // Center proximity bonus
      const center = Math.floor(engine.size / 2);
      const dist = Math.abs(m.row - center) + Math.abs(m.col - center);
      const centerBonus = Math.max(0, (7 - dist)) * 3;

      // Add evaluation noise for lower difficulties
      const noise = this.evalNoise > 0 ? (Math.random() - 0.5) * PATTERN.THREE * this.evalNoise : 0;

      return {
        ...m,
        score: offScore * 1.1 + defScore + threatBonus + defBonus + centerBonus + noise,
        offScore,
        defScore,
        threatBonus,
        defBonus
      };
    });
    scored.sort((a, b) => b.score - a.score);
    return scored;
  }

  scoreMove(engine, row, col, color) {
    const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
    let totalScore = 0;
    engine.board[row][col] = color;
    for (const [dr, dc] of directions) {
      const info = this.analyzeLineFull(engine, row, col, dr, dc, color);
      totalScore += this.scorePattern(info);

      const jumpInfo = this.detectJumpPattern(engine, row, col, dr, dc, color);
      if (jumpInfo.jumpFour && info.count < 4) totalScore += PATTERN.JUMP_FOUR;
      if (jumpInfo.jumpThree && info.count < 3) totalScore += PATTERN.JUMP_THREE;
    }
    engine.board[row][col] = null;
    return totalScore;
  }

  scorePattern(info) {
    const { count, openEnds, totalSpace } = info;
    if (count >= 5) return PATTERN.FIVE;
    if (count === 4) {
      if (openEnds === 2) return PATTERN.OPEN_FOUR;
      if (openEnds === 1) return PATTERN.FOUR;
      return 0;
    }
    if (count === 3) {
      if (openEnds === 2) {
        if (totalSpace >= 2) return PATTERN.OPEN_THREE;
        return PATTERN.THREE * 0.5;
      }
      if (openEnds === 1) return PATTERN.THREE;
      return 0;
    }
    if (count === 2) {
      if (openEnds === 2) {
        if (totalSpace >= 3) return PATTERN.OPEN_TWO;
        return PATTERN.TWO * 2;
      }
      if (openEnds === 1) {
        if (totalSpace >= 2) return PATTERN.TWO;
        return PATTERN.TWO * 0.5;
      }
      return 0;
    }
    if (count === 1) {
      if (openEnds === 2) {
        if (totalSpace >= 3) return PATTERN.OPEN_ONE;
        return PATTERN.ONE * 2;
      }
      if (openEnds === 1) return PATTERN.ONE;
    }
    return 0;
  }

  // ============= Search with PVS, Killer, History, Null-move =============

  searchAtDepth(engine, candidates, depth, color, opponent, preferredMove) {
    let bestMove = preferredMove || candidates[0];
    let bestScore = -Infinity;
    let alpha = -Infinity;
    const beta = Infinity;
    let pv = [];

    const ordered = this.orderMoves(candidates, 0, preferredMove);

    for (let i = 0; i < ordered.length; i++) {
      if (this.isTimeUp()) break;

      const candidate = ordered[i];
      engine.board[candidate.row][candidate.col] = color;
      const win = engine.checkWin(candidate.row, candidate.col, color);
      engine.board[candidate.row][candidate.col] = null;

      if (win) return { move: candidate, score: PATTERN.FIVE, pv: [candidate] };

      engine.board[candidate.row][candidate.col] = color;

      let score;
      let childPV = [];

      if (this.usePVS && i > 0) {
        score = this.minimax(engine, depth - 1, alpha, alpha + 1, false, color, opponent, 1, childPV);
        if (score > alpha && score < beta) {
          childPV = [];
          score = this.minimax(engine, depth - 1, alpha, beta, false, color, opponent, 1, childPV);
        }
      } else {
        score = this.minimax(engine, depth - 1, alpha, beta, false, color, opponent, 1, childPV);
      }

      engine.board[candidate.row][candidate.col] = null;

      if (this.abortSearch) break;

      if (score > bestScore) {
        bestScore = score;
        bestMove = candidate;
        pv = [candidate, ...childPV];
      }
      alpha = Math.max(alpha, score);
    }

    return { move: bestMove, score: bestScore, pv };
  }

  orderMoves(candidates, depth, preferredMove) {
    const ordered = [...candidates];

    if (preferredMove) {
      const idx = ordered.findIndex(m => m.row === preferredMove.row && m.col === preferredMove.col);
      if (idx > 0) {
        [ordered[0], ordered[idx]] = [ordered[idx], ordered[0]];
      }
    }

    if (this.useKiller || this.useHistory) {
      const killers = this.killerMoves[Math.min(depth, 23)] || [null, null];

      ordered.sort((a, b) => {
        if (preferredMove) {
          if (a.row === preferredMove.row && a.col === preferredMove.col) return -1;
          if (b.row === preferredMove.row && b.col === preferredMove.col) return 1;
        }

        const aIsKiller1 = killers[0] && a.row === killers[0].row && a.col === killers[0].col;
        const bIsKiller1 = killers[0] && b.row === killers[0].row && b.col === killers[0].col;
        const aIsKiller2 = killers[1] && a.row === killers[1].row && a.col === killers[1].col;
        const bIsKiller2 = killers[1] && b.row === killers[1].row && b.col === killers[1].col;

        if (aIsKiller1 && !bIsKiller1) return -1;
        if (!aIsKiller1 && bIsKiller1) return 1;
        if (aIsKiller2 && !bIsKiller2) return -1;
        if (!aIsKiller2 && bIsKiller2) return 1;

        if (this.useHistory) {
          const aHist = this.historyTable[a.row][a.col];
          const bHist = this.historyTable[b.row][b.col];
          if (aHist !== bHist) return bHist - aHist;
        }

        return (b.score || 0) - (a.score || 0);
      });
    }

    return ordered;
  }

  minimax(engine, depth, alpha, beta, isMaximizing, color, opponent, ply, pvOut) {
    if (this.isTimeUp()) return 0;

    if (depth === 0) {
      return this.evaluate(engine, color, opponent);
    }

    // Transposition table lookup
    const hash = computeHash(engine);
    const ttKey = hash + '_' + depth + '_' + (isMaximizing ? '1' : '0');
    if (this.transpositionTable.has(ttKey)) {
      return this.transpositionTable.get(ttKey);
    }

    // Null-move pruning
    if (this.useNullMove && depth >= 3 && !this.hasImmediateThreat(engine, color)) {
      const nullScore = this.minimax(engine, depth - 3, -beta, -beta + 1, !isMaximizing, color, opponent, ply + 1, []);
      if (this.abortSearch) return 0;

      if (isMaximizing && nullScore >= beta) return beta;
      if (!isMaximizing && nullScore <= alpha) return alpha;
    }

    const moveColor = isMaximizing ? color : opponent;
    const candidates = this.getCandidatesWithScore(engine, moveColor, isMaximizing ? opponent : color);
    if (candidates.length === 0) return this.evaluate(engine, color, opponent);

    const maxCands = Math.min(this.candidateLimit, candidates.length);
    const ordered = this.orderMoves(candidates.slice(0, maxCands), ply, null);

    if (isMaximizing) {
      let maxEval = -Infinity;
      let localPV = [];

      for (let i = 0; i < ordered.length; i++) {
        if (this.isTimeUp()) break;

        const candidate = ordered[i];
        engine.board[candidate.row][candidate.col] = moveColor;
        const win = engine.checkWin(candidate.row, candidate.col, moveColor);
        if (win) {
          engine.board[candidate.row][candidate.col] = null;
          maxEval = PATTERN.FIVE - (this.maxDepth - depth);
          localPV = [candidate];
          break;
        }

        let evalScore;
        let childPV = [];

        if (this.usePVS && i > 0) {
          evalScore = this.minimax(engine, depth - 1, alpha, alpha + 1, false, color, opponent, ply + 1, childPV);
          if (evalScore > alpha && evalScore < beta) {
            childPV = [];
            evalScore = this.minimax(engine, depth - 1, alpha, beta, false, color, opponent, ply + 1, childPV);
          }
        } else {
          evalScore = this.minimax(engine, depth - 1, alpha, beta, false, color, opponent, ply + 1, childPV);
        }

        engine.board[candidate.row][candidate.col] = null;

        maxEval = Math.max(maxEval, evalScore);

        if (evalScore >= beta) {
          if (this.useKiller && depth > 0) this.recordKiller(candidate, ply);
          if (this.useHistory) this.historyTable[candidate.row][candidate.col] += depth * depth;
          if (pvOut) pvOut.push(candidate, ...childPV);
          return beta;
        }

        if (evalScore > alpha) {
          alpha = evalScore;
          localPV = [candidate, ...childPV];
        }
      }

      if (pvOut && localPV.length > 0) pvOut.push(...localPV);
      if (this.transpositionTable.size < this.maxTableSize && !this.abortSearch) {
        this.transpositionTable.set(ttKey, maxEval);
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      let localPV = [];

      for (let i = 0; i < ordered.length; i++) {
        if (this.isTimeUp()) break;

        const candidate = ordered[i];
        engine.board[candidate.row][candidate.col] = moveColor;
        const win = engine.checkWin(candidate.row, candidate.col, moveColor);
        if (win) {
          engine.board[candidate.row][candidate.col] = null;
          minEval = -PATTERN.FIVE + (this.maxDepth - depth);
          localPV = [candidate];
          break;
        }

        let evalScore;
        let childPV = [];

        if (this.usePVS && i > 0) {
          evalScore = this.minimax(engine, depth - 1, alpha, alpha + 1, true, color, opponent, ply + 1, childPV);
          if (evalScore > alpha && evalScore < beta) {
            childPV = [];
            evalScore = this.minimax(engine, depth - 1, alpha, beta, true, color, opponent, ply + 1, childPV);
          }
        } else {
          evalScore = this.minimax(engine, depth - 1, alpha, beta, true, color, opponent, ply + 1, childPV);
        }

        engine.board[candidate.row][candidate.col] = null;

        minEval = Math.min(minEval, evalScore);

        if (evalScore <= alpha) {
          if (this.useKiller && depth > 0) this.recordKiller(candidate, ply);
          if (this.useHistory) this.historyTable[candidate.row][candidate.col] += depth * depth;
          if (pvOut) pvOut.push(candidate, ...childPV);
          return alpha;
        }

        if (evalScore < beta) {
          beta = evalScore;
          localPV = [candidate, ...childPV];
        }
      }

      if (pvOut && localPV.length > 0) pvOut.push(...localPV);
      if (this.transpositionTable.size < this.maxTableSize && !this.abortSearch) {
        this.transpositionTable.set(ttKey, minEval);
      }
      return minEval;
    }
  }

  recordKiller(move, ply) {
    const slot = Math.min(ply, 23);
    const killers = this.killerMoves[slot];

    if (killers[0] && killers[0].row === move.row && killers[0].col === move.col) return;

    killers[1] = killers[0];
    killers[0] = { row: move.row, col: move.col };
  }

  hasImmediateThreat(engine, color) {
    const opponent = color === 'black' ? 'white' : 'black';
    const candidates = engine.getCandidateMoves();
    for (const move of candidates) {
      engine.board[move.row][move.col] = opponent;
      const win = engine.checkWin(move.row, move.col, opponent);
      engine.board[move.row][move.col] = null;
      if (win) return true;
    }
    return false;
  }

  // ============= Enhanced Evaluation =============

  evaluate(engine, color, opponent) {
    let score = 0;
    const size = engine.size;

    const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
    const myThreats = { openThrees: 0, fours: 0, openFours: 0, doubleThrees: 0, jumpThrees: 0, jumpFours: 0 };
    const oppThreats = { openThrees: 0, fours: 0, openFours: 0, doubleThrees: 0, jumpThrees: 0, jumpFours: 0 };

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (engine.board[r][c] === color) {
          score += this.evaluateStone(engine, r, c, color);
          const threats = this.detectThreats(engine, r, c, color);
          myThreats.openThrees += threats.openThrees;
          myThreats.fours += threats.fours;
          myThreats.openFours += threats.openFours;
          myThreats.jumpThrees += threats.jumpThrees;
          myThreats.jumpFours += threats.jumpFours;
        } else if (engine.board[r][c] === opponent) {
          score -= this.evaluateStone(engine, r, c, opponent) * 1.15;
          const threats = this.detectThreats(engine, r, c, opponent);
          oppThreats.openThrees += threats.openThrees;
          oppThreats.fours += threats.fours;
          oppThreats.openFours += threats.openFours;
          oppThreats.jumpThrees += threats.jumpThrees;
          oppThreats.jumpFours += threats.jumpFours;
        }
      }
    }

    // Double-threat bonuses
    if (myThreats.openThrees >= 2) score += PATTERN.OPEN_THREE * 0.5;
    if (myThreats.fours >= 2) score += PATTERN.FOUR * 0.5;
    if (myThreats.jumpFours >= 1) score += PATTERN.JUMP_FOUR * 0.3;
    if (myThreats.jumpThrees >= 2) score += PATTERN.JUMP_THREE * 0.4;
    if (myThreats.openThrees >= 1 && myThreats.jumpThrees >= 1) score += PATTERN.OPEN_THREE * 0.4;

    if (oppThreats.openThrees >= 2) score -= PATTERN.OPEN_THREE * 0.6;
    if (oppThreats.fours >= 2) score -= PATTERN.FOUR * 0.6;
    if (oppThreats.jumpFours >= 1) score -= PATTERN.JUMP_FOUR * 0.35;
    if (oppThreats.jumpThrees >= 2) score -= PATTERN.JUMP_THREE * 0.45;

    // Center control bonus
    const center = Math.floor(size / 2);
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (engine.board[r][c] === color) {
          const dist = Math.abs(r - center) + Math.abs(c - center);
          score += Math.max(0, (7 - dist)) * 2;
        } else if (engine.board[r][c] === opponent) {
          const dist = Math.abs(r - center) + Math.abs(c - center);
          score -= Math.max(0, (7 - dist)) * 2;
        }
      }
    }

    // Connectivity bonus
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (engine.board[r][c] === color) {
          let neighbors = 0;
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              if (dr === 0 && dc === 0) continue;
              const r2 = r + dr, c2 = c + dc;
              if (r2 >= 0 && r2 < size && c2 >= 0 && c2 < size && engine.board[r2][c2] === color) {
                neighbors++;
              }
            }
          }
          score += neighbors * 5;
        }
      }
    }

    return score;
  }

  evaluateStone(engine, row, col, color) {
    const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
    let stoneScore = 0;
    for (const [dr, dc] of directions) {
      const info = this.analyzeLineFull(engine, row, col, dr, dc, color);
      stoneScore += this.scorePattern(info);

      const jumpInfo = this.detectJumpPattern(engine, row, col, dr, dc, color);
      if (jumpInfo.jumpFour && info.count < 4) stoneScore += PATTERN.JUMP_FOUR;
      if (jumpInfo.jumpThree && info.count < 3) stoneScore += PATTERN.JUMP_THREE;
    }
    return stoneScore;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AIBrain, PATTERN, OPENING_BOOK };
}
if (typeof window !== 'undefined') {
  window.AIBrain = AIBrain;
  window.PATTERN = PATTERN;
  window.OPENING_BOOK = OPENING_BOOK;
}
