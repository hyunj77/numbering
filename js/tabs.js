/* ==========================================================================
   Collection 탭 — 활성 표시(흰색/회색)만 전환, 내용은 그대로
   ========================================================================== */
(() => {
  const tabs = document.querySelectorAll('.collection__tab');
  if (!tabs.length) return;

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => {
        const active = t === tab;
        t.classList.toggle('is-active', active);
        t.setAttribute('aria-pressed', String(active));
      });
    });
  });
})();
