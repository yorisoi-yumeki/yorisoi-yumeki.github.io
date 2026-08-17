/**
 * career-timeline.js
 * 「経歴タイムライン」セクション（#career-timeline-chart）の中身を、
 * 職務経歴カード（.career-card）に付与された data-timeline-start / -end / -category
 * 属性から動的に生成するガントチャート風の横棒グラフ。
 *
 * 向きは「現在＝左端、過去に行くほど右」（元にした参考サービスのデザインを踏襲）。
 * 年月の計算はミリ秒近似ではなく、年・月それぞれの整数差で行う（うるう年・月末日数に
 * よる誤差を避けるため）。「今日」はハードコードせず、表示のたびに new Date() で
 * 計算し直す（〜現在の案件の期間・バー幅が読み込み日時に応じて常に正しくなる）。
 *
 * バーは実際にクリック・キーボード操作できる<button>要素で、会社名・雇用形態・期間を
 * すべて含んだaria-labelを持つ（チャート全体を1枚の画像として隠すのではなく、
 * 各バー単位でスクリーンリーダーからも内容を読み取れるようにするため）。
 * クリックすると、下部「実績・経歴」の該当カードまでスクロール＋展開＋一時ハイライトする
 * （main.js内のロゴ／経験バー／業界チップからのジャンプと同じ挙動。main.js側は
 * setCareerFilterAxis 等をprivateなクロージャ内に閉じ込めており外部から呼べないため、
 * ここでは同等の処理を独立して実装している）。
 *
 * #career-timeline-chart はページ読み込みのたびにここで中身を生成し直す
 * （generated要素）。edit-mode.js の書き出し機能は、この中身を空へ戻してから
 * 書き出す（さもないと次回読み込み時にJSが生成済みの中身の上へさらに追加してしまう）。
 */
