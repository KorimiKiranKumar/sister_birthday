/**
 * ═══════════════════════════════════════════════════════════════
 * APP — Master coordinator & initializer
 * ═══════════════════════════════════════════════════════════════
 */
document.addEventListener('DOMContentLoaded', () => {

  /* 1 — Init all subsystems */
  if (window.MusicEngine)     MusicEngine.init();
  if (window.FX)              FX.init();
  if (window.SceneManager)    SceneManager.init();
  if (window.SwipeController)  SwipeController.init();
  if (window.GalleryCarousel)  GalleryCarousel.init();

  /* 2 — "Start the Surprise" button */
  const startBtn = document.getElementById('btn-start-surprise');
  if (startBtn) {
    startBtn.addEventListener('click', e => {
      e.stopPropagation();
      // 🎵 Start music on first user interaction (satisfies browser autoplay policy)
      if (window.MusicEngine) MusicEngine.start();
      // Slide to scene 1
      if (window.SceneManager) SceneManager.goTo(1);
    });
  }

  /* 3 — Graceful image fallbacks */
  document.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', function () {
      this.removeEventListener('error', arguments.callee);
      // Beautiful SVG placeholder with gradient
      this.src = "data:image/svg+xml;utf8," + encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500">
          <defs>
            <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#531b3b"/>
              <stop offset="100%" stop-color="#2c0b4d"/>
            </linearGradient>
          </defs>
          <rect width="400" height="500" fill="url(#g)"/>
          <circle cx="200" cy="230" r="80" fill="none" stroke="#ff6b9d" stroke-width="3" stroke-dasharray="6 4"/>
          <text x="200" y="224" text-anchor="middle" dominant-baseline="middle" font-size="48" font-family="serif">✨</text>
          <text x="200" y="285" text-anchor="middle" font-size="16" fill="#ffd6e8" font-family="serif" font-style="italic">Sweet Memories</text>
        </svg>
      `);
    });
  });

  /* 4 — Interactive Photo Cards Focus on Tap/Click */
  const interactiveCards = document.querySelectorAll('.collage-card, .double-photos .polaroid-frame, .strip-card');
  interactiveCards.forEach(card => {
    card.addEventListener('click', e => {
      e.stopPropagation();
      const isAlreadyFocused = card.classList.contains('focused');
      interactiveCards.forEach(c => c.classList.remove('focused'));
      if (!isAlreadyFocused) {
        card.classList.add('focused');
      }
    });
  });

  document.addEventListener('click', () => {
    interactiveCards.forEach(c => c.classList.remove('focused'));
  });

  /* 5 — Hide preloader */
  setTimeout(() => {
    const loader = document.getElementById('experience-loader');
    if (loader) {
      loader.classList.add('hidden');
      setTimeout(() => loader.remove(), 1000);
    }
  }, 500);

});
