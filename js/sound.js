/**
 * Gomoku 3D - Sound Engine
 * Web Audio API procedural sounds (no external files)
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.volume = 0.3;
  }

  init() {
    if (!this.ctx) {
      try {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) {
        this.enabled = false;
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playTone(freq, duration, type = 'sine', vol = 1) {
    if (!this.enabled || !this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.value = freq;

    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(this.volume * vol, this.ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playPlace() {
    this.init();
    // Wood clack sound - quick low freq burst
    this.playTone(180, 0.08, 'sine', 0.5);
    setTimeout(() => this.playTone(120, 0.12, 'sine', 0.3), 10);
  }

  playWin() {
    this.init();
    // Victory fanfare
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.3, 'triangle', 0.6), i * 100);
    });
  }

  playLose() {
    this.init();
    // Descending tones
    const notes = [392, 330, 262];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.4, 'sine', 0.5), i * 150);
    });
  }

  playClick() {
    this.init();
    this.playTone(800, 0.05, 'square', 0.3);
  }

  playNotify() {
    this.init();
    this.playTone(600, 0.1, 'sine', 0.4);
    setTimeout(() => this.playTone(800, 0.1, 'sine', 0.4), 50);
  }

  playError() {
    this.init();
    this.playTone(200, 0.15, 'sawtooth', 0.3);
  }

  play(type) {
    switch (type) {
      case 'place': this.playPlace(); break;
      case 'win': case 'victory': this.playWin(); break;
      case 'lose': case 'defeat': this.playLose(); break;
      case 'click': this.playClick(); break;
      case 'notify': this.playNotify(); break;
      case 'error': this.playError(); break;
      case 'start': this.playClick(); break;
      case 'draw': this.playNotify(); break;
      default: this.playClick();
    }
  }

  setEnabled(enabled) {
    this.enabled = enabled;
  }

  setVolume(volume) {
    this.volume = volume;
  }
}

// Alias for compatibility
const SoundManager = SoundEngine;

if (typeof window !== 'undefined') {
  window.SoundEngine = SoundEngine;
  window.SoundManager = SoundManager;
}
