(() => {
  const hosts = Array.from(document.querySelectorAll("[data-dd]"));
  if (!hosts.length) return;
  const triggerOf = (host) => host.querySelector("[data-dd-toggle]");
  const setOpen = (host, open) => {
    host.classList.toggle("is-open", open);
    const trigger = triggerOf(host);
    if (trigger) trigger.setAttribute("aria-expanded", String(open));
  };
  const closeAll = (except) => {
    hosts.forEach((host) => {
      if (host !== except && host.classList.contains("is-open")) setOpen(host, false);
    });
  };
  hosts.forEach((host) => {
    host.addEventListener("pointerenter", (event) => {
      if (event.pointerType === "mouse") closeAll(host);
    });
    const trigger = triggerOf(host);
    if (!trigger) return;
    trigger.addEventListener("click", (event) => {
      if (trigger.tagName === "A" && trigger.getAttribute("href") === "#") event.preventDefault();
      if (window.matchMedia("(max-width: 1023px)").matches && host.closest(".gnb")) return;
      const open = !host.classList.contains("is-open");
      closeAll(host);
      setOpen(host, open);
      if (open) {
        const input = host.querySelector("input");
        if (input) window.setTimeout(() => input.focus(), 0);
      }
    });
  });
  document.addEventListener("click", (event) => {
    if (!event.target.closest("[data-dd]")) closeAll();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    const open = hosts.find((host) => host.classList.contains("is-open"));
    if (!open) return;
    setOpen(open, false);
    const trigger = triggerOf(open);
    if (trigger) trigger.focus();
  });
  document.querySelectorAll("[data-lang]").forEach((option) => {
    option.addEventListener("click", () => {
      const host = option.closest("[data-dd]");
      const current = host.querySelector("[data-lang-current]");
      if (current) current.textContent = option.dataset.lang;
      host.querySelectorAll("[data-lang]").forEach((o) => o.setAttribute("aria-selected", String(o === option)));
      setOpen(host, false);
    });
  });
  document.querySelectorAll("[data-search-form]").forEach((form) => {
    form.addEventListener("submit", (event) => event.preventDefault());
  });
  window.matchMedia("(max-width: 1023px)").addEventListener("change", () => closeAll());
})();
