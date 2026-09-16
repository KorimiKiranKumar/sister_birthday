/**
 * ═══════════════════════════════════════════════════════════════
 * SCENE MANAGER — Physical vertical track engine
 * Slow, cinematic, smooth slide transitions (1.2s duration)
 * ═══════════════════════════════════════════════════════════════
 */
const SceneManager = (() => {
  /* ── State ── */
  let current    = 0;
  let total      = 0;
  let moving     = false;
  let dragging   = false;
  let dragStarted = false;

  /* ── DOM refs ── */
  let track   = null;
  let scenes  = [];
  let viewport = null;

  /* ── Timing ── */
  const DURATION  = 1150;  // ms — slow, cinematic
  const EASE      = 'cubic-bezier(0.22, 0.8, 0.28, 1)';
  const EASE_BACK = 'cubic-bezier(0.14, 1.1, 0.32, 1)';  // snap-back

  function vh() {
    return viewport ? viewport.clientHeight : window.innerHeight;
  }

  /* ──────────────────────────────
     INIT
  ────────────────────────────── */
  function init() {
    track    = document.getElementById('scene-track');
    viewport = document.getElementById('cinema-viewport');
    scenes   = Array.from(document.querySelectorAll('.scene'));
    total    = scenes.length;

    buildDots();
    jumpTo(0, true);   // silent initial position

    // Replay button
    const replay = document.getElementById('btn-replay');
    if (replay) replay.addEventListener('click', e => { e.stopPropagation(); goTo(0); });

    // Handle resize & orientation change
    window.addEventListener('resize', () => jumpTo(current, true));
  }

  /* ──────────────────────────────
     TRACK MOVEMENT
  ────────────────────────────── */
  function setTrack(y, animate = true, ease = EASE, duration = DURATION) {
    if (!track) return;
    if (animate) {
      track.style.transition = `transform ${duration}ms ${ease}`;
    } else {
      track.style.transition = 'none';
    }
    track.style.transform = `translate3d(0, ${y}px, 0)`;
  }

  function targetY(idx) { return -(idx * vh()); }

  /* Jump without animation (resize, init) */
  function jumpTo(idx, immediate = false) {
    current = clamp(idx, 0, total - 1);
    setTrack(targetY(current), false);
    void track.offsetHeight; // reflow
    updateStates(current);
    updateDots(current);
    updateCue(current);
  }

  /* ──────────────────────────────
     GO TO SCENE (animated)
  ────────────────────────────── */
  function goTo(idx, customDuration = DURATION) {
    if (moving) return;
    idx = clamp(idx, 0, total - 1);
    if (idx === current) return;

    moving = true;
    const from = current;
    current = idx;

    // Camera depth on outgoing scene
    const outScene = scenes[from];
    if (outScene) outScene.style.transform = 'scale(0.97)';

    setTrack(targetY(current), true, EASE, customDuration);
    updateDots(current);
    updateCue(current);

    // After slide settles
    setTimeout(() => {
      if (outScene) outScene.style.transform = '';
      updateStates(current);
      onEnter(current);
      moving = false;
    }, customDuration + 60);
  }

  /* ──────────────────────────────
     DRAG APIs (called by SwipeController)
  ────────────────────────────── */
  function startDrag() {
    if (moving) return false;
    dragging = true;
    dragStarted = true;
    track.style.transition = 'none';
    return true;
  }

  function moveDrag(deltaY) {
    if (!dragging) return;
    let base = targetY(current);
    let next = base - deltaY;

    // Rubber band at boundaries
    if ((current === 0 && deltaY < 0) || (current === total - 1 && deltaY > 0)) {
      next = base - deltaY * 0.25;
    }
    track.style.transform = `translate3d(0, ${next}px, 0)`;

    // Subtle scale on active scene
    const sc = scenes[current];
    if (sc) {
      const prog = Math.min(1, Math.abs(deltaY) / vh());
      sc.style.transform = `scale(${1 - prog * 0.03})`;
    }
  }

  function endDrag(deltaY, velocity) {
    if (!dragging) return;
    dragging = false;

    // Reset scale
    const sc = scenes[current];
    if (sc) sc.style.transform = '';

    const h = vh();
    const threshold = Math.min(65, h * 0.11);
    const flick = Math.abs(velocity) > 0.35;

    if ((deltaY > threshold || (flick && velocity > 0)) && current < total - 1) {
      // Complete forward (up)
      const remainRatio = Math.max(0.3, 1 - Math.abs(deltaY) / h);
      goTo(current + 1, Math.round(DURATION * remainRatio));
    } else if ((deltaY < -threshold || (flick && velocity < 0)) && current > 0) {
      // Complete backward (down)
      const remainRatio = Math.max(0.3, 1 - Math.abs(deltaY) / h);
      goTo(current - 1, Math.round(DURATION * remainRatio));
    } else {
      // Snap back — slightly springier easing
      moving = true;
      setTrack(targetY(current), true, EASE_BACK, 550);
      setTimeout(() => { moving = false; }, 620);
    }
  }

  /* ──────────────────────────────
     HELPERS
  ────────────────────────────── */
  function next() { if (!moving && current < total - 1) goTo(current + 1); }
  function prev() { if (!moving && current > 0) goTo(current - 1); }

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  function updateStates(idx) {
    scenes.forEach((s, i) => {
      if (i === idx) s.classList.add('active');
      else s.classList.remove('active');
    });
  }

  /* ──────────────────────────────
     DOT INDICATOR
  ────────────────────────────── */
  function buildDots() {
    const nav = document.getElementById('timeline-nav');
    if (!nav) return;
    nav.innerHTML = '';
    for (let i = 0; i < total; i++) {
      const d = document.createElement('div');
      d.className = 'tdot' + (i === 0 ? ' active' : '');
      d.setAttribute('aria-label', `Scene ${i + 1}`);
      d.addEventListener('click', e => { e.stopPropagation(); goTo(i); });
      nav.appendChild(d);
    }
  }
  function updateDots(idx) {
    document.querySelectorAll('.tdot').forEach((d, i) => {
      d.classList.toggle('active', i === idx);
    });
  }

  /* ──────────────────────────────
     SWIPE CUE VISIBILITY
  ────────────────────────────── */
  function updateCue(idx) {
    const cue = document.getElementById('swipe-cue');
    if (!cue) return;
    const hide = (idx === 0 || idx === total - 1 || moving || dragging);
    cue.style.opacity = hide ? '0' : '1';
  }

  /* ──────────────────────────────
     SCENE ENTER HOOKS
  ────────────────────────────── */
  function onEnter(idx) {
    // Scene 0: reset gift if replaying
    if (idx === 0) {
      if (window.FX && window.FX.resetGift) window.FX.resetGift();
    }
    // Scene 4: emotional line reveals
    if (idx === 4) {
      document.querySelectorAll('#s4-lines .em-line').forEach((el, i) => {
        el.classList.remove('show');
        setTimeout(() => el.classList.add('show'), (i + 1) * 450);
      });
    }
    // Scene 5 & 10: confetti
    if (idx === 5 || idx === 10) {
      if (window.FX) {
        window.FX.confetti(idx === 5 ? 130 : 90);
        if (idx === 5) setTimeout(() => window.FX.confetti(70), 700);
      }
    }
  }

  return {
    init, goTo, next, prev,
    startDrag, moveDrag, endDrag,
    get current() { return current; },
    get total() { return total; },
    isBusy: () => moving || dragging
  };
})();

window.SceneManager = SceneManager;
