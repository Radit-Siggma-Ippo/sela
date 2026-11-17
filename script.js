const ANOMALIES = [
  { id: "01", name: "Cahaya merah di balik gorden", desc: "Di luar jendela ada sesuatu yang menyala merah, dan ia tidak bergerak." },
  { id: "02", name: "Coretan 13",                    desc: "Angka yang sama ditulis berulang di papan, dinding, dan meja, seperti ada yang sedang menghitung." },
  { id: "03", name: "Lampu menyala sendiri",        desc: "Satu lampu menyala, padahal listriknya sudah lama diputus." },
  { id: "04", name: "Lampu merah",                  desc: "Satu lampu menyala dengan warna yang seharusnya tidak ada." },
  { id: "05", humanoid: true, name: "Guru yang membelakangi", desc: "Seseorang duduk di kursi guru, menatap papan tulis kosong. Kelas sudah lama bubar." },
  { id: "06", humanoid: true, name: "Sosok di pojok",               desc: "Ada yang berdiri di pojok belakang kelas, diam, menghadap ke arahmu." },
  { id: "07", name: "Jejak merah", desc: "Jejak kaki basah berwarna gelap menuju satu bangku, dan tidak kembali." },
  { id: "08", humanoid: true, name: "Tangan di genangan", desc: "Genangan hitam di lantai, dan sebuah tangan pucat menyembul dari dalamnya." },
  { id: "09", humanoid: true, name: "Bayangan di balik gorden",     desc: "Seseorang berdiri di balik gorden, padahal jendelanya terkunci." },
  { id: "10", name: "Semua menghadapmu", desc: "Semua bangku berputar menghadap ke arah pintu, tempat kamu berdiri." },
  { id: "11", name: "Lingkaran kursi", desc: "Kursi-kursi tersusun melingkar mengelilingi satu bangku kosong di tengah." },
  { id: "12", name: "Bangku terkunci", desc: "Satu bangku dirantai ke lantai, seperti ada yang takut ia pergi." },
  { id: "13", name: "Jam mundur",                   desc: "Jarum jam berputar ke belakang, pelan tapi pasti." },
  { id: "14", name: "Jam 3:33",                     desc: "Jam berhenti di waktu yang tidak ada di jadwal mana pun." },
  { id: "15", name: "Lampu berkedip",               desc: "Lampu kelas menyala dan padam dengan irama yang aneh." },
  { id: "16", humanoid: true, name: "Tangan di kolong", desc: "Tangan pucat menjulur dari kolong meja guru, jari-jarinya bergerak pelan." },
  { id: "17", name: "Cap tangan darah", desc: "Cap tangan merah gelap di papan tulis, seperti diseret turun oleh seseorang." },
  { id: "18", humanoid: true, name: "Wajah di papan",               desc: "Papan tulis menyimpan wajah yang tidak ingin dihapus." },
  { id: "19", name: "Gorden terbuka",               desc: "Di luar jendela tidak ada halaman, hanya kabut pucat dan sosok-sosok yang berdiri diam menghadap ke dalam." },
  { id: "20", name: "Pintu kecil", desc: "Pintu kecil setinggi anak-anak di dinding, sedikit terbuka. Di dalamnya gelap." },
  { id: "22", name: "Mata di kolong",               desc: "Sepasang mata menyala di bawah meja, tidak berkedip." },
  { id: "23", humanoid: true, name: "Di langit-langit", desc: "Sesuatu merayap di langit-langit, kepalanya berputar pelan mengikuti langkahmu." },
  { id: "24", name: "Meja yang menetes", desc: "Cairan merah gelap menetes dari ujung meja guru ke lantai." },
  { id: "25", subtle: true, name: "Noda di langit-langit", desc: "Noda gelap melebar di langit-langit, seperti ada yang merembes dari atas." },
  { id: "26", subtle: true, name: "Lampu yang redup menyala", desc: "Satu lampu menyala sangat redup. Kamu hampir tidak sadar." },
  { id: "28", subtle: true, name: "Foto yang miring", desc: "Satu foto di dinding sedikit miring. Kemarin semuanya masih lurus." },
  { id: "29", subtle: true, name: "Bilah yang hilang", desc: "Salah satu kipas angin kehilangan satu bilahnya, tapi tidak ada yang jatuh ke lantai." },
  { id: "30", subtle: true, name: "Mata di foto", desc: "Sepasang mata di salah satu foto menyala samar, dan terasa mengikutimu." },
  { id: "31", subtle: true, name: "Tulisan samar", desc: "Ada tulisan yang hampir terhapus di papan tulis. Satu kata, ditulis oleh tangan yang gemetar." },
  { id: "32", subtle: true, humanoid: true, name: "Kepala di sandaran", desc: "Sesuatu mengintip dari balik kursi guru. Bentuknya terlalu mirip kepala." },
  { id: "27", subtle: true, name: "Setitik hitam", desc: "Genangan kecil berwarna gelap di lantai. Tadi tidak ada di sana." },
];

