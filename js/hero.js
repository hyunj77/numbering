(() => {
  const hero = document.querySelector(".hero");
  const bg = hero && hero.querySelector(".hero__bg");
  if (!hero || !bg) return;
  const mouseQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
  const reduceQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const enabled = () => mouseQuery.matches && !reduceQuery.matches;
  const set = (on) => bg.classList.toggle("is-right-hover", on);
  document.addEventListener(
    "pointermove",
    (event) => {
      if (event.pointerType !== "mouse" || !enabled()) return;
      const rect = hero.getBoundingClientRect();
      const inside = event.clientY >= rect.top && event.clientY <= rect.bottom && event.clientX >= rect.left && event.clientX <= rect.right;
      set(inside && event.clientX >= rect.left + rect.width / 2);
    },
    { passive: true }
  );
  document.documentElement.addEventListener("mouseleave", () => set(false));
  if ("IntersectionObserver" in window) {
    new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) set(false);
      hold.offscreen = !entries[0].isIntersecting;
      scheduleAutoplay();
    }).observe(hero);
  }
  const onReduceChange = () => {
    if (!enabled()) set(false);
    scheduleAutoplay();
  };
  if (reduceQuery.addEventListener) reduceQuery.addEventListener("change", onReduceChange);
  const mobileQuery = window.matchMedia("(max-width: 1199px)");
  const autoplayValue = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--hero-autoplay-ms"));
  const AUTOPLAY_MS = Number.isFinite(autoplayValue) ? autoplayValue : 2500;
  const slides = Array.from(bg.querySelectorAll(".hero__bg-col"));
  const hold = { touch: false, hidden: document.hidden, offscreen: false };
  let timer = 0;
  const canAutoplay = () => mobileQuery.matches && !reduceQuery.matches && slides.length > 1 && !hold.touch && !hold.hidden && !hold.offscreen;
  function scheduleAutoplay() {
    window.clearTimeout(timer);
    timer = 0;
    if (!canAutoplay()) return;
    timer = window.setTimeout(() => {
      timer = 0;
      if (canAutoplay()) {
        const width = bg.clientWidth || 1;
        const index = Math.round(bg.scrollLeft / width);
        const left = (index + 1) % slides.length * width;
        if (window.NumberingSlide) window.NumberingSlide(bg, left);
        else bg.scrollTo({ left, behavior: "smooth" });
      }
      scheduleAutoplay();
    }, AUTOPLAY_MS);
  }
  bg.addEventListener("touchstart", () => {
    hold.touch = true;
    scheduleAutoplay();
  }, { passive: true });
  ["touchend", "touchcancel"].forEach((name) => bg.addEventListener(name, () => {
    hold.touch = false;
    scheduleAutoplay();
  }, { passive: true }));
  document.addEventListener("visibilitychange", () => {
    hold.hidden = document.hidden;
    scheduleAutoplay();
  });
  mobileQuery.addEventListener("change", scheduleAutoplay);
  scheduleAutoplay();
})();
