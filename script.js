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

// Contador estilo odômetro: cada dígito "gira" até o número final (começa quando aparece na tela)
(function () {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll("[data-count]").forEach((el) => {
    if (reduce) return;
    const digits = String(parseInt(el.dataset.count, 10)).split("");
    const label = "+" + digits.join("");
    el.setAttribute("aria-label", label);
    el.textContent = "";
    el.classList.add("odo");
    const plus = document.createElement("span");
    plus.className = "odo-plus"; plus.setAttribute("aria-hidden", "true"); plus.textContent = "+";
    el.appendChild(plus);
    const cols = digits.map((d, i) => {
      const turns = 2 + i;                      // dígitos à direita giram mais
      const box = document.createElement("span");
      box.className = "odo-d"; box.setAttribute("aria-hidden", "true");
      const col = document.createElement("span");
      col.className = "odo-col";
      let html = "";
      for (let n = 0; n <= turns * 10 + Number(d); n++) html += "<i>" + (n % 10) + "</i>";
      col.innerHTML = html;
      col.style.setProperty("--end", turns * 10 + Number(d));
      col.style.transitionDuration = (1.5 + i * 0.35) + "s";
      box.appendChild(col);
      el.appendChild(box);
      return col;
    });
    const HOLD = 3200;                         // tempo com o número final na tela antes de recomeçar
    let timer = null, visible = false, running = false;
    const reset = () => {
      el.classList.remove("done");
      const li = el.closest("li"); if (li) li.classList.remove("celebrate");
      cols.forEach((c) => { c.style.transition = "none"; c.classList.remove("go"); });
      void el.offsetWidth;                      // força o recomeço instantâneo em zero
      cols.forEach((c, i) => { c.style.transition = ""; c.style.transitionDuration = (1.5 + i * 0.35) + "s"; });
    };
    const cycle = () => {
      if (!visible) { running = false; return; }
      running = true;
      timer = setTimeout(() => {
        cols.forEach((c) => c.classList.add("go"));
        const last = cols[cols.length - 1];
        last.addEventListener("transitionend", () => {
          el.classList.add("done");
          const li = el.closest("li"); if (li) li.classList.add("celebrate");
          timer = setTimeout(() => { reset(); cycle(); }, HOLD);
        }, { once: true });
      }, 450);
    };
    const run = () => { if (!running) cycle(); };
    const io = new IntersectionObserver((list) => {
      visible = list[0].isIntersecting;
      if (visible) run();
    });
    io.observe(el);
  });
})();

// Régua de medidas: os números passam conforme a página rola; linha de progresso no topo.
// Onde o navegador permite (Chrome, Edge, Safari novo), o CSS liga a régua direto à rolagem,
// sem passar pelo JavaScript: fica sempre sincronizada e fluida. No resto, usa o JS como reserva.
(function () {
  const ruler = document.getElementById("ruler");
  const track = document.getElementById("rulerTrack");
  const bar = document.getElementById("progress");
  if (track) {
    const COUNT = 700; // um traço a cada 12px; número a cada 10 traços
    let html = "";
    for (let i = 0; i < COUNT; i++) {
      const cls = i % 10 === 0 ? "tick big" : i % 5 === 0 ? "tick mid" : "tick";
      html += '<span class="' + cls + '">' + (i % 10 === 0 ? "<b>" + i / 10 + "</b>" : "") + "</span>";
    }
    track.innerHTML = html;
  }
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const native = window.CSS && CSS.supports && CSS.supports("animation-timeline: scroll()");
  const root = document.documentElement;
  const maxScroll = () => Math.max(1, root.scrollHeight - window.innerHeight);

  if (native && !reduce) {
    root.classList.add("scroll-timeline");
    const setShift = () => root.style.setProperty("--ruler-shift", (-maxScroll() * 0.5) + "px");
    setShift();
    window.addEventListener("resize", setShift, { passive: true });
    window.addEventListener("load", setShift);
    if ("ResizeObserver" in window) new ResizeObserver(setShift).observe(document.body);
    return;
  }

  let ticking = false;
  function paint() {
    ticking = false;
    const y = Math.max(0, window.scrollY);       // a rolagem elástica do Mac/celular dá valores negativos
    if (bar) bar.style.setProperty("--p", Math.min(1, y / maxScroll()));
    if (track && !reduce) track.style.transform = "translate3d(" + (-Math.round(y * 0.5)) + "px,0,0)";
  }
  function update() { if (!ticking) { ticking = true; requestAnimationFrame(paint); } }
  paint();
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update, { passive: true });
  window.addEventListener("pageshow", paint);
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

// Foto reage ao mouse e ao toque: inclina de leve e passa um brilho dourado
(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  document.querySelectorAll(".hero-fullbleed picture, .photo-frame").forEach((el) => {
    el.classList.add("tilt");
    let timer;
    const aim = (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      el.style.setProperty("--ry", ((x - 0.5) * 8) + "deg");
      el.style.setProperty("--rx", ((0.5 - y) * 8) + "deg");
      el.style.setProperty("--sx", (x * 100) + "%");
      el.style.setProperty("--sy", (y * 100) + "%");
    };
    const off = () => {
      el.classList.remove("active");
      el.style.setProperty("--rx", "0deg");
      el.style.setProperty("--ry", "0deg");
    };
    el.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") el.classList.add("active"); });
    el.addEventListener("pointermove", (e) => { if (e.pointerType === "mouse") aim(e); });
    el.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse") off(); });
    // Toque no celular: reage enquanto o dedo está na foto e volta logo depois
    el.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "mouse") return;
      clearTimeout(timer); aim(e); el.classList.add("active");
    });
    ["pointerup", "pointercancel"].forEach((t) => el.addEventListener(t, (e) => {
      if (e.pointerType === "mouse") return;
      timer = setTimeout(off, 700);
    }));
  });
})();

