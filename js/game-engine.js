/**
 * Gomoku 3D - Game Engine v6.0
 * Core game logic: rules, win detection, move management
 * + Renju forbidden moves (double-three, double-four, overline)
 * + Open three / open four detection
 * + Direction-based pattern counting
 * + Threat-space helpers for AI
 */

class GameEngine {
  constructor(size = 15) {
    this.size = size;
    this.reset();
  }

  reset() {
    this.board = Array(this.size).fill(null).map(() => Array(this.size).fill(null));
    this.currentTurn = 'black';
    this.moveHistory = [];
    this.winner = null;
    this.winLine = null;
    this.state = 'playing';
    this.forbiddenMoves = []; // Cached forbidden positions for current turn
  }

  isValidMove(row, col) {
    if (this.state !== 'playing') return false;
    if (row < 0 || row >= this.size || col < 0 || col >= this.size) return false;
    if (this.board[row][col] !== null) return false;
    return true;
  }

  makeMove(row, col, color) {
    if (!this.isValidMove(row, col)) return { success: false };
    if (color && color !== this.currentTurn) return { success: false };

    const moveColor = color || this.currentTurn;

    // Check forbidden moves for black (Renju rule)
    if (moveColor === 'black' && this.isForbiddenMove(row, col, moveColor)) {
      return { success: false, forbidden: true };
    }

    this.board[row][col] = moveColor;
    this.moveHistory.push({ row, col, color: moveColor });

    const winResult = this.checkWin(row, col, moveColor);
    if (winResult) {
      this.winner = moveColor;
      this.winLine = winResult;
      this.state = 'ended';
    } else if (this.moveHistory.length === this.size * this.size) {
      this.winner = 'draw';
      this.state = 'ended';
    } else {
      this.currentTurn = this.currentTurn === 'black' ? 'white' : 'black';
    }

    return { success: true, winner: this.winner, winLine: this.winLine };
  }

  checkWin(row, col, color) {
    const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];

