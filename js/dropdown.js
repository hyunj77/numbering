/* ==========================================================================
   Dropdown — 헤더 드롭다운 열고 닫기 (사용자 지시, 시안 외)
   - [data-dd] 항목 안의 [data-dd-toggle] 을 누르면 .is-open 토글 (aria-expanded 같이). 한 번에 하나만 열림(다른 항목에 마우스를 올려도 클릭으로 연 패널은 닫힘)
   - GNB 와 마이페이지의 마우스 호버 / 키보드 포커스 열림은 CSS (css/sections/dropdown.css)
   - 바깥을 누르거나 Esc 를 누르면 닫힘 (Esc 는 눌렀던 버튼으로 포커스 복귀)
   - 언어: 선택지를 누르면 맨 위 "현재 선택" 문구가 바뀜 (화면 언어를 실제로 바꾸지는 않음 — 번역 콘텐츠 없음)
   - 검색: 열리면 입력칸에 포커스. 제출해도 이동하지 않음 (검색 결과 페이지 없음)
   - 햄버거 모드(1023px 이하)가 바뀌면 모두 닫음. 드로어 안에서는 하위 메뉴가 이미 펼쳐져 있어 눌러도 토글하지 않음(css 가 처리)
   ========================================================================== */
(() => {
  const hosts = Array.from(document.querySelectorAll('[data-dd]'));
  if (!hosts.length) return;

  const triggerOf = (host) => host.querySelector('[data-dd-toggle]');

  const setOpen = (host, open) => {
    host.classList.toggle('is-open', open);
    const trigger = triggerOf(host);
    if (trigger) trigger.setAttribute('aria-expanded', String(open));
  };

  const closeAll = (except) => {
    hosts.forEach((host) => {
      if (host !== except && host.classList.contains('is-open')) setOpen(host, false);
    });
  };

  hosts.forEach((host) => {
    // 마우스가 다른 메뉴 항목에 들어오면, 클릭으로 열어 둔 다른 패널은 닫음 (항상 하나만 열려 있게)
    host.addEventListener("pointerenter", (event) => {
      if (event.pointerType === "mouse") closeAll(host);
    });
    const trigger = triggerOf(host);
    if (!trigger) return;
    trigger.addEventListener('click', (event) => {
      // GNB 의 "#" 링크는 맨 위로 튀지 않게
      if (trigger.tagName === 'A' && trigger.getAttribute('href') === '#') event.preventDefault();
      if (window.matchMedia('(max-width: 1023px)').matches && host.closest('.gnb')) return; // 드로어: 이미 펼쳐져 있음
      const open = !host.classList.contains('is-open');
      closeAll(host);
      setOpen(host, open);
      if (open) {
        const input = host.querySelector('input');
        if (input) window.setTimeout(() => input.focus(), 0);
      }
    });
  });

  document.addEventListener('click', (event) => {
    if (!event.target.closest('[data-dd]')) closeAll();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    const open = hosts.find((host) => host.classList.contains('is-open'));
    if (!open) return;
    setOpen(open, false);
    const trigger = triggerOf(open);
    if (trigger) trigger.focus();
  });

  // 언어 선택
  document.querySelectorAll('[data-lang]').forEach((option) => {
    option.addEventListener('click', () => {
      const host = option.closest('[data-dd]');
      const current = host.querySelector('[data-lang-current]');
      if (current) current.textContent = option.dataset.lang;
      host.querySelectorAll('[data-lang]').forEach((o) => o.setAttribute('aria-selected', String(o === option)));
      setOpen(host, false);
    });
  });

  // 검색: 제출해도 이동하지 않음
  document.querySelectorAll('[data-search-form]').forEach((form) => {
    form.addEventListener('submit', (event) => event.preventDefault());
  });

  window.matchMedia('(max-width: 1023px)').addEventListener('change', () => closeAll());
})();
