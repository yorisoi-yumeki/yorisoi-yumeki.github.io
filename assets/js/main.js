/**
 * main.js
 * サイト全体の挙動（progressive enhancement）。
 * - すべてのコンテンツはJSなしでも表示される前提で、JSは「演出の上乗せ」のみを担当する。
 */
(function () {
  "use strict";

  // JSが動いていることを示すフラグ。CSS側は html.js が付いた場合のみフェード演出を有効化する。
  document.documentElement.classList.add("js");

  var prefersReducedMotion = window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

  /* ---------------- Fade-in on scroll ---------------- */
  function initFadeIn() {
    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      // reduced-motion環境 or 非対応ブラウザでは、全要素を即座に表示状態にする
      document.querySelectorAll(".fade-target").forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "-10% 0px", threshold: 0.05 }
    );

    document.querySelectorAll(".fade-target").forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ---------------- 職務経歴カードの「もっと見る」展開 ---------------- */
  function initCareerExpander() {
    var btn = document.getElementById("career-more-btn");
    var grid = document.getElementById("career-grid");
    if (!btn || !grid) return;
    btn.addEventListener("click", function () {
      grid.classList.add("is-expanded");
      btn.classList.add("is-hidden");
    });
  }

  /* ---------------- 「実績を積んできた企業」ロゴ → 経歴カードへジャンプ ----------------
   * クリックされた企業名から対応する職務経歴カード（<details id="career-xxx">）を開き、
   * スムーズスクロールで表示する。対象が「もっと見る」で隠れている場合は先に展開する。
   * JSが動かない場合でも href="#career-xxx" は残るため、最低限ページ内ジャンプは機能する。
   */
  function initLogoJumpLinks() {
    var links = document.querySelectorAll(".logo-pill[href^='#career-']");
    if (!links.length) return;

    var grid = document.getElementById("career-grid");
    var moreBtn = document.getElementById("career-more-btn");

    links.forEach(function (link) {
      link.addEventListener("click", function (event) {
        var id = link.getAttribute("href").slice(1);
        var target = document.getElementById(id);
        if (!target) return; // 対応するカードが見つからなければ通常のアンカー動作に任せる

        event.preventDefault();

        if (target.classList.contains("career-extra") && grid && !grid.classList.contains("is-expanded")) {
          grid.classList.add("is-expanded");
          if (moreBtn) moreBtn.classList.add("is-hidden");
        }

        target.open = true;
        target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "center" });

        target.classList.add("is-highlighted");
        window.setTimeout(function () {
          target.classList.remove("is-highlighted");
        }, 1600);
      });
    });
  }

  /* ---------------- プロフィール写真の自動検出 ----------------
   * assets/img/ に profile.jpg という決まった名前でアップロードしなくても、
   * GitHubの公開API経由でフォルダの中身を確認し、写真らしきファイル
   * （jpg/jpeg/png/webp/gif、ただし ogp.png は除く）が見つかったら
   * ファイル名を問わず自動的にそれを表示する。
   * API呼び出しに失敗した場合（オフライン・レート制限など）は、
   * 何もせず既存の <img src="assets/img/profile.jpg" onerror="..."> の
   * 挙動（見つかればそのまま表示、無ければプレースホルダー）に任せる。
   */
  function initAutoProfilePhoto() {
    var photos = document.querySelectorAll(".js-profile-photo");
    if (!photos.length || !window.fetch) return;

    fetch("https://api.github.com/repos/negi720-ui/negi720-portfolio/contents/assets/img", {
      headers: { Accept: "application/vnd.github+json" }
    })
      .then(function (res) {
        if (!res.ok) throw new Error("GitHub API error: " + res.status);
        return res.json();
      })
      .then(function (files) {
        if (!Array.isArray(files)) return;
        var photo = files.find(function (f) {
          return f.type === "file" &&
            /\.(jpe?g|png|webp|gif)$/i.test(f.name) &&
            !/ogp/i.test(f.name);
        });
        if (!photo) return;

        var path = "assets/img/" + encodeURIComponent(photo.name);
        photos.forEach(function (img) {
          if (img.getAttribute("src") !== path) img.src = path;
        });
      })
      .catch(function () {
        // 何もしない。既存の src="assets/img/profile.jpg" + onerror フォールバックに任せる
      });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initFadeIn();
    initCareerExpander();
    initLogoJumpLinks();
    initAutoProfilePhoto();
  });
})();
