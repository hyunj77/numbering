/* ==========================================================================
   Slide — 가로 스크롤 영역을 서서히(부드러운 가속·감속) 목표 위치로 옮기는 공용 함수 (사용자 지시: "서서히 넘어가게")
   - 브라우저 기본 smooth 스크롤은 속도를 바꿀 수 없고 빨라서, 직접 requestAnimationFrame 으로 이동 (ease-in-out cubic)
   - 이동하는 동안만 scroll-snap 을 끄고(스냅이 이동을 끊지 않게), 끝나면 되돌림. 사용자가 손을 대면(터치·휠) 바로 멈추고 맡김
   - 시간은 tokens.css 의 --mobile-slide-ms. 사용: window.NumberingSlide(요소, 목표 scrollLeft)
   ========================================================================== */
(() => {
  const running = new Map();
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  const duration = () => {
    const value = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--mobile-slide-ms'));
    return Number.isFinite(value) ? value : 1000;
  };

  const stop = (el) => {
    const job = running.get(el);
    if (!job) return;
    window.cancelAnimationFrame(job.raf);
    ['touchstart', 'wheel', 'pointerdown'].forEach((name) => el.removeEventListener(name, job.interrupt));
    el.style.scrollSnapType = job.snap;
    running.delete(el);
  };

  window.NumberingSlide = (el, left) => {
    stop(el);
    const from = el.scrollLeft;
    const distance = left - from;
    if (Math.abs(distance) < 1) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.scrollLeft = left;
      return;
    }
    const ms = duration();
    const job = { snap: el.style.scrollSnapType, raf: 0, interrupt: () => stop(el) };
    running.set(el, job);
    el.style.scrollSnapType = 'none';
    ['touchstart', 'wheel', 'pointerdown'].forEach((name) => el.addEventListener(name, job.interrupt, { passive: true }));
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
