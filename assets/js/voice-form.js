/**
 * voice-form.js
 * voice-form.html（周囲の方への一言メッセージフォーム）専用のスクリプト。
 *
 * このサイトには送信先サーバーが無いため、フォームの内容は「メールソフトを
 * 起動して本文に差し込む」という mailto: リンクの形で送信する。
 * - JSが動かない場合でも #voice-submit-link は空のテンプレート付きmailtoリンクとして
 *   機能するため、最低限メール作成画面は開ける（本文は手入力してもらう形）。
 * - JSが動く場合は、入力内容をリアルタイムでリンクのmailto本文に反映する。
 */
(function () {
  "use strict";

  // TODO: サイト公開前に、README.mdの案内に従って実アドレスへ差し替えてください
  // （index.htmlの「ご連絡はこちらから」と同じアドレスに揃えてあります）
  var CONTACT_EMAIL = "contact@example.com";
  var SUBJECT = "【杉田夢生さんへ】一言メッセージを送ります";

  function buildBody(values) {
    var name = values.name.trim() || "（未記入）";
    var company = values.company.trim() || "（未記入）";
    var quote = values.quote.trim() || "（ここに一言コメントをご記入ください）";
    return (
      "お名前：" + name + "\n" +
      "ご関係・会社名：" + company + "\n" +
      "掲載について：" + values.publish + "\n" +
      "\n" +
      "一言コメント：\n" + quote + "\n"
    );
  }

  function buildMailtoHref(values) {
    var params = "subject=" + encodeURIComponent(SUBJECT) + "&body=" + encodeURIComponent(buildBody(values));
    return "mailto:" + CONTACT_EMAIL + "?" + params;
  }

  document.addEventListener("DOMContentLoaded", function () {
    var nameInput = document.getElementById("voice-name");
    var companyInput = document.getElementById("voice-company");
    var quoteInput = document.getElementById("voice-quote");
    var publishSelect = document.getElementById("voice-publish");
    var link = document.getElementById("voice-submit-link");
    if (!nameInput || !companyInput || !quoteInput || !publishSelect || !link) return;

    function currentValues() {
      return {
        name: nameInput.value,
        company: companyInput.value,
        quote: quoteInput.value,
        publish: publishSelect.value
      };
    }

    function refresh() {
      link.setAttribute("href", buildMailtoHref(currentValues()));
    }

    [nameInput, companyInput, quoteInput].forEach(function (el) {
      el.addEventListener("input", refresh);
    });
    publishSelect.addEventListener("change", refresh);

    refresh(); // 初期表示時点でも（全項目空のテンプレートで）リンクを有効化しておく
  });
})();
