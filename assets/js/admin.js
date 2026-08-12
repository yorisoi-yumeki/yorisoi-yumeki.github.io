/**
 * admin.js
 * admin.html（「周囲の声」管理画面）専用のスクリプト。
 *
 * このページはサイトの一部ではなく、運営者だけが使うローカルツール。
 * 入力内容はブラウザのlocalStorageにのみ保存され、どこにも送信されない。
 * 「コードを生成」ボタンでassets/js/testimonials.jsの完全な置き換えコードを
 * 文字列として書き出し、それを運営者が手動でGitHub側に貼り付けて初めて
 * サイトに反映される（Claudeにもインターネットにも依存しない運用方法）。
 */
(function () {
  "use strict";

  var STORAGE_KEY = "yorisoiTestimonialDrafts_v1";

  // ============================================================
  // ★ ここだけ書き換えればOK ★
  // 回答スプレッドシートを自動取得するための読み取り専用API(Google Apps Script)のURL。
  // 下の "" のあいだに、デプロイ後に発行されたURLを貼り付けてください。
  // （設置方法はREADME.md「④ 周囲からの声の追加・公開」参照）
  //
  // 未設定（空文字 ""）の間は「自動で取得する」ボタンを押すとセットアップ手順を案内する。
  // このAPIは「今回は掲載しないで欲しい」回答をあらかじめ除外して返す実装にしてあるため、
  // このURLが公開ソースコードとして誰かの目に触れても、非公開希望者のデータは含まれない。
  //
  // このファイル内に「SHEET_API_URL」という文字は他にも出てくるが、書き換えるのは
  // このすぐ下の1行だけでよい（他の箇所はこの値を読み取って使っているだけ）。
  // ============================================================
  var SHEET_API_URL = "https://script.google.com/macros/s/AKfycbyBzczS8Jd1Jr10-oe5ISgzoevGN8apWiddjM_SpQyMozUT2BdLrNi3ivhoroiQQavF/exec"; // ← この "" の中に、URLを貼り付ける（例: "https://script.google.com/macros/s/xxxxxxxxxxxx/exec"）

  /* STEP 4「GitHubで開いて反映する」用の設定。
   * GitHubは、既存ファイルと同じパスを指定して /new/{branch}?filename=...&value=... を開くと、
   * その内容が入力済みの状態でファイル編集画面が開き、コミット時に既存ファイルの更新として
   * 扱われる。これを利用してコピー&ペースト操作自体をなくす（GitHubトークンなどの追加設定は不要）。
   * URLが長くなりすぎる（掲載件数が多い等）場合は、後方にある「コードを生成してコピー」の
   * 手動フローに自動でフォールバックする。 */
  var GITHUB_NEW_FILE_URL = "https://github.com/yorisoi-yumeki/yorisoi-yumeki.github.io/new/main";
  var TESTIMONIALS_PATH = "assets/js/testimonials.js";
  // 日本語を含む内容はURLエンコードすると1文字が最大9文字("%XX%XX%XX")に膨れ上がるため、
  // 見た目の文字数以上にURLが長くなりやすい。多くのサーバーが安全に扱える目安(8000文字前後)
  // より少し手前の値をリミットにし、超えたら自動でコピー&貼り付け方式にフォールバックする。
  var URL_LENGTH_SAFE_LIMIT = 7500;

  // ---- testimonials.js のうち、STEP 3で生成するコードでも変えずに使う部分 ----

  // FILE_HEADER/FOOTERはコメントを最小限にしてある。GitHubの「/new/」プリフィルURLに
  // URLエンコードして載せる都合上、日本語コメントはUTF-8の1文字が"%XX%XX%XX"の9文字に
  // 膨れ上がりURL長を圧迫するため（詳しい運用方法はREADME.md「④」に集約してある）。
  var FILE_HEADER =
    "/**\n" +
    " * testimonials.js（admin.htmlで生成。運用方法はREADME.md「④」参照）\n" +
    " */\n";

  var FILE_FOOTER =
    "\n(function () {\n" +
    "  \"use strict\";\n" +
    "\n" +
    "  document.addEventListener(\"DOMContentLoaded\", function () {\n" +
    "    var section = document.getElementById(\"testimonials\");\n" +
    "    var list = document.getElementById(\"testimonial-list\");\n" +
    "    var emptyMsg = document.getElementById(\"testimonial-empty\");\n" +
    "    if (!section || !list) return;\n" +
    "\n" +
    "    if (!SHOW_TESTIMONIALS || TESTIMONIALS.length === 0) {\n" +
    "      if (emptyMsg) emptyMsg.hidden = false;\n" +
    "      return;\n" +
    "    }\n" +
    "\n" +
    "    TESTIMONIALS.forEach(function (item) {\n" +
    "      var card = document.createElement(\"div\");\n" +
    "      card.className = \"testimonial-card fade-target\";\n" +
    "\n" +
    "      var quote = document.createElement(\"p\");\n" +
    "      quote.className = \"testimonial-quote\";\n" +
    "      quote.textContent = item.quote || \"\";\n" +
    "\n" +
    "      var meta = document.createElement(\"p\");\n" +
    "      meta.className = \"testimonial-meta\";\n" +
    "      var name = item.name && item.name.trim() ? item.name : \"匿名\";\n" +
    "      var company = item.company && item.company.trim() ? \" / \" + item.company : \"\";\n" +
    "      meta.textContent = name + company;\n" +
    "\n" +
    "      card.appendChild(quote);\n" +
    "      card.appendChild(meta);\n" +
    "      list.appendChild(card);\n" +
    "    });\n" +
    "\n" +
    "    section.style.display = \"\";\n" +
    "\n" +
    "    if (window.matchMedia && window.matchMedia(\"(prefers-reduced-motion: reduce)\").matches) {\n" +
    "      list.querySelectorAll(\".fade-target\").forEach(function (el) {\n" +
    "        el.classList.add(\"is-visible\");\n" +
    "      });\n" +
    "    } else if (\"IntersectionObserver\" in window) {\n" +
    "      var observer = new IntersectionObserver(\n" +
    "        function (entries) {\n" +
    "          entries.forEach(function (entry) {\n" +
    "            if (entry.isIntersecting) {\n" +
    "              entry.target.classList.add(\"is-visible\");\n" +
    "              observer.unobserve(entry.target);\n" +
    "            }\n" +
    "          });\n" +
    "        },\n" +
    "        { rootMargin: \"-10% 0px\", threshold: 0.05 }\n" +
    "      );\n" +
    "      list.querySelectorAll(\".fade-target\").forEach(function (el) {\n" +
    "        observer.observe(el);\n" +
    "      });\n" +
    "    } else {\n" +
    "      list.querySelectorAll(\".fade-target\").forEach(function (el) {\n" +
    "        el.classList.add(\"is-visible\");\n" +
    "      });\n" +
    "    }\n" +
    "  });\n" +
    "})();\n";

  // ---------------------------------------------------------------

  var drafts = [];
  var editingId = null;
  var nextId = 1;

  function load() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      var parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        drafts = parsed;
        drafts.forEach(function (d) {
          if (typeof d.id === "number" && d.id >= nextId) nextId = d.id + 1;
        });
      }
    } catch (e) {
      // 壊れたデータは無視して空の状態から始める
      drafts = [];
    }
  }

  function save() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
    } catch (e) {
      window.alert("保存に失敗しました。ブラウザの保存領域が満杯か、プライベートモードの可能性があります。");
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    var form = document.getElementById("admin-form");
    var quoteInput = document.getElementById("admin-quote");
    var nameInput = document.getElementById("admin-name");
    var companyInput = document.getElementById("admin-company");
    var publishedInput = document.getElementById("admin-published");
    var errorMsg = document.getElementById("admin-form-error");
    var submitBtn = document.getElementById("admin-submit-btn");
    var cancelBtn = document.getElementById("admin-cancel-btn");
    var formTitle = document.getElementById("admin-form-title");

    var previewGrid = document.getElementById("admin-preview-grid");
    var previewEmpty = document.getElementById("admin-preview-empty");

    var listEl = document.getElementById("admin-list");
    var listEmpty = document.getElementById("admin-list-empty");

    var generateBtn = document.getElementById("admin-generate-btn");
    var copyBtn = document.getElementById("admin-copy-btn");
    var copyStatus = document.getElementById("admin-copy-status");
    var codeOutput = document.getElementById("admin-code-output");

    load();
    renderAll();

    function resetForm() {
      editingId = null;
      form.reset();
      publishedInput.checked = true;
      formTitle.textContent = "声を追加する";
      submitBtn.textContent = "追加する";
      cancelBtn.hidden = true;
      errorMsg.hidden = true;
    }

    function renderAll() {
      renderList();
      renderPreview();
    }

    function renderPreview() {
      previewGrid.innerHTML = "";
      var published = drafts.filter(function (d) { return d.published; });

      if (published.length === 0) {
        previewEmpty.hidden = false;
        return;
      }
      previewEmpty.hidden = true;

      published.forEach(function (item) {
        var card = document.createElement("div");
        card.className = "testimonial-card";

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
        previewGrid.appendChild(card);
      });
    }

    function renderList() {
      listEl.innerHTML = "";

      if (drafts.length === 0) {
        listEmpty.hidden = false;
        return;
      }
      listEmpty.hidden = true;

      drafts.forEach(function (item, index) {
        var row = document.createElement("div");
        row.className = "admin-list-item" + (item.published ? "" : " is-unpublished");

        var body = document.createElement("div");
        body.className = "admin-list-item-body";

        var publishToggle = document.createElement("label");
        publishToggle.className = "admin-publish-toggle";
        var publishCheckbox = document.createElement("input");
        publishCheckbox.type = "checkbox";
        publishCheckbox.checked = !!item.published;
        publishCheckbox.setAttribute("aria-label", "サイトに掲載する");
        publishCheckbox.addEventListener("change", function () {
          item.published = publishCheckbox.checked;
          save();
          renderAll();
        });
        var badge = document.createElement("span");
        badge.className = "admin-badge " + (item.published ? "is-published" : "is-draft");
        badge.textContent = item.published ? "掲載する" : "下書き（非掲載）";
        publishToggle.appendChild(publishCheckbox);
        publishToggle.appendChild(badge);
        body.appendChild(publishToggle);

        var quote = document.createElement("p");
        quote.className = "admin-list-item-quote";
        quote.textContent = item.quote || "";
        body.appendChild(quote);

        var meta = document.createElement("p");
        meta.className = "admin-list-item-meta";
        var name = item.name && item.name.trim() ? item.name : "匿名";
        var company = item.company && item.company.trim() ? " / " + item.company : "";
        meta.textContent = name + company;
        body.appendChild(meta);

        // 取り込み時の参考情報（関係性・良かった点）。本番には出さず、この管理画面内だけの
        // 参考メモとして表示する。手動追加分にはこれらのフィールドが無いため何も出ない。
        if (item.relation || item.goodPoints) {
          var refInfo = document.createElement("p");
          refInfo.className = "admin-list-item-ref";
          var parts = [];
          if (item.relation) parts.push("関係性: " + item.relation);
          if (item.goodPoints) parts.push("良かった点: " + item.goodPoints);
          refInfo.textContent = parts.join(" ｜ ");
          body.appendChild(refInfo);
        }

        var actions = document.createElement("div");
        actions.className = "admin-list-item-actions";

        var upBtn = document.createElement("button");
        upBtn.type = "button";
        upBtn.textContent = "▲ 上へ";
        upBtn.disabled = index === 0;
        upBtn.addEventListener("click", function () { moveItem(item.id, -1); });
        actions.appendChild(upBtn);

        var downBtn = document.createElement("button");
        downBtn.type = "button";
        downBtn.textContent = "▼ 下へ";
        downBtn.disabled = index === drafts.length - 1;
        downBtn.addEventListener("click", function () { moveItem(item.id, 1); });
        actions.appendChild(downBtn);

        var editBtn = document.createElement("button");
        editBtn.type = "button";
        editBtn.textContent = "編集する";
        editBtn.addEventListener("click", function () { startEdit(item.id); });
        actions.appendChild(editBtn);

        var deleteBtn = document.createElement("button");
        deleteBtn.type = "button";
        deleteBtn.textContent = "削除する";
        deleteBtn.className = "is-danger";
        deleteBtn.addEventListener("click", function () { deleteItem(item.id); });
        actions.appendChild(deleteBtn);

        row.appendChild(body);
        row.appendChild(actions);
        listEl.appendChild(row);
      });
    }

    function moveItem(id, delta) {
      var index = drafts.findIndex(function (d) { return d.id === id; });
      if (index === -1) return;
      var target = index + delta;
      if (target < 0 || target >= drafts.length) return;
      var tmp = drafts[index];
      drafts[index] = drafts[target];
      drafts[target] = tmp;
      save();
      renderAll();
    }

    function startEdit(id) {
      var item = drafts.find(function (d) { return d.id === id; });
      if (!item) return;
      editingId = id;
      quoteInput.value = item.quote || "";
      nameInput.value = item.name || "";
      companyInput.value = item.company || "";
      publishedInput.checked = !!item.published;
      formTitle.textContent = "声を編集する";
      submitBtn.textContent = "更新する";
      cancelBtn.hidden = false;
      errorMsg.hidden = true;
      form.scrollIntoView({ behavior: "smooth", block: "start" });
      quoteInput.focus();
    }

    function deleteItem(id) {
      var item = drafts.find(function (d) { return d.id === id; });
      if (!item) return;
      var label = item.quote ? item.quote.slice(0, 20) + (item.quote.length > 20 ? "…" : "") : "この項目";
      if (!window.confirm("「" + label + "」を削除します。よろしいですか？")) return;
      drafts = drafts.filter(function (d) { return d.id !== id; });
      if (editingId === id) resetForm();
      save();
      renderAll();
    }

    cancelBtn.addEventListener("click", resetForm);

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var quote = quoteInput.value.trim();
      if (!quote) {
        errorMsg.hidden = false;
        quoteInput.focus();
        return;
      }
      errorMsg.hidden = true;

      var values = {
        quote: quote,
        name: nameInput.value.trim(),
        company: companyInput.value.trim(),
        published: publishedInput.checked
      };

      if (editingId !== null) {
        var index = drafts.findIndex(function (d) { return d.id === editingId; });
        if (index !== -1) {
          // 取り込み時に保持した参考情報（関係性・良かった点）などは、このフォームには
          // 入力欄が無いため、元のdraftを土台にしてvaluesで上書きする（丸ごと置き換えると消えてしまう）
          drafts[index] = Object.assign({}, drafts[index], values, { id: editingId });
        }
      } else {
        drafts.push(Object.assign({ id: nextId++ }, values));
      }

      save();
      resetForm();
      renderAll();
    });

    // ---- STEP 4: コード生成 ----

    function jsString(value) {
      return JSON.stringify(value || "");
    }

    function buildTestimonialsFile() {
      var published = drafts.filter(function (d) { return d.published; });

      var itemsText;
      if (published.length === 0) {
        itemsText = "[]";
      } else {
        var blocks = published.map(function (item) {
          var name = item.name && item.name.trim() ? item.name : "匿名";
          return (
            "  {\n" +
            "    quote: " + jsString(item.quote) + ",\n" +
            "    name: " + jsString(name) + ",\n" +
            "    company: " + jsString(item.company) + "\n" +
            "  }"
          );
        });
        itemsText = "[\n" + blocks.join(",\n") + "\n]";
      }

      var showComment = published.length === 0
        ? "// ⚠ 掲載する項目がありません（admin.htmlから追加してください）\n"
        : "// admin.htmlで生成（true=掲載中）\n";

      var showLine = "var SHOW_TESTIMONIALS = " + (published.length > 0 ? "true" : "false") + ";\n";

      return (
        FILE_HEADER +
        "\n" +
        showComment +
        showLine +
        "\n" +
        "var TESTIMONIALS = " + itemsText + ";\n" +
        FILE_FOOTER
      );
    }

    function buildGitHubPrefillUrl(code) {
      var url = GITHUB_NEW_FILE_URL
        + "?filename=" + encodeURIComponent(TESTIMONIALS_PATH)
        + "&value=" + encodeURIComponent(code);
      return url.length <= URL_LENGTH_SAFE_LIMIT ? url : null;
    }

    var publishBtn = document.getElementById("admin-publish-btn");
    var publishStatus = document.getElementById("admin-publish-status");
    var manualFlowDetails = document.getElementById("admin-manual-flow");

    publishBtn.addEventListener("click", function () {
      var code = buildTestimonialsFile();
      var url = buildGitHubPrefillUrl(code);

      if (!url) {
        publishStatus.textContent = "掲載件数が多く、内容が長すぎるため自動リンクが使えません。下の「コードを生成してコピーする」からお進みください。";
        publishStatus.style.color = "#B4562F";
        publishStatus.hidden = false;
        if (manualFlowDetails) manualFlowDetails.open = true;
        manualFlowDetails.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }

      window.open(url, "_blank", "noopener");
      publishStatus.textContent = "新しいタブでGitHubの編集画面を開きました。内容を確認し、ページ下部の緑色の「Commit changes」ボタンを押すとサイトに反映されます。";
      publishStatus.style.color = "";
      publishStatus.hidden = false;
    });

    generateBtn.addEventListener("click", function () {
      var code = buildTestimonialsFile();
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

    // ---- STEP 1: 回答の取り込み（スプレッドシートのコピー&ペースト） ----
    // Googleフォームの回答シートは列順が
    // タイムスタンプ / お名前 / 関係性 / どんな点が良かったか / 一言コメント / 掲載について
    // で固定されている（voice-form.htmlの質問順そのまま）。ここではその前提で列を読み取る。
    // スプレッドシートをコピーした際のクリップボードはタブ区切り(TSV)で、セル内に
    // 改行を含む場合は "..." で囲まれる（CSVと同じ引用ルール）ため、単純な
    // split("\n")/split("\t") ではなく、引用を考慮したパーサーを使う。

    var importPasteEl = document.getElementById("import-paste");
    var importParseBtn = document.getElementById("import-parse-btn");
    var importErrorEl = document.getElementById("import-error");
    var importPreviewWrap = document.getElementById("import-preview");
    var importRowsEl = document.getElementById("import-rows");
    var importCommitBtn = document.getElementById("import-commit-btn");
    var importCommitStatus = document.getElementById("import-commit-status");

    var importedRows = []; // [{ checkbox, nameInput, quoteTextarea, published, excluded }]

    function parseDelimitedText(text, delimiter) {
      var rows = [];
      var row = [];
      var field = "";
      var inQuotes = false;

      for (var i = 0; i < text.length; i++) {
        var ch = text[i];
        if (inQuotes) {
          if (ch === '"') {
            if (text[i + 1] === '"') { field += '"'; i++; }
            else { inQuotes = false; }
          } else {
            field += ch;
          }
          continue;
        }
        if (ch === '"') {
          inQuotes = true;
        } else if (ch === delimiter) {
          row.push(field);
          field = "";
        } else if (ch === "\n") {
          row.push(field);
          rows.push(row);
          row = [];
          field = "";
        } else if (ch === "\r") {
          // 改行はこの後の \n 側で処理するため無視
        } else {
          field += ch;
        }
      }
      if (field.length || row.length) {
        row.push(field);
        rows.push(row);
      }
      // 完全な空行（全セル空欄）は除外
      return rows.filter(function (r) {
        return r.some(function (cell) { return cell.trim() !== ""; });
      });
    }

    function classifyPublishPref(rawPref) {
      var pref = (rawPref || "").trim();
      if (pref.indexOf("掲載しないで") !== -1) {
        return { published: false, badgeClass: "is-draft", label: "掲載不可", warning: "この回答者は「今回は掲載しないで欲しい」を選んでいます。取り込む場合も掲載は控えてください。", blocked: true };
      }
      if (pref.indexOf("イニシャル") !== -1) {
        return { published: false, badgeClass: "is-draft", label: "イニシャル希望", warning: "「イニシャルなら可」の回答です。下の「お名前」を本名からイニシャルに書き換えてから掲載してください。", blocked: false };
      }
      if (pref.indexOf("名前付き") !== -1) {
        return { published: true, badgeClass: "is-published", label: "名前付きOK", warning: "", blocked: false };
      }
      return { published: false, badgeClass: "is-draft", label: "掲載について不明", warning: "「掲載について」の回答を認識できませんでした。内容を確認のうえ、掲載可否を判断してください。", blocked: false };
    }

    // 行の2次元配列(各行が[タイムスタンプ, お名前, 関係性, どんな点が良かったか, 一言コメント, 掲載について])を
    // renderImportRows() が扱える形のオブジェクト配列に変換する。
    // 貼り付けパース(parseImportRows)と自動取得API(fetchFromSheetApi)の両方から共通で使う。
    function rowsArrayToImportObjects(raw) {
      if (!raw || !raw.length) return [];

      // 1行目がヘッダー（「タイムスタンプ」など数字を含まない）なら除外する
      if (raw[0][0] != null && !/\d/.test(String(raw[0][0]))) {
        raw = raw.slice(1);
      }

      return raw.map(function (cols) {
        return {
          timestamp: String(cols[0] || "").trim(),
          name: String(cols[1] || "").trim(),
          relation: String(cols[2] || "").trim(),
          goodPoints: String(cols[3] || "").trim(),
          comment: String(cols[4] || "").trim(),
          publishPrefRaw: String(cols[5] || "").trim(),
          columnCount: cols.length
        };
      });
    }

    function parseImportRows(text) {
      var raw = parseDelimitedText(text, "\t");
      return rowsArrayToImportObjects(raw);
    }

    function renderImportRows(rows) {
      importRowsEl.innerHTML = "";
      importedRows = [];

      rows.forEach(function (row) {
        var pref = classifyPublishPref(row.publishPrefRaw);

        var card = document.createElement("div");
        card.className = "import-row-card" + (pref.blocked ? " is-excluded" : "");

        var checkWrap = document.createElement("label");
        checkWrap.className = "import-row-check";
        var checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = !pref.blocked;
        var checkLabel = document.createElement("span");
        checkLabel.textContent = "取り込む";
        checkWrap.appendChild(checkbox);
        checkWrap.appendChild(checkLabel);

        var body = document.createElement("div");
        body.className = "import-row-body";

        var meta = document.createElement("div");
        meta.className = "import-row-meta";
        var badge = document.createElement("span");
        badge.className = "admin-badge " + pref.badgeClass;
        badge.textContent = pref.label;
        meta.appendChild(badge);
        if (row.timestamp) meta.appendChild(document.createTextNode("日時: " + row.timestamp));
        if (row.relation) meta.appendChild(document.createTextNode("関係性: " + row.relation));
        if (row.columnCount !== 6) {
          var colWarn = document.createElement("span");
          colWarn.style.color = "#B4562F";
          colWarn.textContent = "⚠ 列数が想定(6列)と異なります(" + row.columnCount + "列)";
          meta.appendChild(colWarn);
        }
        body.appendChild(meta);

        var nameField = document.createElement("div");
        nameField.className = "import-row-field";
        var nameLabel = document.createElement("label");
        nameLabel.textContent = "お名前";
        var nameInput = document.createElement("input");
        nameInput.type = "text";
        nameInput.value = row.name;
        nameField.appendChild(nameLabel);
        nameField.appendChild(nameInput);
        body.appendChild(nameField);

        if (row.goodPoints) {
          var gp = document.createElement("div");
          gp.className = "import-row-goodpoints";
          gp.textContent = "良かった点: " + row.goodPoints;
          body.appendChild(gp);
        }

        var quoteField = document.createElement("div");
        quoteField.className = "import-row-field";
        quoteField.style.marginTop = "6px";
        var quoteLabel = document.createElement("label");
        quoteLabel.textContent = "一言コメント（掲載文になります）";
        var quoteTextarea = document.createElement("textarea");
        quoteTextarea.value = row.comment;
        if (!row.comment) {
          quoteTextarea.placeholder = "コメント欄が空欄でした。上の「良かった点」を参考に、掲載文を書いてください。";
        }
        quoteField.appendChild(quoteLabel);
        quoteField.appendChild(quoteTextarea);
        body.appendChild(quoteField);

        if (pref.warning) {
          var warn = document.createElement("p");
          warn.className = "import-row-warning" + (pref.blocked ? " is-blocked" : "");
          warn.textContent = "⚠ " + pref.warning;
          body.appendChild(warn);
        }

        card.appendChild(checkWrap);
        card.appendChild(body);
        importRowsEl.appendChild(card);

        importedRows.push({
          checkbox: checkbox,
          nameInput: nameInput,
          quoteTextarea: quoteTextarea,
          published: pref.published,
          relation: row.relation,
          goodPoints: row.goodPoints
        });
      });
    }

    // ---- 自動取得（Apps Script API 経由。設定手順はREADME.md参照） ----

    var importFetchBtn = document.getElementById("import-fetch-btn");
    var importFetchStatus = document.getElementById("import-fetch-status");

    function showFetchStatus(text, isError) {
      importFetchStatus.textContent = text;
      importFetchStatus.style.color = isError ? "#C23A3A" : "";
      importFetchStatus.hidden = false;
    }

    function fetchFromSheetApi() {
      // (↑ここは編集不要。ファイル冒頭で設定したSHEET_API_URLを読み取って使っているだけ)
      if (!SHEET_API_URL) {
        showFetchStatus("自動取得の設定がまだ完了していません。README.mdの「④ 周囲からの声の追加・公開」の手順に従ってApps Scriptを設置するか、下の「貼り付けで取り込む」をご利用ください。", true);
        return;
      }

      importFetchBtn.disabled = true;
      showFetchStatus("取得中…", false);

      fetch(SHEET_API_URL)
        .then(function (res) {
          if (!res.ok) throw new Error("HTTP " + res.status);
          return res.json();
        })
        .then(function (raw) {
          if (!Array.isArray(raw)) throw new Error("想定外の形式のデータが返されました");
          var rows = rowsArrayToImportObjects(raw);
          if (!rows.length) {
            showFetchStatus("取得できましたが、表示できる回答がありませんでした（すべて「今回は掲載しないで欲しい」回答だった可能性があります）。", false);
            return;
          }
          importFetchStatus.hidden = true;
          renderImportRows(rows);
          importPreviewWrap.hidden = false;
          importCommitStatus.hidden = true;
          importPreviewWrap.scrollIntoView({ behavior: "smooth", block: "start" });
        })
        .catch(function () {
          showFetchStatus("取得に失敗しました。Apps Scriptのデプロイ設定（アクセスできるユーザーが「全員」になっているか）をご確認いただくか、下の「貼り付けで取り込む」をご利用ください。", true);
        })
        .then(function () {
          importFetchBtn.disabled = false;
        });
    }

    importFetchBtn.addEventListener("click", fetchFromSheetApi);

    importParseBtn.addEventListener("click", function () {
      var text = importPasteEl.value;
      if (!text || !text.trim()) {
        importErrorEl.textContent = "貼り付け内容が空です。スプレッドシートの回答行をコピーしてから貼り付けてください。";
        importErrorEl.hidden = false;
        importPreviewWrap.hidden = true;
        return;
      }

      var rows = parseImportRows(text);
      if (!rows.length) {
        importErrorEl.textContent = "内容を読み取れませんでした。スプレッドシートのセルを選択してコピーしたものを貼り付けているかご確認ください。";
        importErrorEl.hidden = false;
        importPreviewWrap.hidden = true;
        return;
      }

      importErrorEl.hidden = true;
      renderImportRows(rows);
      importPreviewWrap.hidden = false;
      importCommitStatus.hidden = true;
      importPreviewWrap.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    importCommitBtn.addEventListener("click", function () {
      var added = 0;
      importedRows.forEach(function (row) {
        if (!row.checkbox.checked) return;
        var quote = row.quoteTextarea.value.trim();
        if (!quote) return; // 掲載文が空のままの行は取り込まない（書き忘れ防止）
        drafts.push({
          id: nextId++,
          quote: quote,
          name: row.nameInput.value.trim(),
          company: "",
          published: row.published,
          relation: row.relation,
          goodPoints: row.goodPoints
        });
        added++;
      });

      if (added === 0) {
        importCommitStatus.textContent = "取り込める行がありませんでした（チェック漏れ、または一言コメントが未入力の行はスキップされます）。";
        importCommitStatus.hidden = false;
        return;
      }

      save();
      renderAll();

      importCommitStatus.textContent = added + "件を取り込みました。下の「STEP 3」の一覧に追加されています（会社名の入力や内容の微調整は一覧の「編集する」から行えます）。";
      importCommitStatus.hidden = false;
      importPasteEl.value = "";
      importPreviewWrap.hidden = true;
      importRowsEl.innerHTML = "";
      importedRows = [];
    });
  });
})();
