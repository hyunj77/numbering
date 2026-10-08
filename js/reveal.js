/* ==========================================================================
   Collection 스크롤 등장 — 스크롤을 내려 사진·글씨가 화면에 들어오면 아래에서 올라오며 서서히 나타남 (사용자 지시, 시안 외 효과)
   - [data-reveal] 요소가 화면에 들어오면 한 번만 .is-revealed (CSS 전환: 투명→불투명 + 아래에서 위로 + 사진은 위→아래로 열림, css/sections/collection.css)
   - data-reveal-delay(초)로 요소마다 시작을 어긋나게 함 (사진 → 글씨·버튼 순)
   - 전환이 끝나면 .is-reveal-done 으로 효과 속성을 모두 제거 → 다 나타난 뒤에는 원래 화면과 픽셀까지 같음
   - 감지는 스크롤 위치 계산 (IntersectionObserver 는 clip-path 로 완전히 가려진 요소를 "안 보임"으로 처리해 쓸 수 없음)
   - 모션 줄이기(prefers-reduced-motion: reduce)면 처음부터 다 보임
   ========================================================================== */
(() => {
  let items = Array.from(document.querySelectorAll('[data-reveal]'));
  if (!items.length) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  items.forEach((el) => {
    const delay = parseFloat(el.dataset.revealDelay);
    if (Number.isFinite(delay)) el.style.setProperty('--reveal-delay', `${delay}s`);
  });

  const show = (el) => {
    el.classList.add('is-revealed');
    el.addEventListener('transitionend', (e) => {
      if (e.target === el && e.propertyName === 'opacity') el.classList.add('is-reveal-done');
    });
  };

  if (reduce) {
    items.forEach((el) => el.classList.add('is-revealed', 'is-reveal-done'));
    return;
  }

  const VISIBLE_RATIO = 0.15; // 요소 높이의 15%가 보이면 시작 (높이가 큰 사진은 위쪽 일부만 보여도 시작)
  const BOTTOM_MARGIN = 0.1; // 화면 아래 10%는 제외 (가장자리에서 바로 시작하지 않게)
  let ticking = false;

  const check = () => {
    ticking = false;
    const limit = window.innerHeight * (1 - BOTTOM_MARGIN);
    items = items.filter((el) => {
      const r = el.getBoundingClientRect();
      const visible = Math.min(r.bottom, limit) - Math.max(r.top, 0);
      if (r.height > 0 && visible >= r.height * VISIBLE_RATIO) {
        show(el); // 한 번만
        return false;
      }
      return true;
    });
    if (!items.length) {
      window.removeEventListener('scroll', request);
      window.removeEventListener('resize', request);
    }
  };
  const request = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(check);
  };

  window.addEventListener('scroll', request, { passive: true });
  window.addEventListener('resize', request);
  request();
})();
