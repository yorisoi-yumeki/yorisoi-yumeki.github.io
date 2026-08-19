/**
 * backoffice-survey-data.js
 *
 * freee「バックオフィス診断」参加者アンケート（2023年11月〜2024年6月ごろ実施）のうち、
 * 杉田本人が担当した292件から集計。
 *
 * BACKOFFICE_VOICE_THEMES の count は292件全体に対するマクロ集計（テーマキーワードに
 * 言及した件数）。BACKOFFICE_VOICES はそのうち実際に引用として掲載する声で、
 * ①別の設問（満足度の理由／印象に残ったこと）の回答が無関係に連結されて文脈が破綻して
 * いるもの、②担当者個人ではなく診断内容そのものについての言及、③「丁寧な対応」のような
 * 具体性の無い一言だけの回答、を除外している。そのため count（マクロ件数）と、実際に
 * クリックして表示される声の件数は一致しない場合がある（意図的な仕様。UIでは両者を
 * 明示的に分けて表示する）。
 *
 * 「安心感」はマクロ集計としては2件あるが、内容がいずれも診断内容（制度・規定の理解）
 * への安心であり対応者個人への言及ではないため、掲載する声は0件（excerptもnull）。
 *
 * 生成: 元データ（Googleフォーム回答）からPythonスクリプトで抽出・整形。
 * 掲載する声の並び順・highlightの選定は、scoreではなく「具体性スコア」
 * （quote文字数 + (該当テーマ数-1)×20）の降順。
 */

// 292件全体の定量サマリー（杉田が担当した診断のみ。メニュー問わず全件）
var BACKOFFICE_SURVEY_STATS = {
  responseCount: 292,
  avgScore: 7.56,
  pct8plus: 58.6,
  pct9to10: 30.5
};

// テーマ別マクロ集計（292件中、そのテーマに言及した件数）とグラフの代表一言。
// excerptがnullのテーマは、掲載できる具体的な声が無かったことを示す。
var BACKOFFICE_VOICE_THEMES = [
  { id: "polite", label: "丁寧な対応", count: 34, excerpt: "丁寧に説明してくれてありがとうございます" },
  { id: "listen", label: "ヒアリング力・傾聴", count: 7, excerpt: "こちらの課題に真摯に耳を傾けて下さったこと" },
  { id: "sharp", label: "的確なアドバイス", count: 5, excerpt: "弊社の状況に的確なアドバイスをいただけた" },
  { id: "sincere", label: "親身・誠実な姿勢", count: 5, excerpt: "担当者の方の誠実な対応がとてもよかった" },
  { id: "likable", label: "好印象・人柄", count: 2, excerpt: "ご担当者の自己紹介は好印象でした" },
  { id: "assure", label: "安心感", count: 2, excerpt: null },
];

