// Centralised configuration for the static site.
// Edit the URL below once you’ve created/customised your Google Form.

const SIGNUP_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSeMGYl7zShqS2wK8KQbgLxn_6QZ76BqxhCKkeny4cI92czZ3A/viewform?usp=sharing&ouid=118127600199843286922";

function applySignupLinks() {
  const links = document.querySelectorAll("[data-signup-link]");
  for (const a of links) {
    const existingHref = a.getAttribute("href");
    if (!existingHref || existingHref === "#" || existingHref.includes("REPLACE_ME")) {
      a.setAttribute("href", SIGNUP_FORM_URL);
    }
    a.setAttribute("target", "_blank");
    a.setAttribute("rel", "noreferrer");
  }
}

function markCurrentNavLink() {
  const path = window.location.pathname.split("/").pop() || "index.html";
  const links = document.querySelectorAll('a.nav-link[href]');
  for (const a of links) {
    const href = a.getAttribute("href");
    if (href === path) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  applySignupLinks();
  markCurrentNavLink();
  initNetworkBackground();
});

function prefersReducedMotion() {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
}

function initNetworkBackground() {
  if (prefersReducedMotion()) return;
  if (document.getElementById("network-bg")) return;

  const canvas = document.createElement("canvas");
  canvas.id = "network-bg";
  document.body.prepend(canvas);

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const emojis = [
    "🐶",
    "🐱",
    "🐭",
    "🐰",
    "🦊",
    "🐻",
    "🐼",
    "🐨",
    "🐯",
    "🦁",
    "🐮",
    "🐷",
    "🐸",
    "🐵",
    "🦉",
    "🦜",
    "🐦",
    "🐟",
    "🐙",
    "🦀",
    "🦎",
    "🐢",
    "🦋",
    "🐞",
    "🐝",
    "🦌",
    "🦓",
    "🦒",
    "🐘",
    "🦏",
    "🦛",
    "🦘",
  ];

  const nodes = [];
  const edgeCount = 2; // nearest connections per node
  const pairedFraction = 0.28; // some nearby pairs share same emoji
  let w = 0;
  let h = 0;
  let dpr = 1;
  let raf = 0;

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function seedPairs() {
    const used = new Set();
    const targetPairs = Math.floor((nodes.length * pairedFraction) / 2);
    let made = 0;

    for (let attempt = 0; attempt < nodes.length * 10 && made < targetPairs; attempt++) {
      const i = Math.floor(Math.random() * nodes.length);
      if (used.has(i)) continue;
      const a = nodes[i];

      let bestJ = -1;
      let bestD2 = Infinity;
      for (let j = 0; j < nodes.length; j++) {
        if (i === j || used.has(j)) continue;
        const b = nodes[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < bestD2) {
          bestD2 = d2;
          bestJ = j;
        }
      }

      if (bestJ === -1) continue;
      const dist = Math.sqrt(bestD2);
      if (dist > 220) continue; // keep pairs plausibly connected

      const emoji = emojis[Math.floor(Math.random() * emojis.length)];
      nodes[i].emoji = emoji;
      nodes[bestJ].emoji = emoji;
      used.add(i);
      used.add(bestJ);
      made++;
    }
  }

  function resize() {
    dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    w = Math.floor(window.innerWidth);
    h = Math.floor(window.innerHeight);
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.max(24, Math.min(60, Math.floor((w * h) / 28000)));
    nodes.length = 0;
    for (let i = 0; i < count; i++) {
      nodes.push({
        x: rand(40, w - 40),
        y: rand(40, h - 40),
        vx: rand(-0.18, 0.18),
        vy: rand(-0.14, 0.14),
        size: rand(18, 28),
        emoji: emojis[i % emojis.length],
        phase: rand(0, Math.PI * 2),
      });
    }

    seedPairs();
  }

  function draw(t) {
    const time = t * 0.001;
    const scroll = window.scrollY || 0;
    const parallax = (scroll % (h || 1)) * 0.06;

    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.translate(0, -parallax);

    // Update node positions.
    for (const n of nodes) {
      const drift = 0.18 * Math.sin(time * 0.7 + n.phase);
      n.x += n.vx + drift * 0.02;
      n.y += n.vy + drift * 0.02;

      if (n.x < 24 || n.x > w - 24) n.vx *= -1;
      if (n.y < 24 || n.y > h - 24) n.vy *= -1;
      n.x = Math.max(20, Math.min(w - 20, n.x));
      n.y = Math.max(20, Math.min(h - 20, n.y));
    }

    // Draw edges (nearest neighbours).
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(42,42,42,0.18)";

    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      const nearest = [];
      for (let j = 0; j < nodes.length; j++) {
        if (i === j) continue;
        const b = nodes[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const d2 = dx * dx + dy * dy;
        nearest.push({ b, d2 });
      }
      nearest.sort((p, q) => p.d2 - q.d2);

      for (let k = 0; k < edgeCount; k++) {
        const b = nearest[k]?.b;
        if (!b) continue;
        const dist = Math.sqrt(nearest[k].d2);
        if (dist > 220) continue;
        const alpha = Math.max(0.04, 0.22 - dist / 1200);
        ctx.strokeStyle = `rgba(42,42,42,${alpha})`;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }

    // Draw nodes as emoji.
    for (const n of nodes) {
      const bob = 1.8 * Math.sin(time * 0.8 + n.phase);
      ctx.font = `${Math.round(n.size)}px ui-sans-serif, system-ui, "Apple Color Emoji", "Segoe UI Emoji"`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(n.emoji, n.x, n.y + bob);
    }

    ctx.restore();
    raf = window.requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener("resize", resize, { passive: true });
  raf = window.requestAnimationFrame(draw);
  window.addEventListener(
    "pagehide",
    () => {
      if (raf) window.cancelAnimationFrame(raf);
      raf = 0;
    },
    { passive: true }
  );
}

