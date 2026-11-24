// ============================================================================
// Sunny Park — Main Coordinator, Particle/Confetti Engine, window.FX & Modal
// ============================================================================

(() => {
  const PRAISES = ['yay', 'awesome', 'wonderful'];

  const state = {
    screen: 'hub',
    transitioning: false,
    celebrationTimer: null,
    onCelebrationReplay: null,
  };

  // ==================== PARTICLE & CONFETTI ENGINE ====================
  const canvas = document.getElementById('fx-canvas');
  const ctx = canvas.getContext('2d');
  const particles = [];
  const MAX_PARTICLES = 56;
  let canvasDirty = false;

  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  function burstConfetti(
    x = window.innerWidth / 2,
    y = window.innerHeight / 2,
    baseColor = null,
    count = 20
  ) {
    const palette = baseColor
      ? [baseColor, '#FFD600', '#FFFFFF', baseColor, '#FF3D9A', '#22C6FF']
      : ['#FF3B30', '#FFD600', '#24C958', '#22C6FF', '#8C4BFF', '#FF3D9A', '#FF8A00'];

    const actualCount = Math.min(count, 24);
    for (let i = 0; i < actualCount; i++) {
      if (particles.length >= MAX_PARTICLES) particles.shift();
      const angle = (Math.PI * 2 * i) / actualCount + (Math.random() - 0.5) * 0.42;
      const speed = 3.5 + Math.random() * 8.2;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2.4,
        size: 7 + Math.random() * 8,
        color: palette[i % palette.length],
        shape: i % 3 === 0 ? 'star' : i % 2 === 0 ? 'circle' : 'rect',
        rot: Math.random() * Math.PI * 2,
        vrot: (Math.random() - 0.5) * 0.25,
        life: 1,
        decay: 0.022 + Math.random() * 0.015,
      });
    }
  }

  function spawnRingRipple(x = window.innerWidth / 2, y = window.innerHeight / 2, color = '#FFD600') {
    particles.push({
      x,
      y,
      radius: 18,
      maxRadius: 96,
      color: color || '#FFD600',
      shape: 'ring',
      life: 1,
      decay: 0.045,
    });
  }

  function drawStar(cx, cy, r) {
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const a1 = (i * 2 * Math.PI) / 5 - Math.PI / 2;
      const a2 = a1 + Math.PI / 5;
      ctx.lineTo(cx + Math.cos(a1) * r, cy + Math.sin(a1) * r);
      ctx.lineTo(cx + Math.cos(a2) * (r * 0.46), cy + Math.sin(a2) * (r * 0.46));
    }
    ctx.closePath();
    ctx.fill();
  }

  function updateParticles() {
    if (particles.length === 0) {
      if (canvasDirty) {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        canvasDirty = false;
      }
      return;
    }
    canvasDirty = true;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life -= p.decay;
      if (p.life <= 0) {
        particles.splice(i, 1);
        continue;
      }
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life);
      if (p.shape === 'ring') {
        p.radius += (p.maxRadius - p.radius) * 0.2;
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 6 * p.life;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.25;
        p.vx *= 0.97;
        p.rot += p.vrot;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 0.55, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === 'star') {
          drawStar(0, 0, p.size * 0.76);
        } else {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
        }
      }
      ctx.restore();
    }
  }

  function cheerCompanion(target) {
    let el = target;
    if (typeof target === 'string') {
      el = target.startsWith('#') || target.startsWith('.')
        ? document.querySelector(target)
        : document.getElementById(target);
    }
    if (!el) return;
    el.classList.remove('cheer');
    void el.offsetWidth;
    el.classList.add('cheer');
    setTimeout(() => el.classList.remove('cheer'), 560);
  }

  // ==================== FULLSCREEN CELEBRATION MODAL ====================
  const celebrationOverlay = document.getElementById('celebration-overlay');
  const celebrationBadge = document.getElementById('celebration-badge');
  const celebrationTitle = document.getElementById('celebration-title');
  const celebrationCard = document.getElementById('celebration-card');

  function showCelebration(opts = {}) {
    const { badgeHtml, title = 'AWESOME!', audioUrl, onReplay } = opts;

    hideCelebration();
    state.onCelebrationReplay = typeof onReplay === 'function' ? onReplay : null;

    if (celebrationBadge) {
      if (badgeHtml) {
        celebrationBadge.innerHTML = badgeHtml;
      } else if (window.PARK_ART && typeof window.PARK_ART.celebrationTrophySvg === 'function') {
        celebrationBadge.innerHTML = window.PARK_ART.celebrationTrophySvg();
      } else if (window.PARK_ART && typeof window.PARK_ART.mascotBear === 'function') {
        celebrationBadge.innerHTML = window.PARK_ART.mascotBear('happy');
      }
    }

    if (celebrationTitle) {
      celebrationTitle.textContent = title;
      celebrationTitle.classList.toggle('hidden', !title);
    }

    if (celebrationOverlay) {
      celebrationOverlay.classList.remove('hidden');
    }
    if (celebrationCard) {
      celebrationCard.style.animation = 'none';
      void celebrationCard.offsetWidth;
      celebrationCard.style.animation = '';
    }

    window.sound?.stopDrawSound?.();
    window.sound?.playFanfare?.();
    if (audioUrl) {
      window.sound?.speakClip?.(audioUrl, title || 'Awesome!');
    } else {
      window.sound?.speakClip?.('./audio/phrases/awesome.mp3', 'Awesome!');
    }

    // Immediate celebratory twin firework burst + continuous bursts while modal is open
    const w = window.innerWidth;
    const h = window.innerHeight;
    burstConfetti(w * 0.28, h * 0.36, null, 34);
    burstConfetti(w * 0.72, h * 0.36, null, 34);

    state.celebrationTimer = setInterval(() => {
      const fx = window.innerWidth * (0.18 + Math.random() * 0.64);
      const fy = window.innerHeight * (0.18 + Math.random() * 0.5);
      burstConfetti(fx, fy, null, 24);
    }, 680);
  }

  function hideCelebration() {
    if (state.celebrationTimer) {
      clearInterval(state.celebrationTimer);
      state.celebrationTimer = null;
    }
    celebrationOverlay?.classList.add('hidden');
  }

  // Expose window.FX BEFORE initializing any game modules!
  window.FX = {
    burstConfetti,
    spawnRingRipple,
    cheerCompanion,
    showCelebration,
    hideCelebration,
  };

  // ==================== PREVENT ACCIDENTAL ZOOM / GESTURES ON IPAD ====================
  document.addEventListener('gesturestart', (e) => e.preventDefault(), { passive: false });
  document.addEventListener('contextmenu', (e) => e.preventDefault());

  let firstTouchDone = false;
  window.addEventListener(
    'pointerdown',
    () => {
      window.sound?.initContext?.();
      if (!firstTouchDone) {
        firstTouchDone = true;
        window.sound?.preloadCoreClips?.();
      }
    },
    { passive: true }
  );

  // ==================== MOUNT AMUSEMENT PARK & COMPANION ART ====================
  function mountIllustrations() {
    if (!window.PARK_ART) return;

    const sceneryEl = document.getElementById('park-scenery-bg');
    if (sceneryEl && typeof window.PARK_ART.parkScenerySvg === 'function') {
      sceneryEl.innerHTML = window.PARK_ART.parkScenerySvg();
      const svg = sceneryEl.querySelector('svg');
      if (svg) {
        svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
      }
    }

    const mountSvg = (id, fnName) => {
      const el = document.getElementById(id);
      if (el && typeof window.PARK_ART[fnName] === 'function') {
        el.innerHTML = window.PARK_ART[fnName]();
      }
    };

    mountSvg('ride-art-colors', 'rideBalloonShopSvg');
    mountSvg('ride-art-abc', 'rideAbcZooSvg');
    mountSvg('ride-art-shapes', 'rideShapesExpressSvg');
    mountSvg('ride-art-trace', 'ridePaintPavilionSvg');

    const mascotEl = document.getElementById('hub-mascot-svg');
    if (mascotEl && typeof window.PARK_ART.mascotBear === 'function') {
      mascotEl.innerHTML = window.PARK_ART.mascotBear('wink');
    }

    mountSvg('hub-hand-hint', 'pointerHand');
    mountSvg('trace-hand-hint', 'pointerHand');

    mountSvg('abc-companion', 'peekingPuppy');
    mountSvg('colors-companion', 'peekingFrog');
    mountSvg('trace-companion', 'peekingPuppy');
    mountSvg('shapes-companion', 'peekingFrog');

    // Companions giggle & cheer when tapped!
    document.querySelectorAll('.corner-companion').forEach((el) => {
      el.addEventListener('pointerdown', (ev) => {
        ev.stopPropagation();
        cheerCompanion(el);
        const rect = el.getBoundingClientRect();
        burstConfetti(rect.left + rect.width / 2, rect.top + 20, null, 16);
        window.sound?.playBoing?.();
        const phrase = PRAISES[Math.floor(Math.random() * PRAISES.length)];
        window.sound?.speakClip?.(`./audio/phrases/${phrase}.mp3`, 'Yay!');
      });
    });
  }

  // ==================== SCREEN NAVIGATION ====================
  const metaTheme = document.getElementById('meta-theme-color');
  const curtain = document.getElementById('scene-curtain');

  const THEME_COLORS = {
    hub: '#48B8F0',
    abc: '#412978',
    colors: '#2F9AE8',
    trace: '#3E2575',
    shapes: '#42B2FA',
  };

  function getGameModule(screenName) {
    if (screenName === 'abc') return window.AbcCardsGame;
    if (screenName === 'colors') return window.BalloonsGame;
    if (screenName === 'trace') return window.TraceGame;
    if (screenName === 'shapes') return window.ShapesGame;
    return null;
  }

  function switchScreen(target) {
    if (state.screen === target || state.transitioning) return;
    const nextScreenEl = document.getElementById(`screen-${target}`);
    if (!nextScreenEl) return;

    state.transitioning = true;
    hideCelebration();
    window.sound?.stopDrawSound?.();

    if (target === 'shapes' && typeof window.sound?.playChooChoo === 'function') {
      window.sound.playChooChoo();
    } else {
      window.sound?.playTap?.(600);
    }

    curtain?.classList.add('covering');

    setTimeout(() => {
      const prevModule = getGameModule(state.screen);
      prevModule?.leave?.();

      document.querySelectorAll('.screen').forEach((s) => s.classList.remove('active'));
      nextScreenEl.classList.add('active');
      state.screen = target;

      if (metaTheme && THEME_COLORS[target]) {
        metaTheme.setAttribute('content', THEME_COLORS[target]);
      }

      if (target === 'hub') {
        window.sound?.speakClip?.('./audio/phrases/lets_play.mp3', "Let's play!");
      } else {
        const nextModule = getGameModule(target);
        nextModule?.enter?.();
      }

      curtain?.classList.remove('covering');
      state.transitioning = false;
    }, 220);
  }

  // ==================== BIND GLOBAL & HUB EVENTS ====================
  function bindEvents() {
    const mascotEl = document.getElementById('hub-mascot-svg');
    const mascotBtn = document.getElementById('btn-mascot-hello');

    const greetMascot = (ev) => {
      ev.stopPropagation();
      const r = (mascotEl || ev.currentTarget).getBoundingClientRect();
      burstConfetti(r.left + r.width / 2, r.top + r.height / 2, '#FFD600', 26);
      spawnRingRipple(r.left + r.width / 2, r.top + r.height / 2, '#FFD600');

      if (mascotEl) {
        mascotEl.classList.remove('wave-jump');
        void mascotEl.offsetWidth;
        mascotEl.classList.add('wave-jump');
      }

      window.sound?.playFanfare?.();
      window.sound?.speakClip?.('./audio/phrases/welcome.mp3', 'Hi! Welcome to Sunny Park!');
      document.getElementById('hub-hand-hint')?.classList.add('hidden');
    };

    mascotEl?.addEventListener('pointerdown', greetMascot);
    mascotBtn?.addEventListener('pointerdown', greetMascot);

    // 4 Amusement Park Pavilions
    document.querySelectorAll('[data-target]').forEach((pavilion) => {
      pavilion.addEventListener('pointerdown', () => {
        const target = pavilion.getAttribute('data-target');
        const r = pavilion.getBoundingClientRect();
        burstConfetti(r.left + r.width / 2, r.top + r.height / 2, null, 22);
        switchScreen(target);
      });
    });

    // Home buttons across all screens
    document.querySelectorAll('[data-go-home]').forEach((btn) => {
      btn.addEventListener('pointerdown', () => switchScreen('hub'));
    });

    // Mute toggle
    document.getElementById('btn-sound-toggle')?.addEventListener('pointerdown', () => {
      if (!window.sound) return;
      const muted = window.sound.toggleMute();
      document.getElementById('icon-sound-on')?.classList.toggle('hidden', muted);
      document.getElementById('icon-sound-off')?.classList.toggle('hidden', !muted);
      if (!muted) window.sound.playTap?.(660);
    });

    // Celebration Modal Replay & Home buttons
    document.getElementById('btn-celebration-replay')?.addEventListener('pointerdown', (ev) => {
      ev.stopPropagation();
      const r = ev.currentTarget.getBoundingClientRect();
      burstConfetti(r.left + r.width / 2, r.top + r.height / 2, '#3EE068', 24);
      const replayFn = state.onCelebrationReplay;
      state.onCelebrationReplay = null;
      hideCelebration();
      window.sound?.playBoing?.();
      if (typeof replayFn === 'function') {
        replayFn();
      }
    });

    document.getElementById('btn-celebration-home')?.addEventListener('pointerdown', (ev) => {
      ev.stopPropagation();
      state.onCelebrationReplay = null;
      hideCelebration();
      switchScreen('hub');
    });
  }

  // ==================== MAIN 60FPS ANIMATION LOOP ====================
  function loop(now) {
    try {
      if (state.screen === 'colors') {
        window.BalloonsGame?.update?.(now);
      } else if (state.screen === 'trace') {
        window.TraceGame?.update?.(now);
      } else if (state.screen === 'shapes') {
        window.ShapesGame?.update?.(now);
      }
    } catch (_) {}
    try {
      updateParticles();
    } catch (_) {}
    requestAnimationFrame(loop);
  }

  // ==================== SERVICE WORKER REGISTRATION ====================
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    });
  }

  // ==================== BOOT SEQUENCE ====================
  mountIllustrations();
  bindEvents();

  // Initialize all game modules after window.FX and DOM illustrations are ready
  window.AbcCardsGame?.init?.();
  window.BalloonsGame?.init?.();
  window.TraceGame?.init?.();
  window.ShapesGame?.init?.();

  requestAnimationFrame(loop);
})();
