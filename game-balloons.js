// ============================================================================
// Sunny Park — Balloon Pop Carnival (Colors, Letters A–Z, Numbers 1–10)
// Exports window.BalloonsGame = { init, enter, leave, update }
// ============================================================================

(() => {
  const MODE_META = {
    colors: {
      icon: '🎨',
      introAudio: './audio/phrases/colors_mode.mp3',
      introFallback: 'Colors!',
      winAudio: './audio/phrases/all_colors.mp3',
      winTitle: 'ALL COLORS!',
    },
    letters: {
      icon: '🔤',
      introAudio: './audio/phrases/letters_mode.mp3',
      introFallback: 'Letters!',
      winAudio: './audio/phrases/all_letters.mp3',
      winTitle: 'ALL LETTERS!',
    },
    numbers: {
      icon: '🔢',
      introAudio: './audio/phrases/numbers_mode.mp3',
      introFallback: 'Numbers!',
      winAudio: './audio/phrases/all_numbers.mp3',
      winTitle: '1 TO 10!',
    },
  };

  const TARGET_ON_SCREEN = 7; // Keep 6–8 big balloons floating gently
  const MAX_ON_SCREEN = 8;
  const MIN_ON_SCREEN = 6;

  let initialized = false;
  let isActive = false;
  let mode = 'colors'; // 'colors' | 'letters' | 'numbers'
  let poppedIds = new Set();
  let balloons = [];
  let celebrating = false;
  let lastSpawnAt = 0;
  let lastUpdateAt = 0;
  let externalLoopSeenAt = 0;
  let fallbackRafId = null;
  let celebrationTimer = null;
  let clearTimers = [];

  let screenEl = null;
  let playfieldEl = null;
  let progressPillEl = null;
  let companionEl = null;

  function injectStyles() {
    if (document.getElementById('balloons-game-styles')) return;
    const style = document.createElement('style');
    style.id = 'balloons-game-styles';
    style.textContent = `
      #balloon-playfield {
        position: relative;
        flex: 1;
        width: 100%;
        min-height: 0;
        overflow: visible;
        touch-action: none;
        user-select: none;
        -webkit-user-select: none;
      }

      .carnival-balloon {
        position: absolute;
        left: 0;
        top: 0;
        will-change: transform;
        cursor: pointer;
        touch-action: none;
        user-select: none;
        -webkit-user-select: none;
        filter: drop-shadow(0 10px 14px rgba(13, 56, 104, 0.22));
      }

      .carnival-balloon-inner {
        width: 100%;
        height: 100%;
        animation: balloonSpawnPop 0.34s cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      @keyframes balloonSpawnPop {
        0% { transform: scale(0.55); opacity: 0; }
        100% { transform: scale(1); opacity: 1; }
      }

      .balloon-label-text {
        font-family: var(--font-kid, 'Fredoka', ui-rounded, sans-serif);
        font-weight: 700;
        fill: #FFFFFF;
        paint-order: stroke fill;
        stroke: rgba(20, 16, 46, 0.28);
        stroke-width: 5px;
        stroke-linejoin: round;
      }

      .balloon-new-star-badge {
        position: fixed;
        pointer-events: none;
        z-index: 88;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 6px 14px;
        border-radius: 999px;
        background: linear-gradient(180deg, #FFE548 0%, #FFB800 100%);
        color: #2B1D4E;
        font-family: var(--font-kid, 'Fredoka', sans-serif);
        font-size: 24px;
        font-weight: 700;
        border: 3.5px solid #FFFFFF;
        box-shadow: 0 6px 16px rgba(255, 184, 0, 0.55);
        transform: translate(-50%, -50%);
        animation: balloonBadgeFloat 0.82s cubic-bezier(0.22, 1, 0.36, 1) forwards;
      }

      @keyframes balloonBadgeFloat {
        0%   { opacity: 0; transform: translate(-50%, -20%) scale(0.5); }
        28%  { opacity: 1; transform: translate(-50%, -70%) scale(1.16); }
        100% { opacity: 0; transform: translate(-50%, -135%) scale(0.95); }
      }

      #balloon-progress-pill.pill-sparkle-bump {
        animation: progressPillBump 0.38s cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      @keyframes progressPillBump {
        0%   { transform: scale(1); }
        45%  { transform: scale(1.15); box-shadow: 0 0 20px rgba(255, 224, 66, 0.85); }
        100% { transform: scale(1); }
      }
    `;
    document.head.appendChild(style);
  }

  // Normalize current mode's item pool into a uniform descriptor array:
  // { key, mode, hex, rim, textDark, label, audioUrl, fallback, freq }
  function getModePool() {
    if (mode === 'letters') {
      const list = window.ABC_DATA || [];
      return list.map((item) => {
        const upper = String(item.letter || 'A').toUpperCase();
        const lower = upper.toLowerCase();
        return {
          key: upper,
          mode: 'letters',
          hex: item.color || item.cardBg || '#FF3B30',
          rim: 'rgba(0,0,0,0.18)',
          textDark: false,
          label: upper,
          audioUrl: `./audio/letters/${lower}.mp3`,
          fallback: upper,
        };
      });
    }

    if (mode === 'numbers') {
      const list = window.NUMBER_DATA || [];
      return list.map((item, idx) => {
        const numVal = item.num ?? (idx + 1);
        const rawId = item.id ?? numVal;
        const audioId = /^\d+$/.test(String(rawId)) ? rawId : numVal;
        return {
          key: String(rawId),
          mode: 'numbers',
          hex: item.hex || '#2B6BFF',
          rim: item.rim || 'rgba(0,0,0,0.18)',
          textDark: false,
          label: String(numVal),
          audioUrl: `./audio/numbers/${audioId}.mp3`,
          fallback: item.word || String(numVal),
        };
      });
    }

    // Default: 'colors'
    const list = window.COLOR_DATA || [];
    return list.map((col) => ({
      key: col.id,
      mode: 'colors',
      hex: col.hex,
      rim: col.rim || 'rgba(0,0,0,0.16)',
      textDark: Boolean(col.textDark),
      label: '',
      audioUrl: `./audio/colors/${col.id}.mp3`,
      fallback: col.name,
      freq: col.freq,
    }));
  }

  function buildBalloonSvg(desc) {
    const isWhite = desc.hex.toUpperCase() === '#FFFFFF' || desc.key === 'white';
    const outlineAttr = isWhite
      ? `stroke="#C6DCF5" stroke-width="3.5"`
      : `stroke="rgba(255,255,255,0.28)" stroke-width="2"`;

    let centerArt = '';
    if (desc.mode === 'colors') {
      const faceColor = desc.textDark ? '#2B1D4E' : '#FFFFFF';
      const cheekColor = desc.key === 'red' || desc.key === 'pink' ? '#FFE066' : '#FF8FB1';
      centerArt = `
        <ellipse cx="38" cy="68" rx="7.5" ry="5" fill="${cheekColor}" opacity="0.55"/>
        <ellipse cx="82" cy="68" rx="7.5" ry="5" fill="${cheekColor}" opacity="0.55"/>
        <circle cx="45" cy="59" r="5.5" fill="${faceColor}"/>
        <circle cx="47" cy="57" r="2" fill="${desc.textDark ? '#FFFFFF' : 'rgba(255,255,255,0.9)'}"/>
        <circle cx="75" cy="59" r="5.5" fill="${faceColor}"/>
        <circle cx="77" cy="57" r="2" fill="${desc.textDark ? '#FFFFFF' : 'rgba(255,255,255,0.9)'}"/>
        <path d="M51 70 Q60 80 69 70" stroke="${faceColor}" stroke-width="4.4" stroke-linecap="round" fill="none"/>
      `;
    } else {
      const fontSize = desc.label.length >= 2 ? 50 : 60;
      centerArt = `
        <text x="60" y="63"
              text-anchor="middle"
              dominant-baseline="central"
              font-size="${fontSize}"
              class="balloon-label-text">${desc.label}</text>
      `;
    }

    return `
      <div class="carnival-balloon-inner">
        <svg viewBox="0 0 120 152" width="100%" height="100%" overflow="visible">
          <!-- Curly floating string -->
          <path d="M60 116 Q51 131 63 142 Q69 147 59 152"
                stroke="rgba(255,255,255,0.86)" stroke-width="3.4" stroke-linecap="round" fill="none"/>
          <!-- Balloon knot -->
          <polygon points="52,111 68,111 60,120" fill="${desc.hex}"/>
          <!-- Main glossy balloon body -->
          <ellipse cx="60" cy="58" rx="48" ry="54" fill="${desc.hex}" ${outlineAttr}/>
          <!-- Subtle bottom rim shading for 3D toy volume -->
          <path d="M20 78 C30 105 90 105 100 78 C90 96 30 96 20 78 Z"
                fill="rgba(0,0,0,0.12)"/>
          <!-- Glossy specular highlight -->
          <ellipse cx="38" cy="34" rx="10.5" ry="19" transform="rotate(-22 38 34)"
                   fill="rgba(255,255,255,0.52)"/>
          <circle cx="31" cy="54" r="4" fill="rgba(255,255,255,0.62)"/>
          ${centerArt}
        </svg>
      </div>
    `;
  }

  function updateProgressPill(bump = false) {
    if (!progressPillEl) {
      progressPillEl = document.getElementById('balloon-progress-pill');
    }
    if (!progressPillEl) return;

    const pool = getModePool();
    const total = pool.length || 10;
    const meta = MODE_META[mode] || MODE_META.colors;
    progressPillEl.textContent = `${meta.icon} ⭐ ${poppedIds.size} / ${total}`;

    if (bump) {
      progressPillEl.classList.remove('pill-sparkle-bump');
      void progressPillEl.offsetWidth;
      progressPillEl.classList.add('pill-sparkle-bump');
    }
  }

  function syncModeButtons() {
    document.querySelectorAll('[data-balloon-mode]').forEach((btn) => {
      const btnMode = btn.getAttribute('data-balloon-mode');
      const active = btnMode === mode;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  // Smart unpopped item picker:
  // 85% of the time pick randomly from remaining unpopped items not already floating on screen!
  function pickSmartDescriptor() {
    const pool = getModePool();
    if (!pool.length) return null;

    const floatingKeys = new Set(balloons.map((b) => b.desc.key));
    const unpoppedNotFloating = pool.filter(
      (it) => !poppedIds.has(it.key) && !floatingKeys.has(it.key)
    );
    const unpoppedAny = pool.filter((it) => !poppedIds.has(it.key));

    if (Math.random() < 0.85) {
      if (unpoppedNotFloating.length > 0) {
        return unpoppedNotFloating[Math.floor(Math.random() * unpoppedNotFloating.length)];
      }
      if (unpoppedAny.length > 0) {
        return unpoppedAny[Math.floor(Math.random() * unpoppedAny.length)];
      }
    }

    return pool[Math.floor(Math.random() * pool.length)];
  }

  function spawnBalloon(fromBottom = true, slotIndex = -1, totalSeedSlots = 7) {
    if (!playfieldEl || celebrating || balloons.length >= MAX_ON_SCREEN) return;

    const desc = pickSmartDescriptor();
    if (!desc) return;

    const rect = playfieldEl.getBoundingClientRect();
    const fieldW = Math.max(320, rect.width || window.innerWidth - 36);
    const fieldH = Math.max(260, rect.height || window.innerHeight - 150);

    // Big toddler-friendly balloon size: 105–128px
    const size = 105 + Math.random() * 23;
    const height = size * 1.25;

    let x;
    if (slotIndex >= 0 && totalSeedSlots > 0) {
      const colWidth = (fieldW - size - 24) / Math.max(1, totalSeedSlots - 1);
      x = 12 + slotIndex * colWidth + (Math.random() - 0.5) * 28;
      x = Math.max(10, Math.min(fieldW - size - 10, x));
    } else {
      // Pick X that avoids stacking tightly on existing bottom balloons
      let bestX = 14 + Math.random() * Math.max(20, fieldW - size - 28);
      let bestMinDist = -1;
      for (let attempt = 0; attempt < 5; attempt++) {
        const candidateX = 14 + Math.random() * Math.max(20, fieldW - size - 28);
        let minDist = Infinity;
        for (const other of balloons) {
          const d = Math.hypot(candidateX - other.x, fieldH - other.y);
          if (d < minDist) minDist = d;
        }
        if (minDist > bestMinDist) {
          bestMinDist = minDist;
          bestX = candidateX;
        }
      }
      x = bestX;
    }

    const y = fromBottom
      ? fieldH + 14 + Math.random() * 54
      : 28 + ((slotIndex % 3) * 0.24 + Math.random() * 0.18) * Math.max(120, fieldH - height - 30);

    const el = document.createElement('div');
    el.className = 'carnival-balloon';
    el.style.width = `${size}px`;
    el.style.height = `${height}px`;
    el.innerHTML = buildBalloonSvg(desc);

    const balloon = {
      el,
      desc,
      size,
      height,
      x,
      y,
      vy: -(1.12 + Math.random() * 0.62),
      vx: (Math.random() - 0.5) * 0.65,
      wobblePhase: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.024 + Math.random() * 0.018,
    };

    el.style.transform = `translate3d(${balloon.x}px, ${balloon.y}px, 0)`;

    // Direct multi-touch pointerdown on balloon
    el.addEventListener('pointerdown', (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      popBalloon(balloon, ev.clientX, ev.clientY);
    });

    playfieldEl.appendChild(el);
    balloons.push(balloon);
  }

  function spawnNewItemBadge(clientX, clientY) {
    const badge = document.createElement('div');
    badge.className = 'balloon-new-star-badge';
    badge.innerHTML = '<span>⭐</span><span>✓</span>';
    badge.style.left = `${clientX}px`;
    badge.style.top = `${clientY}px`;
    document.body.appendChild(badge);
    setTimeout(() => badge.remove(), 850);
  }

  function popBalloon(balloon, clientX, clientY) {
    const idx = balloons.indexOf(balloon);
    if (idx === -1) return;
    balloons.splice(idx, 1);
    balloon.el.remove();

    const { desc } = balloon;
    const isNewItem = !poppedIds.has(desc.key);
    if (isNewItem) {
      poppedIds.add(desc.key);
    }

    // Visual bursts
    window.FX?.spawnRingRipple?.(clientX, clientY, desc.hex);
    window.FX?.burstConfetti?.(clientX, clientY, desc.hex, isNewItem ? 28 : 18);
    if (companionEl) {
      window.FX?.cheerCompanion?.(companionEl);
    }

    // Sound + Speech
    window.sound?.playPop?.();
    if (isNewItem) {
      window.sound?.playSparkle?.(poppedIds.size - 1);
      spawnNewItemBadge(clientX, clientY);
      updateProgressPill(true);
    }
    window.sound?.speakClip?.(desc.audioUrl, desc.fallback);

    const total = getModePool().length;
    if (!celebrating && total > 0 && poppedIds.size >= total) {
      triggerRoundComplete();
      return;
    }

    // Keep 6–8 balloons floating on screen
    if (!celebrating && balloons.length < MIN_ON_SCREEN) {
      spawnBalloon(true);
    }
  }

  function clearPendingTimers() {
    if (celebrationTimer) {
      clearTimeout(celebrationTimer);
      celebrationTimer = null;
    }
    while (clearTimers.length) {
      clearTimeout(clearTimers.pop());
    }
  }

  function triggerRoundComplete() {
    celebrating = true;
    clearPendingTimers();

    // Pop any remaining floating balloons with happy staggered mini-bursts!
    const leftovers = balloons.slice();
    balloons = [];
    leftovers.forEach((b, i) => {
      const tid = setTimeout(() => {
        const r = b.el.getBoundingClientRect();
        if (r.width > 0) {
          window.FX?.burstConfetti?.(r.left + r.width / 2, r.top + r.height * 0.45, b.desc.hex, 16);
          window.sound?.playPop?.();
        }
        b.el.remove();
      }, 90 + i * 75);
      clearTimers.push(tid);
    });

    const delayMs = Math.max(580, 160 + leftovers.length * 75 + 320);
    celebrationTimer = setTimeout(() => {
      celebrationTimer = null;
      if (!isActive) return;
      const meta = MODE_META[mode] || MODE_META.colors;
      const badgeHtml = window.PARK_ART?.celebrationTrophySvg
        ? window.PARK_ART.celebrationTrophySvg()
        : '🏆';

      if (window.FX?.showCelebration) {
        window.FX.showCelebration({
          badgeHtml,
          title: meta.winTitle,
          audioUrl: meta.winAudio,
          onReplay: () => resetRound(true),
        });
      } else {
        window.sound?.playFanfare?.();
        window.sound?.speakClip?.(meta.winAudio, meta.winTitle);
        setTimeout(() => {
          if (isActive) resetRound(true);
        }, 2200);
      }
    }, delayMs);
  }

  function clearAllBalloons() {
    for (const b of balloons) {
      b.el.remove();
    }
    balloons = [];
  }

  function seedInitialBalloons() {
    for (let i = 0; i < TARGET_ON_SCREEN; i++) {
      spawnBalloon(false, i, TARGET_ON_SCREEN);
    }
    lastSpawnAt = performance.now();
  }

  function resetRound(seedImmediately = true) {
    clearPendingTimers();
    celebrating = false;
    poppedIds = new Set();
    clearAllBalloons();
    updateProgressPill(false);
    if (seedImmediately && isActive) {
      seedInitialBalloons();
    }
  }

  function setMode(nextMode, announce = true) {
    if (!MODE_META[nextMode]) return;
    mode = nextMode;
    syncModeButtons();
    resetRound(true);
    if (announce) {
      const meta = MODE_META[mode];
      window.sound?.playTap?.(620);
      window.sound?.speakClip?.(meta.introAudio, meta.introFallback);
    }
  }

  // Forgiving 26px proximity touch handler on #balloon-playfield
  function onPlayfieldPointerDown(ev) {
    if (!playfieldEl || celebrating || !balloons.length) return;
    const rect = playfieldEl.getBoundingClientRect();
    const tx = ev.clientX - rect.left;
    const ty = ev.clientY - rect.top;

    let closest = null;
    let closestDist = Infinity;

    for (const b of balloons) {
      const cx = b.x + b.size * 0.5;
      const cy = b.y + b.size * 0.48;
      const hitRadius = b.size * 0.52 + 26; // Forgiving +26px toddler cushion
      const dist = Math.hypot(tx - cx, ty - cy);
      if (dist <= hitRadius && dist < closestDist) {
        closest = b;
        closestDist = dist;
      }
    }

    if (closest) {
      ev.preventDefault();
      popBalloon(closest, ev.clientX, ev.clientY);
    }
  }

  function stepSimulation(now) {
    if (!isActive || !playfieldEl) return;

    const dtRaw = lastUpdateAt ? now - lastUpdateAt : 16.667;
    if (dtRaw < 4) return; // Prevent duplicate step if called twice in same frame
    lastUpdateAt = now;
    const dt = Math.min(2.2, Math.max(0.4, dtRaw / 16.667));

    const rect = playfieldEl.getBoundingClientRect();
    const fieldW = Math.max(320, rect.width || window.innerWidth - 36);

    if (!celebrating) {
      const spawnInterval = balloons.length < MIN_ON_SCREEN ? 420 : 880;
      if (now - lastSpawnAt >= spawnInterval && balloons.length < TARGET_ON_SCREEN) {
        spawnBalloon(true);
        lastSpawnAt = now;
      }
    }

    for (let i = balloons.length - 1; i >= 0; i--) {
      const b = balloons[i];
      b.wobblePhase += b.wobbleSpeed * dt;
      b.y += b.vy * dt;
      b.x += (Math.sin(b.wobblePhase) * 0.72 + b.vx * 0.35) * dt;

      if (b.x < 8) {
        b.x = 8;
        b.vx = Math.abs(b.vx);
      } else if (b.x > fieldW - b.size - 8) {
        b.x = fieldW - b.size - 8;
        b.vx = -Math.abs(b.vx);
      }

      // Remove once floated cleanly past top edge so fresh smart-spawned balloon replaces it
      if (b.y < -b.height - 16) {
        b.el.remove();
        balloons.splice(i, 1);
        continue;
      }

      const tilt = Math.sin(b.wobblePhase) * 4.8;
      b.el.style.transform = `translate3d(${b.x.toFixed(1)}px, ${b.y.toFixed(1)}px, 0) rotate(${tilt.toFixed(2)}deg)`;
    }
  }

  function update(now) {
    const t = typeof now === 'number' ? now : performance.now();
    externalLoopSeenAt = t;
    stepSimulation(t);
  }

  function startFallbackLoop() {
    stopFallbackLoop();
    const tick = (now) => {
      if (!isActive) return;
      // Only step internally if main shell hasn't called BalloonsGame.update() recently
      if (now - externalLoopSeenAt > 50) {
        stepSimulation(now);
      }
      fallbackRafId = requestAnimationFrame(tick);
    };
    fallbackRafId = requestAnimationFrame(tick);
  }

  function stopFallbackLoop() {
    if (fallbackRafId !== null) {
      cancelAnimationFrame(fallbackRafId);
      fallbackRafId = null;
    }
  }

  function init() {
    if (initialized) return;
    initialized = true;

    injectStyles();

    screenEl = document.getElementById('screen-colors');
    playfieldEl = document.getElementById('balloon-playfield');
    progressPillEl = document.getElementById('balloon-progress-pill');
    companionEl = document.getElementById('colors-companion');

    if (companionEl && !companionEl.innerHTML.trim() && window.PARK_ART?.peekingFrog) {
      companionEl.innerHTML = window.PARK_ART.peekingFrog();
    }

    // Bind top mode switcher buttons (colors / letters / numbers)
    document.querySelectorAll('[data-balloon-mode]').forEach((btn) => {
      btn.addEventListener('pointerdown', (ev) => {
        ev.preventDefault();
        const chosen = btn.getAttribute('data-balloon-mode');
        if (chosen) {
          setMode(chosen, true);
        }
      });
    });

    if (playfieldEl) {
      playfieldEl.addEventListener('pointerdown', onPlayfieldPointerDown);
    }

    syncModeButtons();
    updateProgressPill(false);
  }

  function enter() {
    if (!initialized) init();
    isActive = true;
    lastUpdateAt = 0;

    playfieldEl = document.getElementById('balloon-playfield');
    progressPillEl = document.getElementById('balloon-progress-pill');
    companionEl = document.getElementById('colors-companion');

    syncModeButtons();
    updateProgressPill(false);

    const total = getModePool().length;
    if (celebrating || (total > 0 && poppedIds.size >= total)) {
      resetRound(true);
    } else if (balloons.length === 0) {
      seedInitialBalloons();
    }

    const meta = MODE_META[mode] || MODE_META.colors;
    window.sound?.speakClip?.('./audio/phrases/pop_balloons.mp3', meta.introFallback);

    startFallbackLoop();
  }

  function leave() {
    isActive = false;
    stopFallbackLoop();
    clearPendingTimers();
  }

  window.BalloonsGame = {
    init,
    enter,
    leave,
    update,
  };
})();
