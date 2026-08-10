/**
 * Gomoku 3D - Game Engine
 * Core game logic: rules, win detection, move management
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

      if (line.length >= 5) {
        return line.slice(0, 5);
      }
    }
    return null;
  }

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
