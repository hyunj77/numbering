/* ==========================================================================
   Header — 스크롤 10px 이상이면 .is-scrolled (배경 검정 80%, CSS 전환 0.3초)
   - 상태가 바뀔 때만 클래스를 토글, 스크롤 이벤트는 passive + requestAnimationFrame 으로 묶어 처리
   - nav.js(햄버거 메뉴: .is-menu-open)와 클래스가 달라 서로 영향 없음
   ========================================================================== */
(() => {
  const SCROLL_THRESHOLD = 10; // px (tokens.css 의 --header-scroll-threshold 와 같은 값)

  const header = document.querySelector('.site-header');
  if (!header) return;

  let scrolled = null;
  let ticking = false;

  const update = () => {
    ticking = false;
    const next = window.scrollY >= SCROLL_THRESHOLD;
    if (next === scrolled) return;
    scrolled = next;
    header.classList.toggle('is-scrolled', next);
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('pageshow', update); // 뒤로가기(bfcache)로 돌아왔을 때
  update(); // 새로고침으로 중간 위치에서 시작한 경우
})();
