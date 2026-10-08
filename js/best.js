(() => {
  const ASSET = "assets/images/best/";
  const DESCRIBED = {
    1: ["product-1.png", "\uD770\uC0C9 \uD050\uBE45\uC774 \uC138\uD305\uB41C \uC2ED\uC790\uAC00 \uD39C\uB358\uD2B8 \uC740 \uBAA9\uAC78\uC774"],
    2: ["product-3.png", "\uB465\uADFC \uB9C1 \uC138 \uAC1C\uAC00 \uACB9\uCCD0\uC9C4 \uD39C\uB358\uD2B8\uC758 \uC740 \uBAA9\uAC78\uC774"],
    3: ["product-2.png", "\uD50C\uB808\uC774\uD2B8 \uC7A5\uC2DD\uC774 \uC788\uB294 \uC740\uC0C9 \uB9C1\uD06C \uCCB4\uC778 \uD314\uCC0C"],
    4: ["product-4.png", "\uD130\uD0A4\uC11D \uBE5B \uC2A4\uD1A4\uC73C\uB85C \uB9CC\uB4E0 \uC791\uC740 \uC2ED\uC790\uAC00 \uD39C\uB358\uD2B8 \uC740 \uBAA9\uAC78\uC774"]
  };
  const NUMBERS = [
    "#3729",
    "#5738",
    "#1909",
    "#3719",
    "#1901",
    "#3413",
    "#3713_White",
    "#1057",
    "#1050",
    "#7700",
    "#3602",
    "#3414",
    "#3910 (2mm)",
    "#3702",
    "#7780",
    "#5116",
    "#3313",
    "#7791",
    "#8590",
    "#3726"
  ];
  const RING = NUMBERS.map((label, i) => {
    const rank = i + 1;
    const described = DESCRIBED[rank];
    return {
      rank,
      label,
      src: ASSET + (described ? described[0] : `top20-${String(rank).padStart(2, "0")}.jpg`),
      alt: described ? described[1] : `NUMBERING BEST TOP20 ${rank}\uC704 \uC0C1\uD488 ${label}`
    };
  });
  const products = document.querySelector(".best__products");
  const cards = products && products.querySelector(".best__cards");
  const prevBtn = products && products.querySelector(".best__prev");
  if (!products || !cards || !prevBtn) return;
  const ghosts = [...cards.querySelectorAll(":scope > .product-card")];
  if (ghosts.length !== 4) return;
  const total = RING.length;
  const mod = (n) => (n % total + total) % total;
  const desktop = window.matchMedia("(min-width: 1200px)");
  const durationValue = getComputedStyle(document.documentElement).getPropertyValue("--best-slide-duration").trim();
  const duration = durationValue.endsWith("ms") ? parseFloat(durationValue) : parseFloat(durationValue) * 1e3 || 400;
  const makeCard = (item, extra = false) => {
    const li = document.createElement("li");
    li.className = `product-card${extra ? " product-card--extra" : ""}`;
    const a = document.createElement("a");
    a.className = "product-card__link";
    a.href = "#";
    const box = document.createElement("div");
    box.className = "product-card__image";
    const img = document.createElement("img");
    img.src = item.src;
    img.alt = item.alt;
    img.draggable = false;
    if (extra) img.loading = "lazy";
    box.append(img);
    const label = document.createElement("p");
    label.className = "product-card__label";
    const rank = document.createElement("span");
    rank.className = "product-card__rank";
    rank.textContent = `TOP${item.rank}`;
    const no = document.createElement("span");
    no.textContent = item.label;
    label.append(rank, no);
    a.append(box, label);
    li.append(a);
    return li;
  };
  ghosts.forEach((li, i) => li.replaceChildren(...makeCard(RING[i]).childNodes));
  RING.slice(4).forEach((item) => cards.append(makeCard(item, true)));
  cards.classList.add("is-slider");
  const track = document.createElement("ul");
  track.className = "best__track";
  products.insertBefore(track, prevBtn);
  let start = total - 1;
  let busy = false;
  let pending = false;
  let slots = null;
  const measure = () => {
    const base = products.getBoundingClientRect();
    const r = ghosts.map((g) => {
      const b = g.getBoundingClientRect();
      const imgH = g.querySelector(".product-card__image").getBoundingClientRect().height;
      return { left: b.left - base.left, width: b.width, h: imgH };
    });
    const gap = r[1].left - (r[0].left + r[0].width);
    slots = [
      { left: -r[0].width, width: r[0].width, h: r[0].h },
      // 0: 화면 왼쪽 밖 (들어오는 카드)
      ...r,
      // 1~4: 보이는 칸
      { left: r[3].left + r[3].width + gap, width: r[3].width, h: r[3].h }
      // 5: 오른쪽 밖 (나가는 카드)
    ];
    track.style.width = `${cards.getBoundingClientRect().right - base.left}px`;
  };
  const place = (card) => {
    const s = slots[Number(card.dataset.slot)];
    card.style.left = `${s.left}px`;
    card.style.width = `${s.width}px`;
    card.style.setProperty("--card-img-h", `${s.h}px`);
  };
  const relayout = () => {
    if (!desktop.matches) return;
    measure();
    const list = [...track.children];
    list.forEach((c) => c.classList.add("is-instant"));
    list.forEach(place);
    track.getBoundingClientRect();
    list.forEach((c) => c.classList.remove("is-instant"));
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
    const incomingIdx = mod(start + 4);
    const incoming = makeCard(RING[incomingIdx]);
    incoming.dataset.slot = "5";
    incoming.classList.add("is-instant");
    place(incoming);
    track.append(incoming);
    try {
      await incoming.querySelector("img").decode();
    } catch {
    }
    incoming.getBoundingClientRect();
    incoming.classList.remove("is-instant");
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
  const scrollNext = () => {
    const list = [...cards.querySelectorAll(":scope > .product-card")];
    const base = cards.getBoundingClientRect().left;
    const padStart = parseFloat(getComputedStyle(cards).scrollPaddingInlineStart) || 0;
    const lefts = list.map((c) => c.getBoundingClientRect().left - base + cards.scrollLeft - padStart);
    const current = cards.scrollLeft;
    const max = cards.scrollWidth - cards.clientWidth;
    const go = (left) => window.NumberingSlide ? window.NumberingSlide(cards, left) : cards.scrollTo({ left, behavior: "smooth" });
    if (current >= max - 2) {
      go(0);
      return;
    }
    let i = lefts.findIndex((l) => l >= current - 2);
    if (i === -1) i = list.length - 1;
    const target = Math.min(i + 1, list.length - 1);
    go(Math.max(0, Math.min(max, lefts[target])));
  };
  prevBtn.addEventListener("click", () => {
    if (desktop.matches) slideNext();
    else scrollNext();
    scheduleAutoplay();
  });
  const autoplayValue = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--best-autoplay-ms"));
  const AUTOPLAY_MS = Number.isFinite(autoplayValue) ? autoplayValue : 1500;
  const reduceQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const hold = { hover: false, focus: false, hidden: document.hidden, offscreen: true };
  let autoplayTimer = 0;
  const mobile = window.matchMedia("(max-width: 767px)");
  const mobileValue = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--best-autoplay-mobile-ms"));
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
  products.addEventListener("pointerenter", (event) => {
    if (event.pointerType !== "mouse") return;
    hold.hover = true;
    scheduleAutoplay();
  });
  products.addEventListener("pointerleave", (event) => {
    if (event.pointerType !== "mouse") return;
    hold.hover = false;
    scheduleAutoplay();
  });
  products.addEventListener("focusin", (event) => {
    hold.focus = event.target.matches(":focus-visible");
    scheduleAutoplay();
  });
  products.addEventListener("focusout", () => {
    hold.focus = false;
    scheduleAutoplay();
  });
  cards.addEventListener("touchstart", () => {
    hold.touch = true;
    scheduleAutoplay();
  }, { passive: true });
  ["touchend", "touchcancel"].forEach((name) => cards.addEventListener(name, () => {
    hold.touch = false;
    scheduleAutoplay();
  }, { passive: true }));
  mobile.addEventListener("change", scheduleAutoplay);
  document.addEventListener("visibilitychange", () => {
    hold.hidden = document.hidden;
    scheduleAutoplay();
  });
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(
      (entries) => {
        hold.offscreen = !entries[0].isIntersecting;
        scheduleAutoplay();
      },
      { threshold: 0.3 }
    ).observe(products);
  }
  desktop.addEventListener("change", scheduleAutoplay);
  if (reduceQuery.addEventListener) reduceQuery.addEventListener("change", scheduleAutoplay);
  if ("ResizeObserver" in window) {
    new ResizeObserver(() => {
      if (busy) pending = true;
      else relayout();
    }).observe(products);
  }
  desktop.addEventListener("change", relayout);
  build();
  window.addEventListener("load", () => {
    window.setTimeout(() => RING.forEach((item) => {
      new Image().src = item.src;
    }), 300);
  });
})();