const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);
const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

const foundKey = () => "sela-found-" + (store.get("sela-session", null) || "tamu");

const state = { mode: "easy", total: 5, current: 0, paused: false,
  sound: store.get("sela-sound", true), found: store.get(foundKey(), []) };

const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const GL = { cell: 8, start: 0.55, frames: 6, ms: 40 };
function glitch() {
  if (REDUCED) return;
  const fx = document.querySelector(".glitch-fx");
  let cv = fx.firstChild;
  if (!cv) { cv = document.createElement("canvas"); fx.appendChild(cv); }
  const cols = Math.ceil(innerWidth / GL.cell), rows = Math.ceil(innerHeight / GL.cell);
  cv.width = cols; cv.height = rows;
  const c = cv.getContext("2d"), PAL = ["#000", "#000", "#000", "#e8e8e8", "#fff", "#ff0046", "#00e6ff", "#3a2cff"];
  let n = 0; clearInterval(glitch.i); fx.style.opacity = 1;
  glitch.i = setInterval(() => {
    c.clearRect(0, 0, cols, rows);
    if (++n > GL.frames) { clearInterval(glitch.i); fx.style.opacity = 0; return; }
    const d = GL.start * (1 - (n - 1) / GL.frames), img = c.createImageData(cols, rows), px = img.data;
    for (let i = 0, N = cols * rows; i < N; i++) {
      if (Math.random() > d) continue;
      const r = Math.random(), v = r < 0.5 ? 0 : r < 0.8 ? 120 + Math.random() * 135 : 255, o = i * 4;
      px[o] = r > 0.93 ? 255 : v; px[o + 1] = r > 0.93 ? 0 : r > 0.88 ? 230 : v; px[o + 2] = r > 0.93 ? 70 : r > 0.88 ? 255 : v; px[o + 3] = 255;
    }
    c.putImageData(img, 0, 0);
    for (let k = 0, m = 4 + Math.floor(Math.random() * 6); k < m; k++) {
      c.fillStyle = PAL[Math.floor(Math.random() * PAL.length)];
      c.fillRect(Math.floor(Math.random() * cols), Math.floor(Math.random() * rows), 6 + Math.floor(Math.random() * 26), 1 + Math.floor(Math.random() * 5));
    }
  }, GL.ms);
  if (typeof Sfx !== "undefined") Sfx.play("glitch");
}

const FADE_OUT = REDUCED ? 0 : 300;
let fadeToken = 0;
function show(id, quiet) {
  const cur = $(".screen.active");
  const swap = () => {
    $$(".screen").forEach((s) => {
      s.classList.remove("leaving");
      s.classList.toggle("active", s.id === id);
    });
    if (id === "gallery") renderGallery();
    if (!quiet) glitch();
  };
  if (!cur || cur.id === id || !FADE_OUT) return swap();
  const token = ++fadeToken;
  cur.classList.add("leaving");
  setTimeout(() => { if (token === fadeToken) swap(); }, FADE_OUT);
}
function overlay(id, on) {
  const el = $(id);
  if (on) { el.classList.remove("leaving"); el.classList.add("show"); return; }
  if (!el.classList.contains("show")) return;
  if (!FADE_OUT) return el.classList.remove("show");
  el.classList.add("leaving");
  setTimeout(() => el.classList.remove("show", "leaving"), 250);
}
document.addEventListener("click", (e) => {
  const go = e.target.closest("[data-go]");
  if (go) show(go.dataset.go);
});

function applySound() { $("#btn-sound").textContent = "Sound: " + (state.sound ? "on" : "off"); }
function applyBright(v) { $("#dim").style.opacity = (100 - v) / 100; }
$("#btn-sound").addEventListener("click", () => {
  state.sound = !state.sound; store.set("sela-sound", state.sound); applySound();
});
$("#bright").addEventListener("input", (e) => {
  applyBright(e.target.value); store.set("sela-bright", Number(e.target.value));
});
$("#btn-reset").addEventListener("click", () => {
  state.found = []; store.set(foundKey(), []); renderGallery();
});
$("#bright").value = store.get("sela-bright", 100);
applyBright($("#bright").value); applySound();

