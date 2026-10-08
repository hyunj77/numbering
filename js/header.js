(() => {
  const SCROLL_THRESHOLD = 10;
  const header = document.querySelector(".site-header");
  if (!header) return;
  let scrolled = null;
  let ticking = false;
  const update = () => {
    ticking = false;
    const next = window.scrollY >= SCROLL_THRESHOLD;
    if (next === scrolled) return;
    scrolled = next;
    header.classList.toggle("is-scrolled", next);
  };
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("pageshow", update);
  update();
})();