// Botão de tema: alterna claro/escuro e lembra a escolha neste aparelho
(function () {
  const btn = document.getElementById("themeToggle");
  if (!btn) return;
  const root = document.documentElement;
  const sync = () => btn.setAttribute("aria-pressed", String(root.getAttribute("data-theme") === "dark"));
  sync();
  btn.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.classList.add("theme-fade");
    if (next === "dark") root.setAttribute("data-theme", "dark"); else root.removeAttribute("data-theme");
    try { localStorage.setItem("theme", next); } catch (e) {}
    sync();
    setTimeout(() => root.classList.remove("theme-fade"), 400);
  });
})();

// Antes e depois: rola sozinho, sem pausa e bem devagar (como uma esteira); para de vez quando a pessoa toca/clica
(function () {
  const track = document.getElementById("btrack");
  if (!track || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const originals = Array.from(track.children);
  const SPEED = 38;                              // pixels por segundo (lento)
  // cópia dos cartões ao final, para a esteira emendar sem salto
  const clones = originals.map((el) => {
    const c = el.cloneNode(true);
    c.setAttribute("aria-hidden", "true");
    c.querySelectorAll("img").forEach((i) => { i.loading = "eager"; });
    track.appendChild(c);
    return c;
  });
  const cycle = () => clones[0].offsetLeft - originals[0].offsetLeft;
  let raf = null, last = 0, pos = 0, stopped = false, visible = false;
  track.style.scrollSnapType = "none";            // o encaixe atrapalharia a rolagem contínua
  function frame(ts) {
    if (stopped || !visible || document.hidden) { raf = null; return; }
    if (!last) last = ts;
    const dt = Math.min(64, ts - last); last = ts;
    pos += (SPEED * dt) / 1000;
    const w = cycle();
    if (w > 0 && pos >= w) pos -= w;             // volta ao início sem pular
    track.scrollLeft = pos;
    raf = requestAnimationFrame(frame);
  }
  function start() {
    if (stopped || raf || !visible || document.hidden) return;
    pos = track.scrollLeft; last = 0;
    raf = requestAnimationFrame(frame);
  }
  function pause() { if (raf) cancelAnimationFrame(raf); raf = null; }
  function stop() {
    if (stopped) return;
    stopped = true; pause();
    const w = cycle();
    if (w > 0 && track.scrollLeft >= w) track.scrollLeft -= w;   // sai da cópia para a original
    clones.forEach((c) => c.remove());
    track.style.scrollSnapType = "";               // devolve o encaixe para a pessoa navegar
  }
  // qualquer toque, clique ou arrasto na faixa de fotos, ou nas setas, encerra a rolagem
  track.addEventListener("pointerdown", stop);
  track.addEventListener("keydown", stop);
  ["bprev", "bnext"].forEach((id) => { const b = document.getElementById(id); if (b) b.addEventListener("click", stop); });
  new IntersectionObserver((list) => { visible = list[0].isIntersecting; visible ? start() : pause(); }, { threshold: 0.3 }).observe(track);
  document.addEventListener("visibilitychange", () => { document.hidden ? pause() : start(); });
})();
