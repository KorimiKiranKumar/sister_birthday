/**
 * ═══════════════════════════════════════════════════════════════
 * FX ENGINE — Particles, Confetti, Gift box
 * ═══════════════════════════════════════════════════════════════
 */
const FX = (() => {
  let pCanvas, pCtx;
  let cCanvas, cCtx;
  let particles = [];
  let confetti  = [];
  let raf = null;

  function init() {
    pCanvas = document.getElementById('particle-canvas');
    cCanvas = document.getElementById('confetti-canvas');
    if (pCanvas) { pCtx = pCanvas.getContext('2d'); }
    if (cCanvas) { cCtx = cCanvas.getContext('2d'); }
    sizeCanvases();
    window.addEventListener('resize', sizeCanvases);
    spawnParticles();
    initGift();
    loop();
  }

  function sizeCanvases() {
    const vp = document.getElementById('cinema-viewport');
    const w  = vp ? vp.clientWidth  : window.innerWidth;
    const h  = vp ? vp.clientHeight : window.innerHeight;
    [pCanvas, cCanvas].forEach(c => { if (c) { c.width = w; c.height = h; } });
  }

  /* ── Ambient stardust particles ── */
  function spawnParticles() {
    if (!pCanvas) return;
    const count = Math.min(30, Math.round(pCanvas.width / 12));
    for (let i = 0; i < count; i++) {
      particles.push({
        x:  Math.random() * pCanvas.width,
        y:  Math.random() * pCanvas.height,
        r:  Math.random() * 1.8 + 0.5,
        vx: (Math.random() - 0.5) * 0.22,
        vy: -(Math.random() * 0.35 + 0.1),
        a:  Math.random() * 0.65 + 0.2,
        c:  pickColor(),
        pulse: Math.random() * 0.018 + 0.005,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  const COLORS = ['rgba(255,107,157,', 'rgba(255,209,102,', 'rgba(216,180,254,', 'rgba(255,255,255,'];
  function pickColor() { return COLORS[Math.floor(Math.random() * COLORS.length)]; }

  /* ── Confetti burst ── */
  function confettiBurst(count = 80) {
    if (!cCanvas) return;
    const cx = cCanvas.width * 0.5;
    const cy = cCanvas.height * 0.35;
    const cols = ['#ff4071','#ff6b9d','#ffd166','#ffffff','#d8b4fe','#06d6a0','#ffb347'];
    for (let i = 0; i < count; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = Math.random() * 9 + 3;
      confetti.push({
        x: cx + (Math.random() - 0.5) * 80,
        y: cy + (Math.random() - 0.5) * 60,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd - 3.5,
        w:  Math.random() * 8 + 4,
        h:  Math.random() * 5 + 3,
        color: cols[Math.floor(Math.random() * cols.length)],
        rot: Math.random() * 360,
        rotV: (Math.random() - 0.5) * 15,
        gravity: 0.2,
        drag: 0.96,
        alpha: 1,
        decay: Math.random() * 0.009 + 0.006
      });
    }
  }

  /* ── RAF loop ── */
  function loop() {
    raf = requestAnimationFrame(loop);
    drawParticles();
    drawConfetti();
  }

  function drawParticles() {
    if (!pCtx || !pCanvas) return;
    pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);
    const t = Date.now();
    for (const p of particles) {
      p.x += p.vx; p.y += p.vy;
      if (p.y < -8) { p.y = pCanvas.height + 8; p.x = Math.random() * pCanvas.width; }
      if (p.x < -8) p.x = pCanvas.width + 8;
      if (p.x > pCanvas.width + 8) p.x = -8;
      const a = Math.max(0.05, Math.min(0.85, p.a + Math.sin(t * p.pulse + p.phase) * 0.15));
      pCtx.beginPath();
      pCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      pCtx.fillStyle = p.c + a + ')';
      pCtx.shadowBlur = 8; pCtx.shadowColor = p.c + '0.6)';
      pCtx.fill();
      pCtx.shadowBlur = 0;
    }
  }

  function drawConfetti() {
    if (!cCtx || !cCanvas || !confetti.length) { if (cCtx) cCtx.clearRect(0, 0, cCanvas.width, cCanvas.height); return; }
    cCtx.clearRect(0, 0, cCanvas.width, cCanvas.height);
    for (let i = confetti.length - 1; i >= 0; i--) {
      const c = confetti[i];
      c.vx *= c.drag; c.vy = c.vy * c.drag + c.gravity;
      c.x += c.vx; c.y += c.vy;
      c.rot += c.rotV;
      c.alpha -= c.decay;
      if (c.alpha <= 0 || c.y > cCanvas.height + 30) { confetti.splice(i, 1); continue; }
      cCtx.save();
      cCtx.translate(c.x, c.y);
      cCtx.rotate(c.rot * Math.PI / 180);
      cCtx.globalAlpha = Math.max(0, c.alpha);
      cCtx.fillStyle = c.color;
      cCtx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
      cCtx.restore();
    }
  }

  /* ── Gift Box ── */
  function initGift() {
    const trigger = document.getElementById('gift-trigger');
    const stage   = document.getElementById('gift-stage');
    if (!trigger || !stage) return;

    trigger.classList.add('wobble');

    trigger.addEventListener('click', e => {
      e.stopPropagation();
      if (stage.classList.contains('opened')) return;
      trigger.classList.remove('wobble');
      stage.classList.add('opened');
      const sub = document.getElementById('s9-tap-instruction');
      if (sub) sub.textContent = '✨ A Special Memory For You ✨';
      confettiBurst(120);
      if (window.MusicEngine) window.MusicEngine.chime();
    });
  }

  function resetGift() {
    const trigger = document.getElementById('gift-trigger');
    const stage   = document.getElementById('gift-stage');
    if (!trigger || !stage) return;
    stage.classList.remove('opened');
    trigger.classList.add('wobble');
    const sub = document.getElementById('s9-tap-instruction');
    if (sub) sub.textContent = 'Tap the gift box!';
  }

  return { init, confetti: confettiBurst, resetGift };
})();

window.FX = FX;
