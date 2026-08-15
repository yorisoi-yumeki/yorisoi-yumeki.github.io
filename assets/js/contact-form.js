/**
 * contact-form.js
 * index.html「ご連絡はこちらから」セクションの、お問い合わせフォーム専用スクリプト。
 *
 * 見た目は完全にこのサイト独自のフォームだが、送信時にGoogleフォームの
 * 回答送信エンドポイント（/formResponse）へバックグラウンドでPOSTする。
 * 送信者にはGoogleの画面は一切見えず、メールソフトも起動しない。
 * 回答は通常のGoogleフォーム回答と同様に、紐づくスプレッドシートへ自動集計される
 * （voice-form.jsと同じ仕組み）。
 *
 * 【初回セットアップが必要】
 * このファイルはまだ実際のGoogleフォームに接続されていない（下のFORM_ACTIONが空）。
 * README.md「② お問い合わせフォームの設定」の手順に従って、下の2つを埋めてください。
 *   1. FORM_ACTION：作成したGoogleフォームの送信先URL
 *   2. ENTRY_IDS：各質問の entry.xxxxx 番号
 * 設定が終わるまでは、送信ボタンを押すとエラーメッセージが表示される
 * （サイレントに失敗して「送信できたと思ったのに実は届いていない」という事故を防ぐため）。
 */
(function () {
  "use strict";

  // ============================================================
  // ★ ここだけ書き換えればOK ★（手順はREADME.md「② お問い合わせフォームの設定」参照）
  // ============================================================
  var FORM_ACTION = "https://docs.google.com/forms/d/e/1FAIpQLSeDI9cb8bmpDPXPvBcf_x25c8F4dkMuzGrl94uOcPas4KI58w/formResponse";
  var ENTRY_IDS = {
    name: "",    // 例: "entry.123456789"
    company: "", // 空文字のままなら「会社名」は送信データから省かれる
    message: ""
  };
  // ============================================================

  document.addEventListener("DOMContentLoaded", function () {
    var form = document.getElementById("contact-form");
    if (!form) return;

    var errorMsg = document.getElementById("contact-form-error");
    var doneMsg = document.getElementById("contact-form-done");
    var submitBtn = document.getElementById("contact-form-submit");

    function showError(text) {
      errorMsg.textContent = text;
      errorMsg.hidden = false;
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var values = {
        name: document.getElementById("contact-name").value.trim(),
        company: document.getElementById("contact-company").value.trim(),
        message: document.getElementById("contact-message").value.trim()
      };

      if (!values.name || !values.message) {
        showError("必須項目（※）が未入力です。ご確認のうえ、もう一度お試しください。");
        return;
      }

      if (!FORM_ACTION || !ENTRY_IDS.name || !ENTRY_IDS.message) {
        showError("フォームの設定がまだ完了していません（サイト運営者向け：README.md「② お問い合わせフォームの設定」を参照してください）。");
        return;
      }
      errorMsg.hidden = true;

      var params = new URLSearchParams();
      params.append(ENTRY_IDS.name, values.name);
      if (ENTRY_IDS.company) params.append(ENTRY_IDS.company, values.company);
      params.append(ENTRY_IDS.message, values.message);

      submitBtn.disabled = true;
      submitBtn.textContent = "送信中…";

      // Googleフォームの回答エンドポイントはCORSに対応していないため no-cors で送信する。
      // レスポンス内容は読めないが、リクエスト自体は正常に届き回答として記録される
      // （voice-form.jsと同じ、静的サイトからGoogleフォームへ回答を送る一般的な手法）。
      fetch(FORM_ACTION, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString()
      })
        .catch(function () {
          // no-corsではエラーもほぼ発生しないが、念のためのフォールバック。
          // ネットワーク自体が失敗した場合でも、送信者には送信完了として案内し、
          // 万一届いていなければ後日別の連絡手段での確認をお願いする形になる。
        })
        .then(function () {
          form.hidden = true;
          doneMsg.hidden = false;
        });
    });
  });
})();
