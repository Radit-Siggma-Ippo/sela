const VeraVN = (function () {
  const $ = (id) => document.getElementById(id);
  const BRIGHT = ["white", "door", "door_cry", "hug1", "hug2", "hug3"];
  const SPEED = 28;
  const CG = ["sleep", "rub", "smile", "cheek", "closed", "hold", "door", "door_cry", "hug1", "hug2", "hug3"], cache = {};
  let el = null, script = null, node = null, flags = {}, done = null, on = false, vis = [];
  let cur = "", typing = false, timer = 0, full = "", pos = 0, audio = null, pose = "", poem = false, poemT = [];
  let pc = null, pg = null, parts = [], pOn = false, raf = 0;

  const userName = () => { try { return (typeof store !== "undefined" && store.get("sela-session", null)) || "Kamu"; } catch { return "Kamu"; } };
  const sub = (s) => (s || "").replace(/\{user\}/g, userName());

  function init() {
    if (el) return;
    el = { root: $("vn"), bg: $("vn-bg"), sprite: $("vn-sprite"), fx: $("vn-fx"), poem: $("vn-poem"), tag: $("vn-tag"), box: $("vn-box"), name: $("vn-name"), text: $("vn-text"), choices: $("vn-choices"), next: $("vn-next"), cv: $("vn-parts") };
    pc = el.cv; pg = pc.getContext("2d");
    el.box.addEventListener("click", (e) => { if (!e.target.closest(".vn-choice")) advance(); });
    el.sprite.addEventListener("load", () => { el.sprite.style.opacity = 1; });
    el.sprite.addEventListener("error", () => { el.sprite.style.opacity = 0; });
    addEventListener("keydown", (e) => {
      if (!on) return;
      e.preventDefault(); e.stopImmediatePropagation();
      if (e.repeat || poem) return;
      const k = e.key.toLowerCase();
      if (k === " " || k === "enter" || k === "e") advance();
      else if (/^[1-9]$/.test(k) && node && node.choices && !typing) choose(Number(k) - 1);
    }, true);
  }

  function partsOn(v) {
    if (v === pOn) return; pOn = v;
    if (!v) { cancelAnimationFrame(raf); pc.style.opacity = 0; return; }
    pc.width = 960; pc.height = 540; pc.style.opacity = 1;
    parts = Array.from({ length: 90 }, () => ({ x: 300 + Math.random() * 360, y: 120 + Math.random() * 420, r: 0.8 + Math.random() * 2.6, v: 8 + Math.random() * 30, d: (Math.random() - 0.5) * 18, a: 0.3 + Math.random() * 0.7, p: Math.random() * 6 }));
    let last = performance.now();
    const loop = (t) => {
      if (!pOn) return; const dt = Math.min(0.05, (t - last) / 1000); last = t;
      pg.clearRect(0, 0, 960, 540);
      for (const p of parts) {
        p.y -= p.v * dt; p.x += p.d * dt + Math.sin(t / 700 + p.p) * 0.25; p.p += dt;
        if (p.y < -10) { p.y = 540 + 10; p.x = 300 + Math.random() * 360; }
        const a = p.a * (0.6 + 0.4 * Math.sin(t / 400 + p.p));
        pg.fillStyle = "rgba(200,215,255," + a + ")"; pg.shadowColor = "rgba(150,180,255,.9)"; pg.shadowBlur = 10;
        pg.beginPath(); pg.arc(p.x, p.y, p.r, 0, 7); pg.fill();
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
  }

  function setPose(p) {
    if (!p || p === pose) return;
    pose = p; el.tag.style.display = "none"; el.root.classList.toggle("white", BRIGHT.includes(p));
    if (p === "white" || p === "black") { el.fx.style.background = p === "white" ? "#fff" : "#000"; el.fx.style.opacity = 1; return; }
    el.fx.style.opacity = 0;
    const im = cache[p] || load(p);
    const apply = () => {
      if (!(on && pose === p)) return;
      if (cur) el.bg.style.backgroundImage = "url(" + cur + ")";
      cur = im.src;
      el.sprite.style.transition = "none"; el.sprite.style.opacity = 0; void el.sprite.offsetWidth; el.sprite.style.transition = "";
      el.sprite.src = im.src;
    };
    if (im.complete && im.naturalWidth) apply();
    else {
      im.addEventListener("load", apply, { once: true });
      im.addEventListener("error", () => { if (on && pose === p) { el.tag.textContent = "[CG belum ada] assets/vera/" + p + ".jpg"; el.tag.style.display = "block"; } }, { once: true });
    }
  }
  function load(p) { const im = new Image(); cache[p] = im; im.src = "assets/vera/" + p + ".jpg"; return im; }
  function preload() { CG.forEach((p) => { if (!cache[p]) load(p); }); }
  function stopVoice() { if (audio) { audio.pause(); audio = null; } }

  function go(id) {
    node = script.nodes[id];
    if (!node || node.end) return finish();
    stopVoice(); clearInterval(timer); el.choices.innerHTML = ""; el.next.style.visibility = "hidden";
    if (node.set) Object.assign(flags, node.set);
    if (node.vol !== undefined && typeof Sfx !== "undefined") Sfx.songLevel(node.vol, node.volDur);
    if (node.pose) setPose(node.pose);
    if (node.particles !== undefined) partsOn(!!node.particles);
    if (node.poem) return playPoem(node);
    if (node.coming) return playComing();
    const who = sub(node.who);
    el.name.textContent = who; el.name.style.display = who ? "block" : "none";
    el.box.classList.toggle("narr", !who);
    if (node.voice && state.sound) { audio = new Audio("assets/vera/voice/" + node.voice + ".mp3"); audio.play().catch(() => {}); }
    full = sub(node.text); pos = 0; typing = true; el.text.textContent = "";
    timer = setInterval(() => { pos++; el.text.textContent = full.slice(0, pos); if (pos >= full.length) endTyping(); }, SPEED);
  }
  function endTyping() {
    clearInterval(timer); typing = false; el.text.textContent = full;
    if (node.choices) {
      vis = node.choices.filter((c) => !(c.once && flags._seen && flags._seen[c.id]));
      vis.forEach((c, i) => {
        const b = document.createElement("button"); b.className = "vn-choice"; b.type = "button"; b.textContent = (i + 1) + ".  " + sub(c.text);
        b.addEventListener("click", () => choose(i)); el.choices.appendChild(b);
      });
    } else el.next.style.visibility = "visible";
  }
  function advance() {
    if (!on || poem) return;
    if (typing) return endTyping();
    if (node.choices) return;
    if (node.next) go(node.next); else finish();
  }
  function choose(i) {
    const c = vis[i]; if (!c) return;
    if (c.set) Object.assign(flags, c.set);
    if (c.once) { flags._seen = flags._seen || {}; flags._seen[c.id] = true; }
    go(c.next);
  }

  function playPoem(n) {
    poem = true; el.box.style.opacity = 0; el.box.style.pointerEvents = "none";
    el.fx.style.background = "#fff"; el.fx.style.opacity = 1; el.sprite.style.opacity = 0; el.root.classList.add("poeming");
    el.poem.innerHTML = ""; el.poem.style.opacity = 1;
    const p = document.createElement("p"); el.poem.appendChild(p);
    let at = 1800;
    n.poem.forEach((ln) => {
      if (!ln) { at += 900; return; }
      const t0 = at, hold = 1500 + ln.length * 60;
      poemT.push(setTimeout(() => { p.classList.remove("in"); p.textContent = sub(ln); void p.offsetWidth; p.classList.add("in"); }, t0));
      poemT.push(setTimeout(() => p.classList.remove("in"), t0 + 1100 + hold));
      at = t0 + 1100 + hold + 1300;
    });
    poemT.push(setTimeout(() => { el.poem.style.opacity = 0; }, at + 300));
    poemT.push(setTimeout(() => { poem = false; if (n.next) { resetBox(); go(n.next); } else finish(); }, at + 2800));
  }
  function playComing() {
    poem = true; el.box.style.opacity = 0; el.box.style.pointerEvents = "none"; el.root.classList.add("poeming");
    const c = $("vn-coming"); c.classList.remove("out"); void c.offsetWidth; c.classList.add("on");
    poemT.push(setTimeout(() => { c.classList.add("out"); if (typeof Sfx !== "undefined") Sfx.song(false, 3); }, 6500));
    poemT.push(setTimeout(() => {
      if (typeof show === "function") show("menu", true);
      el.root.style.transition = "opacity 1.2s ease"; el.root.style.opacity = 0;
    }, 8600));
    poemT.push(setTimeout(() => { poem = false; finish(); }, 9900));
  }
  function resetBox() { el.box.style.opacity = ""; el.box.style.pointerEvents = ""; el.root.classList.remove("poeming"); el.poem.innerHTML = ""; }

  function finish() {
    clearInterval(timer); stopVoice(); poemT.forEach(clearTimeout); poemT = []; partsOn(false);
    on = false; typing = false; poem = false; resetBox();
    el.root.classList.remove("show"); el.root.style.transition = ""; el.root.style.opacity = "";
    const cm = $("vn-coming"); if (cm) cm.classList.remove("on", "out");
    const cb = done; done = null; if (cb) cb(flags);
  }
  function start(sc, onDone) {
    init(); preload(); script = sc; done = onDone; flags = {}; pose = ""; cur = ""; on = true; poem = false;
    el.fx.style.opacity = 0; el.tag.style.display = "none";
    el.bg.style.backgroundImage = "url(" + (sc.bg || "assets/kelas/vera.jpg") + ")";
    el.sprite.removeAttribute("src"); el.sprite.style.opacity = 0;
    el.root.classList.add("show"); go(sc.start);
  }
  return { start, preload, get active() { return on; } };
})();
