/* ==========================================================================
   SNS 슬라이더 — 인스타그램 12장, 항상 3칸(363 / 472 / 363) 표시
   - 다음: 한 칸씩 왼쪽으로, 이전: 반대. 끝에서 순환. 슬라이드 0.4초(CSS 변수)
   - 칸(slot): 0 왼쪽 / 1 가운데(큼) / 2 오른쪽. -1, 3 은 화면 밖 대기 위치
   - 이동 중(busy)에는 추가 입력을 무시해 순서가 꼬이지 않게 함
   - 모바일(<768px): 터치 스와이프 [추정]
   ========================================================================== */
(() => {
  const DIR = 'assets/images/sns/numbering_official/';
  // 최신 → 오래된 순 (게시물 번호 1 = 가장 최신)
  const FILES = [
    'numbering_official_1791364992_4002581986945938166_5563404703_1.jpg',
    'numbering_official_1791014402_3998921578750579560_5563404703_1.jpg',
    'numbering_official_1790820002_3997499449681285047_5563404703_1.jpg',
    'numbering_official_1790323209_3991676278621198345_5563404703_1.jpg',
    'numbering_official_1790150401_3991675700830620612_5563404703_1.jpg',
    'numbering_official_1789981899_3990979892917487614_5563404703_1.jpg',
    'numbering_official_1789718402_3988575813385717823_5563404703_1.jpg',
    'numbering_official_1789545065_3987315463411632318_5563404703_1.jpg',
    'numbering_official_1789374829_3985887417948813061_5563404703_1.jpg',
    'numbering_official_1789113601_3983516716202151655_5563404703_1.jpg',
    'numbering_official_1789005606_3982790150685937663_5563404703_1.jpg',
    'numbering_official_1788943008_3982265046818513338_5563404703_1.jpg',
  ];
  const SWIPE_MIN_PX = 40; // [추정]

  const viewport = document.querySelector('[data-sns-viewport]');
  const prev = document.querySelector('[data-sns-prev]');
  const next = document.querySelector('[data-sns-next]');
  if (!viewport || !prev || !next) return;

  const total = FILES.length;
  const mod = (n) => ((n % total) + total) % total;
  const isMobile = window.matchMedia('(max-width: 767px)');

  const durationValue = getComputedStyle(document.documentElement)
    .getPropertyValue('--sns-slide-duration')
    .trim();
  const duration = durationValue.endsWith('ms')
    ? parseFloat(durationValue)
    : parseFloat(durationValue) * 1000 || 400;

  // 왼쪽 칸(slot 0)에 있는 이미지 번호. 처음에는 가운데 = 최신(0), 왼쪽 = 순환상 이전(가장 오래된 11), 오른쪽 = 1
  // (index.html 의 처음 3장과 같아야 함)
  let index = total - 1;
  let busy = false;

  // 이동 중 빈 칸이 생기지 않도록 미리 불러옴
  FILES.forEach((file) => {
    new Image().src = DIR + file;
  });

  const makePhoto = (item, slot) => {
    const figure = document.createElement('figure');
    figure.className = 'sns__photo is-instant';
    figure.dataset.slot = slot;
    const img = document.createElement('img');
    img.src = DIR + FILES[item];
    img.alt = `NUMBERING 인스타그램 게시물 ${item + 1}`;
    img.draggable = false;
    figure.append(img);
    return figure;
  };

  // dir: +1 다음(왼쪽으로 이동) / -1 이전
  const move = (dir) => {
    if (busy) return;
    busy = true;

    // 들어올 이미지를 화면 밖 대기 위치에 효과 없이 놓음
    const incoming = makePhoto(dir > 0 ? mod(index + 3) : mod(index - 1), dir > 0 ? 3 : -1);
    viewport.append(incoming);
    incoming.getBoundingClientRect(); // 대기 위치 확정(reflow)
    incoming.classList.remove('is-instant');

    // 모든 이미지를 한 칸 이동 (크기 변화도 같은 transition 으로 함께 진행)
    viewport.querySelectorAll('.sns__photo').forEach((photo) => {
      photo.dataset.slot = Number(photo.dataset.slot) - dir;
    });
    index = mod(index + dir);

    // 화면 밖으로 나간 이미지 제거 후 입력 허용
    const leavingSlot = dir > 0 ? -1 : 3;
    window.setTimeout(() => {
      viewport.querySelectorAll(`.sns__photo[data-slot="${leavingSlot}"]`).forEach((photo) => photo.remove());
      busy = false;
    }, duration);
  };

  prev.addEventListener('click', () => move(-1));
  next.addEventListener('click', () => move(1));

  // 모바일 터치 스와이프: 왼쪽으로 밀면 다음, 오른쪽으로 밀면 이전
  let startX = null;
  let startY = null;

  viewport.addEventListener(
    'touchstart',
    (event) => {
      if (!isMobile.matches) return;
      startX = event.touches[0].clientX;
      startY = event.touches[0].clientY;
    },
    { passive: true }
  );

  viewport.addEventListener(
    'touchend',
    (event) => {
      if (startX === null) return;
      const dx = event.changedTouches[0].clientX - startX;
      const dy = event.changedTouches[0].clientY - startY;
      startX = null;
      startY = null;
      if (Math.abs(dx) >= SWIPE_MIN_PX && Math.abs(dx) > Math.abs(dy)) move(dx < 0 ? 1 : -1);
    },
    { passive: true }
  );

  viewport.addEventListener('touchcancel', () => {
    startX = null;
    startY = null;
  });
})();
