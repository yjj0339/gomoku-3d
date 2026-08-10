/**
 * AI Worker - runs AI computation in a separate thread
 * Prevents UI from freezing during deep search
 */

importScripts('game-engine.js', 'ai-engine.js');

self.onmessage = function(e) {
  const { type, board, size, currentTurn, moveHistory, color, difficulty, state, winner } = e.data;

  if (type === 'move') {
    // Reconstruct engine state
    const engine = new GameEngine(size);
    engine.board = board;
    engine.currentTurn = currentTurn;
    engine.moveHistory = moveHistory;
    engine.state = state || 'playing';
    engine.winner = winner || null;

    const ai = new AIBrain(difficulty);
    const startTime = Date.now();
    const move = ai.getBestMove(engine, color);
    const elapsed = Date.now() - startTime;

    self.postMessage({ type: 'result', move, elapsed });
  }
};
