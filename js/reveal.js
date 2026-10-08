(() => {
  let items = Array.from(document.querySelectorAll("[data-reveal]"));
  if (!items.length) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  items.forEach((el) => {
    const delay = parseFloat(el.dataset.revealDelay);
    if (Number.isFinite(delay)) el.style.setProperty("--reveal-delay", `${delay}s`);
  });
  const show = (el) => {
    el.classList.add("is-revealed");
    el.addEventListener("transitionend", (e) => {
      if (e.target === el && e.propertyName === "opacity") el.classList.add("is-reveal-done");
    });
  };
  if (reduce) {
    items.forEach((el) => el.classList.add("is-revealed", "is-reveal-done"));
    return;
  }
  const VISIBLE_RATIO = 0.15;
  const BOTTOM_MARGIN = 0.1;
  let ticking = false;
  const check = () => {
    ticking = false;
    const limit = window.innerHeight * (1 - BOTTOM_MARGIN);
    items = items.filter((el) => {
      const r = el.getBoundingClientRect();
      const visible = Math.min(r.bottom, limit) - Math.max(r.top, 0);
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      const showAtBottom = atBottom && r.top < window.innerHeight && r.bottom > 0;
      if (r.height > 0 && (visible >= r.height * VISIBLE_RATIO || showAtBottom)) {
        show(el);
        return false;
      }
      return true;
    });
    if (!items.length) {
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
    }
  };
  const request = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(check);
  };
  window.addEventListener("scroll", request, { passive: true });
  window.addEventListener("resize", request);
  request();
})();
