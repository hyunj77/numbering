/* ==========================================================================
   Hero — 마우스를 Hero 오른쪽 절반에 올리면 두 사진 비율이 50:50 → 40:60 으로 부드럽게 바뀜 (사용자 지시, 시안 외 효과)
   - 실제 전환(0.5초)은 CSS: .hero__bg 의 grid-template-columns transition (css/sections/hero.css)
   - 여기서는 마우스가 Hero 오른쪽 절반 안에 있는지만 보고 .hero__bg 에 .is-right-hover 를 켜고 끔
   - 사진은 .hero__bg 위에 겹친 내용(헤더·문구)보다 아래라서 :hover 를 직접 쓸 수 없어 JS 로 위치를 판별
   - 마우스가 없는 기기(터치)와 prefers-reduced-motion: reduce 에서는 동작하지 않음
   ========================================================================== */
(() => {
  const hero = document.querySelector('.hero');
  const bg = hero && hero.querySelector('.hero__bg');
  if (!hero || !bg) return;

  const mouseQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
  const reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const enabled = () => mouseQuery.matches && !reduceQuery.matches;
  const set = (on) => bg.classList.toggle('is-right-hover', on);

  document.addEventListener(
    'pointermove',
    (event) => {
      if (event.pointerType !== 'mouse' || !enabled()) return;
      const rect = hero.getBoundingClientRect();
      const inside = event.clientY >= rect.top && event.clientY <= rect.bottom && event.clientX >= rect.left && event.clientX <= rect.right;
      set(inside && event.clientX >= rect.left + rect.width / 2);
    },
    { passive: true }
  );

  // 마우스가 창 밖으로 나가거나 Hero 가 화면에서 사라지면 50:50 으로
  document.documentElement.addEventListener('mouseleave', () => set(false));
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) set(false);
    }).observe(hero);
  }

  const onReduceChange = () => {
    if (!enabled()) set(false);
  };
  if (reduceQuery.addEventListener) reduceQuery.addEventListener('change', onReduceChange);
})();
