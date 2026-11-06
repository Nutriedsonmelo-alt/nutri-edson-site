// Ano dinâmico no rodapé
document.getElementById("year").textContent = new Date().getFullYear();

// Menu mobile
const header = document.getElementById("header");
const menuToggle = document.getElementById("menuToggle");
menuToggle.addEventListener("click", () => {
  const isOpen = header.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  document.body.style.overflow = isOpen ? "hidden" : "";
});
document.querySelectorAll(".nav a, .nav-cta").forEach((link) => {
  link.addEventListener("click", () => {
    header.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  });
});

// Efeito glass no header ao rolar
const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 8);
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

// Revelação suave ao rolar a tela.
// Checagem por posição (em vez de depender só de IntersectionObserver) para
// não deixar seções travadas em opacity:0 quando a página pula direto para
// uma âncora (ex.: link do menu, ou URL com #vip já na primeira carga).
let pendingReveal = document.querySelectorAll(".reveal");
function revealVisible() {
  pendingReveal = Array.from(pendingReveal).filter((el) => {
    if (el.getBoundingClientRect().top > window.innerHeight) return true;
    el.classList.add("in-view");
    return false;
  });
  if (pendingReveal.length === 0) {
    window.removeEventListener("scroll", revealVisible);
    window.removeEventListener("resize", revealVisible);
  }
}
revealVisible();
// Reexecuta após o load (e num pequeno atraso) para pegar o caso de a página
// já abrir direto numa âncora (ex.: .../index.html#vip), cujo salto de scroll
// do navegador pode acontecer depois desta primeira checagem.
window.addEventListener("load", revealVisible);
setTimeout(revealVisible, 300);
window.addEventListener("scroll", revealVisible, { passive: true });
window.addEventListener("resize", revealVisible, { passive: true });

// Fecha um accordion (FAQ) quando outro é aberto
document.querySelectorAll(".accordion-item").forEach((item) => {
  item.addEventListener("toggle", () => {
    if (!item.open) return;
    document.querySelectorAll(".accordion-item[open]").forEach((openItem) => {
      if (openItem !== item) openItem.removeAttribute("open");
    });
  });
});

// Contador animado (começa quando o número aparece na tela)
(function () {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll("[data-count]").forEach((el) => {
    if (reduce) return;
    const target = parseInt(el.dataset.count, 10);
    const run = () => {
      let t0 = null;
      const tick = (ts) => {
        if (t0 === null) t0 = ts;
        const p = Math.min(1, (ts - t0) / 1500);
        el.textContent = "+" + Math.round(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver((list) => {
      if (list[0].isIntersecting) { io.disconnect(); run(); }
    });
    io.observe(el);
  });
})();

// Régua de medidas: os números passam conforme a página rola; linha de progresso no topo
(function () {
  const ruler = document.getElementById("ruler");
  const track = document.getElementById("rulerTrack");
  const bar = document.getElementById("progress");
  if (track) {
    const STEP = 12, COUNT = 560; // um traço a cada 12px; número a cada 10 traços
    let html = "";
    for (let i = 0; i < COUNT; i++) {
      const cls = i % 10 === 0 ? "tick big" : i % 5 === 0 ? "tick mid" : "tick";
      html += '<span class="' + cls + '">' + (i % 10 === 0 ? "<b>" + i / 10 + "</b>" : "") + "</span>";
    }
    track.innerHTML = html;
  }
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function update() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (bar) bar.style.setProperty("--p", max > 0 ? Math.min(1, window.scrollY / max) : 0);
    if (track && !reduce) {
      track.style.transform = "translateX(" + (-window.scrollY * 0.5) + "px)";
    }
  }
  update();
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update, { passive: true });
})();

// Carrosséis (etapas do acompanhamento e depoimentos)
function carousel(trackId, prevId, nextId, countId, dotsSel) {
  const track = document.getElementById(trackId);
  if (!track) return;
  const slides = Array.from(track.children);
  const dots = dotsSel ? Array.from(document.querySelectorAll(dotsSel)) : [];
  const count = document.getElementById(countId);
  const pos = (i) => slides[i].getBoundingClientRect().left - slides[0].getBoundingClientRect().left;
  function current() {
    if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 4) return slides.length - 1;
    let best = 0, bd = Infinity;
    slides.forEach((_, i) => { const d = Math.abs(pos(i) - track.scrollLeft); if (d < bd) { bd = d; best = i; } });
    return best;
  }
  function goTo(i) {
    i = Math.max(0, Math.min(slides.length - 1, i));
    track.scrollTo({ left: pos(i), behavior: "smooth" });
  }
  function update() {
    const i = current();
    count.textContent = (i + 1) + " / " + slides.length;
    dots.forEach((d, k) => { d.className = k === i ? "on" : ""; });
  }
  track.addEventListener("scroll", update, { passive: true });
  document.getElementById(prevId).addEventListener("click", () => goTo(current() - 1));
  document.getElementById(nextId).addEventListener("click", () => goTo(current() + 1));
  track.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") goTo(current() + 1);
    if (e.key === "ArrowLeft") goTo(current() - 1);
  });
  // Arrastar com o mouse (no celular o toque já rola sozinho)
  let down = false, startX = 0, startLeft = 0;
  track.addEventListener("pointerdown", (e) => {
    if (e.pointerType !== "mouse") return;
    down = true; startX = e.clientX; startLeft = track.scrollLeft; track.classList.add("dragging");
  });
  window.addEventListener("pointermove", (e) => { if (down) track.scrollLeft = startLeft - (e.clientX - startX); });
  window.addEventListener("pointerup", () => {
    if (!down) return;
    down = false; track.classList.remove("dragging"); goTo(current());
  });
  track.addEventListener("dragstart", (e) => e.preventDefault());
  update();
}
carousel("atrack", "aprev", "anext", "acount", "#adots i");
carousel("btrack", "bprev", "bnext", "bcount");
carousel("rtrack", "rprev", "rnext", "rcount");

// Luz dourada que segue o mouse no topo
(function () {
  const hero = document.querySelector(".hero");
  if (!hero || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  hero.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") return;
    const r = hero.getBoundingClientRect();
    hero.style.setProperty("--mx", ((e.clientX - r.left) / r.width * 100) + "%");
    hero.style.setProperty("--my", ((e.clientY - r.top) / r.height * 100) + "%");
  });
})();

// Botão fixo no celular: aparece depois que o botão do topo sai da tela
(function () {
  const dock = document.getElementById("dock");
  const cta = document.querySelector(".hero-ctas .btn");
  if (!dock || !cta) return;
  const io = new IntersectionObserver((list) => {
    dock.classList.toggle("show", !list[0].isIntersecting);
  });
  io.observe(cta);
})();
