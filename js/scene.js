(function () {
  const art = document.getElementById("art");
  const NS = "http://www.w3.org/2000/svg";
  const mk = (t, a, p) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };
  const svg = () => mk("svg", { viewBox: "0 0 1672 941", "aria-hidden": "true" }, art);

  const lamps = svg(); lamps.setAttribute("class", "lamps-svg");
  const ld = mk("defs", {}, lamps);
  const blur = (id, s) => { const f = mk("filter", { id, x: "-100%", y: "-100%", width: "300%", height: "300%" }, ld); mk("feGaussianBlur", { stdDeviation: s }, f); };
  blur("b2", 2); blur("b3", 3); blur("b14", 14);
  const cone = mk("linearGradient", { id: "cone", x1: 0, y1: 0, x2: 0, y2: 1 }, ld);
  mk("stop", { offset: 0, "stop-color": "#aab6ff", "stop-opacity": ".22" }, cone);
  mk("stop", { offset: 1, "stop-color": "#aab6ff", "stop-opacity": "0" }, cone);
  const LAMPS = [
    { cls: "l1", x: 1042, y: 0, w: 60, h: 92, glow: 1, cone: [1000, 92, 1148, 92, 1190, 420, 960, 420] },
    { cls: "l2", x: 1070, y: 252, w: 26, h: 40, glow: 0.7 },
    { cls: "l3", x: 1082, y: 346, w: 12, h: 20, glow: 0.5 },
  ];
  LAMPS.forEach((l) => {
    const g = mk("g", { class: "lamp " + l.cls }, lamps);
    if (l.cone) mk("polygon", { points: l.cone.join(" "), fill: "url(#cone)", filter: "url(#b14)" }, g);
    mk("rect", { x: l.x - 14, y: l.y - 10, width: l.w + 28, height: l.h + 24, fill: "#8fa0ff", opacity: 0.55 * l.glow, filter: "url(#b14)" }, g);
    mk("rect", { x: l.x, y: l.y, width: l.w, height: l.h, fill: "#e8ecff", opacity: 0.6 * l.glow, filter: "url(#b3)" }, g);
  });

  const EYES = [
    { poly: [[501,234],[509,230.5],[522,230],[537,233],[548,240],[545,246],[535,250],[520,250],[508,246]], c: [513.7, 239.3], rx: 11.2, ry: 7.4 },
    { poly: [[593.5,265],[597,260.5],[600.8,258.6],[607,257.7],[612,258.3],[614.6,260.5],[614.5,263],[613.3,266.8],[612,270.5],[609.5,273.6],[605.8,274.3],[602.6,272.7],[598.9,271.8],[595.4,269.3]], c: [599.8, 264.6], rx: 5.9, ry: 5.8 },
  ];
  const eyes = svg();
  const ed = mk("defs", {}, eyes);
  EYES.forEach((e, i) => {
    mk("polygon", { points: e.poly.map((p) => p.join(",")).join(" ") }, mk("clipPath", { id: "eye" + i }, ed));
    const g = mk("g", { "clip-path": `url(#eye${i})` }, eyes);
    mk("ellipse", { cx: e.c[0], cy: e.c[1], rx: e.rx, ry: e.ry, fill: "#000" }, g);
  });
})();
