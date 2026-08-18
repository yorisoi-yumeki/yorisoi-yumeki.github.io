/**
 * main.js
 * サイト全体の挙動（progressive enhancement）。
 * - すべてのコンテンツはJSなしでも表示される前提で、JSは「演出の上乗せ」のみを担当する。
 */
(function () {
  "use strict";

  // JSが動いていることを示すフラグ。CSS側は html.js が付いた場合のみフェード演出を有効化する。
  document.documentElement.classList.add("js");

  var prefersReducedMotion = window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

  // initCareerFilter()が定義した実装に差し替えられる（絞り込み機能が無効な場合はno-opのまま）。
  // setCareerFilterAxis("all", []) で「すべて表示」に戻す。
  // setCareerFilterAxis("role", ["カスタマーサクセス"]) のように渡すと、他の軸の選択は
  // すべて解除したうえで、指定した軸をその値だけに絞り込む（ボタンのactive状態も連動）。
  var setCareerFilterAxis = function () {};

  /* 職務経歴カードのタグは軸ごとに data-method / data-role / data-skill / data-target /
   * data-stance / data-employment / data-audience-industry / data-audience-job という
   * 別々の属性に分けて持たせてある（1つの属性に全部を混ぜると「営業手法」×「相手の業界」のような
   * 異なる軸の組み合わせ絞り込みが意味を成さなくなるため）。
   * filters は { 軸名: [選択値, ...], ... } の形。軸内はOR、軸間はANDで判定する。
   * 値が空配列の軸は「その軸は絞り込みに参加していない」= 常に一致とみなす。
   */
  function cardMatchesFilters(card, filters) {
    return Object.keys(filters).every(function (axis) {
      var selected = filters[axis];
      if (!selected || !selected.length) return true;
      var cardValues = (card.getAttribute("data-" + axis) || "").split(" ");
      return selected.some(function (v) {
        return cardValues.indexOf(v) !== -1;
      });
    });
  }

  // 「12年間の経験内容」バーのタグ→対応する軸の対応表。
  // バー側は常に単一タグでの絞り込みなので、そのタグがどの軸に属するかだけ分かればよい。
  var TAG_AXIS_MAP = {
    "対法人": "target",
    "対個人": "target",
    "新規開拓": "role",
    "カスタマーサクセス": "role",
    "マネジメント・育成": "role",
    "プレイヤー": "stance",
    "正社員・派遣": "employment",
    "業務委託": "employment"
  };

  /* ---------------- Fade-in on scroll ---------------- */
  function initFadeIn() {
    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      // reduced-motion環境 or 非対応ブラウザでは、全要素を即座に表示状態にする
      document.querySelectorAll(".fade-target").forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "-10% 0px", threshold: 0.05 }
    );

    document.querySelectorAll(".fade-target").forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ---------------- 職務経歴カードの「もっと見る」展開 ---------------- */
  function initCareerExpander() {
    var btn = document.getElementById("career-more-btn");
    var grid = document.getElementById("career-grid");
    if (!btn || !grid) return;
    btn.addEventListener("click", function () {
      grid.classList.add("is-expanded");
      btn.classList.add("is-hidden");
    });
  }

  /* ---------------- 周囲の声カードの「もっと見る」展開 ----------------
   * initCareerExpander()と同型（testimonials.jsが7件目以降のカードに
   * .testimonial-extraを付与している前提）。 */
  function initTestimonialExpander() {
    var btn = document.getElementById("testimonial-more-btn");
    var grid = document.getElementById("testimonial-list");
    if (!btn || !grid) return;
    btn.addEventListener("click", function () {
      grid.classList.add("is-expanded");
      btn.classList.add("is-hidden");
    });
  }

  /* ---------------- 「実績を積んできた企業」ロゴ → 経歴カードへジャンプ ----------------
   * クリックされた企業名から対応する職務経歴カード（<details id="career-xxx">）を開き、
   * スムーズスクロールで表示する。対象が「もっと見る」で隠れている場合は先に展開する。
   * JSが動かない場合でも href="#career-xxx" は残るため、最低限ページ内ジャンプは機能する。
   */
  function initLogoJumpLinks() {
    var links = document.querySelectorAll(".logo-pill[href^='#career-']");
    if (!links.length) return;

    var grid = document.getElementById("career-grid");
    var moreBtn = document.getElementById("career-more-btn");

    links.forEach(function (link) {
      link.addEventListener("click", function (event) {
        var id = link.getAttribute("href").slice(1);
        var target = document.getElementById(id);
        if (!target) return; // 対応するカードが見つからなければ通常のアンカー動作に任せる

        event.preventDefault();

        if (target.classList.contains("career-extra") && grid && !grid.classList.contains("is-expanded")) {
          grid.classList.add("is-expanded");
          if (moreBtn) moreBtn.classList.add("is-hidden");
        }
        if (target.style.display === "none") {
          setCareerFilterAxis("all", []); // 絞り込みで隠れている場合は「すべて表示」に戻す
        }

        target.open = true;
        target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "center" });

        target.classList.add("is-highlighted");
        window.setTimeout(function () {
          target.classList.remove("is-highlighted");
        }, 1600);
      });
    });
  }

  /* ---------------- 「12年間の経験内容」バー → 経歴カードの絞り込み ----------------
   * バー内のラベル（例: カスタマーサクセス、マネジメント）のうち、対応する経歴カードが
   * 明確に存在するものだけをボタン化してある（data-tag属性）。クリックすると、
   * 下部の「職務経歴・支援実績」の絞り込み（career-filter）をそのタグ1つに設定し、
   * 該当カードだけが表示された状態にした上でスクロールする。
   */
  function initExpBarJumpLinks() {
    var buttons = document.querySelectorAll(".exp-bar-fill-label.is-jump[data-tag]");
    if (!buttons.length) return;

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var tag = btn.getAttribute("data-tag");
        var axis = TAG_AXIS_MAP[tag];
        if (!axis) return;

        var filter = {};
        filter[axis] = [tag];
        var matches = Array.prototype.filter.call(
          document.querySelectorAll(".career-card"),
          function (card) { return cardMatchesFilters(card, filter); }
        );
        if (!matches.length) return;

        setCareerFilterAxis(axis, [tag]);

        matches.forEach(function (card) {
          card.open = true;
          card.classList.add("is-highlighted");
          window.setTimeout(function () {
            card.classList.remove("is-highlighted");
          }, 1600);
        });

        matches[0].scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "center" });
      });
    });
  }

  /* ---------------- 「精通している業界・職種」チップ → 経歴カードの絞り込み ----------------
   * 経験バーのボタンと同じ「クリックしたら単一条件に絞り込む（既存の選択は解除）」という
   * ジャンプ的な挙動。ただしこのチップ自身が既に選択中の場合はトグルで解除し「すべて表示」に
   * 戻す（選択済みのタブをもう一度押したら選択解除できるようにするため）。
   * 該当カードが無い場合でも絞り込み自体は反映し、空状態メッセージが
   * 見える位置までスクロールする（「その軸はまだ詳細な事例として書けていない」という
   * 正直な状態を隠さない）。
   */
  function initDomainChipJumpLinks() {
    var chips = document.querySelectorAll(".chip[data-axis]");
    if (!chips.length) return;

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        var axis = chip.getAttribute("data-axis");
        var value = chip.getAttribute("data-value");

        if (chip.classList.contains("is-active")) {
          setCareerFilterAxis("all", []);
          return;
        }

        var filter = {};
        filter[axis] = [value];
        var matches = Array.prototype.filter.call(
          document.querySelectorAll(".career-card"),
          function (card) { return cardMatchesFilters(card, filter); }
        );

        setCareerFilterAxis(axis, [value]);

        var grid = document.getElementById("career-grid");
        if (!matches.length) {
          if (grid) grid.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
          return;
        }

        matches.forEach(function (card) {
          card.open = true;
          card.classList.add("is-highlighted");
          window.setTimeout(function () {
            card.classList.remove("is-highlighted");
          }, 1600);
        });
        matches[0].scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "center" });
      });
    });
  }

  /* ---------------- 職務経歴・支援実績の絞り込み ----------------
   * career-filterは軸ごとにグループ化されたボタン群（営業手法／役割／スキル／相手の業界／
   * 相手の職種／対象・スタンス）で構成される。同じ軸内の複数選択はOR、異なる軸を
   * またぐ選択はAND（cardMatchesFiltersを参照）。
   * 絞り込み中は「もっと見る」で隠れているカードも自動展開する。表示・非表示の最終判断は
   * CSSクラスの詳細度に頼らず、JS側で直接 style.display を操作する（過去にCSS詳細度の
   * 衝突でこの種の表示制御が壊れたことがあるため、状態が増えても再発しないようにするため）。
   * setCareerFilterAxis を外部（ロゴ/経験バーのジャンプ機能）からも呼べるようにしている。
   */
  function initCareerFilter() {
    var filterBar = document.getElementById("career-filter");
    var grid = document.getElementById("career-grid");
    if (!filterBar || !grid) return;

    var resetBtn = filterBar.querySelector(".career-filter-reset");
    var buttons = filterBar.querySelectorAll(".career-filter-btn");
    var emptyMsg = document.getElementById("career-filter-empty");
    var moreBtn = document.getElementById("career-more-btn");
    var activeFilters = {}; // { 軸名: [選択値, ...] }

    /* 絞り込みボタン群（営業手法／役割／…の35個のボタン）は数が多く画面を圧迫するため、
     * 既定では折りたたんでおき、「絞り込む」ボタンを押した時だけ展開する。
     * JSが動かない環境ではこの折りたたみ自体を行わない（＝常に全ボタンが見える）ことで、
     * 「JSなしでもコンテンツは表示される」という方針を守る。 */
    var toggleBtn = document.getElementById("career-filter-toggle");
    var groupsWrap = document.getElementById("career-filter-groups");
    var toggleLabel = toggleBtn && toggleBtn.querySelector(".career-filter-toggle-label");

    function setGroupsCollapsed(collapsed) {
      if (!toggleBtn || !groupsWrap) return;
      groupsWrap.classList.toggle("is-collapsed", collapsed);
      toggleBtn.setAttribute("aria-expanded", String(!collapsed));
      if (toggleLabel) toggleLabel.textContent = collapsed ? "絞り込む" : "閉じる";
    }

    if (toggleBtn && groupsWrap) {
      setGroupsCollapsed(true); // 初期表示は折りたたみ
      toggleBtn.addEventListener("click", function () {
        setGroupsCollapsed(!groupsWrap.classList.contains("is-collapsed"));
      });
    }

    function isEngaged() {
      return Object.keys(activeFilters).some(function (axis) {
        return (activeFilters[axis] || []).length > 0;
      });
    }

    function updateButtonStates() {
      var engaged = isEngaged();
      if (resetBtn) {
        resetBtn.classList.toggle("is-active", !engaged);
        resetBtn.setAttribute("aria-pressed", String(!engaged));
      }
      // career-filter内のボタンだけでなく、「精通している業界・職種」チップも
      // 同じ data-axis/data-value を持つため、ページ全体を対象に同期する
      document.querySelectorAll("[data-axis][data-value]").forEach(function (b) {
        var axis = b.getAttribute("data-axis");
        var value = b.getAttribute("data-value");
        var isActive = !!(activeFilters[axis] && activeFilters[axis].indexOf(value) !== -1);
        b.classList.toggle("is-active", isActive);
        b.setAttribute("aria-pressed", String(isActive));
      });
    }

    function applyVisibility() {
      var cards = document.querySelectorAll(".career-card");
      if (!isEngaged()) {
        // 絞り込み解除時は、もっと見る／career-extraのCSSに表示制御を返す
        cards.forEach(function (card) { card.style.display = ""; });
        if (emptyMsg) emptyMsg.hidden = true;
        return;
      }
      if (!grid.classList.contains("is-expanded")) {
        grid.classList.add("is-expanded");
        if (moreBtn) moreBtn.classList.add("is-hidden");
      }
      var anyVisible = false;
      cards.forEach(function (card) {
        var match = cardMatchesFilters(card, activeFilters);
        card.style.display = match ? "" : "none";
        if (match) anyVisible = true;
      });
      if (emptyMsg) emptyMsg.hidden = anyVisible;
    }

    setCareerFilterAxis = function (axis, values) {
      activeFilters = axis === "all" ? {} : (function () {
        var o = {};
        o[axis] = values.slice();
        return o;
      })();
      updateButtonStates();
      applyVisibility();
      // ロゴ／経験バー／業界職種チップからの絞り込みジャンプで軸が確定した際は、
      // どの条件が選ばれているか見えるよう折りたたみを自動で開く
      if (axis !== "all") setGroupsCollapsed(false);
    };

    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        activeFilters = {};
        updateButtonStates();
        applyVisibility();
      });
    }

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var axis = btn.getAttribute("data-axis");
        var value = btn.getAttribute("data-value");
        if (!activeFilters[axis]) activeFilters[axis] = [];
        var idx = activeFilters[axis].indexOf(value);
        if (idx === -1) activeFilters[axis].push(value);
        else activeFilters[axis].splice(idx, 1);
        updateButtonStates();
        applyVisibility();
      });
    });

    updateButtonStates(); // 初期状態（すべて表示）でもaria-pressedを正しくセットしておく
  }

  /* ---------------- 周囲からの声の絞り込み ----------------
   * career-filterと見た目・操作感を揃えるが、testimonials.jsが生成する
   * .testimonial-card は関係性・良かった点ともに固定の語彙ではないため
   * （良かった点は自由記述タグ）、career-filterのようにボタンを index.html に
   * ハードコードせず、実際のカードの data-relation / data-goodpoints から
   * ボタン自体を動的に生成する。
   *
   * ボタンの属性名は data-axis/data-value ではなく data-t-axis/data-t-value を
   * 使う。career-filter側の updateButtonStates() が
   * document.querySelectorAll("[data-axis][data-value]") でページ全体を
   * 同期しているため、同じ属性名を使うとcareer-filter操作時にこちらの
   * ボタンの見た目まで（意図せず非アクティブへ）巻き込まれてしまうのを防ぐため。 */
  function initTestimonialFilter() {
    var list = document.getElementById("testimonial-list");
    var filterWrap = document.getElementById("testimonial-filter");
    var groupsWrap = document.getElementById("testimonial-filter-groups");
    var resetBtn = document.getElementById("testimonial-filter-reset");
    var toggleBtn = document.getElementById("testimonial-filter-toggle");
    var toggleLabel = toggleBtn && toggleBtn.querySelector(".testimonial-filter-toggle-label");
    var emptyMsg = document.getElementById("testimonial-filter-empty");
    var moreBtn = document.getElementById("testimonial-more-btn");
    if (!list || !filterWrap || !groupsWrap || !resetBtn) return;

    var cards = Array.prototype.slice.call(list.querySelectorAll(".testimonial-card"));
    if (cards.length < 2) return; // 声が少ないうちは絞り込み自体を出さない

    var RELATION_ORDER = ["同僚", "上司／先輩", "部下／後輩", "取引先"];

    // 軸ごとに、実際にカードに存在する値と出現回数を集計する（space区切りの複数値に対応）
    function collectAxisValues(axis) {
      var counts = {};
      var order = [];
      cards.forEach(function (card) {
        var raw = card.getAttribute("data-" + axis) || "";
        raw.split(" ").forEach(function (v) {
          if (!v) return;
          if (!(v in counts)) order.push(v);
          counts[v] = (counts[v] || 0) + 1;
        });
      });
      return { counts: counts, order: order };
    }

    function buildGroup(axis, label, values, ariaLabel) {
      if (values.length < 2) return null; // 選択肢が1つ以下なら絞り込む意味が無い
      var group = document.createElement("div");
      group.className = "testimonial-filter-group";
      group.setAttribute("role", "group");
      group.setAttribute("aria-label", ariaLabel);
      var labelEl = document.createElement("span");
      labelEl.className = "testimonial-filter-group-label";
      labelEl.textContent = label;
      group.appendChild(labelEl);
      values.forEach(function (v) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "testimonial-filter-btn";
        btn.setAttribute("data-t-axis", axis);
        btn.setAttribute("data-t-value", v);
        btn.setAttribute("aria-pressed", "false");
        btn.textContent = v;
        group.appendChild(btn);
      });
      return group;
    }

    var relationData = collectAxisValues("relation");
    var relationValues = RELATION_ORDER.filter(function (v) { return relationData.counts[v]; }).concat(
      relationData.order.filter(function (v) { return RELATION_ORDER.indexOf(v) === -1; })
    );

    var goodPointsData = collectAxisValues("goodpoints");
    var goodPointsValues = goodPointsData.order.slice().sort(function (a, b) {
      return goodPointsData.counts[b] - goodPointsData.counts[a];
    });

    var relationGroup = buildGroup("relation", "関係性", relationValues, "関係性で絞り込み");
    var goodPointsGroup = buildGroup("goodpoints", "良かった点", goodPointsValues, "良かった点で絞り込み");
    if (!relationGroup && !goodPointsGroup) return; // 絞り込める軸が無ければ表示しない

    if (relationGroup) groupsWrap.appendChild(relationGroup);
    if (goodPointsGroup) groupsWrap.appendChild(goodPointsGroup);
    filterWrap.hidden = false;

    // career-filterと同じく、既定は折りたたみ。JSが動かない環境ではそもそも
    // filterWrapがhiddenのままなので、この折りたたみ自体が影響しない。
    function setGroupsCollapsed(collapsed) {
      if (!toggleBtn) return;
      groupsWrap.classList.toggle("is-collapsed", collapsed);
      toggleBtn.setAttribute("aria-expanded", String(!collapsed));
      if (toggleLabel) toggleLabel.textContent = collapsed ? "絞り込む" : "閉じる";
    }
    if (toggleBtn) {
      setGroupsCollapsed(true);
      toggleBtn.addEventListener("click", function () {
        setGroupsCollapsed(!groupsWrap.classList.contains("is-collapsed"));
      });
    }

    var activeFilters = { relation: [], goodpoints: [] }; // 軸内OR・軸間AND（career-filterと同じ判定）

    function isEngaged() {
      return Object.keys(activeFilters).some(function (axis) { return activeFilters[axis].length > 0; });
    }

    function updateButtonStates() {
      resetBtn.classList.toggle("is-active", !isEngaged());
      resetBtn.setAttribute("aria-pressed", String(!isEngaged()));
      groupsWrap.querySelectorAll(".testimonial-filter-btn").forEach(function (btn) {
        var axis = btn.getAttribute("data-t-axis");
        var value = btn.getAttribute("data-t-value");
        var isActive = activeFilters[axis].indexOf(value) !== -1;
        btn.classList.toggle("is-active", isActive);
        btn.setAttribute("aria-pressed", String(isActive));
      });
    }

    function cardMatchesFilters(card) {
      return Object.keys(activeFilters).every(function (axis) {
        var selected = activeFilters[axis];
        if (!selected.length) return true;
        var cardValues = (card.getAttribute("data-" + axis) || "").split(" ");
        return selected.some(function (v) { return cardValues.indexOf(v) !== -1; });
      });
    }

    function applyVisibility() {
      if (!isEngaged()) {
        // 絞り込み解除時は、もっと見る／testimonial-extraのCSSに表示制御を返す
        // （career-filter側のapplyVisibility()と同じ考え方）
        cards.forEach(function (card) { card.style.display = ""; });
        if (emptyMsg) emptyMsg.hidden = true;
        return;
      }
      if (!list.classList.contains("is-expanded")) {
        list.classList.add("is-expanded");
        if (moreBtn) moreBtn.classList.add("is-hidden");
      }
      var anyVisible = false;
      cards.forEach(function (card) {
        var match = cardMatchesFilters(card);
        card.style.display = match ? "" : "none";
        if (match) anyVisible = true;
      });
      if (emptyMsg) emptyMsg.hidden = anyVisible;
    }

    resetBtn.addEventListener("click", function () {
      activeFilters = { relation: [], goodpoints: [] };
      updateButtonStates();
      applyVisibility();
    });

    groupsWrap.addEventListener("click", function (event) {
      var btn = event.target.closest(".testimonial-filter-btn");
      if (!btn) return;
      var axis = btn.getAttribute("data-t-axis");
      var value = btn.getAttribute("data-t-value");
      var idx = activeFilters[axis].indexOf(value);
      if (idx === -1) activeFilters[axis].push(value);
      else activeFilters[axis].splice(idx, 1);
      updateButtonStates();
      applyVisibility();
    });

    updateButtonStates();
  }

  /* ---------------- プロフィール写真の自動検出 ----------------
   * assets/img/ に profile.jpg という決まった名前でアップロードしなくても、
   * GitHubの公開API経由でフォルダの中身を確認し、写真らしきファイル
   * （jpg/jpeg/png/webp/gif、ただし ogp.png は除く）が見つかったら
   * ファイル名を問わず自動的にそれを表示する。
   * API呼び出しに失敗した場合（オフライン・レート制限など）は、
   * 何もせず既存の <img src="assets/img/profile.jpg" onerror="..."> の
   * 挙動（見つかればそのまま表示、無ければプレースホルダー）に任せる。
   */
  function initAutoProfilePhoto() {
    var photos = document.querySelectorAll(".js-profile-photo");
    if (!photos.length || !window.fetch) return;

    fetch("https://api.github.com/repos/yorisoi-yumeki/yorisoi-yumeki.github.io/contents/assets/img", {
      headers: { Accept: "application/vnd.github+json" }
    })
      .then(function (res) {
        if (!res.ok) throw new Error("GitHub API error: " + res.status);
        return res.json();
      })
      .then(function (files) {
        if (!Array.isArray(files)) return;
        var photo = files.find(function (f) {
          return f.type === "file" &&
            /\.(jpe?g|png|webp|gif)$/i.test(f.name) &&
            !/ogp/i.test(f.name);
        });
        if (!photo) return;

        var path = "assets/img/" + encodeURIComponent(photo.name);
        photos.forEach(function (img) {
          if (img.getAttribute("src") !== path) img.src = path;
        });
      })
      .catch(function () {
        // 何もしない。既存の src="assets/img/profile.jpg" + onerror フォールバックに任せる
      });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initFadeIn();
    initCareerExpander();
    initTestimonialExpander();
    initCareerFilter();
    initTestimonialFilter();
    initLogoJumpLinks();
    initExpBarJumpLinks();
    initDomainChipJumpLinks();
    initAutoProfilePhoto();
  });
})();
