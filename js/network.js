/**
 * Gomoku 3D - Network Client (P2P)
 * PeerJS/WebRTC based, no backend server needed.
 * API-compatible with the previous WebSocket version.
 *
 * Flow:
 *   Host: createRoom(name) -> generates room code = peerId -> emits 'room_created' -> waits for 'game_start'
 *   Guest: joinRoom(code, name) -> connects to host's peerId -> emits 'game_start' on both sides
 *   Messages are sent/received via peer.on('data')
 */

class NetworkClient {
  constructor() {
    this.peer = null;
    this.conn = null;
    this.playerId = this.getPlayerId();
    this.playerName = '';
    this.roomCode = null;
    this.color = null;
    this.connected = false;
    this.reconnecting = false;
    this.handlers = {};
    this.heartbeatInterval = null;
    this.isHost = false;
    this.guestReady = false;
  }

  getPlayerId() {
    let id = localStorage.getItem('gomoku_player_id');
    if (!id) {
      id = 'p_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('gomoku_player_id', id);
    }
    return id;
  }

  on(event, handler) {
    if (!this.handlers[event]) this.handlers[event] = [];
    this.handlers[event].push(handler);
  }

  emit(event, data) {
    if (this.handlers[event]) {
      this.handlers[event].forEach(h => h(data));
    }
  }

