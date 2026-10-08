(() => {
  const STORES = [
    {
      label: "SINSA FLAGSHIP",
      name: "\uC2E0\uC0AC \uD50C\uB798\uADF8\uC2ED \uC2A4\uD1A0\uC5B4",
      address: "\uC11C\uC6B8\uD2B9\uBCC4\uC2DC \uAC15\uB0A8\uAD6C \uC555\uAD6C\uC815\uB85C 10\uAE38 28",
      phone: "+82 70-4157-4356",
      hours: "Monday - Sunday | 11:00am - 8:00pm",
      image: "assets/images/stores/sinsa-flagship.jpg",
      alt: "\uB098\uBB34 \uD328\uB110 \uBCBD\uACFC \uC720\uB9AC \uC9C4\uC5F4\uB300\uAC00 \uB193\uC778 \uC2E0\uC0AC \uD50C\uB798\uADF8\uC2ED \uC2A4\uD1A0\uC5B4 \uB0B4\uBD80"
    },
    {
      label: "HANNAM FLAGSHIP",
      name: "\uD55C\uB0A8 \uD50C\uB798\uADF8\uC2ED \uC2A4\uD1A0\uC5B4",
      address: "\uC11C\uC6B8\uD2B9\uBCC4\uC2DC \uC6A9\uC0B0\uAD6C \uB300\uC0AC\uAD00\uB85C 5\uAE38 11",
      phone: "+82 70-4416-8883",
      hours: "Monday - Sunday | 11:00am - 8:00pm",
      image: "assets/images/stores/hannam-flagship.jpg",
      alt: "\uC720\uB9AC \uC9C4\uC5F4\uB300\uC640 \uAF43\uC774 \uB193\uC778 \uD14C\uC774\uBE14, \uD68C\uC0C9 \uBCBD\uBA74\uC758 NUMBERING \uAC04\uD310\uC774 \uBCF4\uC774\uB294 \uD55C\uB0A8 \uD50C\uB798\uADF8\uC2ED \uC2A4\uD1A0\uC5B4 \uC785\uAD6C"
    },
    {
      label: "DOSAN FLAGSHIP",
      name: "\uB3C4\uC0B0 \uD50C\uB798\uADF8\uC2ED \uC2A4\uD1A0\uC5B4",
      address: "\uC11C\uC6B8\uD2B9\uBCC4\uC2DC \uAC15\uB0A8\uAD6C \uC555\uAD6C\uC815\uB85C48\uAE38 38",
      phone: "+82 70-4132-5988",
      hours: "Monday - Sunday | 11:00am - 8:00pm",
      image: "assets/images/stores/dosan-flagship.jpg",
      alt: "\uADF8\uB9BC\uC790\uAC00 \uB4DC\uB9AC\uC6B4 \uCF58\uD06C\uB9AC\uD2B8 \uD328\uB110 \uC678\uAD00\uC758 \uB3C4\uC0B0 \uD50C\uB798\uADF8\uC2ED \uC2A4\uD1A0\uC5B4"
    }
  ];
  const $ = (selector) => document.querySelector(selector);
  const els = {
    image: $("[data-store-image]"),
    label: $("[data-store-label]"),
    number: $("[data-store-number]"),
    name: $("[data-store-name]"),
    address: $("[data-store-address]"),
    phone: $("[data-store-phone]"),
    hours: $("[data-store-hours]"),
    preview: $("[data-store-preview]"),
    prev: $("[data-store-prev]"),
    next: $("[data-store-next]")
  };
  if (Object.values(els).some((el) => !el)) return;
  let current = 0;
  const total = STORES.length;
  const rootStyle = getComputedStyle(document.documentElement);
  const token = (name, fallback) => {
    const value = parseFloat(rootStyle.getPropertyValue(name));
    return Number.isFinite(value) ? value : fallback;
  };
  const SLIDE_MS = token("--stores-slide-ms", 500);
  const SHIFT = token("--stores-slide-shift", 28);
  const reduceQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  STORES.forEach((store) => {
    new Image().src = store.image;
  });
  const renderNumber = (index) => {
    const spans = [
      ["0", ""],
      [`${index + 1} `, "is-tight"],
      [".", "is-thin is-tight"],
      [" ", "is-thin"]
    ];
    els.number.replaceChildren(
      ...spans.map(([text, className]) => {
        const span = document.createElement("span");
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
  const slideIn = (direction) => {
    if (reduceQuery.matches || !els.image.animate) return;
    const targets = [
      [els.image, 1, 0],
      [els.preview, 1, 60],
      [els.label.closest(".store-card__indicator"), 0.6, 80],
      [els.name, 0.6, 100],
      [els.address, 0.6, 150],
      [els.phone, 0.6, 200],
      [els.hours, 0.6, 250]
    ];
    targets.forEach(([el, scale, delay]) => {
      el.getAnimations().forEach((animation) => animation.cancel());
      el.animate(
        [
          { opacity: 0, transform: `translateX(${direction * SHIFT * scale}px)` },
          { opacity: 1, transform: "translateX(0)" }
        ],
        { duration: SLIDE_MS, delay, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "backwards" }
      );
    });
  };
  els.prev.addEventListener("click", () => {
    current = (current - 1 + total) % total;
    render();
    slideIn(-1);
  });
  els.next.addEventListener("click", () => {
    current = (current + 1) % total;
    render();
    slideIn(1);
  });
  render();
})();
