/* ==========================================================================
   BEST 슬라이더 — ← 버튼을 누르면 카드가 한 칸씩 움직임 (사용자 지시, 시안 외)
   - TOP20 20장을 TOP1 → TOP20 순서로 두고 순환. 각 사진에 "TOP1  #3729" 같은 순위+번호 라벨
   - ≥1200px: 처음 화면은 [TOP20(왼쪽 잘린 칸, 라벨 빈칸) · TOP1 · TOP2 · TOP3].
     ← 를 누르면 카드가 왼쪽으로 한 칸 이동(다음 순위가 오른쪽에서 들어오고 맨 왼쪽 카드는 나감), 0.4초.
     왼쪽 잘린 칸(칸 1)의 라벨은 시안처럼 비우고, 그 칸으로 들어가는 카드의 라벨은 서서히 사라짐.
     이동 중에는 추가 클릭을 무시해 순서가 꼬이지 않게 함
   - 자동 넘김(≥1200px): 3초마다 ← 를 누른 것처럼 한 칸. 마우스를 올리거나 포커스가 있을 때, 탭이 숨겨졌거나 BEST 가 안 보일 때,
     모션 줄이기 설정일 때는 멈추고, 풀리면 3초를 처음부터 다시 셈. 직접 눌러도 3초를 다시 셈
   - ≤1199px: 가로 스와이프 스트립에 TOP1~TOP20 을 모두 두고, ← 버튼은 한 장 뒤로 스크롤(맨 끝이면 맨 앞으로) [추정]
   - 번호는 numberingwebsite.com TOP20 페이지 기준
   ========================================================================== */
