/* ==========================================================================
   Nav — 햄버거 메뉴 드로어 (1023px 이하에서만 동작, 사용자 지시)
   - 햄버거를 누르면 헤더에 .is-menu-open → 오른쪽에서 드로어가 밀려 나옴 (css/sections/dropdown.css)
   - 닫기: × 버튼 / 바탕(어두운 가림막) 누르기 / Esc. 닫히면 햄버거로 포커스 복귀
   - 열려 있는 동안 페이지 스크롤을 잠금(html.is-scroll-locked). 화면이 1024px 이상이 되면 자동으로 닫음
   ========================================================================== */
(() => {
  const header = document.querySelector('.site-header');
  const toggle = header && header.querySelector('[data-menu-toggle]');
  if (!toggle) return;

  const mq = window.matchMedia('(max-width: 1023px)');
  const closeButton = header.querySelector('[data-menu-close].gnb__close');

  const setOpen = (open, restoreFocus = false) => {
    header.classList.toggle('is-menu-open', open);
    document.documentElement.classList.toggle('is-scroll-locked', open);
    toggle.setAttribute('aria-expanded', String(open));
    if (open && closeButton) window.setTimeout(() => closeButton.focus(), 0);
    if (!open && restoreFocus) toggle.focus();
  };

  toggle.addEventListener('click', () => {
    if (!mq.matches) return;
    setOpen(!header.classList.contains('is-menu-open'));
  });

  header.querySelectorAll('[data-menu-close]').forEach((el) => {
    el.addEventListener('click', () => setOpen(false, true));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && header.classList.contains('is-menu-open')) setOpen(false, true);
  });

  mq.addEventListener('change', () => setOpen(false));
})();
