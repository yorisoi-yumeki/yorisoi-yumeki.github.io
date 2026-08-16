/**
 * edit-mode.js
 * index.html の文章を、ページ上で直接クリックして編集できるようにするツール。
 *
 * 通常の閲覧では何もしない。URLの末尾に "?edit=1" を付けてアクセスした時だけ
 * 動作する（admin.htmlの「ページ内の文章を編集する」ボタンから開く）。
 *
 * 使い方：
 *   1. admin.htmlの「ページ内の文章を編集する」ボタンから index.html?edit=1 を開く
 *   2. 文章をクリックして直接書き換える（見出し・本文・カード内の文章など）
 *   3. 画面右下の「変更をコードとして書き出す」を押す
 *   4. 表示されたコードをコピーし、GitHub上のindex.html編集画面に貼り付けて
 *      Commit changes（admin.htmlのSTEP4と同じ操作）
 *
 * 絞り込みボタンやフォーム入力欄など、クリックで動作する要素は編集対象から
 * 除外している（誤操作防止のため）。
 */
(function () {
  "use strict";

  if (!new URLSearchParams(location.search).has("edit")) return;

  var EDITABLE_SELECTOR = [
    "h1", "h2", "h3", "h4", "p", "li", "a",
    ".career-headline", ".career-company", ".career-tag",
    ".testimonial-quote", ".testimonial-meta", ".testimonial-tag", ".testimonial-tags-label",
    ".domain-tag"
  ].join(", ");

  var EXCLUDE_ANCESTOR_SELECTOR = ".career-filter, .testimonial-filter, .chip-group, .exp-bars, form";

  document.addEventListener("DOMContentLoaded", function () {
    // 経歴カードは編集中だけ全部開いておく（閉じたままだと詳細文が編集できないため）。
    // 書き出し時に元の開閉状態へ戻す。
    var careerCards = document.querySelectorAll("details.career-card");
    var originalOpenStates = [];
    careerCards.forEach(function (card) {
      originalOpenStates.push({ card: card, wasOpen: card.open });
      card.open = true;
    });

    // 貼り付け時、他のアプリ（Word/Notion/Googleドキュメント等）由来の書式・タグが
    // そのまま入り込むと、文字サイズの崩れや無効なHTMLの原因になる。プレーンテキストとして
    // 挿入することでこれを防ぐ。
    function handlePaste(event) {
      event.preventDefault();
      var text = (event.clipboardData || window.clipboardData).getData("text/plain");
      document.execCommand("insertText", false, text);
    }

    // Enterキーは既定だと新しい<div>や<p>をネストして作ってしまい、見出し(h4)などの中に
    // 無効な入れ子構造ができてしまう。代わりに<br>を挿入することで、常に1つの要素の
    // ままにする。
    function handleEnterKey(event) {
      if (event.key !== "Enter") return;
      // 日本語入力などIME変換中は、変換候補を確定するためにEnterを押す。
      // このEnterまで改行として奪ってしまうと、変換確定と同時に意図しない
      // 改行が入ってしまうため、変換確定中のEnterは素通りさせる
      // （isComposingが取れないブラウザ向けにkeyCode 229もあわせて見ておく）。
      if (event.isComposing || event.keyCode === 229) return;
      event.preventDefault();
      document.execCommand("insertLineBreak");
    }

    var editableEls = [];
    document.querySelectorAll(EDITABLE_SELECTOR).forEach(function (el) {
      if (el.closest(EXCLUDE_ANCESTOR_SELECTOR)) return;
      el.setAttribute("contenteditable", "true");
      el.addEventListener("paste", handlePaste);
      el.addEventListener("keydown", handleEnterKey);
      editableEls.push(el);
    });

    var style = document.createElement("style");
    style.id = "edit-mode-style";
    style.textContent =
      '[contenteditable="true"]:hover { outline: 1px dashed #2563eb; outline-offset: 2px; cursor: text; }\n' +
      '[contenteditable="true"]:focus { outline: 2px solid #2563eb; outline-offset: 2px; }\n' +
      '#edit-mode-toolbar { position: fixed; right: 16px; bottom: 16px; z-index: 9999; background: #0B1B33; ' +
      'color: #fff; padding: 14px; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.3); max-width: 420px; font-family: sans-serif; }\n' +
      '#edit-mode-toolbar p { margin: 0 0 8px; font-size: 0.8rem; }\n' +
      '#edit-mode-toolbar button { font: inherit; font-size: 0.82rem; font-weight: 700; cursor: pointer; ' +
      'border-radius: 8px; padding: 8px 14px; border: none; margin-right: 8px; margin-top: 6px; }\n' +
      '#edit-mode-generate { background: #2563eb; color: #fff; }\n' +
      '#edit-mode-copy { background: #fff; color: #0B1B33; }\n' +
      '#edit-mode-bold, #edit-mode-highlight { background: rgba(255,255,255,0.15); color: #fff; }\n' +
      '#edit-mode-bold:hover, #edit-mode-highlight:hover { background: rgba(255,255,255,0.28); }\n' +
      '#edit-mode-output { width: 100%; box-sizing: border-box; margin-top: 8px; font-size: 0.72rem; ' +
      'font-family: "SFMono-Regular", Consolas, monospace; }\n';
    document.head.appendChild(style);

    var toolbar = document.createElement("div");
    toolbar.id = "edit-mode-toolbar";
    toolbar.innerHTML =
      "<p><strong>文章の編集モード</strong><br>文章をクリックして書き換えたら、下のボタンでコードを書き出してください。範囲を選択して「太字」「ハイライト」も使えます。</p>" +
      '<button type="button" id="edit-mode-bold">太字</button>' +
      '<button type="button" id="edit-mode-highlight">ハイライト</button>' +
      '<button type="button" id="edit-mode-generate">変更をコードとして書き出す</button>';
    document.body.appendChild(toolbar);

    document.getElementById("edit-mode-bold").addEventListener("click", function () {
      document.execCommand("bold");
    });

    function findHighlightAncestor(node) {
      while (node && node.nodeType) {
        if (node.nodeType === Node.ELEMENT_NODE && node.classList && node.classList.contains("num-highlight")) {
          return node;
        }
        node = node.parentNode;
      }
      return null;
    }

    // ドラッグ選択なら commonAncestorContainer は通常spanの中のテキストノードになるが、
    // トリプルクリックや要素単位の選択では選択範囲の親要素そのものになることがある。
    // その場合でも「中身がハイライトspan1つだけ」なら、そのspanを対象とみなす。
    function resolveHighlightTarget(range) {
      var direct = findHighlightAncestor(range.commonAncestorContainer);
      if (direct) return direct;
      var container = range.commonAncestorContainer;
      if (container.nodeType === Node.ELEMENT_NODE && container.children.length === 1) {
        var onlyChild = container.children[0];
        if (onlyChild.classList && onlyChild.classList.contains("num-highlight")) return onlyChild;
      }
      return null;
    }

    // 選択範囲を<span class="num-highlight">で囲む。このクラスは経歴カード等で
    // 既に使われている「青字太字」の強調スタイルをそのまま再利用する（新しいCSSは増やさない）。
    // 選択範囲が既にハイライト済み（.num-highlightの中）の場合は、逆に解除する
    // （spanを外して中身をその場に展開する）トグル動作にする。
    document.getElementById("edit-mode-highlight").addEventListener("click", function () {
      var sel = window.getSelection();
      if (!sel.rangeCount || sel.isCollapsed) return;
      var range = sel.getRangeAt(0);

      var existingHighlight = resolveHighlightTarget(range);
      if (existingHighlight) {
        var parent = existingHighlight.parentNode;
        while (existingHighlight.firstChild) {
          parent.insertBefore(existingHighlight.firstChild, existingHighlight);
        }
        parent.removeChild(existingHighlight);
        return;
      }

      var span = document.createElement("span");
      span.className = "num-highlight";
      span.appendChild(range.extractContents());
      range.insertNode(span);
      sel.removeAllRanges();
      var newRange = document.createRange();
      newRange.selectNodeContents(span);
      sel.addRange(newRange);
    });

    // 保険：paste/Enterキーの対策をすり抜けて<div>やstyle付きの要素が紛れ込んでいた場合でも、
    // 書き出し時に最終防衛として安全なタグだけを残す構造へ組み直す。
    // 許可するのは：BR、STRONG/B/EM/I（書式）、class が ALLOWED_SPAN_CLASS_TOKENS だけで
    // 構成されるSPAN（ハイライト・サイト既存の装飾）、IMG（hero-badgeの写真など、imgを含む
    // aタグの保険）、コメントノード（写真差し替え手順などの運用コメント）。
    // DIV/Pはタグ自体を捨てて前後に<br>を入れ、それ以外の未知タグ・style付き要素・
    // data-path-to-node等の異物はタグの皮だけ剥いで中身（テキスト・許可された子要素）を残す。
    var ALLOWED_INLINE_TAGS = { STRONG: "strong", B: "b", EM: "em", I: "i" };
    // num-highlight: 編集モードのハイライト機能用。hl: ヒーロー見出しの強調色。
    // en: 英語表記部分の装飾。personality-highlight系: Personalityセクションの強調（複数
    // クラスを同時に持つため、完全一致ではなく「全クラスがこのリストに含まれるか」で判定する）。
    var ALLOWED_SPAN_CLASS_TOKENS = [
      "num-highlight", "hl", "en",
      "personality-highlight", "personality-highlight--amber", "personality-highlight--green"
    ];

    function isAllowedSpanClass(className) {
      if (!className || !className.trim()) return false;
      var tokens = className.trim().split(/\s+/);
      return tokens.every(function (t) { return ALLOWED_SPAN_CLASS_TOKENS.indexOf(t) !== -1; });
    }

    function cleanNode(node) {
      if (node.nodeType === Node.TEXT_NODE) {
        return [document.createTextNode(node.textContent)];
      }
      if (node.nodeType === Node.COMMENT_NODE) {
        return [document.createComment(node.textContent)];
      }
      if (node.nodeType !== Node.ELEMENT_NODE) return [];

      var tag = node.tagName;
      if (tag === "BR") return [document.createElement("br")];
      if (tag === "IMG") return [node.cloneNode(false)];

      var children = [];
      Array.prototype.forEach.call(node.childNodes, function (child) {
        children = children.concat(cleanNode(child));
      });

      if (tag === "DIV" || tag === "P") {
        return [document.createElement("br")].concat(children).concat([document.createElement("br")]);
      }
      if (ALLOWED_INLINE_TAGS[tag]) {
        var inlineEl = document.createElement(ALLOWED_INLINE_TAGS[tag]);
        children.forEach(function (c) { inlineEl.appendChild(c); });
        return [inlineEl];
      }
      if (tag === "SPAN" && isAllowedSpanClass(node.className)) {
        var span = document.createElement("span");
        span.className = node.className.trim();
        children.forEach(function (c) { span.appendChild(c); });
        return [span];
      }
      // 許可されていないタグは皮を剥いで中身だけ残す
      return children;
    }

    function sanitizeEditableElement(el) {
      var hasForeignMarkup = el.querySelector("div, p, [data-path-to-node], [style]") ||
        Array.prototype.some.call(el.querySelectorAll("span"), function (s) { return !isAllowedSpanClass(s.className); });
      if (!hasForeignMarkup) return;
      var cleaned = [];
      Array.prototype.forEach.call(el.childNodes, function (child) {
        cleaned = cleaned.concat(cleanNode(child));
      });
      while (cleaned.length && cleaned[0].tagName === "BR") cleaned.shift();
      while (cleaned.length && cleaned[cleaned.length - 1].tagName === "BR") cleaned.pop();
      while (el.firstChild) el.removeChild(el.firstChild);
      cleaned.forEach(function (n) { el.appendChild(n); });
    }

    document.getElementById("edit-mode-generate").addEventListener("click", function () {
      // クローン上でcontenteditable属性・ツールバー・編集用styleを取り除いてから書き出す
      // （実際のページ・editableEls・originalOpenStatesはそのまま、編集を続けられる）。
      var clone = document.documentElement.cloneNode(true);
      clone.querySelectorAll('[contenteditable]').forEach(function (el) {
        sanitizeEditableElement(el);
        el.removeAttribute("contenteditable");
      });

      // #testimonial-list はtestimonials.jsが、#testimonial-filter-groups は
      // main.jsのinitTestimonialFilter()が、どちらもページ読み込みのたびに動的に
      // 生成・追記する（generated data-driven要素）。ここで書き出すHTMLに生成済みの
      // 中身をそのまま焼き込んでしまうと、次にページを開いた時にJSがその上へさらに
      // 追加してしまい、表示・絞り込みボタンが二重・三重に増えていく（実際に両方で
      // この不具合が起きていたため、空に戻し、#testimonial-filterもJS介入前の
      // 初期状態(hidden)に戻してから書き出す）。
      var clonedTestimonialList = clone.querySelector("#testimonial-list");
      if (clonedTestimonialList) clonedTestimonialList.innerHTML = "";
      var clonedFilterGroups = clone.querySelector("#testimonial-filter-groups");
      if (clonedFilterGroups) clonedFilterGroups.innerHTML = "";
      var clonedFilterWrap = clone.querySelector("#testimonial-filter");
      if (clonedFilterWrap) clonedFilterWrap.hidden = true;
      var cloneToolbar = clone.querySelector("#edit-mode-toolbar");
      if (cloneToolbar) cloneToolbar.remove();
      var cloneStyle = clone.querySelector("#edit-mode-style");
      if (cloneStyle) cloneStyle.remove();
      // 経歴カードの開閉状態を、編集開始前の状態に戻して書き出す
      originalOpenStates.forEach(function (state) {
        var idAttr = state.card.getAttribute("id");
        if (!idAttr) return;
        var cloneCard = clone.querySelector("#" + CSS.escape(idAttr));
        if (cloneCard) cloneCard.open = state.wasOpen;
      });

      var code = "<!doctype html>\n" + clone.outerHTML;

      var existingOutput = document.getElementById("edit-mode-output-wrap");
      if (existingOutput) existingOutput.remove();

      var outputWrap = document.createElement("div");
      outputWrap.id = "edit-mode-output-wrap";
      outputWrap.innerHTML =
        "<p>コピーして、<a href=\"https://github.com/yorisoi-yumeki/yorisoi-yumeki.github.io/edit/main/index.html\" target=\"_blank\" rel=\"noopener\" style=\"color:#8ab4ff;\">GitHub上のindex.html編集画面</a>を開き、中身を全選択（Ctrl+A / ⌘+A）して削除してから貼り付け、Commit changesしてください。</p>" +
        '<button type="button" id="edit-mode-copy">コピーする</button>' +
        '<span id="edit-mode-copy-status" style="font-size:0.78rem; margin-left:6px;"></span>' +
        '<textarea id="edit-mode-output" rows="8" readonly></textarea>';
      toolbar.appendChild(outputWrap);

      var outputEl = document.getElementById("edit-mode-output");
      outputEl.value = code;

      document.getElementById("edit-mode-copy").addEventListener("click", function () {
        navigator.clipboard.writeText(code).then(function () {
          document.getElementById("edit-mode-copy-status").textContent = "コピーしました！";
        }).catch(function () {
          outputEl.focus();
          outputEl.select();
          document.getElementById("edit-mode-copy-status").textContent = "自動コピーに失敗しました。手動で選択してコピーしてください。";
        });
      });
    });
  });
})();
