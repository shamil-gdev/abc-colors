// ============================================================================
// Sunny Park — Color Duck Pond Attraction (window.DucksGame)
// Swimming colored ducks in carnival pool -> catch & place in matching house!
// Optimized for old iPads: zero drop-shadow filters, native Safari touch drag.
// ============================================================================

(() => {
  function getDuckColor(cid) {
    const p = window.PALETTE?.[cid];
    if (p) {
      return { id: p.id, name: p.name, hex: p.hex, dark: p.rim, light: p.light || '#FFFFFF' };
    }
    return { id: cid, name: cid, hex: '#2B6BFF', dark: '#1847BA', light: '#73A0FF' };
  }

  const WAVES = [
    ['red', 'blue', 'green'],
    ['yellow', 'purple', 'orange'],
    ['red', 'yellow', 'green', 'blue'],
  ];

  let stageEl = null;
  let progressEl = null;
  let companionEl = null;
  let poolEl = null;
  let housesEl = null;
  let initialized = false;
  let isActive = false;

  let waveIdx = 0;
  let ducks = [];
  let houses = [];
  let activeDrag = null; // { duck, inputId, startX, startY, curX, curY, moved }
  let waveTimer = null;
  let lastUpdateNow = 0;

  function duckSvg(col, facingRight = true) {
    const flip = facingRight ? '' : 'transform="scale(-1,1) translate(-120,0)"';
    return `
      <svg viewBox="0 0 120 100" width="100%" height="100%" aria-hidden="true">
        <g ${flip}>
          <!-- Soft water ripple under duck -->
          <ellipse cx="58" cy="86" rx="40" ry="7" fill="rgba(255,255,255,0.42)"/>
          <!-- Tail & plump body -->
          <path d="M16 56 C14 44 26 42 34 50 C44 46 86 48 92 64 C96 76 80 86 56 86 C32 86 18 76 16 56 Z" fill="${col.hex}"/>
          <!-- Cute wing -->
          <path class="duck-wing-anim" d="M38 62 C46 56 64 58 66 68 C64 76 44 76 38 68 Z" fill="${col.dark}" opacity="0.38"/>
          <!-- Round head -->
          <circle cx="78" cy="36" r="24" fill="${col.hex}"/>
          <!-- Glossy forehead highlight -->
          <ellipse cx="70" cy="24" rx="8" ry="5" transform="rotate(-22 70 24)" fill="${col.light}" opacity="0.65"/>
          <!-- Orange beak -->
          <path d="M97 33 C112 32 115 41 108 45 C102 48 94 45 94 40 Z" fill="#FF9500"/>
          <path d="M97 41 C104 42 108 40 109 39" stroke="#C96400" stroke-width="2" stroke-linecap="round" fill="none"/>
          <!-- Kawaii eye -->
          <circle cx="85" cy="33" r="6" fill="#1E1B2E"/>
          <circle cx="87" cy="31" r="2.2" fill="#FFFFFF"/>
          <!-- Rosy cheek -->
          <circle cx="75" cy="43" r="5" fill="#FF8FA3" opacity="0.55"/>
        </g>
      </svg>`;
  }

  function houseSvg(col, filled = false) {
    const doorwayContent = filled
      ? `<g transform="translate(26, 56) scale(0.76)">${duckSvg(col, true)}</g>`
      : `<g opacity="0.35">
           <path d="M44 106 C44 98 54 96 60 101 C68 99 88 100 92 108 C94 116 84 122 68 122 C52 122 44 116 44 106 Z" fill="#FFFFFF"/>
           <circle cx="83" cy="92" r="13" fill="#FFFFFF"/>
           <ellipse cx="98" cy="92" rx="7" ry="4" fill="#FFFFFF"/>
         </g>`;

    return `
      <svg viewBox="0 0 144 148" width="100%" height="100%" aria-hidden="true">
        <!-- Ground shadow -->
        <ellipse cx="72" cy="140" rx="56" ry="7" fill="rgba(22, 92, 34, 0.28)"/>
        <!-- House body -->
        <rect x="20" y="56" width="104" height="82" rx="20" fill="${col.hex}" stroke="#FFFFFF" stroke-width="4"/>
        <!-- Roof + Clear Color Badge Circle -->
        <path d="M10 64 L72 14 L134 64 Z" fill="${col.dark}" stroke="#FFFFFF" stroke-width="4" stroke-linejoin="round"/>
        <circle cx="72" cy="40" r="12" fill="${col.hex}" stroke="#FFFFFF" stroke-width="3.5"/>
        <!-- Arched doorway -->
        <path d="M36 136 L36 90 C36 68 108 68 108 90 L108 136 Z" fill="rgba(24, 18, 46, 0.34)"/>
        ${doorwayContent}
      </svg>`;
  }

  function injectStyles() {
    if (document.getElementById('ducks-game-styles')) return;
    const style = document.createElement('style');
    style.id = 'ducks-game-styles';
    style.textContent = `
      .ducks-booth-wrap {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 12px;
        position: relative;
      }

      .ducks-awning {
        height: 36px;
        border-radius: 22px 22px 14px 14px;
        background: repeating-linear-gradient(
          90deg,
          #FF7A1A 0px, #FF7A1A 42px,
          #FFFFFF 42px, #FFFFFF 84px
        );
        box-shadow: 0 7px 0 rgba(180, 74, 0, 0.35);
        flex-shrink: 0;
      }

      .ducks-pool {
        position: relative;
        flex: 1.15;
        min-height: 220px;
        border-radius: 34px;
        background: linear-gradient(180deg, #4CC3FF 0%, #24A1EB 55%, #1683CC 100%);
        border: 7px solid #FF8A2B;
        box-shadow: inset 0 12px 0 rgba(255, 255, 255, 0.24), 0 10px 0 rgba(18, 92, 148, 0.22);
        overflow: visible;
        touch-action: none;
      }

      .ducks-wave-band {
        position: absolute;
        left: 10px;
        right: 10px;
        height: 14px;
        border-radius: 99px;
        background: rgba(255, 255, 255, 0.22);
        pointer-events: none;
      }
      .ducks-wave-1 { top: 28%; }
      .ducks-wave-2 { top: 62%; opacity: 0.7; }

      .duck-flip-wrap {
        width: 100%;
        height: 100%;
        transform-origin: center;
      }
      .duck-actor.facing-left .duck-flip-wrap {
        transform: scaleX(-1);
      }
      .duck-actor.dragging .duck-wing-anim {
        animation: duckWingFlap 0.22s ease-in-out infinite alternate;
        transform-origin: 52px 66px;
      }
      @keyframes duckWingFlap {
        from { transform: rotate(-14deg); }
        to   { transform: rotate(18deg); }
      }
      .duck-actor {
        position: absolute;
        left: 0;
        top: 0;
        width: 114px;
        height: 96px;
        cursor: grab;
        touch-action: none;
        will-change: transform;
        z-index: 20;
      }
      .duck-actor.dragging {
        cursor: grabbing;
        z-index: 65;
      }
      .duck-actor.flying {
        pointer-events: none;
        z-index: 60;
        transition: transform 0.44s cubic-bezier(0.26, 1.24, 0.52, 1);
      }
      .duck-actor.matched {
        opacity: 0;
        pointer-events: none;
      }

      .ducks-houses-row {
        flex: 0 0 auto;
        display: flex;
        align-items: flex-end;
        justify-content: center;
        gap: clamp(16px, 3vw, 42px);
        padding: 4px 12px 8px;
      }

      .duck-house-slot {
        width: clamp(128px, 16vw, 174px);
        height: clamp(132px, 16.5vw, 178px);
        position: relative;
        transition: transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      .duck-house-slot.highlight {
        transform: scale(1.12) translateY(-6px);
      }
      .duck-house-slot.celebrate-pop {
        animation: houseJoyPop 0.44s cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      @keyframes houseJoyPop {
        0%   { transform: scale(0.92); }
        50%  { transform: scale(1.14) translateY(-8px); }
        100% { transform: scale(1); }
      }
    `;
    document.head.appendChild(style);
  }

  function updateProgress() {
    if (!progressEl) return;
    const total = houses.length;
    const done = houses.filter((h) => h.filled).length;
    progressEl.textContent = `🦆 ${done} / ${total}`;
  }

  function buildWave(idx) {
    clearTimeout(waveTimer);
    waveIdx = idx;
    activeDrag = null;
    ducks = [];
    houses = [];

    const colorIds = WAVES[waveIdx % WAVES.length];
    stageEl.innerHTML = `
      <div class="ducks-booth-wrap">
        <div class="ducks-awning" aria-hidden="true"></div>
        <div class="ducks-pool" id="ducks-pool">
          <div class="ducks-wave-band ducks-wave-1"></div>
          <div class="ducks-wave-band ducks-wave-2"></div>
        </div>
        <div class="ducks-houses-row" id="ducks-houses-row"></div>
      </div>
    `;

    poolEl = document.getElementById('ducks-pool');
    housesEl = document.getElementById('ducks-houses-row');

    // Render colored houses at bottom
    colorIds.forEach((cid) => {
      const col = getDuckColor(cid);
      const slotEl = document.createElement('div');
      slotEl.className = 'duck-house-slot';
      slotEl.dataset.colorId = cid;
      slotEl.innerHTML = houseSvg(col, false);
      housesEl.appendChild(slotEl);
      houses.push({ colorId: cid, col, el: slotEl, filled: false });
    });

    // Spawn swimming ducks in shuffled order so matching is engaging
    const shuffled = colorIds.slice().sort(() => Math.random() - 0.5);
    const poolW = poolEl.clientWidth || Math.min(window.innerWidth - 60, 1080);
    const poolH = poolEl.clientHeight || 260;

    shuffled.forEach((cid, i) => {
      const col = getDuckColor(cid);
      const el = document.createElement('div');
      el.className = 'duck-actor';
      el.dataset.colorId = cid;
      const dir = i % 2 === 0 ? 1 : -1;
      el.classList.toggle('facing-left', dir < 0);
      el.innerHTML = `<div class="duck-flip-wrap">${duckSvg(col, true)}</div>`;

      const laneY = Math.max(18, Math.min(poolH - 110, 26 + (i % 2) * (poolH * 0.36) + (Math.random() - 0.5) * 18));
      const startX = Math.max(20, (poolW / (shuffled.length + 1)) * (i + 1) - 57);

      const duck = {
        colorId: cid,
        col,
        el,
        x: startX,
        y: laneY,
        vx: dir * (0.85 + Math.random() * 0.45),
        bobPhase: Math.random() * Math.PI * 2,
        matched: false,
        dragging: false,
        flying: false,
      };

      bindDuckInput(duck);
      el.style.transform = `translate3d(${duck.x}px, ${duck.y}px, 0)`;
      poolEl.appendChild(el);
      ducks.push(duck);
    });

    updateProgress();
  }

  function bindDuckInput(duck) {
    // Native touch for iPadOS Safari reliability
    duck.el.addEventListener(
      'touchstart',
      (ev) => {
        if (!isActive || duck.matched || duck.flying) return;
        if (!ev.touches || ev.touches.length === 0) return;
        ev.preventDefault();
        const t = ev.touches[0];
        beginDrag(duck, t.clientX, t.clientY, `touch-${t.identifier}`);
      },
      { passive: false }
    );

    duck.el.addEventListener('pointerdown', (ev) => {
      if (ev.pointerType === 'touch') return;
      if (!isActive || duck.matched || duck.flying) return;
      ev.preventDefault();
      beginDrag(duck, ev.clientX, ev.clientY, `ptr-${ev.pointerId}`);
    });
  }

  function beginDrag(duck, clientX, clientY, inputId) {
    if (activeDrag) return;
    duck.dragging = true;
    duck.el.classList.add('dragging');

    window.sound?.playQuack?.();

    activeDrag = {
      duck,
      inputId,
      startX: clientX,
      startY: clientY,
      curX: clientX,
      curY: clientY,
      moved: false,
    };
  }

  function moveDrag(clientX, clientY) {
    if (!activeDrag || !poolEl) return;
    const { duck } = activeDrag;
    const dx = clientX - activeDrag.startX;
    const dy = clientY - activeDrag.startY;
    if (Math.hypot(dx, dy) > 12) activeDrag.moved = true;

    activeDrag.curX = clientX;
    activeDrag.curY = clientY;

    const poolRect = poolEl.getBoundingClientRect();
    const x = clientX - poolRect.left - 57;
    const y = clientY - poolRect.top - 48;
    duck.el.style.transform = `translate3d(${x}px, ${y}px, 0) scale(1.14)`;

    // Highlight matching house when hovering near it
    houses.forEach((h) => {
      if (h.filled) return;
      const r = h.el.getBoundingClientRect();
      const d = Math.hypot(clientX - (r.left + r.width / 2), clientY - (r.top + r.height / 2));
      h.el.classList.toggle('highlight', d < 115 && h.colorId === duck.colorId);
    });
  }

  function endDrag() {
    if (!activeDrag) return;
    const drag = activeDrag;
    activeDrag = null;
    const { duck, curX, curY, moved } = drag;

    duck.dragging = false;
    duck.el.classList.remove('dragging');
    houses.forEach((h) => h.el.classList.remove('highlight'));

    const matchHouse = houses.find((h) => h.colorId === duck.colorId && !h.filled);

    // Forgiving tap: fly duck straight into its matching color house!
    if (!moved && matchHouse) {
      flyDuckToHouse(duck, matchHouse);
      return;
    }

    // Check drop distance against all unfilled houses
    let closest = null;
    let closestDist = Infinity;
    houses.forEach((h) => {
      if (h.filled) return;
      const r = h.el.getBoundingClientRect();
      const d = Math.hypot(curX - (r.left + r.width / 2), curY - (r.top + r.height / 2));
      if (d < closestDist) {
        closestDist = d;
        closest = h;
      }
    });

    if (closest && closestDist < 125) {
      if (closest.colorId === duck.colorId) {
        seatDuckInHouse(duck, closest);
      } else {
        window.sound?.playWrongBoing?.();
        duck.el.style.transform = `translate3d(${duck.x}px, ${duck.y}px, 0)`;
      }
    } else {
      // Returned to pond
      duck.el.style.transform = `translate3d(${duck.x}px, ${duck.y}px, 0)`;
    }
  }

  function flyDuckToHouse(duck, house) {
    if (!poolEl) return;
    duck.flying = true;
    duck.el.classList.add('flying');

    const poolRect = poolEl.getBoundingClientRect();
    const houseRect = house.el.getBoundingClientRect();
    const tx = houseRect.left - poolRect.left + houseRect.width / 2 - 57;
    const ty = houseRect.top - poolRect.top + houseRect.height / 2 - 48;

    duck.el.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(0.95)`;
    setTimeout(() => {
      if (!isActive || house.filled) return;
      seatDuckInHouse(duck, house);
    }, 430);
  }

  function seatDuckInHouse(duck, house) {
    duck.matched = true;
    duck.flying = false;
    duck.el.classList.add('matched');

    house.filled = true;
    house.el.innerHTML = houseSvg(house.col, true);
    house.el.classList.add('celebrate-pop');

    const r = house.el.getBoundingClientRect();
    window.FX?.burstConfetti?.(r.left + r.width / 2, r.top + r.height / 2, house.col.hex, 22);
    window.FX?.spawnRingRipple?.(r.left + r.width / 2, r.top + r.height / 2, house.col.hex);
    if (companionEl) window.FX?.cheerCompanion?.(companionEl);

    window.sound?.playSparkle?.(houses.filter((h) => h.filled).length);
    window.sound?.speakClip?.(`./audio/colors/${house.colorId}.mp3`, house.col.name);

    updateProgress();

    // Check if all houses in current wave are filled
    if (houses.every((h) => h.filled)) {
      window.sound?.playFanfare?.();
      waveTimer = setTimeout(() => {
        if (!isActive) return;
        if (waveIdx + 1 < WAVES.length) {
          buildWave(waveIdx + 1);
        } else {
          const badgeHtml = window.PARK_ART?.celebrationTrophySvg
            ? window.PARK_ART.celebrationTrophySvg()
            : '🏆';
          window.FX?.showCelebration?.({
            badgeHtml,
            title: 'QUACK-TASTIC!',
            audioUrl: './audio/phrases/all_colors.mp3',
            onReplay: () => buildWave(0),
          });
        }
      }, 950);
    }
  }

  function bindGlobalListeners() {
    window.addEventListener(
      'touchmove',
      (ev) => {
        if (!activeDrag || !String(activeDrag.inputId).startsWith('touch-')) return;
        if (!ev.touches || ev.touches.length === 0) return;
        ev.preventDefault();
        let t = ev.touches[0];
        for (let i = 0; i < ev.touches.length; i++) {
          if (`touch-${ev.touches[i].identifier}` === activeDrag.inputId) {
            t = ev.touches[i];
            break;
          }
        }
        moveDrag(t.clientX, t.clientY);
      },
      { passive: false }
    );

    const onGlobalTouchEnd = (ev) => {
      if (!activeDrag || !String(activeDrag.inputId).startsWith('touch-')) return;
      if (ev.changedTouches) {
        let matchedEnded = false;
        for (let i = 0; i < ev.changedTouches.length; i++) {
          if (`touch-${ev.changedTouches[i].identifier}` === activeDrag.inputId) {
            matchedEnded = true;
            break;
          }
        }
        if (!matchedEnded) return;
      }
      endDrag();
    };
    window.addEventListener('touchend', onGlobalTouchEnd, { passive: false });
    window.addEventListener('touchcancel', onGlobalTouchEnd, { passive: false });

    window.addEventListener('pointermove', (ev) => {
      if (ev.pointerType === 'touch') return;
      if (!activeDrag || activeDrag.inputId !== `ptr-${ev.pointerId}`) return;
      moveDrag(ev.clientX, ev.clientY);
    });

    const onGlobalPointerUp = (ev) => {
      if (ev.pointerType === 'touch') return;
      if (!activeDrag || activeDrag.inputId !== `ptr-${ev.pointerId}`) return;
      endDrag();
    };
    window.addEventListener('pointerup', onGlobalPointerUp);
    window.addEventListener('pointercancel', onGlobalPointerUp);
  }

  function update(now) {
    if (!isActive || !poolEl) return;
    const t = typeof now === 'number' ? now : performance.now();
    const dt = lastUpdateNow ? Math.min(0.05, Math.max(0.004, (t - lastUpdateNow) / 1000)) : 1 / 60;
    lastUpdateNow = t;
    const step = dt * 60;
    const poolW = poolEl.clientWidth || 900;

    for (let i = 0; i < ducks.length; i++) {
      const d = ducks[i];
      if (d.matched || d.dragging || d.flying) continue;
      d.bobPhase += 0.05 * step;
      d.x += d.vx * step;

      if (d.x < 14) {
        d.x = 14;
        d.vx = Math.abs(d.vx);
        d.el.classList.remove('facing-left');
      } else if (d.x > poolW - 128) {
        d.x = poolW - 128;
        d.vx = -Math.abs(d.vx);
        d.el.classList.add('facing-left');
      }

      const bobY = d.y + Math.sin(d.bobPhase) * 5.5;
      const tilt = Math.cos(d.bobPhase) * 3;
      d.el.style.transform = `translate3d(${d.x.toFixed(1)}px, ${bobY.toFixed(1)}px, 0) rotate(${tilt.toFixed(1)}deg)`;
    }
  }

  function init() {
    if (initialized) return;
    stageEl = document.getElementById('ducks-stage');
    progressEl = document.getElementById('ducks-progress-pill');
    companionEl = document.getElementById('ducks-companion');
    if (!stageEl) return;
    initialized = true;
    injectStyles();
    bindGlobalListeners();
  }

  function enter() {
    init();
    isActive = true;
    buildWave(0);
    window.sound?.playQuack?.();
    window.sound?.speakClip?.('./audio/phrases/colors_mode.mp3', 'Colors!');
  }

  function leave() {
    isActive = false;
    activeDrag = null;
    clearTimeout(waveTimer);
  }

  window.DucksGame = { init, enter, leave, update };
})();
