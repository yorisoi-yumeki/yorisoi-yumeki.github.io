/**
 * voice-form.js
 * voice-form.html（周囲の方への一言メッセージフォーム）専用のスクリプト。
 *
 * 見た目は完全にこのサイト独自のフォームだが、送信時にGoogleフォームの
 * 回答送信エンドポイント（/formResponse）へバックグラウンドでPOSTする。
 * 回答者にはGoogleの画面は一切見えず、それでいて回答は通常のGoogleフォーム
 * 回答と同様に、紐づくスプレッドシートへ自動集計される。
 *
 * 【フォームの質問を追加・変更した場合】
 * GoogleフォームのメニューからENTRY_IDSの値を再取得する必要がある
 * （README.md「④ 周囲からの声の追加・公開」参照）。
 */
(function () {
  "use strict";

  var FORM_ACTION = "https://docs.google.com/forms/d/e/1FAIpQLSfE0qfYftVsnFOiK_HISeNGgP2E4geK8tMZSCmG3mnfmZ-Yrw/formResponse";

  var ENTRY_IDS = {
    name: "entry.1894940668",
    relation: "entry.1259402536",
    goodPoints: "entry.1743369093",
    comment: "entry.100438754",
    publish: "entry.1289005962"
  };

  document.addEventListener("DOMContentLoaded", function () {
    var form = document.getElementById("voice-form");
    if (!form) return;

    var errorMsg = document.getElementById("voice-form-error");
    var doneMsg = document.getElementById("voice-form-done");
    var submitBtn = document.getElementById("voice-form-submit");
    var otherCheck = document.getElementById("good-points-other-check");
    var otherText = document.getElementById("good-points-other-text");

    // 「その他」のテキスト欄に入力したら、チェックボックスも自動でONにする
    otherText.addEventListener("input", function () {
      if (otherText.value.trim()) otherCheck.checked = true;
    });

    function getRadioValue(name) {
      var el = form.querySelector('input[name="' + name + '"]:checked');
      return el ? el.value : "";
    }

    function getGoodPoints() {
      var values = Array.prototype.map.call(
        form.querySelectorAll('#good-points-group input[type="checkbox"]:checked:not(#good-points-other-check)'),
        function (el) { return el.value; }
      );
      if (otherCheck.checked && otherText.value.trim()) {
        values.push({ other: otherText.value.trim() });
      }
      return values;
    }

    function validate(values) {
      if (!values.name) return false;
      if (!values.relation) return false;
      if (!values.goodPoints.length) return false;
      if (!values.publish) return false;
      return true;
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var values = {
        name: document.getElementById("voice-name").value.trim(),
        relation: getRadioValue("relation"),
        goodPoints: getGoodPoints(),
        comment: document.getElementById("voice-comment").value.trim(),
        publish: getRadioValue("publish")
      };

      if (!validate(values)) {
        errorMsg.hidden = false;
        return;
      }
      errorMsg.hidden = true;

      var params = new URLSearchParams();
      params.append(ENTRY_IDS.name, values.name);
      params.append(ENTRY_IDS.relation, values.relation);
      values.goodPoints.forEach(function (v) {
        if (typeof v === "string") {
          params.append(ENTRY_IDS.goodPoints, v);
        } else {
          // Googleフォームの「その他」選択肢の送信形式
          params.append(ENTRY_IDS.goodPoints, "__other_option__");
          params.append(ENTRY_IDS.goodPoints + ".other_option_response", v.other);
        }
      });
      params.append(ENTRY_IDS.comment, values.comment);
      params.append(ENTRY_IDS.publish, values.publish);

      submitBtn.disabled = true;
      submitBtn.textContent = "送信中…";

      // Googleフォームの回答エンドポイントはCORSに対応していないため no-cors で送信する。
      // レスポンス内容は読めないが、リクエスト自体は正常に届き回答として記録される
      // （この方式は静的サイトからGoogleフォームへ回答を送る一般的な手法）。
      fetch(FORM_ACTION, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString()
      })
        .catch(function () {
          // no-corsではエラーもほぼ発生しないが、念のためのフォールバック。
          // ネットワーク自体が失敗した場合でも、ユーザーには送信完了として案内し、
          // 万一届いていなければ後日メールでの確認をお願いする形になる。
        })
        .then(function () {
          form.hidden = true;
          doneMsg.hidden = false;
        });
    });
  });
})();
