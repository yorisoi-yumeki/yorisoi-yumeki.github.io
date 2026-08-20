/**
 * deliverables-toggle.js
 * 「成果物の例」セクション（#deliverables）の公開ON/OFFフラグ。運用方法はREADME.md参照。
 *
 * false にすると、以下3箇所をまとめて非表示にできる（HTML自体は削除しないので、
 * true に戻せばいつでも復活する。すぐに一旦引っ込めたい場合はここを false にするだけでよい）。
 *   - ナビ（.site-nav）の「成果物を見る」リンク
 *   - #deliverables セクション本体
 *   - career-freeeカード内の導線リンク（→ この診断で作成した、トークスクリプト…）
 */
var SHOW_DELIVERABLES = true;

document.addEventListener("DOMContentLoaded", function () {
  if (SHOW_DELIVERABLES) return;

  var section = document.getElementById("deliverables");
  if (section) section.hidden = true;

  var navLink = document.getElementById("nav-deliverables-link");
  if (navLink) navLink.hidden = true;

  var careerLink = document.getElementById("career-deliverables-link");
  if (careerLink) careerLink.hidden = true;
});
