/* Bold Outline Pop — behaviour
   Motion over fade: elements move and snap, they do not dissolve. */

(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- ambient decorative layer ----------
     Sparse near the centre column where text lives, denser at the edges. */
  function paintConfetti() {
    var host = document.querySelector(".confetti");
    if (!host || reduced) return;

    var shapes = ["c-dot", "c-sq", "c-bar", "c-ring"];
    var fills = ["var(--red)", "var(--blue)", "var(--yellow)", "var(--green)", "var(--orange)", "var(--blue-light)", "var(--white)"];
    var spots = [
      [3, 12], [7, 46], [4, 78], [12, 26], [10, 63], [15, 90],
      [85, 8], [89, 40], [93, 70], [82, 55], [96, 22], [88, 88],
      [24, 6], [38, 94], [55, 4], [68, 96], [46, 8], [72, 92]
    ];

    var frag = document.createDocumentFragment();
    spots.forEach(function (pos, i) {
      var el = document.createElement("span");
      el.className = shapes[i % shapes.length];
      el.style.left = pos[0] + "%";
      el.style.top = pos[1] + "%";
      if (el.className !== "c-ring") el.style.background = fills[i % fills.length];
      el.style.animationDelay = (-(i * 0.37) % 4).toFixed(2) + "s";
      el.style.animationDuration = (3.2 + (i % 5) * 0.6).toFixed(1) + "s";
      frag.appendChild(el);
    });
    host.appendChild(frag);
  }

  /* ---------- mark the current page in the nav ---------- */
  function markCurrent() {
    var here = location.pathname.replace(/index\.html$/, "").replace(/\/+$/, "/");
    document.querySelectorAll(".site-nav a").forEach(function (a) {
      var target = new URL(a.getAttribute("href"), location.href).pathname
        .replace(/index\.html$/, "").replace(/\/+$/, "/");
      if (target !== "/" && here.indexOf(target) === 0) a.setAttribute("aria-current", "page");
      else if (target === here) a.setAttribute("aria-current", "page");
    });
  }

  /* ---------- scroll reveal ---------- */
  function reveal() {
    var items = document.querySelectorAll(".reveal");
    if (!items.length) return;
    if (reduced || !("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    items.forEach(function (el) { io.observe(el); });

    /* Safety net: content starts transparent, so anything still hidden after a
       few seconds (background tab, observer never fired) is shown regardless.
       Invisible content is a worse failure than a missing animation. */
    setTimeout(function () {
      items.forEach(function (el) { el.classList.add("is-in"); });
    }, 3000);
  }

  /* ---------- work filter ---------- */
  function filters() {
    var bar = document.querySelector(".filters");
    var grid = document.querySelector("[data-filterable]");
    if (!bar || !grid) return;

    var live = document.getElementById("filter-status");

    bar.addEventListener("click", function (ev) {
      var btn = ev.target.closest("button[data-filter]");
      if (!btn) return;

      var key = btn.dataset.filter;
      bar.querySelectorAll("button").forEach(function (b) {
        b.setAttribute("aria-pressed", String(b === btn));
      });

      var shown = 0;
      grid.querySelectorAll("[data-cat]").forEach(function (card) {
        var match = key === "all" || card.dataset.cat.split(" ").indexOf(key) !== -1;
        card.hidden = !match;
        if (match) shown++;
      });

      if (live) live.textContent = shown + "件を表示中";
    });
  }

  /* ---------- back to top ---------- */
  function fab() {
    var btn = document.querySelector(".fab");
    if (!btn) return;
    var onScroll = function () {
      btn.classList.toggle("is-on", window.scrollY > 600);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
    });
  }

  function init() {
    paintConfetti();
    markCurrent();
    reveal();
    filters();
    fab();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