(() => {
  const ASSET = 'assets/images/best/';
  // 순위(TOP1~20) 순서. src 는 순위별 사진 파일, alt 는 사진 설명(앞 4장) 또는 순위+번호
  const DESCRIBED = {
    1: ['product-1.png', '흰색 큐빅이 세팅된 십자가 펜던트 은 목걸이'],
    2: ['product-3.png', '둥근 링 세 개가 겹쳐진 펜던트의 은 목걸이'],
    3: ['product-2.png', '플레이트 장식이 있는 은색 링크 체인 팔찌'],
    4: ['product-4.png', '터키석 빛 스톤으로 만든 작은 십자가 펜던트 은 목걸이'],
  };
  const NUMBERS = [
    '#3729', '#5738', '#1909', '#3719', '#1901', '#3413', '#3713_White', '#1057', '#1050', '#7700',
    '#3602', '#3414', '#3910 (2mm)', '#3702', '#7780', '#5116', '#3313', '#7791', '#8590', '#3726',
  ];
  const RING = NUMBERS.map((label, i) => {
    const rank = i + 1;
    const described = DESCRIBED[rank];
    return {
      rank,
      label,
      src: ASSET + (described ? described[0] : `top20-${String(rank).padStart(2, '0')}.jpg`),
      alt: described ? described[1] : `NUMBERING BEST TOP20 ${rank}위 상품 ${label}`,
    };
  });

  const products = document.querySelector('.best__products');
  const cards = products && products.querySelector('.best__cards');
  const prevBtn = products && products.querySelector('.best__prev');
  if (!products || !cards || !prevBtn) return;

  const ghosts = [...cards.querySelectorAll(':scope > .product-card')]; // 시안의 4칸 (레이아웃 기준, 스트립에서는 TOP1~4)
  if (ghosts.length !== 4) return;

  const total = RING.length;
  const mod = (n) => ((n % total) + total) % total;
  const desktop = window.matchMedia('(min-width: 1200px)');

  const durationValue = getComputedStyle(document.documentElement).getPropertyValue('--best-slide-duration').trim();
  const duration = durationValue.endsWith('ms') ? parseFloat(durationValue) : parseFloat(durationValue) * 1000 || 400;

  const makeCard = (item, extra = false) => {
    const li = document.createElement('li');
    li.className = `product-card${extra ? ' product-card--extra' : ''}`;
    const a = document.createElement('a');
    a.className = 'product-card__link';
    a.href = '#';
    const box = document.createElement('div');
    box.className = 'product-card__image';
    const img = document.createElement('img');
    img.src = item.src;
    img.alt = item.alt;
    img.draggable = false;
    if (extra) img.loading = 'lazy';
    box.append(img);
    const label = document.createElement('p');
    label.className = 'product-card__label';
    const rank = document.createElement('span');
    rank.className = 'product-card__rank';
    rank.textContent = `TOP${item.rank}`;
    const no = document.createElement('span');
    no.textContent = item.label;
    label.append(rank, no);
    a.append(box, label);
    li.append(a);
    return li;
  };

  // ---------- 스트립(≤1199px): 시안의 4칸을 TOP1~4 로, 나머지 TOP5~20 을 뒤에 (데스크톱에서는 CSS 로 숨김) ----------
  ghosts.forEach((li, i) => li.replaceChildren(...makeCard(RING[i]).childNodes));
  RING.slice(4).forEach((item) => cards.append(makeCard(item, true)));

  // ---------- 데스크톱(≥1200px) 슬라이더 ----------
  cards.classList.add('is-slider');
  const track = document.createElement('ul');
  track.className = 'best__track';
  products.insertBefore(track, prevBtn);

  let start = total - 1; // 칸 1(왼쪽 잘린 칸)에 있는 항목의 RING 번호 = TOP20. 이어서 TOP1, TOP2, TOP3
  let busy = false;
  let pending = false; // 이동 중 창 크기가 바뀐 경우
  let slots = null;

  // 유령 카드의 실제 칸 위치/크기를 측정 (시안의 flex 규칙이 그대로 계산해 줌)
  const measure = () => {
    const base = products.getBoundingClientRect();
    const r = ghosts.map((g) => {
      const b = g.getBoundingClientRect();
      // 사진 높이도 같이 잼: 창이 좁아지면 카드 폭에 맞춰 줄어들어(사진 비율 유지) 칸마다 다름
      const imgH = g.querySelector('.product-card__image').getBoundingClientRect().height;
      return { left: b.left - base.left, width: b.width, h: imgH };
    });
    const gap = r[1].left - (r[0].left + r[0].width);
    slots = [
      { left: -r[0].width, width: r[0].width, h: r[0].h }, // 0: 화면 왼쪽 밖 (들어오는 카드)
      ...r, // 1~4: 보이는 칸
      { left: r[3].left + r[3].width + gap, width: r[3].width, h: r[3].h }, // 5: 오른쪽 밖 (나가는 카드)
    ];
    track.style.width = `${cards.getBoundingClientRect().right - base.left}px`;
  };

  const place = (card) => {
    const s = slots[Number(card.dataset.slot)];
    card.style.left = `${s.left}px`;
    card.style.width = `${s.width}px`;
    card.style.setProperty('--card-img-h', `${s.h}px`);
  };

  const relayout = () => {
    if (!desktop.matches) return;
    measure();
    const list = [...track.children];
    list.forEach((c) => c.classList.add('is-instant'));
    list.forEach(place);
    track.getBoundingClientRect(); // 효과 없이 위치 확정(reflow)
    list.forEach((c) => c.classList.remove('is-instant'));
  };

  const build = () => {
    track.replaceChildren();
    for (let i = 0; i < 4; i++) {
      const card = makeCard(RING[mod(start + i)]);
      card.dataset.slot = String(i + 1);
      track.append(card);
    }
    relayout();
  };

  const slideNext = async () => {
    if (busy || !desktop.matches) return;
    busy = true;

    // 들어올 카드(다음 순위)를 화면 오른쪽 밖(칸 5)에 효과 없이 놓음
    const incomingIdx = mod(start + 4);
    const incoming = makeCard(RING[incomingIdx]);
    incoming.dataset.slot = '5';
    incoming.classList.add('is-instant');
    place(incoming);
    track.append(incoming);
    try {
      await incoming.querySelector('img').decode(); // 이미지가 준비된 뒤 이동 시작 (이동 중 빈 칸 방지)
    } catch {
      /* 디코드 실패해도 이동은 진행 */
    }
    incoming.getBoundingClientRect();
    incoming.classList.remove('is-instant');

    // 모든 카드를 한 칸씩 왼쪽으로 (폭/높이 변화, 라벨 나타남/사라짐도 같은 transition)
    [...track.children].forEach((c) => {
      c.dataset.slot = String(Number(c.dataset.slot) - 1);
      place(c);
    });
    start = mod(start + 1);

    window.setTimeout(() => {
      track.querySelectorAll('.product-card[data-slot="0"]').forEach((c) => c.remove());
      busy = false;
      if (pending) {
        pending = false;
        relayout();
      }
    }, duration);
  };

  // ---------- 스트립(≤1199px): 한 장 뒤로 스크롤 (맨 끝이면 맨 앞으로) ----------
  const scrollNext = () => {
    const list = [...cards.querySelectorAll(':scope > .product-card')];
    const base = cards.getBoundingClientRect().left;
    // 스냅(scroll-snap-align: start)은 카드 왼쪽 가장자리를 (scroll-padding 만큼 띄워) 맞춤: 카드의 스크롤 좌표 = 카드 왼쪽 위치 − scroll-padding
    const padStart = parseFloat(getComputedStyle(cards).scrollPaddingInlineStart) || 0;
    const lefts = list.map((c) => c.getBoundingClientRect().left - base + cards.scrollLeft - padStart);
    const current = cards.scrollLeft;
    const max = cards.scrollWidth - cards.clientWidth;
    const go = (left) => (window.NumberingSlide ? window.NumberingSlide(cards, left) : cards.scrollTo({ left, behavior: 'smooth' }));
    if (current >= max - 2) {
      go(0); // 맨 끝이면 맨 앞으로
      return;
    }
    let i = lefts.findIndex((l) => l >= current - 2); // 지금 맨 앞에 보이는 카드
    if (i === -1) i = list.length - 1;
    const target = Math.min(i + 1, list.length - 1);
    go(Math.max(0, Math.min(max, lefts[target])));
  };

  prevBtn.addEventListener('click', () => {
    if (desktop.matches) slideNext();
    else scrollNext();
    scheduleAutoplay(); // 직접 누르면 3초를 처음부터 다시 셈
  });

  // ---------- 자동 넘김 (≥1200px 슬라이더만): 3초마다 ←를 누른 것처럼 한 칸 (사용자 지시) ----------
  // 멈추는 경우: 마우스가 상품 영역 위에 있을 때 / 키보드 포커스가 안에 있을 때 / 탭이 숨겨졌을 때 /
  //             BEST 가 화면에 안 보일 때 / 모션 줄이기 설정 / 1200px 미만(스트립). 조건이 풀리면 3초를 처음부터 다시 셈
  const autoplayValue = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--best-autoplay-ms'));
  const AUTOPLAY_MS = Number.isFinite(autoplayValue) ? autoplayValue : 1500;
  const reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const hold = { hover: false, focus: false, hidden: document.hidden, offscreen: true };
  let autoplayTimer = 0;

  // [사용자 지시] 모바일(≤767px)은 사진 한 장씩 보이는 스트립이 자동으로 넘어감(간격 --best-autoplay-mobile-ms). 태블릿(768~1199px)은 자동 넘김 없음
  const mobile = window.matchMedia('(max-width: 767px)');
  const mobileValue = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--best-autoplay-mobile-ms'));
  const AUTOPLAY_MOBILE_MS = Number.isFinite(mobileValue) ? mobileValue : 2500;
  hold.touch = false;
  const canAutoplay = () => (desktop.matches || mobile.matches) && !reduceQuery.matches && !hold.hover && !hold.focus && !hold.hidden && !hold.offscreen && !hold.touch;

  function scheduleAutoplay() {
    window.clearTimeout(autoplayTimer);
    autoplayTimer = 0;
    if (!canAutoplay()) return;
    autoplayTimer = window.setTimeout(() => {
      autoplayTimer = 0;
      if (canAutoplay()) {
        if (desktop.matches) slideNext();
        else scrollNext();
      }
      scheduleAutoplay();
    }, desktop.matches ? AUTOPLAY_MS : AUTOPLAY_MOBILE_MS);
  }

  products.addEventListener('pointerenter', (event) => {
    if (event.pointerType !== 'mouse') return;
    hold.hover = true;
    scheduleAutoplay();
  });
  products.addEventListener('pointerleave', (event) => {
    if (event.pointerType !== 'mouse') return;
    hold.hover = false;
    scheduleAutoplay();
  });
  products.addEventListener('focusin', (event) => {
    // 마우스로 클릭해서 생긴 포커스는 무시(그러면 클릭 한 번에 자동 넘김이 영영 멈춤). 키보드 포커스(:focus-visible)일 때만 멈춤
    hold.focus = event.target.matches(':focus-visible');
    scheduleAutoplay();
  });
  products.addEventListener('focusout', () => {
    hold.focus = false;
    scheduleAutoplay();
  });
  // 손가락이 닿아 있는 동안 멈춤, 떼면 간격을 다시 셈
  cards.addEventListener('touchstart', () => { hold.touch = true; scheduleAutoplay(); }, { passive: true });
  ['touchend', 'touchcancel'].forEach((name) => cards.addEventListener(name, () => { hold.touch = false; scheduleAutoplay(); }, { passive: true }));
  mobile.addEventListener('change', scheduleAutoplay);
  document.addEventListener('visibilitychange', () => {
    hold.hidden = document.hidden;
    scheduleAutoplay();
  });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(
      (entries) => {
        hold.offscreen = !entries[0].isIntersecting;
        scheduleAutoplay();
      },
      { threshold: 0.3 }
    ).observe(products);
  }
  desktop.addEventListener('change', scheduleAutoplay);
  if (reduceQuery.addEventListener) reduceQuery.addEventListener('change', scheduleAutoplay);

  if ('ResizeObserver' in window) {
    new ResizeObserver(() => {
      if (busy) pending = true;
      else relayout();
    }).observe(products);
  }
  desktop.addEventListener('change', relayout);

  build();

  // 이동할 때 빈 칸이 생기지 않도록 나머지 사진을 미리 불러옴
  window.addEventListener('load', () => {
    window.setTimeout(() => RING.forEach((item) => { new Image().src = item.src; }), 300);
  });
})();
