(() => {
  const header = document.querySelector(".site-header");
  const toggle = header && header.querySelector("[data-menu-toggle]");
  if (!toggle) return;
  const mq = window.matchMedia("(max-width: 1023px)");
  const closeButton = header.querySelector("[data-menu-close].gnb__close");
  const setOpen = (open, restoreFocus = false) => {
    header.classList.toggle("is-menu-open", open);
    document.documentElement.classList.toggle("is-scroll-locked", open);
    toggle.setAttribute("aria-expanded", String(open));
    if (open && closeButton) window.setTimeout(() => closeButton.focus(), 0);
    if (!open && restoreFocus) toggle.focus();
  };
  toggle.addEventListener("click", () => {
    if (!mq.matches) return;
    setOpen(!header.classList.contains("is-menu-open"));
  });
  header.querySelectorAll("[data-menu-close]").forEach((el) => {
    el.addEventListener("click", () => setOpen(false, true));
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && header.classList.contains("is-menu-open")) setOpen(false, true);
  });
  mq.addEventListener("change", () => setOpen(false));
})();
