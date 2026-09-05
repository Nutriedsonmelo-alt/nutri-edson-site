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
