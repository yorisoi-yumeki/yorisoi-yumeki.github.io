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

  // ---- testimonials.js のうち、STEP 3で生成するコードでも変えずに使う部分 ----

  var FILE_HEADER =
    "/**\n" +
    " * testimonials.js\n" +
    " * 「周囲からの声」セクション（お客様・同僚・上司など、様々な立場からの声）のデータと表示制御。\n" +
    " *\n" +
    " * 【運用方法】\n" +
    " * admin.html（管理画面）で内容を編集し、「コードを生成」で書き出したこのファイル一式を\n" +
    " * GitHub上のこのファイルの編集画面に貼り付けて保存する（README.md「④」参照）。\n" +
    " *\n" +
    " * 入力値は textContent で挿入しているため、HTMLタグを含む文字列を貼り付けても\n" +
    " * 画面が壊れたり意図しないコードとして実行されたりしません（安全な実装）。\n" +
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
    "    // 実際の声がまだ無い場合でも、セクション自体（と「声を届ける」導線）は\n" +
    "    // 表示したまま、代わりに空状態メッセージを見せる（voice-form.htmlへの\n" +
    "    // 投稿を後押しするため、以前のようにセクションごと非表示にはしない）。\n" +
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
    "    // 動的に追加したカードにもフェードイン演出を適用する\n" +
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

        var badge = document.createElement("span");
        badge.className = "admin-badge " + (item.published ? "is-published" : "is-draft");
        badge.textContent = item.published ? "掲載する" : "下書き（非掲載）";
        body.appendChild(badge);

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
          drafts[index] = Object.assign({ id: editingId }, values);
        }
      } else {
        drafts.push(Object.assign({ id: nextId++ }, values));
      }

      save();
      resetForm();
      renderAll();
    });

    // ---- STEP 3: コード生成 ----

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
        ? "// ⚠ 掲載する項目がありません（下は false のままにしています）。\n" +
          "// admin.htmlで「掲載する」をオンにした項目を作ると、ここが自動的に true になります。\n"
        : "// 推薦文が2〜3件集まったら true に変更してください（現在は自動的に true になっています）\n";

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
  });
})();
