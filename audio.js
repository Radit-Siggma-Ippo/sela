const Sfx = (function () {
  let ctx, master, whiteBuf, brownBuf;
  const on = () => typeof state === "undefined" || state.sound;

  function blip(f, v) {
    const o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime;
    o.type = "square"; o.frequency.value = f;
    g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
    o.connect(g); g.connect(master); o.start(); o.stop(t + 0.06);
  }
  function noise(dur, f, q, v) {
    const s = ctx.createBufferSource(), b = ctx.createBiquadFilter(), g = ctx.createGain(), t = ctx.currentTime;
    s.buffer = whiteBuf; b.type = "bandpass"; b.frequency.value = f; b.Q.value = q;
    g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(b); b.connect(g); g.connect(master); s.start(0, Math.random()); s.stop(t + dur);
  }
  function sweep(type, f0, f1, dur, v) {
    const o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime;
    o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(master); o.start(); o.stop(t + dur + 0.02);
  }
  const HURT_VOL = 0.14;
  function hurt() {
    const t = ctx.currentTime, d = 0.22;
    const o = ctx.createOscillator(), o2 = ctx.createOscillator(), f1 = ctx.createBiquadFilter(), f2 = ctx.createBiquadFilter();
    const mix = ctx.createGain(), g2 = ctx.createGain(), env = ctx.createGain();
    o.type = "sawtooth"; o.frequency.setValueAtTime(300, t); o.frequency.exponentialRampToValueAtTime(115, t + d);
    o2.type = "square"; o2.frequency.setValueAtTime(150, t); o2.frequency.exponentialRampToValueAtTime(58, t + d);
    f1.type = "bandpass"; f1.Q.value = 3.5; f1.frequency.setValueAtTime(780, t); f1.frequency.linearRampToValueAtTime(520, t + d);
    f2.type = "bandpass"; f2.Q.value = 5; f2.frequency.setValueAtTime(1380, t); f2.frequency.linearRampToValueAtTime(940, t + d);
    g2.gain.value = 0.55; mix.gain.value = 1;
    o.connect(f1); o2.connect(f1); o.connect(f2); f1.connect(mix); f2.connect(g2); g2.connect(mix); mix.connect(env);
    env.gain.setValueAtTime(0.0001, t); env.gain.exponentialRampToValueAtTime(HURT_VOL, t + 0.012); env.gain.exponentialRampToValueAtTime(0.0001, t + d + 0.03);
    env.connect(master);
    o.start(t); o2.start(t); o.stop(t + d + 0.05); o2.stop(t + d + 0.05);
    noise(0.05, 1000, 0.7, HURT_VOL * 0.35);
  }
  const SYN = {
    klik: () => blip(1300, 0.05),
    langkah: () => noise(0.08, 260, 1.2, 0.18),
    "pintu-buka": () => { sweep("sawtooth", 90, 150, 0.7, 0.04); noise(0.7, 600, 4, 0.08); },
    "pintu-tutup": () => { sweep("sine", 110, 38, 0.3, 0.3); noise(0.12, 180, 0.8, 0.2); },
    gagal: () => { sweep("sawtooth", 220, 35, 1.1, 0.1); noise(0.9, 1200, 0.5, 0.1); },
    menang: () => { sweep("sine", 440, 440.1, 1.2, 0.05); setTimeout(() => ctx && sweep("sine", 660, 660.1, 1.4, 0.04), 220); },
    glitch: () => hurt(),
  };

  // Backsound utama (loop). File: assets/bgm.mp3
  const bgm = new Audio("assets/bgm.mp3"); bgm.loop = true; bgm.preload = "auto";
  const BGM_VOL = 0.4, BGM2_VOL = 1;
  const bgm2 = new Audio("assets/bgm2.mp3"); bgm2.loop = true; bgm2.preload = "auto";
  const song = new Audio("assets/room13.mp3"); song.loop = true; song.preload = "auto";
  const SONG_QUIET = 0.12;
  let songOn = false, songDur = 2.5, songLvl = SONG_QUIET, lvlDur = 4, bv = BGM_VOL, bv2 = BGM2_VOL, sv = 0;
  const ramp = (cur, target, max, dur) => { const r = max * 0.04 / dur; return cur + Math.max(-r, Math.min(r, target - cur)); };
  function songCtl(v, dur) { if (v && !songOn) songLvl = SONG_QUIET; songOn = !!v; songDur = dur || (v ? 2 : 2.5); }
  function songLevel(l, dur) { songLvl = l; lvlDur = dur || 4; }
  function tick() {
    master.gain.setTargetAtTime(on() ? 0.9 : 0, ctx.currentTime, 0.08);
    if (!on()) { bv = bv2 = sv = 0; } else { const bd = songOn ? 8 : songDur; bv = ramp(bv, songOn ? 0 : BGM_VOL, BGM_VOL, bd); bv2 = ramp(bv2, songOn ? 0 : BGM2_VOL, BGM2_VOL, bd); sv = songOn ? ramp(sv, songLvl, 1, lvlDur) : ramp(sv, 0, 1, songDur); }
    bgm.volume = Math.max(0, Math.min(1, bv));
    if (bv > 0.001) { if (bgm.paused) bgm.play().catch(() => {}); } else if (!bgm.paused) bgm.pause();
    bgm2.volume = Math.max(0, Math.min(1, bv2));
    if (bv2 > 0.001) { if (bgm2.paused) bgm2.play().catch(() => {}); } else if (!bgm2.paused) bgm2.pause();
    song.volume = Math.max(0, Math.min(1, sv));
    if (songOn && on()) { if (song.paused) song.play().catch(() => {}); }
    else if (sv <= 0.001 && !song.paused) { song.pause(); song.currentTime = 0; }
  }

  function unlock() {
    if (ctx) { if (ctx.state === "suspended") ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    ctx = new AC(); master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
    const len = ctx.sampleRate * 2;
    whiteBuf = ctx.createBuffer(1, len, ctx.sampleRate); brownBuf = ctx.createBuffer(1, len, ctx.sampleRate);
    const w = whiteBuf.getChannelData(0), b = brownBuf.getChannelData(0); let l = 0;
    for (let i = 0; i < len; i++) { const r = Math.random() * 2 - 1; w[i] = r; l = (l + 0.02 * r) / 1.02; b[i] = l * 3.5; }
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 160;
    const dg = ctx.createGain(); dg.gain.value = 0.07; lp.connect(dg); dg.connect(master);
    [55, 55.7, 82.5].forEach((f) => { const o = ctx.createOscillator(); o.type = "sawtooth"; o.frequency.value = f; o.connect(lp); o.start(); });
    const ws = ctx.createBufferSource(); ws.buffer = brownBuf; ws.loop = true;
    const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 500; bp.Q.value = 0.6;
    const wg = ctx.createGain(); wg.gain.value = 0.05;
    const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = 0.08; lg.gain.value = 0.03;
    lfo.connect(lg); lg.connect(wg.gain); lfo.start();
    ws.connect(bp); bp.connect(wg); wg.connect(master); ws.start();
    setInterval(tick, 40);
  }
  ["pointerdown", "keydown"].forEach((ev) => addEventListener(ev, unlock));
  document.addEventListener("click", (e) => { if (e.target.closest(".btn,.door,.mode,.gal-card")) play("klik"); });

  function play(name) {
    if (!ctx || !on()) return;
    if (SYN[name]) SYN[name]();
  }
  return { play, song: songCtl, songLevel };
})();
