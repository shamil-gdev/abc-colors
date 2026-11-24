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
      ? [baseColor, '#FFD600', '#FFFFFF', baseColor, '#FF3D9A', '#2B6BFF']
      : ['#FF3B30', '#FFD600', '#24C958', '#2B6BFF', '#8C4BFF', '#FF3D9A', '#FF8A00'];

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

  function updateParticles(dt = 1 / 60) {
    if (particles.length === 0) {
      if (canvasDirty) {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        canvasDirty = false;
      }
      return;
    }
    const step = dt * 60;
    canvasDirty = true;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life -= p.decay * step;
      if (p.life <= 0) {
        particles.splice(i, 1);
        continue;
      }
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life);
      if (p.shape === 'ring') {
        p.radius += (p.maxRadius - p.radius) * Math.min(1, 0.2 * step);
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 6 * p.life;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        p.x += p.vx * step;
        p.y += p.vy * step;
        p.vy += 0.25 * step;
        p.vx *= Math.pow(0.97, step);
        p.rot += p.vrot * step;
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

    // Immediate celebratory twin firework burst + 3 calm follow-up bursts (capped, never infinite!)
    const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const w = window.innerWidth;
    const h = window.innerHeight;
    burstConfetti(w * 0.28, h * 0.36, null, reducedMotion ? 10 : 28);
    burstConfetti(w * 0.72, h * 0.36, null, reducedMotion ? 10 : 28);

    if (!reducedMotion) {
      let burstsLeft = 3;
      state.celebrationTimer = setInterval(() => {
        if (burstsLeft <= 0) {
          clearInterval(state.celebrationTimer);
          state.celebrationTimer = null;
          return;
        }
        burstsLeft--;
        const fx = window.innerWidth * (0.2 + Math.random() * 0.6);
        const fy = window.innerHeight * (0.2 + Math.random() * 0.45);
        burstConfetti(fx, fy, null, 20);
      }, 720);
    }
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
  let companionSleepTimer = null;

  function resetCompanionSleep() {
    document.querySelectorAll('.corner-companion.sleeping').forEach((el) => el.classList.remove('sleeping'));
    clearTimeout(companionSleepTimer);
    companionSleepTimer = setTimeout(() => {
      const activeComp = document.querySelector('.screen.active .corner-companion');
      if (activeComp) activeComp.classList.add('sleeping');
    }, 20000);
  }

  window.addEventListener(
    'pointerdown',
    (ev) => {
      window.sound?.initContext?.();
      resetCompanionSleep();
      if (!firstTouchDone) {
        firstTouchDone = true;
        window.sound?.preloadCoreClips?.();
        if (state.screen === 'hub' && !ev.target?.closest?.('[data-target]')) {
          window.sound?.speakClip?.('./audio/phrases/welcome.mp3', 'Hi! Welcome to Sunny Park!');
        }
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
    mountSvg('ride-art-ducks', 'rideDuckPondSvg');
    mountSvg('ride-art-abc', 'rideAbcZooSvg');
    mountSvg('ride-art-shapes', 'rideShapesExpressSvg');
    mountSvg('ride-art-trace', 'ridePaintPavilionSvg');

    mountSvg('trace-hand-hint', 'pointerHand');

    mountSvg('abc-companion', 'peekingPuppy');
    mountSvg('colors-companion', 'peekingFrog');
    mountSvg('trace-companion', 'peekingPuppy');
    mountSvg('shapes-companion', 'peekingFrog');
    mountSvg('ducks-companion', 'peekingPuppy');

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
    ducks: '#36B3F5',
  };

  function getGameModule(screenName) {
    if (screenName === 'abc') return window.AbcCardsGame;
    if (screenName === 'colors') return window.BalloonsGame;
    if (screenName === 'trace') return window.TraceGame;
    if (screenName === 'shapes') return window.ShapesGame;
    if (screenName === 'ducks') return window.DucksGame;
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

    if (curtain && THEME_COLORS[target]) {
      curtain.style.background = THEME_COLORS[target];
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
    // Scrollable Amusement Park Pavilions (distinguish horizontal scroll from tap!)
    const scrollViewport = document.getElementById('park-scroll-viewport');
    const scrollHint = document.getElementById('park-scroll-hint');
    scrollViewport?.addEventListener(
      'scroll',
      () => {
        if (scrollHint && scrollViewport.scrollLeft > 40) {
          scrollHint.classList.add('hidden');
        }
      },
      { passive: true }
    );

    document.querySelectorAll('[data-target]').forEach((pavilion) => {
      let downX = 0;
      let downY = 0;
      let active = false;

      pavilion.addEventListener('pointerdown', (ev) => {
        downX = ev.clientX;
        downY = ev.clientY;
        active = true;
      });
      pavilion.addEventListener('pointercancel', () => {
        active = false;
      });
      pavilion.addEventListener('pointerup', (ev) => {
        if (!active) return;
        active = false;
        if (Math.hypot(ev.clientX - downX, ev.clientY - downY) < 16) {
          const target = pavilion.getAttribute('data-target');
          const r = pavilion.getBoundingClientRect();
          burstConfetti(r.left + r.width / 2, r.top + r.height / 2, null, 20);
          switchScreen(target);
        }
      });
    });

    // Home buttons across all screens — hold ~580ms with filling progress ring
    const HOLD_MS = 580;
    document.querySelectorAll('[data-go-home]').forEach((btn) => {
      if (!btn.querySelector('.home-hold-ring')) {
        const ring = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        ring.setAttribute('class', 'home-hold-ring');
        ring.setAttribute('viewBox', '0 0 72 72');
        ring.setAttribute('aria-hidden', 'true');
        ring.innerHTML = `<circle class="home-hold-track" cx="36" cy="36" r="32"/><circle class="home-hold-fill" cx="36" cy="36" r="32"/>`;
        btn.appendChild(ring);
      }

      const fillCircle = btn.querySelector('.home-hold-fill');
      const CIRC = 2 * Math.PI * 32;
      if (fillCircle) {
        fillCircle.style.strokeDasharray = `${CIRC}`;
        fillCircle.style.strokeDashoffset = `${CIRC}`;
      }

      let holdStart = 0;
      let holdRaf = null;
      let holdActive = false;

      const cancelHold = () => {
        if (!holdActive) return;
        holdActive = false;
        btn.classList.remove('holding');
        if (holdRaf) cancelAnimationFrame(holdRaf);
        holdRaf = null;
        if (fillCircle) fillCircle.style.strokeDashoffset = `${CIRC}`;
      };

      const tickHold = (ts) => {
        if (!holdActive) return;
        const pct = Math.min(1, (ts - holdStart) / HOLD_MS);
        if (fillCircle) {
          fillCircle.style.strokeDashoffset = `${CIRC * (1 - pct)}`;
        }
        if (pct >= 1) {
          cancelHold();
          switchScreen('hub');
          return;
        }
        holdRaf = requestAnimationFrame(tickHold);
      };

      btn.addEventListener('pointerdown', (ev) => {
        ev.preventDefault();
        holdActive = true;
        holdStart = performance.now();
        btn.classList.add('holding');
        window.sound?.playTap?.(420);
        holdRaf = requestAnimationFrame(tickHold);
      });
      btn.addEventListener('pointerup', cancelHold);
      btn.addEventListener('pointerleave', cancelHold);
      btn.addEventListener('pointercancel', cancelHold);
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

  // ==================== MAIN 60/120FPS ANIMATION LOOP ====================
  let lastLoopNow = 0;
  let loggedGameErr = false;
  let loggedFxErr = false;

  function loop(now) {
    const dt = lastLoopNow ? Math.min(0.05, Math.max(0.004, (now - lastLoopNow) / 1000)) : 1 / 60;
    lastLoopNow = now;
    try {
      if (state.screen === 'colors') {
        window.BalloonsGame?.update?.(now);
      } else if (state.screen === 'trace') {
        window.TraceGame?.update?.(now);
      } else if (state.screen === 'shapes') {
        window.ShapesGame?.update?.(now);
      } else if (state.screen === 'ducks') {
        window.DucksGame?.update?.(now);
      }
    } catch (err) {
      if (!loggedGameErr) {
        loggedGameErr = true;
        console.error('Game loop error:', err);
      }
    }
    try {
      updateParticles(dt);
    } catch (err) {
      if (!loggedFxErr) {
        loggedFxErr = true;
        console.error('FX loop error:', err);
      }
    }
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
  window.DucksGame?.init?.();

  requestAnimationFrame(loop);
})();
