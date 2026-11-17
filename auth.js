async function hashPass(pass, salt) {
  const text = salt + ":" + pass;
  try {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
  } catch {
    let h = 5381;
    for (const c of text) h = ((h << 5) + h + c.charCodeAt(0)) | 0;
    return "x" + (h >>> 0).toString(16);
  }
}
const newSalt = () => Math.random().toString(36).slice(2, 10);
const getUsers = () => store.get("sela-users", {});

function enterMenu(username) {
  store.set("sela-session", username);
  state.found = store.get(foundKey(), []);
  $("#who").textContent = "Halo, " + username;
  show("menu");
}

$("#form-register").addEventListener("submit", async (e) => {
  e.preventDefault();
  const msg = $("#reg-msg");
  const name = $("#reg-user").value.trim();
  const p1 = $("#reg-pass").value, p2 = $("#reg-pass2").value;
  const users = getUsers();
  const key = name.toLowerCase();
  if (!/^[A-Za-z0-9_]{3,16}$/.test(name)) return (msg.textContent = "Nama 3 sampai 16 karakter: huruf, angka, atau garis bawah.");
  if (p1.length < 6) return (msg.textContent = "Kata sandi minimal 6 karakter.");
  if (p1 !== p2) return (msg.textContent = "Kata sandi tidak sama.");
  if (users[key]) return (msg.textContent = "Nama itu sudah dipakai.");
  const salt = newSalt();
  users[key] = { name, salt, hash: await hashPass(p1, salt) };
  store.set("sela-users", users);
  msg.textContent = "";
  e.target.reset();
  enterMenu(name);
});

$("#form-login").addEventListener("submit", async (e) => {
  e.preventDefault();
  const msg = $("#login-msg");
  const user = getUsers()[$("#login-user").value.trim().toLowerCase()];
  const ok = user && (await hashPass($("#login-pass").value, user.salt)) === user.hash;
  if (!ok) return (msg.textContent = "Nama atau kata sandi salah.");
  msg.textContent = "";
  e.target.reset();
  enterMenu(user.name);
});

$("#btn-logout").addEventListener("click", () => {
  store.set("sela-session", null);
  state.found = [];
  show("welcome");
});

(function restoreSession() {
  const name = store.get("sela-session", null);
  const user = name && getUsers()[name.toLowerCase()];
  if (user) enterMenu(user.name);
})();

// Enter di layar awal: langsung masuk ke menu utama (tanpa login)
document.addEventListener("keydown", (e) => {
  if (e.key !== "Enter" || e.repeat) return;
  if (!$("#welcome").classList.contains("active")) return;
  e.preventDefault();
  enterMenu(store.get("sela-session", null) || "Tamu");
});

// Di HP: ketuk tulisan kecil di layar awal untuk langsung masuk
(function () {
  const h = document.getElementById("enter-hint"); if (!h) return;
  const touch = (window.matchMedia && matchMedia("(pointer: coarse)").matches) || "ontouchstart" in window;
  if (touch) h.textContent = "Ketuk di sini untuk langsung masuk";
  h.style.cursor = "pointer";
  h.addEventListener("click", () => enterMenu(store.get("sela-session", null) || "Tamu"));
})();
