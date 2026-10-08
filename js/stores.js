/* ==========================================================================
   Stores 슬라이더 — 매장 3개 순환 전환 (전환 효과 없이 즉시 변경)
   - 이전/다음 버튼: 메인 이미지, 세로 라벨, 번호, 매장 정보가 함께 바뀜
   - 오른쪽 "다음 매장" 미리보기: 항상 다음 순서 매장의 이미지
   - 03에서 다음 → 01, 01에서 이전 → 03
   ========================================================================== */
(() => {
  const STORES = [
    {
      label: 'SINSA FLAGSHIP',
      name: '신사 플래그십 스토어',
      address: '서울특별시 강남구 압구정로 10길 28',
      phone: '+82 70-4157-4356',
      hours: 'Monday - Sunday | 11:00am - 8:00pm',
      image: 'assets/images/stores/sinsa-flagship.jpg',
      alt: '나무 패널 벽과 유리 진열대가 놓인 신사 플래그십 스토어 내부',
    },
    {
      label: 'HANNAM FLAGSHIP',
      name: '한남 플래그십 스토어',
      address: '서울특별시 용산구 대사관로 5길 11',
      phone: '+82 70-4416-8883',
      hours: 'Monday - Sunday | 11:00am - 8:00pm',
      image: 'assets/images/stores/hannam-flagship.jpg',
      alt: '유리 진열대와 꽃이 놓인 테이블, 회색 벽면의 NUMBERING 간판이 보이는 한남 플래그십 스토어 입구',
    },
    {
      label: 'DOSAN FLAGSHIP',
      name: '도산 플래그십 스토어',
      address: '서울특별시 강남구 압구정로48길 38',
      phone: '+82 70-4132-5988',
      hours: 'Monday - Sunday | 11:00am - 8:00pm',
      image: 'assets/images/stores/dosan-flagship.jpg',
      alt: '그림자가 드리운 콘크리트 패널 외관의 도산 플래그십 스토어',
    },
  ];

  const $ = (selector) => document.querySelector(selector);
  const els = {
    image: $('[data-store-image]'),
    label: $('[data-store-label]'),
    number: $('[data-store-number]'),
    name: $('[data-store-name]'),
    address: $('[data-store-address]'),
    phone: $('[data-store-phone]'),
    hours: $('[data-store-hours]'),
    preview: $('[data-store-preview]'),
    prev: $('[data-store-prev]'),
    next: $('[data-store-next]'),
  };
  if (Object.values(els).some((el) => !el)) return;

  let current = 0;
  const total = STORES.length;

  // 전환 시 이미지가 비어 보이지 않도록 미리 불러옴
  STORES.forEach((store) => {
    new Image().src = store.image;
  });

  // 번호 "01 ." — 시안 구조(0 / 1␣ / . / ␣)와 같은 스팬 구성
  const renderNumber = (index) => {
    const spans = [
      ['0', ''],
      [`${index + 1} `, 'is-tight'],
      ['.', 'is-thin is-tight'],
      [' ', 'is-thin'],
    ];
    els.number.replaceChildren(
      ...spans.map(([text, className]) => {
        const span = document.createElement('span');
        span.textContent = text;
        if (className) span.className = className;
        return span;
      })
    );
  };

  const render = () => {
    const store = STORES[current];
    const upcoming = STORES[(current + 1) % total];

    els.image.src = store.image;
    els.image.alt = store.alt;
    els.label.textContent = ` ${store.label}`;
    renderNumber(current);
    els.name.textContent = store.name;
    els.address.textContent = store.address;
    els.phone.textContent = store.phone;
    els.hours.textContent = store.hours;
    els.preview.src = upcoming.image;
    els.preview.alt = upcoming.alt;
  };

  els.prev.addEventListener('click', () => {
    current = (current - 1 + total) % total;
    render();
  });

  els.next.addEventListener('click', () => {
    current = (current + 1) % total;
    render();
  });

  render();
})();
