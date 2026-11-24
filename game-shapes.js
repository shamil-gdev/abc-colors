// ============================================================================
// Sunny Park — Shapes Carnival Ride (Train & Swinging Carnival Ship)
// Inspired by Reference Images 6 & 7:
//   Wave 1: Red Amusement Park Train on Wooden Tracks (Circle, Heart, Square)
//   Wave 2: Red Swinging Carnival Ship with Bear & Pink Bunny (Triangle, Star, Oval)
//   Wave 3: Sunny Park Express Train (Diamond, Rectangle, Star/Heart)
// Supports BOTH Drag-and-Drop AND Simple Toddler Tap-to-Fly!
// Exports window.ShapesGame = { init, enter, leave }
// ============================================================================

(() => {
  const DEFAULT_WAVE_PLANS = [
    { ride: 'train', express: false, icon: '🚂', ids: ['circle', 'heart', 'square'] },
    { ride: 'ship', express: false, icon: '⛵', ids: ['triangle', 'star', 'oval'] },
    { ride: 'train', express: true, icon: '🚂', ids: ['diamond', 'rectangle', 'star'] },
  ];

  const SNAP_RADIUS_PX = 115;
  const WRONG_RADIUS_PX = 108;
  const TAP_MOVE_THRESHOLD_PX = 14;

  let initialized = false;
  let isActive = false;
  let waves = [];
  let waveIndex = 0;
  let waveTransitioning = false;
  let roundCompleted = false;
  let matchedCount = 0;

  let stageEl = null;
  let progressPillEl = null;
  let companionEl = null;
  let skyLayerEl = null;
  let rideLayerEl = null;
  let handHintEl = null;

  let slotRecords = []; // { shape, slotEl, filled }
  let actorRecords = []; // { shape, spotEl, actorEl, bobEl, matched, flying }
  let timers = [];
  let idleHintTimer = null;

  function scheduleTimer(fn, ms) {
    const id = setTimeout(() => {
      timers = timers.filter((t) => t !== id);
      fn();
    }, ms);
    timers.push(id);
    return id;
  }

  function clearAllTimers() {
    while (timers.length) {
      clearTimeout(timers.pop());
    }
    if (idleHintTimer) {
      clearTimeout(idleHintTimer);
      idleHintTimer = null;
    }
  }

  function injectStyles() {
    if (document.getElementById('shapes-balloons-styles')) return;
    const style = document.createElement('style');
    style.id = 'shapes-balloons-styles';
    style.textContent = `
      #shapes-stage {
        position: relative;
        flex: 1;
        width: 100%;
        min-height: 0;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        overflow: visible;
        user-select: none;
        -webkit-user-select: none;
        touch-action: none;
      }

      /* Full-bleed Sunny Amusement Park Scenery */
      .shapes-park-scenery {
        position: absolute;
        left: -36px;
        right: -36px;
        top: -105px;
        bottom: -28px;
        pointer-events: none;
        z-index: 0;
        overflow: hidden;
      }
      .shapes-park-scenery svg {
        width: 100%;
        height: 100%;
        display: block;
      }

      /* Upper Sky Zone: Floating Smiling Shape Characters */
      .shapes-sky-zone {
        position: relative;
        z-index: 15;
        flex: 0 0 38%;
        min-height: 132px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: clamp(28px, 7.5vw, 108px);
        padding: 4px 16px 0;
      }

      .shape-sky-spot {
        width: clamp(106px, 14vw, 128px);
        height: clamp(106px, 14vw, 128px);
        display: grid;
        place-items: center;
        position: relative;
      }

      .shape-actor {
        width: 120px;
        height: 120px;
        display: grid;
        place-items: center;
        cursor: grab;
        touch-action: none;
        will-change: transform;
        z-index: 18;
        filter: drop-shadow(0 10px 14px rgba(17, 45, 88, 0.24));
      }
      .shape-actor.dragging {
        cursor: grabbing;
        z-index: 60;
        filter: drop-shadow(0 18px 24px rgba(17, 45, 88, 0.34));
      }
      .shape-actor.spring-back {
        transition: transform 0.42s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      .shape-actor.flying-to-slot {
        z-index: 55;
        pointer-events: none;
        transition: transform 0.46s cubic-bezier(0.26, 1.24, 0.52, 1);
      }
      .shape-actor.matched-hidden {
        opacity: 0;
        pointer-events: none;
        transform: scale(0.3);
      }

      .shape-actor-bob {
        width: 100%;
        height: 100%;
        display: grid;
        place-items: center;
        animation: shapeSkyBob 2.9s ease-in-out infinite;
      }
      .shape-actor.dragging .shape-actor-bob,
      .shape-actor.flying-to-slot .shape-actor-bob {
        animation-play-state: paused;
      }

      .shape-actor-enter {
        animation: shapePopSpawn 0.44s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
      }

      @keyframes shapeSkyBob {
        0%, 100% { transform: translateY(0px) rotate(-2deg); }
        50%      { transform: translateY(-10px) rotate(2.2deg); }
      }

      @keyframes shapePopSpawn {
        0%   { opacity: 0; transform: scale(0.35) translateY(24px); }
        100% { opacity: 1; transform: scale(1) translateY(0); }
      }

      /* Lower Ride Zone: Train on Wooden Tracks OR Swinging Carnival Ship */
      .shapes-ride-zone {
        position: relative;
        z-index: 10;
        flex: 1;
        min-height: 220px;
        display: flex;
        align-items: flex-end;
        justify-content: center;
        padding-bottom: clamp(8px, 2vh, 22px);
      }

      /* ==================== RED AMUSEMENT PARK TRAIN ==================== */
      .train-scene-wrap {
        position: relative;
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-end;
      }

      .wooden-tracks-bar {
        position: relative;
        width: calc(100% + 72px);
        height: 36px;
        margin-top: -10px;
        z-index: 2;
        pointer-events: none;
      }

      .train-assembly {
        position: relative;
        z-index: 5;
        display: flex;
        align-items: flex-end;
        justify-content: center;
        gap: 0;
        will-change: transform;
      }

      .train-assembly.arrive {
        animation: trainArriveIn 0.72s cubic-bezier(0.22, 1, 0.36, 1) forwards;
      }
      .train-assembly.idle-chug {
        animation: trainIdleBob 1.8s ease-in-out infinite;
      }
      .train-assembly.depart {
        animation: trainChugRight 1.26s cubic-bezier(0.42, 0, 0.85, 0.55) forwards;
      }

      @keyframes trainArriveIn {
        0%   { transform: translateX(-115vw); }
        78%  { transform: translateX(14px); }
        100% { transform: translateX(0); }
      }
      @keyframes trainIdleBob {
        0%, 100% { transform: translateY(0); }
        50%      { transform: translateY(-2.5px); }
      }
      @keyframes trainChugRight {
        0%   { transform: translateX(0) scale(1); }
        14%  { transform: translateX(-16px) scale(0.99, 1.02); }
        100% { transform: translateX(125vw) scale(1.02, 0.98); }
      }

      .train-car {
        position: relative;
        width: clamp(142px, 19.5vw, 186px);
        height: clamp(148px, 22vh, 178px);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: -4px;
      }

      .train-car-body {
        position: relative;
        width: calc(100% - 14px);
        height: calc(100% - 26px);
        background: linear-gradient(180deg, #FF443A 0%, #E3261E 100%);
        border-radius: 26px 26px 18px 18px;
        border: 4px solid #FFD426;
        box-shadow: inset 0 -10px 0 #B81912, 0 8px 16px rgba(0, 0, 0, 0.2);
        display: grid;
        place-items: center;
        margin-bottom: 18px;
      }
      .train-car-body::before {
        content: '';
        position: absolute;
        top: -10px;
        left: 10px;
        right: 10px;
        height: 10px;
        background: #FFD426;
        border-radius: 999px;
        box-shadow: 0 2px 0 #D19A00;
      }

      /* Coupler bar between cars */
      .train-car::after {
        content: '';
        position: absolute;
        right: -9px;
        bottom: 34px;
        width: 20px;
        height: 11px;
        border-radius: 6px;
        background: #4A3728;
        border: 2px solid #2C1F16;
        z-index: 1;
      }

      .train-wheels-row {
        position: absolute;
        bottom: 0;
        left: 18px;
        right: 18px;
        display: flex;
        justify-content: space-between;
        pointer-events: none;
        z-index: 8;
      }
      .train-wheel {
        width: 38px;
        height: 38px;
        border-radius: 50%;
        background: #2C2938;
        border: 4px solid #CFD8E3;
        display: grid;
        place-items: center;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.25);
      }
      .train-wheel::after {
        content: '';
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background: #FFD426;
      }
      .train-assembly.arrive .train-wheel,
      .train-assembly.depart .train-wheel {
        animation: wheelSpin 0.45s linear infinite;
      }
      @keyframes wheelSpin {
        from { transform: rotate(0deg); }
        to   { transform: rotate(360deg); }
      }

      .train-locomotive {
        position: relative;
        width: clamp(156px, 21.5vw, 210px);
        height: clamp(182px, 26.5vh, 218px);
        margin-left: 2px;
        z-index: 7;
        pointer-events: none;
      }
      .train-locomotive svg {
        width: 100%;
        height: 100%;
        overflow: visible;
      }

      .steam-puff {
        animation: steamRise 1.7s ease-out infinite;
        transform-origin: center;
      }
      .steam-puff.p2 { animation-delay: 0.55s; }
      .steam-puff.p3 { animation-delay: 1.1s; }

      @keyframes steamRise {
        0%   { opacity: 0.88; transform: translate(0, 0) scale(0.7); }
        100% { opacity: 0; transform: translate(-26px, -42px) scale(1.55); }
      }

      /* ==================== SWINGING CARNIVAL SHIP ==================== */
      .ship-scene-wrap {
        position: relative;
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: flex-end;
      }

      .ship-pendulum {
        position: relative;
        width: min(740px, 92vw);
        transform-origin: 50% -140px;
        will-change: transform;
      }
      .ship-pendulum.enter {
        animation: shipDropIn 0.68s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
      }
      .ship-pendulum.idle-swing {
        animation: shipGentleSwing 3.4s ease-in-out infinite;
      }
      .ship-pendulum.victory-swing {
        animation: shipBigCarnivalSwing 1.32s cubic-bezier(0.36, 0, 0.64, 1) forwards;
      }

      @keyframes shipDropIn {
        0%   { opacity: 0; transform: translateY(80px) scale(0.88); }
        100% { opacity: 1; transform: translateY(0) scale(1); }
      }
      @keyframes shipGentleSwing {
        0%, 100% { transform: rotate(-2.4deg); }
        50%      { transform: rotate(2.4deg); }
      }
      @keyframes shipBigCarnivalSwing {
        0%   { transform: rotate(0deg) scale(1); }
        25%  { transform: rotate(-12deg) scale(1.03); }
        58%  { transform: rotate(13deg) scale(1.04); }
        82%  { transform: rotate(-8deg) scale(1.02); }
        100% { transform: translateY(110px) scale(0.9) opacity(0); opacity: 0; }
      }

      .ship-deck-crew {
        position: relative;
        z-index: 4;
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        padding: 0 clamp(68px, 12vw, 130px);
        margin-bottom: -18px;
        pointer-events: none;
      }

      .ship-crew-char {
        width: clamp(78px, 10.5vw, 102px);
        height: clamp(82px, 11vw, 106px);
        animation: crewCheerBob 2.1s ease-in-out infinite;
      }
      .ship-crew-char.bunny {
        animation-delay: 0.45s;
      }
      @keyframes crewCheerBob {
        0%, 100% { transform: translateY(0) rotate(-3deg); }
        50%      { transform: translateY(-7px) rotate(4deg); }
      }

      .ship-hull {
        position: relative;
        z-index: 6;
        width: 100%;
        min-height: clamp(148px, 22.5vh, 184px);
        background: linear-gradient(180deg, #FF3E36 0%, #D91E18 78%, #AD130E 100%);
        border-radius: 30px 30px 140px 140px / 24px 24px 115px 115px;
        border: 5px solid #FFD426;
        box-shadow: 0 14px 24px rgba(17, 38, 76, 0.28), inset 0 8px 0 rgba(255, 255, 255, 0.22);
        display: flex;
        align-items: center;
        justify-content: space-evenly;
        padding: 14px clamp(26px, 5vw, 60px) 20px;
      }

      /* Ornate Golden Carnival Ship Prows */
      .ship-hull::before,
      .ship-hull::after {
        content: '★';
        position: absolute;
        top: -22px;
        width: 42px;
        height: 42px;
        border-radius: 50%;
        background: #FFD426;
        color: #D91E18;
        font-size: 22px;
        display: grid;
        place-items: center;
        box-shadow: 0 4px 0 #B88400;
      }
      .ship-hull::before { left: -12px; }
      .ship-hull::after  { right: -12px; }

      /* ==================== SHAPE SLOTS & RADIANT SEATED STATE ==================== */
      .shape-slot {
        position: relative;
        width: clamp(106px, 14vw, 124px);
        height: clamp(106px, 14vw, 124px);
        border-radius: 26px;
        background: rgba(58, 12, 18, 0.24);
        display: grid;
        place-items: center;
        transition: transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.18s;
      }

      .shape-slot.slot-hover-match {
        transform: scale(1.1);
        box-shadow: 0 0 0 6px #FFE600, 0 0 26px rgba(255, 230, 0, 0.85);
        background: rgba(255, 235, 120, 0.28);
      }

      .shape-slot.slot-wrong-wobble {
        animation: slotWrongShake 0.36s ease-in-out;
      }
      @keyframes slotWrongShake {
        0%, 100% { transform: translateX(0); }
        25%      { transform: translateX(-9px) rotate(-4deg); }
        75%      { transform: translateX(9px) rotate(4deg); }
      }

      .shape-slot-cutout {
        width: 100%;
        height: 100%;
        display: grid;
        place-items: center;
        pointer-events: none;
      }

      .shape-slot-seated {
        position: relative;
        width: 122px;
        height: 122px;
        display: grid;
        place-items: center;
        cursor: pointer;
        animation: seatedBounceIn 0.48s cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      @keyframes seatedBounceIn {
        0%   { transform: scale(0.45) rotate(-10deg); }
        58%  { transform: scale(1.18) rotate(5deg); }
        100% { transform: scale(1.04) rotate(0deg); }
      }

      /* Radiant burst of yellow stars around seated shape (Image 7!) */
      .seated-starburst {
        position: absolute;
        inset: -24px;
        pointer-events: none;
        z-index: 1;
        animation: starburstTwinkle 2.4s ease-in-out infinite;
      }
      .seated-char-art {
        position: relative;
        z-index: 2;
        display: grid;
        place-items: center;
        filter: drop-shadow(0 6px 10px rgba(0, 0, 0, 0.24));
      }

      @keyframes starburstTwinkle {
        0%, 100% { transform: scale(1) rotate(0deg); }
        50%      { transform: scale(1.08) rotate(8deg); }
      }

      .shapes-idle-hand {
        position: absolute;
        pointer-events: none;
        z-index: 65;
        transform: translate(18px, 24px);
        animation: shapesHandBounce 1.25s ease-in-out infinite;
      }
      @keyframes shapesHandBounce {
        0%, 100% { transform: translate(18px, 24px) scale(1); }
        50%      { transform: translate(10px, 8px) scale(0.92); }
      }
    `;
    document.head.appendChild(style);
  }

  // ==================== SCENIC VECTOR ART HELPERS ====================

  function buildParkScenerySvg() {
    return `
      <svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMax slice">
        <defs>
          <linearGradient id="shapesSkyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#35A7FF"/>
            <stop offset="62%" stop-color="#7ED3FF"/>
            <stop offset="100%" stop-color="#B8EEFF"/>
          </linearGradient>
        </defs>
        <!-- Sunny Sky -->
        <rect width="1200" height="800" fill="url(#shapesSkyGrad)"/>

        <!-- Warm Sun Glow -->
        <circle cx="150" cy="115" r="56" fill="#FFE45E" opacity="0.9"/>
        <circle cx="150" cy="115" r="78" fill="#FFE45E" opacity="0.24"/>

        <!-- Soft Fluffy Clouds -->
        <g fill="rgba(255,255,255,0.78)">
          <rect x="240" y="95" width="175" height="48" rx="24"/>
          <circle cx="295" cy="95" r="32"/>
          <circle cx="348" cy="88" r="38"/>
          <rect x="820" y="78" width="205" height="52" rx="26"/>
          <circle cx="885" cy="78" r="34"/>
          <circle cx="948" cy="72" r="42"/>
        </g>

        <!-- Distant Amusement Park Rollercoaster Loops & Ferris Wheel Silhouette -->
        <g stroke="#5BB5F2" stroke-width="5" fill="none" opacity="0.62">
          <path d="M-20 590 Q140 410 290 540 T590 485 T920 545 T1230 465"/>
          <circle cx="430" cy="465" r="68"/>
          <line x1="140" y1="492" x2="140" y2="620"/>
          <line x1="290" y1="540" x2="290" y2="620"/>
          <line x1="590" y1="485" x2="590" y2="620"/>
          <line x1="760" y1="518" x2="760" y2="620"/>
          <line x1="920" y1="545" x2="920" y2="620"/>
          <line x1="1080" y1="495" x2="1080" y2="620"/>
        </g>

        <!-- Distant Ferris Wheel on Right Hill -->
        <g opacity="0.68">
          <circle cx="1015" cy="468" r="74" stroke="#FFFFFF" stroke-width="5" fill="none"/>
          <line x1="1015" y1="468" x2="982" y2="570" stroke="#FFFFFF" stroke-width="6"/>
          <line x1="1015" y1="468" x2="1048" y2="570" stroke="#FFFFFF" stroke-width="6"/>
          <circle cx="1015" cy="394" r="10" fill="#FFD426"/>
          <circle cx="1089" cy="468" r="10" fill="#FF5A79"/>
          <circle cx="941" cy="468" r="10" fill="#32D74B"/>
          <circle cx="1068" cy="415" r="10" fill="#8C4BFF"/>
          <circle cx="962" cy="415" r="10" fill="#FF9500"/>
        </g>

        <!-- Cheerful Striped Circus Tents on Horizon -->
        <g transform="translate(88, 500)">
          <polygon points="0,85 58,15 116,85" fill="#FF4B4B"/>
          <polygon points="34,85 58,15 82,85" fill="#FFFFFF"/>
          <path d="M58 15 L58 -4 L80 4 Z" fill="#FFD426"/>
          <rect x="14" y="85" width="88" height="36" fill="#FFE9D6"/>
        </g>
        <g transform="translate(855, 512) scale(0.88)">
          <polygon points="0,85 58,15 116,85" fill="#8C4BFF"/>
          <polygon points="34,85 58,15 82,85" fill="#FFFFFF"/>
          <path d="M58 15 L58 -4 L80 4 Z" fill="#FFD426"/>
          <rect x="14" y="85" width="88" height="36" fill="#FFF0FA"/>
        </g>

        <!-- Rolling Lush Green Park Hills -->
        <path d="M-40 610 Q280 535 610 595 T1240 580 L1240 820 L-40 820 Z" fill="#46CE62"/>
        <path d="M-40 665 Q360 615 740 658 T1240 645 L1240 820 L-40 820 Z" fill="#2FB84D"/>
      </svg>
    `;
  }

  function buildLocomotiveSvg(express = false) {
    const badge = express
      ? `<polygon points="108,88 113,99 125,100 116,108 118,120 108,114 98,120 100,108 91,100 103,99" fill="#FFD426"/>`
      : `<circle cx="108" cy="105" r="13" fill="#FFD426"/>`;

    return `
      <svg viewBox="0 0 215 215">
        <!-- Puffing White Steam Clouds -->
        <circle class="steam-puff p1" cx="144" cy="26" r="15" fill="rgba(255,255,255,0.92)"/>
        <circle class="steam-puff p2" cx="128" cy="18" r="19" fill="rgba(255,255,255,0.85)"/>
        <circle class="steam-puff p3" cx="152" cy="14" r="13" fill="rgba(255,255,255,0.8)"/>

        <!-- Red & Gold Smokestack -->
        <rect x="134" y="44" width="22" height="36" rx="6" fill="#E3261E"/>
        <rect x="128" y="36" width="34" height="13" rx="6" fill="#FFD426"/>

        <!-- Brass Steam Dome -->
        <path d="M96 78 C96 58 122 58 122 78 Z" fill="#FFD426"/>

        <!-- Cab Roof & Cabin -->
        <rect x="12" y="42" width="84" height="128" rx="16" fill="#FF3E36" stroke="#FFD426" stroke-width="4"/>
        <rect x="4" y="34" width="100" height="14" rx="7" fill="#FFD426"/>

        <!-- Cab Window + Cute Waving Bear Engineer -->
        <rect x="24" y="56" width="60" height="54" rx="12" fill="#89DCFF" stroke="#FFFFFF" stroke-width="3"/>
        <circle cx="42" cy="76" r="8" fill="#FFFFFF"/>
        <circle cx="66" cy="76" r="8" fill="#FFFFFF"/>
        <rect x="36" y="72" width="36" height="32" rx="16" fill="#FFFFFF"/>
        <path d="M36 74 Q54 64 72 74 Z" fill="#1D74D8"/>
        <circle cx="47" cy="85" r="3" fill="#1E1B2E"/>
        <circle cx="61" cy="85" r="3" fill="#1E1B2E"/>
        <ellipse cx="54" cy="90" rx="4.2" ry="3" fill="#1E1B2E"/>
        <path d="M49 95 Q54 100 59 95" stroke="#FF4B6E" stroke-width="2.6" stroke-linecap="round" fill="none"/>

        <!-- Boiler Barrel -->
        <rect x="84" y="76" width="94" height="94" rx="22" fill="#E3261E" stroke="#FFD426" stroke-width="4"/>
        ${badge}

        <!-- Golden Headlamp -->
        <rect x="174" y="88" width="14" height="24" rx="6" fill="#FFD426"/>
        <ellipse cx="188" cy="100" rx="5" ry="9" fill="#FFF7B2"/>

        <!-- Front Yellow Cowcatcher -->
        <polygon points="172,148 206,178 172,178" fill="#FFD426" stroke="#D19A00" stroke-width="3" stroke-linejoin="round"/>

        <!-- Chassis Base Bar -->
        <rect x="8" y="164" width="174" height="16" rx="8" fill="#B81912"/>

        <!-- Big Locomotive Wheels -->
        <g>
          <circle cx="48" cy="186" r="23" fill="#2C2938" stroke="#CFD8E3" stroke-width="4.5"/>
          <circle cx="48" cy="186" r="9" fill="#FFD426"/>
          <circle cx="112" cy="186" r="23" fill="#2C2938" stroke="#CFD8E3" stroke-width="4.5"/>
          <circle cx="112" cy="186" r="9" fill="#FFD426"/>
          <circle cx="158" cy="190" r="18" fill="#2C2938" stroke="#CFD8E3" stroke-width="4"/>
          <circle cx="158" cy="190" r="7" fill="#FFD426"/>
          <rect x="46" y="183" width="68" height="6" rx="3" fill="#FFE066"/>
        </g>
      </svg>
    `;
  }

  function buildWoodenTracksSvg() {
    let sleepers = '';
    for (let x = 15; x < 1200; x += 56) {
      sleepers += `<rect x="${x}" y="10" width="30" height="22" rx="5" fill="#8B542B" stroke="#63391A" stroke-width="2"/>`;
    }
    return `
      <svg viewBox="0 0 1200 36" preserveAspectRatio="none" width="100%" height="100%">
        ${sleepers}
        <rect x="0" y="6" width="1200" height="7" rx="3.5" fill="#DCE6F2"/>
        <rect x="0" y="13" width="1200" height="3" fill="#90A4BC"/>
        <rect x="0" y="22" width="1200" height="7" rx="3.5" fill="#DCE6F2"/>
      </svg>
    `;
  }

  function buildDeckBearSvg() {
    return `
      <svg viewBox="0 0 110 110" width="100%" height="100%">
        <circle cx="28" cy="30" r="14" fill="#9C6234"/>
        <circle cx="28" cy="30" r="7" fill="#F2C69D"/>
        <circle cx="82" cy="30" r="14" fill="#9C6234"/>
        <circle cx="82" cy="30" r="7" fill="#F2C69D"/>
        <!-- Cheering Paws Up -->
        <ellipse cx="18" cy="74" rx="12" ry="16" transform="rotate(-28 18 74)" fill="#9C6234"/>
        <ellipse cx="92" cy="74" rx="12" ry="16" transform="rotate(28 92 74)" fill="#9C6234"/>
        <ellipse cx="55" cy="92" rx="32" ry="24" fill="#9C6234"/>
        <rect x="24" y="24" width="62" height="54" rx="27" fill="#B07240"/>
        <ellipse cx="55" cy="59" rx="16" ry="12" fill="#F7D7B5"/>
        <circle cx="43" cy="48" r="5" fill="#1E1B2E"/>
        <circle cx="45" cy="46" r="1.8" fill="#FFF"/>
        <circle cx="67" cy="48" r="5" fill="#1E1B2E"/>
        <circle cx="69" cy="46" r="1.8" fill="#FFF"/>
        <ellipse cx="55" cy="55" rx="6" ry="4.2" fill="#2D1B12"/>
        <path d="M48 62 Q55 70 62 62" stroke="#2D1B12" stroke-width="3.4" stroke-linecap="round" fill="none"/>
        <circle cx="34" cy="57" r="6" fill="#FF8FA3" opacity="0.72"/>
        <circle cx="76" cy="57" r="6" fill="#FF8FA3" opacity="0.72"/>
      </svg>
    `;
  }

  function buildDeckPinkBunnySvg() {
    return `
      <svg viewBox="0 0 110 115" width="100%" height="100%">
        <!-- Tall Cute Pink Bunny Ears -->
        <ellipse cx="38" cy="24" rx="10" ry="23" transform="rotate(-10 38 24)" fill="#FF85B3"/>
        <ellipse cx="38" cy="25" rx="5" ry="15" transform="rotate(-10 38 25)" fill="#FFD1E3"/>
        <ellipse cx="72" cy="24" rx="10" ry="23" transform="rotate(10 72 24)" fill="#FF85B3"/>
        <ellipse cx="72" cy="25" rx="5" ry="15" transform="rotate(10 72 25)" fill="#FFD1E3"/>
        <!-- Cheering Paws -->
        <ellipse cx="18" cy="80" rx="11" ry="15" transform="rotate(-26 18 80)" fill="#FF85B3"/>
        <ellipse cx="92" cy="80" rx="11" ry="15" transform="rotate(26 92 80)" fill="#FF85B3"/>
        <ellipse cx="55" cy="96" rx="30" ry="22" fill="#FF85B3"/>
        <rect x="25" y="34" width="60" height="52" rx="26" fill="#FF97BF"/>
        <circle cx="43" cy="57" r="5" fill="#1E1B2E"/>
        <circle cx="45" cy="55" r="1.8" fill="#FFF"/>
        <circle cx="67" cy="57" r="5" fill="#1E1B2E"/>
        <circle cx="69" cy="55" r="1.8" fill="#FFF"/>
        <ellipse cx="55" cy="63" rx="4.5" ry="3.2" fill="#FF3D7F"/>
        <path d="M48 69 Q55 77 62 69" stroke="#5A1836" stroke-width="3.2" stroke-linecap="round" fill="none"/>
        <circle cx="34" cy="65" r="6" fill="#FF4D8D" opacity="0.45"/>
        <circle cx="76" cy="65" r="6" fill="#FF4D8D" opacity="0.45"/>
      </svg>
    `;
  }

  function buildRadiantStarburstSvg() {
    return `
      <svg viewBox="0 0 170 170" width="100%" height="100%">
        <g fill="#FFE629" stroke="#FFFFFF" stroke-width="2">
          <!-- 8 twinkling stars surrounding the seated shape -->
          <polygon points="85,4 90,17 103,17 92,25 96,38 85,30 74,38 78,25 67,17 80,17"/>
          <polygon points="145,28 149,38 159,38 151,44 154,54 145,48 136,54 139,44 131,38 141,38"/>
          <polygon points="25,28 29,38 39,38 31,44 34,54 25,48 16,54 19,44 11,38 21,38"/>
          <polygon points="160,88 164,96 172,96 166,101 168,109 160,104 152,109 154,101 148,96 156,96"/>
          <polygon points="10,88 14,96 22,96 16,101 18,109 10,104 2,109 4,101 -2,96 6,96"/>
          <polygon points="138,142 142,150 150,150 144,155 146,163 138,158 130,163 132,155 126,150 134,150"/>
          <polygon points="32,142 36,150 44,150 38,155 40,163 32,158 24,163 26,155 20,150 28,150"/>
        </g>
      </svg>
    `;
  }

  // Fallback character/slot SVG if SHAPE_DATA is missing or custom
  function renderShapeCharacterSafe(shape, size = 118) {
    if (shape && typeof shape.renderCharacter === 'function') {
      return shape.renderCharacter(size);
    }
    return `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${shape?.hex || '#FF3B30'}"></div>`;
  }

  function renderShapeSlotSafe(shape, size = 108) {
    if (shape && typeof shape.renderSlot === 'function') {
      return shape.renderSlot(size);
    }
    return `<div style="width:${size * 0.8}px;height:${size * 0.8}px;border-radius:50%;background:rgba(0,0,0,0.32)"></div>`;
  }

  // ==================== WAVE GENERATION ====================

  function shuffleArray(arr) {
    const copy = arr.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function buildWaves(shuffle = false) {
    const allShapes = window.SHAPE_DATA || [];
    const byId = new Map(allShapes.map((s) => [s.id, s]));

    if (!shuffle && allShapes.length >= 8) {
      return DEFAULT_WAVE_PLANS.map((plan) => {
        const picked = [];
        for (const id of plan.ids) {
          const found = byId.get(id);
          if (found && !picked.includes(found)) picked.push(found);
        }
        for (const fallback of allShapes) {
          if (picked.length >= 3) break;
          if (!picked.includes(fallback)) picked.push(fallback);
        }
        return {
          ride: plan.ride,
          express: plan.express,
          icon: plan.icon,
          shapes: picked.slice(0, 3),
        };
      });
    }

    // Shuffled 3-wave ride covering all 8 shapes + 1 distinct favorite in Wave 3
    const shuffled = shuffleArray(allShapes);
    const w1 = shuffled.slice(0, 3);
    const w2 = shuffled.slice(3, 6);
    const w3 = shuffled.slice(6, 8);
    for (const candidate of shuffleArray(shuffled.slice(0, 6))) {
      if (w3.length >= 3) break;
      if (!w3.includes(candidate)) w3.push(candidate);
    }

    return [
      { ride: 'train', express: false, icon: '🚂', shapes: w1 },
      { ride: 'ship', express: false, icon: '⛵', shapes: w2 },
      { ride: 'train', express: true, icon: '🚂', shapes: w3 },
    ];
  }

  function updateProgressPill() {
    if (!progressPillEl) {
      progressPillEl = document.getElementById('shapes-progress-pill');
    }
    if (!progressPillEl) return;
    const current = waves[waveIndex] || DEFAULT_WAVE_PLANS[0];
    progressPillEl.textContent = `${current.icon} ${waveIndex + 1} / ${waves.length || 3}`;
  }

  // ==================== IDLE HAND HINT ====================

  function hideIdleHand() {
    if (handHintEl) {
      handHintEl.remove();
      handHintEl = null;
    }
  }

  function resetIdleHandTimer() {
    hideIdleHand();
    if (idleHintTimer) {
      clearTimeout(idleHintTimer);
      idleHintTimer = null;
    }
    if (!isActive || waveTransitioning || roundCompleted) return;

    idleHintTimer = setTimeout(() => {
      if (!isActive || waveTransitioning) return;
      const targetActor = actorRecords.find((a) => !a.matched && !a.flying);
      if (!targetActor || !window.PARK_ART?.pointerHand) return;

      handHintEl = document.createElement('div');
      handHintEl.className = 'shapes-idle-hand';
      handHintEl.innerHTML = window.PARK_ART.pointerHand();
      targetActor.spotEl.appendChild(handHintEl);
    }, 5500);
  }

  // ==================== STAGE & WAVE RENDERING ====================

  function ensureStageStructure() {
    if (!stageEl) stageEl = document.getElementById('shapes-stage');
    if (!stageEl) return false;

    if (!skyLayerEl || !stageEl.contains(skyLayerEl)) {
      stageEl.innerHTML = `
        <div class="shapes-park-scenery" aria-hidden="true">${buildParkScenerySvg()}</div>
        <div class="shapes-sky-zone" id="shapes-sky-zone"></div>
        <div class="shapes-ride-zone" id="shapes-ride-zone"></div>
      `;
      skyLayerEl = stageEl.querySelector('#shapes-sky-zone');
      rideLayerEl = stageEl.querySelector('#shapes-ride-zone');
    }
    return true;
  }

  function renderCurrentWave() {
    if (!ensureStageStructure()) return;

    clearAllTimers();
    hideIdleHand();
    waveTransitioning = false;
    matchedCount = 0;
    slotRecords = [];
    actorRecords = [];

    const wave = waves[waveIndex];
    if (!wave) return;

    updateProgressPill();

    // 1. Render Ride Slots (Train vs Swinging Carnival Ship)
    rideLayerEl.innerHTML = '';

    if (wave.ride === 'ship') {
      const wrap = document.createElement('div');
      wrap.className = 'ship-scene-wrap';
      wrap.innerHTML = `
        <div class="ship-pendulum enter" id="active-ride-vehicle">
          <div class="ship-deck-crew">
            <div class="ship-crew-char bear">${buildDeckBearSvg()}</div>
            <div class="ship-crew-char bunny">${buildDeckPinkBunnySvg()}</div>
          </div>
          <div class="ship-hull" id="ship-slots-row"></div>
        </div>
      `;
      rideLayerEl.appendChild(wrap);

      const pendulumEl = wrap.querySelector('#active-ride-vehicle');
      scheduleTimer(() => {
        if (pendulumEl && !waveTransitioning) {
          pendulumEl.classList.remove('enter');
          pendulumEl.classList.add('idle-swing');
        }
      }, 700);

      const hullRow = wrap.querySelector('#ship-slots-row');
      wave.shapes.forEach((shape) => {
        const slotEl = createSlotElement(shape);
        hullRow.appendChild(slotEl);
      });
    } else {
      const wrap = document.createElement('div');
      wrap.className = 'train-scene-wrap';
      wrap.innerHTML = `
        <div class="train-assembly arrive" id="active-ride-vehicle">
          <div id="train-cars-group" style="display:flex;align-items:flex-end;"></div>
          <div class="train-locomotive">${buildLocomotiveSvg(wave.express)}</div>
        </div>
        <div class="wooden-tracks-bar">${buildWoodenTracksSvg()}</div>
      `;
      rideLayerEl.appendChild(wrap);

      const trainEl = wrap.querySelector('#active-ride-vehicle');
      scheduleTimer(() => {
        if (trainEl && !waveTransitioning) {
          trainEl.classList.remove('arrive');
          trainEl.classList.add('idle-chug');
        }
      }, 740);

      const carsGroup = wrap.querySelector('#train-cars-group');
      wave.shapes.forEach((shape) => {
        const car = document.createElement('div');
        car.className = 'train-car';
        const body = document.createElement('div');
        body.className = 'train-car-body';
        const slotEl = createSlotElement(shape);
        body.appendChild(slotEl);

        const wheels = document.createElement('div');
        wheels.className = 'train-wheels-row';
        wheels.innerHTML = `<div class="train-wheel"></div><div class="train-wheel"></div>`;

        car.appendChild(body);
        car.appendChild(wheels);
        carsGroup.appendChild(car);
      });
    }

    // 2. Render Floating Smiling Shape Characters in Sky (shuffled order so matching is playful!)
    skyLayerEl.innerHTML = '';
    let skyShapes = shuffleArray(wave.shapes);
    if (
      skyShapes.length === 3 &&
      skyShapes[0] === wave.shapes[0] &&
      skyShapes[1] === wave.shapes[1]
    ) {
      skyShapes = [wave.shapes[1], wave.shapes[2], wave.shapes[0]];
    }

    skyShapes.forEach((shape, idx) => {
      const spotEl = document.createElement('div');
      spotEl.className = 'shape-sky-spot';

      const actorEl = document.createElement('div');
      actorEl.className = 'shape-actor shape-actor-enter';
      actorEl.style.animationDelay = `${0.12 + idx * 0.1}s`;
      actorEl.setAttribute('role', 'button');
      actorEl.setAttribute('aria-label', shape.name);

      const bobEl = document.createElement('div');
      bobEl.className = 'shape-actor-bob';
      bobEl.style.animationDelay = `${idx * 0.42}s`;
      bobEl.innerHTML = renderShapeCharacterSafe(shape, 118);

      actorEl.appendChild(bobEl);
      spotEl.appendChild(actorEl);
      skyLayerEl.appendChild(spotEl);

      const actorRec = {
        shape,
        spotEl,
        actorEl,
        bobEl,
        matched: false,
        flying: false,
      };
      actorRecords.push(actorRec);
      bindActorInteraction(actorRec);
    });

    resetIdleHandTimer();
  }

  function createSlotElement(shape) {
    const slotEl = document.createElement('div');
    slotEl.className = 'shape-slot';
    slotEl.dataset.shapeId = shape.id;
    slotEl.innerHTML = `<div class="shape-slot-cutout">${renderShapeSlotSafe(shape, 108)}</div>`;

    slotRecords.push({
      shape,
      slotEl,
      filled: false,
    });
    return slotEl;
  }

  // ==================== DUAL INTERACTION: DRAG-AND-DROP + TAP-TO-FLY ====================

  function getCenter(el) {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }

  function findMatchingSlotRecord(shape) {
    return slotRecords.find((s) => s.shape.id === shape.id && !s.filled) || null;
  }

  function clearSlotHoverHighlights() {
    for (const s of slotRecords) {
      s.slotEl.classList.remove('slot-hover-match');
    }
  }

  function bindActorInteraction(actorRec) {
    const { actorEl, shape } = actorRec;
    let activePointerId = null;
    let startX = 0;
    let startY = 0;
    let maxMove = 0;

    actorEl.addEventListener('pointerdown', (ev) => {
      if (waveTransitioning || actorRec.matched || actorRec.flying || activePointerId !== null) {
        return;
      }
      ev.preventDefault();
      ev.stopPropagation();

      resetIdleHandTimer();
      activePointerId = ev.pointerId;
      startX = ev.clientX;
      startY = ev.clientY;
      maxMove = 0;

      try {
        actorEl.setPointerCapture(ev.pointerId);
      } catch (_) {}

      actorEl.classList.remove('spring-back', 'shape-actor-enter');
      actorEl.classList.add('dragging');
      actorEl.style.transform = 'translate3d(0px, 0px, 0) scale(1.12)';
      window.sound?.playTap?.(580);
    });

    actorEl.addEventListener('pointermove', (ev) => {
      if (ev.pointerId !== activePointerId || actorRec.matched || actorRec.flying) return;
      ev.preventDefault();

      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      const moved = Math.hypot(dx, dy);
      if (moved > maxMove) maxMove = moved;

      const tilt = Math.max(-11, Math.min(11, dx * 0.055));
      actorEl.style.transform = `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0) scale(1.12) rotate(${tilt.toFixed(1)}deg)`;

      // Highlight matching slot when dragged near (< 115px)
      const actorCenter = getCenter(actorEl);
      const matchSlot = findMatchingSlotRecord(shape);
      if (matchSlot) {
        const slotCenter = getCenter(matchSlot.slotEl);
        const dist = Math.hypot(actorCenter.x - slotCenter.x, actorCenter.y - slotCenter.y);
        matchSlot.slotEl.classList.toggle('slot-hover-match', dist < SNAP_RADIUS_PX);
      }
    });

    const finishPointer = (ev) => {
      if (ev.pointerId !== activePointerId) return;
      try {
        actorEl.releasePointerCapture(ev.pointerId);
      } catch (_) {}
      activePointerId = null;
      actorEl.classList.remove('dragging');
      clearSlotHoverHighlights();

      if (actorRec.matched || actorRec.flying || waveTransitioning) return;

      // 1. SIMPLE TAP (< 14px movement): Speak shape & smoothly fly right into matching slot!
      if (ev.type !== 'pointercancel' && maxMove < TAP_MOVE_THRESHOLD_PX) {
        flyActorIntoMatchingSlot(actorRec, 0, 0);
        return;
      }

      // 2. DRAG DROP: Check distance to matching slot vs non-matching slot
      const actorCenter = getCenter(actorEl);
      const matchSlot = findMatchingSlotRecord(shape);
      if (matchSlot) {
        const slotCenter = getCenter(matchSlot.slotEl);
        const distToMatch = Math.hypot(
          actorCenter.x - slotCenter.x,
          actorCenter.y - slotCenter.y
        );
        if (distToMatch < SNAP_RADIUS_PX) {
          snapDraggedActorIntoSlot(actorRec, matchSlot, ev.clientX - startX, ev.clientY - startY);
          return;
        }
      }

      // Check if dropped near a non-matching unfilled slot
      let hitWrongSlot = null;
      for (const s of slotRecords) {
        if (s.filled || s.shape.id === shape.id) continue;
        const sc = getCenter(s.slotEl);
        if (Math.hypot(actorCenter.x - sc.x, actorCenter.y - sc.y) < WRONG_RADIUS_PX) {
          hitWrongSlot = s;
          break;
        }
      }

      if (hitWrongSlot) {
        if (window.sound?.playWrongBoing) {
          window.sound.playWrongBoing();
        } else {
          window.sound?.playBoing?.();
        }
        hitWrongSlot.slotEl.classList.remove('slot-wrong-wobble');
        void hitWrongSlot.slotEl.offsetWidth;
        hitWrongSlot.slotEl.classList.add('slot-wrong-wobble');
      } else {
        window.sound?.playBoing?.();
      }

      // Smooth spring back to sky home spot
      actorEl.classList.add('spring-back');
      actorEl.style.transform = 'translate3d(0px, 0px, 0) scale(1)';
      resetIdleHandTimer();
    };

    actorEl.addEventListener('pointerup', finishPointer);
    actorEl.addEventListener('pointercancel', finishPointer);
  }

  function flyActorIntoMatchingSlot(actorRec, currentDx = 0, currentDy = 0) {
    const matchSlot = findMatchingSlotRecord(actorRec.shape);
    if (!matchSlot) return;

    actorRec.flying = true;
    matchSlot.filled = true;

    // Immediately speak shape name + sparkle!
    window.sound?.playSparkle?.(matchedCount);
    window.sound?.speakClip?.(`./audio/shapes/${actorRec.shape.id}.mp3`, actorRec.shape.name);

    const homeCenter = getCenter(actorRec.spotEl);
    const slotCenter = getCenter(matchSlot.slotEl);
    const targetDx = slotCenter.x - homeCenter.x;
    const targetDy = slotCenter.y - homeCenter.y;

    const { actorEl } = actorRec;
    actorEl.style.transform = `translate3d(${currentDx}px, ${currentDy}px, 0) scale(1.14)`;
    void actorEl.offsetWidth;

    actorEl.classList.add('flying-to-slot');
    actorEl.style.transform = `translate3d(${targetDx.toFixed(1)}px, ${targetDy.toFixed(1)}px, 0) scale(0.98)`;

    scheduleTimer(() => {
      seatShapeInSlot(actorRec, matchSlot, false);
    }, 450);
  }

  function snapDraggedActorIntoSlot(actorRec, matchSlot, currentDx, currentDy) {
    actorRec.flying = true;
    matchSlot.filled = true;

    window.sound?.playSparkle?.(matchedCount);
    window.sound?.speakClip?.(`./audio/shapes/${actorRec.shape.id}.mp3`, actorRec.shape.name);

    const homeCenter = getCenter(actorRec.spotEl);
    const slotCenter = getCenter(matchSlot.slotEl);
    const targetDx = slotCenter.x - homeCenter.x;
    const targetDy = slotCenter.y - homeCenter.y;

    const { actorEl } = actorRec;
    actorEl.style.transition = 'transform 0.18s cubic-bezier(0.22, 1, 0.36, 1)';
    actorEl.style.transform = `translate3d(${targetDx.toFixed(1)}px, ${targetDy.toFixed(1)}px, 0) scale(1)`;

    scheduleTimer(() => {
      actorEl.style.transition = '';
      seatShapeInSlot(actorRec, matchSlot, false);
    }, 185);
  }

  function seatShapeInSlot(actorRec, slotRec, speakNow = false) {
    actorRec.matched = true;
    actorRec.flying = false;
    slotRec.filled = true;
    matchedCount++;

    actorRec.actorEl.classList.remove('flying-to-slot');
    actorRec.actorEl.classList.add('matched-hidden');

    const { shape, slotEl } = slotRec;
    slotEl.style.background = 'transparent';
    slotEl.innerHTML = `
      <div class="shape-slot-seated" role="button" aria-label="${shape.name}">
        <div class="seated-starburst">${buildRadiantStarburstSvg()}</div>
        <div class="seated-char-art">${renderShapeCharacterSafe(shape, 114)}</div>
      </div>
    `;

    // Tapping seated passenger replays its name & sparkles!
    const seatedEl = slotEl.querySelector('.shape-slot-seated');
    if (seatedEl) {
      seatedEl.addEventListener('pointerdown', (ev) => {
        ev.stopPropagation();
        const c = getCenter(slotEl);
        window.FX?.burstConfetti?.(c.x, c.y, shape.hex, 14);
        window.sound?.playBoing?.();
        window.sound?.speakClip?.(`./audio/shapes/${shape.id}.mp3`, shape.name);
      });
    }

    const center = getCenter(slotEl);
    window.FX?.spawnRingRipple?.(center.x, center.y, shape.hex || '#FFD426');
    window.FX?.burstConfetti?.(center.x, center.y, shape.hex || '#FFD426', 26);
    if (companionEl) {
      window.FX?.cheerCompanion?.(companionEl);
    }

    if (speakNow) {
      window.sound?.playSparkle?.(matchedCount);
      window.sound?.speakClip?.(`./audio/shapes/${shape.id}.mp3`, shape.name);
    }

    if (matchedCount >= 3) {
      handleWaveComplete();
    } else {
      resetIdleHandTimer();
    }
  }

  // ==================== WAVE TRANSITION & GRAND FINALE ====================

  function handleWaveComplete() {
    waveTransitioning = true;
    hideIdleHand();

    const currentWave = waves[waveIndex];
    const vehicleEl = document.getElementById('active-ride-vehicle');

    // Let the 3rd shape's spoken word shine for a brief moment, then chug/swing away!
    scheduleTimer(() => {
      if (!isActive) return;

      if (currentWave.ride === 'ship') {
        window.sound?.playFanfare?.();
        if (vehicleEl) {
          vehicleEl.classList.remove('idle-swing', 'enter');
          vehicleEl.classList.add('victory-swing');
          const c = getCenter(vehicleEl);
          window.FX?.burstConfetti?.(c.x, c.y - 30, '#FFD426', 36);
        }
      } else {
        if (window.sound?.playChooChoo) {
          window.sound.playChooChoo();
        } else {
          window.sound?.playFanfare?.();
        }
        if (vehicleEl) {
          vehicleEl.classList.remove('idle-chug', 'arrive');
          vehicleEl.classList.add('depart');
          const c = getCenter(vehicleEl);
          window.FX?.burstConfetti?.(c.x, c.y - 20, '#FF443A', 32);
        }
      }

      scheduleTimer(() => {
        if (!isActive) return;
        if (waveIndex + 1 < waves.length) {
          waveIndex++;
          renderCurrentWave();
        } else {
          roundCompleted = true;
          const badgeHtml = window.PARK_ART?.celebrationTrophySvg
            ? window.PARK_ART.celebrationTrophySvg()
            : '🏆';

          if (window.FX?.showCelebration) {
            window.FX.showCelebration({
              badgeHtml,
              title: 'ALL SHAPES!',
              audioUrl: './audio/phrases/all_shapes.mp3',
              onReplay: () => startNewRide(true),
            });
          } else {
            window.sound?.playFanfare?.();
            window.sound?.speakClip?.('./audio/phrases/all_shapes.mp3', 'Yay! All shapes!');
            scheduleTimer(() => startNewRide(true), 2400);
          }
        }
      }, 1300);
    }, 620);
  }

  function startNewRide(shuffle = false) {
    clearAllTimers();
    roundCompleted = false;
    waveTransitioning = false;
    waves = buildWaves(shuffle);
    waveIndex = 0;
    renderCurrentWave();
  }

  // ==================== PUBLIC LIFECYCLE ====================

  function init() {
    if (initialized) return;
    initialized = true;

    injectStyles();

    stageEl = document.getElementById('shapes-stage');
    progressPillEl = document.getElementById('shapes-progress-pill');
    companionEl = document.getElementById('shapes-companion');

    if (companionEl && !companionEl.innerHTML.trim() && window.PARK_ART?.peekingPuppy) {
      companionEl.innerHTML = window.PARK_ART.peekingPuppy();
    }

    waves = buildWaves(false);
    updateProgressPill();
  }

  function enter() {
    if (!initialized) init();
    isActive = true;

    stageEl = document.getElementById('shapes-stage');
    progressPillEl = document.getElementById('shapes-progress-pill');
    companionEl = document.getElementById('shapes-companion');

    if (!waves.length || roundCompleted || !slotRecords.length || waveTransitioning) {
      startNewRide(roundCompleted);
    } else {
      updateProgressPill();
      resetIdleHandTimer();
    }

    window.sound?.speakClip?.('./audio/phrases/shapes_ride.mp3', 'Match the shapes!');
  }

  function leave() {
    isActive = false;
    clearAllTimers();
    hideIdleHand();
  }

  window.ShapesGame = {
    init,
    enter,
    leave,
  };
})();
