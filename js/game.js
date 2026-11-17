const Game = (function () {
  const cv = document.getElementById("stage"), g = cv.getContext("2d"), promptEl = document.getElementById("prompt");
  g.imageSmoothingQuality = "high";
  const W = 960, H = 540, GROUND = 502, SPEED = 300, FIRST = 700;
  const ASSET = "assets/game/";
  const MW = 1620;
  const DOOR = { x: 75, y: 110, w: 188, h: 351 };
  const PLATE = { x: 289, y: 125, w: 76, h: 34 };
  const DC = DOOR.x + DOOR.w / 2;
  const TILE_X0 = FIRST - DC;
  const SPACING = MW;
  const SP = { cw: 178, ch: 314, ax: 90 };
  const PS = 0.95;
  const REACH_T = 0.45;
  const IMG = {}; const RING = new Image(); RING.src = ASSET + "lingkaran.png"; let tinted = null, ready = false;
  (function load() {
    const list = { corridor: "corridor.jpg", foreground: "foreground.png", player: "player.png" }; let n = 0;
    Object.keys(list).forEach((k) => {
      const im = new Image(); IMG[k] = im;
      im.onload = () => { if (++n === 3) { buildTint(); ready = true; } };
      im.onerror = () => console.error("Gagal memuat aset: " + ASSET + list[k]);
      im.src = ASSET + list[k];
    });
  })();
  const ROOM_DIR = "assets/kelas/", roomImgs = {}, ROOM_DARK = 0.06;
  function roomImg(id) {
    let o = roomImgs[id];
    if (!o) { o = roomImgs[id] = { img: new Image(), ok: false, missing: false }; o.img.onload = () => (o.ok = true); o.img.onerror = () => (o.missing = true); o.img.src = ROOM_DIR + id + ".jpg"; }
    return o;
  }
  // Titik anomali (koordinat gambar 1664x936). "any" = klik di mana saja dalam ruangan.
  const HOT = {
    "01": [[450, 320, 190], [990, 320, 190]], "02": "any", "03": [[585, 75, 110]], "04": [[1280, 95, 110]],
    "05": [[1265, 490, 90]], "06": [[226, 440, 110]], "07": [[250, 790, 190], [780, 630, 110]], "08": [[716, 808, 80]],
    "09": [[1050, 390, 90]], "10": [[330, 740, 200], [700, 720, 230], [1100, 700, 200]], "11": [[840, 700, 330]], "12": [[860, 705, 170]],
    "13": [[716, 293, 75]], "14": [[716, 293, 75]], "15": [[585, 75, 110]], "16": [[1236, 614, 80]], "17": [[1470, 380, 110]],
    "18": [[1470, 400, 130]], "19": [[460, 370, 220], [985, 370, 220]], "20": [[130, 600, 90]], "22": [[862, 666, 60]],
    "23": [[775, 130, 150]], "24": [[1190, 650, 150]], "25": [[760, 118, 90]], "28": [[1368, 232, 75]], "29": [[330, 100, 90]], "30": [[1532, 176, 55]], "31": [[1420, 462, 110]], "32": [[1250, 480, 70]], "26": [[585, 75, 110]], "27": [[720, 832, 80]],
  };
  const SPAWN = {
    anomaly: 0.8,
    hard: { easy: 0.1, hard: 0.25, extreme: 0.4 },
    humanoid: { easy: 0.3, hard: 0.35, extreme: 0.65 },
  };
  const RW = 832, RH = 468, RX = 64, RY = 28, IW = 1664, IH = 936;
  const CODES = ["X-1", "X-2", "X-3", "XI-1", "XI-2", "XI-3", "XII-1", "XII-2", "XII-3", "X-4", "XI-4", "XII-4", "XII-5"];
  const keys = {};
  let world = null, last = 0, t = 0, stepT = 0, toast = "", toastT = 0, hint = "";
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const nameOf = (id) => (ANOMALIES.find((a) => a.id === id) || {}).name || id;
  const active = () => document.getElementById("game").classList.contains("active");

  function build() {
    const n = state.total;
    const veraMode = state.mode === "extreme";
    const src = {
      hard: ANOMALIES.filter((a) => a.subtle).map((a) => a.id),
      hum: ANOMALIES.filter((a) => !a.subtle && a.humanoid).map((a) => a.id),
      oth: ANOMALIES.filter((a) => !a.subtle && !a.humanoid).map((a) => a.id),
    }, pools = { hard: [], hum: [], oth: [] };
    const nextId = () => {
      const k = Math.random() < SPAWN.hard[state.mode] ? "hard" : Math.random() < SPAWN.humanoid[state.mode] ? "hum" : "oth";
      if (!pools[k].length) pools[k] = shuffle(src[k].slice());
      return pools[k].pop();
    };
    let used = 0; const rooms = [];
    for (let i = 0; i < n; i++) {
      const isVera = veraMode && i === n - 1, has = !isVera && Math.random() < SPAWN.anomaly;
      rooms.push({ x: FIRST + i * SPACING, code: isVera ? "13" : CODES[i % CODES.length], anomaly: has ? (used++, nextId()) : null, vera: isVera, open: false, seen: false, judged: false, ang: 0, found: false, mark: null });
    }
    if (!used) rooms[Math.floor(Math.random() * (veraMode ? n - 1 : n))].anomaly = nextId();
    roomImg("normal"); roomImg("normal_noclock"); if (veraMode) roomImg("vera"); rooms.forEach((r) => r.anomaly && roomImg(r.anomaly === "15" ? "03" : r.anomaly));
    const exitX = FIRST + n * SPACING, len = exitX + 600;
    return { rooms, exitX, len, px: 120, face: 1, walkT: 0, reach: 0, exitAng: 0, moving: false, cam: 0, frozen: false, won: false };
  }
  function say(m) { toast = m; toastT = 3; }

  function judge(r, choice) {
    r.judged = true;
    const bad = !!r.anomaly, correct = (choice === "closed") === bad && (!bad || r.found);
    if (correct) {
      if (bad) { const isNew = discoverAnomaly(r.anomaly); say((isNew ? "Anomali baru tercatat: " : "Anomali: ") + nameOf(r.anomaly)); }
      else say("Kelas normal.");
      decisionCorrect();
    } else {
      world.failed = true;
      startDeath();
    }
  }
  function interact() {
    const w = world; if (!w || w.frozen || state.paused || !active()) return;
    const r = w.rooms.find((q) => !q.judged && Math.abs(w.px - q.x) < 60);
    if (!r) return;
    w.reach = REACH_T;
    if (!r.open) { r.open = true; r.seen = true; Sfx.play("pintu-buka"); }
    else if (r.vera) startVera(r);
    else { r.open = false; Sfx.play("pintu-tutup"); judge(r, "closed"); }
  }
  function update(dt) {
    const w = world;
    const dir = (keys.d || keys.arrowright ? 1 : 0) - (keys.a || keys.arrowleft ? 1 : 0);
    if (w.noLook && dir < 0) { resetNow(); return; }
    w.moving = dir !== 0; if (dir) w.face = dir;
    if (w.failed && w.moving) { resetNow(); return; }
    let maxX = w.exitX + 60;
    for (const r of w.rooms) if (!r.judged && (!r.seen || r.vera)) { maxX = r.x + 30; break; }
    w.px = Math.max(60, Math.min(maxX, w.px + dir * SPEED * dt));
    if (w.reach > 0) w.reach -= dt;
    w.exitAng += ((w.rooms.every((r) => r.judged) ? 1 : 0) - w.exitAng) * Math.min(1, dt * 5);
    if (w.moving) { w.walkT += dt * 8.6; stepT += dt; if (stepT > 0.4) { stepT = 0; Sfx.play("langkah"); } }
    for (const r of w.rooms) {
      r.ang += ((r.open ? 1 : 0) - r.ang) * Math.min(1, dt * (r.vera ? 1.6 : 8));
      if (!r.judged && !r.vera && r.open && w.px > r.x + 75) {
        judge(r, "open");
        if (w.failed) return;
        if (w.frozen) return;
      }
    }
    if (!w.won && !w.failed && w.rooms.every((r) => r.judged) && w.px >= w.exitX - 20) {
      w.won = true; w.frozen = true; w.ending = { t: 0, sfx: false, shown: false };
    }
    w.cam = Math.max(0, Math.min(w.len - W, w.px - W * 0.38));
  }

  const END_WALK = 70;
  const END_FADE_PLAYER = [0.4, 1.4];
  const END_LIGHT = [0.6, 3.2];
  const END_SHOW_POEM = 3.0;
  const END_COLOR = "246,245,241";
  const ease01 = (v, a, b) => { const k = Math.max(0, Math.min(1, (v - a) / (b - a))); return k * k * (3 - 2 * k); };
  function updateEnding(dt) {
    const w = world, e = w.ending; e.t += dt;
    w.moving = false; if (w.reach > 0) w.reach -= dt;
    if (w.px < w.exitX + 6) {
      w.px = Math.min(w.exitX + 6, w.px + END_WALK * dt); w.moving = true; w.face = 1; w.walkT += dt * 5;
      stepT += dt; if (stepT > 0.5) { stepT = 0; Sfx.play("langkah"); }
    }
    w.exitAng += (1 - w.exitAng) * Math.min(1, dt * 5);
    w.cam = Math.max(0, Math.min(w.len - W, w.px - W * 0.38));
    if (!e.sfx && e.t > END_LIGHT[0]) { e.sfx = true; Sfx.play("menang"); }
    if (!e.shown && e.t > END_SHOW_POEM) { e.shown = true; showEnding(); }
  }
  function showEnding() {
    const el = document.getElementById("win"); el.classList.remove("out", "fade-away");
    overlay("#win", true);
  }
  function drawEnding(w, cam) {
    const e = w.ending, s = ease01(e.t, END_LIGHT[0], END_LIGHT[1]); if (s <= 0) return;
    const dx = w.exitX - cam, dy = DOOR.y + DOOR.h * 0.5, R = 90 + s * 1100;
    const gr = g.createRadialGradient(dx, dy, 0, dx, dy, R);
    gr.addColorStop(0, "rgba(" + END_COLOR + "," + Math.min(1, s * 1.6) + ")");
    gr.addColorStop(0.55, "rgba(" + END_COLOR + "," + s * 0.8 + ")");
    gr.addColorStop(1, "rgba(" + END_COLOR + ",0)");
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    const full = Math.max(0, (s - 0.7) / 0.3);
    if (full > 0) { g.fillStyle = "rgba(" + END_COLOR + "," + full + ")"; g.fillRect(0, 0, W, H); }
  }

  function drawCorridor(cam) {
    const m0 = Math.floor((cam - TILE_X0) / MW);
    for (let m = m0; m <= m0 + 1; m++) g.drawImage(IMG.corridor, Math.round(TILE_X0 + m * MW - cam), 0);
  }
  function drawDoorState(x, ang, label, labelCol, judged, light) {
    const mx = x - DC, dx = mx + DOOR.x, dy = DOOR.y;
    if (ang > 0.01) {
      if (light) {
        const lg = g.createLinearGradient(0, dy, 0, dy + DOOR.h); lg.addColorStop(0, "#f2f3f6"); lg.addColorStop(1, "#a9aeb8");
        g.fillStyle = lg; g.fillRect(dx, dy, DOOR.w, DOOR.h);
        const gl = g.createRadialGradient(x, dy + DOOR.h * 0.55, 10, x, dy + DOOR.h * 0.55, 300); gl.addColorStop(0, "rgba(235,238,250,.35)"); gl.addColorStop(1, "rgba(235,238,250,0)");
        g.fillStyle = gl; g.fillRect(x - 300, 0, 600, H);
      } else {
        g.fillStyle = "#040407"; g.fillRect(dx, dy, DOOR.w, DOOR.h);
        const lg = g.createLinearGradient(dx, 0, dx + DOOR.w, 0); lg.addColorStop(0, "rgba(70,78,112,0)"); lg.addColorStop(1, "rgba(70,78,112," + 0.28 * ang + ")");
        g.fillStyle = lg; g.fillRect(dx, dy, DOOR.w, DOOR.h);
      }
      const lw = Math.max(8, DOOR.w * (1 - 0.82 * ang));
      g.drawImage(IMG.corridor, DOOR.x, DOOR.y, DOOR.w, DOOR.h, dx, dy, lw, DOOR.h);
      g.fillStyle = "rgba(0,0,0," + 0.38 * ang + ")"; g.fillRect(dx, dy, lw, DOOR.h);
    }
    g.fillStyle = labelCol; g.font = (label.length > 4 ? "11px" : "15px") + " Georgia, serif"; g.textAlign = "center";
    g.fillText(label, mx + PLATE.x + PLATE.w / 2, PLATE.y + PLATE.h / 2 + 5);
    if (judged) { g.fillStyle = "#e8e8e4"; g.beginPath(); g.arc(mx + PLATE.x + PLATE.w / 2, PLATE.y + PLATE.h + 14, 3.5, 0, 7); g.fill(); }
  }
  function drawDoor(r, cam) {
    const sx = r.x - cam; if (sx < -260 || sx > W + 260) return;
    drawDoorState(sx, r.ang, r.code, "rgba(214,215,222,.78)", r.judged, false);
  }
  function drawExit(cam) {
    const sx = world.exitX - cam; if (sx < -260 || sx > W + 260) return;
    const open = world.rooms.every((r) => r.judged);
    drawDoorState(sx, world.exitAng, "KELUAR", open ? "#f0f1f4" : "rgba(150,152,160,.6)", false, true);
  }
  function buildTint() {
    tinted = document.createElement("canvas"); tinted.width = IMG.player.width; tinted.height = IMG.player.height;
    const c = tinted.getContext("2d"); c.drawImage(IMG.player, 0, 0);
    c.globalCompositeOperation = "source-atop"; c.fillStyle = "rgba(34,32,70,.46)"; c.fillRect(0, 0, tinted.width, tinted.height);
  }
  function playerFrame(w) {
    if (w.reach > 0) return w.reach > REACH_T - 0.14 ? 14 : 15;
    if (w.moving) return 4 + (Math.floor(w.walkT) % 8);
    return Math.floor(t * 3) % 4;
  }
  function drawPlayer(w, x, y) {
    const f = playerFrame(w);
    g.fillStyle = "rgba(0,0,0,.38)"; g.beginPath(); g.ellipse(x, y - 3, 44, 7, 0, 0, 7); g.fill();
    g.save(); g.translate(x, y); g.scale(w.face * PS, PS);
    g.drawImage(tinted, f * SP.cw, 0, SP.cw, SP.ch, -SP.ax, -SP.ch, SP.cw, SP.ch);
    g.restore();
  }
  const FG_NEAR = 0.45, FG_PLATEAU = 120, FG_FADE = 230;
  let fgCv = null, fgCtx = null;
  function drawForeground(cam, sx) {
    if (!fgCv) { fgCv = document.createElement("canvas"); fgCv.width = W; fgCv.height = H; fgCtx = fgCv.getContext("2d"); }
    const c = fgCtx; c.globalCompositeOperation = "source-over"; c.clearRect(0, 0, W, H);
    const m0 = Math.floor((cam - TILE_X0) / MW);
    for (let m = m0; m <= m0 + 1; m++) c.drawImage(IMG.foreground, Math.round(TILE_X0 + m * MW - cam), 0);
    const a = 1 - FG_NEAR, x0 = sx - FG_PLATEAU - FG_FADE, x1 = sx - FG_PLATEAU, x2 = sx + FG_PLATEAU, x3 = sx + FG_PLATEAU + FG_FADE;
    const gr = c.createLinearGradient(x0, 0, x3, 0), f = (x) => Math.max(0, Math.min(1, (x - x0) / (x3 - x0)));
    gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(f(x1), "rgba(0,0,0," + a + ")"); gr.addColorStop(f(x2), "rgba(0,0,0," + a + ")"); gr.addColorStop(1, "rgba(0,0,0,0)");
    c.globalCompositeOperation = "destination-out"; c.fillStyle = gr; c.fillRect(Math.max(0, x0), 0, Math.min(W, x3) - Math.max(0, x0), H);
    g.drawImage(fgCv, 0, 0);
  }
  function drawFog(cam) {
    for (let i = 0; i < 3; i++) {
      const M = W + 600, x = ((((i * 420 - cam * (0.4 + i * 0.1) + t * (12 + i * 6)) % M) + M) % M) - 300;
      const gr = g.createRadialGradient(x, GROUND - 10, 10, x, GROUND - 10, 280); gr.addColorStop(0, "rgba(170,175,185,.14)"); gr.addColorStop(1, "rgba(170,175,185,0)");
      g.fillStyle = gr; g.fillRect(x - 280, GROUND - 10 - 280, 560, 560);
    }
    const bg = g.createLinearGradient(0, GROUND - 120, 0, GROUND + 30); bg.addColorStop(0, "rgba(120,125,135,0)"); bg.addColorStop(1, "rgba(120,125,135,.16)");
    g.fillStyle = bg; g.fillRect(0, GROUND - 120, W, 150);
    const vg = g.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.95); vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,.6)");
    g.fillStyle = vg; g.fillRect(0, 0, W, H);
  }

  function desk(x, y, s, inv) {
    g.save(); g.translate(x, inv ? y - 24 * s : y); g.scale(s, inv ? -s : s);
    g.fillStyle = "#6a655d"; g.fillRect(-28, -24, 56, 6); g.fillStyle = "#4a463f"; g.fillRect(-25, -18, 4, 18); g.fillRect(21, -18, 4, 18);
    g.fillStyle = "#3f3b36"; g.fillRect(-12, -12, 24, 4); g.restore();
  }
  function hand(x, y, len, a) { g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.sin(a) * len, y - Math.cos(a) * len); g.stroke(); }
  const VERA_HIT = { x: 581, y: 252, w: 135, h: 84 };
  function drawClockHands(id, cx, cy) {
    let m, h;
    if (id === "13") { m = 305 - t * 55; h = 51 - t * 55 / 12; } else { m = 33 * 6; h = 3 * 30 + 33 * 0.5; }
    const rad = (d) => (d * Math.PI) / 180;
    g.save(); g.strokeStyle = "#090a13"; g.fillStyle = "#090a13"; g.lineCap = "round";
    g.lineWidth = 2.2; hand(cx, cy, 11, rad(h));
    g.lineWidth = 1.6; hand(cx, cy, 15.5, rad(m));
    g.beginPath(); g.arc(cx, cy, 1.9, 0, 7); g.fill(); g.restore();
  }
  function drawRoom(r) {
    let id = r.vera ? "vera" : r.anomaly || "normal";
    if (id === "15") id = Math.sin(t * 41) * Math.sin(t * 17) > -0.15 ? "03" : "normal";
    const clock = id === "13" || id === "14";
    if (clock) id = "normal_noclock";
    let o = roomImg(id), placeholder = false;
    if (!o.ok && o.missing) { o = roomImg("normal"); placeholder = true; }
    const X = RX, Y = RY;
    g.save(); g.fillStyle = "rgba(0,0,0,.78)"; g.fillRect(0, 0, W, H);
    if (o.ok) {
      g.drawImage(o.img, X, Y, RW, RH);
      if (clock) drawClockHands(r.anomaly, X + 716 * RW / 1664, Y + 293 * RH / 936);
      g.fillStyle = "rgba(2,3,12," + ROOM_DARK + ")"; g.fillRect(X, Y, RW, RH);
      const vg2 = g.createRadialGradient(X + RW / 2, Y + RH / 2, 200, X + RW / 2, Y + RH / 2, 540); vg2.addColorStop(0, "rgba(0,0,0,0)"); vg2.addColorStop(1, "rgba(0,0,0,.3)");
      g.fillStyle = vg2; g.fillRect(X, Y, RW, RH);
      if (placeholder && r.anomaly) {
        const txt = "[GAMBAR BELUM ADA] " + nameOf(r.anomaly) + "  (" + ROOM_DIR + id + ".jpg)";
        g.font = "12px monospace"; g.textAlign = "left"; const tw = g.measureText(txt).width;
        g.fillStyle = "rgba(120,0,0,.8)"; g.fillRect(X + 8, Y + 8, tw + 14, 20); g.fillStyle = "#ffd9d9"; g.fillText(txt, X + 15, Y + 22);
      }
    }
    if (r.vera && o.ok) {
      const a = 0.07 + 0.07 * (0.5 + 0.5 * Math.sin(t * 2.2)), cx = VERA_HIT.x + VERA_HIT.w / 2, cy = VERA_HIT.y + VERA_HIT.h / 2;
      const vg3 = g.createRadialGradient(cx, cy, 5, cx, cy, 95); vg3.addColorStop(0, "rgba(190,208,255," + a * 2 + ")"); vg3.addColorStop(1, "rgba(190,208,255,0)");
      g.fillStyle = vg3; g.fillRect(cx - 100, cy - 100, 200, 200);
    }
    if (r.found && r.mark) {
      const mx = X + r.mark.x * RW / IW, my = Y + r.mark.y * RH / IH, mr = r.mark.r * RW / IW, pl = 1 + 0.05 * Math.sin(t * 5);
      const rw = Math.max(110, mr * 2.5) * pl, rh = rw * 0.66;
      if (RING.complete && RING.naturalWidth) g.drawImage(RING, mx - rw / 2, my - rh / 2, rw, rh);
      else { g.strokeStyle = "rgba(235,30,40,.95)"; g.lineWidth = 3; g.beginPath(); g.arc(mx, my, mr * pl, 0, Math.PI * 2); g.stroke(); }
    }
    g.strokeStyle = "rgba(235,235,230,.6)"; g.lineWidth = 3; g.strokeRect(X, Y, RW, RH);
    g.fillStyle = "rgba(235,235,230,.7)"; g.font = "14px Georgia, serif"; g.textAlign = "center"; g.fillText("Perhatikan baik-baik isi kelasnya...", W / 2, 523);
    g.restore();
  }

  function render() {
    const w = world, cam = w.cam; g.textAlign = "left";
    if (!ready) { g.fillStyle = "#000"; g.fillRect(0, 0, W, H); return; }
    drawCorridor(cam);
    w.rooms.forEach((r) => drawDoor(r, cam)); drawExit(cam);
    if (w.ending) g.globalAlpha = 1 - ease01(w.ending.t, END_FADE_PLAYER[0], END_FADE_PLAYER[1]);
    drawPlayer(w, w.px - cam, GROUND);
    g.globalAlpha = 1;
    drawForeground(cam, w.px - cam);
    drawFog(cam);
    if (w.ending) drawEnding(w, cam);
    const near = w.rooms.find((r) => !r.judged && Math.abs(w.px - r.x) < 60);
    if (near && near.open && near.ang > 0.9) drawRoom(near);
    if (toastT > 0) { g.globalAlpha = Math.min(1, toastT); g.fillStyle = "#e8e8e4"; g.font = "17px Georgia, serif"; g.textAlign = "center"; g.fillText(toast, W / 2, 34); g.globalAlpha = 1; }
    let h = "A / D atau panah kiri-kanan untuk berjalan";
    if (near) h = near.vera ? (near.open ? "E atau klik Vera: dekati dia" : "E: buka pintu kelas") : near.open ? "Cari yang janggal dan klik dulu, lalu E: tutup pintu  |  jalan terus: biarkan terbuka (normal)" : "E: buka pintu kelas";
    else if (w.rooms.every((r) => r.judged)) h = "Semua kelas selesai. Jalan ke pintu keluar.";
    else if (w.px > w.exitX - 300) h = "Selesaikan semua kelas dulu.";
    if (w.ending) h = "";
    if (h !== hint) { hint = h; promptEl.textContent = h; }
  }

  addEventListener("keydown", (e) => {
    if (!active() || /INPUT|TEXTAREA/.test(document.activeElement.tagName)) return;
    const k = e.key.toLowerCase();
    if (k === " " || k === "arrowleft" || k === "arrowright") e.preventDefault();
    const rep = e.repeat; keys[k] = true;
    if (!rep && (k === "e" || k === " ")) interact();
  });
  addEventListener("keyup", (e) => { const k = e.key.toLowerCase(); keys[k] = false; if (k === " " && active()) e.preventDefault(); });
  addEventListener("blur", () => Object.keys(keys).forEach((k) => (keys[k] = false)));

  function veraNear() { const w = world; return w && w.rooms.find((r) => r.vera && !r.judged && r.open && r.ang > 0.9 && Math.abs(w.px - r.x) < 60); }
  function toCanvas(e) { const b = cv.getBoundingClientRect(); return { x: (e.clientX - b.left) * W / b.width, y: (e.clientY - b.top) * H / b.height }; }
  const inVera = (p) => p.x >= VERA_HIT.x && p.x <= VERA_HIT.x + VERA_HIT.w && p.y >= VERA_HIT.y && p.y <= VERA_HIT.y + VERA_HIT.h;
  cv.addEventListener("click", (e) => {
    if (!world || world.frozen || state.paused || !active()) return;
    if (veraNear() && inVera(toCanvas(e))) return startVera(veraNear());
    const r = roomNear(); if (r) tryMark(r, toCanvas(e));
  });
  function roomNear() { const w = world; return w && w.rooms.find((r) => !r.vera && !r.judged && r.open && r.ang > 0.9 && Math.abs(w.px - r.x) < 60); }
  function tryMark(r, p) {
    if (!r.anomaly || r.found) return;
    const ix = (p.x - RX) * IW / RW, iy = (p.y - RY) * IH / RH;
    if (ix < 0 || iy < 0 || ix > IW || iy > IH) return;
    const hot = HOT[r.anomaly] || "any";
    if (hot === "any") { r.found = true; r.mark = { x: ix, y: iy, r: 90 }; }
    else { const c = hot.find(([x, y, rad]) => Math.hypot(ix - x, iy - y) <= rad); if (!c) return; r.found = true; r.mark = { x: c[0], y: c[1], r: Math.max(55, Math.min(c[2], 200)) }; }
    Sfx.play("glitch");
  }
  cv.addEventListener("mousemove", (e) => { cv.style.cursor = world && !world.frozen && !state.paused ? (veraNear() && inVera(toCanvas(e)) ? "pointer" : roomNear() ? "crosshair" : "") : ""; });
  function startVera(r) {
    world.frozen = true; world.veraRoom = r; cv.style.cursor = "";
    Object.keys(keys).forEach((k) => (keys[k] = false));
    Sfx.song(true);
    VeraVN.start(VERA_SCRIPT, (flags) => finishVera(flags));
  }
  function finishVera(flags) {
    const w = world, r = w && w.veraRoom; if (!r) return; flags = flags || {};
    r.judged = true; r.open = false; w.veraRoom = null; Sfx.play("pintu-tutup");
    Object.keys(keys).forEach((k) => (keys[k] = false));
    w.frozen = false; decisionCorrect();
    if (flags.ending === "leave") { w.noLook = true; Sfx.song(false); }
    else if (flags.ending === "alone") { w.px = w.exitX - 130; w.face = 1; w.won = true; w.frozen = true; w.ending = { t: 0, sfx: false, shown: false }; }
    else if (flags.ending === "poem") { w.won = true; w.frozen = true; show("menu", true); }
  }
  function frame(ts) {
    requestAnimationFrame(frame);
    if (!world || !active()) { last = ts; return; }
    const dt = Math.min(0.05, (ts - last) / 1000 || 0.016); last = ts; t += dt;
    if (toastT > 0) toastT -= dt;
    if (!state.paused && !world.frozen) update(dt);
    else if (!state.paused && world.ending) updateEnding(dt);
    render();
  }
  requestAnimationFrame(frame);
  function start() { if (state.mode === "extreme" && typeof VeraVN !== "undefined") VeraVN.preload(); world = build(); Object.keys(keys).forEach((k) => (keys[k] = false)); hint = ""; toastT = 0; if (document.activeElement) document.activeElement.blur(); }
  const DEATH_MS = 6500;
  function startDeath() {
    const w = world; w.frozen = true; Object.keys(keys).forEach((k) => (keys[k] = false));
    const key = "sela-deaths-" + (store.get("sela-session", null) || "tamu");
    const n = (store.get(key, 0) || 0) + 1; store.set(key, n);
    const el = document.getElementById("death"), num = document.getElementById("death-n");
    num.textContent = n; num.classList.toggle("long", String(n).length > 2);
    Sfx.play("gagal"); el.classList.add("show");
    setTimeout(() => { resetNow(); el.classList.remove("show"); }, DEATH_MS);
  }
  function resetNow() {
    const old = world; world = build();
    world.face = old.face; world.walkT = old.walkT; world.moving = old.moving;
    toastT = 0; hint = ""; decisionWrong();
  }
  return { start, reset: start, finishVera, _w: () => world };
})();
