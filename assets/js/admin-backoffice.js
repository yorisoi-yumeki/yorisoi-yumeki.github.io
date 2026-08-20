/**
 * admin-backoffice.js
 * admin.html（「対応への声」管理セクション）専用のスクリプト。
 *
 * admin.js（周囲の声）と同じ考え方：入力内容はブラウザのlocalStorageにのみ保存され、
 * どこにも送信されない。「コードを生成」ボタンでassets/js/backoffice-survey-data.jsの
 * 完全な置き換えコードを書き出し、それを運営者が手動でGitHub側に貼り付けて初めて
 * サイトに反映される。
 *
 * このデータはGoogleフォームのような継続的な回答フォームを持たない
 * （292件のアンケートを分析して厳選した一度限りのデータのため、admin.jsのSTEP1
 * 「スプレッドシートから自動取得」に相当する機能は無い）。
 *
 * テーマ（グラフのバー）と、声（掲載する引用）は別々のリストだが、
 * 声側は所属するテーマをidで参照する（テーマのラベルを変えてもidは変わらないため、
 * 声とテーマの対応関係が崩れない）。
 */
(function () {
  "use strict";

  var STORAGE_KEY = "yorisoiBackofficeSurveyDraft_v1";

  // 初回アクセス時（localStorageにまだ何も無い時）に読み込む初期データ。
  // 292件のアンケートを分析して作った現時点のデータのスナップショット。
  // ここを更新しても、既にlocalStorageに保存済みの人には反映されない
  // （「初期データに戻す」ボタンで明示的に読み込み直した場合のみ）。
  var SEED_DATA = {
    "stats": {"responseCount": 292, "avgScore": 7.56, "pct8plus": 58.6, "pct9to10": 30.5, "respondedAboutHandling": 74},
    "themes": [
      {"id": "clarity", "label": "わかりやすい説明", "count": 36, "excerpt": "言葉が足らないところをフォローしていただき、わかりやすく説明していただいた。"},
      {"id": "polite", "label": "丁寧な対応", "count": 34, "excerpt": "担当者の方の誠実な対応がとてもよかった。"},
      {"id": "listen", "label": "ヒアリング力・傾聴", "count": 7, "excerpt": "ヒアリング能力が高く、顧客に対して課題の意識づけがとても上手でした。 トーク内容、質問に対する対応、とても素晴らしかったです。"},
      {"id": "sharp", "label": "的確なアドバイス", "count": 5, "excerpt": "弊社の状況を的確に判断して全体的にお話いただけたので、信頼のできるお話ができました。"},
      {"id": "sincere", "label": "親身・誠実な姿勢", "count": 5, "excerpt": "弊社の相談事にも親身に、より詳しく答えていただけそうだと感じました。"},
      {"id": "likable", "label": "好印象・人柄", "count": 2, "excerpt": "さりげなく自社を褒める謙虚な姿勢も好印象でした。"}
    ],
    "voices": [
      {"score": 8, "themes": ["listen", "sincere", "likable"], "quote": "ヒアリング能力が高く、顧客に対して課題の意識づけがとても上手でした。 トーク内容、質問に対する対応、とても素晴らしかったです。 杉田さんは、お客様にとって非常に良いと思います。 商品を押し付けることもなく、さりげなく自社を褒める謙虚な姿勢も好印象でした。", "highlight": true},
      {"score": 10, "themes": ["listen"], "quote": "正直、全く期待していなかったのですが、業務整理をしていただけて本当に助かりました。ERP導入検討をした時でもヒアリングされながら業務整理いただけなかったので、感謝です。", "highlight": true},
      {"score": 8, "themes": ["polite", "clarity"], "quote": "希望する内容がなかったのに丁寧に説明をしていただき、ありがとうございました。 ゆっくり分かりやすく、こちらのペースにあわせてご説明いただき、聞きやすかったです。", "highlight": false},
      {"score": 7, "themes": ["polite"], "quote": "システム導入以前の問題が多い(社員のIT能力等)のですが、一つ一つ丁寧に解決策の例や他社様の事案等交えてご説明頂き、私が認識すらしていなかった課題が見え、大変有意義でした。", "highlight": true},
      {"score": 9, "themes": ["sincere"], "quote": "100名未満の多くの会社のご相談にのられているとお聞きしたので、弊社の相談事にも親身に、より詳しく答えていただけそうだと感じました。本当に的場さんに似ていらっしゃいますね。", "highlight": true},
      {"score": 10, "themes": ["polite", "sincere", "clarity"], "quote": "丁寧に分かり易く説明して頂いたので満足です。 押売りの様な印象を全く受けなかった事です。", "highlight": true},
      {"score": 8, "themes": ["listen"], "quote": "ヒアリングをしていただいて私自身の頭の整理ができました。あまり時間はありませんが、電帳法の対応について検討を進めていきます。ありがとうございました。", "highlight": false},
      {"score": 10, "themes": ["clarity"], "quote": "分かりやすく説明してもらい、会話するなかで弊社の課題の優先順位を再認識できた。当初の予定時間をオーバーして対応していただきありがとうございました", "highlight": true},
      {"score": 10, "themes": ["polite", "clarity"], "quote": "今回は、前回の時よりも とても親切にわかりやす教えて頂きました。 ありがとうございました。", "highlight": false},
      {"score": 9, "themes": ["polite", "clarity"], "quote": "当社の現状を把握していただいて、どうすべきかの説明がとても丁寧で分かりやすかったです。", "highlight": false},
      {"score": 10, "themes": ["sharp"], "quote": "対話全体の中で、システム連携の話をして、弊社の状況を的確に判断して全体的にお話いただけたので、信頼のできるお話ができました。", "highlight": true},
      {"score": 10, "themes": ["polite", "sincere"], "quote": "担当者の方の誠実な対応がとてもよかった。わからないことも丁寧に教えていただいた。", "highlight": false},
      {"score": 10, "themes": ["clarity"], "quote": "弊社のこれから対応していかなければならないことをまとめていただいたので、今後の取組についてわかりやすかったです。", "highlight": false},
      {"score": 10, "themes": ["polite"], "quote": "私が勉強不足だったので分からないことをすぐに教えて頂きました。 丁寧に説明してくれてありがとうございます。", "highlight": false},
      {"score": 6, "themes": ["polite", "listen"], "quote": "ヒアリング内容を、図解し見える化して頂けた。 丁寧でした", "highlight": false},
      {"score": 10, "themes": ["polite"], "quote": "ご丁寧に状況を整理していただき、今後の課題をあらいだしていただきました。ありがとうございます。", "highlight": false},
      {"score": 10, "themes": ["sharp"], "quote": "現状を的確に把握して下さり、今後検討した方が良いことのアドバイスを頂き大変助かりました。", "highlight": true},
      {"score": 9, "themes": ["clarity"], "quote": "言葉が足らないところをフォローしていただき、わかりやすく説明していただいた。", "highlight": false},
      {"score": 7, "themes": ["clarity"], "quote": "フローチャートでのご説明が、現在の課題が見えやすい形でわかりやすかった。", "highlight": false},
      {"score": 6, "themes": ["listen"], "quote": "ヒアリング内容から、その場でいくつかソリューションを提示してくれたこと", "highlight": false},
      {"score": 8, "themes": ["clarity"], "quote": "今現在の状況、やり方について話し易かった。説明もわかり易かったです。", "highlight": false},
      {"score": 9, "themes": ["clarity"], "quote": "わかりやすくそれぞれの分野について整理、診断していただいたと思います", "highlight": false},
      {"score": 10, "themes": ["polite"], "quote": "説明の間で都度質問をなげかけても丁寧な対応をしていただけました", "highlight": false},
      {"score": 8, "themes": ["clarity"], "quote": "図でまとめながら話を進めていただいたので分かりやすかったです。", "highlight": false},
      {"score": 10, "themes": ["polite"], "quote": "丁寧なご説明をして頂き、またお話をお伺いしたいと思いました。", "highlight": false},
      {"score": 9, "themes": ["clarity"], "quote": "情報や改善可能な点をわかりやすく説明していただきました。", "highlight": false},
      {"score": 9, "themes": ["listen"], "quote": "冷静にヒアリング頂き、短時間で整理できたのはすばらしい", "highlight": false},
      {"score": 10, "themes": ["listen"], "quote": "こちらの課題に真摯に耳を傾けて下さったこと。", "highlight": false}
    ]
  };

  var FILE_HEADER =
    "/**\n" +
    " * backoffice-survey-data.js（admin.htmlの「対応への声」管理セクションで生成）\n" +
    " *\n" +
    " * freee「バックオフィス診断」アンケート（杉田本人が担当した292件）から厳選した、\n" +
    " * 対応（担当者個人）への言及を掲載するデータ。運用方法はREADME.md参照。\n" +
    " * countはグラフのバーに出す292件全体のマクロ集計値（テーマ別、重複あり）で、\n" +
    " * voicesの実際の掲載件数とは一致しなくてよい（意図的な仕様）。\n" +
    " */\n";

  var deepClone = function (obj) { return JSON.parse(JSON.stringify(obj)); };

  var data = null; // { stats, themes, voices }
  var editingThemeId = null;
  var editingVoiceIndex = null;
  var nextThemeSeq = 1;

  function load() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.themes) && Array.isArray(parsed.voices)) {
          data = parsed;
          return;
        }
      }
    } catch (e) {
      // 壊れたデータは無視してSEEDから始める
    }
    data = deepClone(SEED_DATA);
  }

  function save() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      window.alert("保存に失敗しました。ブラウザの保存領域が満杯か、プライベートモードの可能性があります。");
    }
  }

  function themeById(id) {
    return data.themes.find(function (t) { return t.id === id; });
  }

  function themeLabel(id) {
    var t = themeById(id);
    return t ? t.label : id;
  }

  document.addEventListener("DOMContentLoaded", function () {
    var section = document.getElementById("admin-backoffice-section");
    if (!section) return; // このsectionが無いページでは何もしない

    load();

    // ---- 定量サマリー ----
    var statCountInput = document.getElementById("bo-stat-count");
    var statAvgInput = document.getElementById("bo-stat-avg");
    var stat8plusInput = document.getElementById("bo-stat-8plus");
    var stat910Input = document.getElementById("bo-stat-910");
    var statHandlingInput = document.getElementById("bo-stat-handling");
    var statsSaveBtn = document.getElementById("bo-stats-save-btn");
    var statsSavedNote = document.getElementById("bo-stats-saved-note");

    function fillStatsForm() {
      statCountInput.value = data.stats.responseCount;
      statAvgInput.value = data.stats.avgScore;
      stat8plusInput.value = data.stats.pct8plus;
      stat910Input.value = data.stats.pct9to10;
      statHandlingInput.value = data.stats.respondedAboutHandling;
    }

    statsSaveBtn.addEventListener("click", function () {
      data.stats = {
        responseCount: parseInt(statCountInput.value, 10) || 0,
        avgScore: parseFloat(statAvgInput.value) || 0,
        pct8plus: parseFloat(stat8plusInput.value) || 0,
        pct9to10: parseFloat(stat910Input.value) || 0,
        respondedAboutHandling: parseInt(statHandlingInput.value, 10) || 0
      };
      save();
      statsSavedNote.hidden = false;
      window.setTimeout(function () { statsSavedNote.hidden = true; }, 2000);
    });

    // ---- テーマ（グラフのバー）編集 ----
    var themeForm = document.getElementById("bo-theme-form");
    var themeLabelInput = document.getElementById("bo-theme-label");
    var themeCountInput = document.getElementById("bo-theme-count");
    var themeExcerptInput = document.getElementById("bo-theme-excerpt");
    var themeSubmitBtn = document.getElementById("bo-theme-submit-btn");
    var themeCancelBtn = document.getElementById("bo-theme-cancel-btn");
    var themeFormTitle = document.getElementById("bo-theme-form-title");
    var themeListEl = document.getElementById("bo-theme-list");

    function slugifyNewThemeId() {
      var id;
      do {
        id = "theme" + nextThemeSeq++;
      } while (themeById(id));
      return id;
    }

    function resetThemeForm() {
      editingThemeId = null;
      themeForm.reset();
      themeFormTitle.textContent = "テーマを追加する";
      themeSubmitBtn.textContent = "追加する";
      themeCancelBtn.hidden = true;
    }

    function startEditTheme(id) {
      var t = themeById(id);
      if (!t) return;
      editingThemeId = id;
      themeLabelInput.value = t.label;
      themeCountInput.value = t.count;
      themeExcerptInput.value = t.excerpt || "";
      themeFormTitle.textContent = "テーマを編集する";
      themeSubmitBtn.textContent = "更新する";
      themeCancelBtn.hidden = false;
      themeForm.scrollIntoView({ behavior: "smooth", block: "start" });
      themeLabelInput.focus();
    }

    function deleteTheme(id) {
      var inUse = data.voices.some(function (v) { return v.themes.indexOf(id) !== -1; });
      if (inUse && !window.confirm("このテーマは声の絞り込みタグとして使われています。削除すると該当する声からもタグが外れます。よろしいですか？")) {
        return;
      }
      data.themes = data.themes.filter(function (t) { return t.id !== id; });
      data.voices.forEach(function (v) { v.themes = v.themes.filter(function (id2) { return id2 !== id; }); });
      if (editingThemeId === id) resetThemeForm();
      save();
      renderAll();
    }

    function moveTheme(id, delta) {
      var index = data.themes.findIndex(function (t) { return t.id === id; });
      if (index === -1) return;
      var target = index + delta;
      if (target < 0 || target >= data.themes.length) return;
      var tmp = data.themes[index];
      data.themes[index] = data.themes[target];
      data.themes[target] = tmp;
      save();
      renderAll();
    }

    themeCancelBtn.addEventListener("click", resetThemeForm);

    themeForm.addEventListener("submit", function (event) {
      event.preventDefault();
      var label = themeLabelInput.value.trim();
      if (!label) { themeLabelInput.focus(); return; }
      var values = {
        label: label,
        count: parseInt(themeCountInput.value, 10) || 0,
        excerpt: themeExcerptInput.value.trim()
      };
      if (editingThemeId !== null) {
        var t = themeById(editingThemeId);
        if (t) Object.assign(t, values);
      } else {
        data.themes.push(Object.assign({ id: slugifyNewThemeId() }, values));
      }
      save();
      resetThemeForm();
      renderAll();
    });

    function renderThemeList() {
      themeListEl.innerHTML = "";
      data.themes.forEach(function (t, index) {
        var row = document.createElement("div");
        row.className = "admin-list-item";

        var body = document.createElement("div");
        body.className = "admin-list-item-body";
        var label = document.createElement("p");
        label.className = "admin-list-item-quote";
        label.textContent = t.label + "（" + t.count + "件）";
        body.appendChild(label);
        var excerptP = document.createElement("p");
        excerptP.className = "admin-list-item-meta";
        excerptP.textContent = t.excerpt ? "代表一言: " + t.excerpt : "代表一言: （未設定。掲載できる声が無いテーマ用の注記が表示されます）";
        body.appendChild(excerptP);

        var actions = document.createElement("div");
        actions.className = "admin-list-item-actions";
        var upBtn = document.createElement("button");
        upBtn.type = "button"; upBtn.textContent = "▲ 上へ"; upBtn.disabled = index === 0;
        upBtn.addEventListener("click", function () { moveTheme(t.id, -1); });
        var downBtn = document.createElement("button");
        downBtn.type = "button"; downBtn.textContent = "▼ 下へ"; downBtn.disabled = index === data.themes.length - 1;
        downBtn.addEventListener("click", function () { moveTheme(t.id, 1); });
        var editBtn = document.createElement("button");
        editBtn.type = "button"; editBtn.textContent = "編集する";
        editBtn.addEventListener("click", function () { startEditTheme(t.id); });
        var deleteBtn = document.createElement("button");
        deleteBtn.type = "button"; deleteBtn.textContent = "削除する"; deleteBtn.className = "is-danger";
        deleteBtn.addEventListener("click", function () { deleteTheme(t.id); });
        actions.appendChild(upBtn); actions.appendChild(downBtn); actions.appendChild(editBtn); actions.appendChild(deleteBtn);

        row.appendChild(body);
        row.appendChild(actions);
        themeListEl.appendChild(row);
      });
    }

    // ---- 声の追加・編集 ----
    var voiceForm = document.getElementById("bo-voice-form");
    var voiceQuoteInput = document.getElementById("bo-voice-quote");
    var voiceScoreInput = document.getElementById("bo-voice-score");
    var voiceThemesWrap = document.getElementById("bo-voice-themes");
    var voiceHighlightInput = document.getElementById("bo-voice-highlight");
    var voiceErrorMsg = document.getElementById("bo-voice-form-error");
    var voiceSubmitBtn = document.getElementById("bo-voice-submit-btn");
    var voiceCancelBtn = document.getElementById("bo-voice-cancel-btn");
    var voiceFormTitle = document.getElementById("bo-voice-form-title");
    var voiceListEl = document.getElementById("bo-voice-list");
    var voiceListEmpty = document.getElementById("bo-voice-list-empty");

    function renderVoiceThemeCheckboxes(checkedIds) {
      voiceThemesWrap.innerHTML = "";
      if (!data.themes.length) {
        var note = document.createElement("p");
        note.className = "form-note";
        note.textContent = "先に上でテーマを1つ以上作成してください。";
        voiceThemesWrap.appendChild(note);
        return;
      }
      data.themes.forEach(function (t) {
        var row = document.createElement("label");
        row.className = "admin-checkbox-row";
        var cb = document.createElement("input");
        cb.type = "checkbox";
        cb.value = t.id;
        cb.checked = (checkedIds || []).indexOf(t.id) !== -1;
        row.appendChild(cb);
        row.appendChild(document.createTextNode(t.label));
        voiceThemesWrap.appendChild(row);
      });
    }

    function resetVoiceForm() {
      editingVoiceIndex = null;
      voiceForm.reset();
      voiceScoreInput.value = 10;
      renderVoiceThemeCheckboxes([]);
      voiceFormTitle.textContent = "声を追加する";
      voiceSubmitBtn.textContent = "追加する";
      voiceCancelBtn.hidden = true;
      voiceErrorMsg.hidden = true;
    }

    function startEditVoice(index) {
      var v = data.voices[index];
      if (!v) return;
      editingVoiceIndex = index;
      voiceQuoteInput.value = v.quote;
      voiceScoreInput.value = v.score;
      renderVoiceThemeCheckboxes(v.themes);
      voiceHighlightInput.checked = !!v.highlight;
      voiceFormTitle.textContent = "声を編集する";
      voiceSubmitBtn.textContent = "更新する";
      voiceCancelBtn.hidden = false;
      voiceErrorMsg.hidden = true;
      voiceForm.scrollIntoView({ behavior: "smooth", block: "start" });
      voiceQuoteInput.focus();
    }

    function deleteVoice(index) {
      var v = data.voices[index];
      if (!v) return;
      var label = v.quote.slice(0, 20) + (v.quote.length > 20 ? "…" : "");
      if (!window.confirm("「" + label + "」を削除します。よろしいですか？")) return;
      data.voices.splice(index, 1);
      if (editingVoiceIndex === index) resetVoiceForm();
      save();
      renderAll();
    }

    function moveVoice(index, delta) {
      var target = index + delta;
      if (target < 0 || target >= data.voices.length) return;
      var tmp = data.voices[index];
      data.voices[index] = data.voices[target];
      data.voices[target] = tmp;
      save();
      renderAll();
    }

    voiceCancelBtn.addEventListener("click", resetVoiceForm);

    voiceForm.addEventListener("submit", function (event) {
      event.preventDefault();
      var quote = voiceQuoteInput.value.trim();
      if (!quote) {
        voiceErrorMsg.textContent = "本文を入力してください。";
        voiceErrorMsg.hidden = false;
        voiceQuoteInput.focus();
        return;
      }
      var checkedThemes = Array.prototype.slice.call(voiceThemesWrap.querySelectorAll("input[type=checkbox]:checked"))
        .map(function (cb) { return cb.value; });
      if (!checkedThemes.length) {
        voiceErrorMsg.textContent = "テーマを1つ以上選んでください。";
        voiceErrorMsg.hidden = false;
        return;
      }
      voiceErrorMsg.hidden = true;

      var values = {
        quote: quote,
        score: Math.max(0, Math.min(10, parseInt(voiceScoreInput.value, 10) || 0)),
        themes: checkedThemes,
        highlight: voiceHighlightInput.checked
      };

      if (editingVoiceIndex !== null) {
        data.voices[editingVoiceIndex] = values;
      } else {
        data.voices.push(values);
      }
      save();
      resetVoiceForm();
      renderAll();
    });

    function renderVoiceList() {
      voiceListEl.innerHTML = "";
      if (!data.voices.length) {
        voiceListEmpty.hidden = false;
        return;
      }
      voiceListEmpty.hidden = true;

      data.voices.forEach(function (v, index) {
        var row = document.createElement("div");
        row.className = "admin-list-item";

        var body = document.createElement("div");
        body.className = "admin-list-item-body";

        if (v.highlight) {
          var badge = document.createElement("span");
          badge.className = "admin-badge is-published";
          badge.textContent = "初期表示に含める";
          body.appendChild(badge);
        }

        var quote = document.createElement("p");
        quote.className = "admin-list-item-quote";
        quote.textContent = v.quote;
        body.appendChild(quote);

        var meta = document.createElement("p");
        meta.className = "admin-list-item-meta";
        meta.textContent = v.score + "点 / " + v.themes.map(themeLabel).join("・");
        body.appendChild(meta);

        var actions = document.createElement("div");
        actions.className = "admin-list-item-actions";
        var upBtn = document.createElement("button");
        upBtn.type = "button"; upBtn.textContent = "▲ 上へ"; upBtn.disabled = index === 0;
        upBtn.addEventListener("click", function () { moveVoice(index, -1); });
        var downBtn = document.createElement("button");
        downBtn.type = "button"; downBtn.textContent = "▼ 下へ"; downBtn.disabled = index === data.voices.length - 1;
        downBtn.addEventListener("click", function () { moveVoice(index, 1); });
        var editBtn = document.createElement("button");
        editBtn.type = "button"; editBtn.textContent = "編集する";
        editBtn.addEventListener("click", function () { startEditVoice(index); });
        var deleteBtn = document.createElement("button");
        deleteBtn.type = "button"; deleteBtn.textContent = "削除する"; deleteBtn.className = "is-danger";
        deleteBtn.addEventListener("click", function () { deleteVoice(index); });
        actions.appendChild(upBtn); actions.appendChild(downBtn); actions.appendChild(editBtn); actions.appendChild(deleteBtn);

        row.appendChild(body);
        row.appendChild(actions);
        voiceListEl.appendChild(row);
      });
    }

    // ---- プレビュー（実サイトと同じクラス名で描画） ----
    var previewBars = document.getElementById("bo-preview-bars");
    var previewCards = document.getElementById("bo-preview-cards");

    function renderPreview() {
      previewBars.innerHTML = "";
      var maxCount = data.themes.reduce(function (m, t) { return Math.max(m, t.count); }, 1);
      data.themes.forEach(function (t) {
        var row = document.createElement("div");
        row.className = "voice-theme-row";
        row.style.cursor = "default";

        var head = document.createElement("div");
        head.className = "voice-theme-head";
        var label = document.createElement("span");
        label.className = "voice-theme-label";
        label.textContent = t.label;
        var count = document.createElement("span");
        count.className = "voice-theme-count";
        count.textContent = t.count + "件";
        head.appendChild(label); head.appendChild(count);
        row.appendChild(head);

        var track = document.createElement("div");
        track.className = "voice-theme-track";
        var fill = document.createElement("div");
        fill.className = "voice-theme-fill";
        fill.style.width = Math.max(6, Math.round((t.count / maxCount) * 100)) + "%";
        track.appendChild(fill);
        row.appendChild(track);

        var excerpt = document.createElement("p");
        if (t.excerpt) {
          excerpt.className = "voice-theme-excerpt";
          excerpt.textContent = t.excerpt;
        } else {
          excerpt.className = "voice-theme-note";
          excerpt.textContent = "ご本人への具体的な言及は無く、診断内容についての回答が中心でした";
        }
        row.appendChild(excerpt);

        previewBars.appendChild(row);
      });

      previewCards.innerHTML = "";
      var highlighted = data.voices.filter(function (v) { return v.highlight; });
      if (!highlighted.length) {
        var empty = document.createElement("p");
        empty.className = "form-note";
        empty.textContent = "「初期表示に含める」がオンの声がまだありません。";
        previewCards.appendChild(empty);
        return;
      }
      highlighted.forEach(function (v) {
        var card = document.createElement("div");
        card.className = "testimonial-card";
        var badge = document.createElement("span");
        badge.className = "voice-score-badge";
        badge.textContent = v.score + "点";
        card.appendChild(badge);
        var quote = document.createElement("p");
        quote.className = "testimonial-quote";
        quote.textContent = v.quote;
        card.appendChild(quote);
        previewCards.appendChild(card);
      });
    }

    function renderAll() {
      fillStatsForm();
      renderThemeList();
      renderVoiceList();
      renderPreview();
      // フォームで選択できるテーマの一覧が変わっている可能性があるため、
      // 声フォームが「追加」モード（編集中でない）の時だけチェックボックスを作り直す
      // （編集中に選択を消してしまわないようにする）。
      if (editingVoiceIndex === null) renderVoiceThemeCheckboxes([]);
    }

    resetThemeForm();
    resetVoiceForm();
    renderAll();

    // ---- 初期データに戻す ----
    var resetSeedBtn = document.getElementById("bo-reset-seed-btn");
    if (resetSeedBtn) {
      resetSeedBtn.addEventListener("click", function () {
        if (!window.confirm("今の編集内容をすべて破棄して、最新の公開データから読み込み直します。よろしいですか？")) return;
        data = deepClone(SEED_DATA);
        editingThemeId = null;
        editingVoiceIndex = null;
        save();
        resetThemeForm();
        resetVoiceForm();
        renderAll();
      });
    }

    // ---- コード生成 ----
    var generateBtn = document.getElementById("bo-generate-btn");
    var copyBtn = document.getElementById("bo-copy-btn");
    var copyStatus = document.getElementById("bo-copy-status");
    var codeOutput = document.getElementById("bo-code-output");

    function jsString(value) {
      return JSON.stringify(value || "");
    }

    function buildBackofficeSurveyFile() {
      var statsBlock =
        "var BACKOFFICE_SURVEY_STATS = {\n" +
        "  responseCount: " + data.stats.responseCount + ",\n" +
        "  avgScore: " + data.stats.avgScore + ",\n" +
        "  pct8plus: " + data.stats.pct8plus + ",\n" +
        "  pct9to10: " + data.stats.pct9to10 + ",\n" +
        "  respondedAboutHandling: " + data.stats.respondedAboutHandling + "\n" +
        "};\n";

      var themeBlocks = data.themes.map(function (t) {
        var excerptStr = t.excerpt ? jsString(t.excerpt) : "null";
        return "  { id: " + jsString(t.id) + ", label: " + jsString(t.label) + ", count: " + t.count + ", excerpt: " + excerptStr + " },";
      });
      var themesBlock = "var BACKOFFICE_VOICE_THEMES = [\n" + themeBlocks.join("\n") + "\n];\n";

      var voiceBlocks = data.voices.map(function (v) {
        var themesStr = v.themes.map(jsString).join(", ");
        return (
          "  {\n" +
          "    score: " + v.score + ",\n" +
          "    themes: [" + themesStr + "],\n" +
          "    quote: " + jsString(v.quote) + ",\n" +
          "    highlight: " + (v.highlight ? "true" : "false") + "\n" +
          "  },"
        );
      });
      var voicesBlock = "var BACKOFFICE_VOICES = [\n" + voiceBlocks.join("\n") + "\n];\n";

      return FILE_HEADER + "\n" + statsBlock + "\n" + themesBlock + "\n" + voicesBlock;
    }

    generateBtn.addEventListener("click", function () {
      var code = buildBackofficeSurveyFile();
      codeOutput.value = code;
      codeOutput.hidden = false;
      copyBtn.hidden = false;
      copyStatus.hidden = true;
      codeOutput.scrollIntoView({ behavior: "smooth", block: "center" });
    });

    copyBtn.addEventListener("click", function () {
      function showCopied() {
        copyStatus.hidden = false;
        window.setTimeout(function () { copyStatus.hidden = true; }, 2500);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(codeOutput.value).then(showCopied, function () {
          codeOutput.select();
          document.execCommand("copy");
          showCopied();
        });
      } else {
        codeOutput.select();
        document.execCommand("copy");
        showCopied();
      }
    });
  });
})();