// 実際に掲載する声（本文）。1件が複数テーマに該当することもある。
// 並び順・highlightは「具体性スコア」（文字数+テーマ数ボーナス）の降順。
// highlight: true の声は、グラフのどのバーもクリックしていない初期状態で表示する。
var BACKOFFICE_VOICES = [
  {
    score: 8,
    themes: ["listen", "sincere", "likable"],
    quote: "ヒアリング能力が高く、顧客に対して課題の意識づけがとても上手でした。 トーク内容、質問に対する対応、とても素晴らしかったです。 杉田さんは、お客様にとって非常に良いと思います。 商品を押し付けることもなく、さりげなく自社を褒める謙虚な姿勢も好印象でした。",
    highlight: true
  },
  {
    score: 7,
    themes: ["polite"],
    quote: "システム導入以前の問題が多い(社員のIT能力等)のですが、一つ一つ丁寧に解決策の例や他社様の事案等交えてご説明頂き、私が認識すらしていなかった課題が見え、大変有意義でした。",
    highlight: true
  },
  {
    score: 9,
    themes: ["sincere"],
    quote: "100名未満の多くの会社のご相談にのられているとお聞きしたので、弊社の相談事にも親身に、より詳しく答えていただけそうだと感じました。本当に的場さんに似ていらっしゃいますね。",
    highlight: true
  },
  {
    score: 10,
    themes: ["listen"],
    quote: "正直、全く期待していなかったのですが、業務整理をしていただけて本当に助かりました。ERP導入検討をした時でもヒアリングされながら業務整理いただけなかったので、感謝です。",
    highlight: true
  },
  {
    score: 8,
    themes: ["listen"],
    quote: "ヒアリングをしていただいて私自身の頭の整理ができました。あまり時間はありませんが、電帳法の対応について検討を進めていきます。ありがとうございました。",
    highlight: false
  },
  {
    score: 10,
    themes: ["polite", "sincere"],
    quote: "丁寧に分かり易く説明して頂いたので満足です。 押売りの様な印象を全く受けなかった事です。",
    highlight: true
  },
  {
    score: 10,
    themes: ["sharp"],
    quote: "対話全体の中で、システム連携の話をして、弊社の状況を的確に判断して全体的にお話いただけたので、信頼のできるお話ができました。",
    highlight: true
  },
  {
    score: 10,
    themes: ["polite", "sincere"],
    quote: "担当者の方の誠実な対応がとてもよかった。わからないことも丁寧に教えていただいた。",
    highlight: false
  },
  {
    score: 10,
    themes: ["polite"],
    quote: "私が勉強不足だったので分からないことをすぐに教えて頂きました。 丁寧に説明してくれてありがとうございます。",
    highlight: false
  },
  {
    score: 6,
    themes: ["polite", "listen"],
    quote: "ヒアリング内容を、図解し見える化して頂けた。 丁寧でした",
    highlight: false
  },
  {
    score: 10,
    themes: ["polite"],
    quote: "ご丁寧に状況を整理していただき、今後の課題をあらいだしていただきました。ありがとうございます。",
    highlight: false
  },
  {
    score: 10,
    themes: ["polite"],
    quote: "今回は、前回の時よりも とても親切にわかりやす教えて頂きました。 ありがとうございました。",
    highlight: false
  },
  {
    score: 10,
    themes: ["sharp"],
    quote: "現状を的確に把握して下さり、今後検討した方が良いことのアドバイスを頂き大変助かりました。",
    highlight: true
  },
  {
    score: 9,
    themes: ["polite"],
    quote: "当社の現状を把握していただいて、どうすべきかの説明がとても丁寧で分かりやすかったです。",
    highlight: false
  },
  {
    score: 8,
    themes: ["polite"],
    quote: "希望する内容がなかったのに丁寧に説明をしていただき、ありがとうございました。",
    highlight: false
  },
  {
    score: 6,
    themes: ["listen"],
    quote: "ヒアリング内容から、その場でいくつかソリューションを提示してくれたこと",
    highlight: false
  },
  {
    score: 9,
    themes: ["polite"],
    quote: "こちらのご質問にご丁寧に対応いただき、ありがとうございました。",
    highlight: false
  },
  {
    score: 10,
    themes: ["polite"],
    quote: "説明の間で都度質問をなげかけても丁寧な対応をしていただけました",
    highlight: false
  },
  {
    score: 10,
    themes: ["polite"],
    quote: "丁寧なご説明をして頂き、またお話をお伺いしたいと思いました。",
    highlight: false
  },
  {
    score: 8,
    themes: ["polite"],
    quote: "とても丁寧な会話で、わかりやすく回答を導いてくれました。",
    highlight: false
  },
  {
    score: 8,
    themes: ["polite"],
    quote: "請求書の取り扱いなどに対する説明が丁寧でわかりやすかった",
    highlight: false
  },
  {
    score: 8,
    themes: ["polite"],
    quote: "面倒な質問にも丁寧に答えて頂き、分かりやすかったです。",
    highlight: false
  },
  {
    score: 9,
    themes: ["listen"],
    quote: "冷静にヒアリング頂き、短時間で整理できたのはすばらしい",
    highlight: false
  },
  {
    score: 9,
    themes: ["polite"],
    quote: "現状での改善点について、丁寧にご指摘いただけました。",
    highlight: false
  },
  {
    score: 7,
    themes: ["polite"],
    quote: "こちらの電子保存の質問に丁寧に回答いただけたこと",
    highlight: false
  },
  {
    score: 8,
    themes: ["polite"],
    quote: "とても丁寧な対応でした。ありがとうございました。",
    highlight: false
  },
  {
    score: 10,
    themes: ["listen"],
    quote: "こちらの課題に真摯に耳を傾けて下さったこと。",
    highlight: false
  },
  {
    score: 8,
    themes: ["sharp"],
    quote: "弊社の状況に的確なアドバイスをいただけた。",
    highlight: false
  },
  {
    score: 8,
    themes: ["polite"],
    quote: "親切に説明くださり聞き取りやすかったです。",
    highlight: false
  },
  {
    score: 6,
    themes: ["sharp"],
    quote: "現状に対し的確なご意見を頂きましたので",
    highlight: false
  },
  {
    score: 10,
    themes: ["polite"],
    quote: "希望に従て丁寧に説明してくれました。",
    highlight: false
  },
  {
    score: 10,
    themes: ["polite"],
    quote: "親切丁寧な対応で有意義な時間でした。",
    highlight: false
  },
  {
    score: 8,
    themes: ["polite"],
    quote: "丁寧にお話をされていたと感じました。",
    highlight: false
  },
  {
    score: 5,
    themes: ["likable"],
    quote: "ご担当者の自己紹介は好印象でした。",
    highlight: true
  },
  {
    score: 6,
    themes: ["polite"],
    quote: "丁寧に教えて下さり有難うございます",
    highlight: false
  },
  {
    score: 8,
    themes: ["polite"],
    quote: "丁寧な対応で話しやすかったです。",
    highlight: false
  },
];
