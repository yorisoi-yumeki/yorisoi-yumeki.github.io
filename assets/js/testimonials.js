/**
 * testimonials.js
 * 「周囲からの声」セクション（お客様・同僚・上司など、様々な立場からの声）のデータと表示制御。
 *
 * 【運用方法】admin.html（管理画面）で内容を編集し、「コードを生成」で書き出した
 * このファイル一式をGitHub上のこのファイルの編集画面に貼り付けて保存する
 * （README.md「④」参照）。手動で編集する場合は以下の項目を参照：
 *    - quote: 一言コメント本文
 *    - name: お名前（未回答・匿名希望の場合は "匿名" のままでOK）
 *      ※表示時に自動で「様」が付く（すでに「様」「さん」等が付いている場合はそのまま）。
 *        「匿名」はそのまま「匿名」と表示される。
 *    - company: 会社名（未回答の場合は空文字 "" のままでOK）
 *    - relation: 関係性（例："同僚"。未回答の場合は空文字 "" のままでOK。名前の横に(同僚)のように表示）
 *    - goodPoints: 良かった点（複数ある場合は "、" または "," 区切りで1つの文字列に。
 *      未回答の場合は空文字 "" のままでOK。カード内にタグとして表示）
 *
 * 入力値は textContent で挿入しているため、HTMLタグを含む文字列を貼り付けても
 * 画面が壊れたり意図しないコードとして実行されたりしません（安全な実装）。
 */

// admin.htmlで生成（true=掲載中）
var SHOW_TESTIMONIALS = true;

var TESTIMONIALS = [
  {
    quote: "杉田さんからのトスで複数プロダクトのセット提案中です。与信を獲得していることもそうなのですが、ヒアリングの精度が高い（状況が分かりやすい）ので提案しやすいです。\n\n一番は、抽象的ですがマインドだと思ってます！\n資料などからお客様の課題を解決しようと取り組まれているマインドをものすごく感じます！！",
    name: "K",
    company: "",
    relation: "同僚",
    goodPoints: "潜在ニーズを引き出すヒアリング、行き詰まっても別の切り口で提案し直す粘り強さ、ナレッジの横展開、丁寧なスライド資料作成"
  },
  {
    quote: "チームは違いましたがナレッジ共有の投稿をよく見かけて勉強させてもらってますし、社内交流の場にもよくいてチームの役割を社内営業してたので、ずっと正社員だと思ってました",
    name: "S.S",
    company: "フリー株式会社",
    relation: "",
    goodPoints: ""
  },
  {
    quote: "的場浩司似の自己紹介が40-50代の部長レイヤーにぶっ刺さって一気に打ち解けていたので、あの自己紹介は武器だなと思いました（笑）",
    name: "I",
    company: "",
    relation: "",
    goodPoints: ""
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
