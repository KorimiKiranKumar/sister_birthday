/**
 * ═══════════════════════════════════════════════════════════════
 * 3D PHOTO GALLERY CAROUSEL (Scene 6)
 * Isolated horizontal swipe — does NOT trigger scene navigation
 * ═══════════════════════════════════════════════════════════════
 */
const GalleryCarousel = (() => {
  let cards = [], dots = [], idx = 0, total = 0;
  let tSX = 0, tSY = 0;
  let dragging = false;

  function init() {
    const track = document.getElementById('gallery-track');
    if (!track) return;
    cards = Array.from(track.querySelectorAll('.g-card'));
    total = cards.length;
    if (!total) return;

    // Dot indicators
    const dotsRow = document.getElementById('gallery-dots');
    if (dotsRow) {
      for (let i = 0; i < total; i++) {
        const d = document.createElement('div');
        d.className = 'gallery-dot' + (i === 0 ? ' active' : '');
        d.addEventListener('click', e => { e.stopPropagation(); go(i); });
        dotsRow.appendChild(d);
      }
      dots = Array.from(dotsRow.querySelectorAll('.gallery-dot'));
    }

    // Buttons
    const prev = document.getElementById('gallery-btn-prev');
    const next = document.getElementById('gallery-btn-next');
    if (prev) prev.addEventListener('click', e => { e.stopPropagation(); go(idx - 1); });
    if (next) next.addEventListener('click', e => { e.stopPropagation(); go(idx + 1); });

    // Card click to focus
    cards.forEach((c, i) => c.addEventListener('click', e => { e.stopPropagation(); go(i); }));

    // Touch swipe inside gallery track (horizontal only)
    track.addEventListener('touchstart', ts => {
      if (!ts.touches.length) return;
      tSX = ts.touches[0].clientX;
      tSY = ts.touches[0].clientY;
      dragging = true;
    }, { passive: true });

    track.addEventListener('touchend', te => {
      if (!dragging || !te.changedTouches.length) return;
      dragging = false;
      const dX = tSX - te.changedTouches[0].clientX;
      const dY = tSY - te.changedTouches[0].clientY;
      // Only process if horizontal intent
      if (Math.abs(dX) > Math.abs(dY) && Math.abs(dX) > 35) {
        if (dX > 0) go(idx + 1); else go(idx - 1);
      }
    }, { passive: true });

    render();
  }

  function go(i) {
    idx = ((i % total) + total) % total;
    render();
  }

  function render() {
    cards.forEach((c, i) => {
      const offset = (i - idx + total) % total;
      let rel = offset > total / 2 ? offset - total : offset;

      if (rel === 0) {
        // Active center — centered via translate(-50%,-50%) then no extra offset
        c.style.transform = 'translate(-50%, -50%) scale(1) rotateY(0deg)';
        c.style.opacity   = '1';
        c.style.zIndex    = '10';
        c.style.filter    = 'none';
        c.style.pointerEvents = 'auto';
      } else if (rel === 1) {
        // One card to the right — shift right by ~60% of card width from center
        c.style.transform = 'translate(10%, -50%) scale(0.82) rotateY(-18deg)';
        c.style.opacity   = '0.4';
        c.style.zIndex    = '5';
        c.style.filter    = 'blur(1.5px)';
        c.style.pointerEvents = 'auto';
      } else if (rel === -1) {
        // One card to the left — shift left by ~60%
        c.style.transform = 'translate(-110%, -50%) scale(0.82) rotateY(18deg)';
        c.style.opacity   = '0.4';
        c.style.zIndex    = '5';
        c.style.filter    = 'blur(1.5px)';
        c.style.pointerEvents = 'auto';
      } else {
        // Far cards — fully hidden
        const dir = rel > 0 ? 1 : -1;
        c.style.transform = `translate(${-50 + dir * 150}%, -50%) scale(0.6)`;
        c.style.opacity   = '0';
        c.style.zIndex    = '1';
        c.style.filter    = 'blur(4px)';
        c.style.pointerEvents = 'none';
      }
    });

    dots.forEach((d, i) => d.classList.toggle('active', i === idx));
  }

  return { init, go };
})();

window.GalleryCarousel = GalleryCarousel;
