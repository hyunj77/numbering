/* ==========================================================================
   Nav — 햄버거 메뉴 (1199px 이하에서만 동작)
   ========================================================================== */
(() => {
  const header = document.querySelector('.site-header');
  const toggle = header && header.querySelector('[data-menu-toggle]');
  if (!toggle) return;

  const mq = window.matchMedia('(max-width: 1199px)');

  const setOpen = (open) => {
    header.classList.toggle('is-menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
  };

  toggle.addEventListener('click', () => {
    if (!mq.matches) return;
    setOpen(!header.classList.contains('is-menu-open'));
  });

  mq.addEventListener('change', () => setOpen(false));
})();
