/**
 * testimonials.js
 * 「お客様の声」セクションのデータと表示制御。
 *
 * 【運用方法】
 * 1. Googleフォームに届いた推薦文の中から掲載してよいものを選び、
 *    下の TESTIMONIALS 配列に 1 オブジェクト追加する。
 *    - quote: 一言コメント本文
 *    - name: お名前（未回答の場合は "匿名" のままでOK）
 *    - company: 会社名（未回答の場合は空文字 "" のままでOK）
 * 2. 2〜3件程度たまったら、下の SHOW_TESTIMONIALS を true に書き換えて公開する。
 *    （false のままだとセクション自体が非表示になり、0件のまま公開されることを防げます）
 *
 * 入力値は textContent で挿入しているため、HTMLタグを含む文字列を貼り付けても
 * 画面が壊れたり意図しないコードとして実行されたりしません（安全な実装）。
 */

// 推薦文が2〜3件集まったら true に変更してください
var SHOW_TESTIMONIALS = false;

var TESTIMONIALS = [
  // 例）
  // { quote: "商談の場でいつも的確に本質を突いた提案をしてくださいました。", name: "山田 太郎", company: "株式会社サンプル" },
];

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    var section = document.getElementById("testimonials");
    var list = document.getElementById("testimonial-list");
    if (!section || !list) return;

    if (!SHOW_TESTIMONIALS || TESTIMONIALS.length === 0) {
      section.style.display = "none";
      return;
    }

    TESTIMONIALS.forEach(function (item) {
      var card = document.createElement("div");
      card.className = "testimonial-card fade-target";

      var quote = document.createElement("p");
      quote.className = "testimonial-quote";
      quote.textContent = item.quote || "";

      var meta = document.createElement("p");
      meta.className = "testimonial-meta";
      var name = item.name && item.name.trim() ? item.name : "匿名";
      var company = item.company && item.company.trim() ? " / " + item.company : "";
      meta.textContent = name + company;

      card.appendChild(quote);
      card.appendChild(meta);
      list.appendChild(card);
    });

    section.style.display = "";

    // 動的に追加したカードにもフェードイン演出を適用する
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      list.querySelectorAll(".fade-target").forEach(function (el) {
        el.classList.add("is-visible");
      });
    } else if ("IntersectionObserver" in window) {
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
      list.querySelectorAll(".fade-target").forEach(function (el) {
        observer.observe(el);
      });
    } else {
      list.querySelectorAll(".fade-target").forEach(function (el) {
        el.classList.add("is-visible");
      });
    }
  });
})();
