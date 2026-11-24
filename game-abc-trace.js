// ============================================================================
// Sunny Park — ABC 3D Animal Flip Cards + Silky-Smooth 60fps Letter Tracing
// Exports: window.AbcCardsGame and window.TraceGame
// ============================================================================

(() => {
  const PRAISES = ['yay', 'awesome', 'wonderful'];
  const GOLDEN_PAINT = '#FFD026';
  const PATH_SAMPLES = 180;

  // ==========================================================================
  // 1. ABC 3D FLIPPING LETTER-TO-ANIMAL CARDS (window.AbcCardsGame)
  // ==========================================================================
  const AbcCardsGame = (() => {
    let gridEl = null;
    let companionEl = null;
    let initialized = false;

    function init() {
      if (initialized) return;
      gridEl = document.getElementById('abc-flip-grid');
      companionEl = document.getElementById('abc-companion');
      if (!gridEl || !window.ABC_DATA) return;
      initialized = true;

      gridEl.innerHTML = '';

      window.ABC_DATA.forEach((item, idx) => {
        const ch = item.letter.toLowerCase();
        const card = document.createElement('div');
        card.className = 'flip-card';
        card.dataset.idx = String(idx);
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-label', `${item.letter} — ${item.word}`);

        const animalArt =
          window.PARK_ART && typeof window.PARK_ART.animalSvg === 'function'
            ? window.PARK_ART.animalSvg(ch)
            : '';

        card.innerHTML = `
          <div class="flip-card-inner">
            <div class="flip-card-face flip-card-front" style="background-color: ${item.cardBg};">
              <span class="flip-front-letter">${item.letter}</span>
            </div>
            <div class="flip-card-face flip-card-back" style="border-color: ${item.cardBg};">
              <span class="flip-back-badge" style="color: ${item.cardBg};">${item.letter}${ch}</span>
              <div class="flip-back-art">${animalArt}</div>
              <span class="flip-back-word">${item.word}</span>
            </div>
          </div>
        `;

        // Distinguish clean tap from vertical touch-scroll (pan-y)
        let downX = 0;
        let downY = 0;
        let pointerActive = false;

        card.addEventListener('pointerdown', (ev) => {
          downX = ev.clientX;
          downY = ev.clientY;
          pointerActive = true;
        });

        card.addEventListener('pointercancel', () => {
          pointerActive = false;
        });

        card.addEventListener('pointerup', (ev) => {
          if (!pointerActive) return;
          pointerActive = false;
          const dist = Math.hypot(ev.clientX - downX, ev.clientY - downY);
          if (dist < 12) {
            flipCard(card, item, ev.clientX, ev.clientY);
          }
        });

        card.addEventListener('keydown', (ev) => {
          if (ev.key === 'Enter' || ev.key === ' ') {
            ev.preventDefault();
            const r = card.getBoundingClientRect();
            flipCard(card, item, r.left + r.width / 2, r.top + r.height / 2);
          }
        });

        gridEl.appendChild(card);
      });
    }

    function flipCard(cardEl, item, cx, cy) {
      const ch = item.letter.toLowerCase();
      const willShowAnimal = !cardEl.classList.contains('is-flipped');
      cardEl.classList.toggle('is-flipped', willShowAnimal);

      if (window.sound) {
        if (typeof window.sound.playCardFlip === 'function') {
          window.sound.playCardFlip();
        } else if (typeof window.sound.playBoing === 'function') {
          window.sound.playBoing();
        }
      }

      if (willShowAnimal) {
        window.FX?.burstConfetti(cx, cy, item.cardBg, 22);
        window.FX?.spawnRingRipple(cx, cy, item.cardBg);
        window.FX?.cheerCompanion(companionEl);

        window.sound?.speakSequence([
          { url: `./audio/letters/${ch}.mp3`, fallback: item.letter, gap: 0.1 },
          { url: `./audio/words/${ch}.mp3`, fallback: item.word, gap: 0 },
        ]);
      } else {
        window.FX?.burstConfetti(cx, cy, item.cardBg, 10);
        window.sound?.speakClip(`./audio/letters/${ch}.mp3`, item.letter);
      }
    }

    function enter() {
      init();
      // Always reset all cards to unflipped front and scroll back to top on every entry
      if (gridEl) {
        gridEl.querySelectorAll('.flip-card.is-flipped').forEach((c) => c.classList.remove('is-flipped'));
        gridEl.scrollTop = 0;
      }
      window.sound?.speakClip('./audio/phrases/abc_time.mp3', 'ABC!');
    }

    function leave() {
      // Keep flipped state playful or calm voice when leaving
    }

    return { init, enter, leave };
  })();

  // ==========================================================================
  // 2. SILKY-SMOOTH 60FPS LETTER TRACING + DRAWING SOUND (window.TraceGame)
  // ==========================================================================
  const TraceGame = (() => {
    let traceSvg = null;
    let boardEl = null;
    let stripEl = null;
    let rewardBadgeEl = null;
    let rewardArtEl = null;
    let rewardWordEl = null;
    let handHintEl = null;
    let companionEl = null;
    let initialized = false;

    let traceIndex = 0;
    let strokeIdx = 0;
    let targetProgress = 0;
    let displayProgress = 0;
    let completed = false;
    let strokeFinishing = false;

    let activePathEl = null;
    let activeFillEl = null;
    let activeHandleGroup = null;
    let activeStrokeLen = 1;
    let sampledPoints = []; // 180 fine { t, x, y } samples along activePathEl

    let isPointerDown = false;
    let activePointerId = null;
    let lastClientX = 0;
    let lastClientY = 0;
    let drawSoundPlaying = false;
    let stillFrames = 0;
    let idleTimer = null;
    let advanceTimer = null;
    let nextStrokeTimer = null;

    function init() {
      if (initialized) return;
      traceSvg = document.getElementById('trace-svg');
      boardEl = document.getElementById('trace-board');
      stripEl = document.getElementById('trace-letter-strip');
      rewardBadgeEl = document.getElementById('trace-reward-badge');
      rewardArtEl = document.getElementById('trace-reward-art');
      rewardWordEl = document.getElementById('trace-reward-word');
      handHintEl = document.getElementById('trace-hand-hint');
      companionEl = document.getElementById('trace-companion');

      if (!traceSvg || !stripEl || !window.ABC_DATA) return;
      initialized = true;

      // Build bottom A–Z selector strip
      stripEl.innerHTML = '';
      window.ABC_DATA.forEach((item, idx) => {
        const btn = document.createElement('button');
        btn.className = 'trace-mini-btn';
        btn.textContent = item.letter;
        btn.setAttribute('aria-label', `Letter ${item.letter}`);

        let downX = 0;
        let downY = 0;
        btn.addEventListener('pointerdown', (ev) => {
          downX = ev.clientX;
          downY = ev.clientY;
        });
        btn.addEventListener('pointerup', (ev) => {
          if (Math.hypot(ev.clientX - downX, ev.clientY - downY) < 12) {
            loadLetter(idx, true);
            stripEl.classList.add('hidden');
            document.getElementById('btn-trace-toggle-strip')?.classList.remove('active');
          }
        });
        stripEl.appendChild(btn);
      });

      // Toggle button to show/hide bottom A-Z strip (hidden by default)
      const toggleStripBtn = document.getElementById('btn-trace-toggle-strip');
      toggleStripBtn?.addEventListener('pointerdown', (ev) => {
        ev.preventDefault();
        const isNowHidden = stripEl.classList.toggle('hidden');
        toggleStripBtn.classList.toggle('active', !isNowHidden);
        window.sound?.playTap?.(560);
      });

      // Tapping reward card replays animal word & sparkles
      rewardBadgeEl?.addEventListener('pointerdown', (ev) => {
        ev.stopPropagation();
        const item = window.ABC_DATA[traceIndex];
        if (!item) return;
        const r = rewardBadgeEl.getBoundingClientRect();
        window.FX?.burstConfetti(r.left + r.width / 2, r.top + r.height / 2, item.cardBg, 20);
        window.sound?.playSparkle(traceIndex);
        window.sound?.speakClip(`./audio/words/${item.letter.toLowerCase()}.mp3`, item.word);
      });

      // Unified Touch (iPad Safari) + Pointer (Desktop/Mouse) Tracing Handlers
      const targetEl = boardEl || traceSvg;

      // Explicit non-passive touch listeners so iPadOS Safari NEVER cancels finger drag
      targetEl.addEventListener(
        'touchstart',
        (ev) => {
          if (!document.getElementById('screen-trace')?.classList.contains('active')) return;
          if (!ev.touches || ev.touches.length === 0) return;
          ev.preventDefault();
          const t = ev.touches[0];
          startTraceInput(t.clientX, t.clientY, `touch-${t.identifier}`);
        },
        { passive: false }
      );

      targetEl.addEventListener(
        'touchmove',
        (ev) => {
          if (!isPointerDown || !document.getElementById('screen-trace')?.classList.contains('active')) return;
          if (!ev.touches || ev.touches.length === 0) return;
          ev.preventDefault();
          let t = ev.touches[0];
          for (let i = 0; i < ev.touches.length; i++) {
            if (`touch-${ev.touches[i].identifier}` === activePointerId) {
              t = ev.touches[i];
              break;
            }
          }
          moveTraceInput(t.clientX, t.clientY);
        },
        { passive: false }
      );

      const onTouchEnd = (ev) => {
        if (!isPointerDown || !String(activePointerId || '').startsWith('touch-')) return;
        if (ev.touches && ev.touches.length > 0) {
          for (let i = 0; i < ev.touches.length; i++) {
            if (`touch-${ev.touches[i].identifier}` === activePointerId) return;
          }
        }
        endTraceInput();
      };
      targetEl.addEventListener('touchend', onTouchEnd, { passive: false });
      targetEl.addEventListener('touchcancel', onTouchEnd, { passive: false });

      // Pointer events for mouse / Apple Pencil / non-touch devices
      targetEl.addEventListener('pointerdown', (ev) => {
        if (ev.pointerType === 'touch') return; // handled natively above for Safari reliability
        if (!document.getElementById('screen-trace')?.classList.contains('active')) return;
        ev.preventDefault();
        try { targetEl.setPointerCapture(ev.pointerId); } catch (_) {}
        startTraceInput(ev.clientX, ev.clientY, `ptr-${ev.pointerId}`);
      });

      window.addEventListener('pointermove', (ev) => {
        if (ev.pointerType === 'touch') return;
        if (!isPointerDown || activePointerId !== `ptr-${ev.pointerId}`) return;
        moveTraceInput(ev.clientX, ev.clientY);
      });

      window.addEventListener('pointerup', (ev) => {
        if (ev.pointerType === 'touch') return;
        if (!isPointerDown || activePointerId !== `ptr-${ev.pointerId}`) return;
        endTraceInput();
      });

      window.addEventListener('pointercancel', (ev) => {
        if (ev.pointerType === 'touch') return;
        if (!isPointerDown || activePointerId !== `ptr-${ev.pointerId}`) return;
        endTraceInput();
      });

      loadLetter(0, false);
    }

    function stopDrawAudio() {
      if (drawSoundPlaying) {
        drawSoundPlaying = false;
        window.sound?.stopDrawSound?.();
      } else {
        window.sound?.stopDrawSound?.();
      }
      stillFrames = 0;
    }

    function clearTimers() {
      clearTimeout(idleTimer);
      clearTimeout(advanceTimer);
      clearTimeout(nextStrokeTimer);
    }

    function scheduleIdleHint() {
      clearTimeout(idleTimer);
      handHintEl?.classList.add('hidden');
      idleTimer = setTimeout(() => {
        if (!completed && activePathEl && handHintEl && document.getElementById('screen-trace')?.classList.contains('active')) {
          const pt = activePathEl.getPointAtLength(displayProgress * activeStrokeLen);
          handHintEl.style.left = `${(pt.x / 400) * 100}%`;
          handHintEl.style.top = `${(pt.y / 400) * 100}%`;
          handHintEl.classList.remove('hidden');
        }
      }, 4200);
    }

    function loadLetter(idx, announce = false) {
      stopDrawAudio();
      clearTimers();
      isPointerDown = false;
      activePointerId = null;

      traceIndex = (idx + window.ABC_DATA.length) % window.ABC_DATA.length;
      strokeIdx = 0;
      targetProgress = 0;
      displayProgress = 0;
      completed = false;
      strokeFinishing = false;

      rewardBadgeEl?.classList.add('hidden');

      const buttons = stripEl.querySelectorAll('.trace-mini-btn');
      buttons.forEach((b, i) => b.classList.toggle('active', i === traceIndex));
      const activeBtn = buttons[traceIndex];
      if (activeBtn) {
        activeBtn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }

      renderStrokeSvg();
      scheduleIdleHint();

      if (announce) {
        const item = window.ABC_DATA[traceIndex];
        window.sound?.playTap?.(540);
        window.sound?.speakClip?.(`./audio/letters/${item.letter.toLowerCase()}.mp3`, item.letter);
      }
    }

    function buildFineSamples(pathEl, totalLen) {
      sampledPoints = [];
      for (let i = 0; i <= PATH_SAMPLES; i++) {
        const t = i / PATH_SAMPLES;
        const pt = pathEl.getPointAtLength(t * totalLen);
        sampledPoints.push({ t, x: pt.x, y: pt.y, angleDeg: 0 });
      }
      for (let i = 0; i < sampledPoints.length; i++) {
        const prev = sampledPoints[Math.max(0, i - 1)];
        const next = sampledPoints[Math.min(sampledPoints.length - 1, i + 1)];
        sampledPoints[i].angleDeg = (Math.atan2(next.y - prev.y, next.x - prev.x) * 180) / Math.PI;
      }
    }

    // Pure-JS interpolation over precomputed samples (zero SVG DOM calls per frame!)
    function sampleAt(t) {
      if (sampledPoints.length === 0) return { x: 200, y: 200, angleDeg: 0 };
      const clamped = Math.max(0, Math.min(1, t));
      const fIdx = clamped * PATH_SAMPLES;
      const i0 = Math.floor(fIdx);
      const i1 = Math.min(PATH_SAMPLES, i0 + 1);
      const frac = fIdx - i0;
      const a = sampledPoints[i0];
      const b = sampledPoints[i1];
      return {
        x: a.x + (b.x - a.x) * frac,
        y: a.y + (b.y - a.y) * frac,
        angleDeg: a.angleDeg,
      };
    }

    function renderStrokeSvg() {
      const item = window.ABC_DATA[traceIndex];
      traceSvg.innerHTML = '';
      activePathEl = null;
      activeFillEl = null;
      activeHandleGroup = null;
      sampledPoints = [];

      const ns = 'http://www.w3.org/2000/svg';

      // 0. Full-area transparent hit target so iPad Safari always captures touches inside the SVG
      const hitRect = document.createElementNS(ns, 'rect');
      hitRect.setAttribute('x', '0');
      hitRect.setAttribute('y', '0');
      hitRect.setAttribute('width', '400');
      hitRect.setAttribute('height', '400');
      hitRect.setAttribute('fill', 'transparent');
      hitRect.setAttribute('pointer-events', 'all');
      traceSvg.appendChild(hitRect);

      // 1. Base translucent tracks + dashed center guides for all strokes
      item.strokes.forEach((d) => {
        const base = document.createElementNS(ns, 'path');
        base.setAttribute('d', d);
        base.setAttribute('stroke', 'rgba(255, 255, 255, 0.22)');
        base.setAttribute('stroke-width', '56');
        base.setAttribute('stroke-linecap', 'round');
        base.setAttribute('stroke-linejoin', 'round');
        base.setAttribute('fill', 'none');
        traceSvg.appendChild(base);

        const dots = document.createElementNS(ns, 'path');
        dots.setAttribute('d', d);
        dots.setAttribute('stroke', 'rgba(255, 255, 255, 0.72)');
        dots.setAttribute('stroke-width', '6');
        dots.setAttribute('stroke-dasharray', '12 16');
        dots.setAttribute('stroke-linecap', 'round');
        dots.setAttribute('stroke-linejoin', 'round');
        dots.setAttribute('fill', 'none');
        traceSvg.appendChild(dots);
      });

      // 2. Already completed strokes in warm Golden Yellow
      for (let i = 0; i < strokeIdx; i++) {
        const done = document.createElementNS(ns, 'path');
        done.setAttribute('class', 'stroke-filled');
        done.setAttribute('d', item.strokes[i]);
        done.setAttribute('stroke', GOLDEN_PAINT);
        done.setAttribute('stroke-width', '56');
        done.setAttribute('stroke-linecap', 'round');
        done.setAttribute('stroke-linejoin', 'round');
        done.setAttribute('fill', 'none');
        traceSvg.appendChild(done);
      }

      if (strokeIdx >= item.strokes.length) return;

      // 3. Active stroke progressive fill
      const activeD = item.strokes[strokeIdx];
      activePathEl = document.createElementNS(ns, 'path');
      activePathEl.setAttribute('d', activeD);
      activePathEl.setAttribute('fill', 'none');
      activePathEl.setAttribute('stroke', 'transparent');
      traceSvg.appendChild(activePathEl);

      activeStrokeLen = Math.max(1, activePathEl.getTotalLength());
      buildFineSamples(activePathEl, activeStrokeLen);

      activeFillEl = document.createElementNS(ns, 'path');
      activeFillEl.setAttribute('class', 'stroke-filled');
      activeFillEl.setAttribute('d', activeD);
      activeFillEl.setAttribute('stroke', GOLDEN_PAINT);
      activeFillEl.setAttribute('stroke-width', '56');
      activeFillEl.setAttribute('stroke-linecap', 'round');
      activeFillEl.setAttribute('stroke-linejoin', 'round');
      activeFillEl.setAttribute('fill', 'none');
      activeFillEl.setAttribute('stroke-dasharray', `${activeStrokeLen}`);
      activeFillEl.setAttribute('stroke-dashoffset', `${activeStrokeLen}`);
      traceSvg.appendChild(activeFillEl);

      // 4. Green Circular Chevron Guide Badge
      activeHandleGroup = document.createElementNS(ns, 'g');
      activeHandleGroup.style.cursor = 'pointer';
      activeHandleGroup.innerHTML = `
        <circle cx="0" cy="0" r="31" fill="#4CD964" stroke="#FFFFFF" stroke-width="5"/>
        <path d="M-6 -10 L8 0 L-6 10" stroke="#FFFFFF" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      `;
      traceSvg.appendChild(activeHandleGroup);

      applyVisualProgress(0);
    }

    function applyVisualProgress(prog) {
      if (!activePathEl || !activeFillEl || !activeHandleGroup) return;
      const clamped = Math.max(0, Math.min(1, prog));
      const dist = clamped * activeStrokeLen;
      activeFillEl.setAttribute('stroke-dashoffset', `${Math.max(0, activeStrokeLen - dist)}`);

      const pt = sampleAt(clamped);
      activeHandleGroup.setAttribute(
        'transform',
        `translate(${pt.x.toFixed(2)}, ${pt.y.toFixed(2)}) rotate(${pt.angleDeg.toFixed(2)})`
      );
    }

    function clientToSvgPoint(clientX, clientY) {
      const rect = traceSvg.getBoundingClientRect();
      return {
        x: ((clientX - rect.left) / (rect.width || 400)) * 400,
        y: ((clientY - rect.top) / (rect.height || 400)) * 400,
      };
    }

    // Project pointer onto active stroke using 180 fine samples + local micro-refinement
    function projectOntoActiveStroke(px, py) {
      if (!activePathEl || sampledPoints.length === 0) {
        return { bestT: targetProgress, minD: Infinity };
      }

      // Forward-windowed search prevents closed loops (O, Q, B, D, P, R) from jumping 0 -> 1
      const minT = Math.max(0, targetProgress - 0.03);
      const maxT = Math.min(1, targetProgress + 0.38);
      const startI = Math.max(0, Math.floor(minT * PATH_SAMPLES));
      const endI = Math.min(PATH_SAMPLES, Math.ceil(maxT * PATH_SAMPLES));

      let bestT = targetProgress;
      let minD = Infinity;

      for (let i = startI; i <= endI; i++) {
        const s = sampledPoints[i];
        const d = Math.hypot(px - s.x, py - s.y);
        if (d < minD) {
          minD = d;
          bestT = s.t;
        }
      }

      // Pure-JS local refinement between adjacent precomputed samples (zero SVG DOM calls!)
      const span = 1 / PATH_SAMPLES;
      const rStart = Math.max(minT, bestT - span);
      const rEnd = Math.min(maxT, bestT + span);
      const microSteps = 8;
      for (let k = 0; k <= microSteps; k++) {
        const t = rStart + ((rEnd - rStart) * k) / microSteps;
        const pt = sampleAt(t);
        const d = Math.hypot(px - pt.x, py - pt.y);
        if (d < minD) {
          minD = d;
          bestT = t;
        }
      }

      return { bestT, minD };
    }

    function startTraceInput(clientX, clientY, inputId) {
      if (completed) {
        loadLetter(traceIndex + 1, true);
        return;
      }
      if (strokeFinishing || !activePathEl) return;

      isPointerDown = true;
      activePointerId = inputId;
      lastClientX = clientX;
      lastClientY = clientY;
      handHintEl?.classList.add('hidden');
      clearTimeout(idleTimer);

      const p = clientToSvgPoint(clientX, clientY);
      const handlePt = activePathEl.getPointAtLength(displayProgress * activeStrokeLen);
      const distToHandle = Math.hypot(p.x - handlePt.x, p.y - handlePt.y);
      const { bestT, minD } = projectOntoActiveStroke(p.x, p.y);

      if (distToHandle < 85) {
        // Grabbed near the green chevron handle: start smooth continuous drag!
        if (bestT > targetProgress) {
          targetProgress = Math.min(1, bestT);
        }
        if (!drawSoundPlaying) {
          drawSoundPlaying = true;
          window.sound?.startDrawSound?.();
          window.sound?.updateDrawSound?.(0.25, displayProgress);
        }
      } else if (minD < 120 || distToHandle < 145) {
        // Forgiving toddler tap ahead along the stroke: glide smoothly instead of teleporting!
        const boost = Math.max(bestT, targetProgress + 0.34);
        targetProgress = Math.min(1, boost);
        if (!drawSoundPlaying) {
          drawSoundPlaying = true;
          window.sound?.startDrawSound?.();
          window.sound?.updateDrawSound?.(0.55, displayProgress);
        }
        window.FX?.burstConfetti(clientX, clientY, GOLDEN_PAINT, 6);
      } else {
        // Even a tap anywhere on the letter board nudges progress smoothly forward for 2yo play!
        targetProgress = Math.min(1, targetProgress + 0.28);
        if (!drawSoundPlaying) {
          drawSoundPlaying = true;
          window.sound?.startDrawSound?.();
          window.sound?.updateDrawSound?.(0.45, displayProgress);
        }
      }

      if (targetProgress >= 0.95) {
        targetProgress = 1;
        strokeFinishing = true;
      }
    }

    function moveTraceInput(clientX, clientY) {
      if (!isPointerDown || completed || strokeFinishing || !activePathEl) return;
      if (!document.getElementById('screen-trace')?.classList.contains('active')) return;

      lastClientX = clientX;
      lastClientY = clientY;

      const p = clientToSvgPoint(clientX, clientY);
      const { bestT, minD } = projectOntoActiveStroke(p.x, p.y);

      if (minD < 125 && bestT > targetProgress) {
        targetProgress = Math.min(1, bestT);
        if (targetProgress >= 0.95) {
          targetProgress = 1;
          strokeFinishing = true;
        }
      }
    }

    function endTraceInput() {
      if (!isPointerDown) return;
      isPointerDown = false;
      activePointerId = null;
      stopDrawAudio();
      if (!completed) {
        scheduleIdleHint();
      }
    }

    // Called at 60fps from app.js main loop when on #screen-trace
    function update() {
      if (!initialized || completed || !activePathEl) return;

      const prevDisplay = displayProgress;
      const diff = targetProgress - displayProgress;

      if (Math.abs(diff) > 0.0004) {
        displayProgress += diff * 0.3;
        if (targetProgress >= 1 && displayProgress >= 0.985) {
          displayProgress = 1;
        }
        applyVisualProgress(displayProgress);
      }

      const delta = Math.max(0, displayProgress - prevDisplay);

      // Continuous drawing sound modulation while pointer is down & advancing
      if (isPointerDown && !completed) {
        if (delta > 0.0008) {
          stillFrames = 0;
          if (!drawSoundPlaying) {
            drawSoundPlaying = true;
            window.sound?.startDrawSound?.();
          }
          const speedNorm = Math.min(1, delta / 0.032);
          window.sound?.updateDrawSound?.(speedNorm, displayProgress);

          if (delta > 0.008 && Math.random() < 0.28) {
            window.FX?.burstConfetti(lastClientX, lastClientY, GOLDEN_PAINT, 3);
          }
        } else {
          stillFrames++;
          if (stillFrames > 8 && drawSoundPlaying) {
            stopDrawAudio();
          }
        }
      }

      // Trigger stroke completion once displayProgress has smoothly glided to the end
      if ((strokeFinishing || targetProgress >= 1) && displayProgress >= 0.985) {
        finishCurrentStroke();
      }
    }

    function finishCurrentStroke() {
      displayProgress = 1;
      targetProgress = 1;
      strokeFinishing = false;
      applyVisualProgress(1);
      stopDrawAudio();
      isPointerDown = false;
      activePointerId = null;

      const item = window.ABC_DATA[traceIndex];
      window.sound?.playSparkle?.(strokeIdx + 1);

      if (lastClientX && lastClientY) {
        window.FX?.burstConfetti(lastClientX, lastClientY, GOLDEN_PAINT, 16);
      }

      strokeIdx++;
      if (strokeIdx < item.strokes.length) {
        targetProgress = 0;
        displayProgress = 0;
        nextStrokeTimer = setTimeout(() => {
          renderStrokeSvg();
          scheduleIdleHint();
        }, 90);
      } else {
        // Whole Letter Completed!
        completed = true;
        if (activeHandleGroup && activePathEl) {
          const endPt = activePathEl.getPointAtLength(activeStrokeLen);
          activeHandleGroup.setAttribute('transform', `translate(${endPt.x.toFixed(2)}, ${endPt.y.toFixed(2)})`);
          activeHandleGroup.innerHTML = `
            <circle cx="0" cy="0" r="32" fill="#34C759" stroke="#FFFFFF" stroke-width="5"/>
            <path d="M-11 1 L-3 10 L13 -8" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
          `;
        }

        if (boardEl) {
          const r = boardEl.getBoundingClientRect();
          window.FX?.burstConfetti(r.left + r.width / 2, r.top + r.height / 2, GOLDEN_PAINT, 44);
        }
        window.FX?.cheerCompanion(companionEl);

        // Reveal Animal Reward Card
        const ch = item.letter.toLowerCase();
        if (rewardArtEl && window.PARK_ART?.animalSvg) {
          rewardArtEl.innerHTML = window.PARK_ART.animalSvg(ch);
        }
        if (rewardWordEl) {
          rewardWordEl.textContent = item.word;
        }
        if (rewardBadgeEl) {
          rewardBadgeEl.style.borderColor = item.cardBg || GOLDEN_PAINT;
          rewardBadgeEl.classList.remove('hidden');
        }

        window.sound?.playFanfare?.();
        const praise = PRAISES[Math.floor(Math.random() * PRAISES.length)];
        window.sound?.speakSequence?.([
          { url: `./audio/letters/${ch}.mp3`, fallback: item.letter, gap: 0.08 },
          { url: `./audio/words/${ch}.mp3`, fallback: item.word, gap: 0.14 },
          { url: `./audio/phrases/${praise}.mp3`, fallback: 'Awesome!', gap: 0 },
        ]);

        const finishedIdx = traceIndex;
        advanceTimer = setTimeout(() => {
          if (completed && traceIndex === finishedIdx && document.getElementById('screen-trace')?.classList.contains('active')) {
            loadLetter(finishedIdx + 1, true);
          }
        }, 3100);
      }
    }

    function enter() {
      init();
      // Always start fresh from Letter A with the letter strip hidden
      stripEl?.classList.add('hidden');
      document.getElementById('btn-trace-toggle-strip')?.classList.remove('active');
      loadLetter(0, true);
    }

    function leave() {
      isPointerDown = false;
      activePointerId = null;
      stopDrawAudio();
      clearTimers();
      handHintEl?.classList.add('hidden');
    }

    return { init, enter, leave, update };
  })();

  window.AbcCardsGame = AbcCardsGame;
  window.TraceGame = TraceGame;
})();
