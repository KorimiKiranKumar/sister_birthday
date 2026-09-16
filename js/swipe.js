/**
 * ═══════════════════════════════════════════════════════════════
 * SWIPE CONTROLLER — Touch drag & desktop navigation
 * Direct 1:1 finger following with velocity-based completion
 * ═══════════════════════════════════════════════════════════════
 */
const SwipeController = (() => {
  let tStartX = 0, tStartY = 0;
  let tLastY  = 0, tTime   = 0;
  let tracking  = false;
  let isVert    = false;
  let insideGallery = false;

  let wheelLocked = false, wheelTimer = null;

  function init() {
    const vp = document.getElementById('cinema-viewport') || document.documentElement;

    vp.addEventListener('touchstart',  onTS, { passive: true });
    vp.addEventListener('touchmove',   onTM, { passive: false });
    vp.addEventListener('touchend',    onTE, { passive: true });
    vp.addEventListener('touchcancel', onTC, { passive: true });

    window.addEventListener('wheel',   onWheel, { passive: false });
    window.addEventListener('keydown', onKey);
  }

  /* ── Touch Start ── */
  function onTS(e) {
    if (!e.touches || !e.touches.length) return;
    if (window.SceneManager && window.SceneManager.isBusy()) return;
    tStartX = e.touches[0].clientX;
    tStartY = e.touches[0].clientY;
    tLastY  = tStartY;
    tTime   = performance.now();
    tracking = true;
    isVert   = false;

    // Check if inside gallery
    const el = e.target;
    insideGallery = el.closest('#gallery-track, .gallery-stage, .gallery-controls') !== null
                 && window.SceneManager && window.SceneManager.current === 6;
  }

  /* ── Touch Move ── */
  function onTM(e) {
    if (!tracking || !e.touches || !e.touches.length) return;
    const cX = e.touches[0].clientX;
    const cY = e.touches[0].clientY;
    const dX = tStartX - cX;
    const dY = tStartY - cY;
    tLastY = cY;

    // Determine primary direction once (> 6px movement)
    if (!isVert) {
      if (Math.abs(dX) < 6 && Math.abs(dY) < 6) return;
      if (Math.abs(dY) >= Math.abs(dX)) {
        isVert = true;
        if (window.SceneManager) window.SceneManager.startDrag();
      } else {
        // Horizontal — release to gallery or ignore
        tracking = false;
        return;
      }
    }

    if (isVert) {
      if (e.cancelable) e.preventDefault();
      if (window.SceneManager) window.SceneManager.moveDrag(dY);
    }
  }

  /* ── Touch End ── */
  function onTE(e) {
    if (!tracking) return;
    tracking = false;
    if (!isVert) return;

    const elapsed = Math.max(1, performance.now() - tTime);
    const deltaY  = tStartY - tLastY;
    const velocity = deltaY / elapsed;   // px / ms

    if (window.SceneManager) window.SceneManager.endDrag(deltaY, velocity);
    isVert = false;
  }

  /* ── Touch Cancel ── */
  function onTC() {
    if (isVert && window.SceneManager) window.SceneManager.endDrag(0, 0);
    tracking = false; isVert = false;
  }

  /* ── Mouse Wheel ── */
  function onWheel(e) {
    e.preventDefault();
    if (wheelLocked) return;
    if (window.SceneManager && window.SceneManager.isBusy()) return;
    if (Math.abs(e.deltaY) < 15) return;

    wheelLocked = true;
    if (e.deltaY > 0) { if (window.SceneManager) window.SceneManager.next(); }
    else              { if (window.SceneManager) window.SceneManager.prev(); }

    clearTimeout(wheelTimer);
    wheelTimer = setTimeout(() => { wheelLocked = false; }, 900);
  }

  /* ── Keyboard ── */
  function onKey(e) {
    const tag = document.activeElement.tagName.toLowerCase();
    if (tag === 'input' || tag === 'textarea') return;
    if (window.SceneManager && window.SceneManager.isBusy()) return;

    switch (e.key) {
      case 'ArrowDown': case 'PageDown': case ' ':
        e.preventDefault();
        if (window.SceneManager) window.SceneManager.next(); break;
      case 'ArrowUp': case 'PageUp':
        e.preventDefault();
        if (window.SceneManager) window.SceneManager.prev(); break;
      case 'Home':
        e.preventDefault();
        if (window.SceneManager) window.SceneManager.goTo(0); break;
      case 'End':
        e.preventDefault();
        if (window.SceneManager) window.SceneManager.goTo(window.SceneManager.total - 1); break;
    }
  }

  return { init };
})();

window.SwipeController = SwipeController;
