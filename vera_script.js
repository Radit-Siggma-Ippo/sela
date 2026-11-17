(function () {
  const nodes = {};
  const N = (text, pose, x) => ({ who: "", text, pose, ...x });
  const V = (text, pose, x) => ({ who: "Vera", text, pose, ...x });
  const Y = (text, pose, x) => ({ who: "{user}", text, pose, ...x });
  function chain(name, rows, next) {
    rows.forEach((r, i) => { nodes[name + (i + 1)] = { ...r, next: i + 1 < rows.length ? name + (i + 2) : next }; });
    return name + "1";
  }

  chain("a", [
    N("[Seorang gadis? Apa itu anomali? Sepertinya bukan...]", "sleep"),
    N("Kamu menghampiri wanita itu."),
    N("[Benar-benar seorang wanita.]"),
    Y("Hei, permisi... apa kau baik-baik saja?"),
    N("Wanita itu bergerak sedikit dan bangun perlahan sembari mengusap matanya.", "rub"),
    N("Wanita itu sangatlah cantik, seolah bukan dari dunia yang sama denganku.", "smile"),
    Y("Apa kau baik-baik saja?"),
    V("Mm... ya...", "rub"),
    Y("Kamu siapa?"),
    V("Aku? Aku Vera.", "smile"),
    Y("Apa yang kau lakukan di tempat seperti ini?"),
    V("Kubilang pun kau tak akan mengerti... Apa yang kau lakukan di sini, oh domba yang tersesat?", "cheek"),
    Y("Domba yang tersesat? Itu metafora yang aneh... Aku terjebak di sini. Aku baru saja melewati 12 kelas, dan ini adalah kelas ke-13."),
    V("Kau menemukan banyak sekali hal yang seharusnya tak pernah ada, kan?"),
    Y("Ya."),
    V("Karena ini adalah Sela. Sela antara dunia manusia dan persepsi pikiran. Kau terjebak di antara dua dimensi tersebut."),
    Y("Persepsi pikiran? Apa artinya?"),
    V("Yang selama ini kau lihat hanyalah imajinasimu saja. Pengulangan yang kau lakukan juga hanya perasaanmu saja."),
    Y("Aku baru tahu itu."),
    V("Wajar jika kau baru mengetahuinya, karena hal itu hanya akulah yang mengetahuinya."),
  ], "menu");

  nodes.menu = V("Apa ada lagi yang ingin kau tanyakan?", "cheek", { choices: [
    { id: "A", once: true, text: "Bisa kau jelaskan ulang tentang anomali tadi?", next: "qa1" },
    { id: "B", once: true, text: "Kamu kok cantik banget?", next: "qb1" },
    { id: "C", once: true, text: "Jadi sebenarnya kau siapa?", next: "qc1" },
    { id: "D", text: "Tidak ada lagi yang ingin kutanyakan.", next: "d1" },
  ] });
  chain("qa", [
    V("Oke, {user}, aku akan menjelaskannya kembali agar kau paham."),
    V("Anomali yang kau lihat sebelumnya, baik itu warna merah, kursi berantakan, jam yang berputar ke arah sebaliknya, bahkan entitas hitam... itu semua hanyalah salah satu dari kecemasan yang pernah kau khawatirkan, yang berhasil diwujudkan oleh imajinasimu di sela-sela antara dua dimensi."),
  ], "menu");
  chain("qb", [
    V("... Itu tidak kusangka. Pertanyaanmu cukup menarik ya~ Mengapa aku cantik? Tentu saja karena aku rajin merawat diriku. Tak kusangka kecantikanku ini membuatmu jatuh cinta.", "smile"),
    V("Tapi mungkin juga kecantikanku itu mutlak karena ***** ... Ah, masih disensor. Aku tak bisa memberitahukannya padamu sekarang."),
    Y("Maksudmu?"),
    V("Fufu, tebak sendiri."),
  ], "menu");
  chain("qc", [
    V("Aku? Aku adalah Vera. Tapi aku yakin kau tak ingin jawaban seperti itu, kan? Aku adalah ***** ... Masih disensor. Aku tak bisa memberitahukannya padamu, maaf ya."),
    Y("Apa maksud dari disensor?"),
    V("Hal tersebut masih belum boleh kau ketahui, sayang.", "smile"),
  ], "menu");

  chain("d", [
    V("Baiklah, jika tak ada lagi yang ingin kau ketahui.", "cheek"),
    Y("Aku sudah muak berada di tempat ini. Bagaimana cara aku keluar dari sini?", undefined, { vol: 0.55, volDur: 8 }),
    V("Tadi kau bilang tak ingin bertanya lagi? Pintu selanjutnya adalah jalan keluar. Tapi kali ini, kau tak boleh menatap ke belakang, sekalipun ada yang memanggilmu. Jika kau membalikkan badan, kau akan kembali ke awal."),
    Y("Tak boleh menghadap ke belakang? Itu aneh. Tapi baiklah. Terima kasih atas saranmu, Vera."),
    V("Sama-sama. Hati-hati di jalan pulang, sayang.", "closed"),
  ], "e1");
  chain("e", [
    Y("Ikutlah bersamaku, Vera."),
    V("Ikut? Kau mengajakku pergi bersamamu?", "smile"),
    Y("Ya. Ayo keluar bersamaku."),
    V("Ini permintaanmu ya~", "closed"),
    N("Vera menggenggam tanganmu. Kalian berjalan bersama menyusuri lorong.", "hold"),
    Y("Bukankah kau terlalu bersemangat?"),
    V("Aku ingin keluar dari tempat ini dan menikmati hidup bersamamu!"),
    Y("Hidup bersamaku? Apa kau tahu maksud dari perkataanmu??"),
    V("Tentu aku tahu! Perasaan ini sudah tak bisa kutahan lagi, aku tak mau sendirian di sini."),
    N("Kalian sampai di pintu. Yang kau lihat di baliknya hanyalah putih.", "white", { vol: 0.85, volDur: 6 }),
    N("Kau membalikkan badan. Vera berdiri di seberang pintu, tersenyum canggung dengan mata tertutup.", "door"),
    Y("Vera? Ayo pergi. Kenapa kau diam saja di sana?"),
    V("..."),
    Y("Vera! Bukankah katanya kau ingin pergi dari tempat itu dan hidup bersamaku? Kemarilah."),
    V("Aku tidak bisa."),
    Y("Tidak bisa kenapa?"),
    V("..."),
    Y("VERA! KENAPA? KEMARILAH!"),
    V("AKU TIDAK BISA PERGI!"),
    Y("Kenapa? ... Bukankah kau bilang kau tak suka sendirian di sini?"),
    V("Tak semudah itu... tidak semudah itu untukku bisa pergi dari sini..."),
    Y("Bagaimana caranya??"),
    V("*******"),
    Y("Kau bicara apa?! Cepat kemari!"),
    V("Seperti dugaanku, sampai saat ini pun kau tak bisa mendengarnya. Kau harus menunggu... menunggu hingga saat itu tiba."),
    Y("Saat itu kapan!? Vera!"),
  ], "g1");
  chain("g", [
    N("Kamu menggenggam tangan lembut Vera.", "white", { set: { ending: "poem" } }),
    Y("Jika kubilang ikut, ya ikut! Aku akan membuatmu bahagia!"),
    N("Vera menangis terharu.", "door_cry"),
    V("Terima kasih... terima kasih... Pertemuanmu denganku itu adalah lima menit terbaikku... Terima kasih... tapi... aku harus pergi."),
    N("Tubuh Vera perlahan berubah menjadi partikel cahaya.", undefined, { particles: true }),
    Y("Vera! Apa yang terjadi? Hei!"),
    N("Vera terus lenyap, dan Vera memelukku.", "hug1"),
    V("Terima kasih, {user}.", "hug2"),
    N("Pelukan itu kosong sekarang.", "hug3", { particles: false }),
  ], "poem");
  nodes.poem = { pose: "white", particles: false, poem: [
    "Tak ada yang benar-benar hilang.",
    "Ia hanya pindah ke tempat yang tak bisa kita jangkau.",
    "",
    "Lima menit.",
    "Cukup untuk mengingat sebuah nama,",
    "tak cukup untuk menggenggamnya.",
    "",
    "Pintu itu masih terbuka,",
    "tapi putihnya tak punya rumah.",
    "Aku menoleh, dan hanya ada udara",
    "yang masih hangat",
    "oleh seseorang yang pernah di sana.",
    "",
    "Jika suatu hari namamu dipanggil",
    "dari sela yang tak kau kenal,",
    "cukup tahu bahwa seseorang",
    "masih menunggu di seberangnya.",
  ], next: "coming" };
  nodes.coming = { coming: true };
  nodes.end = { end: true };

  window.VERA_SCRIPT = { bg: "assets/kelas/vera.jpg", start: "a1", nodes };
})();
