/**
 * backoffice-survey.js
 *
 * 「バックオフィス診断でいただいた、対応への声」セクションの描画とグラフの絞り込みを担当する。
 * データは backoffice-survey-data.js（BACKOFFICE_SURVEY_STATS / BACKOFFICE_VOICE_THEMES /
 * BACKOFFICE_VOICES）を参照する。testimonials.js と同じく、この即時関数の中だけで完結させており
 * main.js 側の初期化リストに関数を登録する必要はない。
 *
 * 操作感は #achievements の経験バー（exp-bar-fill-label.is-jump）と同じ「クリックしたら
 * その条件だけに絞り込む」という単一選択のジャンプ的挙動。ただし絞り込み先は他セクションの
 * カードではなく、このセクション内のパネル（#voice-panel-list）の中身の差し替え。
 */
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    var section = document.getElementById("backoffice-survey");
    if (!section) return;
    if (
      typeof BACKOFFICE_SURVEY_STATS === "undefined" ||
      typeof BACKOFFICE_VOICE_THEMES === "undefined" ||
      typeof BACKOFFICE_VOICES === "undefined"
    ) {
      return;
    }

    var barsWrap = document.getElementById("voice-theme-bars");
    var panelList = document.getElementById("voice-panel-list");
    var panelTitle = document.getElementById("voice-panel-title");
    var panelToggle = document.getElementById("voice-panel-toggle");
    var panelEmpty = document.getElementById("voice-panel-empty");
    if (!barsWrap || !panelList || !panelTitle || !panelToggle) return;

    function prefersReducedMotion() {
      return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }

    /* ---------------- 定量サマリー（3タイル） ---------------- */
    var countEl = document.getElementById("voice-stat-count");
    var avgEl = document.getElementById("voice-stat-avg");
    var plusEl = document.getElementById("voice-stat-8plus");
    if (countEl) countEl.textContent = BACKOFFICE_SURVEY_STATS.responseCount + "件";
    if (avgEl) {
      avgEl.innerHTML =
        BACKOFFICE_SURVEY_STATS.avgScore.toFixed(2) + '<span style="font-size:0.55em;">/10</span>';
    }
    if (plusEl) plusEl.textContent = BACKOFFICE_SURVEY_STATS.pct8plus + "%";

    /* ---------------- テーマ別頻出グラフ ---------------- */
    // 件数の差が大きい（最大34件・最小2件）ため、小さいバーも視認できるよう最低6%の幅を確保する。
    var maxCount = BACKOFFICE_VOICE_THEMES.reduce(function (m, t) { return Math.max(m, t.count); }, 1);

    // 何らかの理由でこの初期化が2回走っても描画が二重にならないよう、まず必ず空にする。
    barsWrap.innerHTML = "";

    BACKOFFICE_VOICE_THEMES.forEach(function (theme) {
      var row = document.createElement("button");
      row.type = "button";
      row.className = "voice-theme-row";
      row.setAttribute("data-theme", theme.id);
      row.setAttribute("aria-pressed", "false");

      var head = document.createElement("div");
      head.className = "voice-theme-head";

      var label = document.createElement("span");
      label.className = "voice-theme-label";
      label.textContent = theme.label;
      head.appendChild(label);

      var count = document.createElement("span");
      count.className = "voice-theme-count";
      count.textContent = theme.count + "件";
      head.appendChild(count);

      row.appendChild(head);

      var track = document.createElement("div");
      track.className = "voice-theme-track";
      var fill = document.createElement("div");
      fill.className = "voice-theme-fill";
      fill.style.width = Math.max(6, Math.round((theme.count / maxCount) * 100)) + "%";
      track.appendChild(fill);
      row.appendChild(track);

      // excerptが無いテーマ（例：「安心感」）は、対応者個人への具体的な言及ではなかった
      // ことをそのまま伝える注記を表示する（引用符付きの偽の声として見せないため、
      // 通常のexcerptとは別クラスにしてスタイルも変える）。
      var excerpt = document.createElement("p");
      if (theme.excerpt) {
        excerpt.className = "voice-theme-excerpt";
        excerpt.textContent = theme.excerpt;
      } else {
        excerpt.className = "voice-theme-note";
        excerpt.textContent = "ご本人への具体的な言及は無く、診断内容についての回答が中心でした";
      }
      row.appendChild(excerpt);

      barsWrap.appendChild(row);
    });

    var themeButtons = Array.prototype.slice.call(barsWrap.querySelectorAll(".voice-theme-row"));

    /* ---------------- 声パネル ---------------- */
    var highlightVoices = BACKOFFICE_VOICES.filter(function (v) { return v.highlight; });

    function renderCards(list) {
      panelList.innerHTML = "";
      if (!list.length) {
        if (panelEmpty) panelEmpty.hidden = false;
        return;
      }
      if (panelEmpty) panelEmpty.hidden = true;

      list.forEach(function (item) {
        var card = document.createElement("div");
        card.className = "testimonial-card";

        var badge = document.createElement("span");
        badge.className = "voice-score-badge";
        badge.textContent = item.score + "点";
        card.appendChild(badge);

        var quote = document.createElement("p");
        quote.className = "testimonial-quote";
        quote.textContent = item.quote;
        card.appendChild(quote);

        panelList.appendChild(card);
      });
    }

    function setActiveTheme(themeId) {
      themeButtons.forEach(function (btn) {
        var active = btn.getAttribute("data-theme") === themeId;
        btn.classList.toggle("is-active", active);
        btn.setAttribute("aria-pressed", String(active));
      });
    }

    function showHighlight() {
      setActiveTheme(null);
      panelTitle.textContent = "厳選した声";
      panelToggle.textContent = "すべての声を見る（" + BACKOFFICE_VOICES.length + "件）";
      panelToggle.onclick = showAll;
      renderCards(highlightVoices);
    }

    function showAll() {
      setActiveTheme(null);
      panelTitle.textContent = "すべての声（" + BACKOFFICE_VOICES.length + "件）";
      panelToggle.textContent = "← 厳選した声に戻る";
      panelToggle.onclick = showHighlight;
      renderCards(BACKOFFICE_VOICES);
    }

    function showTheme(theme) {
      setActiveTheme(theme.id);
      var matches = BACKOFFICE_VOICES.filter(function (v) { return v.themes.indexOf(theme.id) !== -1; });
      panelTitle.textContent = "「" + theme.label + "」の声（" + matches.length + "件）";
      panelToggle.textContent = "← 厳選した声に戻る";
      panelToggle.onclick = showHighlight;
      renderCards(matches);
      panelList.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "nearest" });
    }

    themeButtons.forEach(function (btn, idx) {
      btn.addEventListener("click", function () {
        // 選択中のバーをもう一度押したら「厳選した声」に戻す（domain-chipと同じトグル挙動）
        if (btn.classList.contains("is-active")) {
          showHighlight();
        } else {
          showTheme(BACKOFFICE_VOICE_THEMES[idx]);
        }
      });
    });

    showHighlight();
  });
})();
