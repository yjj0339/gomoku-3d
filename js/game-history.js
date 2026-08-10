/**
 * Gomoku 3D - Game History System
 * Saves completed games to localStorage with full move records
 * Supports replay, statistics, and game review
 */

class GameHistory {
  constructor() {
    this.STORAGE_KEY = 'gomoku_history';
    this.MAX_GAMES = 200;
  }

  // Save a completed game
  saveGame(gameData) {
    const games = this.getAllGames();

    const record = {
      id: Date.now(),
      date: new Date().toISOString(),
      mode: gameData.mode || 'ai',
      difficulty: gameData.difficulty || 'medium',
      winner: gameData.winner,
      moves: gameData.moves || [],
      totalMoves: (gameData.moves || []).length,
      myColor: gameData.myColor || 'black',
      playerNames: gameData.playerNames || {},
      theme: gameData.theme || 'marble',
      duration: gameData.duration || 0,
      result: this.getResultText(gameData)
    };

    games.unshift(record);

    // Keep only max games
    if (games.length > this.MAX_GAMES) {
      games.length = this.MAX_GAMES;
    }

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(games));
    } catch (e) {
      console.warn('Failed to save game history:', e);
    }

    return record;
  }

  // Get all saved games
  getAllGames() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  // Get a specific game by ID
  getGame(id) {
    const games = this.getAllGames();
    return games.find(g => g.id === id);
  }

  // Delete a game
  deleteGame(id) {
    const games = this.getAllGames();
    const filtered = games.filter(g => g.id !== id);
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
    } catch (e) {
      console.warn('Failed to delete game:', e);
    }
  }

  // Clear all history
  clearAll() {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to clear history:', e);
    }
  }

  // Get statistics
  getStats() {
    const games = this.getAllGames();
    const stats = {
      total: games.length,
      wins: 0,
      losses: 0,
      draws: 0,
      byMode: { ai: 0, local: 0, online: 0 },
      byDifficulty: { easy: 0, medium: 0, hard: 0, master: 0, grandmaster: 0 },
      winRate: 0,
      avgMoves: 0,
      recentTrend: []
    };

    let totalMoves = 0;
    for (const g of games) {
      stats.byMode[g.mode] = (stats.byMode[g.mode] || 0) + 1;
      if (g.difficulty) stats.byDifficulty[g.difficulty] = (stats.byDifficulty[g.difficulty] || 0) + 1;
      totalMoves += g.totalMoves || 0;

      if (g.winner === 'draw') {
        stats.draws++;
      } else if (g.mode === 'ai') {
        if (g.winner === g.myColor) stats.wins++;
        else stats.losses++;
      } else {
        if (g.winner === 'black') stats.wins++;
        else stats.losses++;
      }
    }

    stats.winRate = stats.total > 0 ? Math.round((stats.wins / (stats.wins + stats.losses)) * 100) : 0;
    stats.avgMoves = stats.total > 0 ? Math.round(totalMoves / stats.total) : 0;

    // Recent trend (last 10 games)
    stats.recentTrend = games.slice(0, 10).map(g => ({
      result: g.winner === 'draw' ? 'draw' : (g.mode === 'ai' ? (g.winner === g.myColor ? 'win' : 'lose') : (g.winner === 'black' ? 'win' : 'lose')),
      mode: g.mode
    }));

    return stats;
  }

  getResultText(gameData) {
    if (gameData.winner === 'draw') return '平局';
    if (gameData.mode === 'ai') {
      return gameData.winner === gameData.myColor ? '胜利' : '失败';
    }
    return gameData.winner === 'black' ? '黑胜' : '白胜';
  }

  // Format date for display
  formatDate(isoDate) {
    const d = new Date(isoDate);
    const now = new Date();
    const diff = now - d;

    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前';
    if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前';
    if (diff < 604800000) return Math.floor(diff / 86400000) + '天前';

    const month = d.getMonth() + 1;
    const day = d.getDate();
    const hour = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${month}/${day} ${hour}:${min}`;
  }

  // Convert move to standard notation
  moveToNotation(move) {
    const cols = 'ABCDEFGHIJKLMNO';
    const row = 15 - move.row;
    const col = cols[move.col] || '?';
    return `${col}${row}`;
  }

  // Get move list in notation
  getMoveNotation(moves) {
    return moves.map((m, i) => {
      const notation = this.moveToNotation(m);
      const color = m.color === 'black' ? '黑' : '白';
      return { num: i + 1, color, notation, row: m.row, col: m.col };
    });
  }
}

if (typeof window !== 'undefined') {
  window.GameHistory = GameHistory;
}
