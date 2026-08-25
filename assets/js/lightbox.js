/**
 * lightbox.js
 * data-lightbox属性付きの<a href="画像URL">をクリックした時、画像を拡大表示する
 * オーバーレイを開く（JSなしの場合はそのまま画像URLへの通常リンクとして機能する）。
 */
(function () {
  "use strict";

  var overlay = null;

  function buildOverlay() {
    var el = document.createElement("div");
    el.className = "lightbox-overlay";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-modal", "true");
    el.innerHTML =
      '<button type="button" class="lightbox-close" aria-label="閉じる">✕</button>' +
      '<img class="lightbox-img" alt="">';
    document.body.appendChild(el);

    el.addEventListener("click", function (e) {
      if (e.target === el || e.target.classList.contains("lightbox-close")) {
        closeLightbox();
      }
    });

    return el;
  }

  function openLightbox(src, alt) {
    if (!overlay) overlay = buildOverlay();
    var img = overlay.querySelector(".lightbox-img");
    img.src = src;
    img.alt = alt || "";
    overlay.classList.add("is-open");
    document.body.classList.add("lightbox-lock");
  }

  function closeLightbox() {
    if (!overlay) return;
    overlay.classList.remove("is-open");
    document.body.classList.remove("lightbox-lock");
  }

  document.addEventListener("click", function (e) {
    var link = e.target.closest("[data-lightbox]");
    if (!link) return;
    e.preventDefault();
    var img = link.querySelector("img");
    openLightbox(link.getAttribute("href"), img ? img.alt : "");
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeLightbox();
  });
})();