function renderGallery() {
  const grid = $("#gal-grid");
  grid.innerHTML = "";
  ANOMALIES.forEach((a) => {
    const got = state.found.includes(a.id);
    const card = document.createElement("button");
    card.className = "gal-card" + (got ? "" : " locked");
    card.innerHTML =
      `<div class="shot"><img src="assets/kelas/${a.id}.jpg" alt="" onerror="this.remove()">${got ? "" : "?"}</div>` +
      `<span>${got ? a.name : "Not found yet"}</span>`;
    if (got) card.addEventListener("click", () => openDetail(a));
    else card.disabled = true;
    grid.appendChild(card);
  });
  $("#gal-count").textContent = `Ditemukan ${state.found.length} dari ${ANOMALIES.length}`;
}
function openDetail(a) {
  $("#detail-shot").innerHTML = `<img src="assets/kelas/${a.id}.jpg" alt="" onerror="this.remove()">`;
  $("#detail-name").textContent = a.name;
  $("#detail-desc").textContent = a.desc;
  overlay("#detail", true);
}
$("#btn-detail-close").addEventListener("click", () => overlay("#detail", false));

function discoverAnomaly(id) {
  if (state.found.includes(id)) return false;
  state.found.push(id); store.set(foundKey(), state.found);
  return true;
}

$$(".mode").forEach((btn) => btn.addEventListener("click", () => {
  state.mode = btn.dataset.mode; state.total = Number(btn.dataset.total); startGame();
}));
function startGame() {
  if (typeof Sfx !== "undefined") Sfx.song(false);
  state.current = 0; state.paused = false; buildPips(); updateHud(); show("game"); if (typeof Game !== "undefined") Game.start();
}

function buildPips() {
  const wrap = $("#pips"); wrap.innerHTML = "";
  for (let i = 0; i < state.total; i++) {
    const p = document.createElement("span"); p.className = "pip"; wrap.appendChild(p);
  }
}
function updateHud() {
  $("#hud-label").textContent = `Kelas ${state.current} dari ${state.total}`;
  $$("#pips .pip").forEach((p, i) => p.classList.toggle("done", i < state.current));
}

function decisionCorrect() {
  state.current++; updateHud();
}
function decisionWrong() { state.current = 0; updateHud(); }
$("#btn-retry").addEventListener("click", () => {
  overlay("#fail", false); state.current = 0; updateHud(); Game.reset();
});

function pauseGame(on) { state.paused = on; overlay("#pause", on); }
$("#btn-pause").addEventListener("click", () => pauseGame(true));
$("#btn-resume").addEventListener("click", () => pauseGame(false));
$("#btn-restart").addEventListener("click", () => { pauseGame(false); startGame(); });
$("#btn-quit").addEventListener("click", () => { pauseGame(false); show("menu"); });
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && $("#game").classList.contains("active") &&
      !$("#fail").classList.contains("show") && !$("#death").classList.contains("show") && !$("#win").classList.contains("show") && !(typeof VeraVN !== "undefined" && VeraVN.active)) {
    pauseGame(!state.paused);
  }
});

let endingLeaving = false;
function leaveEnding() {
  const el = $("#win");
  if (endingLeaving || !el.classList.contains("show")) return;
  endingLeaving = true;
  if (typeof Sfx !== "undefined") Sfx.song(false, 2.5);
  el.classList.add("out");
  setTimeout(() => {
    show("menu", true);
    setTimeout(() => {
      el.classList.add("fade-away");
      setTimeout(() => { el.classList.remove("show", "out", "fade-away"); endingLeaving = false; }, 1000);
    }, 400);
  }, 2200);
}
$("#win").addEventListener("click", leaveEnding);
document.addEventListener("keydown", (e) => {
  if ((e.key === "Enter" || e.key === " ") && $("#win").classList.contains("show")) { e.preventDefault(); leaveEnding(); }
});

/* ---- layar penuh ---- */
(function () {
  const root = document.documentElement, btn = document.getElementById("btn-fs");
  const isFs = () => document.fullscreenElement || document.webkitFullscreenElement;
  function toggleFs() {
    try {
      if (isFs()) (document.exitFullscreen || document.webkitExitFullscreen).call(document);
      else (root.requestFullscreen || root.webkitRequestFullscreen).call(root);
    } catch (e) {}
  }
  const sync = () => { btn.innerHTML = isFs() ? "&#10005;" : "&#9974;"; btn.title = isFs() ? "Keluar layar penuh (F)" : "Layar penuh (F)"; };
  btn.addEventListener("click", (e) => { toggleFs(); btn.blur(); });
  document.addEventListener("fullscreenchange", sync);
  document.addEventListener("webkitfullscreenchange", sync);
  document.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() !== "f" || e.ctrlKey || e.metaKey || e.altKey) return;
    if (/INPUT|TEXTAREA/.test(document.activeElement.tagName)) return;
    if (typeof VeraVN !== "undefined" && VeraVN.active) return;
    toggleFs();
  });
})();

/* ---- galeri: Esc menutup detail / kembali ke menu ---- */
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  if ($("#detail").classList.contains("show")) { overlay("#detail", false); return; }
  if ($("#gallery").classList.contains("active")) show("menu");
});
$("#detail").addEventListener("click", (e) => { if (e.target.id === "detail") overlay("#detail", false); });
