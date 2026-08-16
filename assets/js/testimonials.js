/**
 * testimonials.js（admin.htmlで生成。運用方法はREADME.md「④」参照）
 */

// admin.htmlで生成（true=掲載中）
var SHOW_TESTIMONIALS = true;

var TESTIMONIALS = [
  {
    quote: "杉田さんからのトスで複数プロダクトのセット提案中です。与信を獲得していることもそうなのですが、ヒアリングの精度が高い（状況が分かりやすい）ので提案しやすいです。\n\n一番は、抽象的ですがマインドだと思ってます！\n資料などからお客様の課題を解決しようと取り組まれているマインドをものすごく感じます！！",
    name: "K",
    company: "",
    relation: "同僚",
    goodPoints: "潜在ニーズを引き出すヒアリング、 行き詰まっても別の切り口で提案し直す粘り強さ、 ナレッジの横展開、 丁寧なスライド資料作成"
  },
  {
    quote: "チームは違いましたがナレッジ共有の投稿をよく見かけて勉強させてもらいましたし、社内交流の場にもよくいてチームの役割を社内営業してたので、ずっと正社員だと思ってました",
    name: "I",
    company: "フリー株式会社",
    relation: "同僚",
    goodPoints: "相手の知識レベルに合わせた分かりやすい説明、 ナレッジの横展開、社内営業力"
  },
  {
    quote: "的場浩司似の自己紹介が40-50代の部長レイヤーにぶっ刺さって一気に打ち解けていたので、あの自己紹介は武器だなと思いました（笑）",
    name: "S.S",
    company: "",
    relation: "上司／先輩",
    goodPoints: "行き詰まっても別の切り口で提案し直す粘り強さ、 アイスブレイク"
  },
  {
    quote: "質の悪いアポでも引き受けて下さり、さらには商談化までして下さった時には痺れました",
    name: "インサイドセールス木村様",
    company: "",
    relation: "同僚",
    goodPoints: "潜在ニーズを引き出すヒアリング, 行き詰まっても別の切り口で提案し直す粘り強さ"
  },
  {
    quote: "同じチームでご一緒させていただきましたが、杉田さんの課題を特定するヒアリング力は本当に素晴らしく、いつも参考にさせていただいておりました！\nまた、部署の垣根を越えて社内に広いネットワークを築かれており、個人としての成果はもちろん、チーム全体の成果にも大きく貢献されていたと感じています。",
    name: "K様",
    company: "",
    relation: "同僚",
    goodPoints: "潜在ニーズを引き出すヒアリング, 社内営業力"
  },
  {
    quote: "入社したばかりで、右も左もわからなかった私にも分かる言語で、yumekiさんのナレッジをシェア下さったのが印象的でした。相手に合わせた言葉選び、相手が求める寄り添い方をお客様、そして社内のメンバーにも出来るところが、とっても素敵だと思います！！",
    name: "H.K様",
    company: "",
    relation: "部下／後輩",
    goodPoints: "潜在ニーズを引き出すヒアリング, 相手の知識レベルに合わせた分かりやすい説明"
  },
  {
    quote: "顧客の表情や温度感を確かめながら、相手が安心するような商談をされるのが印象的でした。",
    name: "N.S様",
    company: "",
    relation: "取引先",
    goodPoints: "潜在ニーズを引き出すヒアリング, 相手の知識レベルに合わせた分かりやすい説明, ナレッジの横展開"
  },
  {
    quote: "システムの仕組みをお客さんのリテラシーに合わせてお客さんの言葉で話されていたことがとても印象に残っています。それをスクリプト化し、録画を共有することでチーム全員が同じレベルまでできるようになったところも流石の功績だと思いました！",
    name: "M様",
    company: "",
    relation: "同僚",
    goodPoints: "潜在ニーズを引き出すヒアリング, 相手の知識レベルに合わせた分かりやすい説明, 社内営業力"
  },
  {
    quote: "プレイヤーとしての確かな営業力は勿論、同僚や後輩の育成にも非常に情熱的に取り組んでいただきました。営業で培った「相手の知識レベルに合わせた分かりやすい説明を行うスキル」により、杉田さんと関わったメンバーの営業力もみるみるUPしています。いつでも話しかけやすい、温かいお人柄も魅力の1つです。",
    name: "M様",
    company: "",
    relation: "同僚",
    goodPoints: "相手の知識レベルに合わせた分かりやすい説明, ナレッジの横展開, 社内営業力"
  },
  {
    quote: "顧客を主語にした丁寧なヒアリングがとても印象的。こちら課題を当てに行くと言うよりも、引き出すのが上手い。",
    name: "小池俊介",
    company: "",
    relation: "取引先",
    goodPoints: "潜在ニーズを引き出すヒアリング, 相手の知識レベルに合わせた分かりやすい説明, 1つのことを深く追求する職人気質"
  },
  {
    quote: "同じチームで一緒に仕事をしたことがありますが、最初は正社員と思うほど会社に馴染んでいました笑\nナレッジ共有も積極的に行っており、自身の成果だけでなくチームに再現性を持たせて成果を最大化するような姿勢が印象的でした！\n一緒に仕事をしてたら、また一緒に仕事したいと思うお人柄であることも魅力の1つです！",
    name: "S様",
    company: "",
    relation: "同僚",
    goodPoints: "潜在ニーズを引き出すヒアリング, 行き詰まっても別の切り口で提案し直す粘り強さ, ナレッジの横展開"
  },
  {
    quote: "業務委託の入れ替わりが激しい当社において数年間稼働し続けたことが全てを物語っています。",
    name: "A様",
    company: "",
    relation: "同僚",
    goodPoints: "GRIT"
  },
  {
    quote: "一緒に仕事をしていて特に印象的だったのが、薄いSALに対しても「とりあえず商談化・契約」という短期的なゴールだけで向き合わないところです。\n\nすぐに決まらない案件でも、お客様との信頼関係を丁寧に築いているからこそ、時間を置いてから先方から再商談の依頼をいただき、最終的に契約につながることもありました。\n\n「契約が決まるか」ではなく、「本当にお客様の課題を解決できるか」にフォーカスしている姿勢がすごく印象的です。その姿勢はお客様に対してだけでなく、社内のコミュニケーションにも表れていて、どの職種に対してもリスペクトを持って丁寧に関わってくれる方だと思っています。",
    name: "mattsu様",
    company: "",
    relation: "同僚",
    goodPoints: "潜在ニーズを引き出すヒアリング, 行き詰まっても別の切り口で提案し直す粘り強さ, 相手の知識レベルに合わせた分かりやすい説明"
  },
  {
    quote: "私がISとしてどんなに厳しい商談をあげても、丁寧なヒアリングで活路を見出し、案件化に繋げていただいたのが本当にありがたかったです！！\n顧客への傾聴力の高さ故に、業務理解の解像度がものすごく高く、かなり勉強させていただいてました！",
    name: "Y.K様",
    company: "",
    relation: "部下／後輩",
    goodPoints: "潜在ニーズを引き出すヒアリング, 行き詰まっても別の切り口で提案し直す粘り強さ, 相手の知識レベルに合わせた分かりやすい説明"
  },
  {
    quote: "私の方で直接のお仕事の関わりはございませんでしたが、そんな私でも社内で杉田さんのトスが商談しやすいとよくお話を伺っていました。潜在的な課題を引き出して提案につながるようにトスアップをしていただけてやりやすいと好評だったことが印象的です。",
    name: "S",
    company: "",
    relation: "同僚",
    goodPoints: "潜在ニーズを引き出すヒアリング"
  },
  {
    quote: "ISからCSまで幅広く商材のインプットや顧客に必要な情報の集約力が高かったです！！\nまたそこから後輩に当たる私や同僚への共有もシンプル且つ丁寧でした！",
    name: "GH",
    company: "",
    relation: "部下／後輩",
    goodPoints: "潜在ニーズを引き出すヒアリング, 相手の知識レベルに合わせた分かりやすい説明"
  },
  {
    quote: "いつも難しい商談を対応してくれてありがとうございました！\n難しい商談から案件化してくれた時は流石Sugiさん！と思ってます！",
    name: "R.Y",
    company: "",
    relation: "同僚",
    goodPoints: "潜在ニーズを引き出すヒアリング, 行き詰まっても別の切り口で提案し直す粘り強さ, 相手の知識レベルに合わせた分かりやすい説明, ナレッジの横展開"
  },
  {
    quote: "yumekiさんが営業、私がISという立場でしたが、ISメンバーにも丁寧でフラットに接してくださり、スムーズに仕事がしやすかったです！\nまた、どんなお客様に対しても丁寧なコミュニケーションをしていて、難しい商談も契約まで持っていってくださったことが印象的でした！",
    name: "K・S",
    company: "",
    relation: "部下／後輩",
    goodPoints: "相手の知識レベルに合わせた分かりやすい説明"
  },
  {
    quote: "誠実さが仕事ぶりからもバレーボールのプレーからも滲み出ています。本当に優秀な方だと思っています！",
    name: "M",
    company: "",
    relation: "同僚",
    goodPoints: "潜在ニーズを引き出すヒアリング, 行き詰まっても別の切り口で提案し直す粘り強さ, 相手の知識レベルに合わせた分かりやすい説明"
  },
  {
    quote: "杉田さんが営業として信頼獲得しており、顧客が率直にいろいろと話しやすいベースが作れていたところ。そのため具体的な課題や打ち手についても、対面の担当者だけでなく、組織としてのwillも含めて話が展開しやすかった",
    name: "freeeのAE",
    company: "",
    relation: "上司／先輩",
    goodPoints: "潜在ニーズを引き出すヒアリング, 顧客との関係構築"
  },
  {
    quote: "ISが強引なアポを取ったことに対するクレームを言っていた顧客が、最後は「もっと早く話を聞きたかった」と仰っていた商談録画が衝撃でした。",
    name: "しがないIS",
    company: "",
    relation: "同僚",
    goodPoints: "潜在ニーズを引き出すヒアリング, 行き詰まっても別の切り口で提案し直す粘り強さ"
  }
];

