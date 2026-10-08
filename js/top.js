(() => {
  const button = document.querySelector(".to-top");
  if (!button) return;
  const value = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--to-top-show-at"));
  const SHOW_AT = Number.isFinite(value) ? value : 200;
  const reduceQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  let visible = null;
  let ticking = false;
  const update = () => {
    ticking = false;
    const next = window.scrollY >= SHOW_AT;
    if (next === visible) return;
    visible = next;
    button.classList.toggle("is-visible", next);
  };
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  };
  button.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: reduceQuery.matches ? "auto" : "smooth" });
    button.blur();
  });
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("pageshow", update);
  update();
})();
