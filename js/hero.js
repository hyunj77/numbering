/* ==========================================================================
   Hero — 마우스를 Hero 오른쪽 절반에 올리면 두 사진 비율이 50:50 → 40:60 으로 부드럽게 바뀜 (사용자 지시, 시안 외 효과)
   - 실제 전환(0.5초)은 CSS: .hero__bg 의 grid-template-columns transition (css/sections/hero.css)
   - 여기서는 마우스가 Hero 오른쪽 절반 안에 있는지만 보고 .hero__bg 에 .is-right-hover 를 켜고 끔
   - 사진은 .hero__bg 위에 겹친 내용(헤더·문구)보다 아래라서 :hover 를 직접 쓸 수 없어 JS 로 위치를 판별
   - 마우스가 없는 기기(터치)와 prefers-reduced-motion: reduce 에서는 동작하지 않음
   - [모바일·태블릿 1199px 이하] 사진이 한 장씩 옆으로 넘어가는 슬라이드(CSS 스크롤 스냅)이고, 사용자가 직접 넘길 수 있는 데 더해 **2.5초마다 자동으로 다음 사진**으로 넘어감
     (마지막 다음은 처음으로). 손가락이 닿아 있는 동안·Hero 가 화면 밖일 때·탭이 숨겨졌을 때는 멈추고, 풀리면 2.5초 뒤 다시 시작. 모션 줄이기면 자동 넘김 없음
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
      hold.offscreen = !entries[0].isIntersecting;
      scheduleAutoplay();
    }).observe(hero);
  }

  const onReduceChange = () => {
    if (!enabled()) set(false);
    scheduleAutoplay();
  };
  if (reduceQuery.addEventListener) reduceQuery.addEventListener('change', onReduceChange);

  // ---------- 모바일 자동 넘김 (사용자 지시) ----------
  const mobileQuery = window.matchMedia('(max-width: 1199px)'); // 모바일 + 태블릿
  const autoplayValue = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hero-autoplay-ms'));
  const AUTOPLAY_MS = Number.isFinite(autoplayValue) ? autoplayValue : 2500;
  const slides = Array.from(bg.querySelectorAll('.hero__bg-col'));
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
        const left = ((index + 1) % slides.length) * width;
        if (window.NumberingSlide) window.NumberingSlide(bg, left);
        else bg.scrollTo({ left, behavior: 'smooth' });
      }
      scheduleAutoplay();
    }, AUTOPLAY_MS);
  }

  // 손가락이 닿아 있는 동안 멈춤, 떼면 2.5초 뒤 다시 시작
  bg.addEventListener('touchstart', () => { hold.touch = true; scheduleAutoplay(); }, { passive: true });
  ['touchend', 'touchcancel'].forEach((name) => bg.addEventListener(name, () => { hold.touch = false; scheduleAutoplay(); }, { passive: true }));
  document.addEventListener('visibilitychange', () => { hold.hidden = document.hidden; scheduleAutoplay(); });
  mobileQuery.addEventListener('change', scheduleAutoplay);
  scheduleAutoplay();
})();
