(() => {
  const DIR = "assets/images/sns/numbering_official/";
  const FILES = [
    "numbering_official_1791364992_4002581986945938166_5563404703_1.jpg",
    "numbering_official_1791014402_3998921578750579560_5563404703_1.jpg",
    "numbering_official_1790820002_3997499449681285047_5563404703_1.jpg",
    "numbering_official_1790323209_3991676278621198345_5563404703_1.jpg",
    "numbering_official_1790150401_3991675700830620612_5563404703_1.jpg",
    "numbering_official_1789981899_3990979892917487614_5563404703_1.jpg",
    "numbering_official_1789718402_3988575813385717823_5563404703_1.jpg",
    "numbering_official_1789545065_3987315463411632318_5563404703_1.jpg",
    "numbering_official_1789374829_3985887417948813061_5563404703_1.jpg",
    "numbering_official_1789113601_3983516716202151655_5563404703_1.jpg",
    "numbering_official_1789005606_3982790150685937663_5563404703_1.jpg",
    "numbering_official_1788943008_3982265046818513338_5563404703_1.jpg"
  ];
  const SWIPE_MIN_PX = 40;
  const viewport = document.querySelector("[data-sns-viewport]");
  const prev = document.querySelector("[data-sns-prev]");
  const next = document.querySelector("[data-sns-next]");
  if (!viewport || !prev || !next) return;
  const total = FILES.length;
  const mod = (n) => (n % total + total) % total;
  const isMobile = window.matchMedia("(max-width: 767px)");
  const durationValue = getComputedStyle(document.documentElement).getPropertyValue("--sns-slide-duration").trim();
  const duration = durationValue.endsWith("ms") ? parseFloat(durationValue) : parseFloat(durationValue) * 1e3 || 400;
  let index = total - 1;
  let busy = false;
  FILES.forEach((file) => {
    new Image().src = DIR + file;
  });
  const makePhoto = (item, slot) => {
    const figure = document.createElement("figure");
    figure.className = "sns__photo is-instant";
    figure.dataset.slot = slot;
    const img = document.createElement("img");
    img.src = DIR + FILES[item];
    img.alt = `NUMBERING \uC778\uC2A4\uD0C0\uADF8\uB7A8 \uAC8C\uC2DC\uBB3C ${item + 1}`;
    img.draggable = false;
    figure.append(img);
    return figure;
  };
  const move = (dir) => {
    if (busy) return;
    busy = true;
    const incoming = makePhoto(dir > 0 ? mod(index + 3) : mod(index - 1), dir > 0 ? 3 : -1);
    viewport.append(incoming);
    incoming.getBoundingClientRect();
    incoming.classList.remove("is-instant");
    viewport.querySelectorAll(".sns__photo").forEach((photo) => {
      photo.dataset.slot = Number(photo.dataset.slot) - dir;
    });
    index = mod(index + dir);
    const leavingSlot = dir > 0 ? -1 : 3;
    window.setTimeout(() => {
      viewport.querySelectorAll(`.sns__photo[data-slot="${leavingSlot}"]`).forEach((photo) => photo.remove());
      busy = false;
    }, duration);
  };
  prev.addEventListener("click", () => move(-1));
  next.addEventListener("click", () => move(1));
  let startX = null;
  let startY = null;
  viewport.addEventListener(
    "touchstart",
    (event) => {
      if (!isMobile.matches) return;
      startX = event.touches[0].clientX;
      startY = event.touches[0].clientY;
    },
    { passive: true }
  );
  viewport.addEventListener(
    "touchend",
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
  viewport.addEventListener("touchcancel", () => {
    startX = null;
    startY = null;
  });
})();
