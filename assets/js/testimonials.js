/**
 * testimonials.js（admin.htmlで生成。運用方法はREADME.md「④」参照）
 */

// admin.htmlで生成（true=掲載中）
var SHOW_TESTIMONIALS = true;

var TESTIMONIALS = [
  {
    quote: "杉田さんからのトスで複数プロダクトのセット提案中です。与信を獲得していることもそうなのですが、ヒアリングの精度が高い（状況が分かりやすい）ので提案しやすいです。\n\n一番は、抽象的ですがマインドだと思ってます！\n資料などからお客様の課題を解決しようと取り組まれているマインドをものすごく感じます！！",
    name: "K",
    company: "",
    relation: "同僚",
    goodPoints: "潜在ニーズを引き出すヒアリング、 行き詰まっても別の切り口で提案し直す粘り強さ、 ナレッジの横展開、 丁寧なスライド資料作成"
  },
  {
    quote: "チームは違いましたがナレッジ共有の投稿をよく見かけて勉強させてもらいましたし、社内交流の場にもよくいてチームの役割を社内営業してたので、ずっと正社員だと思ってました",
    name: "S.S",
    company: "フリー株式会社",
    relation: "同僚",
    goodPoints: "相手の知識レベルに合わせた分かりやすい説明、 ナレッジの横展開、社内営業力"
  },
  {
    quote: "的場浩司似の自己紹介が40-50代の部長レイヤーにぶっ刺さって一気に打ち解けていたので、あの自己紹介は武器だなと思いました（笑）",
    name: "I",
    company: "",
    relation: "部下／後輩",
    goodPoints: "行き詰まっても別の切り口で提案し直す粘り強さ、 アイスブレイク"
  }
];

(function () {
  "use strict";

  // 名前の表示形を整える（末尾に「様」等が無ければ自動で付与）。
  function formatDisplayName(rawName) {
    var name = (rawName || "").trim();
    if (!name || name === "匿名") return name || "匿名";
    if (/(様|さん|さま|殿|氏)$/.test(name)) return name;
    return name + "様";
  }

  // "良かった点" の文字列（読点/カンマ区切り）をタグの配列に変換する。
  function parseGoodPoints(raw) {
    if (!raw) return [];
    return raw
      .split(/[、,，]/)
      .map(function (s) { return s.trim(); })
      .filter(function (s) { return s; });
  }

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
      card.appendChild(quote);

      var goodPoints = parseGoodPoints(item.goodPoints);
      if (goodPoints.length) {
        var tagsLabel = document.createElement("p");
        tagsLabel.className = "testimonial-tags-label";
        tagsLabel.textContent = "良かった点";
        card.appendChild(tagsLabel);

        var tags = document.createElement("div");
        tags.className = "testimonial-tags";
        goodPoints.forEach(function (point) {
          var tag = document.createElement("span");
          tag.className = "testimonial-tag";
          tag.textContent = point;
          tags.appendChild(tag);
        });
        card.appendChild(tags);
      }

      var meta = document.createElement("p");
      meta.className = "testimonial-meta";
      var name = formatDisplayName(item.name);
      var relation = item.relation && item.relation.trim() ? "（" + item.relation.trim() + "）" : "";
      var company = item.company && item.company.trim() ? " / " + item.company.trim() : "";
      meta.textContent = name + relation + company;
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
