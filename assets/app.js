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

  /* ---------- lightbox ----------
     サムネイルは 229px でしか出ないので、文書のスクリーンショットは文字が読めない。
     対象はリンクになっていない画像だけ。リンクのカードは遷移が本来の動作なので触らない。 */
  function lightbox() {
    var targets = document.querySelectorAll(".prose figure img, .work-card.is-static .thumb img");
    if (!targets.length || typeof HTMLDialogElement === "undefined") return;

    var dlg = document.createElement("dialog");
    dlg.className = "lightbox";
    dlg.innerHTML =
      '<button class="lightbox__close icon-circle" type="button" aria-label="閉じる">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" ' +
      'stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>' +
      "</button>" +
      /* 画像は原寸で出す。縮めて表示すると、サムネイルより小さくなって
         拡大の意味が無くなる（実測で 483px のサムネに対し 471px だった）。
         収まらないぶんはこの枠の中でスクロールさせる。 */
      '<div class="lightbox__frame" tabindex="0"><img alt=""></div>' +
      '<p class="lightbox__cap"></p>';
    document.body.appendChild(dlg);

    var big = dlg.querySelector("img");
    var cap = dlg.querySelector(".lightbox__cap");
    var opener = null;

    var open = function (img) {
      opener = img;
      big.src = img.currentSrc || img.src;
      big.alt = img.alt;
      var fig = img.closest("figure");
      var fc = fig && fig.querySelector("figcaption");
      cap.textContent = fc ? fc.textContent.trim() : img.alt;
      dlg.showModal();
    };

    Array.prototype.forEach.call(targets, function (img) {
      img.classList.add("is-zoomable");
      img.setAttribute("role", "button");
      img.setAttribute("tabindex", "0");
      img.addEventListener("click", function () { open(img); });
      img.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(img); }
      });
    });

    dlg.querySelector(".lightbox__close").addEventListener("click", function () { dlg.close(); });
    /* 余白（= dialog 自身）のクリックで閉じる。中身のクリックでは閉じない */
    dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
    /* Esc とボタンの両方で、開くきっかけになった画像へフォーカスを戻す */
    dlg.addEventListener("close", function () { if (opener) opener.focus(); });
  }

  function init() {
    paintConfetti();
    markCurrent();
    reveal();
    filters();
    lightbox();
    fab();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