(function () {
  "use strict";

  var container = document.getElementById("career-timeline-chart");
  if (!container) return;

  var prefersReducedMotion = window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

  var CATEGORY_LABELS = {
    fulltime: "正社員",
    contract: "業務委託",
    dispatch: "派遣",
    commission: "完全歩合制"
  };

  // "YYYY-MM" → {y, m}（mは1〜12）。不正な形式ならnull。
  function parseYearMonth(str) {
    if (!str) return null;
    var match = /^(\d{4})-(\d{2})$/.exec(str.trim());
    if (!match) return null;
    var y = parseInt(match[1], 10);
    var m = parseInt(match[2], 10);
    if (m < 1 || m > 12) return null;
    return { y: y, m: m };
  }

  function toDate(ym) {
    return new Date(ym.y, ym.m - 1, 1);
  }

  // aからbまでの月数差（整数）。ミリ秒ベースの近似は使わない。
  function monthsBetween(a, b) {
    return (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
  }

  function formatDuration(months) {
    months = Math.max(0, Math.round(months));
    var years = Math.floor(months / 12);
    var rem = months % 12;
    if (years === 0) return rem + "ヶ月";
    if (rem === 0) return years + "年";
    return years + "年" + rem + "ヶ月";
  }

  function formatYearMonth(date) {
    return date.getFullYear() + "年" + (date.getMonth() + 1) + "月";
  }

  document.addEventListener("DOMContentLoaded", function () {
    var cards = document.querySelectorAll(".career-card[data-timeline-start]");
    if (!cards.length) return;

    var today = new Date();

    var entries = [];
    cards.forEach(function (card) {
      var startYm = parseYearMonth(card.getAttribute("data-timeline-start"));
      if (!startYm) return; // 不正なデータは静かにスキップ（チャート全体を壊さない）

      var endAttr = card.getAttribute("data-timeline-end");
      var isOngoing = endAttr === "present";
      var endYm = isOngoing ? null : parseYearMonth(endAttr);
      if (!isOngoing && !endYm) return;

      // タイムラインは横幅が限られるため、正式名称（(株)等の法人格・「Japan」等を含む、
      // career-cardの.career-companyそのまま）ではなく、data-timeline-companyで
      // 指定した短縮表記を優先する（無ければ.career-companyへフォールバック）。
      var companyEl = card.querySelector(".career-company");
      var company = card.getAttribute("data-timeline-company") ||
        (companyEl ? companyEl.textContent.trim() : card.id);

      entries.push({
        id: card.id,
        company: company,
        category: card.getAttribute("data-timeline-category") || "contract",
        note: card.getAttribute("data-timeline-note") || "", // 例: WJC「夜間のみ稼働」、PLAINER「展示会時のみ稼働」
        startDate: toDate(startYm),
        endDate: isOngoing ? null : toDate(endYm),
        isOngoing: isOngoing
      });
    });
    if (!entries.length) return;

    // 開始日が新しい順（直近の在籍が一番上）
    entries.sort(function (a, b) { return b.startDate - a.startDate; });

    var earliestStart = entries[0].startDate;
    entries.forEach(function (e) {
      if (e.startDate < earliestStart) earliestStart = e.startDate;
    });

    var totalMonths = Math.max(1, monthsBetween(earliestStart, today));
    var scaleMonths = totalMonths * 1.06; // 右端に少し余白を持たせる

    // 「今日」を0%、過去に行くほど大きい%（＝右寄り）になる位置関数。
    // 年目盛り・「現在」マーカー・各バーの両端、すべてこの1つの関数だけで位置を出すことで、
    // 軸とバーの向きが食い違わないようにしている。
    function offsetPercent(date) {
      return (monthsBetween(date, today) / scaleMonths) * 100;
    }

    container.innerHTML = "";

    // ---- 背景の年目盛り・「現在」マーカー（装飾のみ、aria-hidden） ----
    var axis = document.createElement("div");
    axis.className = "career-timeline-axis";
    axis.setAttribute("aria-hidden", "true");

    var todayMarker = document.createElement("div");
    todayMarker.className = "career-timeline-today-marker";
    todayMarker.style.left = "0%";
    todayMarker.innerHTML = '<span class="career-timeline-today-label">現在</span>';
    axis.appendChild(todayMarker);

    for (var year = today.getFullYear(); year >= earliestStart.getFullYear(); year--) {
      var yearDate = new Date(year, 0, 1);
      var pct = offsetPercent(yearDate);
      if (pct < 1.5 || pct > 100) continue; // 「現在」マーカーとほぼ重なる/範囲外の目盛りは省略
      var yearLine = document.createElement("div");
      yearLine.className = "career-timeline-year-line";
      yearLine.style.left = pct + "%";
      yearLine.innerHTML = '<span class="career-timeline-year-label">' + year + "</span>";
      axis.appendChild(yearLine);
    }
    container.appendChild(axis);

    // ---- 会社ごとの行 ----
    var rows = document.createElement("div");
    rows.className = "career-timeline-rows";
    rows.setAttribute("role", "list");
    rows.setAttribute("aria-label", "経歴タイムライン一覧（" + entries.length + "件、在籍開始が新しい順）");

    entries.forEach(function (entry) {
      var endForOffset = entry.isOngoing ? today : entry.endDate;
      var leftPct = offsetPercent(endForOffset);
      var rightPct = offsetPercent(entry.startDate);
      var widthPct = Math.max(rightPct - leftPct, 2.2); // 短期契約でも視認・クリックできる最小幅

      var durationMonths = monthsBetween(entry.startDate, endForOffset);
      var durationText = formatDuration(durationMonths);
      // 表示用ラベルは「期間（＋注記があれば注記）」を1つの文字列にまとめる。
      // 新しい行を増やさず、バーの隣にこのまま添えることで縦幅を増やさないようにしている。
      var displayText = durationText + (entry.note ? "・" + entry.note : "");
      var periodText = formatYearMonth(entry.startDate) + "〜" + (entry.isOngoing ? "現在" : formatYearMonth(entry.endDate));
      var categoryLabel = CATEGORY_LABELS[entry.category] || entry.category;

      var row = document.createElement("div");
      row.className = "career-timeline-row";
      row.setAttribute("role", "listitem");

      var nameEl = document.createElement("span");
      nameEl.className = "career-timeline-row-name";
      nameEl.style.left = leftPct + "%";
      nameEl.setAttribute("aria-hidden", "true");
      nameEl.textContent = entry.company;
      row.appendChild(nameEl);

      var bar = document.createElement("button");
      bar.type = "button";
      bar.className = "career-timeline-bar career-timeline-bar--" + entry.category;
      bar.style.left = leftPct + "%";
      bar.style.width = widthPct + "%";
      bar.setAttribute(
        "aria-label",
        entry.company + "：" + categoryLabel + "、" + periodText + "（" + displayText + "）。クリックすると経歴カードへ移動します。"
      );
      bar.addEventListener("click", function () {
        jumpToCareerCard(entry.id);
      });
      row.appendChild(bar);

      // 期間（＋注記）はバーの下の別行ではなく、バーの右端（過去側の端）のすぐ外側に
      // バーと同じ縦位置で配置する（.exp-bar-fill-labelと同じ「セグメント端に添えて、
      // 狭ければ外へはみ出させる」パターン。これにより行の縦幅を増やさずに済む）。
      // 起点はrightPct（日付通りの右端）ではなく、実際に描画されるバーの右端
      // （leftPct + widthPct。widthPctは最小幅2.2%でクランプされている）を使う。
      // 短期契約（例：2ヶ月）はrightPct - leftPctが2.2%未満になり、バーだけが
      // 右へ広がるため、rightPct基準のままだとラベルがバーの内側に重なってしまう。
      var durationEl = document.createElement("span");
      durationEl.className = "career-timeline-row-duration career-timeline-row-duration--" + entry.category;
      durationEl.style.left = "calc(" + (leftPct + widthPct) + "% + 6px)";
      durationEl.setAttribute("aria-hidden", "true");
      durationEl.textContent = displayText;
      row.appendChild(durationEl);

      rows.appendChild(row);
    });
    container.appendChild(rows);

    /* ---------------- 経歴カードへジャンプ ----------------
     * main.js の initLogoJumpLinks() 等と同じ「絞り込み解除→展開→開く→スクロール→
     * 一時ハイライト」という一連の挙動。main.js側の実装はトップレベルIIFE内の非公開
     * 変数（setCareerFilterAxis等）に依存しており外部から再利用できないため、
     * ここでは「すべて表示」ボタンを実際にクリックすることで同じ結果を得ている。
     */
    function jumpToCareerCard(id) {
      var target = document.getElementById(id);
      if (!target) return;

      var grid = document.getElementById("career-grid");
      var moreBtn = document.getElementById("career-more-btn");
      if (target.classList.contains("career-extra") && grid && !grid.classList.contains("is-expanded")) {
        grid.classList.add("is-expanded");
        if (moreBtn) moreBtn.classList.add("is-hidden");
      }

      if (target.style.display === "none") {
        var resetBtn = document.querySelector(".career-filter-reset");
        if (resetBtn) resetBtn.click();
      }

      target.open = true;
      target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "center" });
      target.classList.add("is-highlighted");
      window.setTimeout(function () {
        target.classList.remove("is-highlighted");
      }, 1600);
    }
  });
})();
