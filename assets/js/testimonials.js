/**
 * testimonials.js
 * 「周囲からの声」セクション（お客様・同僚・上司など、様々な立場からの声）のデータと表示制御。
 *
 * 【運用方法】
 * 1. voice-form.html（サイト右下「一言メッセージを届ける」から遷移）経由で
 *    メールに届いた一言コメントの中から、掲載してよいものを選ぶ。
 *    （フォームには「掲載可否」の選択欄があるので、そちらの回答も確認すること）
 * 2. 下の TESTIMONIALS 配列に 1 オブジェクト追加する。
 *    - quote: 一言コメント本文
 *    - name: お名前（未回答・匿名希望の場合は "匿名" のままでOK）
 *    - company: 会社名（未回答の場合は空文字 "" のままでOK）
 * 3. 2〜3件程度たまったら、下の SHOW_TESTIMONIALS を true に書き換えて公開する。
 *    （false のままでも「声を届ける」導線と空状態メッセージは表示され続けます）
 *
 * 入力値は textContent で挿入しているため、HTMLタグを含む文字列を貼り付けても
 * 画面が壊れたり意図しないコードとして実行されたりしません（安全な実装）。
 */

// 推薦文が2〜3件集まったら true に変更してください
//
// ※ 現在は「表示するとどう見えるか」を確認していただくため、
//    下のサンプルデータ3件を仮表示する目的で true にしてあります。
//    実際の推薦文が届いたら、TESTIMONIALS配列の中身をサンプルから
//    本物のデータに丸ごと差し替えてください（このコメントも消してOKです）。
//    一旦非表示に戻したい場合は false にしてください。
var SHOW_TESTIMONIALS = true;

var TESTIMONIALS = [
  // ↓↓↓ ここから3件はサンプル（仮データ）です。実際の推薦文に差し替えてください ↓↓↓
  {
    quote: "商談のたびに、こちらが言葉にできていなかった課題まで的確に言語化してくださり、いつも新しい気づきをもらっています。",
    name: "山田 太郎（サンプル）",
    company: "株式会社サンプルテック"
  },
  {
    quote: "レスポンスが早く、提案の質も高いので安心してお任せできます。押し売り感が一切ないのも信頼できるポイントです。",
    name: "佐藤 花子（サンプル）",
    company: "サンプル商事株式会社"
  },
  {
    quote: "チームを巻き込みながら成果を出す力があり、一緒に仕事をしていて非常に頼もしい存在でした。",
    name: "匿名（サンプル）",
    company: ""
  }
  // ↑↑↑ ここまでサンプル。実際の推薦文が届いたら上の3件を削除・置き換えてください ↑↑↑

  // 例）実際のデータはこのような形で追加します：
  // { quote: "商談の場でいつも的確に本質を突いた提案をしてくださいました。", name: "山田 太郎", company: "株式会社サンプル" },
];

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    var section = document.getElementById("testimonials");
    var list = document.getElementById("testimonial-list");
    var emptyMsg = document.getElementById("testimonial-empty");
    if (!section || !list) return;

    // 実際の声がまだ無い場合でも、セクション自体（と「声を届ける」導線）は
    // 表示したまま、代わりに空状態メッセージを見せる（voice-form.htmlへの
    // 投稿を後押しするため、以前のようにセクションごと非表示にはしない）。
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
