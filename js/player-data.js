/**
 * Player Data, Achievements, and Analytics System for Gomoku 3D
 * Production-quality module with localStorage persistence
 * @version 1.0.0
 */

(function(global) {
  'use strict';

  // ─── Utility Helpers ──────────────────────────────────────────────────

  const STORAGE_KEYS = {
    PLAYER_DATA: 'gomoku_player_data_v1',
    ACHIEVEMENTS: 'gomoku_achievements_v1',
    ANALYTICS: 'gomoku_analytics_v1',
    DAILY_CHALLENGES: 'gomoku_daily_challenges_v1',
    SESSION_GAMES: 'gomoku_session_games_v1'
  };

  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

  function todayStr() {
    return new Date().toISOString().split('T')[0];
  }

  function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function mergeDefaults(target, defaults) {
    const result = deepClone(defaults);
    for (const key in target) {
      if (target.hasOwnProperty(key)) {
        if (typeof target[key] === 'object' && target[key] !== null && !Array.isArray(target[key])) {
          result[key] = mergeDefaults(target[key], result[key] || {});
        } else {
          result[key] = target[key];
        }
      }
    }
    return result;
  }

  // ─── ELO Constants ─────────────────────────────────────────────────────

  const ELO = {
    INITIAL: 1500,
    K_FACTOR_DEFAULT: 32,
    K_FACTOR_NEWBIE: 40,      // < 30 games
    K_FACTOR_MASTER: 16,      // > 2400 ELO
    K_FACTOR_GRANDMASTER: 10, // > 2500 ELO
    MIN_RATING: 100,
    MAX_RATING: 3500,
    NEWBIE_GAMES_THRESHOLD: 30
  };

  const AI_DIFFICULTY_RATINGS = {
    easy: 800,
    medium: 1200,
    hard: 1600,
    expert: 1900,
    master: 2200,
    grandmaster: 2500
  };

  // ─── PlayerData Class ─────────────────────────────────────────────────

  class PlayerData {
    constructor() {
      this._data = this._load();
      this._ensureDefaults();
      this._migrateIfNeeded();
    }

    // ─── Persistence ──────────────────────────────────────────────────────

    _load() {
      try {
        const raw = localStorage.getItem(STORAGE_KEYS.PLAYER_DATA);
        return raw ? JSON.parse(raw) : {};
      } catch (e) {
        console.warn('[PlayerData] Failed to load from localStorage:', e);
        return {};
      }
    }

    _save() {
      try {
        localStorage.setItem(STORAGE_KEYS.PLAYER_DATA, JSON.stringify(this._data));
      } catch (e) {
        console.warn('[PlayerData] Failed to save to localStorage:', e);
      }
    }

    _ensureDefaults() {
      const defaults = {
        version: 1,
        createdAt: new Date().toISOString(),
        playerName: 'Player',
        playerId: uuid(),

        // ELO
        elo: ELO.INITIAL,
        peakElo: ELO.INITIAL,
        eloHistory: [],

        // Stats per mode: ai | local | online
        stats: {
          ai:     { wins: 0, losses: 0, draws: 0, games: 0, bestStreak: 0, currentStreak: 0 },
          local:  { wins: 0, losses: 0, draws: 0, games: 0, bestStreak: 0, currentStreak: 0 },
          online: { wins: 0, losses: 0, draws: 0, games: 0, bestStreak: 0, currentStreak: 0 }
        },

        // Opening preferences
        openings: {},

        // Timing
        totalTimePlayed: 0,     // seconds
        totalMovesMade: 0,
        moveTimes: [],          // array of seconds per move (last 1000)
        gameDurations: [],      // array of seconds per game (last 500)

        // Accuracy & analysis
        totalMistakes: 0,
        totalBlunders: 0,
        totalInaccuracies: 0,
        totalMissedWins: 0,
        totalMissedBlocks: 0,

        // XP / Level system
        xp: 0,
        level: 1,
        xpHistory: [],

        // Challenges
        dailyChallenges: {},
        lastChallengeReset: todayStr(),

        // Sessions
        sessionStats: {
          gamesToday: 0,
          winsToday: 0,
          bestStreakToday: 0,
          currentStreakToday: 0,
          lastPlayedDate: todayStr()
        },

        // Social / Misc
        friends: [],
        blockedPlayers: [],
        preferredSettings: {},

        // Meta
        totalGames: 0,
        firstWin: false,
        firstOnlineWin: false,
        tutorialCompleted: false,
        spectateCount: 0
      };

      this._data = mergeDefaults(this._data, defaults);
    }

    _migrateIfNeeded() {
      if (!this._data.version || this._data.version < 1) {
        this._data.version = 1;
      }
    }

    // ─── ELO Rating System ──────────────────────────────────────────────

    _getKFactor() {
      const games = this._data.totalGames;
      const rating = this._data.elo;
      if (games < ELO.NEWBIE_GAMES_THRESHOLD) return ELO.K_FACTOR_NEWBIE;
      if (rating >= 2500) return ELO.K_FACTOR_GRANDMASTER;
      if (rating >= 2400) return ELO.K_FACTOR_MASTER;
      return ELO.K_FACTOR_DEFAULT;
    }

    _expectedScore(myRating, opponentRating) {
      return 1 / (1 + Math.pow(10, (opponentRating - myRating) / 400));
    }

    /**
     * Calculate ELO change for a game result.
     * @param {number} myRating   - Current ELO (or null to use stored)
     * @param {number} opponentRating - Opponent ELO (or AI difficulty rating)
     * @param {number} result     - 1 = win, 0.5 = draw, 0 = loss
     * @returns {Object} { newRating, delta, kFactor }
     */
    calculateEloChange(opponentRating, result, myRating = null) {
      const currentRating = myRating !== null ? myRating : this._data.elo;
      const k = this._getKFactor();
      const expected = this._expectedScore(currentRating, opponentRating);
      const delta = Math.round(k * (result - expected));
      const newRating = clamp(currentRating + delta, ELO.MIN_RATING, ELO.MAX_RATING);
      return { newRating, delta, kFactor: k, expected };
    }

    /**
     * Record a rated game and update ELO.
     */
    recordRatedGame(opponentRating, result, gameMeta = {}) {
      const change = this.calculateEloChange(opponentRating, result);
      this._data.elo = change.newRating;
      if (change.newRating > this._data.peakElo) {
        this._data.peakElo = change.newRating;
      }
      this._data.eloHistory.push({
        date: new Date().toISOString(),
        oldRating: change.newRating - change.delta,
        newRating: change.newRating,
        delta: change.delta,
        opponentRating,
        result,
        mode: gameMeta.mode || 'unknown',
        gameId: gameMeta.gameId || uuid()
      });
      if (this._data.eloHistory.length > 1000) {
        this._data.eloHistory = this._data.eloHistory.slice(-1000);
      }
      this._save();
      return change;
    }

    getElo() { return this._data.elo; }
    getPeakElo() { return this._data.peakElo; }
    getEloHistory() { return deepClone(this._data.eloHistory); }

    // ─── Win/Loss/Draw Tracking ─────────────────────────────────────────

    recordGame(mode, result, meta = {}) {
      const validModes = ['ai', 'local', 'online'];
      if (!validModes.includes(mode)) {
        throw new Error(`Invalid mode "${mode}". Must be one of: ${validModes.join(', ')}`);
      }

      const stats = this._data.stats[mode];
      stats.games++;
      this._data.totalGames++;

      if (result === 'win') {
        stats.wins++;
        stats.currentStreak = stats.currentStreak >= 0 ? stats.currentStreak + 1 : 1;
        if (stats.currentStreak > stats.bestStreak) {
          stats.bestStreak = stats.currentStreak;
        }
        if (!this._data.firstWin) this._data.firstWin = true;
        if (mode === 'online' && !this._data.firstOnlineWin) this._data.firstOnlineWin = true;

        // XP gain
        const xpGain = this._calculateXpGain(mode, meta);
        this.addXp(xpGain);

      } else if (result === 'loss') {
        stats.losses++;
        stats.currentStreak = stats.currentStreak <= 0 ? stats.currentStreak - 1 : -1;

      } else if (result === 'draw') {
        stats.draws++;
        stats.currentStreak = 0;
        this.addXp(5); // small XP for draw

      } else {
        throw new Error(`Invalid result "${result}". Must be: win, loss, or draw`);
      }

      // Update overall best streak
      const currentStreakAbs = Math.abs(stats.currentStreak);
      if (currentStreakAbs > this._data.stats[mode].bestStreak) {
        this._data.stats[mode].bestStreak = currentStreakAbs;
      }

      // Record rated game if applicable
      if (meta.opponentRating !== undefined && meta.rated !== false) {
        const resultNum = result === 'win' ? 1 : (result === 'draw' ? 0.5 : 0);
        this.recordRatedGame(meta.opponentRating, resultNum, { mode, gameId: meta.gameId });
      }

      // AI difficulty-specific stats
      if (mode === 'ai' && meta.difficulty) {
        if (!this._data.aiDifficultyStats) this._data.aiDifficultyStats = {};
        const diff = meta.difficulty;
        if (!this._data.aiDifficultyStats[diff]) {
          this._data.aiDifficultyStats[diff] = { wins: 0, losses: 0, draws: 0, games: 0 };
        }
        this._data.aiDifficultyStats[diff].games++;
        this._data.aiDifficultyStats[diff][result === 'win' ? 'wins' : (result === 'loss' ? 'losses' : 'draws')]++;
      }

      // Session tracking
      this._updateSessionStats(result);

      // Game duration
      if (meta.duration) {
        this.recordGameDuration(meta.duration);
      }

      // Opening tracking
      if (meta.opening) {
        this.recordOpening(meta.opening, result);
      }

      // Move accuracy
      if (meta.accuracy) {
        this.recordAccuracy(meta.accuracy);
      }

      // Move times
      if (meta.moveTimes && Array.isArray(meta.moveTimes)) {
        meta.moveTimes.forEach(t => this.recordMoveTime(t));
      }

      this._save();
      return this.getStats(mode);
    }

    _updateSessionStats(result) {
      const today = todayStr();
      if (this._data.sessionStats.lastPlayedDate !== today) {
        this._data.sessionStats = {
          gamesToday: 0,
          winsToday: 0,
          bestStreakToday: 0,
          currentStreakToday: 0,
          lastPlayedDate: today
        };
      }
      this._data.sessionStats.gamesToday++;
      if (result === 'win') {
        this._data.sessionStats.winsToday++;
        this._data.sessionStats.currentStreakToday++;
        if (this._data.sessionStats.currentStreakToday > this._data.sessionStats.bestStreakToday) {
          this._data.sessionStats.bestStreakToday = this._data.sessionStats.currentStreakToday;
        }
      } else if (result === 'loss') {
        this._data.sessionStats.currentStreakToday = 0;
      }
    }

    _calculateXpGain(mode, meta) {
      let base = 10;
      if (mode === 'ai') base = 15;
      if (mode === 'online') base = 25;

      // Difficulty bonus
      const diffBonus = { easy: 0, medium: 5, hard: 15, expert: 25, master: 40, grandmaster: 60 };
      if (meta.difficulty && diffBonus[meta.difficulty] !== undefined) {
        base += diffBonus[meta.difficulty];
      }

      // Speed bonus
      if (meta.moves && meta.moves < 20) base += 10;
      if (meta.duration && meta.duration < 60) base += 5;

      // Streak bonus
      const streak = this._data.stats[mode].currentStreak;
      if (streak >= 3) base += streak * 2;

      // Comeback bonus
      if (meta.comeback) base += 20;

      // Perfect game bonus
      if (meta.perfect) base += 30;

      return base;
    }

    getStats(mode = null) {
      if (mode) {
        const s = this._data.stats[mode];
        return {
          mode,
          wins: s.wins,
          losses: s.losses,
          draws: s.draws,
          games: s.games,
          winRate: s.games > 0 ? (s.wins / s.games * 100).toFixed(1) : '0.0',
          bestStreak: s.bestStreak,
          currentStreak: s.currentStreak
        };
      }
      const total = {
        wins: 0, losses: 0, draws: 0, games: 0,
        bestStreak: 0, currentStreak: 0
      };
      for (const m of ['ai', 'local', 'online']) {
        const s = this._data.stats[m];
        total.wins += s.wins;
        total.losses += s.losses;
        total.draws += s.draws;
        total.games += s.games;
        if (s.bestStreak > total.bestStreak) total.bestStreak = s.bestStreak;
      }
      total.winRate = total.games > 0 ? (total.wins / total.games * 100).toFixed(1) : '0.0';
      return {
        total,
        ai: this.getStats('ai'),
        local: this.getStats('local'),
        online: this.getStats('online'),
        aiDifficultyStats: deepClone(this._data.aiDifficultyStats || {})
      };
    }

    // ─── Opening Statistics ───────────────────────────────────────────────

    recordOpening(openingName, result) {
      if (!this._data.openings[openingName]) {
        this._data.openings[openingName] = { wins: 0, losses: 0, draws: 0, games: 0 };
      }
      const o = this._data.openings[openingName];
      o.games++;
      if (result === 'win') o.wins++;
      else if (result === 'loss') o.losses++;
      else if (result === 'draw') o.draws++;
      this._save();
    }

    getOpeningStats() {
      const stats = {};
      for (const name in this._data.openings) {
        const o = this._data.openings[name];
        stats[name] = {
          ...o,
          winRate: o.games > 0 ? (o.wins / o.games * 100).toFixed(1) : '0.0'
        };
      }
      return stats;
    }

    getPreferredOpenings(limit = 5) {
      const entries = Object.entries(this.getOpeningStats());
      entries.sort((a, b) => b[1].games - a[1].games);
      return entries.slice(0, limit).map(([name, stats]) => ({ name, ...stats }));
    }

    // ─── Game Duration ────────────────────────────────────────────────────

    recordGameDuration(seconds) {
      if (seconds > 0 && seconds < 86400) {
        this._data.gameDurations.push(seconds);
        if (this._data.gameDurations.length > 500) {
          this._data.gameDurations = this._data.gameDurations.slice(-500);
        }
        this._data.totalTimePlayed += seconds;
        this._save();
      }
    }

    getAverageGameDuration() {
      const arr = this._data.gameDurations;
      if (arr.length === 0) return 0;
      return Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
    }

    getTotalTimePlayed() {
      return this._data.totalTimePlayed;
    }

    getFormattedTotalTime() {
      const s = this._data.totalTimePlayed;
      const h = Math.floor(s / 3600);
      const m = Math.floor((s % 3600) / 60);
      return `${h}h ${m}m`;
    }

    // ─── Move Accuracy Analysis ─────────────────────────────────────────

    recordAccuracy(analysis) {
      if (analysis.mistakes) this._data.totalMistakes += analysis.mistakes;
      if (analysis.blunders) this._data.totalBlunders += analysis.blunders;
      if (analysis.inaccuracies) this._data.totalInaccuracies += analysis.inaccuracies;
      if (analysis.missedWins) this._data.totalMissedWins += analysis.missedWins;
      if (analysis.missedBlocks) this._data.totalMissedBlocks += analysis.missedBlocks;
      this._save();
    }

    getAccuracyStats() {
      const totalGames = this._data.totalGames;
      return {
        totalMistakes: this._data.totalMistakes,
        totalBlunders: this._data.totalBlunders,
        totalInaccuracies: this._data.totalInaccuracies,
        totalMissedWins: this._data.totalMissedWins,
        totalMissedBlocks: this._data.totalMissedBlocks,
        mistakesPerGame: totalGames > 0 ? (this._data.totalMistakes / totalGames).toFixed(2) : '0.00',
        blundersPerGame: totalGames > 0 ? (this._data.totalBlunders / totalGames).toFixed(2) : '0.00',
        accuracyScore: this._calculateAccuracyScore()
      };
    }

    _calculateAccuracyScore() {
      const total = this._data.totalGames;
      if (total === 0) return 100;
      const penalty = this._data.totalBlunders * 3 + this._data.totalMistakes * 1.5 + this._data.totalInaccuracies * 0.5;
      return clamp(Math.round(100 - (penalty / total) * 2), 0, 100);
    }

    // ─── Time Per Move ────────────────────────────────────────────────────

    recordMoveTime(seconds) {
      if (seconds >= 0 && seconds < 3600) {
        this._data.moveTimes.push(seconds);
        this._data.totalMovesMade++;
        if (this._data.moveTimes.length > 1000) {
          this._data.moveTimes = this._data.moveTimes.slice(-1000);
        }
        this._save();
      }
    }

    getAverageMoveTime() {
      const arr = this._data.moveTimes;
      if (arr.length === 0) return 0;
      return (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1);
    }

    getMoveTimePercentile(p = 0.5) {
      const arr = [...this._data.moveTimes].sort((a, b) => a - b);
      if (arr.length === 0) return 0;
      const idx = Math.floor(arr.length * p);
      return arr[idx];
    }

    // ─── Best Win Streak ────────────────────────────────────────────────

    getBestWinStreak(mode = null) {
      if (mode) return this._data.stats[mode].bestStreak;
      return Math.max(
        this._data.stats.ai.bestStreak,
        this._data.stats.local.bestStreak,
        this._data.stats.online.bestStreak
      );
    }

    getCurrentStreak(mode = null) {
      if (mode) return this._data.stats[mode].currentStreak;
      return {
        ai: this._data.stats.ai.currentStreak,
        local: this._data.stats.local.currentStreak,
        online: this._data.stats.online.currentStreak
      };
    }

    // ─── XP / Level Progression ─────────────────────────────────────────

    getXpForLevel(level) {
      return Math.floor(100 * Math.pow(level, 1.8));
    }

    addXp(amount) {
      if (amount <= 0) return { levelUp: false };
      const oldLevel = this._data.level;
      this._data.xp += amount;
      this._data.xpHistory.push({
        date: new Date().toISOString(),
        amount,
        reason: 'game'
      });
      if (this._data.xpHistory.length > 500) {
        this._data.xpHistory = this._data.xpHistory.slice(-500);
      }

      while (this._data.xp >= this.getXpForLevel(this._data.level + 1)) {
        this._data.level++;
      }
      this._save();
      return {
        levelUp: this._data.level > oldLevel,
        oldLevel,
        newLevel: this._data.level,
        xpGained: amount,
        totalXp: this._data.xp,
        xpToNext: this.getXpToNextLevel()
      };
    }

    getXpToNextLevel() {
      const next = this.getXpForLevel(this._data.level + 1);
      return next - this._data.xp;
    }

    getLevelProgress() {
      const currentLevelXp = this.getXpForLevel(this._data.level);
      const nextLevelXp = this.getXpForLevel(this._data.level + 1);
      const progress = this._data.xp - currentLevelXp;
      const total = nextLevelXp - currentLevelXp;
      return {
        level: this._data.level,
        xp: this._data.xp,
        currentLevelXp,
        nextLevelXp,
        xpToNext: nextLevelXp - this._data.xp,
        percentage: total > 0 ? Math.round((progress / total) * 100) : 100
      };
    }

    // ─── Daily Challenges ─────────────────────────────────────────────────

    resetDailyChallenges() {
      const today = todayStr();
      if (this._data.lastChallengeReset === today) return false;

      const challenges = this._generateDailyChallenges();
      this._data.dailyChallenges = {};
      challenges.forEach((c, i) => {
        this._data.dailyChallenges[`challenge_${i}`] = { ...c, progress: 0, completed: false, claimed: false };
      });
      this._data.lastChallengeReset = today;
      this._save();
      return true;
    }

    _generateDailyChallenges() {
      const pool = [
        { id: 'win_1', description: 'Win 1 game', target: 1, type: 'wins', reward: 20 },
        { id: 'win_3', description: 'Win 3 games', target: 3, type: 'wins', reward: 50 },
        { id: 'win_ai', description: 'Win against AI', target: 1, type: 'ai_wins', reward: 15 },
        { id: 'win_online', description: 'Win an online game', target: 1, type: 'online_wins', reward: 30 },
        { id: 'play_5', description: 'Play 5 games', target: 5, type: 'games', reward: 25 },
        { id: 'fast_win', description: 'Win in under 30 moves', target: 1, type: 'fast_win', reward: 40 },
        { id: 'no_mistakes', description: 'Win without mistakes', target: 1, type: 'perfect_win', reward: 50 },
        { id: 'streak_2', description: 'Win 2 in a row', target: 2, type: 'streak', reward: 25 },
        { id: 'opening_variety', description: 'Use 2 different openings', target: 2, type: 'openings', reward: 20 },
        { id: 'spectate', description: 'Spectate 1 online game', target: 1, type: 'spectate', reward: 10 }
      ];
      // Shuffle and pick 3
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
      return pool.slice(0, 3);
    }

    getDailyChallenges() {
      this.resetDailyChallenges();
      return deepClone(this._data.dailyChallenges);
    }

    updateChallengeProgress(type, amount = 1) {
      this.resetDailyChallenges();
      let updated = false;
      for (const key in this._data.dailyChallenges) {
        const c = this._data.dailyChallenges[key];
        if (c.completed || c.claimed) continue;
        if (c.type === type || (type === 'win' && c.type === 'wins') || (type === 'win' && c.type === 'ai_wins') || (type === 'win' && c.type === 'online_wins')) {
          c.progress += amount;
          if (c.progress >= c.target) {
            c.progress = c.target;
            c.completed = true;
          }
          updated = true;
        }
      }
      if (updated) this._save();
      return updated;
    }

    claimChallenge(challengeKey) {
      const c = this._data.dailyChallenges[challengeKey];
      if (!c || !c.completed || c.claimed) return { success: false };
      c.claimed = true;
      const result = this.addXp(c.reward);
      this._save();
      return { success: true, reward: c.reward, ...result };
    }

    // ─── Social & Misc ──────────────────────────────────────────────────

    setPlayerName(name) {
      this._data.playerName = String(name).slice(0, 30);
      this._save();
    }

    getPlayerName() { return this._data.playerName; }
    getPlayerId() { return this._data.playerId; }

    recordSpectate() {
      this._data.spectateCount++;
      this._save();
    }

    completeTutorial() {
      if (!this._data.tutorialCompleted) {
        this._data.tutorialCompleted = true;
        this.addXp(50);
        this._save();
      }
    }

    getRawData() {
      return deepClone(this._data);
    }

    importData(data) {
      this._data = mergeDefaults(data, this._data);
      this._migrateIfNeeded();
      this._save();
    }

    reset() {
      localStorage.removeItem(STORAGE_KEYS.PLAYER_DATA);
      this._data = {};
      this._ensureDefaults();
      this._save();
    }

    // ─── Helpers for Achievements ───────────────────────────────────────

    hasFirstWin() { return this._data.firstWin; }
    hasFirstOnlineWin() { return this._data.firstOnlineWin; }
    hasBeatenDifficulty(difficulty) {
      const stats = (this._data.aiDifficultyStats || {})[difficulty];
      return stats && stats.wins > 0;
    }
    hasWinsAgainstDifficulty(difficulty, count) {
      const stats = (this._data.aiDifficultyStats || {})[difficulty];
      return stats && stats.wins >= count;
    }
    getGamesPlayed() { return this._data.totalGames; }
    getWins() {
      return this._data.stats.ai.wins + this._data.stats.local.wins + this._data.stats.online.wins;
    }
    getLosses() {
      return this._data.stats.ai.losses + this._data.stats.local.losses + this._data.stats.online.losses;
    }
    getDraws() {
      return this._data.stats.ai.draws + this._data.stats.local.draws + this._data.stats.online.draws;
    }
    isTutorialCompleted() { return this._data.tutorialCompleted; }
    getSpectateCount() { return this._data.spectateCount; }
    getOpeningCount() { return Object.keys(this._data.openings).length; }
    getWinningOpenings() {
      const wins = [];
      for (const name in this._data.openings) {
        if (this._data.openings[name].wins > 0) wins.push(name);
      }
      return wins;
    }
  }

  // ─── AchievementSystem Class ──────────────────────────────────────────

  class AchievementSystem {
    constructor(playerData) {
      this._player = playerData;
      this._achievements = this._load();
      this._definitions = this._buildDefinitions();
      this._ensureInitialized();
    }

    _load() {
      try {
        const raw = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
        return raw ? JSON.parse(raw) : {};
      } catch (e) {
        return {};
      }
    }

    _save() {
      try {
        localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(this._achievements));
      } catch (e) {
        console.warn('[AchievementSystem] Failed to save:', e);
      }
    }

    _ensureInitialized() {
      let changed = false;
      for (const id in this._definitions) {
        if (!this._achievements[id]) {
          this._achievements[id] = {
            unlocked: false,
            unlockedAt: null,
            progress: 0,
            notified: false
          };
          changed = true;
        }
      }
      if (changed) this._save();
    }

    _buildDefinitions() {
      return {
        // ── First Steps ──
        first_win: {
          id: 'first_win',
          name: 'First Victory',
          description: 'Win your first game',
          category: 'beginner',
          icon: 'trophy',
          condition: () => this._player.hasFirstWin(),
          secret: false
        },
        first_online_win: {
          id: 'first_online_win',
          name: 'Online Warrior',
          description: 'Win your first online match',
          category: 'beginner',
          icon: 'globe',
          condition: () => this._player.hasFirstOnlineWin(),
          secret: false
        },
        first_ai_win: {
          id: 'first_ai_win',
          name: 'AI Challenger',
          description: 'Defeat the AI for the first time',
          category: 'beginner',
          icon: 'robot',
          condition: () => this._player.hasBeatenDifficulty('easy'),
          secret: false
        },

        // ── Win Streaks ──
        streak_3: {
          id: 'streak_3',
          name: 'On Fire',
          description: 'Win 3 games in a row',
          category: 'streak',
          icon: 'fire',
          condition: () => this._player.getBestWinStreak() >= 3,
          secret: false
        },
        streak_5: {
          id: 'streak_5',
          name: 'Unstoppable',
          description: 'Win 5 games in a row',
          category: 'streak',
          icon: 'zap',
          condition: () => this._player.getBestWinStreak() >= 5,
          secret: false
        },
        streak_10: {
          id: 'streak_10',
          name: 'Legendary',
          description: 'Win 10 games in a row',
          category: 'streak',
          icon: 'crown',
          condition: () => this._player.getBestWinStreak() >= 10,
          secret: false
        },
        streak_20: {
          id: 'streak_20',
          name: 'Godlike',
          description: 'Win 20 games in a row',
          category: 'streak',
          icon: 'star',
          condition: () => this._player.getBestWinStreak() >= 20,
          secret: false
        },

        // ── AI Difficulty ──
        beat_hard: {
          id: 'beat_hard',
          name: 'Hard Mode',
          description: 'Defeat AI on Hard difficulty',
          category: 'ai',
          icon: 'shield',
          condition: () => this._player.hasBeatenDifficulty('hard'),
          secret: false
        },
        beat_expert: {
          id: 'beat_expert',
          name: 'Expert Slayer',
          description: 'Defeat AI on Expert difficulty',
          category: 'ai',
          icon: 'sword',
          condition: () => this._player.hasBeatenDifficulty('expert'),
          secret: false
        },
        beat_master: {
          id: 'beat_master',
          name: 'Master Conqueror',
          description: 'Defeat AI on Master difficulty',
          category: 'ai',
          icon: 'award',
          condition: () => this._player.hasBeatenDifficulty('master'),
          secret: false
        },
        beat_grandmaster: {
          id: 'beat_grandmaster',
          name: 'Grandmaster',
          description: 'Defeat AI on Grandmaster difficulty',
          category: 'ai',
          icon: 'gem',
          condition: () => this._player.hasBeatenDifficulty('grandmaster'),
          secret: false
        },
        ai_grandmaster_5: {
          id: 'ai_grandmaster_5',
          name: 'Grandmaster Veteran',
          description: 'Win 5 games against Grandmaster AI',
          category: 'ai',
          icon: 'repeat',
          condition: () => this._player.hasWinsAgainstDifficulty('grandmaster', 5),
          secret: false
        },
        ai_master_10: {
          id: 'ai_master_10',
          name: 'Master Class',
          description: 'Win 10 games against Master AI',
          category: 'ai',
          icon: 'target',
          condition: () => this._player.hasWinsAgainstDifficulty('master', 10),
          secret: false
        },
        ai_all_difficulties: {
          id: 'ai_all_difficulties',
          name: 'AI Overlord',
          description: 'Win against all AI difficulties',
          category: 'ai',
          icon: 'aperture',
          condition: () => {
            return ['easy', 'medium', 'hard', 'expert', 'master', 'grandmaster']
              .every(d => this._player.hasBeatenDifficulty(d));
          },
          secret: false
        },

        // ── Opening Mastery ──
        opening_1: {
          id: 'opening_1',
          name: 'Opening Gambit',
          description: 'Win with your first opening',
          category: 'opening',
          icon: 'chevron-right',
          condition: () => this._player.getWinningOpenings().length >= 1,
          secret: false
        },
        opening_5: {
          id: 'opening_5',
          name: 'Opening Repertoire',
          description: 'Win with 5 different openings',
          category: 'opening',
          icon: 'list',
          condition: () => this._player.getWinningOpenings().length >= 5,
          secret: false
        },
        opening_10: {
          id: 'opening_10',
          name: 'Opening Encyclopedia',
          description: 'Win with 10 different openings',
          category: 'opening',
          icon: 'book',
          condition: () => this._player.getWinningOpenings().length >= 10,
          secret: false
        },
        opening_master: {
          id: 'opening_master',
          name: 'Opening Master',
          description: 'Win with every recorded opening',
          category: 'opening',
          icon: 'bookmark',
          condition: () => {
            const all = Object.keys(this._player.getOpeningStats());
            if (all.length === 0) return false;
            return all.every(name => this._player.getOpeningStats()[name].wins > 0);
          },
          secret: false
        },

        // ── Speed ──
        speed_demon_30: {
          id: 'speed_demon_30',
          name: 'Speed Demon',
          description: 'Win a game in under 30 moves',
          category: 'speed',
          icon: 'clock',
          condition: () => false, // Set by meta flag
          secret: false
        },
        speed_demon_20: {
          id: 'speed_demon_20',
          name: 'Lightning Strike',
          description: 'Win a game in under 20 moves',
          category: 'speed',
          icon: 'bolt',
          condition: () => false,
          secret: false
        },
        speed_demon_15: {
          id: 'speed_demon_15',
          name: 'Flash Victory',
          description: 'Win a game in under 15 moves',
          category: 'speed',
          icon: 'timer',
          condition: () => false,
          secret: false
        },

        // ── Perfect Play ──
        perfect_game: {
          id: 'perfect_game',
          name: 'Perfect Game',
          description: 'Win without any mistakes',
          category: 'skill',
          icon: 'check-circle',
          condition: () => false, // Set by meta flag
          secret: false
        },
        comeback_king: {
          id: 'comeback_king',
          name: 'Comeback King',
          description: 'Win from a losing position',
          category: 'skill',
          icon: 'trending-up',
          condition: () => false, // Set by meta flag
          secret: false
        },
        no_blunders_10: {
          id: 'no_blunders_10',
          name: 'Steady Hand',
          description: 'Play 10 games without a blunder',
          category: 'skill',
          icon: 'anchor',
          condition: () => {
            // This is a tracking achievement; logic handled via progress
            const a = this._achievements.no_blunders_10;
            return a && a.progress >= 10;
          },
          secret: false
        },

        // ── Social ──
        play_online_1: {
          id: 'play_online_1',
          name: 'Connected',
          description: 'Play your first online match',
          category: 'social',
          icon: 'wifi',
          condition: () => this._player.getStats('online').games >= 1,
          secret: false
        },
        play_online_10: {
          id: 'play_online_10',
          name: 'Network Player',
          description: 'Play 10 online matches',
          category: 'social',
          icon: 'users',
          condition: () => this._player.getStats('online').games >= 10,
          secret: false
        },
        play_online_50: {
          id: 'play_online_50',
          name: 'Online Veteran',
          description: 'Play 50 online matches',
          category: 'social',
          icon: 'activity',
          condition: () => this._player.getStats('online').games >= 50,
          secret: false
        },
        spectate_1: {
          id: 'spectate_1',
          name: 'Spectator',
          description: 'Spectate 1 online game',
          category: 'social',
          icon: 'eye',
          condition: () => this._player.getSpectateCount() >= 1,
          secret: false
        },
        spectate_10: {
          id: 'spectate_10',
          name: 'Scout',
          description: 'Spectate 10 online games',
          category: 'social',
          icon: 'search',
          condition: () => this._player.getSpectateCount() >= 10,
          secret: false
        },

        // ── Tutorial ──
        tutorial_complete: {
          id: 'tutorial_complete',
          name: 'Graduate',
          description: 'Complete the tutorial',
          category: 'tutorial',
          icon: 'graduation-cap',
          condition: () => this._player.isTutorialCompleted(),
          secret: false
        },
        tutorial_master: {
          id: 'tutorial_master',
          name: 'Honor Student',
          description: 'Complete all tutorial lessons perfectly',
          category: 'tutorial',
          icon: 'medal',
          condition: () => false, // Set externally
          secret: false
        },

        // ── Collection / Volume ──
        games_10: {
          id: 'games_10',
          name: 'Getting Started',
          description: 'Play 10 games',
          category: 'collection',
          icon: 'hash',
          condition: () => this._player.getGamesPlayed() >= 10,
          secret: false
        },
        games_50: {
          id: 'games_50',
          name: 'Dedicated',
          description: 'Play 50 games',
          category: 'collection',
          icon: 'layers',
          condition: () => this._player.getGamesPlayed() >= 50,
          secret: false
        },
        games_100: {
          id: 'games_100',
          name: 'Centurion',
          description: 'Play 100 games',
          category: 'collection',
          icon: 'flag',
          condition: () => this._player.getGamesPlayed() >= 100,
          secret: false
        },
        games_500: {
          id: 'games_500',
          name: 'Gomoku Addict',
          description: 'Play 500 games',
          category: 'collection',
          icon: 'archive',
          condition: () => this._player.getGamesPlayed() >= 500,
          secret: false
        },
        wins_25: {
          id: 'wins_25',
          name: 'Winner',
          description: 'Win 25 games',
          category: 'collection',
          icon: 'thumbs-up',
          condition: () => this._player.getWins() >= 25,
          secret: false
        },
        wins_100: {
          id: 'wins_100',
          name: 'Champion',
          description: 'Win 100 games',
          category: 'collection',
          icon: 'crown',
          condition: () => this._player.getWins() >= 100,
          secret: false
        },
        wins_250: {
          id: 'wins_250',
          name: 'Gomoku Legend',
          description: 'Win 250 games',
          category: 'collection',
          icon: 'star',
          condition: () => this._player.getWins() >= 250,
          secret: false
        },
        local_10: {
          id: 'local_10',
          name: 'Couch Warrior',
          description: 'Play 10 local multiplayer games',
          category: 'collection',
          icon: 'monitor',
          condition: () => this._player.getStats('local').games >= 10,
          secret: false
        },

        // ── ELO Milestones ──
        elo_1600: {
          id: 'elo_1600',
          name: 'Rising Star',
          description: 'Reach 1600 ELO',
          category: 'rating',
          icon: 'trending-up',
          condition: () => this._player.getElo() >= 1600,
          secret: false
        },
        elo_1800: {
          id: 'elo_1800',
          name: 'Expert Player',
          description: 'Reach 1800 ELO',
          category: 'rating',
          icon: 'bar-chart',
          condition: () => this._player.getElo() >= 1800,
          secret: false
        },
        elo_2000: {
          id: 'elo_2000',
          name: 'Master',
          description: 'Reach 2000 ELO',
          category: 'rating',
          icon: 'target',
          condition: () => this._player.getElo() >= 2000,
          secret: false
        },
        elo_2200: {
          id: 'elo_2200',
          name: 'Grandmaster',
          description: 'Reach 2200 ELO',
          category: 'rating',
          icon: 'zap',
          condition: () => this._player.getElo() >= 2200,
          secret: false
        },
        elo_2400: {
          id: 'elo_2400',
          name: 'Elite',
          description: 'Reach 2400 ELO',
          category: 'rating',
          icon: 'star',
          condition: () => this._player.getElo() >= 2400,
          secret: false
        },

        // ── Secret ──
        secret_first_loss: {
          id: 'secret_first_loss',
          name: 'Humility',
          description: 'Suffer your first defeat',
          category: 'secret',
          icon: 'heart-crack',
          condition: () => this._player.getLosses() >= 1,
          secret: true
        },
        secret_draw: {
          id: 'secret_draw',
          name: 'Stalemate',
          description: 'Play a draw game',
          category: 'secret',
          icon: 'scale',
          condition: () => this._player.getDraws() >= 1,
          secret: true
        },
        secret_slow_mover: {
          id: 'secret_slow_mover',
          name: 'Deep Thinker',
          description: 'Take over 5 minutes for a single move',
          category: 'secret',
          icon: 'hourglass',
          condition: () => false,
          secret: true
        }
      };
    }

    checkAll() {
      const newlyUnlocked = [];
      for (const id in this._definitions) {
        const def = this._definitions[id];
        const state = this._achievements[id];
        if (state.unlocked) continue;
        if (def.condition()) {
          state.unlocked = true;
          state.unlockedAt = new Date().toISOString();
          state.notified = false;
          newlyUnlocked.push(this.getAchievement(id));
        }
      }
      if (newlyUnlocked.length > 0) this._save();
      return newlyUnlocked;
    }

    check(id) {
      const def = this._definitions[id];
      if (!def) return null;
      const state = this._achievements[id];
      if (state.unlocked) return null;
      if (def.condition()) {
        state.unlocked = true;
        state.unlockedAt = new Date().toISOString();
        state.notified = false;
        this._save();
        return this.getAchievement(id);
      }
      return null;
    }

    unlock(id, force = false) {
      const state = this._achievements[id];
      if (!state) return null;
      if (state.unlocked && !force) return null;
      state.unlocked = true;
      state.unlockedAt = new Date().toISOString();
      state.notified = false;
      this._save();
      return this.getAchievement(id);
    }

    setProgress(id, value) {
      const state = this._achievements[id];
      if (!state || state.unlocked) return false;
      state.progress = Math.max(0, value);
      const def = this._definitions[id];
      if (def && def.condition && def.condition()) {
        return this.check(id);
      }
      this._save();
      return false;
    }

    getAchievement(id) {
      const def = this._definitions[id];
      const state = this._achievements[id];
      if (!def || !state) return null;
      return {
        id: def.id,
        name: def.name,
        description: def.description,
        category: def.category,
        icon: def.icon,
        secret: def.secret,
        unlocked: state.unlocked,
        unlockedAt: state.unlockedAt,
        progress: state.progress,
        notified: state.notified
      };
    }

    getAllAchievements() {
      return Object.keys(this._definitions).map(id => this.getAchievement(id));
    }

    getUnlockedAchievements() {
      return this.getAllAchievements().filter(a => a.unlocked);
    }

    getLockedAchievements() {
      return this.getAllAchievements().filter(a => !a.unlocked);
    }

    getAchievementsByCategory(category) {
      return this.getAllAchievements().filter(a => a.category === category);
    }

    getCategories() {
      const cats = new Set();
      for (const id in this._definitions) {
        cats.add(this._definitions[id].category);
      }
      return Array.from(cats);
    }

    markNotified(id) {
      if (this._achievements[id]) {
        this._achievements[id].notified = true;
        this._save();
      }
    }

    getUnlockRate() {
      const all = Object.keys(this._definitions).length;
      const unlocked = this.getUnlockedAchievements().length;
      return {
        unlocked,
        total: all,
        percentage: all > 0 ? Math.round((unlocked / all) * 100) : 0
      };
    }

    reset() {
      localStorage.removeItem(STORAGE_KEYS.ACHIEVEMENTS);
      this._achievements = {};
      this._ensureInitialized();
    }
  }

  // ─── Analytics Class ──────────────────────────────────────────────────

  class Analytics {
    constructor(playerData) {
      this._player = playerData;
      this._data = this._load();
      this._ensureDefaults();
    }

    _load() {
      try {
        const raw = localStorage.getItem(STORAGE_KEYS.ANALYTICS);
        return raw ? JSON.parse(raw) : {};
      } catch (e) {
        return {};
      }
    }

    _save() {
      try {
        localStorage.setItem(STORAGE_KEYS.ANALYTICS, JSON.stringify(this._data));
      } catch (e) {
        console.warn('[Analytics] Failed to save:', e);
      }
    }

    _ensureDefaults() {
      const defaults = {
        version: 1,
        gameResults: [],       // { date, result, mode, difficulty, moves, duration, opening, elo, opponentElo }
        dailyStats: {},        // 'YYYY-MM-DD' -> { games, wins, losses, draws, timePlayed }
        hourlyDistribution: new Array(24).fill(0),
        weekdayDistribution: new Array(7).fill(0)
      };
      this._data = mergeDefaults(this._data, defaults);
    }

    recordGame(result, meta = {}) {
      const entry = {
        id: uuid(),
        timestamp: new Date().toISOString(),
        date: todayStr(),
        result,
        mode: meta.mode || 'unknown',
        difficulty: meta.difficulty || null,
        moves: meta.moves || 0,
        duration: meta.duration || 0,
        opening: meta.opening || null,
        myElo: meta.myElo || this._player.getElo(),
        opponentElo: meta.opponentElo || null,
        accuracy: meta.accuracy || null,
        comeback: meta.comeback || false,
        perfect: meta.perfect || false
      };
      this._data.gameResults.push(entry);
      if (this._data.gameResults.length > 2000) {
        this._data.gameResults = this._data.gameResults.slice(-2000);
      }

      // Daily stats
      const date = entry.date;
      if (!this._data.dailyStats[date]) {
        this._data.dailyStats[date] = { games: 0, wins: 0, losses: 0, draws: 0, timePlayed: 0 };
      }
      const ds = this._data.dailyStats[date];
      ds.games++;
      ds[result === 'win' ? 'wins' : (result === 'loss' ? 'losses' : 'draws')]++;
      ds.timePlayed += entry.duration;

      // Hourly / weekday distribution
      const d = new Date();
      this._data.hourlyDistribution[d.getHours()]++;
      this._data.weekdayDistribution[d.getDay()]++;

      this._save();
    }

    // ─── Game Result Trends ─────────────────────────────────────────────

    getWinRateTrend(days = 30) {
      const dates = [];
      const wins = [];
      const losses = [];
      const draws = [];
      const winRates = [];

      const now = new Date();
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const stats = this._data.dailyStats[dateStr] || { games: 0, wins: 0, losses: 0, draws: 0 };
        dates.push(dateStr);
        wins.push(stats.wins);
        losses.push(stats.losses);
        draws.push(stats.draws);
        winRates.push(stats.games > 0 ? (stats.wins / stats.games * 100).toFixed(1) : 0);
      }
      return { dates, wins, losses, draws, winRates };
    }

    getOverallWinRate(period = 'all') {
      let games = this._data.gameResults;
      if (period !== 'all') {
        const days = period === 'week' ? 7 : (period === 'month' ? 30 : 90);
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        games = games.filter(g => new Date(g.timestamp) >= cutoff);
      }
      const total = games.length;
      const wins = games.filter(g => g.result === 'win').length;
      const losses = games.filter(g => g.result === 'loss').length;
      const draws = games.filter(g => g.result === 'draw').length;
      return {
        total, wins, losses, draws,
        winRate: total > 0 ? (wins / total * 100).toFixed(1) : '0.0',
        lossRate: total > 0 ? (losses / total * 100).toFixed(1) : '0.0',
        drawRate: total > 0 ? (draws / total * 100).toFixed(1) : '0.0'
      };
    }

    // ─── Win Rate by Opening ────────────────────────────────────────────

    getWinRateByOpening() {
      const stats = this._player.getOpeningStats();
      const result = [];
      for (const name in stats) {
        const s = stats[name];
        result.push({
          opening: name,
          games: s.games,
          wins: s.wins,
          losses: s.losses,
          draws: s.draws,
          winRate: s.games > 0 ? (s.wins / s.games * 100).toFixed(1) : '0.0'
        });
      }
      result.sort((a, b) => b.games - a.games);
      return result;
    }

    // ─── Win Rate by Difficulty ─────────────────────────────────────────

    getWinRateByDifficulty() {
      const stats = this._player.getStats().aiDifficultyStats || {};
      const result = [];
      for (const diff in stats) {
        const s = stats[diff];
        result.push({
          difficulty: diff,
          games: s.games,
          wins: s.wins,
          losses: s.losses,
          draws: s.draws,
          winRate: s.games > 0 ? (s.wins / s.games * 100).toFixed(1) : '0.0'
        });
      }
      return result;
    }

    // ─── Average Moves Per Game ───────────────────────────────────────────

    getAverageMovesPerGame(mode = null, period = 'all') {
      let games = this._data.gameResults.filter(g => g.moves > 0);
      if (mode) games = games.filter(g => g.mode === mode);
      if (period !== 'all') {
        const days = period === 'week' ? 7 : (period === 'month' ? 30 : 90);
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        games = games.filter(g => new Date(g.timestamp) >= cutoff);
      }
      if (games.length === 0) return { average: 0, min: 0, max: 0, median: 0, count: 0 };
      const moves = games.map(g => g.moves).sort((a, b) => a - b);
      const sum = moves.reduce((a, b) => a + b, 0);
      const median = moves.length % 2 === 0
        ? (moves[moves.length / 2 - 1] + moves[moves.length / 2]) / 2
        : moves[Math.floor(moves.length / 2)];
      return {
        average: (sum / moves.length).toFixed(1),
        min: moves[0],
        max: moves[moves.length - 1],
        median,
        count: moves.length
      };
    }

    // ─── Performance Rating ─────────────────────────────────────────────

    getPerformanceRating(mode = null, gamesCount = 20) {
      let games = [...this._data.gameResults].reverse().slice(0, gamesCount);
      if (mode) games = games.filter(g => g.mode === mode);
      if (games.length === 0) return { performanceRating: this._player.getElo(), gamesAnalyzed: 0 };

      let totalOpponentElo = 0;
      let totalScore = 0;
      games.forEach(g => {
        const opp = g.opponentElo || AI_DIFFICULTY_RATINGS[g.difficulty] || ELO.INITIAL;
        totalOpponentElo += opp;
        totalScore += g.result === 'win' ? 1 : (g.result === 'draw' ? 0.5 : 0);
      });
      const avgOpponent = totalOpponentElo / games.length;
      const scorePct = totalScore / games.length;
      // Performance rating = avg opponent + 400 * (score - 0.5) * 2
      // Simplified: avg opponent + 800 * (score - 0.5)
      const performance = Math.round(avgOpponent + 800 * (scorePct - 0.5));
      return {
        performanceRating: clamp(performance, ELO.MIN_RATING, ELO.MAX_RATING),
        gamesAnalyzed: games.length,
        averageOpponentElo: Math.round(avgOpponent),
        score: totalScore,
        winRate: (scorePct * 100).toFixed(1)
      };
    }

    // ─── Skill Assessment ───────────────────────────────────────────────

    getSkillAssessment() {
      const elo = this._player.getElo();
      const games = this._player.getGamesPlayed();
      const accuracy = this._player.getAccuracyStats();
      const winRate = parseFloat(this._player.getStats().total.winRate);
      const bestStreak = this._player.getBestWinStreak();

      let tier = 'Beginner';
      let description = 'Just starting your Gomoku journey.';

      if (elo >= 2400 && games >= 100 && winRate >= 55) {
        tier = 'Grandmaster';
        description = 'Elite player with exceptional strategic depth.';
      } else if (elo >= 2200 && games >= 80 && winRate >= 50) {
        tier = 'Master';
        description = 'Highly skilled with strong tactical understanding.';
      } else if (elo >= 2000 && games >= 60 && winRate >= 48) {
        tier = 'Expert';
        description = 'Advanced player with solid fundamentals.';
      } else if (elo >= 1800 && games >= 40 && winRate >= 45) {
        tier = 'Advanced';
        description = 'Good understanding of openings and mid-game.';
      } else if (elo >= 1600 && games >= 20) {
        tier = 'Intermediate';
        description = 'Developing strategic awareness.';
      } else if (games >= 10) {
        tier = 'Novice';
        description = 'Learning the basics of Gomoku.';
      }

      const strengths = [];
      const weaknesses = [];

      if (winRate >= 55) strengths.push('Strong win rate');
      else if (winRate < 40) weaknesses.push('Win rate needs improvement');

      if (accuracy.accuracyScore >= 90) strengths.push('High move accuracy');
      else if (accuracy.accuracyScore < 70) weaknesses.push('Move accuracy could improve');

      if (bestStreak >= 5) strengths.push('Can maintain winning momentum');
      if (this._player.getOpeningCount() >= 5) strengths.push('Versatile opening repertoire');
      else weaknesses.push('Limited opening variety');

      return {
        tier,
        description,
        elo,
        gamesPlayed: games,
        winRate,
        accuracyScore: accuracy.accuracyScore,
        bestStreak,
        strengths: strengths.length ? strengths : ['Consistent play'],
        weaknesses: weaknesses.length ? weaknesses : ['Keep practicing!'],
        recommendation: this._generateRecommendation(tier, weaknesses)
      };
    }

    _generateRecommendation(tier, weaknesses) {
      if (weaknesses.includes('Move accuracy could improve')) {
        return 'Focus on reducing blunders. Take more time per move.';
      }
      if (weaknesses.includes('Limited opening variety')) {
        return 'Try learning new openings to expand your repertoire.';
      }
      if (weaknesses.includes('Win rate needs improvement')) {
        return 'Review your losses to identify common mistakes.';
      }
      if (tier === 'Grandmaster') {
        return 'Consider playing in tournaments to test your skills.';
      }
      return 'Keep practicing regularly to improve your skills.';
    }

    // ─── Activity Heatmap ───────────────────────────────────────────────

    getActivityHeatmap(days = 90) {
      const heatmap = {};
      const now = new Date();
      for (let i = 0; i < days; i++) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const str = d.toISOString().split('T')[0];
        const stats = this._data.dailyStats[str];
        heatmap[str] = stats ? stats.games : 0;
      }
      return heatmap;
    }

    getPeakActivityHours() {
      const arr = this._data.hourlyDistribution;
      const max = Math.max(...arr);
      if (max === 0) return [];
      return arr.map((count, hour) => ({ hour, count }))
        .filter(h => h.count === max)
        .map(h => h.hour);
    }

    getPeakActivityDays() {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const arr = this._data.weekdayDistribution;
      const max = Math.max(...arr);
      if (max === 0) return [];
      return arr.map((count, idx) => ({ day: days[idx], count }))
        .filter(d => d.count === max)
        .map(d => d.day);
    }

    // ─── ELO Progression ────────────────────────────────────────────────

    getEloProgression(days = 30) {
      const history = this._player.getEloHistory();
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      const filtered = history.filter(h => new Date(h.date) >= cutoff);
      return filtered.map(h => ({
        date: h.date,
        elo: h.newRating,
        delta: h.delta
      }));
    }

    // ─── Meta Analytics ─────────────────────────────────────────────────

    getComparisonStats() {
      const ai = this._player.getStats('ai');
      const local = this._player.getStats('local');
      const online = this._player.getStats('online');
      return {
        ai: { ...ai, averageMoves: this.getAverageMovesPerGame('ai') },
        local: { ...local, averageMoves: this.getAverageMovesPerGame('local') },
        online: { ...online, averageMoves: this.getAverageMovesPerGame('online') }
      };
    }

    getRawData() {
      return deepClone(this._data);
    }

    reset() {
      localStorage.removeItem(STORAGE_KEYS.ANALYTICS);
      this._data = {};
      this._ensureDefaults();
    }
  }

  // ─── Integration Helpers ────────────────────────────────────────────────

  /**
   * Convenience class that wires PlayerData, AchievementSystem, and Analytics together.
   */
  class PlayerProfile {
    constructor() {
      this.playerData = new PlayerData();
      this.achievements = new AchievementSystem(this.playerData);
      this.analytics = new Analytics(this.playerData);
    }

    recordGame(result, meta = {}) {
      // Update player data
      const mode = meta.mode || 'ai';
      const pdResult = this.playerData.recordGame(mode, result, meta);

      // Update analytics
      this.analytics.recordGame(result, meta);

      // Update daily challenges
      this.playerData.updateChallengeProgress('wins', result === 'win' ? 1 : 0);
      this.playerData.updateChallengeProgress('games', 1);
      if (mode === 'ai') this.playerData.updateChallengeProgress('ai_wins', result === 'win' ? 1 : 0);
      if (mode === 'online') this.playerData.updateChallengeProgress('online_wins', result === 'win' ? 1 : 0);
      if (result === 'win' && meta.moves && meta.moves < 30) {
        this.playerData.updateChallengeProgress('fast_win', 1);
      }
      if (meta.perfect) {
        this.playerData.updateChallengeProgress('perfect_win', 1);
      }
      if (meta.opening) {
        // Track opening variety implicitly via playerData
      }

      // Check achievements
      const newAchievements = this.achievements.checkAll();

      // Special flag-based achievements
      if (result === 'win' && meta.moves) {
        if (meta.moves < 30) this.achievements.unlock('speed_demon_30');
        if (meta.moves < 20) this.achievements.unlock('speed_demon_20');
        if (meta.moves < 15) this.achievements.unlock('speed_demon_15');
      }
      if (meta.perfect) this.achievements.unlock('perfect_game');
      if (meta.comeback) this.achievements.unlock('comeback_king');

      return {
        playerStats: pdResult,
        newAchievements,
        xpGain: meta.xpGain || null
      };
    }

    getFullProfile() {
      return {
        player: {
          name: this.playerData.getPlayerName(),
          id: this.playerData.getPlayerId(),
          elo: this.playerData.getElo(),
          peakElo: this.playerData.getPeakElo(),
          level: this.playerData.getLevelProgress(),
          totalGames: this.playerData.getGamesPlayed(),
          totalTime: this.playerData.getFormattedTotalTime()
        },
        stats: this.playerData.getStats(),
        openings: this.playerData.getOpeningStats(),
        accuracy: this.playerData.getAccuracyStats(),
        timing: {
          averageMoveTime: this.playerData.getAverageMoveTime(),
          averageGameDuration: this.playerData.getAverageGameDuration()
        },
        achievements: {
          unlocked: this.achievements.getUnlockedAchievements(),
          rate: this.achievements.getUnlockRate()
        },
        analytics: {
          skill: this.analytics.getSkillAssessment(),
          winRateTrend: this.analytics.getWinRateTrend(7),
          performance: this.analytics.getPerformanceRating()
        },
        challenges: this.playerData.getDailyChallenges()
      };
    }

    resetAll() {
      this.playerData.reset();
      this.achievements.reset();
      this.analytics.reset();
    }
  }

  // ─── Exports ──────────────────────────────────────────────────────────

  global.PlayerData = PlayerData;
  global.AchievementSystem = AchievementSystem;
  global.Analytics = Analytics;
  global.PlayerProfile = PlayerProfile;

  // Also expose AI difficulty ratings for external use
  global.GOMOKU_AI_RATINGS = AI_DIFFICULTY_RATINGS;
  global.GOMOKU_ELO_CONSTANTS = ELO;

})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
