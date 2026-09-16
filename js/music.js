/**
 * ═══════════════════════════════════════════════════════════════
 * MUSIC ENGINE — Plays audio/birthday.mp3 automatically
 * Falls back to Web Audio API chime synthesizer if file missing
 * ═══════════════════════════════════════════════════════════════
 */
const MusicEngine = (() => {
  let audio = null;
  let isPlaying = false;
  let audioCtx = null;
  let synthTimer = null;
  let noteIdx = 0;
  let useSynth = false;

  // Soft pentatonic melody notes (Hz)
  const MELODY = [523.25, 659.25, 783.99, 880, 1046.5, 880, 783.99, 659.25, 523.25, 587.33, 659.25];

  function init() {
    audio = document.getElementById('bg-audio');
    const btn = document.getElementById('music-toggle-btn');
    if (btn) btn.addEventListener('click', e => { e.stopPropagation(); toggle(); });

    // If audio element fails to load source, flag synth fallback
    if (audio) {
      audio.addEventListener('error', () => { useSynth = true; });
      // Test if audio source is reachable with a lightweight canPlayType check
      if (!audio.canPlayType('audio/mpeg')) useSynth = true;
    } else {
      useSynth = true;
    }
  }

  function getCtx() {
    if (!audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) { audioCtx = new AC(); }
    }
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  }

  function playTone(freq, dur = 1.6) {
    const ctx = getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.07, ctx.currentTime + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + dur);
    } catch (_) { /* silent fail */ }
  }

  function startSynth() {
    stopSynth();
    playTone(MELODY[0], 1.8);
    synthTimer = setInterval(() => {
      noteIdx = (noteIdx + 1) % MELODY.length;
      playTone(MELODY[noteIdx], 1.8);
    }, 1600);
  }

  function stopSynth() {
    if (synthTimer) { clearInterval(synthTimer); synthTimer = null; }
  }

  /**
   * Called after first user gesture — tries real MP3 first,
   * falls back to synthesizer silently.
   */
  function start() {
    if (isPlaying) return;

    if (audio && !useSynth) {
      audio.volume = 0.75;
      const p = audio.play();
      if (p) {
        p.then(() => {
          isPlaying = true;
          updateUI();
        }).catch(() => {
          // File missing or blocked — use synth
          useSynth = true;
          startSynth();
          isPlaying = true;
          updateUI();
        });
      }
    } else {
      startSynth();
      isPlaying = true;
      updateUI();
    }
  }

  function pause() {
    if (!isPlaying) return;
    if (audio && !useSynth) audio.pause();
    stopSynth();
    isPlaying = false;
    updateUI();
  }

  function toggle() { isPlaying ? pause() : start(); }

  function updateUI() {
    const btn = document.getElementById('music-toggle-btn');
    if (!btn) return;
    if (isPlaying) {
      btn.classList.add('playing');
      btn.setAttribute('aria-label', 'Pause music');
    } else {
      btn.classList.remove('playing');
      btn.setAttribute('aria-label', 'Play music');
    }
  }

  function chime() {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
      setTimeout(() => playTone(f, 2.2), i * 130)
    );
  }

  return { init, start, pause, toggle, chime, isPlaying: () => isPlaying };
})();

window.MusicEngine = MusicEngine;