  /**
   * Connect to PeerJS public signaling server.
   * For host: peer id = room code (short, uppercase).
   * For guest: peer id = random.
   */
  connect() {
    return new Promise((resolve, reject) => {
      try {
        // PeerJS public cloud server (no need to self-host)
        this.peer = new Peer({
          config: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:stun1.l.google.com:19302' },
              { urls: 'stun:stun2.l.google.com:19302' },
              { urls: 'stun:stun3.l.google.com:19302' },
              { urls: 'stun:stun4.l.google.com:19302' },
            ],
          },
          debug: 1,
        });

        this.peer.on('open', (id) => {
          this.connected = true;
          resolve(id);
        });

        // Host: receive incoming connection
        this.peer.on('connection', (conn) => {
          this.conn = conn;
          this.setupConnection(conn);
        });

        this.peer.on('error', (err) => {
          console.error('PeerJS error:', err);
          if (!this.connected) {
            reject(err);
          } else {
            // Handle specific errors gracefully
            if (err.type === 'peer-unavailable') {
              this.emit('error', { message: '房间不存在或对手已离开' });
            } else if (err.type === 'network' || err.type === 'server-error') {
              this.emit('error', { message: '网络连接失败，请检查网络后重试' });
            } else if (err.type === 'unavailable-id') {
              this.emit('error', { message: '房间号已被占用，请重新创建' });
            }
          }
        });

        // Timeout
        setTimeout(() => {
          if (!this.connected) {
            reject(new Error('Connection timeout'));
          }
        }, 15000);
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * Set up data connection event handlers for a peer connection.
   */
  setupConnection(conn) {
    conn.on('open', () => {
      this.startHeartbeat();
      // If host: notify app that guest joined -> game_start
      if (this.isHost) {
        this.emit('game_start', { color: 'black' });
        // Send game_start to guest
        conn.send(JSON.stringify({
          type: 'game_start',
          payload: { color: 'white' },
        }));
      }
    });

    conn.on('data', (rawData) => {
      try {
        // PeerJS may send as string or object
        let message;
        if (typeof rawData === 'string') {
          message = JSON.parse(rawData);
        } else if (rawData instanceof ArrayBuffer) {
          message = JSON.parse(new TextDecoder().decode(rawData));
        } else if (rawData instanceof Uint8Array) {
          message = JSON.parse(new TextDecoder().decode(rawData));
        } else {
          message = rawData;
        }

        // Handle internal heartbeat/ack
        if (message.type === 'ping') {
          conn.send(JSON.stringify({ type: 'pong' }));
          return;
        }
        if (message.type === 'pong') {
          return;
        }

        this.emit(message.type, message.payload);
      } catch (e) {
        console.error('Parse error:', e);
      }
    });

    conn.on('close', () => {
      this.stopHeartbeat();
      this.emit('disconnect', {});
      this.emit('error', { message: '对手已断开连接' });
    });

    conn.on('error', (err) => {
      console.error('Connection error:', err);
      this.emit('error', { message: '连接错误' });
    });
  }

  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.conn && this.conn.open) {
        this.conn.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000);
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Send a message through the data connection.
   */
  send(type, payload = {}) {
    if (this.conn && this.conn.open) {
      this.conn.send(JSON.stringify({ type, payload }));
      return true;
    }
    return false;
  }

  /**
   * Host: create a room.
   * Generates a short room code and uses it as the peer ID.
   */
  createRoom(name) {
    this.playerName = name;
    this.isHost = true;

    // Generate short room code (6 chars, uppercase alphanumeric, avoid ambiguous chars)
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }

    // Prefix to avoid collisions with random peer IDs
    const peerId = 'gomoku-' + code;

    // Destroy existing peer and create new one with specific ID
    if (this.peer) {
      this.peer.destroy();
    }

    this.peer = new Peer(peerId, {
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
          { urls: 'stun:stun3.l.google.com:19302' },
          { urls: 'stun:stun4.l.google.com:19302' },
        ],
      },
      debug: 1,
    });

    this.peer.on('open', (id) => {
      this.connected = true;
      this.roomCode = code;
      this.emit('room_created', { roomCode: code });
    });

    this.peer.on('connection', (conn) => {
      this.conn = conn;
      this.setupConnection(conn);
    });

    this.peer.on('error', (err) => {
      console.error('PeerJS error (host):', err);
      if (err.type === 'unavailable-id') {
        this.emit('error', { message: '房间号冲突，请重新创建' });
      } else if (err.type === 'network' || err.type === 'server-error') {
        this.emit('error', { message: '网络连接失败，请检查网络后重试' });
      } else {
        this.emit('error', { message: '连接错误: ' + (err.message || err.type) });
      }
    });
  }

  /**
   * Guest: join a room by code.
   */
  joinRoom(roomCode, name) {
    this.playerName = name;
    this.roomCode = roomCode;
    this.isHost = false;

    // Destroy existing peer and create new one
    if (this.peer) {
      this.peer.destroy();
    }

    const randomId = 'gomoku-guest-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);

    this.peer = new Peer(randomId, {
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
          { urls: 'stun:stun3.l.google.com:19302' },
          { urls: 'stun:stun4.l.google.com:19302' },
        ],
      },
      debug: 1,
    });

    this.peer.on('open', (id) => {
      this.connected = true;
      // Connect to host
      const hostId = 'gomoku-' + roomCode.toUpperCase();
      this.conn = this.peer.connect(hostId, {
        reliable: true,
        metadata: { name: name },
      });

      // Connection timeout
      const timeout = setTimeout(() => {
        if (!this.conn || !this.conn.open) {
          this.emit('error', { message: '连接超时，请检查房间号是否正确' });
        }
      }, 15000);

      this.conn.on('open', () => {
        clearTimeout(timeout);
        this.setupConnection(this.conn);
      });

      this.conn.on('error', (err) => {
        clearTimeout(timeout);
        console.error('Connection error:', err);
        this.emit('error', { message: '无法连接到房间' });
      });
    });

    this.peer.on('error', (err) => {
      console.error('PeerJS error (guest):', err);
      if (err.type === 'peer-unavailable') {
        this.emit('error', { message: '房间不存在或对手已离开' });
      } else if (err.type === 'network' || err.type === 'server-error') {
        this.emit('error', { message: '网络连接失败，请检查网络后重试' });
      } else {
        this.emit('error', { message: '连接错误: ' + (err.message || err.type) });
      }
    });
  }

  sendMove(row, col) {
    this.send('move', { row, col, playerId: this.playerId });
  }

  sendReady() {
    this.send('ready', {});
  }

  sendUndoRequest() {
    this.send('undo_request', {});
  }

  sendUndoApprove() {
    this.send('undo_approve', {});
  }

  sendResign() {
    this.send('resign', {});
  }

  sendRematch() {
    this.send('rematch', {});
  }

  sendChat(message) {
    this.send('chat', { message, name: this.playerName });
  }

  setTheme(theme) {
    this.send('set_theme', { theme });
  }

  setTimeLimit(seconds) {
    this.send('set_time_limit', { seconds });
  }

  leave() {
    this.send('leave', {});
    this.roomCode = null;
    this.disconnect();
  }

  disconnect() {
    this.stopHeartbeat();
    if (this.conn) {
      try { this.conn.close(); } catch (e) {}
      this.conn = null;
    }
    if (this.peer) {
      try { this.peer.destroy(); } catch (e) {}
      this.peer = null;
    }
    this.connected = false;
  }
}

if (typeof window !== 'undefined') {
  window.NetworkClient = NetworkClient;
}