    for (const [dr, dc] of directions) {
      const line = [{ row, col }];

      for (let i = 1; i < 5; i++) {
        const r = row + dr * i;
        const c = col + dc * i;
        if (r < 0 || r >= this.size || c < 0 || c >= this.size) break;
        if (this.board[r][c] !== color) break;
        line.push({ row: r, col: c });
      }

      for (let i = 1; i < 5; i++) {
        const r = row - dr * i;
        const c = col - dc * i;
        if (r < 0 || r >= this.size || c < 0 || c >= this.size) break;
        if (this.board[r][c] !== color) break;
        line.unshift({ row: r, col: c });
      }

      // For black, exact 5 wins but 6+ is overline (forbidden in strict Renju)
      if (color === 'black' && line.length > 5) {
        // Overline - in standard rules this is a win, in Renju it's forbidden
        // We treat it as a win for casual play, AI handles Renju separately
        return line.slice(0, 5);
      }
      if (line.length >= 5) {
        return line.slice(0, 5);
      }
    }
    return null;
  }

  // ==================== RENJU FORBIDDEN MOVES ====================

  /**
   * Check if placing a black stone at (row, col) creates a forbidden pattern.
   * Forbidden patterns: double-three, double-four, overline (6+).
   * Only applies to black in standard Renju rules.
   */
  isForbiddenMove(row, col, color) {
    if (color !== 'black') return false;

    // Temporarily place the stone
    this.board[row][col] = color;

    // Check overline (6 or more in a row)
    if (this.hasOverline(row, col, color)) {
      this.board[row][col] = null;
      return true;
    }

    // Check if it's a winning five (five wins overrides forbidden)
    if (this.hasExactFive(row, col, color)) {
      this.board[row][col] = null;
      return false; // Five is a win, not forbidden
    }

    // Count active threes and fours
    const threes = this.countActiveThrees(row, col, color);
    const fours = this.countActiveFours(row, col, color);

    // Double-three: two or more active threes
    if (threes >= 2) {
      this.board[row][col] = null;
      return true;
    }

    // Double-four: two or more fours (active or not)
    if (fours >= 2) {
      this.board[row][col] = null;
      return true;
    }

    this.board[row][col] = null;
    return false;
  }

  hasOverline(row, col, color) {
    const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
    for (const [dr, dc] of directions) {
      let count = 1;
      for (let i = 1; i <= 5; i++) {
        const r = row + dr * i, c = col + dc * i;
        if (r < 0 || r >= this.size || c < 0 || c >= this.size) break;
        if (this.board[r][c] !== color) break;
        count++;
      }
      for (let i = 1; i <= 5; i++) {
        const r = row - dr * i, c = col - dc * i;
        if (r < 0 || r >= this.size || c < 0 || c >= this.size) break;
        if (this.board[r][c] !== color) break;
        count++;
      }
      if (count >= 6) return true;
    }
    return false;
  }

  hasExactFive(row, col, color) {
    const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
    for (const [dr, dc] of directions) {
      let count = 1;
      for (let i = 1; i <= 4; i++) {
        const r = row + dr * i, c = col + dc * i;
        if (r < 0 || r >= this.size || c < 0 || c >= this.size) break;
        if (this.board[r][c] !== color) break;
        count++;
      }
      for (let i = 1; i <= 4; i++) {
        const r = row - dr * i, c = col - dc * i;
        if (r < 0 || r >= this.size || c < 0 || c >= this.size) break;
        if (this.board[r][c] !== color) break;
        count++;
      }
      if (count === 5) return true;
    }
    return false;
  }

  /**
   * Count active "three" patterns formed at (row, col).
   * An active three (活三) can become an open four (冲四) with one more move.
   * Pattern: _XXX_ or _X_XX_ or _XX_X_ (with both ends open)
   */
  countActiveThrees(row, col, color) {
    const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
    let count = 0;

    for (const [dr, dc] of directions) {
      if (this.isLineActiveThree(row, col, dr, dc, color)) {
        count++;
      }
    }
    return count;
  }

  isLineActiveThree(row, col, dr, dc, color) {
    // Get the line string centered at (row, col)
    const line = this.getLineString(row, col, dr, dc, 4, color);
    // Active three patterns: _OOO_ or _O_OO_ or _OO_O_
    const opponent = color === 'black' ? 'white' : 'black';
    const patterns = [
      /_.OOO._/g,
      /_O\.OO._/g,
      /_OO\.O._/g
    ];
    // Convert line: own stones -> O, empty -> ., opponent/boundary -> #
    const converted = line.replace(new RegExp(color.charAt(0), 'g'), 'O');
    for (const p of patterns) {
      if (p.test(converted)) return true;
    }
    return false;
  }

  /**
   * Count "four" patterns (open or closed) formed at (row, col).
   * A four can become five with one more move.
   * Patterns: XOOOO_, _OOOOX, _OOO_O_, _O_OOO_, etc.
   */
  countActiveFours(row, col, color) {
    const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
    let count = 0;

    for (const [dr, dc] of directions) {
      if (this.isLineFour(row, col, dr, dc, color)) {
        count++;
      }
    }
    return count;
  }

  isLineFour(row, col, dr, dc, color) {
    const line = this.getLineString(row, col, dr, dc, 5, color);
    // Four patterns: OOOO_ or _OOOO or OO_OO or O_OOO or OOO_O
    const patterns = [
      /OOOO\./, /\.OOOO/,
      /OO\.OO/, /O\.OOO/, /OOO\.O/,
      /OOOOO/  // Five counts as four for this check
    ];
    return patterns.some(p => p.test(line));
  }

  /**
   * Get a string representation of a line around (row, col).
   * Uses first char of color name: 'b' for black, 'w' for white, '.' for empty, '#' for boundary/opponent
   */
  getLineString(row, col, dr, dc, range, focusColor) {
    let str = '';
    for (let i = -range; i <= range; i++) {
      const r = row + dr * i;
      const c = col + dc * i;
      if (r < 0 || r >= this.size || c < 0 || c >= this.size) {
        str += '#';
      } else if (this.board[r][c] === null) {
        str += '.';
      } else {
        str += this.board[r][c].charAt(0);
      }
    }
    return str;
  }

  // ==================== THREAT DETECTION ====================

  /**
   * Detect open three (活三) at position - for AI threat assessment.
   * Returns positions that would create an open four.
   */
  detectOpenThree(color) {
    const threats = [];
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (this.board[r][c] !== null) continue;
        this.board[r][c] = color;
        if (this.countActiveThrees(r, c, color) > 0) {
          threats.push({ row: r, col: c, type: 'open3' });
        }
        this.board[r][c] = null;
      }
    }
    return threats;
  }

  /**
   * Detect four (冲四) threats - positions that could become five.
   */
  detectFour(color) {
    const threats = [];
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (this.board[r][c] !== null) continue;
        this.board[r][c] = color;
        if (this.hasExactFive(r, c, color) || this.isLineFour(r, c, 0, 1, color) || 
            this.isLineFour(r, c, 1, 0, color) || this.isLineFour(r, c, 1, 1, color) ||
            this.isLineFour(r, c, 1, -1, color)) {
          threats.push({ row: r, col: c, type: 'four' });
        }
        this.board[r][c] = null;
      }
    }
    return threats;
  }

  /**
   * Check for VCF (Victory by Continuous Four) - a forced win sequence.
   * Simple version: checks if any four threat leads to a guaranteed five.
   */
  hasVCFThreat(color, depth = 5) {
    if (depth <= 0) return false;
    const fours = this.detectFour(color);
    for (const move of fours) {
      this.board[move.row][move.col] = color;
      const win = this.checkWin(move.row, move.col, color);
      if (win) {
        this.board[move.row][move.col] = null;
        return true;
      }
      // Check if opponent can block all threats
      const opponentFours = this.detectFour(color === 'black' ? 'white' : 'black');
      if (opponentFours.length === 0) {
        const opponentBlocks = this.detectFour(color === 'black' ? 'white' : 'black');
        // Simplified: if we still have four threats after opponent blocks
        if (this.hasVCFThreat(color, depth - 1)) {
          this.board[move.row][move.col] = null;
          return true;
        }
      }
      this.board[move.row][move.col] = null;
    }
    return false;
  }

  /**
   * Get all forbidden positions for the current turn (for UI highlighting).
   */
  getForbiddenPositions(color) {
    if (color !== 'black') return [];
    const positions = [];
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (this.board[r][c] === null && this.isForbiddenMove(r, c, color)) {
          positions.push({ row: r, col: c });
        }
      }
    }
    return positions;
  }

  // ==================== ORIGINAL METHODS ====================

  undo(steps = 1) {
    if (this.moveHistory.length === 0) return false;
    for (let i = 0; i < steps && this.moveHistory.length > 0; i++) {
      const move = this.moveHistory.pop();
      this.board[move.row][move.col] = null;
    }
    const lastMove = this.moveHistory[this.moveHistory.length - 1];
    this.currentTurn = lastMove ? (lastMove.color === 'black' ? 'white' : 'black') : 'black';
    this.state = 'playing';
    this.winner = null;
    this.winLine = null;
    return true;
  }

  getBoard() {
    return this.board;
  }

  getStone(row, col) {
    if (row < 0 || row >= this.size || col < 0 || col >= this.size) return null;
    return this.board[row][col];
  }

  hasNeighbor(row, col, range = 2) {
    for (let dr = -range; dr <= range; dr++) {
      for (let dc = -range; dc <= range; dc++) {
        if (dr === 0 && dc === 0) continue;
        const r = row + dr;
        const c = col + dc;
        if (r >= 0 && r < this.size && c >= 0 && c < this.size && this.board[r][c] !== null) {
          return true;
        }
      }
    }
    return false;
  }

  // Get empty positions that have neighbors (for AI efficiency)
  getCandidateMoves() {
    const candidates = [];
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (this.board[r][c] === null && this.hasNeighbor(r, c)) {
          candidates.push({ row: r, col: c });
        }
      }
    }
    if (candidates.length === 0) {
      candidates.push({ row: Math.floor(this.size / 2), col: Math.floor(this.size / 2) });
    }
    return candidates;
  }

  // Evaluate a line segment for scoring
  evaluateLine(row, col, dr, dc, color) {
    let count = 1;
    let blocked = 0;
    let leftOpen = false;
    let rightOpen = false;

    // Forward
    for (let i = 1; i <= 4; i++) {
      const r = row + dr * i;
      const c = col + dc * i;
      if (r < 0 || r >= this.size || c < 0 || c >= this.size) {
        blocked++;
        break;
      }
      if (this.board[r][c] === color) {
        count++;
      } else if (this.board[r][c] === null) {
        rightOpen = true;
        break;
      } else {
        blocked++;
        break;
      }
    }

    // Backward
    for (let i = 1; i <= 4; i++) {
      const r = row - dr * i;
      const c = col - dc * i;
      if (r < 0 || r >= this.size || c < 0 || c >= this.size) {
        blocked++;
        break;
      }
      if (this.board[r][c] === color) {
        count++;
      } else if (this.board[r][c] === null) {
        leftOpen = true;
        break;
      } else {
        blocked++;
        break;
      }
    }

    // Score
    if (count >= 5) return 1000000;
    const openEnds = (leftOpen ? 1 : 0) + (rightOpen ? 1 : 0);

    if (count === 4) {
      if (openEnds === 2) return 50000;
      if (openEnds === 1) return 10000;
    }
    if (count === 3) {
      if (openEnds === 2) return 5000;
      if (openEnds === 1) return 500;
    }
    if (count === 2) {
      if (openEnds === 2) return 200;
      if (openEnds === 1) return 50;
    }
    if (count === 1) {
      if (openEnds === 2) return 10;
      if (openEnds === 1) return 2;
    }
    return 0;
  }

  // Score a position for a given color
  scorePosition(row, col, color) {
    let score = 0;
    const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
    for (const [dr, dc] of directions) {
      score += this.evaluateLine(row, col, dr, dc, color);
    }
    return score;
  }

  clone() {
    const cloned = new GameEngine(this.size);
    cloned.board = this.board.map(row => [...row]);
    cloned.currentTurn = this.currentTurn;
    cloned.moveHistory = [...this.moveHistory];
    cloned.winner = this.winner;
    cloned.winLine = this.winLine;
    cloned.state = this.state;
    return cloned;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = GameEngine;
}
if (typeof window !== 'undefined') {
  window.GameEngine = GameEngine;
}
