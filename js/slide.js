(() => {
  const running = /* @__PURE__ */ new Map();
  const ease = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const duration = () => {
    const value = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--mobile-slide-ms"));
    return Number.isFinite(value) ? value : 1e3;
  };
  const stop = (el) => {
    const job = running.get(el);
    if (!job) return;
    window.cancelAnimationFrame(job.raf);
    ["touchstart", "wheel", "pointerdown"].forEach((name) => el.removeEventListener(name, job.interrupt));
    el.style.scrollSnapType = job.snap;
    running.delete(el);
  };
  window.NumberingSlide = (el, left) => {
    stop(el);
    const from = el.scrollLeft;
    const distance = left - from;
    if (Math.abs(distance) < 1) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.scrollLeft = left;
      return;
    }
    const ms = duration();
    const job = { snap: el.style.scrollSnapType, raf: 0, interrupt: () => stop(el) };
    running.set(el, job);
    el.style.scrollSnapType = "none";
    ["touchstart", "wheel", "pointerdown"].forEach((name) => el.addEventListener(name, job.interrupt, { passive: true }));
    const start = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - start) / ms);
      el.scrollLeft = from + distance * ease(t);
      if (t < 1) {
        job.raf = window.requestAnimationFrame(step);
      } else {
        el.scrollLeft = left;
        stop(el);
      }
    };
    job.raf = window.requestAnimationFrame(step);
  };
})();
