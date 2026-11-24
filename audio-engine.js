// ============================================================================
// Low-Latency Web Audio Engine + Pre-generated Neural TTS Playback for iPadOS
// ============================================================================

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.unlocked = false;
    this.buffers = new Map();
    this.loadingPromises = new Map();
    this.activeVoiceSource = null;
    this.activeVoiceGain = null;
    this.fallbackWords = {};
    this._preloadScheduled = false;
    this._noiseBuffer = null;
    this._drawState = null;
  }

  initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx({ latencyHint: 'interactive' });
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    // iOS Safari silent buffer unlock trick
    if (this.ctx && !this.unlocked) {
      try {
        const buffer = this.ctx.createBuffer(1, 1, 22050);
        const source = this.ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(this.ctx.destination);
        source.start(0);
        this.unlocked = true;
      } catch (_) {}
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.muted) {
      if (this.activeVoiceSource) {
        try { this.activeVoiceSource.stop(); } catch (_) {}
      }
      this.stopDrawSound();
    }
    return this.muted;
  }

  async loadClip(url) {
    if (this.buffers.has(url)) return this.buffers.get(url);
    if (this.loadingPromises.has(url)) return this.loadingPromises.get(url);

    const promise = (async () => {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const arrayBuf = await res.arrayBuffer();
        this.initContext();
        if (!this.ctx) return null;
        const audioBuf = await new Promise((resolve, reject) => {
          this.ctx.decodeAudioData(arrayBuf, resolve, reject);
        });
        this.buffers.set(url, audioBuf);
        return audioBuf;
      } catch (err) {
        console.warn('Audio preload fallback for', url, err);
        return null;
      } finally {
        this.loadingPromises.delete(url);
      }
    })();

    this.loadingPromises.set(url, promise);
    return promise;
  }

  preloadCoreClips() {
    const phrases = [
      'welcome',
      'lets_play',
      'abc_time',
      'pop_balloons',
      'pop_bubbles',
      'magic_letters',
      'yay',
      'awesome',
      'wonderful',
      'all_colors',
      'all_numbers',
      'all_letters',
      'all_shapes',
      'shapes_ride',
      'colors_mode',
      'numbers_mode',
      'letters_mode',
    ];
    const colors = [
      'red',
      'blue',
      'yellow',
      'green',
      'orange',
      'purple',
      'pink',
      'cyan',
      'white',
      'brown',
    ];
    const shapes = [
      'circle',
      'square',
      'triangle',
      'heart',
      'star',
      'diamond',
      'oval',
      'rectangle',
    ];
    const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

    const core = [
      ...phrases.map((p) => `./audio/phrases/${p}.mp3`),
      ...colors.map((c) => `./audio/colors/${c}.mp3`),
      ...shapes.map((s) => `./audio/shapes/${s}.mp3`),
      ...numbers.map((n) => `./audio/numbers/${n}.mp3`),
      './audio/letters/a.mp3',
      './audio/letters/b.mp3',
      './audio/letters/c.mp3',
      './audio/words/a.mp3',
      './audio/words/b.mp3',
      './audio/words/c.mp3',
    ];
    core.forEach((u) => this.loadClip(u));

    if (this._preloadScheduled) return;
    this._preloadScheduled = true;

    // Preload all A-Z letters & words gently in staggered background batches so startup stays instant
    const letters = 'abcdefghijklmnopqrstuvwxyz'.split('');
    const batchSize = 2;
    setTimeout(() => {
      for (let i = 0; i < letters.length; i += batchSize) {
        const slice = letters.slice(i, i + batchSize);
        const batchIndex = Math.floor(i / batchSize);
        setTimeout(() => {
          slice.forEach((ch) => {
            this.loadClip(`./audio/letters/${ch}.mp3`);
            this.loadClip(`./audio/words/${ch}.mp3`);
          });
        }, batchIndex * 95);
      }
    }, 650);
  }

  stopVoice() {
    if (this.activeVoiceGain && this.ctx) {
      try {
        const now = this.ctx.currentTime;
        this.activeVoiceGain.gain.cancelScheduledValues(now);
        this.activeVoiceGain.gain.setValueAtTime(this.activeVoiceGain.gain.value, now);
        this.activeVoiceGain.gain.linearRampToValueAtTime(0.001, now + 0.03);
      } catch (_) {}
    }
    if (this.activeVoiceSource) {
      const old = this.activeVoiceSource;
      setTimeout(() => {
        try { old.stop(); } catch (_) {}
      }, 35);
      this.activeVoiceSource = null;
    }
  }

  async speakClip(url, fallbackText = '') {
    if (this.muted) return 0;
    this.initContext();
    const buf = await this.loadClip(url);
    if (buf && this.ctx) {
      this.stopVoice();
      const src = this.ctx.createBufferSource();
      const gain = this.ctx.createGain();
      src.buffer = buf;
      gain.gain.value = 1.05;
      src.connect(gain);
      gain.connect(this.ctx.destination);
      src.start(0);
      this.activeVoiceSource = src;
      this.activeVoiceGain = gain;
      return buf.duration;
    }
    // Fallback to SpeechSynthesis only if MP3 failed
    if (fallbackText && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(fallbackText);
      u.lang = 'en-US';
      u.rate = 0.9;
      u.pitch = 1.15;
      window.speechSynthesis.speak(u);
    }
    return 0.6;
  }

  async speakSequence(items) {
    if (this.muted) return;
    this.initContext();
    this.stopVoice();

    // Load all buffers in parallel first for seamless Web Audio scheduling
    const loaded = await Promise.all(items.map((it) => this.loadClip(it.url)));
    if (!this.ctx || loaded.some((b) => !b)) {
      const text = items.map((i) => i.fallback || '').join(' ');
      if (text) this.speakClip(items[0].url, text);
      return;
    }

    const masterGain = this.ctx.createGain();
    masterGain.gain.value = 1.05;
    masterGain.connect(this.ctx.destination);
    this.activeVoiceGain = masterGain;

    let offset = this.ctx.currentTime + 0.01;
    let lastSrc = null;
    loaded.forEach((buf, idx) => {
      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      src.connect(masterGain);
      src.start(offset);
      offset += buf.duration + (items[idx].gap ?? 0.1);
      lastSrc = src;
    });
    this.activeVoiceSource = lastSrc;
  }

  // ==================== SHARED SOFT NOISE TEXTURE ====================

  _getDrawNoiseBuffer() {
    if (this._noiseBuffer || !this.ctx) return this._noiseBuffer;
    const sampleRate = this.ctx.sampleRate || 44100;
    const length = Math.floor(sampleRate * 2.0);
    const buffer = this.ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    // Generate warm pink-tinted fibrous crayon/chalk grain noise
    let b0 = 0;
    let b1 = 0;
    let b2 = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.997 * b0 + white * 0.029;
      b1 = 0.985 * b1 + white * 0.032;
      b2 = 0.950 * b2 + white * 0.048;
      // Subtle organic board-grain micro-texture
      const grain = 0.84 + 0.16 * Math.sin(i * 0.013) * Math.sin(i * 0.0037);
      data[i] = (b0 + b1 + b2 + white * 0.18) * 1.45 * grain;
    }

    // Crossfade loop seam so continuous looping has zero clicks
    const fadeLen = 2048;
    for (let i = 0; i < fadeLen; i++) {
      const alpha = i / fadeLen;
      const tailIdx = length - fadeLen + i;
      data[tailIdx] = data[tailIdx] * (1 - alpha) + data[i] * alpha;
    }

    this._noiseBuffer = buffer;
    return buffer;
  }

  // ==================== CONTINUOUS TACTILE DRAWING BRUSH ====================

  startDrawSound() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    // Safe if called repeatedly while already active
    if (this._drawState) {
      if (this._drawState.idleTimer) {
        clearTimeout(this._drawState.idleTimer);
        this._drawState.idleTimer = null;
      }
      return;
    }

    const noiseBuf = this._getDrawNoiseBuffer();
    if (!noiseBuf) return;

    const now = this.ctx.currentTime;

    const masterGain = this.ctx.createGain();
    masterGain.gain.setValueAtTime(1.0, now);
    masterGain.connect(this.ctx.destination);

    // Filtered crayon/marker brush layer (900-1400Hz warm bandpass + gentle rolloff)
    const noiseSrc = this.ctx.createBufferSource();
    noiseSrc.buffer = noiseBuf;
    noiseSrc.loop = true;

    const bandpass = this.ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(1050, now);
    bandpass.Q.setValueAtTime(1.3, now);

    const warmthLowpass = this.ctx.createBiquadFilter();
    warmthLowpass.type = 'lowpass';
    warmthLowpass.frequency.setValueAtTime(2500, now);

    const brushGain = this.ctx.createGain();
    brushGain.gain.setValueAtTime(0.0001, now);

    noiseSrc.connect(bandpass);
    bandpass.connect(warmthLowpass);
    warmthLowpass.connect(brushGain);
    brushGain.connect(masterGain);

    // Subtle warm harmonic shimmer that rises gently along the stroke
    const shimmerOsc = this.ctx.createOscillator();
    shimmerOsc.type = 'triangle';
    shimmerOsc.frequency.setValueAtTime(380, now);

    const shimmerFilter = this.ctx.createBiquadFilter();
    shimmerFilter.type = 'lowpass';
    shimmerFilter.frequency.setValueAtTime(1350, now);

    const shimmerGain = this.ctx.createGain();
    shimmerGain.gain.setValueAtTime(0.0001, now);

    shimmerOsc.connect(shimmerFilter);
    shimmerFilter.connect(shimmerGain);
    shimmerGain.connect(masterGain);

    noiseSrc.start(now);
    shimmerOsc.start(now);

    this._drawState = {
      noiseSrc,
      bandpass,
      warmthLowpass,
      brushGain,
      shimmerOsc,
      shimmerFilter,
      shimmerGain,
      masterGain,
      idleTimer: null,
    };
  }

  updateDrawSound(speedNorm = 0, progressNorm = 0) {
    if (this.muted || !this.ctx || !this._drawState) return;

    const state = this._drawState;
    const now = this.ctx.currentTime;
    const s = Math.max(0, Math.min(1, Number.isFinite(speedNorm) ? speedNorm : 0));
    const p = Math.max(0, Math.min(1, Number.isFinite(progressNorm) ? progressNorm : 0));

    const moving = s > 0.012;
    const targetBrushGain = moving ? Math.min(0.18, 0.025 + Math.pow(s, 0.78) * 0.155) : 0.0001;
    const targetFreq = 800 + s * 800; // 800Hz -> 1600Hz
    const targetShimmerFreq = 380 + p * 380; // 380Hz -> 760Hz
    const targetShimmerGain = moving ? 0.005 + s * 0.024 : 0.0001;

    state.brushGain.gain.setTargetAtTime(targetBrushGain, now, 0.022);
    state.bandpass.frequency.setTargetAtTime(targetFreq, now, 0.028);
    state.shimmerOsc.frequency.setTargetAtTime(targetShimmerFreq, now, 0.032);
    state.shimmerGain.gain.setTargetAtTime(targetShimmerGain, now, 0.026);

    if (state.idleTimer) {
      clearTimeout(state.idleTimer);
      state.idleTimer = null;
    }

    // Smoothly decay gain toward 0 if finger stops moving for >90ms
    if (moving) {
      state.idleTimer = setTimeout(() => {
        if (!this.ctx || this._drawState !== state) return;
        const tDecay = this.ctx.currentTime;
        state.brushGain.gain.setTargetAtTime(0.0001, tDecay, 0.03);
        state.shimmerGain.gain.setTargetAtTime(0.0001, tDecay, 0.03);
      }, 90);
    }
  }

  stopDrawSound() {
    const state = this._drawState;
    if (!state) return;
    this._drawState = null;

    if (state.idleTimer) {
      clearTimeout(state.idleTimer);
      state.idleTimer = null;
    }

    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    try {
      state.masterGain.gain.cancelScheduledValues(now);
      state.masterGain.gain.setValueAtTime(Math.max(0.0001, state.masterGain.gain.value), now);
      state.masterGain.gain.linearRampToValueAtTime(0.0001, now + 0.035);
    } catch (_) {}

    setTimeout(() => {
      try { state.noiseSrc.stop(); } catch (_) {}
      try { state.shimmerOsc.stop(); } catch (_) {}
      try { state.noiseSrc.disconnect(); } catch (_) {}
      try { state.shimmerOsc.disconnect(); } catch (_) {}
      try { state.masterGain.disconnect(); } catch (_) {}
    }, 45);
  }

  // ==================== PROCEDURAL TOY SOUND EFFECTS ====================

  playTap(pitchHz = 520) {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(pitchHz, t);
    osc.frequency.exponentialRampToValueAtTime(pitchHz * 1.45, t + 0.065);
    gain.gain.setValueAtTime(0.22, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.075);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.08);
  }

  playBoing() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(240, t);
    osc.frequency.exponentialRampToValueAtTime(620, t + 0.14);
    osc.frequency.exponentialRampToValueAtTime(420, t + 0.24);
    gain.gain.setValueAtTime(0.28, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.26);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.27);
  }

  playWrongBoing() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    // Gentle, friendly soft low boing (220Hz -> 160Hz) when a dragged shape bounces back
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(236, t + 0.04);
    osc.frequency.exponentialRampToValueAtTime(160, t + 0.21);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(680, t);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.21, t + 0.018);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.23);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.24);
  }

  playCardFlip() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    // 1. Tactile card air-whoosh (~110ms)
    const noiseBuf = this._getDrawNoiseBuffer();
    if (noiseBuf) {
      const whooshSrc = this.ctx.createBufferSource();
      whooshSrc.buffer = noiseBuf;
      const bp = this.ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.Q.setValueAtTime(1.5, t);
      bp.frequency.setValueAtTime(520, t);
      bp.frequency.exponentialRampToValueAtTime(1850, t + 0.055);
      bp.frequency.exponentialRampToValueAtTime(720, t + 0.115);

      const whooshGain = this.ctx.createGain();
      whooshGain.gain.setValueAtTime(0.001, t);
      whooshGain.gain.linearRampToValueAtTime(0.17, t + 0.04);
      whooshGain.gain.exponentialRampToValueAtTime(0.001, t + 0.115);

      whooshSrc.connect(bp);
      bp.connect(whooshGain);
      whooshGain.connect(this.ctx.destination);
      whooshSrc.start(t);
      whooshSrc.stop(t + 0.12);
    }

    // 2. Soft wooden pop as the card settles (~120ms total)
    const popOsc = this.ctx.createOscillator();
    const popGain = this.ctx.createGain();
    popOsc.type = 'sine';
    popOsc.frequency.setValueAtTime(340, t + 0.045);
    popOsc.frequency.exponentialRampToValueAtTime(540, t + 0.085);
    popOsc.frequency.exponentialRampToValueAtTime(290, t + 0.12);

    popGain.gain.setValueAtTime(0.001, t);
    popGain.gain.setValueAtTime(0.2, t + 0.045);
    popGain.gain.exponentialRampToValueAtTime(0.001, t + 0.122);

    popOsc.connect(popGain);
    popGain.connect(this.ctx.destination);
    popOsc.start(t + 0.045);
    popOsc.stop(t + 0.125);
  }

  playChooChoo() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    // Cheerful two-tone wooden toy train whistle: Toot 1 (F4+A4), Toot 2 (G4+B4)
    const playWhistleChord = (freqs, start, duration) => {
      const lp = this.ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(1750, start);

      const chordGain = this.ctx.createGain();
      chordGain.gain.setValueAtTime(0.001, start);
      chordGain.gain.linearRampToValueAtTime(0.16, start + 0.028);
      chordGain.gain.setValueAtTime(0.15, start + duration - 0.055);
      chordGain.gain.exponentialRampToValueAtTime(0.001, start + duration);

      lp.connect(chordGain);
      chordGain.connect(this.ctx.destination);

      freqs.forEach((f) => {
        const osc = this.ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f * 0.96, start);
        osc.frequency.exponentialRampToValueAtTime(f, start + 0.035);
        osc.connect(lp);
        osc.start(start);
        osc.stop(start + duration + 0.01);
      });
    };

    playWhistleChord([349.23, 440.0], t, 0.21); // F4 + A4
    playWhistleChord([392.0, 493.88], t + 0.25, 0.29); // G4 + B4

    // Soft rhythmic chug-puff steam breath
    const noiseBuf = this._getDrawNoiseBuffer();
    if (noiseBuf) {
      [0.0, 0.13, 0.25, 0.4].forEach((offset, idx) => {
        const puffStart = t + offset;
        const src = this.ctx.createBufferSource();
        src.buffer = noiseBuf;

        const bp = this.ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.setValueAtTime(680 + (idx % 2) * 180, puffStart);
        bp.Q.setValueAtTime(1.8, puffStart);

        const puffGain = this.ctx.createGain();
        puffGain.gain.setValueAtTime(0.001, puffStart);
        puffGain.gain.linearRampToValueAtTime(0.075, puffStart + 0.015);
        puffGain.gain.exponentialRampToValueAtTime(0.001, puffStart + 0.075);

        src.connect(bp);
        bp.connect(puffGain);
        puffGain.connect(this.ctx.destination);
        src.start(puffStart, idx * 0.15);
        src.stop(puffStart + 0.08);
      });
    }
  }

  playPop() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    // Punchy cartoon pop
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(420 + Math.random() * 140, t);
    osc.frequency.exponentialRampToValueAtTime(110, t + 0.085);
    gain.gain.setValueAtTime(0.42, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.095);
  }

  playBubble() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    const base = 480 + Math.random() * 200;
    osc.frequency.setValueAtTime(base, t);
    osc.frequency.exponentialRampToValueAtTime(base * 2.1, t + 0.11);
    gain.gain.setValueAtTime(0.28, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.13);
  }

  playNote(freq = 523.25) {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const overtone = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const overGain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);
    overtone.type = 'triangle';
    overtone.frequency.setValueAtTime(freq * 2, t);

    gain.gain.setValueAtTime(0.32, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.48);
    overGain.gain.setValueAtTime(0.09, t);
    overGain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    osc.connect(gain);
    overtone.connect(overGain);
    gain.connect(this.ctx.destination);
    overGain.connect(this.ctx.destination);

    osc.start(t);
    overtone.start(t);
    osc.stop(t + 0.5);
    overtone.stop(t + 0.2);
  }

  playSparkle(step = 0) {
    const scale = [523.25, 587.33, 659.25, 783.99, 880, 1046.5];
    const freq = scale[step % scale.length];
    this.playNote(freq);
  }

  playFanfare() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((f, idx) => {
      setTimeout(() => this.playNote(f), idx * 85);
    });
  }

  playQuack() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(340, t);
    osc.frequency.exponentialRampToValueAtTime(510, t + 0.045);
    osc.frequency.exponentialRampToValueAtTime(280, t + 0.17);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1250, t);
    filter.frequency.exponentialRampToValueAtTime(880, t + 0.17);
    filter.Q.value = 3.2;

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.32, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.19);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.2);
  }
}

window.sound = new SoundEngine();