(function () {
  "use strict";

  // 名前の表示形を整える（末尾に「様」等が無ければ自動で付与）。
  function formatDisplayName(rawName) {
    var name = (rawName || "").trim();
    if (!name || name === "匿名") return name || "匿名";
    if (/(様|さん|さま|殿|氏)$/.test(name)) return name;
    return name + "様";
  }

  // "良かった点" の文字列（読点/カンマ区切り）をタグの配列に変換する。
  function parseGoodPoints(raw) {
    if (!raw) return [];
    return raw
      .split(/[、,，]/)
      .map(function (s) { return s.trim(); })
      .filter(function (s) { return s; });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var section = document.getElementById("testimonials");
    var list = document.getElementById("testimonial-list");
    var emptyMsg = document.getElementById("testimonial-empty");
    if (!section || !list) return;

    if (!SHOW_TESTIMONIALS || TESTIMONIALS.length === 0) {
      if (emptyMsg) emptyMsg.hidden = false;
      return;
    }

    TESTIMONIALS.forEach(function (item) {
      var card = document.createElement("div");
      card.className = "testimonial-card fade-target";

      var quote = document.createElement("p");
      quote.className = "testimonial-quote";
      quote.textContent = item.quote || "";
      card.appendChild(quote);

      var goodPoints = parseGoodPoints(item.goodPoints);
      card.setAttribute("data-relation", (item.relation || "").trim());
      card.setAttribute("data-goodpoints", goodPoints.join(" "));
      if (goodPoints.length) {
        var tagsLabel = document.createElement("p");
        tagsLabel.className = "testimonial-tags-label";
        tagsLabel.textContent = "良かった点";
        card.appendChild(tagsLabel);

        var tags = document.createElement("div");
        tags.className = "testimonial-tags";
        goodPoints.forEach(function (point) {
          var tag = document.createElement("span");
          tag.className = "testimonial-tag";
          tag.textContent = point;
          tags.appendChild(tag);
        });
        card.appendChild(tags);
      }

      var meta = document.createElement("p");
      meta.className = "testimonial-meta";
      var name = formatDisplayName(item.name);
      var relation = item.relation && item.relation.trim() ? "（" + item.relation.trim() + "）" : "";
      var company = item.company && item.company.trim() ? " / " + item.company.trim() : "";
      meta.textContent = name + relation + company;
      card.appendChild(meta);

      list.appendChild(card);
    });

    section.style.display = "";

    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      list.querySelectorAll(".fade-target").forEach(function (el) {
        el.classList.add("is-visible");
      });
    } else if ("IntersectionObserver" in window) {
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
      list.querySelectorAll(".fade-target").forEach(function (el) {
        observer.observe(el);
      });
    } else {
      list.querySelectorAll(".fade-target").forEach(function (el) {
        el.classList.add("is-visible");
      });
    }
  });
})();
