/**
 * testimonials.js（admin.htmlで生成。運用方法はREADME.md「④」参照）
 */

// admin.htmlで生成（true=掲載中）
var SHOW_TESTIMONIALS = true;

var TESTIMONIALS = [
  {
    quote: "杉田さんからのトスで複数プロダクトのセット提案中です。与信を獲得していることもそうなのですが、ヒアリングの精度が高い（状況が分かりやすい）ので提案しやすいです。\n\n一番は、抽象的ですがマインドだと思ってます！\n資料などからお客様の課題を解決しようと取り組まれているマインドをものすごく感じます！！",
    name: "K",
    company: ""
  },
  {
    quote: "ナレッジ共有の投稿をよく見かけて勉強させてもらってますし、社内交流の場にもよくいてチームの役割を社内営業してたので、ずっと正社員だと思ってました笑",
    name: "S.S",
    company: ""
  },
  {
    quote: "的場浩司似の自己紹介が40-50代の部長レイヤーにぶっ刺さって一気に打ち解けていたので、あの自己紹介は武器だなと思いました（笑）",
    name: "I",
    company: ""
  }
];

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    var section = document.getElementById("testimonials");
    var list = document.getElementById("testimonial-list");
    var emptyMsg = document.getElementById("testimonial-empty");
    if (!section || !list) return;

    if (!SHOW_TESTIMONIALS || TESTIMONIALS.length === 0) {
      if (emptyMsg) emptyMsg.hidden = false;
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
